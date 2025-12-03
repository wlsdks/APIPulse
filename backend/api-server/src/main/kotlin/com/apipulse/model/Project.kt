package com.apipulse.model

import jakarta.persistence.*
import java.time.Instant

@Entity
@Table(name = "projects")
data class Project(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: String? = null,

    @Column(nullable = false)
    var name: String,

    @Column(nullable = false)
    var baseUrl: String,

    @Column(length = 1000)
    var description: String? = null,

    @ElementCollection
    @CollectionTable(name = "project_swagger_urls", joinColumns = [JoinColumn(name = "project_id")])
    @Column(name = "swagger_url")
    var swaggerUrls: MutableList<String> = mutableListOf(),

    @Enumerated(EnumType.STRING)
    var authType: AuthType = AuthType.NONE,

    @Column(length = 2000)
    var authValue: String? = null,

    @Column
    var headerName: String? = null,

    @Column(nullable = false)
    var enabled: Boolean = true,

    @Column(nullable = false)
    var createdAt: Instant = Instant.now(),

    @Column(nullable = false)
    var updatedAt: Instant = Instant.now(),

    @OneToMany(mappedBy = "project", cascade = [CascadeType.ALL], orphanRemoval = true)
    var endpoints: MutableList<ApiEndpoint> = mutableListOf(),

    @OneToMany(mappedBy = "project", cascade = [CascadeType.ALL], orphanRemoval = true)
    var schedules: MutableList<TestSchedule> = mutableListOf()
)
