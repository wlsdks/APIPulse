package com.apipulse.controller

import com.apipulse.dto.mapper.toResponse
import com.apipulse.dto.response.ProjectTestResultResponse
import com.apipulse.dto.response.TestResultPageResponse
import com.apipulse.dto.response.TestResultResponse
import com.apipulse.dto.response.TestStatsResponse
import com.apipulse.model.TestStatus
import com.apipulse.model.TriggerType
import com.apipulse.repository.ProjectRepository
import com.apipulse.repository.TestResultRepository
import com.apipulse.service.notifier.NotificationService
import com.apipulse.service.tester.ApiTesterService
import kotlinx.coroutines.runBlocking
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.Instant

@RestController
@RequestMapping("/api/projects/{projectId}/tests")
@CrossOrigin(origins = ["*"])
class TestController(
    private val projectRepository: ProjectRepository,
    private val testResultRepository: TestResultRepository,
    private val apiTesterService: ApiTesterService,
    private val notificationService: NotificationService
) {

    @PostMapping("/run")
    fun runTests(@PathVariable projectId: String): ResponseEntity<ProjectTestResultResponse> {
        val project = projectRepository.findById(projectId).orElse(null)
            ?: return ResponseEntity.notFound().build()

        val result = runBlocking {
            apiTesterService.testProject(projectId, TriggerType.MANUAL)
        }

        if (result.failedCount > 0) {
            notificationService.notifyTestResults(project.name, result)
        }

        return ResponseEntity.ok(result.toResponse())
    }

    @GetMapping("/results")
    fun getTestResults(
        @PathVariable projectId: String,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "50") size: Int
    ): ResponseEntity<TestResultPageResponse> {
        if (!projectRepository.existsById(projectId)) {
            return ResponseEntity.notFound().build()
        }

        val pageable = PageRequest.of(page, size, Sort.by("executedAt").descending())
        val results = testResultRepository.findByEndpointProjectIdOrderByExecutedAtDesc(projectId, pageable)

        return ResponseEntity.ok(
            TestResultPageResponse(
                results = results.content.map { it.toResponse() },
                totalElements = results.totalElements,
                totalPages = results.totalPages,
                currentPage = page
            )
        )
    }

    @GetMapping("/latest")
    fun getLatestResults(@PathVariable projectId: String): ResponseEntity<List<TestResultResponse>> {
        if (!projectRepository.existsById(projectId)) {
            return ResponseEntity.notFound().build()
        }

        val results = testResultRepository.findLatestResultsForProject(projectId)
        return ResponseEntity.ok(results.map { it.toResponse() })
    }

    @GetMapping("/stats")
    fun getTestStats(@PathVariable projectId: String): ResponseEntity<TestStatsResponse> {
        if (!projectRepository.existsById(projectId)) {
            return ResponseEntity.notFound().build()
        }

        val since = Instant.now().minusSeconds(86400)
        val successCount = testResultRepository.countByEndpointProjectIdAndStatus(projectId, TestStatus.SUCCESS)
        val failedCount = testResultRepository.countByEndpointProjectIdAndStatus(projectId, TestStatus.FAILED)
        val errorCount = testResultRepository.countByEndpointProjectIdAndStatus(projectId, TestStatus.ERROR)
        val timeoutCount = testResultRepository.countByEndpointProjectIdAndStatus(projectId, TestStatus.TIMEOUT)
        val avgResponseTime = testResultRepository.getAverageResponseTime(projectId, since) ?: 0.0

        val totalCount = successCount + failedCount + errorCount + timeoutCount
        val successRate = if (totalCount > 0) (successCount.toDouble() / totalCount) * 100 else 0.0

        return ResponseEntity.ok(
            TestStatsResponse(
                totalTests = totalCount,
                successCount = successCount,
                failedCount = failedCount,
                errorCount = errorCount,
                timeoutCount = timeoutCount,
                successRate = successRate,
                averageResponseTimeMs = avgResponseTime.toLong()
            )
        )
    }
}
