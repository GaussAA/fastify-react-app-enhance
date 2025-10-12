# 🏗️ 基础设施配置

项目的基础设施配置目录，包含 Docker、Kubernetes、CI/CD 等部署和运维相关配置。

## 📁 目录结构

```
infrastructure/
├── database/            # 数据库配置
│   ├── postgres/        # PostgreSQL 配置
│   └── migrations/      # 数据库迁移脚本
├── docker/              # Docker 配置
│   ├── docker-compose.yml # Docker Compose 配置
│   ├── Dockerfile.api   # API 服务 Dockerfile
│   ├── Dockerfile.web   # Web 应用 Dockerfile
│   └── nginx/           # Nginx 配置
├── kubernetes/          # Kubernetes 配置
│   ├── api/             # API 服务 K8s 配置
│   ├── web/             # Web 应用 K8s 配置
│   ├── database/        # 数据库 K8s 配置
│   └── ingress/         # Ingress 配置
└── scripts/             # 基础设施脚本
    ├── deploy.sh        # 部署脚本
    ├── backup.sh        # 备份脚本
    └── monitoring.sh    # 监控脚本
```

## 🐳 Docker 配置

### Docker Compose

使用 Docker Compose 进行本地开发和测试：

```bash
# 启动所有服务
docker-compose -f infrastructure/docker/docker-compose.yml up -d

# 查看服务状态
docker-compose -f infrastructure/docker/docker-compose.yml ps

# 停止所有服务
docker-compose -f infrastructure/docker/docker-compose.yml down
```

### 服务配置

- **API 服务**: 端口 8001
- **Web 应用**: 端口 5173
- **PostgreSQL**: 端口 5432
- **Redis**: 端口 6379（可选）

### 环境变量

Docker 环境变量配置：

```env
# API 服务
API_PORT=8001
DATABASE_URL=postgresql://dev:dev@postgres:5432/mydb
JWT_SECRET=your-jwt-secret

# Web 应用
VITE_API_URL=http://localhost:8001

# 数据库
POSTGRES_DB=mydb
POSTGRES_USER=dev
POSTGRES_PASSWORD=dev
```

## ☸️ Kubernetes 配置

### 部署到 Kubernetes

```bash
# 应用所有配置
kubectl apply -f infrastructure/kubernetes/

# 查看部署状态
kubectl get pods
kubectl get services
kubectl get ingress
```

### 命名空间

建议使用独立的命名空间：

```bash
# 创建命名空间
kubectl create namespace fastify-react-app

# 在指定命名空间部署
kubectl apply -f infrastructure/kubernetes/ -n fastify-react-app
```

### 资源配置

- **API 服务**: 2 副本，1 CPU，512Mi 内存
- **Web 应用**: 2 副本，0.5 CPU，256Mi 内存
- **PostgreSQL**: 1 副本，1 CPU，1Gi 内存

## 🗄️ 数据库配置

### PostgreSQL 配置

```yaml
# 数据库配置
postgresql:
  image: postgres:15
  environment:
    POSTGRES_DB: mydb
    POSTGRES_USER: dev
    POSTGRES_PASSWORD: dev
  volumes:
    - postgres_data:/var/lib/postgresql/data
  ports:
    - '5432:5432'
```

### 数据持久化

使用 Docker 卷或 Kubernetes PV 进行数据持久化：

```bash
# Docker 卷
docker volume create postgres_data

# Kubernetes PV
kubectl apply -f infrastructure/kubernetes/database/pv.yaml
```

## 🔄 CI/CD 配置

### GitHub Actions

项目使用 GitHub Actions 进行持续集成和部署：

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '22'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm run test
      - run: pnpm run build
```

### 部署流程

1. **代码提交** → 触发 CI 流程
2. **运行测试** → 单元测试、集成测试
3. **构建镜像** → Docker 镜像构建
4. **部署到环境** → 开发/测试/生产环境

## 📊 监控和日志

### 监控配置

- **Prometheus**: 指标收集
- **Grafana**: 可视化监控
- **AlertManager**: 告警管理

### 日志配置

- **ELK Stack**: Elasticsearch + Logstash + Kibana
- **Fluentd**: 日志收集
- **Jaeger**: 分布式追踪

## 🔒 安全配置

### 网络安全

- **防火墙规则**: 限制端口访问
- **SSL/TLS**: HTTPS 加密
- **VPN**: 内网访问控制

### 数据安全

- **数据加密**: 传输和存储加密
- **访问控制**: RBAC 权限管理
- **备份策略**: 定期数据备份

## 🚀 部署指南

### 本地开发

```bash
# 1. 启动数据库
docker-compose -f infrastructure/docker/docker-compose.yml up -d postgres

# 2. 运行数据库迁移
pnpm run prisma:migrate

# 3. 启动应用
pnpm run dev
```

### 生产部署

```bash
# 1. 构建镜像
docker build -f infrastructure/docker/Dockerfile.api -t fastify-api .
docker build -f infrastructure/docker/Dockerfile.web -t fastify-web .

# 2. 部署到 Kubernetes
kubectl apply -f infrastructure/kubernetes/

# 3. 验证部署
kubectl get pods
kubectl logs -f deployment/api-deployment
```

## 🔧 维护操作

### 数据库备份

```bash
# 备份数据库
./infrastructure/scripts/backup.sh

# 恢复数据库
./infrastructure/scripts/restore.sh backup_file.sql
```

### 日志查看

```bash
# 查看应用日志
kubectl logs -f deployment/api-deployment
kubectl logs -f deployment/web-deployment

# 查看系统日志
journalctl -u docker
```

### 性能监控

```bash
# 查看资源使用
kubectl top pods
kubectl top nodes

# 查看服务状态
kubectl get services
kubectl describe service api-service
```

## 📚 相关文档

- [Docker 部署指南](../docs/deployment/docker.md)
- [Kubernetes 部署指南](../docs/deployment/kubernetes.md)
- [CI/CD 流程文档](../docs/generated/cicd/cicd-pipeline.md)
- [监控配置文档](../docs/generated/config/monitoring-config.md)

## 🆘 故障排除

### 常见问题

1. **服务无法启动**
   - 检查端口占用
   - 验证环境变量配置
   - 查看容器日志

2. **数据库连接失败**
   - 检查数据库服务状态
   - 验证连接字符串
   - 确认网络连通性

3. **镜像构建失败**
   - 检查 Dockerfile 语法
   - 验证依赖包版本
   - 查看构建日志

### 获取帮助

- 查看项目文档
- 检查 GitHub Issues
- 联系开发团队

---

_最后更新: 2025-01-27_
