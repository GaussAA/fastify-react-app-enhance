#!/usr/bin/env node

/**
 * 监控和日志自动化脚本
 *
 * 系统监控、日志分析和性能监控
 */

import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
} from 'fs';
import { join, dirname } from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class MonitoringLogger {
  constructor() {
    this.projectRoot = join(__dirname, '../../..');
    this.results = {
      timestamp: new Date().toISOString(),
      system: {},
      logs: {},
      performance: {},
      alerts: [],
    };
    this.config = this.loadConfig();
  }

  /**
   * 主监控函数
   */
  async monitor() {
    console.log('📊 开始系统监控和日志分析...\n');

    try {
      // 系统监控
      await this.monitorSystem();

      // 日志分析
      await this.analyzeLogs();

      // 性能监控
      await this.monitorPerformance();

      // 生成报告
      this.generateReport();

      console.log('\n✅ 监控和日志分析完成！');
    } catch (error) {
      console.error('❌ 监控失败:', error.message);
      process.exit(1);
    }
  }

  /**
   * 加载配置
   */
  loadConfig() {
    const configPath = path.join(this.projectRoot, 'monitoring-config.json');

    // 默认配置
    const defaultConfig = {
      system: {
        cpuThreshold: 80, // CPU 使用率阈值
        memoryThreshold: 85, // 内存使用率阈值
        diskThreshold: 90, // 磁盘使用率阈值
      },
      logs: {
        logPaths: ['logs/*.log', 'apps/api/logs/*.log', 'apps/web/logs/*.log'],
        errorKeywords: ['error', 'ERROR', 'Error', 'exception', 'Exception'],
        warningKeywords: ['warn', 'WARN', 'warning', 'Warning'],
      },
      performance: {
        responseTimeThreshold: 1000, // 响应时间阈值
        throughputThreshold: 10, // 吞吐量阈值
      },
      alerts: {
        enabled: true,
        email: 'admin@example.com',
        webhook: null,
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
      console.log('📄 已创建默认监控配置文件: monitoring-config.json');
      return defaultConfig;
    }
  }

  /**
   * 系统监控
   */
  async monitorSystem() {
    console.log('💻 监控系统资源...');

    try {
      // CPU 使用率
      const cpuUsage = await this.getCpuUsage();
      this.results.system.cpu = cpuUsage;

      // 内存使用情况
      const memoryUsage = await this.getMemoryUsage();
      this.results.system.memory = memoryUsage;

      // 磁盘使用情况
      const diskUsage = await this.getDiskUsage();
      this.results.system.disk = diskUsage;

      // 网络状态
      const networkStatus = await this.getNetworkStatus();
      this.results.system.network = networkStatus;

      // 进程状态
      const processStatus = await this.getProcessStatus();
      this.results.system.processes = processStatus;

      console.log(`  💻 CPU 使用率: ${cpuUsage.usage.toFixed(2)}%`);
      console.log(`  🧠 内存使用率: ${memoryUsage.usage.toFixed(2)}%`);
      console.log(`  💾 磁盘使用率: ${diskUsage.usage.toFixed(2)}%`);

      // 检查阈值
      this.checkSystemThresholds();
    } catch (error) {
      console.log(`  ❌ 系统监控失败: ${error.message}`);
    }
  }

  /**
   * 获取 CPU 使用率
   */
  async getCpuUsage() {
    return new Promise(resolve => {
      const startMeasure = this.cpuAverage();

      setTimeout(() => {
        const endMeasure = this.cpuAverage();
        const idleDifference = endMeasure.idle - startMeasure.idle;
        const totalDifference = endMeasure.total - startMeasure.total;
        const percentageCPU =
          100 - ~~((100 * idleDifference) / totalDifference);

        resolve({
          usage: percentageCPU,
          cores: os.cpus().length,
          model: os.cpus()[0].model,
        });
      }, 100);
    });
  }

  /**
   * CPU 平均值计算
   */
  cpuAverage() {
    let totalIdle = 0;
    let totalTick = 0;
    const cpus = os.cpus();

    for (let i = 0; i < cpus.length; i++) {
      const cpu = cpus[i];
      for (const type in cpu.times) {
        totalTick += cpu.times[type];
      }
      totalIdle += cpu.times.idle;
    }

    return { idle: totalIdle / cpus.length, total: totalTick / cpus.length };
  }

  /**
   * 获取内存使用情况
   */
  async getMemoryUsage() {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    return {
      total: totalMem,
      used: usedMem,
      free: freeMem,
      usage: (usedMem / totalMem) * 100,
    };
  }

  /**
   * 获取磁盘使用情况
   */
  async getDiskUsage() {
    try {
      const output = execSync('df -h', { encoding: 'utf-8' });
      const lines = output.split('\n');
      const rootLine = lines.find(line => line.includes('/'));

      if (rootLine) {
        const parts = rootLine.split(/\s+/);
        const used = parts[2];
        const total = parts[1];
        const usage = parseFloat(parts[4].replace('%', ''));

        return {
          total,
          used,
          usage,
        };
      }
    } catch (error) {
      // Windows 系统使用不同的命令
      try {
        const output = execSync('wmic logicaldisk get size,freespace,caption', {
          encoding: 'utf-8',
        });
        const lines = output.split('\n');
        const cLine = lines.find(line => line.includes('C:'));

        if (cLine) {
          const parts = cLine.split(/\s+/);
          const freeSpace = parseInt(parts[1]) / (1024 * 1024 * 1024); // GB
          const totalSpace = parseInt(parts[2]) / (1024 * 1024 * 1024); // GB
          const usage = ((totalSpace - freeSpace) / totalSpace) * 100;

          return {
            total: `${totalSpace.toFixed(2)}GB`,
            used: `${(totalSpace - freeSpace).toFixed(2)}GB`,
            usage,
          };
        }
      } catch (winError) {
        // 如果都失败了，返回默认值
      }
    }

    return {
      total: 'Unknown',
      used: 'Unknown',
      usage: 0,
    };
  }

  /**
   * 获取网络状态
   */
  async getNetworkStatus() {
    try {
      const interfaces = os.networkInterfaces();
      const networkInfo = {};

      Object.keys(interfaces).forEach(name => {
        const iface = interfaces[name];
        iface.forEach(alias => {
          if (alias.family === 'IPv4' && !alias.internal) {
            networkInfo[name] = {
              address: alias.address,
              netmask: alias.netmask,
              mac: alias.mac,
            };
          }
        });
      });

      return networkInfo;
    } catch (error) {
      return {};
    }
  }

  /**
   * 获取进程状态
   */
  async getProcessStatus() {
    try {
      const output = execSync('ps aux | head -10', { encoding: 'utf-8' });
      const lines = output.split('\n').slice(1);
      const processes = [];

      lines.forEach(line => {
        if (line.trim()) {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 11) {
            processes.push({
              user: parts[0],
              pid: parts[1],
              cpu: parts[2],
              mem: parts[3],
              command: parts.slice(10).join(' '),
            });
          }
        }
      });

      return processes;
    } catch (error) {
      return [];
    }
  }

  /**
   * 检查系统阈值
   */
  checkSystemThresholds() {
    const { system } = this.config;

    if (this.results.system.cpu.usage > system.cpuThreshold) {
      this.results.alerts.push({
        type: 'warning',
        message: `CPU 使用率过高: ${this.results.system.cpu.usage.toFixed(2)}% > ${system.cpuThreshold}%`,
        timestamp: new Date().toISOString(),
      });
    }

    if (this.results.system.memory.usage > system.memoryThreshold) {
      this.results.alerts.push({
        type: 'warning',
        message: `内存使用率过高: ${this.results.system.memory.usage.toFixed(2)}% > ${system.memoryThreshold}%`,
        timestamp: new Date().toISOString(),
      });
    }

    if (this.results.system.disk.usage > system.diskThreshold) {
      this.results.alerts.push({
        type: 'critical',
        message: `磁盘使用率过高: ${this.results.system.disk.usage.toFixed(2)}% > ${system.diskThreshold}%`,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * 日志分析
   */
  async analyzeLogs() {
    console.log('📝 分析日志文件...');

    try {
      const logAnalysis = {
        totalFiles: 0,
        totalLines: 0,
        errors: 0,
        warnings: 0,
        errorDetails: [],
        warningDetails: [],
      };

      // 查找日志文件
      const logFiles = this.findLogFiles();
      logAnalysis.totalFiles = logFiles.length;

      // 分析每个日志文件
      for (const logFile of logFiles) {
        const analysis = await this.analyzeLogFile(logFile);
        logAnalysis.totalLines += analysis.totalLines;
        logAnalysis.errors += analysis.errors;
        logAnalysis.warnings += analysis.warnings;
        logAnalysis.errorDetails.push(...analysis.errorDetails);
        logAnalysis.warningDetails.push(...analysis.warningDetails);
      }

      this.results.logs = logAnalysis;

      console.log(`  📁 分析文件数: ${logAnalysis.totalFiles}`);
      console.log(`  📝 总行数: ${logAnalysis.totalLines}`);
      console.log(`  ❌ 错误数: ${logAnalysis.errors}`);
      console.log(`  ⚠️  警告数: ${logAnalysis.warnings}`);
    } catch (error) {
      console.log(`  ❌ 日志分析失败: ${error.message}`);
    }
  }

  /**
   * 查找日志文件
   */
  findLogFiles() {
    const logFiles = [];
    const { logPaths } = this.config.logs;

    logPaths.forEach(pattern => {
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
   * 分析单个日志文件
   */
  async analyzeLogFile(filePath) {
    const analysis = {
      file: filePath,
      totalLines: 0,
      errors: 0,
      warnings: 0,
      errorDetails: [],
      warningDetails: [],
    };

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      analysis.totalLines = lines.length;

      const { errorKeywords, warningKeywords } = this.config.logs;

      lines.forEach((line, index) => {
        // 检查错误
        if (errorKeywords.some(keyword => line.includes(keyword))) {
          analysis.errors++;
          analysis.errorDetails.push({
            line: index + 1,
            content: line.trim(),
            file: filePath,
          });
        }

        // 检查警告
        if (warningKeywords.some(keyword => line.includes(keyword))) {
          analysis.warnings++;
          analysis.warningDetails.push({
            line: index + 1,
            content: line.trim(),
            file: filePath,
          });
        }
      });
    } catch (error) {
      // 忽略无法读取的文件
    }

    return analysis;
  }

  /**
   * 性能监控
   */
  async monitorPerformance() {
    console.log('⚡ 监控应用性能...');

    try {
      // 检查 API 服务状态
      const apiStatus = await this.checkApiStatus();
      this.results.performance.api = apiStatus;

      // 检查数据库连接
      const dbStatus = await this.checkDatabaseStatus();
      this.results.performance.database = dbStatus;

      // 检查服务响应时间
      const responseTime = await this.checkResponseTime();
      this.results.performance.responseTime = responseTime;

      console.log(`  🌐 API 状态: ${apiStatus.status}`);
      console.log(`  🗄️  数据库状态: ${dbStatus.status}`);
      console.log(`  ⏱️  响应时间: ${responseTime.average}ms`);
    } catch (error) {
      console.log(`  ❌ 性能监控失败: ${error.message}`);
    }
  }

  /**
   * 检查 API 状态
   */
  async checkApiStatus() {
    try {
      const http = await import('http');
      const { baseUrl } = this.config.api || {
        baseUrl: 'http://localhost:8001',
      };

      return new Promise(resolve => {
        const req = http.get(baseUrl, res => {
          resolve({
            status: 'running',
            statusCode: res.statusCode,
            responseTime: Date.now() - startTime,
          });
        });

        const startTime = Date.now();

        req.on('error', () => {
          resolve({
            status: 'stopped',
            statusCode: null,
            responseTime: null,
          });
        });

        req.setTimeout(5000, () => {
          req.destroy();
          resolve({
            status: 'timeout',
            statusCode: null,
            responseTime: null,
          });
        });
      });
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
      };
    }
  }

  /**
   * 检查数据库状态
   */
  async checkDatabaseStatus() {
    try {
      // 尝试连接数据库
      execSync('npx prisma db pull --preview-feature', {
        encoding: 'utf-8',
        cwd: path.join(this.projectRoot, 'apps/api'),
        stdio: 'pipe',
      });

      return {
        status: 'connected',
        message: 'Database connection successful',
      };
    } catch (error) {
      return {
        status: 'disconnected',
        error: error.message,
      };
    }
  }

  /**
   * 检查响应时间
   */
  async checkResponseTime() {
    const responseTimes = [];
    const { baseUrl } = this.config.api || { baseUrl: 'http://localhost:8001' };

    for (let i = 0; i < 5; i++) {
      try {
        const http = await import('http');
        const startTime = Date.now();

        await new Promise((resolve, reject) => {
          const req = http.get(baseUrl, () => {
            responseTimes.push(Date.now() - startTime);
            resolve();
          });

          req.on('error', reject);
          req.setTimeout(5000, () => {
            req.destroy();
            reject(new Error('Timeout'));
          });
        });
      } catch (error) {
        // 忽略错误
      }
    }

    const average =
      responseTimes.length > 0
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
        : 0;

    return {
      average: Math.round(average),
      min: responseTimes.length > 0 ? Math.min(...responseTimes) : 0,
      max: responseTimes.length > 0 ? Math.max(...responseTimes) : 0,
      samples: responseTimes.length,
    };
  }

  /**
   * 生成报告
   */
  generateReport() {
    console.log('\n📊 监控和日志分析报告');
    console.log('='.repeat(50));

    // 显示系统状态
    console.log(`\n💻 系统状态:`);
    console.log(
      `  CPU 使用率: ${this.results.system.cpu?.usage?.toFixed(2) || 0}%`
    );
    console.log(
      `  内存使用率: ${this.results.system.memory?.usage?.toFixed(2) || 0}%`
    );
    console.log(
      `  磁盘使用率: ${this.results.system.disk?.usage?.toFixed(2) || 0}%`
    );

    // 显示日志分析
    console.log(`\n📝 日志分析:`);
    console.log(`  分析文件数: ${this.results.logs.totalFiles || 0}`);
    console.log(`  总行数: ${this.results.logs.totalLines || 0}`);
    console.log(`  错误数: ${this.results.logs.errors || 0}`);
    console.log(`  警告数: ${this.results.logs.warnings || 0}`);

    // 显示性能状态
    console.log(`\n⚡ 性能状态:`);
    console.log(
      `  API 状态: ${this.results.performance.api?.status || 'Unknown'}`
    );
    console.log(
      `  数据库状态: ${this.results.performance.database?.status || 'Unknown'}`
    );
    console.log(
      `  平均响应时间: ${this.results.performance.responseTime?.average || 0}ms`
    );

    // 显示告警
    if (this.results.alerts.length > 0) {
      console.log(`\n🚨 告警信息:`);
      this.results.alerts.forEach(alert => {
        const icon = alert.type === 'critical' ? '🔴' : '🟡';
        console.log(`  ${icon} ${alert.message}`);
      });
    }

    // 生成建议
    this.generateRecommendations();

    // 保存报告
    this.saveReportToFile();
  }

  /**
   * 生成建议
   */
  generateRecommendations() {
    console.log(`\n💡 优化建议:`);

    if (this.results.system.cpu?.usage > 80) {
      console.log(`  1. 💻 CPU 使用率过高，考虑优化代码或增加服务器资源`);
    }

    if (this.results.system.memory?.usage > 85) {
      console.log(`  2. 🧠 内存使用率过高，检查内存泄漏或增加内存`);
    }

    if (this.results.logs.errors > 0) {
      console.log(
        `  3. ❌ 发现 ${this.results.logs.errors} 个错误，请检查日志详情`
      );
    }

    if (this.results.performance.responseTime?.average > 1000) {
      console.log(`  4. ⏱️  响应时间过长，优化 API 性能`);
    }

    console.log(`\n🛠️  监控命令:`);
    console.log(`  pnpm run check:all        # 运行所有检查`);
    console.log(`  pnpm run check:quality    # 代码质量检查`);
    console.log(`  pnpm run check:security   # 安全审计`);
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
      'monitoring'
    );
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 保存 JSON 报告
    const jsonPath = path.join(outputDir, 'monitoring-log.json');
    fs.writeFileSync(jsonPath, JSON.stringify(this.results, null, 2), 'utf-8');

    // 生成 Markdown 报告
    const markdownReport = this.generateMarkdownReport();
    const mdPath = path.join(outputDir, 'monitoring-log.md');
    fs.writeFileSync(mdPath, markdownReport, 'utf-8');

    console.log(`\n📄 监控报告已保存:`);
    console.log(`  JSON: ${jsonPath}`);
    console.log(`  Markdown: ${mdPath}`);
  }

  /**
   * 生成 Markdown 报告
   */
  generateMarkdownReport() {
    const timestamp = new Date().toISOString();

    let report = `# 监控和日志分析报告\n\n`;
    report += `**生成时间**: ${timestamp}\n\n`;

    // 系统状态
    report += `## 💻 系统状态\n\n`;
    report += `| 指标 | 数值 |\n`;
    report += `|------|------|\n`;
    report += `| CPU 使用率 | ${this.results.system.cpu?.usage?.toFixed(2) || 0}% |\n`;
    report += `| 内存使用率 | ${this.results.system.memory?.usage?.toFixed(2) || 0}% |\n`;
    report += `| 磁盘使用率 | ${this.results.system.disk?.usage?.toFixed(2) || 0}% |\n`;
    report += `| CPU 核心数 | ${this.results.system.cpu?.cores || 0} |\n\n`;

    // 日志分析
    report += `## 📝 日志分析\n\n`;
    report += `| 指标 | 数值 |\n`;
    report += `|------|------|\n`;
    report += `| 分析文件数 | ${this.results.logs.totalFiles || 0} |\n`;
    report += `| 总行数 | ${this.results.logs.totalLines || 0} |\n`;
    report += `| 错误数 | ${this.results.logs.errors || 0} |\n`;
    report += `| 警告数 | ${this.results.logs.warnings || 0} |\n\n`;

    // 性能状态
    report += `## ⚡ 性能状态\n\n`;
    report += `| 指标 | 数值 |\n`;
    report += `|------|------|\n`;
    report += `| API 状态 | ${this.results.performance.api?.status || 'Unknown'} |\n`;
    report += `| 数据库状态 | ${this.results.performance.database?.status || 'Unknown'} |\n`;
    report += `| 平均响应时间 | ${this.results.performance.responseTime?.average || 0}ms |\n`;
    report += `| 最小响应时间 | ${this.results.performance.responseTime?.min || 0}ms |\n`;
    report += `| 最大响应时间 | ${this.results.performance.responseTime?.max || 0}ms |\n\n`;

    // 告警信息
    if (this.results.alerts.length > 0) {
      report += `## 🚨 告警信息\n\n`;
      report += `| 类型 | 消息 | 时间 |\n`;
      report += `|------|------|------|\n`;
      this.results.alerts.forEach(alert => {
        const icon = alert.type === 'critical' ? '🔴' : '🟡';
        report += `| ${icon} ${alert.type} | ${alert.message} | ${new Date(alert.timestamp).toLocaleString()} |\n`;
      });
      report += '\n';
    }

    // 优化建议
    report += `## 💡 优化建议\n\n`;
    report += `\`\`\`bash\n`;
    report += `# 运行所有检查\n`;
    report += `pnpm run check:all\n\n`;
    report += `# 代码质量检查\n`;
    report += `pnpm run check:quality\n\n`;
    report += `# 安全审计\n`;
    report += `pnpm run check:security\n`;
    report += `\`\`\`\n\n`;

    report += `---\n\n`;
    report += `*此报告由监控和日志分析脚本自动生成*\n`;

    return report;
  }
}

// 执行监控
const monitor = new MonitoringLogger();
monitor.monitor().catch(console.error);

export { MonitoringLogger };
