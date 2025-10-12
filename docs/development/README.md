# 💻 开发指南

本指南将帮助您快速上手 Fastify-React-App-Enhance 项目的开发工作。

## 🛠️ 环境要求

### 必需环境

- **Node.js**: v22+ (推荐 v22.20.0 LTS)
- **pnpm**: v10+ (推荐 v10.18.0)
- **npm**: v11+ (推荐 v11.6.1)
- **Git**: 最新版本
- **Docker**: 用于数据库服务（可选）

### 推荐工具

- **VS Code**: 推荐的代码编辑器
- **Postman/Insomnia**: API 测试工具
- **Docker Desktop**: 容器管理

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd fastify-react-app-enhance
```

### 2. 项目初始化

```bash
# 方式一：使用项目设置脚本（推荐）
pnpm run setup

# 方式二：手动设置
pnpm install
pnpm run setup:db
```

### 3. 启动开发环境

```bash
# 方式一：使用自动化脚本（推荐）
pnpm run check:env        # 检查开发环境
pnpm run setup           # 设置开发环境

# 方式二：直接启动
pnpm run dev
```

## 📋 开发命令

### 基础命令

```bash
# 开发环境
pnpm run dev              # 启动开发服务器
pnpm run dev:api          # 只启动 API 服务
pnpm run dev:web          # 只启动 Web 服务

# 构建和部署
pnpm run build            # 构建生产版本
pnpm run start            # 启动生产环境

# 测试
pnpm run test             # 运行测试
pnpm run test:coverage    # 运行测试并生成覆盖率报告
```

### 代码质量

```bash
# 代码检查
pnpm run lint             # 运行 ESLint 检查
pnpm run lint:fix         # 自动修复 ESLint 问题

# 代码格式化
pnpm run format           # 格式化代码
pnpm run format:check     # 检查代码格式
```

### 数据库操作

```bash
# Prisma 操作
pnpm run prisma:generate  # 生成 Prisma 客户端
pnpm run prisma:migrate   # 运行数据库迁移
pnpm run prisma:seed      # 运行数据库种子
pnpm run setup:db         # 设置数据库
```

### 自动化工具链

```bash
# 环境检查与维护
pnpm run check:env        # 检查开发环境完整性
pnpm run check:security   # 依赖安全审计
pnpm run check:quality    # 代码质量检查
pnpm run check:all        # 综合检查
pnpm run maintenance      # 系统维护

# 监控与测试
pnpm run test:performance # 性能测试
pnpm run monitor          # 系统监控和日志分析
pnpm run db:backup        # 数据库备份
pnpm run db:restore       # 数据库恢复

# 文档生成
pnpm run docs:generate    # 生成 API 文档
pnpm run docs:generate:all # 生成所有文档
pnpm run docs:analyze     # 自动化任务分析

# 项目管理
pnpm run organize:files   # 整理生成文件
pnpm run update:paths     # 更新路径引用
pnpm run standardize:naming # 标准化命名规范
pnpm run fix:duplicate-dirs # 修复重复目录

# 项目维护
pnpm run clean            # 清理项目
pnpm run setup            # 完整项目设置
```

## 🏗️ 项目结构

```
fastify-react-app-enhance/
├── apps/                 # 应用代码
│   ├── api/             # 后端 API 服务
│   └── web/             # 前端 Web 应用
├── tools/scripts/       # 自动化脚本
│   ├── automation/      # 自动化检查脚本
│   ├── build/           # 构建脚本
│   ├── database/        # 数据库脚本
│   ├── development/     # 开发脚本
│   ├── maintenance/     # 维护脚本
│   └── monitoring/      # 监控脚本
├── docs/                # 项目文档
│   ├── generated/       # 自动生成文档
│   ├── api/             # API 文档
│   ├── architecture/    # 架构文档
│   ├── database/        # 数据库文档
│   ├── deployment/      # 部署文档
│   └── development/     # 开发文档
├── infrastructure/      # 基础设施配置
│   ├── docker/          # Docker 配置
│   ├── kubernetes/      # Kubernetes 配置
│   └── database/        # 数据库配置
├── services/            # 服务配置
│   └── grpc/            # gRPC 服务
├── tests/               # 测试文件
├── config/              # 项目配置文件
│   └── env-templates/   # 环境变量模板
├── backups/             # 备份文件
├── logs/                # 日志文件
├── temp/                # 临时文件
└── cache/               # 缓存文件
```

## 🔧 开发规范

### 代码风格

- 使用 **ESLint** + **Prettier** 进行代码格式化
- 遵循 **TypeScript** 严格模式
- 使用 **Conventional Commits** 提交规范

### Git 工作流

1. 从 `main` 分支创建功能分支
2. 开发完成后运行测试和代码检查
3. 提交代码并推送到远程仓库
4. 创建 Pull Request 进行代码审查

### 提交规范

```bash
# 功能开发
git commit -m "feat: 添加用户认证功能"

# 问题修复
git commit -m "fix: 修复登录状态检查问题"

# 文档更新
git commit -m "docs: 更新 API 文档"

# 代码重构
git commit -m "refactor: 重构用户服务模块"
```

## 🧪 测试指南

### 测试类型

- **单元测试**: 测试单个函数或组件
- **集成测试**: 测试模块间的交互
- **E2E 测试**: 测试完整的用户流程

### 运行测试

```bash
# 运行所有测试
pnpm run test

# 运行特定测试
cd apps/api && pnpm test -- --testNamePattern="UserService"

# 生成覆盖率报告
pnpm run test:coverage
```

### 测试最佳实践

- 测试覆盖率目标：80%+
- 每个新功能都要有对应的测试
- 测试应该独立且可重复运行

## 🐛 调试指南

### API 调试

- 使用 **Postman** 或 **Insomnia** 测试 API
- 查看 API 日志：`pnpm run dev:api`
- 使用 VS Code 调试器进行断点调试

### 前端调试

- 使用浏览器开发者工具
- React DevTools 扩展
- 查看控制台日志和网络请求

### 数据库调试

- 使用 Prisma Studio：`cd apps/api && npx prisma studio`
- 查看数据库日志
- 使用 SQL 客户端直接查询

## 📚 相关文档

- [项目优化计划](optimization-plan.md) - 了解项目优化历程
- [架构设计](../architecture/architecture.md) - 系统架构说明
- [数据库设计](../database/README.md) - 数据库相关文档
- [部署指南](../deployment/README.md) - 部署和运维文档

## ❓ 常见问题

### Q: 如何重置开发环境？

```bash
pnpm run clean
pnpm run setup
```

### Q: 数据库连接失败怎么办？

1. 确保 Docker 正在运行
2. 检查环境变量配置
3. 运行 `pnpm run check:env` 检查环境
4. 运行 `pnpm run setup:db` 设置数据库

### Q: 如何添加新的 API 端点？

1. 在 `apps/api/src/routes/` 创建路由文件
2. 在 `apps/api/src/controllers/` 创建控制器
3. 在 `apps/api/src/services/` 创建服务
4. 更新 `apps/api/src/app.ts` 注册路由

### Q: 如何添加新的前端页面？

1. 在 `apps/web/src/pages/` 创建页面组件
2. 在 `apps/web/src/components/` 创建可复用组件
3. 更新路由配置

---

_最后更新: 2025-01-27_
