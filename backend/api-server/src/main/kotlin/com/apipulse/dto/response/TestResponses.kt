package com.apipulse.dto.response

import com.apipulse.model.TestStatus
import com.apipulse.model.TriggerType
import java.time.Instant

data class TestResultResponse(
    val id: String,
    val endpointId: String,
    val endpointPath: String,
    val endpointMethod: String,
    val status: TestStatus,
    val statusCode: Int,
    val responseTimeMs: Long,
    val errorMessage: String?,
    val triggerType: TriggerType,
    val executedAt: Instant
)

data class ProjectTestResultResponse(
    val projectId: String,
    val results: List<TestResultResponse>,
    val successCount: Int,
    val failedCount: Int,
    val averageResponseTimeMs: Long,
    val successRate: Double
)

data class TestResultPageResponse(
    val results: List<TestResultResponse>,
    val totalElements: Long,
    val totalPages: Int,
    val currentPage: Int
)

data class TestStatsResponse(
    val totalTests: Long,
    val successCount: Long,
    val failedCount: Long,
    val errorCount: Long,
    val timeoutCount: Long,
    val successRate: Double,
    val averageResponseTimeMs: Long
)
