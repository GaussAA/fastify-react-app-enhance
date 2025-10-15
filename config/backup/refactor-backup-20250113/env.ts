/**
 * 环境变量配置
 */

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// 获取当前文件目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载环境变量 - 从项目根目录加载统一管理的 .env 文件
config({ path: join(__dirname, '../../../../.env') });

// 验证必需的环境变量
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`缺少必需的环境变量: ${envVar}`);
  }
}

export const env = {
  // 数据库配置
  DATABASE_URL: process.env.DATABASE_URL!,

  // Redis 配置
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',

  // 应用配置
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '8001', 10),
  HOST: process.env.HOST || '0.0.0.0',

  // JWT 配置
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  // 日志配置
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',

  // CORS 配置
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
} as const;
