package com.apipulse.service.endpoint

import com.apipulse.dto.mapper.toResponse
import com.apipulse.dto.request.CreateEndpointRequest
import com.apipulse.dto.request.UpdateEndpointRequest
import com.apipulse.dto.response.EndpointResponse
import com.apipulse.dto.response.TestResultResponse
import com.apipulse.exception.EndpointNotFoundException
import com.apipulse.exception.ProjectNotFoundException
import com.apipulse.model.ApiEndpoint
import com.apipulse.model.TriggerType
import com.apipulse.repository.ApiEndpointRepository
import com.apipulse.repository.ProjectRepository
import com.apipulse.service.tester.ApiTesterService
import kotlinx.coroutines.runBlocking
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant

@Service
@Transactional(readOnly = true)
class EndpointServiceImpl(
    private val projectRepository: ProjectRepository,
    private val apiEndpointRepository: ApiEndpointRepository,
    private val apiTesterService: ApiTesterService
) : EndpointService {

    override fun getEndpoints(projectId: String): List<EndpointResponse> {
        if (!projectRepository.existsById(projectId)) {
            throw ProjectNotFoundException(projectId)
        }
        return apiEndpointRepository.findByProjectId(projectId).map { it.toResponse() }
    }

    override fun getEndpoint(projectId: String, endpointId: String): EndpointResponse {
        if (!projectRepository.existsById(projectId)) {
            throw ProjectNotFoundException(projectId)
        }
        return apiEndpointRepository.findById(endpointId)
            .filter { it.project.id == projectId }
            .map { it.toResponse() }
            .orElseThrow { EndpointNotFoundException(endpointId) }
    }

    @Transactional
    override fun createEndpoint(projectId: String, request: CreateEndpointRequest): EndpointResponse {
        val project = projectRepository.findById(projectId)
            .orElseThrow { ProjectNotFoundException(projectId) }

        val endpoint = ApiEndpoint(
            project = project,
            path = request.path,
            method = request.method,
            summary = request.summary,
            description = request.description,
            sampleRequestBody = request.sampleRequestBody,
            queryParams = request.queryParams,
            pathParams = request.pathParams,
            headers = request.headers,
            expectedStatusCode = request.expectedStatusCode ?: 200
        )

        return apiEndpointRepository.save(endpoint).toResponse()
    }

    @Transactional
    override fun updateEndpoint(projectId: String, endpointId: String, request: UpdateEndpointRequest): EndpointResponse {
        if (!projectRepository.existsById(projectId)) {
            throw ProjectNotFoundException(projectId)
        }

        val endpoint = apiEndpointRepository.findById(endpointId)
            .filter { it.project.id == projectId }
            .orElseThrow { EndpointNotFoundException(endpointId) }

        request.path?.let { endpoint.path = it }
        request.method?.let { endpoint.method = it }
        request.summary?.let { endpoint.summary = it }
        request.description?.let { endpoint.description = it }
        request.sampleRequestBody?.let { endpoint.sampleRequestBody = it }
        request.queryParams?.let { endpoint.queryParams = it }
        request.pathParams?.let { endpoint.pathParams = it }
        request.headers?.let { endpoint.headers = it }
        request.expectedStatusCode?.let { endpoint.expectedStatusCode = it }
        request.enabled?.let { endpoint.enabled = it }
        endpoint.updatedAt = Instant.now()

        return apiEndpointRepository.save(endpoint).toResponse()
    }

    @Transactional
    override fun deleteEndpoint(projectId: String, endpointId: String) {
        if (!projectRepository.existsById(projectId)) {
            throw ProjectNotFoundException(projectId)
        }

        val endpoint = apiEndpointRepository.findById(endpointId)
            .filter { it.project.id == projectId }
            .orElseThrow { EndpointNotFoundException(endpointId) }

        apiEndpointRepository.delete(endpoint)
    }

    override fun testEndpoint(projectId: String, endpointId: String): TestResultResponse {
        if (!projectRepository.existsById(projectId)) {
            throw ProjectNotFoundException(projectId)
        }

        val endpoint = apiEndpointRepository.findById(endpointId)
            .filter { it.project.id == projectId }
            .orElseThrow { EndpointNotFoundException(endpointId) }

        val result = runBlocking {
            apiTesterService.testEndpoint(endpoint, TriggerType.MANUAL)
        }

        return result.toResponse()
    }
}
