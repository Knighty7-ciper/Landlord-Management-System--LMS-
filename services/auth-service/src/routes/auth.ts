import { Router } from 'express';
import { AuthController } from '../controllers/auth';
import { AuthMiddleware } from '../middleware/auth';
import { ValidationMiddleware } from '../middleware/validation';
import rateLimit from 'express-rate-limit';

const router = Router();
const authController = new AuthController();
const authMiddleware = new AuthMiddleware();
const validationMiddleware = new ValidationMiddleware();

// Rate limiting for auth endpoints
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to sensitive endpoints
router.post('/register', authRateLimit, 
  validationMiddleware.validateRegistration,
  authController.register
);

router.post('/login', authRateLimit,
  validationMiddleware.validateLogin,
  authController.login
);

router.post('/logout',
  authMiddleware.authenticate,
  authController.logout
);

router.post('/refresh-token',
  authMiddleware.validateRefreshToken,
  authController.refreshToken
);

router.post('/forgot-password',
  authRateLimit,
  validationMiddleware.validatePasswordReset,
  authController.forgotPassword
);

router.post('/reset-password',
  authRateLimit,
  validationMiddleware.validatePasswordResetConfirm,
  authController.resetPassword
);

router.post('/change-password',
  authMiddleware.authenticate,
  validationMiddleware.validateChangePassword,
  authController.changePassword
);

router.post('/verify-email/:token',
  authController.verifyEmail
);

router.get('/me',
  authMiddleware.authenticate,
  authController.getCurrentUser
);

router.post('/verify-mfa/:token',
  authMiddleware.authenticate,
  validationMiddleware.validateMfaVerification,
  authController.verifyMfa
);

export default router;