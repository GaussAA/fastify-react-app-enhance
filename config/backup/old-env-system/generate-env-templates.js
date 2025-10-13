#!/usr/bin/env node

/**
 * 环境变量模板生成器
 * 根据统一配置生成各种环境变量模板文件
 */

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { loadAppConfig } from './config-loader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../');

// 颜色输出
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * 生成根目录 env.example
 */
function generateRootEnvExample() {
  const config = loadAppConfig();

  const content = `# 环境变量配置文件
# 此文件只包含必需和可选的配置
# 端口配置由统一配置管理系统自动管理，请勿手动修改端口号

# ===========================================
# 必需配置（敏感信息，必须设置）
# ===========================================
# JWT 密钥（必需 - 请修改为随机字符串）
JWT_SECRET=your_jwt_secret_key_here

# 数据库密码（必需 - 请修改为安全密码）
DB_PASSWORD=your_secure_password_here

# LLM API 密钥（必需 - 敏感信息）
LLM_API_KEY=your_llm_api_key_here

# ===========================================
# 可选配置（有默认值，可根据需要修改）
# ===========================================
# 环境配置
NODE_ENV=development
LOG_LEVEL=info
HOST=0.0.0.0

# API 密钥（可选）
API_KEY=your_api_key_here
VITE_API_KEY=your_frontend_api_key_here

# LLM 配置（可选，有默认值）
LLM_DEFAULT_PROVIDER=deepseek
LLM_DEFAULT_MODEL=deepseek-chat
LLM_BASE_URL=https://api.deepseek.com/v1
LLM_TIMEOUT=30000
LLM_MAX_RETRIES=3
LLM_TEMPERATURE=0.7
LLM_MAX_TOKENS=2000
LLM_TOP_P=1.0
LLM_FREQUENCY_PENALTY=0.0
LLM_PRESENCE_PENALTY=0.0

# 应用配置（可选，有默认值）
VITE_APP_TITLE=Fastify React App
VITE_APP_VERSION=1.0.0
JWT_EXPIRES_IN=7d

# ===========================================
# 自动生成的配置（请勿手动修改）
# ===========================================
# 以下配置由统一配置管理系统自动生成
# 数据库连接字符串（端口由统一配置管理）
DATABASE_URL=postgresql://postgres:your_secure_password_here@localhost:${config.PORTS.POSTGRES}/fastify_react_app

# Redis 连接字符串（端口由统一配置管理）
REDIS_URL=${config.URLS.REDIS}

# API 基础 URL（端口由统一配置管理）
VITE_API_BASE_URL=${config.URLS.API}

# CORS 配置（端口由统一配置管理）
CORS_ORIGIN=${config.URLS.WEB}

# ===========================================
# 配置说明
# ===========================================
# 1. 必需配置：JWT_SECRET, DB_PASSWORD, LLM_API_KEY
# 2. 可选配置：有默认值，可根据需要修改
# 3. 端口配置由 config/ports.ts 统一管理
# 4. 修改端口后运行: pnpm run config:generate
# 5. 敏感信息请使用强密码和随机密钥
# 6. 生产环境请使用环境变量或密钥管理服务
`;

  const filePath = join(projectRoot, 'env.example');
  writeFileSync(filePath, content);
  log(`✅ 生成根目录环境配置模板: ${filePath}`, 'green');
}

/**
 * 生成 API 环境配置模板
 */
function generateApiEnvExample() {
  const config = loadAppConfig();

  const content = `# API 环境配置示例文件
# 此文件是配置模板，AI可以修改此文件来添加新的配置项
# 修改后请同步到 .env 文件，并在 .env.secret 中补充敏感值
# 端口配置由统一配置管理，请勿手动修改端口号

# 基础配置
NODE_ENV=development
PORT=${config.PORTS.API}

# 数据库配置
DATABASE_URL=postgresql://postgres:\${DB_PASSWORD}@localhost:${config.PORTS.POSTGRES}/fastify_react_app
REDIS_URL=${config.URLS.REDIS}

# JWT 配置
JWT_SECRET=\${JWT_SECRET}
JWT_EXPIRES_IN=7d

# CORS 配置
CORS_ORIGIN=${config.URLS.WEB}

# 日志配置
LOG_LEVEL=info
API_KEY=\${API_KEY}

# LLM 配置
LLM_DEFAULT_PROVIDER=\${LLM_DEFAULT_PROVIDER}
LLM_API_KEY=\${LLM_API_KEY}
LLM_DEFAULT_MODEL=\${LLM_DEFAULT_MODEL}
LLM_BASE_URL=\${LLM_BASE_URL}
LLM_TIMEOUT=\${LLM_TIMEOUT}
LLM_MAX_RETRIES=\${LLM_MAX_RETRIES}
LLM_TEMPERATURE=\${LLM_TEMPERATURE}
LLM_MAX_TOKENS=\${LLM_MAX_TOKENS}
LLM_TOP_P=\${LLM_TOP_P}
LLM_FREQUENCY_PENALTY=\${LLM_FREQUENCY_PENALTY}
LLM_PRESENCE_PENALTY=\${LLM_PRESENCE_PENALTY}

# 新增配置项示例（AI可以添加）
# NEW_CONFIG=\${NEW_CONFIG}
`;

  const filePath = join(projectRoot, 'apps/api/env.example');
  writeFileSync(filePath, content);
  log(`✅ 生成 API 环境配置模板: ${filePath}`, 'green');
}

/**
 * 生成 Docker Compose 配置
 */
