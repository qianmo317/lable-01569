import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();
const userController = new UserController();

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: 用户注册
 *     tags: [用户管理]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: 注册成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: 用户名或邮箱已存在
 */
router.post('/register', UserController.registerValidation, userController.register);

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: 用户登录
 *     tags: [用户管理]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: 登录成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: 用户名或密码错误
 */
router.post('/login', UserController.loginValidation, userController.login);

/**
 * @swagger
 * /users/profile/me:
 *   get:
 *     summary: 获取当前用户信息
 *     tags: [用户管理]
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
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: 未认证
 */
router.get('/profile/me', authMiddleware, userController.getProfile);

/**
 * @swagger
 * /users/profile/me:
 *   put:
 *     summary: 更新当前用户信息
 *     tags: [用户管理]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               realName:
 *                 type: string
 *               phone:
 *                 type: string
 *               studentId:
 *                 type: string
 *               department:
 *                 type: string
 *               avatar:
 *                 type: string
 *               bio:
 *                 type: string
 *     responses:
 *       200:
 *         description: 更新成功
 *       401:
 *         description: 未认证
 */
router.put('/profile/me', authMiddleware, UserController.updateProfileValidation, userController.updateProfile);

/**
 * @swagger
 * /users/password:
 *   put:
 *     summary: 修改密码
 *     tags: [用户管理]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: 密码修改成功
 *       400:
 *         description: 原密码错误
 *       401:
 *         description: 未认证
 */
router.put('/password', authMiddleware, UserController.changePasswordValidation, userController.changePassword);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: 获取指定用户公开信息
 *     tags: [用户管理]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 用户ID
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
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: 用户不存在
 */
router.get('/:id', userController.getUserById);

export default router;
