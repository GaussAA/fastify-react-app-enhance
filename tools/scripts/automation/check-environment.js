#!/usr/bin/env node

/**
 * 环境检查脚本
 *
 * 检查开发环境依赖和配置
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class EnvironmentChecker {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '../../..');
    this.checks = [];
    this.errors = [];
    this.warnings = [];
    this.info = [];
  }

  /**
   * 主检查函数
   */
  async check() {
    console.log('🔍 开始环境检查...\n');

    try {
      // 基础环境检查
      await this.checkNodeVersion();
      await this.checkPackageManager();
      await this.checkDocker();

      // 项目配置检查
      await this.checkProjectStructure();
      await this.checkEnvironmentFiles();
      await this.checkDependencies();

      // 开发工具检查
      await this.checkGit();
      await this.checkCodeQualityTools();

      // RBAC系统检查
      await this.checkRBACSystem();

      // 生成报告
      this.generateReport();
    } catch (error) {
      console.error('❌ 环境检查失败:', error.message);
      process.exit(1);
    }
  }

  /**
   * 检查 Node.js 版本
   */
  async checkNodeVersion() {
    console.log('📦 检查 Node.js 版本...');

    try {
      const version = execSync('node --version', { encoding: 'utf-8' }).trim();
      const majorVersion = parseInt(version.replace('v', '').split('.')[0]);

      if (majorVersion >= 22) {
        this.addCheck('✅', 'Node.js 版本', `${version} (符合要求 >= 22.0.0)`);
      } else {
        this.addError('❌', 'Node.js 版本', `${version} (需要 >= 22.0.0)`);
      }
    } catch (error) {
      this.addError('❌', 'Node.js', '未安装或无法访问');
    }
  }

  /**
   * 检查包管理器
   */
  async checkPackageManager() {
    console.log('📦 检查包管理器...');

    // 检查 pnpm
    try {
      const pnpmVersion = execSync('pnpm --version', {
        encoding: 'utf-8',
      }).trim();
      const majorVersion = parseInt(pnpmVersion.split('.')[0]);

      if (majorVersion >= 10) {
        this.addCheck('✅', 'pnpm 版本', `${pnpmVersion} (符合要求 >= 10.0.0)`);
      } else {
        this.addWarning('⚠️', 'pnpm 版本', `${pnpmVersion} (建议 >= 10.0.0)`);
      }
    } catch (error) {
      this.addError('❌', 'pnpm', '未安装或无法访问');
    }

    // 检查 npm
    try {
      const npmVersion = execSync('npm --version', {
        encoding: 'utf-8',
      }).trim();
      const majorVersion = parseInt(npmVersion.split('.')[0]);

      if (majorVersion >= 11) {
        this.addCheck('✅', 'npm 版本', `${npmVersion} (符合要求 >= 11.0.0)`);
      } else {
        this.addWarning('⚠️', 'npm 版本', `${npmVersion} (建议 >= 11.0.0)`);
      }
    } catch (error) {
      this.addError('❌', 'npm', '未安装或无法访问');
    }
  }

  /**
   * 检查 Docker
   */
  async checkDocker() {
    console.log('🐳 检查 Docker...');

    try {
      const dockerVersion = execSync('docker --version', {
        encoding: 'utf-8',
      }).trim();
      this.addCheck('✅', 'Docker', dockerVersion);

      // 检查 Docker 是否运行
      try {
        execSync('docker ps', { encoding: 'utf-8' });
        this.addCheck('✅', 'Docker 服务', '正在运行');
      } catch (error) {
        this.addWarning('⚠️', 'Docker 服务', '未运行或无法访问');
      }
    } catch (error) {
      this.addError('❌', 'Docker', '未安装或无法访问');
    }
  }

  /**
   * 检查项目结构
   */
  async checkProjectStructure() {
    console.log('📁 检查项目结构...');

    const requiredDirs = [
      'apps/api',
      'apps/web',
      'docs',
      'tools/scripts',
      'infrastructure/docker',
    ];

    const requiredFiles = [
      'package.json',
      'pnpm-workspace.yaml',
      'apps/api/package.json',
      'apps/web/package.json',
      'apps/api/prisma/schema.prisma',
    ];

    // 检查目录
    requiredDirs.forEach(dir => {
      const dirPath = path.join(this.projectRoot, dir);
      if (fs.existsSync(dirPath)) {
        this.addCheck('✅', `目录 ${dir}`, '存在');
      } else {
        this.addError('❌', `目录 ${dir}`, '不存在');
      }
    });

    // 检查文件
    requiredFiles.forEach(file => {
      const filePath = path.join(this.projectRoot, file);
      if (fs.existsSync(filePath)) {
        this.addCheck('✅', `文件 ${file}`, '存在');
      } else {
        this.addError('❌', `文件 ${file}`, '不存在');
      }
    });
  }

  /**
   * 检查环境文件
   */
  async checkEnvironmentFiles() {
    console.log('⚙️ 检查环境配置文件...');

    const envFiles = ['.env', 'apps/api/.env', 'apps/web/.env'];

    const envTemplates = [
      'config/env-templates/root.env',
      'config/env-templates/api.env',
      'config/env-templates/web.env',
    ];

    // 检查环境文件
    envFiles.forEach(file => {
      const filePath = path.join(this.projectRoot, file);
      if (fs.existsSync(filePath)) {
        this.addCheck('✅', `环境文件 ${file}`, '存在');

        // 检查文件内容
        const content = fs.readFileSync(filePath, 'utf-8');
        if (content.trim().length > 0) {
          this.addCheck('✅', `环境文件 ${file}`, '有内容');
        } else {
          this.addWarning('⚠️', `环境文件 ${file}`, '为空');
        }
      } else {
        this.addWarning('⚠️', `环境文件 ${file}`, '不存在');
      }
    });

    // 检查模板文件
    envTemplates.forEach(file => {
      const filePath = path.join(this.projectRoot, file);
      if (fs.existsSync(filePath)) {
        this.addCheck('✅', `模板文件 ${file}`, '存在');
      } else {
        this.addWarning('⚠️', `模板文件 ${file}`, '不存在');
      }
    });
  }

  /**
   * 检查依赖
   */
  async checkDependencies() {
    console.log('📦 检查项目依赖...');

    // 检查根目录依赖
    const rootPackagePath = path.join(this.projectRoot, 'package.json');
    if (fs.existsSync(rootPackagePath)) {
      const packageJson = JSON.parse(fs.readFileSync(rootPackagePath, 'utf-8'));

      if (packageJson.engines) {
        this.addCheck('✅', '根目录 engines 配置', '已配置');
      } else {
        this.addWarning('⚠️', '根目录 engines 配置', '未配置');
      }
    }

    // 检查 node_modules
    const nodeModulesPath = path.join(this.projectRoot, 'node_modules');
    if (fs.existsSync(nodeModulesPath)) {
      this.addCheck('✅', '根目录依赖', '已安装');
    } else {
      this.addWarning('⚠️', '根目录依赖', '未安装');
    }

    // 检查子项目依赖
    const apps = ['api', 'web'];
    apps.forEach(app => {
      const appNodeModules = path.join(
        this.projectRoot,
        'apps',
        app,
        'node_modules'
      );
      if (fs.existsSync(appNodeModules)) {
        this.addCheck('✅', `${app} 项目依赖`, '已安装');
      } else {
        this.addWarning('⚠️', `${app} 项目依赖`, '未安装');
      }
    });
  }

  /**
   * 检查 Git
   */
  async checkGit() {
    console.log('🔧 检查 Git 配置...');

    try {
      const gitVersion = execSync('git --version', {
        encoding: 'utf-8',
      }).trim();
      this.addCheck('✅', 'Git', gitVersion);

      // 检查是否在 Git 仓库中
      try {
        execSync('git rev-parse --git-dir', { encoding: 'utf-8' });
        this.addCheck('✅', 'Git 仓库', '已初始化');

        // 检查 Git hooks
        const hooksPath = path.join(this.projectRoot, '.husky');
        if (fs.existsSync(hooksPath)) {
          this.addCheck('✅', 'Git Hooks', '已配置 (Husky)');
        } else {
          this.addWarning('⚠️', 'Git Hooks', '未配置');
        }
      } catch (error) {
        this.addWarning('⚠️', 'Git 仓库', '未初始化');
      }
    } catch (error) {
      this.addError('❌', 'Git', '未安装或无法访问');
    }
  }

  /**
   * 检查代码质量工具
   */
  async checkCodeQualityTools() {
    console.log('🔍 检查代码质量工具...');

    // 检查 ESLint
    try {
      const eslintVersion = execSync('npx eslint --version', {
        encoding: 'utf-8',
        cwd: this.projectRoot,
      }).trim();
      this.addCheck('✅', 'ESLint', eslintVersion);
    } catch (error) {
      this.addWarning('⚠️', 'ESLint', '未安装或无法访问');
    }

    // 检查 Prettier
    try {
      const prettierVersion = execSync('npx prettier --version', {
        encoding: 'utf-8',
        cwd: this.projectRoot,
      }).trim();
      this.addCheck('✅', 'Prettier', prettierVersion);
    } catch (error) {
      this.addWarning('⚠️', 'Prettier', '未安装或无法访问');
    }

    // 检查 TypeScript
    try {
      let typescriptFound = false;

      // 检查子项目中的 TypeScript
      const apps = ['api', 'web'];
      for (const app of apps) {
        const appPackageJsonPath = path.join(
          this.projectRoot,
          'apps',
          app,
          'package.json'
        );
        if (fs.existsSync(appPackageJsonPath)) {
          const appPackageJson = JSON.parse(
            fs.readFileSync(appPackageJsonPath, 'utf-8')
          );
          const allDeps = {
            ...appPackageJson.dependencies,
            ...appPackageJson.devDependencies,
          };

          if (allDeps.typescript) {
            this.addCheck(
              '✅',
              'TypeScript',
              `v${allDeps.typescript} (${app} 项目)`
            );
            typescriptFound = true;
            break;
          }
        }
      }

      // 如果子项目中没有找到，检查根目录
      if (!typescriptFound) {
        const packageJsonPath = path.join(this.projectRoot, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
          const packageJson = JSON.parse(
            fs.readFileSync(packageJsonPath, 'utf-8')
          );
          const allDeps = {
            ...packageJson.dependencies,
            ...packageJson.devDependencies,
          };

          if (allDeps.typescript) {
            this.addCheck(
              '✅',
              'TypeScript',
              `v${allDeps.typescript} (根目录)`
            );
            typescriptFound = true;
          }
        }
      }

      if (!typescriptFound) {
        this.addWarning('⚠️', 'TypeScript', '未在项目依赖中找到');
      }
    } catch (error) {
      this.addWarning('⚠️', 'TypeScript', '检查失败');
    }

    // 检查 Jest
    try {
      const jestVersion = execSync('npx jest --version', {
        encoding: 'utf-8',
        cwd: this.projectRoot,
      }).trim();
      this.addCheck('✅', 'Jest', jestVersion);
    } catch (error) {
      this.addWarning('⚠️', 'Jest', '未安装或无法访问');
    }

    // 检查 Vitest
    try {
      const vitestVersion = execSync('cd apps/web && npx vitest --version', {
        encoding: 'utf-8',
        cwd: this.projectRoot,
      }).trim();
      this.addCheck('✅', 'Vitest', vitestVersion);
    } catch (error) {
      this.addWarning('⚠️', 'Vitest', '未安装或无法访问');
    }

    // 检查 Commitlint
    try {
      const commitlintVersion = execSync('npx commitlint --version', {
        encoding: 'utf-8',
        cwd: this.projectRoot,
      }).trim();
      this.addCheck('✅', 'Commitlint', commitlintVersion);
    } catch (error) {
      this.addWarning('⚠️', 'Commitlint', '未安装或无法访问');
    }

    // 检查 Changesets
    try {
      const changesetVersion = execSync('npx changeset --version', {
        encoding: 'utf-8',
        cwd: this.projectRoot,
      }).trim();
      this.addCheck('✅', 'Changesets', changesetVersion);
    } catch (error) {
      this.addWarning('⚠️', 'Changesets', '未安装或无法访问');
    }
  }

  /**
   * 添加检查结果
   */
  addCheck(icon, item, message) {
    this.checks.push({ icon, item, message, type: 'success' });
    console.log(`  ${icon} ${item}: ${message}`);
  }

  addWarning(icon, item, message) {
    this.warnings.push({ icon, item, message, type: 'warning' });
    console.log(`  ${icon} ${item}: ${message}`);
  }

  addError(icon, item, message) {
    this.errors.push({ icon, item, message, type: 'error' });
    console.log(`  ${icon} ${item}: ${message}`);
  }

  addInfo(icon, item, message) {
    this.info.push({ icon, item, message, type: 'info' });
    console.log(`  ${icon} ${item}: ${message}`);
  }

  /**
   * 生成报告
   */
  generateReport() {
    console.log('\n📊 环境检查报告');
    console.log('='.repeat(50));

    const totalChecks =
      this.checks.length + this.warnings.length + this.errors.length;
    const successRate = Math.round((this.checks.length / totalChecks) * 100);

    console.log(`\n📈 检查统计:`);
    console.log(`  ✅ 成功: ${this.checks.length}`);
    console.log(`  ⚠️  警告: ${this.warnings.length}`);
    console.log(`  ❌ 错误: ${this.errors.length}`);
    console.log(`  📊 成功率: ${successRate}%`);

    if (this.errors.length > 0) {
      console.log(`\n❌ 需要修复的问题:`);
      this.errors.forEach(error => {
        console.log(`  - ${error.item}: ${error.message}`);
      });
    }

    if (this.warnings.length > 0) {
      console.log(`\n⚠️  建议改进:`);
      this.warnings.forEach(warning => {
        console.log(`  - ${warning.item}: ${warning.message}`);
      });
    }

    // 生成建议
    this.generateSuggestions();

    // 保存报告到文件
    this.saveReportToFile();

    // 根据错误数量决定退出码
    if (this.errors.length > 0) {
      console.log('\n❌ 环境检查未通过，请修复上述问题后重试。');
      process.exit(1);
    } else {
      console.log('\n✅ 环境检查通过！');
    }
  }

  /**
   * 生成建议
   */
  generateSuggestions() {
    console.log(`\n💡 改进建议:`);

    if (this.warnings.length > 0) {
      console.log(`  1. 修复所有警告项以提升开发体验`);
    }

    if (!fs.existsSync(path.join(this.projectRoot, '.env'))) {
      console.log(`  2. 创建 .env 文件: cp config/env-templates/root.env .env`);
    }

    if (!fs.existsSync(path.join(this.projectRoot, 'node_modules'))) {
      console.log(`  3. 安装依赖: pnpm install`);
    }

    console.log(`  4. 运行项目设置: pnpm run setup`);
    console.log(`  5. 初始化RBAC系统: pnpm run init:rbac`);
    console.log(`  6. 启动开发环境: pnpm run dev`);
    console.log(`  7. 检查RBAC状态: pnpm run rbac:status`);
  }

  /**
   * 检查RBAC系统
   */
  async checkRBACSystem() {
    console.log('🔐 检查RBAC系统...');

    try {
      // 检查RBAC相关文件
      const rbacFiles = [
        'apps/api/src/services/auth.service.ts',
        'apps/api/src/services/permission.service.ts',
        'apps/api/src/services/role.service.ts',
        'apps/api/src/services/audit.service.ts',
        'apps/api/src/middlewares/auth.middleware.ts',
        'apps/api/src/routes/auth.route.ts',
        'apps/api/src/routes/role.route.ts',
        'apps/api/src/routes/permission.route.ts',
        'apps/api/src/routes/audit.route.ts',
        'apps/api/src/scripts/init-rbac.ts',
      ];

      let rbacFilesExist = 0;
      for (const file of rbacFiles) {
        const filePath = path.join(this.projectRoot, file);
        if (fs.existsSync(filePath)) {
          rbacFilesExist++;
        }
      }

      if (rbacFilesExist === rbacFiles.length) {
        this.checks.push('RBAC系统文件完整');
      } else {
        this.warnings.push(`RBAC系统文件不完整 (${rbacFilesExist}/${rbacFiles.length})`);
      }

      // 检查Prisma schema中的RBAC模型
      const schemaPath = path.join(this.projectRoot, 'apps/api/prisma/schema.prisma');
      if (fs.existsSync(schemaPath)) {
        const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
        const rbacModels = ['User', 'Role', 'Permission', 'UserRole', 'RolePermission', 'AuditLog', 'UserSession'];

        let modelsExist = 0;
        for (const model of rbacModels) {
          if (schemaContent.includes(`model ${model}`)) {
            modelsExist++;
          }
        }

        if (modelsExist === rbacModels.length) {
          this.checks.push('RBAC数据库模型完整');
        } else {
          this.warnings.push(`RBAC数据库模型不完整 (${modelsExist}/${rbacModels.length})`);
        }
      }

      // 检查RBAC管理脚本
      const rbacManagerPath = path.join(this.projectRoot, 'tools/scripts/automation/rbac-manager.js');
      if (fs.existsSync(rbacManagerPath)) {
        this.checks.push('RBAC管理脚本存在');
      } else {
        this.warnings.push('RBAC管理脚本不存在');
      }

      // 检查数据库连接和RBAC状态
      try {
        const apiDir = path.join(this.projectRoot, 'apps/api');
        const result = execSync('npx prisma db execute --stdin', {
          cwd: apiDir,
          input: 'SELECT COUNT(*) FROM "roles" WHERE name IN (\'admin\', \'user\');',
          stdio: 'pipe',
        });

        const count = parseInt(result.toString().trim());
        if (count >= 2) {
          this.checks.push('RBAC系统已初始化');
        } else {
          this.warnings.push('RBAC系统未初始化，建议运行: pnpm run init:rbac');
        }
      } catch (error) {
        this.warnings.push('无法检查RBAC系统状态，请确保数据库已启动');
      }

    } catch (error) {
      this.warnings.push(`RBAC系统检查失败: ${error.message}`);
    }
  }

  /**
   * 保存报告到文件
   */
  saveReportToFile() {
    const timestamp = new Date().toISOString();
    const report = {
      timestamp,
      summary: {
        total: this.checks.length + this.warnings.length + this.errors.length,
        success: this.checks.length,
        warnings: this.warnings.length,
        errors: this.errors.length,
        successRate: Math.round(
          (this.checks.length /
            (this.checks.length + this.warnings.length + this.errors.length)) *
          100
        ),
      },
      checks: this.checks,
      warnings: this.warnings,
      errors: this.errors,
    };

    const outputDir = path.join(
      this.projectRoot,
      'docs',
      'generated',
      'reports',
      'checks'
    );
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'environment-check.json');
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf-8');

    console.log(`\n📄 详细报告已保存到: ${outputPath}`);
  }
}

// 执行检查
const checker = new EnvironmentChecker();
checker.check().catch(console.error);

export { EnvironmentChecker };
