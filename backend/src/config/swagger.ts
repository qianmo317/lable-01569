import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './index';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '校园二手物品交易与资源共享平台 API',
      version: '1.0.0',
      description: `
## 简介
校园二手物品交易与资源共享平台后端 API 文档。

## 认证方式
大部分接口需要 JWT Token 认证，请在登录后获取 Token，并在请求头中添加：
\`\`\`
Authorization: Bearer <your_token>
\`\`\`

## 测试账号
- 普通用户: testuser / test123
- 管理员: admin / admin123
      `,
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}/api`,
        description: '开发服务器',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: '请输入 JWT Token',
        },
      },
      schemas: {
        // Common response schemas
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
          },
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            items: { type: 'array', items: {} },
            total: { type: 'integer' },
            page: { type: 'integer' },
            pageSize: { type: 'integer' },
            totalPages: { type: 'integer' },
          },
        },

        // User schemas
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            username: { type: 'string' },
            email: { type: 'string', format: 'email' },
            realName: { type: 'string', nullable: true },
            phone: { type: 'string', nullable: true },
            studentId: { type: 'string', nullable: true },
            department: { type: 'string', nullable: true },
            avatar: { type: 'string', nullable: true },
            bio: { type: 'string', nullable: true },
            role: { type: 'string', enum: ['user', 'admin'] },
            status: { type: 'string', enum: ['active', 'inactive', 'banned'] },
            rating: { type: 'number' },
            ratingCount: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['username', 'email', 'password'],
          properties: {
            username: { type: 'string', minLength: 3, maxLength: 50, example: 'newuser' },
            email: { type: 'string', format: 'email', example: 'newuser@campus.edu' },
            password: { type: 'string', minLength: 6, example: 'password123' },
            realName: { type: 'string', example: '张三' },
            phone: { type: 'string', example: '13800138000' },
            studentId: { type: 'string', example: '2024001' },
            department: { type: 'string', example: '计算机学院' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: { type: 'string', example: 'testuser' },
            password: { type: 'string', example: 'test123' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                user: { $ref: '#/components/schemas/User' },
                token: { type: 'string' },
              },
            },
          },
        },

        // Item schemas
        Item: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            title: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            originalPrice: { type: 'number', nullable: true },
            condition: { type: 'string', enum: ['new', 'like_new', 'good', 'fair', 'poor'] },
            status: { type: 'string', enum: ['available', 'reserved', 'sold', 'removed'] },
            images: { type: 'array', items: { type: 'string' }, nullable: true },
            location: { type: 'string', nullable: true },
            viewCount: { type: 'integer' },
            favoriteCount: { type: 'integer' },
            sellerId: { type: 'integer' },
            categoryId: { type: 'integer', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            seller: { $ref: '#/components/schemas/User' },
            category: { $ref: '#/components/schemas/Category' },
          },
        },
        CreateItemRequest: {
          type: 'object',
          required: ['title', 'description', 'price', 'condition'],
          properties: {
            title: { type: 'string', minLength: 2, maxLength: 100, example: '二手笔记本电脑' },
            description: { type: 'string', minLength: 10, example: '使用一年，性能良好，无明显磨损' },
            price: { type: 'number', minimum: 0, example: 2500 },
            originalPrice: { type: 'number', example: 5000 },
            condition: { type: 'string', enum: ['new', 'like_new', 'good', 'fair', 'poor'], example: 'good' },
            categoryId: { type: 'integer', example: 1 },
            images: { type: 'array', items: { type: 'string' } },
            location: { type: 'string', example: '图书馆一楼' },
          },
        },

        // Transaction schemas
        Transaction: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            itemId: { type: 'integer' },
            buyerId: { type: 'integer' },
            sellerId: { type: 'integer' },
            price: { type: 'number' },
            finalPrice: { type: 'number', nullable: true },
            status: { type: 'string', enum: ['pending', 'accepted', 'rejected', 'paid', 'shipped', 'completed', 'cancelled', 'disputed'] },
            paymentMethod: { type: 'string', enum: ['cash', 'alipay', 'wechat', 'bank_transfer'], nullable: true },
            meetingLocation: { type: 'string', nullable: true },
            meetingTime: { type: 'string', format: 'date-time', nullable: true },
            buyerNote: { type: 'string', nullable: true },
            sellerNote: { type: 'string', nullable: true },
            buyerRating: { type: 'integer', nullable: true },
            sellerRating: { type: 'integer', nullable: true },
            buyerReview: { type: 'string', nullable: true },
            sellerReview: { type: 'string', nullable: true },
            completedAt: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            item: { $ref: '#/components/schemas/Item' },
            buyer: { $ref: '#/components/schemas/User' },
            seller: { $ref: '#/components/schemas/User' },
          },
        },
        CreateTransactionRequest: {
          type: 'object',
          required: ['itemId'],
          properties: {
            itemId: { type: 'integer', example: 1 },
            price: { type: 'number', example: 2500 },
            buyerNote: { type: 'string', example: '希望能便宜一点' },
            meetingLocation: { type: 'string', example: '图书馆门口' },
            meetingTime: { type: 'string', format: 'date-time' },
            paymentMethod: { type: 'string', enum: ['cash', 'alipay', 'wechat', 'bank_transfer'] },
          },
        },
        RateRequest: {
          type: 'object',
          required: ['rating'],
          properties: {
            rating: { type: 'integer', minimum: 1, maximum: 5, example: 5 },
            review: { type: 'string', maxLength: 500, example: '交易愉快，物品与描述一致' },
          },
        },

        // Resource schemas
        SharedResource: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            title: { type: 'string' },
            description: { type: 'string' },
            type: { type: 'string', enum: ['book', 'tool', 'device', 'other'] },
            status: { type: 'string', enum: ['available', 'borrowed', 'unavailable'] },
            images: { type: 'array', items: { type: 'string' }, nullable: true },
            location: { type: 'string', nullable: true },
            maxBorrowDays: { type: 'integer' },
            depositAmount: { type: 'number', nullable: true },
            isFree: { type: 'boolean' },
            dailyFee: { type: 'number', nullable: true },
            viewCount: { type: 'integer' },
            borrowCount: { type: 'integer' },
            ownerId: { type: 'integer' },
            categoryId: { type: 'integer', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            owner: { $ref: '#/components/schemas/User' },
            category: { $ref: '#/components/schemas/Category' },
          },
        },
        CreateResourceRequest: {
          type: 'object',
          required: ['title', 'description', 'type'],
          properties: {
            title: { type: 'string', minLength: 2, maxLength: 100, example: '高等数学教材' },
            description: { type: 'string', minLength: 10, example: '同济大学第七版，保存完好，可借阅一个月' },
            type: { type: 'string', enum: ['book', 'tool', 'device', 'other'], example: 'book' },
            categoryId: { type: 'integer', example: 1 },
            images: { type: 'array', items: { type: 'string' } },
            location: { type: 'string', example: '宿舍楼A栋' },
            maxBorrowDays: { type: 'integer', example: 30 },
            depositAmount: { type: 'number', example: 50 },
            isFree: { type: 'boolean', example: true },
            dailyFee: { type: 'number', example: 0 },
          },
        },

        // Borrow schemas
        ResourceBorrow: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            resourceId: { type: 'integer' },
            borrowerId: { type: 'integer' },
            ownerId: { type: 'integer' },
            status: { type: 'string', enum: ['pending', 'approved', 'rejected', 'borrowed', 'returned', 'overdue'] },
            borrowDate: { type: 'string', format: 'date-time' },
            expectedReturnDate: { type: 'string', format: 'date-time' },
            actualReturnDate: { type: 'string', format: 'date-time', nullable: true },
            borrowerNote: { type: 'string', nullable: true },
            ownerNote: { type: 'string', nullable: true },
            borrowerRating: { type: 'integer', nullable: true },
            ownerRating: { type: 'integer', nullable: true },
            borrowerReview: { type: 'string', nullable: true },
            ownerReview: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            resource: { $ref: '#/components/schemas/SharedResource' },
            borrower: { $ref: '#/components/schemas/User' },
            owner: { $ref: '#/components/schemas/User' },
          },
        },
        CreateBorrowRequest: {
          type: 'object',
          required: ['resourceId', 'borrowDate', 'expectedReturnDate'],
          properties: {
            resourceId: { type: 'integer', example: 1 },
            borrowDate: { type: 'string', format: 'date-time', example: '2024-01-15T10:00:00Z' },
            expectedReturnDate: { type: 'string', format: 'date-time', example: '2024-02-15T10:00:00Z' },
            borrowerNote: { type: 'string', example: '需要复习考试用' },
          },
        },

        // Category schemas
        Category: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            description: { type: 'string', nullable: true },
            type: { type: 'string', enum: ['item', 'resource'] },
            sortOrder: { type: 'integer' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateCategoryRequest: {
          type: 'object',
          required: ['name', 'type'],
          properties: {
            name: { type: 'string', minLength: 2, maxLength: 50, example: '电子产品' },
            description: { type: 'string', example: '手机、电脑、平板等' },
            type: { type: 'string', enum: ['item', 'resource'], example: 'item' },
            sortOrder: { type: 'integer', example: 1 },
          },
        },

        // Message schemas
        Message: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            senderId: { type: 'integer' },
            receiverId: { type: 'integer' },
            content: { type: 'string' },
            type: { type: 'string', enum: ['text', 'image', 'system'] },
            isRead: { type: 'boolean' },
            relatedItemId: { type: 'integer', nullable: true },
            relatedResourceId: { type: 'integer', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            sender: { $ref: '#/components/schemas/User' },
            receiver: { $ref: '#/components/schemas/User' },
          },
        },
        SendMessageRequest: {
          type: 'object',
          required: ['receiverId', 'content'],
          properties: {
            receiverId: { type: 'integer', example: 2 },
            content: { type: 'string', minLength: 1, maxLength: 1000, example: '你好，这个物品还在吗？' },
            type: { type: 'string', enum: ['text', 'image'], example: 'text' },
            relatedItemId: { type: 'integer' },
            relatedResourceId: { type: 'integer' },
          },
        },
        ConversationSummary: {
          type: 'object',
          properties: {
            partnerId: { type: 'integer' },
            partnerUsername: { type: 'string' },
            partnerAvatar: { type: 'string', nullable: true },
            lastMessage: { type: 'string' },
            lastMessageTime: { type: 'string', format: 'date-time' },
            unreadCount: { type: 'integer' },
          },
        },
      },
    },
    tags: [
      { name: '用户管理', description: '用户注册、登录、个人信息管理' },
      { name: '物品管理', description: '二手物品发布、搜索、管理' },
      { name: '交易管理', description: '交易流程管理' },
      { name: '资源共享', description: '共享资源发布、借用管理' },
      { name: '分类管理', description: '物品和资源分类管理' },
      { name: '消息系统', description: '用户间消息通信' },
    ],
  },
  // Support both TypeScript (dev) and JavaScript (production) files
  apis: ['./src/routes/*.ts', './dist/routes/*.js'],
};

export const swaggerSpec = swaggerJsdoc(options);
