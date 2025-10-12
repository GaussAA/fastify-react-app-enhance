# 🚀 部署脚本工具集

**位置**: `tools/scripts/deployment/`  
**用途**: 项目构建、部署和发布管理  
**更新时间**: 2025-01-27

## 📋 脚本概览

| 脚本名称    | 功能描述 | 使用场景         |
| ----------- | -------- | ---------------- |
| `build.js`  | 项目构建 | 构建API和Web应用 |
| `deploy.js` | 项目部署 | 部署到生产环境   |

---

## 🚀 快速开始

### 1. 项目构建

```bash
# 构建整个项目
node tools/scripts/deployment/build.js
```

### 2. 项目部署

```bash
# 部署到生产环境
node tools/scripts/deployment/deploy.js
```

---

## 📖 详细使用说明

### 🏗️ 项目构建脚本 (`build.js`)

**功能**: 构建整个项目，包括API和Web应用，生成生产就绪的构建文件

**构建步骤**:

1. 清理之前的构建文件
2. 安装依赖
3. 生成Prisma客户端
4. 构建API应用
5. 构建Web应用
6. 验证构建结果
7. 生成构建报告

**使用方法**:

```bash
# 基本构建
node tools/scripts/deployment/build.js

# 构建完成后会显示构建统计信息
```

**输出示例**:

```
🏗️ 开始项目构建...

🧹 清理之前的构建文件...
  ✅ 清理完成

📦 安装依赖...
  ✅ 根目录依赖已安装
  ✅ API项目依赖已安装
  ✅ Web项目依赖已安装

🔧 生成Prisma客户端...
  ✅ Prisma客户端已生成

🏗️ 构建API应用...
  ✅ API应用构建完成
  📊 构建大小: 15.2 MB

🌐 构建Web应用...
  ✅ Web应用构建完成
  📊 构建大小: 2.1 MB

🔍 验证构建结果...
  ✅ API构建文件验证通过
  ✅ Web构建文件验证通过

📊 生成构建报告...
  ✅ 构建报告已生成

🎉 项目构建完成！
📊 构建统计:
  - 总构建时间: 2分30秒
  - API构建大小: 15.2 MB
  - Web构建大小: 2.1 MB
  - 总文件数: 1,234
  - 构建状态: ✅ 成功
```

**构建配置**:

```javascript
// 构建配置选项
const buildConfig = {
  api: {
    sourceDir: 'apps/api',
    buildDir: 'apps/api/dist',
    entryPoint: 'src/server.ts',
    target: 'node18',
    format: 'esm',
  },
  web: {
    sourceDir: 'apps/web',
    buildDir: 'apps/web/dist',
    entryPoint: 'src/main.tsx',
    target: 'es2020',
    format: 'es',
  },
  cleanup: {
    enabled: true,
    patterns: ['dist/**', 'build/**', '*.tsbuildinfo'],
  },
  verification: {
    enabled: true,
    checkFiles: true,
    checkSizes: true,
  },
};
```

**构建验证**:

```bash
# 验证构建文件
ls -la apps/api/dist/
ls -la apps/web/dist/

# 检查构建文件大小
du -sh apps/api/dist/
du -sh apps/web/dist/
```

### 🚀 项目部署脚本 (`deploy.js`)

**功能**: 部署项目到生产环境，支持多种部署方式

**部署方式**:

- Docker部署
- PM2部署
- 直接部署

**部署步骤**:

1. 设置环境变量
2. 运行测试
3. 构建项目
4. 执行部署
5. 验证部署
6. 生成部署报告

**使用方法**:

```bash
# 基本部署
node tools/scripts/deployment/deploy.js

# 指定部署模式
NODE_ENV=production node tools/scripts/deployment/deploy.js

# 部署到特定环境
DEPLOY_ENV=staging node tools/scripts/deployment/deploy.js
```

**输出示例**:

