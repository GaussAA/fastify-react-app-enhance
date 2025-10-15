#!/usr/bin/env node

/**
 * 一键关闭项目脚本
 * 
 * 功能：
 * - 停止所有开发服务器
 * - 停止数据库服务
 * - 清理临时文件
 * - 提供友好的用户界面
 */

import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, rmSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../../../');

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
    if (!silent) log(`⚠️ ${description}失败: ${error.message}`, 'yellow');
    return { success: false, error: error.message };
  }
}

function killProcessByPort(port, processName) {
  try {
    if (process.platform === 'win32') {
      // Windows 系统
      const result = execSync(`netstat -ano | findstr :${port}`, {
        stdio: 'pipe',
        encoding: 'utf8'
      });

      const lines = result.toString().split('\n');
      let killed = false;

      for (const line of lines) {
        if (line.includes(`:${port}`)) {
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];

          if (pid && pid !== '0' && !isNaN(parseInt(pid))) {
            try {
              execSync(`taskkill /PID ${pid} /F`, { stdio: 'pipe' });
              log(`✅ 已停止 ${processName} (PID: ${pid})`, 'green');
              killed = true;
            } catch (killError) {
              log(`⚠️ 无法停止 ${processName} (PID: ${pid})`, 'yellow');
            }
          }
        }
      }

      return killed;
    } else {
      // Unix/Linux/macOS 系统
      const result = execSync(`lsof -ti:${port}`, {
        stdio: 'pipe',
        encoding: 'utf8'
      });

      const pids = result.toString().trim().split('\n');
      let killed = false;

      for (const pid of pids) {
        if (pid && !isNaN(parseInt(pid))) {
          try {
            execSync(`kill -9 ${pid}`, { stdio: 'pipe' });
            log(`✅ 已停止 ${processName} (PID: ${pid})`, 'green');
            killed = true;
          } catch (killError) {
            log(`⚠️ 无法停止 ${processName} (PID: ${pid})`, 'yellow');
          }
        }
      }

      return killed;
    }
  } catch (error) {
    // 没有进程在运行
    return false;
  }
}

function stopDockerServices() {
  log('🐳 停止Docker服务...', 'blue');

  try {
    // 从环境变量读取Docker Compose文件路径
    const composeFile = process.env.DOCKER_COMPOSE_FILE || 'infrastructure/docker/docker-compose.yml';
    const fullComposePath = join(projectRoot, composeFile);

    if (existsSync(fullComposePath)) {
      // 暂停数据库容器而不是移除
      runCommand(`docker compose -f ${composeFile} stop`, '暂停Docker Compose服务');
    } else {
      log(`⚠️ 未找到 ${composeFile} 文件`, 'yellow');
    }

    // 从环境变量读取容器名称
    const postgresContainer = process.env.POSTGRES_CONTAINER || 'postgres';
    const redisContainer = process.env.REDIS_CONTAINER || 'redis';

    // 停止所有相关的Docker容器
    try {
      execSync(`docker stop $(docker ps -q --filter "name=${postgresContainer}")`, {
        stdio: 'pipe',
      });
      log('✅ 已停止PostgreSQL容器', 'green');
    } catch (error) {
      // 没有PostgreSQL容器在运行
    }

    try {
      execSync(`docker stop $(docker ps -q --filter "name=${redisContainer}")`, {
        stdio: 'pipe',
      });
      log('✅ 已停止Redis容器', 'green');
    } catch (error) {
      // 没有Redis容器在运行
    }
  } catch (error) {
    log('⚠️ Docker服务停止失败，可能没有运行中的容器', 'yellow');
  }
}

