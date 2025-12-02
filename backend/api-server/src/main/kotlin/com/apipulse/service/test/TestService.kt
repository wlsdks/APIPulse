package com.apipulse.service.test

import com.apipulse.dto.response.ProjectTestResultResponse
import com.apipulse.dto.response.TestResultPageResponse
import com.apipulse.dto.response.TestResultResponse
import com.apipulse.dto.response.TestStatsResponse

interface TestService {
    fun runTests(projectId: String): ProjectTestResultResponse?
    fun getTestResults(projectId: String, page: Int, size: Int): TestResultPageResponse?
    fun getLatestResults(projectId: String): List<TestResultResponse>?
    fun getTestStats(projectId: String): TestStatsResponse?
}
