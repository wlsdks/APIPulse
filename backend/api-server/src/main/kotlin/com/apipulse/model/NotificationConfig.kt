package com.apipulse.model

import jakarta.persistence.*
import java.time.Instant

@Entity
@Table(name = "notification_configs")
data class NotificationConfig(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: String? = null,

    @Column(nullable = false)
    var name: String,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var type: NotificationType,

    @Column(nullable = false, length = 1000)
    var webhookUrl: String? = null,

    @Column(length = 500)
    var emailRecipients: String? = null,

    @Column(nullable = false)
    var enabled: Boolean = true,

    @Column(nullable = false)
    var notifyOnFailure: Boolean = true,

    @Column(nullable = false)
    var notifyOnRecovery: Boolean = true,

    @Column(nullable = false)
    var createdAt: Instant = Instant.now(),

    @Column(nullable = false)
    var updatedAt: Instant = Instant.now()
)
