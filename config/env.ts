/**
 * 环境配置加载器
 * 实现分层环境文件加载、类型安全配置构建和验证
 */

// import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import { existsSync, readFileSync } from 'fs';
import {
  Environment,
  Config,
  SecurityConfig,
  EnvironmentConfig,
  BusinessConfig,
  DevelopmentConfig,
  LLMConfig,
  AppConfig,
  RawEnvVars,
  EnvLoadOptions,
  // ConfigValidationResult,
} from './types.js';
import {
  stringTransformer,
  numberTransformer,
  floatTransformer,
  booleanTransformer,
  environmentTransformer,
  logLevelTransformer,
  logFormatTransformer,
  defaultProviders,
  validateConfig,
} from './schema.js';

/**
 * 获取当前文件目录
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 项目根目录
 */
const PROJECT_ROOT = resolve(__dirname, '..');

/**
 * 环境文件加载顺序（从低到高优先级）
 */
const ENV_FILE_LOAD_ORDER = [
  '.env', // 基础默认配置
  '.env.local', // 个人本地覆盖（gitignore）
  '.env.[environment]', // 环境特定配置
  '.env.[environment].local', // 环境特定本地覆盖（gitignore）
];

/**
 * 配置键映射
 */
const CONFIG_KEY_MAPPING = {
  // A类 - 安全敏感配置
  security: {
    JWT_SECRET: 'JWT_SECRET',
    DB_PASSWORD: 'DB_PASSWORD',
    LLM_API_KEY: 'LLM_API_KEY',
    API_KEY: 'API_KEY',
    VITE_API_KEY: 'VITE_API_KEY',
  },
  // B类 - 环境特定配置
  environment: {
    NODE_ENV: 'NODE_ENV',
    DATABASE_URL: 'DATABASE_URL',
    REDIS_URL: 'REDIS_URL',
    API_BASE_URL: 'API_BASE_URL',
    WEB_BASE_URL: 'WEB_BASE_URL',
    LOG_LEVEL: 'LOG_LEVEL',
    LOG_FORMAT: 'LOG_FORMAT',
    HOST: 'HOST',
    PORT: 'PORT',
    CORS_ORIGIN: 'CORS_ORIGIN',
  },
  // C类 - 共享业务配置
  business: {
    PAGINATION_LIMIT: 'PAGINATION_LIMIT',
    PAGINATION_MAX_LIMIT: 'PAGINATION_MAX_LIMIT',
    REQUEST_TIMEOUT: 'REQUEST_TIMEOUT',
    UPLOAD_TIMEOUT: 'UPLOAD_TIMEOUT',
    MAX_RETRIES: 'MAX_RETRIES',
    RETRY_DELAY: 'RETRY_DELAY',
    CACHE_TTL: 'CACHE_TTL',
    CACHE_MAX_SIZE: 'CACHE_MAX_SIZE',
    FEATURE_REGISTRATION: 'FEATURE_REGISTRATION',
    FEATURE_EMAIL_VERIFICATION: 'FEATURE_EMAIL_VERIFICATION',
    FEATURE_2FA: 'FEATURE_2FA',
  },
  // D类 - 开发工具配置
  development: {
    DEBUG: 'DEBUG',
    VERBOSE_LOGGING: 'VERBOSE_LOGGING',
    MOCK_API: 'MOCK_API',
    SEED_DATA: 'SEED_DATA',
    HOT_RELOAD: 'HOT_RELOAD',
    TEST_DATABASE_URL: 'TEST_DATABASE_URL',
    TEST_REDIS_URL: 'TEST_REDIS_URL',
  },
  // LLM 配置
  llm: {
    DEFAULT_PROVIDER: 'LLM_DEFAULT_PROVIDER',
    DEFAULT_MODEL: 'LLM_DEFAULT_MODEL',
    BASE_URL: 'LLM_BASE_URL',
    TIMEOUT: 'LLM_TIMEOUT',
    MAX_RETRIES: 'LLM_MAX_RETRIES',
    TEMPERATURE: 'LLM_TEMPERATURE',
    MAX_TOKENS: 'LLM_MAX_TOKENS',
    TOP_P: 'LLM_TOP_P',
    FREQUENCY_PENALTY: 'LLM_FREQUENCY_PENALTY',
    PRESENCE_PENALTY: 'LLM_PRESENCE_PENALTY',
  },
  // 应用配置
  app: {
    TITLE: 'VITE_APP_TITLE',
    VERSION: 'VITE_APP_VERSION',
    DESCRIPTION: 'VITE_APP_DESCRIPTION',
    JWT_EXPIRES_IN: 'JWT_EXPIRES_IN',
  },
};