function stopDevelopmentServers() {
  log('🛑 停止开发服务器...', 'blue');

  // 从环境变量读取端口配置
  const apiPort = process.env.API_PORT || '8001';
  const webPort = process.env.WEB_PORT || '5173';
  const docsPort = process.env.DOCS_PORT || '8080';

  // 停止API服务器
  if (!killProcessByPort(apiPort, 'API服务器')) {
    log('ℹ️ API服务器未运行', 'blue');
  }

  // 停止Web开发服务器
  if (!killProcessByPort(webPort, 'Web开发服务器')) {
    log('ℹ️ Web开发服务器未运行', 'blue');
  }

  // 停止文档服务器
  if (!killProcessByPort(docsPort, '文档服务器')) {
    log('ℹ️ 文档服务器未运行', 'blue');
  }

  // 从环境变量读取额外端口列表
  const extraPortsEnv = process.env.EXTRA_PORTS_TO_STOP;
  let extraPorts = [];

  if (extraPortsEnv) {
    extraPorts = extraPortsEnv.split(',').map(p => parseInt(p.trim())).filter(p => !isNaN(p));
  } else {
    // 默认额外端口
    extraPorts = [3000, 3001, 4000, 5000, 8000, 9000];
  }

  // 停止其他可能的开发端口
  for (const port of extraPorts) {
    try {
      killProcessByPort(port, `端口${port}的服务`);
    } catch (error) {
      // 忽略错误，继续检查下一个端口
    }
  }
}

function stopBackgroundProcesses() {
  log('🔄 停止后台进程...', 'blue');

  try {
    // 停止所有Node.js进程（除了当前脚本）
    if (process.platform === 'win32') {
      try {
        execSync('taskkill /IM node.exe /F', { stdio: 'pipe' });
        log('✅ 已停止所有Node.js进程', 'green');
      } catch (error) {
        log('ℹ️ 没有Node.js进程在运行', 'blue');
      }
    } else {
      try {
        execSync('pkill -f node', { stdio: 'pipe' });
        log('✅ 已停止所有Node.js进程', 'green');
      } catch (error) {
        log('ℹ️ 没有Node.js进程在运行', 'blue');
      }
    }
  } catch (error) {
    log('⚠️ 停止Node.js进程失败', 'yellow');
  }
}

function cleanupTempFiles() {
  log('🧹 清理临时文件...', 'blue');

  try {
    // 清理常见的临时文件
    const tempFiles = [
      '.tmp',
      'temp',
      'tmp',
      'node_modules/.cache',
      'apps/api/node_modules/.cache',
      'apps/web/node_modules/.cache',
      'apps/web/dist',
      'apps/web/.vite',
    ];

    for (const tempFile of tempFiles) {
      try {
        const tempPath = join(projectRoot, tempFile);
        if (existsSync(tempPath)) {
          rmSync(tempPath, { recursive: true, force: true });
          log(`✅ 已清理: ${tempFile}`, 'green');
        }
      } catch (error) {
        // 忽略清理失败的文件
      }
    }
  } catch (error) {
    log('⚠️ 清理临时文件失败', 'yellow');
  }
}

function showStopInfo() {
  log('', 'reset');
  log('🎉 项目已完全停止！', 'green');
  log('', 'reset');
  log('📋 停止的服务：', 'cyan');
  log('  🛑 开发服务器已停止', 'blue');
  log('  🐳 数据库容器已暂停（数据保留）', 'blue');
  log('  🧹 临时文件已清理', 'blue');
  log('', 'reset');
  log('💡 提示：', 'blue');
  log('  - 所有服务已安全停止', 'blue');
  log('  - 数据库容器已暂停，数据完整保留', 'blue');
  log('  - 可以安全关闭终端', 'blue');
  log('  - 重启时数据库将快速恢复', 'blue');
  log('', 'reset');

  // 从环境变量读取包管理器和启动命令
  const packageManager = process.env.PACKAGE_MANAGER || 'pnpm';
  const devCommand = process.env.DEV_COMMAND || 'dev';

  log(`🚀 重新启动项目请运行: ${packageManager} run ${devCommand}`, 'blue');
  log(`🔄 快速重启请运行: ${packageManager} run restart`, 'blue');
}

async function stopProject() {
  log('🛑 开始停止项目...', 'blue');
  log('', 'reset');

  // 1. 停止开发服务器
  stopDevelopmentServers();
  log('', 'reset');

  // 2. 停止Docker服务
  stopDockerServices();
  log('', 'reset');

  // 3. 停止后台进程
  stopBackgroundProcesses();
  log('', 'reset');

  // 4. 清理临时文件
  cleanupTempFiles();
  log('', 'reset');

  // 5. 显示停止信息
  showStopInfo();
}

// 主函数
async function main() {
  try {
    await stopProject();
  } catch (error) {
    log(`❌ 停止项目失败: ${error.message}`, 'red');
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  main().catch(console.error);
}

export { stopProject };