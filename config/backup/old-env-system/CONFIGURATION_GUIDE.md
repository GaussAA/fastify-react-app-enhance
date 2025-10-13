# 配置管理指南

## 📋 配置架构概述

本项目采用**双重配置管理**策略：

1. **统一配置管理** - 管理端口、URL等相对固定的配置
2. **环境变量管理** - 管理敏感信息和环境特定配置

## 🏗️ 配置文件结构

```
config/
├── ports.ts                   # 端口配置定义
├── env-config.ts              # 环境变量配置（主要配置文件）
├── config-loader.js           # 配置加载器（Node.js 脚本用）
├── logger.ts                  # 日志配置
├── monitoring-config.json     # 监控配置
├── generate-env-templates.js  # 配置生成器
└── CONFIGURATION_GUIDE.md     # 本指南

项目根目录/
├── .env                       # 实际环境变量文件（需要创建）
├── env.example               # 环境变量模板（自动生成）
└── infrastructure/docker/docker-compose.yml  # Docker配置（自动生成）
```

## 🔧 配置分类

### 1. 统一配置管理（config/ports.ts）

**管理内容：**
- ✅ 端口配置（PostgreSQL, Redis, API, Web等）
- ✅ 服务URL配置
- ✅ Docker端口映射
- ✅ 健康检查配置

**特点：**
- 相对固定，不经常变化
- 不包含敏感信息
- 集中管理，一处修改全局生效

### 2. 环境变量管理（.env文件）

**管理内容：**
- ✅ **必需配置**：敏感信息（JWT_SECRET, DB_PASSWORD, LLM_API_KEY）
- ✅ **可选配置**：有默认值的配置（NODE_ENV, LOG_LEVEL等）
- ✅ **自动生成配置**：由统一配置管理系统生成（DATABASE_URL, REDIS_URL等）

**特点：**
- **精简高效**：只包含必需和可选的配置
- **智能默认值**：非敏感配置有合理默认值
- **自动生成**：端口相关配置自动生成
- **安全可靠**：敏感信息必须设置，有验证机制

### 3. 配置策略

**🎯 精简配置策略：**

| 配置类型         | 管理方式  | 特点                         | 示例                                             |
| ---------------- | --------- | ---------------------------- | ------------------------------------------------ |
| **必需配置**     | .env 文件 | 敏感信息，必须设置，无默认值 | `JWT_SECRET`, `DB_PASSWORD`, `LLM_API_KEY`       |
| **可选配置**     | .env 文件 | 有默认值，可根据需要修改     | `NODE_ENV`, `LOG_LEVEL`, `LLM_TEMPERATURE`       |
| **自动生成配置** | 统一配置  | 由系统自动生成，无需手动设置 | `DATABASE_URL`, `REDIS_URL`, `VITE_API_BASE_URL` |
| **端口配置**     | 统一配置  | 集中管理，一处修改全局生效   | `PORTS.API`, `PORTS.POSTGRES`                    |

**💡 优势：**
- **精简**：.env 文件只包含必需和可选的配置
- **高效**：非敏感配置有默认值，开箱即用
- **安全**：敏感信息必须设置，有验证机制
- **智能**：端口相关配置自动生成，避免手动维护

## 🚀 使用流程

### 首次设置

1. **生成配置模板**
   ```bash
   pnpm run config:generate
   ```

2. **创建环境变量文件**
   ```bash
   cp env.example .env
   ```

3. **编辑必需配置**
   ```bash
   # 编辑 .env 文件，只需设置必需配置
   nano .env
   ```
   
   **只需设置这3个必需配置：**
   ```bash
   JWT_SECRET=your_jwt_secret_key_here
   DB_PASSWORD=your_secure_password_here
   LLM_API_KEY=your_llm_api_key_here
   ```

4. **启动项目**
   ```bash
   pnpm run start
   ```

**🎉 就这么简单！** 其他配置都有默认值，开箱即用！

### 修改端口配置

1. **编辑端口配置**
   ```bash
   # 编辑 config/ports.ts
   nano config/ports.ts
   ```

2. **重新生成配置文件**
   ```bash
   pnpm run config:generate
   ```

3. **重启服务**
   ```bash
   pnpm run start
   ```

### 修改环境变量

1. **编辑环境变量**
   ```bash
   # 编辑 .env 文件
   nano .env
   ```

2. **重启服务**
   ```bash
   pnpm run start
   ```

## 📝 配置示例

### 端口配置（config/ports.ts）
```typescript
export const PORTS = {
  POSTGRES: 15432,  // 修改这里
  REDIS: 6379,
  API: 8001,
  WEB: 5173,
} as const;
```

