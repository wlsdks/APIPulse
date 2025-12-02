package com.apipulse.dto.mapper

import com.apipulse.dto.response.ScheduleResponse
import com.apipulse.model.TestSchedule

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
