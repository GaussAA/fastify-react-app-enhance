/**
 * 查询优化器
 * 提供数据库查询优化功能
 */

import { PrismaClient } from '@prisma/client';

export interface QueryOptimizationOptions {
  enableSelect?: boolean;
  enableInclude?: boolean;
  enableWhere?: boolean;
  enableOrderBy?: boolean;
  enablePagination?: boolean;
  maxDepth?: number;
  cacheStrategy?: 'none' | 'memory' | 'redis';
  cacheTTL?: number;
}

export interface OptimizedQuery {
  select?: Record<string, boolean | { select: Record<string, boolean> }>;
  include?: Record<string, boolean | { include: Record<string, boolean> }>;
  where?: Record<string, unknown>;
  orderBy?: Record<string, 'asc' | 'desc'> | Record<string, 'asc' | 'desc'>[];
  skip?: number;
  take?: number;
  distinct?: string | string[];
}

/**
 * 查询优化器类
 */
export class QueryOptimizer {
  private cache: Map<string, unknown> = new Map();
  private options: QueryOptimizationOptions;

  constructor(_prisma: PrismaClient, options: QueryOptimizationOptions = {}) {
    this.options = {
      enableSelect: true,
      enableInclude: true,
      enableWhere: true,
      enableOrderBy: true,
      enablePagination: true,
      maxDepth: 3,
      cacheStrategy: 'memory',
      cacheTTL: 300000, // 5 minutes
      ...options,
    };
  }

  /**
   * 优化查询参数
   */
  optimizeQuery(
    _model: string,
    query: Record<string, unknown>,
    options: {
      selectFields?: string[];
      includeRelations?: string[];
      defaultOrderBy?: Record<string, 'asc' | 'desc'>;
      maxLimit?: number;
    } = {}
  ): OptimizedQuery {
    const {
      selectFields = [],
      includeRelations = [],
      defaultOrderBy = { createdAt: 'desc' },
      maxLimit = 100,
    } = options;

    const optimized: OptimizedQuery = {};

    // 优化 select
    if (this.options.enableSelect && selectFields.length > 0) {
      optimized.select = this.buildSelect(selectFields);
    }

    // 优化 include
    if (this.options.enableInclude && includeRelations.length > 0) {
      optimized.include = this.buildInclude(includeRelations);
    }

    // 优化 where
    if (this.options.enableWhere && query.where) {
      optimized.where = this.optimizeWhere(
        query.where as Record<string, unknown>
      );
    }

    // 优化 orderBy
    if (this.options.enableOrderBy) {
      optimized.orderBy =
        (query.orderBy as Record<string, 'asc' | 'desc'>) || defaultOrderBy;
    }

    // 优化分页
    if (this.options.enablePagination) {
      const { skip, take } = this.optimizePagination(query, maxLimit);
      if (skip !== undefined) optimized.skip = skip;
      if (take !== undefined) optimized.take = take;
    }

    return optimized;
  }

  /**
   * 构建 select 字段
   */
  private buildSelect(
    fields: string[]
  ): Record<string, boolean | { select: Record<string, boolean> }> {
    const select: Record<
      string,
      boolean | { select: Record<string, boolean> }
    > = {};
    fields.forEach(field => {
      if (field.includes('.')) {
        // 处理嵌套字段
        const [relation, nestedField] = field.split('.');
        if (!select[relation]) {
          select[relation] = { select: {} };
        }
        (select[relation] as { select: Record<string, boolean> }).select[
          nestedField
        ] = true;
      } else {
        select[field] = true;
      }
    });
    return select;
  }

  /**
   * 构建 include 关系
   */
  private buildInclude(
    relations: string[]
  ): Record<string, boolean | { include: Record<string, boolean> }> {
    const include: Record<
      string,
      boolean | { include: Record<string, boolean> }
    > = {};
    relations.forEach(relation => {
      if (relation.includes('.')) {
        // 处理嵌套关系
        const [parent, child] = relation.split('.');
        if (!include[parent]) {
          include[parent] = { include: {} };
        }
        (include[parent] as { include: Record<string, boolean> }).include[
          child
        ] = true;
      } else {
        include[relation] = true;
      }
    });
    return include;
  }

  /**
   * 优化 where 条件
   */
  private optimizeWhere(
    where: Record<string, unknown>
  ): Record<string, unknown> {
    if (!where) return where;

    const optimized: Record<string, unknown> = {};

    // 处理基本字段
    Object.keys(where).forEach(key => {
      if (key === 'OR' || key === 'AND' || key === 'NOT') {
        // 递归处理逻辑操作符
        optimized[key] = Array.isArray(where[key])
          ? (where[key] as Record<string, unknown>[]).map(
              (condition: Record<string, unknown>) =>
                this.optimizeWhere(condition)
            )
          : this.optimizeWhere(where[key] as Record<string, unknown>);
      } else if (typeof where[key] === 'object' && where[key] !== null) {
        // 处理对象条件
        optimized[key] = this.optimizeFieldCondition(
          where[key] as Record<string, unknown>
        );
      } else {
        // 处理简单值
        optimized[key] = where[key];
      }
    });

    return optimized;
  }

  /**
   * 优化字段条件
   */
  private optimizeFieldCondition(
    condition: Record<string, unknown>
  ): Record<string, unknown> {
    if (!condition || typeof condition !== 'object') return condition;

    const optimized: Record<string, unknown> = {};

    // 处理 Prisma 查询条件
    Object.keys(condition).forEach(operator => {
      const value = condition[operator];

      switch (operator) {
        case 'contains':
          // 优化字符串包含查询
          if (typeof value === 'string') {
            optimized.contains = value;
            optimized.mode = 'insensitive';
          } else {
            optimized[operator] = value;
          }
          break;
        case 'in':
          // 优化 in 查询
          if (Array.isArray(value) && value.length > 0) {
            optimized.in = value;
          }
          break;
        case 'notIn':
          // 优化 notIn 查询
          if (Array.isArray(value) && value.length > 0) {
            optimized.notIn = value;
          }
          break;
        default:
          optimized[operator] = value;
      }
    });

    return optimized;
  }

