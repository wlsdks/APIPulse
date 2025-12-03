package com.apipulse.dto.mapper

import com.apipulse.dto.response.ProjectResponse
import com.apipulse.model.Project

fun Project.toResponse() = ProjectResponse(
    id = id!!,
    name = name,
    baseUrl = baseUrl,
    description = description,
    swaggerUrls = swaggerUrls.toList(),
    authType = authType,
    enabled = enabled,
    endpointCount = endpoints.size,
    createdAt = createdAt,
    updatedAt = updatedAt
)
