# 🔧 维护脚本工具集

**位置**: `tools/scripts/maintenance/`  
**用途**: 项目维护、环境恢复和清理工具  
**更新时间**: 2025-01-27  

## 📋 脚本概览

| 脚本名称          | 功能描述     | 使用场景           |
| ----------------- | ------------ | ------------------ |
| `restore.js`      | 开发环境恢复 | 初始化开发环境     |
| `clean.js`      | 项目清理     | 清理临时文件和缓存 |
| `health-check.js` | 健康检查     | 检查项目状态       |
| `backup.js`       | 项目备份     | 备份重要文件       |

---

## 🚀 快速开始

### 1. 恢复开发环境
```bash
# 恢复完整的开发环境
pnpm run restore
# 或
node tools/scripts/maintenance/restore.js
```

### 2. 清理项目
```bash
# 清理临时文件和缓存
pnpm run clean
# 或
node tools/scripts/maintenance/clean.js
```

### 3. 健康检查
```bash
# 检查项目健康状态
pnpm run health:check
# 或
node tools/scripts/maintenance/health-check.js
```

### 4. 项目备份
```bash
# 备份项目重要文件
pnpm run backup
# 或
node tools/scripts/maintenance/backup.js
```

---

## 📖 详细使用说明

### 🔄 开发环境恢复脚本 (`restore.js`)

**功能**: 一键恢复完整的开发环境，包括依赖安装、环境配置、数据库设置等

**恢复内容**:
- 安装项目依赖
- 生成安全的环境配置文件
- 创建Docker Compose配置
- 运行数据库迁移
- 执行代码质量检查
- 运行安全审计

**使用方法**:
```bash
# 完整恢复开发环境
node tools/scripts/maintenance/restore.js

# 恢复过程会显示详细进度
```

**输出示例**:
```
🚀 开始恢复开发环境...

📦 安装项目依赖...
  ✅ 根目录依赖安装完成
  ✅ API项目依赖安装完成
  ✅ Web项目依赖安装完成

📝 创建安全的环境配置文件...
  ✅ 创建根目录 .env 文件
  ✅ 创建 API 项目 .env 文件
  ✅ 创建 Web 项目 .env 文件
  ✅ 创建 Docker Compose 配置文件

🔍 验证环境配置...
  ✅ 环境配置验证通过

🗄️ 设置数据库...
  ✅ 数据库迁移完成
  ✅ 数据库种子数据创建完成

🔍 运行代码质量检查...
  ✅ ESLint检查通过
  ✅ Prettier格式化完成
  ✅ TypeScript类型检查通过

🔒 运行安全审计...
  ✅ 安全检查通过
  ✅ 无安全漏洞发现

🎉 开发环境恢复完成！
📊 恢复统计:
  - 依赖包: 156 个
  - 环境文件: 3 个
  - 数据库表: 5 个
  - 代码文件: 234 个
  - 安全检查: 通过
```

**恢复步骤详解**:

1. **依赖安装**
   ```bash
   # 安装根目录依赖
   pnpm install
   
   # 安装API项目依赖
   cd apps/api && pnpm install
   
   # 安装Web项目依赖
   cd apps/web && pnpm install
   ```

2. **环境配置生成**
   ```bash
   # 生成安全的环境变量
   - 根目录 .env
   - apps/api/.env
   - apps/web/.env
   - infrastructure/docker/docker-compose.yml
   ```

3. **数据库设置**
   ```bash
   # 运行Prisma迁移
   npx prisma migrate dev
   
   # 生成Prisma客户端
   npx prisma generate
   
   # 创建种子数据
   npx prisma db seed
   ```

4. **代码质量检查**
   ```bash
   # ESLint检查
   pnpm run lint
   
   # Prettier格式化
   pnpm run format
   
   # TypeScript类型检查
   pnpm run type-check
   ```

5. **安全审计**
   ```bash
   # 运行安全检查
   pnpm run security:check
   ```

### 🧹 项目清理脚本 (`cleanup.js`)

**功能**: 清理项目中的临时文件、缓存、构建产物等，释放磁盘空间

**清理内容**:
- Node.js缓存和临时文件
- 构建产物和分发文件
- 日志文件
- 测试覆盖率报告
- 临时下载文件
- 编辑器临时文件

**使用方法**:
```bash
# 清理所有临时文件
node tools/scripts/maintenance/cleanup.js

# 清理特定类型文件
node tools/scripts/maintenance/cleanup.js --type=build
node tools/scripts/maintenance/cleanup.js --type=logs
node tools/scripts/maintenance/cleanup.js --type=cache
```

