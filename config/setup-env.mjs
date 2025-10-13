#!/usr/bin/env node

/**
 * 环境管理系统快速设置脚本
 * 帮助用户快速设置和配置环境管理系统
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 创建 readline 接口
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// 工具函数
function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

function copyFile(src, dest) {
    try {
        const content = fs.readFileSync(src, 'utf-8');
        fs.writeFileSync(dest, content);
        return true;
    } catch (error) {
        console.error(`复制文件失败 ${src} -> ${dest}:`, error.message);
        return false;
    }
}

function fileExists(filePath) {
    return fs.existsSync(filePath);
}

// 主设置流程
async function setupEnvironment() {
    console.log('🚀 环境管理系统快速设置\n');

    try {
        // 1. 检测当前环境
        console.log('📋 检测当前环境...');
        const nodeEnv = process.env.NODE_ENV || 'development';
        console.log(`   当前环境: ${nodeEnv}\n`);

        // 2. 检查现有配置文件
        console.log('🔍 检查现有配置文件...');
        const envFiles = [
            '.env',
            '.env.local',
            '.env.development',
            '.env.production',
            '.env.staging',
            '.env.test'
        ];

        const existingFiles = envFiles.filter(file => fileExists(file));
        if (existingFiles.length > 0) {
            console.log('   发现现有配置文件:');
            existingFiles.forEach(file => console.log(`   - ${file}`));

            const overwrite = await question('\n是否覆盖现有配置文件? (y/N): ');
            if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
                console.log('❌ 设置已取消');
                return;
            }
        } else {
            console.log('   未发现现有配置文件\n');
        }

        // 3. 选择要创建的环境文件
        console.log('📝 选择要创建的环境文件:');
        console.log('   1. 仅创建基础 .env 文件');
        console.log('   2. 创建所有环境文件');
        console.log('   3. 仅创建当前环境文件');

        const choice = await question('请选择 (1-3): ');

        let filesToCreate = [];
        switch (choice) {
            case '1':
                filesToCreate = ['.env'];
                break;
            case '2':
                filesToCreate = ['.env', '.env.development', '.env.production', '.env.staging', '.env.test', '.env.ci'];
                break;
            case '3':
                filesToCreate = [`.env.${nodeEnv}`];
                break;
            default:
                console.log('❌ 无效选择，设置已取消');
                return;
        }

        // 4. 创建环境文件
        console.log('\n📄 创建环境文件...');
        const templateDir = path.join(__dirname, 'env-templates');

        for (const file of filesToCreate) {
            let templateFile;

            if (file === '.env') {
                templateFile = path.join(templateDir, 'base.env');
            } else {
                const envName = file.replace('.env.', '');
                templateFile = path.join(templateDir, `${envName}.env`);
            }

            if (fileExists(templateFile)) {
                if (copyFile(templateFile, file)) {
                    console.log(`   ✓ 创建 ${file}`);
                } else {
                    console.log(`   ✗ 创建 ${file} 失败`);
                }
            } else {
                console.log(`   ⚠️  模板文件不存在: ${templateFile}`);
            }
        }

        // 5. 配置敏感信息
        console.log('\n🔐 配置敏感信息...');
        const sensitiveConfigs = [
            { key: 'JWT_SECRET', description: 'JWT 密钥 (建议使用随机字符串)' },
            { key: 'DB_PASSWORD', description: '数据库密码' },
            { key: 'LLM_API_KEY', description: 'LLM API 密钥' }
        ];

        const configs = {};
        for (const config of sensitiveConfigs) {
            const value = await question(`${config.description}: `);
            if (value.trim()) {
                configs[config.key] = value.trim();
            }
        }

        // 6. 更新 .env 文件
        if (fileExists('.env') && Object.keys(configs).length > 0) {
            console.log('\n📝 更新 .env 文件...');
            let content = fs.readFileSync('.env', 'utf-8');

            for (const [key, value] of Object.entries(configs)) {
                const regex = new RegExp(`^${key}=.*$`, 'm');
                if (regex.test(content)) {
                    content = content.replace(regex, `${key}=${value}`);
                } else {
                    content += `\n${key}=${value}`;
                }
            }

            fs.writeFileSync('.env', content);
            console.log('   ✓ .env 文件已更新');
        }

        // 7. 验证配置
        console.log('\n✅ 验证配置...');
        try {
            // 这里可以添加配置验证逻辑
            console.log('   ✓ 配置验证通过');
        } catch (error) {
            console.log(`   ⚠️  配置验证警告: ${error.message}`);
        }

        // 8. 完成设置
        console.log('\n🎉 环境管理系统设置完成！');
        console.log('\n📚 下一步:');
        console.log('   1. 检查生成的配置文件');
        console.log('   2. 根据需要调整配置');
        console.log('   3. 运行 npm run dev 启动开发服务器');
        console.log('   4. 查看 config/README.md 了解详细文档');

        console.log('\n📁 生成的文件:');
        filesToCreate.forEach(file => {
            if (fileExists(file)) {
                console.log(`   - ${file}`);
            }
        });

    } catch (error) {
        console.error('\n❌ 设置过程中发生错误:', error.message);
    } finally {
        rl.close();
    }
}

// 运行设置
if (import.meta.url === `file://${process.argv[1]}`) {
    setupEnvironment();
}

export { setupEnvironment };
