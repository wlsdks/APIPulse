package com.apipulse.dto.response

import com.apipulse.model.HttpMethod
import java.time.Instant

data class EndpointResponse(
    val id: String,
    val path: String,
    val method: HttpMethod,
    val summary: String?,
    val description: String?,
    val sampleRequestBody: String?,
    val requestBodySchema: String?,
    val queryParams: String?,
    val pathParams: String?,
    val headers: String?,
    val expectedStatusCode: Int,
    val enabled: Boolean,
    val createdAt: Instant,
    val updatedAt: Instant
)