**输出示例**:
```
🧹 开始清理项目...

📁 扫描清理目标...
  📊 发现 15 个清理目录
  📊 发现 234 个临时文件
  📊 总大小: 2.5 GB

🗑️ 清理构建产物...
  ✅ 清理 dist/ 目录 (1.2 GB)
  ✅ 清理 build/ 目录 (0.8 GB)
  ✅ 清理 coverage/ 目录 (0.3 GB)

🗑️ 清理缓存文件...
  ✅ 清理 node_modules/.cache/ (0.1 GB)
  ✅ 清理 .next/cache/ (0.05 GB)
  ✅ 清理 .vite/cache/ (0.02 GB)

🗑️ 清理日志文件...
  ✅ 清理 logs/ 目录 (0.03 GB)
  ✅ 清理 *.log 文件 (0.01 GB)

🗑️ 清理临时文件...
  ✅ 清理 .tmp/ 目录 (0.01 GB)
  ✅ 清理 *.tmp 文件 (0.005 GB)

🎉 项目清理完成！
📊 清理统计:
  - 清理文件: 234 个
  - 释放空间: 2.5 GB
  - 清理目录: 15 个
  - 清理时间: 45 秒
```

**清理类型**:

1. **构建产物** (`--type=build`)
   ```bash
   # 清理的目录和文件
   dist/
   build/
   coverage/
   *.tgz
   *.tar.gz
   ```

2. **缓存文件** (`--type=cache`)
   ```bash
   # 清理的目录和文件
   node_modules/.cache/
   .next/cache/
   .vite/cache/
   .eslintcache
   .stylelintcache
   ```

3. **日志文件** (`--type=logs`)
   ```bash
   # 清理的目录和文件
   logs/
   *.log
   npm-debug.log*
   yarn-debug.log*
   yarn-error.log*
   ```

4. **临时文件** (`--type=temp`)
   ```bash
   # 清理的目录和文件
   .tmp/
   *.tmp
   *.temp
   .DS_Store
   Thumbs.db
   ```

### 🏥 健康检查脚本 (`health-check.js`)

**功能**: 全面检查项目健康状态，包括依赖、配置、数据库、服务等

**检查内容**:
- 依赖包状态
- 环境配置完整性
- 数据库连接状态
- 服务运行状态
- 代码质量指标
- 安全配置状态

**使用方法**:
```bash
# 完整健康检查
node tools/scripts/maintenance/health-check.js

# 检查特定组件
node tools/scripts/maintenance/health-check.js --component=deps
node tools/scripts/maintenance/health-check.js --component=config
node tools/scripts/maintenance/health-check.js --component=database
```

**输出示例**:
```
🏥 开始项目健康检查...

📦 检查依赖包状态...
  ✅ 根目录依赖: 正常 (156 个包)
  ✅ API项目依赖: 正常 (89 个包)
  ✅ Web项目依赖: 正常 (67 个包)
  ⚠️ 发现 2 个过时依赖

⚙️ 检查环境配置...
  ✅ 根目录 .env: 完整
  ✅ API项目 .env: 完整
  ✅ Web项目 .env: 完整
  ✅ Docker配置: 完整

🗄️ 检查数据库状态...
  ✅ 数据库连接: 正常
  ✅ 数据库迁移: 最新
  ✅ 数据库表: 5 个表正常
  ⚠️ 发现 1 个未使用的表

🚀 检查服务状态...
  ✅ API服务: 运行正常 (端口 8001)
  ✅ Web服务: 运行正常 (端口 5173)
  ✅ 数据库服务: 运行正常 (端口 5432)
  ✅ Redis服务: 运行正常 (端口 6379)

🔍 检查代码质量...
  ✅ ESLint: 无错误
  ✅ Prettier: 格式正确
  ✅ TypeScript: 类型检查通过
  ✅ 测试覆盖率: 85%

🔒 检查安全配置...
  ✅ 环境变量: 安全
  ✅ 依赖漏洞: 无
  ✅ 硬编码密码: 无
  ✅ 安全头配置: 正确

📊 健康检查完成！
📊 健康评分: 92/100
📊 检查项目: 6 个
📊 发现问题: 3 个
📊 建议修复: 2 个
```

**健康检查项目**:

1. **依赖包检查**
   ```bash
   # 检查项目
   - 依赖包完整性
   - 版本兼容性
   - 安全漏洞
   - 过时依赖
   ```

2. **环境配置检查**
   ```bash
   # 检查项目
   - 必需环境变量
   - 配置格式正确性
   - 敏感信息安全性
   - 配置完整性
   ```

3. **数据库检查**
   ```bash
   # 检查项目
   - 数据库连接
   - 迁移状态
   - 表结构完整性
   - 数据一致性
   ```

4. **服务状态检查**
   ```bash
   # 检查项目
   - API服务运行状态
   - Web服务运行状态
   - 数据库服务状态
   - Redis服务状态
   ```

5. **代码质量检查**
   ```bash
   # 检查项目
   - ESLint错误
   - Prettier格式
   - TypeScript类型
   - 测试覆盖率
   ```

