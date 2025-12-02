package com.apipulse.service.project

import com.apipulse.dto.request.CreateProjectRequest
import com.apipulse.dto.request.UpdateProjectRequest
import com.apipulse.dto.response.ProjectResponse
import com.apipulse.service.extractor.ExtractResult

interface ProjectService {
    fun getAllProjects(): List<ProjectResponse>
    fun getProject(id: String): ProjectResponse?
    fun createProject(request: CreateProjectRequest): ProjectResponse
    fun updateProject(id: String, request: UpdateProjectRequest): ProjectResponse?
    fun deleteProject(id: String): Boolean
    fun syncApis(id: String): ExtractResult?
}
