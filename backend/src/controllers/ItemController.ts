import { Request, Response, NextFunction } from 'express';
import { body, query } from 'express-validator';
import { ItemService } from '../services/ItemService';
import { AuthRequest } from '../middlewares/auth';
import { validate } from '../middlewares/validator';
import { ItemCondition, ItemStatus } from '../entities/Item';

export class ItemController {
  private itemService: ItemService;

  constructor() {
    this.itemService = new ItemService();
  }

  static createValidation = validate([
    body('title')
      .isLength({ min: 2, max: 100 })
      .withMessage('物品标题长度必须在2-100个字符之间'),
    body('description')
      .isLength({ min: 10 })
      .withMessage('物品描述至少需要10个字符'),
    body('price')
      .isFloat({ min: 0 })
      .withMessage('价格必须大于等于0'),
    body('condition')
      .isIn(Object.values(ItemCondition))
      .withMessage('无效的物品成色'),
  ]);

  static updateValidation = validate([
    body('title')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('物品标题长度必须在2-100个字符之间'),
    body('description')
      .optional()
      .isLength({ min: 10 })
      .withMessage('物品描述至少需要10个字符'),
    body('price')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('价格必须大于等于0'),
    body('condition')
      .optional()
      .isIn(Object.values(ItemCondition))
      .withMessage('无效的物品成色'),
  ]);

  static searchValidation = validate([
    query('page').optional().isInt({ min: 1 }).withMessage('页码必须大于0'),
    query('pageSize').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间'),
  ]);

  create = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const item = await this.itemService.create(req.userId!, req.body);
      res.status(201).json({
        success: true,
        message: '物品发布成功',
        data: item,
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const itemId = parseInt(req.params.id);
      const item = await this.itemService.findById(itemId);
      
      // Increment view count
      await this.itemService.incrementViewCount(itemId);
      
      res.json({
        success: true,
        data: item,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const itemId = parseInt(req.params.id);
      const item = await this.itemService.update(itemId, req.userId!, req.body);
      res.json({
        success: true,
        message: '物品信息更新成功',
        data: item,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const itemId = parseInt(req.params.id);
      await this.itemService.delete(itemId, req.userId!);
      res.json({
        success: true,
        message: '物品删除成功',
      });
    } catch (error) {
      next(error);
    }
  };

  search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const {
        keyword,
        categoryId,
        condition,
        minPrice,
        maxPrice,
        status,
        sellerId,
        page,
        pageSize,
        sortBy,
        sortOrder,
      } = req.query;

      const result = await this.itemService.search({
        keyword: keyword as string,
        categoryId: categoryId ? parseInt(categoryId as string) : undefined,
        condition: condition as ItemCondition,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        status: status as ItemStatus,
        sellerId: sellerId ? parseInt(sellerId as string) : undefined,
        page: page ? parseInt(page as string) : 1,
        pageSize: pageSize ? parseInt(pageSize as string) : 10,
        sortBy: sortBy as 'createdAt' | 'price' | 'viewCount',
        sortOrder: sortOrder as 'ASC' | 'DESC',
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getUserItems = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const status = req.query.status as ItemStatus | undefined;
      const items = await this.itemService.getUserItems(req.userId!, status);
      res.json({
        success: true,
        data: items,
      });
    } catch (error) {
      next(error);
    }
  };
}
