/**
 * 基础使用示例
 * 展示如何使用环境管理系统的基本功能
 */

import { loadConfig, getConfig, detectEnvironment } from '../env.js';
import {
    EnvironmentDetector,
    ConfigDebugger,
    SensitiveDataFilter,
    ConfigValidator
} from '../utils.js';

/**
 * 示例1: 基础配置加载
 */
export function basicConfigLoading() {
    console.log('=== 基础配置加载示例 ===');

    // 自动检测环境并加载配置
    const config = loadConfig();

    console.log('当前环境:', config.environment.NODE_ENV);
    console.log('服务器端口:', config.environment.PORT);
    console.log('数据库URL:', config.environment.DATABASE_URL);
    console.log('功能开关:', config.business.FEATURE_FLAGS);

    return config;
}

/**
 * 示例2: 指定环境加载配置
 */
export function loadSpecificEnvironment() {
    console.log('=== 指定环境加载示例 ===');

    // 加载开发环境配置
    const devConfig = loadConfig({ environment: 'development' });
    console.log('开发环境配置:', {
        NODE_ENV: devConfig.environment.NODE_ENV,
        LOG_LEVEL: devConfig.environment.LOG_LEVEL,
        DEBUG: devConfig.development.DEBUG
    });

    // 加载生产环境配置
    const prodConfig = loadConfig({ environment: 'production' });
    console.log('生产环境配置:', {
        NODE_ENV: prodConfig.environment.NODE_ENV,
        LOG_LEVEL: prodConfig.environment.LOG_LEVEL,
        DEBUG: prodConfig.development.DEBUG
    });

    return { devConfig, prodConfig };
}

/**
 * 示例3: 配置验证
 */
export function configValidation() {
    console.log('=== 配置验证示例 ===');

    const config = loadConfig();

    // 验证配置完整性
    const completenessIssues = ConfigValidator.validateConfigCompleteness(config);
    if (completenessIssues.length === 0) {
        console.log('✓ 配置完整性验证通过');
    } else {
        console.log('✗ 配置完整性验证失败:');
        completenessIssues.forEach(issue => console.log(`  - ${issue}`));
    }

    // 生产环境特殊验证
    if (EnvironmentDetector.isProduction()) {
        const productionIssues = ConfigValidator.validateProductionConfig(config);
        if (productionIssues.length === 0) {
            console.log('✓ 生产环境配置验证通过');
        } else {
            console.log('✗ 生产环境配置验证失败:');
            productionIssues.forEach(issue => console.log(`  - ${issue}`));
        }
    }

    return { completenessIssues, productionIssues: EnvironmentDetector.isProduction() ? ConfigValidator.validateProductionConfig(config) : [] };
}

/**
 * 示例4: 环境检测
 */
export function environmentDetection() {
    console.log('=== 环境检测示例 ===');

    const detection = EnvironmentDetector.detect();

    console.log('环境检测结果:', {
        environment: detection.environment,
        isProduction: detection.isProduction,
        isDevelopment: detection.isDevelopment,
        isTest: detection.isTest,
        isCI: detection.isCI,
        source: detection.source
    });

    // 环境特定逻辑
    if (detection.isProduction) {
        console.log('运行生产环境逻辑');
    } else if (detection.isDevelopment) {
        console.log('运行开发环境逻辑');
    } else if (detection.isTest) {
        console.log('运行测试环境逻辑');
    }

    return detection;
}

/**
 * 示例5: 配置摘要和安全过滤
 */
export function configSummary() {
    console.log('=== 配置摘要示例 ===');

    const config = loadConfig();

    // 创建安全摘要（过滤敏感信息）
    const safeSummary = SensitiveDataFilter.createConfigSummary(config, {
        includeSensitive: false,
        includeEnvironment: true
    });

    console.log('安全配置摘要:', safeSummary);

    // 创建完整摘要（包含敏感信息，仅用于调试）
    if (EnvironmentDetector.isDevelopment()) {
        const fullSummary = SensitiveDataFilter.createConfigSummary(config, {
            includeSensitive: true,
            includeEnvironment: true
        });

        console.log('完整配置摘要（开发环境）:', fullSummary);
    }

    return safeSummary;
}

/**
 * 示例6: 单例模式使用
 */
export function singletonUsage() {
    console.log('=== 单例模式使用示例 ===');

    // 第一次获取配置（会加载）
    const config1 = getConfig();
    console.log('第一次获取配置:', config1.environment.NODE_ENV);

    // 第二次获取配置（使用缓存）
    const config2 = getConfig();
    console.log('第二次获取配置:', config2.environment.NODE_ENV);

    // 验证是同一个实例
    console.log('是否为同一实例:', config1 === config2);

    return { config1, config2 };
}

/**
 * 示例7: 调试工具使用
 */
export function debugTools() {
    console.log('=== 调试工具示例 ===');

    const config = loadConfig();

    // 打印环境信息
    ConfigDebugger.printEnvironmentInfo();

    // 打印配置摘要
    ConfigDebugger.printConfigSummary(config, false);

    // 打印验证结果
    ConfigDebugger.printValidationResults(config);

    return config;
}

/**
 * 示例8: 错误处理
 */
export function errorHandling() {
    console.log('=== 错误处理示例 ===');

    try {
        // 尝试加载无效配置
        const config = loadConfig({
            environment: 'invalid' as any,
            validate: true
        });

        console.log('配置加载成功:', config.environment.NODE_ENV);
    } catch (error) {
        console.log('配置加载失败:', error.message);
    }

    try {
        // 尝试加载缺失必需配置的环境
        const config = loadConfig({
            environment: 'production',
            validate: true,
            allowMissingRequired: false
        });

        console.log('生产环境配置加载成功');
    } catch (error) {
        console.log('生产环境配置加载失败:', error.message);
    }
}

/**
 * 运行所有示例
 */
export function runAllExamples() {
    console.log('开始运行环境管理系统示例...\n');

    try {
        basicConfigLoading();
        console.log('\n');

        loadSpecificEnvironment();
        console.log('\n');

        configValidation();
        console.log('\n');

        environmentDetection();
        console.log('\n');

        configSummary();
        console.log('\n');

        singletonUsage();
        console.log('\n');

        debugTools();
        console.log('\n');

        errorHandling();
        console.log('\n');

        console.log('所有示例运行完成！');
    } catch (error) {
        console.error('示例运行失败:', error);
    }
}

// 如果直接运行此文件，执行所有示例
if (import.meta.url === `file://${process.argv[1]}`) {
    runAllExamples();
}
