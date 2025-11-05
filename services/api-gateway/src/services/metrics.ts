import client from 'prom-client';
import { ConfigurationService } from './configuration';
import { Logger } from '../utils/logger';

export interface MetricsData {
  http_requests_total: number;
  http_request_duration_seconds: number[];
  http_request_size_bytes: number[];
  http_response_size_bytes: number[];
  active_connections: number;
  service_health_status: { [serviceName: string]: number };
  rate_limit_hits_total: number;
  cache_hits_total: number;
  cache_misses_total: number;
  auth_failures_total: number;
  proxy_errors_total: number;
}

export class MetricsService {
  private logger: Logger;
  private configService: ConfigurationService;
  private registry: client.Registry;
  private isInitialized = false;

  // Custom metrics
  private httpRequestDuration: client.Histogram<string>;
  private httpRequestSize: client.Histogram<string>;
  private httpResponseSize: client.Histogram<string>;
  private activeConnections: client.Gauge<string>;
  private serviceHealthStatus: client.Gauge<string>;
  private rateLimitHits: client.Counter<string>;
  private cacheHits: client.Counter<string>;
  private cacheMisses: client.Counter<string>;
  private authFailures: client.Counter<string>;
  private proxyErrors: client.Counter<string>;
  private requestTotal: client.Counter<string>;
  private requestDuration: client.Histogram<string>;

  // Labels for metrics
  private readonly labels = ['method', 'route', 'status_code', 'service', 'endpoint'];

  constructor() {
    this.logger = new Logger();
    this.configService = new ConfigurationService();
    this.registry = new client.Registry();

    this.initializeMetrics();
  }

  private initializeMetrics(): void {
    try {
      // Enable default metrics
      client.collectDefaultMetrics({
        register: this.registry,
        prefix: 'api_gateway_'
      });

      // HTTP request duration histogram
      this.httpRequestDuration = new client.Histogram({
        name: 'api_gateway_http_request_duration_seconds',
        help: 'Duration of HTTP requests in seconds',
        labelNames: this.labels,
        buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
      });

      // HTTP request size histogram
      this.httpRequestSize = new client.Histogram({
        name: 'api_gateway_http_request_size_bytes',
        help: 'Size of HTTP requests in bytes',
        labelNames: this.labels,
        buckets: [100, 1000, 10000, 100000, 1000000, 10000000]
      });

      // HTTP response size histogram
      this.httpResponseSize = new client.Histogram({
        name: 'api_gateway_http_response_size_bytes',
        help: 'Size of HTTP responses in bytes',
        labelNames: this.labels,
        buckets: [100, 1000, 10000, 100000, 1000000, 10000000]
      });

      // Active connections gauge
      this.activeConnections = new client.Gauge({
        name: 'api_gateway_active_connections',
        help: 'Number of active connections'
      });

      // Service health status gauge
      this.serviceHealthStatus = new client.Gauge({
        name: 'api_gateway_service_health_status',
        help: 'Health status of backend services (1=healthy, 0=unhealthy)',
        labelNames: ['service_name']
      });

      // Rate limit hits counter
      this.rateLimitHits = new client.Counter({
        name: 'api_gateway_rate_limit_hits_total',
        help: 'Total number of rate limit hits',
        labelNames: ['limit_type', 'client_type']
      });

      // Cache metrics counters
      this.cacheHits = new client.Counter({
        name: 'api_gateway_cache_hits_total',
        help: 'Total number of cache hits',
        labelNames: ['cache_type']
      });

      this.cacheMisses = new client.Counter({
        name: 'api_gateway_cache_misses_total',
        help: 'Total number of cache misses',
        labelNames: ['cache_type']
      });

      // Authentication failure counter
      this.authFailures = new client.Counter({
        name: 'api_gateway_auth_failures_total',
        help: 'Total number of authentication failures',
        labelNames: ['failure_type', 'method']
      });

      // Proxy error counter
      this.proxyErrors = new client.Counter({
        name: 'api_gateway_proxy_errors_total',
        help: 'Total number of proxy errors',
        labelNames: ['service_name', 'error_type']
      });

      // Total requests counter
      this.requestTotal = new client.Counter({
        name: 'api_gateway_requests_total',
        help: 'Total number of HTTP requests',
        labelNames: ['method', 'route', 'status_code', 'service']
      });

      // Request duration histogram
      this.requestDuration = new client.Histogram({
        name: 'api_gateway_request_duration_seconds',
        help: 'Request duration in seconds',
        labelNames: ['method', 'route', 'service'],
        buckets: [0.001, 0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5, 10]
      });

      // Register all metrics
      this.registry.registerMetric(this.httpRequestDuration);
      this.registry.registerMetric(this.httpRequestSize);
      this.registry.registerMetric(this.httpResponseSize);
      this.registry.registerMetric(this.activeConnections);
      this.registry.registerMetric(this.serviceHealthStatus);
      this.registry.registerMetric(this.rateLimitHits);
      this.registry.registerMetric(this.cacheHits);
      this.registry.registerMetric(this.cacheMisses);
      this.registry.registerMetric(this.authFailures);
      this.registry.registerMetric(this.proxyErrors);
      this.registry.registerMetric(this.requestTotal);
      this.registry.registerMetric(this.requestDuration);

      this.isInitialized = true;
      this.logger.info('Metrics service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize metrics service:', error);
      throw error;
    }
  }

