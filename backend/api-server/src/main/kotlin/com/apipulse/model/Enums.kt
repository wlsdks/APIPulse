package com.apipulse.model

enum class AuthType {
    NONE,
    BEARER_TOKEN,
    API_KEY,
    BASIC_AUTH
}

enum class HttpMethod {
    GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS
}

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

enum class NotificationType {
    SLACK,
    DISCORD,
    EMAIL
}
