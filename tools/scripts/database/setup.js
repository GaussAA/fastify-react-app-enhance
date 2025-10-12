#!/usr/bin/env node

/**
 * 数据库设置脚本
 *
 * 自动设置和初始化数据库环境
 * 支持 PostgreSQL 和 Redis 的启动、迁移和种子数据
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../../../');

class DatabaseSetup {
  constructor() {
    this.projectRoot = projectRoot;
    this.dockerComposeFile = join(
      projectRoot,
      'infrastructure/docker/docker-compose.yml'
    );
    this.apiDir = join(projectRoot, 'apps/api');
  }

  /**
   * 主设置函数
   */
  async setup() {
    console.log('🗄️ 开始数据库设置...\n');

    try {
      // 检查 Docker 是否运行
      await this.checkDocker();

      // 启动 PostgreSQL 数据库
      await this.startPostgreSQL();

      // 等待数据库启动
      await this.waitForDatabase();

      // 运行数据库迁移
      await this.runMigrations();

      // 生成 Prisma 客户端
      await this.generatePrismaClient();

      // 询问是否运行种子数据
      await this.runSeeds();

      // 询问是否初始化RBAC系统
      await this.initRBAC();

      console.log('\n✅ 数据库设置完成！');
    } catch (error) {
      console.error('\n❌ 数据库设置失败:', error.message);
      process.exit(1);
    }
  }

  /**
   * 检查 Docker 是否运行
   */
  async checkDocker() {
    console.log('🐳 检查 Docker 状态...');

    try {
      execSync('docker info', { stdio: 'pipe' });
      console.log('  ✅ Docker 正在运行');
    } catch (error) {
      throw new Error('Docker 未运行，请先启动 Docker');
    }
  }

  /**
   * 启动 PostgreSQL 数据库
   */
  async startPostgreSQL() {
    console.log('🐘 启动 PostgreSQL 数据库...');

    if (!existsSync(this.dockerComposeFile)) {
      throw new Error(`Docker Compose 文件不存在: ${this.dockerComposeFile}`);
    }

    try {
      execSync(`docker compose -f ${this.dockerComposeFile} up -d postgres`, {
        cwd: join(projectRoot, 'infrastructure/docker'),
        stdio: 'inherit',
      });
      console.log('  ✅ PostgreSQL 启动成功');
    } catch (error) {
      throw new Error(`PostgreSQL 启动失败: ${error.message}`);
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
   * 运行种子数据
   */
  async runSeeds() {
    console.log('\n🌱 询问是否运行数据库种子...');

    // 在自动化环境中，默认运行种子数据
    if (process.env.CI || process.env.AUTOMATED) {
      console.log('  🤖 自动化环境，运行种子数据...');
      await this.executeSeeds();
      return;
    }

    // 在交互环境中，询问用户
    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise(resolve => {
      rl.question('是否运行数据库种子？(y/n): ', async answer => {
        rl.close();

        if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
          await this.executeSeeds();
        } else {
          console.log('  ⏭️ 跳过种子数据');
        }
        resolve();
      });
    });
  }

  /**
   * 执行种子数据
   */
  async executeSeeds() {
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
   * 初始化RBAC系统
   */
  async initRBAC() {
    console.log('\n🔐 询问是否初始化RBAC系统...');

    // 在自动化环境中，默认初始化RBAC
    if (process.env.CI || process.env.AUTOMATED) {
      console.log('  🤖 自动化环境，初始化RBAC系统...');
      await this.executeRBACInit();
      return;
    }

    // 在交互环境中，询问用户
    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise(resolve => {
      rl.question('是否初始化RBAC系统（创建默认权限、角色和管理员用户）？(y/n): ', async answer => {
        rl.close();

        if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
          await this.executeRBACInit();
        } else {
          console.log('  ⏭️ 跳过RBAC初始化');
        }
        resolve();
      });
    });
  }

  /**
   * 执行RBAC初始化
   */
  async executeRBACInit() {
    try {
      execSync('pnpm run init:rbac', {
        cwd: this.projectRoot,
        stdio: 'inherit',
      });
      console.log('  ✅ RBAC系统初始化完成');
    } catch (error) {
      console.warn(`  ⚠️ RBAC系统初始化失败: ${error.message}`);
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
  const setup = new DatabaseSetup();
  await setup.setup();
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { DatabaseSetup };
