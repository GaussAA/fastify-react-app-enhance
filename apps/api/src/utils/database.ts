/**
 * 数据库查询工具
 * 提供通用的数据库操作模式，避免重复代码
 */

import { PrismaClient } from '@prisma/client';

export interface PaginationOptions {
  page?: number;
  limit?: number;
  maxLimit?: number;
}

export interface PaginationResult {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface SearchOptions {
  search?: string;
  searchFields?: string[];
}

export interface SortOptions {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface BaseQueryOptions
  extends PaginationOptions,
    SearchOptions,
    SortOptions {
  isActive?: boolean;
  where?: any;
}

/**
 * 构建分页参数
 */
export function buildPaginationParams(options: PaginationOptions = {}) {
  const { page = 1, limit = 20, maxLimit = 100 } = options;
  const safeLimit = Math.min(limit, maxLimit);
  const safePage = Math.max(page, 1);

  return {
    skip: (safePage - 1) * safeLimit,
    take: safeLimit,
    page: safePage,
    limit: safeLimit,
  };
}

/**
 * 构建搜索条件
 */
export function buildSearchCondition(
  search?: string,
  searchFields: string[] = ['name', 'displayName', 'description']
) {
  if (!search) return {};

  return {
    OR: searchFields.map(field => ({
      [field]: {
        contains: search,
        mode: 'insensitive' as const,
      },
    })),
  };
}

/**
 * 构建排序条件
 */
export function buildSortCondition(
  sortBy?: string,
  sortOrder: 'asc' | 'desc' = 'desc'
) {
  if (!sortBy) return { createdAt: 'desc' };

  return {
    [sortBy]: sortOrder,
  };
}

/**
 * 构建基础查询条件
 */
export function buildBaseQuery(options: BaseQueryOptions = {}) {
  const { search, searchFields, isActive, sortBy, sortOrder } = options;

  const where: any = {};

  // 搜索条件
  if (search) {
    Object.assign(where, buildSearchCondition(search, searchFields));
  }

  // 激活状态
  if (isActive !== undefined) {
    where.isActive = isActive;
  }

  // 排序条件
  const orderBy = buildSortCondition(sortBy, sortOrder);

  return { where, orderBy };
}

/**
 * 通用分页查询
 */
export async function paginatedQuery<T>(
  _prisma: PrismaClient,
  model: any,
  options: BaseQueryOptions = {},
  include?: any
): Promise<{
  data: T[];
  pagination: PaginationResult;
}> {
  const { page = 1, limit = 20, maxLimit = 100 } = options;
  const {
    skip,
    take,
    page: safePage,
    limit: safeLimit,
  } = buildPaginationParams({
    page,
    limit,
    maxLimit,
  });

  const { where, orderBy } = buildBaseQuery(options);

  const queryOptions: any = {
    where,
    orderBy,
    skip,
    take,
  };

  if (include) {
    queryOptions.include = include;
  }

  const [data, total] = await Promise.all([
    model.findMany(queryOptions),
    model.count({ where }),
  ]);

  return {
    data,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      pages: Math.ceil(total / safeLimit),
    },
  };
}

/**
 * 通用单条记录查询
 */
export async function findById<T>(
  _prisma: PrismaClient,
  model: any,
  id: number,
  include?: any
): Promise<T | null> {
  const queryOptions: any = { where: { id } };

  if (include) {
    queryOptions.include = include;
  }

  return await model.findUnique(queryOptions);
}

/**
 * 通用创建记录
 */
export async function createRecord<T>(
  _prisma: PrismaClient,
  model: any,
  data: any,
  include?: any
): Promise<T> {
  const queryOptions: any = { data };

  if (include) {
    queryOptions.include = include;
  }

  return await model.create(queryOptions);
}

/**
 * 通用更新记录
 */
export async function updateRecord<T>(
  _prisma: PrismaClient,
  model: any,
  id: number,
  data: any,
  include?: any
): Promise<T | null> {
  const queryOptions: any = {
    where: { id },
    data,
  };

  if (include) {
    queryOptions.include = include;
  }

  return await model.update(queryOptions);
}

/**
 * 通用软删除记录
 */
export async function softDeleteRecord<T>(
  _prisma: PrismaClient,
  model: any,
  id: number,
  deletedBy?: number
): Promise<T | null> {
  const data: any = {
    isActive: false,
    deletedAt: new Date(),
  };

  if (deletedBy) {
    data.deletedBy = deletedBy;
  }

  return await model.update({
    where: { id },
    data,
  });
}

/**
 * 通用硬删除记录
 */
export async function hardDeleteRecord<T>(
  _prisma: PrismaClient,
  model: any,
  id: number
): Promise<T | null> {
  return await model.delete({
    where: { id },
  });
}

/**
 * 检查记录是否存在
 */
export async function recordExists(
  _prisma: PrismaClient,
  model: any,
  id: number
): Promise<boolean> {
  const count = await model.count({
    where: { id },
  });
  return count > 0;
}

/**
 * 批量操作工具
 */
export class BatchOperations {
  constructor(private _prisma: PrismaClient) {
    // prisma instance for batch operations - kept for future use
  }

  /**
   * 批量创建
   */
  async createMany<T>(
    model: any,
    data: any[],
    include?: any
  ): Promise<{ count: number; data?: T[] }> {
    const result = await model.createMany({ data });

    if (include && data.length > 0) {
      // 如果需要返回数据，需要重新查询
      const createdRecords = await model.findMany({
        where: {
          id: {
            in: data.map((_, index) => index + 1), // 简化处理，实际应该根据业务逻辑调整
          },
        },
        include,
      });
      return { count: result.count, data: createdRecords };
    }

    return { count: result.count };
  }

  /**
   * 批量更新
   */
  async updateMany(
    model: any,
    where: any,
    data: any
  ): Promise<{ count: number }> {
    return await model.updateMany({ where, data });
  }

  /**
   * 批量删除
   */
  async deleteMany(model: any, where: any): Promise<{ count: number }> {
    return await model.deleteMany({ where });
  }
}

/**
 * 事务操作工具
 */
export class TransactionOperations {
  constructor(private prisma: PrismaClient) {}

  /**
   * 执行事务
   */
  async execute<T>(operations: (tx: any) => Promise<T>): Promise<T> {
    return await this.prisma.$transaction(operations);
  }

  /**
   * 批量创建事务
   */
  async createManyWithTransaction<T>(
    operations: Array<{
      model: any;
      data: any;
      include?: any;
    }>
  ): Promise<T[]> {
    return await this.prisma.$transaction(async (tx: any) => {
      const results: T[] = [];

      for (const op of operations) {
        const result = await (tx as any)[op.model.name].create({
          data: op.data,
          include: op.include,
        });
        results.push(result);
      }

      return results;
    });
  }
}
