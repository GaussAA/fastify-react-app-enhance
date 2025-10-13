/**
 * 高级使用示例
 * 展示环境管理系统的高级功能和最佳实践
 */

import { loadConfig, resetConfig } from '../env.js';
import {
  ConfigMerger,
  ConfigComparator,
  ConfigFileManager,
  SensitiveDataFilter,
  EnvironmentDetector,
} from '../utils.js';
// import { Config, Environment } from '../types.js';

/**
 * 示例1: 配置合并
 */
export function configMerging() {
  console.log('=== 配置合并示例 ===');

  // 基础配置
  const baseConfig = {
    database: {
      host: 'localhost',
      port: 5432,
      name: 'app_db',
    },
    features: {
      registration: true,
      emailVerification: false,
    },
  };

  // 环境特定配置
  const envConfig = {
    database: {
      host: 'prod-db.example.com',
      ssl: true,
    },
    features: {
      emailVerification: true,
    },
    monitoring: {
      enabled: true,
    },
  };

  // 合并配置
  const mergedConfig = ConfigMerger.deepMerge(baseConfig, envConfig as any);

  console.log('合并后的配置:', JSON.stringify(mergedConfig, null, 2));

  return mergedConfig;
}

/**
 * 示例2: 配置比较
 */
export function configComparison() {
  console.log('=== 配置比较示例 ===');

  // 加载不同环境的配置
  const devConfig = loadConfig({ environment: 'development', validate: false });
  const prodConfig = loadConfig({ environment: 'production', validate: false });

  // 比较配置差异
  const comparison = ConfigComparator.compare(devConfig, prodConfig, [
    'security',
  ]);

  console.log('配置比较结果:');
  console.log('新增配置:', comparison.added);
  console.log('删除配置:', comparison.removed);
  console.log('修改配置:', comparison.changed);
  console.log('未变配置:', comparison.unchanged);

  // 比较环境差异
  const envComparison = ConfigComparator.compareEnvironments(
    'development',
    'production'
  );
  console.log('环境差异:', envComparison.differences);
  console.log('环境相似:', envComparison.similarities);

  return { comparison, envComparison };
}

/**
 * 示例3: 配置文件管理
 */
export function configFileManagement() {
  console.log('=== 配置文件管理示例 ===');

  const outputDir = './generated-env-files';

  try {
    // 检查现有环境文件
    const existingFiles = ConfigFileManager.checkEnvFiles('.');
    console.log('现有环境文件:', existingFiles);

    // 生成单个环境文件
    ConfigFileManager.generateEnvFile(
      'development',
      './.env.development.generated'
    );

    // 生成所有环境文件
    ConfigFileManager.generateAllEnvFiles(outputDir);

    console.log('配置文件生成完成');
  } catch (error) {
    console.error('配置文件生成失败:', error.message);
  }
}

/**
 * 示例4: 敏感数据处理
 */
export function sensitiveDataHandling() {
  console.log('=== 敏感数据处理示例 ===');

  const config = loadConfig();

  // 测试敏感键检测
  const testKeys = [
    'JWT_SECRET',
    'DB_PASSWORD',
    'API_KEY',
    'DATABASE_URL',
    'LOG_LEVEL',
    'PORT',
  ];

  console.log('敏感键检测结果:');
  testKeys.forEach(key => {
    const isSensitive = SensitiveDataFilter.isSensitiveKey(key);
    console.log(`${key}: ${isSensitive ? '敏感' : '非敏感'}`);
  });

  // 过滤敏感数据
  const filteredConfig = SensitiveDataFilter.filterSensitiveData(config);
  console.log('过滤后的配置摘要:', {
    security: filteredConfig.security,
    environment: {
      NODE_ENV: filteredConfig.environment.NODE_ENV,
      PORT: filteredConfig.environment.PORT,
      HOST: filteredConfig.environment.HOST,
    },
  });

  return filteredConfig;
}

/**
 * 示例5: 动态配置更新
 */
export function dynamicConfigUpdate() {
  console.log('=== 动态配置更新示例 ===');

  // 重置配置缓存
  resetConfig();

  // 模拟环境变量更新
  const originalEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'staging';

  try {
    // 重新加载配置
    const newConfig = loadConfig();
    console.log('更新后的环境:', newConfig.environment.NODE_ENV);

    // 恢复原始环境
    if (originalEnv) {
      process.env.NODE_ENV = originalEnv;
    } else {
      delete process.env.NODE_ENV;
    }

    // 再次加载配置
    const restoredConfig = loadConfig();
    console.log('恢复后的环境:', restoredConfig.environment.NODE_ENV);

    return { newConfig, restoredConfig };
  } catch (error) {
    console.error('动态配置更新失败:', error.message);

    // 确保恢复原始环境
    if (originalEnv) {
      process.env.NODE_ENV = originalEnv;
    } else {
      delete process.env.NODE_ENV;
    }

    throw error;
  }
}

/**
 * 示例6: 配置模板化
 */
