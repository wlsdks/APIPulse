package com.apipulse.exception

open class ApiException(
    val errorCode: ErrorCode,
    override val message: String? = null,
    override val cause: Throwable? = null
) : RuntimeException(message ?: errorCode.messageEn, cause) {

    fun toErrorResponse(language: String = "en"): ErrorResponse {
        return ErrorResponse(
            code = errorCode.code,
            message = message ?: errorCode.getMessage(language),
            status = errorCode.status.value()
        )
    }
}

// Specific exception classes
class ProjectNotFoundException(projectId: String) : ApiException(
    ErrorCode.PROJECT_NOT_FOUND,
    "Project not found: $projectId"
)

class ProjectSwaggerUrlRequiredException : ApiException(
    ErrorCode.PROJECT_SWAGGER_URL_REQUIRED
)

class ProjectSwaggerFetchFailedException(message: String? = null) : ApiException(
    ErrorCode.PROJECT_SWAGGER_FETCH_FAILED,
    message
)

class EndpointNotFoundException(endpointId: String) : ApiException(
    ErrorCode.ENDPOINT_NOT_FOUND,
    "Endpoint not found: $endpointId"
)

class EndpointTestFailedException(message: String? = null, cause: Throwable? = null) : ApiException(
    ErrorCode.ENDPOINT_TEST_FAILED,
    message,
    cause
)

class ScheduleNotFoundException(scheduleId: String) : ApiException(
    ErrorCode.SCHEDULE_NOT_FOUND,
    "Schedule not found: $scheduleId"
)

class InvalidCronExpressionException(cron: String) : ApiException(
    ErrorCode.SCHEDULE_INVALID_CRON,
    "Invalid cron expression: $cron"
)

class NotificationNotFoundException(notificationId: String) : ApiException(
    ErrorCode.NOTIFICATION_NOT_FOUND,
    "Notification not found: $notificationId"
)

class NotificationSendFailedException(message: String? = null, cause: Throwable? = null) : ApiException(
    ErrorCode.NOTIFICATION_SEND_FAILED,
    message,
    cause
)

class NoEndpointsToTestException(projectId: String) : ApiException(
    ErrorCode.TEST_NO_ENDPOINTS,
    "No endpoints to test for project: $projectId"
)

class TestExecutionFailedException(message: String? = null, cause: Throwable? = null) : ApiException(
    ErrorCode.TEST_EXECUTION_FAILED,
    message,
    cause
)

class DatabaseLockedException : ApiException(
    ErrorCode.DATABASE_LOCKED
)
