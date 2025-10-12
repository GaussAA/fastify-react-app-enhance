# RBAC 脚本使用指南

## 概述

本指南介绍如何使用项目中的RBAC（基于角色的访问控制）相关脚本，这些脚本提供了完整的RBAC系统管理功能。

## 🚀 快速开始

### 首次设置RBAC系统

```bash
# 1. 完整项目设置（推荐）
pnpm run setup

# 2. 或者分步执行
pnpm run db:start          # 启动数据库
pnpm run db:setup          # 设置数据库并初始化RBAC
```

### 检查RBAC系统状态

```bash
# 检查RBAC系统状态
pnpm run rbac:status
```

## 📋 可用脚本命令

### 基础RBAC命令

```bash
# 初始化RBAC系统
pnpm run init:rbac         # 创建默认权限、角色和管理员用户
pnpm run rbac:init         # 别名命令

# 重置RBAC系统
pnpm run rbac:reset        # 重置数据库并重新初始化RBAC

# 检查状态
pnpm run rbac:status       # 检查RBAC系统状态

# 备份和恢复
pnpm run rbac:backup       # 备份RBAC数据
pnpm run rbac:restore      # 恢复RBAC数据
```

### 数据库相关命令

```bash
# 数据库容器管理
pnpm run db:start          # 启动数据库容器
pnpm run db:stop           # 停止数据库容器

# 数据库设置
pnpm run db:setup          # 数据库设置（包含RBAC初始化）
pnpm run db:reset          # 重置数据库

# Prisma操作
pnpm run prisma:generate   # 生成Prisma客户端
pnpm run prisma:migrate    # 运行数据库迁移
pnpm run prisma:seed       # 运行数据库种子
```

## 🔧 详细使用说明

### 1. RBAC系统初始化

#### 使用pnpm命令
```bash
# 初始化RBAC系统
pnpm run init:rbac
```

#### 使用脚本管理器
```bash
# 通过脚本管理器执行
node tools/scripts/script-manager.js exec rbac-manager init
```

#### 直接使用脚本
```bash
# 直接运行RBAC管理脚本
node tools/scripts/automation/rbac-manager.js init
```

**功能说明：**
- 创建默认权限（用户管理、角色管理、权限管理等）
- 创建默认角色（admin、user）
- 创建默认管理员用户
- 分配权限给角色
- 分配角色给管理员用户

### 2. 检查RBAC系统状态

```bash
# 检查RBAC系统状态
pnpm run rbac:status
```

**检查内容：**
- 角色数量
- 权限数量
- 用户数量
- 管理员用户数量
- 系统运行状态

**输出示例：**
```
📊 检查RBAC系统状态...

✅ 数据库连接正常
📋 角色数量: 2
🔐 权限数量: 25
👥 用户数量: 1
👑 管理员用户: 1

📈 系统状态:
  ✅ RBAC系统运行正常
```

### 3. 重置RBAC系统

```bash
# 重置RBAC系统（谨慎使用）
pnpm run rbac:reset
```

**功能说明：**
- 删除所有RBAC数据
- 重新创建数据库结构
- 重新初始化RBAC系统
- 创建新的管理员用户

**注意事项：**
- 此操作会删除所有现有数据
- 需要用户确认操作
- 建议在生产环境使用前先备份

### 4. 备份和恢复RBAC数据

#### 备份RBAC数据
```bash
# 备份RBAC数据
pnpm run rbac:backup
```

**备份内容：**
- 用户表（users）
- 角色表（roles）
- 权限表（permissions）
- 用户角色关联表（user_roles）
- 角色权限关联表（role_permissions）
- 审计日志表（audit_logs）

**备份文件位置：**
```
backups/rbac-backup-YYYY-MM-DDTHH-mm-ss.sql
```

#### 恢复RBAC数据
```bash
# 恢复RBAC数据
pnpm run rbac:restore backups/rbac-backup-2024-01-01.sql
```

**注意事项：**
- 需要指定备份文件路径
- 会覆盖现有RBAC数据
- 需要用户确认操作

