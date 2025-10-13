# 环境管理系统部署指南

本指南详细说明如何在不同环境中部署和配置环境管理系统。

## 目录

- [开发环境部署](#开发环境部署)
- [测试环境部署](#测试环境部署)
- [预发布环境部署](#预发布环境部署)
- [生产环境部署](#生产环境部署)
- [CI/CD 环境部署](#cicd-环境部署)
- [Docker 部署](#docker-部署)
- [Kubernetes 部署](#kubernetes-部署)
- [故障排除](#故障排除)

## 开发环境部署

### 1. 环境准备

```bash
# 确保 Node.js 版本 >= 18
node --version

# 安装依赖
npm install
```

### 2. 配置文件设置

```bash
# 复制开发环境模板
cp config/env/env-templates/development.env .env

# 编辑配置文件
nano .env
```

### 3. 必需配置

```bash
# .env 文件内容示例
NODE_ENV=development
JWT_SECRET=dev_jwt_secret_key_12345
DB_PASSWORD=dev_password_123
LLM_API_KEY=dev_llm_api_key_placeholder

# 数据库配置
DATABASE_URL=postgresql://postgres:dev_password_123@localhost:15432/fastify_react_app
REDIS_URL=redis://localhost:6379

# 服务器配置
HOST=0.0.0.0
PORT=8001
LOG_LEVEL=debug
```

### 4. 启动服务

```bash
# 启动数据库服务
docker-compose up -d postgres redis

# 启动开发服务器
npm run dev
```

### 5. 验证部署

```bash
# 检查配置加载
pnpm run config:validate

# 运行测试
pnpm test
```

## 测试环境部署

### 1. 环境配置

```bash
# 复制测试环境模板
cp config/env/env-templates/test.env .env.test

# 设置环境变量
export NODE_ENV=test
```

### 2. 测试数据库设置

```bash
# 创建测试数据库
createdb fastify_react_app_test

# 运行数据库迁移
npm run db:migrate:test

# 运行种子数据
npm run db:seed:test
```

### 3. 运行测试

```bash
# 运行单元测试
npm run test:unit

# 运行集成测试
npm run test:integration

# 运行端到端测试
npm run test:e2e
```

## 预发布环境部署

### 1. 服务器准备

```bash
# 创建部署用户
sudo useradd -m -s /bin/bash deploy
sudo usermod -aG docker deploy

# 创建应用目录
sudo mkdir -p /opt/app
sudo chown deploy:deploy /opt/app
```

### 2. 环境配置

```bash
# 复制预发布环境模板
cp config/env/env-templates/staging.env .env.staging

# 设置环境变量
export NODE_ENV=staging
export DATABASE_URL=postgresql://user:password@staging-db:5432/app_staging
export REDIS_URL=redis://staging-redis:6379
```

### 3. 部署应用

```bash
# 构建应用
npm run build

# 启动应用
npm run start:staging
```

### 4. 健康检查

```bash
# 检查应用状态
curl http://staging-server:8001/health

# 检查配置
curl http://staging-server:8001/config/summary
```

## 生产环境部署

### 1. 安全配置

#### 使用环境变量

```bash
# 设置必需的环境变量
export NODE_ENV=production
export JWT_SECRET=$(openssl rand -base64 64)
export DB_PASSWORD=$(openssl rand -base64 32)
export LLM_API_KEY=your_real_llm_api_key

# 数据库配置
export DATABASE_URL=postgresql://user:password@prod-db:5432/app_production
export REDIS_URL=redis://prod-redis:6379

# 服务器配置
export HOST=0.0.0.0
export PORT=8001
export LOG_LEVEL=warn
```

#### 使用密钥管理服务

**AWS Secrets Manager:**

```bash
# 创建密钥
aws secretsmanager create-secret \
  --name "prod/app/config" \
  --description "Production app configuration" \
  --secret-string '{
    "JWT_SECRET": "your_jwt_secret",
    "DB_PASSWORD": "your_db_password",
    "LLM_API_KEY": "your_llm_api_key"
  }'

# 获取密钥
aws secretsmanager get-secret-value \
  --secret-id "prod/app/config" \
  --query SecretString --output text
```

**Azure Key Vault:**

```bash
# 创建密钥
az keyvault secret set \
  --vault-name "myvault" \
  --name "app-config" \
  --value '{
    "JWT_SECRET": "your_jwt_secret",
    "DB_PASSWORD": "your_db_password",
    "LLM_API_KEY": "your_llm_api_key"
  }'

# 获取密钥
az keyvault secret show \
  --vault-name "myvault" \
  --name "app-config" \
  --query value --output tsv
```

### 2. 应用部署

```bash
# 构建生产版本
npm run build:production

# 启动应用
npm run start:production
```

### 3. 监控和日志

```bash
# 设置日志收集
npm run logs:setup

# 监控应用性能
npm run monitor:start
```

## CI/CD 环境部署

### 1. GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test
        env:
          NODE_ENV: test
          JWT_SECRET: test_jwt_secret
          DB_PASSWORD: test_password
          LLM_API_KEY: test_llm_api_key

      - name: Build application
        run: npm run build

      - name: Deploy to production
        run: npm run deploy:production
        env:
          NODE_ENV: production
          JWT_SECRET: ${{ secrets.JWT_SECRET }}
          DB_PASSWORD: ${{ secrets.DB_PASSWORD }}
          LLM_API_KEY: ${{ secrets.LLM_API_KEY }}
```

### 2. GitLab CI

```yaml
# .gitlab-ci.yml
stages:
  - test
  - build
  - deploy

test:
  stage: test
  image: node:18
  script:
    - npm ci
    - npm test
  variables:
    NODE_ENV: test
    JWT_SECRET: test_jwt_secret
    DB_PASSWORD: test_password
    LLM_API_KEY: test_llm_api_key

build:
  stage: build
  image: node:18
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/

deploy:
  stage: deploy
  image: node:18
  script:
    - npm run deploy:production
  variables:
    NODE_ENV: production
    JWT_SECRET: $JWT_SECRET
    DB_PASSWORD: $DB_PASSWORD
    LLM_API_KEY: $LLM_API_KEY
  only:
    - main
```

## Docker 部署

### 1. Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# 复制依赖文件
COPY package*.json ./
RUN npm ci --only=production

# 复制应用代码
COPY . .

# 构建应用
RUN npm run build

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# 设置权限
RUN chown -R nextjs:nodejs /app
USER nextjs

# 暴露端口
EXPOSE 8001

# 启动应用
CMD ["npm", "start"]
```

### 2. Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - '8001:8001'
    environment:
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
      - DB_PASSWORD=${DB_PASSWORD}
      - LLM_API_KEY=${LLM_API_KEY}
      - DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@postgres:5432/app
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=app
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### 3. 部署命令

```bash
# 构建和启动
docker-compose up -d

# 查看日志
docker-compose logs -f app

# 停止服务
docker-compose down
```

## Kubernetes 部署

### 1. ConfigMap

```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  NODE_ENV: 'production'
  HOST: '0.0.0.0'
  PORT: '8001'
  LOG_LEVEL: 'warn'
  DATABASE_URL: 'postgresql://postgres:password@postgres:5432/app'
  REDIS_URL: 'redis://redis:6379'
```

### 2. Secret

```yaml
# k8s/secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
type: Opaque
data:
  JWT_SECRET: <base64-encoded-jwt-secret>
  DB_PASSWORD: <base64-encoded-db-password>
  LLM_API_KEY: <base64-encoded-llm-api-key>
```

### 3. Deployment

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: app
  template:
    metadata:
      labels:
        app: app
    spec:
      containers:
        - name: app
          image: your-registry/app:latest
          ports:
            - containerPort: 8001
          envFrom:
            - configMapRef:
                name: app-config
            - secretRef:
                name: app-secrets
          resources:
            requests:
              memory: '256Mi'
              cpu: '250m'
            limits:
              memory: '512Mi'
              cpu: '500m'
          livenessProbe:
            httpGet:
              path: /health
              port: 8001
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /ready
              port: 8001
            initialDelaySeconds: 5
            periodSeconds: 5
```

### 4. Service

```yaml
# k8s/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: app-service
spec:
  selector:
    app: app
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8001
  type: LoadBalancer
```

### 5. 部署命令

```bash
# 应用配置
kubectl apply -f k8s/

# 查看部署状态
kubectl get pods
kubectl get services

# 查看日志
kubectl logs -f deployment/app
```

## 故障排除

### 常见问题

#### 1. 配置加载失败

**问题**: `Configuration validation failed`

**解决方案**:

```bash
# 检查环境变量
echo $NODE_ENV
echo $JWT_SECRET

# 验证配置文件
npm run config:validate

# 查看详细错误
DEBUG=true npm start
```

#### 2. 数据库连接失败

**问题**: `Database connection failed`

**解决方案**:

```bash
# 检查数据库服务
docker-compose ps postgres

# 测试数据库连接
psql $DATABASE_URL -c "SELECT 1"

# 检查网络连接
telnet db-host 5432
```

#### 3. Redis 连接失败

**问题**: `Redis connection failed`

**解决方案**:

```bash
# 检查 Redis 服务
docker-compose ps redis

# 测试 Redis 连接
redis-cli -u $REDIS_URL ping

# 检查 Redis 配置
redis-cli -u $REDIS_URL config get "*"
```

#### 4. 端口冲突

**问题**: `Port 8001 is already in use`

**解决方案**:

```bash
# 查找占用端口的进程
lsof -i :8001

# 杀死进程
kill -9 <PID>

# 或使用不同端口
export PORT=8002
```

### 调试工具

#### 1. 配置调试

```typescript
import { ConfigDebugger } from './config/utils.js';

// 打印配置摘要
ConfigDebugger.printConfigSummary(config, true);

// 打印环境信息
ConfigDebugger.printEnvironmentInfo();

// 打印验证结果
ConfigDebugger.printValidationResults(config);
```

#### 2. 日志调试

```bash
# 启用详细日志
export LOG_LEVEL=debug
export VERBOSE_LOGGING=true

# 查看应用日志
npm run logs:tail

# 查看系统日志
journalctl -u your-app-service -f
```

#### 3. 性能监控

```bash
# 监控 CPU 和内存使用
top -p $(pgrep -f "node.*app")

# 监控网络连接
netstat -tulpn | grep :8001

# 监控磁盘使用
df -h
```

### 健康检查

#### 1. 应用健康检查

```bash
# 检查应用状态
curl http://localhost:8001/health

# 检查配置状态
curl http://localhost:8001/config/status

# 检查数据库连接
curl http://localhost:8001/health/database

# 检查 Redis 连接
curl http://localhost:8001/health/redis
```

#### 2. 系统健康检查

```bash
# 检查系统资源
free -h
df -h
uptime

# 检查服务状态
systemctl status your-app-service

# 检查端口监听
ss -tulpn | grep :8001
```

## 最佳实践

### 1. 安全实践

- 使用强密码和随机密钥
- 定期轮换敏感信息
- 使用密钥管理服务
- 启用所有安全功能
- 监控配置变更

### 2. 性能优化

- 使用连接池
- 启用缓存
- 优化数据库查询
- 监控性能指标
- 设置合理的超时时间

### 3. 监控和告警

- 设置健康检查
- 监控关键指标
- 配置告警规则
- 记录审计日志
- 定期备份配置

### 4. 灾难恢复

- 定期备份数据
- 测试恢复流程
- 准备回滚方案
- 文档化恢复步骤
- 培训运维团队
