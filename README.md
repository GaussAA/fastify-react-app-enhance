# 🚀 Fastify + React 全栈项目模板(Monorepo)

一个适合中小型团队快速开发、部署的现代全栈项目模板。  
采用 **Fastify + Prisma + PostgreSQL + React + Vite + TypeScript** 技术栈，兼顾性能、开发体验与可维护性。

---

## 🧱 项目特性

✅ 前后端统一 TypeScript  
✅ Fastify 高性能轻量后端  
✅ Prisma ORM 提供类型安全数据库访问  
✅ React + Vite + TailwindCSS + shadcn/ui 构建现代 UI  
✅ Swagger/OpenAPI 3.0 自动生成 API 文档  
✅ 完整开发工具链 (ESLint, Prettier, Husky, Commitlint)  
✅ 现代化测试框架 (Jest + Vitest + Testing Library)  
✅ 自动化版本管理 (Changesets)  
✅ ES 模块 (ESM) 统一模块系统  
✅ Docker 一键部署  
✅ 内置文档库、测试体系、CI/CD、实用脚本

---

## 📦 快速开始

### 1️⃣ 克隆项目

```bash
git clone https://github.com/yourname/fastify-react-app.git
cd fastify-react-app
```

### 2️⃣ 安装依赖

```bash
# 使用 pnpm 安装所有依赖
pnpm install

# 或者使用项目设置脚本（推荐）
pnpm run setup
```

### 3️⃣ 配置环境变量

项目已提供环境变量模板，会自动创建：

```bash
# 环境变量模板位置
config/env-templates/root.env      # 根目录环境变量
config/env-templates/api.env       # API 服务环境变量
config/env-templates/web.env       # Web 前端环境变量
```

主要配置项：

```
DATABASE_URL="postgresql://dev:dev@localhost:5432/mydb"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
PORT=8001
```

### 4️⃣ 启动开发环境

```bash
# 方式一：使用 Docker（推荐）
docker-compose -f infrastructure/docker/docker-compose.yml up -d
pnpm run dev

# 方式二：使用自动化脚本
pnpm run check:env        # 检查开发环境
pnpm run setup           # 设置开发环境

# 方式三：直接启动
pnpm run dev
```

服务启动后：

