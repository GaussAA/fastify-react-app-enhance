#!/usr/bin/env node

/**
 * 数据库重置脚本
 *
 * 安全地重置数据库环境，包括数据清理和重新初始化
 * 支持交互式确认和自动化模式
 */

import { execSync } from 'child_process';
import { existsSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../../../');

class DatabaseReset {
  constructor() {
    this.projectRoot = projectRoot;
    this.dockerComposeFile = join(
      projectRoot,
      'infrastructure/docker/docker-compose.yml'
    );
    this.apiDir = join(projectRoot, 'apps/api');
    this.postgresDataDir = join(
      projectRoot,
      'infrastructure/database/postgres'
    );
  }

  /**
   * 主重置函数
   */
  async reset() {
    console.log('🔄 开始数据库重置...\n');

    try {
      // 确认操作
      await this.confirmReset();

      // 停止并删除数据库容器
      await this.stopDatabaseContainers();

      // 删除数据库数据
      await this.cleanDatabaseData();

      // 重新启动数据库
      await this.restartDatabase();

      // 等待数据库启动
      await this.waitForDatabase();

      // 运行数据库迁移
      await this.runMigrations();

      // 生成 Prisma 客户端
      await this.generatePrismaClient();

      // 运行数据库种子
      await this.runSeeds();

      console.log('\n✅ 数据库重置完成！');
    } catch (error) {
      console.error('\n❌ 数据库重置失败:', error.message);
      process.exit(1);
    }
  }

  /**
   * 确认重置操作
   */
  async confirmReset() {
    // 在自动化环境中跳过确认
    if (process.env.CI || process.env.AUTOMATED) {
      console.log('🤖 自动化环境，跳过确认步骤');
      return;
    }

    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve, reject) => {
      rl.question('⚠️ 这将删除所有数据，确定要继续吗？(y/n): ', answer => {
        rl.close();

        if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
          console.log('  ✅ 用户确认继续');
          resolve();
        } else {
          console.log('  ❌ 操作已取消');
          reject(new Error('用户取消操作'));
        }
      });
    });
  }

  /**
   * 停止并删除数据库容器
   */
  async stopDatabaseContainers() {
    console.log('🛑 停止数据库容器...');

    if (!existsSync(this.dockerComposeFile)) {
      throw new Error(`Docker Compose 文件不存在: ${this.dockerComposeFile}`);
    }

    try {
      execSync(`docker compose -f ${this.dockerComposeFile} down`, {
        cwd: join(projectRoot, 'infrastructure/docker'),
        stdio: 'inherit',
      });
      console.log('  ✅ 数据库容器已停止');
    } catch (error) {
      console.warn(`  ⚠️ 停止容器时出现警告: ${error.message}`);
    }
  }

  /**
   * 删除数据库数据
   */
  async cleanDatabaseData() {
    console.log('🗑️ 删除数据库数据...');

    if (existsSync(this.postgresDataDir)) {
      try {
        // 安全地删除数据目录内容
        const { readdirSync, statSync } = await import('fs');
        const items = readdirSync(this.postgresDataDir);

        for (const item of items) {
          const itemPath = join(this.postgresDataDir, item);
          const stat = statSync(itemPath);

          if (stat.isDirectory()) {
            rmSync(itemPath, { recursive: true, force: true });
          } else {
            rmSync(itemPath, { force: true });
          }
        }

        console.log('  ✅ 数据库数据已清理');
      } catch (error) {
        throw new Error(`清理数据库数据失败: ${error.message}`);
      }
    } else {
      console.log('  ℹ️ 数据库数据目录不存在，跳过清理');
    }
  }

  /**
   * 重新启动数据库
   */
  async restartDatabase() {
    console.log('🐘 重新启动数据库...');

    try {
      execSync(`docker compose -f ${this.dockerComposeFile} up -d postgres`, {
        cwd: join(projectRoot, 'infrastructure/docker'),
        stdio: 'inherit',
      });
      console.log('  ✅ 数据库重新启动成功');
    } catch (error) {
      throw new Error(`数据库重启失败: ${error.message}`);
    }
  }

  /**
   * 等待数据库启动
   */
  async waitForDatabase() {
    console.log('⏳ 等待数据库启动...');

    const maxAttempts = 30;
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        execSync('docker exec docker-postgres-1 pg_isready -U postgres_user', {
          stdio: 'pipe',
        });
        console.log('  ✅ 数据库已就绪');
        return;
      } catch (error) {
        attempts++;
        if (attempts >= maxAttempts) {
          throw new Error('数据库启动超时');
        }
        await this.sleep(1000);
        process.stdout.write('.');
      }
    }
  }

  /**
   * 运行数据库迁移
   */
  async runMigrations() {
    console.log('\n🔄 运行数据库迁移...');

    try {
      execSync('npx prisma migrate dev --name init', {
        cwd: this.apiDir,
        stdio: 'inherit',
      });
      console.log('  ✅ 数据库迁移完成');
    } catch (error) {
      throw new Error(`数据库迁移失败: ${error.message}`);
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
   * 运行数据库种子
   */
  async runSeeds() {
    console.log('🌱 运行数据库种子...');

    try {
      execSync('npx prisma db seed', {
        cwd: this.apiDir,
        stdio: 'inherit',
      });
      console.log('  ✅ 种子数据运行完成');
    } catch (error) {
      console.warn(`  ⚠️ 种子数据运行失败: ${error.message}`);
    }
  }

  /**
   * 睡眠函数
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 主函数
async function main() {
  const reset = new DatabaseReset();
  await reset.reset();
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { DatabaseReset };
