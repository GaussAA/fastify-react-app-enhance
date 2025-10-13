/**
 * 配置验证工具
 * 提供配置验证和错误报告功能
 */

import { z } from 'zod';
import { ConfigSchema, ConfigManager } from './unified-config.js';

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  path: string;
  message: string;
  code: string;
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  path: string;
  message: string;
  suggestion?: string;
}

export interface ConfigHealthCheck {
  isHealthy: boolean;
  issues: Array<{
    type: 'error' | 'warning' | 'info';
    message: string;
    suggestion?: string;
  }>;
  summary: {
    total: number;
    errors: number;
    warnings: number;
    info: number;
  };
}

/**
 * 配置验证器类
 */
export class ConfigValidator {
  private configManager: ConfigManager;

  constructor(configManager: ConfigManager) {
    this.configManager = configManager;
  }

  /**
   * 验证配置
   */
  public validateConfig(config: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    try {
      // 使用Zod schema验证
      ConfigSchema.parse(config);
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach(err => {
          errors.push({
            path: err.path.join('.'),
            message: err.message,
            code: err.code,
            severity: 'error',
          });
        });
      }
    }

    // 执行自定义验证规则
    this.validateCustomRules(config, errors, warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * 执行健康检查
   */
  public async performHealthCheck(): Promise<ConfigHealthCheck> {
    const issues: Array<{
      type: 'error' | 'warning' | 'info';
      message: string;
      suggestion?: string;
    }> = [];

    try {
      const config = this.configManager.getConfig();

      // 检查数据库连接
      await this.checkDatabaseConnection(config.database, issues);

      // 检查Redis连接
      await this.checkRedisConnection(config.redis, issues);

      // 检查JWT配置
      this.checkJWTConfig(config.jwt, issues);

      // 检查安全配置
      this.checkSecurityConfig(config.security, issues);

      // 检查LLM配置
      this.checkLLMConfig(config.llm, issues);

      // 检查环境特定配置
      this.checkEnvironmentSpecificConfig(config, issues);
    } catch (error: any) {
      issues.push({
        type: 'error',
        message: `配置健康检查失败: ${error.message}`,
        suggestion: '请检查配置文件和环境变量',
      });
    }

    const summary = {
      total: issues.length,
      errors: issues.filter(i => i.type === 'error').length,
      warnings: issues.filter(i => i.type === 'warning').length,
      info: issues.filter(i => i.type === 'info').length,
    };

    return {
      isHealthy: summary.errors === 0,
      issues,
      summary,
    };
  }

  /**
   * 验证自定义规则
   */
  private validateCustomRules(
    config: any,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    // 检查生产环境安全配置
    if (config.environment === 'production') {
      this.validateProductionSecurity(config, errors, warnings);
    }

    // 检查开发环境配置
    if (config.environment === 'development') {
      this.validateDevelopmentConfig(config, warnings);
    }

    // 检查密码强度
    this.validatePasswordStrength(config, errors, warnings);

    // 检查端口冲突
    this.validatePortConflicts(config, errors, warnings);

    // 检查URL格式
    this.validateURLs(config, errors, warnings);
  }

  /**
   * 验证生产环境安全配置
   */
  private validateProductionSecurity(
    config: any,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    // JWT密钥检查
    if (
      config.jwt.secret ===
      'your-super-secret-jwt-key-change-this-in-production'
    ) {
      errors.push({
        path: 'jwt.secret',
        message: '生产环境必须使用强JWT密钥',
        code: 'PRODUCTION_SECURITY',
        severity: 'error',
      });
    }

    // 会话密钥检查
    if (
      config.security.sessionSecret ===
      'your-super-secret-session-key-change-this-in-production'
    ) {
      errors.push({
        path: 'security.sessionSecret',
        message: '生产环境必须使用强会话密钥',
        code: 'PRODUCTION_SECURITY',
        severity: 'error',
      });
    }

    // HTTPS检查
    if (config.server.cors.origin === '*') {
      warnings.push({
        path: 'server.cors.origin',
        message: '生产环境建议限制CORS来源',
        suggestion: '设置具体的域名而不是使用通配符',
      });
    }

    // 调试模式检查
    if (config.logLevel === 'debug' || config.logLevel === 'verbose') {
      warnings.push({
        path: 'logLevel',
        message: '生产环境不建议使用详细日志级别',
        suggestion: '使用info或warn级别',
      });
    }
  }

  /**
   * 验证开发环境配置
   */
  private validateDevelopmentConfig(
    config: any,
    warnings: ValidationWarning[]
  ): void {
    // 检查是否启用了所有功能
    const disabledFeatures = Object.entries(config.features)
      .filter(([_, enabled]) => !enabled)
      .map(([feature]) => feature);

    if (disabledFeatures.length > 0) {
      warnings.push({
        path: 'features',
        message: `开发环境中有功能被禁用: ${disabledFeatures.join(', ')}`,
        suggestion: '开发环境建议启用所有功能以便测试',
      });
    }
  }

  /**
   * 验证密码强度
   */
  private validatePasswordStrength(
    config: any,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    // 检查bcrypt轮数
    if (config.security.bcryptRounds < 10) {
      errors.push({
        path: 'security.bcryptRounds',
        message: 'bcrypt轮数过少，存在安全风险',
        code: 'WEAK_PASSWORD_HASH',
        severity: 'error',
      });
    } else if (config.security.bcryptRounds < 12) {
      warnings.push({
        path: 'security.bcryptRounds',
        message: '建议使用更高的bcrypt轮数',
        suggestion: '推荐使用12-15轮',
      });
    }
  }

  /**
   * 验证端口冲突
   */
  private validatePortConflicts(
    config: any,
    errors: ValidationError[],
    _warnings: ValidationWarning[]
  ): void {
    const ports = [
      { name: 'server', port: config.server.port },
      { name: 'database', port: config.database.port },
      { name: 'redis', port: config.redis.port },
    ];

    const portMap = new Map<number, string[]>();
    ports.forEach(({ name, port }) => {
      if (!portMap.has(port)) {
        portMap.set(port, []);
      }
      portMap.get(port)!.push(name);
    });

    portMap.forEach((services, port) => {
      if (services.length > 1) {
        errors.push({
          path: 'ports',
          message: `端口冲突: 端口${port}被多个服务使用`,
          code: 'PORT_CONFLICT',
          severity: 'error',
        });
      }
    });
  }

  /**
   * 验证URL格式
   */
  private validateURLs(
    config: any,
    errors: ValidationError[],
    _warnings: ValidationWarning[]
  ): void {
    // 检查数据库URL
    if (config.database.url && !this.isValidURL(config.database.url)) {
      errors.push({
        path: 'database.url',
        message: '数据库URL格式无效',
        code: 'INVALID_URL',
        severity: 'error',
      });
    }

    // 检查Redis URL
    if (config.redis.url && !this.isValidURL(config.redis.url)) {
      errors.push({
        path: 'redis.url',
        message: 'Redis URL格式无效',
        code: 'INVALID_URL',
        severity: 'error',
      });
    }

    // 检查LLM Base URL
    if (config.llm.baseUrl && !this.isValidURL(config.llm.baseUrl)) {
      errors.push({
        path: 'llm.baseUrl',
        message: 'LLM Base URL格式无效',
        code: 'INVALID_URL',
        severity: 'error',
      });
    }
  }

  /**
   * 检查数据库连接
   */
  private async checkDatabaseConnection(
    dbConfig: any,
    issues: Array<{
      type: 'error' | 'warning' | 'info';
      message: string;
      suggestion?: string;
    }>
  ): Promise<void> {
    try {
      // 这里应该实际测试数据库连接
      // 暂时模拟检查
      if (!dbConfig.url || dbConfig.url.includes('localhost')) {
        issues.push({
          type: 'info',
          message: '使用本地数据库连接',
        });
      }
    } catch (error: any) {
      issues.push({
        type: 'error',
        message: `数据库连接失败: ${error.message}`,
        suggestion: '请检查数据库配置和网络连接',
      });
    }
  }

  /**
   * 检查Redis连接
   */
  private async checkRedisConnection(
    redisConfig: any,
    issues: Array<{
      type: 'error' | 'warning' | 'info';
      message: string;
      suggestion?: string;
    }>
  ): Promise<void> {
    try {
      // 这里应该实际测试Redis连接
      // 暂时模拟检查
      if (!redisConfig.url || redisConfig.url.includes('localhost')) {
        issues.push({
          type: 'info',
          message: '使用本地Redis连接',
        });
      }
    } catch (error: any) {
      issues.push({
        type: 'error',
        message: `Redis连接失败: ${error.message}`,
        suggestion: '请检查Redis配置和网络连接',
      });
    }
  }

  /**
   * 检查JWT配置
   */
  private checkJWTConfig(
    jwtConfig: any,
    issues: Array<{
      type: 'error' | 'warning' | 'info';
      message: string;
      suggestion?: string;
    }>
  ): void {
    if (jwtConfig.secret.length < 32) {
      issues.push({
        type: 'error',
        message: 'JWT密钥长度不足',
        suggestion: '建议使用至少32个字符的强密钥',
      });
    }

    if (jwtConfig.expiresIn === '24h' && this.configManager.isProduction()) {
      issues.push({
        type: 'warning',
        message: '生产环境JWT过期时间较长',
        suggestion: '考虑缩短JWT过期时间以提高安全性',
      });
    }
  }

  /**
   * 检查安全配置
   */
  private checkSecurityConfig(
    securityConfig: any,
    issues: Array<{
      type: 'error' | 'warning' | 'info';
      message: string;
      suggestion?: string;
    }>
  ): void {
    if (!securityConfig.csrfProtection && this.configManager.isProduction()) {
      issues.push({
        type: 'warning',
        message: '生产环境未启用CSRF保护',
        suggestion: '建议启用CSRF保护',
      });
    }

    if (!securityConfig.helmet.enabled) {
      issues.push({
        type: 'warning',
        message: '未启用Helmet安全中间件',
        suggestion: '建议启用Helmet以提高安全性',
      });
    }
  }

  /**
   * 检查LLM配置
   */
  private checkLLMConfig(
    llmConfig: any,
    issues: Array<{
      type: 'error' | 'warning' | 'info';
      message: string;
      suggestion?: string;
    }>
  ): void {
    if (!llmConfig.apiKey) {
      issues.push({
        type: 'error',
        message: 'LLM API密钥未配置',
        suggestion: '请设置LLM_API_KEY环境变量',
      });
    }

    if (llmConfig.temperature > 1.5) {
      issues.push({
        type: 'warning',
        message: 'LLM温度设置较高，可能影响输出质量',
        suggestion: '建议使用0.7-1.0之间的温度值',
      });
    }
  }

  /**
   * 检查环境特定配置
   */
  private checkEnvironmentSpecificConfig(
    config: any,
    issues: Array<{
      type: 'error' | 'warning' | 'info';
      message: string;
      suggestion?: string;
    }>
  ): void {
    if (this.configManager.isProduction()) {
      // 生产环境检查
      if (config.logLevel === 'debug') {
        issues.push({
          type: 'warning',
          message: '生产环境使用调试日志级别',
          suggestion: '建议使用info或warn级别',
        });
      }
    } else if (this.configManager.isDevelopment()) {
      // 开发环境检查
      if (!config.features.registration) {
        issues.push({
          type: 'info',
          message: '开发环境禁用了用户注册功能',
        });
      }
    }
  }

  /**
   * 验证URL格式
   */
  private isValidURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * 配置验证报告生成器
 */
export class ConfigReportGenerator {
  /**
   * 生成验证报告
   */
  public generateReport(result: ValidationResult): string {
    let report = '# 配置验证报告\n\n';

    report += `## 验证结果\n`;
    report += `- **状态**: ${result.isValid ? '✅ 通过' : '❌ 失败'}\n`;
    report += `- **错误数量**: ${result.errors.length}\n`;
    report += `- **警告数量**: ${result.warnings.length}\n\n`;

    if (result.errors.length > 0) {
      report += `## 错误列表\n\n`;
      result.errors.forEach((error, index) => {
        report += `### ${index + 1}. ${error.path}\n`;
        report += `- **消息**: ${error.message}\n`;
        report += `- **代码**: ${error.code}\n`;
        report += `- **严重程度**: ${error.severity}\n\n`;
      });
    }

    if (result.warnings.length > 0) {
      report += `## 警告列表\n\n`;
      result.warnings.forEach((warning, index) => {
        report += `### ${index + 1}. ${warning.path}\n`;
        report += `- **消息**: ${warning.message}\n`;
        if (warning.suggestion) {
          report += `- **建议**: ${warning.suggestion}\n`;
        }
        report += '\n';
      });
    }

    return report;
  }

  /**
   * 生成健康检查报告
   */
  public generateHealthReport(healthCheck: ConfigHealthCheck): string {
    let report = '# 配置健康检查报告\n\n';

    report += `## 健康状态\n`;
    report += `- **状态**: ${healthCheck.isHealthy ? '✅ 健康' : '❌ 不健康'}\n`;
    report += `- **总问题数**: ${healthCheck.summary.total}\n`;
    report += `- **错误**: ${healthCheck.summary.errors}\n`;
    report += `- **警告**: ${healthCheck.summary.warnings}\n`;
    report += `- **信息**: ${healthCheck.summary.info}\n\n`;

    if (healthCheck.issues.length > 0) {
      report += `## 问题详情\n\n`;
      healthCheck.issues.forEach((issue, index) => {
        const icon =
          issue.type === 'error'
            ? '❌'
            : issue.type === 'warning'
              ? '⚠️'
              : 'ℹ️';
        report += `### ${index + 1}. ${icon} ${issue.message}\n`;
        if (issue.suggestion) {
          report += `**建议**: ${issue.suggestion}\n`;
        }
        report += '\n';
      });
    }

    return report;
  }
}
