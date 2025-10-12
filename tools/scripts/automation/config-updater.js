#!/usr/bin/env node

/**
 * 配置模板和值管理工具
 * 
 * 提供配置管理的核心功能：
 * - 管理配置模板文件（结构定义）
 * - 管理敏感值文件（.env.secrets）
 * - 从模板和值生成最终配置文件
 * - 配置验证和备份
 */

import { existsSync, readFileSync, writeFileSync, copyFileSync, mkdirSync, unlinkSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { randomBytes } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class ConfigUpdater {
    constructor(projectRoot) {
        this.projectRoot = projectRoot;
        this.templatesDir = join(projectRoot, 'config/env-templates');
        this.secretsFile = join(projectRoot, '.env.secrets');
        this.backupDir = join(projectRoot, 'backups/config');
        this.ensureBackupDir();
    }

    ensureBackupDir() {
        if (!existsSync(this.backupDir)) {
            mkdirSync(this.backupDir, { recursive: true });
        }
    }

    /**
     * 生成安全密钥
     */
    generateSecureKey(length = 32) {
        return randomBytes(length).toString('hex');
    }

    /**
     * 生成JWT密钥
     */
    generateJwtSecret() {
        return this.generateSecureKey(64);
    }

    /**
     * 生成数据库密码
     */
    generateDbPassword() {
        return this.generateSecureKey(16);
    }

    /**
     * 读取敏感值文件
     */
    readSecrets() {
        if (!existsSync(this.secretsFile)) {
            return {};
        }

        const content = readFileSync(this.secretsFile, 'utf-8');
        return this.parseEnvContent(content);
    }

    /**
     * 保存敏感值文件
     */
    saveSecrets(secrets) {
        const content = `# 敏感配置文件 - 请勿提交到版本控制
# 此文件包含敏感信息，已添加到 .gitignore

` + Object.entries(secrets).map(([key, value]) => `${key}="${value}"`).join('\n') + '\n';

        writeFileSync(this.secretsFile, content, 'utf-8');
        console.log('✅ 敏感值已保存到 .env.secrets');
    }

    /**
     * 解析环境文件内容
     */
    parseEnvContent(content) {
        const config = {};
        const lines = content.split('\n');

        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const [key, ...valueParts] = trimmed.split('=');
                if (key && valueParts.length > 0) {
                    config[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
                }
            }
        }

        return config;
    }

    /**
     * 从模板生成配置文件
     */
    generateConfigFromTemplate(templatePath, outputPath, secrets, commonVars = {}) {
        if (!existsSync(templatePath)) {
            throw new Error(`模板文件不存在: ${templatePath}`);
        }

        const template = readFileSync(templatePath, 'utf-8');

        // 合并所有变量
        const allVars = {
            ...secrets,
            ...commonVars,
            // 默认值
            NODE_ENV: 'development',
            PORT: '8001',
            API_PORT: '8001',
            WEB_PORT: '5173',
            DB_HOST: 'localhost',
            DB_PORT: '5432',
            DB_NAME: 'fastify_react_app',
            DB_USER: 'postgres',
            REDIS_HOST: 'localhost',
            REDIS_PORT: '6379',
        };

        // 替换模板中的占位符
        let content = template;
        for (const [key, value] of Object.entries(allVars)) {
            const placeholder = `{{${key}}}`;
            content = content.replace(new RegExp(placeholder, 'g'), value);
        }

        // 确保输出目录存在
        const outputDir = dirname(outputPath);
        if (!existsSync(outputDir)) {
            mkdirSync(outputDir, { recursive: true });
        }

        writeFileSync(outputPath, content, 'utf-8');
        console.log(`✅ 已生成配置文件: ${outputPath}`);
    }

    /**
     * 创建配置备份
     */
    createBackup(description = '') {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupName = `config-backup-${timestamp}${description ? `-${description}` : ''}`;
        const backupPath = join(this.backupDir, backupName);

        mkdirSync(backupPath, { recursive: true });

        // 备份模板文件
        if (existsSync(this.templatesDir)) {
            const templatesBackup = join(backupPath, 'templates');
            mkdirSync(templatesBackup, { recursive: true });

            const templateFiles = readdirSync(this.templatesDir);
            templateFiles.forEach(file => {
                const sourcePath = join(this.templatesDir, file);
                const targetPath = join(templatesBackup, file);
                copyFileSync(sourcePath, targetPath);
            });
        }

        // 备份敏感值文件
        if (existsSync(this.secretsFile)) {
            const targetPath = join(backupPath, '.env.secrets');
            copyFileSync(this.secretsFile, targetPath);
        }

        // 备份Docker模板
        const dockerTemplatePath = join(this.projectRoot, 'infrastructure/docker/docker-compose.template.yml');
        if (existsSync(dockerTemplatePath)) {
            const dockerBackup = join(backupPath, 'infrastructure/docker');
            mkdirSync(dockerBackup, { recursive: true });
            copyFileSync(dockerTemplatePath, join(dockerBackup, 'docker-compose.template.yml'));
        }

        console.log(`✅ 配置备份已创建: ${backupPath}`);
        return backupPath;
    }

    /**
     * 添加新的配置项到模板
     */
    addConfigToTemplate(templateName, configKey, defaultValue = '') {
        console.log(`🔄 添加配置项到模板: ${templateName}.${configKey}...`);

        const templatePath = join(this.templatesDir, `${templateName}.env`);
        if (!existsSync(templatePath)) {
            console.error(`❌ 模板文件不存在: ${templatePath}`);
            return false;
        }

        try {
            // 创建备份
            this.createBackup('before-template-update');

            // 读取模板内容
            let content = readFileSync(templatePath, 'utf-8');

            // 检查是否已存在
            if (content.includes(configKey)) {
                console.log(`ℹ️ 配置项 ${configKey} 已存在于模板中`);
                return true;
            }

            // 添加新配置项
            const newLine = `${configKey}="{{${configKey}}}"`;
            content += `\n# 新增配置项\n${newLine}\n`;

            writeFileSync(templatePath, content, 'utf-8');
            console.log(`✅ 已添加配置项到模板: ${configKey}`);
            return true;
        } catch (error) {
            console.error('❌ 添加配置项失败:', error.message);
            return false;
        }
    }

    /**
     * 添加新的敏感值
     */
    addSecretValue(key, value) {
        console.log(`🔄 添加敏感值: ${key}...`);

        try {
            // 创建备份
            this.createBackup('before-secrets-update');

            // 读取现有敏感值
            const secrets = this.readSecrets();

            // 添加新值
            secrets[key] = value;

            // 保存
            this.saveSecrets(secrets);
            console.log(`✅ 已添加敏感值: ${key}`);
            return true;
        } catch (error) {
            console.error('❌ 添加敏感值失败:', error.message);
            return false;
        }
    }

    /**
     * 更新敏感值
     */
    updateSecretValue(key, value) {
        console.log(`🔄 更新敏感值: ${key}...`);

        try {
            // 创建备份
            this.createBackup('before-secrets-update');

            // 读取现有敏感值
            const secrets = this.readSecrets();

            // 更新值
            secrets[key] = value;

            // 保存
            this.saveSecrets(secrets);
            console.log(`✅ 已更新敏感值: ${key}`);
            return true;
        } catch (error) {
            console.error('❌ 更新敏感值失败:', error.message);
            return false;
        }
    }

    /**
     * 从模板和敏感值生成所有配置文件
     */
    generateAllConfigs() {
        console.log('🔄 从模板生成所有配置文件...');

        try {
            // 读取敏感值
            const secrets = this.readSecrets();

            // 确保有必要的敏感值
            const requiredSecrets = {
                JWT_SECRET: this.generateJwtSecret(),
                DB_PASSWORD: this.generateDbPassword(),
                REDIS_PASSWORD: this.generateDbPassword(),
                API_KEY: this.generateSecureKey(32),
            };

            // 合并敏感值
            const finalSecrets = { ...requiredSecrets, ...secrets };
            this.saveSecrets(finalSecrets);

            // 生成环境配置文件
            const envTemplates = ['root', 'api', 'web'];
            envTemplates.forEach(templateName => {
                const templatePath = join(this.templatesDir, `${templateName}.env`);
                const outputPath = templateName === 'root'
                    ? join(this.projectRoot, '.env')
                    : join(this.projectRoot, `apps/${templateName}/.env`);

                this.generateConfigFromTemplate(templatePath, outputPath, finalSecrets);
            });

            // 生成Docker Compose配置
            const dockerTemplatePath = join(this.projectRoot, 'infrastructure/docker/docker-compose.template.yml');
            const dockerOutputPath = join(this.projectRoot, 'infrastructure/docker/docker-compose.yml');
            this.generateConfigFromTemplate(dockerTemplatePath, dockerOutputPath, finalSecrets);

            console.log('✅ 所有配置文件生成完成');
            return true;
        } catch (error) {
            console.error('❌ 生成配置文件失败:', error.message);
            return false;
        }
    }

    /**
     * 验证配置模板和敏感值
     */
    validateConfig() {
        console.log('🔍 验证配置模板和敏感值...');

        try {
            // 验证模板文件
            const templateFiles = ['root.env', 'api.env', 'web.env'];
            templateFiles.forEach(templateFile => {
                const templatePath = join(this.templatesDir, templateFile);
                if (existsSync(templatePath)) {
                    console.log(`✅ 模板文件存在: ${templateFile}`);
                } else {
                    console.warn(`⚠️ 模板文件不存在: ${templateFile}`);
                }
            });

            // 验证Docker模板
            const dockerTemplatePath = join(this.projectRoot, 'infrastructure/docker/docker-compose.template.yml');
            if (existsSync(dockerTemplatePath)) {
                console.log('✅ Docker模板文件存在');
            } else {
                console.warn('⚠️ Docker模板文件不存在');
            }

            // 验证敏感值文件
            if (existsSync(this.secretsFile)) {
                const secrets = this.readSecrets();
                const requiredSecrets = ['JWT_SECRET', 'DB_PASSWORD', 'REDIS_PASSWORD', 'API_KEY'];
                const missing = requiredSecrets.filter(key => !secrets[key]);

                if (missing.length === 0) {
                    console.log('✅ 敏感值文件完整');
                } else {
                    console.warn(`⚠️ 缺少敏感值: ${missing.join(', ')}`);
                }
            } else {
                console.warn('⚠️ 敏感值文件不存在');
            }

            // 验证生成的配置文件
            const generatedFiles = [
                { path: '.env', requiredVars: ['NODE_ENV', 'PORT', 'DATABASE_URL', 'JWT_SECRET'] },
                { path: 'apps/api/.env', requiredVars: ['NODE_ENV', 'PORT', 'DATABASE_URL', 'JWT_SECRET'] },
                { path: 'apps/web/.env', requiredVars: ['VITE_API_BASE_URL', 'VITE_APP_TITLE'] },
                { path: 'infrastructure/docker/docker-compose.yml', requiredVars: ['POSTGRES_PASSWORD'] }
            ];

            for (const file of generatedFiles) {
                const filePath = join(this.projectRoot, file.path);
                if (existsSync(filePath)) {
                    console.log(`✅ 生成的配置文件存在: ${file.path}`);
                } else {
                    console.warn(`⚠️ 生成的配置文件不存在: ${file.path}`);
                }
            }

            console.log('✅ 配置验证完成');
            return true;
        } catch (error) {
            console.error('❌ 配置验证失败:', error.message);
            return false;
        }
    }

    /**
     * 列出所有敏感值
     */
    listSecrets() {
        console.log('📋 当前敏感值:');

        if (!existsSync(this.secretsFile)) {
            console.log('ℹ️ 敏感值文件不存在');
            return {};
        }

        const secrets = this.readSecrets();
        Object.entries(secrets).forEach(([key, value]) => {
            const maskedValue = value.length > 8 ? `${value.substring(0, 4)}...${value.substring(value.length - 4)}` : '***';
            console.log(`  ${key}: ${maskedValue}`);
        });

        return secrets;
    }

    /**
     * 列出所有模板文件
     */
    listTemplates() {
        console.log('📋 当前模板文件:');

        if (!existsSync(this.templatesDir)) {
            console.log('ℹ️ 模板目录不存在');
            return [];
        }

        const templateFiles = readdirSync(this.templatesDir)
            .filter(file => file.endsWith('.env'))
            .sort();

        templateFiles.forEach(file => {
            const templatePath = join(this.templatesDir, file);
            const content = readFileSync(templatePath, 'utf-8');
            const variables = content.match(/\{\{(\w+)\}\}/g) || [];
            const uniqueVars = [...new Set(variables.map(v => v.replace(/[{}]/g, '')))];

            console.log(`  ${file}: ${uniqueVars.length} 个变量`);
            uniqueVars.forEach(varName => {
                console.log(`    - {{${varName}}}`);
            });
        });

        return templateFiles;
    }

    /**
     * 交互式配置更新
     */
    async interactiveUpdate() {
        console.log('🚀 开始交互式配置管理...\n');

        const readline = await import('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const question = (prompt) => new Promise(resolve => rl.question(prompt, resolve));

        try {
            // 选择操作类型
            console.log('请选择要执行的操作:');
            console.log('1. 添加新的配置项到模板');
            console.log('2. 添加/更新敏感值');
            console.log('3. 从模板生成配置文件');
            console.log('4. 验证配置');
            console.log('5. 列出敏感值');
            console.log('6. 列出模板文件');
            console.log('7. 创建备份');
            console.log('8. 从备份恢复');

            const choice = await question('请输入选择 (1-8): ');

            switch (choice) {
                case '1':
                    await this.interactiveAddConfigToTemplate(rl, question);
                    break;
                case '2':
                    await this.interactiveUpdateSecrets(rl, question);
                    break;
                case '3':
                    this.generateAllConfigs();
                    break;
                case '4':
                    this.validateConfig();
                    break;
                case '5':
                    this.listSecrets();
                    break;
                case '6':
                    this.listTemplates();
                    break;
                case '7':
                    const desc = await question('请输入备份描述 (可选): ');
                    this.createBackup(desc);
                    break;
                case '8':
                    await this.interactiveRestoreFromBackup(rl, question);
                    break;
                default:
                    console.log('❌ 无效选择');
                    return;
            }

            console.log('\n✅ 操作完成！');

        } finally {
            rl.close();
        }
    }

    /**
     * 交互式添加配置项到模板
     */
    async interactiveAddConfigToTemplate(rl, question) {
        console.log('\n📝 添加配置项到模板:');

        // 选择模板
        const templates = ['root', 'api', 'web'];
        console.log('可用模板:');
        templates.forEach((template, index) => {
            console.log(`${index + 1}. ${template}`);
        });

        const templateChoice = await question('请选择模板 (1-3): ');
        const templateIndex = parseInt(templateChoice) - 1;

        if (templateIndex < 0 || templateIndex >= templates.length) {
            console.log('❌ 无效选择');
            return;
        }

        const templateName = templates[templateIndex];
        const configKey = await question('请输入配置项名称: ');
        const defaultValue = await question('请输入默认值 (可选): ');

        this.addConfigToTemplate(templateName, configKey, defaultValue);
    }

    /**
     * 交互式更新敏感值
     */
    async interactiveUpdateSecrets(rl, question) {
        console.log('\n🔐 更新敏感值:');

        const secrets = this.readSecrets();
        const secretKeys = Object.keys(secrets);

        if (secretKeys.length > 0) {
            console.log('现有敏感值:');
            secretKeys.forEach((key, index) => {
                console.log(`${index + 1}. ${key}`);
            });
            console.log(`${secretKeys.length + 1}. 添加新的敏感值`);
        } else {
            console.log('1. 添加新的敏感值');
        }

        const choice = await question('请选择要更新的敏感值: ');
        const choiceIndex = parseInt(choice) - 1;

        if (choiceIndex >= 0 && choiceIndex < secretKeys.length) {
            // 更新现有敏感值
            const key = secretKeys[choiceIndex];
            const value = await question(`请输入新的 ${key} 值: `);
            this.updateSecretValue(key, value);
        } else if (choiceIndex === secretKeys.length) {
            // 添加新敏感值
            const key = await question('请输入敏感值名称: ');
            const value = await question('请输入敏感值: ');
            this.addSecretValue(key, value);
        } else {
            console.log('❌ 无效选择');
        }
    }

    /**
     * 交互式从备份恢复
     */
    async interactiveRestoreFromBackup(rl, question) {
        console.log('\n🔄 从备份恢复:');

        const backups = this.listBackups();
        if (backups.length === 0) {
            console.log('ℹ️ 没有可用的备份');
            return;
        }

        const choice = await question('请选择要恢复的备份 (输入序号): ');
        const choiceIndex = parseInt(choice) - 1;

        if (choiceIndex >= 0 && choiceIndex < backups.length) {
            const backupName = backups[choiceIndex];
            this.restoreFromBackup(backupName);
        } else {
            console.log('❌ 无效选择');
        }
    }

    /**
     * 从备份恢复配置
     */
    restoreFromBackup(backupName) {
        console.log(`🔄 从备份恢复配置: ${backupName}...`);

        const backupPath = join(this.backupDir, backupName);
        if (!existsSync(backupPath)) {
            console.error(`❌ 备份不存在: ${backupPath}`);
            return false;
        }

        try {
            // 恢复环境文件
            const envFiles = [
                '.env',
                'apps/api/.env',
                'apps/web/.env',
                '.env.secrets'
            ];

            envFiles.forEach(file => {
                const backupFile = join(backupPath, file);
                if (existsSync(backupFile)) {
                    const targetFile = join(this.projectRoot, file);
                    copyFileSync(backupFile, targetFile);
                    console.log(`✅ 已恢复: ${file}`);
                }
            });

            // 恢复Docker配置
            const dockerFiles = [
                'infrastructure/docker/docker-compose.yml',
                'infrastructure/docker/docker-compose.template.yml'
            ];

            dockerFiles.forEach(file => {
                const backupFile = join(backupPath, file);
                if (existsSync(backupFile)) {
                    const targetFile = join(this.projectRoot, file);
                    copyFileSync(backupFile, targetFile);
                    console.log(`✅ 已恢复: ${file}`);
                }
            });

            console.log('✅ 配置恢复完成');
            return true;
        } catch (error) {
            console.error('❌ 配置恢复失败:', error.message);
            return false;
        }
    }

    /**
     * 列出可用备份
     */
    listBackups() {
        console.log('📋 可用备份:');

        if (!existsSync(this.backupDir)) {
            console.log('ℹ️ 没有找到备份目录');
            return [];
        }

        const backups = readdirSync(this.backupDir)
            .filter(item => {
                const itemPath = join(this.backupDir, item);
                return statSync(itemPath).isDirectory();
            })
            .sort()
            .reverse(); // 最新的在前

        if (backups.length === 0) {
            console.log('ℹ️ 没有找到备份');
            return [];
        }

        backups.forEach((backup, index) => {
            const backupPath = join(this.backupDir, backup);
            const stats = statSync(backupPath);
            const date = stats.mtime.toLocaleString();
            console.log(`${index + 1}. ${backup} (${date})`);
        });

        return backups;
    }
}

// 命令行接口
async function main() {
    const projectRoot = process.cwd();
    const updater = new ConfigUpdater(projectRoot);

    const args = process.argv.slice(2);
    const command = args[0];

    switch (command) {
        case 'interactive':
        case 'i':
            await updater.interactiveUpdate();
            break;

        case 'generate':
        case 'gen':
            updater.generateAllConfigs();
            break;

        case 'validate':
        case 'v':
            updater.validateConfig();
            break;

        case 'secrets':
        case 's':
            updater.listSecrets();
            break;

        case 'templates':
        case 't':
            updater.listTemplates();
            break;

        case 'add-config':
            const templateName = args[1];
            const configKey = args[2];
            const defaultValue = args[3] || '';
            if (!templateName || !configKey) {
                console.log('❌ 请指定模板名称和配置项名称');
                console.log('用法: node config-updater.js add-config <template> <key> [default]');
                return;
            }
            updater.addConfigToTemplate(templateName, configKey, defaultValue);
            break;

        case 'add-secret':
            const secretKey = args[1];
            const secretValue = args[2];
            if (!secretKey || !secretValue) {
                console.log('❌ 请指定敏感值名称和值');
                console.log('用法: node config-updater.js add-secret <key> <value>');
                return;
            }
            updater.addSecretValue(secretKey, secretValue);
            break;

        case 'update-secret':
            const updateKey = args[1];
            const updateValue = args[2];
            if (!updateKey || !updateValue) {
                console.log('❌ 请指定敏感值名称和新值');
                console.log('用法: node config-updater.js update-secret <key> <value>');
                return;
            }
            updater.updateSecretValue(updateKey, updateValue);
            break;

        case 'backup':
        case 'b':
            const description = args[1] || '';
            updater.createBackup(description);
            break;

        case 'restore':
        case 'r':
            const backupName = args[1];
            if (!backupName) {
                console.log('❌ 请指定备份名称');
                console.log('用法: node config-updater.js restore <backup-name>');
                return;
            }
            updater.restoreFromBackup(backupName);
            break;

        case 'list':
        case 'l':
            updater.listBackups();
            break;

        default:
            console.log('🔧 配置模板和值管理工具\n');
            console.log('用法:');
            console.log('  node config-updater.js interactive                    # 交互式配置管理');
            console.log('  node config-updater.js generate                      # 从模板生成配置文件');
            console.log('  node config-updater.js validate                      # 验证配置');
            console.log('  node config-updater.js secrets                       # 列出敏感值');
            console.log('  node config-updater.js templates                     # 列出模板文件');
            console.log('  node config-updater.js add-config <template> <key>   # 添加配置项到模板');
            console.log('  node config-updater.js add-secret <key> <value>      # 添加敏感值');
            console.log('  node config-updater.js update-secret <key> <value>   # 更新敏感值');
            console.log('  node config-updater.js backup [desc]                 # 创建备份');
            console.log('  node config-updater.js restore <name>                # 从备份恢复');
            console.log('  node config-updater.js list                          # 列出备份');
            console.log('\n示例:');
            console.log('  node config-updater.js interactive');
            console.log('  node config-updater.js add-config root NEW_CONFIG');
            console.log('  node config-updater.js add-secret NEW_SECRET "secret-value"');
            console.log('  node config-updater.js generate');
            console.log('  node config-updater.js backup "before-production-deploy"');
            break;
    }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('config-updater.js')) {
    main().catch(console.error);
}

export default ConfigUpdater;
