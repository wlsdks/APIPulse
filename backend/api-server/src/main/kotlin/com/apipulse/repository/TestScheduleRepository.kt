package com.apipulse.repository

import com.apipulse.model.TestSchedule
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface TestScheduleRepository : JpaRepository<TestSchedule, String> {
    fun findByProjectId(projectId: String): List<TestSchedule>
    fun findByEnabledTrue(): List<TestSchedule>
}
