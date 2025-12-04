package com.apipulse.service.tester

import com.apipulse.dto.request.TestEndpointRequest
import com.apipulse.model.*
import com.apipulse.repository.ApiEndpointRepository
import com.apipulse.repository.ProjectRepository
import com.apipulse.repository.TestResultRepository
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import kotlinx.coroutines.*
import kotlinx.coroutines.reactor.awaitSingle
import org.slf4j.LoggerFactory
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.reactive.function.client.WebClientResponseException
import java.time.Instant

@Service
class ApiTesterService(
    private val projectRepository: ProjectRepository,
    private val apiEndpointRepository: ApiEndpointRepository,
    private val testResultRepository: TestResultRepository,
    private val webClient: WebClient,
    private val objectMapper: ObjectMapper
) {
    private val logger = LoggerFactory.getLogger(javaClass)

    companion object {
        private const val DEFAULT_TIMEOUT_SECONDS = 30L
        private const val MAX_RESPONSE_BODY_LENGTH = 10000
    }

    suspend fun testEndpoint(
        endpoint: ApiEndpoint,
        triggerType: TriggerType = TriggerType.MANUAL,
        scheduleId: String? = null,
        runtimeRequest: TestEndpointRequest? = null
    ): TestResult {
        val project = endpoint.project
        val fullUrl = buildUrl(
            project.baseUrl,
            endpoint.path,
            endpoint.pathParams,
            endpoint.queryParams,
            runtimeRequest?.pathParams,
            runtimeRequest?.queryParams
        )

        val startTime = System.currentTimeMillis()

        return try {
            val requestBuilder = webClient
                .method(org.springframework.http.HttpMethod.valueOf(endpoint.method.name))
                .uri(fullUrl)
                .contentType(MediaType.APPLICATION_JSON)

            applyAuthentication(requestBuilder, project)

            // Apply runtime headers first (if provided), then endpoint headers
            runtimeRequest?.headers?.forEach { (key, value) ->
                requestBuilder.header(key, value)
            }

            endpoint.headers?.let { headersJson ->
                val headers: Map<String, String> = objectMapper.readValue(headersJson)
                headers.forEach { (key, value) ->
                    // Only apply if not already set by runtime
                    if (runtimeRequest?.headers?.containsKey(key) != true) {
                        requestBuilder.header(key, value)
                    }
                }
            }

            // Use runtime body if provided, otherwise use endpoint's sample body
            val bodyToSend = runtimeRequest?.requestBody ?: endpoint.sampleRequestBody
            bodyToSend?.let { body ->
                requestBuilder.bodyValue(body)
            }

            val response = withTimeout(DEFAULT_TIMEOUT_SECONDS * 1000) {
                requestBuilder
                    .exchangeToMono { clientResponse ->
                        clientResponse.bodyToMono(String::class.java)
                            .defaultIfEmpty("")
                            .map { body ->
                                ResponseData(
                                    statusCode = clientResponse.statusCode().value(),
                                    body = body,
                                    headers = clientResponse.headers().asHttpHeaders()
                                )
                            }
                    }
                    .awaitSingle()
            }

            val responseTimeMs = System.currentTimeMillis() - startTime
            val status = determineStatus(response?.statusCode ?: 0, endpoint.expectedStatusCode, responseTimeMs)

            val result = TestResult(
                endpoint = endpoint,
                status = status,
                statusCode = response?.statusCode ?: 0,
                responseTimeMs = responseTimeMs,
                responseBody = response?.body?.take(MAX_RESPONSE_BODY_LENGTH),
                responseHeaders = response?.headers?.let { objectMapper.writeValueAsString(it.toSingleValueMap()) },
                triggerType = triggerType,
                scheduleId = scheduleId,
                executedAt = Instant.now()
            )

            testResultRepository.save(result)

        } catch (e: WebClientResponseException) {
            val responseTimeMs = System.currentTimeMillis() - startTime
            createErrorResult(endpoint, e.statusCode.value(), responseTimeMs, e.message, triggerType, scheduleId)

        } catch (e: TimeoutCancellationException) {
            val responseTimeMs = System.currentTimeMillis() - startTime
            createTimeoutResult(endpoint, responseTimeMs, triggerType, scheduleId)

        } catch (e: Exception) {
            val responseTimeMs = System.currentTimeMillis() - startTime
            createErrorResult(endpoint, 0, responseTimeMs, e.message, triggerType, scheduleId)
        }
    }

    suspend fun testProject(
        projectId: String,
        triggerType: TriggerType = TriggerType.MANUAL,
        scheduleId: String? = null
    ): ProjectTestResult {
        val endpoints = apiEndpointRepository.findByProjectIdAndEnabledTrue(projectId)

        if (endpoints.isEmpty()) {
            return ProjectTestResult(projectId, emptyList(), 0, 0, 0)
        }

        val results = coroutineScope {
            endpoints.map { endpoint ->
                async(Dispatchers.IO) {
                    testEndpoint(endpoint, triggerType, scheduleId)
                }
            }.awaitAll()
        }

        val successCount = results.count { it.status == TestStatus.SUCCESS }
        val failedCount = results.count { it.status == TestStatus.FAILED || it.status == TestStatus.ERROR }
        val avgResponseTime = results.map { it.responseTimeMs }.average().toLong()

        return ProjectTestResult(
            projectId = projectId,
            results = results,
            successCount = successCount,
            failedCount = failedCount,
            averageResponseTimeMs = avgResponseTime
        )
    }

    private fun applyAuthentication(
        requestBuilder: WebClient.RequestBodySpec,
        project: Project
    ) {
        when (project.authType) {
            AuthType.BEARER_TOKEN -> {
                project.authValue?.let {
                    requestBuilder.header(HttpHeaders.AUTHORIZATION, "Bearer $it")
                }
            }
            AuthType.API_KEY -> {
                val headerName = project.headerName ?: "X-API-Key"
                project.authValue?.let {
                    requestBuilder.header(headerName, it)
                }
            }
            AuthType.BASIC_AUTH -> {
                project.authValue?.let {
                    requestBuilder.header(HttpHeaders.AUTHORIZATION, "Basic $it")
                }
            }
            AuthType.NONE -> { }
        }
    }

    private fun buildUrl(
        baseUrl: String,
        path: String,
        pathParams: String?,
        queryParams: String?,
        runtimePathParams: Map<String, String>? = null,
        runtimeQueryParams: Map<String, String>? = null
    ): String {
        var url = "${baseUrl.trimEnd('/')}/${path.trimStart('/')}"

        // Apply path params - use runtime values if provided, otherwise use defaults
        pathParams?.let { paramsJson ->
            val params: List<Map<String, Any>> = objectMapper.readValue(paramsJson)
            params.forEach { param ->
                val name = param["name"] as String
                val value = runtimePathParams?.get(name) ?: "1"
                url = url.replace("{$name}", value)
            }
        }

        // Also replace any path params that might be in runtime but not in schema
        runtimePathParams?.forEach { (name, value) ->
            url = url.replace("{$name}", value)
        }

        // Build query string from runtime params or schema defaults
        val queryParts = mutableListOf<String>()

        // Add runtime query params first (they take priority)
        runtimeQueryParams?.forEach { (name, value) ->
            queryParts.add("$name=${java.net.URLEncoder.encode(value, "UTF-8")}")
        }

        // If no runtime query params, fall back to schema defaults
        if (runtimeQueryParams.isNullOrEmpty()) {
            queryParams?.let { paramsJson ->
                val params: List<Map<String, Any>> = objectMapper.readValue(paramsJson)
                params.forEach { param ->
                    val name = param["name"] as String
                    val required = param["required"] as? Boolean ?: false
                    if (required) {
                        queryParts.add("$name=test")
                    }
                }
            }
        }

        if (queryParts.isNotEmpty()) {
            url = "$url?${queryParts.joinToString("&")}"
        }

        return url
    }

    private fun determineStatus(
        actualStatusCode: Int,
        expectedStatusCode: Int,
        responseTimeMs: Long
    ): TestStatus {
        return when {
            actualStatusCode == 0 -> TestStatus.ERROR
            actualStatusCode == expectedStatusCode -> TestStatus.SUCCESS
            actualStatusCode in 200..299 && expectedStatusCode in 200..299 -> TestStatus.SUCCESS
            else -> TestStatus.FAILED
        }
    }

    private fun createErrorResult(
        endpoint: ApiEndpoint,
        statusCode: Int,
        responseTimeMs: Long,
        errorMessage: String?,
        triggerType: TriggerType,
        scheduleId: String?
    ): TestResult {
        return testResultRepository.save(
            TestResult(
                endpoint = endpoint,
                status = TestStatus.ERROR,
                statusCode = statusCode,
                responseTimeMs = responseTimeMs,
                errorMessage = errorMessage,
                triggerType = triggerType,
                scheduleId = scheduleId,
                executedAt = Instant.now()
            )
        )
    }

    private fun createTimeoutResult(
        endpoint: ApiEndpoint,
        responseTimeMs: Long,
        triggerType: TriggerType,
        scheduleId: String?
    ): TestResult {
        return testResultRepository.save(
            TestResult(
                endpoint = endpoint,
                status = TestStatus.TIMEOUT,
                statusCode = 0,
                responseTimeMs = responseTimeMs,
                errorMessage = "Request timed out after ${DEFAULT_TIMEOUT_SECONDS} seconds",
                triggerType = triggerType,
                scheduleId = scheduleId,
                executedAt = Instant.now()
            )
        )
    }
}
