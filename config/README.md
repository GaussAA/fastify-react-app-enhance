# 环境管理系统

一个安全、灵活、类型安全的环境管理系统，支持多环境、多团队协作，并具备完整的验证和文档。

## 特性

- 🏗️ **分层环境文件架构** - 支持 5 层环境文件加载优先级
- 🔒 **安全敏感配置管理** - 运行时注入敏感信息，无默认值
- 🌍 **多环境支持** - development、production、staging、test、ci
- 📝 **类型安全** - 完整的 TypeScript 类型定义和运行时验证
- 🛡️ **配置验证** - 完整的验证规则和错误提示
- 🔧 **开发工具** - 丰富的调试和开发工具
- 📊 **配置摘要** - 敏感信息过滤和配置摘要功能

## 快速开始

### 1. 基础使用

```typescript
import { loadConfig, getConfig } from './config/env.js';

// 自动检测环境并加载配置
const config = loadConfig();

// 使用单例模式
const config2 = getConfig(); // 使用缓存的配置

console.log('当前环境:', config.environment.NODE_ENV);
console.log('服务器端口:', config.environment.PORT);
console.log('功能开关:', config.business.FEATURE_FLAGS);
```

### 2. 指定环境加载

```typescript
import { loadConfig } from './config/env.js';

// 加载特定环境配置
const devConfig = loadConfig({ environment: 'development' });
const prodConfig = loadConfig({ environment: 'production' });
```

### 3. 配置验证

```typescript
import { loadConfig } from './config/env.js';
import { ConfigValidator } from './config/utils.js';

const config = loadConfig();

// 验证配置完整性
const issues = ConfigValidator.validateConfigCompleteness(config);
if (issues.length > 0) {
  console.error('配置问题:', issues);
}
```

## 环境文件架构

### 加载优先级（从低到高）

1. `.env` - 基础默认配置
2. `.env.local` - 个人本地覆盖（gitignore）
3. `.env.[environment]` - 环境特定配置
4. `.env.[environment].local` - 环境特定本地覆盖（gitignore）
5. 运行时环境变量 - 最高优先级

### 配置分类

#### A类 - 安全敏感配置（运行时注入）

```typescript
interface SecurityConfig {
  JWT_SECRET: string; // JWT 密钥
  DB_PASSWORD: string; // 数据库密码
  LLM_API_KEY: string; // LLM API 密钥
  API_KEY: string; // 通用 API 密钥
  VITE_API_KEY: string; // 前端 API 密钥
}
```

#### B类 - 环境特定配置

```typescript
interface EnvironmentConfig {
  NODE_ENV: Environment; // 环境标识
  DATABASE_URL: string; // 数据库连接字符串
  REDIS_URL: string; // Redis 连接字符串
  API_BASE_URL: string; // API 基础 URL
  WEB_BASE_URL: string; // Web 基础 URL
  LOG_LEVEL: LogLevel; // 日志级别
  HOST: string; // 服务器主机
  PORT: number; // 服务器端口
}
```

#### C类 - 共享业务配置

```typescript
interface BusinessConfig {
  PAGINATION_LIMIT: number; // 分页限制
  REQUEST_TIMEOUT: number; // 请求超时
  MAX_RETRIES: number; // 最大重试次数
  CACHE_TTL: number; // 缓存 TTL
  FEATURE_FLAGS: {
    // 功能开关
    REGISTRATION: boolean;
    EMAIL_VERIFICATION: boolean;
    TWO_FACTOR_AUTH: boolean;
  };
}
```

#### D类 - 开发工具配置

```typescript
interface DevelopmentConfig {
  DEBUG: boolean; // 调试模式
  VERBOSE_LOGGING: boolean; // 详细日志
  MOCK_API: boolean; // 模拟 API
  SEED_DATA: boolean; // 种子数据
  HOT_RELOAD: boolean; // 热重载
}
```

## 支持的环境

- `development` - 开发环境
- `production` - 生产环境
- `staging` - 预发布环境
- `test` - 测试环境
- `ci` - CI/CD 环境

## 环境文件模板

项目提供了完整的环境文件模板：

- `config/env-templates/base.env` - 基础配置模板
- `config/env-templates/development.env` - 开发环境模板
- `config/env-templates/production.env` - 生产环境模板
- `config/env-templates/staging.env` - 预发布环境模板
- `config/env-templates/test.env` - 测试环境模板
- `config/env-templates/ci.env` - CI 环境模板

## 实际项目配置

### 统一配置系统

项目使用 `apps/api/src/config/env.ts` 作为统一配置入口，提供：

- **类型安全**：完整的 TypeScript 类型定义
- **环境检测**：自动检测当前环境
- **配置验证**：使用 Zod 进行运行时验证
- **分层加载**：支持 5 层环境文件优先级
- **敏感信息管理**：运行时注入敏感配置

### 配置加载流程

```typescript
// apps/api/src/config/env.ts
import { config as dotenvConfig } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '../../../../');

// 加载根目录 .env 文件
dotenvConfig({ path: join(PROJECT_ROOT, '.env') });
```

### 实际配置结构

