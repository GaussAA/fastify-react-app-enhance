/**
 * 配置架构和验证
 * 定义配置的运行时验证规则和类型转换
 */

import {
  Environment,
  Config,
  SecurityConfig,
  EnvironmentConfig,
  BusinessConfig,
  DevelopmentConfig,
  LLMConfig,
  AppConfig,
  ConfigValidationError,
  ConfigValidationResult,
  TypeGuard,
  ConfigTransformer,
  ConfigValidator,
  // ConfigDefaultProvider,
} from './types.js';

/**
 * 环境类型守卫
 */
export const isEnvironment: TypeGuard<Environment> = (
  value: unknown
): value is Environment => {
  return (
    typeof value === 'string' &&
    ['development', 'production', 'staging', 'test', 'ci'].includes(value)
  );
};

/**
 * 日志级别类型守卫
 */
export const isLogLevel: TypeGuard<'debug' | 'info' | 'warn' | 'error'> = (
  value: unknown
): value is 'debug' | 'info' | 'warn' | 'error' => {
  return (
    typeof value === 'string' &&
    ['debug', 'info', 'warn', 'error'].includes(value)
  );
};

/**
 * 日志格式类型守卫
 */
export const isLogFormat: TypeGuard<'json' | 'pretty' | 'simple'> = (
  value: unknown
): value is 'json' | 'pretty' | 'simple' => {
  return (
    typeof value === 'string' && ['json', 'pretty', 'simple'].includes(value)
  );
};

/**
 * 字符串转换器
 */
export const stringTransformer: ConfigTransformer<string> = (value: string) =>
  value.trim();

/**
 * 数字转换器
 */
export const numberTransformer: ConfigTransformer<number> = (value: string) => {
  const num = parseInt(value, 10);
  if (isNaN(num)) {
    throw new Error(`Invalid number: ${value}`);
  }
  return num;
};

/**
 * 浮点数转换器
 */
export const floatTransformer: ConfigTransformer<number> = (value: string) => {
  const num = parseFloat(value);
  if (isNaN(num)) {
    throw new Error(`Invalid float: ${value}`);
  }
  return num;
};

/**
 * 布尔值转换器
 */
export const booleanTransformer: ConfigTransformer<boolean> = (
  value: string
) => {
  const lower = value.toLowerCase();
  if (['true', '1', 'yes', 'on'].includes(lower)) {
    return true;
  }
  if (['false', '0', 'no', 'off'].includes(lower)) {
    return false;
  }
  throw new Error(`Invalid boolean: ${value}`);
};

/**
 * 环境转换器
 */
export const environmentTransformer: ConfigTransformer<Environment> = (
  value: string
) => {
  if (!isEnvironment(value)) {
    throw new Error(`Invalid environment: ${value}`);
  }
  return value;
};

/**
 * 日志级别转换器
 */
export const logLevelTransformer: ConfigTransformer<
  'debug' | 'info' | 'warn' | 'error'
> = (value: string) => {
  if (!isLogLevel(value)) {
    throw new Error(`Invalid log level: ${value}`);
  }
  return value;
};

/**
 * 日志格式转换器
 */
export const logFormatTransformer: ConfigTransformer<
  'json' | 'pretty' | 'simple'
> = (value: string) => {
  if (!isLogFormat(value)) {
    throw new Error(`Invalid log format: ${value}`);
  }
  return value;
};

/**
 * 端口验证器
 */
export const portValidator: ConfigValidator<number> = (value: number) => {
  return Number.isInteger(value) && value > 0 && value <= 65535;
};

/**
 * 超时验证器
 */
export const timeoutValidator: ConfigValidator<number> = (value: number) => {
  return Number.isInteger(value) && value > 0 && value <= 300000; // 5分钟
};

/**
 * 重试次数验证器
 */
export const retryValidator: ConfigValidator<number> = (value: number) => {
  return Number.isInteger(value) && value >= 0 && value <= 10;
};

/**
 * 温度参数验证器
 */
export const temperatureValidator: ConfigValidator<number> = (
  value: number
) => {
  return value >= 0 && value <= 2;
};

/**
 * Top P 参数验证器
 */
