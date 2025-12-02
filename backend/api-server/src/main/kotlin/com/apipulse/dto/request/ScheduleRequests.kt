package com.apipulse.dto.request

import jakarta.validation.constraints.NotBlank

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
