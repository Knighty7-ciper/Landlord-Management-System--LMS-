# API Gateway for Landlord Management System

A comprehensive, production-ready API Gateway built with Node.js, Express, and TypeScript. This gateway provides advanced features including authentication, rate limiting, load balancing, caching, monitoring, and security.

## 🚀 Features

### Core Features
- **Service Routing**: Intelligent routing to backend services (Auth, Property, User)
- **Load Balancing**: Multiple load balancing strategies (Round Robin, Least Connections, Weighted, Response Time)
- **Health Checks**: Aggregated health monitoring from all backend services
- **Rate Limiting**: Advanced rate limiting with different limits per endpoint type
- **CORS Support**: Configurable CORS with origin whitelisting
- **Request/Response Transformation**: Automatic header and body transformation
- **Caching**: Redis-based caching with customizable TTL and cache keys
- **Metrics Collection**: Prometheus-compatible metrics for monitoring

### Security Features
- **JWT Authentication**: Token verification and user context propagation
- **RBAC Support**: Role-based access control middleware
- **Security Headers**: Comprehensive security headers (HSTS, CSP, etc.)
- **Request Logging**: Detailed audit logging with correlation IDs
- **Input Validation**: Request validation with express-validator
- **Error Handling**: Structured error responses with proper HTTP status codes

### Monitoring & Observability
- **Prometheus Metrics**: Built-in metrics collection
- **Structured Logging**: Winston-based logging with multiple levels
- **Health Monitoring**: Real-time service health status
- **Performance Tracking**: Response time and error rate monitoring
- **Tracing**: Request tracing with correlation IDs

### Advanced Features
- **Circuit Breaker**: Protect services from cascading failures
- **Retry Logic**: Automatic retry with exponential backoff
- **Cache Invalidation**: Smart cache invalidation strategies
- **API Versioning**: Support for multiple API versions
- **Graceful Shutdown**: Proper service shutdown handling

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client App    │────│   API Gateway   │────│   Auth Service  │
│  (React/Vue)    │    │   (Node.js)     │    │  (Node.js)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              │ Load Balancing
                              │
                    ┌─────────▼─────────┐
                    │  Property Service │
                    │    (Java)         │
                    └───────────────────┘
```

## 📋 Prerequisites

- Node.js 18+ 
- Redis 6+
- Backend services (Auth Service, Property Service)
- Environment variables configured

## 🛠️ Installation

1. **Clone and navigate to the API Gateway directory**
   ```bash
   cd services/api-gateway
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Build TypeScript**
   ```bash
   npm run build
   ```

5. **Start the service**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## ⚙️ Configuration

### Environment Variables

The API Gateway uses environment variables for configuration. See `.env.example` for all available options.

#### Required Configuration
```bash
# Service URLs
AUTH_SERVICE_URL=http://localhost:3001
PROPERTY_SERVICE_URL=http://localhost:8081

# JWT Configuration
JWT_SECRET=your-jwt-secret
JWT_EXPIRY=24h

# Redis Configuration
REDIS_URL=redis://localhost:6379

# CORS Origins
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

#### Optional Configuration
```bash
# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=1000

# Cache Configuration
CACHE_TTL=300
CACHE_MAX_SIZE=1000

# Logging
LOG_LEVEL=info
ENABLE_FILE_LOGGING=true

# Metrics
ENABLE_METRICS=true
METRICS_PATH=/metrics
```

## 🔧 Usage

### Starting the API Gateway

```bash
# Development mode with hot reload
npm run dev

# Production build
npm run build && npm start

# With custom port
API_GATEWAY_PORT=3000 npm run dev
```

### API Endpoints

The API Gateway provides the following endpoints:

#### System Endpoints
```
GET  /health              # Service health check
GET  /metrics             # Prometheus metrics
GET  /api/v1/info         # API information
```

#### Proxy Endpoints
```
# Authentication Service
POST /api/v1/auth/login
POST /api/v1/auth/register
GET  /api/v1/auth/profile

# Property Service
GET  /api/v1/properties
POST /api/v1/properties
GET  /api/v1/properties/:id

# User Management
GET  /api/v1/users
PUT  /api/v1/users/:id
```

### Request Headers

The API Gateway supports these custom headers:

```http
X-Correlation-ID: req_1234567890_abc123
Authorization: Bearer <jwt-token>
X-User-ID: user-uuid
X-User-Role: landlord
X-MFA-Verified: true
X-Cache-Refresh: true
```

### Response Headers

The API Gateway adds these headers to responses:

```http
X-Correlation-ID: req_1234567890_abc123
X-Cache: HIT|MISS
X-Rate-Limit-Remaining: 999
X-Rate-Limit-Reset: 1625097600
X-API-Version: 1.0.0
X-Gateway-Version: 1.0.0
```

## 🔒 Security Features

### Authentication

The API Gateway verifies JWT tokens and propagates user context:

```typescript
// Automatic user context extraction
const user = req.user; // Available after authentication middleware
const userId = user.id;
const userRole = user.role;
```

### Rate Limiting

Different rate limits for different endpoint types:

- **Global**: 1000 requests per 15 minutes per IP
- **Auth**: 10 requests per 15 minutes per IP  
- **Property**: 100 requests per minute per user
- **Upload**: 10 requests per hour per user

### CORS Configuration

Configurable CORS with origin whitelisting:

```javascript
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = ['https://yourapp.com'];
    callback(null, allowedOrigins.includes(origin));
  },
  credentials: true
};
```

## 📊 Monitoring

### Metrics Collection

The API Gateway exposes Prometheus-compatible metrics at `/metrics`:

```bash
# View metrics
curl http://localhost:8080/metrics

