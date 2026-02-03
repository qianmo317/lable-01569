import { Router } from 'express';
import { MessageController } from '../controllers/MessageController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();
const messageController = new MessageController();

// All routes require authentication
router.use(authMiddleware);

router.post('/', MessageController.sendValidation, messageController.send);
router.get('/conversations', messageController.getConversationList);
router.get('/conversations/:partnerId', messageController.getConversation);
router.put('/read', messageController.markAsRead);
router.get('/unread-count', messageController.getUnreadCount);

export default router;
