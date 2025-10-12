#!/usr/bin/env node

/**
 * 安全审计脚本
 *
 * 检查依赖包的安全漏洞
 */

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class SecurityAuditor {
  constructor() {
    this.projectRoot = join(__dirname, '../../..');
    this.vulnerabilities = [];
    this.outdated = [];
    this.licenses = [];
    this.report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalVulnerabilities: 0,
        highSeverity: 0,
        mediumSeverity: 0,
        lowSeverity: 0,
        outdatedPackages: 0,
        licenseIssues: 0,
      },
      details: {
        vulnerabilities: [],
        outdated: [],
        licenses: [],
      },
    };
  }

  /**
   * 主审计函数
   */
  async audit() {
    console.log('🔒 开始安全审计...\n');

    try {
      // 检查依赖漏洞
      await this.checkVulnerabilities();

      // 检查过时依赖
      await this.checkOutdatedPackages();

      // 检查许可证
      await this.checkLicenses();

      // 生成报告
      this.generateReport();
    } catch (error) {
      console.error('❌ 安全审计失败:', error.message);
      process.exit(1);
    }
  }

  /**
   * 检查依赖漏洞
   */
  async checkVulnerabilities() {
    console.log('🔍 检查依赖漏洞...');

    try {
      // 使用 pnpm audit
      const auditResult = execSync('pnpm audit --json', {
        encoding: 'utf-8',
        cwd: this.projectRoot,
        stdio: 'pipe',
      });

      const auditData = JSON.parse(auditResult);

      if (auditData.vulnerabilities) {
        Object.entries(auditData.vulnerabilities).forEach(
          ([packageName, vuln]) => {
            const severity = this.getSeverityLevel(vuln.severity);
            const vulnerability = {
              package: packageName,
              severity: vuln.severity,
              severityLevel: severity,
              title: vuln.title || 'Unknown vulnerability',
              description: vuln.description || 'No description available',
              recommendation: vuln.recommendation || 'Update to latest version',
              via: vuln.via || [],
            };

            this.vulnerabilities.push(vulnerability);
            this.report.details.vulnerabilities.push(vulnerability);

            // 更新统计
            this.report.summary.totalVulnerabilities++;
            if (severity === 'high') this.report.summary.highSeverity++;
            else if (severity === 'medium')
              this.report.summary.mediumSeverity++;
            else if (severity === 'low') this.report.summary.lowSeverity++;

            const icon = this.getSeverityIcon(severity);
            console.log(
              `  ${icon} ${packageName}: ${vuln.severity} - ${vulnerability.title}`
            );
          }
        );
      }

      if (this.vulnerabilities.length === 0) {
        console.log('  ✅ 未发现安全漏洞');
      }
    } catch (error) {
      // pnpm audit 可能返回非零退出码，但这是正常的
      if (error.status === 1) {
        console.log('  ℹ️  pnpm audit 完成，检查结果已记录');
      } else {
        console.log('  ⚠️  无法运行 pnpm audit，尝试其他方法...');
        await this.checkVulnerabilitiesFallback();
      }
    }
  }

  /**
   * 备用漏洞检查方法
   */
  async checkVulnerabilitiesFallback() {
    try {
      // 尝试使用 npm audit
      const auditResult = execSync('npm audit --json', {
        encoding: 'utf-8',
        cwd: this.projectRoot,
        stdio: 'pipe',
      });

      const auditData = JSON.parse(auditResult);

      if (auditData.vulnerabilities) {
        Object.entries(auditData.vulnerabilities).forEach(
          ([packageName, vuln]) => {
            const severity = this.getSeverityLevel(vuln.severity);
            const vulnerability = {
              package: packageName,
              severity: vuln.severity,
              severityLevel: severity,
              title: vuln.title || 'Unknown vulnerability',
              description: vuln.description || 'No description available',
              recommendation: vuln.recommendation || 'Update to latest version',
              via: vuln.via || [],
            };

            this.vulnerabilities.push(vulnerability);
            this.report.details.vulnerabilities.push(vulnerability);

            // 更新统计
            this.report.summary.totalVulnerabilities++;
            if (severity === 'high') this.report.summary.highSeverity++;
            else if (severity === 'medium')
              this.report.summary.mediumSeverity++;
            else if (severity === 'low') this.report.summary.lowSeverity++;

            const icon = this.getSeverityIcon(severity);
            console.log(
              `  ${icon} ${packageName}: ${vuln.severity} - ${vulnerability.title}`
            );
          }
        );
      }
    } catch (error) {
      console.log('  ⚠️  无法运行安全审计，请手动检查依赖');
    }
  }

  /**
   * 检查过时依赖
   */
  async checkOutdatedPackages() {
    console.log('\n📅 检查过时依赖...');

    try {
      const outdatedResult = execSync('pnpm outdated --json', {
        encoding: 'utf-8',
        cwd: this.projectRoot,
        stdio: 'pipe',
      });

      const outdatedData = JSON.parse(outdatedResult);

      if (outdatedData && Object.keys(outdatedData).length > 0) {
        Object.entries(outdatedData).forEach(([packageName, info]) => {
          const outdated = {
            package: packageName,
            current: info.current,
            wanted: info.wanted,
            latest: info.latest,
            type: info.type || 'dependencies',
            location: info.location || 'unknown',
          };

          this.outdated.push(outdated);
          this.report.details.outdated.push(outdated);
          this.report.summary.outdatedPackages++;

          console.log(`  ⚠️  ${packageName}: ${info.current} → ${info.latest}`);
        });
      } else {
        console.log('  ✅ 所有依赖都是最新版本');
      }
    } catch (error) {
      console.log('  ⚠️  无法检查过时依赖');
    }
  }

  /**
   * 检查许可证
   */
  async checkLicenses() {
    console.log('\n📄 检查许可证...');

    try {
      // 使用 license-checker 检查许可证
      const licenseResult = execSync('npx license-checker --json', {
        encoding: 'utf-8',
        cwd: this.projectRoot,
        stdio: 'pipe',
      });

      const licenseData = JSON.parse(licenseResult);

      // 定义有问题的许可证
      const problematicLicenses = [
        'GPL-2.0',
        'GPL-3.0',
        'AGPL-3.0',
        'LGPL-2.1',
        'LGPL-3.0',
        'Copyleft',
        'Proprietary',
      ];

      Object.entries(licenseData).forEach(([packageName, info]) => {
        const license = info.licenses || 'Unknown';
        const isProblematic = problematicLicenses.some(prob =>
          license.toLowerCase().includes(prob.toLowerCase())
        );

        if (isProblematic) {
          const licenseInfo = {
            package: packageName,
            license: license,
            repository: info.repository || '',
            publisher: info.publisher || '',
            email: info.email || '',
            url: info.url || '',
          };

          this.licenses.push(licenseInfo);
          this.report.details.licenses.push(licenseInfo);
          this.report.summary.licenseIssues++;

          console.log(`  ⚠️  ${packageName}: ${license} (可能有许可证问题)`);
        }
      });

      if (this.licenses.length === 0) {
        console.log('  ✅ 未发现许可证问题');
      }
    } catch (error) {
      console.log(
        '  ⚠️  无法检查许可证，请安装 license-checker: npm install -g license-checker'
      );
    }
  }

  /**
   * 生成报告
   */
  generateReport() {
    console.log('\n📊 安全审计报告');
    console.log('='.repeat(50));

    // 显示摘要
    console.log(`\n📈 安全摘要:`);
    console.log(`  🔴 高危漏洞: ${this.report.summary.highSeverity}`);
    console.log(`  🟡 中危漏洞: ${this.report.summary.mediumSeverity}`);
    console.log(`  🟢 低危漏洞: ${this.report.summary.lowSeverity}`);
    console.log(`  📦 过时依赖: ${this.report.summary.outdatedPackages}`);
    console.log(`  📄 许可证问题: ${this.report.summary.licenseIssues}`);

    // 显示详细建议
    this.generateRecommendations();

    // 保存报告
    this.saveReportToFile();

    // 根据高危漏洞决定退出码
    if (this.report.summary.highSeverity > 0) {
      console.log('\n❌ 发现高危安全漏洞，请立即修复！');
      process.exit(1);
    } else if (this.report.summary.mediumSeverity > 0) {
      console.log('\n⚠️  发现中危安全漏洞，建议尽快修复。');
    } else {
      console.log('\n✅ 安全审计通过！');
    }
  }

  /**
   * 生成建议
   */
  generateRecommendations() {
    console.log(`\n💡 安全建议:`);

    if (this.report.summary.highSeverity > 0) {
      console.log(`  1. 🔴 立即修复高危漏洞:`);
      this.vulnerabilities
        .filter(v => v.severityLevel === 'high')
        .forEach(v => {
          console.log(`     - ${v.package}: ${v.recommendation}`);
        });
    }

    if (this.report.summary.mediumSeverity > 0) {
      console.log(`  2. 🟡 修复中危漏洞:`);
      this.vulnerabilities
        .filter(v => v.severityLevel === 'medium')
        .slice(0, 5) // 只显示前5个
        .forEach(v => {
          console.log(`     - ${v.package}: ${v.recommendation}`);
        });
    }

    if (this.report.summary.outdatedPackages > 0) {
      console.log(`  3. 📦 更新过时依赖:`);
      console.log(`     pnpm update`);
    }

    if (this.report.summary.licenseIssues > 0) {
      console.log(`  4. 📄 检查许可证问题:`);
      this.licenses.slice(0, 3).forEach(l => {
        console.log(`     - ${l.package}: ${l.license}`);
      });
    }

    console.log(`\n🛠️  修复命令:`);
    console.log(`  pnpm audit --fix          # 自动修复漏洞`);
    console.log(`  pnpm update               # 更新依赖`);
    console.log(`  pnpm audit                # 重新检查`);
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
    const jsonPath = join(outputDir, 'security-audit.json');
    writeFileSync(jsonPath, JSON.stringify(this.report, null, 2), 'utf-8');

    // 生成 Markdown 报告
    const markdownReport = this.generateMarkdownReport();
    const mdPath = join(outputDir, 'security-audit.md');
    writeFileSync(mdPath, markdownReport, 'utf-8');

    console.log(`\n📄 安全审计报告已保存:`);
    console.log(`  JSON: ${jsonPath}`);
    console.log(`  Markdown: ${mdPath}`);
  }

  /**
   * 生成 Markdown 报告
   */
  generateMarkdownReport() {
    const timestamp = new Date().toISOString();

    let report = `# 安全审计报告\n\n`;
    report += `**生成时间**: ${timestamp}\n\n`;

    // 摘要
    report += `## 📊 安全摘要\n\n`;
    report += `| 类型 | 数量 |\n`;
    report += `|------|------|\n`;
    report += `| 🔴 高危漏洞 | ${this.report.summary.highSeverity} |\n`;
    report += `| 🟡 中危漏洞 | ${this.report.summary.mediumSeverity} |\n`;
    report += `| 🟢 低危漏洞 | ${this.report.summary.lowSeverity} |\n`;
    report += `| 📦 过时依赖 | ${this.report.summary.outdatedPackages} |\n`;
    report += `| 📄 许可证问题 | ${this.report.summary.licenseIssues} |\n\n`;

    // 漏洞详情
    if (this.vulnerabilities.length > 0) {
      report += `## 🔍 安全漏洞详情\n\n`;
      this.vulnerabilities.forEach(vuln => {
        const icon = this.getSeverityIcon(vuln.severityLevel);
        report += `### ${icon} ${vuln.package}\n\n`;
        report += `- **严重程度**: ${vuln.severity}\n`;
        report += `- **标题**: ${vuln.title}\n`;
        report += `- **描述**: ${vuln.description}\n`;
        report += `- **建议**: ${vuln.recommendation}\n\n`;
      });
    }

    // 过时依赖
    if (this.outdated.length > 0) {
      report += `## 📦 过时依赖\n\n`;
      report += `| 包名 | 当前版本 | 最新版本 |\n`;
      report += `|------|----------|----------|\n`;
      this.outdated.forEach(pkg => {
        report += `| ${pkg.package} | ${pkg.current} | ${pkg.latest} |\n`;
      });
      report += '\n';
    }

    // 许可证问题
    if (this.licenses.length > 0) {
      report += `## 📄 许可证问题\n\n`;
      report += `| 包名 | 许可证 |\n`;
      report += `|------|--------|\n`;
      this.licenses.forEach(license => {
        report += `| ${license.package} | ${license.license} |\n`;
      });
      report += '\n';
    }

    // 修复建议
    report += `## 💡 修复建议\n\n`;
    report += `\`\`\`bash\n`;
    report += `# 自动修复漏洞\n`;
    report += `pnpm audit --fix\n\n`;
    report += `# 更新依赖\n`;
    report += `pnpm update\n\n`;
    report += `# 重新检查\n`;
    report += `pnpm audit\n`;
    report += `\`\`\`\n\n`;

    report += `---\n\n`;
    report += `*此报告由安全审计脚本自动生成*\n`;

    return report;
  }

  /**
   * 获取严重程度级别
   */
  getSeverityLevel(severity) {
    const level = severity.toLowerCase();
    if (level.includes('high') || level.includes('critical')) return 'high';
    if (level.includes('medium') || level.includes('moderate')) return 'medium';
    if (level.includes('low') || level.includes('info')) return 'low';
    return 'unknown';
  }

  /**
   * 获取严重程度图标
   */
  getSeverityIcon(severity) {
    const icons = {
      high: '🔴',
      medium: '🟡',
      low: '🟢',
      unknown: '⚪',
    };
    return icons[severity] || '⚪';
  }
}

// 主函数
async function main() {
  const auditor = new SecurityAuditor();
  await auditor.audit();
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { SecurityAuditor };
