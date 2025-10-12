#!/usr/bin/env node

/**
 * 维护自动化脚本
 *
 * 依赖清理、缓存清理、系统维护
 */

import { join, dirname } from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class MaintenanceAutomation {
  constructor() {
    this.projectRoot = join(__dirname, '../../..');
    this.results = {
      timestamp: new Date().toISOString(),
      tasks: [],
      summary: {
        totalTasks: 0,
        completed: 0,
        failed: 0,
        spaceFreed: 0,
        filesRemoved: 0,
      },
    };
    this.config = this.loadConfig();
  }

  /**
   * 主维护函数
   */
  async runMaintenance() {
    console.log('🔧 开始系统维护...\n');

    try {
      // 清理依赖
      await this.cleanupDependencies();

      // 清理缓存
      await this.cleanupCaches();

      // 清理临时文件
      await this.cleanupTempFiles();

      // 清理日志文件
      await this.cleanupLogFiles();

      // 清理构建产物
      await this.cleanupBuildArtifacts();

      // 优化数据库
      await this.optimizeDatabase();

      // 更新依赖
      await this.updateDependencies();

      // 生成报告
      this.generateReport();

      console.log('\n✅ 系统维护完成！');
    } catch (error) {
      console.error('❌ 系统维护失败:', error.message);
      process.exit(1);
    }
  }

  /**
   * 加载配置
   */
  loadConfig() {
    const configPath = path.join(this.projectRoot, 'maintenance-config.json');

    // 默认配置
    const defaultConfig = {
      cleanup: {
        nodeModules: true,
        lockFiles: false,
        cache: true,
        temp: true,
        logs: true,
        build: true,
      },
      retention: {
        logs: 30, // 保留30天的日志
        backups: 7, // 保留7天的备份
        temp: 1, // 保留1天的临时文件
      },
      optimization: {
        database: true,
        dependencies: true,
        cache: true,
      },
      update: {
        dependencies: true,
        devDependencies: true,
        major: false, // 不更新主版本
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
      console.log('📄 已创建默认维护配置文件: maintenance-config.json');
      return defaultConfig;
    }
  }

  /**
   * 清理依赖
   */
  async cleanupDependencies() {
    console.log('📦 清理依赖包...');

    const { cleanup } = this.config;

    if (cleanup.nodeModules) {
      await this.runTask('清理 node_modules', async () => {
        const nodeModulesDirs = [
          path.join(this.projectRoot, 'node_modules'),
          path.join(this.projectRoot, 'apps/api/node_modules'),
          path.join(this.projectRoot, 'apps/web/node_modules'),
        ];

        let totalSize = 0;
        let filesRemoved = 0;

        for (const dir of nodeModulesDirs) {
          if (fs.existsSync(dir)) {
            const size = await this.getDirectorySize(dir);
            totalSize += size;
            filesRemoved += await this.countFiles(dir);

            fs.rmSync(dir, { recursive: true, force: true });
            console.log(
              `    🗑️  删除: ${path.relative(this.projectRoot, dir)} (${this.formatSize(size)})`
            );
          }
        }

        return { spaceFreed: totalSize, filesRemoved };
      });
    }

    if (cleanup.lockFiles) {
      await this.runTask('清理锁文件', async () => {
        const lockFiles = ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml'];

        let filesRemoved = 0;

        for (const file of lockFiles) {
          const filePath = path.join(this.projectRoot, file);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            filesRemoved++;
            console.log(`    🗑️  删除: ${file}`);
          }
        }

        return { filesRemoved };
      });
    }
  }

  /**
   * 清理缓存
   */
  async cleanupCaches() {
    console.log('🗂️  清理缓存文件...');

    const { cleanup } = this.config;

    if (cleanup.cache) {
      await this.runTask('清理 npm 缓存', async () => {
        try {
          execSync('npm cache clean --force', {
            encoding: 'utf-8',
            cwd: this.projectRoot,
            stdio: 'pipe',
          });
          console.log('    ✅ npm 缓存已清理');
        } catch (error) {
          console.log('    ⚠️  npm 缓存清理失败');
        }

        try {
          execSync('pnpm store prune', {
            encoding: 'utf-8',
            cwd: this.projectRoot,
            stdio: 'pipe',
          });
          console.log('    ✅ pnpm 缓存已清理');
        } catch (error) {
          console.log('    ⚠️  pnpm 缓存清理失败');
        }

        return {};
      });

      await this.runTask('清理系统缓存', async () => {
        const cacheDirs = [
          path.join(this.projectRoot, '.cache'),
          path.join(this.projectRoot, '.turbo'),
          path.join(this.projectRoot, 'apps/api/.cache'),
          path.join(this.projectRoot, 'apps/web/.cache'),
          path.join(this.projectRoot, 'apps/web/dist'),
          path.join(this.projectRoot, 'apps/api/dist'),
        ];

        let totalSize = 0;
        let filesRemoved = 0;

        for (const dir of cacheDirs) {
          if (fs.existsSync(dir)) {
            const size = await this.getDirectorySize(dir);
            totalSize += size;
            filesRemoved += await this.countFiles(dir);

            fs.rmSync(dir, { recursive: true, force: true });
            console.log(
              `    🗑️  删除: ${path.relative(this.projectRoot, dir)} (${this.formatSize(size)})`
            );
          }
        }

        return { spaceFreed: totalSize, filesRemoved };
      });
    }
  }

  /**
   * 清理临时文件
   */
  async cleanupTempFiles() {
    console.log('🗑️  清理临时文件...');

    const { cleanup, retention } = this.config;

    if (cleanup.temp) {
      await this.runTask('清理临时文件', async () => {
        const tempDirs = [
          path.join(this.projectRoot, 'temp'),
          path.join(this.projectRoot, 'tmp'),
          path.join(this.projectRoot, '.tmp'),
        ];

        let totalSize = 0;
        let filesRemoved = 0;

        for (const dir of tempDirs) {
          if (fs.existsSync(dir)) {
            const size = await this.getDirectorySize(dir);
            totalSize += size;
            filesRemoved += await this.countFiles(dir);

            fs.rmSync(dir, { recursive: true, force: true });
            console.log(
              `    🗑️  删除: ${path.relative(this.projectRoot, dir)} (${this.formatSize(size)})`
            );
          }
        }

        // 清理超过保留期的临时文件
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retention.temp);

        const tempFiles = this.findTempFiles();
        for (const file of tempFiles) {
          const stats = fs.statSync(file);
          if (stats.mtime < cutoffDate) {
            const size = stats.size;
            totalSize += size;
            filesRemoved++;

            fs.unlinkSync(file);
            console.log(
              `    🗑️  删除过期文件: ${path.relative(this.projectRoot, file)}`
            );
          }
        }

        return { spaceFreed: totalSize, filesRemoved };
      });
    }
  }

  /**
   * 清理日志文件
   */
  async cleanupLogFiles() {
    console.log('📝 清理日志文件...');

    const { cleanup, retention } = this.config;

    if (cleanup.logs) {
      await this.runTask('清理日志文件', async () => {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retention.logs);

        const logFiles = this.findLogFiles();
        let totalSize = 0;
        let filesRemoved = 0;

        for (const file of logFiles) {
          const stats = fs.statSync(file);
          if (stats.mtime < cutoffDate) {
            const size = stats.size;
            totalSize += size;
            filesRemoved++;

            fs.unlinkSync(file);
            console.log(
              `    🗑️  删除过期日志: ${path.relative(this.projectRoot, file)}`
            );
          }
        }

        return { spaceFreed: totalSize, filesRemoved };
      });
    }
  }

  /**
   * 清理构建产物
   */
  async cleanupBuildArtifacts() {
    console.log('🏗️  清理构建产物...');

    const { cleanup } = this.config;

    if (cleanup.build) {
      await this.runTask('清理构建产物', async () => {
        const buildDirs = [
          path.join(this.projectRoot, 'dist'),
          path.join(this.projectRoot, 'build'),
          path.join(this.projectRoot, 'coverage'),
          path.join(this.projectRoot, '.nyc_output'),
          path.join(this.projectRoot, 'apps/api/dist'),
          path.join(this.projectRoot, 'apps/web/dist'),
          path.join(this.projectRoot, 'apps/api/coverage'),
          path.join(this.projectRoot, 'apps/web/coverage'),
        ];

        let totalSize = 0;
        let filesRemoved = 0;

        for (const dir of buildDirs) {
          if (fs.existsSync(dir)) {
            const size = await this.getDirectorySize(dir);
            totalSize += size;
            filesRemoved += await this.countFiles(dir);

            fs.rmSync(dir, { recursive: true, force: true });
            console.log(
              `    🗑️  删除: ${path.relative(this.projectRoot, dir)} (${this.formatSize(size)})`
            );
          }
        }

        return { spaceFreed: totalSize, filesRemoved };
      });
    }
  }

  /**
   * 优化数据库
   */
  async optimizeDatabase() {
    console.log('🗄️  优化数据库...');

    const { optimization } = this.config;

    if (optimization.database) {
      await this.runTask('优化数据库', async () => {
        try {
          // 运行 Prisma 生成
          execSync('npx prisma generate', {
            encoding: 'utf-8',
            cwd: path.join(this.projectRoot, 'apps/api'),
            stdio: 'pipe',
          });
          console.log('    ✅ Prisma 客户端已重新生成');

          // 运行数据库迁移
          execSync('npx prisma migrate deploy', {
            encoding: 'utf-8',
            cwd: path.join(this.projectRoot, 'apps/api'),
            stdio: 'pipe',
          });
          console.log('    ✅ 数据库迁移已完成');
        } catch (error) {
          console.log('    ⚠️  数据库优化失败:', error.message);
        }

        return {};
      });
    }
  }

  /**
   * 更新依赖
   */
  async updateDependencies() {
    console.log('📦 更新依赖包...');

    const { update } = this.config;

    if (update.dependencies || update.devDependencies) {
      await this.runTask('更新依赖包', async () => {
        try {
          if (update.dependencies) {
            execSync('pnpm update --prod', {
              encoding: 'utf-8',
              cwd: this.projectRoot,
              stdio: 'pipe',
            });
            console.log('    ✅ 生产依赖已更新');
          }

          if (update.devDependencies) {
            execSync('pnpm update --dev', {
              encoding: 'utf-8',
              cwd: this.projectRoot,
              stdio: 'pipe',
            });
            console.log('    ✅ 开发依赖已更新');
          }
        } catch (error) {
          console.log('    ⚠️  依赖更新失败:', error.message);
        }

        return {};
      });
    }
  }

  /**
   * 运行维护任务
   */
  async runTask(name, taskFunction) {
    console.log(`  🔧 ${name}...`);

    const startTime = Date.now();
    let result = {
      name,
      status: 'unknown',
      duration: 0,
      spaceFreed: 0,
      filesRemoved: 0,
      error: '',
    };

    try {
      const taskResult = await taskFunction();
      result.status = 'completed';
      result.spaceFreed = taskResult.spaceFreed || 0;
      result.filesRemoved = taskResult.filesRemoved || 0;
      result.duration = Date.now() - startTime;

      console.log(`    ✅ ${name} 完成 (${result.duration}ms)`);
      this.results.summary.completed++;
    } catch (error) {
      result.status = 'failed';
      result.error = error.message;
      result.duration = Date.now() - startTime;

      console.log(`    ❌ ${name} 失败: ${error.message}`);
      this.results.summary.failed++;
    }

    this.results.tasks.push(result);
    this.results.summary.totalTasks++;
    this.results.summary.spaceFreed += result.spaceFreed;
    this.results.summary.filesRemoved += result.filesRemoved;
  }

  /**
   * 获取目录大小
   */
  async getDirectorySize(dirPath) {
    let totalSize = 0;

    try {
      const items = fs.readdirSync(dirPath);

      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stats = fs.statSync(itemPath);

        if (stats.isDirectory()) {
          totalSize += await this.getDirectorySize(itemPath);
        } else {
          totalSize += stats.size;
        }
      }
    } catch (error) {
      // 忽略权限错误
    }

    return totalSize;
  }

  /**
   * 计算文件数量
   */
  async countFiles(dirPath) {
    let count = 0;

    try {
      const items = fs.readdirSync(dirPath);

      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stats = fs.statSync(itemPath);

        if (stats.isDirectory()) {
          count += await this.countFiles(itemPath);
        } else {
          count++;
        }
      }
    } catch (error) {
      // 忽略权限错误
    }

    return count;
  }

  /**
   * 格式化文件大小
   */
  formatSize(bytes) {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * 查找临时文件
   */
  findTempFiles() {
    const tempFiles = [];
    const tempPatterns = [
      '**/*.tmp',
      '**/*.temp',
      '**/*.log',
      '**/temp-*',
      '**/*-temp-*',
    ];

    tempPatterns.forEach(pattern => {
      try {
        const files = execSync(
          `find . -name "${pattern}" -type f 2>/dev/null`,
          {
            encoding: 'utf-8',
            cwd: this.projectRoot,
          }
        );

        files.split('\n').forEach(file => {
          if (file.trim()) {
            tempFiles.push(path.resolve(this.projectRoot, file.trim()));
          }
        });
      } catch (error) {
        // 忽略找不到文件的错误
      }
    });

    return tempFiles;
  }

  /**
   * 查找日志文件
   */
  findLogFiles() {
    const logFiles = [];
    const logPatterns = ['**/*.log', '**/logs/**/*', '**/log/**/*'];

    logPatterns.forEach(pattern => {
      try {
        const files = execSync(
          `find . -name "${pattern}" -type f 2>/dev/null`,
          {
            encoding: 'utf-8',
            cwd: this.projectRoot,
          }
        );

        files.split('\n').forEach(file => {
          if (file.trim()) {
            logFiles.push(path.resolve(this.projectRoot, file.trim()));
          }
        });
      } catch (error) {
        // 忽略找不到文件的错误
      }
    });

    return logFiles;
  }

  /**
   * 生成报告
   */
  generateReport() {
    console.log('\n📊 维护报告');
    console.log('='.repeat(50));

    // 显示摘要
    console.log(`\n📈 维护摘要:`);
    console.log(`  📊 总任务数: ${this.results.summary.totalTasks}`);
    console.log(`  ✅ 完成: ${this.results.summary.completed}`);
    console.log(`  ❌ 失败: ${this.results.summary.failed}`);
    console.log(
      `  💾 释放空间: ${this.formatSize(this.results.summary.spaceFreed)}`
    );
    console.log(`  🗑️  删除文件: ${this.results.summary.filesRemoved}`);

    // 显示详细结果
    console.log(`\n📋 详细结果:`);
    this.results.tasks.forEach(task => {
      const icon = task.status === 'completed' ? '✅' : '❌';
      const duration = `${task.duration}ms`;
      const spaceFreed =
        task.spaceFreed > 0 ? ` (${this.formatSize(task.spaceFreed)})` : '';
      const filesRemoved =
        task.filesRemoved > 0 ? ` (${task.filesRemoved} 文件)` : '';

      console.log(
        `  ${icon} ${task.name} (${duration})${spaceFreed}${filesRemoved}`
      );

      if (task.status === 'failed' && task.error) {
        console.log(`     错误: ${task.error}`);
      }
    });

    // 生成建议
    this.generateRecommendations();

    // 保存报告
    this.saveReportToFile();
  }

  /**
   * 生成建议
   */
  generateRecommendations() {
    console.log(`\n💡 维护建议:`);

    if (this.results.summary.spaceFreed > 0) {
      console.log(
        `  1. 💾 已释放 ${this.formatSize(this.results.summary.spaceFreed)} 空间`
      );
    }

    if (this.results.summary.failed > 0) {
      console.log(
        `  2. ❌ ${this.results.summary.failed} 个任务失败，请检查错误信息`
      );
    }

    console.log(`\n🛠️  维护命令:`);
    console.log(`  pnpm run maintenance      # 运行系统维护`);
    console.log(`  pnpm run clean            # 清理项目文件`);
    console.log(`  pnpm run check:all        # 运行所有检查`);
  }

  /**
   * 保存报告到文件
   */
  saveReportToFile() {
    const outputDir = path.join(
      this.projectRoot,
      'docs',
      'generated',
      'reports',
      'maintenance'
    );
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 保存 JSON 报告
    const jsonPath = path.join(outputDir, 'maintenance.json');
    fs.writeFileSync(jsonPath, JSON.stringify(this.results, null, 2), 'utf-8');

    // 生成 Markdown 报告
    const markdownReport = this.generateMarkdownReport();
    const mdPath = path.join(outputDir, 'maintenance.md');
    fs.writeFileSync(mdPath, markdownReport, 'utf-8');

    console.log(`\n📄 维护报告已保存:`);
    console.log(`  JSON: ${jsonPath}`);
    console.log(`  Markdown: ${mdPath}`);
  }

  /**
   * 生成 Markdown 报告
   */
  generateMarkdownReport() {
    const timestamp = new Date().toISOString();

    let report = `# 系统维护报告\n\n`;
    report += `**生成时间**: ${timestamp}\n\n`;

    // 摘要
    report += `## 📊 维护摘要\n\n`;
    report += `| 指标 | 数值 |\n`;
    report += `|------|------|\n`;
    report += `| 📊 总任务数 | ${this.results.summary.totalTasks} |\n`;
    report += `| ✅ 完成 | ${this.results.summary.completed} |\n`;
    report += `| ❌ 失败 | ${this.results.summary.failed} |\n`;
    report += `| 💾 释放空间 | ${this.formatSize(this.results.summary.spaceFreed)} |\n`;
    report += `| 🗑️ 删除文件 | ${this.results.summary.filesRemoved} |\n\n`;

    // 详细结果
    if (this.results.tasks.length > 0) {
      report += `## 📋 详细结果\n\n`;
      report += `| 任务 | 状态 | 耗时 | 释放空间 | 删除文件 |\n`;
      report += `|------|------|------|----------|----------|\n`;

      this.results.tasks.forEach(task => {
        const icon = task.status === 'completed' ? '✅' : '❌';
        const status = task.status === 'completed' ? '完成' : '失败';
        const spaceFreed =
          task.spaceFreed > 0 ? this.formatSize(task.spaceFreed) : '-';
        const filesRemoved = task.filesRemoved > 0 ? task.filesRemoved : '-';

        report += `| ${icon} ${task.name} | ${status} | ${task.duration}ms | ${spaceFreed} | ${filesRemoved} |\n`;
      });
      report += '\n';
    }

    // 失败任务详情
    const failedTasks = this.results.tasks.filter(
      task => task.status === 'failed'
    );
    if (failedTasks.length > 0) {
      report += `## ❌ 失败任务详情\n\n`;
      failedTasks.forEach(task => {
        report += `### ${task.name}\n\n`;
        report += `**错误信息**: ${task.error}\n\n`;
      });
    }

    // 维护建议
    report += `## 💡 维护建议\n\n`;
    report += `\`\`\`bash\n`;
    report += `# 运行系统维护\n`;
    report += `pnpm run maintenance\n\n`;
    report += `# 清理项目文件\n`;
    report += `pnpm run clean\n\n`;
    report += `# 运行所有检查\n`;
    report += `pnpm run check:all\n`;
    report += `\`\`\`\n\n`;

    report += `---\n\n`;
    report += `*此报告由系统维护脚本自动生成*\n`;

    return report;
  }
}

// 执行维护
const maintenance = new MaintenanceAutomation();
maintenance.runMaintenance().catch(console.error);

export { MaintenanceAutomation };
