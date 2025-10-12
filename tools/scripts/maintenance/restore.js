#!/usr/bin/env node

/**
 * 环境恢复脚本
 *
 * 快速恢复开发环境，包括依赖安装、环境配置、数据库设置和RBAC初始化
 */

import { existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import SecureEnvManager from '../utils/env-manager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../../../');

// 颜色定义
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, description, cwd = projectRoot) {
  log(`🔄 ${description}...`, 'blue');
  try {
    execSync(command, { stdio: 'inherit', cwd });
    log(`✅ ${description}完成`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${description}失败: ${error.message}`, 'red');
    return false;
  }
}

function ensureDirectoryExists(dirPath) {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
    log(`📁 创建目录: ${dirPath}`, 'green');
  }
}

function createEnvFiles() {
  log('📝 创建安全的环境配置文件...', 'blue');

  try {
    // 初始化安全环境管理器
    const envManager = new SecureEnvManager(projectRoot);

    // 确保 .env.secrets 在 .gitignore 中
    envManager.ensureSecretsIgnored();

    // 确保配置目录存在
    ensureDirectoryExists(join(projectRoot, 'config'));
    ensureDirectoryExists(join(projectRoot, 'config/env-templates'));

    // 生成根目录 .env 文件
    const rootEnvPath = join(projectRoot, '.env');
    if (!existsSync(rootEnvPath)) {
      envManager.generateEnvFile('root', rootEnvPath);
      log('✅ 创建根目录 .env 文件', 'green');
    } else {
      log('ℹ️ 根目录 .env 文件已存在，跳过创建', 'blue');
    }

    // 生成 API 项目 .env 文件
    const apiEnvPath = join(projectRoot, 'apps/api/.env');
    if (!existsSync(apiEnvPath)) {
      envManager.generateEnvFile('api', apiEnvPath);
      log('✅ 创建 API 项目 .env 文件', 'green');
    } else {
      log('ℹ️ API 项目 .env 文件已存在，跳过创建', 'blue');
    }

    // 生成 Web 项目 .env 文件
    const webEnvPath = join(projectRoot, 'apps/web/.env');
    if (!existsSync(webEnvPath)) {
      envManager.generateEnvFile('web', webEnvPath);
      log('✅ 创建 Web 项目 .env 文件', 'green');
    } else {
      log('ℹ️ Web 项目 .env 文件已存在，跳过创建', 'blue');
    }

    // 生成 Docker Compose 配置文件
    const dockerComposePath = join(projectRoot, 'infrastructure/docker/docker-compose.yml');
    if (!existsSync(dockerComposePath)) {
      envManager.generateDockerCompose();
      log('✅ 创建 Docker Compose 配置文件', 'green');
    } else {
      log('ℹ️ Docker Compose 配置文件已存在，跳过创建', 'blue');
    }

    // 验证生成的环境配置
    log('🔍 验证环境配置...', 'blue');
    try {
      envManager.validateEnvFile(rootEnvPath);
      envManager.validateEnvFile(apiEnvPath);
      envManager.validateEnvFile(webEnvPath);
      log('✅ 环境配置验证通过', 'green');
    } catch (error) {
      log(`⚠️ 环境配置验证失败: ${error.message}`, 'yellow');
    }
  } catch (error) {
    log(`❌ 创建环境配置文件失败: ${error.message}`, 'red');
    log('💡 请检查模板文件是否存在', 'blue');
    throw error;
  }
}

function createEssentialDirectories() {
  log('📁 创建必要目录...', 'blue');
  // 只创建真正需要的目录
  ensureDirectoryExists(join(projectRoot, 'config'));
  ensureDirectoryExists(join(projectRoot, 'config/env-templates'));
}

async function restoreEnvironment() {
  log('🔄 开始恢复开发环境...', 'blue');

  // 1. 创建必要的目录结构
  createEssentialDirectories();

  // 2. 创建环境配置文件
  createEnvFiles();

  // 3. 安装依赖
  if (!runCommand('pnpm install', '安装项目依赖', projectRoot)) {
    log('❌ 依赖安装失败，恢复中止！', 'red');
    process.exit(1);
  }

  // 4. 运行 Git Hooks 准备（可选）
  try {
    runCommand('pnpm run prepare', '准备 Git Hooks', projectRoot);
  } catch (error) {
    log('⚠️ Git Hooks 准备失败，但继续执行', 'yellow');
  }

  // 5. 生成 Prisma 客户端
  try {
    runCommand('pnpm run prisma:generate', '生成 Prisma 客户端', projectRoot);
  } catch (error) {
    log('⚠️ Prisma 客户端生成失败，但继续执行', 'yellow');
  }

  // 6. 数据库设置（可选）
  log('🐳 检查数据库服务...', 'blue');
  try {
    execSync('docker info', { stdio: 'ignore' });
    log('✅ Docker 服务正在运行', 'green');

    // 尝试启动数据库和运行迁移
    try {
      runCommand('pnpm run db:start', '启动数据库服务', projectRoot);
      await new Promise(resolve => setTimeout(resolve, 3000)); // 等待3秒
      runCommand('pnpm run prisma:migrate', '运行数据库迁移', projectRoot);
    } catch (error) {
      log('⚠️ 数据库操作失败，请手动运行: pnpm run db:setup', 'yellow');
    }
  } catch (error) {
    log('⚠️ Docker 服务未运行，跳过数据库操作', 'yellow');
    log('💡 请手动运行: pnpm run db:setup', 'blue');
  }

  // 7. 初始化RBAC系统（可选）
  log('🔐 检查RBAC系统...', 'blue');
  try {
    // 检查是否需要初始化RBAC
    const result = execSync('npx prisma db execute --stdin', {
      cwd: join(projectRoot, 'apps/api'),
      input: 'SELECT COUNT(*) FROM "roles" WHERE name IN (\'admin\', \'user\');',
      stdio: 'pipe',
    });

    const count = parseInt(result.toString().trim());
    if (count === 0) {
      log('🔐 初始化RBAC系统...', 'blue');
      if (runCommand('pnpm run init:rbac', '初始化RBAC系统', projectRoot)) {
        log('✅ RBAC系统初始化完成', 'green');
      } else {
        log('⚠️ RBAC系统初始化失败，但继续执行', 'yellow');
      }
    } else {
      log('✅ RBAC系统已初始化', 'green');
    }
  } catch (error) {
    log('⚠️ 无法检查RBAC状态，跳过RBAC初始化', 'yellow');
  }

  log('🎉 环境恢复完成！', 'green');
  log('💡 下一步操作：', 'blue');
  log('  1. 运行 "pnpm run dev" 启动开发环境', 'blue');
  log('  2. 访问 http://localhost:8001 查看 API 文档', 'blue');
  log('  3. 访问 http://localhost:5173 查看 Web 应用', 'blue');
  log('  4. 运行 "pnpm run rbac:status" 检查RBAC系统状态', 'blue');
}

// 主函数
async function main() {
  try {
    await restoreEnvironment();
  } catch (error) {
    log(`❌ 环境恢复失败: ${error.message}`, 'red');
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  main().catch(console.error);
}

export { restoreEnvironment };
