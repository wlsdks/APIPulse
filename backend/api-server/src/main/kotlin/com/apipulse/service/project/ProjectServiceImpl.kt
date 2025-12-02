package com.apipulse.service.project

import com.apipulse.dto.mapper.toResponse
import com.apipulse.dto.request.CreateProjectRequest
import com.apipulse.dto.request.UpdateProjectRequest
import com.apipulse.dto.response.ProjectResponse
import com.apipulse.exception.ProjectNotFoundException
import com.apipulse.exception.ProjectSwaggerUrlRequiredException
import com.apipulse.model.Project
import com.apipulse.repository.ProjectRepository
import com.apipulse.service.extractor.ApiExtractorService
import com.apipulse.service.extractor.ExtractResult
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant

@Service
@Transactional(readOnly = true)
class ProjectServiceImpl(
    private val projectRepository: ProjectRepository,
    private val apiExtractorService: ApiExtractorService
) : ProjectService {

    override fun getAllProjects(): List<ProjectResponse> {
        return projectRepository.findAll().map { it.toResponse() }
    }

    override fun getProject(id: String): ProjectResponse {
        return projectRepository.findById(id)
            .map { it.toResponse() }
            .orElseThrow { ProjectNotFoundException(id) }
    }

    @Transactional
    override fun createProject(request: CreateProjectRequest): ProjectResponse {
        val project = Project(
            name = request.name,
            baseUrl = request.baseUrl,
            description = request.description,
            swaggerUrl = request.swaggerUrl,
            authType = request.authType,
            authValue = request.authValue,
            headerName = request.headerName
        )

        val saved = projectRepository.save(project)

        if (!request.swaggerUrl.isNullOrBlank()) {
            apiExtractorService.extractFromSwagger(saved)
        }

        return saved.toResponse()
    }

    @Transactional
    override fun updateProject(id: String, request: UpdateProjectRequest): ProjectResponse {
        val project = projectRepository.findById(id)
            .orElseThrow { ProjectNotFoundException(id) }

        request.name?.let { project.name = it }
        request.baseUrl?.let { project.baseUrl = it }
        request.description?.let { project.description = it }
        request.swaggerUrl?.let { project.swaggerUrl = it }
        request.authType?.let { project.authType = it }
        request.authValue?.let { project.authValue = it }
        request.headerName?.let { project.headerName = it }
        request.enabled?.let { project.enabled = it }
        project.updatedAt = Instant.now()

        return projectRepository.save(project).toResponse()
    }

    @Transactional
    override fun deleteProject(id: String) {
        if (!projectRepository.existsById(id)) {
            throw ProjectNotFoundException(id)
        }
        projectRepository.deleteById(id)
    }

    @Transactional
    override fun syncApis(id: String): ExtractResult {
        val project = projectRepository.findById(id)
            .orElseThrow { ProjectNotFoundException(id) }

        if (project.swaggerUrl.isNullOrBlank()) {
            throw ProjectSwaggerUrlRequiredException()
        }

        return apiExtractorService.extractFromSwagger(project)
    }
}
