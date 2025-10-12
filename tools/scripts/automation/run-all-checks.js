#!/usr/bin/env node

/**
 * 综合自动化检查脚本
 *
 * 运行所有自动化检查和任务
 */

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class ComprehensiveChecker {
  constructor() {
    this.projectRoot = join(__dirname, '../../..');
    this.results = {
      timestamp: new Date().toISOString(),
      checks: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        warnings: 0,
      },
    };
  }

  /**
   * 主检查函数
   */
  async runAllChecks() {
    console.log('🚀 开始综合自动化检查...\n');

    try {
      // 运行各种检查
      await this.runCheck('环境检查', 'pnpm run check:env');
      await this.runCheck('安全审计', 'pnpm run check:security');
      await this.runCheck('代码质量检查', 'pnpm run check:quality');
      await this.runCheck('代码规范检查', 'pnpm run lint');
      await this.runCheck('代码格式化检查', 'pnpm run format:check');
      await this.runCheck('TypeScript 类型检查', 'npx tsc --noEmit');
      await this.runCheck('测试运行', 'pnpm run test');

      // 生成综合报告
      this.generateComprehensiveReport();

      // 根据结果决定退出码
      if (this.results.summary.failed > 0) {
        console.log('\n❌ 部分检查未通过，请查看详细报告。');
        process.exit(1);
      } else {
        console.log('\n✅ 所有检查通过！');
      }
    } catch (error) {
      console.error('❌ 综合检查失败:', error.message);
      process.exit(1);
    }
  }

  /**
   * 运行单个检查
   */
  async runCheck(name, command) {
    console.log(`🔍 运行 ${name}...`);

    const startTime = Date.now();
    let result = {
      name,
      command,
      status: 'unknown',
      duration: 0,
      output: '',
      error: '',
    };

    try {
      const output = execSync(command, {
        encoding: 'utf-8',
        cwd: this.projectRoot,
        stdio: 'pipe',
      });

      result.status = 'passed';
      result.output = output;
      result.duration = Date.now() - startTime;

      console.log(`  ✅ ${name} 通过 (${result.duration}ms)`);
      this.results.summary.passed++;
    } catch (error) {
      result.status = 'failed';
      result.output = error.stdout || '';
      result.error = error.stderr || error.message;
      result.duration = Date.now() - startTime;

      // 检查是否是警告级别的错误
      if (
        error.status === 1 &&
        (result.output.includes('warning') || result.error.includes('warning'))
      ) {
        result.status = 'warning';
        console.log(`  ⚠️  ${name} 有警告 (${result.duration}ms)`);
        this.results.summary.warnings++;
      } else {
        console.log(`  ❌ ${name} 失败 (${result.duration}ms)`);
        this.results.summary.failed++;
      }
    }

    this.results.checks.push(result);
    this.results.summary.total++;
  }

  /**
   * 生成综合报告
   */
  generateComprehensiveReport() {
    console.log('\n📊 综合检查报告');
    console.log('='.repeat(60));

    // 显示摘要
    console.log(`\n📈 检查摘要:`);
    console.log(`  ✅ 通过: ${this.results.summary.passed}`);
    console.log(`  ⚠️  警告: ${this.results.summary.warnings}`);
    console.log(`  ❌ 失败: ${this.results.summary.failed}`);
    console.log(`  📊 总计: ${this.results.summary.total}`);

    const successRate = Math.round(
      (this.results.summary.passed / this.results.summary.total) * 100
    );
    console.log(`  🎯 成功率: ${successRate}%`);

    // 显示详细结果
    console.log(`\n📋 详细结果:`);
    this.results.checks.forEach(check => {
      const icon =
        check.status === 'passed'
          ? '✅'
          : check.status === 'warning'
            ? '⚠️'
            : '❌';
      const duration = `${check.duration}ms`;
      console.log(`  ${icon} ${check.name} (${duration})`);

      if (check.status === 'failed' && check.error) {
        console.log(`     错误: ${check.error.split('\n')[0]}`);
      }
    });

    // 生成建议
    this.generateRecommendations();

    // 保存报告
    this.saveReportToFile();
  }

  /**
   * 生成建议
   */
  generateRecommendations() {
    console.log(`\n💡 改进建议:`);

    const failedChecks = this.results.checks.filter(
      check => check.status === 'failed'
    );
    const warningChecks = this.results.checks.filter(
      check => check.status === 'warning'
    );

    if (failedChecks.length > 0) {
      console.log(`\n🔴 需要修复的问题:`);
      failedChecks.forEach(check => {
        console.log(
          `  - ${check.name}: ${this.getCheckRecommendation(check.name)}`
        );
      });
    }

    if (warningChecks.length > 0) {
      console.log(`\n🟡 建议改进:`);
      warningChecks.forEach(check => {
        console.log(
          `  - ${check.name}: ${this.getCheckRecommendation(check.name)}`
        );
      });
    }

    console.log(`\n🛠️  常用修复命令:`);
    console.log(`  pnpm run lint:fix          # 自动修复代码规范问题`);
    console.log(`  pnpm run format            # 格式化代码`);
    console.log(`  pnpm run test              # 运行测试`);
    console.log(`  pnpm run check:security    # 安全审计`);
    console.log(`  pnpm run check:quality     # 代码质量检查`);
  }

  /**
   * 获取检查建议
   */
  getCheckRecommendation(checkName) {
    const recommendations = {
      环境检查: '检查 Node.js、pnpm、Docker 等环境配置',
      安全审计: '运行 pnpm audit --fix 修复安全漏洞',
      代码质量检查: '修复代码复杂度和重复问题',
      代码规范检查: '运行 pnpm run lint:fix 自动修复',
      代码格式化检查: '运行 pnpm run format 格式化代码',
      'TypeScript 类型检查': '修复 TypeScript 类型错误',
      测试运行: '修复失败的测试用例',
    };

    return recommendations[checkName] || '查看详细错误信息';
  }

  /**
   * 保存报告到文件
   */
  saveReportToFile() {
    const outputDir = join(
      this.projectRoot,
      'docs',
      'generated',
      'reports',
      'checks'
    );
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    // 保存 JSON 报告
    const jsonPath = join(outputDir, 'comprehensive-check.json');
    writeFileSync(jsonPath, JSON.stringify(this.results, null, 2), 'utf-8');

    // 生成 Markdown 报告
    const markdownReport = this.generateMarkdownReport();
    const mdPath = join(outputDir, 'comprehensive-check.md');
    writeFileSync(mdPath, markdownReport, 'utf-8');

    console.log(`\n📄 综合检查报告已保存:`);
    console.log(`  JSON: ${jsonPath}`);
    console.log(`  Markdown: ${mdPath}`);
  }

  /**
   * 生成 Markdown 报告
   */
  generateMarkdownReport() {
    const timestamp = new Date().toISOString();

    let report = `# 综合自动化检查报告\n\n`;
    report += `**生成时间**: ${timestamp}\n\n`;

    // 摘要
    const successRate = Math.round(
      (this.results.summary.passed / this.results.summary.total) * 100
    );
    report += `## 📊 检查摘要\n\n`;
    report += `| 状态 | 数量 | 百分比 |\n`;
    report += `|------|------|--------|\n`;
    report += `| ✅ 通过 | ${this.results.summary.passed} | ${Math.round((this.results.summary.passed / this.results.summary.total) * 100)}% |\n`;
    report += `| ⚠️ 警告 | ${this.results.summary.warnings} | ${Math.round((this.results.summary.warnings / this.results.summary.total) * 100)}% |\n`;
    report += `| ❌ 失败 | ${this.results.summary.failed} | ${Math.round((this.results.summary.failed / this.results.summary.total) * 100)}% |\n`;
    report += `| 📊 总计 | ${this.results.summary.total} | 100% |\n\n`;
    report += `**成功率**: ${successRate}%\n\n`;

    // 详细结果
    report += `## 📋 详细结果\n\n`;
    report += `| 检查项目 | 状态 | 耗时 | 命令 |\n`;
    report += `|----------|------|------|------|\n`;

    this.results.checks.forEach(check => {
      const icon =
        check.status === 'passed'
          ? '✅'
          : check.status === 'warning'
            ? '⚠️'
            : '❌';
      const status =
        check.status === 'passed'
          ? '通过'
          : check.status === 'warning'
            ? '警告'
            : '失败';
      report += `| ${icon} ${check.name} | ${status} | ${check.duration}ms | \`${check.command}\` |\n`;
    });

    report += '\n';

    // 失败和警告详情
    const failedChecks = this.results.checks.filter(
      check => check.status === 'failed'
    );
    const warningChecks = this.results.checks.filter(
      check => check.status === 'warning'
    );

    if (failedChecks.length > 0) {
      report += `## ❌ 失败检查详情\n\n`;
      failedChecks.forEach(check => {
        report += `### ${check.name}\n\n`;
        report += `**命令**: \`${check.command}\`\n\n`;
        if (check.error) {
          report += `**错误信息**:\n`;
          report += `\`\`\`\n${check.error}\n\`\`\`\n\n`;
        }
        report += `**建议**: ${this.getCheckRecommendation(check.name)}\n\n`;
      });
    }

    if (warningChecks.length > 0) {
      report += `## ⚠️ 警告检查详情\n\n`;
      warningChecks.forEach(check => {
        report += `### ${check.name}\n\n`;
        report += `**命令**: \`${check.command}\`\n\n`;
        if (check.error) {
          report += `**警告信息**:\n`;
          report += `\`\`\`\n${check.error}\n\`\`\`\n\n`;
        }
        report += `**建议**: ${this.getCheckRecommendation(check.name)}\n\n`;
      });
    }

    // 修复建议
    report += `## 💡 修复建议\n\n`;
    report += `\`\`\`bash\n`;
    report += `# 自动修复代码规范问题\n`;
    report += `pnpm run lint:fix\n\n`;
    report += `# 格式化代码\n`;
    report += `pnpm run format\n\n`;
    report += `# 运行测试\n`;
    report += `pnpm run test\n\n`;
    report += `# 安全审计\n`;
    report += `pnpm run check:security\n\n`;
    report += `# 代码质量检查\n`;
    report += `pnpm run check:quality\n`;
    report += `\`\`\`\n\n`;

    report += `---\n\n`;
    report += `*此报告由综合自动化检查脚本生成*\n`;

    return report;
  }
}

// 主函数
async function main() {
  const checker = new ComprehensiveChecker();
  await checker.runAllChecks();
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { ComprehensiveChecker };
