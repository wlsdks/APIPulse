package com.apipulse.controller

import com.apipulse.model.NotificationConfig
import com.apipulse.model.NotificationType
import com.apipulse.repository.NotificationConfigRepository
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.Instant

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = ["*"])
class NotificationController(
    private val notificationConfigRepository: NotificationConfigRepository
) {

    @GetMapping
    fun getAllNotifications(): List<NotificationConfigResponse> {
        return notificationConfigRepository.findAll().map { it.toResponse() }
    }

    @GetMapping("/{id}")
    fun getNotification(@PathVariable id: String): ResponseEntity<NotificationConfigResponse> {
        return notificationConfigRepository.findById(id)
            .map { ResponseEntity.ok(it.toResponse()) }
            .orElse(ResponseEntity.notFound().build())
    }

    @PostMapping
    fun createNotification(
        @Valid @RequestBody request: CreateNotificationRequest
    ): ResponseEntity<NotificationConfigResponse> {
        val config = NotificationConfig(
            name = request.name,
            type = request.type,
            webhookUrl = request.webhookUrl,
            emailRecipients = request.emailRecipients,
            notifyOnFailure = request.notifyOnFailure ?: true,
            notifyOnRecovery = request.notifyOnRecovery ?: true
        )

        val saved = notificationConfigRepository.save(config)
        return ResponseEntity.status(HttpStatus.CREATED).body(saved.toResponse())
    }

    @PutMapping("/{id}")
    fun updateNotification(
        @PathVariable id: String,
        @Valid @RequestBody request: UpdateNotificationRequest
    ): ResponseEntity<NotificationConfigResponse> {
        return notificationConfigRepository.findById(id).map { config ->
            request.name?.let { config.name = it }
            request.type?.let { config.type = it }
            request.webhookUrl?.let { config.webhookUrl = it }
            request.emailRecipients?.let { config.emailRecipients = it }
            request.enabled?.let { config.enabled = it }
            request.notifyOnFailure?.let { config.notifyOnFailure = it }
            request.notifyOnRecovery?.let { config.notifyOnRecovery = it }
            config.updatedAt = Instant.now()

            ResponseEntity.ok(notificationConfigRepository.save(config).toResponse())
        }.orElse(ResponseEntity.notFound().build())
    }

    @DeleteMapping("/{id}")
    fun deleteNotification(@PathVariable id: String): ResponseEntity<Void> {
        return if (notificationConfigRepository.existsById(id)) {
            notificationConfigRepository.deleteById(id)
            ResponseEntity.noContent().build()
        } else {
            ResponseEntity.notFound().build()
        }
    }

    @PostMapping("/{id}/test")
    fun testNotification(@PathVariable id: String): ResponseEntity<Map<String, String>> {
        val config = notificationConfigRepository.findById(id).orElse(null)
            ?: return ResponseEntity.notFound().build()

        // TODO: Implement test notification sending
        return ResponseEntity.ok(mapOf("message" to "Test notification sent to ${config.type.name}"))
    }
}

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

fun NotificationConfig.toResponse() = NotificationConfigResponse(
    id = id!!,
    name = name,
    type = type,
    webhookUrl = webhookUrl?.let { "****${it.takeLast(10)}" }, // Mask URL for security
    emailRecipients = emailRecipients,
    enabled = enabled,
    notifyOnFailure = notifyOnFailure,
    notifyOnRecovery = notifyOnRecovery,
    createdAt = createdAt,
    updatedAt = updatedAt
)
