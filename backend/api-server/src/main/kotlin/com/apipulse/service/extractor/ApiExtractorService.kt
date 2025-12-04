package com.apipulse.service.extractor

import com.apipulse.model.ApiEndpoint
import com.apipulse.model.HttpMethod
import com.apipulse.model.Project
import com.apipulse.repository.ApiEndpointRepository
import com.fasterxml.jackson.databind.ObjectMapper
import io.swagger.v3.parser.OpenAPIV3Parser
import io.swagger.v3.parser.core.models.ParseOptions
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.reactive.function.client.WebClient
import java.time.Instant

@Service
class ApiExtractorService(
    private val apiEndpointRepository: ApiEndpointRepository,
    private val webClient: WebClient,
    private val objectMapper: ObjectMapper
) {
    private val logger = LoggerFactory.getLogger(javaClass)

    @Transactional
    fun extractFromSwagger(project: Project): ExtractResult {
        if (project.swaggerUrls.isEmpty()) {
            return ExtractResult(0, 0, listOf("Swagger URLs are not configured"))
        }

        var totalNew = 0
        var totalUpdated = 0
        val allErrors = mutableListOf<String>()

        for (swaggerUrl in project.swaggerUrls) {
            val result = extractFromSingleUrl(project, swaggerUrl)
            totalNew += result.newEndpoints
            totalUpdated += result.updatedEndpoints
            allErrors.addAll(result.errors)
        }

        logger.info("Extracted endpoints from ${project.name}: total new=$totalNew, updated=$totalUpdated from ${project.swaggerUrls.size} URLs")
        return ExtractResult(totalNew, totalUpdated, allErrors)
    }

    private fun extractFromSingleUrl(project: Project, swaggerUrl: String): ExtractResult {
        return try {
            val parseOptions = ParseOptions().apply {
                isResolve = true
                isResolveFully = true
            }

            val result = OpenAPIV3Parser().readLocation(swaggerUrl, null, parseOptions)

            if (result.openAPI == null) {
                val errors = result.messages ?: listOf("Failed to parse OpenAPI specification from $swaggerUrl")
                return ExtractResult(0, 0, errors)
            }

            val openApi = result.openAPI
            val endpoints = mutableListOf<ApiEndpoint>()

            openApi.paths?.forEach { (path, pathItem) ->
                pathItem.readOperationsMap().forEach { (method, operation) ->
                    val httpMethod = try {
                        HttpMethod.valueOf(method.name.uppercase())
                    } catch (e: Exception) {
                        logger.warn("Unsupported HTTP method: ${method.name}")
                        return@forEach
                    }

                    val existingEndpoint = apiEndpointRepository.findByProjectIdAndPathAndMethod(
                        project.id!!, path, httpMethod
                    )

                    val endpoint = existingEndpoint?.apply {
                        summary = operation.summary
                        description = operation.description
                        updatedAt = Instant.now()

                        // Extract request body content type
                        operation.requestBody?.content?.let { content ->
                            val contentType = content.keys.firstOrNull()
                            requestContentType = contentType

                            // Only extract schema for JSON content types
                            content["application/json"]?.schema?.let { schema ->
                                requestBodySchema = objectMapper.writeValueAsString(schema)
                            }
                        }

                        operation.parameters?.filter { it.`in` == "query" }?.let { params ->
                            if (params.isNotEmpty()) {
                                queryParams = objectMapper.writeValueAsString(params.map {
                                    mapOf("name" to it.name, "required" to it.required, "schema" to it.schema)
                                })
                            }
                        }

                        operation.parameters?.filter { it.`in` == "path" }?.let { params ->
                            if (params.isNotEmpty()) {
                                pathParams = objectMapper.writeValueAsString(params.map {
                                    mapOf("name" to it.name, "required" to it.required, "schema" to it.schema)
                                })
                            }
                        }
                    } ?: ApiEndpoint(
                        project = project,
                        path = path,
                        method = httpMethod,
                        summary = operation.summary,
                        description = operation.description,
                        requestContentType = operation.requestBody?.content?.keys?.firstOrNull(),
                        requestBodySchema = operation.requestBody?.content?.get("application/json")?.schema?.let {
                            objectMapper.writeValueAsString(it)
                        },
                        queryParams = operation.parameters?.filter { it.`in` == "query" }?.let { params ->
                            if (params.isNotEmpty()) {
                                objectMapper.writeValueAsString(params.map {
                                    mapOf("name" to it.name, "required" to it.required, "schema" to it.schema)
                                })
                            } else null
                        },
                        pathParams = operation.parameters?.filter { it.`in` == "path" }?.let { params ->
                            if (params.isNotEmpty()) {
                                objectMapper.writeValueAsString(params.map {
                                    mapOf("name" to it.name, "required" to it.required, "schema" to it.schema)
                                })
                            } else null
                        }
                    )

                    endpoints.add(endpoint)
                }
            }

            val savedEndpoints = apiEndpointRepository.saveAll(endpoints)
            val newCount = savedEndpoints.count { it.createdAt == it.updatedAt }
            val updatedCount = savedEndpoints.size - newCount

            logger.info("Extracted ${savedEndpoints.size} endpoints from $swaggerUrl (new: $newCount, updated: $updatedCount)")
            ExtractResult(newCount, updatedCount, emptyList())

        } catch (e: Exception) {
            logger.error("Failed to extract APIs from $swaggerUrl", e)
            ExtractResult(0, 0, listOf("$swaggerUrl: ${e.message ?: "Unknown error"}"))
        }
    }

    fun fetchSwaggerSpec(swaggerUrl: String): String? {
        return try {
            webClient.get()
                .uri(swaggerUrl)
                .retrieve()
                .bodyToMono(String::class.java)
                .block()
        } catch (e: Exception) {
            logger.error("Failed to fetch Swagger spec from $swaggerUrl", e)
            null
        }
    }
}
