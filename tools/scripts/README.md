# 项目脚本说明

本目录包含了项目的各种自动化脚本，用于简化开发、构建、测试和部署流程。所有脚本已统一转换为 JavaScript 格式，提供更好的跨平台兼容性和错误处理。

## 📁 脚本目录结构

```
tools/scripts/
├── automation/             # 自动化检查脚本
│   ├── automation-analysis.js    # 自动化任务分析
│   ├── check-database-config.js  # 数据库配置检查
│   ├── check-environment.js      # 环境检查
│   ├── code-quality-check.js     # 代码质量检查
│   ├── run-all-checks.js         # 综合检查
│   ├── security-audit.js         # 安全审计
│   └── test-database-connection.js # 数据库连接测试
├── database/               # 数据库相关脚本
│   ├── database-backup.js  # 数据库备份/恢复
│   ├── reset.js           # 数据库重置脚本
│   └── setup.js           # 数据库设置脚本
├── deployment/             # 部署相关脚本
│   ├── build.js           # 项目构建脚本
│   └── deploy.js          # 部署脚本
├── development/            # 开发相关脚本
│   ├── generate-all-docs.js # 生成所有文档
│   └── generate-docs.js    # 生成 API 文档
├── maintenance/            # 维护相关脚本
│   ├── clean.js           # 跨平台清理脚本
│   ├── maintenance.js     # 系统维护
│   ├── restore.js         # 环境恢复脚本
│   ├── start.js           # 一键启动项目脚本
│   └── stop.js            # 一键停止项目脚本
├── monitoring/             # 监控相关脚本
│   ├── monitoring-log.js  # 监控日志
│   └── performance-test.js # 性能测试
├── script-manager.js      # 脚本管理器
└── README.md              # 本说明文档
```

## 🚀 快速开始

### 使用脚本管理器

```bash
# 列出所有可用脚本
node tools/scripts/script-manager.js list

# 执行单个脚本
node tools/scripts/script-manager.js exec check-environment

# 批量执行脚本
node tools/scripts/script-manager.js batch check-environment,security-audit

# 执行分类下的所有脚本
node tools/scripts/script-manager.js category automation

# 搜索脚本
node tools/scripts/script-manager.js search database

# 查看脚本信息
node tools/scripts/script-manager.js info build
```

### 环境检查

```bash
# 检查开发环境
pnpm run check:env

# 运行所有检查
pnpm run check:all

# 安全审计
pnpm run check:security
```

### 数据库操作

```bash
# 设置数据库
node tools/scripts/database/setup.js

# 重置数据库
node tools/scripts/database/reset.js

# 数据库备份
pnpm run db:backup

# 数据库恢复
pnpm run db:restore
```

### 项目清理

```bash
# 跨平台清理（推荐）
pnpm run clean

# 使用脚本文件
node tools/scripts/maintenance/clean.js
```

### 项目启动

```bash
# 一键启动项目（推荐）
pnpm run start

# 使用脚本文件
node tools/scripts/maintenance/start.js
```

### 项目停止

```bash
# 一键停止项目（推荐）
pnpm run stop

# 使用脚本文件
node tools/scripts/maintenance/stop.js
```

### 环境恢复

```bash
# 环境恢复（推荐）
pnpm run restore

# 使用脚本文件
node tools/scripts/maintenance/restore.js
```

## 📋 脚本详细说明

### 脚本管理器

#### `script-manager.js`

统一的脚本管理工具，提供以下功能：

- **脚本发现**: 自动扫描和分类所有脚本
- **批量执行**: 支持批量执行多个脚本
- **分类管理**: 按功能分类管理脚本
- **搜索功能**: 快速搜索脚本
- **信息查看**: 查看脚本详细信息

### 自动化脚本

#### `automation-analysis.js`

分析项目自动化程度，识别可以进一步自动化的任务。

#### `check-environment.js`

检查开发环境依赖和配置：
- Node.js、pnpm、npm 版本检查
- Docker 安装和运行状态
- 项目结构和必要文件验证
- 环境变量配置检查
- Git 和代码质量工具检查

#### `check-database-config.js`

检查数据库配置和连接状态：
- PostgreSQL 和 Redis 配置验证
- Docker 容器状态检查
- 环境变量配置检查
- 数据库目录结构验证

#### `code-quality-check.js`

分析代码复杂度和质量指标：
- 代码复杂度分析
- 重复代码检测
- TypeScript 类型检查
- ESLint 代码规范检查

