#!/usr/bin/env node

/**
 * 项目清理脚本
 *
 * 跨平台的项目清理工具，支持交互式确认和自动恢复
 */

import { existsSync, rmSync } from 'fs';
import { dirname } from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

function removeDir(dirPath) {
  if (existsSync(dirPath)) {
    try {
      rmSync(dirPath, { recursive: true, force: true });
      return true;
    } catch (error) {
      log(`❌ 删除失败: ${dirPath}`, 'red');
      return false;
    }
  }
  return true;
}

function removeFile(filePath) {
  if (existsSync(filePath)) {
    try {
      rmSync(filePath, { force: true });
      return true;
    } catch (error) {
      log(`❌ 删除失败: ${filePath}`, 'red');
      return false;
    }
  }
  return true;
}

async function cleanProject() {
  log('🧹 开始清理项目...', 'blue');

  // 确认操作
  log('⚠️  这将删除所有构建产物、依赖包和缓存文件', 'yellow');

  const readline = await import('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('确定要继续吗？(y/N): ', answer => {
    if (answer.toLowerCase() !== 'y') {
      log('❌ 操作已取消', 'red');
      rl.close();
      return;
    }

    let success = true;

    // 清理构建产物
    log('🗑️  清理构建产物...', 'blue');
    success &= removeDir('dist');
    success &= removeDir('build');
    success &= removeDir('coverage');
    success &= removeDir('apps/api/dist');
    success &= removeDir('apps/web/dist');
    success &= removeDir('apps/web/build');

    // 清理依赖包
    log('📦 清理依赖包...', 'blue');
    success &= removeDir('node_modules');
    success &= removeDir('.pnpm-store');
    success &= removeDir('apps/api/node_modules');
    success &= removeDir('apps/web/node_modules');

    // 清理缓存文件
    log('🗂️  清理缓存文件...', 'blue');
    success &= removeDir('.cache');
    success &= removeDir('.turbo');
    success &= removeFile('.eslintcache');
    success &= removeDir('.vite');
    success &= removeDir('.next');
    success &= removeDir('.nuxt');

    // 清理新的开发工具缓存
    success &= removeDir('.vitest');
    success &= removeDir('.changeset');
    success &= removeDir('node_modules/.cache');

    // 清理 TypeScript 缓存
    const tsBuildInfoFiles = [
      'apps/api/*.tsbuildinfo',
      'apps/web/*.tsbuildinfo',
    ];
    tsBuildInfoFiles.forEach(pattern => {
      try {
        execSync(`rm -f ${pattern}`, { stdio: 'ignore' });
      } catch (e) {
        // 忽略错误
      }
    });

    // 清理日志文件
    log('📋 清理日志文件...', 'blue');
    success &= removeDir('logs');
    const logFiles = [
      '*.log',
      'npm-debug.log*',
      'yarn-debug.log*',
      'yarn-error.log*',
      'pnpm-debug.log*',
    ];
    logFiles.forEach(pattern => {
      try {
        execSync(`rm -f ${pattern}`, { stdio: 'ignore' });
      } catch (e) {
        // 忽略错误
      }
    });

    // 清理数据库相关文件
    log('🗄️  清理数据库相关文件...', 'blue');
    success &= removeDir('apps/api/prisma/migrations');
    success &= removeDir('apps/api/node_modules/.prisma');

    // 清理测试相关文件
    log('🧪 清理测试相关文件...', 'blue');
    success &= removeDir('apps/api/coverage');
    success &= removeDir('apps/web/coverage');

    // 清理临时文件
    log('🔧 清理临时文件...', 'blue');
    success &= removeDir('.tmp');
    success &= removeDir('temp');
    success &= removeDir('tmp');
    success &= removeFile('.vscode/settings.json');
    success &= removeFile('.idea/workspace.xml');

    if (success) {
      log('✅ 清理完成！', 'green');
    } else {
      log('⚠️  清理完成，但有一些文件删除失败', 'yellow');
    }

    // 询问是否重新安装依赖
    rl.question('📦 是否重新安装依赖？(y/N): ', reinstall => {
      if (reinstall.toLowerCase() === 'y') {
        log('📦 重新安装依赖...', 'blue');
        try {
          execSync('pnpm install', { stdio: 'inherit' });
          log('✅ 依赖安装完成！', 'green');
        } catch (error) {
          log('❌ 依赖安装失败！', 'red');
          process.exit(1);
        }
      }

      log('🎉 项目清理完成！', 'green');
      log('💡 提示：', 'blue');
      log("  1. 运行 'pnpm run restore' 恢复开发环境", 'blue');
      log(
        "  2. 或运行 'node tools/scripts/script-manager.js exec restore'",
        'blue'
      );
      log(
        "  3. 或直接运行 'node tools/scripts/maintenance/restore.js'",
        'blue'
      );
      log(
        "  4. 或手动运行 'pnpm install && pnpm run prepare && pnpm run prisma:generate'",
        'blue'
      );
      log("  5. 然后运行 'pnpm run dev' 启动开发环境", 'blue');
      rl.close();
    });
  });
}

// 运行清理
cleanProject().catch(console.error);
