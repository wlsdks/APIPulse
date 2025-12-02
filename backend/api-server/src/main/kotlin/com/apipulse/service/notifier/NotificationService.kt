package com.apipulse.service.notifier

import com.apipulse.model.*
import com.apipulse.repository.NotificationConfigRepository
import com.apipulse.service.tester.ProjectTestResult
import com.fasterxml.jackson.databind.ObjectMapper
import org.slf4j.LoggerFactory
import org.springframework.mail.SimpleMailMessage
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClient
import reactor.core.publisher.Mono
import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter

@Service
class NotificationService(
    private val notificationConfigRepository: NotificationConfigRepository,
    private val webClient: WebClient,
    private val mailSender: JavaMailSender?,
    private val objectMapper: ObjectMapper
) {
    private val logger = LoggerFactory.getLogger(javaClass)
    private val dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
        .withZone(ZoneId.systemDefault())

    fun notifyTestResults(projectName: String, result: ProjectTestResult) {
        val configs = notificationConfigRepository.findByEnabledTrue()

        val hasFailures = result.failedCount > 0
        val failedEndpoints = result.results.filter {
            it.status == TestStatus.FAILED || it.status == TestStatus.ERROR || it.status == TestStatus.TIMEOUT
        }

        configs.forEach { config ->
            val shouldNotify = when {
                hasFailures && config.notifyOnFailure -> true
                !hasFailures && config.notifyOnRecovery -> true
                else -> false
            }

            if (shouldNotify) {
                try {
                    when (config.type) {
                        NotificationType.SLACK -> sendSlackNotification(config, projectName, result, failedEndpoints)
                        NotificationType.DISCORD -> sendDiscordNotification(config, projectName, result, failedEndpoints)
                        NotificationType.EMAIL -> sendEmailNotification(config, projectName, result, failedEndpoints)
                    }
                } catch (e: Exception) {
                    logger.error("Failed to send ${config.type} notification", e)
                }
            }
        }
    }

    private fun sendSlackNotification(
        config: NotificationConfig,
        projectName: String,
        result: ProjectTestResult,
        failedEndpoints: List<TestResult>
    ) {
        val webhookUrl = config.webhookUrl ?: return

        val color = if (result.failedCount > 0) "#FF0000" else "#36A64F"
        val emoji = if (result.failedCount > 0) ":x:" else ":white_check_mark:"

        val failedDetails = if (failedEndpoints.isNotEmpty()) {
            failedEndpoints.take(5).joinToString("\n") { r ->
                "• `${r.endpoint.method} ${r.endpoint.path}` - ${r.status} (${r.statusCode})"
            }
        } else ""

        val payload = mapOf(
            "attachments" to listOf(
                mapOf(
                    "color" to color,
                    "blocks" to listOf(
                        mapOf(
                            "type" to "header",
                            "text" to mapOf(
                                "type" to "plain_text",
                                "text" to "$emoji API Pulse: $projectName",
                                "emoji" to true
                            )
                        ),
                        mapOf(
                            "type" to "section",
                            "fields" to listOf(
                                mapOf("type" to "mrkdwn", "text" to "*Total APIs:*\n${result.totalCount}"),
                                mapOf("type" to "mrkdwn", "text" to "*Success Rate:*\n${"%.1f".format(result.successRate)}%"),
                                mapOf("type" to "mrkdwn", "text" to "*Success:*\n${result.successCount}"),
                                mapOf("type" to "mrkdwn", "text" to "*Failed:*\n${result.failedCount}"),
                                mapOf("type" to "mrkdwn", "text" to "*Avg Response:*\n${result.averageResponseTimeMs}ms"),
                                mapOf("type" to "mrkdwn", "text" to "*Time:*\n${dateFormatter.format(Instant.now())}")
                            )
                        )
                    ) + if (failedDetails.isNotEmpty()) listOf(
                        mapOf(
                            "type" to "section",
                            "text" to mapOf(
                                "type" to "mrkdwn",
                                "text" to "*Failed Endpoints:*\n$failedDetails"
                            )
                        )
                    ) else emptyList()
                )
            )
        )

        sendWebhook(webhookUrl, payload)
    }

    private fun sendDiscordNotification(
        config: NotificationConfig,
        projectName: String,
        result: ProjectTestResult,
        failedEndpoints: List<TestResult>
    ) {
        val webhookUrl = config.webhookUrl ?: return

        val color = if (result.failedCount > 0) 0xFF0000 else 0x36A64F
        val emoji = if (result.failedCount > 0) "❌" else "✅"

        val failedDetails = if (failedEndpoints.isNotEmpty()) {
            failedEndpoints.take(5).joinToString("\n") { r ->
                "• `${r.endpoint.method} ${r.endpoint.path}` - ${r.status} (${r.statusCode})"
            }
        } else ""

        val fields = mutableListOf(
            mapOf("name" to "Total APIs", "value" to "${result.totalCount}", "inline" to true),
            mapOf("name" to "Success Rate", "value" to "${"%.1f".format(result.successRate)}%", "inline" to true),
            mapOf("name" to "Avg Response", "value" to "${result.averageResponseTimeMs}ms", "inline" to true),
            mapOf("name" to "Success", "value" to "${result.successCount}", "inline" to true),
            mapOf("name" to "Failed", "value" to "${result.failedCount}", "inline" to true)
        )

        if (failedDetails.isNotEmpty()) {
            fields.add(mapOf("name" to "Failed Endpoints", "value" to failedDetails, "inline" to false))
        }

        val payload = mapOf(
            "embeds" to listOf(
                mapOf(
                    "title" to "$emoji API Pulse: $projectName",
                    "color" to color,
                    "fields" to fields,
                    "footer" to mapOf("text" to "API Pulse"),
                    "timestamp" to Instant.now().toString()
                )
            )
        )

        sendWebhook(webhookUrl, payload)
    }

    private fun sendEmailNotification(
        config: NotificationConfig,
        projectName: String,
        result: ProjectTestResult,
        failedEndpoints: List<TestResult>
    ) {
        val recipients = config.emailRecipients?.split(",")?.map { it.trim() } ?: return
        if (mailSender == null) {
            logger.warn("Mail sender is not configured")
            return
        }

        val status = if (result.failedCount > 0) "FAILED" else "SUCCESS"
        val subject = "[API Pulse] $projectName - $status (${result.successRate.toInt()}% success)"

        val failedDetails = if (failedEndpoints.isNotEmpty()) {
            "\n\nFailed Endpoints:\n" + failedEndpoints.take(10).joinToString("\n") { r ->
                "  - ${r.endpoint.method} ${r.endpoint.path} - ${r.status} (${r.statusCode})"
            }
        } else ""

        val body = """
            |API Pulse Test Results for: $projectName
            |
            |Summary:
            |  - Total APIs: ${result.totalCount}
            |  - Success: ${result.successCount}
            |  - Failed: ${result.failedCount}
            |  - Success Rate: ${"%.1f".format(result.successRate)}%
            |  - Average Response Time: ${result.averageResponseTimeMs}ms
            |  - Executed At: ${dateFormatter.format(Instant.now())}
            |$failedDetails
            |
            |--
            |API Pulse - API Health Monitoring
        """.trimMargin()

        val message = SimpleMailMessage().apply {
            setTo(*recipients.toTypedArray())
            setSubject(subject)
            setText(body)
        }

        mailSender.send(message)
        logger.info("Email notification sent to ${recipients.size} recipients")
    }

    private fun sendWebhook(url: String, payload: Map<String, Any>) {
        webClient.post()
            .uri(url)
            .bodyValue(objectMapper.writeValueAsString(payload))
            .header("Content-Type", "application/json")
            .retrieve()
            .bodyToMono(String::class.java)
            .onErrorResume { e ->
                logger.error("Failed to send webhook: ${e.message}")
                Mono.empty()
            }
            .subscribe()
    }
}
