import { Router } from 'express';
import { TransactionController } from '../controllers/TransactionController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();
const transactionController = new TransactionController();

// All routes require authentication
router.use(authMiddleware);

router.post('/', TransactionController.createValidation, transactionController.create);
router.get('/my-transactions', transactionController.getUserTransactions);
router.get('/item/:itemId', transactionController.getItemTransactions);
router.get('/:id', transactionController.getById);
router.put('/:id/accept', transactionController.accept);
router.put('/:id/reject', transactionController.reject);
router.put('/:id/pay', transactionController.markAsPaid);
router.put('/:id/ship', transactionController.markAsShipped);
router.put('/:id/complete', transactionController.complete);
router.put('/:id/cancel', transactionController.cancel);
router.post('/:id/rate/seller', TransactionController.rateValidation, transactionController.rateBySeller);
router.post('/:id/rate/buyer', TransactionController.rateValidation, transactionController.rateByBuyer);

export default router;
