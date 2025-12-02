package com.apipulse.service.test

import com.apipulse.dto.mapper.toResponse
import com.apipulse.dto.response.ProjectTestResultResponse
import com.apipulse.dto.response.TestResultPageResponse
import com.apipulse.dto.response.TestResultResponse
import com.apipulse.dto.response.TestStatsResponse
import com.apipulse.exception.NoEndpointsToTestException
import com.apipulse.exception.ProjectNotFoundException
import com.apipulse.model.TestStatus
import com.apipulse.model.TriggerType
import com.apipulse.repository.ProjectRepository
import com.apipulse.repository.TestResultRepository
import com.apipulse.service.notifier.NotificationService
import com.apipulse.service.tester.ApiTesterService
import kotlinx.coroutines.runBlocking
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant

@Service
@Transactional(readOnly = true)
class TestServiceImpl(
    private val projectRepository: ProjectRepository,
    private val testResultRepository: TestResultRepository,
    private val apiTesterService: ApiTesterService,
    private val notificationService: NotificationService
) : TestService {

    override fun runTests(projectId: String): ProjectTestResultResponse {
        val project = projectRepository.findById(projectId)
            .orElseThrow { ProjectNotFoundException(projectId) }

        val result = runBlocking {
            apiTesterService.testProject(projectId, TriggerType.MANUAL)
        }

        if (result.results.isEmpty()) {
            throw NoEndpointsToTestException(projectId)
        }

        if (result.failedCount > 0) {
            notificationService.notifyTestResults(project.name, result)
        }

        return result.toResponse()
    }

    override fun getTestResults(projectId: String, page: Int, size: Int): TestResultPageResponse {
        if (!projectRepository.existsById(projectId)) {
            throw ProjectNotFoundException(projectId)
        }

        val pageable = PageRequest.of(page, size, Sort.by("executedAt").descending())
        val results = testResultRepository.findByEndpointProjectIdOrderByExecutedAtDesc(projectId, pageable)

        return TestResultPageResponse(
            results = results.content.map { it.toResponse() },
            totalElements = results.totalElements,
            totalPages = results.totalPages,
            currentPage = page
        )
    }

    override fun getLatestResults(projectId: String): List<TestResultResponse> {
        if (!projectRepository.existsById(projectId)) {
            throw ProjectNotFoundException(projectId)
        }

        return testResultRepository.findLatestResultsForProject(projectId)
            .map { it.toResponse() }
    }

    override fun getTestStats(projectId: String): TestStatsResponse {
        if (!projectRepository.existsById(projectId)) {
            throw ProjectNotFoundException(projectId)
        }

        val since = Instant.now().minusSeconds(86400)
        val successCount = testResultRepository.countByEndpointProjectIdAndStatus(projectId, TestStatus.SUCCESS)
        val failedCount = testResultRepository.countByEndpointProjectIdAndStatus(projectId, TestStatus.FAILED)
        val errorCount = testResultRepository.countByEndpointProjectIdAndStatus(projectId, TestStatus.ERROR)
        val timeoutCount = testResultRepository.countByEndpointProjectIdAndStatus(projectId, TestStatus.TIMEOUT)
        val avgResponseTime = testResultRepository.getAverageResponseTime(projectId, since) ?: 0.0

        val totalCount = successCount + failedCount + errorCount + timeoutCount
        val successRate = if (totalCount > 0) (successCount.toDouble() / totalCount) * 100 else 0.0

        return TestStatsResponse(
            totalTests = totalCount,
            successCount = successCount,
            failedCount = failedCount,
            errorCount = errorCount,
            timeoutCount = timeoutCount,
            successRate = successRate,
            averageResponseTimeMs = avgResponseTime.toLong()
        )
    }
}
