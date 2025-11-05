# Property Management Service

## Overview

The Property Management Service is a comprehensive Spring Boot microservice that handles all property-related operations for the Landlord Management System. It provides RESTful APIs for property management, unit management, image handling, and search functionality.

## Features

### Core Functionality
- **Property CRUD Operations**: Create, read, update, delete properties
- **Property Units Management**: Multi-unit property support with individual unit tracking
- **Image Management**: Property and unit image upload, storage, and retrieval via AWS S3
- **Advanced Search**: Filter properties by location, price, amenities, and specifications
- **Analytics**: Property statistics and occupancy rate calculations
- **Soft Delete**: Safe property and unit deletion with data retention

### Technical Features
- **Microservice Architecture**: Independent deployable service
- **Database Layer**: JPA repositories with PostgreSQL
- **File Storage**: AWS S3 integration with thumbnail generation
- **Caching**: Caffeine cache for improved performance
- **Validation**: Comprehensive input validation and error handling
- **Logging**: Structured logging with multiple appenders
- **Monitoring**: Health checks and metrics endpoints
- **Testing**: Unit and integration test coverage

## Architecture

### Technology Stack
- **Framework**: Spring Boot 3.1.5 with Java 17
- **Database**: PostgreSQL with JPA/Hibernate
- **Caching**: Caffeine Cache
- **File Storage**: AWS S3 with Transfer Manager
- **Image Processing**: Java ImageIO and imgscalr
- **Build Tool**: Maven
- **Testing**: JUnit 5, Mockito, TestContainers
- **Documentation**: OpenAPI/Swagger

### Service Structure
```
src/main/java/com/landlord/property/
├── controller/          # REST controllers
├── service/            # Business logic layer
├── repository/         # Data access layer
├── dto/               # Data transfer objects
├── mapper/            # Entity-DTO mappers
├── model/             # Entity models
├── exception/         # Custom exceptions
└── config/            # Configuration classes
```

## API Endpoints

### Property Management
```
POST   /api/v1/properties                    # Create property
GET    /api/v1/properties/{id}               # Get property details
PUT    /api/v1/properties/{id}               # Update property
DELETE /api/v1/properties/{id}               # Delete property
```

### Property Search
```
GET    /api/v1/properties/search             # Search properties with filters
GET    /api/v1/properties/owner/{id}         # Get properties by owner
GET    /api/v1/properties/my-properties      # Get current user properties
```

### Image Management
```
POST   /api/v1/properties/{id}/images        # Upload property image
DELETE /api/v1/properties/{id}/images/{imgId} # Delete property image
POST   /api/v1/properties/{id}/images/batch  # Batch upload images
```

### Unit Management
```
POST   /api/v1/properties/{id}/units         # Create unit
GET    /api/v1/properties/{id}/units/{unitId} # Get unit details
PUT    /api/v1/properties/{id}/units/{unitId} # Update unit
DELETE /api/v1/properties/{id}/units/{unitId} # Delete unit
GET    /api/v1/properties/{id}/units         # Get all units for property
```

### Analytics
```
GET    /api/v1/properties/owner/{id}/statistics # Get property statistics
GET    /api/v1/properties/my-statistics       # Get user property statistics
```

### Health and Info
```
GET    /api/v1/properties/health             # Service health check
GET    /api/v1/properties/info               # Service information
```

## Data Models

### Property Entity
```java
@Entity
@Table(name = "properties")
public class Property {
    private UUID id;
    private UUID ownerId;
    private String name;
    private String description;
    private PropertyType propertyType;
    private PropertyStatus status;
    private Address address;
    private PropertyDetails details;
    private BigDecimal listingPrice;
    private BigDecimal monthlyRent;
    private BigDecimal securityDeposit;
    private BigDecimal petDeposit;
    // ... additional fields
}
```

### Property Unit Entity
```java
@Entity
@Table(name = "property_units")
public class PropertyUnit {
    private String id;
    private String propertyId;
    private String unitNumber;
    private Integer floorNumber;
    private BigDecimal sqft;
    private Integer bedrooms;
    private BigDecimal bathrooms;
    private BigDecimal monthlyRent;
    private UnitStatus status;
    // ... additional fields
}
```

### Property Image Entity
```java
@Entity
@Table(name = "property_images")
public class PropertyImage {
    private String id;
    private String propertyId;
    private String unitId; // nullable
    private String imageUrl;
    private String thumbnailUrl;
    private ImageType imageType;
    private Integer displayOrder;
    private Boolean isPrimary;
    // ... additional fields
}
```

## Configuration

### Environment Variables
```bash
# Database Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=landlord_db
POSTGRES_USER=landlord_user
POSTGRES_PASSWORD=landlord_password

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis_password

# AWS S3 Configuration
AWS_S3_BUCKET=landlord-property-images
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# RabbitMQ Configuration
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest
```

### Application Properties
```properties
# Server Configuration
server.port=8080

# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/landlord_db
spring.jpa.hibernate.ddl-auto=validate

# AWS S3 Configuration
aws.s3.bucket-name=${AWS_S3_BUCKET:landlord-property-images}
aws.region=${AWS_REGION:us-east-1}

# File Upload Configuration
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=50MB
```

## Deployment

### Docker Build
```bash
# Build the service
mvn clean package

# Build Docker image
docker build -t property-service:1.0.0 .

# Run with Docker Compose
docker-compose up -d property-service
```

### Kubernetes Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: property-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: property-service
  template:
    metadata:
      labels:
        app: property-service
    spec:
      containers:
      - name: property-service
        image: property-service:1.0.0
        ports:
        - containerPort: 8080
        env:
        - name: POSTGRES_HOST
          value: postgres-service
        - name: REDIS_HOST
          value: redis-service
```

## Testing

### Running Tests
```bash
# Unit tests
mvn test

# Integration tests
mvn integration-test

# Test coverage
mvn test jacoco:report
```

### Test Structure
```
src/test/java/com/landlord/property/
├── service/           # Service layer tests
├── controller/        # Controller layer tests
├── repository/        # Repository layer tests
└── integration/       # Integration tests
```

### Mock Services
- **Database**: In-memory H2 for unit tests
- **AWS S3**: Mock implementation for file upload tests
- **Redis**: Embedded Redis for cache tests

## Error Handling

### Custom Exceptions
- `PropertyNotFoundException`: Property not found
- `PropertyUnitNotFoundException`: Unit not found
- `PropertyImageNotFoundException`: Image not found
- `UnauthorizedPropertyAccessException`: Access denied
- `InvalidPropertyDataException`: Invalid input data
- `FileUploadException`: File upload failures
- `DatabaseException`: Database operation failures

### Error Response Format
```json
{
  "timestamp": "2025-11-02T00:49:54.123",
  "status": 404,
  "error": "Property Not Found",
  "message": "Property with ID property-123 not found",
  "path": "/api/v1/properties/property-123"
}
```

### Validation Errors
```json
{
  "timestamp": "2025-11-02T00:49:54.123",
  "status": 400,
  "error": "Validation Failed",
  "message": "Input validation failed",
  "fieldErrors": {
    "name": "Property name is required",
    "monthlyRent": "Monthly rent must be positive"
  }
}
```

## Performance Optimizations

### Database Optimizations
- **Indexing**: Strategic indexes on frequently queried columns
- **Connection Pooling**: HikariCP with optimized settings
- **Query Optimization**: Efficient JPQL queries with proper joins

### Caching Strategy
- **Caffeine Cache**: In-memory caching for frequently accessed data
- **Cache Invalidation**: Automatic invalidation on data updates
- **Configurable TTL**: Different cache durations per data type

### File Storage Optimizations
- **AWS S3**: Scalable cloud storage
- **Thumbnail Generation**: Automatic image resizing
- **CDN Ready**: Public URLs for fast content delivery

## Security Features

### Data Validation
- **Input Validation**: Comprehensive validation on all inputs
- **SQL Injection Prevention**: Parameterized queries
- **XSS Prevention**: Input sanitization

### Access Control
- **Owner Verification**: All operations verify property ownership
- **Role-Based Access**: Extensible role-based authorization
- **Rate Limiting**: API rate limiting to prevent abuse

### Audit Logging
- **Activity Tracking**: All property operations logged
- **User Attribution**: Operations tracked by user
- **Retention Policy**: Configurable log retention

## Monitoring and Observability

### Health Checks
- **Database Health**: PostgreSQL connectivity check
- **Redis Health**: Cache service availability
- **S3 Health**: File storage accessibility

### Metrics
- **Request Metrics**: Response times, success rates
- **Database Metrics**: Connection pool, query performance
- **File Upload Metrics**: Upload success rates, file sizes

### Logging
- **Structured Logging**: JSON format for log aggregation
- **Multiple Log Levels**: Configurable logging per package
- **Log Rotation**: Automatic log file rotation and archival

## Development Guide

### Prerequisites
- Java 17+
- Maven 3.8+
- PostgreSQL 13+
- Redis 6+
- AWS S3 bucket (for file storage)

### Setup Instructions
1. Clone the repository
2. Configure environment variables
3. Set up database schema
4. Run tests: `mvn test`
5. Start service: `mvn spring-boot:run`

### Code Standards
- **Clean Code**: Follow SOLID principles
- **Documentation**: Comprehensive JavaDoc
- **Testing**: Minimum 80% code coverage
- **Version Control**: Conventional commits

### Contributing
1. Create feature branch
2. Implement changes with tests
3. Run full test suite
4. Update documentation
5. Submit pull request

## Troubleshooting

### Common Issues

**Database Connection Failures**
```bash
# Check PostgreSQL service
sudo systemctl status postgresql

# Verify connection
psql -h localhost -U landlord_user -d landlord_db
```

**Redis Connection Issues**
```bash
# Check Redis service
sudo systemctl status redis

# Test connection
redis-cli ping
```

**S3 Upload Failures**
- Verify AWS credentials
- Check bucket permissions
- Ensure correct region configuration

**High Memory Usage**
- Monitor JVM heap usage
- Adjust connection pool size
- Configure cache limits

### Debug Mode
```bash
# Enable debug logging
export LOGGING_LEVEL_COM_LANDLORD_PROPERTY=DEBUG

# Run with verbose output
mvn spring-boot:run --debug
```

## License

This service is part of the Landlord Management System and is proprietary software.

## Support

For technical support and questions:
- Create an issue in the project repository
- Contact the development team
- Check the documentation wiki

---

**Version**: 1.0.0  
**Last Updated**: 2025-11-02  
**Author**: MiniMax Agent