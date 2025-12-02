package com.apipulse.controller

import com.apipulse.dto.response.ProjectTestResultResponse
import com.apipulse.dto.response.TestResultPageResponse
import com.apipulse.dto.response.TestResultResponse
import com.apipulse.dto.response.TestStatsResponse
import com.apipulse.service.test.TestService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/projects/{projectId}/tests")
@CrossOrigin(origins = ["*"])
class TestController(
    private val testService: TestService
) {

    @PostMapping("/run")
    fun runTests(@PathVariable projectId: String): ResponseEntity<ProjectTestResultResponse> {
        return ResponseEntity.ok(testService.runTests(projectId))
    }

    @GetMapping("/results")
    fun getTestResults(
        @PathVariable projectId: String,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "50") size: Int
    ): ResponseEntity<TestResultPageResponse> {
        return ResponseEntity.ok(testService.getTestResults(projectId, page, size))
    }

    @GetMapping("/latest")
    fun getLatestResults(@PathVariable projectId: String): ResponseEntity<List<TestResultResponse>> {
        return ResponseEntity.ok(testService.getLatestResults(projectId))
    }

    @GetMapping("/stats")
    fun getTestStats(@PathVariable projectId: String): ResponseEntity<TestStatsResponse> {
        return ResponseEntity.ok(testService.getTestStats(projectId))
    }
}
