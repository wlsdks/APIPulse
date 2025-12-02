package com.apipulse.service.dashboard

import com.apipulse.dto.response.DashboardOverview
import com.apipulse.dto.response.HealthCheck
import com.apipulse.dto.response.HealthStatus
import com.apipulse.dto.response.ProjectSummary
import com.apipulse.model.TestStatus
import com.apipulse.repository.ApiEndpointRepository
import com.apipulse.repository.ProjectRepository
import com.apipulse.repository.TestResultRepository
import com.apipulse.repository.TestScheduleRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant

@Service
@Transactional(readOnly = true)
class DashboardServiceImpl(
    private val projectRepository: ProjectRepository,
    private val apiEndpointRepository: ApiEndpointRepository,
    private val testResultRepository: TestResultRepository,
    private val testScheduleRepository: TestScheduleRepository
) : DashboardService {

    override fun getOverview(): DashboardOverview {
        val projects = projectRepository.findAll()
        val totalProjects = projects.size
        val totalEndpoints = apiEndpointRepository.count()
        val activeSchedules = testScheduleRepository.findByEnabledTrue().size

        val since = Instant.now().minusSeconds(86400)

        var totalSuccess = 0L
        var totalFailed = 0L
        var totalAvgResponse = 0.0

        val projectSummaries = projects.map { project ->
            val successCount = testResultRepository.countByEndpointProjectIdAndStatus(project.id!!, TestStatus.SUCCESS)
            val failedCount = testResultRepository.countByEndpointProjectIdAndStatus(project.id!!, TestStatus.FAILED) +
                    testResultRepository.countByEndpointProjectIdAndStatus(project.id!!, TestStatus.ERROR) +
                    testResultRepository.countByEndpointProjectIdAndStatus(project.id!!, TestStatus.TIMEOUT)
            val avgResponseTime = testResultRepository.getAverageResponseTime(project.id!!, since) ?: 0.0

            totalSuccess += successCount
            totalFailed += failedCount
            totalAvgResponse += avgResponseTime

            val latestResults = testResultRepository.findLatestResultsForProject(project.id!!)
            val healthStatus = when {
                latestResults.isEmpty() -> HealthStatus.UNKNOWN
                latestResults.all { it.status == TestStatus.SUCCESS } -> HealthStatus.HEALTHY
                latestResults.any { it.status == TestStatus.SUCCESS } -> HealthStatus.DEGRADED
                else -> HealthStatus.UNHEALTHY
            }

            ProjectSummary(
                id = project.id!!,
                name = project.name,
                baseUrl = project.baseUrl,
                endpointCount = project.endpoints.size,
                healthStatus = healthStatus,
                successCount = successCount,
                failedCount = failedCount,
                avgResponseTimeMs = avgResponseTime.toLong(),
                enabled = project.enabled
            )
        }

        val totalTests = totalSuccess + totalFailed
        val overallSuccessRate = if (totalTests > 0) (totalSuccess.toDouble() / totalTests) * 100 else 0.0
        val overallAvgResponse = if (projects.isNotEmpty()) (totalAvgResponse / projects.size).toLong() else 0L

        return DashboardOverview(
            totalProjects = totalProjects,
            totalEndpoints = totalEndpoints.toInt(),
            activeSchedules = activeSchedules,
            overallSuccessRate = overallSuccessRate,
            overallAvgResponseTimeMs = overallAvgResponse,
            projects = projectSummaries
        )
    }

    override fun getHealthStatus(): HealthCheck {
        return HealthCheck(
            status = "UP",
            timestamp = Instant.now(),
            version = "1.0.0"
        )
    }
}
