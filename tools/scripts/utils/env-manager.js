#!/usr/bin/env node

/**
 * 安全的环境配置管理器
 *
 * 提供安全的环境配置生成、验证和管理功能
 * 避免硬编码敏感信息
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { randomBytes, createHash } from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class SecureEnvManager {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.templatesDir = join(projectRoot, 'config/env-templates');
    this.secretsFile = join(projectRoot, '.env.secrets');
  }

  /**
   * 生成安全的随机密钥
   */
  generateSecureKey(length = 32) {
    return randomBytes(length).toString('hex');
  }

  /**
   * 生成 JWT 密钥
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
   * 从模板文件读取配置模板
   */
  readTemplate(templateName) {
    const templatePath = join(this.templatesDir, `${templateName}.env`);
    if (!existsSync(templatePath)) {
      throw new Error(`模板文件不存在: ${templatePath}`);
    }
    return readFileSync(templatePath, 'utf-8');
  }

  /**
   * 获取或生成安全配置
   */
  getSecureConfig() {
    let secrets = {};

    // 尝试从 .env.secrets 文件读取
    if (existsSync(this.secretsFile)) {
      try {
        const secretsContent = readFileSync(this.secretsFile, 'utf-8');
        secrets = this.parseEnvContent(secretsContent);
      } catch (error) {
        console.warn('⚠️ 无法读取 .env.secrets 文件，将生成新的安全配置');
      }
    }

    // 生成缺失的安全配置
    const requiredSecrets = {
      JWT_SECRET: this.generateJwtSecret(),
      DB_PASSWORD: this.generateDbPassword(),
      REDIS_PASSWORD: this.generateDbPassword(),
      API_KEY: this.generateSecureKey(32),
    };

    // 合并配置，优先使用已存在的
    const finalSecrets = { ...requiredSecrets, ...secrets };

    // 保存新的安全配置
    this.saveSecrets(finalSecrets);

    return finalSecrets;
  }

  /**
   * 解析环境变量内容
   */
  parseEnvContent(content) {
    const config = {};
    const lines = content.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          config[key.trim()] = valueParts
            .join('=')
            .trim()
            .replace(/^["']|["']$/g, '');
        }
      }
    }

    return config;
  }

  /**
   * 保存安全配置到 .env.secrets 文件
   */
  saveSecrets(secrets) {
    const secretsContent = `# 安全配置文件 - 请勿提交到版本控制
# 此文件包含敏感信息，已添加到 .gitignore

# JWT 配置
JWT_SECRET="${secrets.JWT_SECRET}"

# 数据库配置
DB_PASSWORD="${secrets.DB_PASSWORD}"
REDIS_PASSWORD="${secrets.REDIS_PASSWORD}"

# API 配置
API_KEY="${secrets.API_KEY}"

# 生成时间
GENERATED_AT="${new Date().toISOString()}"
`;

    writeFileSync(this.secretsFile, secretsContent, 'utf-8');
    console.log('✅ 安全配置已保存到 .env.secrets');
  }

  /**
   * 从模板生成环境配置文件
   */
  generateEnvFile(templateName, outputPath, customVars = {}) {
    const template = this.readTemplate(templateName);
    const secrets = this.getSecureConfig();

    // 合并所有变量
    const allVars = {
      ...secrets,
      ...customVars,
      // 添加一些常用的非敏感配置
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

    // 替换模板中的变量
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

    // 写入文件
    writeFileSync(outputPath, content, 'utf-8');
    console.log(`✅ 已生成环境配置文件: ${outputPath}`);
  }

  /**
   * 生成 Docker Compose 配置文件
   */
  generateDockerCompose(outputPath = null) {
    const templatePath = join(
      this.projectRoot,
      'infrastructure/docker/docker-compose.template.yml'
    );
    if (!existsSync(templatePath)) {
      throw new Error(`Docker Compose 模板文件不存在: ${templatePath}`);
    }

    const template = readFileSync(templatePath, 'utf-8');
    const secrets = this.getSecureConfig();

    // 合并所有变量
    const allVars = {
      ...secrets,
      NODE_ENV: 'development',
      API_PORT: '8001',
      WEB_PORT: '5173',
      DB_HOST: 'localhost',
      DB_PORT: '5432',
      DB_NAME: 'fastify_react_app',
      DB_USER: 'postgres',
      REDIS_HOST: 'localhost',
      REDIS_PORT: '6379',
    };

    // 替换模板中的变量
    let content = template;
    for (const [key, value] of Object.entries(allVars)) {
      const placeholder = `{{${key}}}`;
      content = content.replace(new RegExp(placeholder, 'g'), value);
    }

    // 确定输出路径
    const finalOutputPath =
      outputPath ||
      join(this.projectRoot, 'infrastructure/docker/docker-compose.yml');

    // 确保输出目录存在
    const outputDir = dirname(finalOutputPath);
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    // 写入文件
    writeFileSync(finalOutputPath, content, 'utf-8');
    console.log(`✅ 已生成 Docker Compose 配置文件: ${finalOutputPath}`);
  }

  /**
   * 验证环境配置
   */
  validateEnvFile(envPath) {
    if (!existsSync(envPath)) {
      throw new Error(`环境配置文件不存在: ${envPath}`);
    }

    const content = readFileSync(envPath, 'utf-8');
    const config = this.parseEnvContent(content);

    const requiredVars = ['NODE_ENV', 'PORT', 'DATABASE_URL', 'JWT_SECRET'];

    const missing = requiredVars.filter(key => !config[key]);
    if (missing.length > 0) {
      throw new Error(`缺少必需的环境变量: ${missing.join(', ')}`);
    }

    // 检查敏感配置是否使用了默认值
    const sensitiveDefaults = {
      JWT_SECRET: 'your-super-secret-jwt-key-change-this-in-production',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/',
    };

    for (const [key, defaultValue] of Object.entries(sensitiveDefaults)) {
      if (config[key] === defaultValue) {
        console.warn(`⚠️ 警告: ${key} 使用了默认值，建议更改`);
      }
    }

    return true;
  }

  /**
   * 确保 .env.secrets 在 .gitignore 中
   */
  ensureSecretsIgnored() {
    const gitignorePath = join(this.projectRoot, '.gitignore');
    if (!existsSync(gitignorePath)) {
      return;
    }

    const gitignoreContent = readFileSync(gitignorePath, 'utf-8');
    if (!gitignoreContent.includes('.env.secrets')) {
      const updatedContent =
        gitignoreContent + '\n# 安全配置文件\n.env.secrets\n';
      writeFileSync(gitignorePath, updatedContent, 'utf-8');
      console.log('✅ 已将 .env.secrets 添加到 .gitignore');
    }
  }
}

export default SecureEnvManager;