# Key metrics
api_gateway_requests_total{method="GET",route="/properties",status_code="200"}
api_gateway_http_request_duration_seconds{method="POST",route="/auth/login"}
api_gateway_service_health_status{service_name="auth-service"}
```

### Health Checks

Health monitoring across all backend services:

```bash
# Check overall health
curl http://localhost:8080/health

# Response
{
  "status": "healthy",
  "timestamp": "2023-12-07T10:30:00.000Z",
  "services": [
    {
      "serviceName": "auth-service",
      "status": "healthy",
      "responseTime": 45
    }
  ]
}
```

### Logging

Structured logging with Winston:

```javascript
// Request logging
logger.info('Incoming request', {
  correlationId: 'req_123',
  method: 'GET',
  url: '/api/v1/properties',
  userId: 'user_456'
});

// Error logging
logger.error('Service error', error, {
  correlationId: 'req_123',
  service: 'auth-service'
});
```

## 🧪 Testing

### Unit Tests

```bash
npm test
```

### Integration Tests

```bash
npm run test:integration
```

### Load Testing

```bash
# Test with Apache Bench
ab -n 1000 -c 10 http://localhost:8080/api/v1/properties

# Test with Artillery
npx artillery run load-test.yml
```

## 🚀 Deployment

### Docker Deployment

```dockerfile
# Build
docker build -t api-gateway .

# Run
docker run -p 8080:8080 \
  -e AUTH_SERVICE_URL=http://auth-service:3001 \
  -e REDIS_URL=redis://redis:6379 \
  api-gateway
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api-gateway
  template:
    metadata:
      labels:
        app: api-gateway
    spec:
      containers:
      - name: api-gateway
        image: landlord-api-gateway:latest
        ports:
        - containerPort: 8080
        env:
        - name: AUTH_SERVICE_URL
          value: "http://auth-service:3001"
        - name: REDIS_URL
          value: "redis://redis:6379"
```

### Production Deployment

1. **Environment Setup**
   ```bash
   NODE_ENV=production
   API_GATEWAY_PORT=8080
   ```

2. **SSL Configuration**
   ```bash
   SSL_ENABLED=true
   SSL_CERT_PATH=/path/to/cert.pem
   SSL_KEY_PATH=/path/to/key.pem
   ```

3. **Monitoring Setup**
   ```bash
   ENABLE_METRICS=true
   PROMETHEUS_ENABLED=true
   ```

## 📚 API Documentation

### Request Format

All API requests should follow this format:

```http
POST /api/v1/properties HTTP/1.1
Host: api.yourdomain.com
Content-Type: application/json
Authorization: Bearer <jwt-token>
X-Correlation-ID: req_1234567890

{
  "name": "Beautiful Apartment",
  "location": "New York, NY"
}
```

### Response Format

All API responses follow this structure:

```json
{
  "data": {
    "id": "prop_123",
    "name": "Beautiful Apartment"
  },
  "timestamp": "2023-12-07T10:30:00.000Z",
  "correlationId": "req_1234567890"
}
```

### Error Responses

```json
{
  "error": "Validation Error",
  "message": "Invalid property data",
  "code": "VALIDATION_ERROR",
  "details": {
    "errors": [
      {
        "field": "name",
        "message": "Name is required"
      }
    ]
  },
  "timestamp": "2023-12-07T10:30:00.000Z",
  "correlationId": "req_1234567890"
}
```

## 🔧 Configuration Reference

### Load Balancing Strategies

```javascript
// Round Robin (default)
const lb = new LoadBalancer(new RoundRobinStrategy());

// Least Connections
const lb = new LoadBalancer(new LeastConnectionsStrategy());

// Weighted Round Robin
const lb = new LoadBalancer(new WeightedRoundRobinStrategy());

// Response Time Based
const lb = new LoadBalancer(new ResponseTimeStrategy());
```

### Cache Strategies

```javascript
// User-specific cache
app.use('/api/v1/users', cacheMiddleware.userDataCache(600));

// Property cache
app.use('/api/v1/properties', cacheMiddleware.propertyCache(300));

// Search cache
app.use('/api/v1/search', cacheMiddleware.searchCache(180));
```

### Rate Limiting Rules

```javascript
// Custom rate limit
const customLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  keyGenerator: (req) => `user:${req.user.id}`
});
```

## 🐛 Troubleshooting

### Common Issues

#### Redis Connection Failed
```bash
Error: Redis connection failed
```
**Solution**: Check Redis service is running and `REDIS_URL` is correct.

#### Service Health Check Failed
```bash
Warning: Service auth-service health check failed
```
**Solution**: Verify backend services are running and accessible.

#### CORS Errors
```bash
Access to fetch blocked by CORS policy
```
**Solution**: Add your domain to `CORS_ORIGINS` environment variable.

#### Rate Limiting
```bash
Error: Too Many Requests
```
**Solution**: Check rate limit configuration and implement backoff.

### Debug Mode

Enable debug logging:

```bash
DEBUG=api-gateway:* npm run dev
```

### Health Check Debug

Test individual service health:

```bash
curl http://localhost:8080/health
curl http://localhost:8081/actuator/health  # Property service
curl http://localhost:3001/health           # Auth service
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:

- Email: support@your-domain.com
- Documentation: https://docs.your-domain.com
- Issues: https://github.com/yourorg/api-gateway/issues

---

**API Gateway v1.0.0** - Production-Ready Microservices Gateway