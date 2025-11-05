import { Request, Response, NextFunction } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { Logger } from '../utils/logger';

export interface ValidationRule {
  field: string;
  rules: any[];
  location: 'body' | 'query' | 'params' | 'headers';
}

export class RequestValidator {
  private logger: Logger;

  constructor() {
    this.logger = new Logger();
  }

  public validatePropertyRequests() {
    return [
      // Validate query parameters for property searches
      ...this.getPropertySearchValidationRules(),
      
      // Custom validation middleware
      (req: Request, res: Response, next: NextFunction) => {
        this.handleValidationErrors(req, res, next);
      }
    ];
  }

  public validateAuthRequests() {
    return [
      // Authentication endpoint validations
      ...this.getAuthValidationRules(),
      
      (req: Request, res: Response, next: NextFunction) => {
        this.handleValidationErrors(req, res, next);
      }
    ];
  }

  public validateUserRequests() {
    return [
      // User management endpoint validations
      ...this.getUserValidationRules(),
      
      (req: Request, res: Response, next: NextFunction) => {
        this.handleValidationErrors(req, res, next);
      }
    ];
  }

  private getPropertySearchValidationRules(): any[] {
    return [
      // Pagination validation
      query('page')
        .optional()
        .isInt({ min: 1, max: 1000 })
        .withMessage('Page must be an integer between 1 and 1000')
        .toInt(),
      
      query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be an integer between 1 and 100')
        .toInt(),
      
      // Price range validation
      query('minPrice')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Min price must be a positive number')
        .toFloat(),
      
      query('maxPrice')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Max price must be a positive number')
        .custom((value, { req }) => {
          if (req.query.minPrice && value && parseFloat(value) < parseFloat(req.query.minPrice)) {
            throw new Error('Max price must be greater than or equal to min price');
          }
          return true;
        }),
      
      // Location validation
      query('city')
        .optional()
        .isLength({ min: 1, max: 100 })
        .withMessage('City must be between 1 and 100 characters')
        .trim()
        .escape(),
      
      query('state')
        .optional()
        .isLength({ min: 2, max: 2 })
        .withMessage('State must be exactly 2 characters')
        .trim()
        .escape(),
      
      query('zipCode')
        .optional()
        .isPostalCode('US')
        .withMessage('Invalid ZIP code format')
        .trim()
        .escape(),
      
      // Property specifications validation
      query('propertyType')
        .optional()
        .isIn(['apartment', 'house', 'condo', 'townhouse', 'studio', 'loft'])
        .withMessage('Property type must be one of: apartment, house, condo, townhouse, studio, loft'),
      
      query('bedrooms')
        .optional()
        .isInt({ min: 0, max: 10 })
        .withMessage('Bedrooms must be between 0 and 10')
        .toInt(),
      
      query('bathrooms')
        .optional()
        .isFloat({ min: 0, max: 10 })
        .withMessage('Bathrooms must be between 0 and 10')
        .toFloat(),
      
      // Amenities validation
      query('amenities')
        .optional()
        .custom((value) => {
          if (typeof value === 'string') {
            const amenities = value.split(',').map(a => a.trim().toLowerCase());
            const validAmenities = ['parking', 'pool', 'gym', 'laundry', 'balcony', 'garden', 'pet-friendly', 'furnished'];
            const invalidAmenities = amenities.filter(a => !validAmenities.includes(a));
            
            if (invalidAmenities.length > 0) {
              throw new Error(`Invalid amenities: ${invalidAmenities.join(', ')}`);
            }
          }
          return true;
        }),
      
      // Date validation
      query('availableFrom')
        .optional()
        .isISO8601()
        .withMessage('Available from date must be in ISO 8601 format')
        .toDate(),
      
      query('availableTo')
        .optional()
        .isISO8601()
        .withMessage('Available to date must be in ISO 8601 format')
        .toDate()
        .custom((value, { req }) => {
          if (req.query.availableFrom && value && new Date(value) < new Date(req.query.availableFrom)) {
            throw new Error('Available to date must be after available from date');
          }
          return true;
        }),
      
      // Search term validation
      query('search')
        .optional()
        .isLength({ min: 1, max: 200 })
        .withMessage('Search term must be between 1 and 200 characters')
        .trim()
        .escape(),
      
      // Sort validation
      query('sort')
        .optional()
        .custom((value) => {
          if (value && !value.match(/^[a-zA-Z_]+:(asc|desc)$/)) {
            throw new Error('Sort format must be field:direction (e.g., price:asc)');
          }
          return true;
        })
    ];
  }

  private getAuthValidationRules(): any[] {
    return [
      // Login validation
      body('email')
        .if(body('email').exists())
        .isEmail()
        .withMessage('Invalid email format')
        .normalizeEmail(),
      
      body('password')
        .if(body('email').exists())
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
      
      // Registration validation
      body('firstName')
        .if(body('firstName').exists())
        .isLength({ min: 1, max: 50 })
        .withMessage('First name must be between 1 and 50 characters')
        .trim()
        .escape(),
      
      body('lastName')
        .if(body('lastName').exists())
        .isLength({ min: 1, max: 50 })
        .withMessage('Last name must be between 1 and 50 characters')
        .trim()
        .escape(),
      
      body('phone')
        .optional()
        .isMobilePhone('any')
        .withMessage('Invalid phone number format'),
      
      // Password reset validation
      body('token')
        .if(body('token').exists())
        .isLength({ min: 10 })
        .withMessage('Invalid token format'),
      
      // MFA validation
      body('mfaCode')
        .if(body('mfaCode').exists())
        .isLength({ min: 6, max: 6 })
        .withMessage('MFA code must be 6 digits')
        .isNumeric()
        .withMessage('MFA code must contain only numbers')
    ];
  }

