import { Database } from '../config/database';
import { Logger } from '../config/logger';
import { v4 as uuidv4 } from 'uuid';

export class AuditLogger {
  private database: Database;
  private logger: Logger;

  constructor() {
    this.database = new Database();
    this.logger = new Logger();
  }

  async log(
    userId: string | 'system',
    action: string,
    details: any = {},
    clientIp: string = 'unknown',
    userAgent: string = 'unknown',
    resourceId?: string,
    result: 'success' | 'failure' | 'pending' = 'success'
  ): Promise<void> {
    try {
      const auditLogId = uuidv4();
      const timestamp = new Date();

      // Format details as JSON string for database storage
      const detailsJson = JSON.stringify(details);

      // Store in database
      await this.database.query(`
        INSERT INTO audit_logs (
          id, user_id, action, details, client_ip, user_agent, 
          resource_id, result, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        auditLogId,
        userId === 'system' ? null : userId,
        action,
        detailsJson,
        clientIp,
        userAgent,
        resourceId || null,
        result,
        timestamp
      ]);

      // Also log to application logger for real-time monitoring
      this.logger.info('Audit log recorded', {
        auditLogId,
        userId,
        action,
        result,
        clientIp
      });

    } catch (error) {
      this.logger.error('Failed to record audit log:', {
        error,
        userId,
        action,
        details,
        clientIp
      });
      
      // Don't throw the error to avoid breaking the main operation
      // just log the failure
    }
  }

  async logUserAction(
    userId: string,
    action: string,
    details: any,
    clientIp: string = 'unknown',
    userAgent: string = 'unknown'
  ): Promise<void> {
    await this.log(userId, action, details, clientIp, userAgent, userId, 'success');
  }

  async logSecurityEvent(
    userId: string | 'system',
    eventType: string,
    details: any,
    clientIp: string = 'unknown',
    userAgent: string = 'unknown'
  ): Promise<void> {
    await this.log(userId, `security_${eventType}`, details, clientIp, userAgent, userId, 'success');
  }

  async logDataAccess(
    userId: string,
    resource: string,
    operation: 'create' | 'read' | 'update' | 'delete',
    resourceId?: string,
    clientIp: string = 'unknown',
    userAgent: string = 'unknown',
    details: any = {}
  ): Promise<void> {
    const action = `data_${operation}`;
    const fullDetails = { resource, ...details };
    
    await this.log(userId, action, fullDetails, clientIp, userAgent, resourceId, 'success');
  }

  async logSystemEvent(
    event: string,
    details: any,
    result: 'success' | 'failure' | 'pending' = 'success'
  ): Promise<void> {
    await this.log('system', `system_${event}`, details, 'system', 'system', undefined, result);
  }

  async logBusinessEvent(
    userId: string,
    event: string,
    details: any,
    clientIp: string = 'unknown',
    userAgent: string = 'unknown'
  ): Promise<void> {
    await this.log(userId, `business_${event}`, details, clientIp, userAgent, undefined, 'success');
  }

  async getAuditLogs(
    userId?: string,
    action?: string,
    startDate?: Date,
    endDate?: Date,
    limit: number = 100,
    offset: number = 0
  ): Promise<any[]> {
    try {
      let query = `
        SELECT al.*, u.email, u.first_name, u.last_name
        FROM audit_logs al
        LEFT JOIN users u ON al.user_id = u.id
        WHERE 1=1
      `;
      
      const params: any[] = [];
      let paramIndex = 1;

      if (userId) {
        query += ` AND al.user_id = $${paramIndex++}`;
        params.push(userId);
      }

      if (action) {
        query += ` AND al.action = $${paramIndex++}`;
        params.push(action);
      }

      if (startDate) {
        query += ` AND al.created_at >= $${paramIndex++}`;
        params.push(startDate);
      }

      if (endDate) {
        query += ` AND al.created_at <= $${paramIndex++}`;
        params.push(endDate);
      }

      query += ` ORDER BY al.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
      params.push(limit, offset);

      const result = await this.database.query(query, params);
      return result.rows;

    } catch (error) {
      this.logger.error('Failed to get audit logs:', error);
      return [];
    }
  }

  async getAuditLogsByDateRange(
    startDate: Date,
    endDate: Date,
    action?: string,
    limit: number = 1000
  ): Promise<any[]> {
    try {
      let query = `
        SELECT al.*, u.email, u.first_name, u.last_name
        FROM audit_logs al
        LEFT JOIN users u ON al.user_id = u.id
        WHERE al.created_at >= $1 AND al.created_at <= $2
      `;
      
      const params: any[] = [startDate, endDate];
      let paramIndex = 3;

      if (action) {
        query += ` AND al.action = $${paramIndex++}`;
        params.push(action);
      }

      query += ` ORDER BY al.created_at DESC LIMIT $${paramIndex++}`;
      params.push(limit);

      const result = await this.database.query(query, params);
      return result.rows;

    } catch (error) {
      this.logger.error('Failed to get audit logs by date range:', error);
      return [];
    }
  }

  async getUserActivitySummary(userId: string, days: number = 30): Promise<any> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const result = await this.database.query(`
        SELECT 
          COUNT(*) as total_actions,
          COUNT(DISTINCT DATE(created_at)) as active_days,
          string_agg(DISTINCT action, ', ') as actions_performed
        FROM audit_logs 
        WHERE user_id = $1 
        AND created_at >= $2
      `, [userId, startDate]);

      return result.rows[0];

    } catch (error) {
      this.logger.error('Failed to get user activity summary:', error);
      return null;
    }
  }

  async getSecurityEvents(
    startDate: Date,
    endDate: Date,
    limit: number = 100
  ): Promise<any[]> {
    try {
      const result = await this.database.query(`
        SELECT al.*, u.email, u.first_name, u.last_name
        FROM audit_logs al
        LEFT JOIN users u ON al.user_id = u.id
        WHERE al.action LIKE 'security_%'
        AND al.created_at >= $1 
        AND al.created_at <= $2
        AND al.result = 'failure'
        ORDER BY al.created_at DESC
        LIMIT $3
      `, [startDate, endDate, limit]);

      return result.rows;

    } catch (error) {
      this.logger.error('Failed to get security events:', error);
      return [];
    }
  }
}