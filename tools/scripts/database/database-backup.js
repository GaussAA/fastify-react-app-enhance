#!/usr/bin/env node

/**
 * 数据库备份脚本
 *
 * 自动备份数据库
 */

import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
  unlinkSync,
  renameSync,
} from 'fs';
import { join, dirname } from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class DatabaseBackup {
  constructor() {
    this.projectRoot = join(__dirname, '../../..');
    this.backupDir = join(this.projectRoot, 'backups');
    this.config = this.loadConfig();
  }

  /**
   * 主备份函数
   */
  async backup() {
    console.log('💾 开始数据库备份...\n');

    try {
      // 确保备份目录存在
      this.ensureBackupDir();

      // 备份 PostgreSQL 数据库
      await this.backupPostgreSQL();

      // 清理旧备份
      await this.cleanupOldBackups();

      // 生成备份报告
      this.generateBackupReport();

      console.log('\n✅ 数据库备份完成！');
    } catch (error) {
      console.error('❌ 数据库备份失败:', error.message);
      process.exit(1);
    }
  }

  /**
   * 加载配置
   */
  loadConfig() {
    const configPath = path.join(this.projectRoot, 'backup-config.json');

    // 默认配置 - 使用环境变量或安全的默认值
    const defaultConfig = {
      postgres: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 5432,
        database: process.env.DB_NAME || 'fastify_react_app',
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'changeme_in_production',
      },
      backup: {
        retention: 7, // 保留天数
        compression: true,
        format: 'custom', // custom, plain, tar, directory
      },
    };

    if (fs.existsSync(configPath)) {
      try {
        const userConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        return { ...defaultConfig, ...userConfig };
      } catch (error) {
        console.log('⚠️  配置文件格式错误，使用默认配置');
        return defaultConfig;
      }
    } else {
      // 创建默认配置文件
      fs.writeFileSync(
        configPath,
        JSON.stringify(defaultConfig, null, 2),
        'utf-8'
      );
      console.log('📄 已创建默认备份配置文件: backup-config.json');
      return defaultConfig;
    }
  }

  /**
   * 确保备份目录存在
   */
  ensureBackupDir() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
      console.log(`📁 创建备份目录: ${this.backupDir}`);
    }
  }

  /**
   * 备份 PostgreSQL 数据库
   */
  async backupPostgreSQL() {
    console.log('🐘 备份 PostgreSQL 数据库...');

    const { postgres, backup } = this.config;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `postgres-${postgres.database}-${timestamp}.${backup.format}`;
    const backupPath = path.join(this.backupDir, backupFileName);

    try {
      // 构建 pg_dump 命令
      const pgDumpCmd = [
        'pg_dump',
        `--host=${postgres.host}`,
        `--port=${postgres.port}`,
        `--username=${postgres.username}`,
        `--dbname=${postgres.database}`,
        `--format=${backup.format}`,
        '--verbose',
        '--no-password',
      ];

      if (backup.compression) {
        pgDumpCmd.push('--compress=9');
      }

      // 设置环境变量
      const env = {
        ...process.env,
        PGPASSWORD: postgres.password,
      };

      // 执行备份
      console.log(`  📦 备份到: ${backupFileName}`);
      execSync(pgDumpCmd.join(' '), {
        cwd: this.projectRoot,
        env,
        stdio: 'pipe',
      });

      // 移动备份文件到目标位置
      if (backup.format === 'directory') {
        // 目录格式需要特殊处理
        const tempDir = path.join(this.projectRoot, 'temp-backup');
        if (fs.existsSync(tempDir)) {
          execSync(`mv ${tempDir} ${backupPath}`);
        }
      } else {
        // 其他格式直接重命名
        const tempFile = path.join(this.projectRoot, 'temp-backup');
        if (fs.existsSync(tempFile)) {
          fs.renameSync(tempFile, backupPath);
        }
      }

      // 验证备份文件
      if (fs.existsSync(backupPath)) {
        const stats = fs.statSync(backupPath);
        const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
        console.log(`  ✅ 备份成功: ${sizeInMB} MB`);

        // 记录备份信息
        this.recordBackupInfo({
          type: 'postgres',
          file: backupFileName,
          size: stats.size,
          timestamp: new Date().toISOString(),
          database: postgres.database,
        });
      } else {
        throw new Error('备份文件未创建');
      }
    } catch (error) {
      console.error(`  ❌ PostgreSQL 备份失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 清理旧备份
   */
  async cleanupOldBackups() {
    console.log('🧹 清理旧备份...');

    const { retention } = this.config.backup;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retention);

    try {
      const files = fs.readdirSync(this.backupDir);
      let deletedCount = 0;

      files.forEach(file => {
        const filePath = path.join(this.backupDir, file);
        const stats = fs.statSync(filePath);

        if (stats.mtime < cutoffDate) {
          fs.unlinkSync(filePath);
          deletedCount++;
          console.log(`  🗑️  删除旧备份: ${file}`);
        }
      });

      if (deletedCount > 0) {
        console.log(`  ✅ 清理完成，删除了 ${deletedCount} 个旧备份`);
      } else {
        console.log(`  ✅ 无需清理，所有备份都在保留期内`);
      }
    } catch (error) {
      console.log(`  ⚠️  清理旧备份时出错: ${error.message}`);
    }
  }

  /**
   * 记录备份信息
   */
  recordBackupInfo(backupInfo) {
    const logFile = path.join(this.backupDir, 'backup-log.json');
    let logData = [];

    if (fs.existsSync(logFile)) {
      try {
        logData = JSON.parse(fs.readFileSync(logFile, 'utf-8'));
      } catch (error) {
        logData = [];
      }
    }

    logData.push(backupInfo);

    // 只保留最近 100 条记录
    if (logData.length > 100) {
      logData = logData.slice(-100);
    }

    fs.writeFileSync(logFile, JSON.stringify(logData, null, 2), 'utf-8');
  }

  /**
   * 生成备份报告
   */
  generateBackupReport() {
    console.log('📊 生成备份报告...');

    const logFile = path.join(this.backupDir, 'backup-log.json');
    let logData = [];

    if (fs.existsSync(logFile)) {
      try {
        logData = JSON.parse(fs.readFileSync(logFile, 'utf-8'));
      } catch (error) {
        logData = [];
      }
    }

    // 计算统计信息
    const totalBackups = logData.length;
    const totalSize = logData.reduce((sum, backup) => sum + backup.size, 0);
    const lastBackup = logData[logData.length - 1];

    console.log(`\n📈 备份统计:`);
    console.log(`  📦 总备份数: ${totalBackups}`);
    console.log(`  💾 总大小: ${(totalSize / (1024 * 1024)).toFixed(2)} MB`);
    console.log(
      `  📅 最后备份: ${lastBackup ? new Date(lastBackup.timestamp).toLocaleString() : '无'}`
    );

    // 保存报告到文档目录
    this.saveReportToDocs(logData);
  }

  /**
   * 保存报告到文档目录
   */
  saveReportToDocs(logData) {
    const docsDir = path.join(this.projectRoot, 'docs', 'generated');
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString();

    // 生成 Markdown 报告
    let report = `# 数据库备份报告\n\n`;
    report += `**生成时间**: ${timestamp}\n\n`;

    // 统计信息
    const totalBackups = logData.length;
    const totalSize = logData.reduce((sum, backup) => sum + backup.size, 0);
    const lastBackup = logData[logData.length - 1];

    report += `## 📊 备份统计\n\n`;
    report += `| 指标 | 数值 |\n`;
    report += `|------|------|\n`;
    report += `| 📦 总备份数 | ${totalBackups} |\n`;
    report += `| 💾 总大小 | ${(totalSize / (1024 * 1024)).toFixed(2)} MB |\n`;
    report += `| 📅 最后备份 | ${lastBackup ? new Date(lastBackup.timestamp).toLocaleString() : '无'} |\n\n`;

    // 最近备份列表
    if (logData.length > 0) {
      report += `## 📋 最近备份记录\n\n`;
      report += `| 时间 | 类型 | 数据库 | 文件 | 大小 |\n`;
      report += `|------|------|--------|------|------|\n`;

      logData
        .slice(-10)
        .reverse()
        .forEach(backup => {
          const sizeInMB = (backup.size / (1024 * 1024)).toFixed(2);
          report += `| ${new Date(backup.timestamp).toLocaleString()} | ${backup.type} | ${backup.database} | ${backup.file} | ${sizeInMB} MB |\n`;
        });
      report += '\n';
    }

    // 备份配置
    report += `## ⚙️ 备份配置\n\n`;
    report += `\`\`\`json\n${JSON.stringify(this.config, null, 2)}\n\`\`\`\n\n`;

    // 使用说明
    report += `## 🛠️ 使用说明\n\n`;
    report += `### 手动备份\n`;
    report += `\`\`\`bash\n`;
    report += `# 运行备份脚本\n`;
    report += `node tools/scripts/database/database-backup.js\n\n`;
    report += `# 或使用 npm 脚本\n`;
    report += `pnpm run db:backup\n`;
    report += `\`\`\`\n\n`;

    report += `### 恢复数据库\n`;
    report += `\`\`\`bash\n`;
    report += `# 恢复 PostgreSQL 数据库\n`;
    report += `pg_restore --host=localhost --port=5432 --username=dev --dbname=mydb backup-file.dump\n`;
    report += `\`\`\`\n\n`;

    report += `### 定时备份\n`;
    report += `\`\`\`bash\n`;
    report += `# 添加到 crontab (每天凌晨 2 点备份)\n`;
    report += `0 2 * * * cd /path/to/project && node tools/scripts/database/database-backup.js\n`;
    report += `\`\`\`\n\n`;

    report += `---\n\n`;
    report += `*此报告由数据库备份脚本自动生成*\n`;

    const reportPath = path.join(docsDir, 'database-backup.md');
    fs.writeFileSync(reportPath, report, 'utf-8');

    console.log(`📄 备份报告已保存: ${reportPath}`);
  }

  /**
   * 恢复数据库
   */
  async restore(backupFile) {
    console.log(`🔄 恢复数据库: ${backupFile}...`);

    const { postgres } = this.config;
    const backupPath = path.join(this.backupDir, backupFile);

    if (!fs.existsSync(backupPath)) {
      throw new Error(`备份文件不存在: ${backupFile}`);
    }

    try {
      // 构建 pg_restore 命令
      const pgRestoreCmd = [
        'pg_restore',
        `--host=${postgres.host}`,
        `--port=${postgres.port}`,
        `--username=${postgres.username}`,
        `--dbname=${postgres.database}`,
        '--verbose',
        '--clean',
        '--if-exists',
        '--no-password',
        backupPath,
      ];

      // 设置环境变量
      const env = {
        ...process.env,
        PGPASSWORD: postgres.password,
      };

      // 执行恢复
      execSync(pgRestoreCmd.join(' '), {
        cwd: this.projectRoot,
        env,
        stdio: 'inherit',
      });

      console.log('✅ 数据库恢复完成！');
    } catch (error) {
      console.error(`❌ 数据库恢复失败: ${error.message}`);
      throw error;
    }
  }
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  const backup = new DatabaseBackup();

  if (args.length > 0 && args[0] === 'restore') {
    if (args.length < 2) {
      console.error('❌ 请指定要恢复的备份文件名');
      console.log(
        '用法: node tools/scripts/database/database-backup.js restore <backup-file>'
      );
      process.exit(1);
    }
    await backup.restore(args[1]);
  } else {
    await backup.backup();
  }
}

// 执行主函数
main().catch(console.error);

export { DatabaseBackup };
