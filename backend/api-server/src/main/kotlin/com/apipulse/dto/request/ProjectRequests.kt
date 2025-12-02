package com.apipulse.dto.request

import com.apipulse.model.AuthType
import jakarta.validation.constraints.NotBlank

data class CreateProjectRequest(
    @field:NotBlank(message = "Project name is required")
    val name: String,

    @field:NotBlank(message = "Base URL is required")
    val baseUrl: String,

    val description: String? = null,
    val swaggerUrl: String? = null,
    val authType: AuthType = AuthType.NONE,
    val authValue: String? = null,
    val headerName: String? = null
)

data class UpdateProjectRequest(
    val name: String? = null,
    val baseUrl: String? = null,
    val description: String? = null,
    val swaggerUrl: String? = null,
    val authType: AuthType? = null,
    val authValue: String? = null,
    val headerName: String? = null,
    val enabled: Boolean? = null
)
