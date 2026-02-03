import { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { MessageService } from '../services/MessageService';
import { AuthRequest } from '../middlewares/auth';
import { validate } from '../middlewares/validator';

export class MessageController {
  private messageService: MessageService;

  constructor() {
    this.messageService = new MessageService();
  }

  static sendValidation = validate([
    body('receiverId').isInt({ min: 1 }).withMessage('请选择有效的接收者'),
    body('content').notEmpty().withMessage('消息内容不能为空'),
  ]);

  send = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const message = await this.messageService.send(req.userId!, req.body);
      res.status(201).json({
        success: true,
        message: '消息发送成功',
        data: message,
      });
    } catch (error) {
      next(error);
    }
  };

  getConversation = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const partnerId = parseInt(req.params.partnerId);
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 20;

      const result = await this.messageService.getConversation(
        req.userId!,
        partnerId,
        page,
        pageSize
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getConversationList = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const conversations = await this.messageService.getConversationList(req.userId!);
      res.json({
        success: true,
        data: conversations,
      });
    } catch (error) {
      next(error);
    }
  };

  markAsRead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { messageIds } = req.body;
      await this.messageService.markAsRead(messageIds, req.userId!);
      res.json({
        success: true,
        message: '消息已标记为已读',
      });
    } catch (error) {
      next(error);
    }
  };

  getUnreadCount = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const count = await this.messageService.getUnreadCount(req.userId!);
      res.json({
        success: true,
        data: { unreadCount: count },
      });
    } catch (error) {
      next(error);
    }
  };
}