#### `security-audit.js`

检查依赖包的安全漏洞：
- 扫描依赖包安全漏洞
- 检查过时依赖
- 分析许可证问题
- 生成安全报告和建议

#### `run-all-checks.js`

运行所有自动化检查：
- 环境检查（包含RBAC系统检查）
- 安全审计
- 代码质量检查
- 代码规范检查
- 格式化检查
- TypeScript 类型检查
- 测试运行

#### `test-database-connection.js`

测试数据库连接状态：
- PostgreSQL 连接测试
- Redis 连接测试
- Prisma 数据库连接测试
- Docker 容器状态检查

#### `rbac-manager.js`

RBAC系统管理功能：
- 初始化RBAC系统
- 重置RBAC系统
- 检查RBAC系统状态
- 创建管理员用户
- 备份RBAC数据
- 恢复RBAC数据

### 数据库脚本

#### `database-backup.js`

数据库备份和恢复功能：
- PostgreSQL 数据库备份
- 自动清理旧备份
- 备份配置管理
- 数据库恢复功能
- 备份报告生成

#### `setup.js`

数据库环境设置：
- 检查 Docker 状态
- 启动 PostgreSQL 数据库
- 等待数据库启动
- 运行数据库迁移
- 生成 Prisma 客户端
- 运行种子数据
- 初始化RBAC系统（可选）

#### `reset.js`

数据库重置功能：
- 安全确认操作
- 停止并删除数据库容器
- 删除数据库数据
- 重新启动数据库
- 运行迁移和种子

### 部署脚本

#### `build.js`

项目构建功能：
- 清理之前的构建
- 安装依赖
- 生成 Prisma 客户端
- 检查RBAC系统状态
- 构建 API 和 Web 应用
- 验证构建结果

#### `deploy.js`

项目部署功能：
- 设置部署环境
- 运行测试
- 构建项目
- 检查并初始化RBAC系统
- 支持多种部署方式（Docker、PM2、直接部署）
- 验证部署结果

### 开发脚本

#### `generate-docs.js`

API 文档生成：
- 自动扫描 API 路由
- 生成 Markdown 格式文档
- 生成 OpenAPI 规范
- 生成 TypeScript 类型定义
- 创建 Swagger UI 界面

#### `generate-all-docs.js`

综合文档生成：
- 数据库文档
- 项目结构文档
- 环境配置文档
- Docker 配置文档
- CI/CD 流程文档
- 依赖分析文档
- 测试文档
- 项目健康度报告
- 更新日志

### 维护脚本

#### `clean.js`

项目清理功能：
- 跨平台支持
- 交互式确认
- 清理构建产物、依赖包、缓存文件
- 可选重新安装依赖

#### `maintenance.js`

系统维护功能：
- 依赖包清理
- 缓存清理
- 临时文件清理
- 日志文件清理
- 构建产物清理
- 数据库优化
- 依赖更新

#### `restore.js`

环境恢复功能：
- 创建必要目录结构
- 生成环境配置文件
- 安装项目依赖
- 准备Git Hooks
- 生成Prisma客户端
- 数据库设置
- RBAC系统初始化

#### `start.js`

一键启动项目功能：
- 环境配置检查
- 项目依赖检查
- Docker服务检查
- 数据库服务启动
- Prisma客户端生成
- 数据库迁移执行
- RBAC系统初始化
- 开发服务器启动
- 端口状态检测
- 服务信息展示

#### `stop.js`

一键停止项目功能：
- 停止Docker服务
- 停止开发服务器（API、Web、文档）
- 停止后台Node.js进程
- 清理临时文件
- 跨平台支持（Windows/Unix）
- 智能端口检测和进程终止

### 监控脚本

#### `monitoring-log.js`

监控和日志分析：
- 系统资源监控 (CPU、内存、磁盘)
- 日志文件分析
- 错误和警告统计
- 应用性能监控
- 告警机制

#### `performance-test.js`

性能测试功能：
- 负载测试
- 压力测试
- 峰值测试
- 容量测试
- 性能阈值检查

## 🛠️ 使用 npm/pnpm 脚本

项目在 `package.json` 中定义了便捷的脚本命令：

