# 🔧 自动化脚本工具集

**位置**: `tools/scripts/automation/`  
**用途**: 项目自动化检查和任务执行  
**更新时间**: 2025-01-27  

## 📋 脚本概览

| 脚本名称                      | 功能描述       | 使用场景                     |
| ----------------------------- | -------------- | ---------------------------- |
| `automation-analysis.js`      | 自动化任务分析 | 分析项目可自动化的任务       |
| `check-database-config.js`    | 数据库配置检查 | 检查PostgreSQL和Redis配置    |
| `check-environment.js`        | 环境检查       | 检查开发环境依赖和配置       |
| `code-quality-check.js`       | 代码质量检查   | 分析代码复杂度和质量指标     |
| `config-updater.js`           | 配置更新工具   | 安全更新环境配置和Docker配置 |
| `run-all-checks.js`           | 综合检查       | 运行所有自动化检查           |
| `security-audit.js`           | 安全审计       | 检查依赖包的安全漏洞         |
| `security-check.js`           | 安全配置检查   | 检查硬编码敏感信息           |
| `test-database-connection.js` | 数据库连接测试 | 测试PostgreSQL和Redis连接    |

---

## 🚀 快速开始

### 1. 环境检查
```bash
# 检查开发环境
pnpm run check:env
# 或直接运行
node tools/scripts/automation/check-environment.js
```

### 2. 安全审计
```bash
# 运行安全审计
pnpm run check:security
# 或直接运行
node tools/scripts/automation/security-audit.js
```

### 3. 代码质量检查
```bash
# 检查代码质量
pnpm run check:quality
# 或直接运行
node tools/scripts/automation/code-quality-check.js
```

### 4. 综合检查
```bash
# 运行所有检查
pnpm run check:all
# 或直接运行
node tools/scripts/automation/run-all-checks.js
```

---

## 📖 详细使用说明

### 🔍 环境检查脚本 (`check-environment.js`)

**功能**: 全面检查开发环境的依赖和配置

**检查项目**:
- Node.js 版本 (>= 22.0.0)
- 包管理器 (pnpm >= 10.0.0, npm >= 11.0.0)
- Docker 安装和运行状态
- 项目结构完整性
- 环境配置文件
- 依赖安装状态
- Git 配置
- 代码质量工具

**使用方法**:
```bash
# 基本检查
node tools/scripts/automation/check-environment.js

# 检查结果会保存到 docs/generated/reports/checks/environment-check.json
```

**输出示例**:
```
🔍 开始环境检查...

📦 检查 Node.js 版本...
  ✅ Node.js 版本: v22.0.0 (符合要求 >= 22.0.0)

📦 检查包管理器...
  ✅ pnpm 版本: 10.0.0 (符合要求 >= 10.0.0)
  ✅ npm 版本: 11.0.0 (符合要求 >= 11.0.0)

🐳 检查 Docker...
  ✅ Docker: Docker version 24.0.0
  ✅ Docker 服务: 正在运行

📁 检查项目结构...
  ✅ 目录 apps/api: 存在
  ✅ 目录 apps/web: 存在
  ✅ 文件 package.json: 存在

📊 环境检查报告
==================================================

📈 检查统计:
  ✅ 成功: 25
  ⚠️  警告: 2
  ❌ 错误: 0
  📊 成功率: 96%
```

### 🔒 安全审计脚本 (`security-audit.js`)

**功能**: 检查依赖包的安全漏洞、过时依赖和许可证问题

**检查项目**:
- 依赖包安全漏洞 (高危/中危/低危)
- 过时依赖包
- 许可证合规性
- 自动修复建议

**使用方法**:
```bash
# 运行安全审计
node tools/scripts/automation/security-audit.js

# 检查结果会保存到 docs/generated/reports/checks/security-audit.json
```

**输出示例**:
```
🔒 开始安全审计...

🔍 检查依赖漏洞...
  ✅ 未发现安全漏洞

📅 检查过时依赖...
  ⚠️  lodash: 4.17.20 → 4.17.21

📄 检查许可证...
  ✅ 未发现许可证问题

📊 安全审计报告
==================================================

📈 安全摘要:
  🔴 高危漏洞: 0
  🟡 中危漏洞: 0
  🟢 低危漏洞: 0
  📦 过时依赖: 1
  📄 许可证问题: 0

💡 安全建议:
  3. 📦 更新过时依赖:
     pnpm update

🛠️  修复命令:
  pnpm audit --fix          # 自动修复漏洞
  pnpm update               # 更新依赖
  pnpm audit                # 重新检查
```

