package com.apipulse.service.dashboard

import com.apipulse.dto.response.DashboardOverview
import com.apipulse.dto.response.HealthCheck

interface DashboardService {
    fun getOverview(): DashboardOverview
    fun getHealthStatus(): HealthCheck
}