export function configTemplating() {
  console.log('=== 配置模板化示例 ===');

  // 创建配置模板
  const configTemplate = {
    environment: '{{ENVIRONMENT}}',
    database: {
      host: '{{DB_HOST}}',
      port: '{{DB_PORT}}',
      name: '{{DB_NAME}}',
    },
    features: {
      registration: '{{FEATURE_REGISTRATION}}',
      emailVerification: '{{FEATURE_EMAIL_VERIFICATION}}',
    },
  };

  // 模板变量替换
  const templateVars = {
    ENVIRONMENT: 'production',
    DB_HOST: 'prod-db.example.com',
    DB_PORT: '5432',
    DB_NAME: 'production_db',
    FEATURE_REGISTRATION: 'true',
    FEATURE_EMAIL_VERIFICATION: 'true',
  };

  // 简单的模板替换函数
  function replaceTemplate(template: any, vars: Record<string, string>): any {
    if (typeof template === 'string') {
      return template.replace(
        /\{\{(\w+)\}\}/g,
        (match, key) => vars[key] || match
      );
    } else if (Array.isArray(template)) {
      return template.map(item => replaceTemplate(item, vars));
    } else if (typeof template === 'object' && template !== null) {
      const result: any = {};
      for (const [key, value] of Object.entries(template)) {
        result[key] = replaceTemplate(value, vars);
      }
      return result;
    }
    return template;
  }

  const resolvedConfig = replaceTemplate(configTemplate, templateVars);
  console.log('解析后的配置:', JSON.stringify(resolvedConfig, null, 2));

  return resolvedConfig;
}

/**
 * 示例7: 配置验证和修复
 */
export function configValidationAndFix() {
  console.log('=== 配置验证和修复示例 ===');

  const config = loadConfig();

  // 验证配置
  const issues: string[] = [];

  // 检查端口范围
  if (config.environment.PORT < 1024 || config.environment.PORT > 65535) {
    issues.push(`端口 ${config.environment.PORT} 超出有效范围 (1024-65535)`);
  }

  // 检查超时设置
  if (config.business.REQUEST_TIMEOUT > 300000) {
    issues.push(
      `请求超时 ${config.business.REQUEST_TIMEOUT}ms 过长，建议不超过 5 分钟`
    );
  }

  // 检查缓存设置
  if (config.business.CACHE_TTL > 86400) {
    issues.push(
      `缓存 TTL ${config.business.CACHE_TTL}s 过长，建议不超过 24 小时`
    );
  }

  // 生产环境特殊检查
  if (EnvironmentDetector.isProduction()) {
    if (!config.business.FEATURE_FLAGS.EMAIL_VERIFICATION) {
      issues.push('生产环境应启用邮箱验证功能');
    }

    if (config.development.DEBUG) {
      issues.push('生产环境不应启用调试模式');
    }
  }

  console.log('配置验证结果:');
  if (issues.length === 0) {
    console.log('✓ 配置验证通过');
  } else {
    console.log('✗ 发现以下问题:');
    issues.forEach(issue => console.log(`  - ${issue}`));
  }

  return { issues, isValid: issues.length === 0 };
}

/**
 * 示例8: 配置监控和告警
 */
export function configMonitoring() {
  console.log('=== 配置监控示例 ===');

  const config = loadConfig();

  // 配置健康检查
  const healthChecks = {
    database: {
      url: config.environment.DATABASE_URL,
      status: 'healthy',
      lastCheck: new Date().toISOString(),
    },
    redis: {
      url: config.environment.REDIS_URL,
      status: 'healthy',
      lastCheck: new Date().toISOString(),
    },
    features: {
      registration: config.business.FEATURE_FLAGS.REGISTRATION,
      emailVerification: config.business.FEATURE_FLAGS.EMAIL_VERIFICATION,
      twoFactorAuth: config.business.FEATURE_FLAGS.TWO_FACTOR_AUTH,
    },
  };

  // 配置变更检测
  const configHash = JSON.stringify({
    environment: config.environment.NODE_ENV,
    port: config.environment.PORT,
    features: config.business.FEATURE_FLAGS,
  });

  console.log('配置健康检查:', healthChecks);
  console.log('配置哈希:', configHash);

  // 模拟配置变更告警
  const alerts: string[] = [];

  if (EnvironmentDetector.isProduction() && config.development.DEBUG) {
    alerts.push('生产环境启用了调试模式');
  }

  if (config.business.REQUEST_TIMEOUT > 60000) {
    alerts.push('请求超时设置过长，可能影响用户体验');
  }

  if (alerts.length > 0) {
    console.log('配置告警:', alerts);
  } else {
    console.log('✓ 无配置告警');
  }

  return { healthChecks, configHash, alerts };
}

/**
 * 运行所有高级示例
 */
export function runAllAdvancedExamples() {
  console.log('开始运行高级示例...\n');

  try {
    configMerging();
    console.log('\n');

    configComparison();
    console.log('\n');

    configFileManagement();
    console.log('\n');

    sensitiveDataHandling();
    console.log('\n');

    dynamicConfigUpdate();
    console.log('\n');

    configTemplating();
    console.log('\n');

    configValidationAndFix();
    console.log('\n');

    configMonitoring();
    console.log('\n');

    console.log('所有高级示例运行完成！');
  } catch (error) {
    console.error('高级示例运行失败:', error);
  }
}

// 如果直接运行此文件，执行所有高级示例
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllAdvancedExamples();
}
