import { Router } from 'express';
import { SharedResourceController } from '../controllers/SharedResourceController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();
const resourceController = new SharedResourceController();

/**
 * @swagger
 * /resources/search:
 *   get:
 *     summary: 搜索共享资源
 *     tags: [资源共享]
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: 搜索关键词
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [book, tool, device, other]
 *         description: 资源类型
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: integer
 *         description: 分类ID
 *       - in: query
 *         name: isFree
 *         schema:
 *           type: boolean
 *         description: 是否免费
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, borrowCount, viewCount]
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *     responses:
 *       200:
 *         description: 成功
 */
router.get('/search', resourceController.search);

/**
 * @swagger
 * /resources/user/my-resources:
 *   get:
 *     summary: 获取我发布的资源
 *     tags: [资源共享]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [available, borrowed, unavailable]
 *     responses:
 *       200:
 *         description: 成功
 *       401:
 *         description: 未认证
 */
router.get('/user/my-resources', authMiddleware, resourceController.getUserResources);

/**
 * @swagger
 * /resources/borrows:
 *   post:
 *     summary: 发起借用请求
 *     tags: [资源共享]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBorrowRequest'
 *     responses:
 *       201:
 *         description: 借用请求已发送
 *       400:
 *         description: 资源不可借用或已有待处理请求
 *       401:
 *         description: 未认证
 */
router.post('/borrows', authMiddleware, SharedResourceController.borrowValidation, resourceController.createBorrowRequest);

/**
 * @swagger
 * /resources/borrows/my-borrows:
 *   get:
 *     summary: 获取我的借用记录
 *     tags: [资源共享]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [borrower, owner, all]
 *           default: all
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected, borrowed, returned, overdue]
 *     responses:
 *       200:
 *         description: 成功
 *       401:
 *         description: 未认证
 */
router.get('/borrows/my-borrows', authMiddleware, resourceController.getUserBorrows);

/**
 * @swagger
 * /resources/borrows/{id}:
 *   get:
 *     summary: 获取借用详情
 *     tags: [资源共享]
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
 *         description: 成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ResourceBorrow'
 *       401:
 *         description: 未认证
 *       403:
 *         description: 无权查看
 *       404:
 *         description: 借用记录不存在
 */
router.get('/borrows/:id', authMiddleware, resourceController.getBorrowById);

/**
 * @swagger
 * /resources/borrows/{id}/approve:
 *   put:
 *     summary: 资源主批准借用
 *     tags: [资源共享]
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
 *         description: 已批准借用
 *       400:
 *         description: 当前状态不能批准
 *       401:
 *         description: 未认证
 *       403:
 *         description: 无权操作
 */
router.put('/borrows/:id/approve', authMiddleware, resourceController.approveBorrow);

/**
 * @swagger
 * /resources/borrows/{id}/reject:
 *   put:
 *     summary: 资源主拒绝借用
 *     tags: [资源共享]
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
 *         description: 已拒绝借用
 *       400:
 *         description: 当前状态不能拒绝
 *       401:
 *         description: 未认证
 *       403:
 *         description: 无权操作
 */
router.put('/borrows/:id/reject', authMiddleware, resourceController.rejectBorrow);

/**
 * @swagger
 * /resources/borrows/{id}/start:
 *   put:
 *     summary: 资源主确认开始借用
 *     tags: [资源共享]
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
 *         description: 借用已开始
 *       400:
 *         description: 当前状态不能开始借用或资源已被占用
 *       401:
 *         description: 未认证
 *       403:
 *         description: 无权操作
 */
router.put('/borrows/:id/start', authMiddleware, resourceController.startBorrow);

/**
 * @swagger
 * /resources/borrows/{id}/return:
 *   put:
 *     summary: 借用者归还资源
 *     tags: [资源共享]
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
 *         description: 资源已归还
 *       400:
 *         description: 当前状态不能归还
 *       401:
 *         description: 未认证
 *       403:
 *         description: 无权操作
 */
router.put('/borrows/:id/return', authMiddleware, resourceController.returnResource);

/**
 * @swagger
 * /resources/borrows/{id}/confirm-return:
 *   put:
 *     summary: 资源主确认归还
 *     tags: [资源共享]
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
 *         description: 已确认归还
 *       400:
 *         description: 当前状态不能确认归还
 *       401:
 *         description: 未认证
 *       403:
 *         description: 无权操作
 */
router.put('/borrows/:id/confirm-return', authMiddleware, resourceController.confirmReturn);

/**
 * @swagger
 * /resources/borrows/{id}/rate:
 *   post:
 *     summary: 评价借用
 *     tags: [资源共享]
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
 *         description: 只能对已完成的借用评价或已评价过
 *       401:
 *         description: 未认证
 *       403:
 *         description: 无权操作
 */
router.post('/borrows/:id/rate', authMiddleware, SharedResourceController.rateValidation, resourceController.rateBorrow);

/**
 * @swagger
 * /resources/{resourceId}/borrows:
 *   get:
 *     summary: 获取资源的借用记录
 *     tags: [资源共享]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: resourceId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 成功
 *       401:
 *         description: 未认证
 */
router.get('/:resourceId/borrows', authMiddleware, resourceController.getResourceBorrows);

/**
 * @swagger
 * /resources:
 *   post:
 *     summary: 发布共享资源
 *     tags: [资源共享]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateResourceRequest'
 *     responses:
 *       201:
 *         description: 资源发布成功
 *       401:
 *         description: 未认证
 */
router.post('/', authMiddleware, SharedResourceController.createValidation, resourceController.create);

/**
 * @swagger
 * /resources/{id}:
 *   get:
 *     summary: 获取资源详情
 *     tags: [资源共享]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
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
 *                   $ref: '#/components/schemas/SharedResource'
 *       404:
 *         description: 资源不存在
 */
router.get('/:id', resourceController.getById);

/**
 * @swagger
 * /resources/{id}:
 *   put:
 *     summary: 更新资源信息
 *     tags: [资源共享]
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
 *             $ref: '#/components/schemas/CreateResourceRequest'
 *     responses:
 *       200:
 *         description: 更新成功
 *       401:
 *         description: 未认证
 *       403:
 *         description: 无权修改
 *       404:
 *         description: 资源不存在
 */
router.put('/:id', authMiddleware, SharedResourceController.updateValidation, resourceController.update);

/**
 * @swagger
 * /resources/{id}:
 *   delete:
 *     summary: 删除资源
 *     tags: [资源共享]
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
 *         description: 删除成功
 *       400:
 *         description: 资源正在被借用，无法删除
 *       401:
 *         description: 未认证
 *       403:
 *         description: 无权删除
 *       404:
 *         description: 资源不存在
 */
router.delete('/:id', authMiddleware, resourceController.delete);

export default router;
