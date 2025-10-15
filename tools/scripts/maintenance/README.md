# 启动和停止脚本配置说明

## 概述

维护脚本现在包含三个主要脚本，完全支持环境变量配置，移除了所有硬编码值，提供了最大的灵活性：

- **启动脚本** (`start.js`) - 启动所有服务
- **停止脚本** (`stop.js`) - 停止所有服务  
- **重启脚本** (`restart.js`) - 快速重启所有服务

## 环境变量配置

### 🔧 必需环境变量

| 变量名                  | 默认值                    | 说明                         |
| ----------------------- | ------------------------- | ---------------------------- |
| `REQUIRED_ENV_VARS`     | -                         | 必需环境变量列表，用逗号分隔 |
| `DEFAULT_REQUIRED_VARS` | `JWT_SECRET,DATABASE_URL` | 默认必需变量列表             |

### 🌐 服务端口配置

| 变量名          | 默认值  | 说明              |
| --------------- | ------- | ----------------- |
| `API_PORT`      | `8001`  | API服务器端口     |
| `WEB_PORT`      | `5173`  | Web开发服务器端口 |
| `DOCS_PORT`     | `8080`  | 文档服务器端口    |
| `POSTGRES_PORT` | `15432` | PostgreSQL端口    |
| `REDIS_PORT`    | `6379`  | Redis端口         |

### 🏠 服务主机配置

| 变量名          | 默认值      | 说明            |
| --------------- | ----------- | --------------- |
| `API_HOST`      | `localhost` | API服务器主机   |
| `WEB_HOST`      | `localhost` | Web服务器主机   |
| `DB_HOST`       | `localhost` | 数据库主机      |
| `REDIS_HOST`    | `localhost` | Redis主机       |
| `VITE_API_HOST` | `localhost` | 前端API主机配置 |
| `VITE_API_PORT` | `8001`      | 前端API端口配置 |

### 🐳 Docker配置

| 变量名                | 默认值                                     | 说明                   |
| --------------------- | ------------------------------------------ | ---------------------- |
| `DOCKER_COMPOSE_FILE` | `infrastructure/docker/docker-compose.yml` | Docker Compose文件路径 |
| `POSTGRES_SERVICE`    | `postgres`                                 | PostgreSQL服务名称     |
| `REDIS_SERVICE`       | `redis`                                    | Redis服务名称          |
| `POSTGRES_CONTAINER`  | `postgres`                                 | PostgreSQL容器名称     |
| `REDIS_CONTAINER`     | `redis`                                    | Redis容器名称          |

### ⏱️ 超时配置

| 变量名               | 默认值 | 说明                         |
| -------------------- | ------ | ---------------------------- |
| `POSTGRES_WAIT_TIME` | `30`   | PostgreSQL启动等待时间（秒） |
| `REDIS_WAIT_TIME`    | `15`   | Redis启动等待时间（秒）      |

### 📦 包管理器配置

| 变量名            | 默认值 | 说明                      |
| ----------------- | ------ | ------------------------- |
| `PACKAGE_MANAGER` | `pnpm` | 包管理器（npm/yarn/pnpm） |
| `DEV_COMMAND`     | `dev`  | 开发启动命令              |

### 🛑 停止脚本配置

| 变量名                | 默认值                          | 说明                 |
| --------------------- | ------------------------------- | -------------------- |
| `EXTRA_PORTS_TO_STOP` | `3000,3001,4000,5000,8000,9000` | 额外要停止的端口列表 |

## 使用示例

### 基本使用

```bash
# 使用默认配置启动
node tools/scripts/maintenance/start.js

# 使用默认配置停止
node tools/scripts/maintenance/stop.js

# 快速重启所有服务
node tools/scripts/maintenance/restart.js
```

### 使用 pnpm 命令

```bash
# 启动项目
pnpm run start

# 停止项目
pnpm run stop

# 重启项目
pnpm run restart
```

### 自定义配置

