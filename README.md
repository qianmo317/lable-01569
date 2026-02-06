# 校园二手物品交易与资源共享平台

## How to Run

### 使用 Docker Compose 启动（推荐）

```bash
# 克隆项目后，在根目录执行

# 1. 复制环境变量配置文件
cp .env.example .env

# 2. 编辑 .env 文件，设置必要的环境变量（特别是 JWT_SECRET）
# JWT_SECRET 必须至少 32 个字符

# 3. 启动服务
docker compose up --build -d

# 查看运行状态
docker compose ps

# 查看日志
docker compose logs -f backend

# 停止服务
docker compose down
```
### 本地运行方式（开发）

如果你不想用 Docker，也可以直接用 Node.js 在本地启动后端服务。

#### 安装依赖

```bash
cd backend
npm install
```

#### 配置环境变量

复制 `.env.example` 文件并重命名为 `.env`，根据实际情况修改配置：

```bash
cp .env.example .env
```

#### 启动开发服务

```bash
# 启动开发模式（自动重载 + TypeScript 支持）
npm run dev
```

#### 构建并启动生产模式

```bash
npm run build    # 编译 TypeScript
npm start        # 启动编译后的服务
```

> ⚠️ 需确保已正确安装并启动 MySQL 数据库服务，并在 `.env` 中设置好相关连接参数。首次启动会自动创建表结构。


### 服务启动后

- 后端 API 服务: http://localhost:3000
- API 文档 (Swagger UI): http://localhost:3000/api-docs
- OpenAPI 规范 (JSON): http://localhost:3000/api-docs.json
- 健康检查: http://localhost:3000/health
- MySQL 数据库: localhost:3307

## Services

| 服务 | 端口 | 说明 |
|------|------|------|
| backend | 3000 | Node.js 后端 API 服务 |
| mysql | 3307 | MySQL 8.0 数据库服务 |

## 环境变量说明

| 变量名 | 必填 | 默认值 | 说明 |
|--------|------|--------|------|
| JWT_SECRET | 是(生产) | - | JWT 密钥，生产环境必须设置且至少32字符 |
| NODE_ENV | 否 | development | 运行环境 |
| DB_SYNCHRONIZE | 否 | false | 是否自动同步数据库结构 |
| ENABLE_SEED | 否 | false | 是否启用种子数据 |
| CORS_ORIGINS | 否 | http://localhost:3000 | 允许的跨域来源 |
| RATE_LIMIT_MAX | 否 | 100 | 速率限制：每窗口最大请求数 |

## 测试账号

> ⚠️ 测试账号仅在开发环境且 `ENABLE_SEED=true` 时创建

| 用户名 | 密码 | 角色 | 说明 |
|--------|------|------|------|
| admin | admin123 | 管理员 | 系统管理员账号，拥有所有权限 |
| testuser | test123 | 普通用户 | 测试用户1，可进行物品发布、交易等操作 |
| testuser2 | test123 | 普通用户 | 测试用户2，用于测试交易对手方 |

## API 测试工具

项目提供了交互式 API 测试脚本 `test-api.sh`，可方便地测试所有 API 接口。

### 启动测试工具

```bash
./test-api.sh
```

### 功能菜单

| 编号 | 功能 | 说明 |
|------|------|------|
| 0 | 健康检查 | 检查服务是否正常运行 |
| 1 | 登录 (testuser) | 使用测试用户登录 |
| 2 | 登录 (admin) | 使用管理员登录 |
| 3 | 注册新用户 | 创建一个新用户 |
| 4 | 获取个人信息 | 查看当前登录用户信息 |
| 5 | 获取所有分类 | 列出物品和资源分类 |
| 6 | 搜索物品 | 按关键词搜索二手物品 |
| 7 | 发布物品 | 发布一个测试物品 |
| 8 | 获取我的物品 | 查看已发布的物品 |
| 9 | 搜索共享资源 | 按关键词搜索共享资源 |
| 10 | 发布共享资源 | 发布一个测试资源 |
| 11 | 获取我的交易 | 查看交易记录 |
| 12 | 获取会话列表 | 查看消息会话 |
| 13 | 获取未读消息数 | 查看未读消息数量 |
| **99** | **运行全部测试** | 一键执行所有测试 |
| q | 退出 | 退出测试工具 |

### 使用流程

1. 启动脚本后，先选择 `[1]` 或 `[2]` 登录
2. 登录成功后菜单会显示 **✅ 已登录** 状态
3. 选择需要测试的功能编号
4. 输入 `99` 可一键运行全部测试

### 可选依赖

安装 `jq` 可获得更好的 JSON 格式化输出：

```bash
brew install jq
```

## 题目内容

开发一个校园二手物品交易与资源共享平台的后端系统，具体要求如下： 

1. 技术栈要求： 
- 编程语言：必须使用TypeScript进行所有代码编写，充分利用其类型系统、接口、泛型等特性确保代码类型安全 
- 数据库：采用MySQL数据库进行数据存储与管理 
- 模块化开发：代码需采用模块化组织方式，实现清晰的代码结构，确保系统具备良好的可维护性和扩展性 

2. 功能实现范围： 
- 专注于后端功能开发，无需实现前端页面 
- 无需编写测试用例 
- 确保所有后端功能能够正确执行并达到预期效果 

3. 核心功能模块（需包含但不限于）： 
- 用户管理模块：实现用户注册、登录、信息修改等基础功能 
- 物品管理模块：支持二手物品发布、编辑、删除、查询等操作 
- 交易流程模块：实现物品交易的完整流程管理 
- 资源共享模块：提供校园资源共享的相关功能支持 

