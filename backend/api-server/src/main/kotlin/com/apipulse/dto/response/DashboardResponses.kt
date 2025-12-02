package com.apipulse.dto.response

import java.time.Instant

data class DashboardOverview(
    val totalProjects: Int,
    val totalEndpoints: Int,
    val activeSchedules: Int,
    val overallSuccessRate: Double,
    val overallAvgResponseTimeMs: Long,
    val projects: List<ProjectSummary>
)

data class ProjectSummary(
    val id: String,
    val name: String,
    val baseUrl: String,
    val endpointCount: Int,
    val healthStatus: HealthStatus,
    val successCount: Long,
    val failedCount: Long,
    val avgResponseTimeMs: Long,
    val enabled: Boolean
)

enum class HealthStatus {
    HEALTHY,
    DEGRADED,
    UNHEALTHY,
    UNKNOWN
}

data class HealthCheck(
    val status: String,
    val timestamp: Instant,
    val version: String
)
