package com.apipulse.dto.mapper

import com.apipulse.dto.response.ProjectTestResultResponse
import com.apipulse.dto.response.TestResultResponse
import com.apipulse.model.TestResult
import com.apipulse.service.tester.ProjectTestResult

fun TestResult.toResponse() = TestResultResponse(
    id = id!!,
    endpointId = endpoint.id!!,
    endpointPath = endpoint.path,
    endpointMethod = endpoint.method.name,
    status = status,
    statusCode = statusCode,
    responseTimeMs = responseTimeMs,
    errorMessage = errorMessage,
    triggerType = triggerType,
    executedAt = executedAt
)

fun ProjectTestResult.toResponse() = ProjectTestResultResponse(
    projectId = projectId,
    results = results.map { it.toResponse() },
    successCount = successCount,
    failedCount = failedCount,
    averageResponseTimeMs = averageResponseTimeMs,
    successRate = successRate
)
