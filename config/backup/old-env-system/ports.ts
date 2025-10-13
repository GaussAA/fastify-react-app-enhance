/**
 * 统一端口配置管理
 * 集中管理项目中所有服务的端口配置，便于统一修改和维护
 */

export const PORTS = {
  // 数据库端口（环境变量未提供则使用默认值）
  POSTGRES: process.env.POSTGRES_PORT || 5432,
  REDIS: process.env.REDIS_PORT || 6379,

  // 应用服务端口（环境变量未提供则使用默认值）
  API: process.env.API_PORT || 8001,
  WEB: process.env.WEB_PORT || 5173,

  // 开发工具端口（环境变量未提供则使用默认值）
  PRISMA_STUDIO: process.env.PRISMA_STUDIO_PORT || 5555,
  REDIS_COMMANDER: process.env.REDIS_COMMANDER_PORT || 8081,
} as const;

/**
 * 服务 URL 配置
 */
export const SERVICE_URLS = {
  API: `http://localhost:${PORTS.API}`,
  WEB: `http://localhost:${PORTS.WEB}`,
  POSTGRES: `postgresql://localhost:${PORTS.POSTGRES}`,
  REDIS: `redis://localhost:${PORTS.REDIS}`,
} as const;

/**
 * Docker 容器端口映射配置
 */
export const DOCKER_PORTS = {
  POSTGRES: `${PORTS.POSTGRES}:5432`,
  REDIS: `${PORTS.REDIS}:6379`,
  API: `${PORTS.API}:8001`,
  WEB: `${PORTS.WEB}:5173`,
} as const;

/**
 * 环境变量模板中的端口引用
 */
export const ENV_PORT_TEMPLATES = {
  DATABASE_URL: `postgresql://{DB_USER}:{DB_PASSWORD}@localhost:${PORTS.POSTGRES}/{DB_NAME}`,
  REDIS_URL: `redis://localhost:${PORTS.REDIS}`,
  CORS_ORIGIN: `http://localhost:${PORTS.WEB}`,
  VITE_API_BASE_URL: `http://localhost:${PORTS.API}`,
} as const;

export default PORTS;
