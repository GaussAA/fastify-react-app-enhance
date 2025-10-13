/**
 * 配置工具函数
 * 提供环境检测、配置合并、敏感信息过滤等实用工具
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
import {
  Environment,
  Config,
  ConfigSummary,
  ConfigSummaryOptions,
  EnvironmentDetection,
  ConfigMergeOptions,
  RawEnvVars,
} from './types.js';
import { detectEnvironment, loadConfig, getConfigSummary } from './env.js';

/**
 * 环境检测工具
 */
export class EnvironmentDetector {
  /**
   * 检测当前环境
   */
  static detect(): EnvironmentDetection {
    const environment = detectEnvironment();

    return {
      environment,
      isProduction: environment === 'production',
      isDevelopment: environment === 'development',
      isTest: environment === 'test',
      isCI: environment === 'ci',
      source: this.getEnvironmentSource(),
    };
  }

  /**
   * 获取环境变量来源
   */
  private static getEnvironmentSource(): EnvironmentDetection['source'] {
    if (process.env.NODE_ENV) {
      return 'process.env';
    }

    // 检查是否存在环境文件
    const projectRoot = resolve(process.cwd());
    const envFiles = ['.env', '.env.local', '.env.development'];

    for (const envFile of envFiles) {
      if (existsSync(join(projectRoot, envFile))) {
        return 'env.file';
      }
    }

    return 'default';
  }

  /**
   * 检查是否在指定环境
   */
  static isEnvironment(env: Environment): boolean {
    return detectEnvironment() === env;
  }

  /**
   * 检查是否在生产环境
   */
  static isProduction(): boolean {
    return this.isEnvironment('production');
  }

  /**
   * 检查是否在开发环境
   */
  static isDevelopment(): boolean {
    return this.isEnvironment('development');
  }

  /**
   * 检查是否在测试环境
   */
  static isTest(): boolean {
    return this.isEnvironment('test');
  }

  /**
   * 检查是否在 CI 环境
   */
  static isCI(): boolean {
    return this.isEnvironment('ci');
  }
}

/**
 * 配置合并工具
 */
export class ConfigMerger {
  /**
   * 合并配置对象
   */
  static merge<T extends Record<string, any>>(
    target: T,
    source: Partial<T>,
    options: ConfigMergeOptions = {}
  ): T {
    const { overwrite = true, deep = true } = options;

    const result = { ...target };

    for (const [key, value] of Object.entries(source)) {
      if (value === undefined) {
        continue;
      }

      if (!overwrite && (result as any)[key] !== undefined) {
        continue;
      }

      if (
        deep &&
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value)
      ) {
        (result as any)[key] = this.merge(
          (result as any)[key] || {},
          value,
          options
        );
      } else {
        (result as any)[key] = value;
      }
    }

    return result;
  }

  /**
   * 深度合并配置
   */
  static deepMerge<T extends Record<string, any>>(
    target: T,
    ...sources: Partial<T>[]
  ): T {
    let result = { ...target };

    for (const source of sources) {
      result = this.merge(result, source, { deep: true, overwrite: true });
    }

    return result;
  }

  /**
   * 合并环境变量
   */
  static mergeEnvVars(
    target: RawEnvVars,
    ...sources: RawEnvVars[]
  ): RawEnvVars {
    const result = { ...target };

    for (const source of sources) {
      Object.assign(result, source);
    }

    return result;
  }
}

/**
 * 敏感信息过滤工具
 */
export class SensitiveDataFilter {
  /**
   * 敏感配置键列表
   */
  private static readonly SENSITIVE_KEYS = [
    'password',
    'secret',
    'key',
    'token',
    'auth',
    'credential',
    'private',
    'jwt',
    'api_key',
    'access_token',
    'refresh_token',
  ];

  /**
   * 检查键名是否包含敏感信息
   */
  static isSensitiveKey(key: string): boolean {
    const lowerKey = key.toLowerCase();
    return this.SENSITIVE_KEYS.some(sensitive => lowerKey.includes(sensitive));
  }

  /**
   * 过滤敏感信息
   */
  static filterSensitiveData<T extends Record<string, any>>(
    data: T,
    maskChar = '***'
  ): T {
    const result = { ...data };

    for (const [key, value] of Object.entries(result)) {
      if (this.isSensitiveKey(key)) {
        if (typeof value === 'string') {
          (result as any)[key] = this.maskString(value, maskChar);
        } else {
          (result as any)[key] = maskChar;
        }
      } else if (typeof value === 'object' && value !== null) {
        (result as any)[key] = this.filterSensitiveData(value, maskChar);
      }
    }

    return result;
  }

