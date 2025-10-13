/**
 * 环境变量配置管理
 * 结合统一配置管理和环境变量，提供完整的配置解决方案
 */

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { PORTS, SERVICE_URLS } from './ports.js';

// 获取当前文件目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载环境变量 - 从项目根目录加载统一管理的 .env 文件
config({ path: join(__dirname, '../.env') });

/**
 * 环境变量配置
 * 包含敏感信息和环境特定配置
 * 
 * 配置策略：
 * - 敏感信息：必须设置，无默认值
 * - 可选配置：有合理默认值，.env 中可选设置
 */
export const ENV_CONFIG = {
    // ===========================================
    // 必需配置（敏感信息，必须设置）
    // ===========================================

    // 安全配置 - 必须设置
    JWT_SECRET: process.env.JWT_SECRET || (() => {
        throw new Error('JWT_SECRET 环境变量未设置');
    })(),

    // 数据库密码 - 必须设置
    DB_PASSWORD: process.env.DB_PASSWORD || (() => {
        throw new Error('DB_PASSWORD 环境变量未设置');
    })(),

    // LLM API 密钥 - 必须设置
    LLM_API_KEY: process.env.LLM_API_KEY || (() => {
        throw new Error('LLM_API_KEY 环境变量未设置');
    })(),

    // ===========================================
    // 可选配置（有默认值，.env 中可选设置）
    // ===========================================

    // 环境配置
    NODE_ENV: process.env.NODE_ENV || 'development',
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    HOST: process.env.HOST || '0.0.0.0',

    // API 密钥（可选）
    API_KEY: process.env.API_KEY || '',
    VITE_API_KEY: process.env.VITE_API_KEY || '',

    // 数据库配置（使用统一配置的端口）
    DATABASE_URL: process.env.DATABASE_URL ||
        `postgresql://postgres:${process.env.DB_PASSWORD || 'changeme'}@localhost:${PORTS.POSTGRES}/fastify_react_app`,

    // Redis 配置（使用统一配置的URL）
    REDIS_URL: process.env.REDIS_URL || SERVICE_URLS.REDIS,

    // LLM 配置（可选，有默认值）
    LLM_DEFAULT_PROVIDER: process.env.LLM_DEFAULT_PROVIDER || 'deepseek',
    LLM_DEFAULT_MODEL: process.env.LLM_DEFAULT_MODEL || 'deepseek-chat',
    LLM_BASE_URL: process.env.LLM_BASE_URL || 'https://api.deepseek.com/v1',
    LLM_TIMEOUT: parseInt(process.env.LLM_TIMEOUT || '30000', 10),
    LLM_MAX_RETRIES: parseInt(process.env.LLM_MAX_RETRIES || '3', 10),
    LLM_TEMPERATURE: parseFloat(process.env.LLM_TEMPERATURE || '0.7'),
    LLM_MAX_TOKENS: parseInt(process.env.LLM_MAX_TOKENS || '2000', 10),
    LLM_TOP_P: parseFloat(process.env.LLM_TOP_P || '1.0'),
    LLM_FREQUENCY_PENALTY: parseFloat(process.env.LLM_FREQUENCY_PENALTY || '0.0'),
    LLM_PRESENCE_PENALTY: parseFloat(process.env.LLM_PRESENCE_PENALTY || '0.0'),

    // 应用配置（可选，有默认值）
    VITE_APP_TITLE: process.env.VITE_APP_TITLE || 'Fastify React App',
    VITE_APP_VERSION: process.env.VITE_APP_VERSION || '1.0.0',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
} as const;

/**
 * 完整的应用配置
 * 结合统一配置和环境变量
 */
export const APP_CONFIG = {
    // 从统一配置获取
    PORTS,
    URLS: SERVICE_URLS,

    // 从环境变量获取
    ...ENV_CONFIG,

    // 服务器配置（使用统一配置的端口）
    SERVER: {
        PORT: parseInt(process.env.PORT || PORTS.API.toString(), 10),
        HOST: ENV_CONFIG.HOST,
    },

    // CORS 配置（使用统一配置的URL）
    CORS: {
        ORIGIN: process.env.CORS_ORIGIN || SERVICE_URLS.WEB,
    },

    // JWT 配置
    JWT: {
        SECRET: ENV_CONFIG.JWT_SECRET,
        EXPIRES_IN: ENV_CONFIG.JWT_EXPIRES_IN,
    },
} as const;

/**
 * 验证必需的环境变量
 */
export function validateEnvironment() {
    const requiredVars = [
        'JWT_SECRET',
        'DB_PASSWORD',
        'LLM_API_KEY',
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
        throw new Error(`缺少必需的环境变量: ${missingVars.join(', ')}`);
    }

    return true;
}

export default APP_CONFIG;