  private getUserValidationRules(): any[] {
    return [
      // User ID parameter validation
      param('id')
        .if(param('id').exists())
        .isUUID()
        .withMessage('Invalid user ID format'),
      
      // Update user validation
      body('firstName')
        .optional()
        .isLength({ min: 1, max: 50 })
        .withMessage('First name must be between 1 and 50 characters')
        .trim()
        .escape(),
      
      body('lastName')
        .optional()
        .isLength({ min: 1, max: 50 })
        .withMessage('Last name must be between 1 and 50 characters')
        .trim()
        .escape(),
      
      body('phone')
        .optional()
        .isMobilePhone('any')
        .withMessage('Invalid phone number format'),
      
      body('avatarUrl')
        .optional()
        .isURL()
        .withMessage('Avatar URL must be a valid URL'),
      
      body('preferences')
        .optional()
        .isObject()
        .withMessage('Preferences must be an object'),
      
      // Role validation (for admin operations)
      body('role')
        .optional()
        .isIn(['user', 'landlord', 'admin', 'super_admin'])
        .withMessage('Invalid role'),
      
      // Status validation (for admin operations)
      body('status')
        .optional()
        .isIn(['active', 'inactive', 'suspended'])
        .withMessage('Invalid status')
    ];
  }

  private handleValidationErrors(req: Request, res: Response, next: NextFunction): void {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      this.logger.warn('Validation errors detected', {
        correlationId: (req as any).correlationId,
        method: req.method,
        url: req.url,
        errors: errors.array()
      });

      res.status(400).json({
        error: 'Validation Error',
        message: 'Request validation failed',
        code: 'VALIDATION_ERROR',
        details: {
          errors: errors.array().map(error => ({
            field: error.type === 'field' ? error.path : error.type,
            message: error.msg,
            value: error.value,
            location: error.type === 'field' ? error.location : 'unknown'
          }))
        },
        timestamp: new Date().toISOString(),
        correlationId: (req as any).correlationId
      });
      
      return;
    }

    next();
  }

  // File upload validation
  public validateFileUpload() {
    return [
      body('files')
        .custom((value, { req }) => {
          if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
            throw new Error('At least one file must be uploaded');
          }
          return true;
        }),
      
      body('files.*')
        .custom((file) => {
          const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
          if (!allowedTypes.includes(file.mimetype)) {
            throw new Error(`File type ${file.mimetype} is not allowed`);
          }
          
          if (file.size > 10 * 1024 * 1024) { // 10MB limit
            throw new Error('File size must not exceed 10MB');
          }
          
          return true;
        })
    ];
  }

  // Custom validation helpers
  public validateDateRange(startField: string, endField: string) {
    return body().custom((value, { req }) => {
      const start = req.body[startField];
      const end = req.body[endField];
      
      if (start && end && new Date(start) >= new Date(end)) {
        throw new Error(`${startField} must be before ${endField}`);
      }
      
      return true;
    });
  }

  public validateConditional(requiredField: string, conditionalField: string, requiredValue: any) {
    return body().custom((value, { req }) => {
      const conditional = req.body[conditionalField];
      
      if (conditional === requiredValue && (!req.body[requiredField] || req.body[requiredField] === '')) {
        throw new Error(`${requiredField} is required when ${conditionalField} is ${requiredValue}`);
      }
      
      return true;
    });
  }

  public validateArrayItems(field: string, allowedValues: string[]) {
    return body(field).optional().custom((items) => {
      if (Array.isArray(items)) {
        const invalidItems = items.filter(item => !allowedValues.includes(item));
        if (invalidItems.length > 0) {
          throw new Error(`Invalid items in ${field}: ${invalidItems.join(', ')}`);
        }
      }
      return true;
    });
  }

  // Rate limiting validation
  public validateRateLimit() {
    return [
      body('requests')
        .optional()
        .isInt({ min: 1, max: 1000 })
        .withMessage('Requests per minute must be between 1 and 1000'),
      
      body('window')
        .optional()
        .isIn(['1m', '5m', '15m', '1h', '1d'])
        .withMessage('Window must be one of: 1m, 5m, 15m, 1h, 1d')
    ];
  }

  // Pagination validation
  public validatePagination() {
    return [
      query('page')
        .isInt({ min: 1, max: 10000 })
        .withMessage('Page must be between 1 and 10000')
        .toInt(),
      
      query('limit')
        .isInt({ min: 1, max: 500 })
        .withMessage('Limit must be between 1 and 500')
        .toInt(),
      
      query('offset')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Offset must be a non-negative integer')
        .toInt()
    ];
  }

  // Search validation
  public validateSearch() {
    return [
      body('query')
        .optional()
        .isLength({ min: 1, max: 200 })
        .withMessage('Search query must be between 1 and 200 characters')
        .trim()
        .escape(),
      
      body('filters')
        .optional()
        .isObject()
        .withMessage('Filters must be an object'),
      
      body('sort')
        .optional()
        .isObject()
        .withMessage('Sort must be an object'),
      
      body('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Search limit must be between 1 and 100')
        .toInt()
    ];
  }
}