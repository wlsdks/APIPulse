# Build stage
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app

# Copy gradle files
COPY gradle gradle
COPY gradlew .
COPY build.gradle.kts .
COPY settings.gradle.kts .

# Download dependencies
RUN chmod +x gradlew && ./gradlew dependencies --no-daemon

# Copy source code
COPY src src

# Build
RUN ./gradlew bootJar --no-daemon

# Runtime stage
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 apipulse && \
    adduser -u 1001 -G apipulse -D apipulse

# Copy built jar
COPY --from=builder /app/build/libs/*.jar app.jar

# Create data directory for SQLite
RUN mkdir -p /data && chown -R apipulse:apipulse /data

USER apipulse

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget -q --spider http://localhost:8080/api/dashboard/health || exit 1

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
