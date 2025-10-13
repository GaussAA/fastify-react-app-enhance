/**
 * 重构后的用户服务
 * 基于BaseService，减少重复代码
 */

import { PrismaClient } from '@prisma/client';
import { CrudService } from './base.service.js';
import { ValidationRuleSets } from '../utils/validation.js';

export interface UserQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  isVerified?: boolean;
  role?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UserCreateData {
  name: string;
  email: string;
  password: string;
  isActive?: boolean;
  isVerified?: boolean;
  roles?: string[];
}

export interface UserUpdateData {
  name?: string;
  email?: string;
  password?: string;
  isActive?: boolean;
  isVerified?: boolean;
  roles?: string[];
  updatedAt?: Date;
}

export interface UserWithRoles {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  userRoles: Array<{
    id: number;
    role: {
      id: number;
      name: string;
      displayName: string;
    };
  }>;
}

/**
 * 重构后的用户服务类
 */
export class UserService extends CrudService<UserWithRoles> {
  constructor(prisma: PrismaClient) {
    super(prisma, prisma.user, ValidationRuleSets.user, {
      enableEvents: true,
      enableValidation: true,
      enableAudit: true,
      enableCache: true,
      cacheTTL: 300000, // 5 minutes
    });
  }

  /**
   * 获取所有用户（分页）
   */
  async getAllUsers(query: UserQuery = {}) {
    const {
      page = 1,
      limit = 20,
      search,
      isActive,
      isVerified,
      role,
      sortBy,
      sortOrder,
    } = query;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isActive !== undefined) where.isActive = isActive;
    if (isVerified !== undefined) where.isVerified = isVerified;

    if (role) {
      where.userRoles = {
        some: {
          role: {
            name: role,
          },
        },
      };
    }

