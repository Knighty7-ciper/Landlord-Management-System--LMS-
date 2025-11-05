# Multi-stage build for Java Spring Boot Property Service
FROM maven:3.9-eclipse-temurin-17 AS builder

# Set working directory
WORKDIR /app

# Copy Maven configuration files
COPY pom.xml .
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests

# Runtime stage with JRE
FROM eclipse-temurin:17-jre-alpine AS production

# Create non-root user for security
RUN addgroup -g 1001 spring && \
    adduser -D -s /bin/sh -u 1001 spring

WORKDIR /app

# Copy JAR from builder stage
COPY --from=builder /app/target/*.jar app.jar

# Set ownership
RUN chown -R spring:spring /app
USER spring

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# Expose port
EXPOSE 8080

# JVM tuning for production
ENV JAVA_OPTS="-Xms512m -Xmx1g -XX:+UseG1GC -XX:+UseContainerSupport -Djava.security.egd=file:/dev/./urandom"

# Start application
CMD ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]

# Labels for metadata
LABEL maintainer="MiniMax Agent" \
      version="1.0.0" \
      description="Property Management Service for Landlord Management System" \
      technology="Java, Spring Boot, PostgreSQL"

# Development stage
FROM maven:3.9-eclipse-temurin-17 AS development

WORKDIR /app

# Copy source code and dependencies
COPY pom.xml .
COPY src ./src

# Development command with hot reload
CMD ["mvn", "spring-boot:run", "-Dspring-boot.run.profiles=dev"]