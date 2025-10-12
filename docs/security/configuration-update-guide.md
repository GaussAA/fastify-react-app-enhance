# 🔧 便捷安全的环境配置更新指南

**更新时间**: 2025-01-27  
**适用版本**: Fastify-React-App-Enhance v1.0+  
**安全等级**: 🟢 安全  

## 📋 概述

本指南介绍如何使用便捷且安全的方式更新项目中的环境配置、Docker配置和其他基础设施配置。

### 🎯 主要特性

- ✅ **安全优先**: 自动备份，支持回滚
- ✅ **便捷操作**: 交互式界面，一键更新
- ✅ **全面验证**: 自动验证配置正确性
- ✅ **版本控制**: 完整的备份和恢复机制
- ✅ **零停机**: 支持热更新配置

---

## 🚀 快速开始

### 1. 交互式配置更新（推荐）

```bash
# 启动交互式配置更新工具
pnpm run config:update
```

这将启动一个交互式界面，引导您完成配置更新：

```
🚀 开始交互式配置更新...

请选择要更新的配置类型:
1. 环境变量配置
2. Docker配置
3. 全部配置
4. 仅验证配置

请输入选择 (1-4): 
```

### 2. 快速命令

```bash
# 创建配置备份
pnpm run config:backup "before-production-deploy"

# 验证当前配置
pnpm run config:validate

# 重新生成环境文件
pnpm run config:regenerate

# 列出所有备份
pnpm run config:list

# 从备份恢复
pnpm run config:restore config-backup-2025-01-27T10-30-00-000Z
```

---

## 📖 详细使用说明

### 🔄 环境变量更新

#### 自动更新敏感信息

```bash
pnpm run config:update
# 选择 "1. 环境变量配置"
```

系统会询问您是否更新以下敏感信息：
- **JWT密钥**: 用于API认证
- **数据库密码**: PostgreSQL数据库访问密码
- **Redis密码**: Redis缓存服务密码
- **API密钥**: 内部API调用密钥

#### 手动更新特定配置

```bash
# 直接使用环境管理器
node tools/scripts/utils/env-manager.js
```

### 🐳 Docker配置更新

#### 更新Docker Compose配置

```bash
pnpm run config:update
# 选择 "2. Docker配置"
```

这将：
- 重新生成 `docker-compose.yml`
- 使用最新的安全密钥
- 更新服务配置
- 验证配置正确性

#### 手动更新Docker配置

```bash
# 重新生成Docker Compose文件
pnpm run docker:generate
```

### 🔍 配置验证

#### 全面配置检查

```bash
pnpm run config:validate
```

验证内容包括：
- ✅ 环境变量完整性
- ✅ 必需配置项存在
- ✅ 敏感信息安全性
- ✅ Docker配置正确性
- ✅ 文件权限设置

#### 安全检查

```bash
pnpm run security:check
```

---

## 🛡️ 安全特性

### 自动备份机制

每次配置更新前，系统会自动创建备份：

```
✅ 配置备份已创建: backups/config/config-backup-2025-01-27T10-30-00-000Z-before-env-update
```

备份包含：
- 所有环境配置文件 (`.env`, `.env.secrets`)
- Docker配置文件
- 配置模板文件
- 时间戳和描述信息

### 回滚功能

如果配置更新出现问题，可以快速回滚：

```bash
# 1. 查看可用备份
pnpm run config:list

# 2. 选择要恢复的备份
pnpm run config:restore config-backup-2025-01-27T10-30-00-000Z
```

### 配置验证

更新后自动验证：
- ✅ 环境变量格式正确
- ✅ 必需配置项完整
- ✅ 敏感信息已更新
- ✅ 服务配置有效

---

## 📁 配置文件结构

### 环境配置文件

```
config/
├── env-templates/          # 配置模板
│   ├── root.env           # 根目录环境模板
│   ├── api.env            # API项目环境模板
│   └── web.env            # Web项目环境模板
├── .env                   # 根目录环境配置（生成）
├── .env.secrets           # 敏感信息配置（生成）
├── apps/api/.env          # API环境配置（生成）
└── apps/web/.env          # Web环境配置（生成）
```

### Docker配置文件

```
infrastructure/docker/
├── docker-compose.yml           # Docker Compose配置（生成）
├── docker-compose.template.yml  # Docker Compose模板
├── fastify.Dockerfile          # API服务Dockerfile
└── web.Dockerfile              # Web服务Dockerfile
```

