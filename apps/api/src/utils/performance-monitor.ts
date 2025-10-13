/**
 * 性能监控工具
 * 监控和优化系统性能
 */

import { performance } from 'perf_hooks';

export interface PerformanceMetrics {
  operation: string;
  duration: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface PerformanceConfig {
  enableMonitoring: boolean;
  slowQueryThreshold: number; // 慢查询阈值（毫秒）
  maxMetricsHistory: number; // 最大历史记录数
  enableAlerts: boolean;
  alertThreshold: number; // 告警阈值（毫秒）
}

export interface QueryPerformanceMetrics extends PerformanceMetrics {
  queryType: 'select' | 'insert' | 'update' | 'delete' | 'count';
  recordCount?: number;
  cacheHit?: boolean;
}

export interface ServicePerformanceMetrics extends PerformanceMetrics {
  serviceName: string;
  methodName: string;
  success: boolean;
  errorMessage?: string;
}

/**
 * 性能监控器类
 */
export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private config: PerformanceConfig;
  private alerts: Array<(metrics: PerformanceMetrics) => void> = [];

  constructor(
    config: PerformanceConfig = {
      enableMonitoring: true,
      slowQueryThreshold: 1000,
      maxMetricsHistory: 1000,
      enableAlerts: true,
      alertThreshold: 2000,
    }
  ) {
    this.config = config;
  }

