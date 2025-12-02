package com.apipulse.controller

import com.apipulse.dto.mapper.toResponse
import com.apipulse.dto.request.CreateEndpointRequest
import com.apipulse.dto.request.UpdateEndpointRequest
import com.apipulse.dto.response.EndpointResponse
import com.apipulse.dto.response.TestResultResponse
import com.apipulse.model.ApiEndpoint
import com.apipulse.model.TriggerType
import com.apipulse.repository.ApiEndpointRepository
import com.apipulse.repository.ProjectRepository
import com.apipulse.service.tester.ApiTesterService
import jakarta.validation.Valid
import kotlinx.coroutines.runBlocking
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.Instant

@RestController
@RequestMapping("/api/projects/{projectId}/endpoints")
@CrossOrigin(origins = ["*"])
class ApiEndpointController(
    private val projectRepository: ProjectRepository,
    private val apiEndpointRepository: ApiEndpointRepository,
    private val apiTesterService: ApiTesterService
) {

    @GetMapping
    fun getEndpoints(@PathVariable projectId: String): ResponseEntity<List<EndpointResponse>> {
        if (!projectRepository.existsById(projectId)) {
            return ResponseEntity.notFound().build()
        }

        val endpoints = apiEndpointRepository.findByProjectId(projectId)
        return ResponseEntity.ok(endpoints.map { it.toResponse() })
    }

    @GetMapping("/{id}")
    fun getEndpoint(
        @PathVariable projectId: String,
        @PathVariable id: String
    ): ResponseEntity<EndpointResponse> {
        return apiEndpointRepository.findById(id)
            .filter { it.project.id == projectId }
            .map { ResponseEntity.ok(it.toResponse()) }
            .orElse(ResponseEntity.notFound().build())
    }

    @PostMapping
    fun createEndpoint(
        @PathVariable projectId: String,
        @Valid @RequestBody request: CreateEndpointRequest
    ): ResponseEntity<EndpointResponse> {
        val project = projectRepository.findById(projectId).orElse(null)
            ?: return ResponseEntity.notFound().build()

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

        val saved = apiEndpointRepository.save(endpoint)
        return ResponseEntity.status(HttpStatus.CREATED).body(saved.toResponse())
    }

    @PutMapping("/{id}")
    fun updateEndpoint(
        @PathVariable projectId: String,
        @PathVariable id: String,
        @Valid @RequestBody request: UpdateEndpointRequest
    ): ResponseEntity<EndpointResponse> {
        return apiEndpointRepository.findById(id)
            .filter { it.project.id == projectId }
            .map { endpoint ->
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

                ResponseEntity.ok(apiEndpointRepository.save(endpoint).toResponse())
            }
            .orElse(ResponseEntity.notFound().build())
    }

    @DeleteMapping("/{id}")
    fun deleteEndpoint(
        @PathVariable projectId: String,
        @PathVariable id: String
    ): ResponseEntity<Void> {
        return apiEndpointRepository.findById(id)
            .filter { it.project.id == projectId }
            .map {
                apiEndpointRepository.deleteById(id)
                ResponseEntity.noContent().build<Void>()
            }
            .orElse(ResponseEntity.notFound().build())
    }

    @PostMapping("/{id}/test")
    fun testEndpoint(
        @PathVariable projectId: String,
        @PathVariable id: String
    ): ResponseEntity<TestResultResponse> {
        val endpoint = apiEndpointRepository.findById(id)
            .filter { it.project.id == projectId }
            .orElse(null) ?: return ResponseEntity.notFound().build()

        val result = runBlocking {
            apiTesterService.testEndpoint(endpoint, TriggerType.MANUAL)
        }

        return ResponseEntity.ok(result.toResponse())
    }
}
