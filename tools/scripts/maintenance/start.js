#!/usr/bin/env node

/**
 * 一键启动项目脚本
 *
 * 快速启动所有必要的服务，包括数据库、开发服务器等
 */

import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

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
        execSync('sleep 1', { stdio: 'pipe' });
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

    const requiredFiles = [
        '.env',
        'infrastructure/docker/docker-compose.yml'
    ];

    let missingFiles = [];

    for (const file of requiredFiles) {
        if (!existsSync(join(projectRoot, file))) {
            missingFiles.push(file);
        }
    }

    if (missingFiles.length > 0) {
        log('⚠️ 缺少环境配置文件:', 'yellow');
        missingFiles.forEach(file => log(`  - ${file}`, 'yellow'));
        log('💡 请运行: pnpm run setup:env', 'blue');
        return false;
    }

    log('✅ 环境配置文件完整', 'green');
    log('💡 使用根目录 .env 文件进行统一配置管理', 'cyan');
    
    // 同步环境变量到子项目
    log('🔄 同步环境变量到子项目...', 'blue');
    try {
        execSync('pnpm run sync:env', { stdio: 'pipe', cwd: projectRoot });
        log('✅ 环境变量同步完成', 'green');
    } catch (error) {
        log('⚠️ 环境变量同步失败，但继续执行', 'yellow');
    }
    
    return true;
}

function checkDependencies() {
    log('📦 检查项目依赖...', 'blue');

    if (!existsSync(join(projectRoot, 'node_modules'))) {
        log('⚠️ 项目依赖未安装', 'yellow');
        log('💡 正在安装依赖...', 'blue');
        if (!runCommand('pnpm install', '安装项目依赖')) {
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

    // 启动数据库容器
    if (!runCommand(
        'docker compose -f infrastructure/docker/docker-compose.yml up -d postgres redis',
        '启动数据库容器'
    )) {
        log('❌ 数据库启动失败', 'red');
        return false;
    }

    // 等待数据库启动
    if (!waitForPort(5432, 'PostgreSQL', 30)) {
        log('⚠️ PostgreSQL启动超时，但继续执行', 'yellow');
    }

    if (!waitForPort(6379, 'Redis', 15)) {
        log('⚠️ Redis启动超时，但继续执行', 'yellow');
    }

    return true;
}

function setupDatabase() {
    log('🗄️ 设置数据库...', 'blue');

    try {
        // 生成Prisma客户端
        if (!runCommand('pnpm run prisma:generate', '生成Prisma客户端')) {
            log('⚠️ Prisma客户端生成失败，但继续执行', 'yellow');
        }

        // 运行数据库迁移
        if (!runCommand('pnpm run prisma:migrate', '运行数据库迁移')) {
            log('⚠️ 数据库迁移失败，尝试初始化', 'yellow');
            if (!runCommand('npx prisma migrate dev --name init', '初始化数据库迁移', join(projectRoot, 'apps/api'))) {
                log('⚠️ 数据库迁移失败，但继续执行', 'yellow');
            }
        }

        // 检查RBAC系统
        log('🔐 检查RBAC系统...', 'blue');
        try {
            const result = execSync('npx prisma db execute --stdin', {
                cwd: join(projectRoot, 'apps/api'),
                input: 'SELECT COUNT(*) FROM "roles" WHERE name IN (\'admin\', \'user\');',
                stdio: 'pipe',
            });

            const count = parseInt(result.toString().trim());
            if (count === 0) {
                log('🔐 初始化RBAC系统...', 'blue');
                if (runCommand('pnpm run init:rbac', '初始化RBAC系统')) {
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

        return true;
    } catch (error) {
        log('⚠️ 数据库设置失败，但继续执行', 'yellow');
        return false;
    }
}

function startDevelopmentServers() {
    log('🚀 启动开发服务器...', 'blue');

    // 检查端口是否被占用
    if (checkPort(8001)) {
        log('⚠️ 端口8001已被占用，API服务器可能已在运行', 'yellow');
    }

    if (checkPort(5173)) {
        log('⚠️ 端口5173已被占用，Web服务器可能已在运行', 'yellow');
    }

    // 启动开发环境
    log('🎯 启动开发环境...', 'magenta');
    log('💡 提示：开发服务器将在后台运行', 'cyan');
    log('💡 按 Ctrl+C 可以停止开发服务器', 'cyan');
    log('', 'reset');

    try {
        // 使用concurrently启动所有服务
        runCommand('pnpm run dev', '启动开发环境');
    } catch (error) {
        log('❌ 开发服务器启动失败', 'red');
        return false;
    }

    return true;
}

function showStartupInfo() {
    log('', 'reset');
    log('🎉 项目启动完成！', 'green');
    log('', 'reset');
    log('📋 服务信息：', 'cyan');
    log('  🌐 API服务器: http://localhost:8001', 'blue');
    log('  📚 API文档: http://localhost:8001/docs', 'blue');
    log('  🎨 Web应用: http://localhost:5173', 'blue');
    log('  🗄️ PostgreSQL: localhost:5432', 'blue');
    log('  🔴 Redis: localhost:6379', 'blue');
    log('', 'reset');
    log('🛠️ 常用命令：', 'cyan');
    log('  pnpm run stop     - 停止所有服务', 'blue');
    log('  pnpm run test     - 运行测试', 'blue');
    log('  pnpm run lint     - 代码检查', 'blue');
    log('  pnpm run rbac:status - 检查RBAC状态', 'blue');
    log('', 'reset');
}

async function startProject() {
    log('🚀 开始启动项目...', 'blue');
    log('', 'reset');

    // 1. 检查环境配置
    if (!checkEnvironment()) {
        log('❌ 环境配置检查失败，请先运行: pnpm run restore', 'red');
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
