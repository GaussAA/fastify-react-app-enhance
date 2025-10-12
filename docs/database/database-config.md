# 🗄️ 数据库配置指南

## 📋 概述

本项目使用 PostgreSQL 作为主数据库，Redis 作为缓存和会话存储。所有数据都持久化存储到项目的 `infrastructure/database/` 目录下。

## 🏗️ 架构设计

```
infrastructure/
├── database/
│   ├── postgres/          # PostgreSQL 数据目录
│   └── redis/             # Redis 数据目录
└── docker/
    └── docker-compose.yml # Docker 服务配置
```

## 🔧 配置详情

### PostgreSQL 配置

- **版本**: PostgreSQL 15
- **端口**: 5432
- **数据库**: mydb
- **用户**: dev
- **密码**: dev
- **数据目录**: `infrastructure/database/postgres/`

### Redis 配置

- **版本**: Redis 7
- **端口**: 6379
- **数据目录**: `infrastructure/database/redis/`

## 🚀 快速启动

### 1. 启动数据库服务

```bash
# 进入 Docker 配置目录
cd infrastructure/docker

# 启动 PostgreSQL 和 Redis
docker compose up -d postgres redis
```

### 2. 运行数据库迁移

```bash
# 运行 Prisma 迁移
pnpm --filter fastify-api run prisma:migrate

# 生成 Prisma 客户端
pnpm --filter fastify-api run prisma:generate

# 填充种子数据
pnpm --filter fastify-api run prisma:seed
```

### 3. 验证连接

```bash
# 检查数据库配置
node tools/scripts/automation/check-database-config.js
```

## 📁 环境变量配置

### API 环境变量 (`env-templates/api.env`)

```env
# 数据库配置
DATABASE_URL="postgresql://postgres_user:postgres_123!@localhost:5432/mydb?schema=public"

# Redis 配置
REDIS_URL="redis://localhost:6379"

# 应用配置
NODE_ENV="development"
PORT=8001
HOST="0.0.0.0"

# JWT 配置
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"

# 日志配置
LOG_LEVEL="info"

# CORS 配置
CORS_ORIGIN="http://localhost:5173"
```

### Web 环境变量 (`env-templates/web.env`)

```env
# API 配置
VITE_API_URL="http://localhost:8001"

# 应用配置
VITE_APP_NAME="Fastify React App"
VITE_APP_VERSION="1.0.0"

# 环境配置
VITE_NODE_ENV="development"

# 功能开关
VITE_ENABLE_DEVTOOLS="true"
VITE_ENABLE_MOCK="false"
```

## 🔍 数据持久化

### 绑定挂载配置

Docker Compose 使用绑定挂载将数据持久化到项目目录：

```yaml
services:
  postgres:
    volumes:
      - ../../infrastructure/database/postgres:/var/lib/postgresql/data

  redis:
    volumes:
      - ../../infrastructure/database/redis:/data
```

### 数据备份

数据文件直接存储在项目目录中，可以通过以下方式备份：

```bash
# 备份 PostgreSQL 数据
cp -r infrastructure/database/postgres backups/postgres-$(date +%Y%m%d)

# 备份 Redis 数据
cp -r infrastructure/database/redis backups/redis-$(date +%Y%m%d)
```

## 🛠️ 开发工具

### 数据库管理工具

- **pgAdmin**: PostgreSQL 管理界面
- **RedisInsight**: Redis 管理界面
- **DBeaver**: 通用数据库管理工具

### 连接信息

- **PostgreSQL**: `localhost:5432`
  - 数据库: `mydb`
  - 用户: `dev`
  - 密码: `dev`

- **Redis**: `localhost:6379`
  - 无密码认证

## 🔧 故障排除

### 常见问题

1. **Docker 服务未启动**

   ```bash
   # 启动 Docker Desktop
   # 或检查 Docker 服务状态
   docker ps
   ```

2. **端口冲突**

   ```bash
   # 检查端口占用
   netstat -an | findstr :5432
   netstat -an | findstr :6379
   ```

3. **数据目录权限问题**

   ```bash
   # 确保数据目录有写权限
   chmod 755 infrastructure/database/postgres
   chmod 755 infrastructure/database/redis
   ```

4. **Prisma 客户端未生成**
   ```bash
   # 重新生成 Prisma 客户端
   pnpm --filter fastify-api run prisma:generate
   ```

### 重置数据库

```bash
# 停止服务
docker compose -f infrastructure/docker/docker-compose.yml down

# 删除数据目录
rm -rf infrastructure/database/postgres
rm -rf infrastructure/database/redis

# 重新启动
docker compose -f infrastructure/docker/docker-compose.yml up -d postgres redis

# 运行迁移
pnpm --filter fastify-api run prisma:migrate
```

## 📊 监控和维护

### 健康检查

```bash
# 检查数据库配置
node tools/scripts/automation/check-database-config.js

# 检查服务状态
docker compose -f infrastructure/docker/docker-compose.yml ps
```

### 性能监控

- 使用 `pg_stat_activity` 监控 PostgreSQL 连接
- 使用 `INFO` 命令监控 Redis 状态
- 定期检查磁盘空间使用情况

## 🔒 安全注意事项

1. **生产环境**: 修改默认密码和密钥
2. **网络安全**: 限制数据库端口访问
3. **数据加密**: 考虑启用 SSL/TLS 连接
4. **备份策略**: 定期备份重要数据

## 📚 相关文档

- [Prisma 文档](https://www.prisma.io/docs/)
- [PostgreSQL 文档](https://www.postgresql.org/docs/)
- [Redis 文档](https://redis.io/documentation)
- [Docker Compose 文档](https://docs.docker.com/compose/)
