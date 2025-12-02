package com.apipulse.service.scheduler

import com.apipulse.model.TestStatus
import com.apipulse.model.TriggerType
import com.apipulse.repository.ProjectRepository
import com.apipulse.repository.TestScheduleRepository
import com.apipulse.service.notifier.NotificationService
import com.apipulse.service.tester.ApiTesterService
import kotlinx.coroutines.runBlocking
import org.quartz.Job
import org.quartz.JobExecutionContext
import org.slf4j.LoggerFactory
import org.springframework.context.ApplicationContext
import java.time.Instant

class ApiTestJob : Job {
    private val logger = LoggerFactory.getLogger(javaClass)

    override fun execute(context: JobExecutionContext) {
        val scheduleId = context.mergedJobDataMap.getString("scheduleId")
        val projectId = context.mergedJobDataMap.getString("projectId")

        val applicationContext = context.scheduler.context["applicationContext"] as ApplicationContext
        val apiTesterService = applicationContext.getBean(ApiTesterService::class.java)
        val notificationService = applicationContext.getBean(NotificationService::class.java)
        val testScheduleRepository = applicationContext.getBean(TestScheduleRepository::class.java)
        val projectRepository = applicationContext.getBean(ProjectRepository::class.java)

        logger.info("Executing scheduled test for project: $projectId")

        runBlocking {
            try {
                val result = apiTesterService.testProject(projectId, TriggerType.SCHEDULED, scheduleId)

                testScheduleRepository.findById(scheduleId).ifPresent { schedule ->
                    schedule.lastRunAt = Instant.now()
                    schedule.lastRunStatus = if (result.failedCount > 0) TestStatus.FAILED else TestStatus.SUCCESS
                    testScheduleRepository.save(schedule)
                }

                val project = projectRepository.findById(projectId).orElse(null)
                project?.let {
                    notificationService.notifyTestResults(it.name, result)
                }

                logger.info("Scheduled test completed for project $projectId: ${result.successCount}/${result.totalCount} passed")

            } catch (e: Exception) {
                logger.error("Failed to execute scheduled test for project $projectId", e)

                testScheduleRepository.findById(scheduleId).ifPresent { schedule ->
                    schedule.lastRunAt = Instant.now()
                    schedule.lastRunStatus = TestStatus.ERROR
                    testScheduleRepository.save(schedule)
                }
            }
        }
    }
}
