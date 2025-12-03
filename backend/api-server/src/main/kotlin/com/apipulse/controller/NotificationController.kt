package com.apipulse.controller

import com.apipulse.dto.request.CreateNotificationRequest
import com.apipulse.dto.request.UpdateNotificationRequest
import com.apipulse.dto.response.NotificationConfigResponse
import com.apipulse.service.notification.NotificationConfigService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/notifications")
class NotificationController(
    private val notificationConfigService: NotificationConfigService
) {

    @GetMapping
    fun getAllNotifications(): List<NotificationConfigResponse> {
        return notificationConfigService.getAllNotifications()
    }

    @GetMapping("/{id}")
    fun getNotification(@PathVariable id: String): ResponseEntity<NotificationConfigResponse> {
        return notificationConfigService.getNotification(id)
            ?.let { ResponseEntity.ok(it) }
            ?: ResponseEntity.notFound().build()
    }

    @PostMapping
    fun createNotification(
        @Valid @RequestBody request: CreateNotificationRequest
    ): ResponseEntity<NotificationConfigResponse> {
        val response = notificationConfigService.createNotification(request)
        return ResponseEntity.status(HttpStatus.CREATED).body(response)
    }

    @PutMapping("/{id}")
    fun updateNotification(
        @PathVariable id: String,
        @Valid @RequestBody request: UpdateNotificationRequest
    ): ResponseEntity<NotificationConfigResponse> {
        return notificationConfigService.updateNotification(id, request)
            ?.let { ResponseEntity.ok(it) }
            ?: ResponseEntity.notFound().build()
    }

    @DeleteMapping("/{id}")
    fun deleteNotification(@PathVariable id: String): ResponseEntity<Void> {
        return if (notificationConfigService.deleteNotification(id)) {
            ResponseEntity.noContent().build()
        } else {
            ResponseEntity.notFound().build()
        }
    }

    @PostMapping("/{id}/test")
    fun testNotification(@PathVariable id: String): ResponseEntity<Map<String, String>> {
        return notificationConfigService.testNotification(id)
            ?.let { ResponseEntity.ok(mapOf("message" to it)) }
            ?: ResponseEntity.notFound().build()
    }
}
