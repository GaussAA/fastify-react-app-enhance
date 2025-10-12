#!/usr/bin/env node

/**
 * 一键关闭项目脚本
 *
 * 停止所有运行中的服务，包括数据库、开发服务器等
 */

import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

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
        log(`⚠️ ${description}失败: ${error.message}`, 'yellow');
        return false;
    }
}

function killProcessByPort(port, processName) {
    try {
        // Windows 系统
        if (process.platform === 'win32') {
            const result = execSync(`netstat -ano | findstr :${port}`, { stdio: 'pipe' });
            const lines = result.toString().split('\n');

            for (const line of lines) {
                if (line.includes(`:${port}`)) {
                    const parts = line.trim().split(/\s+/);
                    const pid = parts[parts.length - 1];
                    if (pid && pid !== '0') {
                        try {
                            execSync(`taskkill /PID ${pid} /F`, { stdio: 'pipe' });
                            log(`✅ 已停止 ${processName} (PID: ${pid})`, 'green');
                            return true;
                        } catch (killError) {
                            log(`⚠️ 无法停止 ${processName} (PID: ${pid})`, 'yellow');
                        }
                    }
                }
            }
        } else {
            // Unix/Linux/macOS 系统
            const result = execSync(`lsof -ti:${port}`, { stdio: 'pipe' });
            const pids = result.toString().trim().split('\n');

            for (const pid of pids) {
                if (pid) {
                    try {
                        execSync(`kill -9 ${pid}`, { stdio: 'pipe' });
                        log(`✅ 已停止 ${processName} (PID: ${pid})`, 'green');
                        return true;
                    } catch (killError) {
                        log(`⚠️ 无法停止 ${processName} (PID: ${pid})`, 'yellow');
                    }
                }
            }
        }
    } catch (error) {
        // 没有进程在运行
        return false;
    }
    return false;
}

function stopDockerServices() {
    log('🐳 停止Docker服务...', 'blue');

    try {
        // 停止所有Docker Compose服务
        runCommand(
            'docker compose -f infrastructure/docker/docker-compose.yml down',
            '停止Docker Compose服务'
        );

        // 停止所有相关的Docker容器
        try {
            execSync('docker stop $(docker ps -q --filter "name=postgres")', { stdio: 'pipe' });
            log('✅ 已停止PostgreSQL容器', 'green');
        } catch (error) {
            // 没有PostgreSQL容器在运行
        }

        try {
            execSync('docker stop $(docker ps -q --filter "name=redis")', { stdio: 'pipe' });
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

    // 停止API服务器 (端口8001)
    if (!killProcessByPort(8001, 'API服务器')) {
        log('ℹ️ API服务器未运行', 'blue');
    }

    // 停止Web开发服务器 (端口5173)
    if (!killProcessByPort(5173, 'Web开发服务器')) {
        log('ℹ️ Web开发服务器未运行', 'blue');
    }

    // 停止文档服务器 (端口8080)
    if (!killProcessByPort(8080, '文档服务器')) {
        log('ℹ️ 文档服务器未运行', 'blue');
    }

    // 停止其他可能的开发端口
    const commonPorts = [3000, 3001, 4000, 5000, 8000, 9000];
    for (const port of commonPorts) {
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
            'apps/web/.vite'
        ];

        for (const tempFile of tempFiles) {
            try {
                const tempPath = join(projectRoot, tempFile);
                if (require('fs').existsSync(tempPath)) {
                    if (require('fs').statSync(tempPath).isDirectory()) {
                        execSync(`rm -rf "${tempPath}"`, { stdio: 'pipe' });
                        log(`✅ 已清理目录: ${tempFile}`, 'green');
                    } else {
                        execSync(`rm -f "${tempPath}"`, { stdio: 'pipe' });
                        log(`✅ 已清理文件: ${tempFile}`, 'green');
                    }
                }
            } catch (error) {
                // 忽略清理失败的文件
            }
        }
    } catch (error) {
        log('⚠️ 清理临时文件失败', 'yellow');
    }
}

async function stopProject() {
    log('🛑 开始停止项目...', 'blue');
    log('', 'reset');

    // 1. 停止Docker服务
    stopDockerServices();
    log('', 'reset');

    // 2. 停止开发服务器
    stopDevelopmentServers();
    log('', 'reset');

    // 3. 停止后台进程
    stopBackgroundProcesses();
    log('', 'reset');

    // 4. 清理临时文件
    cleanupTempFiles();
    log('', 'reset');

    log('🎉 项目已完全停止！', 'green');
    log('💡 提示：', 'blue');
    log('  - 所有服务已停止', 'blue');
    log('  - 临时文件已清理', 'blue');
    log('  - 可以安全关闭终端', 'blue');
    log('', 'reset');
    log('🚀 重新启动项目请运行: pnpm run dev', 'blue');
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
