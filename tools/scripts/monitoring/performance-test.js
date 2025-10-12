#!/usr/bin/env node

/**
 * 性能测试脚本
 *
 * 自动化性能测试和基准测试
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { execSync, spawn } from 'child_process';
import { fileURLToPath } from 'url';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class PerformanceTester {
  constructor() {
    this.projectRoot = join(__dirname, '../../..');
    this.results = {
      timestamp: new Date().toISOString(),
      tests: [],
      summary: {
        totalTests: 0,
        passed: 0,
        failed: 0,
        averageResponseTime: 0,
        maxResponseTime: 0,
        minResponseTime: Infinity,
        totalRequests: 0,
        successRate: 0,
      },
    };
    this.config = this.loadConfig();
  }

  /**
   * 主测试函数
   */
  async runTests() {
    console.log('🚀 开始性能测试...\n');

    try {
      // 检查 API 服务是否运行
      await this.checkApiService();

      // 运行各种性能测试
      await this.runLoadTest();
      await this.runStressTest();
      await this.runSpikeTest();
      await this.runVolumeTest();

      // 生成报告
      this.generateReport();

      console.log('\n✅ 性能测试完成！');
    } catch (error) {
      console.error('❌ 性能测试失败:', error.message);
      process.exit(1);
    }
  }

  /**
   * 加载配置
   */
  loadConfig() {
    const configPath = path.join(this.projectRoot, 'performance-config.json');

    // 默认配置
    const defaultConfig = {
      api: {
        baseUrl: 'http://localhost:8001',
        timeout: 30000,
      },
      tests: {
        load: {
          duration: '30s',
          rate: 10, // 每秒请求数
          users: 50,
        },
        stress: {
          duration: '60s',
          rate: 50,
          users: 100,
        },
        spike: {
          duration: '10s',
          rate: 100,
          users: 200,
        },
        volume: {
          duration: '120s',
          rate: 5,
          users: 20,
        },
      },
      thresholds: {
        responseTime: 1000, // 1秒
        errorRate: 5, // 5%
        throughput: 10, // 每秒10个请求
      },
    };

    if (fs.existsSync(configPath)) {
      try {
        const userConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        return { ...defaultConfig, ...userConfig };
      } catch (error) {
        console.log('⚠️  配置文件格式错误，使用默认配置');
        return defaultConfig;
      }
    } else {
      // 创建默认配置文件
      fs.writeFileSync(
        configPath,
        JSON.stringify(defaultConfig, null, 2),
        'utf-8'
      );
      console.log('📄 已创建默认性能测试配置文件: performance-config.json');
      return defaultConfig;
    }
  }

  /**
   * 检查 API 服务
   */
  async checkApiService() {
    console.log('🔍 检查 API 服务状态...');

    const { baseUrl } = this.config.api;

    try {
      const response = await this.makeRequest(`${baseUrl}/`);
      if (response.statusCode === 200) {
        console.log('  ✅ API 服务运行正常');
      } else {
        throw new Error(`API 服务响应异常: ${response.statusCode}`);
      }
    } catch (error) {
      console.log('  ❌ API 服务未运行或无法访问');
      console.log('  💡 请先启动 API 服务: pnpm run dev:api');
      throw error;
    }
  }

  /**
   * 运行负载测试
   */
  async runLoadTest() {
    console.log('📊 运行负载测试...');

    const testConfig = this.config.tests.load;
    const testName = '负载测试';

    try {
      const result = await this.runArtilleryTest(testName, testConfig);
      this.results.tests.push(result);
      console.log(`  ✅ ${testName} 完成`);
    } catch (error) {
      console.log(`  ❌ ${testName} 失败: ${error.message}`);
      this.results.tests.push({
        name: testName,
        status: 'failed',
        error: error.message,
      });
    }
  }

  /**
   * 运行压力测试
   */
  async runStressTest() {
    console.log('💪 运行压力测试...');

    const testConfig = this.config.tests.stress;
    const testName = '压力测试';

    try {
      const result = await this.runArtilleryTest(testName, testConfig);
      this.results.tests.push(result);
      console.log(`  ✅ ${testName} 完成`);
    } catch (error) {
      console.log(`  ❌ ${testName} 失败: ${error.message}`);
      this.results.tests.push({
        name: testName,
        status: 'failed',
        error: error.message,
      });
    }
  }

  /**
   * 运行峰值测试
   */
  async runSpikeTest() {
    console.log('⚡ 运行峰值测试...');

    const testConfig = this.config.tests.spike;
    const testName = '峰值测试';

    try {
      const result = await this.runArtilleryTest(testName, testConfig);
      this.results.tests.push(result);
      console.log(`  ✅ ${testName} 完成`);
    } catch (error) {
      console.log(`  ❌ ${testName} 失败: ${error.message}`);
      this.results.tests.push({
        name: testName,
        status: 'failed',
        error: error.message,
      });
    }
  }

  /**
   * 运行容量测试
   */
  async runVolumeTest() {
    console.log('📈 运行容量测试...');

    const testConfig = this.config.tests.volume;
    const testName = '容量测试';

    try {
      const result = await this.runArtilleryTest(testName, testConfig);
      this.results.tests.push(result);
      console.log(`  ✅ ${testName} 完成`);
    } catch (error) {
      console.log(`  ❌ ${testName} 失败: ${error.message}`);
      this.results.tests.push({
        name: testName,
        status: 'failed',
        error: error.message,
      });
    }
  }

  /**
   * 运行 Artillery 测试
   */
  async runArtilleryTest(testName, testConfig) {
    // 创建 Artillery 配置文件
    const artilleryConfig = {
      config: {
        target: this.config.api.baseUrl,
        phases: [
          {
            duration: testConfig.duration,
            arrivalRate: testConfig.rate,
            name: testName,
          },
        ],
        defaults: {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      },
      scenarios: [
        {
          name: 'API 测试场景',
          weight: 100,
          flow: [
            {
              get: {
                url: '/',
              },
            },
            {
              get: {
                url: '/users',
              },
            },
            {
              post: {
                url: '/users',
                json: {
                  name: 'Test User',
                  email: 'test@example.com',
                },
              },
            },
          ],
        },
      ],
    };

    const configPath = path.join(
      this.projectRoot,
      'temp-artillery-config.json'
    );
    fs.writeFileSync(
      configPath,
      JSON.stringify(artilleryConfig, null, 2),
      'utf-8'
    );

    try {
      // 运行 Artillery 测试
      const output = execSync(
        `npx artillery run ${configPath} --output temp-artillery-report.json`,
        {
          encoding: 'utf-8',
          cwd: this.projectRoot,
          stdio: 'pipe',
        }
      );

      // 读取测试结果
      const reportPath = path.join(
        this.projectRoot,
        'temp-artillery-report.json'
      );
      let testResult = {
        name: testName,
        status: 'passed',
        metrics: {},
      };

      if (fs.existsSync(reportPath)) {
        const reportData = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
        testResult.metrics = this.parseArtilleryReport(reportData);

        // 清理临时文件
        fs.unlinkSync(reportPath);
      }

      // 清理配置文件
      fs.unlinkSync(configPath);

      return testResult;
    } catch (error) {
      // 清理临时文件
      if (fs.existsSync(configPath)) {
        fs.unlinkSync(configPath);
      }
      if (
        fs.existsSync(path.join(this.projectRoot, 'temp-artillery-report.json'))
      ) {
        fs.unlinkSync(
          path.join(this.projectRoot, 'temp-artillery-report.json')
        );
      }

      throw error;
    }
  }

  /**
   * 解析 Artillery 报告
   */
  parseArtilleryReport(reportData) {
    const metrics = {
      requests: 0,
      responses: 0,
      errors: 0,
      responseTime: {
        min: 0,
        max: 0,
        avg: 0,
        p95: 0,
        p99: 0,
      },
      throughput: 0,
      errorRate: 0,
    };

    if (reportData.aggregate) {
      const aggregate = reportData.aggregate;
      metrics.requests = aggregate.counters?.['http.requests'] || 0;
      metrics.responses = aggregate.counters?.['http.responses'] || 0;
      metrics.errors = aggregate.counters?.['http.request_rate'] || 0;

      if (aggregate.summaries) {
        const responseTime = aggregate.summaries['http.response_time'];
        if (responseTime) {
          metrics.responseTime = {
            min: responseTime.min || 0,
            max: responseTime.max || 0,
            avg: responseTime.mean || 0,
            p95: responseTime.p95 || 0,
            p99: responseTime.p99 || 0,
          };
        }
      }

      metrics.throughput = aggregate.rates?.['http.request_rate'] || 0;
      metrics.errorRate =
        metrics.errors > 0 ? (metrics.errors / metrics.requests) * 100 : 0;
    }

    return metrics;
  }

  /**
   * 简单的 HTTP 请求
   */
  makeRequest(url) {
    return new Promise((resolve, reject) => {
      const req = http.get(url, res => {
        resolve(res);
      });

      req.on('error', reject);
      req.setTimeout(this.config.api.timeout, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  /**
   * 生成报告
   */
  generateReport() {
    console.log('\n📊 性能测试报告');
    console.log('='.repeat(50));

    // 计算汇总统计
    this.calculateSummary();

    // 显示摘要
    console.log(`\n📈 测试摘要:`);
    console.log(`  📊 总测试数: ${this.results.summary.totalTests}`);
    console.log(`  ✅ 通过: ${this.results.summary.passed}`);
    console.log(`  ❌ 失败: ${this.results.summary.failed}`);
    console.log(`  📝 总请求数: ${this.results.summary.totalRequests}`);
    console.log(
      `  ⏱️  平均响应时间: ${this.results.summary.averageResponseTime.toFixed(2)}ms`
    );
    console.log(`  🚀 最大响应时间: ${this.results.summary.maxResponseTime}ms`);
    console.log(`  🎯 成功率: ${this.results.summary.successRate.toFixed(2)}%`);

    // 显示详细结果
    this.showDetailedResults();

    // 生成建议
    this.generateRecommendations();

    // 保存报告
    this.saveReportToFile();

    // 根据阈值检查结果
    this.checkThresholds();
  }

  /**
   * 计算汇总统计
   */
  calculateSummary() {
    this.results.summary.totalTests = this.results.tests.length;
    this.results.summary.passed = this.results.tests.filter(
      t => t.status === 'passed'
    ).length;
    this.results.summary.failed = this.results.tests.filter(
      t => t.status === 'failed'
    ).length;

    let totalResponseTime = 0;
    let responseTimeCount = 0;

    this.results.tests.forEach(test => {
      if (test.metrics) {
        this.results.summary.totalRequests += test.metrics.requests || 0;

        if (test.metrics.responseTime) {
          totalResponseTime += test.metrics.responseTime.avg || 0;
          responseTimeCount++;

          this.results.summary.maxResponseTime = Math.max(
            this.results.summary.maxResponseTime,
            test.metrics.responseTime.max || 0
          );

          this.results.summary.minResponseTime = Math.min(
            this.results.summary.minResponseTime,
            test.metrics.responseTime.min || Infinity
          );
        }
      }
    });

    this.results.summary.averageResponseTime =
      responseTimeCount > 0 ? totalResponseTime / responseTimeCount : 0;
    this.results.summary.successRate =
      this.results.summary.totalRequests > 0
        ? ((this.results.summary.totalRequests - this.results.summary.failed) /
            this.results.summary.totalRequests) *
          100
        : 0;
  }

  /**
   * 显示详细结果
   */
  showDetailedResults() {
    console.log(`\n📋 详细结果:`);

    this.results.tests.forEach(test => {
      const icon = test.status === 'passed' ? '✅' : '❌';
      console.log(`\n  ${icon} ${test.name}`);

      if (test.metrics) {
        const metrics = test.metrics;
        console.log(`    📝 请求数: ${metrics.requests}`);
        console.log(
          `    ⏱️  平均响应时间: ${metrics.responseTime?.avg?.toFixed(2) || 0}ms`
        );
        console.log(`    🚀 最大响应时间: ${metrics.responseTime?.max || 0}ms`);
        console.log(
          `    📊 吞吐量: ${metrics.throughput?.toFixed(2) || 0} req/s`
        );
        console.log(`    ❌ 错误率: ${metrics.errorRate?.toFixed(2) || 0}%`);
      }

      if (test.error) {
        console.log(`    ❌ 错误: ${test.error}`);
      }
    });
  }

  /**
   * 生成建议
   */
  generateRecommendations() {
    console.log(`\n💡 性能优化建议:`);

    const { thresholds } = this.config;

    if (this.results.summary.averageResponseTime > thresholds.responseTime) {
      console.log(
        `  1. ⏱️  响应时间过长 (${this.results.summary.averageResponseTime.toFixed(2)}ms > ${thresholds.responseTime}ms)`
      );
      console.log(`     - 优化数据库查询`);
      console.log(`     - 添加缓存机制`);
      console.log(`     - 优化算法复杂度`);
    }

    if (this.results.summary.successRate < 100 - thresholds.errorRate) {
      console.log(
        `  2. ❌ 错误率过高 (${(100 - this.results.summary.successRate).toFixed(2)}% > ${thresholds.errorRate}%)`
      );
      console.log(`     - 检查错误日志`);
      console.log(`     - 增加错误处理`);
      console.log(`     - 优化资源使用`);
    }

    if (this.results.summary.maxResponseTime > thresholds.responseTime * 2) {
      console.log(
        `  3. 🚀 最大响应时间过长 (${this.results.summary.maxResponseTime}ms)`
      );
      console.log(`     - 检查慢查询`);
      console.log(`     - 优化数据库索引`);
      console.log(`     - 考虑分页加载`);
    }

    console.log(`\n🛠️  优化命令:`);
    console.log(`  pnpm run check:quality     # 检查代码质量`);
    console.log(`  pnpm run check:security    # 检查安全问题`);
    console.log(`  pnpm run db:backup         # 备份数据库`);
  }

  /**
   * 检查性能阈值
   */
  checkThresholds() {
    const { thresholds } = this.config;
    let hasIssues = false;

    if (this.results.summary.averageResponseTime > thresholds.responseTime) {
      console.log(
        `\n⚠️  平均响应时间超过阈值: ${this.results.summary.averageResponseTime.toFixed(2)}ms > ${thresholds.responseTime}ms`
      );
      hasIssues = true;
    }

    if (this.results.summary.successRate < 100 - thresholds.errorRate) {
      console.log(
        `\n⚠️  错误率超过阈值: ${(100 - this.results.summary.successRate).toFixed(2)}% > ${thresholds.errorRate}%`
      );
      hasIssues = true;
    }

    if (hasIssues) {
      console.log('\n❌ 性能测试未达到预期指标，建议优化后重试。');
      process.exit(1);
    } else {
      console.log('\n✅ 性能测试通过所有阈值检查！');
    }
  }

  /**
   * 保存报告到文件
   */
  saveReportToFile() {
    const outputDir = path.join(
      this.projectRoot,
      'docs',
      'generated',
      'reports',
      'monitoring'
    );
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 保存 JSON 报告
    const jsonPath = path.join(outputDir, 'performance-test.json');
    fs.writeFileSync(jsonPath, JSON.stringify(this.results, null, 2), 'utf-8');

    // 生成 Markdown 报告
    const markdownReport = this.generateMarkdownReport();
    const mdPath = path.join(outputDir, 'performance-test.md');
    fs.writeFileSync(mdPath, markdownReport, 'utf-8');

    console.log(`\n📄 性能测试报告已保存:`);
    console.log(`  JSON: ${jsonPath}`);
    console.log(`  Markdown: ${mdPath}`);
  }

  /**
   * 生成 Markdown 报告
   */
  generateMarkdownReport() {
    const timestamp = new Date().toISOString();

    let report = `# 性能测试报告\n\n`;
    report += `**生成时间**: ${timestamp}\n\n`;

    // 摘要
    report += `## 📊 测试摘要\n\n`;
    report += `| 指标 | 数值 |\n`;
    report += `|------|------|\n`;
    report += `| 📊 总测试数 | ${this.results.summary.totalTests} |\n`;
    report += `| ✅ 通过 | ${this.results.summary.passed} |\n`;
    report += `| ❌ 失败 | ${this.results.summary.failed} |\n`;
    report += `| 📝 总请求数 | ${this.results.summary.totalRequests} |\n`;
    report += `| ⏱️ 平均响应时间 | ${this.results.summary.averageResponseTime.toFixed(2)}ms |\n`;
    report += `| 🚀 最大响应时间 | ${this.results.summary.maxResponseTime}ms |\n`;
    report += `| 🎯 成功率 | ${this.results.summary.successRate.toFixed(2)}% |\n\n`;

    // 详细结果
    if (this.results.tests.length > 0) {
      report += `## 📋 详细测试结果\n\n`;

      this.results.tests.forEach(test => {
        const icon = test.status === 'passed' ? '✅' : '❌';
        report += `### ${icon} ${test.name}\n\n`;

        if (test.metrics) {
          const metrics = test.metrics;
          report += `| 指标 | 数值 |\n`;
          report += `|------|------|\n`;
          report += `| 📝 请求数 | ${metrics.requests} |\n`;
          report += `| ⏱️ 平均响应时间 | ${metrics.responseTime?.avg?.toFixed(2) || 0}ms |\n`;
          report += `| 🚀 最大响应时间 | ${metrics.responseTime?.max || 0}ms |\n`;
          report += `| 📊 吞吐量 | ${metrics.throughput?.toFixed(2) || 0} req/s |\n`;
          report += `| ❌ 错误率 | ${metrics.errorRate?.toFixed(2) || 0}% |\n\n`;
        }

        if (test.error) {
          report += `**错误信息**: ${test.error}\n\n`;
        }
      });
    }

    // 性能阈值
    report += `## 🎯 性能阈值\n\n`;
    report += `| 指标 | 阈值 | 实际值 | 状态 |\n`;
    report += `|------|------|--------|------|\n`;

    const { thresholds } = this.config;
    const responseTimeStatus =
      this.results.summary.averageResponseTime <= thresholds.responseTime
        ? '✅ 通过'
        : '❌ 超限';
    const errorRateStatus =
      this.results.summary.successRate >= 100 - thresholds.errorRate
        ? '✅ 通过'
        : '❌ 超限';

    report += `| 响应时间 | ${thresholds.responseTime}ms | ${this.results.summary.averageResponseTime.toFixed(2)}ms | ${responseTimeStatus} |\n`;
    report += `| 错误率 | ${thresholds.errorRate}% | ${(100 - this.results.summary.successRate).toFixed(2)}% | ${errorRateStatus} |\n\n`;

    // 优化建议
    report += `## 💡 优化建议\n\n`;
    report += `\`\`\`bash\n`;
    report += `# 运行代码质量检查\n`;
    report += `pnpm run check:quality\n\n`;
    report += `# 运行安全审计\n`;
    report += `pnpm run check:security\n\n`;
    report += `# 备份数据库\n`;
    report += `pnpm run db:backup\n`;
    report += `\`\`\`\n\n`;

    report += `---\n\n`;
    report += `*此报告由性能测试脚本自动生成*\n`;

    return report;
  }
}

// 执行性能测试
const tester = new PerformanceTester();
tester.runTests().catch(console.error);

export { PerformanceTester };
