package com.apipulse.exception

import java.time.Instant

data class ErrorResponse(
    val code: String,
    val message: String,
    val status: Int,
    val timestamp: Instant = Instant.now(),
    val details: Map<String, Any>? = null
)