6. **安全配置检查**
   ```bash
   # 检查项目
   - 环境变量安全
   - 依赖漏洞
   - 硬编码密码
   - 安全头配置
   ```

### 💾 项目备份脚本 (`backup.js`)

**功能**: 备份项目重要文件，包括源代码、配置、数据库等

**备份内容**:
- 源代码文件
- 配置文件
- 环境变量模板
- 数据库备份
- 文档文件
- 工具脚本

**使用方法**:
```bash
# 完整项目备份
node tools/scripts/maintenance/backup.js

# 指定备份名称
node tools/scripts/maintenance/backup.js --name="before-deploy"

# 备份特定组件
node tools/scripts/maintenance/backup.js --component=code
node tools/scripts/maintenance/backup.js --component=config
node tools/scripts/maintenance/backup.js --component=database
```

**输出示例**:
```
💾 开始项目备份...

📁 准备备份目录...
  ✅ 备份目录已创建: backups/2025-01-27T10-30-00-000Z

📦 备份源代码...
  ✅ 备份 apps/ 目录 (2.1 MB)
  ✅ 备份 tools/ 目录 (0.8 MB)
  ✅ 备份 docs/ 目录 (1.2 MB)
  ✅ 备份 config/ 目录 (0.1 MB)

⚙️ 备份配置文件...
  ✅ 备份 package.json 文件
  ✅ 备份 pnpm-workspace.yaml 文件
  ✅ 备份 .eslintrc.js 文件
  ✅ 备份 .prettierrc 文件

🔐 备份环境模板...
  ✅ 备份环境变量模板 (3 个文件)
  ✅ 备份 Docker 模板 (1 个文件)
  ✅ 备份 CI/CD 配置 (2 个文件)

🗄️ 备份数据库...
  ✅ 数据库备份完成 (15.2 MB)
  ✅ 备份文件: database-backup-2025-01-27.sql

📚 备份文档...
  ✅ 备份 README.md 文件
  ✅ 备份 API 文档 (25 个文件)
  ✅ 备份架构文档 (12 个文件)

🛠️ 备份工具脚本...
  ✅ 备份维护脚本 (4 个文件)
  ✅ 备份自动化脚本 (6 个文件)
  ✅ 备份部署脚本 (3 个文件)

📋 生成备份清单...
  ✅ 备份清单已生成: backup-manifest.json

🎉 项目备份完成！
📊 备份统计:
  - 备份文件: 156 个
  - 备份大小: 19.4 MB
  - 备份时间: 2 分钟
  - 备份位置: backups/2025-01-27T10-30-00-000Z
```

**备份组件**:

1. **源代码备份** (`--component=code`)
   ```bash
   # 备份的目录和文件
   apps/
   tools/
   docs/
   *.ts
   *.tsx
   *.js
   *.jsx
   ```

2. **配置文件备份** (`--component=config`)
   ```bash
   # 备份的目录和文件
   package.json
   pnpm-workspace.yaml
   .eslintrc.js
   .prettierrc
   tsconfig.json
   ```

3. **环境模板备份** (`--component=env`)
   ```bash
   # 备份的目录和文件
   config/env-templates/
   infrastructure/docker/
   .github/workflows/
   ```

4. **数据库备份** (`--component=database`)
   ```bash
   # 备份的目录和文件
   apps/api/prisma/
   database-backup-*.sql
   ```

5. **文档备份** (`--component=docs`)
   ```bash
   # 备份的目录和文件
   docs/
   README.md
   *.md
   ```

**备份清单示例**:
```json
{
  "backupInfo": {
    "name": "2025-01-27T10-30-00-000Z",
    "timestamp": "2025-01-27T10:30:00.000Z",
    "version": "1.0.0",
    "description": "完整项目备份"
  },
  "statistics": {
    "totalFiles": 156,
    "totalSize": "19.4 MB",
    "backupTime": "2 分钟",
    "components": {
      "code": "4.1 MB",
      "config": "0.1 MB",
      "env": "0.1 MB",
      "database": "15.2 MB",
      "docs": "1.2 MB"
    }
  },
  "files": [
    {
      "path": "apps/api/src/app.ts",
      "size": "2.1 KB",
      "hash": "sha256:abc123...",
      "component": "code"
    },
    {
      "path": "package.json",
      "size": "1.2 KB",
      "hash": "sha256:def456...",
      "component": "config"
    }
  ]
}
```

---

## 🔧 配置选项

### 环境变量