### 🔍 代码质量检查脚本 (`code-quality-check.js`)

**功能**: 分析代码复杂度、重复代码、类型错误和代码规范问题

**检查项目**:
- 代码复杂度分析
- 重复代码检测
- TypeScript 类型检查
- ESLint 代码规范检查
- 代码指标统计

**使用方法**:
```bash
# 运行代码质量检查
node tools/scripts/automation/code-quality-check.js

# 检查结果会保存到 docs/generated/reports/checks/code-quality.json
```

**输出示例**:
```
🔍 开始代码质量检查...

📊 分析代码复杂度...
  📈 发现 3 个复杂度问题

🔄 检查代码重复...
  🔄 发现 2 处重复代码

📝 检查 TypeScript 类型...
  ✅ API 项目类型检查通过
  ✅ Web 项目类型检查通过

🔍 检查代码规范...
  🔍 发现 5 个代码规范问题

📊 代码质量报告
==================================================

📈 代码质量摘要:
  📁 总文件数: 45
  📝 总代码行数: 12,345
  🔧 总函数数: 156
  📊 平均复杂度: 3.2
  🔄 重复代码行数: 23
  ❌ 类型错误: 0
  🔍 代码规范问题: 5

💡 改进建议:
  4. 🔍 修复代码规范问题

🛠️  修复命令:
  pnpm run lint:fix          # 自动修复代码规范问题
  pnpm run format            # 格式化代码
  npx tsc --noEmit           # 检查类型错误
```

### 🔧 配置模板和值管理工具 (`config-updater.js`)

**功能**: 管理配置模板文件和敏感值，从模板和值生成最终配置文件

**主要特性**:
- 管理配置模板文件（结构定义）
- 管理敏感值文件（.env.secrets）
- 从模板和值生成最终配置文件
- 配置验证和备份
- 交互式配置管理

**使用方法**:
```bash
# 交互式配置管理
node tools/scripts/automation/config-updater.js interactive

# 从模板生成配置文件
node tools/scripts/automation/config-updater.js generate

# 验证配置
node tools/scripts/automation/config-updater.js validate

# 列出敏感值
node tools/scripts/automation/config-updater.js secrets

# 列出模板文件
node tools/scripts/automation/config-updater.js templates

# 添加配置项到模板
node tools/scripts/automation/config-updater.js add-config root NEW_CONFIG

# 添加敏感值
node tools/scripts/automation/config-updater.js add-secret NEW_SECRET "secret-value"

# 更新敏感值
node tools/scripts/automation/config-updater.js update-secret JWT_SECRET "new-secret"

# 创建备份
node tools/scripts/automation/config-updater.js backup "before-production-deploy"

# 从备份恢复
node tools/scripts/automation/config-updater.js restore config-backup-2025-01-27T10-30-00-000Z

# 列出备份
node tools/scripts/automation/config-updater.js list
```

**交互式管理示例**:
```
🚀 开始交互式配置管理...

请选择要执行的操作:
1. 添加新的配置项到模板
2. 添加/更新敏感值
3. 从模板生成配置文件
4. 验证配置
5. 列出敏感值
6. 列出模板文件
7. 创建备份
8. 从备份恢复

请输入选择 (1-8): 2

🔐 更新敏感值:

现有敏感值:
1. JWT_SECRET
2. DB_PASSWORD
3. REDIS_PASSWORD
4. API_KEY
5. 添加新的敏感值

请选择要更新的敏感值: 1
请输入新的 JWT_SECRET 值: new-jwt-secret-here
✅ 已更新敏感值: JWT_SECRET

✅ 操作完成！
```

### 🔒 安全配置检查脚本 (`security-check.js`)

**功能**: 检查项目中的安全配置问题，包括硬编码敏感信息

**检查项目**:
- 硬编码密码和密钥
- 默认密码和密钥
- 环境配置文件验证
- .gitignore 配置检查

**使用方法**:
```bash
# 运行安全配置检查
pnpm run security:check
# 或
node tools/scripts/automation/security-check.js
```

