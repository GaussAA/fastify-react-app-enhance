#!/usr/bin/env node

/**
 * 项目构建脚本
 *
 * 自动化构建整个项目，包括依赖安装、代码生成和编译
 * 支持增量构建和错误恢复
 */

import { execSync } from 'child_process';
import { existsSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../../../');

class ProjectBuilder {
  constructor() {
    this.projectRoot = projectRoot;
    this.apiDir = join(projectRoot, 'apps/api');
    this.webDir = join(projectRoot, 'apps/web');
    this.apiDistDir = join(this.apiDir, 'dist');
    this.webDistDir = join(this.webDir, 'dist');
  }

  /**
   * 主构建函数
   */
  async build() {
    console.log('🏗️ 开始项目构建...\n');

    try {
      // 清理之前的构建
      await this.cleanPreviousBuilds();

      // 安装依赖
      await this.installDependencies();

      // 生成 Prisma 客户端
      await this.generatePrismaClient();

      // 检查是否需要初始化RBAC
      await this.checkRBACInitialization();

      // 构建 API
      await this.buildAPI();

      // 构建 Web
      await this.buildWeb();

      // 验证构建结果
      await this.verifyBuilds();

      console.log('\n✅ 项目构建完成！');
      this.showBuildSummary();
    } catch (error) {
      console.error('\n❌ 项目构建失败:', error.message);
      process.exit(1);
    }
  }

  /**
   * 清理之前的构建
   */
  async cleanPreviousBuilds() {
    console.log('🧹 清理之前的构建...');

    const dirsToClean = [this.apiDistDir, this.webDistDir];

    for (const dir of dirsToClean) {
      if (existsSync(dir)) {
        try {
          rmSync(dir, { recursive: true, force: true });
          console.log(`  ✅ 清理目录: ${dir}`);
        } catch (error) {
          console.warn(`  ⚠️ 清理目录失败: ${dir} - ${error.message}`);
        }
      }
    }
  }

  /**
   * 安装依赖
   */
  async installDependencies() {
    console.log('📦 安装依赖...');

    try {
      execSync('pnpm install', {
        cwd: this.projectRoot,
        stdio: 'inherit',
      });
      console.log('  ✅ 依赖安装完成');
    } catch (error) {
      throw new Error(`依赖安装失败: ${error.message}`);
    }
  }

  /**
   * 生成 Prisma 客户端
   */
  async generatePrismaClient() {
    console.log('🔧 生成 Prisma 客户端...');

    try {
      execSync('npx prisma generate', {
        cwd: this.apiDir,
        stdio: 'inherit',
      });
      console.log('  ✅ Prisma 客户端生成完成');
    } catch (error) {
      throw new Error(`Prisma 客户端生成失败: ${error.message}`);
    }
  }

  /**
   * 构建 API
   */
  async buildAPI() {
    console.log('🔨 构建 API...');

    try {
      execSync('pnpm run build', {
        cwd: this.apiDir,
        stdio: 'inherit',
      });
      console.log('  ✅ API 构建完成');
    } catch (error) {
      throw new Error(`API 构建失败: ${error.message}`);
    }
  }

  /**
   * 构建 Web
   */
  async buildWeb() {
    console.log('🔨 构建 Web...');

    try {
      execSync('pnpm run build', {
        cwd: this.webDir,
        stdio: 'inherit',
      });
      console.log('  ✅ Web 构建完成');
    } catch (error) {
      throw new Error(`Web 构建失败: ${error.message}`);
    }
  }

  /**
   * 验证构建结果
   */
  async verifyBuilds() {
    console.log('🔍 验证构建结果...');

    const buildChecks = [
      { name: 'API', dir: this.apiDistDir, required: true },
      { name: 'Web', dir: this.webDistDir, required: true },
    ];

    for (const check of buildChecks) {
      if (existsSync(check.dir)) {
        const { readdirSync } = await import('fs');
        const files = readdirSync(check.dir);

        if (files.length > 0) {
          console.log(
            `  ✅ ${check.name} 构建验证通过 (${files.length} 个文件)`
          );
        } else {
          if (check.required) {
            throw new Error(`${check.name} 构建目录为空`);
          } else {
            console.log(`  ⚠️ ${check.name} 构建目录为空`);
          }
        }
      } else {
        if (check.required) {
          throw new Error(`${check.name} 构建目录不存在`);
        } else {
          console.log(`  ⚠️ ${check.name} 构建目录不存在`);
        }
      }
    }
  }

  /**
   * 显示构建摘要
   */
  showBuildSummary() {
    console.log('\n📁 构建文件位置：');
    console.log(`   - API: ${this.apiDistDir}`);
    console.log(`   - Web: ${this.webDistDir}`);

    console.log('\n🚀 下一步：');
    console.log('   - 运行测试: pnpm run test');
    console.log('   - 启动开发环境: pnpm run dev');
    console.log('   - 部署到生产环境: pnpm run deploy');
  }

  /**
   * 获取构建统计信息
   */
  async getBuildStats() {
    const stats = {
      api: { files: 0, size: 0 },
      web: { files: 0, size: 0 },
    };

    // 统计 API 构建
    if (existsSync(this.apiDistDir)) {
      const apiStats = await this.getDirectoryStats(this.apiDistDir);
      stats.api = apiStats;
    }

    // 统计 Web 构建
    if (existsSync(this.webDistDir)) {
      const webStats = await this.getDirectoryStats(this.webDistDir);
      stats.web = webStats;
    }

    return stats;
  }

  /**
   * 获取目录统计信息
   */
  async getDirectoryStats(dirPath) {
    const { readdirSync, statSync } = await import('fs');

    let files = 0;
    let size = 0;

    const scanDir = dir => {
      const items = readdirSync(dir);

      for (const item of items) {
        const itemPath = join(dir, item);
        const stat = statSync(itemPath);

        if (stat.isDirectory()) {
          scanDir(itemPath);
        } else {
          files++;
          size += stat.size;
        }
      }
    };

    scanDir(dirPath);

    return { files, size };
  }

  /**
   * 检查RBAC初始化
   */
  async checkRBACInitialization() {
    console.log('🔐 检查RBAC系统状态...');

    try {
      // 检查是否存在默认角色
      const { execSync } = await import('child_process');
      const result = execSync('npx prisma db execute --stdin', {
        cwd: this.apiDir,
        input:
          "SELECT COUNT(*) FROM \"roles\" WHERE name IN ('admin', 'user');",
        stdio: 'pipe',
      });

      const count = parseInt(result.toString().trim());

      if (count === 0) {
        console.log('  ⚠️ RBAC系统未初始化，建议运行: pnpm run init:rbac');
      } else {
        console.log('  ✅ RBAC系统已初始化');
      }
    } catch (error) {
      console.log('  ℹ️ 无法检查RBAC状态，请确保数据库已启动');
    }
  }

  /**
   * 格式化文件大小
   */
  formatSize(bytes) {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }
}

// 主函数
async function main() {
  const builder = new ProjectBuilder();
  await builder.build();
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { ProjectBuilder };
