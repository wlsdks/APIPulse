package com.apipulse.controller

import com.apipulse.dto.response.DashboardOverview
import com.apipulse.dto.response.HealthCheck
import com.apipulse.service.dashboard.DashboardService
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/dashboard")
class DashboardController(
    private val dashboardService: DashboardService
) {

    @GetMapping("/overview")
    fun getOverview(): DashboardOverview {
        return dashboardService.getOverview()
    }

    @GetMapping("/health")
    fun getHealthStatus(): HealthCheck {
        return dashboardService.getHealthStatus()
    }
}
