package com.apipulse.controller

import com.apipulse.dto.request.CreateScheduleRequest
import com.apipulse.dto.request.UpdateScheduleRequest
import com.apipulse.dto.response.ScheduleResponse
import com.apipulse.service.schedule.ScheduleService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/projects/{projectId}/schedules")
@CrossOrigin(origins = ["*"])
class ScheduleController(
    private val scheduleService: ScheduleService
) {

    @GetMapping
    fun getSchedules(@PathVariable projectId: String): ResponseEntity<List<ScheduleResponse>> {
        return scheduleService.getSchedules(projectId)
            ?.let { ResponseEntity.ok(it) }
            ?: ResponseEntity.notFound().build()
    }

    @GetMapping("/{id}")
    fun getSchedule(
        @PathVariable projectId: String,
        @PathVariable id: String
    ): ResponseEntity<ScheduleResponse> {
        return scheduleService.getSchedule(projectId, id)
            ?.let { ResponseEntity.ok(it) }
            ?: ResponseEntity.notFound().build()
    }

    @PostMapping
    fun createSchedule(
        @PathVariable projectId: String,
        @Valid @RequestBody request: CreateScheduleRequest
    ): ResponseEntity<ScheduleResponse> {
        return scheduleService.createSchedule(projectId, request)
            ?.let { ResponseEntity.status(HttpStatus.CREATED).body(it) }
            ?: ResponseEntity.notFound().build()
    }

    @PutMapping("/{id}")
    fun updateSchedule(
        @PathVariable projectId: String,
        @PathVariable id: String,
        @Valid @RequestBody request: UpdateScheduleRequest
    ): ResponseEntity<ScheduleResponse> {
        return scheduleService.updateSchedule(projectId, id, request)
            ?.let { ResponseEntity.ok(it) }
            ?: ResponseEntity.notFound().build()
    }

    @DeleteMapping("/{id}")
    fun deleteSchedule(
        @PathVariable projectId: String,
        @PathVariable id: String
    ): ResponseEntity<Void> {
        return if (scheduleService.deleteSchedule(projectId, id)) {
            ResponseEntity.noContent().build()
        } else {
            ResponseEntity.notFound().build()
        }
    }

    @PostMapping("/{id}/pause")
    fun pauseSchedule(
        @PathVariable projectId: String,
        @PathVariable id: String
    ): ResponseEntity<ScheduleResponse> {
        return scheduleService.pauseSchedule(projectId, id)
            ?.let { ResponseEntity.ok(it) }
            ?: ResponseEntity.notFound().build()
    }

    @PostMapping("/{id}/resume")
    fun resumeSchedule(
        @PathVariable projectId: String,
        @PathVariable id: String
    ): ResponseEntity<ScheduleResponse> {
        return scheduleService.resumeSchedule(projectId, id)
            ?.let { ResponseEntity.ok(it) }
            ?: ResponseEntity.notFound().build()
    }
}