  /**
   * 掩码字符串
   */
  static maskString(value: string, maskChar = '***'): string {
    if (value.length <= 8) {
      return maskChar;
    }

    const start = value.substring(0, 4);
    const end = value.substring(value.length - 4);
    return `${start}${maskChar}${end}`;
  }

  /**
   * 创建配置摘要（过滤敏感信息）
   */
  static createConfigSummary(
    config: Config,
    options: ConfigSummaryOptions = {}
  ): ConfigSummary {
    const {
      includeSensitive = false,
      // includeDefaults = true,
      // includeEnvironment = true,
      maskChar = '***',
    } = options;

    const summary = getConfigSummary(config, includeSensitive);

    if (!includeSensitive) {
      return this.filterSensitiveData(summary, maskChar);
    }

    return summary;
  }
}

/**
 * 配置验证工具
 */
export class ConfigValidator {
  /**
   * 验证环境变量
   */
  static validateEnvVars(requiredVars: string[]): string[] {
    const missing: string[] = [];

    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        missing.push(varName);
      }
    }

    return missing;
  }

  /**
   * 验证配置完整性
   */
  static validateConfigCompleteness(config: Config): string[] {
    const issues: string[] = [];

    // 检查必需的安全配置
    if (
      !config.security.JWT_SECRET ||
      config.security.JWT_SECRET.includes('placeholder')
    ) {
      issues.push('JWT_SECRET is missing or contains placeholder');
    }

    if (
      !config.security.DB_PASSWORD ||
      config.security.DB_PASSWORD.includes('placeholder')
    ) {
      issues.push('DB_PASSWORD is missing or contains placeholder');
    }

    if (
      !config.security.LLM_API_KEY ||
      config.security.LLM_API_KEY.includes('placeholder')
    ) {
      issues.push('LLM_API_KEY is missing or contains placeholder');
    }

    // 检查环境配置
    if (!config.environment.DATABASE_URL) {
      issues.push('DATABASE_URL is missing');
    }

    if (!config.environment.REDIS_URL) {
      issues.push('REDIS_URL is missing');
    }

    // 检查端口配置
    if (config.environment.PORT <= 0 || config.environment.PORT > 65535) {
      issues.push('PORT is invalid');
    }

    return issues;
  }

  /**
   * 验证生产环境配置
   */
  static validateProductionConfig(config: Config): string[] {
    const issues: string[] = [];

    // 生产环境不允许占位符
    const sensitiveVars = [
      { key: 'JWT_SECRET', value: config.security.JWT_SECRET },
      { key: 'DB_PASSWORD', value: config.security.DB_PASSWORD },
      { key: 'LLM_API_KEY', value: config.security.LLM_API_KEY },
    ];

    for (const { key, value } of sensitiveVars) {
      if (
        value.includes('placeholder') ||
        value.includes('your_') ||
        value.includes('dev_')
      ) {
        issues.push(
          `${key} contains placeholder value in production environment`
        );
      }
    }

    // 生产环境必须启用安全功能
    if (!config.business.FEATURE_FLAGS.EMAIL_VERIFICATION) {
      issues.push('EMAIL_VERIFICATION should be enabled in production');
    }

    // 生产环境不应启用调试模式
    if (config.development.DEBUG) {
      issues.push('DEBUG should be disabled in production');
    }

    // 生产环境不应启用模拟 API
    if (config.development.MOCK_API) {
      issues.push('MOCK_API should be disabled in production');
    }

    return issues;
  }
}

/**
 * 配置调试工具
 */
export class ConfigDebugger {
  /**
   * 打印配置摘要
   */
  static printConfigSummary(config: Config, includeSensitive = false): void {
    const summary = SensitiveDataFilter.createConfigSummary(config, {
      includeSensitive,
      includeEnvironment: true,
    });

    console.log('=== Configuration Summary ===');
    console.log(`Environment: ${summary.environment.NODE_ENV}`);
    console.log(`Port: ${summary.environment.PORT}`);
    console.log(`Host: ${summary.environment.HOST}`);
    console.log(
      `Database: ${summary.database.HOST}:${summary.database.PORT}/${summary.database.NAME}`
    );
    console.log(`Redis: ${summary.redis.HOST}:${summary.redis.PORT}`);
    console.log('Features:', summary.features);

    if (includeSensitive) {
      console.log('Security:', summary.security);
    } else {
      console.log('Security: [FILTERED]');
    }

    console.log('=============================');
  }

