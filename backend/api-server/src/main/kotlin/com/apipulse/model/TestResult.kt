package com.apipulse.model

import jakarta.persistence.*
import java.time.Instant

@Entity
@Table(name = "test_results")
data class TestResult(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: String? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "endpoint_id", nullable = false)
    var endpoint: ApiEndpoint,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var status: TestStatus,

    @Column(nullable = false)
    var statusCode: Int,

    @Column(nullable = false)
    var responseTimeMs: Long,

    @Column(columnDefinition = "TEXT")
    var responseBody: String? = null,

    @Column(columnDefinition = "TEXT")
    var errorMessage: String? = null,

    @Column(columnDefinition = "TEXT")
    var requestHeaders: String? = null,

    @Column(columnDefinition = "TEXT")
    var responseHeaders: String? = null,

    @Enumerated(EnumType.STRING)
    var triggerType: TriggerType = TriggerType.MANUAL,

    @Column
    var scheduleId: String? = null,

    @Column(nullable = false)
    var executedAt: Instant = Instant.now()
)

enum class TestStatus {
    SUCCESS,
    FAILED,
    ERROR,
    TIMEOUT
}

enum class TriggerType {
    MANUAL,
    SCHEDULED
}
