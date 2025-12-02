package com.apipulse.repository

import com.apipulse.model.ApiEndpoint
import com.apipulse.model.HttpMethod
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface ApiEndpointRepository : JpaRepository<ApiEndpoint, String> {
    fun findByProjectId(projectId: String): List<ApiEndpoint>
    fun findByProjectIdAndEnabledTrue(projectId: String): List<ApiEndpoint>
    fun deleteByProjectId(projectId: String)

    @Query("SELECT e FROM ApiEndpoint e WHERE e.project.id = :projectId AND e.path = :path AND e.method = :method")
    fun findByProjectIdAndPathAndMethod(projectId: String, path: String, method: HttpMethod): ApiEndpoint?
}
