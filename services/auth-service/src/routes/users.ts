import { Router } from 'express';
import { UserController } from '../controllers/user';
import { AuthMiddleware } from '../middleware/auth';
import { ValidationMiddleware } from '../middleware/validation';
import { UserRole } from '../types/auth';

const router = Router();
const userController = new UserController();
const authMiddleware = new AuthMiddleware();
const validationMiddleware = new ValidationMiddleware();

// Protected routes - require authentication
router.get('/', 
  authMiddleware.authenticate,
  authMiddleware.authorize(UserRole.SUPER_ADMIN),
  userController.getAllUsers
);

router.get('/me', 
  authMiddleware.authenticate,
  userController.getCurrentUser
);

router.get('/:id', 
  authMiddleware.authenticate,
  authMiddleware.authorize(UserRole.SUPER_ADMIN, UserRole.LANDLORD, UserRole.PROPERTY_MANAGER),
  userController.getUserById
);

router.patch('/me', 
  authMiddleware.authenticate,
  validationMiddleware.validateUpdateProfile,
  userController.updateCurrentUser
);

router.patch('/:id', 
  authMiddleware.authenticate,
  authMiddleware.authorize(UserRole.SUPER_ADMIN),
  validationMiddleware.validateUpdateProfile,
  userController.updateUser
);

router.post('/:id/deactivate', 
  authMiddleware.authenticate,
  authMiddleware.authorize(UserRole.SUPER_ADMIN),
  userController.deactivateUser
);

router.post('/:id/activate', 
  authMiddleware.authenticate,
  authMiddleware.authorize(UserRole.SUPER_ADMIN),
  userController.activateUser
);

router.delete('/:id', 
  authMiddleware.authenticate,
  authMiddleware.authorize(UserRole.SUPER_ADMIN),
  userController.deleteUser
);

export default router;