package com.apipulse.service.notification

import com.apipulse.dto.request.CreateNotificationRequest
import com.apipulse.dto.request.UpdateNotificationRequest
import com.apipulse.dto.response.NotificationConfigResponse

interface NotificationConfigService {
    fun getAllNotifications(): List<NotificationConfigResponse>
    fun getNotification(id: String): NotificationConfigResponse?
    fun createNotification(request: CreateNotificationRequest): NotificationConfigResponse
    fun updateNotification(id: String, request: UpdateNotificationRequest): NotificationConfigResponse?
    fun deleteNotification(id: String): Boolean
    fun testNotification(id: String): String?
}
