package com.apipulse.exception

import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import org.springframework.web.context.request.WebRequest

@RestControllerAdvice
class GlobalExceptionHandler {

    private val logger = LoggerFactory.getLogger(GlobalExceptionHandler::class.java)

    @ExceptionHandler(ApiException::class)
    fun handleApiException(ex: ApiException, request: WebRequest): ResponseEntity<ErrorResponse> {
        val language = request.getHeader("Accept-Language")?.let {
            if (it.startsWith("ko")) "ko" else "en"
        } ?: "en"

        logger.warn("API Exception: ${ex.errorCode.code} - ${ex.message}", ex)

        val response = ex.toErrorResponse(language)
        return ResponseEntity.status(ex.errorCode.status).body(response)
    }

    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidationException(
        ex: MethodArgumentNotValidException,
        request: WebRequest
    ): ResponseEntity<ErrorResponse> {
        val language = request.getHeader("Accept-Language")?.let {
            if (it.startsWith("ko")) "ko" else "en"
        } ?: "en"

        val errors = ex.bindingResult.fieldErrors.associate {
            it.field to (it.defaultMessage ?: "Invalid value")
        }

        val errorCode = ErrorCode.VALIDATION_FAILED
        val response = ErrorResponse(
            code = errorCode.code,
            message = errorCode.getMessage(language),
            status = errorCode.status.value(),
            details = errors
        )

        logger.warn("Validation failed: $errors")
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response)
    }

    @ExceptionHandler(IllegalArgumentException::class)
    fun handleIllegalArgumentException(
        ex: IllegalArgumentException,
        request: WebRequest
    ): ResponseEntity<ErrorResponse> {
        val language = request.getHeader("Accept-Language")?.let {
            if (it.startsWith("ko")) "ko" else "en"
        } ?: "en"

        val errorCode = ErrorCode.INVALID_REQUEST
        val response = ErrorResponse(
            code = errorCode.code,
            message = ex.message ?: errorCode.getMessage(language),
            status = errorCode.status.value()
        )

        logger.warn("Invalid argument: ${ex.message}", ex)
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response)
    }

    @ExceptionHandler(Exception::class)
    fun handleGenericException(ex: Exception, request: WebRequest): ResponseEntity<ErrorResponse> {
        val language = request.getHeader("Accept-Language")?.let {
            if (it.startsWith("ko")) "ko" else "en"
        } ?: "en"

        val errorCode = ErrorCode.INTERNAL_SERVER_ERROR
        val response = ErrorResponse(
            code = errorCode.code,
            message = errorCode.getMessage(language),
            status = errorCode.status.value()
        )

        logger.error("Unexpected error occurred", ex)
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response)
    }
}
