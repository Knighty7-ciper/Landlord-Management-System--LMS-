import { ConfigurationService, ServiceConfig } from './configuration';
import { Logger } from '../utils/logger';

export interface LoadBalancingStrategy {
  selectInstance(instances: LoadBalancedInstance[]): LoadBalancedInstance;
}

export interface LoadBalancedInstance {
  id: string;
  url: string;
  isHealthy: boolean;
  currentConnections: number;
  responseTime: number;
  errorRate: number;
  lastUsed: Date;
  weight: number;
  priority: number;
}

export class RoundRobinStrategy implements LoadBalancingStrategy {
  private currentIndex = 0;

  public selectInstance(instances: LoadBalancedInstance[]): LoadBalancedInstance {
    const healthyInstances = instances.filter(instance => instance.isHealthy);
    
    if (healthyInstances.length === 0) {
      throw new Error('No healthy instances available');
    }

    const selectedInstance = healthyInstances[this.currentIndex % healthyInstances.length];
    this.currentIndex++;
    
    return selectedInstance;
  }
}

export class LeastConnectionsStrategy implements LoadBalancingStrategy {
  public selectInstance(instances: LoadBalancedInstance[]): LoadBalancedInstance {
    const healthyInstances = instances.filter(instance => instance.isHealthy);
    
    if (healthyInstances.length === 0) {
      throw new Error('No healthy instances available');
    }

    // Sort by current connections (ascending)
    healthyInstances.sort((a, b) => a.currentConnections - b.currentConnections);
    
    return healthyInstances[0];
  }
}

export class WeightedRoundRobinStrategy implements LoadBalancingStrategy {
  private currentIndex = 0;

  public selectInstance(instances: LoadBalancedInstance[]): LoadBalancedInstance {
    const healthyInstances = instances.filter(instance => instance.isHealthy);
    
    if (healthyInstances.length === 0) {
      throw new Error('No healthy instances available');
    }

    // Calculate total weight
    const totalWeight = healthyInstances.reduce((sum, instance) => sum + instance.weight, 0);
    
    // Generate weighted selection
    const currentWeight = this.currentIndex % totalWeight;
    let cumulativeWeight = 0;
    
    for (const instance of healthyInstances) {
      cumulativeWeight += instance.weight;
      if (currentWeight < cumulativeWeight) {
        this.currentIndex++;
        return instance;
      }
    }

    // Fallback to first healthy instance
    this.currentIndex++;
    return healthyInstances[0];
  }
}

export class ResponseTimeStrategy implements LoadBalancingStrategy {
  public selectInstance(instances: LoadBalancedInstance[]): LoadBalancedInstance {
    const healthyInstances = instances.filter(instance => instance.isHealthy);
    
    if (healthyInstances.length === 0) {
      throw new Error('No healthy instances available');
    }

    // Sort by response time (ascending) and error rate (ascending)
    healthyInstances.sort((a, b) => {
      // Primary sort: response time
      if (a.responseTime !== b.responseTime) {
        return a.responseTime - b.responseTime;
      }
      // Secondary sort: error rate
      return a.errorRate - b.errorRate;
    });
    
    return healthyInstances[0];
  }
}

export class LoadBalancer {
  private logger: Logger;
  private configService: ConfigurationService;
  private strategy: LoadBalancingStrategy;
  private serviceInstances: Map<string, LoadBalancedInstance[]>;
  private instanceStats: Map<string, {
    connectionCount: number;
    responseTimes: number[];
    errorCount: number;
    totalRequests: number;
    lastHealthCheck: Date;
  }>;

  constructor(strategy?: LoadBalancingStrategy) {
    this.logger = new Logger();
    this.configService = new ConfigurationService();
    this.strategy = strategy || new RoundRobinStrategy();
    this.serviceInstances = new Map();
    this.instanceStats = new Map();
  }

  public async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing Load Balancer');
      
      // Initialize instances for all configured services
      const services = this.configService.getAllServices();
      
      for (const service of services) {
        await this.initializeServiceInstances(service.name, service);
      }

      // Start monitoring instance stats
      this.startInstanceMonitoring();
      
