package com.apipulse.dto.response

import com.apipulse.model.AuthType
import java.time.Instant

data class ProjectResponse(
    val id: String,
    val name: String,
    val baseUrl: String,
    val description: String?,
    val swaggerUrls: List<String>,
    val authType: AuthType,
    val enabled: Boolean,
    val endpointCount: Int,
    val createdAt: Instant,
    val updatedAt: Instant
)
