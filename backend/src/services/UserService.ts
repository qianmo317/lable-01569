import { Repository } from 'typeorm';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User, UserRole, UserStatus } from '../entities/User';
import { config } from '../config';
import { ApiError } from '../middlewares/errorHandler';

export interface RegisterDto {
  username: string;
  email: string;
  password: string;
  realName?: string;
  phone?: string;
  studentId?: string;
  department?: string;
}

export interface LoginDto {
  username: string;
  password: string;
}

export interface UpdateUserDto {
  realName?: string;
  phone?: string;
  studentId?: string;
  department?: string;
  avatar?: string;
  bio?: string;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  realName?: string;
  phone?: string;
  studentId?: string;
  department?: string;
  avatar?: string;
  bio?: string;
  role: UserRole;
  status: UserStatus;
  rating: number;
  ratingCount: number;
  createdAt: Date;
}

export class UserService {
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  async register(dto: RegisterDto): Promise<{ user: UserResponse; token: string }> {
    // Check if username exists
    const existingUsername = await this.userRepository.findOne({
      where: { username: dto.username },
    });
    if (existingUsername) {
      throw new ApiError(400, '用户名已被使用');
    }

    // Check if email exists
    const existingEmail = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (existingEmail) {
      throw new ApiError(400, '邮箱已被注册');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 12);

    // Create user
    const user = this.userRepository.create({
      username: dto.username,
      email: dto.email,
      password: hashedPassword,
      realName: dto.realName,
      phone: dto.phone,
      studentId: dto.studentId,
      department: dto.department,
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
    });

    await this.userRepository.save(user);

    const token = this.generateToken(user);
    return { user: this.toUserResponse(user), token };
  }

  async login(dto: LoginDto): Promise<{ user: UserResponse; token: string }> {
    const user = await this.userRepository.findOne({
      where: [
        { username: dto.username },
        { email: dto.username },
      ],
    });

    if (!user) {
      throw new ApiError(401, '用户名或密码错误');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new ApiError(401, '用户名或密码错误');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new ApiError(403, '账户已被禁用');
    }

    const token = this.generateToken(user);
    return { user: this.toUserResponse(user), token };
  }

  async getProfile(userId: number): Promise<UserResponse> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(404, '用户不存在');
    }

    return this.toUserResponse(user);
  }

  async updateProfile(userId: number, dto: UpdateUserDto): Promise<UserResponse> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(404, '用户不存在');
    }

    Object.assign(user, dto);
    await this.userRepository.save(user);

    return this.toUserResponse(user);
  }

  async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(404, '用户不存在');
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new ApiError(400, '原密码错误');
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await this.userRepository.save(user);
  }

  async getUserById(userId: number): Promise<UserResponse> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(404, '用户不存在');
    }

    return this.toUserResponse(user);
  }

  async updateUserRating(userId: number, rating: number): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(404, '用户不存在');
    }

    const newRatingCount = user.ratingCount + 1;
    const newRating = (Number(user.rating) * user.ratingCount + rating) / newRatingCount;

    user.rating = parseFloat(newRating.toFixed(2));
    user.ratingCount = newRatingCount;

    await this.userRepository.save(user);
  }

  private generateToken(user: User): string {
    return jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role,
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'] }
    );
  }

  private toUserResponse(user: User): UserResponse {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      realName: user.realName,
      phone: user.phone,
      studentId: user.studentId,
      department: user.department,
      avatar: user.avatar,
      bio: user.bio,
      role: user.role,
      status: user.status,
      rating: Number(user.rating),
      ratingCount: user.ratingCount,
      createdAt: user.createdAt,
    };
  }
}
