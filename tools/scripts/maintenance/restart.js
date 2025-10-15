#!/usr/bin/env node

/**
 * 快速重启服务脚本
 * 
 * 功能：
 * - 停止所有运行中的服务
 * - 清理临时文件
 * - 重新启动所有服务
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

function runCommand(command, description) {
    try {
        log(`🔄 ${description}...`, 'blue');
        execSync(command, {
            cwd: projectRoot,
            stdio: 'pipe'
        });
        log(`✅ ${description}完成`, 'green');
        return { success: true };
    } catch (error) {
        log(`❌ ${description}失败: ${error.message}`, 'red');
        return { success: false, error };
    }
}

function stopDevelopmentServers() {
    log('🛑 停止开发服务器...', 'blue');

    try {
        // 从环境变量读取端口配置
        const apiPort = process.env.API_PORT || '8001';
        const webPort = process.env.WEB_PORT || '5173';
        const docsPort = process.env.DOCS_PORT || '8080';

        // 停止API服务器
        try {
            const apiPid = execSync(`netstat -ano | findstr :${apiPort}`, { encoding: 'utf8' });
            if (apiPid) {
                const pid = apiPid.split('\n')[0].split(/\s+/).pop();
                if (pid && pid !== '0') {
                    execSync(`taskkill /PID ${pid} /F`, { stdio: 'pipe' });
                    log(`✅ 已停止 API服务器 (PID: ${pid})`, 'green');
                }
            }
        } catch (error) {
            log(`ℹ️ API服务器未运行`, 'blue');
        }

        // 停止Web开发服务器
        try {
            const webPid = execSync(`netstat -ano | findstr :${webPort}`, { encoding: 'utf8' });
            if (webPid) {
                const pid = webPid.split('\n')[0].split(/\s+/).pop();
                if (pid && pid !== '0') {
                    execSync(`taskkill /PID ${pid} /F`, { stdio: 'pipe' });
                    log(`✅ 已停止 Web开发服务器 (PID: ${pid})`, 'green');
                }
            }
        } catch (error) {
            log(`ℹ️ Web开发服务器未运行`, 'blue');
        }

        // 停止文档服务器
        try {
            const docsPid = execSync(`netstat -ano | findstr :${docsPort}`, { encoding: 'utf8' });
            if (docsPid) {
                const pid = docsPid.split('\n')[0].split(/\s+/).pop();
                if (pid && pid !== '0') {
                    execSync(`taskkill /PID ${pid} /F`, { stdio: 'pipe' });
                    log(`✅ 已停止 文档服务器 (PID: ${pid})`, 'green');
                }
            }
        } catch (error) {
            log(`ℹ️ 文档服务器未运行`, 'blue');
        }

        // 停止额外端口
        const extraPortsEnv = process.env.EXTRA_PORTS_TO_STOP;
        if (extraPortsEnv) {
            const extraPorts = extraPortsEnv.split(',').map(port => port.trim());
            for (const port of extraPorts) {
                try {
                    const pid = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
                    if (pid) {
                        const processId = pid.split('\n')[0].split(/\s+/).pop();
                        if (processId && processId !== '0') {
                            execSync(`taskkill /PID ${processId} /F`, { stdio: 'pipe' });
                            log(`✅ 已停止 端口${port} (PID: ${processId})`, 'green');
                        }
                    }
                } catch (error) {
                    // 忽略端口未使用的错误
                }
            }
        }

    } catch (error) {
        log(`⚠️ 停止开发服务器时出错: ${error.message}`, 'yellow');
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

        // 停止PostgreSQL容器
        try {
            execSync(`docker stop ${postgresContainer}`, { stdio: 'pipe' });
            log(`✅ 已停止 PostgreSQL容器`, 'green');
        } catch (error) {
            log(`ℹ️ PostgreSQL容器未运行`, 'blue');
        }

        // 停止Redis容器
        try {
            execSync(`docker stop ${redisContainer}`, { stdio: 'pipe' });
            log(`✅ 已停止 Redis容器`, 'green');
        } catch (error) {
            log(`ℹ️ Redis容器未运行`, 'blue');
        }

    } catch (error) {
        log(`⚠️ 停止Docker服务时出错: ${error.message}`, 'yellow');
    }
}

function stopBackgroundProcesses() {
    log('🔄 停止后台进程...', 'blue');

    try {
        // 停止所有Node.js进程（除了当前进程）
        const currentPid = process.pid;
        execSync(`taskkill /F /IM node.exe /FI "PID ne ${currentPid}"`, { stdio: 'pipe' });
        log(`✅ 已停止后台Node.js进程`, 'green');
    } catch (error) {
        log(`ℹ️ 没有需要停止的Node.js进程`, 'blue');
    }
}

function cleanupTempFiles() {
    log('🧹 清理临时文件...', 'blue');

    try {
        // 清理常见的临时文件
        const tempPaths = [
            join(projectRoot, 'node_modules/.cache'),
            join(projectRoot, 'apps/web/dist'),
            join(projectRoot, 'apps/api/dist'),
            join(projectRoot, '.temp'),
            join(projectRoot, 'temp'),
        ];

        for (const tempPath of tempPaths) {
            try {
                if (existsSync(tempPath)) {
                    execSync(`rmdir /s /q "${tempPath}"`, { stdio: 'pipe' });
                    log(`✅ 已清理 ${tempPath}`, 'green');
                }
            } catch (error) {
                // 忽略清理失败的错误
            }
        }

        log(`✅ 临时文件清理完成`, 'green');
    } catch (error) {
        log(`⚠️ 清理临时文件失败`, 'yellow');
    }
}

function startDatabaseServices() {
    log('🐳 启动数据库服务...', 'blue');

    try {
        // 检查 docker-compose.yml 文件
        const composeFile = process.env.DOCKER_COMPOSE_FILE || 'infrastructure/docker/docker-compose.yml';
        const fullComposePath = join(projectRoot, composeFile);

        if (existsSync(fullComposePath)) {
            // 从环境变量读取服务名称
            const postgresService = process.env.POSTGRES_SERVICE || 'postgres';
            const redisService = process.env.REDIS_SERVICE || 'redis';
            const services = `${postgresService} ${redisService}`;

            // 启动数据库容器
            if (!runCommand(`docker compose -f ${composeFile} start ${services}`, '启动数据库容器').success) {
                log('⚠️ 数据库启动失败，尝试重新创建容器', 'yellow');
                // 如果启动失败，尝试重新创建
                runCommand(`docker compose -f ${composeFile} up -d ${services}`, '重新创建数据库容器');
            }
        } else {
            log(`⚠️ 未找到 ${composeFile} 文件`, 'yellow');
        }

        return true;
    } catch (error) {
        log('⚠️ 数据库启动失败，但继续执行', 'yellow');
        return false;
    }
}

function startServices() {
    log('🚀 启动开发服务...', 'blue');

    try {
        // 从环境变量读取包管理器和启动命令
        const packageManager = process.env.PACKAGE_MANAGER || 'pnpm';
        const devCommand = process.env.DEV_COMMAND || 'dev';

        // 启动开发环境
        const child = spawn(packageManager, ['run', devCommand], {
            cwd: projectRoot,
            stdio: 'inherit',
            shell: true
        });

        // 处理进程退出
        child.on('exit', (code) => {
            if (code !== 0) {
                log(`❌ 服务异常退出 (代码: ${code})`, 'red');
            }
        });

        // 处理信号
        process.on('SIGINT', () => {
            log('\n🛑 正在停止服务...', 'yellow');
            child.kill('SIGINT');
            process.exit(0);
        });

        return true;
    } catch (error) {
        log('❌ 服务启动失败', 'red');
        return false;
    }
}

function showRestartInfo() {
    log('', 'reset');
    log('🎉 服务重启完成！', 'green');
    log('', 'reset');
    log('📋 服务信息：', 'cyan');

    // 从环境变量读取服务信息
    const apiPort = process.env.API_PORT || '8001';
    const webPort = process.env.WEB_PORT || '5173';
    const apiHost = process.env.API_HOST || 'localhost';
    const webHost = process.env.WEB_HOST || 'localhost';

    log(`  🌐 API服务器: http://${apiHost}:${apiPort}`, 'blue');
    log(`  📚 API文档: http://${apiHost}:${apiPort}/docs`, 'blue');
    log(`  🎨 Web应用: http://${webHost}:${webPort}`, 'blue');
    log('', 'reset');
    log('💡 提示：', 'blue');
    log('  - 所有服务已重新启动', 'blue');
    log('  - 数据库容器已恢复', 'blue');
    log('  - 临时文件已清理', 'blue');
    log('  - 按 Ctrl+C 可以停止服务', 'blue');
    log('', 'reset');
}

async function restartServices() {
    log('🔄 开始重启服务...', 'blue');
    log('', 'reset');

    // 1. 停止所有服务
    log('🛑 停止所有服务...', 'blue');
    stopDevelopmentServers();
    log('', 'reset');

    stopDockerServices();
    log('', 'reset');

    stopBackgroundProcesses();
    log('', 'reset');

    cleanupTempFiles();
    log('', 'reset');

    // 2. 等待服务完全停止
    log('⏳ 等待服务完全停止...', 'yellow');
    execSync('sleep 3', { stdio: 'pipe' }); // 等待3秒
    log('✅ 等待完成', 'green');
    log('', 'reset');

    // 3. 启动数据库服务
    startDatabaseServices();
    log('', 'reset');

    // 4. 显示重启信息
    showRestartInfo();

    // 5. 启动开发服务（这会保持运行）
    startServices();
}

// 主函数
async function main() {
    try {
        await restartServices();
    } catch (error) {
        log(`❌ 服务重启失败: ${error.message}`, 'red');
        process.exit(1);
    }
}

// 如果直接运行此脚本
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
    main().catch(console.error);
}

export { restartServices };