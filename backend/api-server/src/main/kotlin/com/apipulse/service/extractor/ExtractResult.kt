package com.apipulse.service.extractor

data class ExtractResult(
    val newEndpoints: Int,
    val updatedEndpoints: Int,
    val errors: List<String>
) {
    val totalEndpoints: Int get() = newEndpoints + updatedEndpoints
    val hasErrors: Boolean get() = errors.isNotEmpty()
}
