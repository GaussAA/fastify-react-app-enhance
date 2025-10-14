/**
 * 基础服务类
 * 提供通用的服务层功能，避免重复代码
 */

import { PrismaClient } from '@prisma/client';
import { EventEmitter } from 'events';
import {
  paginatedQuery,
  findById,
  createRecord,
  updateRecord,
  softDeleteRecord,
  hardDeleteRecord,
  recordExists,
  BaseQueryOptions,
  PaginationResult,
  BatchOperations,
  TransactionOperations,
} from '../utils/database.js';
import { validate } from '../utils/validation.js';

export interface ServiceOptions {
  enableEvents?: boolean;
  enableValidation?: boolean;
  enableAudit?: boolean;
  enableCache?: boolean;
  cacheTTL?: number;
}

export interface CreateOptions {
  validate?: boolean;
  audit?: boolean;
  transaction?: boolean;
}

export interface UpdateOptions extends CreateOptions {
  partial?: boolean;
}

export interface DeleteOptions {
  soft?: boolean;
  audit?: boolean;
  transaction?: boolean;
}

export interface QueryOptions extends BaseQueryOptions {
  include?: any;
  select?: any;
  orderBy?: any;
}

/**
 * 基础服务抽象类
 */
export abstract class BaseService<T = any> extends EventEmitter {
  protected prisma: PrismaClient;
  protected model: any;
  protected options: ServiceOptions;
  protected batchOps: BatchOperations;
  protected transactionOps: TransactionOperations;
  protected cache: Map<string, { data: any; timestamp: number }> = new Map();

  constructor(prisma: PrismaClient, model: any, options: ServiceOptions = {}) {
    super();
    this.prisma = prisma;
    this.model = model;
    this.options = {
      enableEvents: true,
      enableValidation: true,
      enableAudit: true,
      enableCache: false,
      cacheTTL: 300000, // 5 minutes
      ...options,
    };
    this.batchOps = new BatchOperations(prisma);
    this.transactionOps = new TransactionOperations(prisma);
  }

  /**
   * 获取所有记录（分页）
   */
  async findAll(options: QueryOptions = {}): Promise<{
    data: T[];
    pagination: PaginationResult;
  }> {
    const cacheKey = this.getCacheKey('findAll', options);

    // 检查缓存
    if (this.options.enableCache) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const result = await paginatedQuery(
      this.prisma,
      this.model,
      options,
      options.include
    );

    // 缓存结果
    if (this.options.enableCache) {
      this.setCache(cacheKey, result);
    }

    // 发出事件
    if (this.options.enableEvents) {
      this.emit('findAll', { options, result });
    }

    return result as { data: T[]; pagination: PaginationResult };
  }

  /**
   * 根据ID获取记录
   */
  async findById(
    id: number,
    options: { include?: any } = {}
  ): Promise<T | null> {
    const cacheKey = this.getCacheKey('findById', { id, ...options });

    // 检查缓存
    if (this.options.enableCache) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const result = await findById(this.prisma, this.model, id, options.include);

    // 缓存结果
    if (this.options.enableCache && result) {
      this.setCache(cacheKey, result);
    }

    // 发出事件
    if (this.options.enableEvents) {
      this.emit('findById', { id, options, result });
    }

    return result as T | null;
  }

  /**
   * 创建记录
   */
  async create(data: Partial<T>, options: CreateOptions = {}): Promise<T> {
    const {
      validate: shouldValidate = this.options.enableValidation,
      audit = this.options.enableAudit,
    } = options;

    // 验证数据
    if (shouldValidate) {
      this.validateCreateData(data);
    }

    // 执行创建
    const result = await createRecord(this.prisma, this.model, data) as any;

    // 审计日志
    if (audit) {
      await this.auditLog('create', result.id, data, result as T);
    }

    // 清除相关缓存
    this.clearCache();

    // 发出事件
    if (this.options.enableEvents) {
      this.emit('create', { data, result });
    }

    return result as T;
  }

