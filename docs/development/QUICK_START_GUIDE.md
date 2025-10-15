# 🚀 快速开始指南

本指南将帮助您在 5 分钟内启动 Fastify + React 全栈项目。

## 📋 前置要求

- **Node.js** >= 22.0.0
- **pnpm** >= 10.0.0
- **Docker** (用于数据库服务)
- **Git**

## ⚡ 快速启动

### 1️⃣ 克隆项目

```bash
git clone https://github.com/yourname/fastify-react-app.git
cd fastify-react-app
```

### 2️⃣ 安装依赖

```bash
pnpm install
```

### 3️⃣ 配置环境变量

```bash
# 复制环境变量模板
cp config/env-templates/development.env .env

# 编辑 .env 文件，设置必要的配置
# 主要配置项：
DATABASE_URL="postgresql://postgres_user:postgres_123!@localhost:15432/fastify_react_app?schema=public"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
API_PORT=8001
WEB_PORT=5173
```

### 4️⃣ 一键启动

```bash
# 启动所有服务（数据库 + API + Web）
pnpm run start
```

等待服务启动完成，您将看到：

```
🎉 项目启动完成！

📋 服务信息：
  🌐 API服务器: http://localhost:8001
  📚 API文档: http://localhost:8001/docs
  🎨 Web应用: http://localhost:5173
  🗄️ PostgreSQL: localhost:15432
  🔴 Redis: localhost:6379
```

## 🎯 访问应用

- **前端应用**: [http://localhost:5173](http://localhost:5173)
- **API 服务**: [http://localhost:8001/api](http://localhost:8001/api)
- **API 文档**: [http://localhost:8001/docs](http://localhost:8001/docs)

## 🛠️ 常用命令

### 服务管理

```bash
# 启动所有服务
pnpm run start

# 停止所有服务
pnpm run stop

# 重启所有服务
pnpm run restart

# 仅启动开发服务器（需要数据库已运行）
pnpm run dev
```

### 数据库管理

```bash
# 启动数据库服务
pnpm run db:start

# 停止数据库服务
pnpm run db:stop

# 生成 Prisma 客户端
pnpm run prisma:generate

# 运行数据库迁移
pnpm run prisma:migrate
```

### 开发工具

```bash
# 检查环境
pnpm run check:env

# 运行测试
pnpm run test

# 代码格式化
pnpm run format

# 代码检查
pnpm run lint
```

## 🔧 环境配置

### 开发环境配置

项目使用统一的环境配置管理系统，支持：

- **类型安全**：完整的 TypeScript 类型定义
- **环境检测**：自动检测当前环境
- **配置验证**：使用 Zod 进行运行时验证
- **分层加载**：支持 5 层环境文件优先级

### 主要配置项

```env
# 数据库配置
DATABASE_URL="postgresql://postgres_user:postgres_123!@localhost:15432/fastify_react_app?schema=public"
REDIS_URL="redis://localhost:6379"

# JWT 配置
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"

# 服务端口
API_PORT=8001
WEB_PORT=5173

# LLM 配置（可选）
LLM_API_KEY="your-llm-api-key"
LLM_DEFAULT_PROVIDER="openai"
```

## 🐳 Docker 服务

项目使用 Docker Compose 管理数据库服务：

```bash
# 启动数据库服务
docker-compose -f infrastructure/docker/docker-compose.yml up -d

# 停止数据库服务
docker-compose -f infrastructure/docker/docker-compose.yml down
```

### 数据库服务

- **PostgreSQL**: localhost:15432
- **Redis**: localhost:6379

## 🧪 测试

```bash
# 运行 API 测试
pnpm run test

# 运行 Web 测试
pnpm run test:web

# 运行性能测试
pnpm run test:performance
```

## 📚 文档

```bash
# 生成 API 文档
pnpm run api-docs

# 生成所有文档
pnpm run docs:generate:all

# 启动文档服务器
pnpm run docs:serve
```

## 🔍 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   # 检查端口占用
   netstat -ano | findstr :8001
   
   # 停止占用端口的进程
   taskkill /PID <PID> /F
   ```

2. **数据库连接失败**
   ```bash
   # 检查 Docker 服务状态
   docker ps
   
   # 重启数据库服务
   pnpm run db:stop
   pnpm run db:start
   ```

3. **环境变量未加载**
   ```bash
   # 检查 .env 文件是否存在
   ls -la .env
   
   # 验证环境变量
   pnpm run check:env
   ```

### 获取帮助

```bash
# 运行环境检查
pnpm run check:env

# 运行综合检查
pnpm run check:all

# 查看项目状态
pnpm run monitor
```

## 🎉 下一步

现在您已经成功启动了项目！接下来可以：

1. **探索代码结构** - 查看 `apps/` 目录了解项目架构
2. **阅读 API 文档** - 访问 [http://localhost:8001/docs](http://localhost:8001/docs)
3. **运行测试** - 使用 `pnpm run test` 验证功能
4. **查看文档** - 阅读 `docs/` 目录中的详细文档
5. **开始开发** - 修改代码并观察热重载效果

## 📖 更多资源

- [项目架构文档](architecture/base-architecture.md)
- [API 文档](api/README.md)
- [部署指南](deployment/README.md)
- [开发工具指南](dev-tools.md)
- [环境配置文档](../../config/README.md)

---

**需要帮助？** 查看 [故障排除指南](troubleshooting.md) 或提交 Issue。
