/**
 * 重构后的权限服务
 * 基于BaseService，减少重复代码
 */

import { PrismaClient } from '@prisma/client';
import { CrudService } from './base.service.js';
import { ValidationRuleSets } from '../utils/validation.js';

export interface PermissionQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  resource?: string;
  action?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PermissionCreateData {  
  name: string;
  displayName: string;
  description?: string;
  resource: string;
  action: string;
  isActive?: boolean;
}

export interface PermissionUpdateData {
  name?: string;
  displayName?: string;
  description?: string;
  resource?: string;
  action?: string;
  isActive?: boolean;
}

export interface PermissionWithRoles {
  id: number;
  name: string;
  displayName: string;
  description: string | null;
  resource: string;
  action: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  rolePermissions: Array<{
    id: number;
    role: {
      id: number;
      name: string;
      displayName: string;
    };
  }>;
  _count: {
    rolePermissions: number;
  };
}

/**
 * 重构后的权限服务类
 */
export class PermissionService extends CrudService<PermissionWithRoles> {
  constructor(prisma: PrismaClient) {
    super(prisma, prisma.permission, ValidationRuleSets.permission, {
      enableEvents: true,
      enableValidation: true,
      enableAudit: true,
      enableCache: true,
      cacheTTL: 300000, // 5 minutes
    });
  }

