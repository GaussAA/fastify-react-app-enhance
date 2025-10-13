#!/usr/bin/env node

/**
 * 安全配置检查脚本
 *
 * 检查项目中的安全配置问题，包括：
 * - 硬编码的敏感信息
 * - 默认密码和密钥
 * - 环境配置验证
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';
import SecureEnvManager from '../utils/env-manager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../../../');

class SecurityChecker {
  constructor() {
    this.projectRoot = projectRoot;
    this.issues = [];
    this.warnings = [];
  }

  /**
   * 检查硬编码的敏感信息
   */
  checkHardcodedSecrets() {
    console.log('🔍 检查硬编码敏感信息...');

    const sensitivePatterns = [
      {
        pattern:
          /password\s*[:=]\s*['"](?!changeme|your-|default-)[^'"]*['"]/gi,
        message: '发现硬编码密码',
        severity: 'error',
      },
      {
        pattern: /secret\s*[:=]\s*['"](?!changeme|your-|default-)[^'"]*['"]/gi,
        message: '发现硬编码密钥',
        severity: 'error',
      },
      {
        pattern:
          /jwt_secret\s*[:=]\s*['"](?!changeme|your-|default-)[^'"]*['"]/gi,
        message: '发现硬编码 JWT 密钥',
        severity: 'error',
      },
      {
        pattern: /postgresql:\/\/[^:]+:[^@]+@/gi,
        message: '发现硬编码数据库连接字符串',
        severity: 'error',
      },
      {
        pattern: /POSTGRES_PASSWORD:\s*['"][^'"]*['"]/gi,
        message: '发现 Docker Compose 中硬编码的数据库密码',
        severity: 'error',
      },
      {
        pattern: /POSTGRES_USER:\s*['"][^'"]*['"]/gi,
        message: '发现 Docker Compose 中硬编码的数据库用户名',
        severity: 'warning',
      },
      {
        pattern: /your-super-secret-jwt-key-change-this-in-production/gi,
        message: '发现默认 JWT 密钥',
        severity: 'warning',
        excludeFiles: ['security-check.js', 'env-manager.js'], // 排除检查脚本本身
      },
      {
        pattern: /postgres:postgres/gi,
        message: '发现默认数据库密码',
        severity: 'warning',
        excludeFiles: ['security-check.js', 'env-manager.js'], // 排除检查脚本本身
      },
    ];

    this.scanDirectory(
      join(this.projectRoot, 'tools/scripts'),
      sensitivePatterns
    );
    this.scanDirectory(join(this.projectRoot, 'apps'), sensitivePatterns);
    this.scanDirectory(
      join(this.projectRoot, 'infrastructure'),
      sensitivePatterns
    );
  }

  /**
   * 扫描目录中的文件
   */
  scanDirectory(dirPath, patterns) {
    if (!existsSync(dirPath)) return;

    // 跳过 node_modules 目录
    if (dirPath.includes('node_modules')) return;

    const items = readdirSync(dirPath);

    for (const item of items) {
      const itemPath = join(dirPath, item);
      const stat = statSync(itemPath);

      if (stat.isDirectory()) {
        // 跳过 node_modules 和其他不需要扫描的目录
        if (
          !['node_modules', '.git', 'dist', 'build', 'coverage'].includes(item)
        ) {
          this.scanDirectory(itemPath, patterns);
        }
      } else if (stat.isFile() && this.isCodeFile(item)) {
        this.scanFile(itemPath, patterns);
      }
    }
  }

  /**
   * 判断是否为代码文件
   */
  isCodeFile(filename) {
    const codeExtensions = ['.js', '.ts', '.jsx', '.tsx', '.json'];
    return codeExtensions.includes(extname(filename));
  }

  /**
   * 扫描单个文件
   */
  scanFile(filePath, patterns) {
    try {
      const content = readFileSync(filePath, 'utf-8');
      const fileName = filePath.split('/').pop() || filePath.split('\\').pop();

      for (const patternConfig of patterns) {
        const { pattern, message, severity, excludeFiles = [] } = patternConfig;

        // 检查是否应该排除此文件
        if (excludeFiles.some(excludeFile => fileName.includes(excludeFile))) {
          continue;
        }

        const matches = content.match(pattern);
        if (matches) {
          const issue = {
            file: filePath.replace(this.projectRoot, ''),
            message,
            severity,
            matches: matches.length,
          };

          if (severity === 'error') {
            this.issues.push(issue);
          } else {
            this.warnings.push(issue);
          }
        }
      }
    } catch (error) {
      console.warn(`⚠️ 无法读取文件: ${filePath}`);
    }
  }

  /**
   * 检查环境配置文件
   */
  checkEnvFiles() {
    console.log('🔍 检查环境配置文件...');

    const envFiles = [
      {
        path: '.env',
        requiredVars: ['NODE_ENV', 'PORT', 'DATABASE_URL', 'JWT_SECRET'],
      },
      {
        path: 'apps/api/.env',
        requiredVars: ['NODE_ENV', 'PORT', 'DATABASE_URL', 'JWT_SECRET'],
      },
      {
        path: 'apps/web/.env',
        requiredVars: ['VITE_API_BASE_URL', 'VITE_APP_TITLE'],
      },
    ];

    for (const envFile of envFiles) {
      const envPath = join(this.projectRoot, envFile.path);
      if (existsSync(envPath)) {
        try {
          const envManager = new SecureEnvManager(this.projectRoot);
          // 对于 Web 项目，使用自定义验证
          if (envFile.path.includes('web')) {
            this.validateWebEnvFile(envPath, envFile.requiredVars);
          } else {
            envManager.validateEnvFile(envPath);
          }
          console.log(`✅ ${envFile.path} 配置正确`);
        } catch (error) {
          this.issues.push({
            file: envFile.path,
            message: `环境配置错误: ${error.message}`,
            severity: 'error',
          });
        }
      } else {
        this.warnings.push({
          file: envFile.path,
          message: '环境配置文件不存在',
          severity: 'warning',
        });
      }
    }
  }

  /**
   * 验证 Web 环境配置文件
   */
  validateWebEnvFile(envPath, requiredVars) {
    const content = readFileSync(envPath, 'utf-8');
    const config = this.parseEnvContent(content);

    const missing = requiredVars.filter(key => !config[key]);
    if (missing.length > 0) {
      throw new Error(`缺少必需的环境变量: ${missing.join(', ')}`);
    }

    return true;
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
   * 检查 .gitignore 配置
   */
  checkGitignore() {
    console.log('🔍 检查 .gitignore 配置...');

    const gitignorePath = join(this.projectRoot, '.gitignore');
    if (!existsSync(gitignorePath)) {
      this.issues.push({
        file: '.gitignore',
        message: '.gitignore 文件不存在',
        severity: 'error',
      });
      return;
    }

    const gitignoreContent = readFileSync(gitignorePath, 'utf-8');
    const requiredIgnores = ['.env', '.env.secrets', 'node_modules/', 'logs/'];

    for (const ignore of requiredIgnores) {
      if (!gitignoreContent.includes(ignore)) {
        this.issues.push({
          file: '.gitignore',
          message: `缺少必要的忽略项: ${ignore}`,
          severity: 'error',
        });
      }
    }
  }

  /**
   * 生成安全报告
   */
  generateReport() {
    console.log('\n📊 安全检查报告');
    console.log('='.repeat(50));

    if (this.issues.length === 0 && this.warnings.length === 0) {
      console.log('✅ 未发现安全问题！');
      return;
    }

    if (this.issues.length > 0) {
      console.log(`\n❌ 发现 ${this.issues.length} 个安全问题:`);
      this.issues.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue.file}`);
        console.log(`     问题: ${issue.message}`);
        if (issue.matches) {
          console.log(`     匹配数: ${issue.matches}`);
        }
      });
    }

    if (this.warnings.length > 0) {
      console.log(`\n⚠️ 发现 ${this.warnings.length} 个警告:`);
      this.warnings.forEach((warning, index) => {
        console.log(`  ${index + 1}. ${warning.file}`);
        console.log(`     警告: ${warning.message}`);
        if (warning.matches) {
          console.log(`     匹配数: ${warning.matches}`);
        }
      });
    }

    console.log('\n💡 建议:');
    console.log('  1. 使用环境变量替代硬编码的敏感信息');
    console.log('  2. 运行 "pnpm run restore" 生成安全的环境配置');
    console.log('  3. 确保 .env.secrets 文件不被提交到版本控制');
  }

  /**
   * 运行所有检查
   */
  async run() {
    console.log('🔒 开始安全配置检查...\n');

    this.checkHardcodedSecrets();
    this.checkEnvFiles();
    this.checkGitignore();
    this.generateReport();

    // 返回检查结果
    return {
      hasIssues: this.issues.length > 0,
      hasWarnings: this.warnings.length > 0,
      issues: this.issues,
      warnings: this.warnings,
    };
  }
}

// 主函数
async function main() {
  const checker = new SecurityChecker();
  const result = await checker.run();

  if (result.hasIssues) {
    console.log('\n❌ 安全检查失败，发现安全问题！');
    process.exit(1);
  } else if (result.hasWarnings) {
    console.log('\n⚠️ 安全检查完成，但发现警告');
    process.exit(0);
  } else {
    console.log('\n✅ 安全检查通过！');
    process.exit(0);
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  main().catch(console.error);
}

export default SecurityChecker;
