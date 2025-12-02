package com.apipulse.service.schedule

import com.apipulse.dto.mapper.toResponse
import com.apipulse.dto.request.CreateScheduleRequest
import com.apipulse.dto.request.UpdateScheduleRequest
import com.apipulse.dto.response.ScheduleResponse
import com.apipulse.model.TestSchedule
import com.apipulse.repository.ProjectRepository
import com.apipulse.repository.TestScheduleRepository
import com.apipulse.service.scheduler.SchedulerService
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant

@Service
@Transactional(readOnly = true)
class ScheduleServiceImpl(
    private val projectRepository: ProjectRepository,
    private val testScheduleRepository: TestScheduleRepository,
    private val schedulerService: SchedulerService
) : ScheduleService {

    override fun getSchedules(projectId: String): List<ScheduleResponse>? {
        if (!projectRepository.existsById(projectId)) {
            return null
        }
        return testScheduleRepository.findByProjectId(projectId).map { it.toResponse() }
    }

    override fun getSchedule(projectId: String, scheduleId: String): ScheduleResponse? {
        return testScheduleRepository.findById(scheduleId)
            .filter { it.project.id == projectId }
            .map { it.toResponse() }
            .orElse(null)
    }

    @Transactional
    override fun createSchedule(projectId: String, request: CreateScheduleRequest): ScheduleResponse? {
        val project = projectRepository.findById(projectId).orElse(null)
            ?: return null

        val schedule = TestSchedule(
            project = project,
            name = request.name,
            cronExpression = request.cronExpression,
            notifyOnFailure = request.notifyOnFailure ?: true,
            notifyOnSuccess = request.notifyOnSuccess ?: false
        )

        return schedulerService.createSchedule(schedule).toResponse()
    }

    @Transactional
    override fun updateSchedule(projectId: String, scheduleId: String, request: UpdateScheduleRequest): ScheduleResponse? {
        return testScheduleRepository.findById(scheduleId)
            .filter { it.project.id == projectId }
            .map { schedule ->
                request.name?.let { schedule.name = it }
                request.cronExpression?.let { schedule.cronExpression = it }
                request.enabled?.let { schedule.enabled = it }
                request.notifyOnFailure?.let { schedule.notifyOnFailure = it }
                request.notifyOnSuccess?.let { schedule.notifyOnSuccess = it }
                schedule.updatedAt = Instant.now()

                schedulerService.updateSchedule(schedule).toResponse()
            }
            .orElse(null)
    }

    @Transactional
    override fun deleteSchedule(projectId: String, scheduleId: String): Boolean {
        return testScheduleRepository.findById(scheduleId)
            .filter { it.project.id == projectId }
            .map {
                schedulerService.deleteSchedule(scheduleId)
                true
            }
            .orElse(false)
    }

    @Transactional
    override fun pauseSchedule(projectId: String, scheduleId: String): ScheduleResponse? {
        return testScheduleRepository.findById(scheduleId)
            .filter { it.project.id == projectId }
            .map {
                schedulerService.pauseSchedule(scheduleId)
                testScheduleRepository.findById(scheduleId).get().toResponse()
            }
            .orElse(null)
    }

    @Transactional
    override fun resumeSchedule(projectId: String, scheduleId: String): ScheduleResponse? {
        return testScheduleRepository.findById(scheduleId)
            .filter { it.project.id == projectId }
            .map {
                schedulerService.resumeSchedule(scheduleId)
                testScheduleRepository.findById(scheduleId).get().toResponse()
            }
            .orElse(null)
    }
}
