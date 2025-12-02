package com.apipulse.service.endpoint

import com.apipulse.dto.request.CreateEndpointRequest
import com.apipulse.dto.request.UpdateEndpointRequest
import com.apipulse.dto.response.EndpointResponse
import com.apipulse.dto.response.TestResultResponse

interface EndpointService {
    fun getEndpoints(projectId: String): List<EndpointResponse>
    fun getEndpoint(projectId: String, endpointId: String): EndpointResponse
    fun createEndpoint(projectId: String, request: CreateEndpointRequest): EndpointResponse
    fun updateEndpoint(projectId: String, endpointId: String, request: UpdateEndpointRequest): EndpointResponse
    fun deleteEndpoint(projectId: String, endpointId: String)
    fun testEndpoint(projectId: String, endpointId: String): TestResultResponse
}