### 5. 数据库容器管理

#### 启动数据库
```bash
# 启动PostgreSQL和Redis容器
pnpm run db:start
```

#### 停止数据库
```bash
# 停止数据库容器
pnpm run db:stop
```

#### 数据库设置
```bash
# 完整的数据库设置
pnpm run db:setup
```

**设置流程：**
1. 检查Docker状态
2. 启动PostgreSQL数据库
3. 等待数据库启动
4. 运行数据库迁移
5. 生成Prisma客户端
6. 询问是否运行种子数据
7. 询问是否初始化RBAC系统

## 🛠️ 高级用法

### 使用脚本管理器

```bash
# 查看所有可用脚本
node tools/scripts/script-manager.js list

# 执行RBAC管理脚本
node tools/scripts/script-manager.js exec rbac-manager status

# 批量执行脚本
node tools/scripts/script-manager.js batch setup,init:rbac

# 搜索RBAC相关脚本
node tools/scripts/script-manager.js search rbac
```

### 直接使用脚本文件

```bash
# RBAC管理脚本
node tools/scripts/automation/rbac-manager.js <命令> [参数]

# 数据库设置脚本
node tools/scripts/database/setup.js

# 环境检查脚本（包含RBAC检查）
node tools/scripts/automation/check-environment.js
```

### 环境变量控制

```bash
# 自动化环境（跳过交互确认）
AUTOMATED=true pnpm run db:setup

# CI环境
CI=true pnpm run init:rbac
```

## 🔍 故障排除

### 常见问题

#### 1. 数据库连接失败
```bash
# 检查Docker状态
docker ps

# 启动数据库容器
pnpm run db:start

# 检查数据库连接
node tools/scripts/automation/test-database-connection.js
```

#### 2. RBAC系统未初始化
```bash
# 检查RBAC状态
pnpm run rbac:status

# 初始化RBAC系统
pnpm run init:rbac
```

#### 3. 权限检查失败
```bash
# 检查数据库中的角色和权限
pnpm run rbac:status

# 重新初始化RBAC系统
pnpm run rbac:reset
```

#### 4. 管理员用户无法登录
```bash
# 检查管理员用户
pnpm run rbac:status

# 重新创建管理员用户
node tools/scripts/automation/rbac-manager.js create-admin
```

### 调试技巧

#### 1. 查看详细输出
```bash
# 启用详细日志
LOG_LEVEL=debug pnpm run rbac:status
```

#### 2. 检查数据库状态
```bash
# 直接查询数据库
npx prisma studio
```

#### 3. 查看脚本日志
```bash
# 查看脚本执行日志
node tools/scripts/automation/rbac-manager.js status --verbose
```

## 📚 相关文档

- [RBAC系统文档](../security/rbac-system.md)
- [快速开始指南](../security/quick-start.md)
- [脚本使用指南](./README.md)
- [API文档](http://localhost:8001/docs)

## 🔧 自定义扩展

### 添加新的RBAC脚本

1. 在 `tools/scripts/automation/` 目录下创建新脚本
2. 在 `package.json` 中添加对应的命令
3. 在 `script-manager.js` 中添加描述信息
4. 更新相关文档

### 修改默认权限和角色

1. 编辑 `apps/api/src/services/permission.service.ts`
2. 修改 `initializeDefaultPermissionsAndRoles` 方法
3. 重新运行 `pnpm run rbac:reset`

## 💡 最佳实践

1. **定期备份**：定期备份RBAC数据
2. **环境隔离**：开发、测试、生产环境使用不同的数据库
3. **权限最小化**：遵循最小权限原则
4. **监控审计**：定期查看审计日志
5. **安全更新**：及时更新依赖包

## 🆘 获取帮助

如果遇到问题，可以：

1. 查看脚本的详细输出
2. 使用 `pnpm run rbac:status` 检查系统状态
3. 查看项目文档
4. 提交Issue到项目仓库

---

_最后更新: 2025-01-27_