  /**
   * 开始性能监控
   */
  startTimer(
    operation: string,
    metadata?: Record<string, any>
  ): () => PerformanceMetrics {
    if (!this.config.enableMonitoring) {
      return () => ({
        operation,
        duration: 0,
        timestamp: new Date(),
        metadata,
      });
    }

    const startTime = performance.now();
    const timestamp = new Date();

    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;

      const metrics: PerformanceMetrics = {
        operation,
        duration,
        timestamp,
        metadata,
      };

      this.recordMetrics(metrics);
      return metrics;
    };
  }

  /**
   * 记录性能指标
   */
  recordMetrics(metrics: PerformanceMetrics): void {
    if (!this.config.enableMonitoring) return;

    this.metrics.push(metrics);

    // 限制历史记录数量
    if (this.metrics.length > this.config.maxMetricsHistory) {
      this.metrics = this.metrics.slice(-this.config.maxMetricsHistory);
    }

    // 检查是否需要告警
    if (
      this.config.enableAlerts &&
      metrics.duration > this.config.alertThreshold
    ) {
      this.triggerAlert(metrics);
    }
  }

  /**
   * 监控数据库查询性能
   */
  async monitorQuery<T>(
    operation: string,
    queryType: 'select' | 'insert' | 'update' | 'delete' | 'count',
    queryFn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const endTimer = this.startTimer(operation, {
      ...metadata,
      queryType,
    });

    try {
      const result = await queryFn();
      const metrics = endTimer();

      // 记录查询性能指标
      const queryMetrics: QueryPerformanceMetrics = {
        ...metrics,
        queryType,
        recordCount: Array.isArray(result) ? result.length : 1,
        cacheHit: false,
      };

      this.recordMetrics(queryMetrics);
      return result;
    } catch (error) {
      const metrics = endTimer();
      const queryMetrics: QueryPerformanceMetrics = {
        ...metrics,
        queryType,
        recordCount: 0,
        cacheHit: false,
      };

      this.recordMetrics(queryMetrics);
      throw error;
    }
  }

  /**
   * 监控服务方法性能
   */
  async monitorService<T>(
    serviceName: string,
    methodName: string,
    serviceFn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const operation = `${serviceName}.${methodName}`;
    const endTimer = this.startTimer(operation, {
      ...metadata,
      serviceName,
      methodName,
    });

    try {
      const result = await serviceFn();
      const metrics = endTimer();

      // 记录服务性能指标
      const serviceMetrics: ServicePerformanceMetrics = {
        ...metrics,
        serviceName,
        methodName,
        success: true,
      };

      this.recordMetrics(serviceMetrics);
      return result;
    } catch (error) {
      const metrics = endTimer();
      const serviceMetrics: ServicePerformanceMetrics = {
        ...metrics,
        serviceName,
        methodName,
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };

      this.recordMetrics(serviceMetrics);
      throw error;
    }
  }

  /**
   * 获取性能统计信息
   */
  getStats(): {
    totalOperations: number;
    averageDuration: number;
    slowOperations: number;
    fastestOperation: PerformanceMetrics | null;
    slowestOperation: PerformanceMetrics | null;
    operationsByType: Record<string, number>;
    recentOperations: PerformanceMetrics[];
  } {
    if (this.metrics.length === 0) {
      return {
        totalOperations: 0,
        averageDuration: 0,
        slowOperations: 0,
        fastestOperation: null,
        slowestOperation: null,
        operationsByType: {},
        recentOperations: [],
      };
    }

    const totalDuration = this.metrics.reduce(
      (sum, metric) => sum + metric.duration,
      0
    );
    const averageDuration = totalDuration / this.metrics.length;
    const slowOperations = this.metrics.filter(
      m => m.duration > this.config.slowQueryThreshold
    ).length;

    const fastestOperation = this.metrics.reduce((fastest, current) =>
      current.duration < fastest.duration ? current : fastest
    );

    const slowestOperation = this.metrics.reduce((slowest, current) =>
      current.duration > slowest.duration ? current : slowest
    );

    const operationsByType: Record<string, number> = {};
    this.metrics.forEach(metric => {
      const type =
        metric.metadata?.queryType || metric.metadata?.serviceName || 'unknown';
      operationsByType[type] = (operationsByType[type] || 0) + 1;
    });

    const recentOperations = this.metrics.slice(-10);

    return {
      totalOperations: this.metrics.length,
      averageDuration,
      slowOperations,
      fastestOperation,
      slowestOperation,
      operationsByType,
      recentOperations,
    };
  }

  /**
   * 获取慢查询报告
   */
  getSlowQueriesReport(): {
    slowQueries: QueryPerformanceMetrics[];
    averageSlowQueryDuration: number;
    slowestQuery: QueryPerformanceMetrics | null;
  } {
    const slowQueries = this.metrics
      .filter(
        (m): m is QueryPerformanceMetrics =>
          m.duration > this.config.slowQueryThreshold && 'queryType' in m
      )
      .sort((a, b) => b.duration - a.duration);

    const averageSlowQueryDuration =
      slowQueries.length > 0
        ? slowQueries.reduce((sum, query) => sum + query.duration, 0) /
          slowQueries.length
        : 0;

    const slowestQuery = slowQueries.length > 0 ? slowQueries[0] : null;

    return {
      slowQueries,
      averageSlowQueryDuration,
      slowestQuery,
    };
  }

  /**
   * 获取服务性能报告
   */
  getServicePerformanceReport(): {
    serviceStats: Record<
      string,
      {
        totalCalls: number;
        averageDuration: number;
        successRate: number;
        errorRate: number;
      }
    >;
    slowestServices: ServicePerformanceMetrics[];
  } {
    const serviceMetrics = this.metrics.filter(
      (m): m is ServicePerformanceMetrics =>
        'serviceName' in m && 'methodName' in m
    );

    const serviceStats: Record<string, any> = {};
    const slowestServices: ServicePerformanceMetrics[] = [];

    serviceMetrics.forEach(metric => {
      const key = `${metric.serviceName}.${metric.methodName}`;

      if (!serviceStats[key]) {
        serviceStats[key] = {
          totalCalls: 0,
          totalDuration: 0,
          successCount: 0,
          errorCount: 0,
        };
      }

      const stats = serviceStats[key];
      stats.totalCalls++;
      stats.totalDuration += metric.duration;

      if (metric.success) {
        stats.successCount++;
      } else {
        stats.errorCount++;
      }

      // 记录慢服务
      if (metric.duration > this.config.slowQueryThreshold) {
        slowestServices.push(metric);
      }
    });

    // 计算统计信息
    Object.keys(serviceStats).forEach(key => {
      const stats = serviceStats[key];
      stats.averageDuration = stats.totalDuration / stats.totalCalls;
      stats.successRate = (stats.successCount / stats.totalCalls) * 100;
      stats.errorRate = (stats.errorCount / stats.totalCalls) * 100;

      // 删除临时字段
      delete stats.totalDuration;
      delete stats.successCount;
      delete stats.errorCount;
    });

    // 按持续时间排序慢服务
    slowestServices.sort((a, b) => b.duration - a.duration);

    return {
      serviceStats,
      slowestServices,
    };
  }

  /**
   * 添加告警监听器
   */
  addAlertListener(listener: (metrics: PerformanceMetrics) => void): void {
    this.alerts.push(listener);
  }

  /**
   * 触发告警
   */
  private triggerAlert(metrics: PerformanceMetrics): void {
    this.alerts.forEach(listener => {
      try {
        listener(metrics);
      } catch (error) {
        console.error('Error in alert listener:', error);
      }
    });
  }

  /**
   * 清除历史记录
   */
  clearHistory(): void {
    this.metrics = [];
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<PerformanceConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * 导出性能数据
   */
  exportData(): {
    config: PerformanceConfig;
    metrics: PerformanceMetrics[];
    stats: any;
  } {
    return {
      config: this.config,
      metrics: this.metrics,
      stats: this.getStats(),
    };
  }
}

// 全局性能监控器实例
let globalPerformanceMonitor: PerformanceMonitor | null = null;

/**
 * 获取全局性能监控器
 */
export function getPerformanceMonitor(): PerformanceMonitor {
  if (!globalPerformanceMonitor) {
    globalPerformanceMonitor = new PerformanceMonitor();
  }
  return globalPerformanceMonitor;
}

/**
 * 性能监控装饰器
 */
export function monitorPerformance(
  operation: string,
  metadata?: Record<string, any>
) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value;
    const monitor = getPerformanceMonitor();

    descriptor.value = async function (...args: any[]) {
      const endTimer = monitor.startTimer(
        `${target.constructor.name}.${propertyName}`,
        {
          ...metadata,
          operation,
        }
      );

      try {
        const result = await method.apply(this, args);
        endTimer();
        return result;
      } catch (error) {
        endTimer();
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * 查询性能监控装饰器
 */
export function monitorQuery(
  queryType: 'select' | 'insert' | 'update' | 'delete' | 'count'
) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value;
    const monitor = getPerformanceMonitor();

    descriptor.value = async function (...args: any[]) {
      return monitor.monitorQuery(
        `${target.constructor.name}.${propertyName}`,
        queryType,
        () => method.apply(this, args)
      );
    };

    return descriptor;
  };
}
