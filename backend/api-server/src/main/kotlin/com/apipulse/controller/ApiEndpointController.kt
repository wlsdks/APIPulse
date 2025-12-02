package com.apipulse.controller

import com.apipulse.dto.request.CreateEndpointRequest
import com.apipulse.dto.request.UpdateEndpointRequest
import com.apipulse.dto.response.EndpointResponse
import com.apipulse.dto.response.TestResultResponse
import com.apipulse.service.endpoint.EndpointService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/projects/{projectId}/endpoints")
@CrossOrigin(origins = ["*"])
class ApiEndpointController(
    private val endpointService: EndpointService
) {

    @GetMapping
    fun getEndpoints(@PathVariable projectId: String): ResponseEntity<List<EndpointResponse>> {
        return endpointService.getEndpoints(projectId)
            ?.let { ResponseEntity.ok(it) }
            ?: ResponseEntity.notFound().build()
    }

    @GetMapping("/{id}")
    fun getEndpoint(
        @PathVariable projectId: String,
        @PathVariable id: String
    ): ResponseEntity<EndpointResponse> {
        return endpointService.getEndpoint(projectId, id)
            ?.let { ResponseEntity.ok(it) }
            ?: ResponseEntity.notFound().build()
    }

    @PostMapping
    fun createEndpoint(
        @PathVariable projectId: String,
        @Valid @RequestBody request: CreateEndpointRequest
    ): ResponseEntity<EndpointResponse> {
        return endpointService.createEndpoint(projectId, request)
            ?.let { ResponseEntity.status(HttpStatus.CREATED).body(it) }
            ?: ResponseEntity.notFound().build()
    }

    @PutMapping("/{id}")
    fun updateEndpoint(
        @PathVariable projectId: String,
        @PathVariable id: String,
        @Valid @RequestBody request: UpdateEndpointRequest
    ): ResponseEntity<EndpointResponse> {
        return endpointService.updateEndpoint(projectId, id, request)
            ?.let { ResponseEntity.ok(it) }
            ?: ResponseEntity.notFound().build()
    }

    @DeleteMapping("/{id}")
    fun deleteEndpoint(
        @PathVariable projectId: String,
        @PathVariable id: String
    ): ResponseEntity<Void> {
        return if (endpointService.deleteEndpoint(projectId, id)) {
            ResponseEntity.noContent().build()
        } else {
            ResponseEntity.notFound().build()
        }
    }

    @PostMapping("/{id}/test")
    fun testEndpoint(
        @PathVariable projectId: String,
        @PathVariable id: String
    ): ResponseEntity<TestResultResponse> {
        return endpointService.testEndpoint(projectId, id)
            ?.let { ResponseEntity.ok(it) }
            ?: ResponseEntity.notFound().build()
    }
}