```bash
# 设置自定义端口
export API_PORT=9001
export WEB_PORT=3000
export POSTGRES_PORT=5432

# 设置自定义必需环境变量
export REQUIRED_ENV_VARS="JWT_SECRET,DATABASE_URL,API_KEY"

# 设置自定义包管理器
export PACKAGE_MANAGER="npm"
export DEV_COMMAND="start:dev"

# 启动项目
node tools/scripts/maintenance/start.js
```

### 环境文件配置

在 `.env` 文件中添加：

```env
# 服务端口
API_PORT=8001
WEB_PORT=5173
POSTGRES_PORT=15432
REDIS_PORT=6379

# 服务主机
API_HOST=localhost
WEB_HOST=localhost
DB_HOST=localhost
REDIS_HOST=localhost

# Docker配置
DOCKER_COMPOSE_FILE=docker-compose.yml
POSTGRES_SERVICE=postgres
REDIS_SERVICE=redis

# 包管理器
PACKAGE_MANAGER=pnpm
DEV_COMMAND=dev

# 必需环境变量
REQUIRED_ENV_VARS=JWT_SECRET,DATABASE_URL,LLM_API_KEY
```

## 配置验证

脚本会自动验证：

1. **环境文件存在性** - 检查 `.env` 文件是否存在
2. **必需变量** - 验证所有必需的环境变量是否已设置
3. **端口可用性** - 检查端口是否被占用
4. **Docker状态** - 验证Docker是否运行
5. **依赖完整性** - 检查项目依赖是否已安装

## 错误处理

- **友好提示** - 所有错误都有清晰的说明和解决建议
- **优雅降级** - 非关键错误不会阻止脚本继续执行
- **详细日志** - 提供彩色输出和详细的状态信息

## 跨平台支持

- **Windows** - 使用 `netstat` 和 `taskkill` 命令
- **Unix/Linux/macOS** - 使用 `lsof` 和 `kill` 命令
- **自动检测** - 根据操作系统自动选择正确的命令

## 重启脚本功能

### 🔄 重启脚本 (`restart.js`) 特性

重启脚本提供快速重启所有服务的功能，包括：

1. **智能停止** - 自动检测并停止所有运行中的服务
2. **数据库容器优化** - 暂停数据库容器而不是移除，保持数据完整性
3. **清理临时文件** - 清理缓存和临时文件
4. **等待机制** - 确保服务完全停止后再启动
5. **智能启动** - 优先启动暂停的数据库容器，失败时自动重新创建
6. **状态显示** - 显示重启后的服务信息

### 🚀 重启流程

```
1. 停止开发服务器 (API, Web, 文档服务器)
2. 暂停 Docker 服务 (PostgreSQL, Redis) - 数据保留
3. 停止后台进程
4. 清理临时文件和缓存
5. 等待服务完全停止
6. 启动数据库服务 (优先恢复暂停的容器)
7. 显示重启信息
8. 启动开发服务
```

### 💡 使用场景

- **配置更新后** - 应用新的环境变量配置
- **服务异常** - 快速恢复服务状态
- **开发调试** - 重新加载所有服务
- **部署后** - 确保服务正常运行
- **数据库维护** - 快速重启而不丢失数据

### 🔧 数据库容器优化

重启脚本对数据库容器进行了特殊优化：

- **停止时**：使用 `docker compose stop` 暂停容器，保持数据完整性
- **启动时**：优先使用 `docker compose start` 恢复暂停的容器
- **失败处理**：如果恢复失败，自动尝试 `docker compose up -d` 重新创建
- **数据保护**：暂停的容器可以快速恢复，避免数据丢失

## 最佳实践

1. **环境隔离** - 为不同环境设置不同的配置
2. **安全配置** - 敏感信息使用环境变量而非硬编码
3. **文档同步** - 保持配置文档与实际使用同步
4. **测试验证** - 在部署前测试所有配置组合
5. **定期重启** - 使用重启脚本保持服务状态良好