### 备份文件

```
backups/config/
├── config-backup-2025-01-27T10-30-00-000Z-before-env-update/
│   ├── .env
│   ├── .env.secrets
│   ├── apps/api/.env
│   ├── apps/web/.env
│   └── infrastructure/docker/docker-compose.yml
└── config-backup-2025-01-27T11-00-00-000Z-before-docker-update/
    └── ...
```

---

## 🔧 高级用法

### 批量配置更新

```bash
# 更新所有配置
pnpm run config:update
# 选择 "3. 全部配置"
```

### 自定义备份描述

```bash
# 创建带描述的备份
pnpm run config:backup "before-production-deploy"
```

### 环境特定配置

```bash
# 开发环境
NODE_ENV=development pnpm run config:update

# 生产环境
NODE_ENV=production pnpm run config:update
```

### 脚本化配置更新

```javascript
// 在脚本中使用
import ConfigUpdater from './tools/scripts/automation/config-updater.js';

const updater = new ConfigUpdater(process.cwd());

// 更新JWT密钥
await updater.updateEnvConfig({
    JWT_SECRET: updater.envManager.generateJwtSecret()
});

// 验证配置
updater.validateConfig();
```

---

## ⚠️ 注意事项

### 生产环境部署

1. **部署前备份**:
   ```bash
   pnpm run config:backup "before-production-deploy"
   ```

2. **验证配置**:
   ```bash
   pnpm run config:validate
   ```

3. **测试服务**:
   ```bash
   pnpm run dev:api  # 测试API服务
   pnpm run dev:web  # 测试Web服务
   ```

### 团队协作

1. **不要提交敏感文件**:
   - `.env.secrets` 已添加到 `.gitignore`
   - 只提交配置模板文件

2. **共享配置模板**:
   - 更新 `config/env-templates/` 中的模板
   - 团队成员运行 `pnpm run config:regenerate`

3. **环境隔离**:
   - 开发环境使用开发配置
   - 生产环境使用生产配置

### 故障排除

#### 配置验证失败

```bash
# 检查具体错误
pnpm run config:validate

# 从备份恢复
pnpm run config:list
pnpm run config:restore <backup-name>
```

#### 服务启动失败

```bash
# 检查环境变量
pnpm run config:validate

# 重新生成配置
pnpm run config:regenerate

# 检查Docker配置
pnpm run docker:generate
```

#### 权限问题

```bash
# 检查文件权限
ls -la .env*
ls -la apps/*/.env

# 修复权限
chmod 600 .env.secrets
chmod 644 .env
```

---

## 📊 最佳实践

### 1. 定期更新敏感信息

```bash
# 每月更新一次敏感信息
pnpm run config:update
# 选择更新JWT密钥、数据库密码等
```

### 2. 部署前检查清单

- [ ] 创建配置备份
- [ ] 验证配置正确性
- [ ] 运行安全检查
- [ ] 测试服务启动
- [ ] 验证功能正常

### 3. 监控配置变更

```bash
# 定期检查配置状态
pnpm run config:validate
pnpm run security:check
```

### 4. 文档化配置变更

```bash
# 创建带描述的备份
pnpm run config:backup "feature-xyz-implementation"
```

---

## 🆘 常见问题

### Q: 如何更新特定环境变量？

A: 使用交互式工具：
```bash
pnpm run config:update
# 选择 "1. 环境变量配置"
# 选择要更新的具体变量
```

### Q: 配置更新后服务无法启动？

A: 检查并恢复：
```bash
pnpm run config:validate  # 检查配置
pnpm run config:list      # 查看备份
pnpm run config:restore <backup-name>  # 恢复备份
```

### Q: 如何在不同环境间同步配置？

A: 使用模板和重新生成：
```bash
# 1. 更新配置模板
# 2. 重新生成环境文件
pnpm run config:regenerate
```

### Q: 备份文件占用太多空间？

A: 定期清理旧备份：
```bash
# 手动删除旧备份
rm -rf backups/config/config-backup-*
```

---

## 📞 技术支持

如果遇到问题，请：

1. 查看错误日志
2. 运行配置验证
3. 检查备份文件
4. 参考故障排除部分
5. 联系技术支持团队

---

*本指南基于2025-01-27的配置更新工具版本编写。*
