package com.apipulse.repository

import com.apipulse.model.*
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.time.Instant

@Repository
interface ProjectRepository : JpaRepository<Project, String> {
    fun findByEnabledTrue(): List<Project>
    fun findByNameContainingIgnoreCase(name: String): List<Project>
}

@Repository
interface ApiEndpointRepository : JpaRepository<ApiEndpoint, String> {
    fun findByProjectId(projectId: String): List<ApiEndpoint>
    fun findByProjectIdAndEnabledTrue(projectId: String): List<ApiEndpoint>
    fun deleteByProjectId(projectId: String)

    @Query("SELECT e FROM ApiEndpoint e WHERE e.project.id = :projectId AND e.path = :path AND e.method = :method")
    fun findByProjectIdAndPathAndMethod(projectId: String, path: String, method: HttpMethod): ApiEndpoint?
}

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

@Repository
interface TestScheduleRepository : JpaRepository<TestSchedule, String> {
    fun findByProjectId(projectId: String): List<TestSchedule>
    fun findByEnabledTrue(): List<TestSchedule>
}

@Repository
interface NotificationConfigRepository : JpaRepository<NotificationConfig, String> {
    fun findByEnabledTrue(): List<NotificationConfig>
    fun findByType(type: NotificationType): List<NotificationConfig>
}
