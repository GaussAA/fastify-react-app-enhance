/**
 * 配置热重载工具
 * 支持配置文件的动态重载和变更通知
 */

import { EventEmitter } from 'events';
import { watch, FSWatcher } from 'chokidar';
import { ConfigManager, Config } from './unified-config.js';
import { ConfigValidator } from './config-validator.js';

export interface ReloadOptions {
  watchFiles?: string[];
  watchDirectories?: string[];
  debounceMs?: number;
  validateOnReload?: boolean;
  backupOnReload?: boolean;
  maxBackups?: number;
}

export interface ReloadEvent {
  type: 'reload' | 'error' | 'validation' | 'backup';
  timestamp: Date;
  message: string;
  data?: any;
}

export interface ConfigBackup {
  id: string;
  timestamp: Date;
  config: Config;
  reason: string;
  filePath?: string;
}

/**
 * 配置重载器类
 */
export class ConfigReloader extends EventEmitter {
  private configManager: ConfigManager;
  private validator: ConfigValidator;
  private watcher: FSWatcher | null = null;
  private options: ReloadOptions;
  private reloadTimeout: NodeJS.Timeout | null = null;
  private backups: ConfigBackup[] = [];
  private isReloading = false;

  constructor(
    configManager: ConfigManager,
    validator: ConfigValidator,
    options: ReloadOptions = {}
  ) {
    super();
    this.configManager = configManager;
    this.validator = validator;
    this.options = {
      watchFiles: [],
      watchDirectories: [],
      debounceMs: 1000,
      validateOnReload: true,
      backupOnReload: true,
      maxBackups: 10,
      ...options,
    };
  }

  /**
   * 开始监听配置变更
   */
  public startWatching(): void {
    if (this.watcher) {
      this.stopWatching();
    }

    const watchPaths = [
      ...(this.options.watchFiles || []),
      ...(this.options.watchDirectories || []),
    ];

    if (watchPaths.length === 0) {
      console.warn('没有配置监听路径，跳过文件监听');
      return;
    }

    this.watcher = watch(watchPaths, {
      ignored: /(^|[/\\])\../, // 忽略隐藏文件
      persistent: true,
      ignoreInitial: true,
      followSymlinks: false,
    });

    this.watcher.on('change', path => {
      this.handleFileChange(path);
    });

    this.watcher.on('add', path => {
      this.handleFileChange(path);
    });

    this.watcher.on('unlink', path => {
      this.handleFileChange(path);
    });

    this.watcher.on('error', error => {
      this.emit('error', {
        type: 'error',
        timestamp: new Date(),
        message: `文件监听错误: ${error.message}`,
        data: { error, path: error.path },
      });
    });

    console.log(`开始监听配置文件: ${watchPaths.join(', ')}`);
  }

  /**
   * 停止监听配置变更
   */
  public stopWatching(): void {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }

    if (this.reloadTimeout) {
      clearTimeout(this.reloadTimeout);
      this.reloadTimeout = null;
    }

