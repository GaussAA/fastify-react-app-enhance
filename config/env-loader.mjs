/**
 * 环境配置加载器 (JavaScript 版本)
 * 为 Node.js 脚本提供配置访问
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 解析环境文件
 */
function parseEnvFile(filePath) {
    if (!existsSync(filePath)) {
        return {};
    }

    const content = readFileSync(filePath, 'utf-8');
    const env = {};

    content.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const [key, ...valueParts] = trimmed.split('=');
            if (key && valueParts.length > 0) {
                let value = valueParts.join('=').trim();
                // 移除引号
                if ((value.startsWith('"') && value.endsWith('"')) ||
                    (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1);
                }
                env[key.trim()] = value;
            }
        }
    });

    return env;
}

/**
 * 加载环境文件
 */
function loadEnvFiles(projectRoot) {
    let mergedEnv = {};

    // 1. 加载基础 .env 文件
    const baseEnvPath = join(projectRoot, '.env');
    if (existsSync(baseEnvPath)) {
        mergedEnv = { ...mergedEnv, ...parseEnvFile(baseEnvPath) };
    }

    // 2. 加载 .env.local
    const localEnvPath = join(projectRoot, '.env.local');
    if (existsSync(localEnvPath)) {
        mergedEnv = { ...mergedEnv, ...parseEnvFile(localEnvPath) };
    }

    // 3. 加载环境特定文件
    const nodeEnv = process.env.NODE_ENV || 'development';
    const envSpecificFiles = [
        `.env.${nodeEnv}`,
        `.env.${nodeEnv}.local`,
    ];

    for (const file of envSpecificFiles) {
        const filePath = join(projectRoot, file);
        if (existsSync(filePath)) {
            mergedEnv = { ...mergedEnv, ...parseEnvFile(filePath) };
        }
    }

    // 4. 合并运行时环境变量
    mergedEnv = { ...mergedEnv, ...process.env };

    return mergedEnv;
}

/**
 * 构建配置对象
 */
function buildConfig(rawEnv) {
    return {
        security: {
            JWT_SECRET: rawEnv.JWT_SECRET || 'dev_jwt_secret_12345',
            DATABASE_PASSWORD: rawEnv.DB_PASSWORD || 'dev_password_123',
            API_KEYS: {},
            LLM_API_KEY: rawEnv.LLM_API_KEY || 'dev_llm_api_key_placeholder'
        },
        environment: {
            NODE_ENV: rawEnv.NODE_ENV || 'development',
            DATABASE_URL: rawEnv.DATABASE_URL || 'postgresql://postgres:dev_password_123@localhost:15432/fastify_react_app',
            API_BASE_URL: rawEnv.API_BASE_URL || 'http://localhost:8001',
            WEB_APP_URL: rawEnv.WEB_BASE_URL || 'http://localhost:5173',
            REDIS_URL: rawEnv.REDIS_URL || 'redis://localhost:6379',
            LOG_LEVEL: rawEnv.LOG_LEVEL || 'debug',
            HOST: rawEnv.HOST || '0.0.0.0',
            PORT: parseInt(rawEnv.PORT || '8001'),
            CORS_ORIGIN: rawEnv.CORS_ORIGIN || 'http://localhost:5173'
        },
        business: {
            PAGINATION_LIMIT: parseInt(rawEnv.PAGINATION_LIMIT || '20'),
            REQUEST_TIMEOUT: parseInt(rawEnv.REQUEST_TIMEOUT || '15000'),
            APP_TITLE: rawEnv.APP_TITLE || 'My Awesome App',
            APP_VERSION: rawEnv.APP_VERSION || '1.0.0',
            JWT_EXPIRES_IN: rawEnv.JWT_EXPIRES_IN || '7d',
            FEATURE_FLAGS: {
                REGISTRATION: rawEnv.FEATURE_REGISTRATION === 'true',
                EMAIL_VERIFICATION: rawEnv.FEATURE_EMAIL_VERIFICATION === 'true',
                TWO_FACTOR_AUTH: rawEnv.FEATURE_2FA === 'true'
            }
        },
        development: {
            DEBUG: rawEnv.DEBUG === 'true',
            MOCK_API: rawEnv.MOCK_API === 'true',
            SEED_DATA: rawEnv.SEED_DATA === 'true'
        },
        llm: {
            LLM_DEFAULT_PROVIDER: rawEnv.LLM_DEFAULT_PROVIDER || 'deepseek',
            LLM_DEFAULT_MODEL: rawEnv.LLM_DEFAULT_MODEL || 'deepseek-chat',
            LLM_BASE_URL: rawEnv.LLM_BASE_URL || 'https://api.deepseek.com/v1',
            LLM_TIMEOUT: parseInt(rawEnv.LLM_TIMEOUT || '30000'),
            LLM_MAX_RETRIES: parseInt(rawEnv.LLM_MAX_RETRIES || '3'),
            LLM_TEMPERATURE: parseFloat(rawEnv.LLM_TEMPERATURE || '0.7'),
            LLM_MAX_TOKENS: parseInt(rawEnv.LLM_MAX_TOKENS || '2000'),
            LLM_TOP_P: parseFloat(rawEnv.LLM_TOP_P || '1.0'),
            LLM_FREQUENCY_PENALTY: parseFloat(rawEnv.LLM_FREQUENCY_PENALTY || '0.0'),
            LLM_PRESENCE_PENALTY: parseFloat(rawEnv.LLM_PRESENCE_PENALTY || '0.0')
        }
    };
}

// 缓存配置
let appConfig = null;

/**
 * 获取配置
 */
export function getConfig() {
    if (!appConfig) {
        const projectRoot = join(__dirname, '../');
        const rawEnv = loadEnvFiles(projectRoot);
        appConfig = buildConfig(rawEnv);
    }
    return appConfig;
}

/**
 * 加载配置
 */
export function loadConfig() {
    return getConfig();
}

export default getConfig;