function generateDockerComposeConfig() {
  const config = loadAppConfig();

  const content = `services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: eed8bb97c8af15504426ed81daf291a5
      POSTGRES_DB: fastify_react_app
    ports:
      - '${config.PORTS.POSTGRES}:5432'
    volumes:
      - ../../infrastructure/database/postgres:/var/lib/postgresql/data
    restart: unless-stopped
    healthcheck:
      test: [ 'CMD-SHELL', 'pg_isready -U postgres -d fastify_react_app' ]
      interval: ${config.HEALTH_CHECK.POSTGRES.INTERVAL}
      timeout: ${config.HEALTH_CHECK.POSTGRES.TIMEOUT}
      retries: ${config.HEALTH_CHECK.POSTGRES.RETRIES}

  redis:
    image: redis:7
    ports:
      - '${config.PORTS.REDIS}:6379'
    volumes:
      - ../../infrastructure/database/redis:/data
    restart: unless-stopped
    healthcheck:
      test: [ 'CMD', 'redis-cli', 'ping' ]
      interval: ${config.HEALTH_CHECK.REDIS.INTERVAL}
      timeout: ${config.HEALTH_CHECK.REDIS.TIMEOUT}
      retries: ${config.HEALTH_CHECK.REDIS.RETRIES}

  api:
    build:
      context: ../../apps/api
      dockerfile: ../../infrastructure/docker/fastify.Dockerfile
    env_file:
      - ../../apps/api/.env
    ports:
      - '${config.PORTS.API}:8001'
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped
    healthcheck:
      test: [ 'CMD', 'curl', '-f', 'http://localhost:8001/health' ]
      interval: ${config.HEALTH_CHECK.API.INTERVAL}
      timeout: ${config.HEALTH_CHECK.API.TIMEOUT}
      retries: ${config.HEALTH_CHECK.API.RETRIES}

  web:
    build:
      context: ../../apps/web
      dockerfile: ../../infrastructure/docker/web.Dockerfile
    env_file:
      - ../../apps/web/.env
    ports:
      - '${config.PORTS.WEB}:5173'
    depends_on:
      - api
    restart: unless-stopped

# 网络配置
networks:
  default:
    name: ${config.DOCKER.NETWORK}
    driver: bridge

# 数据持久化已配置为绑定挂载到项目目录
# volumes:
#   postgres_data:
#   redis_data:
`;

  const filePath = join(
    projectRoot,
    'infrastructure/docker/docker-compose.yml'
  );
  writeFileSync(filePath, content);
  log(`✅ 生成 Docker Compose 配置: ${filePath}`, 'green');
}

/**
 * 生成配置说明文档
 */
function generateConfigDocumentation() {
  const config = loadAppConfig();

  const content = `# 统一配置管理说明

## 概述

本项目使用统一配置管理系统，所有端口和常用配置都集中在 \`config/\` 目录下管理。

## 配置文件结构

\`\`\`
config/
├── ports.ts              # 端口配置定义
├── app-config.ts         # 应用核心配置
├── config-loader.js      # 配置加载器（Node.js 脚本用）
└── generate-env-templates.js  # 环境模板生成器
\`\`\`

## 当前端口配置

| 服务 | 端口 | 说明 |
|------|------|------|
| PostgreSQL | ${config.PORTS.POSTGRES} | 数据库服务 |
| Redis | ${config.PORTS.REDIS} | 缓存服务 |
| API | ${config.PORTS.API} | 后端 API 服务 |
| Web | ${config.PORTS.WEB} | 前端 Web 服务 |
| Prisma Studio | ${config.PORTS.PRISMA_STUDIO} | 数据库管理工具 |
| Redis Commander | ${config.PORTS.REDIS_COMMANDER} | Redis 管理工具 |

## 如何修改端口配置

1. 编辑 \`config/ports.ts\` 文件中的端口定义
2. 运行 \`node config/generate-env-templates.js\` 重新生成配置文件
3. 重启相关服务

## 配置使用示例

### 在 TypeScript 代码中使用

\`\`\`typescript
import { PORTS, SERVICE_URLS } from '../config/ports.js';

// 使用端口
const apiPort = PORTS.API;

// 使用服务 URL
const apiUrl = SERVICE_URLS.API;
\`\`\`

### 在 Node.js 脚本中使用

\`\`\`javascript
import { loadAppConfig } from './config/config-loader.js';

const config = loadAppConfig();
const apiPort = config.PORTS.API;
\`\`\`

## 自动生成的文件

以下文件由配置生成器自动维护，请勿手动修改：

- \`env.example\`
- \`apps/api/env.example\`
- \`infrastructure/docker/docker-compose.yml\`

如需修改这些文件，请编辑 \`config/ports.ts\` 后重新生成。
`;

  const filePath = join(projectRoot, 'config/README.md');
  writeFileSync(filePath, content);
  log(`✅ 生成配置说明文档: ${filePath}`, 'green');
}

/**
 * 主函数
 */
function main() {
  log('🔄 开始生成统一配置模板...', 'blue');

  try {
    generateRootEnvExample();
    generateApiEnvExample();
    generateDockerComposeConfig();
    generateConfigDocumentation();

    log('', 'reset');
    log('🎉 统一配置模板生成完成！', 'green');
    log('', 'reset');
    log('📋 生成的文件：', 'cyan');
    log('  📄 env.example', 'blue');
    log('  📄 apps/api/env.example', 'blue');
    log('  🐳 infrastructure/docker/docker-compose.yml', 'blue');
    log('  📚 config/README.md', 'blue');
    log('', 'reset');
    log(
      '💡 如需修改端口配置，请编辑 config/ports.ts 后重新运行此脚本',
      'yellow'
    );
  } catch (error) {
    log(`❌ 生成配置模板失败: ${error.message}`, 'red');
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  main();
}

export { main as generateEnvTemplates };
