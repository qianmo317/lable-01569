import { Router } from 'express';
import { TransactionController } from '../controllers/TransactionController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();
const transactionController = new TransactionController();

// All routes require authentication
router.use(authMiddleware);

/**
 * @swagger
 * /transactions:
 *   post:
 *     summary: 发起交易请求
 *     tags: [交易管理]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTransactionRequest'
 *     responses:
 *       201:
 *         description: 交易请求已发送
 *       400:
 *         description: 物品不可购买或已有待处理交易
 *       401:
 *         description: 未认证
 */
router.post('/', TransactionController.createValidation, transactionController.create);

/**
 * @swagger
 * /transactions/my-transactions:
 *   get:
 *     summary: 获取我的交易列表
 *     tags: [交易管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [buyer, seller, all]
 *           default: all
 *         description: 角色筛选
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, accepted, rejected, paid, shipped, completed, cancelled, disputed]
 *         description: 状态筛选
 *     responses:
 *       200:
 *         description: 成功
 *       401:
 *         description: 未认证
 */
router.get('/my-transactions', transactionController.getUserTransactions);

/**
 * @swagger
 * /transactions/item/{itemId}:
 *   get:
 *     summary: 获取物品的交易记录
 *     tags: [交易管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 物品ID
 *     responses:
 *       200:
 *         description: 成功
 *       401:
 *         description: 未认证
 */
router.get('/item/:itemId', transactionController.getItemTransactions);

/**
 * @swagger
 * /transactions/{id}:
 *   get:
 *     summary: 获取交易详情
 *     tags: [交易管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 交易ID
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
 *                   $ref: '#/components/schemas/Transaction'
 *       401:
 *         description: 未认证
 *       403:
 *         description: 无权查看
 *       404:
 *         description: 交易不存在
 */
router.get('/:id', transactionController.getById);

/**
 * @swagger
 * /transactions/{id}/accept:
 *   put:
 *     summary: 卖家接受交易
 *     tags: [交易管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 交易ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               finalPrice:
 *                 type: number
 *               meetingLocation:
 *                 type: string
 *               meetingTime:
 *                 type: string
 *                 format: date-time
 *               sellerNote:
 *                 type: string
 *     responses:
 *       200:
 *         description: 已接受交易
 *       400:
 *         description: 当前状态不能接受交易
 *       401:
 *         description: 未认证
 *       403:
 *         description: 无权操作
 */
router.put('/:id/accept', transactionController.accept);

/**
 * @swagger
 * /transactions/{id}/reject:
 *   put:
 *     summary: 卖家拒绝交易
 *     tags: [交易管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               note:
 *                 type: string
 *     responses:
 *       200:
 *         description: 已拒绝交易
 *       400:
 *         description: 当前状态不能拒绝交易
 *       401:
 *         description: 未认证
 *       403:
 *         description: 无权操作
 */
router.put('/:id/reject', transactionController.reject);

/**
 * @swagger
 * /transactions/{id}/pay:
 *   put:
 *     summary: 买家标记已付款
 *     tags: [交易管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               paymentMethod:
 *                 type: string
 *                 enum: [cash, alipay, wechat, bank_transfer]
 *     responses:
 *       200:
 *         description: 已标记为已付款
 *       400:
 *         description: 当前状态不能标记付款
 *       401:
 *         description: 未认证
 *       403:
 *         description: 无权操作
 */
router.put('/:id/pay', transactionController.markAsPaid);

/**
 * @swagger
 * /transactions/{id}/ship:
 *   put:
 *     summary: 卖家标记已发货
 *     tags: [交易管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 已标记为已发货
 *       400:
 *         description: 当前状态不能标记发货
 *       401:
 *         description: 未认证
 *       403:
 *         description: 无权操作
 */
router.put('/:id/ship', transactionController.markAsShipped);

/**
 * @swagger
 * /transactions/{id}/complete:
 *   put:
 *     summary: 买家确认收货完成交易
 *     tags: [交易管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 交易已完成
 *       400:
 *         description: 当前状态不能完成交易
 *       401:
 *         description: 未认证
 *       403:
 *         description: 无权操作
 */
router.put('/:id/complete', transactionController.complete);

/**
 * @swagger
 * /transactions/{id}/cancel:
 *   put:
 *     summary: 取消交易
 *     tags: [交易管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               note:
 *                 type: string
 *     responses:
 *       200:
 *         description: 交易已取消
 *       400:
 *         description: 当前状态不能取消交易
 *       401:
 *         description: 未认证
 *       403:
 *         description: 无权操作
 */
router.put('/:id/cancel', transactionController.cancel);

/**
 * @swagger
 * /transactions/{id}/rate/seller:
 *   post:
 *     summary: 卖家评价买家
 *     tags: [交易管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RateRequest'
 *     responses:
 *       200:
 *         description: 评价成功
 *       400:
 *         description: 只能对已完成的交易评价或已评价过
 *       401:
 *         description: 未认证
 *       403:
 *         description: 无权操作
 */
router.post('/:id/rate/seller', TransactionController.rateValidation, transactionController.rateBySeller);

/**
 * @swagger
 * /transactions/{id}/rate/buyer:
 *   post:
 *     summary: 买家评价卖家
 *     tags: [交易管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RateRequest'
 *     responses:
 *       200:
 *         description: 评价成功
 *       400:
 *         description: 只能对已完成的交易评价或已评价过
 *       401:
 *         description: 未认证
 *       403:
 *         description: 无权操作
 */
router.post('/:id/rate/buyer', TransactionController.rateValidation, transactionController.rateByBuyer);

export default router;