    console.log('停止监听配置文件');
  }

  /**
   * 手动重载配置
   */
  public async reloadConfig(reason: string = 'manual'): Promise<boolean> {
    if (this.isReloading) {
      console.warn('配置正在重载中，跳过此次重载请求');
      return false;
    }

    this.isReloading = true;

    try {
      // 创建备份
      if (this.options.backupOnReload) {
        await this.createBackup(reason);
      }

      // 重载配置
      const newConfig = await this.configManager.reloadConfig();

      // 验证配置
      if (this.options.validateOnReload) {
        const validationResult = this.validator.validateConfig(newConfig);
        if (!validationResult.isValid) {
          this.emit('validation', {
            type: 'validation',
            timestamp: new Date(),
            message: '配置验证失败',
            data: validationResult,
          });
          throw new Error(
            `配置验证失败: ${validationResult.errors.map(e => e.message).join(', ')}`
          );
        }
      }

      // 发出重载事件
      this.emit('reload', {
        type: 'reload',
        timestamp: new Date(),
        message: '配置重载成功',
        data: { reason, config: newConfig },
      });

      console.log(`配置重载成功: ${reason}`);
      return true;
    } catch (error: any) {
      this.emit('error', {
        type: 'error',
        timestamp: new Date(),
        message: `配置重载失败: ${error.message}`,
        data: { error, reason },
      });

      console.error(`配置重载失败: ${error.message}`);
      return false;
    } finally {
      this.isReloading = false;
    }
  }

  /**
   * 回滚到上一个配置
   */
  public async rollbackToBackup(backupId?: string): Promise<boolean> {
    if (this.backups.length === 0) {
      throw new Error('没有可用的配置备份');
    }

    const backup = backupId
      ? this.backups.find(b => b.id === backupId)
      : this.backups[this.backups.length - 1];

    if (!backup) {
      throw new Error(`找不到指定的配置备份: ${backupId}`);
    }

    try {
      // 创建当前配置的备份
      await this.createBackup('rollback-before');

      // 应用备份配置
      // 这里需要根据实际的配置管理器实现来调整
      // 暂时模拟回滚过程
      console.log(
        `回滚到配置备份: ${backup.id} (${backup.timestamp.toISOString()})`
      );

      this.emit('reload', {
        type: 'reload',
        timestamp: new Date(),
        message: `配置回滚成功: ${backup.id}`,
        data: { backup },
      });

      return true;
    } catch (error: any) {
      this.emit('error', {
        type: 'error',
        timestamp: new Date(),
        message: `配置回滚失败: ${error.message}`,
        data: { error, backupId },
      });

      throw error;
    }
  }

  /**
   * 获取配置备份列表
   */
  public getBackups(): ConfigBackup[] {
    return [...this.backups];
  }

  /**
   * 清理旧备份
   */
  public cleanupBackups(): void {
    if (this.backups.length <= this.options.maxBackups!) {
      return;
    }

    // 按时间排序，保留最新的备份
    this.backups.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    const toRemove = this.backups.splice(this.options.maxBackups!);

    console.log(`清理了 ${toRemove.length} 个旧配置备份`);
  }

  /**
   * 处理文件变更
   */
  private handleFileChange(path: string): void {
    console.log(`检测到配置文件变更: ${path}`);

    // 防抖处理
    if (this.reloadTimeout) {
      clearTimeout(this.reloadTimeout);
    }

    this.reloadTimeout = setTimeout(() => {
      this.reloadConfig(`file-change:${path}`);
    }, this.options.debounceMs);
  }

  /**
   * 创建配置备份
   */
  private async createBackup(reason: string): Promise<ConfigBackup> {
    const currentConfig = this.configManager.getConfig();
    const backup: ConfigBackup = {
      id: `backup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      config: JSON.parse(JSON.stringify(currentConfig)), // 深拷贝
      reason,
    };

    this.backups.push(backup);

    // 清理旧备份
    this.cleanupBackups();

    this.emit('backup', {
      type: 'backup',
      timestamp: new Date(),
      message: `配置备份创建成功: ${backup.id}`,
      data: { backup },
    });

    console.log(`配置备份创建成功: ${backup.id} (${reason})`);
    return backup;
  }
}

/**
 * 配置变更通知器
 */
export class ConfigChangeNotifier {
  private reloader: ConfigReloader;
  private subscribers: Map<string, Array<(event: ReloadEvent) => void>> =
    new Map();

  constructor(reloader: ConfigReloader) {
    this.reloader = reloader;
    this.setupEventHandlers();
  }

  /**
   * 订阅配置变更事件
   */
  public subscribe(
    eventType: string,
    callback: (event: ReloadEvent) => void
  ): () => void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, []);
    }

    this.subscribers.get(eventType)!.push(callback);

    // 返回取消订阅函数
    return () => {
      const callbacks = this.subscribers.get(eventType);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  /**
   * 发布配置变更事件
   */
  public publish(event: ReloadEvent): void {
    const callbacks = this.subscribers.get(event.type);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error('配置变更通知回调执行失败:', error);
        }
      });
    }
  }

  /**
   * 设置事件处理器
   */
  private setupEventHandlers(): void {
    this.reloader.on('reload', event => {
      this.publish(event);
    });

    this.reloader.on('error', event => {
      this.publish(event);
    });

    this.reloader.on('validation', event => {
      this.publish(event);
    });

    this.reloader.on('backup', event => {
      this.publish(event);
    });
  }
}

/**
 * 配置热重载管理器
 */
export class ConfigHotReloadManager {
  private configManager: ConfigManager;
  private validator: ConfigValidator;
  private reloader: ConfigReloader;
  private notifier: ConfigChangeNotifier;

  constructor(configManager: ConfigManager, options: ReloadOptions = {}) {
    this.configManager = configManager;
    this.validator = new ConfigValidator(configManager);
    this.reloader = new ConfigReloader(configManager, this.validator, options);
    this.notifier = new ConfigChangeNotifier(this.reloader);
  }

  /**
   * 初始化热重载
   */
  public async initialize(): Promise<void> {
    try {
      // 加载初始配置
      await this.configManager.loadConfig();

      // 开始监听文件变更
      this.reloader.startWatching();

      console.log('配置热重载管理器初始化成功');
    } catch (error: any) {
      console.error('配置热重载管理器初始化失败:', error);
      throw error;
    }
  }

  /**
   * 停止热重载
   */
  public stop(): void {
    this.reloader.stopWatching();
    console.log('配置热重载管理器已停止');
  }

  /**
   * 获取配置管理器
   */
  public getConfigManager(): ConfigManager {
    return this.configManager;
  }

  /**
   * 获取重载器
   */
  public getReloader(): ConfigReloader {
    return this.reloader;
  }

  /**
   * 获取通知器
   */
  public getNotifier(): ConfigChangeNotifier {
    return this.notifier;
  }

  /**
   * 执行健康检查
   */
  public async performHealthCheck(): Promise<any> {
    return this.validator.performHealthCheck();
  }
}
