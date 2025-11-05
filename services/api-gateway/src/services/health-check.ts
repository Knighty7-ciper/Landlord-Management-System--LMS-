import axios, { AxiosResponse } from 'axios';
import { ConfigurationService } from './configuration';
import { Logger } from '../utils/logger';

export interface ServiceHealth {
  serviceName: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  url: string;
  responseTime: number;
  lastCheck: Date;
  error?: string;
  details?: any;
}

export interface OverallHealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: Date;
  services: ServiceHealth[];
  summary: {
    total: number;
    healthy: number;
    unhealthy: number;
    degraded: number;
  };
}

export class HealthCheckService {
  private logger: Logger;
  private configService: ConfigurationService;
  private healthChecks: Map<string, ServiceHealth>;
  private checkInterval: NodeJS.Timeout;
  private readonly checkIntervalMs = 30000; // 30 seconds
  private readonly timeoutMs = 5000; // 5 seconds
  private isInitialized = false;

  constructor() {
    this.logger = new Logger();
    this.configService = new ConfigurationService();
    this.healthChecks = new Map();
  }

  public async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing Health Check Service');
      
      // Initialize health check tracking for all configured services
      const services = this.configService.getAllServices();
      
      for (const service of services) {
        this.healthChecks.set(service.name, {
          serviceName: service.name,
          status: 'unhealthy',
          url: service.url,
          responseTime: 0,
          lastCheck: new Date(),
          error: 'Not checked yet'
        });
      }

      // Start periodic health checks
      this.startPeriodicChecks();
      