  /**
   * 优化分页参数
   */
  private optimizePagination(
    query: Record<string, unknown>,
    maxLimit: number
  ): { skip?: number; take?: number } {
    const { page = 1, limit = 20 } = query as { page?: number; limit?: number };
    const skip = (page - 1) * limit;
    const take = Math.min(limit, maxLimit);

    return { skip, take };
  }

  /**
   * 执行优化后的查询
   */
  async executeOptimizedQuery<T>(
    model: { findMany: (query: OptimizedQuery) => Promise<T[]> },
    optimizedQuery: OptimizedQuery,
    cacheKey?: string
  ): Promise<T[]> {
    // 检查缓存
    if (cacheKey && this.options.cacheStrategy === 'memory') {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return cached as T[];
      }
    }

    // 执行查询
    const result = await model.findMany(optimizedQuery);

    // 缓存结果
    if (cacheKey && this.options.cacheStrategy === 'memory') {
      this.cache.set(cacheKey, result);
      setTimeout(() => {
        this.cache.delete(cacheKey);
      }, this.options.cacheTTL);
    }

    return result;
  }

  /**
   * 执行优化后的计数查询
   */
  async executeOptimizedCount(
    model: {
      count: (query: { where?: Record<string, unknown> }) => Promise<number>;
    },
    where?: Record<string, unknown>,
    cacheKey?: string
  ): Promise<number> {
    // 检查缓存
    if (cacheKey && this.options.cacheStrategy === 'memory') {
      const cached = this.cache.get(cacheKey);
      if (cached !== undefined) {
        return cached as number;
      }
    }

    // 执行计数查询
    const count = await model.count({ where });

    // 缓存结果
    if (cacheKey && this.options.cacheStrategy === 'memory') {
      this.cache.set(cacheKey, count);
      setTimeout(() => {
        this.cache.delete(cacheKey);
      }, this.options.cacheTTL);
    }

    return count;
  }

  /**
   * 批量查询优化
   */
  async executeBatchQueries<T>(
    queries: Array<{
      model: { findMany: (query: OptimizedQuery) => Promise<T[]> };
      query: OptimizedQuery;
      cacheKey?: string;
    }>
  ): Promise<T[][]> {
    const results = await Promise.all(
      queries.map(({ model, query, cacheKey }) =>
        this.executeOptimizedQuery<T>(model, query, cacheKey)
      )
    );

    return results;
  }

  /**
   * 清除缓存
   */
  clearCache(pattern?: string): void {
    if (pattern) {
      // 清除匹配模式的缓存
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      // 清除所有缓存
      this.cache.clear();
    }
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats(): {
    size: number;
    keys: string[];
    hitRate: number;
  } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      hitRate: 0, // 需要实现命中率统计
    };
  }
}

/**
 * 查询构建器
 */
export class QueryBuilder {
  private query: Record<string, unknown> = {};

  /**
   * 添加 where 条件
   */
  where(condition: Record<string, unknown>): QueryBuilder {
    this.query.where = {
      ...(this.query.where as Record<string, unknown>),
      ...condition,
    };
    return this;
  }

  /**
   * 添加 OR 条件
   */
  or(conditions: Record<string, unknown>[]): QueryBuilder {
    this.query.where = {
      ...(this.query.where as Record<string, unknown>),
      OR: conditions,
    };
    return this;
  }

  /**
   * 添加 AND 条件
   */
  and(conditions: Record<string, unknown>[]): QueryBuilder {
    this.query.where = {
      ...(this.query.where as Record<string, unknown>),
      AND: conditions,
    };
    return this;
  }

  /**
   * 添加排序
   */
  orderBy(
    orderBy: Record<string, 'asc' | 'desc'> | Record<string, 'asc' | 'desc'>[]
  ): QueryBuilder {
    this.query.orderBy = orderBy;
    return this;
  }

  /**
   * 添加分页
   */
  paginate(page: number, limit: number): QueryBuilder {
    this.query.skip = (page - 1) * limit;
    this.query.take = limit;
    return this;
  }

  /**
   * 添加 select 字段
   */
  select(fields: string[]): QueryBuilder {
    this.query.select = this.buildSelect(fields);
    return this;
  }

  /**
   * 添加 include 关系
   */
  include(relations: string[]): QueryBuilder {
    this.query.include = this.buildInclude(relations);
    return this;
  }

  /**
   * 构建 select 字段
   */
  private buildSelect(fields: string[]): Record<string, boolean> {
    const select: Record<string, boolean> = {};
    fields.forEach(field => {
      select[field] = true;
    });
    return select;
  }

  /**
   * 构建 include 关系
   */
  private buildInclude(relations: string[]): Record<string, boolean> {
    const include: Record<string, boolean> = {};
    relations.forEach(relation => {
      include[relation] = true;
    });
    return include;
  }

  /**
   * 构建查询
   */
  build(): Record<string, unknown> {
    return this.query;
  }

  /**
   * 重置查询
   */
  reset(): QueryBuilder {
    this.query = {};
    return this;
  }
}

// 导出便捷函数
export function createQueryBuilder(): QueryBuilder {
  return new QueryBuilder();
}

export function createQueryOptimizer(
  prisma: PrismaClient,
  options?: QueryOptimizationOptions
): QueryOptimizer {
  return new QueryOptimizer(prisma, options);
}
