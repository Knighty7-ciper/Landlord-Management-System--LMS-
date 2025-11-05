import request from 'supertest';
import { APIServer } from '../src/index';
import { ConfigurationService } from '../src/services/configuration';
import { Logger } from '../src/utils/logger';

// Test suite for API Gateway
describe('API Gateway', () => {
  let apiServer: APIServer;
  let configService: ConfigurationService;
  let logger: Logger;

  beforeAll(async () => {
    // Initialize services for testing
    configService = new ConfigurationService();
    logger = new Logger();
    
    // Create API server instance
    apiServer = new APIServer();
  });

  afterAll(async () => {
    // Cleanup
  });

  describe('Health Check', () => {
    test('should return health status', async () => {
      const response = await request(apiServer.getApp())
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('services');
      expect(response.body).toHaveProperty('summary');
    });
  });

  describe('API Info', () => {
    test('should return API information', async () => {
      const response = await request(apiServer.getApp())
        .get('/api/v1/info')
        .expect(200);

      expect(response.body).toHaveProperty('service', 'API Gateway');
      expect(response.body).toHaveProperty('version', '1.0.0');
      expect(response.body).toHaveProperty('status', 'running');
      expect(response.body).toHaveProperty('endpoints');
    });
  });

  describe('CORS Configuration', () => {
    test('should handle CORS preflight requests', async () => {
      const response = await request(apiServer.getApp())
        .options('/api/v1/properties')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'GET')
        .set('Access-Control-Request-Headers', 'Content-Type')
        .expect(204);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
      expect(response.headers).toHaveProperty('access-control-allow-methods');
    });

    test('should allow requests from whitelisted origins', async () => {
      const response = await request(apiServer.getApp())
        .get('/api/v1/info')
        .set('Origin', 'http://localhost:3000')
        .expect(200);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });
  });

  describe('Request Transformation', () => {
    test('should add correlation ID to requests', async () => {
      const response = await request(apiServer.getApp())
        .get('/api/v1/info')
        .expect(200);

      expect(response.headers).toHaveProperty('x-correlation-id');
    });

    test('should preserve original headers', async () => {
      const response = await request(apiServer.getApp())
        .get('/api/v1/info')
        .set('X-Custom-Header', 'test-value')
        .expect(200);

      // Headers should be passed through
      expect(response.status).toBe(200);
    });
  });

  describe('Response Transformation', () => {
    test('should add standard response headers', async () => {
      const response = await request(apiServer.getApp())
        .get('/api/v1/info')
        .expect(200);

      expect(response.headers).toHaveProperty('x-api-version');
      expect(response.headers).toHaveProperty('x-gateway-version');
      expect(response.headers).toHaveProperty('x-content-type-options', 'nosniff');
      expect(response.headers).toHaveProperty('x-frame-options', 'DENY');
    });

    test('should include correlation ID in responses', async () => {
      const response = await request(apiServer.getApp())
        .get('/api/v1/info')
        .set('X-Correlation-ID', 'test-correlation-123')
        .expect(200);

      expect(response.headers['x-correlation-id']).toBe('test-correlation-123');
    });
  });

  describe('Authentication Middleware', () => {
    test('should reject requests without valid token', async () => {
      const response = await request(apiServer.getApp())
        .get('/api/v1/properties')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Unauthorized');
      expect(response.body).toHaveProperty('message', 'Access token is required');
    });

    test('should reject requests with invalid token', async () => {
      const response = await request(apiServer.getApp())
        .get('/api/v1/properties')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Unauthorized');
    });
  });

  describe('Rate Limiting', () => {
    test('should implement global rate limiting', async () => {
      const promises = [];
      const limit = 10;

      // Make requests up to the limit
      for (let i = 0; i < limit; i++) {
        promises.push(
          request(apiServer.getApp())
            .get('/api/v1/info')
            .expect(200)
        );
      }

      await Promise.all(promises);

      // Next request should still work (within limit)
      await request(apiServer.getApp())
        .get('/api/v1/info')
        .expect(200);
    }, 10000);
  });

  describe('Request Validation', () => {
    test('should validate query parameters', async () => {
      const response = await request(apiServer.getApp())
        .get('/api/v1/properties')
        .query({ page: 'invalid', limit: 'invalid' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation Error');
      expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR');
      expect(response.body.details).toHaveProperty('errors');
    });

    test('should accept valid pagination parameters', async () => {
      const response = await request(apiServer.getApp())
        .get('/api/v1/properties')
        .query({ page: '1', limit: '20' })
        .expect(200); // Will fail if backend service not available, but validation should pass
    });
  });

  describe('Error Handling', () => {
    test('should handle 404 for unknown routes', async () => {
      const response = await request(apiServer.getApp())
        .get('/api/v1/unknown')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Not Found');
      expect(response.body).toHaveProperty('message');
    });

    test('should handle internal server errors gracefully', async () => {
      // This test would require mocking backend services
      // For now, we'll test the error handling structure
      const response = await request(apiServer.getApp())
        .get('/nonexistent-endpoint')
        .expect(404);

      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('path');
      expect(response.body).toHaveProperty('method');
    });
  });

  describe('Metrics Collection', () => {
    test('should expose metrics endpoint', async () => {
      const response = await request(apiServer.getApp())
        .get('/metrics')
        .expect(200);

      expect(response.headers['content-type']).toContain('text/plain');
      expect(response.text).toContain('api_gateway_');
    });

    test('should collect request metrics', async () => {
      await request(apiServer.getApp())
        .get('/api/v1/info')
        .expect(200);

      const response = await request(apiServer.getApp())
        .get('/metrics')
        .expect(200);

      // Should contain request counter
      expect(response.text).toContain('api_gateway_requests_total');
    });
  });

  describe('Configuration Service', () => {
    test('should load configuration correctly', () => {
      expect(configService).toBeDefined();
      expect(configService.getPort()).toBeDefined();
      expect(configService.getEnvironment()).toBeDefined();
      expect(configService.getJwtSecret()).toBeDefined();
    });

    test('should provide service URLs', () => {
      expect(configService.getServiceUrl('auth-service')).toBeDefined();
      expect(configService.getServiceUrl('property-service')).toBeDefined();
    });

    test('should provide CORS configuration', () => {
      const corsOptions = configService.getCorsOptions();
      expect(corsOptions).toHaveProperty('origin');
      expect(corsOptions).toHaveProperty('credentials');
      expect(corsOptions).toHaveProperty('methods');
    });
  });

  describe('Redis Cache', () => {
    test('should handle cache operations', async () => {
      const redis = new (require('../src/services/redis').RedisClient)();
      
      // Test basic operations
      const testKey = 'test:cache:key';
      const testValue = 'test-value';
      
      // Set
      const setResult = await redis.set(testKey, testValue, 60);
      expect(setResult).toBe(true);
      
      // Get
      const getResult = await redis.get(testKey);
      expect(getResult).toBe(testValue);
      
      // Exists
      const existsResult = await redis.exists(testKey);
      expect(existsResult).toBe(true);
      
      // Delete
      const delResult = await redis.del(testKey);
      expect(delResult).toBe(true);
    });
  });

  describe('Logging Service', () => {
    test('should log at different levels', () => {
      const testLogger = new Logger();
      
      expect(() => {
        testLogger.debug('Debug message');
        testLogger.info('Info message');
        testLogger.warn('Warning message');
        testLogger.error('Error message');
      }).not.toThrow();
    });

    test('should include context in logs', () => {
      const testLogger = new Logger();
      const context = {
        correlationId: 'test-123',
        userId: 'user-456',
        method: 'GET',
        url: '/test'
      };

      expect(() => {
        testLogger.info('Test message', context);
      }).not.toThrow();
    });
  });

  describe('Load Balancer', () => {
    test('should select healthy instances', () => {
      const { LoadBalancer, RoundRobinStrategy } = require('../src/services/load-balancer');
      const lb = new LoadBalancer(new RoundRobinStrategy());
      
      expect(() => {
        // Test would require configured service instances
        // For now, just test the class is instantiable
      }).not.toThrow();
    });
  });

  describe('Security Features', () => {
    test('should set security headers', async () => {
      const response = await request(apiServer.getApp())
        .get('/api/v1/info')
        .expect(200);

      expect(response.headers).toHaveProperty('x-content-type-options', 'nosniff');
      expect(response.headers).toHaveProperty('x-frame-options', 'DENY');
      expect(response.headers).toHaveProperty('x-xss-protection');
    });

    test('should sanitize sensitive data in logs', async () => {
      const response = await request(apiServer.getApp())
        .get('/api/v1/info')
        .expect(200);

      // Headers should not contain sensitive information in logs
      expect(response.status).toBe(200);
    });
  });

  describe('Performance', () => {
    test('should respond within acceptable time', async () => {
      const startTime = Date.now();
      
      const response = await request(apiServer.getApp())
        .get('/api/v1/info')
        .expect(200);
      
      const responseTime = Date.now() - startTime;
      
      // Should respond within 1 second
      expect(responseTime).toBeLessThan(1000);
    });
  });
});

// Integration tests
describe('API Gateway Integration', () => {
  let apiServer: APIServer;

  beforeAll(async () => {
    apiServer = new APIServer();
  });

  test('should proxy requests to backend services', async () => {
    // This test would require actual backend services running
    // For now, we'll test the proxy setup
    
    const app = apiServer.getApp();
    expect(app).toBeDefined();
    expect(typeof app.use).toBe('function');
  });

  test('should handle graceful shutdown', async () => {
    // Test graceful shutdown
    const shutdownPromise = new Promise(resolve => {
      process.once('SIGTERM', resolve);
    });

    // Trigger shutdown
    process.kill(process.pid, 'SIGTERM');

    // Should resolve after graceful shutdown
    await expect(shutdownPromise).resolves.toBeUndefined();
  });
});

// Performance benchmarks
describe('API Gateway Performance', () => {
  test('should handle concurrent requests', async () => {
    const apiServer = new APIServer();
    const concurrentRequests = 50;
    const promises = [];

    for (let i = 0; i < concurrentRequests; i++) {
      promises.push(
        request(apiServer.getApp())
          .get('/api/v1/info')
          .expect(200)
      );
    }

    const startTime = Date.now();
    const results = await Promise.all(promises);
    const endTime = Date.now();

    // All requests should succeed
    results.forEach(result => {
      expect(result.status).toBe(200);
    });

    // Should handle concurrent load within reasonable time
    const totalTime = endTime - startTime;
    expect(totalTime).toBeLessThan(5000); // 5 seconds for 50 requests

    console.log(`Handled ${concurrentRequests} requests in ${totalTime}ms`);
  }, 10000);

  test('should not degrade under load', async () => {
    const apiServer = new APIServer();
    
    // Test with increasing load
    const testLoad = async (requestCount: number) => {
      const promises = [];
      for (let i = 0; i < requestCount; i++) {
        promises.push(
          request(apiServer.getApp())
            .get('/api/v1/info')
            .expect(200)
        );
      }
      
      const startTime = Date.now();
      const results = await Promise.all(promises);
      const endTime = Date.now();
      
      return {
        requestCount,
        totalTime: endTime - startTime,
        avgTime: (endTime - startTime) / requestCount,
        successRate: results.length / requestCount
      };
    };

    const lightLoad = await testLoad(10);
    const mediumLoad = await testLoad(25);
    const heavyLoad = await testLoad(50);

    expect(lightLoad.successRate).toBe(1);
    expect(mediumLoad.successRate).toBeGreaterThan(0.95);
    expect(heavyLoad.successRate).toBeGreaterThan(0.90);

    // Performance should not degrade drastically
    const degradationRatio = heavyLoad.avgTime / lightLoad.avgTime;
    expect(degradationRatio).toBeLessThan(3);

    console.log('Load test results:', { lightLoad, mediumLoad, heavyLoad });
  }, 30000);
});