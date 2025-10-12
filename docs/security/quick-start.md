# RBAC 系统快速开始指南

## 快速部署

### 1. 环境准备

确保已安装以下依赖：

- Node.js >= 22.0.0
- pnpm >= 10.0.0
- PostgreSQL >= 15
- Redis >= 7

### 2. 安装依赖

```bash
# 安装项目依赖
pnpm install

# 生成 Prisma 客户端
pnpm run prisma:generate
```

### 3. 配置环境变量

复制环境变量模板：

```bash
cp config/env-templates/api.env apps/api/.env
```

编辑 `apps/api/.env` 文件：

```env
NODE_ENV=development
PORT=8001

# 数据库配置
DATABASE_URL="postgresql://postgres:password@localhost:5432/fastify_react_app"
REDIS_URL="redis://localhost:6379"

# JWT 配置
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"

# CORS 配置
CORS_ORIGIN="http://localhost:5173"

# 日志配置
LOG_LEVEL="info"
```

### 4. 数据库设置

```bash
# 运行数据库迁移
pnpm run prisma:migrate

# 初始化 RBAC 系统（创建默认权限、角色和管理员用户）
pnpm run init:rbac
```

### 5. 启动服务

```bash
# 启动开发服务器
pnpm run dev
```

## 默认管理员账户

系统初始化后会创建默认管理员账户：

- **邮箱**: `admin@example.com`
- **密码**: `Admin123!@#`

⚠️ **重要**: 请在生产环境中立即修改默认密码！

## API 测试

### 1. 用户注册

```bash
curl -X POST http://localhost:8001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "测试用户",
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

### 2. 用户登录

```bash
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

### 3. 获取用户列表（需要认证）

```bash
curl -X GET http://localhost:8001/api/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. 创建角色（需要管理员权限）

```bash
curl -X POST http://localhost:8001/api/roles \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "editor",
    "displayName": "编辑者",
    "description": "内容编辑权限",
    "permissions": ["user:read", "user:update"]
  }'
```

## Swagger API 文档

启动服务后，访问 Swagger UI：

- **URL**: http://localhost:8001/docs
- **功能**: 交互式 API 文档和测试

## 基本使用流程

### 1. 管理员操作

1. **登录管理员账户**
2. **创建自定义权限**（如需要）
3. **创建角色并分配权限**
4. **为用户分配角色**

### 2. 普通用户操作

1. **注册新账户**
2. **登录系统**
3. **根据角色权限访问相应功能**

### 3. 权限检查示例

在代码中使用权限中间件：

```javascript
// 检查用户读取权限
app.get(
  '/api/users',
  {
    preHandler: [authenticateToken, requirePermission('user', 'read')],
  },
  handler
);

// 检查管理员角色
app.delete(
  '/api/users/:id',
  {
    preHandler: [authenticateToken, requireRole(['admin'])],
  },
  handler
);
```

## 常用命令

```bash
# 开发环境
pnpm run dev              # 启动开发服务器
pnpm run dev:api          # 仅启动 API 服务
pnpm run dev:web          # 仅启动 Web 服务

# 数据库操作
pnpm run prisma:migrate   # 运行数据库迁移
pnpm run prisma:generate  # 生成 Prisma 客户端
pnpm run prisma:seed      # 运行数据库种子

# RBAC 系统
pnpm run init:rbac        # 初始化 RBAC 系统

# 测试
pnpm run test             # 运行 API 测试
pnpm run test:web         # 运行 Web 测试
pnpm run test:coverage    # 运行测试并生成覆盖率报告

# 代码质量
pnpm run lint             # 代码检查
pnpm run lint:fix         # 自动修复代码问题
pnpm run format           # 代码格式化
```

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查 PostgreSQL 服务是否运行
   - 验证 DATABASE_URL 配置
   - 确认数据库用户权限

2. **JWT Token 验证失败**
   - 检查 JWT_SECRET 配置
   - 确认 Token 格式正确
   - 验证 Token 是否过期

3. **权限检查失败**
   - 确认用户具有相应角色
   - 检查角色是否分配了正确权限
   - 验证权限名称是否正确

4. **Redis 连接失败**
   - 检查 Redis 服务是否运行
   - 验证 REDIS_URL 配置

### 调试技巧

1. **启用详细日志**

```env
LOG_LEVEL=debug
```

2. **查看审计日志**

```bash
curl -X GET "http://localhost:8001/api/audit?limit=10" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

3. **检查用户权限**

```bash
curl -X GET "http://localhost:8001/api/users/1" \
  -H "Authorization: Bearer USER_TOKEN"
```

## 生产环境部署

### 1. 环境变量配置

```env
NODE_ENV=production
JWT_SECRET="your-production-secret-key"
DATABASE_URL="your-production-database-url"
REDIS_URL="your-production-redis-url"
```

### 2. 安全配置

- 修改默认管理员密码
- 使用强 JWT 密钥
- 配置 HTTPS
- 设置防火墙规则
- 启用日志监控

### 3. 性能优化

- 配置数据库连接池
- 启用 Redis 缓存
- 设置适当的日志级别
- 配置负载均衡

## 下一步

1. **阅读完整文档**: [RBAC 系统文档](./rbac-system.md)
2. **查看 API 文档**: http://localhost:8001/docs
3. **运行测试**: `pnpm run test`
4. **自定义权限**: 根据业务需求创建自定义权限和角色
5. **集成前端**: 在 React 应用中集成认证功能

## 支持

如果遇到问题，请：

1. 查看 [故障排除](#故障排除) 部分
2. 检查 [完整文档](./rbac-system.md)
3. 查看项目 Issues
4. 联系开发团队
