# 🐳 Docker 部署指南

## 📋 概述

项目使用 Docker Compose 进行容器化部署，支持开发和生产环境。

## 🚀 快速开始

### 开发环境

```bash
# 启动所有服务
cd infrastructure/docker
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 服务配置

| 服务       | 端口 | 说明             |
| ---------- | ---- | ---------------- |
| PostgreSQL | 5432 | 数据库服务       |
| Redis      | 6379 | 缓存服务         |
| API        | 8001 | Fastify 后端服务 |
| Web        | 5173 | React 前端服务   |

## 📁 配置文件

- **Docker Compose**: `infrastructure/docker/docker-compose.yml`
- **API Dockerfile**: `infrastructure/docker/fastify.Dockerfile`
- **Web Dockerfile**: `infrastructure/docker/web.Dockerfile`

## 🔧 环境变量

确保在 `apps/api/.env` 中配置正确的数据库连接信息：

```env
DATABASE_URL="postgresql://dev:dev@localhost:5432/mydb"
REDIS_URL="redis://localhost:6379"
```

## 🛠️ 常用命令

```bash
# 停止所有服务
docker-compose down

# 重新构建并启动
docker-compose up --build

# 清理所有容器和镜像
docker-compose down --rmi all --volumes --remove-orphans
```