### 精简环境变量（.env）
```bash
# 必需配置（敏感信息，必须设置）
JWT_SECRET=your_super_secret_key_here
DB_PASSWORD=your_secure_password_here
LLM_API_KEY=your_llm_api_key_here

# 可选配置（有默认值，可根据需要修改）
NODE_ENV=development
LOG_LEVEL=info
LLM_TEMPERATURE=0.7
LLM_MAX_TOKENS=2000

# 自动生成配置（无需手动设置）
# DATABASE_URL=postgresql://postgres:your_secure_password_here@localhost:15432/fastify_react_app
# REDIS_URL=redis://localhost:6379
# VITE_API_BASE_URL=http://localhost:8001
# CORS_ORIGIN=http://localhost:5173
```

**💡 精简配置的优势：**
- **只需设置3个必需配置**：JWT_SECRET, DB_PASSWORD, LLM_API_KEY
- **其他配置有默认值**：开箱即用，无需手动设置
- **自动生成配置**：端口相关配置自动生成，避免手动维护
- **清晰分类**：必需、可选、自动生成配置分类明确

## 🔒 安全注意事项

1. **永远不要提交 .env 文件到版本控制**
2. **使用强密码和随机密钥**
3. **生产环境使用密钥管理服务**
4. **定期轮换敏感信息**

## 🛠️ 开发工作流

### 添加新的端口配置

**适用场景：** 添加新的服务端口（如监控服务、新API服务等）

**操作步骤：**

1. **编辑端口定义**
   ```typescript
   // config/ports.ts
   export const PORTS = {
     POSTGRES: 15432,
     REDIS: 6379,
     API: 8001,
     WEB: 5173,
     PRISMA_STUDIO: 5555,
     REDIS_COMMANDER: 8081,
     // 新增端口
     NEW_SERVICE: 9000,  // 添加新服务端口
   } as const;
   ```

2. **重新生成配置文件**
   ```bash
   pnpm run config:generate
   ```

3. **在代码中使用**
   ```typescript
   import { PORTS } from '../config/ports.js';
   const newServicePort = PORTS.NEW_SERVICE;
   ```

4. **重启服务**
   ```bash
   pnpm run start
   ```

### 添加新的环境变量

**适用场景：** 添加敏感信息、环境特定配置、第三方服务配置

**操作步骤：**

1. **更新配置定义**
   ```typescript
   // config/env-config.ts
   export const ENV_CONFIG = {
     // 现有配置...
     
     // 新增配置
     NEW_API_KEY: process.env.NEW_API_KEY || '',
     NEW_SERVICE_URL: process.env.NEW_SERVICE_URL || 'https://api.example.com',
     NEW_TIMEOUT: parseInt(process.env.NEW_TIMEOUT || '5000', 10),
   } as const;
   ```

2. **更新验证逻辑**（如果是必需变量）
   ```typescript
   // config/env-config.ts
   export function validateEnvironment() {
     const requiredVars = [
       'JWT_SECRET',
       'DB_PASSWORD', 
       'LLM_API_KEY',
       'NEW_API_KEY',  // 如果是必需变量
     ];
     // ...
   }
   ```

3. **更新配置生成器**
   ```javascript
   // config/generate-env-templates.js
   // 在 generateRootEnvExample() 函数中添加新变量
   const content = `# 现有配置...
   
   # 新服务配置
   NEW_API_KEY=your_new_api_key_here
   NEW_SERVICE_URL=https://api.example.com
   NEW_TIMEOUT=5000
   `;
   ```

4. **重新生成配置模板**
   ```bash
   pnpm run config:generate
   ```

5. **创建/更新 .env 文件**
   ```bash
   # 复制模板
   cp env.example .env
   
   # 编辑 .env 文件，设置新变量
   nano .env
   ```

6. **在代码中使用**
   ```typescript
   import { APP_CONFIG } from '../config/env-config.js';
   
   const apiKey = APP_CONFIG.NEW_API_KEY;
   const serviceUrl = APP_CONFIG.NEW_SERVICE_URL;
   ```

### 添加应用配置

**适用场景：** 添加相对固定的应用配置（如服务名称、超时时间、重试次数等）

**操作步骤：**

1. **更新应用配置**
   ```typescript
   // config/env-config.ts
   export const APP_CONFIG = {
     // 现有配置...
     
     // 新增应用配置
     NEW_SERVICE: {
       NAME: 'new-service',
       TIMEOUT: 5000,
       RETRY_COUNT: 3,
     },
     
     // 新增健康检查配置
     HEALTH_CHECK: {
       // 现有配置...
       NEW_SERVICE: {
         INTERVAL: '15s',
         TIMEOUT: '10s',
         RETRIES: 3,
       },
     },
   } as const;
   ```

2. **在代码中使用**
   ```typescript
   import { APP_CONFIG } from '../config/env-config.js';
   
   const serviceName = APP_CONFIG.NEW_SERVICE.NAME;
   const timeout = APP_CONFIG.NEW_SERVICE.TIMEOUT;
   ```

