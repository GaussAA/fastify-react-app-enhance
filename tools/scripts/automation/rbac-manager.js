#!/usr/bin/env node

/**
 * RBAC 管理脚本
 *
 * 提供RBAC系统的管理功能，包括初始化、重置、状态检查等
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../../../');

class RBACManager {
  constructor() {
    this.projectRoot = projectRoot;
    this.apiDir = join(projectRoot, 'apps/api');
  }

  /**
   * 主函数
   */
  async run() {
    const args = process.argv.slice(2);
    const command = args[0] || 'help';

    console.log('🔐 RBAC 系统管理器\n');

    switch (command) {
      case 'init':
        await this.initializeRBAC();
        break;
      case 'reset':
        await this.resetRBAC();
        break;
      case 'status':
        await this.checkStatus();
        break;
      case 'create-admin':
        await this.createAdminUser();
        break;
      case 'backup':
        await this.backupRBAC();
        break;
      case 'restore':
        await this.restoreRBAC(args[1]);
        break;
      case 'help':
        this.showHelp();
        break;
      default:
        console.error(`❌ 未知命令: ${command}`);
        this.showHelp();
    }
  }

  /**
   * 初始化RBAC系统
   */
  async initializeRBAC() {
    console.log('🚀 初始化RBAC系统...\n');

    try {
      // 检查数据库是否运行
      await this.checkDatabaseConnection();

      // 运行RBAC初始化脚本
      execSync('pnpm run init:rbac', {
        cwd: this.projectRoot,
        stdio: 'inherit',
      });

      console.log('\n✅ RBAC系统初始化完成！');
      this.showAdminCredentials();
    } catch (error) {
      console.error('\n❌ RBAC系统初始化失败:', error.message);
      process.exit(1);
    }
  }

  /**
   * 重置RBAC系统
   */
  async resetRBAC() {
    console.log('🔄 重置RBAC系统...\n');

    try {
      // 确认操作
      if (!(await this.confirmAction('这将删除所有RBAC数据，是否继续？'))) {
        console.log('操作已取消');
        return;
      }

      // 重置数据库
      console.log('🗄️ 重置数据库...');
      execSync('pnpm run db:reset', {
        cwd: this.projectRoot,
        stdio: 'inherit',
      });

      // 重新初始化RBAC
      console.log('🔐 重新初始化RBAC系统...');
      execSync('pnpm run init:rbac', {
        cwd: this.projectRoot,
        stdio: 'inherit',
      });

      console.log('\n✅ RBAC系统重置完成！');
      this.showAdminCredentials();
    } catch (error) {
      console.error('\n❌ RBAC系统重置失败:', error.message);
      process.exit(1);
    }
  }

  /**
   * 检查RBAC系统状态
   */
  async checkStatus() {
    console.log('📊 检查RBAC系统状态...\n');

    try {
      // 检查数据库连接
      await this.checkDatabaseConnection();

      // 检查角色数量
      const roleCount = await this.getRoleCount();
      console.log(`📋 角色数量: ${roleCount}`);

      // 检查权限数量
      const permissionCount = await this.getPermissionCount();
      console.log(`🔐 权限数量: ${permissionCount}`);

      // 检查用户数量
      const userCount = await this.getUserCount();
      console.log(`👥 用户数量: ${userCount}`);

      // 检查管理员用户
      const adminCount = await this.getAdminUserCount();
      console.log(`👑 管理员用户: ${adminCount}`);

      // 显示系统状态
      console.log('\n📈 系统状态:');
      if (roleCount >= 2 && permissionCount >= 10 && adminCount >= 1) {
        console.log('  ✅ RBAC系统运行正常');
      } else {
        console.log('  ⚠️ RBAC系统可能未完全初始化');
        console.log('  💡 建议运行: pnpm run rbac:init');
      }
    } catch (error) {
      console.error('\n❌ 状态检查失败:', error.message);
    }
  }

  /**
   * 创建管理员用户
   */
  async createAdminUser() {
    console.log('👑 创建管理员用户...\n');

    try {
      // 检查数据库连接
      await this.checkDatabaseConnection();

      // 运行管理员创建脚本
      execSync('pnpm run init:rbac', {
        cwd: this.projectRoot,
        stdio: 'inherit',
      });

      console.log('\n✅ 管理员用户创建完成！');
      this.showAdminCredentials();
    } catch (error) {
      console.error('\n❌ 管理员用户创建失败:', error.message);
      process.exit(1);
    }
  }

  /**
   * 备份RBAC数据
   */
  async backupRBAC() {
    console.log('💾 备份RBAC数据...\n');

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = `rbac-backup-${timestamp}.sql`;

      // 创建备份目录
      const backupDir = join(this.projectRoot, 'backups');
      if (!existsSync(backupDir)) {
        execSync(`mkdir -p ${backupDir}`, { cwd: this.projectRoot });
      }

      // 备份RBAC相关表
      const tables = [
        'users',
        'roles',
        'permissions',
        'user_roles',
        'role_permissions',
        'audit_logs',
      ];
      const backupPath = join(backupDir, backupFile);

      console.log(`📁 备份文件: ${backupPath}`);

      // 使用pg_dump备份特定表
      const tableList = tables.join(' ');
      execSync(
        `pg_dump -h localhost -U postgres -d fastify_react_app -t ${tableList} > ${backupPath}`,
        {
          cwd: this.projectRoot,
          stdio: 'inherit',
        }
      );

      console.log('\n✅ RBAC数据备份完成！');
    } catch (error) {
      console.error('\n❌ RBAC数据备份失败:', error.message);
      process.exit(1);
    }
  }

  /**
   * 恢复RBAC数据
   */
  async restoreRBAC(backupFile) {
    if (!backupFile) {
      console.error('❌ 请指定备份文件路径');
      return;
    }

    console.log(`🔄 恢复RBAC数据: ${backupFile}\n`);

    try {
      // 确认操作
      if (!(await this.confirmAction('这将覆盖现有RBAC数据，是否继续？'))) {
        console.log('操作已取消');
        return;
      }

      // 检查备份文件是否存在
      if (!existsSync(backupFile)) {
        throw new Error(`备份文件不存在: ${backupFile}`);
      }

      // 恢复数据
      execSync(
        `psql -h localhost -U postgres -d fastify_react_app < ${backupFile}`,
        {
          cwd: this.projectRoot,
          stdio: 'inherit',
        }
      );

      console.log('\n✅ RBAC数据恢复完成！');
    } catch (error) {
      console.error('\n❌ RBAC数据恢复失败:', error.message);
      process.exit(1);
    }
  }

  /**
   * 检查数据库连接
   */
  async checkDatabaseConnection() {
    try {
      execSync('npx prisma db execute --stdin', {
        cwd: this.apiDir,
        input: 'SELECT 1;',
        stdio: 'pipe',
      });
      console.log('✅ 数据库连接正常');
    } catch (error) {
      throw new Error('数据库连接失败，请确保数据库已启动');
    }
  }

  /**
   * 获取角色数量
   */
  async getRoleCount() {
    try {
      const result = execSync('npx prisma db execute --stdin', {
        cwd: this.apiDir,
        input: 'SELECT COUNT(*) FROM "roles";',
        stdio: 'pipe',
      });
      return parseInt(result.toString().trim());
    } catch (error) {
      return 0;
    }
  }

  /**
   * 获取权限数量
   */
  async getPermissionCount() {
    try {
      const result = execSync('npx prisma db execute --stdin', {
        cwd: this.apiDir,
        input: 'SELECT COUNT(*) FROM "permissions";',
        stdio: 'pipe',
      });
      return parseInt(result.toString().trim());
    } catch (error) {
      return 0;
    }
  }

  /**
   * 获取用户数量
   */
  async getUserCount() {
    try {
      const result = execSync('npx prisma db execute --stdin', {
        cwd: this.apiDir,
        input: 'SELECT COUNT(*) FROM "users";',
        stdio: 'pipe',
      });
      return parseInt(result.toString().trim());
    } catch (error) {
      return 0;
    }
  }

  /**
   * 获取管理员用户数量
   */
  async getAdminUserCount() {
    try {
      const result = execSync('npx prisma db execute --stdin', {
        cwd: this.apiDir,
        input:
          'SELECT COUNT(*) FROM "users" u JOIN "user_roles" ur ON u.id = ur."userId" JOIN "roles" r ON ur."roleId" = r.id WHERE r.name = \'admin\';',
        stdio: 'pipe',
      });
      return parseInt(result.toString().trim());
    } catch (error) {
      return 0;
    }
  }

  /**
   * 显示管理员凭据
   */
  showAdminCredentials() {
    console.log('\n🔑 默认管理员账户:');
    console.log('   📧 邮箱: admin@example.com');
    console.log('   🔐 密码: Admin123!@#');
    console.log('   ⚠️  请在生产环境中立即修改密码！');
  }

  /**
   * 确认操作
   */
  async confirmAction(message) {
    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise(resolve => {
      rl.question(`${message} (y/n): `, answer => {
        rl.close();
        resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
      });
    });
  }

  /**
   * 显示帮助信息
   */
  showHelp() {
    console.log(`
🔐 RBAC 系统管理器

用法: node rbac-manager.js <命令> [参数...]

命令:
  init                    - 初始化RBAC系统
  reset                   - 重置RBAC系统（删除所有数据）
  status                  - 检查RBAC系统状态
  create-admin            - 创建管理员用户
  backup                  - 备份RBAC数据
  restore <备份文件>      - 恢复RBAC数据
  help                    - 显示此帮助信息

示例:
  node rbac-manager.js init
  node rbac-manager.js status
  node rbac-manager.js reset
  node rbac-manager.js backup
  node rbac-manager.js restore backups/rbac-backup-2024-01-01.sql

注意事项:
  - 重置操作将删除所有RBAC数据，请谨慎使用
  - 备份和恢复功能需要PostgreSQL客户端工具
  - 确保数据库服务正在运行
`);
  }
}

// 主函数
async function main() {
  const manager = new RBACManager();
  await manager.run();
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { RBACManager };
