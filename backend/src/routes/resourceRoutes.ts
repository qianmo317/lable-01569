import { Router } from 'express';
import { SharedResourceController } from '../controllers/SharedResourceController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();
const resourceController = new SharedResourceController();

// Public routes
router.get('/search', resourceController.search);
router.get('/:id', resourceController.getById);

// Protected routes - Resources
router.post('/', authMiddleware, SharedResourceController.createValidation, resourceController.create);
router.put('/:id', authMiddleware, SharedResourceController.updateValidation, resourceController.update);
router.delete('/:id', authMiddleware, resourceController.delete);
router.get('/user/my-resources', authMiddleware, resourceController.getUserResources);

// Protected routes - Borrows
router.post('/borrows', authMiddleware, SharedResourceController.borrowValidation, resourceController.createBorrowRequest);
router.get('/borrows/my-borrows', authMiddleware, resourceController.getUserBorrows);
router.get('/borrows/:id', authMiddleware, resourceController.getBorrowById);
router.put('/borrows/:id/approve', authMiddleware, resourceController.approveBorrow);
router.put('/borrows/:id/reject', authMiddleware, resourceController.rejectBorrow);
router.put('/borrows/:id/start', authMiddleware, resourceController.startBorrow);
router.put('/borrows/:id/return', authMiddleware, resourceController.returnResource);
router.put('/borrows/:id/confirm-return', authMiddleware, resourceController.confirmReturn);
router.post('/borrows/:id/rate', authMiddleware, SharedResourceController.rateValidation, resourceController.rateBorrow);
router.get('/:resourceId/borrows', authMiddleware, resourceController.getResourceBorrows);

export default router;
