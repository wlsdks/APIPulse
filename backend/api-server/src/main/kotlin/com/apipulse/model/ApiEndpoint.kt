package com.apipulse.model

import jakarta.persistence.*
import java.time.Instant

@Entity
@Table(name = "api_endpoints")
data class ApiEndpoint(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: String? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    var project: Project,

    @Column(nullable = false)
    var path: String,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var method: HttpMethod,

    @Column(length = 500)
    var summary: String? = null,

    @Column(length = 2000)
    var description: String? = null,

    @Column(columnDefinition = "TEXT")
    var requestBodySchema: String? = null,

    @Column(length = 100)
    var requestContentType: String? = null,

    @Column(columnDefinition = "TEXT")
    var sampleRequestBody: String? = null,

    @Column(columnDefinition = "TEXT")
    var queryParams: String? = null,

    @Column(columnDefinition = "TEXT")
    var pathParams: String? = null,

    @Column(columnDefinition = "TEXT")
    var headers: String? = null,

    @Column
    var expectedStatusCode: Int = 200,

    @Column(nullable = false)
    var enabled: Boolean = true,

    @Column(nullable = false)
    var createdAt: Instant = Instant.now(),

    @Column(nullable = false)
    var updatedAt: Instant = Instant.now(),

    @OneToMany(mappedBy = "endpoint", cascade = [CascadeType.ALL], orphanRemoval = true)
    var testResults: MutableList<TestResult> = mutableListOf()
)
