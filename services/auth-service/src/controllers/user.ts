import { Request, Response } from 'express';
import { Database } from '../config/database';
import { Logger } from '../config/logger';
import { UpdateUserRequest, User, UserRole } from '../types/auth';
import { v4 as uuidv4 } from 'uuid';
import { AuditLogger } from '../services/audit';

export class UserController {
  private database: Database;
  private logger: Logger;
  private auditLogger: AuditLogger;

  constructor() {
    this.database = new Database();
    this.logger = new Logger();
    this.auditLogger = new AuditLogger();
  }

  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const { page = '1', limit = '10', search, role, status } = req.query;
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      let query = `
        SELECT id, email, first_name, last_name, phone, role, status,
               email_verified, phone_verified, mfa_enabled, avatar_url,
               last_login_at, created_at, updated_at
        FROM users 
        WHERE deleted_at IS NULL
      `;
      
      const params: any[] = [];
      let paramIndex = 1;

      if (search) {
        query += ` AND (email ILIKE $${paramIndex} OR first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex})`;
        params.push(`%${search}%`);
        paramIndex++;
      }

      if (role) {
        query += ` AND role = $${paramIndex}`;
        params.push(role);
        paramIndex++;
      }

      if (status) {
        query += ` AND status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }

      query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limitNum, offset);

      const result = await this.database.query(query, params);
      
      // Get total count for pagination
      let countQuery = `
        SELECT COUNT(*) as total
        FROM users 
        WHERE deleted_at IS NULL
      `;
      
      if (search || role || status) {
        let countParams = [...params.slice(0, -2)]; // Remove LIMIT and OFFSET params
        let countIndex = 1;
        
        if (search) {
          countQuery += ` AND (email ILIKE $${countIndex} OR first_name ILIKE $${countIndex} OR last_name ILIKE $${countIndex})`;
          countParams.push(`%${search}%`);
          countIndex++;
        }
        
        if (role) {
          countQuery += ` AND role = $${countIndex}`;
          countParams.push(role);
          countIndex++;
        }
        
        if (status) {
          countQuery += ` AND status = $${countIndex}`;
          countParams.push(status);
          countIndex++;
        }
        
        const countResult = await this.database.query(countQuery, countParams);
        const total = parseInt(countResult.rows[0].total);
        const totalPages = Math.ceil(total / limitNum);

        res.json({
          users: result.rows,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages,
            hasNext: pageNum < totalPages,
            hasPrev: pageNum > 1
          }
        });
      } else {
        res.json({
          users: result.rows,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: result.rows.length,
            totalPages: Math.ceil(result.rows.length / limitNum)
          }
        });
      }

    } catch (error) {
      this.logger.error('Get all users error:', error);
      res.status(500).json({
        error: 'Failed to Get Users',
        message: 'An error occurred while fetching users'
      });
    }
  }

  async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user as User;
      res.json({ user });
    } catch (error) {
      this.logger.error('Get current user error:', error);
      res.status(500).json({
        error: 'Failed to Get User',
        message: 'An error occurred while fetching user data'
      });
    }
  }

  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const currentUser = (req as any).user as User;

      // Check if user can access this user's data
      if (currentUser.role !== UserRole.SUPER_ADMIN && currentUser.id !== id) {
        res.status(403).json({
          error: 'Access Denied',
          message: 'You can only access your own user data'
        });
        return;
      }

      const result = await this.database.query(`
        SELECT id, email, first_name, last_name, phone, role, status,
               email_verified, phone_verified, mfa_enabled, avatar_url,
               preferences, last_login_at, created_at, updated_at
        FROM users 
        WHERE id = $1 AND deleted_at IS NULL
      `, [id]);

      if (result.rows.length === 0) {
        res.status(404).json({
          error: 'User Not Found',
          message: 'User not found'
        });
        return;
      }

      const user: User = result.rows[0];
      res.json({ user });

    } catch (error) {
      this.logger.error('Get user by ID error:', error);
      res.status(500).json({
        error: 'Failed to Get User',
        message: 'An error occurred while fetching user data'
      });
    }
  }

  async updateCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user as User;
      const updateData: UpdateUserRequest = req.body;

      const result = await this.database.query(`
        UPDATE users 
        SET first_name = COALESCE($1, first_name),
            last_name = COALESCE($2, last_name),
            phone = COALESCE($3, phone),
            avatar_url = COALESCE($4, avatar_url),
            preferences = COALESCE($5, preferences),
            updated_at = NOW()
        WHERE id = $6
        RETURNING id, email, first_name, last_name, phone, role, status,
                  email_verified, phone_verified, mfa_enabled, avatar_url,
                  preferences, last_login_at, created_at, updated_at
      `, [
        updateData.first_name,
        updateData.last_name,
        updateData.phone,
        updateData.avatar_url,
        updateData.preferences ? JSON.stringify(updateData.preferences) : null,
        user.id
      ]);

      const updatedUser: User = result.rows[0];

      // Log the update
      await this.auditLogger.logUserAction(
        user.id,
        'profile_updated',
        { updated_fields: Object.keys(updateData) },
        req.ip || 'unknown',
        req.headers['user-agent'] || 'unknown'
      );

      res.json({
        message: 'Profile updated successfully',
        user: updatedUser
      });

    } catch (error) {
      this.logger.error('Update current user error:', error);
      res.status(500).json({
        error: 'Update Failed',
        message: 'An error occurred while updating profile'
      });
    }
  }

  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: UpdateUserRequest = req.body;
      const currentUser = (req as any).user as User;

      // Only super admin can update other users
      if (currentUser.role !== UserRole.SUPER_ADMIN) {
        res.status(403).json({
          error: 'Access Denied',
          message: 'Only super administrators can update other users'
        });
        return;
      }

      const result = await this.database.query(`
        UPDATE users 
        SET first_name = COALESCE($1, first_name),
            last_name = COALESCE($2, last_name),
            phone = COALESCE($3, phone),
            avatar_url = COALESCE($4, avatar_url),
            preferences = COALESCE($5, preferences),
            updated_at = NOW()
        WHERE id = $6 AND deleted_at IS NULL
        RETURNING id, email, first_name, last_name, phone, role, status,
                  email_verified, phone_verified, mfa_enabled, avatar_url,
                  preferences, last_login_at, created_at, updated_at
      `, [
        updateData.first_name,
        updateData.last_name,
        updateData.phone,
        updateData.avatar_url,
        updateData.preferences ? JSON.stringify(updateData.preferences) : null,
        id
      ]);

      if (result.rows.length === 0) {
        res.status(404).json({
          error: 'User Not Found',
          message: 'User not found'
        });
        return;
      }

      const updatedUser: User = result.rows[0];

      // Log the update
      await this.auditLogger.logUserAction(
        currentUser.id,
        'user_updated',
        { target_user_id: id, updated_fields: Object.keys(updateData) },
        req.ip || 'unknown',
        req.headers['user-agent'] || 'unknown'
      );

      res.json({
        message: 'User updated successfully',
        user: updatedUser
      });

    } catch (error) {
      this.logger.error('Update user error:', error);
      res.status(500).json({
        error: 'Update Failed',
        message: 'An error occurred while updating user'
      });
    }
  }

  async deactivateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const currentUser = (req as any).user as User;

      if (currentUser.role !== UserRole.SUPER_ADMIN) {
        res.status(403).json({
          error: 'Access Denied',
          message: 'Only super administrators can deactivate users'
        });
        return;
      }

      const result = await this.database.query(`
        UPDATE users 
        SET status = 'inactive', updated_at = NOW()
        WHERE id = $1 AND deleted_at IS NULL
        RETURNING id, email, status, updated_at
      `, [id]);

      if (result.rows.length === 0) {
        res.status(404).json({
          error: 'User Not Found',
          message: 'User not found'
        });
        return;
      }

      await this.auditLogger.logUserAction(
        currentUser.id,
        'user_deactivated',
        { target_user_id: id },
        req.ip || 'unknown',
        req.headers['user-agent'] || 'unknown'
      );

      res.json({
        message: 'User deactivated successfully',
        user: result.rows[0]
      });

    } catch (error) {
      this.logger.error('Deactivate user error:', error);
      res.status(500).json({
        error: 'Deactivation Failed',
        message: 'An error occurred while deactivating user'
      });
    }
  }

  async activateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const currentUser = (req as any).user as User;

      if (currentUser.role !== UserRole.SUPER_ADMIN) {
        res.status(403).json({
          error: 'Access Denied',
          message: 'Only super administrators can activate users'
        });
        return;
      }

      const result = await this.database.query(`
        UPDATE users 
        SET status = 'active', updated_at = NOW()
        WHERE id = $1 AND deleted_at IS NULL
        RETURNING id, email, status, updated_at
      `, [id]);

      if (result.rows.length === 0) {
        res.status(404).json({
          error: 'User Not Found',
          message: 'User not found'
        });
        return;
      }

      await this.auditLogger.logUserAction(
        currentUser.id,
        'user_activated',
        { target_user_id: id },
        req.ip || 'unknown',
        req.headers['user-agent'] || 'unknown'
      );

      res.json({
        message: 'User activated successfully',
        user: result.rows[0]
      });

    } catch (error) {
      this.logger.error('Activate user error:', error);
      res.status(500).json({
        error: 'Activation Failed',
        message: 'An error occurred while activating user'
      });
    }
  }

  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const currentUser = (req as any).user as User;

      if (currentUser.role !== UserRole.SUPER_ADMIN) {
        res.status(403).json({
          error: 'Access Denied',
          message: 'Only super administrators can delete users'
        });
        return;
      }

      // Soft delete - mark as deleted instead of actually deleting
      const result = await this.database.query(`
        UPDATE users 
        SET deleted_at = NOW(), updated_at = NOW()
        WHERE id = $1 AND deleted_at IS NULL
        RETURNING id, email, status, deleted_at
      `, [id]);

      if (result.rows.length === 0) {
        res.status(404).json({
          error: 'User Not Found',
          message: 'User not found or already deleted'
        });
        return;
      }

      await this.auditLogger.logUserAction(
        currentUser.id,
        'user_deleted',
        { target_user_id: id },
        req.ip || 'unknown',
        req.headers['user-agent'] || 'unknown'
      );

      res.json({
        message: 'User deleted successfully',
        user: result.rows[0]
      });

    } catch (error) {
      this.logger.error('Delete user error:', error);
      res.status(500).json({
        error: 'Deletion Failed',
        message: 'An error occurred while deleting user'
      });
    }
  }
}