  /**
   * 更新记录
   */
  async update(
    id: number,
    data: Partial<T>,
    options: UpdateOptions = {}
  ): Promise<T | null> {
    const {
      validate: shouldValidate = this.options.enableValidation,
      audit = this.options.enableAudit,
    } = options;

    // 检查记录是否存在
    const existing = await this.findById(id);
    if (!existing) {
      return null;
    }

    // 验证数据
    if (shouldValidate) {
      this.validateUpdateData(data);
    }

    // 执行更新
    const result = await updateRecord(this.prisma, this.model, id, data);

    // 审计日志
    if (audit) {
      await this.auditLog('update', id, data, result);
    }

    // 清除相关缓存
    this.clearCache();

    // 发出事件
    if (this.options.enableEvents) {
      this.emit('update', { id, data, result });
    }

    return result as T | null;
  }

  /**
   * 删除记录
   */
  async delete(id: number, options: DeleteOptions = {}): Promise<boolean> {
    const { soft = true, audit = this.options.enableAudit } = options;

    // 检查记录是否存在
    const existing = await this.findById(id);
    if (!existing) {
      return false;
    }

    // 执行删除
    const result = soft
      ? await softDeleteRecord(this.prisma, this.model, id)
      : await hardDeleteRecord(this.prisma, this.model, id);

    // 审计日志
    if (audit) {
      await this.auditLog('delete', id, existing, null as T);
    }

    // 清除相关缓存
    this.clearCache();

    // 发出事件
    if (this.options.enableEvents) {
      this.emit('delete', { id, soft, result });
    }

    return !!result;
  }

  /**
   * 批量创建
   */
  async createMany(
    dataArray: Partial<T>[],
    options: CreateOptions = {}
  ): Promise<{ count: number; data?: T[] }> {
    const {
      validate: shouldValidate = this.options.enableValidation,
      audit = this.options.enableAudit,
    } = options;

    // 验证数据
    if (shouldValidate) {
      dataArray.forEach(data => this.validateCreateData(data));
    }

    // 执行批量创建
    const result = await this.batchOps.createMany(this.model, dataArray);

    // 审计日志
    if (audit) {
      await this.auditLog('createMany', null, dataArray, result);
    }

    // 清除相关缓存
    this.clearCache();

    // 发出事件
    if (this.options.enableEvents) {
      this.emit('createMany', { dataArray, result });
    }

    return result as { count: number; data?: T[] };
  }

  /**
   * 批量更新
   */
  async updateMany(
    where: any,
    data: Partial<T>,
    options: UpdateOptions = {}
  ): Promise<{ count: number }> {
    const {
      validate: shouldValidate = this.options.enableValidation,
      audit = this.options.enableAudit,
    } = options;

    // 验证数据
    if (shouldValidate) {
      this.validateUpdateData(data);
    }

    // 执行批量更新
    const result = await this.batchOps.updateMany(this.model, where, data);

    // 审计日志
    if (audit) {
      await this.auditLog('updateMany', null, { where, data }, result);
    }

    // 清除相关缓存
    this.clearCache();

    // 发出事件
    if (this.options.enableEvents) {
      this.emit('updateMany', { where, data, result });
    }

    return result;
  }

  /**
   * 批量删除
   */
  async deleteMany(
    where: any,
    options: DeleteOptions = {}
  ): Promise<{ count: number }> {
    const { audit = this.options.enableAudit } = options;

    // 执行批量删除
    const result = await this.batchOps.deleteMany(this.model, where);

    // 审计日志
    if (audit) {
      await this.auditLog('deleteMany', null, { where }, result);
    }

    // 清除相关缓存
    this.clearCache();

    // 发出事件
    if (this.options.enableEvents) {
      this.emit('deleteMany', { where, result });
    }

    return result;
  }

  /**
   * 检查记录是否存在
   */
  async exists(id: number): Promise<boolean> {
    return await recordExists(this.prisma, this.model, id);
  }

  /**
   * 计数
   */
  async count(where: any = {}): Promise<number> {
    return await this.model.count({ where });
  }

  /**
   * 搜索
   */
  async search(
    query: string,
    fields: string[],
    options: QueryOptions = {}
  ): Promise<{
    data: T[];
    pagination: PaginationResult;
  }> {
    const searchOptions = {
      ...options,
      search: query,
      searchFields: fields,
    };

    return this.findAll(searchOptions);
  }

