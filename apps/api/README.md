# 🚀 Fastify API 服务

基于 Fastify 框架的高性能 API 服务，提供 RESTful API 接口。

## 🏗️ 技术栈

- **Fastify 5.6.1** - 高性能 Node.js Web 框架
- **Prisma 5.22.0** - 类型安全的数据库 ORM
- **PostgreSQL** - 关系型数据库
- **TypeScript 5.7.2** - 类型安全的 JavaScript
- **ESM (ES Modules)** - 现代模块系统
- **Jest 30.2.0** - 测试框架
- **tsx** - 现代 TypeScript 执行器
- **JWT** - 身份验证
- **Swagger/OpenAPI 3.0** - API 文档自动生成

## 📁 项目结构

```
apps/api/
├── src/
│   ├── config/          # 配置模块
│   ├── controllers/     # 控制器
│   ├── middlewares/     # 中间件
│   ├── models/          # 数据模型
│   ├── plugins/         # Fastify 插件
│   ├── routes/          # 路由定义
│   ├── services/        # 业务服务
│   ├── utils/           # 工具函数
│   ├── app.ts           # 应用入口
│   ├── prisma-client.ts # Prisma 客户端
│   └── server.ts        # 服务器启动
├── tests/
│   ├── unit/            # 单元测试
│   └── integration/     # 集成测试
├── prisma/
│   └── schema.prisma    # 数据库模式
├── package.json         # 依赖配置
├── tsconfig.json        # TypeScript 配置
├── jest.config.js       # Jest 配置
└── README.md           # 本文档
```

## 🚀 快速开始

### 1. 安装依赖

```bash
# 在项目根目录
pnpm install

# 或单独安装 API 依赖
cd apps/api
pnpm install
```

### 2. 环境配置

复制环境变量模板：

```bash
cp ../../config/env-templates/api.env .env
```

主要配置项：

```env
DATABASE_URL="postgresql://dev:dev@localhost:5432/mydb"
JWT_SECRET="your-super-secret-jwt-key"
PORT=8001
LOG_LEVEL="info"
```

### 3. 数据库设置

```bash
# 生成 Prisma 客户端
pnpm run prisma:generate

# 运行数据库迁移
pnpm run prisma:migrate

# 填充种子数据（可选）
pnpm run prisma:seed
```

### 4. 启动服务

```bash
# 开发模式
pnpm run dev

# 生产模式
pnpm run start

# 或从根目录启动
cd ../..
pnpm run dev:api
```

服务启动后访问：

- **API 服务**: http://localhost:8001
- **Swagger UI 文档**: http://localhost:8001/docs
- **OpenAPI JSON**: http://localhost:8001/docs/json
- **健康检查**: http://localhost:8001/

## 🧪 测试

```bash
# 运行所有测试
pnpm run test

# 运行测试并生成覆盖率报告
pnpm run test:coverage

# 运行单元测试
pnpm run test:unit

# 运行集成测试
pnpm run test:integration
```

## 📊 API 接口

### 📖 API 文档

项目集成了 **Swagger/OpenAPI 3.0** 自动文档生成：

- **Swagger UI**: http://localhost:8001/docs
  - 交互式 API 文档界面
  - 支持在线测试 API 接口
  - 自动生成请求/响应示例

- **OpenAPI JSON**: http://localhost:8001/docs/json
  - 机器可读的 API 规范
  - 可用于代码生成和集成

### 🔧 API 端点

#### 健康检查

- `GET /` - API 服务状态检查

#### 用户管理

- `GET /api/users` - 获取用户列表
- `POST /api/users` - 创建用户
- `GET /api/users/:id` - 获取用户详情
- `PUT /api/users/:id` - 更新用户
- `DELETE /api/users/:id` - 删除用户

## 🔧 开发工具

### 📖 API 文档开发

```bash
# 启动开发服务器（自动生成文档）
pnpm run dev

# 访问 Swagger UI
# http://localhost:8001/docs

# 获取 OpenAPI JSON 规范
# http://localhost:8001/docs/json
```

**Swagger 文档特性**：

- ✅ 自动生成 API 文档
- ✅ 交互式接口测试
- ✅ 请求/响应示例
- ✅ 参数验证说明
- ✅ 错误码文档

### 代码质量

```bash
# 代码检查
pnpm run lint

# 代码格式化
pnpm run format

# 类型检查
pnpm run type-check
```

### 数据库操作

```bash
# 查看数据库状态
pnpm run prisma:studio

# 重置数据库
pnpm run prisma:reset

# 部署迁移
pnpm run prisma:deploy
```

## 📝 开发规范

1. **代码风格**: 使用 ESLint + Prettier 统一代码风格
2. **类型安全**: 严格使用 TypeScript 类型定义
3. **模块系统**: 使用 ESM (ES Modules) 现代模块系统
4. **错误处理**: 统一的错误处理机制
5. **日志记录**: 使用 Pino 进行结构化日志记录
6. **测试覆盖**: 保持 80% 以上的测试覆盖率

## 🚀 部署

### Docker 部署

```bash
# 构建镜像
docker build -t fastify-api .

# 运行容器
docker run -p 8001:8001 fastify-api
```

### 环境变量

生产环境需要配置：

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=your-production-secret
PORT=8001
LOG_LEVEL=warn
```

## 📚 相关文档

- [API 文档](../../docs/api/README.md)
- [数据库设计](../../docs/database/README.md)
- [部署指南](../../docs/deployment/README.md)
- [开发指南](../../docs/development/README.md)

---

_最后更新: 2025-01-27_
