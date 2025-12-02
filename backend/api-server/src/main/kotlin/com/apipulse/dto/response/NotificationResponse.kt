package com.apipulse.dto.response

import com.apipulse.model.NotificationType
import java.time.Instant

data class NotificationConfigResponse(
    val id: String,
    val name: String,
    val type: NotificationType,
    val webhookUrl: String?,
    val emailRecipients: String?,
    val enabled: Boolean,
    val notifyOnFailure: Boolean,
    val notifyOnRecovery: Boolean,
    val createdAt: Instant,
    val updatedAt: Instant
)