export const topPValidator: ConfigValidator<number> = (value: number) => {
  return value >= 0 && value <= 1;
};

/**
 * 惩罚参数验证器
 */
export const penaltyValidator: ConfigValidator<number> = (value: number) => {
  return value >= -2 && value <= 2;
};

/**
 * URL 验证器
 */
export const urlValidator: ConfigValidator<string> = (value: string) => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

/**
 * 数据库 URL 验证器
 */
export const databaseUrlValidator: ConfigValidator<string> = (
  value: string
) => {
  return value.startsWith('postgresql://') || value.startsWith('postgres://');
};

/**
 * Redis URL 验证器
 */
export const redisUrlValidator: ConfigValidator<string> = (value: string) => {
  return value.startsWith('redis://') || value.startsWith('rediss://');
};

/**
 * JWT 密钥验证器
 */
export const jwtSecretValidator: ConfigValidator<string> = (value: string) => {
  return (
    value.length >= 32 &&
    !value.includes('placeholder') &&
    !value.includes('your_')
  );
};

/**
 * 密码验证器
 */
export const passwordValidator: ConfigValidator<string> = (value: string) => {
  return (
    value.length >= 8 &&
    !value.includes('placeholder') &&
    !value.includes('your_')
  );
};

/**
 * API 密钥验证器
 */
export const apiKeyValidator: ConfigValidator<string> = (value: string) => {
  return (
    value.length >= 16 &&
    !value.includes('placeholder') &&
    !value.includes('your_')
  );
};

/**
 * 配置默认值提供器
 */
export const defaultProviders = {
  /**
   * 安全配置默认值（生产环境不允许默认值）
   */
  security: (environment: Environment): Partial<SecurityConfig> => {
    if (environment === 'production') {
      return {}; // 生产环境不允许默认值
    }
    return {
      JWT_SECRET: 'dev_jwt_secret_key_12345',
      DB_PASSWORD: 'dev_password_123',
      LLM_API_KEY: 'dev_llm_api_key_placeholder',
      API_KEY: 'dev_api_key_placeholder',
      VITE_API_KEY: 'dev_frontend_api_key_placeholder',
    };
  },

  /**
   * 环境配置默认值
   */
  environment: (environment: Environment): Partial<EnvironmentConfig> => {
    const baseConfig = {
      HOST: '0.0.0.0',
      LOG_FORMAT: 'json' as const,
      CORS_ORIGIN: 'http://localhost:5173',
    };

    switch (environment) {
      case 'development':
        return {
          ...baseConfig,
          NODE_ENV: 'development',
          DATABASE_URL:
            'postgresql://postgres:dev_password_123@localhost:15432/fastify_react_app',
          REDIS_URL: 'redis://localhost:6379',
          API_BASE_URL: 'http://localhost:8001',
          WEB_BASE_URL: 'http://localhost:5173',
          LOG_LEVEL: 'debug',
          PORT: 8001,
        };
      case 'production':
        return {
          ...baseConfig,
          NODE_ENV: 'production',
          LOG_LEVEL: 'warn',
          PORT: 8001,
        };
      case 'staging':
        return {
          ...baseConfig,
          NODE_ENV: 'staging',
          LOG_LEVEL: 'info',
          PORT: 8001,
        };
      case 'test':
        return {
          ...baseConfig,
          NODE_ENV: 'test',
          DATABASE_URL:
            'postgresql://postgres:test_password_123@localhost:15433/fastify_react_app_test',
          REDIS_URL: 'redis://localhost:6380',
          API_BASE_URL: 'http://localhost:8002',
          WEB_BASE_URL: 'http://localhost:5174',
          LOG_LEVEL: 'error',
          PORT: 8002,
          CORS_ORIGIN: 'http://localhost:5174',
        };
      case 'ci':
        return {
          ...baseConfig,
          NODE_ENV: 'ci',
          LOG_LEVEL: 'warn',
          PORT: 8001,
        };
      default:
        return baseConfig;
    }
  },

  /**
   * 业务配置默认值
   */
  business: (): Partial<BusinessConfig> => ({
    PAGINATION_LIMIT: 20,
    PAGINATION_MAX_LIMIT: 100,
    REQUEST_TIMEOUT: 30000,
    UPLOAD_TIMEOUT: 300000,
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
    CACHE_TTL: 3600,
    CACHE_MAX_SIZE: 1000,
    FEATURE_FLAGS: {
      REGISTRATION: true,
      EMAIL_VERIFICATION: false,
      TWO_FACTOR_AUTH: false,
    },
  }),

  /**
   * 开发配置默认值
   */
  development: (environment: Environment): Partial<DevelopmentConfig> => {
    const isDev = environment === 'development';
    const isTest = environment === 'test';

    return {
      DEBUG: isDev,
      VERBOSE_LOGGING: isDev,
      MOCK_API: isTest,
      SEED_DATA: isDev || isTest,
      HOT_RELOAD: isDev,
      TEST_DATABASE_URL:
        'postgresql://postgres:test_password@localhost:15433/fastify_react_app_test',
      TEST_REDIS_URL: 'redis://localhost:6380',
    };
  },

  /**
   * LLM 配置默认值
   */
  llm: (): Partial<LLMConfig> => ({
    DEFAULT_PROVIDER: 'deepseek',
    DEFAULT_MODEL: 'deepseek-chat',
    BASE_URL: 'https://api.deepseek.com/v1',
    TIMEOUT: 30000,
    MAX_RETRIES: 3,
    TEMPERATURE: 0.7,
    MAX_TOKENS: 2000,
    TOP_P: 1.0,
    FREQUENCY_PENALTY: 0.0,
    PRESENCE_PENALTY: 0.0,
  }),

  /**
   * 应用配置默认值
   */
  app: (environment: Environment): Partial<AppConfig> => ({
    TITLE: `Fastify React App${environment !== 'production' ? ` (${environment})` : ''}`,
    VERSION: `1.0.0${environment !== 'production' ? `-${environment}` : ''}`,
    DESCRIPTION: '现代化全栈应用',
    JWT_EXPIRES_IN:
      environment === 'test' ? '1h' : environment === 'ci' ? '30m' : '7d',
  }),
};

