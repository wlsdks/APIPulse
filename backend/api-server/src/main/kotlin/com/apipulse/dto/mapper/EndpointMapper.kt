package com.apipulse.dto.mapper

import com.apipulse.dto.response.EndpointResponse
import com.apipulse.model.ApiEndpoint

fun ApiEndpoint.toResponse() = EndpointResponse(
    id = id!!,
    path = path,
    method = method,
    summary = summary,
    description = description,
    sampleRequestBody = sampleRequestBody,
    requestBodySchema = requestBodySchema,
    requestContentType = requestContentType,
    queryParams = queryParams,
    pathParams = pathParams,
    headers = headers,
    expectedStatusCode = expectedStatusCode,
    enabled = enabled,
    createdAt = createdAt,
    updatedAt = updatedAt
)