**输出示例**:
```
🔒 开始安全配置检查...

🔍 检查硬编码敏感信息...
🔍 检查环境配置文件...
✅ .env 配置正确
✅ apps/api/.env 配置正确
✅ apps/web/.env 配置正确
🔍 检查 .gitignore 配置...
✅ .gitignore 配置正确

📊 安全检查报告
==================================================
✅ 未发现安全问题！
```

### 🗄️ 数据库配置检查脚本 (`check-database-config.js`)

**功能**: 检查PostgreSQL和Redis的配置和连接状态

**检查项目**:
- Docker 服务状态
- Docker Compose 配置
- 环境变量配置
- 数据库目录结构
- Prisma 配置

**使用方法**:
```bash
# 检查数据库配置
node tools/scripts/automation/check-database-config.js
```

**输出示例**:
```
🔍 检查数据库配置...

📊 检查结果:

✅ DOCKER:
   ✅ Docker 已安装
   ✅ Docker 服务正在运行

✅ POSTGRES:
   ✅ PostgreSQL 服务已配置
   ✅ PostgreSQL 数据持久化已配置到项目目录
   ✅ PostgreSQL 数据目录存在
   ✅ Prisma schema 文件存在
   ✅ Prisma 配置为 PostgreSQL

✅ REDIS:
   ✅ Redis 服务已配置
   ✅ Redis 数据持久化已配置到项目目录
   ✅ Redis 数据目录存在

✅ CONFIG:
   ✅ docker-compose.yml 文件存在
   ✅ env-templates/api.env 存在
   ✅ env-templates/web.env 存在
   ✅ env-templates/root.env 存在
   ✅ API 环境配置加载器存在
   ✅ Docker Compose 配置文件有效

💡 配置建议:

3. 启动数据库服务:
   cd infrastructure/docker
   docker compose up -d postgres redis

4. 运行数据库迁移:
   pnpm --filter fastify-api run prisma:migrate

5. 生成 Prisma 客户端:
   pnpm --filter fastify-api run prisma:generate
```

### 🔗 数据库连接测试脚本 (`test-database-connection.js`)

**功能**: 测试PostgreSQL和Redis的连接状态

**测试项目**:
- PostgreSQL 连接测试
- Redis 连接测试
- Prisma 数据库连接测试
- Docker 容器状态检查

**使用方法**:
```bash
# 测试数据库连接
node tools/scripts/automation/test-database-connection.js
```

**输出示例**:
```
🔍 测试数据库连接...

🐳 Docker 容器状态:
CONTAINER ID   IMAGE       COMMAND                  CREATED         STATUS         PORTS                    NAMES
abc123def456   postgres:15 "docker-entrypoint.s…"   2 hours ago     Up 2 hours     0.0.0.0:5432->5432/tcp   docker-postgres-1
def456ghi789   redis:7     "docker-entrypoint.s…"   2 hours ago     Up 2 hours     0.0.0.0:6379->6379/tcp   docker-redis-1

📊 连接测试结果:

✅ POSTGRES:
   ✅ PostgreSQL 连接成功
   📊 版本信息: PostgreSQL 15.4

✅ REDIS:
   ✅ Redis 连接成功
   📊 响应: PONG

✅ PRISMA:
   ✅ Prisma 数据库连接成功
   📊 数据库模式已同步

🎉 所有数据库连接测试通过！
```

### 📊 自动化任务分析脚本 (`automation-analysis.js`)

**功能**: 分析项目中可以自动化的任务和操作

**分析项目**:
- 现有自动化任务
- 缺失的自动化任务
- 自动化建议
- 实施计划

**使用方法**:
```bash
# 运行自动化分析
node tools/scripts/automation/automation-analysis.js

# 分析结果会保存到 docs/generated/automation-analysis.md
```

**输出示例**:
```
🔍 分析项目自动化任务...

📋 分析现有自动化...
🔍 分析缺失的自动化...
💡 生成自动化建议...
📊 生成分析报告...
📄 生成分析报告: docs/generated/automation-analysis.md
✅ 自动化任务分析完成！
```

### 🚀 综合检查脚本 (`run-all-checks.js`)

**功能**: 运行所有自动化检查和任务

**检查项目**:
- 环境检查
- 安全审计
- 代码质量检查
- 代码规范检查
- 代码格式化检查
- TypeScript 类型检查
- 测试运行

