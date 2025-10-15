/**
 * 统一配置系统
 * 简洁、安全、高效的配置管理
 */

import { config as dotenvConfig } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// 获取项目根目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '../../../../');

// 加载环境变量
dotenvConfig({ path: join(PROJECT_ROOT, '.env') });

// 环境类型
export type Environment = 'development' | 'production' | 'staging' | 'test' | 'ci';

// 配置接口
export interface AppConfig {
    // 环境配置
    environment: Environment;
    nodeEnv: string;
    port: number;
    host: string;

    // 数据库配置
    database: {
        url: string;
    };

    // Redis配置
    redis: {
        url: string;
    };

    // JWT配置
    jwt: {
        secret: string;
        expiresIn: string;
    };

    // 日志配置
    logging: {
        level: string;
    };

    // CORS配置
    cors: {
        origin: string;
    };

    // LLM配置
    llm: {
        defaultProvider: string;
        apiKey: string;
        defaultModel: string;
        baseUrl?: string;
        timeout: number;
        maxRetries: number;
        temperature: number;
        maxTokens: number;
        topP: number;
        frequencyPenalty: number;
        presencePenalty: number;
    };

    // 应用配置
    app: {
        title: string;
        version: string;
        description: string;
    };
}

// 验证必需的环境变量
function validateRequiredEnvVars(): void {
    const required = ['DATABASE_URL', 'JWT_SECRET'];
    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
        throw new Error(`缺少必需的环境变量: ${missing.join(', ')}`);
    }
}

// 获取环境类型
function getEnvironment(): Environment {
    const env = process.env.NODE_ENV as Environment;
    return ['development', 'production', 'staging', 'test', 'ci'].includes(env)
        ? env
        : 'development';
}

// 创建配置对象
function createConfig(): AppConfig {
    validateRequiredEnvVars();

    const environment = getEnvironment();

    return {
        // 环境配置
        environment,
        nodeEnv: process.env.NODE_ENV || 'development',
        port: parseInt(process.env.API_PORT || '10000', 10),
        host: process.env.HOST || '0.0.0.0',

        // 数据库配置
        database: {
            url: process.env.DATABASE_URL || '',
        },

        // Redis配置
        redis: {
            url: process.env.REDIS_URL || '',
        },

        // JWT配置
        jwt: {
            secret: process.env.JWT_SECRET || '',
            expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        },

        // 日志配置
        logging: {
            level: process.env.LOG_LEVEL || 'info',
        },

        // CORS配置（访问限制）
        cors: {
            origin: `http://${process.env.WEB_HOST || 'localhost'}:${process.env.WEB_PORT || process.env.API_PORT}` || process.env.CORS_ORIGIN || '',
        },

        // LLM配置
        llm: {
            defaultProvider: process.env.LLM_DEFAULT_PROVIDER || process.env.DEEPSEEK_PROVIDER || 'deepseek',
            apiKey: process.env.LLM_API_KEY || process.env.DEEPSEEK_API_KEY || '',
            defaultModel: process.env.LLM_DEFAULT_MODEL || process.env.DEEPSEEK_DEFAULT_MODEL || 'deepseek-chat',
            baseUrl: process.env.LLM_BASE_URL || process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1',
            timeout: parseInt(process.env.LLM_TIMEOUT || '30000', 10),
            maxRetries: parseInt(process.env.LLM_MAX_RETRIES || '3', 10),
            temperature: parseFloat(process.env.LLM_TEMPERATURE || '0.7'),
            maxTokens: parseInt(process.env.LLM_MAX_TOKENS || '2000', 10),
            topP: parseFloat(process.env.LLM_TOP_P || '1.0'),
            frequencyPenalty: parseFloat(process.env.LLM_FREQUENCY_PENALTY || '0.0'),
            presencePenalty: parseFloat(process.env.LLM_PRESENCE_PENALTY || '0.0'),
        },

        // 应用配置
        app: {
            title: process.env.VITE_APP_TITLE || 'Fastify React App',
            version: process.env.VITE_APP_VERSION || '1.0.0',
            description: process.env.VITE_APP_DESCRIPTION || '现代化全栈应用',
        },
    };
}

// 单例配置实例
let configInstance: AppConfig | null = null;

// 获取配置实例
export function getConfig(): AppConfig {
    if (!configInstance) {
        configInstance = createConfig();
    }
    return configInstance;
}

// 重置配置实例（用于测试）
export function resetConfig(): void {
    configInstance = null;
}

// 便捷访问函数
export const appConfig = getConfig();

// 导出常用配置
export const {
    environment,
    nodeEnv,
    port,
    host,
    database,
    redis,
    jwt,
    logging,
    cors,
    llm,
    app,
} = appConfig;

// 环境检查函数
export const isDevelopment = () => environment === 'development';
export const isProduction = () => environment === 'production';
export const isTest = () => environment === 'test';
export const isCI = () => environment === 'ci';

// 默认导出
export default appConfig;
