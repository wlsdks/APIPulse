package com.apipulse.controller

import com.apipulse.model.AuthType
import com.apipulse.model.Project
import com.apipulse.repository.ProjectRepository
import com.apipulse.service.extractor.ApiExtractorService
import com.apipulse.service.extractor.ExtractResult
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.Instant

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = ["*"])
class ProjectController(
    private val projectRepository: ProjectRepository,
    private val apiExtractorService: ApiExtractorService
) {

    @GetMapping
    fun getAllProjects(): List<ProjectResponse> {
        return projectRepository.findAll().map { it.toResponse() }
    }

    @GetMapping("/{id}")
    fun getProject(@PathVariable id: String): ResponseEntity<ProjectResponse> {
        return projectRepository.findById(id)
            .map { ResponseEntity.ok(it.toResponse()) }
            .orElse(ResponseEntity.notFound().build())
    }

    @PostMapping
    fun createProject(@Valid @RequestBody request: CreateProjectRequest): ResponseEntity<ProjectResponse> {
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

        // Auto-extract APIs if swagger URL is provided
        if (!request.swaggerUrl.isNullOrBlank()) {
            apiExtractorService.extractFromSwagger(saved)
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(saved.toResponse())
    }

    @PutMapping("/{id}")
    fun updateProject(
        @PathVariable id: String,
        @Valid @RequestBody request: UpdateProjectRequest
    ): ResponseEntity<ProjectResponse> {
        return projectRepository.findById(id).map { project ->
            request.name?.let { project.name = it }
            request.baseUrl?.let { project.baseUrl = it }
            request.description?.let { project.description = it }
            request.swaggerUrl?.let { project.swaggerUrl = it }
            request.authType?.let { project.authType = it }
            request.authValue?.let { project.authValue = it }
            request.headerName?.let { project.headerName = it }
            request.enabled?.let { project.enabled = it }
            project.updatedAt = Instant.now()

            ResponseEntity.ok(projectRepository.save(project).toResponse())
        }.orElse(ResponseEntity.notFound().build())
    }

    @DeleteMapping("/{id}")
    fun deleteProject(@PathVariable id: String): ResponseEntity<Void> {
        return if (projectRepository.existsById(id)) {
            projectRepository.deleteById(id)
            ResponseEntity.noContent().build()
        } else {
            ResponseEntity.notFound().build()
        }
    }

    @PostMapping("/{id}/sync")
    fun syncApis(@PathVariable id: String): ResponseEntity<ExtractResult> {
        return projectRepository.findById(id).map { project ->
            val result = apiExtractorService.extractFromSwagger(project)
            if (result.hasErrors) {
                ResponseEntity.badRequest().body(result)
            } else {
                ResponseEntity.ok(result)
            }
        }.orElse(ResponseEntity.notFound().build())
    }
}

data class CreateProjectRequest(
    @field:NotBlank(message = "Project name is required")
    val name: String,

    @field:NotBlank(message = "Base URL is required")
    val baseUrl: String,

    val description: String? = null,
    val swaggerUrl: String? = null,
    val authType: AuthType = AuthType.NONE,
    val authValue: String? = null,
    val headerName: String? = null
)

data class UpdateProjectRequest(
    val name: String? = null,
    val baseUrl: String? = null,
    val description: String? = null,
    val swaggerUrl: String? = null,
    val authType: AuthType? = null,
    val authValue: String? = null,
    val headerName: String? = null,
    val enabled: Boolean? = null
)

data class ProjectResponse(
    val id: String,
    val name: String,
    val baseUrl: String,
    val description: String?,
    val swaggerUrl: String?,
    val authType: AuthType,
    val enabled: Boolean,
    val endpointCount: Int,
    val createdAt: Instant,
    val updatedAt: Instant
)

fun Project.toResponse() = ProjectResponse(
    id = id!!,
    name = name,
    baseUrl = baseUrl,
    description = description,
    swaggerUrl = swaggerUrl,
    authType = authType,
    enabled = enabled,
    endpointCount = endpoints.size,
    createdAt = createdAt,
    updatedAt = updatedAt
)
