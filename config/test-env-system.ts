/**
 * 环境管理系统测试脚本
 * 用于验证环境管理系统的功能
 */

import { loadConfig, getConfig, detectEnvironment } from './env.js';
import {
  EnvironmentDetector,
  ConfigDebugger,
  SensitiveDataFilter,
  ConfigValidator,
  ConfigFileManager,
} from './utils.js';

/**
 * 测试基础功能
 */
function testBasicFunctionality() {
  console.log('=== 测试基础功能 ===');

  try {
    // 测试环境检测
    const environment = detectEnvironment();
    console.log('✓ 环境检测:', environment);

    // 测试配置加载
    const config = loadConfig({ validate: false });
    console.log('✓ 配置加载成功');
    console.log('  - 环境:', config.environment.NODE_ENV);
    console.log('  - 端口:', config.environment.PORT);
    console.log('  - 主机:', config.environment.HOST);

    // 测试单例模式
    const config2 = getConfig();
    console.log('✓ 单例模式:', config === config2);

    return true;
  } catch (error) {
    console.error('✗ 基础功能测试失败:', error.message);
    return false;
  }
}

/**
 * 测试环境检测
 */
function testEnvironmentDetection() {
  console.log('\n=== 测试环境检测 ===');

  try {
    const detection = EnvironmentDetector.detect();
    console.log('✓ 环境检测结果:');
    console.log('  - 环境:', detection.environment);
    console.log('  - 是否生产环境:', detection.isProduction);
    console.log('  - 是否开发环境:', detection.isDevelopment);
    console.log('  - 是否测试环境:', detection.isTest);
    console.log('  - 是否 CI 环境:', detection.isCI);
    console.log('  - 来源:', detection.source);

    return true;
  } catch (error) {
    console.error('✗ 环境检测测试失败:', error.message);
    return false;
  }
}

/**
 * 测试配置验证
 */
function testConfigValidation() {
  console.log('\n=== 测试配置验证 ===');

  try {
    const config = loadConfig({ validate: false });

    // 测试配置完整性验证
    const completenessIssues =
      ConfigValidator.validateConfigCompleteness(config);
    console.log('✓ 配置完整性验证:');
    if (completenessIssues.length === 0) {
      console.log('  - 无问题');
    } else {
      console.log('  - 问题:', completenessIssues);
    }

    // 测试生产环境验证
    if (EnvironmentDetector.isProduction()) {
      const productionIssues = ConfigValidator.validateProductionConfig(config);
      console.log('✓ 生产环境验证:');
      if (productionIssues.length === 0) {
        console.log('  - 无问题');
      } else {
        console.log('  - 问题:', productionIssues);
      }
    }

    return true;
  } catch (error) {
    console.error('✗ 配置验证测试失败:', error.message);
    return false;
  }
}

/**
 * 测试敏感信息过滤
 */
function testSensitiveDataFiltering() {
  console.log('\n=== 测试敏感信息过滤 ===');

  try {
    const config = loadConfig({ validate: false });

    // 测试敏感键检测
    const testKeys = [
      'JWT_SECRET',
      'DB_PASSWORD',
      'API_KEY',
      'DATABASE_URL',
      'LOG_LEVEL',
      'PORT',
    ];
    console.log('✓ 敏感键检测:');
    testKeys.forEach(key => {
      const isSensitive = SensitiveDataFilter.isSensitiveKey(key);
      console.log(`  - ${key}: ${isSensitive ? '敏感' : '非敏感'}`);
    });

    // 测试配置摘要
    const summary = SensitiveDataFilter.createConfigSummary(config, {
      includeSensitive: false,
      includeEnvironment: true,
    });
    console.log('✓ 配置摘要生成成功');
    console.log('  - 环境:', summary.environment.NODE_ENV);
    console.log('  - 端口:', summary.environment.PORT);
    console.log('  - 安全配置已过滤');

    return true;
  } catch (error) {
    console.error('✗ 敏感信息过滤测试失败:', error.message);
    return false;
  }
}

/**
 * 测试调试工具
 */
function testDebugTools() {
  console.log('\n=== 测试调试工具 ===');

  try {
    const config = loadConfig({ validate: false });

    // 测试配置摘要打印
    console.log('✓ 配置摘要:');
    ConfigDebugger.printConfigSummary(config, false);

    // 测试环境信息打印
    console.log('✓ 环境信息:');
    ConfigDebugger.printEnvironmentInfo();

    // 测试验证结果打印
    console.log('✓ 验证结果:');
    ConfigDebugger.printValidationResults(config);

    return true;
  } catch (error) {
    console.error('✗ 调试工具测试失败:', error.message);
    return false;
  }
}

/**
 * 测试配置文件管理
 */
function testConfigFileManagement() {
  console.log('\n=== 测试配置文件管理 ===');

  try {
    // 测试环境文件检查
    const existingFiles = ConfigFileManager.checkEnvFiles('.');
    console.log('✓ 环境文件检查:');
    Object.entries(existingFiles).forEach(([file, exists]) => {
      console.log(`  - ${file}: ${exists ? '存在' : '不存在'}`);
    });

    return true;
  } catch (error) {
    console.error('✗ 配置文件管理测试失败:', error.message);
    return false;
  }
}

/**
 * 运行所有测试
 */
function runAllTests() {
  console.log('开始运行环境管理系统测试...\n');

  const tests = [
    { name: '基础功能', fn: testBasicFunctionality },
    { name: '环境检测', fn: testEnvironmentDetection },
    { name: '配置验证', fn: testConfigValidation },
    { name: '敏感信息过滤', fn: testSensitiveDataFiltering },
    { name: '调试工具', fn: testDebugTools },
    { name: '配置文件管理', fn: testConfigFileManagement },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error(`✗ ${test.name}测试异常:`, error.message);
      failed++;
    }
  }

  console.log('\n=== 测试结果汇总 ===');
  console.log(`总测试数: ${tests.length}`);
  console.log(`通过: ${passed}`);
  console.log(`失败: ${failed}`);
  console.log(`成功率: ${((passed / tests.length) * 100).toFixed(1)}%`);

  if (failed === 0) {
    console.log('\n🎉 所有测试通过！环境管理系统运行正常。');
  } else {
    console.log('\n⚠️  部分测试失败，请检查配置。');
  }

  return failed === 0;
}

// 如果直接运行此文件，执行所有测试
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests();
}

export { runAllTests };
