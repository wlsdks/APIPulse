package com.apipulse.dto.request

data class TestEndpointRequest(
    val pathParams: Map<String, String>? = null,
    val queryParams: Map<String, String>? = null,
    val headers: Map<String, String>? = null,
    val requestBody: String? = null
)