```
🚀 开始项目部署...

⚙️ 设置环境变量...
  ✅ 环境变量已设置
  📊 部署环境: production
  📊 部署模式: docker

🧪 运行测试...
  ✅ 所有测试通过

🏗️ 构建项目...
  ✅ 项目构建完成

🚀 执行部署...
  🐳 使用Docker部署...
  ✅ Docker镜像构建完成
  ✅ 容器启动成功
  ✅ 服务健康检查通过

🔍 验证部署...
  ✅ API服务验证通过
  ✅ Web服务验证通过
  ✅ 数据库连接验证通过

📊 生成部署报告...
  ✅ 部署报告已生成

🎉 项目部署完成！
📊 部署统计:
  - 部署时间: 5分30秒
  - 部署环境: production
  - 部署模式: docker
  - API服务: ✅ 运行中
  - Web服务: ✅ 运行中
  - 数据库: ✅ 连接正常
```

**部署配置**:

```javascript
// 部署配置选项
const deployConfig = {
  environments: {
    development: {
      apiUrl: 'http://localhost:8001',
      webUrl: 'http://localhost:5173',
      database: 'postgresql://localhost:5432/fastify_react_app_dev',
    },
    staging: {
      apiUrl: 'https://api-staging.example.com',
      webUrl: 'https://staging.example.com',
      database: 'postgresql://staging-db:5432/fastify_react_app_staging',
    },
    production: {
      apiUrl: 'https://api.example.com',
      webUrl: 'https://example.com',
      database: 'postgresql://prod-db:5432/fastify_react_app_prod',
    },
  },
  deployment: {
    mode: 'docker', // docker, pm2, direct
    healthCheck: {
      enabled: true,
      timeout: 30000,
      retries: 3,
    },
    rollback: {
      enabled: true,
      maxVersions: 5,
    },
  },
};
```

**Docker部署**:

```bash
# Docker部署模式
DEPLOY_MODE=docker node tools/scripts/deployment/deploy.js

# 输出示例:
🐳 使用Docker部署...
  📦 构建Docker镜像...
  ✅ 镜像构建完成: fastify-react-app:latest
  🚀 启动容器...
  ✅ 容器启动成功: fastify-react-app-prod
  🔍 健康检查...
  ✅ 服务健康检查通过
```

**PM2部署**:

```bash
# PM2部署模式
DEPLOY_MODE=pm2 node tools/scripts/deployment/deploy.js

# 输出示例:
🔄 使用PM2部署...
  📦 准备部署文件...
  ✅ 部署文件准备完成
  🚀 启动PM2进程...
  ✅ PM2进程启动成功
  🔍 进程状态检查...
  ✅ 进程运行正常
```

**直接部署**:

```bash
# 直接部署模式
DEPLOY_MODE=direct node tools/scripts/deployment/deploy.js

# 输出示例:
📁 使用直接部署...
  📦 复制构建文件...
  ✅ 构建文件复制完成
  🚀 启动服务...
  ✅ 服务启动成功
  🔍 服务状态检查...
  ✅ 服务运行正常
```

---

## 📁 输出文件

### 构建文件

```
apps/api/dist/                    # API构建输出
├── server.js                     # 主服务器文件
├── server.js.map                 # 源映射文件
└── ...                          # 其他构建文件

apps/web/dist/                    # Web构建输出
├── index.html                    # 主HTML文件
├── assets/                       # 静态资源
│   ├── index-abc123.js          # JavaScript文件
│   ├── index-def456.css         # CSS文件
│   └── ...                      # 其他资源
└── ...                          # 其他构建文件
```

### 部署文件

```
deployment/
├── docker/                       # Docker部署文件
│   ├── Dockerfile               # Docker镜像文件
│   ├── docker-compose.yml       # Docker Compose配置
│   └── .dockerignore            # Docker忽略文件
├── pm2/                         # PM2部署文件
│   ├── ecosystem.config.js      # PM2配置文件
│   └── start.sh                 # 启动脚本
└── reports/                     # 部署报告
    ├── build-report.json        # 构建报告
    ├── deploy-report.json       # 部署报告
    └── deploy-report.md         # 部署报告(Markdown)
```

---

## 🔧 配置选项

### 环境变量

```bash
# 部署环境
NODE_ENV=production
DEPLOY_ENV=production
DEPLOY_MODE=docker

# 服务配置
API_PORT=8001
WEB_PORT=5173
DB_HOST=localhost
DB_PORT=5432

# 构建配置
BUILD_TARGET=production
BUILD_OPTIMIZE=true
BUILD_SOURCEMAP=false

# 部署配置
DEPLOY_TIMEOUT=300000
HEALTH_CHECK_TIMEOUT=30000
ROLLBACK_ENABLED=true
```

