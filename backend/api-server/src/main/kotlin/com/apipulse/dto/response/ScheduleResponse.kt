package com.apipulse.dto.response

import com.apipulse.model.TestStatus
import java.time.Instant

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
