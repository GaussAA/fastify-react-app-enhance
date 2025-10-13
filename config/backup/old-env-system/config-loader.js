/**
 * 配置加载器 - 用于 Node.js 脚本
 * 提供统一的配置加载接口
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 加载端口配置
 */
export function loadPortsConfig() {
  try {
    // 读取 TypeScript 配置文件内容并解析端口配置
    const portsContent = readFileSync(join(__dirname, 'ports.ts'), 'utf8');

    // 简单的正则表达式解析端口配置
    const postgresMatch = portsContent.match(/POSTGRES:\s*(\d+)/);
    const redisMatch = portsContent.match(/REDIS:\s*(\d+)/);
    const apiMatch = portsContent.match(/API:\s*(\d+)/);
    const webMatch = portsContent.match(/WEB:\s*(\d+)/);
    const prismaMatch = portsContent.match(/PRISMA_STUDIO:\s*(\d+)/);
    const redisCommanderMatch = portsContent.match(/REDIS_COMMANDER:\s*(\d+)/);

    return {
      POSTGRES: postgresMatch ? parseInt(postgresMatch[1]) : 15432,
      REDIS: redisMatch ? parseInt(redisMatch[1]) : 6379,
      API: apiMatch ? parseInt(apiMatch[1]) : 8001,
      WEB: webMatch ? parseInt(webMatch[1]) : 5173,
      PRISMA_STUDIO: prismaMatch ? parseInt(prismaMatch[1]) : 5555,
      REDIS_COMMANDER: redisCommanderMatch
        ? parseInt(redisCommanderMatch[1])
        : 8081,
    };
  } catch (error) {
    console.warn('无法加载端口配置，使用默认值:', error.message);
    return {
      POSTGRES: 15432,
      REDIS: 6379,
      API: 8001,
      WEB: 5173,
      PRISMA_STUDIO: 5555,
      REDIS_COMMANDER: 8081,
    };
  }
}

/**
 * 加载应用配置
 */
export function loadAppConfig() {
  const ports = loadPortsConfig();

  return {
    SERVICES: {
      POSTGRES: 'postgres',
      REDIS: 'redis',
      API: 'api',
      WEB: 'web',
    },
    PORTS: ports,
    URLS: {
      API: `http://localhost:${ports.API}`,
      WEB: `http://localhost:${ports.WEB}`,
      POSTGRES: `postgresql://localhost:${ports.POSTGRES}`,
      REDIS: `redis://localhost:${ports.REDIS}`,
    },
    DOCKER: {
      PORTS: {
        POSTGRES: `${ports.POSTGRES}:5432`,
        REDIS: `${ports.REDIS}:6379`,
        API: `${ports.API}:8001`,
        WEB: `${ports.WEB}:5173`,
      },
      NETWORK: 'fastify-react-network',
      COMPOSE_FILE: 'infrastructure/docker/docker-compose.yml',
    },
    ENV_TEMPLATES: {
      DATABASE_URL: `postgresql://{DB_USER}:{DB_PASSWORD}@localhost:${ports.POSTGRES}/{DB_NAME}`,
      REDIS_URL: `redis://localhost:${ports.REDIS}`,
      CORS_ORIGIN: `http://localhost:${ports.WEB}`,
      VITE_API_BASE_URL: `http://localhost:${ports.API}`,
    },
    DATABASE: {
      NAME: 'fastify_react_app',
      USER: 'postgres',
      PASSWORD: 'eed8bb97c8af15504426ed81daf291a5',
    },
    HEALTH_CHECK: {
      POSTGRES: {
        INTERVAL: '10s',
        TIMEOUT: '5s',
        RETRIES: 5,
      },
      REDIS: {
        INTERVAL: '10s',
        TIMEOUT: '5s',
        RETRIES: 5,
      },
      API: {
        INTERVAL: '30s',
        TIMEOUT: '10s',
        RETRIES: 3,
      },
    },
  };
}

export default {
  loadPortsConfig,
  loadAppConfig,
};