  /**
   * 获取所有权限（分页）
   */
  async getAllPermissions(query: PermissionQuery = {}) {
    const {
      page = 1,
      limit = 20,
      search,
      isActive,
      resource,
      action,
      sortBy,
      sortOrder,
    } = query;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { displayName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { resource: { contains: search, mode: 'insensitive' } },
        { action: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isActive !== undefined) where.isActive = isActive;
    if (resource) where.resource = { contains: resource, mode: 'insensitive' };
    if (action) where.action = { contains: action, mode: 'insensitive' };

    const include = {
      rolePermissions: {
        include: {
          role: {
            select: {
              id: true,
              name: true,
              displayName: true,
            },
          },
        },
      },
      _count: {
        select: {
          rolePermissions: true,
        },
      },
    };

    const orderBy = sortBy
      ? { [sortBy]: sortOrder || 'desc' }
      : { createdAt: 'desc' };

    return this.findAll({
      page,
      limit,
      where,
      include,
      orderBy,
    });
  }

  /**
   * 根据ID获取权限
   */
  async getPermissionById(id: number): Promise<PermissionWithRoles | null> {
    return this.findById(id, {
      include: {
        rolePermissions: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
                displayName: true,
              },
            },
          },
        },
        _count: {
          select: {
            rolePermissions: true,
          },
        },
      },
    });
  }

  /**
   * 根据名称获取权限
   */
  async getPermissionByName(name: string): Promise<PermissionWithRoles | null> {
    const cacheKey = this.getCacheKey('getPermissionByName', { name });

    // 检查缓存
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    const permission = await this.model.findUnique({
      where: { name },
      include: {
        rolePermissions: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
                displayName: true,
              },
            },
          },
        },
        _count: {
          select: {
            rolePermissions: true,
          },
        },
      },
    });

    // 缓存结果
    if (permission) {
      this.setCache(cacheKey, permission);
    }

    return permission;
  }

  /**
   * 根据资源和操作获取权限
   */
  async getPermissionByResourceAction(
    resource: string,
    action: string
  ): Promise<PermissionWithRoles | null> {
    const cacheKey = this.getCacheKey('getPermissionByResourceAction', {
      resource,
      action,
    });

    // 检查缓存
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    const permission = await this.model.findFirst({
      where: { resource, action },
      include: {
        rolePermissions: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
                displayName: true,
              },
            },
          },
        },
        _count: {
          select: {
            rolePermissions: true,
          },
        },
      },
    });

    // 缓存结果
    if (permission) {
      this.setCache(cacheKey, permission);
    }

    return permission;
  }

  /**
   * 创建权限
   */
  async createPermission(
    data: PermissionCreateData,
    _createdBy?: number
  ): Promise<PermissionWithRoles> {
    // 验证权限名称唯一性
    const existingPermission = await this.getPermissionByName(data.name);
    if (existingPermission) {
      throw new Error('权限名称已存在');
    }

    // 验证资源和操作组合唯一性
    const existingResourceAction = await this.getPermissionByResourceAction(
      data.resource,
      data.action
    );
    if (existingResourceAction) {
      throw new Error('该资源和操作的权限已存在');
    }

    // 创建权限
    const permission = await this.create({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 返回完整的权限信息
    return this.getPermissionById(
      permission.id
    ) as Promise<PermissionWithRoles>;
  }

  /**
   * 更新权限
   */
  async updatePermission(
    id: number,
    data: PermissionUpdateData,
    _updatedBy?: number
  ): Promise<PermissionWithRoles | null> {
    // 如果更新权限名称，检查唯一性
    if (data.name) {
      const existingPermission = await this.getPermissionByName(data.name);
      if (existingPermission && existingPermission.id !== id) {
        throw new Error('权限名称已存在');
      }
    }

    // 如果更新资源和操作，检查组合唯一性
    if (data.resource && data.action) {
      const existingResourceAction = await this.getPermissionByResourceAction(
        data.resource,
        data.action
      );
      if (existingResourceAction && existingResourceAction.id !== id) {
        throw new Error('该资源和操作的权限已存在');
      }
    }

    // 更新权限基本信息
    const permission = await this.update(id, {
      ...data,
      updatedAt: new Date(),
    });

    if (!permission) {
      return null;
    }

    // 返回完整的权限信息
    return this.getPermissionById(id);
  }

  /**
   * 删除权限
   */
  async deletePermission(id: number, _deletedBy?: number): Promise<boolean> {
    // 检查权限是否存在
    const permission = await this.getPermissionById(id);
    if (!permission) {
      return false;
    }

    // 检查是否有角色使用此权限
    if (permission._count.rolePermissions > 0) {
      throw new Error('无法删除正在使用的权限');
    }

    // 软删除权限
    const result = await this.delete(id, { soft: true, audit: true });

    return result;
  }

  /**
   * 激活权限
   */
  async activatePermission(
    id: number,
    activatedBy?: number
  ): Promise<PermissionWithRoles | null> {
    return this.updatePermission(id, { isActive: true }, activatedBy);
  }

  /**
   * 停用权限
   */
  async deactivatePermission(
    id: number,
    deactivatedBy?: number
  ): Promise<PermissionWithRoles | null> {
    return this.updatePermission(id, { isActive: false }, deactivatedBy);
  }

  /**
   * 搜索权限
   */
  async searchPermissions(
    query: string,
    options: PermissionQuery = {}
  ): Promise<{
    data: PermissionWithRoles[];
    pagination: any;
  }> {
    return this.search(
      query,
      ['name', 'displayName', 'description', 'resource', 'action'],
      {
        ...options,
        include: {
          rolePermissions: {
            include: {
              role: {
                select: {
                  id: true,
                  name: true,
                  displayName: true,
                },
              },
            },
          },
          _count: {
            select: {
              rolePermissions: true,
            },
          },
        },
      }
    );
  }

  /**
   * 按资源获取权限
   */
  async getPermissionsByResource(
    resource: string
  ): Promise<PermissionWithRoles[]> {
    const cacheKey = this.getCacheKey('getPermissionsByResource', { resource });

    // 检查缓存
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    const permissions = await this.model.findMany({
      where: { resource },
      include: {
        rolePermissions: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
                displayName: true,
              },
            },
          },
        },
        _count: {
          select: {
            rolePermissions: true,
          },
        },
      },
      orderBy: { action: 'asc' },
    });

    // 缓存结果
    this.setCache(cacheKey, permissions);

    return permissions;
  }

  /**
   * 按操作获取权限
   */
  async getPermissionsByAction(action: string): Promise<PermissionWithRoles[]> {
    const cacheKey = this.getCacheKey('getPermissionsByAction', { action });

    // 检查缓存
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    const permissions = await this.model.findMany({
      where: { action },
      include: {
        rolePermissions: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
                displayName: true,
              },
            },
          },
        },
        _count: {
          select: {
            rolePermissions: true,
          },
        },
      },
      orderBy: { resource: 'asc' },
    });

    // 缓存结果
    this.setCache(cacheKey, permissions);

    return permissions;
  }

  /**
   * 获取所有资源列表
   */
  async getResources(): Promise<string[]> {
    const cacheKey = this.getCacheKey('getResources', {});

    // 检查缓存
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    const resources = await this.model.findMany({
      select: { resource: true },
      distinct: ['resource'],
      orderBy: { resource: 'asc' },
    });

    const resourceList = resources.map((r: any) => r.resource);

    // 缓存结果
    this.setCache(cacheKey, resourceList);

    return resourceList;
  }

  /**
   * 获取所有操作列表
   */
  async getActions(): Promise<string[]> {
    const cacheKey = this.getCacheKey('getActions', {});

    // 检查缓存
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    const actions = await this.model.findMany({
      select: { action: true },
      distinct: ['action'],
      orderBy: { action: 'asc' },
    });

    const actionList = actions.map((a: any) => a.action);

    // 缓存结果
    this.setCache(cacheKey, actionList);

    return actionList as string[];
  }

  /**
   * 获取权限统计信息
   */
  async getPermissionStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    withRoles: number;
    withoutRoles: number;
    byResource: Array<{ resource: string; count: number }>;
    byAction: Array<{ action: string; count: number }>;
  }> {
    const [total, active, inactive] = await Promise.all([
      this.count(),
      this.count({ isActive: true }),
      this.count({ isActive: false }),
    ]);

    // 统计有角色和没有角色的权限
    const [withRoles, withoutRoles] = await Promise.all([
      this.prisma.permission.count({
        where: {
          rolePermissions: {
            some: {},
          },
        },
      }),
      this.prisma.permission.count({
        where: {
          rolePermissions: {
            none: {},
          },
        },
      }),
    ]);

    // 按资源统计
    const resourceStats = await this.prisma.permission.groupBy({
      by: ['resource'],
      _count: { id: true },
    });

    const byResource = resourceStats.map((stat: any) => ({
      resource: stat.resource,
      count: stat._count.id,
    }));

    // 按操作统计
    const actionStats = await this.prisma.permission.groupBy({
      by: ['action'],
      _count: { id: true },
    });

    const byAction = actionStats.map((stat: any) => ({
      action: stat.action,
      count: stat._count.id,
    }));

    return {
      total,
      active,
      inactive,
      withRoles,
      withoutRoles,
      byResource,
      byAction,
    };
  }

  /**
   * 批量创建权限
   */
  async createPermissionsBatch(
    permissionsData: PermissionCreateData[],
    _createdBy?: number
  ): Promise<{
    count: number;
    data?: PermissionWithRoles[];
  }> {
    const result = await this.createMany(
      permissionsData.map((data: any) => ({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    );

    return result;
  }

  /**
   * 批量更新权限状态
   */
  async updatePermissionsStatus(
    permissionIds: number[],
    isActive: boolean,
    _updatedBy?: number
  ): Promise<{ count: number }> {
    return this.updateMany(
      { id: { in: permissionIds } },
      { isActive, updatedAt: new Date() }
    );
  }

  /**
   * 获取用户权限
   */
  async getUserPermissions(userId: number): Promise<
    Array<{
      id: number;
      name: string;
      displayName: string;
      resource: string;
      action: string;
    }>
  > {
    const userPermissions = await this.prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: {
                  select: {
                    id: true,
                    name: true,
                    displayName: true,
                    resource: true,
                    action: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const permissions: Array<{
      id: number;
      name: string;
      displayName: string;
      resource: string;
      action: string;
    }> = [];
    userPermissions.forEach((userRole: any) => {
      userRole.role.rolePermissions.forEach((rolePermission: any) => {
        permissions.push(rolePermission.permission);
      });
    });

    // 去重
    return permissions.filter(
      (permission, index, self) =>
        index === self.findIndex((p: any) => p.id === permission.id)
    );
  }

  /**
   * 获取用户角色
   */
  async getUserRoles(
    userId: number
  ): Promise<Array<{ id: number; name: string; displayName: string }>> {
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            displayName: true,
          },
        },
      },
    });

    return userRoles.map((ur: any) => ur.role);
  }

  /**
   * 检查用户是否有特定权限
   */
  async hasPermission(
    userId: number,
    resource: string,
    action: string
  ): Promise<boolean> {
    const userPermission = await this.prisma.userRole.findFirst({
      where: {
        userId,
        role: {
          isActive: true,
          rolePermissions: {
            some: {
              permission: {
                resource,
                action,
                isActive: true,
              },
            },
          },
        },
      },
    });

    return !!userPermission;
  }

  /**
   * 获取服务统计信息（重写父类方法）
   */
  async getStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    cacheSize: number;
    withRoles: number;
    withoutRoles: number;
  }> {
    const baseStats = await super.getStats();
    const [withRoles, withoutRoles] = await Promise.all([
      this.prisma.permission.count({
        where: {
          rolePermissions: {
            some: {},
          },
        },
      }),
      this.prisma.permission.count({
        where: {
          rolePermissions: {
            none: {},
          },
        },
      }),
    ]);

    return {
      ...baseStats,
      withRoles,
      withoutRoles,
    };
  }
}

// 导出单例实例
let permissionServiceInstance: PermissionService | null = null;

export function getPermissionService(prisma: PrismaClient): PermissionService {
  if (!permissionServiceInstance) {
    permissionServiceInstance = new PermissionService(prisma);
  }
  return permissionServiceInstance;
}
