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
class ApiEndpointController(
    private val endpointService: EndpointService
) {

    @GetMapping
    fun getEndpoints(@PathVariable projectId: String): ResponseEntity<List<EndpointResponse>> {
        return ResponseEntity.ok(endpointService.getEndpoints(projectId))
    }

    @GetMapping("/{id}")
    fun getEndpoint(
        @PathVariable projectId: String,
        @PathVariable id: String
    ): ResponseEntity<EndpointResponse> {
        return ResponseEntity.ok(endpointService.getEndpoint(projectId, id))
    }

    @PostMapping
    fun createEndpoint(
        @PathVariable projectId: String,
        @Valid @RequestBody request: CreateEndpointRequest
    ): ResponseEntity<EndpointResponse> {
        return ResponseEntity.status(HttpStatus.CREATED).body(endpointService.createEndpoint(projectId, request))
    }

    @PutMapping("/{id}")
    fun updateEndpoint(
        @PathVariable projectId: String,
        @PathVariable id: String,
        @Valid @RequestBody request: UpdateEndpointRequest
    ): ResponseEntity<EndpointResponse> {
        return ResponseEntity.ok(endpointService.updateEndpoint(projectId, id, request))
    }

    @DeleteMapping("/{id}")
    fun deleteEndpoint(
        @PathVariable projectId: String,
        @PathVariable id: String
    ): ResponseEntity<Void> {
        endpointService.deleteEndpoint(projectId, id)
        return ResponseEntity.noContent().build()
    }

    @PostMapping("/{id}/test")
    fun testEndpoint(
        @PathVariable projectId: String,
        @PathVariable id: String
    ): ResponseEntity<TestResultResponse> {
        return ResponseEntity.ok(endpointService.testEndpoint(projectId, id))
    }
}
