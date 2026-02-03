import { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { CategoryService } from '../services/CategoryService';
import { validate } from '../middlewares/validator';

export class CategoryController {
  private categoryService: CategoryService;

  constructor() {
    this.categoryService = new CategoryService();
  }

  static createValidation = validate([
    body('name')
      .isLength({ min: 1, max: 50 })
      .withMessage('分类名称长度必须在1-50个字符之间'),
    body('type')
      .isIn(['item', 'resource'])
      .withMessage('分类类型必须是 item 或 resource'),
  ]);

  static updateValidation = validate([
    body('name')
      .optional()
      .isLength({ min: 1, max: 50 })
      .withMessage('分类名称长度必须在1-50个字符之间'),
  ]);

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const category = await this.categoryService.create(req.body);
      res.status(201).json({
        success: true,
        message: '分类创建成功',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categoryId = parseInt(req.params.id);
      const category = await this.categoryService.findById(categoryId);
      res.json({
        success: true,
        data: category,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categoryId = parseInt(req.params.id);
      const category = await this.categoryService.update(categoryId, req.body);
      res.json({
        success: true,
        message: '分类更新成功',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categoryId = parseInt(req.params.id);
      await this.categoryService.delete(categoryId);
      res.json({
        success: true,
        message: '分类删除成功',
      });
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const type = req.query.type as 'item' | 'resource' | undefined;
      const categories = await this.categoryService.getAll(type);
      res.json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  };

  getItemCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categories = await this.categoryService.getItemCategories();
      res.json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  };

  getResourceCategories = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const categories = await this.categoryService.getResourceCategories();
      res.json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  };
}