/**
 * 检测当前环境
 */
export function detectEnvironment(): Environment {
  const env = process.env.NODE_ENV;
  if (
    env &&
    ['development', 'production', 'staging', 'test', 'ci'].includes(env)
  ) {
    return env as Environment;
  }

  // 根据其他环境变量推断
  if (process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true') {
    return 'ci';
  }

  if (process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID) {
    return 'test';
  }

  return 'development';
}

/**
 * 加载环境文件
 */
function loadEnvFiles(environment: Environment, envPath?: string): RawEnvVars {
  const envVars: RawEnvVars = {};
  const basePath = envPath || PROJECT_ROOT;

  // 按优先级顺序加载环境文件
  for (const pattern of ENV_FILE_LOAD_ORDER) {
    const filePath = pattern.replace('[environment]', environment);
    const fullPath = join(basePath, filePath);

    if (existsSync(fullPath)) {
      try {
        const content = readFileSync(fullPath, 'utf-8');
        const parsed = parseEnvContent(content);

        // 合并环境变量（后面的文件覆盖前面的）
        Object.assign(envVars, parsed);

        if (process.env.DEBUG) {
          console.log(`Loaded environment file: ${filePath}`);
        }
      } catch (error) {
        console.warn(`Failed to load environment file ${filePath}:`, error);
      }
    }
  }

  // 最后合并运行时环境变量（最高优先级）
  Object.assign(envVars, process.env);

  return envVars;
}

/**
 * 解析环境文件内容
 */
function parseEnvContent(content: string): RawEnvVars {
  const envVars: RawEnvVars = {};
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();

    // 跳过空行和注释
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    // 解析键值对
    const equalIndex = trimmed.indexOf('=');
    if (equalIndex === -1) {
      continue;
    }

    const key = trimmed.substring(0, equalIndex).trim();
    let value = trimmed.substring(equalIndex + 1).trim();

    // 移除引号
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    envVars[key] = value;
  }

  return envVars;
}

/**
 * 获取配置值
 */