/**
 * 配置验证规则
 */
export const validationRules = {
  security: {
    JWT_SECRET: { validator: jwtSecretValidator, required: true },
    DB_PASSWORD: { validator: passwordValidator, required: true },
    LLM_API_KEY: { validator: apiKeyValidator, required: true },
    API_KEY: { validator: apiKeyValidator, required: false },
    VITE_API_KEY: { validator: apiKeyValidator, required: false },
  },
  environment: {
    NODE_ENV: { validator: isEnvironment, required: true },
    DATABASE_URL: { validator: databaseUrlValidator, required: true },
    REDIS_URL: { validator: redisUrlValidator, required: true },
    API_BASE_URL: { validator: urlValidator, required: true },
    WEB_BASE_URL: { validator: urlValidator, required: true },
    LOG_LEVEL: { validator: isLogLevel, required: true },
    LOG_FORMAT: { validator: isLogFormat, required: true },
    HOST: { validator: (v: string) => v.length > 0, required: true },
    PORT: { validator: portValidator, required: true },
    CORS_ORIGIN: { validator: urlValidator, required: true },
  },
  business: {
    PAGINATION_LIMIT: {
      validator: (v: number) => v > 0 && v <= 1000,
      required: true,
    },
    PAGINATION_MAX_LIMIT: {
      validator: (v: number) => v > 0 && v <= 1000,
      required: true,
    },
    REQUEST_TIMEOUT: { validator: timeoutValidator, required: true },
    UPLOAD_TIMEOUT: { validator: timeoutValidator, required: true },
    MAX_RETRIES: { validator: retryValidator, required: true },
    RETRY_DELAY: { validator: timeoutValidator, required: true },
    CACHE_TTL: { validator: (v: number) => v > 0, required: true },
    CACHE_MAX_SIZE: { validator: (v: number) => v > 0, required: true },
  },
  llm: {
    TIMEOUT: { validator: timeoutValidator, required: true },
    MAX_RETRIES: { validator: retryValidator, required: true },
    TEMPERATURE: { validator: temperatureValidator, required: true },
    MAX_TOKENS: {
      validator: (v: number) => v > 0 && v <= 10000,
      required: true,
    },
    TOP_P: { validator: topPValidator, required: true },
    FREQUENCY_PENALTY: { validator: penaltyValidator, required: true },
    PRESENCE_PENALTY: { validator: penaltyValidator, required: true },
  },
};

