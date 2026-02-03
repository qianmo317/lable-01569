import { Router } from 'express';
import { CategoryController } from '../controllers/CategoryController';
import { authMiddleware, adminMiddleware } from '../middlewares/auth';

const router = Router();
const categoryController = new CategoryController();

// Public routes
router.get('/', categoryController.getAll);
router.get('/items', categoryController.getItemCategories);
router.get('/resources', categoryController.getResourceCategories);
router.get('/:id', categoryController.getById);

// Admin routes
router.post('/', authMiddleware, adminMiddleware, CategoryController.createValidation, categoryController.create);
router.put('/:id', authMiddleware, adminMiddleware, CategoryController.updateValidation, categoryController.update);
router.delete('/:id', authMiddleware, adminMiddleware, categoryController.delete);

export default router;
