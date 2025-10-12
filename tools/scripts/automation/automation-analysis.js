#!/usr/bin/env node

/**
 * 自动化任务分析脚本
 *
 * 分析项目中可以自动化的任务和操作
 */

import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
} from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class AutomationAnalyzer {
  constructor() {
    this.projectRoot = join(__dirname, '../../..');
    this.analysis = {
      existing: [],
      missing: [],
      recommendations: [],
    };
  }

  /**
   * 主分析函数
   */
  analyze() {
    console.log('🔍 分析项目自动化任务...');

    this.analyzeExistingAutomation();
    this.analyzeMissingAutomation();
    this.generateRecommendations();
    this.generateReport();

    console.log('✅ 自动化任务分析完成！');
  }

  /**
   * 分析现有的自动化
   */
  analyzeExistingAutomation() {
    console.log('📋 分析现有自动化...');

    // 分析 package.json 脚本
    const packageJson = JSON.parse(
      readFileSync(join(this.projectRoot, 'package.json'), 'utf-8')
    );
    const packageScripts = packageJson.scripts || {};

    Object.entries(packageScripts).forEach(([name, command]) => {
      this.analysis.existing.push({
        type: 'npm-script',
        name,
        command,
        category: this.categorizeScript(name),
        description: this.describeScript(name),
      });
    });

    // 分析脚本文件
    const scriptsDir = join(this.projectRoot, 'tools/scripts');
    if (existsSync(scriptsDir)) {
      const scriptFiles = this.findScriptFiles(scriptsDir);
      scriptFiles.forEach(file => {
        this.analysis.existing.push({
          type: 'script-file',
          name: basename(file),
          path: file,
          category: this.categorizeScriptFile(file),
          description: this.describeScriptFile(file),
        });
      });
    }

    // 分析 CI/CD 配置
    const ciDir = join(this.projectRoot, '.github', 'workflows');
    if (existsSync(ciDir)) {
      const ciFiles = readdirSync(ciDir).filter(
        file => file.endsWith('.yml') || file.endsWith('.yaml')
      );
      ciFiles.forEach(file => {
        this.analysis.existing.push({
          type: 'ci-cd',
          name: file,
          path: join(ciDir, file),
          category: 'deployment',
          description: 'GitHub Actions 工作流',
        });
      });
    }
  }

  /**
   * 分析缺失的自动化
   */
  analyzeMissingAutomation() {
    console.log('🔍 分析缺失的自动化...');

    const missingTasks = [
      // 开发环境自动化
      {
        name: '环境检查脚本',
        description: '检查开发环境依赖和配置',
        category: 'development',
        priority: 'high',
        commands: ['node --version', 'pnpm --version', 'docker --version'],
      },
      {
        name: '依赖安全检查',
        description: '检查依赖包的安全漏洞',
        category: 'security',
        priority: 'high',
        commands: ['npm audit', 'pnpm audit'],
      },
      {
        name: '依赖更新检查',
        description: '检查过时的依赖包',
        category: 'maintenance',
        priority: 'medium',
        commands: ['pnpm outdated'],
      },

      // 代码质量自动化
      {
        name: '代码复杂度分析',
        description: '分析代码复杂度和质量指标',
        category: 'quality',
        priority: 'medium',
        commands: ['eslint --ext .ts,.tsx --format json'],
      },
      {
        name: '代码重复检测',
        description: '检测重复代码',
        category: 'quality',
        priority: 'low',
        commands: ['jscpd --min-lines 5 --min-tokens 70'],
      },
      {
        name: '类型检查报告',
        description: '生成详细的 TypeScript 类型检查报告',
        category: 'quality',
        priority: 'medium',
        commands: ['tsc --noEmit --pretty'],
      },

      // 测试自动化
      {
        name: '测试覆盖率分析',
        description: '生成详细的测试覆盖率分析报告',
        category: 'testing',
        priority: 'high',
        commands: ['jest --coverage --coverageReporters=text-lcov'],
      },
      {
        name: '性能测试',
        description: '运行 API 性能测试',
        category: 'testing',
        priority: 'medium',
        commands: ['artillery run performance-test.yml'],
      },
      {
        name: '负载测试',
        description: '运行负载测试',
        category: 'testing',
        priority: 'low',
        commands: ['k6 run load-test.js'],
      },

      // 部署自动化
      {
        name: '多环境部署',
        description: '支持 staging、production 等多环境部署',
        category: 'deployment',
        priority: 'high',
        commands: ['docker build', 'kubectl apply'],
      },
      {
        name: '回滚脚本',
        description: '快速回滚到上一个版本',
        category: 'deployment',
        priority: 'high',
        commands: ['kubectl rollout undo', 'docker tag'],
      },
      {
        name: '健康检查',
        description: '部署后自动健康检查',
        category: 'deployment',
        priority: 'high',
        commands: ['curl -f http://localhost:8001/health'],
      },

      // 监控和日志
      {
        name: '日志分析',
        description: '分析应用日志，检测错误和异常',
        category: 'monitoring',
        priority: 'medium',
        commands: ['grep -i error logs/*.log'],
      },
      {
        name: '性能监控',
        description: '监控应用性能指标',
        category: 'monitoring',
        priority: 'medium',
        commands: ['node --inspect', 'clinic doctor'],
      },
      {
        name: '资源使用监控',
        description: '监控 CPU、内存、磁盘使用情况',
        category: 'monitoring',
        priority: 'low',
        commands: ['docker stats', 'htop'],
      },

      // 数据管理
      {
        name: '数据库备份',
        description: '自动备份数据库',
        category: 'database',
        priority: 'high',
        commands: ['pg_dump', 'mongodump'],
      },
      {
        name: '数据库恢复',
        description: '从备份恢复数据库',
        category: 'database',
        priority: 'high',
        commands: ['pg_restore', 'mongorestore'],
      },
      {
        name: '数据迁移验证',
        description: '验证数据库迁移的正确性',
        category: 'database',
        priority: 'medium',
        commands: ['prisma migrate status', 'prisma db seed'],
      },

      // 安全自动化
      {
        name: '安全扫描',
        description: '扫描代码和依赖的安全漏洞',
        category: 'security',
        priority: 'high',
        commands: ['npm audit', 'snyk test'],
      },
      {
        name: '密钥轮换',
        description: '定期轮换 JWT 密钥等敏感信息',
        category: 'security',
        priority: 'medium',
        commands: ['openssl rand -base64 32'],
      },
      {
        name: '访问控制检查',
        description: '检查 API 访问控制配置',
        category: 'security',
        priority: 'medium',
        commands: ['curl -H "Authorization: Bearer invalid"'],
      },

      // 文档自动化
      {
        name: 'API 测试生成',
        description: '从 OpenAPI 规范生成测试用例',
        category: 'documentation',
        priority: 'medium',
        commands: ['swagger-codegen generate -i openapi.json'],
      },
      {
        name: '代码注释检查',
        description: '检查代码注释覆盖率',
        category: 'documentation',
        priority: 'low',
        commands: ['eslint-plugin-jsdoc'],
      },
      {
        name: 'README 更新检查',
        description: '检查 README 是否与代码同步',
        category: 'documentation',
        priority: 'low',
        commands: ['grep -r "TODO" README.md'],
      },

      // 维护自动化
      {
        name: '依赖清理',
        description: '清理未使用的依赖包',
        category: 'maintenance',
        priority: 'medium',
        commands: ['depcheck', 'npm prune'],
      },
      {
        name: '缓存清理',
        description: '清理各种缓存文件',
        category: 'maintenance',
        priority: 'low',
        commands: ['pnpm store prune', 'docker system prune'],
      },
      {
        name: '磁盘空间检查',
        description: '检查磁盘空间使用情况',
        category: 'maintenance',
        priority: 'low',
        commands: ['df -h', 'du -sh *'],
      },
    ];

    this.analysis.missing = missingTasks;
  }

  /**
   * 生成建议
   */
  generateRecommendations() {
    console.log('💡 生成自动化建议...');

    const recommendations = [
      {
        title: '开发环境自动化增强',
        description: '增强开发环境的自动化程度',
        tasks: [
          '创建环境检查脚本，验证所有依赖',
          '添加依赖安全扫描到 CI/CD',
          '实现自动依赖更新检查',
        ],
        priority: 'high',
        effort: 'medium',
      },
      {
        title: '代码质量自动化',
        description: '提升代码质量的自动化检查',
        tasks: ['添加代码复杂度分析', '实现代码重复检测', '增强类型检查报告'],
        priority: 'high',
        effort: 'medium',
      },
      {
        title: '测试自动化增强',
        description: '完善测试自动化流程',
        tasks: ['添加性能测试自动化', '实现负载测试', '增强测试覆盖率分析'],
        priority: 'medium',
        effort: 'high',
      },
      {
        title: '部署自动化完善',
        description: '完善部署和运维自动化',
        tasks: ['实现多环境部署支持', '添加自动回滚功能', '实现部署后健康检查'],
        priority: 'high',
        effort: 'high',
      },
      {
        title: '监控和日志自动化',
        description: '实现监控和日志的自动化',
        tasks: ['添加日志分析自动化', '实现性能监控', '添加资源使用监控'],
        priority: 'medium',
        effort: 'medium',
      },
      {
        title: '数据管理自动化',
        description: '实现数据管理的自动化',
        tasks: ['添加数据库自动备份', '实现数据恢复自动化', '添加迁移验证'],
        priority: 'high',
        effort: 'medium',
      },
      {
        title: '安全自动化',
        description: '增强安全相关的自动化',
        tasks: ['实现安全扫描自动化', '添加密钥轮换机制', '实现访问控制检查'],
        priority: 'high',
        effort: 'medium',
      },
      {
        title: '维护自动化',
        description: '实现项目维护的自动化',
        tasks: ['添加依赖清理自动化', '实现缓存清理', '添加磁盘空间监控'],
        priority: 'low',
        effort: 'low',
      },
    ];

    this.analysis.recommendations = recommendations;
  }

  /**
   * 生成分析报告
   */
  generateReport() {
    console.log('📊 生成分析报告...');

    const report = this.generateMarkdownReport();
    const outputPath = join(
      this.projectRoot,
      'docs',
      'generated',
      'automation-analysis.md'
    );

    // 确保目录存在
    const outputDir = dirname(outputPath);
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    writeFileSync(outputPath, report, 'utf-8');
    console.log(`📄 生成分析报告: ${outputPath}`);
  }

  /**
   * 生成 Markdown 报告
   */
  generateMarkdownReport() {
    const timestamp = new Date().toISOString();

    let report = `# 自动化任务分析报告\n\n`;
    report += `**生成时间**: ${timestamp}\n\n`;

    // 概览
    report += `## 📊 分析概览\n\n`;
    report += `| 类别 | 现有自动化 | 缺失任务 | 建议数量 |\n`;
    report += `|------|------------|----------|----------|\n`;

    const categories = this.getCategories();
    categories.forEach(category => {
      const existing = this.analysis.existing.filter(
        item => item.category === category
      ).length;
      const missing = this.analysis.missing.filter(
        item => item.category === category
      ).length;
      const recommendations = this.analysis.recommendations.filter(item =>
        item.tasks.some(task => this.categorizeTask(task) === category)
      ).length;

      report += `| ${category} | ${existing} | ${missing} | ${recommendations} |\n`;
    });

    // 现有自动化
    report += `\n## ✅ 现有自动化\n\n`;
    categories.forEach(category => {
      const items = this.analysis.existing.filter(
        item => item.category === category
      );
      if (items.length > 0) {
        report += `### ${category}\n\n`;
        items.forEach(item => {
          report += `- **${item.name}**: ${item.description}\n`;
        });
        report += '\n';
      }
    });

    // 缺失的自动化
    report += `## ❌ 缺失的自动化任务\n\n`;
    categories.forEach(category => {
      const items = this.analysis.missing.filter(
        item => item.category === category
      );
      if (items.length > 0) {
        report += `### ${category}\n\n`;
        items.forEach(item => {
          const priority = this.getPriorityEmoji(item.priority);
          report += `- ${priority} **${item.name}**: ${item.description}\n`;
        });
        report += '\n';
      }
    });

    // 建议
    report += `## 💡 自动化建议\n\n`;
    this.analysis.recommendations.forEach(rec => {
      const priority = this.getPriorityEmoji(rec.priority);
      const effort = this.getEffortEmoji(rec.effort);

      report += `### ${priority} ${rec.title}\n\n`;
      report += `${rec.description}\n\n`;
      report += `**优先级**: ${rec.priority} | **工作量**: ${rec.effort}\n\n`;
      report += `**任务列表**:\n`;
      rec.tasks.forEach(task => {
        report += `- ${task}\n`;
      });
      report += '\n';
    });

    // 实施计划
    report += `## 🚀 实施计划\n\n`;
    report += `### 第一阶段：高优先级任务（1-2周）\n\n`;
    const highPriority = this.analysis.recommendations.filter(
      rec => rec.priority === 'high'
    );
    highPriority.forEach(rec => {
      report += `- ${rec.title}\n`;
    });

    report += `\n### 第二阶段：中优先级任务（2-4周）\n\n`;
    const mediumPriority = this.analysis.recommendations.filter(
      rec => rec.priority === 'medium'
    );
    mediumPriority.forEach(rec => {
      report += `- ${rec.title}\n`;
    });

    report += `\n### 第三阶段：低优先级任务（4-8周）\n\n`;
    const lowPriority = this.analysis.recommendations.filter(
      rec => rec.priority === 'low'
    );
    lowPriority.forEach(rec => {
      report += `- ${rec.title}\n`;
    });

    // 总结
    report += `\n## 📋 总结\n\n`;
    report += `- **现有自动化**: ${this.analysis.existing.length} 个\n`;
    report += `- **缺失任务**: ${this.analysis.missing.length} 个\n`;
    report += `- **改进建议**: ${this.analysis.recommendations.length} 个\n`;
    report += `- **自动化覆盖率**: ${Math.round((this.analysis.existing.length / (this.analysis.existing.length + this.analysis.missing.length)) * 100)}%\n\n`;

    report += `通过实施这些自动化任务，可以显著提升开发效率和项目质量。\n\n`;
    report += `---\n\n`;
    report += `*此报告由自动化分析脚本生成*\n`;

    return report;
  }

  /**
   * 辅助方法
   */
  categorizeScript(name) {
    if (name.includes('dev')) return 'development';
    if (name.includes('test')) return 'testing';
    if (name.includes('build') || name.includes('start')) return 'deployment';
    if (name.includes('lint') || name.includes('format')) return 'quality';
    if (name.includes('prisma') || name.includes('db')) return 'database';
    if (name.includes('docs')) return 'documentation';
    if (name.includes('clean')) return 'maintenance';
    return 'other';
  }

  categorizeScriptFile(file) {
    if (file.includes('dev')) return 'development';
    if (file.includes('db')) return 'database';
    if (file.includes('test')) return 'testing';
    if (file.includes('build') || file.includes('deploy')) return 'deployment';
    if (file.includes('clean')) return 'maintenance';
    return 'other';
  }

  categorizeTask(task) {
    if (task.includes('环境') || task.includes('依赖')) return 'development';
    if (task.includes('测试') || task.includes('覆盖率')) return 'testing';
    if (task.includes('部署') || task.includes('回滚')) return 'deployment';
    if (task.includes('代码') || task.includes('质量')) return 'quality';
    if (task.includes('数据库') || task.includes('备份')) return 'database';
    if (task.includes('安全') || task.includes('扫描')) return 'security';
    if (task.includes('监控') || task.includes('日志')) return 'monitoring';
    if (task.includes('清理') || task.includes('维护')) return 'maintenance';
    return 'other';
  }

  describeScript(name) {
    const descriptions = {
      dev: '启动开发环境',
      test: '运行测试',
      build: '构建项目',
      lint: '代码检查',
      format: '代码格式化',
      clean: '清理项目',
      setup: '项目设置',
      'docs:generate': '生成 API 文档',
      'docs:generate:all': '生成所有文档',
    };
    return descriptions[name] || '脚本命令';
  }

  describeScriptFile(file) {
    const descriptions = {
      'setup.sh': '环境设置脚本',
      'dev.sh': '开发环境启动脚本',
      'clean.js': '项目清理脚本',
      'generate-docs.js': 'API 文档生成脚本',
      'generate-all-docs.js': '综合文档生成脚本',
    };
    return descriptions[basename(file)] || '脚本文件';
  }

  findScriptFiles(dir) {
    const files = [];
    const scanDir = currentDir => {
      try {
        const items = readdirSync(currentDir);
        items.forEach(item => {
          const itemPath = join(currentDir, item);
          const stat = statSync(itemPath);

          if (stat.isDirectory()) {
            scanDir(itemPath);
          } else if (item.match(/\.(sh|js|ts|bat)$/)) {
            files.push(itemPath);
          }
        });
      } catch (error) {
        // 忽略权限错误
      }
    };

    scanDir(dir);
    return files;
  }

  getCategories() {
    return [
      'development',
      'testing',
      'deployment',
      'quality',
      'database',
      'security',
      'monitoring',
      'maintenance',
      'documentation',
      'other',
    ];
  }

  getPriorityEmoji(priority) {
    const emojis = {
      high: '🔴',
      medium: '🟡',
      low: '🟢',
    };
    return emojis[priority] || '⚪';
  }

  getEffortEmoji(effort) {
    const emojis = {
      high: '🔴',
      medium: '🟡',
      low: '🟢',
    };
    return emojis[effort] || '⚪';
  }
}

// 主函数
async function main() {
  const analyzer = new AutomationAnalyzer();
  analyzer.analyze();
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { AutomationAnalyzer };
