package com.apipulse.service.schedule

import com.apipulse.dto.request.CreateScheduleRequest
import com.apipulse.dto.request.UpdateScheduleRequest
import com.apipulse.dto.response.ScheduleResponse

interface ScheduleService {
    fun getSchedules(projectId: String): List<ScheduleResponse>?
    fun getSchedule(projectId: String, scheduleId: String): ScheduleResponse?
    fun createSchedule(projectId: String, request: CreateScheduleRequest): ScheduleResponse?
    fun updateSchedule(projectId: String, scheduleId: String, request: UpdateScheduleRequest): ScheduleResponse?
    fun deleteSchedule(projectId: String, scheduleId: String): Boolean
    fun pauseSchedule(projectId: String, scheduleId: String): ScheduleResponse?
    fun resumeSchedule(projectId: String, scheduleId: String): ScheduleResponse?
}