### 配置类型判断指南

**如何确定配置应该放在哪里？**

| 配置类型       | 管理方式     | 判断标准                | 示例                   |
| -------------- | ------------ | ----------------------- | ---------------------- |
| **端口配置**   | 统一配置管理 | 服务端口、相对固定      | 新服务端口 9000        |
| **敏感信息**   | 环境变量     | 包含密钥、密码、API Key | 第三方服务 API Key     |
| **环境特定**   | 环境变量     | 不同环境不同值          | 日志级别、调试模式     |
| **相对固定**   | 统一配置管理 | 不经常变化、不敏感      | 服务名称、默认超时时间 |
| **用户自定义** | 环境变量     | 用户可配置的选项        | 主题设置、功能开关     |

## 📊 配置优先级

1. **环境变量** > 统一配置 > 默认值
2. **.env 文件** > env.example 模板
3. **实际配置** > 模板配置

## 🎯 最佳实践

1. **端口配置** - 使用统一配置管理
2. **敏感信息** - 使用环境变量
3. **环境特定** - 使用环境变量
4. **相对固定** - 使用统一配置
5. **用户自定义** - 使用环境变量

## 📋 完整使用示例

### 示例1：添加 Redis 监控服务

**场景：** 需要添加一个 Redis 监控服务，端口 8082

**步骤：**

1. **添加端口配置**
   ```typescript
   // config/ports.ts
   export const PORTS = {
     // 现有配置...
     REDIS_MONITOR: 8082,  // 新增
   } as const;
   ```

2. **重新生成配置**
   ```bash
   pnpm run config:generate
   ```

3. **在 Docker Compose 中使用**
   ```yaml
   # infrastructure/docker/docker-compose.yml (自动生成)
   redis-monitor:
     image: redis-commander:latest
     ports:
       - '8082:8081'  # 自动从配置生成
   ```

### 示例2：添加第三方支付服务

**场景：** 需要集成 Stripe 支付服务

**步骤：**

1. **更新环境变量配置**
   ```typescript
   // config/env-config.ts
   export const ENV_CONFIG = {
     // 现有配置...
     STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
     STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY || '',
   } as const;
   ```

2. **更新验证逻辑**
   ```typescript
   // config/env-config.ts
   export function validateEnvironment() {
     const requiredVars = [
       'JWT_SECRET',
       'DB_PASSWORD',
       'LLM_API_KEY',
       'STRIPE_SECRET_KEY',  // 新增
     ];
     // ...
   }
   ```

3. **更新配置生成器**
   ```javascript
   // config/generate-env-templates.js
   const content = `# 现有配置...
   
   # 支付服务配置
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
   STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
   `;
   ```

4. **重新生成并设置**
   ```bash
   pnpm run config:generate
   cp env.example .env
   # 编辑 .env 文件设置真实的 Stripe 密钥
   ```

### 示例3：添加应用功能开关

**场景：** 需要添加功能开关配置

**步骤：**

1. **更新应用配置**
   ```typescript
   // config/env-config.ts
   export const APP_CONFIG = {
     // 现有配置...
     FEATURES: {
       ENABLE_ANALYTICS: process.env.ENABLE_ANALYTICS === 'true',
       ENABLE_DEBUG_MODE: process.env.ENABLE_DEBUG_MODE === 'true',
       MAX_UPLOAD_SIZE: parseInt(process.env.MAX_UPLOAD_SIZE || '10485760', 10), // 10MB
     },
   } as const;
   ```

2. **在代码中使用**
   ```typescript
   import { APP_CONFIG } from '../config/env-config.js';
   
   if (APP_CONFIG.FEATURES.ENABLE_ANALYTICS) {
     // 启用分析功能
   }
   ```

## 🔧 故障排除

### 问题1：配置生成失败

**错误信息：** `Cannot find module 'config/ports.js'`

**解决方案：**
```bash
# 确保在项目根目录运行
cd /path/to/project
pnpm run config:generate
```

### 问题2：环境变量未生效

**错误信息：** `缺少必需的环境变量: JWT_SECRET`

**解决方案：**
```bash
# 1. 检查 .env 文件是否存在
ls -la .env

# 2. 如果不存在，创建它
cp env.example .env

# 3. 编辑 .env 文件设置必需变量
nano .env
```

### 问题3：端口冲突

**错误信息：** `ports are not available: exposing port TCP 0.0.0.0:5432`

**解决方案：**
```bash
# 1. 修改端口配置
# 编辑 config/ports.ts，将端口改为其他值

# 2. 重新生成配置
pnpm run config:generate

# 3. 重启服务
pnpm run start
```

### 问题4：TypeScript 类型错误

**错误信息：** `Property 'NEW_CONFIG' does not exist`

