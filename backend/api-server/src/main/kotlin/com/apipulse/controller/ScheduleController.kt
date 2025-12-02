package com.apipulse.controller

import com.apipulse.model.TestSchedule
import com.apipulse.model.TestStatus
import com.apipulse.repository.ProjectRepository
import com.apipulse.repository.TestScheduleRepository
import com.apipulse.service.scheduler.SchedulerService
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.Instant

@RestController
@RequestMapping("/api/projects/{projectId}/schedules")
@CrossOrigin(origins = ["*"])
class ScheduleController(
    private val projectRepository: ProjectRepository,
    private val testScheduleRepository: TestScheduleRepository,
    private val schedulerService: SchedulerService
) {

    @GetMapping
    fun getSchedules(@PathVariable projectId: String): ResponseEntity<List<ScheduleResponse>> {
        if (!projectRepository.existsById(projectId)) {
            return ResponseEntity.notFound().build()
        }

        val schedules = testScheduleRepository.findByProjectId(projectId)
        return ResponseEntity.ok(schedules.map { it.toResponse() })
    }

    @GetMapping("/{id}")
    fun getSchedule(
        @PathVariable projectId: String,
        @PathVariable id: String
    ): ResponseEntity<ScheduleResponse> {
        return testScheduleRepository.findById(id)
            .filter { it.project.id == projectId }
            .map { ResponseEntity.ok(it.toResponse()) }
            .orElse(ResponseEntity.notFound().build())
    }

    @PostMapping
    fun createSchedule(
        @PathVariable projectId: String,
        @Valid @RequestBody request: CreateScheduleRequest
    ): ResponseEntity<ScheduleResponse> {
        val project = projectRepository.findById(projectId).orElse(null)
            ?: return ResponseEntity.notFound().build()

        val schedule = TestSchedule(
            project = project,
            name = request.name,
            cronExpression = request.cronExpression,
            notifyOnFailure = request.notifyOnFailure ?: true,
            notifyOnSuccess = request.notifyOnSuccess ?: false
        )

        val saved = schedulerService.createSchedule(schedule)
        return ResponseEntity.status(HttpStatus.CREATED).body(saved.toResponse())
    }

    @PutMapping("/{id}")
    fun updateSchedule(
        @PathVariable projectId: String,
        @PathVariable id: String,
        @Valid @RequestBody request: UpdateScheduleRequest
    ): ResponseEntity<ScheduleResponse> {
        return testScheduleRepository.findById(id)
            .filter { it.project.id == projectId }
            .map { schedule ->
                request.name?.let { schedule.name = it }
                request.cronExpression?.let { schedule.cronExpression = it }
                request.enabled?.let { schedule.enabled = it }
                request.notifyOnFailure?.let { schedule.notifyOnFailure = it }
                request.notifyOnSuccess?.let { schedule.notifyOnSuccess = it }
                schedule.updatedAt = Instant.now()

                val updated = schedulerService.updateSchedule(schedule)
                ResponseEntity.ok(updated.toResponse())
            }
            .orElse(ResponseEntity.notFound().build())
    }

    @DeleteMapping("/{id}")
    fun deleteSchedule(
        @PathVariable projectId: String,
        @PathVariable id: String
    ): ResponseEntity<Void> {
        return testScheduleRepository.findById(id)
            .filter { it.project.id == projectId }
            .map {
                schedulerService.deleteSchedule(id)
                ResponseEntity.noContent().build<Void>()
            }
            .orElse(ResponseEntity.notFound().build())
    }

    @PostMapping("/{id}/pause")
    fun pauseSchedule(
        @PathVariable projectId: String,
        @PathVariable id: String
    ): ResponseEntity<ScheduleResponse> {
        return testScheduleRepository.findById(id)
            .filter { it.project.id == projectId }
            .map {
                schedulerService.pauseSchedule(id)
                ResponseEntity.ok(testScheduleRepository.findById(id).get().toResponse())
            }
            .orElse(ResponseEntity.notFound().build())
    }

    @PostMapping("/{id}/resume")
    fun resumeSchedule(
        @PathVariable projectId: String,
        @PathVariable id: String
    ): ResponseEntity<ScheduleResponse> {
        return testScheduleRepository.findById(id)
            .filter { it.project.id == projectId }
            .map {
                schedulerService.resumeSchedule(id)
                ResponseEntity.ok(testScheduleRepository.findById(id).get().toResponse())
            }
            .orElse(ResponseEntity.notFound().build())
    }
}

data class CreateScheduleRequest(
    @field:NotBlank(message = "Schedule name is required")
    val name: String,

    @field:NotBlank(message = "Cron expression is required")
    val cronExpression: String,

    val notifyOnFailure: Boolean? = null,
    val notifyOnSuccess: Boolean? = null
)

data class UpdateScheduleRequest(
    val name: String? = null,
    val cronExpression: String? = null,
    val enabled: Boolean? = null,
    val notifyOnFailure: Boolean? = null,
    val notifyOnSuccess: Boolean? = null
)

data class ScheduleResponse(
    val id: String,
    val name: String,
    val cronExpression: String,
    val enabled: Boolean,
    val lastRunAt: Instant?,
    val nextRunAt: Instant?,
    val lastRunStatus: TestStatus?,
    val notifyOnFailure: Boolean,
    val notifyOnSuccess: Boolean,
    val createdAt: Instant,
    val updatedAt: Instant
)

fun TestSchedule.toResponse() = ScheduleResponse(
    id = id!!,
    name = name,
    cronExpression = cronExpression,
    enabled = enabled,
    lastRunAt = lastRunAt,
    nextRunAt = nextRunAt,
    lastRunStatus = lastRunStatus,
    notifyOnFailure = notifyOnFailure,
    notifyOnSuccess = notifyOnSuccess,
    createdAt = createdAt,
    updatedAt = updatedAt
)
