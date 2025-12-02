package com.apipulse

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.scheduling.annotation.EnableScheduling

@SpringBootApplication
@EnableScheduling
class ApiPulseApplication

fun main(args: Array<String>) {
    runApplication<ApiPulseApplication>(*args)
}
