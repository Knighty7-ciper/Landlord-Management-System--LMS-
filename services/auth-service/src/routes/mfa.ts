import { Router } from 'express';
import { MfaController } from '../controllers/mfa';
import { AuthMiddleware } from '../middleware/auth';
import { ValidationMiddleware } from '../middleware/validation';

const router = Router();
const mfaController = new MfaController();
const authMiddleware = new AuthMiddleware();
const validationMiddleware = new ValidationMiddleware();

// All MFA routes require authentication
router.post('/enable', 
  authMiddleware.authenticate,
  mfaController.enableMfa
);

router.post('/verify-setup', 
  authMiddleware.authenticate,
  validationMiddleware.validateMfaVerification,
  mfaController.verifyMfaSetup
);

router.post('/disable', 
  authMiddleware.authenticate,
  validationMiddleware.validateMfaVerification,
  mfaController.disableMfa
);

router.post('/generate-code', 
  authMiddleware.authenticate,
  mfaController.generateMfaCode
);

export default router;