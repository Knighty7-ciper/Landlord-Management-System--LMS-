import { config } from 'dotenv';
import { Database } from './database';
import { RedisClient } from './redis';
import { Logger } from './logger';
import { Server } from './server';

// Load environment variables
config();

export class App {
  private database: Database;
  private redis: RedisClient;
  private logger: Logger;
  private server: Server;

  constructor() {
    this.logger = new Logger();
    this.database = new Database();
    this.redis = new RedisClient();
    this.server = new Server();
  }

  async initialize(): Promise<void> {
    try {
      this.logger.info('Starting authentication service...');

      // Initialize database connection
      await this.database.connect();
      this.logger.info('Database connection established');

      // Initialize Redis connection
      await this.redis.connect();
      this.logger.info('Redis connection established');

      // Initialize HTTP server
      await this.server.initialize(this.database, this.redis, this.logger);
      this.logger.info('HTTP server initialized');

      this.logger.info('Authentication service started successfully');
    } catch (error) {
      this.logger.error('Failed to start authentication service:', error);
      process.exit(1);
    }
  }

  async shutdown(): Promise<void> {
    try {
      this.logger.info('Shutting down authentication service...');

      await this.database.disconnect();
      await this.redis.disconnect();
      await this.server.shutdown();

      this.logger.info('Authentication service shutdown complete');
    } catch (error) {
      this.logger.error('Error during shutdown:', error);
    }
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  const app = new App();
  await app.shutdown();
  process.exit(0);
});

process.on('SIGINT', async () => {
  const app = new App();
  await app.shutdown();
  process.exit(0);
});

// Start the application
if (require.main === module) {
  const app = new App();
  app.initialize().catch(console.error);
}