import { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { UserService } from '../services/UserService';
import { AuthRequest } from '../middlewares/auth';
import { validate } from '../middlewares/validator';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  // Validation rules
  static registerValidation = validate([
    body('username')
      .isLength({ min: 3, max: 50 })
      .withMessage('用户名长度必须在3-50个字符之间')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('用户名只能包含字母、数字和下划线'),
    body('email').isEmail().withMessage('请输入有效的邮箱地址'),
    body('password')
      .isLength({ min: 6, max: 100 })
      .withMessage('密码长度必须在6-100个字符之间'),
  ]);

  static loginValidation = validate([
    body('username').notEmpty().withMessage('请输入用户名或邮箱'),
    body('password').notEmpty().withMessage('请输入密码'),
  ]);

  static updateProfileValidation = validate([
    body('realName').optional().isLength({ max: 50 }).withMessage('姓名不能超过50个字符'),
    body('phone')
      .optional()
      .matches(/^1[3-9]\d{9}$/)
      .withMessage('请输入有效的手机号码'),
    body('studentId').optional().isLength({ max: 100 }).withMessage('学号不能超过100个字符'),
    body('department').optional().isLength({ max: 100 }).withMessage('院系不能超过100个字符'),
  ]);

  static changePasswordValidation = validate([
    body('oldPassword').notEmpty().withMessage('请输入原密码'),
    body('newPassword')
      .isLength({ min: 6, max: 100 })
      .withMessage('新密码长度必须在6-100个字符之间'),
  ]);

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.userService.register(req.body);
      res.status(201).json({
        success: true,
        message: '注册成功',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.userService.login(req.body);
      res.json({
        success: true,
        message: '登录成功',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.userService.getProfile(req.userId!);
      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.userService.updateProfile(req.userId!, req.body);
      res.json({
        success: true,
        message: '个人信息更新成功',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { oldPassword, newPassword } = req.body;
      await this.userService.changePassword(req.userId!, oldPassword, newPassword);
      res.json({
        success: true,
        message: '密码修改成功',
      });
    } catch (error) {
      next(error);
    }
  };

  getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = parseInt(req.params.id);
      const user = await this.userService.getUserById(userId);
      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };
}
