import { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { TransactionService } from '../services/TransactionService';
import { AuthRequest } from '../middlewares/auth';
import { validate } from '../middlewares/validator';
import { TransactionStatus, PaymentMethod } from '../entities/Transaction';

export class TransactionController {
  private transactionService: TransactionService;

  constructor() {
    this.transactionService = new TransactionService();
  }

  static createValidation = validate([
    body('itemId').isInt({ min: 1 }).withMessage('请选择有效的物品'),
    body('price').optional().isFloat({ min: 0 }).withMessage('价格必须大于等于0'),
  ]);

  static rateValidation = validate([
    body('rating').isInt({ min: 1, max: 5 }).withMessage('评分必须在1-5之间'),
    body('review').optional().isLength({ max: 500 }).withMessage('评价不能超过500字'),
  ]);

  create = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const transaction = await this.transactionService.create(req.userId!, req.body);
      res.status(201).json({
        success: true,
        message: '交易请求已发送',
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const transactionId = parseInt(req.params.id);
      const transaction = await this.transactionService.findById(transactionId);

      // Check if user is involved in the transaction
      if (transaction.buyerId !== req.userId && transaction.sellerId !== req.userId) {
        res.status(403).json({
          success: false,
          message: '无权查看此交易',
        });
        return;
      }

      res.json({
        success: true,
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  };

  accept = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const transactionId = parseInt(req.params.id);
      const transaction = await this.transactionService.accept(
        transactionId,
        req.userId!,
        req.body
      );
      res.json({
        success: true,
        message: '已接受交易请求',
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  };

  reject = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const transactionId = parseInt(req.params.id);
      const transaction = await this.transactionService.reject(
        transactionId,
        req.userId!,
        req.body.note
      );
      res.json({
        success: true,
        message: '已拒绝交易请求',
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  };

  markAsPaid = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const transactionId = parseInt(req.params.id);
      const transaction = await this.transactionService.markAsPaid(
        transactionId,
        req.userId!,
        req.body.paymentMethod
      );
      res.json({
        success: true,
        message: '已标记为已付款',
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  };

  markAsShipped = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const transactionId = parseInt(req.params.id);
      const transaction = await this.transactionService.markAsShipped(
        transactionId,
        req.userId!
      );
      res.json({
        success: true,
        message: '已标记为已发货',
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  };

  complete = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const transactionId = parseInt(req.params.id);
      const transaction = await this.transactionService.complete(transactionId, req.userId!);
      res.json({
        success: true,
        message: '交易已完成',
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  };

  cancel = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const transactionId = parseInt(req.params.id);
      const transaction = await this.transactionService.cancel(
        transactionId,
        req.userId!,
        req.body.note
      );
      res.json({
        success: true,
        message: '交易已取消',
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  };

  rateBySeller = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const transactionId = parseInt(req.params.id);
      const transaction = await this.transactionService.rateBySeller(
        transactionId,
        req.userId!,
        req.body
      );
      res.json({
        success: true,
        message: '评价成功',
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  };

  rateByBuyer = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const transactionId = parseInt(req.params.id);
      const transaction = await this.transactionService.rateByBuyer(
        transactionId,
        req.userId!,
        req.body
      );
      res.json({
        success: true,
        message: '评价成功',
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  };

  getUserTransactions = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const role = req.query.role as 'buyer' | 'seller' | 'all' | undefined;
      const status = req.query.status as TransactionStatus | undefined;
      const transactions = await this.transactionService.getUserTransactions(
        req.userId!,
        role || 'all',
        status
      );
      res.json({
        success: true,
        data: transactions,
      });
    } catch (error) {
      next(error);
    }
  };

  getItemTransactions = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const itemId = parseInt(req.params.itemId);
      const transactions = await this.transactionService.getItemTransactions(itemId);
      res.json({
        success: true,
        data: transactions,
      });
    } catch (error) {
      next(error);
    }
  };
}
