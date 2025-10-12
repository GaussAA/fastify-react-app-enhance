/**
 * 安全配置读取器
 * 从 .env 和 .env.secret 文件安全读取配置
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class SecureConfigLoader {
    constructor() {
        this.envPath = join(__dirname, '.env');
        this.secretPath = join(__dirname, '.env.secret');
        this.config = this.loadConfig();
    }

    /**
     * 解析环境文件内容
     */
    parseEnvFile(filePath) {
        if (!existsSync(filePath)) {
            return {};
        }

        const content = readFileSync(filePath, 'utf-8');
        const config = {};
        const lines = content.split('\n');

        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const [key, ...valueParts] = trimmed.split('=');
                if (key && valueParts.length > 0) {
                    config[key.trim()] = valueParts.join('=').trim();
                }
            }
        }

        return config;
    }

    /**
     * 加载配置
     */
    loadConfig() {
        // 读取 .env 文件（占位符）
        const envConfig = this.parseEnvFile(this.envPath);
        
        // 读取 .env.secret 文件（敏感值）
        const secretConfig = this.parseEnvFile(this.secretPath);

        // 合并配置，用敏感值替换占位符
        const finalConfig = { ...envConfig };
        
        for (const [key, value] of Object.entries(finalConfig)) {
            if (value.startsWith('\) && value.endsWith(')) {
                const secretKey = value.slice(2, -1);
                if (secretConfig[secretKey]) {
                    finalConfig[key] = secretConfig[secretKey];
                } else {
                    console.warn(`警告: 未找到敏感值 ${secretKey}`);
                }
            }
        }

        return finalConfig;
    }

    /**
     * 获取配置值
     */
    get(key) {
        return this.config[key];
    }

    /**
     * 获取所有配置
     */
    getAll() {
        return { ...this.config };
    }
}

export default SecureConfigLoader;