  /**
   * 获取缓存键
   */
  protected getCacheKey(method: string, params: any): string {
    return `${this.model.name}_${method}_${JSON.stringify(params)}`;
  }

  /**
   * 从缓存获取数据
   */
  protected getFromCache(key: string): any {
    if (!this.options.enableCache) return null;

    const cached = this.cache.get(key);
    if (!cached) return null;

    // 检查是否过期
    if (Date.now() - cached.timestamp > this.options.cacheTTL!) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * 设置缓存
   */
  protected setCache(key: string, data: any): void {
    if (!this.options.enableCache) return;

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * 清除缓存
   */
  protected clearCache(): void {
    this.cache.clear();
  }

  /**
   * 验证创建数据
   */
  protected validateCreateData(_data: Partial<T>): void {
    // 子类应该重写此方法
    // 这里提供默认的验证逻辑
  }

  /**
   * 验证更新数据
   */
  protected validateUpdateData(_data: Partial<T>): void {
    // 子类应该重写此方法
    // 这里提供默认的验证逻辑
  }

  /**
   * 审计日志
   */
  protected async auditLog(
    action: string,
    recordId: number | null,
    _beforeData: any,
    _afterData: any
  ): Promise<void> {
    // 这里应该实现审计日志逻辑
    // 可以写入数据库或发送到外部审计系统
    console.log(`Audit: ${action} on ${this.model.name}`, {
      recordId,
      beforeData: _beforeData,
      afterData: _afterData,
      timestamp: new Date(),
    });
  }

  /**
   * 获取服务统计信息
   */
  async getStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    cacheSize: number;
  }> {
    const [total, active, inactive] = await Promise.all([
      this.count(),
      this.count({ isActive: true }),
      this.count({ isActive: false }),
    ]);

    return {
      total,
      active,
      inactive,
      cacheSize: this.cache.size,
    };
  }
}

/**
 * CRUD服务基类
 */
export abstract class CrudService<T = any> extends BaseService<T> {
  protected validationRules: Record<string, any[]> = {};

  constructor(
    prisma: PrismaClient,
    model: any,
    validationRules: Record<string, any[]> = {},
    options: ServiceOptions = {}
  ) {
    super(prisma, model, options);
    this.validationRules = validationRules;
  }

  /**
   * 验证创建数据
   */
  protected validateCreateData(data: Partial<T>): void {
    if (Object.keys(this.validationRules).length === 0) return;

    const validation = validate(data, this.validationRules);
    if (!validation.isValid) {
      throw new Error(`验证失败: ${validation.errors.join(', ')}`);
    }
  }

  /**
   * 验证更新数据
   */
  protected validateUpdateData(data: Partial<T>): void {
    if (Object.keys(this.validationRules).length === 0) return;

    // 更新时移除required规则
    const updateRules = Object.fromEntries(
      Object.entries(this.validationRules).map(([field, rules]) => [
        field,
        rules.filter(rule => rule.type !== 'required'),
      ])
    );

    const validation = validate(data, updateRules);
    if (!validation.isValid) {
      throw new Error(`验证失败: ${validation.errors.join(', ')}`);
    }
  }
}

/**
 * 服务工厂类
 */
export class ServiceFactory {
  private static services: Map<string, BaseService> = new Map();

  /**
   * 创建服务实例
   */
  static createService<T extends BaseService>(
    ServiceClass: new (...args: any[]) => T,
    ...args: any[]
  ): T {
    const key = `${ServiceClass.name}_${JSON.stringify(args)}`;

    if (!this.services.has(key)) {
      const service = new ServiceClass(...args);
      this.services.set(key, service);
    }

    return this.services.get(key) as T;
  }

  /**
   * 获取服务实例
   */
  static getService<T extends BaseService>(
    ServiceClass: new (...args: any[]) => T,
    ...args: any[]
  ): T | null {
    const key = `${ServiceClass.name}_${JSON.stringify(args)}`;
    return (this.services.get(key) as T) || null;
  }

  /**
   * 清除所有服务实例
   */
  static clearServices(): void {
    this.services.clear();
  }
}
