#!/usr/bin/env node

/**
 * 部署脚本
 *
 * 自动化部署流程，包括测试、构建和部署
 * 支持多种部署方式：Docker、PM2、直接部署
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../../../');

class ProjectDeployer {
  constructor() {
    this.projectRoot = projectRoot;
    this.dockerComposeFile = join(
      projectRoot,
      'infrastructure/docker/docker-compose.yml'
    );
    this.apiDir = join(projectRoot, 'apps/api');
    this.webDir = join(projectRoot, 'apps/web');
    this.deploymentMode = this.detectDeploymentMode();
  }

  /**
   * 主部署函数
   */
  async deploy() {
    console.log('🚀 开始项目部署...\n');

    try {
      // 设置环境
      this.setupEnvironment();

      // 运行测试
      await this.runTests();

      // 构建项目
      await this.buildProject();

      // 检查RBAC系统
      await this.checkRBACSystem();

      // 执行部署
      await this.executeDeployment();

      // 验证部署
      await this.verifyDeployment();

      console.log('\n🎉 部署完成！');
      this.showDeploymentSummary();
    } catch (error) {
      console.error('\n❌ 部署失败:', error.message);
      process.exit(1);
    }
  }

  /**
   * 设置环境
   */
  setupEnvironment() {
    console.log('⚙️ 设置部署环境...');

    if (!process.env.NODE_ENV) {
      process.env.NODE_ENV = 'production';
      console.log('  ✅ 设置 NODE_ENV=production');
    } else {
      console.log(`  ℹ️ NODE_ENV=${process.env.NODE_ENV}`);
    }
  }

  /**
   * 运行测试
   */
  async runTests() {
    console.log('🧪 运行测试...');

    try {
      execSync('pnpm run test', {
        cwd: this.projectRoot,
        stdio: 'inherit',
      });
      console.log('  ✅ 测试通过');
    } catch (error) {
      throw new Error('测试失败，部署中止！');
    }
  }

  /**
   * 构建项目
   */
  async buildProject() {
    console.log('🏗️ 构建项目...');

    try {
      execSync('node tools/scripts/deployment/build.js', {
        cwd: this.projectRoot,
        stdio: 'inherit',
      });
      console.log('  ✅ 项目构建完成');
    } catch (error) {
      throw new Error('项目构建失败，部署中止！');
    }
  }

  /**
   * 执行部署
   */
  async executeDeployment() {
    console.log(`🚀 执行部署 (模式: ${this.deploymentMode})...`);

    switch (this.deploymentMode) {
      case 'docker':
        await this.deployWithDocker();
        break;
      case 'pm2':
        await this.deployWithPM2();
        break;
      case 'direct':
        await this.deployDirect();
        break;
      default:
        throw new Error(`不支持的部署模式: ${this.deploymentMode}`);
    }
  }

  /**
   * 使用 Docker 部署
   */
  async deployWithDocker() {
    console.log('🐳 使用 Docker 部署...');

    if (!existsSync(this.dockerComposeFile)) {
      throw new Error(`Docker Compose 文件不存在: ${this.dockerComposeFile}`);
    }

    try {
      // 构建 Docker 镜像
      console.log('  🔨 构建 Docker 镜像...');
      execSync(`docker compose -f ${this.dockerComposeFile} build`, {
        cwd: join(projectRoot, 'infrastructure/docker'),
        stdio: 'inherit',
      });

      // 启动服务
      console.log('  🚀 启动服务...');
      execSync(`docker compose -f ${this.dockerComposeFile} up -d`, {
        cwd: join(projectRoot, 'infrastructure/docker'),
        stdio: 'inherit',
      });

      console.log('  ✅ Docker 部署完成');
    } catch (error) {
      throw new Error(`Docker 部署失败: ${error.message}`);
    }
  }

  /**
   * 使用 PM2 部署
   */
  async deployWithPM2() {
    console.log('📦 使用 PM2 部署...');

    try {
      // 检查 PM2 是否安装
      execSync('pm2 --version', { stdio: 'pipe' });

      // 停止现有服务
      console.log('  🛑 停止现有服务...');
      try {
        execSync('pm2 stop fastify-api', { stdio: 'pipe' });
        execSync('pm2 delete fastify-api', { stdio: 'pipe' });
      } catch (error) {
        // 忽略服务不存在的错误
      }

      // 启动 API 服务
      console.log('  🚀 启动 API 服务...');
      execSync(
        'pm2 start dist/server.js --name "fastify-api" --env production',
        {
          cwd: this.apiDir,
          stdio: 'inherit',
        }
      );

      console.log('  ✅ PM2 部署完成');
    } catch (error) {
      if (error.message.includes('pm2: command not found')) {
        throw new Error('PM2 未安装，请先安装 PM2: npm install -g pm2');
      }
      throw new Error(`PM2 部署失败: ${error.message}`);
    }
  }

  /**
   * 直接部署
   */
  async deployDirect() {
    console.log('📦 直接部署...');

    try {
      // 启动 API 服务
      console.log('  🚀 启动 API 服务...');
      const apiProcess = execSync('node dist/server.js', {
        cwd: this.apiDir,
        stdio: 'inherit',
        detached: true,
      });

      console.log('  ✅ 直接部署完成');
      console.log('  ℹ️ 服务已在后台运行');
    } catch (error) {
      throw new Error(`直接部署失败: ${error.message}`);
    }
  }

  /**
   * 验证部署
   */
  async verifyDeployment() {
    console.log('🔍 验证部署...');

    const maxAttempts = 10;
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        // 检查 API 健康状态
        const response = await fetch('http://localhost:8001/');
        if (response.ok) {
          console.log('  ✅ API 服务健康检查通过');
          return;
        }
      } catch (error) {
        // 忽略连接错误，继续重试
      }

      attempts++;
      if (attempts >= maxAttempts) {
        console.warn('  ⚠️ 健康检查超时，但部署可能仍然成功');
        return;
      }

      await this.sleep(2000);
      process.stdout.write('.');
    }
  }

  /**
   * 检测部署模式
   */
  detectDeploymentMode() {
    // 优先使用环境变量
    if (process.env.DEPLOYMENT_MODE) {
      return process.env.DEPLOYMENT_MODE;
    }

    // 检查 Docker 是否可用
    try {
      execSync('docker --version', { stdio: 'pipe' });
      if (existsSync(this.dockerComposeFile)) {
        return 'docker';
      }
    } catch (error) {
      // Docker 不可用
    }

    // 检查 PM2 是否可用
    try {
      execSync('pm2 --version', { stdio: 'pipe' });
      return 'pm2';
    } catch (error) {
      // PM2 不可用
    }

    // 默认使用直接部署
    return 'direct';
  }

  /**
   * 显示部署摘要
   */
  showDeploymentSummary() {
    console.log('\n📡 服务地址：');
    console.log('   - API 服务: http://localhost:8001');
    console.log('   - Web 服务: http://localhost:5173');

    console.log('\n🔧 管理命令：');
    switch (this.deploymentMode) {
      case 'docker':
        console.log(
          '   - 查看日志: docker compose -f infrastructure/docker/docker-compose.yml logs'
        );
        console.log(
          '   - 停止服务: docker compose -f infrastructure/docker/docker-compose.yml down'
        );
        break;
      case 'pm2':
        console.log('   - 查看状态: pm2 status');
        console.log('   - 查看日志: pm2 logs fastify-api');
        console.log('   - 停止服务: pm2 stop fastify-api');
        break;
      case 'direct':
        console.log('   - 查看进程: ps aux | grep node');
        console.log('   - 停止服务: kill <pid>');
        break;
    }
  }

  /**
   * 检查RBAC系统
   */
  async checkRBACSystem() {
    console.log('🔐 检查RBAC系统状态...');

    try {
      // 检查是否存在默认角色
      const result = execSync('npx prisma db execute --stdin', {
        cwd: this.apiDir,
        input:
          "SELECT COUNT(*) FROM \"roles\" WHERE name IN ('admin', 'user');",
        stdio: 'pipe',
      });

      const count = parseInt(result.toString().trim());

      if (count === 0) {
        console.log('  ⚠️ RBAC系统未初始化，正在初始化...');
        await this.initRBACSystem();
      } else {
        console.log('  ✅ RBAC系统已初始化');
      }
    } catch (error) {
      console.log('  ℹ️ 无法检查RBAC状态，跳过检查');
    }
  }

  /**
   * 初始化RBAC系统
   */
  async initRBACSystem() {
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
  const deployer = new ProjectDeployer();
  await deployer.deploy();
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { ProjectDeployer };
