package com.apipulse.dto.request

import com.apipulse.model.NotificationType
import jakarta.validation.constraints.NotBlank

data class CreateNotificationRequest(
    @field:NotBlank(message = "Name is required")
    val name: String,

    val type: NotificationType,
    val webhookUrl: String? = null,
    val emailRecipients: String? = null,
    val notifyOnFailure: Boolean? = null,
    val notifyOnRecovery: Boolean? = null
)

data class UpdateNotificationRequest(
    val name: String? = null,
    val type: NotificationType? = null,
    val webhookUrl: String? = null,
    val emailRecipients: String? = null,
    val enabled: Boolean? = null,
    val notifyOnFailure: Boolean? = null,
    val notifyOnRecovery: Boolean? = null
)
