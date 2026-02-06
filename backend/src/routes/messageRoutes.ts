import { Router } from 'express';
import { MessageController } from '../controllers/MessageController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();
const messageController = new MessageController();

// All routes require authentication
router.use(authMiddleware);

/**
 * @swagger
 * /messages:
 *   post:
 *     summary: 发送消息
 *     tags: [消息系统]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SendMessageRequest'
 *     responses:
 *       201:
 *         description: 发送成功
 *       400:
 *         description: 不能给自己发送消息
 *       401:
 *         description: 未认证
 *       404:
 *         description: 接收者不存在
 */
router.post('/', MessageController.sendValidation, messageController.send);

/**
 * @swagger
 * /messages/conversations:
 *   get:
 *     summary: 获取会话列表
 *     tags: [消息系统]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ConversationSummary'
 *       401:
 *         description: 未认证
 */
router.get('/conversations', messageController.getConversationList);

/**
 * @swagger
 * /messages/conversations/{partnerId}:
 *   get:
 *     summary: 获取与指定用户的会话消息
 *     tags: [消息系统]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: partnerId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 对方用户ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: 成功
 *       401:
 *         description: 未认证
 */
router.get('/conversations/:partnerId', messageController.getConversation);

/**
 * @swagger
 * /messages/read:
 *   put:
 *     summary: 标记消息为已读
 *     tags: [消息系统]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - messageIds
 *             properties:
 *               messageIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3]
 *     responses:
 *       200:
 *         description: 标记成功
 *       401:
 *         description: 未认证
 */
router.put('/read', messageController.markAsRead);

/**
 * @swagger
 * /messages/unread-count:
 *   get:
 *     summary: 获取未读消息数量
 *     tags: [消息系统]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
 *       401:
 *         description: 未认证
 */
router.get('/unread-count', messageController.getUnreadCount);

export default router;
