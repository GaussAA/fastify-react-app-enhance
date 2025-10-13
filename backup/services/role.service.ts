import { prisma } from '../prisma-client.js';
import { logger } from '../utils/logger.js';
import { auditService } from './audit.service.js';

export interface CreateRoleData {
  name: string;
  displayName: string;
  description?: string;
  permissions?: string[];
}

export interface UpdateRoleData {
  displayName?: string;
  description?: string;
  isActive?: boolean;
}

export const roleService = {
  /**
   * 获取所有角色
   */
  async getAllRoles() {
    try {
      return await prisma.role.findMany({
        where: {
          isActive: true,
        },
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });
    } catch (error) {
      logger.error('Error getting all roles:', error as any);
      throw error;
    }
  },

  /**
   * 根据ID获取角色
   */
  async getRoleById(id: number) {
    try {
      return await prisma.role.findUnique({
        where: { id },
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
        },
      });
    } catch (error) {
      logger.error('Error getting role by ID:', error as any);
      throw error;
    }
  },

  /**
   * 创建角色
   */
  async createRole(data: CreateRoleData, createdBy?: number) {
    try {
      // 检查角色名称是否已存在
      const existingRole = await prisma.role.findUnique({
        where: { name: data.name },
      });

      if (existingRole) {
        throw new Error('角色名称已存在');
      }

      // 创建角色
      const role = await prisma.role.create({
        data: {
          name: data.name,
          displayName: data.displayName,
          description: data.description,
        },
      });

      // 分配权限
      if (data.permissions && data.permissions.length > 0) {
        const permissions = await prisma.permission.findMany({
          where: {
            name: {
              in: data.permissions,
            },
          },
        });

        await prisma.rolePermission.createMany({
          data: permissions.map(permission => ({
            roleId: role.id,
            permissionId: permission.id,
            grantedBy: createdBy,
          })),
        });
      }

      // 记录审计日志
      await auditService.log({
        userId: createdBy,
        action: 'create',
        resource: 'role',
        resourceId: role.id.toString(),
        details: {
          name: role.name,
          displayName: role.displayName,
          permissions: data.permissions,
        },
      });

      logger.info(`Role created: ${role.name}`);
      return role;
    } catch (error) {
      logger.error('Error creating role:', error as any);
      throw error;
    }
  },

  /**
   * 更新角色
   */
  async updateRole(id: number, data: UpdateRoleData, updatedBy?: number) {
    try {
      const oldRole = await prisma.role.findUnique({
        where: { id },
      });

      if (!oldRole) {
        return null;
      }

      const role = await prisma.role.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });

      // 记录审计日志
      await auditService.log({
        userId: updatedBy,
        action: 'update',
        resource: 'role',
        resourceId: role.id.toString(),
        details: {
          old: oldRole,
          new: role,
        },
      });

      logger.info(`Role updated: ${role.name}`);
      return role;
    } catch (error) {
      logger.error('Error updating role:', error as any);
      throw error;
    }
  },

  /**
   * 删除角色
   */
  async deleteRole(id: number, deletedBy?: number) {
    try {
      const role = await prisma.role.findUnique({
        where: { id },
      });

      if (!role) {
        return null;
      }

      // 检查是否有用户使用此角色
      const userCount = await prisma.userRole.count({
        where: { roleId: id },
      });

      if (userCount > 0) {
        throw new Error('无法删除角色，仍有用户使用此角色');
      }

      // 软删除：设置为非激活状态
      await prisma.role.update({
        where: { id },
        data: { isActive: false },
      });

      // 记录审计日志
      await auditService.log({
        userId: deletedBy,
        action: 'delete',
        resource: 'role',
        resourceId: role.id.toString(),
        details: {
          name: role.name,
          displayName: role.displayName,
        },
      });

      logger.info(`Role deleted: ${role.name}`);
      return { success: true };
    } catch (error) {
      logger.error('Error deleting role:', error as any);
      throw error;
    }
  },

  /**
   * 为角色分配权限
   */
  async assignPermissionsToRole(
    roleId: number,
    permissionNames: string[],
    assignedBy?: number
  ) {
    try {
      const role = await prisma.role.findUnique({
        where: { id: roleId },
      });

      if (!role) {
        throw new Error('角色不存在');
      }

      // 获取权限
      const permissions = await prisma.permission.findMany({
        where: {
          name: {
            in: permissionNames,
          },
        },
      });

      if (permissions.length !== permissionNames.length) {
        const foundNames = permissions.map(p => p.name);
        const missingNames = permissionNames.filter(
          name => !foundNames.includes(name)
        );
        throw new Error(`以下权限不存在: ${missingNames.join(', ')}`);
      }

      // 删除现有权限
      await prisma.rolePermission.deleteMany({
        where: { roleId },
      });

      // 分配新权限
      await prisma.rolePermission.createMany({
        data: permissions.map(permission => ({
          roleId,
          permissionId: permission.id,
          grantedBy: assignedBy,
        })),
      });

      // 记录审计日志
      await auditService.log({
        userId: assignedBy,
        action: 'assign_permissions',
        resource: 'role',
        resourceId: roleId.toString(),
        details: {
          roleName: role.name,
          permissions: permissionNames,
        },
      });

      logger.info(
        `Permissions assigned to role: ${role.name} -> ${permissionNames.join(', ')}`
      );
      return { success: true };
    } catch (error) {
      logger.error('Error assigning permissions to role:', error as any);
      throw error;
    }
  },

  /**
   * 移除角色权限
   */
  async removePermissionFromRole(roleId: number, permissionId: number) {
    try {
      const result = await prisma.rolePermission.deleteMany({
        where: {
          roleId,
          permissionId,
        },
      });

      logger.info(`Permission removed from role: ${roleId} -> ${permissionId}`);
      return result;
    } catch (error) {
      logger.error('Error removing permission from role:', error as any);
      throw error;
    }
  },

  /**
   * 获取角色统计信息
   */
  async getRoleStats() {
    try {
      const [totalRoles, activeRoles, rolesWithUsers] = await Promise.all([
        prisma.role.count(),
        prisma.role.count({ where: { isActive: true } }),
        prisma.role.count({
          where: {
            userRoles: {
              some: {},
            },
          },
        }),
      ]);

      return {
        totalRoles,
        activeRoles,
        inactiveRoles: totalRoles - activeRoles,
        rolesWithUsers,
        rolesWithoutUsers: totalRoles - rolesWithUsers,
      };
    } catch (error) {
      logger.error('Error getting role stats:', error as any);
      throw error;
    }
  },
};
