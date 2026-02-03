import { Router } from 'express';
import userRoutes from './userRoutes';
import itemRoutes from './itemRoutes';
import transactionRoutes from './transactionRoutes';
import resourceRoutes from './resourceRoutes';
import categoryRoutes from './categoryRoutes';
import messageRoutes from './messageRoutes';

const router = Router();

router.use('/users', userRoutes);
router.use('/items', itemRoutes);
router.use('/transactions', transactionRoutes);
router.use('/resources', resourceRoutes);
router.use('/categories', categoryRoutes);
router.use('/messages', messageRoutes);

export default router;
