package com.apipulse.model

import jakarta.persistence.*
import java.time.Instant

@Entity
@Table(name = "test_schedules")
data class TestSchedule(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: String? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    var project: Project,

    @Column(nullable = false)
    var name: String,

    @Column(nullable = false)
    var cronExpression: String,

    @Column(nullable = false)
    var enabled: Boolean = true,

    @Column
    var lastRunAt: Instant? = null,

    @Column
    var nextRunAt: Instant? = null,

    @Enumerated(EnumType.STRING)
    var lastRunStatus: TestStatus? = null,

    @Column(nullable = false)
    var notifyOnFailure: Boolean = true,

    @Column(nullable = false)
    var notifyOnSuccess: Boolean = false,

    @Column(nullable = false)
    var createdAt: Instant = Instant.now(),

    @Column(nullable = false)
    var updatedAt: Instant = Instant.now()
)
