# 🗄️ 数据库脚本工具集

**位置**: `tools/scripts/database/`  
**用途**: 数据库管理、备份、恢复和重置  
**更新时间**: 2025-01-27

## 📋 脚本概览

| 脚本名称             | 功能描述   | 使用场景                 |
| -------------------- | ---------- | ------------------------ |
| `database-backup.js` | 数据库备份 | 定期备份PostgreSQL数据库 |
| `reset.js`           | 数据库重置 | 重置数据库到初始状态     |
| `setup.js`           | 数据库设置 | 初始化数据库环境         |

---

## 🚀 快速开始

### 1. 数据库设置

```bash
# 初始化数据库环境
node tools/scripts/database/setup.js
```

### 2. 数据库备份

```bash
# 创建数据库备份
node tools/scripts/database/database-backup.js
```

### 3. 数据库重置

```bash
# 重置数据库
node tools/scripts/database/reset.js
```

---

## 📖 详细使用说明

### 🛠️ 数据库设置脚本 (`setup.js`)

**功能**: 初始化数据库环境，包括Docker容器启动、迁移和种子数据

**执行步骤**:

1. 检查Docker环境
2. 启动PostgreSQL容器
3. 等待数据库就绪
4. 运行数据库迁移
5. 生成Prisma客户端
6. 执行种子数据

**使用方法**:

```bash
# 基本设置
node tools/scripts/database/setup.js

# 设置完成后会显示数据库连接信息
```

**输出示例**:

```
🛠️ 开始数据库设置...

🐳 检查Docker环境...
  ✅ Docker 已安装并运行

🗄️ 启动PostgreSQL容器...
  ✅ PostgreSQL 容器已启动
  ⏳ 等待数据库就绪...
  ✅ 数据库连接成功

📊 运行数据库迁移...
  ✅ 数据库迁移完成

🔧 生成Prisma客户端...
  ✅ Prisma客户端已生成

🌱 执行种子数据...
  ✅ 种子数据已插入

🎉 数据库设置完成！
📊 数据库信息:
  - 主机: localhost
  - 端口: 5432
  - 数据库: fastify_react_app
  - 用户: postgres
```

**配置选项**:

```javascript
// 在脚本中可配置的选项
const config = {
  database: {
    host: 'localhost',
    port: 5432,
    name: 'fastify_react_app',
    user: 'postgres',
    password: process.env.DB_PASSWORD,
  },
  docker: {
    containerName: 'docker-postgres-1',
    image: 'postgres:15',
  },
  timeout: 30000, // 等待数据库启动的超时时间
};
```

### 💾 数据库备份脚本 (`database-backup.js`)

**功能**: 创建PostgreSQL数据库的完整备份，支持自动清理和报告生成

**主要特性**:

- 自动备份PostgreSQL数据库
- 压缩备份文件
- 自动清理旧备份
- 生成备份报告
- 支持恢复功能

**使用方法**:

```bash
# 创建备份
node tools/scripts/database/database-backup.js

# 备份文件会保存到 backups/database/ 目录
```

**输出示例**:

```
💾 开始数据库备份...

📊 加载备份配置...
  ✅ 配置加载成功

🗄️ 创建备份目录...
  ✅ 备份目录已创建: backups/database

📦 备份PostgreSQL数据库...
  ✅ 数据库备份完成: fastify_react_app_20250127_120000.sql.gz
  📊 备份大小: 2.5 MB
  ⏱️ 备份耗时: 1.2 秒

🧹 清理旧备份...
  ✅ 已清理 3 个旧备份文件
  💾 释放空间: 15.2 MB

📋 记录备份信息...
  ✅ 备份信息已记录

📊 生成备份报告...
  ✅ 备份报告已生成: docs/generated/reports/backup-report.json

🎉 数据库备份完成！
📊 备份统计:
  - 备份文件: fastify_react_app_20250127_120000.sql.gz
  - 文件大小: 2.5 MB
  - 备份时间: 2025-01-27 12:00:00
  - 保留备份: 7 个
```

**备份配置**:

```json
{
  "postgres": {
    "host": "localhost",
    "port": 5432,
    "database": "fastify_react_app",
    "username": "postgres",
    "password": "从环境变量读取"
  },
  "backup": {
    "directory": "backups/database",
    "retentionDays": 7,
    "compression": true,
    "format": "custom"
  },
  "cleanup": {
    "enabled": true,
    "maxBackups": 10,
    "maxSize": "1GB"
  }
}
```

**恢复数据库**:

```bash
# 从备份恢复数据库
node tools/scripts/database/database-backup.js restore backups/database/fastify_react_app_20250127_120000.sql.gz
```

**恢复示例**:

```
🔄 开始数据库恢复...

📁 检查备份文件...
  ✅ 备份文件存在: backups/database/fastify_react_app_20250127_120000.sql.gz

🗄️ 恢复PostgreSQL数据库...
  ✅ 数据库恢复完成
  📊 恢复耗时: 2.1 秒

🎉 数据库恢复完成！
```

### 🔄 数据库重置脚本 (`reset.js`)

**功能**: 完全重置数据库到初始状态，包括数据清理和重新初始化

**执行步骤**:

1. 确认重置操作
2. 停止数据库容器
3. 清理数据库数据
4. 重启数据库服务
5. 等待数据库就绪
6. 运行数据库迁移
7. 生成Prisma客户端
8. 执行种子数据

**使用方法**:

```bash
# 重置数据库（需要确认）
node tools/scripts/database/reset.js
```

**输出示例**:

```
🔄 开始数据库重置...

⚠️  警告: 此操作将删除所有数据库数据！
📊 当前数据库状态:
  - 数据库: fastify_react_app
  - 表数量: 5
  - 数据行数: 1,234

❓ 确认重置数据库? (输入 'yes' 确认): yes

🛑 停止数据库容器...
  ✅ 数据库容器已停止

🧹 清理数据库数据...
  ✅ 数据库数据已清理

🚀 重启数据库服务...
  ✅ 数据库服务已重启
  ⏳ 等待数据库就绪...
  ✅ 数据库连接成功

📊 运行数据库迁移...
  ✅ 数据库迁移完成

🔧 生成Prisma客户端...
  ✅ Prisma客户端已生成

🌱 执行种子数据...
  ✅ 种子数据已插入

🎉 数据库重置完成！
📊 重置统计:
  - 清理的表: 5
  - 清理的数据行: 1,234
  - 重新创建的表: 5
  - 插入的种子数据: 100
```

**安全确认**:

```bash
# 重置前会要求确认
⚠️  警告: 此操作将删除所有数据库数据！
❓ 确认重置数据库? (输入 'yes' 确认): yes
```

**配置选项**:

```javascript
// 重置配置
const config = {
  database: {
    containerName: 'docker-postgres-1',
    dataVolume: '../../infrastructure/database/postgres',
  },
  confirmation: {
    required: true,
    keyword: 'yes',
  },
  timeout: 30000,
};
```

---

## 📁 输出文件

### 备份文件

```
backups/database/
├── fastify_react_app_20250127_120000.sql.gz    # 压缩的备份文件
├── fastify_react_app_20250126_120000.sql.gz    # 历史备份
└── backup-info.json                            # 备份信息记录
```

### 报告文件

```
docs/generated/reports/
├── backup-report.json                          # 备份报告
├── backup-report.md                            # 备份报告(Markdown)
└── database-setup.log                          # 设置日志
```

---

## 🔧 配置选项

### 环境变量

```bash
# 数据库连接配置
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fastify_react_app
DB_USER=postgres
DB_PASSWORD=your_secure_password

# 备份配置
BACKUP_RETENTION_DAYS=7
BACKUP_MAX_SIZE=1GB
BACKUP_COMPRESSION=true

# Docker配置
DOCKER_CONTAINER_NAME=docker-postgres-1
DOCKER_IMAGE=postgres:15
```

### 配置文件

创建 `backup-config.json` 文件自定义备份设置：

```json
{
  "postgres": {
    "host": "localhost",
    "port": 5432,
    "database": "fastify_react_app",
    "username": "postgres",
    "password": "从环境变量读取"
  },
  "backup": {
    "directory": "backups/database",
    "retentionDays": 7,
    "compression": true,
    "format": "custom",
    "filename": "{database}_{timestamp}.sql.gz"
  },
  "cleanup": {
    "enabled": true,
    "maxBackups": 10,
    "maxSize": "1GB"
  },
  "notification": {
    "enabled": false,
    "email": "admin@example.com"
  }
}
```

---

## 🚨 故障排除

### 常见问题

1. **Docker容器未运行**

   ```bash
   # 启动Docker容器
   docker-compose up -d postgres
   ```

2. **数据库连接失败**

   ```bash
   # 检查数据库状态
   docker ps | grep postgres

   # 查看数据库日志
   docker logs docker-postgres-1
   ```

3. **权限错误**

   ```bash
   # 确保有足够的权限
   sudo chown -R $USER:$USER backups/
   ```

4. **备份文件损坏**
   ```bash
   # 验证备份文件
   gunzip -t backups/database/fastify_react_app_20250127_120000.sql.gz
   ```

### 调试模式

```bash
# 启用详细日志
DEBUG=* node tools/scripts/database/setup.js

# 启用调试模式
NODE_ENV=development node tools/scripts/database/database-backup.js
```

### 手动恢复

如果自动恢复失败，可以手动恢复：

```bash
# 解压备份文件
gunzip backups/database/fastify_react_app_20250127_120000.sql.gz

# 手动恢复数据库
psql -h localhost -U postgres -d fastify_react_app < backups/database/fastify_react_app_20250127_120000.sql
```

---

## 📅 定时任务

### 设置自动备份

**Linux/macOS (crontab)**:

```bash
# 编辑crontab
crontab -e

# 每天凌晨2点备份
0 2 * * * cd /path/to/project && node tools/scripts/database/database-backup.js

# 每周日凌晨3点清理旧备份
0 3 * * 0 cd /path/to/project && node tools/scripts/database/database-backup.js cleanup
```

**Windows (任务计划程序)**:

1. 打开任务计划程序
2. 创建基本任务
3. 设置触发器为每天
4. 操作设置为启动程序
5. 程序路径: `node`
6. 参数: `tools/scripts/database/database-backup.js`
7. 起始位置: 项目根目录

### 监控备份状态

```bash
# 检查最近的备份
ls -la backups/database/

# 查看备份日志
tail -f logs/database-backup.log

# 检查备份文件大小
du -sh backups/database/*
```

---

## 🔒 安全注意事项

1. **密码安全**
   - 使用强密码
   - 定期更换密码
   - 不要在代码中硬编码密码

2. **备份安全**
   - 加密备份文件
   - 限制备份文件访问权限
   - 定期测试恢复流程

3. **权限控制**
   - 限制数据库用户权限
   - 使用最小权限原则
   - 定期审查权限设置

---

## 📚 相关文档

- [数据库配置文档](../../../docs/database/database-config.md)
- [Prisma使用指南](../../../docs/database/database-design.md)
- [Docker配置文档](../../../docs/deployment/docker.md)
- [环境配置指南](../../../docs/security/configuration-update-guide.md)

---

## 🤝 贡献指南

1. 添加新的数据库操作时，请更新相应的文档
2. 确保所有脚本都有适当的错误处理
3. 添加测试用例验证脚本功能
4. 更新 README 文档说明新功能

---

_最后更新: 2025-01-27_
