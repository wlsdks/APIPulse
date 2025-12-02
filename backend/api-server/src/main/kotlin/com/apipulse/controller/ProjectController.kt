package com.apipulse.controller

import com.apipulse.dto.request.CreateProjectRequest
import com.apipulse.dto.request.UpdateProjectRequest
import com.apipulse.dto.response.ProjectResponse
import com.apipulse.service.extractor.ExtractResult
import com.apipulse.service.project.ProjectService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = ["*"])
class ProjectController(
    private val projectService: ProjectService
) {

    @GetMapping
    fun getAllProjects(): List<ProjectResponse> {
        return projectService.getAllProjects()
    }

    @GetMapping("/{id}")
    fun getProject(@PathVariable id: String): ResponseEntity<ProjectResponse> {
        return projectService.getProject(id)
            ?.let { ResponseEntity.ok(it) }
            ?: ResponseEntity.notFound().build()
    }

    @PostMapping
    fun createProject(@Valid @RequestBody request: CreateProjectRequest): ResponseEntity<ProjectResponse> {
        val response = projectService.createProject(request)
        return ResponseEntity.status(HttpStatus.CREATED).body(response)
    }

    @PutMapping("/{id}")
    fun updateProject(
        @PathVariable id: String,
        @Valid @RequestBody request: UpdateProjectRequest
    ): ResponseEntity<ProjectResponse> {
        return projectService.updateProject(id, request)
            ?.let { ResponseEntity.ok(it) }
            ?: ResponseEntity.notFound().build()
    }

    @DeleteMapping("/{id}")
    fun deleteProject(@PathVariable id: String): ResponseEntity<Void> {
        return if (projectService.deleteProject(id)) {
            ResponseEntity.noContent().build()
        } else {
            ResponseEntity.notFound().build()
        }
    }

    @PostMapping("/{id}/sync")
    fun syncApis(@PathVariable id: String): ResponseEntity<ExtractResult> {
        return projectService.syncApis(id)
            ?.let { result ->
                if (result.hasErrors) {
                    ResponseEntity.badRequest().body(result)
                } else {
                    ResponseEntity.ok(result)
                }
            }
            ?: ResponseEntity.notFound().build()
    }
}