      this.isInitialized = true;
      this.logger.info('Health Check Service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Health Check Service:', error);
      throw error;
    }
  }

  private startPeriodicChecks(): void {
    this.checkInterval = setInterval(async () => {
      await this.performAllHealthChecks();
    }, this.checkIntervalMs);
  }

  private async performAllHealthChecks(): Promise<void> {
    const services = this.configService.getAllServices();
    const checkPromises = services.map(service => this.checkServiceHealth(service.name));
    
    try {
      await Promise.allSettled(checkPromises);
    } catch (error) {
      this.logger.error('Error during periodic health checks:', error);
    }
  }

  public async checkServiceHealth(serviceName: string): Promise<ServiceHealth> {
    const serviceConfig = this.configService.getServiceConfig(serviceName);
    
    if (!serviceConfig) {
      const health: ServiceHealth = {
        serviceName,
        status: 'unhealthy',
        url: 'unknown',
        responseTime: 0,
        lastCheck: new Date(),
        error: 'Service configuration not found'
      };
      
      this.healthChecks.set(serviceName, health);
      return health;
    }

    const healthCheckUrl = `${serviceConfig.url}${serviceConfig.healthCheckPath}`;
    const startTime = Date.now();
    
    try {
      const response = await axios.get(healthCheckUrl, {
        timeout: this.timeoutMs,
        headers: {
          'User-Agent': 'API-Gateway-Health-Check/1.0'
        }
      });

      const responseTime = Date.now() - startTime;
      
      // Determine service status based on response
      let status: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
      let error: string | undefined;

      if (response.status !== 200) {
        status = 'unhealthy';
        error = `HTTP ${response.status}: ${response.statusText}`;
      } else if (responseTime > 3000) {
        status = 'degraded';
        error = 'Slow response time';
      }

      const health: ServiceHealth = {
        serviceName,
        status,
        url: healthCheckUrl,
        responseTime,
        lastCheck: new Date(),
        error,
        details: response.data
      };

      this.healthChecks.set(serviceName, health);
      
      // Update configuration service with health status
      this.configService.updateServiceHealth(serviceName, 'default-1', status === 'healthy');
      
      return health;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      let errorMessage = 'Health check failed';
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
          errorMessage = 'Connection refused';
        } else if (error.code === 'ETIMEDOUT') {
          errorMessage = 'Request timeout';
        } else if (error.response) {
          errorMessage = `HTTP ${error.response.status}: ${error.response.statusText}`;
        } else if (error.request) {
          errorMessage = 'No response received';
        }
      }

      const health: ServiceHealth = {
        serviceName,
        status: 'unhealthy',
        url: healthCheckUrl,
        responseTime,
        lastCheck: new Date(),
        error: errorMessage
      };

      this.healthChecks.set(serviceName, health);
      
      // Update configuration service
      this.configService.updateServiceHealth(serviceName, 'default-1', false);
      
      this.logger.warn(`Health check failed for ${serviceName}: ${errorMessage}`);
      
      return health;
    }
  }

  public async checkAllServices(): Promise<OverallHealthStatus> {
    const services = this.configService.getAllServices();
    const healthChecks: ServiceHealth[] = [];

    // Perform health checks for all services
    const checkPromises = services.map(async (service) => {
      return await this.checkServiceHealth(service.name);
    });

    try {
      const results = await Promise.allSettled(checkPromises);
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          healthChecks.push(result.value);
        } else {
          // Add failed check as unhealthy
          const service = services[index];
          healthChecks.push({
            serviceName: service.name,
            status: 'unhealthy',
            url: `${service.url}${service.healthCheckPath}`,
            responseTime: 0,
            lastCheck: new Date(),
            error: `Health check failed: ${result.reason}`
          });
        }
      });
    } catch (error) {
      this.logger.error('Error checking all services:', error);
      
      // Add fallback health checks for all services
      services.forEach(service => {
        healthChecks.push({
          serviceName: service.name,
          status: 'unhealthy',
          url: `${service.url}${service.healthCheckPath}`,
          responseTime: 0,
          lastCheck: new Date(),
          error: 'Health check service unavailable'
        });
      });
    }

    // Determine overall status
    let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
    const summary = {
      total: healthChecks.length,
      healthy: 0,
      unhealthy: 0,
      degraded: 0
    };

    healthChecks.forEach(check => {
      summary[check.status]++;
      
      // Update overall status based on service statuses
      if (check.status === 'unhealthy') {
        overallStatus = 'unhealthy';
      } else if (check.status === 'degraded' && overallStatus !== 'unhealthy') {
        overallStatus = 'degraded';
      }
    });

    return {
      status: overallStatus,
      timestamp: new Date(),
      services: healthChecks,
      summary
    };
  }

  public getServiceHealth(serviceName: string): ServiceHealth | undefined {
    return this.healthChecks.get(serviceName);
  }

  public getAllServicesHealth(): ServiceHealth[] {
    return Array.from(this.healthChecks.values());
  }

  public isServiceHealthy(serviceName: string): boolean {
    const health = this.healthChecks.get(serviceName);
    return health?.status === 'healthy';
  }

  public getHealthyServices(serviceName: string): string[] {
    const services = this.configService.getAllServices();
    return services
      .filter(service => this.isServiceHealthy(service.name))
      .map(service => service.url);
  }

  public getOverallStatus(): OverallHealthStatus {
    const services = this.getAllServicesHealth();
    
    let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
    const summary = {
      total: services.length,
      healthy: 0,
      unhealthy: 0,
      degraded: 0
    };

    services.forEach(service => {
      summary[service.status]++;
      
      if (service.status === 'unhealthy') {
        overallStatus = 'unhealthy';
      } else if (service.status === 'degraded' && overallStatus !== 'unhealthy') {
        overallStatus = 'degraded';
      }
    });

    return {
      status: overallStatus,
      timestamp: new Date(),
      services,
      summary
    };
  }

  // Health check endpoints for each service (useful for debugging)
  public async checkAuthService(): Promise<ServiceHealth> {
    return await this.checkServiceHealth('auth-service');
  }

  public async checkPropertyService(): Promise<ServiceHealth> {
    return await this.checkServiceHealth('property-service');
  }

  public async checkUserService(): Promise<ServiceHealth> {
    return await this.checkServiceHealth('user-service');
  }

  // Manual health check trigger (useful for testing)
  public async performManualCheck(serviceName?: string): Promise<OverallHealthStatus | ServiceHealth> {
    if (serviceName) {
      return await this.checkServiceHealth(serviceName);
    } else {
      return await this.checkAllServices();
    }
  }

  public close(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.logger.info('Health check interval cleared');
    }
    
    if (this.isInitialized) {
      this.logger.info('Health Check Service closed');
    }
  }
}