### 构建配置

创建 `build.config.js` 文件自定义构建设置：

```javascript
module.exports = {
  api: {
    entry: 'src/server.ts',
    output: {
      dir: 'dist',
      filename: 'server.js',
      format: 'esm',
    },
    target: 'node18',
    minify: true,
    sourcemap: false,
  },
  web: {
    entry: 'src/main.tsx',
    output: {
      dir: 'dist',
      publicPath: '/',
    },
    target: 'es2020',
    minify: true,
    sourcemap: false,
  },
  optimization: {
    enabled: true,
    treeshaking: true,
    minification: true,
  },
};
```

### 部署配置

创建 `deploy.config.js` 文件自定义部署设置：

```javascript
module.exports = {
  environments: {
    development: {
      apiUrl: 'http://localhost:8001',
      webUrl: 'http://localhost:5173',
    },
    staging: {
      apiUrl: 'https://api-staging.example.com',
      webUrl: 'https://staging.example.com',
    },
    production: {
      apiUrl: 'https://api.example.com',
      webUrl: 'https://example.com',
    },
  },
  deployment: {
    mode: 'docker',
    healthCheck: {
      enabled: true,
      timeout: 30000,
      retries: 3,
    },
    rollback: {
      enabled: true,
      maxVersions: 5,
    },
  },
};
```

---

## 🚨 故障排除

### 常见问题

1. **构建失败**

   ```bash
   # 检查依赖
   pnpm install

   # 清理构建缓存
   rm -rf apps/*/dist
   rm -rf node_modules/.cache
   ```

2. **部署失败**

   ```bash
   # 检查Docker状态
   docker ps
   docker logs <container-name>

   # 检查PM2状态
   pm2 status
   pm2 logs
   ```

3. **服务无法启动**

   ```bash
   # 检查端口占用
   lsof -i :8001
   lsof -i :5173

   # 检查环境变量
   env | grep NODE_ENV
   ```

4. **健康检查失败**
   ```bash
   # 手动检查服务
   curl http://localhost:8001/health
   curl http://localhost:5173
   ```

### 调试模式

```bash
# 启用详细日志
DEBUG=* node tools/scripts/deployment/build.js

# 启用调试模式
NODE_ENV=development node tools/scripts/deployment/deploy.js
```

### 回滚部署

```bash
# 回滚到上一个版本
node tools/scripts/deployment/deploy.js rollback

# 回滚到特定版本
node tools/scripts/deployment/deploy.js rollback v1.2.3
```

---

## 📅 持续集成

### GitHub Actions

创建 `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '22'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Build project
        run: node tools/scripts/deployment/build.js

      - name: Deploy
        run: node tools/scripts/deployment/deploy.js
        env:
          NODE_ENV: production
          DEPLOY_ENV: production
```

### 本地部署脚本

创建 `deploy-local.sh`:

```bash
#!/bin/bash

# 设置环境变量
export NODE_ENV=production
export DEPLOY_ENV=production
export DEPLOY_MODE=docker

# 运行部署
echo "🚀 开始本地部署..."
node tools/scripts/deployment/deploy.js

# 检查部署状态
echo "🔍 检查部署状态..."
docker ps | grep fastify-react-app
curl -f http://localhost:8001/health
```

---

## 🔒 安全注意事项

1. **环境变量安全**
   - 使用强密码
   - 不要在代码中硬编码敏感信息
   - 使用环境变量管理配置

2. **部署安全**
   - 使用HTTPS
   - 配置防火墙
   - 定期更新依赖

3. **访问控制**
   - 限制部署权限
   - 使用最小权限原则
   - 定期审查访问权限

---

## 📚 相关文档

- [Docker配置文档](../../../docs/deployment/docker.md)
- [环境配置指南](../../../docs/security/configuration-update-guide.md)
- [CI/CD管道文档](../../../docs/generated/cicd/cicd-pipeline.md)
- [项目架构文档](../../../docs/architecture/base-architecture.md)

---

## 🤝 贡献指南

1. 添加新的部署方式时，请更新相应的文档
2. 确保所有脚本都有适当的错误处理
3. 添加测试用例验证脚本功能
4. 更新 README 文档说明新功能

---

_最后更新: 2025-01-27_