- 后端 API: [http://localhost:8001/api](http://localhost:8001/api)
- 前端 Web: [http://localhost:5173](http://localhost:5173)
- Swagger 文档: [http://localhost:8001/docs](http://localhost:8001/docs)

---

## 🗃️ 目录结构说明

| 目录                 | 说明                                       |
| -------------------- | ------------------------------------------ |
| `apps/`              | 前后端主代码                               |
| `docs/`              | 文档中心（API、设计、部署、生成文档）      |
| `infrastructure/`    | 基础设施（Docker、K8s、CI/CD、数据存储）   |
| `tools/scripts/`     | 自动化脚本（检查、监控、维护、文档生成等） |
| `services/`          | 服务配置（gRPC 等）                        |
| `config/`            | 项目配置文件（ESLint、环境模板等）         |
| `tests/`             | 单元 / 集成 / E2E 测试                     |
| `backups/`           | 备份文件                                   |
| `logs/`              | 日志文件                                   |
| `temp/`              | 临时文件                                   |
| `cache/`             | 缓存文件                                   |
| `.github/workflows/` | GitHub Actions 自动化配置                  |
| `.husky/`            | Git Hooks                                  |

---

## ⚙️ 技术栈

| 层级   | 技术                                                | 说明                   |
| ------ | --------------------------------------------------- | ---------------------- |
| 前端   | React + Vite + TypeScript + TailwindCSS + shadcn/ui | 现代前端框架与组件体系 |
| 后端   | Fastify + Prisma + PostgreSQL                       | 高性能、类型安全后端   |
| 认证   | JWT + bcrypt                                        | 简洁可靠的身份验证     |
| 工具链 | ESLint + Prettier + Husky + Commitlint + ESM        | 统一代码风格与测试流程 |
| 部署   | Docker Compose / GitHub Actions                     | 低成本快速上线         |
| 文档   | Markdown + 自动化脚本 + Swagger                     | 完整文档体系           |
| 通信   | gRPC + REST API                                     | 微服务通信支持         |

---

## 🧪 测试

运行测试：

```bash
# 运行所有测试
pnpm run test

# 运行测试并生成覆盖率报告
pnpm run test:coverage

# 使用测试脚本
./scripts/test.sh
```

支持：

- ✅ 单元测试（Jest + TypeScript）
- ✅ 集成测试（Supertest）
- ✅ E2E 测试（Playwright）
- ✅ 代码覆盖率报告

---

## 🧰 自动化工具链

### 🔧 环境检查与维护

| 命令                      | 说明                       |
| ------------------------- | -------------------------- |
| `pnpm run check:env`      | 检查开发环境完整性         |
| `pnpm run check:security` | 依赖安全审计               |
| `pnpm run check:quality`  | 代码质量检查               |
| `pnpm run check:all`      | 综合检查（环境+安全+质量） |
| `pnpm run maintenance`    | 系统维护（清理+优化）      |

### 📊 监控与测试

| 命令                        | 说明               |
| --------------------------- | ------------------ |
| `pnpm run test:performance` | 性能测试           |
| `pnpm run monitor`          | 系统监控和日志分析 |
| `pnpm run db:backup`        | 数据库备份         |
| `pnpm run db:restore`       | 数据库恢复         |

### 📝 文档生成

| 命令                         | 说明           |
| ---------------------------- | -------------- |
| `pnpm run docs:generate`     | 生成 API 文档  |
| `pnpm run docs:generate:all` | 生成所有文档   |
| `pnpm run docs:analyze`      | 自动化任务分析 |

### 🗂️ 项目管理

| 命令                          | 说明           |
| ----------------------------- | -------------- |
| `pnpm run organize:files`     | 整理生成文件   |
| `pnpm run update:paths`       | 更新路径引用   |
| `pnpm run standardize:naming` | 标准化命名规范 |
| `pnpm run fix:duplicate-dirs` | 修复重复目录   |

执行方式：

```bash
# 环境检查（推荐首次使用）
pnpm run check:env

# 项目设置
pnpm run setup

# 启动开发
pnpm run dev

# 运行测试
pnpm run test

# 清理项目
pnpm run clean

# 生成文档
pnpm run docs:generate:all
```

---

## ☁️ 部署

### Docker Compose

```bash
# 使用项目提供的 Docker 配置
docker-compose -f infrastructure/docker/docker-compose.yml up -d --build

# 或使用自动化脚本
pnpm run check:all        # 运行所有检查
pnpm run maintenance      # 系统维护
```

### 云端方案

- **Render / Railway / Fly.io**：推荐快速部署
- **GitHub Actions**：自动测试与构建推送
- **Kubernetes (可选)**：`infrastructure/kubernetes/` 提供 YAML 模板

---

## 🔍 日志与监控

- 使用 `pino` 输出日志
- 可集成：
  - PM2 管理进程
  - Uptime Kuma 监控运行状态

---

## 📘 文档库说明

| 子目录               | 内容                                   |
| -------------------- | -------------------------------------- |
| `docs/api/`          | API 接口文档（自动生成）               |
| `docs/deployment/`   | Docker 与 CI/CD 指南                   |
| `docs/development/`  | 开发指南（规范、流程、工具等）         |
| `docs/architecture/` | 架构设计图与决策记录                   |
| `docs/generated/`    | 自动生成的文档（分析报告、配置文档等） |
| `docs/database/`     | 数据库设计文档                         |
| `docs/changelog/`    | 版本更新日志                           |

**自动生成文档**：

- 项目结构分析
- 依赖分析报告
- 环境配置文档
- Docker 配置文档
- CI/CD 流程文档
- 测试文档
- 项目健康度报告

可使用 **VitePress** 或 **Docusaurus** 部署为静态文档网站。

---

## 🧭 扩展方向

- [x] 完整的自动化工具链（环境检查、安全审计、代码质量检查）
- [x] 自动化文档生成（API、项目结构、配置等）
- [x] 系统监控和日志分析
- [x] 数据库备份和恢复
- [x] 性能测试和监控
- [x] 项目结构重组和文件整理
- [x] 命名规范标准化
- [ ] 增加 Redis 缓存层
- [ ] 集成 WebSocket 实时推送
- [ ] 添加国际化（i18n）支持
- [ ] 自动化文档网站部署
- [ ] 集成更多监控和日志系统

---

## 👨‍💻 贡献与协作

1. Fork 本仓库
2. 新建分支 `feature/xxx`
3. 提交代码并通过测试
4. 发起 PR 合并请求

---

## 🪪 许可证

MIT License © 2025 — Crafted with ❤️ by [Your Name]
