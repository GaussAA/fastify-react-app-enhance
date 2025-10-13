/**
 * 环境管理系统类型定义
 * 定义所有配置相关的 TypeScript 类型和接口
 */

/**
 * 支持的环境类型
 */
export type Environment = 'development' | 'production' | 'staging' | 'test' | 'ci';

/**
 * 配置分类类型
 */
export type ConfigCategory = 'A' | 'B' | 'C' | 'D';

/**
 * A类 - 安全敏感配置
 * 包含敏感信息，必须运行时提供，无默认值
 */
export interface SecurityConfig {
    /** JWT 密钥 */
    JWT_SECRET: string;
    /** 数据库密码 */
    DB_PASSWORD: string;
    /** LLM API 密钥 */
    LLM_API_KEY: string;
    /** 通用 API 密钥 */
    API_KEY: string;
    /** 前端 API 密钥 */
    VITE_API_KEY: string;
}

/**
 * B类 - 环境特定配置
 * 各环境不同，有安全默认值
 */
export interface EnvironmentConfig {
    /** 环境标识 */
    NODE_ENV: Environment;
    /** 数据库连接字符串 */
    DATABASE_URL: string;
    /** Redis 连接字符串 */
    REDIS_URL: string;
    /** API 基础 URL */
    API_BASE_URL: string;
    /** Web 基础 URL */
    WEB_BASE_URL: string;
    /** 日志级别 */
    LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
    /** 日志格式 */
    LOG_FORMAT: 'json' | 'pretty' | 'simple';
    /** 服务器主机 */
    HOST: string;
    /** 服务器端口 */
    PORT: number;
    /** CORS 来源 */
    CORS_ORIGIN: string;
}

/**
 * C类 - 共享业务配置
 * 跨环境共享，有合理默认值
 */
export interface BusinessConfig {
    /** 分页限制 */
    PAGINATION_LIMIT: number;
    /** 分页最大限制 */
    PAGINATION_MAX_LIMIT: number;
    /** 请求超时时间（毫秒） */
    REQUEST_TIMEOUT: number;
    /** 上传超时时间（毫秒） */
    UPLOAD_TIMEOUT: number;
    /** 最大重试次数 */
    MAX_RETRIES: number;
    /** 重试延迟（毫秒） */
    RETRY_DELAY: number;
    /** 缓存 TTL（秒） */
    CACHE_TTL: number;
    /** 缓存最大大小 */
    CACHE_MAX_SIZE: number;
    /** 功能开关 */
    FEATURE_FLAGS: {
        REGISTRATION: boolean;
        EMAIL_VERIFICATION: boolean;
        TWO_FACTOR_AUTH: boolean;
    };
}

/**
 * D类 - 开发工具配置
 * 纯本地使用，开发调试相关
 */
export interface DevelopmentConfig {
    /** 调试模式 */
    DEBUG: boolean;
    /** 详细日志 */
    VERBOSE_LOGGING: boolean;
    /** 模拟 API */
    MOCK_API: boolean;
    /** 种子数据 */
    SEED_DATA: boolean;
    /** 热重载 */
    HOT_RELOAD: boolean;
    /** 测试数据库 URL */
    TEST_DATABASE_URL: string;
    /** 测试 Redis URL */
    TEST_REDIS_URL: string;
}

/**
 * LLM 配置
 */
export interface LLMConfig {
    /** 默认提供商 */
    DEFAULT_PROVIDER: string;
    /** 默认模型 */
    DEFAULT_MODEL: string;
    /** 基础 URL */
    BASE_URL: string;
    /** 超时时间（毫秒） */
    TIMEOUT: number;
    /** 最大重试次数 */
    MAX_RETRIES: number;
    /** 温度参数 */
    TEMPERATURE: number;
    /** 最大令牌数 */
    MAX_TOKENS: number;
    /** Top P 参数 */
    TOP_P: number;
    /** 频率惩罚 */
    FREQUENCY_PENALTY: number;
    /** 存在惩罚 */
    PRESENCE_PENALTY: number;
}

/**
 * 应用配置
 */
