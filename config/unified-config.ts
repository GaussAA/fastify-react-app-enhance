/**
 * 统一配置管理器
 * 集中管理所有配置参数，避免重复定义
 */

import { z } from 'zod';

// 环境类型定义
export const EnvironmentSchema = z.enum([
  'development',
  'production',
  'staging',
  'test',
  'ci',
]);
export type Environment = z.infer<typeof EnvironmentSchema>;

// 日志级别定义
export const LogLevelSchema = z.enum([
  'error',
  'warn',
  'info',
  'debug',
  'verbose',
]);
export type LogLevel = z.infer<typeof LogLevelSchema>;

// 日志格式定义
export const LogFormatSchema = z.enum(['json', 'text', 'pretty']);
export type LogFormat = z.infer<typeof LogFormatSchema>;

// 数据库配置Schema
export const DatabaseConfigSchema = z.object({
  url: z.string().url(),
  host: z.string().default('localhost'),
  port: z.number().min(1).max(65535).default(5432),
  database: z.string(),
  username: z.string(),
  password: z.string(),
  ssl: z.boolean().default(false),
  maxConnections: z.number().min(1).default(10),
  connectionTimeout: z.number().min(1000).default(30000),
  queryTimeout: z.number().min(1000).default(30000),
});

// Redis配置Schema
export const RedisConfigSchema = z.object({
  url: z.string().url(),
  host: z.string().default('localhost'),
  port: z.number().min(1).max(65535).default(6379),
  password: z.string().optional(),
  db: z.number().min(0).max(15).default(0),
  maxRetriesPerRequest: z.number().min(1).default(3),
  retryDelayOnFailover: z.number().min(100).default(100),
  connectTimeout: z.number().min(1000).default(10000),
  commandTimeout: z.number().min(1000).default(5000),
});

