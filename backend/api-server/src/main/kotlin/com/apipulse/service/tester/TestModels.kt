package com.apipulse.service.tester

import com.apipulse.model.TestResult
import org.springframework.http.HttpHeaders

data class ResponseData(
    val statusCode: Int,
    val body: String,
    val headers: HttpHeaders
)

data class ProjectTestResult(
    val projectId: String,
    val results: List<TestResult>,
    val successCount: Int,
    val failedCount: Int,
    val averageResponseTimeMs: Long
) {
    val totalCount: Int get() = results.size
    val successRate: Double get() = if (totalCount > 0) successCount.toDouble() / totalCount * 100 else 0.0
}