**使用方法**:
```bash
# 运行所有检查
pnpm run check:all
# 或
node tools/scripts/automation/run-all-checks.js

# 检查结果会保存到 docs/generated/reports/checks/comprehensive-check.json
```

**输出示例**:
```
🚀 开始综合自动化检查...

🔍 运行 环境检查...
  ✅ 环境检查 通过 (1234ms)
🔍 运行 安全审计...
  ✅ 安全审计 通过 (567ms)
🔍 运行 代码质量检查...
  ✅ 代码质量检查 通过 (2345ms)
🔍 运行 代码规范检查...
  ⚠️  代码规范检查 有警告 (890ms)
🔍 运行 代码格式化检查...
  ✅ 代码格式化检查 通过 (456ms)
🔍 运行 TypeScript 类型检查...
  ✅ TypeScript 类型检查 通过 (1234ms)
🔍 运行 测试运行...
  ✅ 测试运行 通过 (3456ms)

📊 综合检查报告
============================================================

📈 检查摘要:
  ✅ 通过: 6
  ⚠️  警告: 1
  ❌ 失败: 0
  📊 总计: 7
  🎯 成功率: 86%

📋 详细结果:
  ✅ 环境检查 (1234ms)
  ✅ 安全审计 (567ms)
  ✅ 代码质量检查 (2345ms)
  ⚠️  代码规范检查 (890ms)
  ✅ 代码格式化检查 (456ms)
  ✅ TypeScript 类型检查 (1234ms)
  ✅ 测试运行 (3456ms)

💡 改进建议:

🟡 建议改进:
  - 代码规范检查: 运行 pnpm run lint:fix 自动修复

🛠️  常用修复命令:
  pnpm run lint:fix          # 自动修复代码规范问题
  pnpm run format            # 格式化代码
  pnpm run test              # 运行测试
  pnpm run check:security    # 安全审计
  pnpm run check:quality     # 代码质量检查

📄 综合检查报告已保存:
  JSON: docs/generated/reports/checks/comprehensive-check.json
  Markdown: docs/generated/reports/checks/comprehensive-check.md

✅ 所有检查通过！
```

---

## 📁 输出文件

所有脚本的检查结果都会保存到以下位置：

```
docs/generated/reports/checks/
├── environment-check.json          # 环境检查结果
├── security-audit.json            # 安全审计结果
├── security-audit.md              # 安全审计报告
├── code-quality.json              # 代码质量检查结果
├── code-quality.md                # 代码质量报告
├── comprehensive-check.json       # 综合检查结果
└── comprehensive-check.md         # 综合检查报告
```

---

## 🔧 配置选项

### 环境变量

```bash
# 检查超时时间 (毫秒)
CHECK_TIMEOUT=30000

# 报告输出目录
REPORTS_DIR=docs/generated/reports/checks

# 日志级别
LOG_LEVEL=info
```

### 配置文件

某些脚本支持配置文件，通常位于项目根目录：

```json
{
  "automation": {
    "timeout": 30000,
    "outputDir": "docs/generated/reports/checks",
    "includeWarnings": true
  }
}
```

---

## 🚨 故障排除

### 常见问题

1. **权限错误**
   ```bash
   # 确保脚本有执行权限
   chmod +x tools/scripts/automation/*.js
   ```

2. **依赖缺失**
   ```bash
   # 安装缺失的依赖
   pnpm install
   ```

3. **Docker 服务未运行**
   ```bash
   # 启动 Docker 服务
   docker-compose up -d
   ```

4. **环境变量未设置**
   ```bash
   # 生成环境配置
   pnpm run restore
   ```

### 调试模式

```bash
# 启用详细日志
DEBUG=* node tools/scripts/automation/check-environment.js

# 启用调试模式
NODE_ENV=development node tools/scripts/automation/security-audit.js
```

---

## 📚 相关文档

- [项目环境配置指南](../../../docs/security/configuration-update-guide.md)
- [安全修复计划](../../../docs/security/security-fix-plan.md)
- [代码质量规范](../../../docs/development/dev-tools.md)
- [数据库配置文档](../../../docs/database/database-config.md)

---

## 🤝 贡献指南

1. 添加新的检查项目时，请更新相应的文档
2. 确保所有脚本都有适当的错误处理
3. 添加测试用例验证脚本功能
4. 更新 README 文档说明新功能

---

*最后更新: 2025-01-27*
