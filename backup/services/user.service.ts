import { prisma } from '../prisma-client.js';
import { logger } from '../utils/logger.js';
import { auditService } from './audit.service.js';
import { permissionService } from './permission.service.js';

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  avatar?: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  isActive?: boolean;
  isVerified?: boolean;
}

export interface UserQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  isVerified?: boolean;
  role?: string;
}

export const userService = {
  /**
   * 获取所有用户（分页）
   */
  async getAll(query: UserQuery = {}) {
    const { page = 1, limit = 20, search, isActive, isVerified, role } = query;

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

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
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
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * 根据ID获取用户
   */
  async getById(id: number) {
    try {
      return await prisma.user.findUnique({
        where: { id },
        include: {
          userRoles: {
            include: {
              role: {
                include: {
                  rolePermissions: {
                    include: {
                      permission: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    } catch (error) {
      logger.error('Error getting user by ID:', error as any);
      throw error;
    }
  },

  /**
   * 根据邮箱获取用户
   */
  async getByEmail(email: string) {
    try {
      return await prisma.user.findUnique({
        where: { email },
        include: {
          userRoles: {
            include: {
              role: true,
            },
          },
        },
      });
    } catch (error) {
      logger.error('Error getting user by email:', error as any);
      throw error;
    }
  },

  /**
   * 创建用户
   */
  async create(data: CreateUserData, createdBy?: number) {
    try {
      const user = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: data.password, // 密码应该在调用前已加密
          phone: data.phone,
          avatar: data.avatar,
        },
        include: {
          userRoles: {
            include: {
              role: true,
            },
          },
        },
      });

      // 记录审计日志
      await auditService.log({
        userId: createdBy,
        action: 'create',
        resource: 'user',
        resourceId: user.id.toString(),
        details: {
          email: user.email,
          name: user.name,
        },
      });

      logger.info(`User created: ${user.email}`);
      return user;
    } catch (error) {
      logger.error('Error creating user:', error as any);
      throw error;
    }
  },

  /**
   * 更新用户
   */
  async update(id: number, data: UpdateUserData, updatedBy?: number) {
    try {
      const oldUser = await prisma.user.findUnique({
        where: { id },
      });

      if (!oldUser) {
        throw new Error('User not found');
      }

      const user = await prisma.user.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
        include: {
          userRoles: {
            include: {
              role: true,
            },
          },
        },
      });

      // 记录审计日志
      await auditService.log({
        userId: updatedBy,
        action: 'update',
        resource: 'user',
        resourceId: user.id.toString(),
        details: {
          old: oldUser,
          new: user,
        },
      });

      logger.info(`User updated: ${user.email}`);
      return user;
    } catch (error) {
      logger.error('Error updating user:', error as any);
      throw error;
    }
  },

  /**
   * 删除用户
   */
  async delete(id: number, deletedBy?: number) {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new Error('User not found');
      }

      await prisma.user.delete({
        where: { id },
      });

      // 记录审计日志
      await auditService.log({
        userId: deletedBy,
        action: 'delete',
        resource: 'user',
        resourceId: id.toString(),
        details: {
          email: user.email,
          name: user.name,
        },
      });

      logger.info(`User deleted: ${user.email}`);
      return { success: true };
    } catch (error) {
      logger.error('Error deleting user:', error as any);
      throw error;
    }
  },

  /**
   * 激活/停用用户
   */
  async toggleActive(id: number, isActive: boolean, updatedBy?: number) {
    try {
      const user = await prisma.user.update({
        where: { id },
        data: { isActive },
        include: {
          userRoles: {
            include: {
              role: true,
            },
          },
        },
      });

      // 记录审计日志
      await auditService.log({
        userId: updatedBy,
        action: isActive ? 'activate' : 'deactivate',
        resource: 'user',
        resourceId: user.id.toString(),
        details: {
          email: user.email,
          isActive,
        },
      });

      logger.info(
        `User ${isActive ? 'activated' : 'deactivated'}: ${user.email}`
      );
      return user;
    } catch (error) {
      logger.error('Error toggling user active status:', error as any);
      throw error;
    }
  },

  /**
   * 验证用户邮箱
   */
  async verifyEmail(id: number, verifiedBy?: number) {
    try {
      const user = await prisma.user.update({
        where: { id },
        data: { isVerified: true },
        include: {
          userRoles: {
            include: {
              role: true,
            },
          },
        },
      });

      // 记录审计日志
      await auditService.log({
        userId: verifiedBy,
        action: 'verify_email',
        resource: 'user',
        resourceId: user.id.toString(),
        details: {
          email: user.email,
        },
      });

      logger.info(`User email verified: ${user.email}`);
      return user;
    } catch (error) {
      logger.error('Error verifying user email:', error as any);
      throw error;
    }
  },

  /**
   * 更新最后登录时间
   */
  async updateLastLogin(id: number) {
    try {
      return await prisma.user.update({
        where: { id },
        data: { lastLoginAt: new Date() },
      });
    } catch (error) {
      logger.error('Error updating last login time:', error as any);
      throw error;
    }
  },

  /**
   * 获取用户统计信息
   */
  async getStats() {
    try {
      const [totalUsers, activeUsers, verifiedUsers, recentUsers] =
        await Promise.all([
          prisma.user.count(),
          prisma.user.count({ where: { isActive: true } }),
          prisma.user.count({ where: { isVerified: true } }),
          prisma.user.count({
            where: {
              createdAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 最近30天
              },
            },
          }),
        ]);

      return {
        totalUsers,
        activeUsers,
        verifiedUsers,
        recentUsers,
        inactiveUsers: totalUsers - activeUsers,
        unverifiedUsers: totalUsers - verifiedUsers,
      };
    } catch (error) {
      logger.error('Error getting user stats:', error as any);
      throw error;
    }
  },

  /**
   * 检查用户权限
   */
  async hasPermission(userId: number, resource: string, action: string) {
    return await permissionService.hasPermission(userId, resource, action);
  },

  /**
   * 获取用户权限列表
   */
  async getUserPermissions(userId: number) {
    return await permissionService.getUserPermissions(userId);
  },

  /**
   * 获取用户角色
   */
  async getUserRoles(userId: number) {
    return await permissionService.getUserRoles(userId);
  },
};