/**
 * 创建配置验证错误
 */
export function createValidationError(
  key: string,
  type: ConfigValidationError['type'],
  message: string,
  expected?: string,
  actual?: string
): ConfigValidationError {
  return { key, type, message, expected, actual };
}

/**
 * 验证配置对象
 */
export function validateConfig(
  config: Partial<Config>,
  environment: Environment
): ConfigValidationResult {
  const errors: ConfigValidationError[] = [];
  const warnings: string[] = [];

  // 验证安全配置
  if (config.security) {
    for (const [key, rule] of Object.entries(validationRules.security)) {
      const value = config.security[key as keyof SecurityConfig];

      if (rule.required && (!value || value === '')) {
        errors.push(
          createValidationError(
            `security.${key}`,
            'missing',
            `Required security configuration '${key}' is missing`,
            'non-empty string'
          )
        );
      } else if (value && !rule.validator(value)) {
        errors.push(
          createValidationError(
            `security.${key}`,
            'invalid_value',
            `Invalid value for security configuration '${key}'`,
            'valid value',
            value
          )
        );
      }
    }
  }

  // 验证环境配置
  if (config.environment) {
    for (const [key, rule] of Object.entries(validationRules.environment)) {
      const value = config.environment[key as keyof EnvironmentConfig];

      if (rule.required && (!value || value === '')) {
        errors.push(
          createValidationError(
            `environment.${key}`,
            'missing',
            `Required environment configuration '${key}' is missing`,
            'valid value'
          )
        );
      } else if (value && !(rule.validator as any)(value)) {
        errors.push(
          createValidationError(
            `environment.${key}`,
            'invalid_value',
            `Invalid value for environment configuration '${key}'`,
            'valid value',
            String(value)
          )
        );
      }
    }
  }

  // 验证业务配置
  if (config.business) {
    for (const [key, rule] of Object.entries(validationRules.business)) {
      const value = config.business[key as keyof BusinessConfig];

      if (rule.required && (value === undefined || value === null)) {
        errors.push(
          createValidationError(
            `business.${key}`,
            'missing',
            `Required business configuration '${key}' is missing`,
            'valid value'
          )
        );
      } else if (
        value !== undefined &&
        value !== null &&
        !(rule.validator as any)(value)
      ) {
        errors.push(
          createValidationError(
            `business.${key}`,
            'invalid_value',
            `Invalid value for business configuration '${key}'`,
            'valid value',
            String(value)
          )
        );
      }
    }
  }

  // 验证 LLM 配置
  if (config.llm) {
    for (const [key, rule] of Object.entries(validationRules.llm)) {
      const value = config.llm[key as keyof LLMConfig];

      if (rule.required && (value === undefined || value === null)) {
        errors.push(
          createValidationError(
            `llm.${key}`,
            'missing',
            `Required LLM configuration '${key}' is missing`,
            'valid value'
          )
        );
      } else if (
        value !== undefined &&
        value !== null &&
        !(rule.validator as any)(value)
      ) {
        errors.push(
          createValidationError(
            `llm.${key}`,
            'invalid_value',
            `Invalid value for LLM configuration '${key}'`,
            'valid value',
            String(value)
          )
        );
      }
    }
  }

  // 生产环境特殊验证
  if (environment === 'production') {
    if (
      !config.security?.JWT_SECRET ||
      config.security.JWT_SECRET.includes('placeholder')
    ) {
      errors.push(
        createValidationError(
          'security.JWT_SECRET',
          'invalid_value',
          'Production environment requires a real JWT secret, not a placeholder',
          'real JWT secret'
        )
      );
    }

    if (
      !config.security?.DB_PASSWORD ||
      config.security.DB_PASSWORD.includes('placeholder')
    ) {
      errors.push(
        createValidationError(
          'security.DB_PASSWORD',
          'invalid_value',
          'Production environment requires a real database password, not a placeholder',
          'real database password'
        )
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
