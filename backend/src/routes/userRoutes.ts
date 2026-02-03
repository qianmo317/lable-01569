import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();
const userController = new UserController();

// Public routes
router.post('/register', UserController.registerValidation, userController.register);
router.post('/login', UserController.loginValidation, userController.login);
router.get('/:id', userController.getUserById);

// Protected routes
router.get('/profile/me', authMiddleware, userController.getProfile);
router.put('/profile/me', authMiddleware, UserController.updateProfileValidation, userController.updateProfile);
router.put('/password', authMiddleware, UserController.changePasswordValidation, userController.changePassword);

export default router;