    const include = {
      userRoles: {
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
   * 根据ID获取用户
   */
  async getUserById(id: number): Promise<UserWithRoles | null> {
    return this.findById(id, {
      include: {
        userRoles: {
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
      },
    });
  }

  /**
   * 根据邮箱获取用户
   */
  async getUserByEmail(email: string): Promise<UserWithRoles | null> {
    const cacheKey = this.getCacheKey('getUserByEmail', { email });

    // 检查缓存
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    const user = await this.model.findUnique({
      where: { email },
      include: {
        userRoles: {
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
      },
    });

    // 缓存结果
    if (user) {
      this.setCache(cacheKey, user);
    }

    return user;
  }

  /**
   * 创建用户
   */
  async createUser(
    data: UserCreateData,
    createdBy?: number
  ): Promise<UserWithRoles> {
    const { roles, ...userData } = data;

    // 验证邮箱唯一性
    const existingUser = await this.getUserByEmail(data.email);
    if (existingUser) {
      throw new Error('邮箱已被使用');
    }

    // 创建用户
    const user = await this.create({
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 分配角色
    if (roles && roles.length > 0) {
      await this.assignRoles(user.id, roles, createdBy);
    }

    // 返回完整的用户信息
    return this.getUserById(user.id) as Promise<UserWithRoles>;
  }

  /**
   * 更新用户
   */
  async updateUser(
    id: number,
    data: UserUpdateData,
    _updatedBy?: number
  ): Promise<UserWithRoles | null> {
    const { roles, ...userData } = data;

    // 如果更新邮箱，检查唯一性
    if (userData.email) {
      const existingUser = await this.getUserByEmail(userData.email);
      if (existingUser && existingUser.id !== id) {
        throw new Error('邮箱已被使用');
      }
    }

    // 更新用户基本信息
    const user = await this.update(id, {
      ...userData,
      updatedAt: new Date(),
    });

    if (!user) {
      return null;
    }

    // 更新角色
    if (roles !== undefined) {
      await this.updateUserRoles(id, roles, _updatedBy);
    }

    // 返回完整的用户信息
    return this.getUserById(id);
  }

  /**
   * 删除用户
   */
  async deleteUser(id: number, _deletedBy?: number): Promise<boolean> {
    // 检查用户是否存在
    const user = await this.getUserById(id);
    if (!user) {
      return false;
    }

    // 软删除用户
    const result = await this.delete(id, { soft: true, audit: true });

    // 清除用户角色关联
    if (result) {
      await this.prisma.userRole.deleteMany({
        where: { userId: id },
      });
    }

    return result;
  }

  /**
   * 分配角色给用户
   */
  async assignRoles(
    userId: number,
    roleNames: string[],
    assignedBy?: number
  ): Promise<void> {
    // 获取角色ID
    const roles = await this.prisma.role.findMany({
      where: { name: { in: roleNames } },
      select: { id: true, name: true },
    });

    if (roles.length !== roleNames.length) {
      const foundRoleNames = roles.map((r: any) => r.name);
      const missingRoles = roleNames.filter(
        name => !foundRoleNames.includes(name)
      );
      throw new Error(`角色不存在: ${missingRoles.join(', ')}`);
    }

    // 删除现有角色关联
    await this.prisma.userRole.deleteMany({
      where: { userId },
    });

    // 创建新的角色关联
    await this.prisma.userRole.createMany({
      data: roles.map((role: any) => ({
        userId,
        roleId: role.id,
        assignedBy,
        assignedAt: new Date(),
      })),
    });

    // 清除缓存
    this.clearCache();
  }

  /**
   * 更新用户角色
   */
  async updateUserRoles(
    userId: number,
    roleNames: string[],
    _updatedBy?: number
  ): Promise<void> {
    await this.assignRoles(userId, roleNames, _updatedBy);
  }

  /**
   * 移除用户角色
   */
  async removeUserRoles(userId: number, roleNames: string[]): Promise<void> {
    const roles = await this.prisma.role.findMany({
      where: { name: { in: roleNames } },
      select: { id: true },
    });

    await this.prisma.userRole.deleteMany({
      where: {
        userId,
        roleId: { in: roles.map((r: any) => r.id) },
      },
    });

    // 清除缓存
    this.clearCache();
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
   * 检查用户是否有特定角色
   */
  async hasRole(userId: number, roleName: string): Promise<boolean> {
    const userRole = await this.prisma.userRole.findFirst({
      where: {
        userId,
        role: { name: roleName },
      },
    });

    return !!userRole;
  }

  /**
   * 检查用户是否有任何指定角色
   */
  async hasAnyRole(userId: number, roleNames: string[]): Promise<boolean> {
    const userRole = await this.prisma.userRole.findFirst({
      where: {
        userId,
        role: { name: { in: roleNames } },
      },
    });

    return !!userRole;
  }

  /**
   * 激活用户
   */
  async activateUser(
    id: number,
    activatedBy?: number
  ): Promise<UserWithRoles | null> {
    return this.updateUser(id, { isActive: true }, activatedBy);
  }

  /**
   * 停用用户
   */
  async deactivateUser(
    id: number,
    deactivatedBy?: number
  ): Promise<UserWithRoles | null> {
    return this.updateUser(id, { isActive: false }, deactivatedBy);
  }

  /**
   * 验证用户邮箱
   */
  async verifyUserEmail(
    id: number,
    verifiedBy?: number
  ): Promise<UserWithRoles | null> {
    return this.updateUser(id, { isVerified: true }, verifiedBy);
  }

  /**
   * 搜索用户
   */
  async searchUsers(
    query: string,
    options: UserQuery = {}
  ): Promise<{
    data: UserWithRoles[];
    pagination: any;
  }> {
    return this.search(query, ['name', 'email'], {
      ...options,
      include: {
        userRoles: {
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
      },
    });
  }

  /**
   * 获取用户统计信息
   */
  async getUserStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    verified: number;
    unverified: number;
    byRole: Array<{ role: string; count: number }>;
  }> {
    const [total, active, inactive, verified, unverified] = await Promise.all([
      this.count(),
      this.count({ isActive: true }),
      this.count({ isActive: false }),
      this.count({ isVerified: true }),
      this.count({ isVerified: false }),
    ]);

    // 按角色统计
    const roleStats = await this.prisma.userRole.groupBy({
      by: ['roleId'],
      _count: { userId: true },
    });

    // 获取角色名称
    const roleIds = roleStats.map((stat: any) => stat.roleId);
    const roles = await this.prisma.role.findMany({
      where: { id: { in: roleIds } },
      select: { id: true, name: true },
    });

    const byRole = roleStats.map((stat: any) => {
      const role = roles.find((r: any) => r.id === stat.roleId);
      return {
        role: role?.name || 'Unknown',
        count: stat._count.userId,
      };
    });

    return {
      total,
      active,
      inactive,
      verified,
      unverified,
      byRole,
    };
  }

  /**
   * 批量创建用户
   */
  async createUsersBatch(
    usersData: UserCreateData[],
    createdBy?: number
  ): Promise<{
    count: number;
    data?: UserWithRoles[];
  }> {
    const result = await this.createMany(
      usersData.map((data: any) => ({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    );

    // 为每个用户分配角色
    if (result.data) {
      for (const user of result.data) {
        const userData = usersData.find((u: any) => u.email === user.email);
        if (userData?.roles && userData.roles.length > 0) {
          await this.assignRoles(user.id, userData.roles, createdBy);
        }
      }
    }

    return result;
  }

  /**
   * 批量更新用户状态
   */
  async updateUsersStatus(
    userIds: number[],
    isActive: boolean,
    _updatedBy?: number
  ): Promise<{ count: number }> {
    return this.updateMany(
      { id: { in: userIds } },
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
    verified: number;
    unverified: number;
  }> {
    const baseStats = await super.getStats();
    const [verified, unverified] = await Promise.all([
      this.count({ isVerified: true }),
      this.count({ isVerified: false }),
    ]);

    return {
      ...baseStats,
      verified,
      unverified,
    };
  }
}

// 导出单例实例
let userServiceInstance: UserService | null = null;

export function getUserService(prisma: PrismaClient): UserService {
  if (!userServiceInstance) {
    userServiceInstance = new UserService(prisma);
  }
  return userServiceInstance;
}
