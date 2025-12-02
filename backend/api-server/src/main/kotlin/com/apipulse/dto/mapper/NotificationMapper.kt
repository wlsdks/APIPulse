package com.apipulse.dto.mapper

import com.apipulse.dto.response.NotificationConfigResponse
import com.apipulse.model.NotificationConfig

fun NotificationConfig.toResponse() = NotificationConfigResponse(
    id = id!!,
    name = name,
    type = type,
    webhookUrl = webhookUrl?.let { "****${it.takeLast(10)}" },
    emailRecipients = emailRecipients,
    enabled = enabled,
    notifyOnFailure = notifyOnFailure,
    notifyOnRecovery = notifyOnRecovery,
    createdAt = createdAt,
    updatedAt = updatedAt
)
