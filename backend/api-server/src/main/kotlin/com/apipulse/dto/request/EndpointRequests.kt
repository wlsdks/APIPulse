package com.apipulse.dto.request

import com.apipulse.model.HttpMethod
import jakarta.validation.constraints.NotBlank

data class CreateEndpointRequest(
    @field:NotBlank(message = "Path is required")
    val path: String,

    val method: HttpMethod = HttpMethod.GET,
    val summary: String? = null,
    val description: String? = null,
    val sampleRequestBody: String? = null,
    val queryParams: String? = null,
    val pathParams: String? = null,
    val headers: String? = null,
    val expectedStatusCode: Int? = null
)

data class UpdateEndpointRequest(
    val path: String? = null,
    val method: HttpMethod? = null,
    val summary: String? = null,
    val description: String? = null,
    val sampleRequestBody: String? = null,
    val queryParams: String? = null,
    val pathParams: String? = null,
    val headers: String? = null,
    val expectedStatusCode: Int? = null,
    val enabled: Boolean? = null
)
