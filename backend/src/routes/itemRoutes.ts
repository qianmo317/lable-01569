import { Router } from 'express';
import { ItemController } from '../controllers/ItemController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();
const itemController = new ItemController();

/**
 * @swagger
 * /items/search:
 *   get:
 *     summary: 搜索物品
 *     tags: [物品管理]
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: 搜索关键词
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: integer
 *         description: 分类ID
 *       - in: query
 *         name: condition
 *         schema:
 *           type: string
 *           enum: [new, like_new, good, fair, poor]
 *         description: 物品成色
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: 最低价格
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: 最高价格
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 每页数量
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, price, viewCount]
 *           default: createdAt
 *         description: 排序字段
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: 排序方向
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
 *                   $ref: '#/components/schemas/PaginatedResponse'
 */
router.get('/search', ItemController.searchValidation, itemController.search);

/**
 * @swagger
 * /items/user/my-items:
 *   get:
 *     summary: 获取我发布的物品
 *     tags: [物品管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [available, reserved, sold, removed]
 *         description: 物品状态筛选
 *     responses:
 *       200:
 *         description: 成功
 *       401:
 *         description: 未认证
 */
router.get('/user/my-items', authMiddleware, itemController.getUserItems);

/**
 * @swagger
 * /items:
 *   post:
 *     summary: 发布物品
 *     tags: [物品管理]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateItemRequest'
 *     responses:
 *       201:
 *         description: 发布成功
 *       401:
 *         description: 未认证
 */
router.post('/', authMiddleware, ItemController.createValidation, itemController.create);

/**
 * @swagger
 * /items/{id}:
 *   get:
 *     summary: 获取物品详情
 *     tags: [物品管理]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 物品ID
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
 *                   $ref: '#/components/schemas/Item'
 *       404:
 *         description: 物品不存在
 */
router.get('/:id', itemController.getById);

/**
 * @swagger
 * /items/{id}:
 *   put:
 *     summary: 更新物品信息
 *     tags: [物品管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 物品ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateItemRequest'
 *     responses:
 *       200:
 *         description: 更新成功
 *       401:
 *         description: 未认证
 *       403:
 *         description: 无权修改
 *       404:
 *         description: 物品不存在
 */
router.put('/:id', authMiddleware, ItemController.updateValidation, itemController.update);

/**
 * @swagger
 * /items/{id}:
 *   delete:
 *     summary: 删除物品
 *     tags: [物品管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 物品ID
 *     responses:
 *       200:
 *         description: 删除成功
 *       401:
 *         description: 未认证
 *       403:
 *         description: 无权删除
 *       404:
 *         description: 物品不存在
 */
router.delete('/:id', authMiddleware, itemController.delete);

export default router;