```bash
# 维护脚本配置
MAINTENANCE_BACKUP_DIR=backups
MAINTENANCE_CLEANUP_DRY_RUN=false
MAINTENANCE_HEALTH_CHECK_TIMEOUT=30000
MAINTENANCE_RESTORE_SKIP_DEPS=false

# 备份配置
BACKUP_INCLUDE_NODE_MODULES=false
BACKUP_INCLUDE_LOGS=false
BACKUP_COMPRESS=true
BACKUP_ENCRYPT=false

# 清理配置
CLEANUP_DRY_RUN=false
CLEANUP_INCLUDE_LOGS=true
CLEANUP_INCLUDE_CACHE=true
CLEANUP_CONFIRM=true
```

### 命令行参数

```bash
# restore.js 参数
--skip-deps          # 跳过依赖安装
--skip-db            # 跳过数据库设置
--skip-tests         # 跳过测试运行
--force              # 强制重新生成配置

# cleanup.js 参数
--type=<type>        # 指定清理类型
--dry-run            # 预览清理操作
--confirm            # 确认清理操作
--exclude=<pattern>  # 排除文件模式

# health-check.js 参数
--component=<comp>   # 指定检查组件
--format=<format>    # 输出格式 (json/text)
--timeout=<ms>       # 超时时间
--verbose            # 详细输出

# backup.js 参数
--name=<name>        # 备份名称
--component=<comp>   # 指定备份组件
--compress           # 压缩备份
--encrypt            # 加密备份
```

---

## 🚨 故障排除

### 常见问题

1. **恢复脚本失败**
   ```bash
   # 检查依赖安装
   pnpm install
   
   # 检查环境配置
   node tools/scripts/maintenance/health-check.js
   
   # 清理后重试
   node tools/scripts/maintenance/cleanup.js
   node tools/scripts/maintenance/restore.js
   ```

2. **清理脚本权限错误**
   ```bash
   # 检查文件权限
   ls -la
   
   # 修改权限
   chmod -R 755 .
   
   # 使用sudo（谨慎）
   sudo node tools/scripts/maintenance/cleanup.js
   ```

3. **健康检查超时**
   ```bash
   # 增加超时时间
   node tools/scripts/maintenance/health-check.js --timeout=60000
   
   # 检查服务状态
   docker ps
   netstat -tulpn | grep :8001
   ```

4. **备份空间不足**
   ```bash
   # 检查磁盘空间
   df -h
   
   # 清理旧备份
   rm -rf backups/old-*
   
   # 使用外部存储
   node tools/scripts/maintenance/backup.js --output=/external/backup
   ```

### 调试模式

```bash
# 启用详细日志
DEBUG=* node tools/scripts/maintenance/restore.js

# 启用调试模式
NODE_ENV=development node tools/scripts/maintenance/health-check.js

# 预览操作
node tools/scripts/maintenance/cleanup.js --dry-run
```

---

## 📅 定时任务

### 设置自动维护

**Linux/macOS (crontab)**:
```bash
# 编辑crontab
crontab -e

# 每天凌晨2点运行健康检查
0 2 * * * cd /path/to/project && node tools/scripts/maintenance/health-check.js

# 每周日凌晨3点清理项目
0 3 * * 0 cd /path/to/project && node tools/scripts/maintenance/cleanup.js

# 每月1号凌晨4点备份项目
0 4 1 * * cd /path/to/project && node tools/scripts/maintenance/backup.js
```

**Windows (任务计划程序)**:
```cmd
# 创建健康检查任务
schtasks /create /tn "HealthCheck" /tr "node tools/scripts/maintenance/health-check.js" /sc daily /st 02:00

# 创建清理任务
schtasks /create /tn "ProjectCleanup" /tr "node tools/scripts/maintenance/cleanup.js" /sc weekly /d SUN /st 03:00

# 创建备份任务
schtasks /create /tn "ProjectBackup" /tr "node tools/scripts/maintenance/backup.js" /sc monthly /d 1 /st 04:00
```

---

## 🔒 安全注意事项

1. **环境配置安全**
   - 不要将敏感信息硬编码在脚本中
   - 使用环境变量管理敏感配置
   - 定期轮换密钥和密码

2. **备份安全**
   - 加密敏感备份文件
   - 限制备份文件访问权限
   - 定期清理旧备份文件

3. **清理安全**
   - 确认清理操作不会删除重要文件
   - 使用 `--dry-run` 预览清理操作
   - 保留重要日志和配置文件

---

## 📚 相关文档

- [开发环境配置指南](../../../docs/development/environment-setup.md)
- [项目维护最佳实践](../../../docs/maintenance/maintenance-guide.md)
- [备份恢复策略](../../../docs/backup/backup-strategy.md)
- [健康监控文档](../../../docs/monitoring/health-monitoring.md)

---

## 🤝 贡献指南

1. 添加新的维护功能时，请提供完整的文档和示例
2. 确保所有脚本都有适当的错误处理和日志记录
3. 添加测试用例验证脚本功能
4. 遵循项目的代码风格和规范

---

*最后更新: 2025-01-27*