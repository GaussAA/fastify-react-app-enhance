#!/usr/bin/env node

/**
 * 一键启动项目脚本
 * 
 * 功能：
 * - 检查环境配置
 * - 启动数据库服务
 * - 启动开发服务器
 * - 提供友好的用户界面
 */

import { execSync, spawn } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import { config as dotenvConfig } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../../../');

// 加载环境变量
const envFile = join(projectRoot, '.env');
if (existsSync(envFile)) {
  dotenvConfig({ path: envFile });
}

// 颜色定义
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, description, cwd = projectRoot, silent = false) {
  if (!silent) log(`🔄 ${description}...`, 'blue');
  try {
    const result = execSync(command, {
      stdio: silent ? 'pipe' : 'inherit',
      cwd,
      encoding: 'utf8'
    });
    if (!silent) log(`✅ ${description}完成`, 'green');
    return { success: true, output: result };
  } catch (error) {
    if (!silent) log(`❌ ${description}失败: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

function checkPort(port) {
  try {
    if (process.platform === 'win32') {
      execSync(`netstat -ano | findstr :${port}`, { stdio: 'pipe' });
      return true;
    } else {
      execSync(`lsof -i :${port}`, { stdio: 'pipe' });
      return true;
    }
  } catch (error) {
    return false;
  }
}

function waitForPort(port, serviceName, maxWait = 30) {
  log(`⏳ 等待${serviceName}启动 (端口${port})...`, 'yellow');

  for (let i = 0; i < maxWait; i++) {
    if (checkPort(port)) {
      log(`✅ ${serviceName}已启动`, 'green');
      return true;
    }
    // 等待1秒
    try {
      execSync('timeout 1 > nul 2>&1', { stdio: 'pipe' });
    } catch (error) {
      // 忽略超时错误
    }
  }

  log(`⚠️ ${serviceName}启动超时`, 'yellow');
  return false;
}

function checkDocker() {
  try {
    execSync('docker info', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

function checkEnvironment() {
  log('🔍 检查环境配置...', 'blue');

  // 检查 .env 文件
  const envFile = join(projectRoot, '.env');
  if (!existsSync(envFile)) {
    log('⚠️ 缺少 .env 文件', 'yellow');
    log('💡 请复制 env.template 为 .env 并配置必要的环境变量', 'blue');
    return false;
  }

  // 从环境变量或配置文件读取必需的环境变量列表
  const requiredVarsEnv = process.env.REQUIRED_ENV_VARS;
  let requiredVars = [];

  if (requiredVarsEnv) {
    // 从环境变量读取必需变量列表
    requiredVars = requiredVarsEnv.split(',').map(v => v.trim()).filter(v => v);
  } else {
    // 默认必需变量（可以通过环境变量覆盖）
    requiredVars = (process.env.DEFAULT_REQUIRED_VARS || 'JWT_SECRET,DATABASE_URL').split(',').map(v => v.trim()).filter(v => v);
  }

  const missing = [];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    log('⚠️ 缺少必需的环境变量:', 'yellow');
    missing.forEach(varName => log(`  - ${varName}`, 'yellow'));
    log('💡 请在 .env 文件中设置这些变量', 'blue');
    log('💡 或通过 REQUIRED_ENV_VARS 环境变量自定义必需变量列表', 'blue');
    return false;
  }

  log('✅ 环境配置检查通过', 'green');
  return true;
}

function checkDependencies() {
  log('📦 检查项目依赖...', 'blue');

  if (!existsSync(join(projectRoot, 'node_modules'))) {
    log('⚠️ 项目依赖未安装', 'yellow');
    log('💡 正在安装依赖...', 'blue');
    if (!runCommand('pnpm install', '安装项目依赖').success) {
      log('❌ 依赖安装失败', 'red');
      return false;
    }
  } else {
    log('✅ 项目依赖已安装', 'green');
  }

  return true;
}

function startDatabase() {
  log('🐳 启动数据库服务...', 'blue');

  if (!checkDocker()) {
    log('❌ Docker未运行，请先启动Docker', 'red');
    return false;
  }

  // 检查 docker-compose.yml 文件
  const composeFile = process.env.DOCKER_COMPOSE_FILE || 'infrastructure/docker/docker-compose.yml';
  const fullComposePath = join(projectRoot, composeFile);
  if (!existsSync(fullComposePath)) {
    log(`⚠️ 缺少 ${composeFile} 文件`, 'yellow');
    log('💡 请确保 Docker Compose 配置文件存在', 'blue');
    return false;
  }

  // 从环境变量读取服务名称
  const postgresService = process.env.POSTGRES_SERVICE || 'postgres';
  const redisService = process.env.REDIS_SERVICE || 'redis';
  const services = `${postgresService} ${redisService}`;

  // 启动数据库容器
  if (!runCommand(`docker compose -f ${composeFile} up -d ${services}`, '启动数据库容器').success) {
    log('❌ 数据库启动失败', 'red');
    return false;
  }

  // 从环境变量读取端口配置
  const postgresPort = process.env.POSTGRES_PORT || '5432';
  const redisPort = process.env.REDIS_PORT || '6379';
  const postgresWaitTime = parseInt(process.env.POSTGRES_WAIT_TIME || '30');
  const redisWaitTime = parseInt(process.env.REDIS_WAIT_TIME || '15');

  // 等待数据库启动
  if (!waitForPort(postgresPort, 'PostgreSQL', postgresWaitTime)) {
    log('⚠️ PostgreSQL启动超时，但继续执行', 'yellow');
  }

  if (!waitForPort(redisPort, 'Redis', redisWaitTime)) {
    log('⚠️ Redis启动超时，但继续执行', 'yellow');
  }

  return true;
}

function setupDatabase() {
  log('🗄️ 设置数据库...', 'blue');

  try {
    // 生成Prisma客户端
    if (!runCommand('pnpm -w run prisma:generate', '生成Prisma客户端', projectRoot).success) {
      log('⚠️ Prisma客户端生成失败，但继续执行', 'yellow');
    }

    // 运行数据库迁移
    if (!runCommand('pnpm -w run prisma:migrate', '运行数据库迁移', projectRoot).success) {
      log('⚠️ 数据库迁移失败，尝试部署现有迁移', 'yellow');
      if (!runCommand('npx prisma migrate deploy', '部署数据库迁移', join(projectRoot, 'apps/api')).success) {
        log('⚠️ 数据库迁移失败，但继续执行', 'yellow');
      }
    }

    return true;
  } catch (error) {
    log('⚠️ 数据库设置失败，但继续执行', 'yellow');
    return false;
  }
}

function startDevelopmentServers() {
  log('🚀 启动开发服务器...', 'blue');

  // 从环境变量读取端口配置
  const apiPort = process.env.API_PORT || '8001';
  const webPort = process.env.WEB_PORT || '5173';

  // 检查端口是否被占用
  if (checkPort(apiPort)) {
    log(`⚠️ 端口${apiPort}已被占用，API服务器可能已在运行`, 'yellow');
  }

  if (checkPort(webPort)) {
    log(`⚠️ 端口${webPort}已被占用，Web服务器可能已在运行`, 'yellow');
  }

  // 启动开发环境
  log('🎯 启动开发环境...', 'magenta');
  log('💡 提示：开发服务器将在后台运行', 'cyan');
  log('💡 按 Ctrl+C 可以停止开发服务器', 'cyan');
  log('', 'reset');

  try {
    // 从环境变量读取启动命令
    const devCommand = process.env.DEV_COMMAND || 'dev';
    const packageManager = process.env.PACKAGE_MANAGER || 'pnpm';

    // 使用配置的包管理器和命令启动开发环境
    const child = spawn(packageManager, ['run', devCommand], {
      cwd: projectRoot,
      stdio: 'inherit',
      shell: true
    });

    // 处理进程退出
    child.on('exit', (code) => {
      if (code !== 0) {
        log(`❌ 开发服务器异常退出 (代码: ${code})`, 'red');
      }
    });

    // 处理信号
    process.on('SIGINT', () => {
      log('\n🛑 正在停止开发服务器...', 'yellow');
      child.kill('SIGINT');
      process.exit(0);
    });

    return true;
  } catch (error) {
    log('❌ 开发服务器启动失败', 'red');
    return false;
  }
}

function showStartupInfo() {
  log('', 'reset');
  log('🎉 项目启动完成！', 'green');
  log('', 'reset');
  log('📋 服务信息：', 'cyan');

  // 从环境变量读取服务信息
  const apiPort = process.env.API_PORT || '8001';
  const webPort = process.env.WEB_PORT || '5173';
  const postgresPort = process.env.POSTGRES_PORT || '5432';
  const redisPort = process.env.REDIS_PORT || '6379';
  const apiHost = process.env.API_HOST || 'localhost';
  const webHost = process.env.WEB_HOST || 'localhost';
  const dbHost = process.env.DB_HOST || 'localhost';
  const redisHost = process.env.REDIS_HOST || 'localhost';

  log(`  🌐 API服务器: http://${apiHost}:${apiPort}`, 'blue');
  log(`  📚 API文档: http://${apiHost}:${apiPort}/docs`, 'blue');
  log(`  🎨 Web应用: http://${webHost}:${webPort}`, 'blue');
  log(`  🗄️ PostgreSQL: ${dbHost}:${postgresPort}`, 'blue');
  log(`  🔴 Redis: ${redisHost}:${redisPort}`, 'blue');
  log('', 'reset');
  log('🛠️ 常用命令：', 'cyan');

  // 从环境变量读取包管理器
  const packageManager = process.env.PACKAGE_MANAGER || 'pnpm';

  log(`  ${packageManager} run stop     - 停止所有服务`, 'blue');
  log(`  ${packageManager} run test     - 运行测试`, 'blue');
  log(`  ${packageManager} run lint     - 代码检查`, 'blue');
  log(`  ${packageManager} run build    - 构建项目`, 'blue');
  log('', 'reset');
}

async function startProject() {
  log('🚀 开始启动项目...', 'blue');
  log('', 'reset');

  // 1. 检查环境配置
  if (!checkEnvironment()) {
    log('❌ 环境配置检查失败', 'red');
    process.exit(1);
  }

  // 2. 检查依赖
  if (!checkDependencies()) {
    log('❌ 依赖检查失败', 'red');
    process.exit(1);
  }

  // 3. 启动数据库
  if (!startDatabase()) {
    log('❌ 数据库启动失败', 'red');
    process.exit(1);
  }

  // 4. 设置数据库
  setupDatabase();

  // 5. 启动开发服务器
  if (!startDevelopmentServers()) {
    log('❌ 开发服务器启动失败', 'red');
    process.exit(1);
  }

  // 6. 显示启动信息
  showStartupInfo();
}

// 主函数
async function main() {
  try {
    await startProject();
  } catch (error) {
    log(`❌ 项目启动失败: ${error.message}`, 'red');
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  main().catch(console.error);
}

export { startProject };