**解决方案：**
```typescript
// 确保在 env-config.ts 中正确定义了配置
export const ENV_CONFIG = {
  // 现有配置...
  NEW_CONFIG: process.env.NEW_CONFIG || 'default_value',
} as const;
```

## ❓ 常见问题

### Q: 为什么需要两套配置系统？
A: 统一配置管理端口等相对固定的配置，环境变量管理敏感信息和环境特定配置，各司其职。

### Q: 可以只用统一配置管理吗？
A: 不建议，因为敏感信息不应该硬编码在代码中。

### Q: 可以只用环境变量吗？
A: 可以，但会失去统一管理的便利性，端口配置分散在各个文件中。

### Q: 如何在不同环境使用不同配置？
A: 创建不同的 .env 文件（如 .env.development, .env.production）或使用环境变量覆盖。

### Q: 如何批量修改多个端口？
A: 编辑 `config/ports.ts` 文件，然后运行 `pnpm run config:generate`，所有相关文件会自动更新。

### Q: 配置验证失败怎么办？
A: 检查 `.env` 文件中是否设置了所有必需的环境变量，特别是 `JWT_SECRET`、`DB_PASSWORD`、`LLM_API_KEY`。

### Q: 如何备份当前配置？
A: 备份 `config/` 目录和 `.env` 文件即可，其他配置文件都是自动生成的。

## 🔄 迁移指南

如果你之前使用分散的配置管理：

1. 运行 `pnpm run config:generate` 生成新的配置模板
2. 将现有的环境变量迁移到 .env 文件
3. 更新代码使用新的配置系统
4. 删除旧的配置文件

## 📚 快速参考表

### 配置文件速查

| 文件                               | 用途         | 修改方式 |
| ---------------------------------- | ------------ | -------- |
| `config/ports.ts`                  | 端口配置     | 直接编辑 |
| `config/env-config.ts`             | 环境变量配置 | 直接编辑 |
| `config/generate-env-templates.js` | 配置生成器   | 直接编辑 |
| `.env`                             | 实际环境变量 | 直接编辑 |
| `env.example`                      | 环境变量模板 | 自动生成 |
| `docker-compose.yml`               | Docker配置   | 自动生成 |

### 常用命令速查

| 命令                       | 用途                 |
| -------------------------- | -------------------- |
| `pnpm run config:generate` | 重新生成所有配置文件 |
| `cp env.example .env`      | 创建环境变量文件     |
| `pnpm run start`           | 启动项目             |
| `pnpm run stop`            | 停止项目             |

### 配置类型速查

| 配置类型 | 管理方式 | 示例               |
| -------- | -------- | ------------------ |
| 端口号   | 统一配置 | `PORTS.API`        |
| 服务URL  | 统一配置 | `SERVICE_URLS.API` |
| 敏感信息 | 环境变量 | `JWT_SECRET`       |
| 环境特定 | 环境变量 | `NODE_ENV`         |
| 应用配置 | 环境变量 | `LOG_LEVEL`        |

## 🎯 最佳实践总结

### ✅ 推荐做法

1. **端口配置** - 统一在 `config/ports.ts` 管理
2. **敏感信息** - 必须使用环境变量，设置验证
3. **环境特定** - 使用环境变量，提供默认值
4. **相对固定** - 在应用配置中管理
5. **用户自定义** - 使用环境变量
6. **配置验证** - 对必需变量进行验证
7. **文档更新** - 及时更新配置说明
8. **版本控制** - 不提交 `.env` 文件

### ❌ 避免做法

1. **硬编码敏感信息** - 不要在代码中写死密码、密钥
2. **分散端口配置** - 不要在多个文件中重复定义端口
3. **忽略配置验证** - 不要跳过必需变量的检查
4. **提交 .env 文件** - 不要将敏感信息提交到版本控制
5. **手动修改生成文件** - 不要直接修改自动生成的配置文件

### 🔄 工作流程检查清单

添加新配置时：

- [ ] 确定配置类型（端口/敏感信息/应用配置）
- [ ] 选择正确的管理方式
- [ ] 更新相应的配置文件
- [ ] 如果是敏感信息，更新验证逻辑
- [ ] 运行 `pnpm run config:generate`
- [ ] 更新 `.env` 文件
- [ ] 重启相关服务
- [ ] 测试新配置是否正常工作
- [ ] 更新文档（如需要）

---

**总结：统一配置管理 + 环境变量 = 最佳实践！** 🎉

通过这套配置管理系统，你可以：
- 🎯 **集中管理** - 端口配置统一管理
- 🔒 **安全可靠** - 敏感信息环境变量管理
- 🚀 **高效便捷** - 一处修改，全局生效
- 📝 **类型安全** - TypeScript 支持
- 🛠️ **易于维护** - 清晰的配置结构