```bash
# 开发
pnpm run dev              # 启动开发环境
pnpm run dev:api          # 只启动 API
pnpm run dev:web          # 只启动 Web
pnpm run start        # 一键启动项目（完整流程）

# 构建
pnpm run build            # 构建项目
pnpm run start            # 启动生产环境
pnpm run stop             # 一键停止项目

# 测试
pnpm run test             # 运行测试
pnpm run test:coverage    # 运行测试并生成覆盖率报告

# 代码质量
pnpm run lint             # 代码检查
pnpm run lint:fix         # 自动修复代码问题
pnpm run format           # 代码格式化
pnpm run format:check     # 检查代码格式

# 数据库
pnpm run prisma:generate  # 生成 Prisma 客户端
pnpm run prisma:migrate   # 运行数据库迁移
pnpm run prisma:seed      # 运行数据库种子
pnpm run setup:db         # 设置数据库
pnpm run db:start         # 启动数据库容器
pnpm run db:stop          # 停止数据库容器
pnpm run db:reset         # 重置数据库
pnpm run db:setup         # 数据库设置（包含RBAC初始化）

# RBAC 系统
pnpm run init:rbac        # 初始化RBAC系统
pnpm run rbac:init        # 初始化RBAC系统（别名）
pnpm run rbac:reset       # 重置RBAC系统
pnpm run rbac:status      # 检查RBAC系统状态
pnpm run rbac:backup      # 备份RBAC数据
pnpm run rbac:restore     # 恢复RBAC数据

# 项目设置
pnpm run setup            # 完整项目设置（包含RBAC初始化）
pnpm run clean            # 清理项目
pnpm run clean:force      # 强制清理
```

## 🔧 脚本特性

### JavaScript 脚本优势

1. **跨平台兼容**: 支持 Windows、macOS、Linux
2. **错误处理**: 完善的错误处理和边界条件检查
3. **模块化**: 使用 ES 模块，支持代码复用
4. **类型安全**: TypeScript 支持，更好的开发体验
5. **异步支持**: 原生支持异步操作
6. **丰富的 API**: 访问 Node.js 生态系统

### 脚本最佳实践

1. **错误处理**: 完善的 try-catch 和错误恢复机制
2. **用户友好**: 清晰的输出和错误信息
3. **交互式**: 支持用户确认和参数输入
4. **日志记录**: 详细的操作日志和报告生成
5. **配置化**: 支持配置文件和环境变量
6. **文档化**: 完整的注释和使用说明

## 🐛 故障排除

### 常见问题

1. **权限问题**
   ```bash
   # 确保脚本有执行权限
   chmod +x tools/scripts/*.js
   ```

2. **脚本找不到**
   - 确保在项目根目录执行
   - 检查脚本文件是否存在

3. **依赖问题**
   ```bash
   pnpm install
   ```

4. **数据库连接问题**
   - 确保 Docker 正在运行
   - 检查环境变量配置

5. **Node.js 版本问题**
   - 确保使用 Node.js 18+ 版本
   - 检查 package.json 中的 engines 配置

### 调试技巧

1. **查看详细输出**
   ```bash
   node tools/scripts/script-manager.js exec check-environment --verbose
   ```

2. **检查脚本信息**
   ```bash
   node tools/scripts/script-manager.js info check-environment
   ```

3. **搜索相关脚本**
   ```bash
   node tools/scripts/script-manager.js search database
   ```

## 📚 扩展脚本

### 添加新脚本

1. 在相应的分类目录下创建新的 `.js` 文件
2. 使用 ES 模块语法和现代 JavaScript 特性
3. 添加完善的错误处理和用户交互
4. 在 `script-manager.js` 中添加描述信息
5. 在 `package.json` 中添加对应的命令

### 脚本模板

```javascript
#!/usr/bin/env node

/**
 * 脚本名称
 * 
 * 脚本描述和功能说明
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../../../');

class ScriptName {
  constructor() {
    this.projectRoot = projectRoot;
  }

  /**
   * 主函数
   */
  async run() {
    console.log('🚀 开始执行...\n');

    try {
      // 脚本逻辑
      await this.executeTask();
      
      console.log('\n✅ 执行完成！');
    } catch (error) {
      console.error('\n❌ 执行失败:', error.message);
      process.exit(1);
    }
  }

  /**
   * 执行任务
   */
  async executeTask() {
    // 实现具体功能
  }
}

// 主函数
async function main() {
  const script = new ScriptName();
  await script.run();
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { ScriptName };
```

## 🔍 获取帮助

如果遇到问题，可以：

1. 查看脚本的详细输出
2. 使用脚本管理器查看脚本信息
3. 检查环境变量配置
4. 查看项目文档
5. 提交 Issue 到项目仓库

---

_最后更新: 2025-01-27_