export interface AppConfig {
    /** 应用标题 */
    TITLE: string;
    /** 应用版本 */
    VERSION: string;
    /** 应用描述 */
    DESCRIPTION: string;
    /** JWT 过期时间 */
    JWT_EXPIRES_IN: string;
}

/**
 * 完整的配置对象
 */
export interface Config {
    /** A类 - 安全敏感配置 */
    security: SecurityConfig;
    /** B类 - 环境特定配置 */
    environment: EnvironmentConfig;
    /** C类 - 共享业务配置 */
    business: BusinessConfig;
    /** D类 - 开发工具配置 */
    development: DevelopmentConfig;
    /** LLM 配置 */
    llm: LLMConfig;
    /** 应用配置 */
    app: AppConfig;
}

/**
 * 环境变量原始值类型
 */
export interface RawEnvVars {
    [key: string]: string | undefined;
}

/**
 * 配置验证错误
 */
export interface ConfigValidationError {
    /** 配置键 */
    key: string;
    /** 错误类型 */
    type: 'missing' | 'invalid_type' | 'invalid_value' | 'out_of_range';
    /** 错误消息 */
    message: string;
    /** 期望值 */
    expected?: string;
    /** 实际值 */
    actual?: string;
}

/**
 * 配置验证结果
 */
export interface ConfigValidationResult {
    /** 是否有效 */
    valid: boolean;
    /** 错误列表 */
    errors: ConfigValidationError[];
    /** 警告列表 */
    warnings: string[];
}

/**
 * 环境文件加载选项
 */
export interface EnvLoadOptions {
    /** 环境类型 */
    environment?: Environment;
    /** 是否验证配置 */
    validate?: boolean;
    /** 是否允许缺失的必需配置 */
    allowMissingRequired?: boolean;
    /** 自定义环境文件路径 */
    envPath?: string;
    /** 是否启用调试模式 */
    debug?: boolean;
}

/**
 * 配置摘要选项
 */
export interface ConfigSummaryOptions {
    /** 是否包含敏感信息 */
    includeSensitive?: boolean;
    /** 是否包含默认值 */
    includeDefaults?: boolean;
    /** 是否包含环境信息 */
    includeEnvironment?: boolean;
    /** 敏感信息掩码字符 */
    maskChar?: string;
}

/**
 * 配置摘要
 */
export interface ConfigSummary {
    /** 环境信息 */
    environment: {
        NODE_ENV: Environment;
        PORT: number;
        HOST: string;
    };
    /** 数据库配置摘要 */
    database: {
        URL: string;
        HOST: string;
        PORT: number;
        NAME: string;
    };
    /** Redis 配置摘要 */
    redis: {
        URL: string;
        HOST: string;
        PORT: number;
    };
    /** 功能开关 */
    features: {
        REGISTRATION: boolean;
        EMAIL_VERIFICATION: boolean;
        TWO_FACTOR_AUTH: boolean;
    };
    /** 安全配置摘要（掩码） */
    security: {
        JWT_SECRET: string;
        DB_PASSWORD: string;
        LLM_API_KEY: string;
    };
}

/**
 * 环境检测结果
 */
export interface EnvironmentDetection {
    /** 检测到的环境 */
    environment: Environment;
    /** 是否在生产环境 */
    isProduction: boolean;
    /** 是否在开发环境 */
    isDevelopment: boolean;
    /** 是否在测试环境 */
    isTest: boolean;
    /** 是否在 CI 环境 */
    isCI: boolean;
    /** 环境变量来源 */
    source: 'process.env' | 'env.file' | 'default';
}

/**
 * 配置合并选项
 */
export interface ConfigMergeOptions {
    /** 是否覆盖现有值 */
    overwrite?: boolean;
    /** 是否深度合并对象 */
    deep?: boolean;
    /** 是否验证合并后的配置 */
    validate?: boolean;
}

/**
 * 类型守卫函数类型
 */
export type TypeGuard<T> = (value: unknown) => value is T;

/**
 * 配置转换函数类型
 */
export type ConfigTransformer<T> = (value: string) => T;

/**
 * 配置验证函数类型
 */
export type ConfigValidator<T> = (value: T) => boolean;

/**
 * 配置默认值提供函数类型
 */
export type ConfigDefaultProvider<T> = (environment: Environment) => T;
