package com.apipulse.service.scheduler

import com.apipulse.model.TestSchedule
import com.apipulse.model.TestStatus
import com.apipulse.model.TriggerType
import com.apipulse.repository.ProjectRepository
import com.apipulse.repository.TestScheduleRepository
import com.apipulse.service.notifier.NotificationService
import com.apipulse.service.tester.ApiTesterService
import jakarta.annotation.PostConstruct
import kotlinx.coroutines.runBlocking
import org.quartz.*
import org.quartz.impl.StdSchedulerFactory
import org.slf4j.LoggerFactory
import org.springframework.context.ApplicationContext
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.*

@Service
class SchedulerService(
    private val testScheduleRepository: TestScheduleRepository,
    private val projectRepository: ProjectRepository,
    private val apiTesterService: ApiTesterService,
    private val notificationService: NotificationService,
    private val applicationContext: ApplicationContext
) {
    private val logger = LoggerFactory.getLogger(javaClass)
    private lateinit var scheduler: Scheduler

    @PostConstruct
    fun init() {
        scheduler = StdSchedulerFactory.getDefaultScheduler()
        scheduler.context["applicationContext"] = applicationContext
        scheduler.start()

        // Load existing schedules
        loadSchedules()
    }

    fun loadSchedules() {
        val schedules = testScheduleRepository.findByEnabledTrue()
        schedules.forEach { schedule ->
            try {
                scheduleJob(schedule)
            } catch (e: Exception) {
                logger.error("Failed to schedule job for ${schedule.name}", e)
            }
        }
        logger.info("Loaded ${schedules.size} schedules")
    }

    @Transactional
    fun createSchedule(schedule: TestSchedule): TestSchedule {
        val saved = testScheduleRepository.save(schedule)
        scheduleJob(saved)
        return saved
    }

    @Transactional
    fun updateSchedule(schedule: TestSchedule): TestSchedule {
        // Remove old job
        val jobKey = JobKey.jobKey("test-${schedule.id}", "api-pulse")
        scheduler.deleteJob(jobKey)

        val saved = testScheduleRepository.save(schedule)

        if (saved.enabled) {
            scheduleJob(saved)
        }

        return saved
    }

    @Transactional
    fun deleteSchedule(scheduleId: String) {
        val jobKey = JobKey.jobKey("test-$scheduleId", "api-pulse")
        scheduler.deleteJob(jobKey)
        testScheduleRepository.deleteById(scheduleId)
    }

    fun pauseSchedule(scheduleId: String) {
        val jobKey = JobKey.jobKey("test-$scheduleId", "api-pulse")
        scheduler.pauseJob(jobKey)

        testScheduleRepository.findById(scheduleId).ifPresent { schedule ->
            schedule.enabled = false
            testScheduleRepository.save(schedule)
        }
    }

    fun resumeSchedule(scheduleId: String) {
        testScheduleRepository.findById(scheduleId).ifPresent { schedule ->
            schedule.enabled = true
            testScheduleRepository.save(schedule)
            scheduleJob(schedule)
        }
    }

    private fun scheduleJob(schedule: TestSchedule) {
        val jobKey = JobKey.jobKey("test-${schedule.id}", "api-pulse")
        val triggerKey = TriggerKey.triggerKey("trigger-${schedule.id}", "api-pulse")

        // Remove existing job if any
        if (scheduler.checkExists(jobKey)) {
            scheduler.deleteJob(jobKey)
        }

        val jobDataMap = JobDataMap().apply {
            put("scheduleId", schedule.id)
            put("projectId", schedule.project.id)
        }

        val job = JobBuilder.newJob(ApiTestJob::class.java)
            .withIdentity(jobKey)
            .usingJobData(jobDataMap)
            .build()

        val trigger = TriggerBuilder.newTrigger()
            .withIdentity(triggerKey)
            .withSchedule(CronScheduleBuilder.cronSchedule(schedule.cronExpression))
            .build()

        scheduler.scheduleJob(job, trigger)

        // Update next run time
        val nextFireTime = trigger.nextFireTime
        schedule.nextRunAt = nextFireTime?.toInstant()
        testScheduleRepository.save(schedule)

        logger.info("Scheduled job ${schedule.name} with cron: ${schedule.cronExpression}")
    }

    @Scheduled(fixedRate = 60000) // Check every minute for manual trigger updates
    fun updateNextRunTimes() {
        testScheduleRepository.findByEnabledTrue().forEach { schedule ->
            val triggerKey = TriggerKey.triggerKey("trigger-${schedule.id}", "api-pulse")
            try {
                val trigger = scheduler.getTrigger(triggerKey)
                trigger?.nextFireTime?.let { nextFire ->
                    schedule.nextRunAt = nextFire.toInstant()
                    testScheduleRepository.save(schedule)
                }
            } catch (e: Exception) {
                // Trigger might not exist yet
            }
        }
    }
}

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

                // Update schedule status
                testScheduleRepository.findById(scheduleId).ifPresent { schedule ->
                    schedule.lastRunAt = Instant.now()
                    schedule.lastRunStatus = if (result.failedCount > 0) TestStatus.FAILED else TestStatus.SUCCESS
                    testScheduleRepository.save(schedule)
                }

                // Send notifications
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