4. 系统架构要求： 
- 采用分层架构设计，如控制器层、服务层、数据访问层等 
- 实现清晰的模块间接口定义，确保模块间低耦合高内聚 

5. 数据存储要求： 
- 设计合理的MySQL数据库表结构 
- 实现必要的索引优化以提升查询性能 
- 确保数据完整性和一致性 

请按照上述要求开发后端系统，确保所有功能能够成功实现并正常运行。

---

## 项目介绍

这是一个基于 Node.js + TypeScript + MySQL 开发的校园二手物品交易与资源共享平台后端系统。

### 系统架构

```
backend/
├── src/
│   ├── config/          # 配置文件
│   ├── controllers/     # 控制器层 - 处理HTTP请求
│   ├── entities/        # 实体层 - TypeORM实体定义
│   ├── middlewares/     # 中间件 - 认证、错误处理等
│   ├── routes/          # 路由层 - API路由定义
│   ├── services/        # 服务层 - 业务逻辑
│   ├── seeds/           # 数据库种子数据
│   └── index.ts         # 应用入口
├── Dockerfile           # Docker镜像构建文件
├── package.json
└── tsconfig.json
```

### 核心功能

#### 1. 用户管理模块
- 用户注册 `POST /api/users/register`
- 用户登录 `POST /api/users/login`
- 获取个人信息 `GET /api/users/profile/me`
- 更新个人信息 `PUT /api/users/profile/me`
- 修改密码 `PUT /api/users/password`

#### 2. 物品管理模块
- 发布物品 `POST /api/items`
- 获取物品详情 `GET /api/items/:id`
- 更新物品 `PUT /api/items/:id`
- 删除物品 `DELETE /api/items/:id`
- 搜索物品 `GET /api/items/search`
- 获取我的物品 `GET /api/items/user/my-items`

#### 3. 交易流程模块
- 发起交易 `POST /api/transactions`
- 获取交易详情 `GET /api/transactions/:id`
- 接受交易 `PUT /api/transactions/:id/accept`
- 拒绝交易 `PUT /api/transactions/:id/reject`
- 标记付款 `PUT /api/transactions/:id/pay`
- 标记发货 `PUT /api/transactions/:id/ship`
- 确认收货 `PUT /api/transactions/:id/complete`
- 取消交易 `PUT /api/transactions/:id/cancel`
- 卖家评价 `POST /api/transactions/:id/rate/seller`
- 买家评价 `POST /api/transactions/:id/rate/buyer`
- 获取我的交易 `GET /api/transactions/my-transactions`

#### 4. 资源共享模块
- 发布共享资源 `POST /api/resources`
- 获取资源详情 `GET /api/resources/:id`
- 更新资源 `PUT /api/resources/:id`
- 删除资源 `DELETE /api/resources/:id`
- 搜索资源 `GET /api/resources/search`
- 发起借用请求 `POST /api/resources/borrows`
- 批准借用 `PUT /api/resources/borrows/:id/approve`
- 拒绝借用 `PUT /api/resources/borrows/:id/reject`
- 开始借用 `PUT /api/resources/borrows/:id/start`
- 归还资源 `PUT /api/resources/borrows/:id/return`
- 确认归还 `PUT /api/resources/borrows/:id/confirm-return`
- 评价借用 `POST /api/resources/borrows/:id/rate`

#### 5. 分类管理模块
- 获取所有分类 `GET /api/categories`
- 获取物品分类 `GET /api/categories/items`
- 获取资源分类 `GET /api/categories/resources`
- 创建分类（管理员）`POST /api/categories`
- 更新分类（管理员）`PUT /api/categories/:id`
- 删除分类（管理员）`DELETE /api/categories/:id`

#### 6. 消息模块
- 发送消息 `POST /api/messages`
- 获取会话列表 `GET /api/messages/conversations`
- 获取会话消息 `GET /api/messages/conversations/:partnerId`
- 标记已读 `PUT /api/messages/read`
- 获取未读数量 `GET /api/messages/unread-count`

### 数据库设计

系统包含以下核心数据表：

| 表名 | 说明 |
|------|------|
| users | 用户表 |
| categories | 分类表 |
| items | 二手物品表 |
| transactions | 交易记录表 |
| shared_resources | 共享资源表 |
| resource_borrows | 资源借用记录表 |
| messages | 消息表 |

### 技术特点

1. **TypeScript 全栈开发**：充分利用类型系统确保代码安全
2. **TypeORM 数据库访问**：实体定义与数据库操作的优雅结合
3. **JWT 认证**：基于 Token 的无状态认证方案
4. **分层架构**：Controller -> Service -> Repository 清晰分层
5. **参数验证**：使用 express-validator 进行请求参数校验
6. **错误处理**：统一的错误处理中间件
7. **Docker 容器化**：支持跨平台（ARM/x86）部署
8. **安全防护**：速率限制、CORS 配置、敏感数据保护
9. **并发控制**：交易和借用流程使用悲观锁防止竞态条件

### API 使用示例

#### 用户注册
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "newuser@campus.edu",
    "password": "password123"
  }'
```

#### 用户登录
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "test123"
  }'
```

#### 发布物品（需要认证）
```bash
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "二手笔记本电脑",
    "description": "使用一年，性能良好，无明显磨损",
    "price": 2500,
    "condition": "good",
    "categoryId": 1
  }'
```

#### 搜索物品
```bash
curl "http://localhost:3000/api/items/search?keyword=电脑&minPrice=1000&maxPrice=5000"
```

### License

MIT
