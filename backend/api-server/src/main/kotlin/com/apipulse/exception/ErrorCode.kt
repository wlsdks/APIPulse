package com.apipulse.exception

import org.springframework.http.HttpStatus

enum class ErrorCode(
    val status: HttpStatus,
    val code: String,
    val messageEn: String,
    val messageKo: String
) {
    // Common errors (1xxx)
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "E1000", "Internal server error", "서버 내부 오류가 발생했습니다"),
    INVALID_REQUEST(HttpStatus.BAD_REQUEST, "E1001", "Invalid request", "잘못된 요청입니다"),
    RESOURCE_NOT_FOUND(HttpStatus.NOT_FOUND, "E1002", "Resource not found", "리소스를 찾을 수 없습니다"),
    VALIDATION_FAILED(HttpStatus.BAD_REQUEST, "E1003", "Validation failed", "유효성 검사에 실패했습니다"),

    // Project errors (2xxx)
    PROJECT_NOT_FOUND(HttpStatus.NOT_FOUND, "E2001", "Project not found", "프로젝트를 찾을 수 없습니다"),
    PROJECT_ALREADY_EXISTS(HttpStatus.CONFLICT, "E2002", "Project already exists", "이미 존재하는 프로젝트입니다"),
    PROJECT_SWAGGER_URL_REQUIRED(HttpStatus.BAD_REQUEST, "E2003", "Swagger URL is required for sync", "동기화를 위해 Swagger URL이 필요합니다"),
    PROJECT_SWAGGER_FETCH_FAILED(HttpStatus.BAD_REQUEST, "E2004", "Failed to fetch Swagger specification", "Swagger 스펙을 가져오는데 실패했습니다"),

    // Endpoint errors (3xxx)
    ENDPOINT_NOT_FOUND(HttpStatus.NOT_FOUND, "E3001", "Endpoint not found", "엔드포인트를 찾을 수 없습니다"),
    ENDPOINT_ALREADY_EXISTS(HttpStatus.CONFLICT, "E3002", "Endpoint already exists", "이미 존재하는 엔드포인트입니다"),
    ENDPOINT_TEST_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "E3003", "Endpoint test failed", "엔드포인트 테스트에 실패했습니다"),

    // Schedule errors (4xxx)
    SCHEDULE_NOT_FOUND(HttpStatus.NOT_FOUND, "E4001", "Schedule not found", "스케줄을 찾을 수 없습니다"),
    SCHEDULE_INVALID_CRON(HttpStatus.BAD_REQUEST, "E4002", "Invalid cron expression", "잘못된 Cron 표현식입니다"),
    SCHEDULE_ALREADY_PAUSED(HttpStatus.BAD_REQUEST, "E4003", "Schedule is already paused", "스케줄이 이미 일시정지 상태입니다"),
    SCHEDULE_ALREADY_ACTIVE(HttpStatus.BAD_REQUEST, "E4004", "Schedule is already active", "스케줄이 이미 활성 상태입니다"),

    // Notification errors (5xxx)
    NOTIFICATION_NOT_FOUND(HttpStatus.NOT_FOUND, "E5001", "Notification not found", "알림 설정을 찾을 수 없습니다"),
    NOTIFICATION_SEND_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "E5002", "Failed to send notification", "알림 전송에 실패했습니다"),
    NOTIFICATION_INVALID_WEBHOOK(HttpStatus.BAD_REQUEST, "E5003", "Invalid webhook URL", "잘못된 웹훅 URL입니다"),

    // Test errors (6xxx)
    TEST_NO_ENDPOINTS(HttpStatus.BAD_REQUEST, "E6001", "No endpoints to test", "테스트할 엔드포인트가 없습니다"),
    TEST_EXECUTION_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "E6002", "Test execution failed", "테스트 실행에 실패했습니다"),
    TEST_TIMEOUT(HttpStatus.REQUEST_TIMEOUT, "E6003", "Test timed out", "테스트 시간이 초과되었습니다"),

    // Database errors (7xxx)
    DATABASE_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "E7001", "Database error occurred", "데이터베이스 오류가 발생했습니다"),
    DATABASE_LOCKED(HttpStatus.SERVICE_UNAVAILABLE, "E7002", "Database is temporarily locked", "데이터베이스가 일시적으로 잠겨 있습니다");

    fun getMessage(language: String = "en"): String {
        return if (language == "ko") messageKo else messageEn
    }
}