function getConfigValue<T>(
  envVars: RawEnvVars,
  key: string,
  transformer: (value: string) => T,
  defaultValue?: T
): T {
  const value = envVars[key];

  if (value === undefined || value === '') {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Configuration key '${key}' is required but not set`);
  }

  try {
    return transformer(value);
  } catch (error) {
    throw new Error(`Failed to parse configuration key '${key}': ${error}`);
  }
}

/**
 * 构建安全配置
 */
function buildSecurityConfig(
  envVars: RawEnvVars,
  environment: Environment
): SecurityConfig {
  const defaults = defaultProviders.security(environment);

  return {
    JWT_SECRET: getConfigValue(
      envVars,
      CONFIG_KEY_MAPPING.security.JWT_SECRET,
      stringTransformer,
      defaults.JWT_SECRET
    ),
    DB_PASSWORD: getConfigValue(
      envVars,
      CONFIG_KEY_MAPPING.security.DB_PASSWORD,
      stringTransformer,
      defaults.DB_PASSWORD
    ),
    LLM_API_KEY: getConfigValue(
      envVars,
      CONFIG_KEY_MAPPING.security.LLM_API_KEY,
      stringTransformer,
      defaults.LLM_API_KEY
    ),
    API_KEY: getConfigValue(
      envVars,
      CONFIG_KEY_MAPPING.security.API_KEY,
      stringTransformer,
      defaults.API_KEY
    ),
    VITE_API_KEY: getConfigValue(
      envVars,
      CONFIG_KEY_MAPPING.security.VITE_API_KEY,
      stringTransformer,
      defaults.VITE_API_KEY
    ),
  };
}

/**
 * 构建环境配置
 */
function buildEnvironmentConfig(
  envVars: RawEnvVars,
  environment: Environment
): EnvironmentConfig {
  const defaults = defaultProviders.environment(environment);

  return {
    NODE_ENV: getConfigValue(
      envVars,
      CONFIG_KEY_MAPPING.environment.NODE_ENV,
      environmentTransformer,
      defaults.NODE_ENV
    ),
    DATABASE_URL: getConfigValue(
      envVars,
      CONFIG_KEY_MAPPING.environment.DATABASE_URL,
      stringTransformer,
      defaults.DATABASE_URL
    ),
    REDIS_URL: getConfigValue(
      envVars,
      CONFIG_KEY_MAPPING.environment.REDIS_URL,
      stringTransformer,
      defaults.REDIS_URL
    ),
    API_BASE_URL: getConfigValue(
      envVars,
      CONFIG_KEY_MAPPING.environment.API_BASE_URL,
      stringTransformer,
      defaults.API_BASE_URL
    ),
    WEB_BASE_URL: getConfigValue(
      envVars,
      CONFIG_KEY_MAPPING.environment.WEB_BASE_URL,
      stringTransformer,
      defaults.WEB_BASE_URL
    ),
    LOG_LEVEL: getConfigValue(
      envVars,
      CONFIG_KEY_MAPPING.environment.LOG_LEVEL,
      logLevelTransformer,
      defaults.LOG_LEVEL
    ),
    LOG_FORMAT: getConfigValue(
      envVars,
      CONFIG_KEY_MAPPING.environment.LOG_FORMAT,
      logFormatTransformer,
      defaults.LOG_FORMAT
    ),
    HOST: getConfigValue(
      envVars,
      CONFIG_KEY_MAPPING.environment.HOST,
      stringTransformer,
      defaults.HOST
    ),
    PORT: getConfigValue(
      envVars,
      CONFIG_KEY_MAPPING.environment.PORT,
      numberTransformer,
      defaults.PORT
    ),
    CORS_ORIGIN: getConfigValue(
      envVars,
      CONFIG_KEY_MAPPING.environment.CORS_ORIGIN,
      stringTransformer,
      defaults.CORS_ORIGIN
    ),
  };
}

/**
 * 构建业务配置
 */
function buildBusinessConfig(envVars: RawEnvVars): BusinessConfig {
  const defaults = defaultProviders.business();

  return {
    PAGINATION_LIMIT: getConfigValue(
      envVars,
      CONFIG_KEY_MAPPING.business.PAGINATION_LIMIT,
      numberTransformer,
      defaults.PAGINATION_LIMIT
    ),
    PAGINATION_MAX_LIMIT: getConfigValue(
      envVars,
      CONFIG_KEY_MAPPING.business.PAGINATION_MAX_LIMIT,
      numberTransformer,
      defaults.PAGINATION_MAX_LIMIT
    ),
    REQUEST_TIMEOUT: getConfigValue(
      envVars,
      CONFIG_KEY_MAPPING.business.REQUEST_TIMEOUT,
      numberTransformer,
      defaults.REQUEST_TIMEOUT
    ),
    UPLOAD_TIMEOUT: getConfigValue(
      envVars,
      CONFIG_KEY_MAPPING.business.UPLOAD_TIMEOUT,
      numberTransformer,
      defaults.UPLOAD_TIMEOUT
    ),
    MAX_RETRIES: getConfigValue(
      envVars,
      CONFIG_KEY_MAPPING.business.MAX_RETRIES,
      numberTransformer,
      defaults.MAX_RETRIES
    ),
    RETRY_DELAY: getConfigValue(
      envVars,
      CONFIG_KEY_MAPPING.business.RETRY_DELAY,
      numberTransformer,
      defaults.RETRY_DELAY
    ),
    CACHE_TTL: getConfigValue(
      envVars,
      CONFIG_KEY_MAPPING.business.CACHE_TTL,
      numberTransformer,
      defaults.CACHE_TTL
    ),
    CACHE_MAX_SIZE: getConfigValue(
      envVars,
      CONFIG_KEY_MAPPING.business.CACHE_MAX_SIZE,
      numberTransformer,
      defaults.CACHE_MAX_SIZE
    ),
    FEATURE_FLAGS: {
      REGISTRATION: getConfigValue(
        envVars,
        CONFIG_KEY_MAPPING.business.FEATURE_REGISTRATION,
        booleanTransformer,
        defaults.FEATURE_FLAGS?.REGISTRATION
      ),
      EMAIL_VERIFICATION: getConfigValue(
        envVars,
        CONFIG_KEY_MAPPING.business.FEATURE_EMAIL_VERIFICATION,
        booleanTransformer,
        defaults.FEATURE_FLAGS?.EMAIL_VERIFICATION
      ),
      TWO_FACTOR_AUTH: getConfigValue(
        envVars,
        CONFIG_KEY_MAPPING.business.FEATURE_2FA,
        booleanTransformer,
        defaults.FEATURE_FLAGS?.TWO_FACTOR_AUTH
      ),
    },
  };
}

/**
 * 构建开发配置
 */
function buildDevelopmentConfig(
  envVars: RawEnvVars,
  environment: Environment
): DevelopmentConfig {
  const defaults = defaultProviders.development(environment);

  return {
    DEBUG: getConfigValue(
      envVars,
      CONFIG_KEY_MAPPING.development.DEBUG,
      booleanTransformer,
      defaults.DEBUG
    ),
    VERBOSE_LOGGING: getConfigValue(
      envVars,
      CONFIG_KEY_MAPPING.development.VERBOSE_LOGGING,
      booleanTransformer,
      defaults.VERBOSE_LOGGING
    ),
    MOCK_API: getConfigValue(
      envVars,
      CONFIG_KEY_MAPPING.development.MOCK_API,
      booleanTransformer,
      defaults.MOCK_API
    ),
    SEED_DATA: getConfigValue(
      envVars,
      CONFIG_KEY_MAPPING.development.SEED_DATA,
      booleanTransformer,
      defaults.SEED_DATA
    ),
    HOT_RELOAD: getConfigValue(
      envVars,
      CONFIG_KEY_MAPPING.development.HOT_RELOAD,
      booleanTransformer,
      defaults.HOT_RELOAD
    ),
    TEST_DATABASE_URL: getConfigValue(
      envVars,
      CONFIG_KEY_MAPPING.development.TEST_DATABASE_URL,
      stringTransformer,
      defaults.TEST_DATABASE_URL
    ),
    TEST_REDIS_URL: getConfigValue(
      envVars,
      CONFIG_KEY_MAPPING.development.TEST_REDIS_URL,
      stringTransformer,
      defaults.TEST_REDIS_URL
    ),
  };
}

/**
 * 构建 LLM 配置
 */
function buildLLMConfig(envVars: RawEnvVars): LLMConfig {
  const defaults = defaultProviders.llm();

  return {
    DEFAULT_PROVIDER: getConfigValue(
      envVars,
      CONFIG_KEY_MAPPING.llm.DEFAULT_PROVIDER,
      stringTransformer,
      defaults.DEFAULT_PROVIDER
    ),
    DEFAULT_MODEL: getConfigValue(
      envVars,
      CONFIG_KEY_MAPPING.llm.DEFAULT_MODEL,
      stringTransformer,
      defaults.DEFAULT_MODEL
    ),
    BASE_URL: getConfigValue(
      envVars,
      CONFIG_KEY_MAPPING.llm.BASE_URL,
      stringTransformer,
      defaults.BASE_URL
    ),
    TIMEOUT: getConfigValue(
      envVars,
      CONFIG_KEY_MAPPING.llm.TIMEOUT,
      numberTransformer,
      defaults.TIMEOUT
    ),
    MAX_RETRIES: getConfigValue(
      envVars,
      CONFIG_KEY_MAPPING.llm.MAX_RETRIES,
      numberTransformer,
      defaults.MAX_RETRIES
    ),
    TEMPERATURE: getConfigValue(
      envVars,
      CONFIG_KEY_MAPPING.llm.TEMPERATURE,
      floatTransformer,
      defaults.TEMPERATURE
    ),
    MAX_TOKENS: getConfigValue(
      envVars,
      CONFIG_KEY_MAPPING.llm.MAX_TOKENS,
      numberTransformer,
      defaults.MAX_TOKENS
    ),
    TOP_P: getConfigValue(
      envVars,
      CONFIG_KEY_MAPPING.llm.TOP_P,
      floatTransformer,
      defaults.TOP_P
    ),
    FREQUENCY_PENALTY: getConfigValue(
      envVars,
      CONFIG_KEY_MAPPING.llm.FREQUENCY_PENALTY,
      floatTransformer,
      defaults.FREQUENCY_PENALTY
    ),
    PRESENCE_PENALTY: getConfigValue(
      envVars,
      CONFIG_KEY_MAPPING.llm.PRESENCE_PENALTY,
      floatTransformer,
      defaults.PRESENCE_PENALTY
    ),
  };
}

/**
 * 构建应用配置
 */
function buildAppConfig(
  envVars: RawEnvVars,
  environment: Environment
): AppConfig {
  const defaults = defaultProviders.app(environment);

  return {
    TITLE: getConfigValue(
      envVars,
      CONFIG_KEY_MAPPING.app.TITLE,
      stringTransformer,
      defaults.TITLE
    ),
    VERSION: getConfigValue(
      envVars,
      CONFIG_KEY_MAPPING.app.VERSION,
      stringTransformer,
      defaults.VERSION
    ),
    DESCRIPTION: getConfigValue(
      envVars,
      CONFIG_KEY_MAPPING.app.DESCRIPTION,
      stringTransformer,
      defaults.DESCRIPTION
    ),
    JWT_EXPIRES_IN: getConfigValue(
      envVars,
      CONFIG_KEY_MAPPING.app.JWT_EXPIRES_IN,
      stringTransformer,
      defaults.JWT_EXPIRES_IN
    ),
  };
}

/**
 * 加载配置
 */
export function loadConfig(options: EnvLoadOptions = {}): Config {
  const {
    environment = detectEnvironment(),
    validate = true,
    allowMissingRequired = false,
    envPath,
    debug = false,
  } = options;

  if (debug) {
    console.log(`Loading configuration for environment: ${environment}`);
  }

  try {
    // 加载环境变量
    const envVars = loadEnvFiles(environment, envPath);

    if (debug) {
      console.log(
        `Loaded ${Object.keys(envVars).length} environment variables`
      );
    }

    // 构建配置对象
    const config: Config = {
      security: buildSecurityConfig(envVars, environment),
      environment: buildEnvironmentConfig(envVars, environment),
      business: buildBusinessConfig(envVars),
      development: buildDevelopmentConfig(envVars, environment),
      llm: buildLLMConfig(envVars),
      app: buildAppConfig(envVars, environment),
    };

    // 验证配置
    if (validate) {
      const validation = validateConfig(config, environment);

      if (!validation.valid) {
        const errorMessages = validation.errors
          .map(error => `${error.key}: ${error.message}`)
          .join('\n');

        if (allowMissingRequired) {
          console.warn('Configuration validation warnings:', errorMessages);
        } else {
          throw new Error(`Configuration validation failed:\n${errorMessages}`);
        }
      }

      if (validation.warnings.length > 0) {
        console.warn('Configuration warnings:', validation.warnings.join('\n'));
      }
    }

    return config;
  } catch (error) {
    throw new Error(`Failed to load configuration: ${error}`);
  }
}

/**
 * 验证必需的环境变量
 */
export function validateRequiredEnvVars(environment: Environment): void {
  const requiredVars = ['JWT_SECRET', 'DB_PASSWORD', 'LLM_API_KEY'];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(`缺少必需的环境变量: ${missingVars.join(', ')}`);
  }

  // 生产环境特殊验证
  if (environment === 'production') {
    const sensitiveVars = ['JWT_SECRET', 'DB_PASSWORD', 'LLM_API_KEY'];
    const placeholderVars = sensitiveVars.filter(varName => {
      const value = process.env[varName];
      return (
        value && (value.includes('placeholder') || value.includes('your_'))
      );
    });

    if (placeholderVars.length > 0) {
      throw new Error(
        `生产环境不允许使用占位符: ${placeholderVars.join(', ')}`
      );
    }
  }
}

/**
 * 获取配置摘要
 */
export function getConfigSummary(
  config: Config,
  includeSensitive = false
): any {
  const summary: any = {
    environment: {
      NODE_ENV: config.environment.NODE_ENV,
      PORT: config.environment.PORT,
      HOST: config.environment.HOST,
    },
    database: {
      URL: config.environment.DATABASE_URL.replace(/\/\/.*@/, '//***:***@'),
      HOST: new URL(config.environment.DATABASE_URL).hostname,
      PORT: parseInt(new URL(config.environment.DATABASE_URL).port) || 5432,
      NAME: new URL(config.environment.DATABASE_URL).pathname.slice(1),
    },
    redis: {
      URL: config.environment.REDIS_URL.replace(/\/\/.*@/, '//***:***@'),
      HOST: new URL(config.environment.REDIS_URL).hostname,
      PORT: parseInt(new URL(config.environment.REDIS_URL).port) || 6379,
    },
    features: config.business.FEATURE_FLAGS,
    security: includeSensitive
      ? config.security
      : {
          JWT_SECRET: config.security.JWT_SECRET.substring(0, 8) + '...',
          DB_PASSWORD: '***',
          LLM_API_KEY: config.security.LLM_API_KEY.substring(0, 8) + '...',
        },
  };

  return summary;
}

// 导出默认配置实例
let _config: Config | null = null;

/**
 * 获取配置实例（单例模式）
 */
export function getConfig(): Config {
  if (!_config) {
    _config = loadConfig();
  }
  return _config;
}

/**
 * 重置配置实例
 */
export function resetConfig(): void {
  _config = null;
}

export default getConfig;