  /**
   * 打印环境信息
   */
  static printEnvironmentInfo(): void {
    const detection = EnvironmentDetector.detect();

    console.log('=== Environment Information ===');
    console.log(`Detected Environment: ${detection.environment}`);
    console.log(`Is Production: ${detection.isProduction}`);
    console.log(`Is Development: ${detection.isDevelopment}`);
    console.log(`Is Test: ${detection.isTest}`);
    console.log(`Is CI: ${detection.isCI}`);
    console.log(`Source: ${detection.source}`);
    console.log('===============================');
  }

  /**
   * 打印配置验证结果
   */
  static printValidationResults(config: Config): void {
    const completenessIssues =
      ConfigValidator.validateConfigCompleteness(config);
    const productionIssues = EnvironmentDetector.isProduction()
      ? ConfigValidator.validateProductionConfig(config)
      : [];

    console.log('=== Configuration Validation ===');

    if (completenessIssues.length === 0) {
      console.log('✓ Configuration completeness: PASSED');
    } else {
      console.log('✗ Configuration completeness: FAILED');
      completenessIssues.forEach(issue => console.log(`  - ${issue}`));
    }

    if (EnvironmentDetector.isProduction()) {
      if (productionIssues.length === 0) {
        console.log('✓ Production configuration: PASSED');
      } else {
        console.log('✗ Production configuration: FAILED');
        productionIssues.forEach(issue => console.log(`  - ${issue}`));
      }
    }

    console.log('===============================');
  }
}

/**
 * 配置文件工具
 */
export class ConfigFileManager {
  /**
   * 生成环境文件
   */
  static generateEnvFile(
    environment: Environment,
    outputPath: string,
    templatePath?: string
  ): void {
    const templateFile =
      templatePath ||
      resolve(__dirname, 'env', 'env-templates', `${environment}.env`);

    if (!existsSync(templateFile)) {
      throw new Error(`Template file not found: ${templateFile}`);
    }

    const content = readFileSync(templateFile, 'utf-8');
    writeFileSync(outputPath, content);

    console.log(`Generated environment file: ${outputPath}`);
  }

  /**
   * 生成所有环境文件
   */
  static generateAllEnvFiles(outputDir: string): void {
    const environments: Environment[] = [
      'development',
      'production',
      'staging',
      'test',
      'ci',
    ];

    for (const env of environments) {
      const outputPath = join(outputDir, `.env.${env}`);
      this.generateEnvFile(env, outputPath);
    }

    console.log(
      `Generated ${environments.length} environment files in ${outputDir}`
    );
  }

  /**
   * 检查环境文件是否存在
   */
  static checkEnvFiles(basePath: string): Record<string, boolean> {
    const files = [
      '.env',
      '.env.local',
      '.env.development',
      '.env.production',
      '.env.staging',
      '.env.test',
      '.env.ci',
    ];

    const result: Record<string, boolean> = {};

    for (const file of files) {
      result[file] = existsSync(join(basePath, file));
    }

    return result;
  }
}

/**
 * 配置比较工具
 */
export class ConfigComparator {
  /**
   * 比较两个配置对象
   */
  static compare<T extends Record<string, any>>(
    config1: T,
    config2: T,
    ignoreKeys: string[] = []
  ): {
    added: string[];
    removed: string[];
    changed: string[];
    unchanged: string[];
  } {
    const keys1 = new Set(Object.keys(config1));
    const keys2 = new Set(Object.keys(config2));

    const added = [...keys2].filter(
      key => !keys1.has(key) && !ignoreKeys.includes(key)
    );
    const removed = [...keys1].filter(
      key => !keys2.has(key) && !ignoreKeys.includes(key)
    );
    const common = [...keys1].filter(
      key => keys2.has(key) && !ignoreKeys.includes(key)
    );

    const changed: string[] = [];
    const unchanged: string[] = [];

    for (const key of common) {
      if (JSON.stringify(config1[key]) !== JSON.stringify(config2[key])) {
        changed.push(key);
      } else {
        unchanged.push(key);
      }
    }

    return { added, removed, changed, unchanged };
  }

  /**
   * 比较环境配置
   */
  static compareEnvironments(
    env1: Environment,
    env2: Environment
  ): {
    differences: string[];
    similarities: string[];
  } {
    const config1 = loadConfig({ environment: env1, validate: false });
    const config2 = loadConfig({ environment: env2, validate: false });

    const comparison = this.compare(config1, config2, ['security']);

    return {
      differences: [
        ...comparison.added,
        ...comparison.removed,
        ...comparison.changed,
      ],
      similarities: comparison.unchanged,
    };
  }
}

// 工具类已在上面定义并导出，无需重复导出
