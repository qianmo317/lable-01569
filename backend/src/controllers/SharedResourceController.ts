import { Request, Response, NextFunction } from 'express';
import { body, query } from 'express-validator';
import { SharedResourceService } from '../services/SharedResourceService';
import { AuthRequest } from '../middlewares/auth';
import { validate } from '../middlewares/validator';
import { ResourceType, ResourceStatus } from '../entities/SharedResource';
import { BorrowStatus } from '../entities/ResourceBorrow';

export class SharedResourceController {
  private resourceService: SharedResourceService;

  constructor() {
    this.resourceService = new SharedResourceService();
  }

  static createValidation = validate([
    body('title')
      .isLength({ min: 2, max: 100 })
      .withMessage('资源标题长度必须在2-100个字符之间'),
    body('description')
      .isLength({ min: 10 })
      .withMessage('资源描述至少需要10个字符'),
    body('type')
      .isIn(Object.values(ResourceType))
      .withMessage('无效的资源类型'),
  ]);

  static updateValidation = validate([
    body('title')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('资源标题长度必须在2-100个字符之间'),
    body('description')
      .optional()
      .isLength({ min: 10 })
      .withMessage('资源描述至少需要10个字符'),
    body('type')
      .optional()
      .isIn(Object.values(ResourceType))
      .withMessage('无效的资源类型'),
  ]);

  static borrowValidation = validate([
    body('resourceId').isInt({ min: 1 }).withMessage('请选择有效的资源'),
    body('borrowDate').isISO8601().withMessage('请输入有效的借用日期'),
    body('expectedReturnDate').isISO8601().withMessage('请输入有效的预计归还日期'),
  ]);

  static rateValidation = validate([
    body('rating').isInt({ min: 1, max: 5 }).withMessage('评分必须在1-5之间'),
    body('review').optional().isLength({ max: 500 }).withMessage('评价不能超过500字'),
  ]);

  create = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const resource = await this.resourceService.create(req.userId!, req.body);
      res.status(201).json({
        success: true,
        message: '资源发布成功',
        data: resource,
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const resourceId = parseInt(req.params.id);
      const resource = await this.resourceService.findById(resourceId);
      
      // Increment view count
      await this.resourceService.incrementViewCount(resourceId);
      
      res.json({
        success: true,
        data: resource,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const resourceId = parseInt(req.params.id);
      const resource = await this.resourceService.update(resourceId, req.userId!, req.body);
      res.json({
        success: true,
        message: '资源信息更新成功',
        data: resource,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const resourceId = parseInt(req.params.id);
      await this.resourceService.delete(resourceId, req.userId!);
      res.json({
        success: true,
        message: '资源删除成功',
      });
    } catch (error) {
      next(error);
    }
  };

  search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const {
        keyword,
        type,
        categoryId,
        status,
        ownerId,
        isFree,
        page,
        pageSize,
        sortBy,
        sortOrder,
      } = req.query;

      const result = await this.resourceService.search({
        keyword: keyword as string,
        type: type as ResourceType,
        categoryId: categoryId ? parseInt(categoryId as string) : undefined,
        status: status as ResourceStatus,
        ownerId: ownerId ? parseInt(ownerId as string) : undefined,
        isFree: isFree !== undefined ? isFree === 'true' : undefined,
        page: page ? parseInt(page as string) : 1,
        pageSize: pageSize ? parseInt(pageSize as string) : 10,
        sortBy: sortBy as 'createdAt' | 'borrowCount' | 'viewCount',
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

  getUserResources = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const status = req.query.status as ResourceStatus | undefined;
      const resources = await this.resourceService.getUserResources(req.userId!, status);
      res.json({
        success: true,
        data: resources,
      });
    } catch (error) {
      next(error);
    }
  };

  // Borrow related endpoints
  createBorrowRequest = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const borrow = await this.resourceService.createBorrowRequest(req.userId!, req.body);
      res.status(201).json({
        success: true,
        message: '借用请求已发送',
        data: borrow,
      });
    } catch (error) {
      next(error);
    }
  };

  getBorrowById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const borrowId = parseInt(req.params.id);
      const borrow = await this.resourceService.findBorrowById(borrowId);

      // Check if user is involved
      if (borrow.borrowerId !== req.userId && borrow.ownerId !== req.userId) {
        res.status(403).json({
          success: false,
          message: '无权查看此借用记录',
        });
        return;
      }

      res.json({
        success: true,
        data: borrow,
      });
    } catch (error) {
      next(error);
    }
  };

  approveBorrow = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const borrowId = parseInt(req.params.id);
      const borrow = await this.resourceService.approveBorrow(
        borrowId,
        req.userId!,
        req.body.note
      );
      res.json({
        success: true,
        message: '已批准借用请求',
        data: borrow,
      });
    } catch (error) {
      next(error);
    }
  };

  rejectBorrow = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const borrowId = parseInt(req.params.id);
      const borrow = await this.resourceService.rejectBorrow(
        borrowId,
        req.userId!,
        req.body.note
      );
      res.json({
        success: true,
        message: '已拒绝借用请求',
        data: borrow,
      });
    } catch (error) {
      next(error);
    }
  };

  startBorrow = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const borrowId = parseInt(req.params.id);
      const borrow = await this.resourceService.startBorrow(borrowId, req.userId!);
      res.json({
        success: true,
        message: '借用已开始',
        data: borrow,
      });
    } catch (error) {
      next(error);
    }
  };

  returnResource = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const borrowId = parseInt(req.params.id);
      const borrow = await this.resourceService.returnResource(borrowId, req.userId!);
      res.json({
        success: true,
        message: '资源已归还',
        data: borrow,
      });
    } catch (error) {
      next(error);
    }
  };

  confirmReturn = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const borrowId = parseInt(req.params.id);
      const borrow = await this.resourceService.confirmReturn(borrowId, req.userId!);
      res.json({
        success: true,
        message: '已确认归还',
        data: borrow,
      });
    } catch (error) {
      next(error);
    }
  };

  rateBorrow = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const borrowId = parseInt(req.params.id);
      const borrow = await this.resourceService.rateBorrow(
        borrowId,
        req.userId!,
        req.body.rating,
        req.body.review
      );
      res.json({
        success: true,
        message: '评价成功',
        data: borrow,
      });
    } catch (error) {
      next(error);
    }
  };

  getUserBorrows = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const role = req.query.role as 'borrower' | 'owner' | 'all' | undefined;
      const status = req.query.status as BorrowStatus | undefined;
      const borrows = await this.resourceService.getUserBorrows(
        req.userId!,
        role || 'all',
        status
      );
      res.json({
        success: true,
        data: borrows,
      });
    } catch (error) {
      next(error);
    }
  };

  getResourceBorrows = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const resourceId = parseInt(req.params.resourceId);
      const borrows = await this.resourceService.getResourceBorrows(resourceId);
      res.json({
        success: true,
        data: borrows,
      });
    } catch (error) {
      next(error);
    }
  };
}
