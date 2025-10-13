/**
 * 重构后的角色服务
 * 基于BaseService，减少重复代码
 */

import { PrismaClient } from '@prisma/client';
import { CrudService } from './base.service.js';
import { ValidationRuleSets } from '../utils/validation.js';

export interface RoleQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface RoleCreateData {
  name: string;
  displayName: string;
  description?: string;
  isActive?: boolean;
  permissions?: string[];
}

export interface RoleUpdateData {
  name?: string;
  displayName?: string;
  description?: string;
  isActive?: boolean;
  permissions?: string[];
}

export interface RoleWithPermissions {
  id: number;
  name: string;
  displayName: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  rolePermissions: Array<{
    id: number;
    permission: {
      id: number;
      name: string;
      displayName: string;
    };
  }>;
  _count: {
    userRoles: number;
  };
}

/**
 * 重构后的角色服务类
 */
export class RoleService extends CrudService<RoleWithPermissions> {
  constructor(prisma: PrismaClient) {
    super(prisma, prisma.role, ValidationRuleSets.role, {
      enableEvents: true,
      enableValidation: true,
      enableAudit: true,
      enableCache: true,
      cacheTTL: 300000, // 5 minutes
    });
  }

  /**
   * 获取所有角色（分页）
   */
  async getAllRoles(query: RoleQuery = {}) {
    const { page = 1, limit = 20, search, isActive, sortBy, sortOrder } = query;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { displayName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isActive !== undefined) where.isActive = isActive;

    const include = {
      rolePermissions: {
        include: {
          permission: {
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
          userRoles: true,
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
   * 根据ID获取角色
   */
  async getRoleById(id: number): Promise<RoleWithPermissions | null> {
    return this.findById(id, {
      include: {
        rolePermissions: {
          include: {
            permission: {
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
            userRoles: true,
          },
        },
      },
    });
  }

  /**
   * 根据名称获取角色
   */
  async getRoleByName(name: string): Promise<RoleWithPermissions | null> {
    const cacheKey = this.getCacheKey('getRoleByName', { name });

    // 检查缓存
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    const role = await this.model.findUnique({
      where: { name },
      include: {
        rolePermissions: {
          include: {
            permission: {
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
            userRoles: true,
          },
        },
      },
    });

    // 缓存结果
    if (role) {
      this.setCache(cacheKey, role);
    }

    return role;
  }

  /**
   * 创建角色
   */
  async createRole(
    data: RoleCreateData,
    createdBy?: number
  ): Promise<RoleWithPermissions> {
    const { permissions, ...roleData } = data;

    // 验证角色名称唯一性
    const existingRole = await this.getRoleByName(data.name);
    if (existingRole) {
      throw new Error('角色名称已存在');
    }

    // 创建角色
    const role = await this.create({
      ...roleData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 分配权限
    if (permissions && permissions.length > 0) {
      await this.assignPermissions(role.id, permissions, createdBy);
    }

    // 返回完整的角色信息
    return this.getRoleById(role.id) as Promise<RoleWithPermissions>;
  }

  /**
   * 更新角色
   */
  async updateRole(
    id: number,
    data: RoleUpdateData,
    _updatedBy?: number
  ): Promise<RoleWithPermissions | null> {
    const { permissions, ...roleData } = data;

    // 如果更新角色名称，检查唯一性
    if (roleData.name) {
      const existingRole = await this.getRoleByName(roleData.name);
      if (existingRole && existingRole.id !== id) {
        throw new Error('角色名称已存在');
      }
    }

    // 更新角色基本信息
    const role = await this.update(id, {
      ...roleData,
      updatedAt: new Date(),
    });

    if (!role) {
      return null;
    }

    // 更新权限
    if (permissions !== undefined) {
      await this.updateRolePermissions(id, permissions, _updatedBy);
    }

    // 返回完整的角色信息
    return this.getRoleById(id);
  }

  /**
   * 删除角色
   */
  async deleteRole(id: number, _deletedBy?: number): Promise<boolean> {
    // 检查角色是否存在
    const role = await this.getRoleById(id);
    if (!role) {
      return false;
    }

    // 检查是否有用户使用此角色
    if (role._count.userRoles > 0) {
      throw new Error('无法删除正在使用的角色');
    }

    // 软删除角色
    const result = await this.delete(id, { soft: true, audit: true });

    // 清除角色权限关联
    if (result) {
      await this.prisma.rolePermission.deleteMany({
        where: { roleId: id },
      });
    }

    return result;
  }

  /**
   * 分配权限给角色
   */
  async assignPermissions(
    roleId: number,
    permissionNames: string[],
    assignedBy?: number
  ): Promise<void> {
    // 获取权限ID
    const permissions = await this.prisma.permission.findMany({
      where: { name: { in: permissionNames } },
      select: { id: true, name: true },
    });

    if (permissions.length !== permissionNames.length) {
      const foundPermissionNames = permissions.map((p: any) => p.name);
      const missingPermissions = permissionNames.filter(
        (name: string) => !foundPermissionNames.includes(name)
      );
      throw new Error(`权限不存在: ${missingPermissions.join(', ')}`);
    }

    // 删除现有权限关联
    await this.prisma.rolePermission.deleteMany({
      where: { roleId },
    });

    // 创建新的权限关联
    await this.prisma.rolePermission.createMany({
      data: permissions.map((permission: any) => ({
        roleId,
        permissionId: permission.id,
        assignedBy,
        assignedAt: new Date(),
      })),
    });

    // 清除缓存
    this.clearCache();
  }

  /**
   * 更新角色权限
   */
  async updateRolePermissions(
    roleId: number,
    permissionNames: string[],
    _updatedBy?: number
  ): Promise<void> {
    await this.assignPermissions(roleId, permissionNames, _updatedBy);
  }

  /**
   * 移除角色权限
   */
  async removeRolePermissions(
    roleId: number,
    permissionNames: string[]
  ): Promise<void> {
    const permissions = await this.prisma.permission.findMany({
      where: { name: { in: permissionNames } },
      select: { id: true },
    });

    await this.prisma.rolePermission.deleteMany({
      where: {
        roleId,
        permissionId: { in: permissions.map((p: any) => p.id) },
      },
    });

    // 清除缓存
    this.clearCache();
  }

  /**
   * 获取角色权限
   */
  async getRolePermissions(
    roleId: number
  ): Promise<Array<{ id: number; name: string; displayName: string }>> {
    const rolePermissions = await this.prisma.rolePermission.findMany({
      where: { roleId },
      include: {
        permission: {
          select: {
            id: true,
            name: true,
            displayName: true,
          },
        },
      },
    });

    return rolePermissions.map((rp: any) => rp.permission);
  }

  /**
   * 检查角色是否有特定权限
   */
  async hasPermission(
    roleId: number,
    permissionName: string
  ): Promise<boolean> {
    const rolePermission = await this.prisma.rolePermission.findFirst({
      where: {
        roleId,
        permission: { name: permissionName },
      },
    });

    return !!rolePermission;
  }

  /**
   * 检查角色是否有任何指定权限
   */
  async hasAnyPermission(
    roleId: number,
    permissionNames: string[]
  ): Promise<boolean> {
    const rolePermission = await this.prisma.rolePermission.findFirst({
      where: {
        roleId,
        permission: { name: { in: permissionNames } },
      },
    });

    return !!rolePermission;
  }

  /**
   * 激活角色
   */
  async activateRole(
    id: number,
    activatedBy?: number
  ): Promise<RoleWithPermissions | null> {
    return this.updateRole(id, { isActive: true }, activatedBy);
  }

  /**
   * 停用角色
   */
  async deactivateRole(
    id: number,
    deactivatedBy?: number
  ): Promise<RoleWithPermissions | null> {
    return this.updateRole(id, { isActive: false }, deactivatedBy);
  }

  /**
   * 搜索角色
   */
  async searchRoles(
    query: string,
    options: RoleQuery = {}
  ): Promise<{
    data: RoleWithPermissions[];
    pagination: any;
  }> {
    return this.search(query, ['name', 'displayName', 'description'], {
      ...options,
      include: {
        rolePermissions: {
          include: {
            permission: {
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
            userRoles: true,
          },
        },
      },
    });
  }

  /**
   * 获取角色统计信息
   */
  async getRoleStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    withUsers: number;
    withoutUsers: number;
    byPermission: Array<{ permission: string; count: number }>;
  }> {
    const [total, active, inactive] = await Promise.all([
      this.count(),
      this.count({ isActive: true }),
      this.count({ isActive: false }),
    ]);

    // 统计有用户和没有用户的角色
    const [withUsers, withoutUsers] = await Promise.all([
      this.prisma.role.count({
        where: {
          userRoles: {
            some: {},
          },
        },
      }),
      this.prisma.role.count({
        where: {
          userRoles: {
            none: {},
          },
        },
      }),
    ]);

    // 按权限统计
    const permissionStats = await this.prisma.rolePermission.groupBy({
      by: ['permissionId'],
      _count: { roleId: true },
      include: {
        permission: {
          select: { name: true },
        },
      },
    });

    const byPermission = permissionStats.map((stat: any) => ({
      permission: stat.permission.name,
      count: stat._count.roleId,
    }));

    return {
      total,
      active,
      inactive,
      withUsers,
      withoutUsers,
      byPermission,
    };
  }

  /**
   * 批量创建角色
   */
  async createRolesBatch(
    rolesData: RoleCreateData[],
    createdBy?: number
  ): Promise<{
    count: number;
    data?: RoleWithPermissions[];
  }> {
    const result = await this.createMany(
      rolesData.map((data: any) => ({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    );

    // 为每个角色分配权限
    if (result.data) {
      for (const role of result.data) {
        const roleData = rolesData.find((r: any) => r.name === role.name);
        if (roleData?.permissions && roleData.permissions.length > 0) {
          await this.assignPermissions(
            role.id,
            roleData.permissions,
            createdBy
          );
        }
      }
    }

    return result;
  }

  /**
   * 批量更新角色状态
   */
  async updateRolesStatus(
    roleIds: number[],
    isActive: boolean,
    _updatedBy?: number
  ): Promise<{ count: number }> {
    return this.updateMany(
      { id: { in: roleIds } },
      { isActive, updatedAt: new Date() }
    );
  }

  /**
   * 获取服务统计信息（重写父类方法）
   */
  async getStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    cacheSize: number;
    withUsers: number;
    withoutUsers: number;
  }> {
    const baseStats = await super.getStats();
    const [withUsers, withoutUsers] = await Promise.all([
      this.prisma.role.count({
        where: {
          userRoles: {
            some: {},
          },
        },
      }),
      this.prisma.role.count({
        where: {
          userRoles: {
            none: {},
          },
        },
      }),
    ]);

    return {
      ...baseStats,
      withUsers,
      withoutUsers,
    };
  }
}

// 导出单例实例
let roleServiceInstance: RoleService | null = null;

export function getRoleService(prisma: PrismaClient): RoleService {
  if (!roleServiceInstance) {
    roleServiceInstance = new RoleService(prisma);
  }
  return roleServiceInstance;
}
