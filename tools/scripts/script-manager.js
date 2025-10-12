#!/usr/bin/env node

/**
 * 脚本管理器
 *
 * 统一管理所有脚本的执行和调度
 * 提供脚本发现、执行和监控功能
 */

import { execSync } from 'child_process';
import { existsSync, readdirSync, statSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const scriptsRoot = __dirname;

class ScriptManager {
  constructor() {
    this.scriptsRoot = scriptsRoot;
    this.scripts = new Map();
    this.categories = new Map();
    this.loadScripts();
  }

  /**
   * 加载所有脚本
   */
  loadScripts() {
    console.log('🔍 扫描脚本文件...');

    const categories = [
      'automation',
      'database',
      'deployment',
      'development',
      'maintenance',
      'monitoring',
    ];

    categories.forEach(category => {
      const categoryPath = join(this.scriptsRoot, category);
      if (existsSync(categoryPath)) {
        this.categories.set(category, []);
        this.scanCategory(category, categoryPath);
      }
    });

    console.log(`✅ 发现 ${this.scripts.size} 个脚本文件`);
  }

  /**
   * 扫描分类目录
   */
  scanCategory(category, categoryPath) {
    const items = readdirSync(categoryPath);

    items.forEach(item => {
      const itemPath = join(categoryPath, item);
      const stat = statSync(itemPath);

      if (stat.isFile() && item.endsWith('.js')) {
        const scriptName = basename(item, '.js');
        const scriptInfo = {
          name: scriptName,
          category,
          path: itemPath,
          relativePath: join(category, item),
          description: this.getScriptDescription(scriptName, category),
        };

        this.scripts.set(scriptName, scriptInfo);
        this.categories.get(category).push(scriptInfo);
      }
    });
  }

  /**
   * 获取脚本描述
   */
  getScriptDescription(name, category) {
    const descriptions = {
      automation: {
        'automation-analysis': '自动化任务分析',
        'check-database-config': '数据库配置检查',
        'check-environment': '环境检查',
        'code-quality-check': '代码质量检查',
        'rbac-manager': 'RBAC系统管理',
        'run-all-checks': '综合自动化检查',
        'security-audit': '安全审计',
        'test-database-connection': '数据库连接测试',
      },
      database: {
        'database-backup': '数据库备份',
        reset: '数据库重置',
        setup: '数据库设置（包含RBAC初始化）',
      },
      deployment: {
        build: '项目构建（包含RBAC检查）',
        deploy: '项目部署（包含RBAC初始化）',
      },
      development: {
        'generate-all-docs': '综合文档生成',
        'generate-docs': 'API文档生成',
      },
      maintenance: {
        clean: '项目清理',
        maintenance: '系统维护',
        restore: '环境恢复',
        start: '一键启动项目',
        stop: '一键停止项目',
      },
      monitoring: {
        'monitoring-log': '监控日志',
        'performance-test': '性能测试',
      },
    };

    return descriptions[category]?.[name] || `${category} 脚本`;
  }

  /**
   * 列出所有脚本
   */
  listScripts() {
    console.log('\n📋 可用脚本列表:\n');

    this.categories.forEach((scripts, category) => {
      console.log(`📁 ${category.toUpperCase()}:`);
      scripts.forEach(script => {
        console.log(`   ${script.name.padEnd(25)} - ${script.description}`);
      });
      console.log('');
    });
  }

  /**
   * 执行脚本
   */
  async executeScript(scriptName, args = []) {
    const script = this.scripts.get(scriptName);

    if (!script) {
      console.error(`❌ 脚本不存在: ${scriptName}`);
      console.log('💡 使用 "list" 命令查看所有可用脚本');
      return false;
    }

    console.log(`🚀 执行脚本: ${script.name} (${script.description})`);
    console.log(`📁 路径: ${script.relativePath}\n`);

    try {
      const command = `node ${script.path} ${args.join(' ')}`;
      execSync(command, {
        cwd: join(this.scriptsRoot, '../..'),
        stdio: 'inherit',
      });

      console.log(`\n✅ 脚本执行完成: ${script.name}`);
      return true;
    } catch (error) {
      console.error(`\n❌ 脚本执行失败: ${script.name}`);
      console.error(`错误: ${error.message}`);
      return false;
    }
  }

  /**
   * 批量执行脚本
   */
  async executeBatch(scriptNames, args = []) {
    console.log(`🔄 批量执行 ${scriptNames.length} 个脚本...\n`);

    const results = [];

    for (const scriptName of scriptNames) {
      const success = await this.executeScript(scriptName, args);
      results.push({ name: scriptName, success });

      if (!success) {
        console.log(`\n⚠️ 脚本 ${scriptName} 执行失败，继续执行下一个...\n`);
      }
    }

    // 显示批量执行结果
    console.log('\n📊 批量执行结果:');
    results.forEach(result => {
      const icon = result.success ? '✅' : '❌';
      console.log(`   ${icon} ${result.name}`);
    });

    const successCount = results.filter(r => r.success).length;
    console.log(`\n🎯 成功: ${successCount}/${results.length}`);

    return results;
  }

  /**
   * 执行分类脚本
   */
  async executeCategory(categoryName, args = []) {
    const scripts = this.categories.get(categoryName);

    if (!scripts || scripts.length === 0) {
      console.error(`❌ 分类不存在或为空: ${categoryName}`);
      return false;
    }

    const scriptNames = scripts.map(s => s.name);
    return await this.executeBatch(scriptNames, args);
  }

  /**
   * 搜索脚本
   */
  searchScripts(query) {
    const results = [];
    const lowerQuery = query.toLowerCase();

    this.scripts.forEach((script, name) => {
      if (
        name.toLowerCase().includes(lowerQuery) ||
        script.description.toLowerCase().includes(lowerQuery) ||
        script.category.toLowerCase().includes(lowerQuery)
      ) {
        results.push(script);
      }
    });

    return results;
  }

  /**
   * 显示脚本信息
   */
  showScriptInfo(scriptName) {
    const script = this.scripts.get(scriptName);

    if (!script) {
      console.error(`❌ 脚本不存在: ${scriptName}`);
      return;
    }

    console.log(`\n📄 脚本信息: ${script.name}`);
    console.log(`📁 分类: ${script.category}`);
    console.log(`📝 描述: ${script.description}`);
    console.log(`📍 路径: ${script.relativePath}`);
    console.log(`🔧 完整路径: ${script.path}`);
  }

  /**
   * 显示帮助信息
   */
  showHelp() {
    console.log(`
🛠️ 脚本管理器使用说明

用法: node script-manager.js <命令> [参数...]

命令:
  list                    - 列出所有可用脚本
  exec <脚本名> [参数...]  - 执行指定脚本
  batch <脚本1,脚本2,...> - 批量执行脚本
  category <分类名>       - 执行分类下的所有脚本
  search <关键词>         - 搜索脚本
  info <脚本名>           - 显示脚本详细信息
  help                    - 显示此帮助信息

示例:
  node script-manager.js list
  node script-manager.js exec check-environment
  node script-manager.js batch check-environment,security-audit
  node script-manager.js category automation
  node script-manager.js search database
  node script-manager.js info build

分类:
  automation  - 自动化检查和任务
  database    - 数据库相关操作
  deployment  - 部署和构建
  development - 开发工具
  maintenance - 维护和清理
  monitoring  - 监控和性能测试
`);
  }

  /**
   * 主函数
   */
  async run() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
      this.showHelp();
      return;
    }

    const command = args[0];
    const params = args.slice(1);

    switch (command) {
      case 'list':
        this.listScripts();
        break;

      case 'exec':
        if (params.length === 0) {
          console.error('❌ 请指定要执行的脚本名');
          return;
        }
        await this.executeScript(params[0], params.slice(1));
        break;

      case 'batch':
        if (params.length === 0) {
          console.error('❌ 请指定要批量执行的脚本名（用逗号分隔）');
          return;
        }
        const scriptNames = params[0].split(',').map(s => s.trim());
        await this.executeBatch(scriptNames, params.slice(1));
        break;

      case 'category':
        if (params.length === 0) {
          console.error('❌ 请指定分类名');
          return;
        }
        await this.executeCategory(params[0], params.slice(1));
        break;

      case 'search':
        if (params.length === 0) {
          console.error('❌ 请指定搜索关键词');
          return;
        }
        const results = this.searchScripts(params[0]);
        console.log(`\n🔍 搜索结果 (${results.length} 个):`);
        results.forEach(script => {
          console.log(
            `   ${script.name.padEnd(25)} - ${script.description} (${script.category})`
          );
        });
        break;

      case 'info':
        if (params.length === 0) {
          console.error('❌ 请指定脚本名');
          return;
        }
        this.showScriptInfo(params[0]);
        break;

      case 'help':
        this.showHelp();
        break;

      default:
        console.error(`❌ 未知命令: ${command}`);
        this.showHelp();
    }
  }
}

// 主函数
async function main() {
  const manager = new ScriptManager();
  await manager.run();
}

// 如果直接运行此脚本
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  main().catch(console.error);
}

export { ScriptManager };
