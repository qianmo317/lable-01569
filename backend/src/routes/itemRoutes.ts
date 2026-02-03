import { Router } from 'express';
import { ItemController } from '../controllers/ItemController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();
const itemController = new ItemController();

// Public routes
router.get('/search', ItemController.searchValidation, itemController.search);
router.get('/:id', itemController.getById);

// Protected routes
router.post('/', authMiddleware, ItemController.createValidation, itemController.create);
router.put('/:id', authMiddleware, ItemController.updateValidation, itemController.update);
router.delete('/:id', authMiddleware, itemController.delete);
router.get('/user/my-items', authMiddleware, itemController.getUserItems);

export default router;
