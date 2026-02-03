import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AppDataSource } from '../config/database';
import { User, UserStatus } from '../entities/User';

export interface AuthRequest extends Request {
  user?: User;
  userId?: number;
}

export interface JwtPayload {
  userId: number;
  username: string;
  role: string;
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: '请提供认证令牌',
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
      
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: { id: decoded.userId },
      });

      if (!user) {
        res.status(401).json({
          success: false,
          message: '用户不存在',
        });
        return;
      }

      if (user.status !== UserStatus.ACTIVE) {
        res.status(403).json({
          success: false,
          message: '账户已被禁用',
        });
        return;
      }

      req.user = user;
      req.userId = user.id;
      next();
    } catch (jwtError) {
      res.status(401).json({
        success: false,
        message: '无效的认证令牌',
      });
      return;
    }
  } catch (error) {
    next(error);
  }
};

export const optionalAuthMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];

      try {
        const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
        
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({
          where: { id: decoded.userId },
        });

        if (user && user.status === UserStatus.ACTIVE) {
          req.user = user;
          req.userId = user.id;
        }
      } catch {
        // Token invalid, continue without user
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const adminMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: '需要管理员权限',
    });
    return;
  }
  next();
};
