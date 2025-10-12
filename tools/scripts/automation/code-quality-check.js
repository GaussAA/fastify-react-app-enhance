#!/usr/bin/env node

/**
 * 代码质量检查脚本
 *
 * 分析代码复杂度和质量指标
 */

import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
  unlinkSync,
} from 'fs';
import { join, dirname, basename } from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class CodeQualityChecker {
  constructor() {
    this.projectRoot = join(__dirname, '../../..');
    this.results = {
      complexity: [],
      duplication: [],
      typeErrors: [],
      lintErrors: [],
      metrics: {
        totalFiles: 0,
        totalLines: 0,
        totalFunctions: 0,
        averageComplexity: 0,
        duplicateLines: 0,
        typeErrors: 0,
        lintErrors: 0,
      },
    };
  }

  /**
   * 主检查函数
   */
  async check() {
    console.log('🔍 开始代码质量检查...\n');

    try {
      // 代码复杂度分析
      await this.analyzeComplexity();

      // 代码重复检测
      await this.checkDuplication();

      // TypeScript 类型检查
      await this.checkTypeScript();

      // ESLint 检查
      await this.checkLinting();

      // 生成报告
      this.generateReport();
    } catch (error) {
      console.error('❌ 代码质量检查失败:', error.message);
      process.exit(1);
    }
  }

  /**
   * 分析代码复杂度
   */
  async analyzeComplexity() {
    console.log('📊 分析代码复杂度...');

    try {
      // 使用 ESLint 的复杂度规则
      const eslintResult = execSync(
        'npx eslint . --ext .ts,.tsx,.js,.jsx --format json',
        {
          encoding: 'utf-8',
          cwd: this.projectRoot,
          stdio: 'pipe',
        }
      );

      const eslintData = JSON.parse(eslintResult);

      eslintData.forEach(file => {
        if (file.messages) {
          file.messages.forEach(message => {
            if (message.ruleId === 'complexity') {
              this.results.complexity.push({
                file: file.filePath,
                line: message.line,
                column: message.column,
                complexity: message.message.match(/\d+/)?.[0] || 'unknown',
                message: message.message,
              });
            }
          });
        }
      });

      console.log(`  📈 发现 ${this.results.complexity.length} 个复杂度问题`);
    } catch (error) {
      console.log('  ⚠️  无法运行复杂度分析');
    }
  }

  /**
   * 检查代码重复
   */
  async checkDuplication() {
    console.log('🔄 检查代码重复...');

    try {
      // 使用 jscpd 检查重复代码
      const jscpdResult = execSync(
        'npx jscpd --min-lines 5 --min-tokens 70 --format json --output ./temp-jscpd-report.json .',
        {
          encoding: 'utf-8',
          cwd: this.projectRoot,
          stdio: 'pipe',
        }
      );

      // 读取报告文件
      const reportPath = join(this.projectRoot, 'temp-jscpd-report.json');
      if (existsSync(reportPath)) {
        const reportData = JSON.parse(readFileSync(reportPath, 'utf-8'));

        if (reportData.duplicates) {
          reportData.duplicates.forEach(duplicate => {
            this.results.duplication.push({
              file1: duplicate.firstFile.name,
              file2: duplicate.secondFile.name,
              lines: duplicate.lines,
              tokens: duplicate.tokens,
              percentage: duplicate.percentage,
            });
          });
        }

        // 清理临时文件
        unlinkSync(reportPath);
      }

      console.log(`  🔄 发现 ${this.results.duplication.length} 处重复代码`);
    } catch (error) {
      console.log(
        '  ⚠️  无法运行重复代码检查，请安装 jscpd: npm install -g jscpd'
      );
    }
  }

  /**
   * TypeScript 类型检查
   */
  async checkTypeScript() {
    console.log('📝 检查 TypeScript 类型...');

    try {
      // 检查 API 项目
      const apiTscResult = execSync('npx tsc --noEmit --pretty', {
        encoding: 'utf-8',
        cwd: join(this.projectRoot, 'apps/api'),
        stdio: 'pipe',
      });

      console.log('  ✅ API 项目类型检查通过');
    } catch (error) {
      // TypeScript 错误会输出到 stderr
      const errorOutput = error.stderr || error.stdout || '';
      const lines = errorOutput.split('\n');

      lines.forEach(line => {
        if (line.includes('error TS')) {
          const match = line.match(/\((\d+),(\d+)\): error TS(\d+): (.+)/);
          if (match) {
            this.results.typeErrors.push({
              line: parseInt(match[1]),
              column: parseInt(match[2]),
              code: match[3],
              message: match[4],
              file: 'apps/api',
            });
          }
        }
      });

      console.log(`  ❌ 发现 ${this.results.typeErrors.length} 个类型错误`);
    }

    try {
      // 检查 Web 项目
      const webTscResult = execSync('npx tsc --noEmit --pretty', {
        encoding: 'utf-8',
        cwd: join(this.projectRoot, 'apps/web'),
        stdio: 'pipe',
      });

      console.log('  ✅ Web 项目类型检查通过');
    } catch (error) {
      const errorOutput = error.stderr || error.stdout || '';
      const lines = errorOutput.split('\n');

      lines.forEach(line => {
        if (line.includes('error TS')) {
          const match = line.match(/\((\d+),(\d+)\): error TS(\d+): (.+)/);
          if (match) {
            this.results.typeErrors.push({
              line: parseInt(match[1]),
              column: parseInt(match[2]),
              code: match[3],
              message: match[4],
              file: 'apps/web',
            });
          }
        }
      });
    }
  }

  /**
   * ESLint 检查
   */
  async checkLinting() {
    console.log('🔍 检查代码规范...');

    try {
      const eslintResult = execSync(
        'npx eslint . --ext .ts,.tsx,.js,.jsx --format json',
        {
          encoding: 'utf-8',
          cwd: this.projectRoot,
          stdio: 'pipe',
        }
      );

      const eslintData = JSON.parse(eslintResult);

      eslintData.forEach(file => {
        if (file.messages) {
          file.messages.forEach(message => {
            this.results.lintErrors.push({
              file: file.filePath,
              line: message.line,
              column: message.column,
              rule: message.ruleId,
              severity: message.severity,
              message: message.message,
            });
          });
        }
      });

      console.log(`  🔍 发现 ${this.results.lintErrors.length} 个代码规范问题`);
    } catch (error) {
      // ESLint 错误会返回非零退出码
      if (error.status === 1) {
        const eslintData = JSON.parse(error.stdout || '[]');

        eslintData.forEach(file => {
          if (file.messages) {
            file.messages.forEach(message => {
              this.results.lintErrors.push({
                file: file.filePath,
                line: message.line,
                column: message.column,
                rule: message.ruleId,
                severity: message.severity,
                message: message.message,
              });
            });
          }
        });

        console.log(
          `  🔍 发现 ${this.results.lintErrors.length} 个代码规范问题`
        );
      } else {
        console.log('  ⚠️  无法运行 ESLint 检查');
      }
    }
  }

  /**
   * 计算代码指标
   */
  calculateMetrics() {
    // 统计文件数量
    const sourceFiles = this.findSourceFiles();
    this.results.metrics.totalFiles = sourceFiles.length;

    // 统计代码行数
    let totalLines = 0;
    sourceFiles.forEach(file => {
      try {
        const content = readFileSync(file, 'utf-8');
        const lines = content.split('\n').length;
        totalLines += lines;
      } catch (error) {
        // 忽略无法读取的文件
      }
    });
    this.results.metrics.totalLines = totalLines;

    // 统计函数数量（简单估算）
    this.results.metrics.totalFunctions = this.results.complexity.length;

    // 计算平均复杂度
    if (this.results.complexity.length > 0) {
      const totalComplexity = this.results.complexity.reduce((sum, item) => {
        return sum + parseInt(item.complexity || 0);
      }, 0);
      this.results.metrics.averageComplexity =
        Math.round((totalComplexity / this.results.complexity.length) * 100) /
        100;
    }

    // 统计重复行数
    this.results.metrics.duplicateLines = this.results.duplication.reduce(
      (sum, item) => {
        return sum + (item.lines || 0);
      },
      0
    );

    // 统计错误数量
    this.results.metrics.typeErrors = this.results.typeErrors.length;
    this.results.metrics.lintErrors = this.results.lintErrors.length;
  }

  /**
   * 查找源代码文件
   */
  findSourceFiles() {
    const files = [];
    const extensions = ['.ts', '.tsx', '.js', '.jsx'];

    const scanDir = dir => {
      try {
        const items = readdirSync(dir);
        items.forEach(item => {
          const itemPath = join(dir, item);
          const stat = statSync(itemPath);

          if (
            stat.isDirectory() &&
            !item.startsWith('.') &&
            item !== 'node_modules'
          ) {
            scanDir(itemPath);
          } else if (
            stat.isFile() &&
            extensions.some(ext => item.endsWith(ext))
          ) {
            files.push(itemPath);
          }
        });
      } catch (error) {
        // 忽略权限错误
      }
    };

    scanDir(this.projectRoot);
    return files;
  }

  /**
   * 生成报告
   */
  generateReport() {
    console.log('\n📊 代码质量报告');
    console.log('='.repeat(50));

    // 计算指标
    this.calculateMetrics();

    // 显示摘要
    console.log(`\n📈 代码质量摘要:`);
    console.log(`  📁 总文件数: ${this.results.metrics.totalFiles}`);
    console.log(
      `  📝 总代码行数: ${this.results.metrics.totalLines.toLocaleString()}`
    );
    console.log(`  🔧 总函数数: ${this.results.metrics.totalFunctions}`);
    console.log(`  📊 平均复杂度: ${this.results.metrics.averageComplexity}`);
    console.log(`  🔄 重复代码行数: ${this.results.metrics.duplicateLines}`);
    console.log(`  ❌ 类型错误: ${this.results.metrics.typeErrors}`);
    console.log(`  🔍 代码规范问题: ${this.results.metrics.lintErrors}`);

    // 显示详细问题
    this.showDetailedIssues();

    // 生成建议
    this.generateRecommendations();

    // 保存报告
    this.saveReportToFile();

    // 根据错误数量决定退出码
    const totalErrors =
      this.results.metrics.typeErrors + this.results.metrics.lintErrors;
    if (totalErrors > 0) {
      console.log('\n⚠️  发现代码质量问题，建议修复后重试。');
    } else {
      console.log('\n✅ 代码质量检查通过！');
    }
  }

  /**
   * 显示详细问题
   */
  showDetailedIssues() {
    // 显示复杂度问题
    if (this.results.complexity.length > 0) {
      console.log(`\n📊 复杂度问题 (前5个):`);
      this.results.complexity.slice(0, 5).forEach(item => {
        console.log(
          `  ⚠️  ${item.file.replace(this.projectRoot, '')}:${item.line} - 复杂度 ${item.complexity}`
        );
      });
    }

    // 显示重复代码
    if (this.results.duplication.length > 0) {
      console.log(`\n🔄 重复代码 (前3个):`);
      this.results.duplication.slice(0, 3).forEach(item => {
        console.log(
          `  🔄 ${item.file1.replace(this.projectRoot, '')} ↔ ${item.file2.replace(this.projectRoot, '')} (${item.percentage}%)`
        );
      });
    }

    // 显示类型错误
    if (this.results.typeErrors.length > 0) {
      console.log(`\n❌ 类型错误 (前5个):`);
      this.results.typeErrors.slice(0, 5).forEach(item => {
        console.log(
          `  ❌ ${item.file}:${item.line}:${item.column} - ${item.message}`
        );
      });
    }

    // 显示代码规范问题
    if (this.results.lintErrors.length > 0) {
      console.log(`\n🔍 代码规范问题 (前5个):`);
      this.results.lintErrors.slice(0, 5).forEach(item => {
        const severity = item.severity === 2 ? '❌' : '⚠️';
        console.log(
          `  ${severity} ${item.file.replace(this.projectRoot, '')}:${item.line} - ${item.message}`
        );
      });
    }
  }

  /**
   * 生成建议
   */
  generateRecommendations() {
    console.log(`\n💡 改进建议:`);

    if (this.results.metrics.averageComplexity > 10) {
      console.log(`  1. 📊 降低代码复杂度，考虑拆分复杂函数`);
    }

    if (this.results.metrics.duplicateLines > 100) {
      console.log(`  2. 🔄 减少重复代码，提取公共函数或组件`);
    }

    if (this.results.metrics.typeErrors > 0) {
      console.log(`  3. ❌ 修复 TypeScript 类型错误`);
    }

    if (this.results.metrics.lintErrors > 0) {
      console.log(`  4. 🔍 修复代码规范问题`);
    }

    console.log(`\n🛠️  修复命令:`);
    console.log(`  pnpm run lint:fix          # 自动修复代码规范问题`);
    console.log(`  pnpm run format            # 格式化代码`);
    console.log(`  npx tsc --noEmit           # 检查类型错误`);
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
    const jsonPath = join(outputDir, 'code-quality.json');
    writeFileSync(jsonPath, JSON.stringify(this.results, null, 2), 'utf-8');

    // 生成 Markdown 报告
    const markdownReport = this.generateMarkdownReport();
    const mdPath = join(outputDir, 'code-quality.md');
    writeFileSync(mdPath, markdownReport, 'utf-8');

    console.log(`\n📄 代码质量报告已保存:`);
    console.log(`  JSON: ${jsonPath}`);
    console.log(`  Markdown: ${mdPath}`);
  }

  /**
   * 生成 Markdown 报告
   */
  generateMarkdownReport() {
    const timestamp = new Date().toISOString();

    let report = `# 代码质量报告\n\n`;
    report += `**生成时间**: ${timestamp}\n\n`;

    // 摘要
    report += `## 📊 代码质量摘要\n\n`;
    report += `| 指标 | 数值 |\n`;
    report += `|------|------|\n`;
    report += `| 📁 总文件数 | ${this.results.metrics.totalFiles} |\n`;
    report += `| 📝 总代码行数 | ${this.results.metrics.totalLines.toLocaleString()} |\n`;
    report += `| 🔧 总函数数 | ${this.results.metrics.totalFunctions} |\n`;
    report += `| 📊 平均复杂度 | ${this.results.metrics.averageComplexity} |\n`;
    report += `| 🔄 重复代码行数 | ${this.results.metrics.duplicateLines} |\n`;
    report += `| ❌ 类型错误 | ${this.results.metrics.typeErrors} |\n`;
    report += `| 🔍 代码规范问题 | ${this.results.metrics.lintErrors} |\n\n`;

    // 复杂度问题
    if (this.results.complexity.length > 0) {
      report += `## 📊 复杂度问题\n\n`;
      report += `| 文件 | 行号 | 复杂度 |\n`;
      report += `|------|------|--------|\n`;
      this.results.complexity.forEach(item => {
        report += `| ${item.file.replace(this.projectRoot, '')} | ${item.line} | ${item.complexity} |\n`;
      });
      report += '\n';
    }

    // 重复代码
    if (this.results.duplication.length > 0) {
      report += `## 🔄 重复代码\n\n`;
      report += `| 文件1 | 文件2 | 重复率 | 行数 |\n`;
      report += `|-------|-------|--------|------|\n`;
      this.results.duplication.forEach(item => {
        report += `| ${item.file1.replace(this.projectRoot, '')} | ${item.file2.replace(this.projectRoot, '')} | ${item.percentage}% | ${item.lines} |\n`;
      });
      report += '\n';
    }

    // 类型错误
    if (this.results.typeErrors.length > 0) {
      report += `## ❌ 类型错误\n\n`;
      report += `| 文件 | 行号 | 列号 | 错误代码 | 消息 |\n`;
      report += `|------|------|------|----------|------|\n`;
      this.results.typeErrors.forEach(item => {
        report += `| ${item.file} | ${item.line} | ${item.column} | TS${item.code} | ${item.message} |\n`;
      });
      report += '\n';
    }

    // 代码规范问题
    if (this.results.lintErrors.length > 0) {
      report += `## 🔍 代码规范问题\n\n`;
      report += `| 文件 | 行号 | 规则 | 严重程度 | 消息 |\n`;
      report += `|------|------|------|----------|------|\n`;
      this.results.lintErrors.forEach(item => {
        const severity = item.severity === 2 ? '错误' : '警告';
        report += `| ${item.file.replace(this.projectRoot, '')} | ${item.line} | ${item.rule} | ${severity} | ${item.message} |\n`;
      });
      report += '\n';
    }

    // 修复建议
    report += `## 💡 修复建议\n\n`;
    report += `\`\`\`bash\n`;
    report += `# 自动修复代码规范问题\n`;
    report += `pnpm run lint:fix\n\n`;
    report += `# 格式化代码\n`;
    report += `pnpm run format\n\n`;
    report += `# 检查类型错误\n`;
    report += `npx tsc --noEmit\n`;
    report += `\`\`\`\n\n`;

    report += `---\n\n`;
    report += `*此报告由代码质量检查脚本自动生成*\n`;

    return report;
  }
}

// 主函数
async function main() {
  const checker = new CodeQualityChecker();
  await checker.check();
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { CodeQualityChecker };