  public async initialize(): Promise<void> {
    // Already initialized in constructor, but we can add additional setup here
    if (!this.isInitialized) {
      this.initializeMetrics();
    }
  }

  // Metrics collection middleware
  public metrics() {
    return (req: any, res: any, next: any) => {
      const startTime = Date.now();
      const originalSend = res.send;

      // Increment active connections
      this.activeConnections.inc();

      // Capture request size
      if (req.headers['content-length']) {
        const requestSize = parseInt(req.headers['content-length'], 10);
        this.httpRequestSize.observe({
          method: req.method,
          route: this.getRoute(req),
          status_code: res.statusCode,
          service: this.getServiceName(req),
          endpoint: req.path
        }, requestSize);
      }

      // Override response send to capture response size and timing
      res.send = function (body?: any) {
        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000;

        // Capture response size
        if (body && typeof body === 'string') {
          const responseSize = Buffer.byteLength(body, 'utf8');
          this.httpResponseSize.observe({
            method: req.method,
            route: this.getRoute(req),
            status_code: res.statusCode,
            service: this.getServiceName(req),
            endpoint: req.path
          }, responseSize);
        }

        // Record duration
        this.requestDuration.observe({
          method: req.method,
          route: this.getRoute(req),
          service: this.getServiceName(req)
        }, duration);

        // Increment request total
        this.requestTotal.inc({
          method: req.method,
          route: this.getRoute(req),
          status_code: res.statusCode,
          service: this.getServiceName(req)
        });

        // Decrement active connections
        this.activeConnections.dec();

        return originalSend.call(this, body);
      }.bind(this);

      next();
    };
  }

  private getRoute(req: any): string {
    // Extract route pattern for better grouping
    return req.route ? req.route.path : req.path;
  }

  private getServiceName(req: any): string {
    // Determine service name based on request path
    if (req.path.startsWith('/api/v1/auth')) {
      return 'auth-service';
    } else if (req.path.startsWith('/api/v1/properties')) {
      return 'property-service';
    } else if (req.path.startsWith('/api/v1/users')) {
      return 'user-service';
    }
    return 'unknown';
  }

  // Service health metrics
  public recordServiceHealth(serviceName: string, isHealthy: boolean): void {
    this.serviceHealthStatus.set({ service_name: serviceName }, isHealthy ? 1 : 0);
  }

  // Rate limiting metrics
  public recordRateLimitHit(limitType: string, clientType: 'ip' | 'user'): void {
    this.rateLimitHits.inc({ limit_type: limitType, client_type: clientType });
  }

  // Cache metrics
  public recordCacheHit(cacheType: string): void {
    this.cacheHits.inc({ cache_type: cacheType });
  }

  public recordCacheMiss(cacheType: string): void {
    this.cacheMisses.inc({ cache_type: cacheType });
  }

  // Authentication metrics
  public recordAuthFailure(failureType: string, method: string): void {
    this.authFailures.inc({ failure_type: failureType, method });
  }

  // Proxy error metrics
  public recordProxyError(serviceName: string, errorType: string): void {
    this.proxyErrors.inc({ service_name: serviceName, error_type: errorType });
  }

  // Custom metrics
  public recordCustomMetric(metricName: string, value: number, labels?: Record<string, string>): void {
    // This could be extended to handle custom business metrics
    // For now, we'll log custom metrics
    this.logger.debug(`Custom metric recorded: ${metricName}=${value}`, labels);
  }

  // Business metrics
  public recordBusinessEvent(eventName: string, properties?: Record<string, any>): void {
    // Record business events as metrics
    const metricName = `api_gateway_business_${eventName}`;
    
    // This is a simplified implementation
    // In a real system, you might want to create custom metrics for business events
    this.logger.info(`Business event: ${eventName}`, properties);
  }

  // Performance metrics
  public recordPerformance(operation: string, duration: number, success: boolean): void {
    // Record performance metrics for different operations
    const labels = { operation, success: success.toString() };
    
    // This could be extended to record histograms for different operations
    this.logger.debug(`Performance recorded: ${operation}=${duration}ms (success: ${success})`, labels);
  }

  // Security metrics
  public recordSecurityEvent(event: string, severity: 'low' | 'medium' | 'high', details?: any): void {
    // Record security-related events
    this.logger.warn(`Security event: ${event} (severity: ${severity})`, details);
  }

  // Error metrics
  public recordError(errorType: string, serviceName?: string, details?: any): void {
    // Record various types of errors
    if (serviceName) {
      this.proxyErrors.inc({ service_name: serviceName, error_type: errorType });
    }
    
    this.logger.error(`Error recorded: ${errorType}`, { serviceName, ...details });
  }

  // Get current metrics in Prometheus format
  public async getMetrics(): Promise<string> {
    try {
      return await this.registry.metrics();
    } catch (error) {
      this.logger.error('Failed to get metrics:', error);
      throw error;
    }
  }

  // Get metrics as JSON for debugging
  public async getMetricsJSON(): Promise<any> {
    try {
      const metrics = await this.registry.getMetricsAsJSON();
      return metrics;
    } catch (error) {
      this.logger.error('Failed to get metrics as JSON:', error);
      throw error;
    }
  }

  // Clear metrics (useful for testing)
  public clearMetrics(): void {
    this.registry.clear();
    this.initializeMetrics();
  }

  // Get registry for direct access
  public getRegistry(): client.Registry {
    return this.registry;
  }

  // Check if metrics service is initialized
  public isReady(): boolean {
    return this.isInitialized;
  }

  // Configuration for metrics collection
  public getConfig() {
    return this.configService.getMetricsConfig();
  }

  // Content type for metrics endpoint
  public get contentType(): string {
    return 'text/plain; version=0.0.4; charset=utf-8';
  }

  // Metrics endpoint handler
  public metricsEndpoint = async (req: any, res: any): Promise<void> => {
    try {
      const config = this.getConfig();
      
      if (!config.enableMetrics) {
        res.status(404).json({
          error: 'Metrics disabled',
          message: 'Metrics collection is disabled'
        });
        return;
      }

      res.set('Content-Type', this.contentType);
      res.send(await this.getMetrics());
    } catch (error) {
      this.logger.error('Metrics endpoint error:', error);
      res.status(500).json({
        error: 'Metrics unavailable',
        message: 'Failed to collect metrics'
      });
    }
  };

  public async close(): Promise<void> {
    // Cleanup metrics service
    this.registry.clear();
    this.isInitialized = false;
    this.logger.info('Metrics service closed');
  }
}