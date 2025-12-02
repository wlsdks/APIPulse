package com.apipulse.repository

import com.apipulse.model.NotificationConfig
import com.apipulse.model.NotificationType
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface NotificationConfigRepository : JpaRepository<NotificationConfig, String> {
    fun findByEnabledTrue(): List<NotificationConfig>
    fun findByType(type: NotificationType): List<NotificationConfig>
}
