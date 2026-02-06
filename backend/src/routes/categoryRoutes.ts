import { Router } from 'express';
import { CategoryController } from '../controllers/CategoryController';
import { authMiddleware, adminMiddleware } from '../middlewares/auth';

const router = Router();
const categoryController = new CategoryController();

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: 获取所有分类
 *     tags: [分类管理]
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
 *                     $ref: '#/components/schemas/Category'
 */
router.get('/', categoryController.getAll);

/**
 * @swagger
 * /categories/items:
 *   get:
 *     summary: 获取物品分类
 *     tags: [分类管理]
 *     responses:
 *       200:
 *         description: 成功
 */
router.get('/items', categoryController.getItemCategories);

/**
 * @swagger
 * /categories/resources:
 *   get:
 *     summary: 获取资源分类
 *     tags: [分类管理]
 *     responses:
 *       200:
 *         description: 成功
 */
router.get('/resources', categoryController.getResourceCategories);

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: 获取分类详情
 *     tags: [分类管理]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 成功
 *       404:
 *         description: 分类不存在
 */
router.get('/:id', categoryController.getById);

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: 创建分类（管理员）
 *     tags: [分类管理]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCategoryRequest'
 *     responses:
 *       201:
 *         description: 创建成功
 *       401:
 *         description: 未认证
 *       403:
 *         description: 需要管理员权限
 */
router.post('/', authMiddleware, adminMiddleware, CategoryController.createValidation, categoryController.create);

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: 更新分类（管理员）
 *     tags: [分类管理]
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
 *             $ref: '#/components/schemas/CreateCategoryRequest'
 *     responses:
 *       200:
 *         description: 更新成功
 *       401:
 *         description: 未认证
 *       403:
 *         description: 需要管理员权限
 *       404:
 *         description: 分类不存在
 */
router.put('/:id', authMiddleware, adminMiddleware, CategoryController.updateValidation, categoryController.update);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: 删除分类（管理员）
 *     tags: [分类管理]
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
 *       401:
 *         description: 未认证
 *       403:
 *         description: 需要管理员权限
 *       404:
 *         description: 分类不存在
 */
router.delete('/:id', authMiddleware, adminMiddleware, categoryController.delete);

export default router;