```typescript
interface AppConfig {
  // 环境配置
  environment: {
    NODE_ENV: string;
    PORT: number;
    HOST: string;
  };
  
  // 数据库配置
  database: {
    url: string;
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
  };
  
  // JWT 配置
  jwt: {
    secret: string;
    expiresIn: string;
  };
  
  // LLM 配置
  llm: {
    apiKey: string;
    defaultProvider: string;
    defaultModel: string;
    baseUrl: string;
    timeout: number;
    maxRetries: number;
    temperature: number;
    maxTokens: number;
    topP: number;
    frequencyPenalty: number;
    presencePenalty: number;
  };
  
  // 日志配置
  logging: {
    level: string;
  };
  
  // CORS 配置
  cors: {
    origin: string;
  };
}
```

## 工具函数

### 环境检测

```typescript
import { EnvironmentDetector } from './config/utils.js';

const detection = EnvironmentDetector.detect();
console.log('当前环境:', detection.environment);
console.log('是否生产环境:', detection.isProduction);
```

### 配置合并

```typescript
import { ConfigMerger } from './config/utils.js';

const merged = ConfigMerger.deepMerge(baseConfig, envConfig, overrideConfig);
```

### 敏感信息过滤

```typescript
import { SensitiveDataFilter } from './config/utils.js';

// 创建安全摘要
const summary = SensitiveDataFilter.createConfigSummary(config, {
  includeSensitive: false,
  includeEnvironment: true,
});
```

### 配置调试

```typescript
import { ConfigDebugger } from './config/utils.js';

// 打印配置摘要
ConfigDebugger.printConfigSummary(config);

// 打印环境信息
ConfigDebugger.printEnvironmentInfo();

// 打印验证结果
ConfigDebugger.printValidationResults(config);
```

## 配置验证

### 自动验证

```typescript
const config = loadConfig({
  validate: true, // 启用验证
  allowMissingRequired: false, // 不允许缺失必需配置
});
```

### 手动验证

```typescript
import { ConfigValidator } from './config/utils.js';

// 验证配置完整性
const issues = ConfigValidator.validateConfigCompleteness(config);

// 验证生产环境配置
const prodIssues = ConfigValidator.validateProductionConfig(config);
```

## 安全最佳实践

### 1. 敏感信息管理

- 生产环境必须通过环境变量或密钥管理服务提供敏感信息
- 不允许在代码中硬编码敏感信息
- 使用强密码和随机密钥

### 2. 环境隔离

- 不同环境使用不同的数据库和 Redis 实例
- 生产环境启用所有安全功能
- 开发环境可以禁用某些安全功能以便调试

### 3. 配置验证

- 生产环境强制验证所有配置
- 定期检查配置一致性
- 使用配置摘要功能监控配置变更

## 部署指南

### 开发环境

1. 复制环境文件模板：

```bash
cp config/env-templates/development.env .env
```

2. 修改配置：

```bash
# 编辑 .env 文件，设置开发环境特定的配置
# 主要配置项：
DATABASE_URL="postgresql://postgres_user:postgres_123!@localhost:15432/fastify_react_app?schema=public"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
API_PORT=8001
WEB_PORT=5173
```

3. 启动应用：

```bash
# 一键启动所有服务
pnpm run start

# 或分步启动
pnpm run db:start    # 启动数据库
pnpm run dev        # 启动开发服务器
```

### 生产环境

1. 设置环境变量：

```bash
export NODE_ENV=production
export JWT_SECRET=your_secure_jwt_secret
export DATABASE_URL=postgresql://user:password@host:port/database
export REDIS_URL=redis://host:port
export LLM_API_KEY=your_llm_api_key
export API_PORT=8001
export WEB_PORT=5173
```

2. 或使用密钥管理服务：

```bash
# AWS Secrets Manager
aws secretsmanager get-secret-value --secret-id prod/app/config

# Azure Key Vault
az keyvault secret show --vault-name myvault --name app-config
```

3. 部署应用：

```bash
# 使用 Docker Compose
docker-compose -f infrastructure/docker/docker-compose.yml up -d --build

# 或使用项目脚本
pnpm run start
```

## 故障排除

### 常见问题

1. **配置加载失败**
   - 检查环境文件是否存在
   - 验证环境变量格式
   - 查看错误日志获取详细信息

2. **验证失败**
   - 检查必需配置是否设置
   - 验证配置值格式和范围
   - 确认生产环境不使用占位符

3. **类型错误**
   - 确保使用正确的 TypeScript 类型
   - 检查配置键名是否正确
   - 验证配置值类型

### 调试工具

```typescript
import { ConfigDebugger } from './config/utils.js';

// 启用调试模式
const config = loadConfig({ debug: true });

// 打印详细信息
ConfigDebugger.printConfigSummary(config, true); // 包含敏感信息
```

## API 参考

### 主要函数

- `loadConfig(options?)` - 加载配置
- `getConfig()` - 获取配置实例（单例）
- `detectEnvironment()` - 检测当前环境
- `validateRequiredEnvVars(environment)` - 验证必需环境变量

### 工具类

- `EnvironmentDetector` - 环境检测工具
- `ConfigMerger` - 配置合并工具
- `SensitiveDataFilter` - 敏感信息过滤工具
- `ConfigValidator` - 配置验证工具
- `ConfigDebugger` - 配置调试工具
- `ConfigFileManager` - 配置文件管理工具
- `ConfigComparator` - 配置比较工具

## 示例代码

查看 `config/examples/` 目录获取更多使用示例：

- `basic-usage.ts` - 基础使用示例
- `advanced-usage.ts` - 高级功能示例

## 贡献指南

1. 遵循现有的代码风格
2. 添加适当的类型定义
3. 包含完整的 JSDoc 注释
4. 添加相应的测试用例
5. 更新文档

## 许可证

MIT License