// 服务器配置Schema
export const ServerConfigSchema = z.object({
  host: z.string().default('0.0.0.0'),
  port: z.number().min(1).max(65535).default(8001),
  cors: z.object({
    origin: z.union([z.string(), z.array(z.string())]).default('*'),
    credentials: z.boolean().default(true),
    methods: z
      .array(z.string())
      .default(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']),
    allowedHeaders: z
      .array(z.string())
      .default(['Content-Type', 'Authorization']),
  }),
  rateLimit: z.object({
    windowMs: z
      .number()
      .min(1000)
      .default(15 * 60 * 1000), // 15 minutes
    max: z.number().min(1).default(100),
    skipSuccessfulRequests: z.boolean().default(false),
  }),
  timeout: z.object({
    request: z.number().min(1000).default(30000),
    upload: z.number().min(1000).default(300000),
    download: z.number().min(1000).default(300000),
  }),
});

// JWT配置Schema
export const JWTConfigSchema = z.object({
  secret: z.string().min(32),
  expiresIn: z.string().default('24h'),
  refreshExpiresIn: z.string().default('7d'),
  issuer: z.string().default('fastify-react-app'),
  audience: z.string().default('fastify-react-app-users'),
  algorithm: z.enum(['HS256', 'HS384', 'HS512']).default('HS256'),
});

// 分页配置Schema
export const PaginationConfigSchema = z.object({
  defaultLimit: z.number().min(1).max(100).default(20),
  maxLimit: z.number().min(1).max(1000).default(100),
  defaultPage: z.number().min(1).default(1),
});

// 缓存配置Schema
export const CacheConfigSchema = z.object({
  ttl: z.number().min(1).default(3600), // 1 hour
  maxSize: z.number().min(1).default(1000),
  checkPeriod: z.number().min(1000).default(60000), // 1 minute
  useClones: z.boolean().default(false),
});

// 重试配置Schema
export const RetryConfigSchema = z.object({
  maxRetries: z.number().min(0).max(10).default(3),
  retryDelay: z.number().min(100).default(1000),
  backoffFactor: z.number().min(1).max(10).default(2),
  maxRetryDelay: z.number().min(1000).default(30000),
});

// LLM配置Schema
export const LLMConfigSchema = z.object({
  defaultProvider: z
    .enum(['deepseek', 'openai', 'anthropic', 'azure'])
    .default('deepseek'),
  defaultModel: z.string().default('deepseek-chat'),
  baseUrl: z.string().url().optional(),
  apiKey: z.string().min(1),
  timeout: z.number().min(1000).default(30000),
  maxRetries: z.number().min(0).max(5).default(3),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(1).max(100000).default(4000),
  topP: z.number().min(0).max(1).default(1),
  frequencyPenalty: z.number().min(-2).max(2).default(0),
  presencePenalty: z.number().min(-2).max(2).default(0),
});

// 功能开关Schema
export const FeatureFlagsSchema = z.object({
  registration: z.boolean().default(true),
  emailVerification: z.boolean().default(false),
  twoFactorAuth: z.boolean().default(false),
  passwordReset: z.boolean().default(true),
  userProfile: z.boolean().default(true),
  roleManagement: z.boolean().default(true),
  permissionManagement: z.boolean().default(true),
  auditLog: z.boolean().default(true),
  aiChat: z.boolean().default(true),
  fileUpload: z.boolean().default(true),
  apiDocumentation: z.boolean().default(true),
  metrics: z.boolean().default(true),
});

// 监控配置Schema
export const MonitoringConfigSchema = z.object({
  enabled: z.boolean().default(true),
  metrics: z.object({
    enabled: z.boolean().default(true),
    interval: z.number().min(1000).default(60000), // 1 minute
    retention: z.number().min(1).default(7), // 7 days
  }),
  healthCheck: z.object({
    enabled: z.boolean().default(true),
    interval: z.number().min(1000).default(30000), // 30 seconds
    timeout: z.number().min(1000).default(5000),
  }),
  alerts: z.object({
    enabled: z.boolean().default(false),
    webhook: z.string().url().optional(),
    email: z.string().email().optional(),
    slack: z.string().url().optional(),
  }),
});

// 安全配置Schema
export const SecurityConfigSchema = z.object({
  bcryptRounds: z.number().min(10).max(15).default(12),
  sessionSecret: z.string().min(32),
  csrfProtection: z.boolean().default(true),
  helmet: z.object({
    enabled: z.boolean().default(true),
    contentSecurityPolicy: z.boolean().default(true),
    hsts: z.boolean().default(true),
    noSniff: z.boolean().default(true),
    xssFilter: z.boolean().default(true),
  }),
  rateLimit: z.object({
    enabled: z.boolean().default(true),
    windowMs: z
      .number()
      .min(1000)
      .default(15 * 60 * 1000),
    max: z.number().min(1).default(100),
    skipSuccessfulRequests: z.boolean().default(false),
  }),
});

// 主配置Schema
export const ConfigSchema = z.object({
  environment: EnvironmentSchema,
  logLevel: LogLevelSchema,
  logFormat: LogFormatSchema,
  database: DatabaseConfigSchema,
  redis: RedisConfigSchema,
  server: ServerConfigSchema,
  jwt: JWTConfigSchema,
  pagination: PaginationConfigSchema,
  cache: CacheConfigSchema,
  retry: RetryConfigSchema,
  llm: LLMConfigSchema,
  features: FeatureFlagsSchema,
  monitoring: MonitoringConfigSchema,
  security: SecurityConfigSchema,
});

export type Config = z.infer<typeof ConfigSchema>;
export type DatabaseConfig = z.infer<typeof DatabaseConfigSchema>;
export type RedisConfig = z.infer<typeof RedisConfigSchema>;
export type ServerConfig = z.infer<typeof ServerConfigSchema>;
export type JWTConfig = z.infer<typeof JWTConfigSchema>;
export type PaginationConfig = z.infer<typeof PaginationConfigSchema>;
export type CacheConfig = z.infer<typeof CacheConfigSchema>;
export type RetryConfig = z.infer<typeof RetryConfigSchema>;
export type LLMConfig = z.infer<typeof LLMConfigSchema>;
export type FeatureFlags = z.infer<typeof FeatureFlagsSchema>;
export type MonitoringConfig = z.infer<typeof MonitoringConfigSchema>;
export type SecurityConfig = z.infer<typeof SecurityConfigSchema>;

/**
 * 配置管理器类
 */
export class ConfigManager {
  private static instance: ConfigManager;
  private config: Config | null = null;
  private validationErrors: string[] = [];

  private constructor() {}

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /**
   * 加载配置
   */
  public async loadConfig(): Promise<Config> {
    try {
      const rawConfig = await this.loadRawConfig();
      const validatedConfig = this.validateConfig(rawConfig);
      this.config = validatedConfig;
      return validatedConfig;
    } catch (error) {
      console.error('配置加载失败:', error);
      throw error;
    }
  }

  /**
   * 获取配置
   */
  public getConfig(): Config {
    if (!this.config) {
      throw new Error('配置未加载，请先调用 loadConfig()');
    }
    return this.config;
  }

  /**
   * 获取配置子项
   */
  public getDatabaseConfig(): DatabaseConfig {
    return this.getConfig().database;
  }

  public getRedisConfig(): RedisConfig {
    return this.getConfig().redis;
  }

  public getServerConfig(): ServerConfig {
    return this.getConfig().server;
  }

  public getJWTConfig(): JWTConfig {
    return this.getConfig().jwt;
  }

  public getPaginationConfig(): PaginationConfig {
    return this.getConfig().pagination;
  }

  public getCacheConfig(): CacheConfig {
    return this.getConfig().cache;
  }

  public getRetryConfig(): RetryConfig {
    return this.getConfig().retry;
  }

  public getLLMConfig(): LLMConfig {
    return this.getConfig().llm;
  }

  public getFeatureFlags(): FeatureFlags {
    return this.getConfig().features;
  }

  public getMonitoringConfig(): MonitoringConfig {
    return this.getConfig().monitoring;
  }

  public getSecurityConfig(): SecurityConfig {
    return this.getConfig().security;
  }

  /**
   * 检查功能是否启用
   */
  public isFeatureEnabled(feature: keyof FeatureFlags): boolean {
    return this.getFeatureFlags()[feature];
  }

  /**
   * 获取环境
   */
  public getEnvironment(): Environment {
    return this.getConfig().environment;
  }

  /**
   * 是否为开发环境
   */
  public isDevelopment(): boolean {
    return this.getEnvironment() === 'development';
  }

  /**
   * 是否为生产环境
   */
  public isProduction(): boolean {
    return this.getEnvironment() === 'production';
  }

  /**
   * 是否为测试环境
   */
  public isTest(): boolean {
    return this.getEnvironment() === 'test';
  }

  /**
   * 获取验证错误
   */
  public getValidationErrors(): string[] {
    return this.validationErrors;
  }

  /**
   * 重新加载配置
   */
  public async reloadConfig(): Promise<Config> {
    this.config = null;
    this.validationErrors = [];
    return this.loadConfig();
  }

  /**
   * 加载原始配置
   */
  private async loadRawConfig(): Promise<any> {
    // 这里应该从环境变量、配置文件等加载配置
    // 暂时返回默认配置
    return this.getDefaultConfig();
  }

  /**
   * 验证配置
   */
  private validateConfig(rawConfig: any): Config {
    try {
      return ConfigSchema.parse(rawConfig);
    } catch (error) {
      if (error instanceof z.ZodError) {
        this.validationErrors = error.errors.map(
          err => `${err.path.join('.')}: ${err.message}`
        );
        throw new Error(`配置验证失败: ${this.validationErrors.join(', ')}`);
      }
      throw error;
    }
  }

  /**
   * 获取默认配置
   */
  private getDefaultConfig(): any {
    return {
      environment: process.env.NODE_ENV || 'development',
      logLevel: process.env.LOG_LEVEL || 'info',
      logFormat: process.env.LOG_FORMAT || 'json',
      database: {
        url:
          process.env.DATABASE_URL ||
          'postgresql://postgres:password@localhost:5432/fastify_react_app',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'fastify_react_app',
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'password',
        ssl: process.env.DB_SSL === 'true',
        maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '10'),
        connectionTimeout: parseInt(
          process.env.DB_CONNECTION_TIMEOUT || '30000'
        ),
        queryTimeout: parseInt(process.env.DB_QUERY_TIMEOUT || '30000'),
      },
      redis: {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB || '0'),
        maxRetriesPerRequest: parseInt(process.env.REDIS_MAX_RETRIES || '3'),
        retryDelayOnFailover: parseInt(process.env.REDIS_RETRY_DELAY || '100'),
        connectTimeout: parseInt(process.env.REDIS_CONNECT_TIMEOUT || '10000'),
        commandTimeout: parseInt(process.env.REDIS_COMMAND_TIMEOUT || '5000'),
      },
      server: {
        host: process.env.HOST || '0.0.0.0',
        port: parseInt(process.env.PORT || '8001'),
        cors: {
          origin: process.env.CORS_ORIGIN || '*',
          credentials: process.env.CORS_CREDENTIALS === 'true',
          methods: (
            process.env.CORS_METHODS || 'GET,POST,PUT,DELETE,PATCH,OPTIONS'
          ).split(','),
          allowedHeaders: (
            process.env.CORS_ALLOWED_HEADERS || 'Content-Type,Authorization'
          ).split(','),
        },
        rateLimit: {
          windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
          max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
          skipSuccessfulRequests:
            process.env.RATE_LIMIT_SKIP_SUCCESS === 'true',
        },
        timeout: {
          request: parseInt(process.env.REQUEST_TIMEOUT || '30000'),
          upload: parseInt(process.env.UPLOAD_TIMEOUT || '300000'),
          download: parseInt(process.env.DOWNLOAD_TIMEOUT || '300000'),
        },
      },
      jwt: {
        secret:
          process.env.JWT_SECRET ||
          'your-super-secret-jwt-key-change-this-in-production',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
        issuer: process.env.JWT_ISSUER || 'fastify-react-app',
        audience: process.env.JWT_AUDIENCE || 'fastify-react-app-users',
        algorithm: process.env.JWT_ALGORITHM || 'HS256',
      },
      pagination: {
        defaultLimit: parseInt(process.env.PAGINATION_LIMIT || '20'),
        maxLimit: parseInt(process.env.PAGINATION_MAX_LIMIT || '100'),
        defaultPage: parseInt(process.env.PAGINATION_DEFAULT_PAGE || '1'),
      },
      cache: {
        ttl: parseInt(process.env.CACHE_TTL || '3600'),
        maxSize: parseInt(process.env.CACHE_MAX_SIZE || '1000'),
        checkPeriod: parseInt(process.env.CACHE_CHECK_PERIOD || '60000'),
        useClones: process.env.CACHE_USE_CLONES === 'true',
      },
      retry: {
        maxRetries: parseInt(process.env.MAX_RETRIES || '3'),
        retryDelay: parseInt(process.env.RETRY_DELAY || '1000'),
        backoffFactor: parseInt(process.env.RETRY_BACKOFF_FACTOR || '2'),
        maxRetryDelay: parseInt(process.env.MAX_RETRY_DELAY || '30000'),
      },
      llm: {
        defaultProvider: process.env.LLM_DEFAULT_PROVIDER || 'deepseek',
        defaultModel: process.env.LLM_DEFAULT_MODEL || 'deepseek-chat',
        baseUrl: process.env.LLM_BASE_URL,
        apiKey: process.env.LLM_API_KEY || '',
        timeout: parseInt(process.env.LLM_TIMEOUT || '30000'),
        maxRetries: parseInt(process.env.LLM_MAX_RETRIES || '3'),
        temperature: parseFloat(process.env.LLM_TEMPERATURE || '0.7'),
        maxTokens: parseInt(process.env.LLM_MAX_TOKENS || '4000'),
        topP: parseFloat(process.env.LLM_TOP_P || '1'),
        frequencyPenalty: parseFloat(process.env.LLM_FREQUENCY_PENALTY || '0'),
        presencePenalty: parseFloat(process.env.LLM_PRESENCE_PENALTY || '0'),
      },
      features: {
        registration: process.env.FEATURE_REGISTRATION === 'true',
        emailVerification: process.env.FEATURE_EMAIL_VERIFICATION === 'true',
        twoFactorAuth: process.env.FEATURE_2FA === 'true',
        passwordReset: process.env.FEATURE_PASSWORD_RESET === 'true',
        userProfile: process.env.FEATURE_USER_PROFILE === 'true',
        roleManagement: process.env.FEATURE_ROLE_MANAGEMENT === 'true',
        permissionManagement:
          process.env.FEATURE_PERMISSION_MANAGEMENT === 'true',
        auditLog: process.env.FEATURE_AUDIT_LOG === 'true',
        aiChat: process.env.FEATURE_AI_CHAT === 'true',
        fileUpload: process.env.FEATURE_FILE_UPLOAD === 'true',
        apiDocumentation: process.env.FEATURE_API_DOCS === 'true',
        metrics: process.env.FEATURE_METRICS === 'true',
      },
      monitoring: {
        enabled: process.env.MONITORING_ENABLED === 'true',
        metrics: {
          enabled: process.env.METRICS_ENABLED === 'true',
          interval: parseInt(process.env.METRICS_INTERVAL || '60000'),
          retention: parseInt(process.env.METRICS_RETENTION || '7'),
        },
        healthCheck: {
          enabled: process.env.HEALTH_CHECK_ENABLED === 'true',
          interval: parseInt(process.env.HEALTH_CHECK_INTERVAL || '30000'),
          timeout: parseInt(process.env.HEALTH_CHECK_TIMEOUT || '5000'),
        },
        alerts: {
          enabled: process.env.ALERTS_ENABLED === 'true',
          webhook: process.env.ALERT_WEBHOOK,
          email: process.env.ALERT_EMAIL,
          slack: process.env.ALERT_SLACK,
        },
      },
      security: {
        bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
        sessionSecret:
          process.env.SESSION_SECRET ||
          'your-super-secret-session-key-change-this-in-production',
        csrfProtection: process.env.CSRF_PROTECTION === 'true',
        helmet: {
          enabled: process.env.HELMET_ENABLED === 'true',
          contentSecurityPolicy: process.env.HELMET_CSP === 'true',
          hsts: process.env.HELMET_HSTS === 'true',
          noSniff: process.env.HELMET_NO_SNIFF === 'true',
          xssFilter: process.env.HELMET_XSS_FILTER === 'true',
        },
        rateLimit: {
          enabled: process.env.RATE_LIMIT_ENABLED === 'true',
          windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
          max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
          skipSuccessfulRequests:
            process.env.RATE_LIMIT_SKIP_SUCCESS === 'true',
        },
      },
    };
  }
}

// 导出单例实例
export const configManager = ConfigManager.getInstance();

// 导出便捷函数
export const getConfig = () => configManager.getConfig();
export const getDatabaseConfig = () => configManager.getDatabaseConfig();
export const getRedisConfig = () => configManager.getRedisConfig();
export const getServerConfig = () => configManager.getServerConfig();
export const getJWTConfig = () => configManager.getJWTConfig();
export const getPaginationConfig = () => configManager.getPaginationConfig();
export const getCacheConfig = () => configManager.getCacheConfig();
export const getRetryConfig = () => configManager.getRetryConfig();
export const getLLMConfig = () => configManager.getLLMConfig();
export const getFeatureFlags = () => configManager.getFeatureFlags();
export const getMonitoringConfig = () => configManager.getMonitoringConfig();
export const getSecurityConfig = () => configManager.getSecurityConfig();
export const isFeatureEnabled = (feature: keyof FeatureFlags) =>
  configManager.isFeatureEnabled(feature);
export const getEnvironment = () => configManager.getEnvironment();
export const isDevelopment = () => configManager.isDevelopment();
export const isProduction = () => configManager.isProduction();
export const isTest = () => configManager.isTest();
