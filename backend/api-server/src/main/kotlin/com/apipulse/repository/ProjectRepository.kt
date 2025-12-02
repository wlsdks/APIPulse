package com.apipulse.repository

import com.apipulse.model.Project
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ProjectRepository : JpaRepository<Project, String> {
    fun findByEnabledTrue(): List<Project>
    fun findByNameContainingIgnoreCase(name: String): List<Project>
}
