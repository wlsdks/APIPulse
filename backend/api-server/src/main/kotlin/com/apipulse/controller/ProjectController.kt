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
class ProjectController(
    private val projectService: ProjectService
) {

    @GetMapping
    fun getAllProjects(): List<ProjectResponse> {
        return projectService.getAllProjects()
    }

    @GetMapping("/{id}")
    fun getProject(@PathVariable id: String): ResponseEntity<ProjectResponse> {
        return ResponseEntity.ok(projectService.getProject(id))
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
        return ResponseEntity.ok(projectService.updateProject(id, request))
    }

    @DeleteMapping("/{id}")
    fun deleteProject(@PathVariable id: String): ResponseEntity<Void> {
        projectService.deleteProject(id)
        return ResponseEntity.noContent().build()
    }

    @PostMapping("/{id}/sync")
    fun syncApis(@PathVariable id: String): ResponseEntity<ExtractResult> {
        val result = projectService.syncApis(id)
        return if (result.hasErrors) {
            ResponseEntity.badRequest().body(result)
        } else {
            ResponseEntity.ok(result)
        }
    }
}