      this.logger.info('Load Balancer initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Load Balancer:', error);
      throw error;
    }
  }

  private async initializeServiceInstances(serviceName: string, serviceConfig: ServiceConfig): Promise<void> {
    const instances: LoadBalancedInstance[] = [];

    for (const instance of serviceConfig.instances) {
      const loadBalancedInstance: LoadBalancedInstance = {
        id: instance.id,
        url: instance.url,
        isHealthy: instance.isHealthy,
        currentConnections: 0,
        responseTime: 0,
        errorRate: 0,
        lastUsed: new Date(),
        weight: serviceConfig.weight,
        priority: 1
      };

      instances.push(loadBalancedInstance);

      // Initialize stats tracking
      this.instanceStats.set(`${serviceName}:${instance.id}`, {
        connectionCount: 0,
        responseTimes: [],
        errorCount: 0,
        totalRequests: 0,
        lastHealthCheck: new Date()
      });
    }

    this.serviceInstances.set(serviceName, instances);
  }

  private startInstanceMonitoring(): void {
    setInterval(() => {
      this.cleanupOldStats();
    }, 60000); // Clean up every minute
  }

  private cleanupOldStats(): void {
    const maxResponseTimes = 100; // Keep only last 100 response times
    
    this.instanceStats.forEach((stats, key) => {
      if (stats.responseTimes.length > maxResponseTimes) {
        stats.responseTimes = stats.responseTimes.slice(-maxResponseTimes);
      }
    });
  }

  public selectInstance(serviceName: string): LoadBalancedInstance {
    const instances = this.serviceInstances.get(serviceName);
    
    if (!instances || instances.length === 0) {
      throw new Error(`No instances found for service: ${serviceName}`);
    }

    const healthyInstances = instances.filter(instance => instance.isHealthy);
    
    if (healthyInstances.length === 0) {
      this.logger.error(`No healthy instances available for service: ${serviceName}`);
      throw new Error(`No healthy instances available for service: ${serviceName}`);
    }

    try {
      const selectedInstance = this.strategy.selectInstance(healthyInstances);
      
      // Update instance usage
      this.recordInstanceUsage(serviceName, selectedInstance.id);
      
      return selectedInstance;
    } catch (error) {
      this.logger.error(`Load balancing failed for service ${serviceName}:`, error);
      throw error;
    }
  }

  public getLoadBalancer() {
    return {
      target: (req: any, res: any, proxyConfig: any) => {
        // Extract service name from path or use default
        let serviceName = this.extractServiceName(req.url);
        
        if (!serviceName) {
          throw new Error('Service name could not be determined');
        }

        try {
          const instance = this.selectInstance(serviceName);
          return instance.url + req.url;
        } catch (error) {
          this.logger.error(`Failed to select instance for ${serviceName}:`, error);
          res.status(503).json({
            error: 'Service Unavailable',
            message: `No healthy instances available for ${serviceName}`
          });
        }
      }
    };
  }

  private extractServiceName(url: string): string | null {
    // Extract service name from URL path
    // For example: /api/v1/auth/* -> auth-service
    const match = url.match(/^\/api\/v1\/(\w+)/);
    if (match) {
      const servicePath = match[1];
      
      // Map path to service name
      const serviceMap: Record<string, string> = {
        'auth': 'auth-service',
        'properties': 'property-service',
        'users': 'user-service'
      };
      
      return serviceMap[servicePath] || null;
    }
    
    return null;
  }

  public updateInstanceHealth(serviceName: string, instanceId: string, isHealthy: boolean): void {
    const instances = this.serviceInstances.get(serviceName);
    
    if (instances) {
      const instance = instances.find(inst => inst.id === instanceId);
      if (instance) {
        instance.isHealthy = isHealthy;
        this.logger.info(`Updated instance health: ${serviceName}/${instanceId} -> ${isHealthy ? 'healthy' : 'unhealthy'}`);
      }
    }
  }

  public recordInstanceUsage(serviceName: string, instanceId: string, responseTime?: number, hasError?: boolean): void {
    const instances = this.serviceInstances.get(serviceName);
    
    if (instances) {
      const instance = instances.find(inst => inst.id === instanceId);
      if (instance) {
        instance.lastUsed = new Date();
        
        if (responseTime !== undefined) {
          instance.responseTime = responseTime;
        }
        
        // Update stats
        const statsKey = `${serviceName}:${instanceId}`;
        const stats = this.instanceStats.get(statsKey);
        
        if (stats) {
          stats.connectionCount++;
          stats.totalRequests++;
          
          if (responseTime !== undefined) {
            stats.responseTimes.push(responseTime);
            
            // Calculate average response time
            const avgResponseTime = stats.responseTimes.reduce((sum, time) => sum + time, 0) / stats.responseTimes.length;
            instance.responseTime = Math.round(avgResponseTime);
          }
          
          if (hasError) {
            stats.errorCount++;
          }
          
          // Calculate error rate
          instance.errorRate = stats.totalRequests > 0 ? (stats.errorCount / stats.totalRequests) * 100 : 0;
        }
      }
    }
  }

  public getInstanceStats(serviceName: string, instanceId?: string): any {
    if (instanceId) {
      const statsKey = `${serviceName}:${instanceId}`;
      return this.instanceStats.get(statsKey);
    } else {
      // Return stats for all instances of the service
      const stats: any = {};
      this.instanceStats.forEach((statsValue, key) => {
        if (key.startsWith(`${serviceName}:`)) {
          const [, instanceId] = key.split(':');
          stats[instanceId] = statsValue;
        }
      });
      return stats;
    }
  }

  public getAllInstances(serviceName: string): LoadBalancedInstance[] {
    return this.serviceInstances.get(serviceName) || [];
  }

  public getServiceStatus(serviceName: string): {
    totalInstances: number;
    healthyInstances: number;
    unhealthyInstances: number;
    totalConnections: number;
    averageResponseTime: number;
    averageErrorRate: number;
  } {
    const instances = this.getAllInstances(serviceName);
    
    const healthyInstances = instances.filter(inst => inst.isHealthy);
    const totalConnections = instances.reduce((sum, inst) => sum + inst.currentConnections, 0);
    
    const responseTimes = instances.map(inst => inst.responseTime).filter(time => time > 0);
    const errorRates = instances.map(inst => inst.errorRate);
    
    const averageResponseTime = responseTimes.length > 0 
      ? Math.round(responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length)
      : 0;
      
    const averageErrorRate = errorRates.length > 0 
      ? Math.round((errorRates.reduce((sum, rate) => sum + rate, 0) / errorRates.length) * 100) / 100
      : 0;

    return {
      totalInstances: instances.length,
      healthyInstances: healthyInstances.length,
      unhealthyInstances: instances.length - healthyInstances.length,
      totalConnections,
      averageResponseTime,
      averageErrorRate
    };
  }

  public setStrategy(strategy: LoadBalancingStrategy): void {
    this.strategy = strategy;
    this.logger.info(`Load balancing strategy changed to: ${strategy.constructor.name}`);
  }

  public getCurrentStrategy(): string {
    return this.strategy.constructor.name;
  }

  public resetInstanceStats(serviceName: string, instanceId?: string): void {
    if (instanceId) {
      const statsKey = `${serviceName}:${instanceId}`;
      this.instanceStats.set(statsKey, {
        connectionCount: 0,
        responseTimes: [],
        errorCount: 0,
        totalRequests: 0,
        lastHealthCheck: new Date()
      });
    } else {
      // Reset all instances for the service
      this.instanceStats.forEach((_, key) => {
        if (key.startsWith(`${serviceName}:`)) {
          this.instanceStats.set(key, {
            connectionCount: 0,
            responseTimes: [],
            errorCount: 0,
            totalRequests: 0,
            lastHealthCheck: new Date()
          });
        }
      });
    }
    
    this.logger.info(`Reset instance stats for ${serviceName}${instanceId ? `/${instanceId}` : ''}`);
  }

  public async close(): Promise<void> {
    // Clean up monitoring intervals
    this.logger.info('Load Balancer closed');
  }
}