package com.apipulse.repository

import com.apipulse.model.TestResult
import com.apipulse.model.TestStatus
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.time.Instant

@Repository
interface TestResultRepository : JpaRepository<TestResult, String> {
    fun findByEndpointIdOrderByExecutedAtDesc(endpointId: String, pageable: Pageable): Page<TestResult>

    fun findByEndpointProjectIdOrderByExecutedAtDesc(projectId: String, pageable: Pageable): Page<TestResult>

    @Query("SELECT r FROM TestResult r WHERE r.endpoint.project.id = :projectId AND r.executedAt >= :since ORDER BY r.executedAt DESC")
    fun findByProjectIdSince(projectId: String, since: Instant): List<TestResult>

    @Query("SELECT r FROM TestResult r WHERE r.endpoint.id = :endpointId ORDER BY r.executedAt DESC LIMIT 1")
    fun findLatestByEndpointId(endpointId: String): TestResult?

    @Query("""
        SELECT r FROM TestResult r
        WHERE r.endpoint.project.id = :projectId
        AND r.executedAt = (
            SELECT MAX(r2.executedAt) FROM TestResult r2 WHERE r2.endpoint.id = r.endpoint.id
        )
    """)
    fun findLatestResultsForProject(projectId: String): List<TestResult>

    fun countByEndpointProjectIdAndStatus(projectId: String, status: TestStatus): Long

    @Query("SELECT AVG(r.responseTimeMs) FROM TestResult r WHERE r.endpoint.project.id = :projectId AND r.executedAt >= :since")
    fun getAverageResponseTime(projectId: String, since: Instant): Double?
}
