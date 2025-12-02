package com.apipulse.service.notification

import com.apipulse.dto.mapper.toResponse
import com.apipulse.dto.request.CreateNotificationRequest
import com.apipulse.dto.request.UpdateNotificationRequest
import com.apipulse.dto.response.NotificationConfigResponse
import com.apipulse.model.NotificationConfig
import com.apipulse.repository.NotificationConfigRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant

@Service
@Transactional(readOnly = true)
class NotificationConfigServiceImpl(
    private val notificationConfigRepository: NotificationConfigRepository
) : NotificationConfigService {

    override fun getAllNotifications(): List<NotificationConfigResponse> {
        return notificationConfigRepository.findAll().map { it.toResponse() }
    }

    override fun getNotification(id: String): NotificationConfigResponse? {
        return notificationConfigRepository.findById(id)
            .map { it.toResponse() }
            .orElse(null)
    }

    @Transactional
    override fun createNotification(request: CreateNotificationRequest): NotificationConfigResponse {
        val config = NotificationConfig(
            name = request.name,
            type = request.type,
            webhookUrl = request.webhookUrl,
            emailRecipients = request.emailRecipients,
            notifyOnFailure = request.notifyOnFailure ?: true,
            notifyOnRecovery = request.notifyOnRecovery ?: true
        )

        return notificationConfigRepository.save(config).toResponse()
    }

    @Transactional
    override fun updateNotification(id: String, request: UpdateNotificationRequest): NotificationConfigResponse? {
        return notificationConfigRepository.findById(id).map { config ->
            request.name?.let { config.name = it }
            request.type?.let { config.type = it }
            request.webhookUrl?.let { config.webhookUrl = it }
            request.emailRecipients?.let { config.emailRecipients = it }
            request.enabled?.let { config.enabled = it }
            request.notifyOnFailure?.let { config.notifyOnFailure = it }
            request.notifyOnRecovery?.let { config.notifyOnRecovery = it }
            config.updatedAt = Instant.now()

            notificationConfigRepository.save(config).toResponse()
        }.orElse(null)
    }

    @Transactional
    override fun deleteNotification(id: String): Boolean {
        return if (notificationConfigRepository.existsById(id)) {
            notificationConfigRepository.deleteById(id)
            true
        } else {
            false
        }
    }

    override fun testNotification(id: String): String? {
        return notificationConfigRepository.findById(id)
            .map { "Test notification sent to ${it.type.name}" }
            .orElse(null)
    }
}
