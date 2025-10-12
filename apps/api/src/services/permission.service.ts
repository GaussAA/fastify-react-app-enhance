import { prisma } from '../prisma-client.js';
import { logger } from '../utils/logger.js';

export interface PermissionData {
    name: string;
    displayName: string;
    description?: string;
    resource: string;
    action: string;
}

export interface RoleData {
    name: string;
    displayName: string;
    description?: string;
    permissions?: string[]; // 权限名称数组
}

export interface UserRoleData {
    userId: number;
    roleId: number;
    assignedBy?: number;
    expiresAt?: Date;
}

export const permissionService = {
    /**
     * 检查用户是否有指定权限
     */
    async hasPermission(
        userId: number,
        resource: string,
        action: string
    ): Promise<boolean> {
        try {
            const userPermissions = await prisma.userRole.findMany({
                where: {
                    userId,
                    role: {
                        isActive: true,
                    },
                    OR: [
                        { expiresAt: null },
                        { expiresAt: { gt: new Date() } },
                    ],
                },
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
            });

            for (const userRole of userPermissions) {
                for (const rolePermission of userRole.role.rolePermissions) {
                    const permission = rolePermission.permission;
                    if (
                        permission.isActive &&
                        permission.resource === resource &&
                        permission.action === action
                    ) {
                        return true;
                    }
                }
            }

            return false;
        } catch (error) {
            logger.error('Error checking permission:', error);
            return false;
        }
    },

    /**
     * 获取用户所有权限
     */
    async getUserPermissions(userId: number): Promise<string[]> {
        try {
            const userRoles = await prisma.userRole.findMany({
                where: {
                    userId,
                    role: {
                        isActive: true,
                    },
                    OR: [
                        { expiresAt: null },
                        { expiresAt: { gt: new Date() } },
                    ],
                },
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
            });

            const permissions = new Set<string>();

            for (const userRole of userRoles) {
                for (const rolePermission of userRole.role.rolePermissions) {
                    const permission = rolePermission.permission;
                    if (permission.isActive) {
                        permissions.add(permission.name);
                    }
                }
            }

            return Array.from(permissions);
        } catch (error) {
            logger.error('Error getting user permissions:', error);
            return [];
        }
    },

    /**
     * 获取用户角色
     */
    async getUserRoles(userId: number) {
        try {
            return await prisma.userRole.findMany({
                where: {
                    userId,
                    role: {
                        isActive: true,
                    },
                    OR: [
                        { expiresAt: null },
                        { expiresAt: { gt: new Date() } },
                    ],
                },
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
            });
        } catch (error) {
            logger.error('Error getting user roles:', error);
            return [];
        }
    },

    /**
     * 创建权限
     */
    async createPermission(data: PermissionData) {
        try {
            const permission = await prisma.permission.create({
                data: {
                    name: data.name,
                    displayName: data.displayName,
                    description: data.description,
                    resource: data.resource,
                    action: data.action,
                },
            });

            logger.info(`Permission created: ${permission.name}`);
            return permission;
        } catch (error) {
            logger.error('Error creating permission:', error);
            throw error;
        }
    },

    /**
     * 创建角色
     */
    async createRole(data: RoleData) {
        try {
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
                    })),
                });
            }

            logger.info(`Role created: ${role.name}`);
            return role;
        } catch (error) {
            logger.error('Error creating role:', error);
            throw error;
        }
    },

    /**
     * 为用户分配角色
     */
    async assignRoleToUser(data: UserRoleData) {
        try {
            const userRole = await prisma.userRole.create({
                data: {
                    userId: data.userId,
                    roleId: data.roleId,
                    assignedBy: data.assignedBy,
                    expiresAt: data.expiresAt,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    role: {
                        select: {
                            id: true,
                            name: true,
                            displayName: true,
                        },
                    },
                },
            });

            logger.info(`Role assigned to user: ${userRole.user.email} -> ${userRole.role.name}`);
            return userRole;
        } catch (error) {
            logger.error('Error assigning role to user:', error);
            throw error;
        }
    },

    /**
     * 移除用户角色
     */
    async removeRoleFromUser(userId: number, roleId: number) {
        try {
            const result = await prisma.userRole.deleteMany({
                where: {
                    userId,
                    roleId,
                },
            });

            logger.info(`Role removed from user: ${userId} -> ${roleId}`);
            return result;
        } catch (error) {
            logger.error('Error removing role from user:', error);
            throw error;
        }
    },

    /**
     * 为角色分配权限
     */
    async assignPermissionToRole(roleId: number, permissionId: number, grantedBy?: number) {
        try {
            const rolePermission = await prisma.rolePermission.create({
                data: {
                    roleId,
                    permissionId,
                    grantedBy,
                },
                include: {
                    role: {
                        select: {
                            name: true,
                        },
                    },
                    permission: {
                        select: {
                            name: true,
                        },
                    },
                },
            });

            logger.info(`Permission assigned to role: ${rolePermission.role.name} -> ${rolePermission.permission.name}`);
            return rolePermission;
        } catch (error) {
            logger.error('Error assigning permission to role:', error);
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
            logger.error('Error removing permission from role:', error);
            throw error;
        }
    },

    /**
     * 获取所有权限
     */
    async getAllPermissions() {
        try {
            return await prisma.permission.findMany({
                where: {
                    isActive: true,
                },
                orderBy: [
                    { resource: 'asc' },
                    { action: 'asc' },
                ],
            });
        } catch (error) {
            logger.error('Error getting all permissions:', error);
            throw error;
        }
    },

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
            logger.error('Error getting all roles:', error);
            throw error;
        }
    },

    /**
     * 根据ID获取权限
     */
    async getPermissionById(id: number) {
        try {
            return await prisma.permission.findUnique({
                where: { id },
            });
        } catch (error) {
            logger.error('Error getting permission by ID:', error);
            throw error;
        }
    },

    /**
     * 创建权限
     */
    async createPermission(data: PermissionData, createdBy?: number) {
        try {
            // 检查权限是否已存在
            const existingPermission = await prisma.permission.findUnique({
                where: { name: data.name }
            });

            if (existingPermission) {
                throw new Error('权限名称已存在');
            }

            // 检查资源+操作组合是否已存在
            const existingResourceAction = await prisma.permission.findFirst({
                where: {
                    resource: data.resource,
                    action: data.action,
                }
            });

            if (existingResourceAction) {
                throw new Error('该资源操作组合已存在');
            }

            const permission = await prisma.permission.create({
                data: {
                    name: data.name,
                    displayName: data.displayName,
                    description: data.description,
                    resource: data.resource,
                    action: data.action,
                },
            });

            // 记录审计日志
            await auditService.log({
                userId: createdBy,
                action: 'create',
                resource: 'permission',
                resourceId: permission.id.toString(),
                details: {
                    name: permission.name,
                    resource: permission.resource,
                    action: permission.action,
                },
            });

            logger.info(`Permission created: ${permission.name}`);
            return permission;
        } catch (error) {
            logger.error('Error creating permission:', error);
            throw error;
        }
    },

    /**
     * 更新权限
     */
    async updatePermission(id: number, data: Partial<PermissionData>, updatedBy?: number) {
        try {
            const oldPermission = await prisma.permission.findUnique({
                where: { id },
            });

            if (!oldPermission) {
                return null;
            }

            const permission = await prisma.permission.update({
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
                resource: 'permission',
                resourceId: permission.id.toString(),
                details: {
                    old: oldPermission,
                    new: permission,
                },
            });

            logger.info(`Permission updated: ${permission.name}`);
            return permission;
        } catch (error) {
            logger.error('Error updating permission:', error);
            throw error;
        }
    },

    /**
     * 删除权限
     */
    async deletePermission(id: number, deletedBy?: number) {
        try {
            const permission = await prisma.permission.findUnique({
                where: { id },
            });

            if (!permission) {
                return null;
            }

            // 检查是否有角色使用此权限
            const roleCount = await prisma.rolePermission.count({
                where: { permissionId: id },
            });

            if (roleCount > 0) {
                throw new Error('无法删除权限，仍有角色使用此权限');
            }

            // 软删除：设置为非激活状态
            await prisma.permission.update({
                where: { id },
                data: { isActive: false },
            });

            // 记录审计日志
            await auditService.log({
                userId: deletedBy,
                action: 'delete',
                resource: 'permission',
                resourceId: permission.id.toString(),
                details: {
                    name: permission.name,
                    resource: permission.resource,
                    action: permission.action,
                },
            });

            logger.info(`Permission deleted: ${permission.name}`);
            return { success: true };
        } catch (error) {
            logger.error('Error deleting permission:', error);
            throw error;
        }
    },

    /**
     * 按资源分组获取权限
     */
    async getPermissionsGroupedByResource() {
        try {
            const permissions = await prisma.permission.findMany({
                where: {
                    isActive: true,
                },
                orderBy: [
                    { resource: 'asc' },
                    { action: 'asc' },
                ],
            });

            const grouped = permissions.reduce((acc, permission) => {
                if (!acc[permission.resource]) {
                    acc[permission.resource] = [];
                }
                acc[permission.resource].push(permission);
                return acc;
            }, {} as Record<string, typeof permissions>);

            return grouped;
        } catch (error) {
            logger.error('Error getting permissions grouped by resource:', error);
            throw error;
        }
    },

    /**
     * 初始化默认权限和角色
     */
    async initializeDefaultPermissionsAndRoles() {
        try {
            // 创建默认权限
            const defaultPermissions = [
                // 用户管理权限
                { name: 'user:create', displayName: '创建用户', resource: 'user', action: 'create' },
                { name: 'user:read', displayName: '查看用户', resource: 'user', action: 'read' },
                { name: 'user:update', displayName: '更新用户', resource: 'user', action: 'update' },
                { name: 'user:delete', displayName: '删除用户', resource: 'user', action: 'delete' },

                // 角色管理权限
                { name: 'role:create', displayName: '创建角色', resource: 'role', action: 'create' },
                { name: 'role:read', displayName: '查看角色', resource: 'role', action: 'read' },
                { name: 'role:update', displayName: '更新角色', resource: 'role', action: 'update' },
                { name: 'role:delete', displayName: '删除角色', resource: 'role', action: 'delete' },

                // 权限管理权限
                { name: 'permission:create', displayName: '创建权限', resource: 'permission', action: 'create' },
                { name: 'permission:read', displayName: '查看权限', resource: 'permission', action: 'read' },
                { name: 'permission:update', displayName: '更新权限', resource: 'permission', action: 'update' },
                { name: 'permission:delete', displayName: '删除权限', resource: 'permission', action: 'delete' },

                // 审计日志权限
                { name: 'audit:read', displayName: '查看审计日志', resource: 'audit', action: 'read' },
            ];

            for (const permData of defaultPermissions) {
                await prisma.permission.upsert({
                    where: { name: permData.name },
                    update: permData,
                    create: permData,
                });
            }

            // 创建默认角色
            const adminRole = await prisma.role.upsert({
                where: { name: 'admin' },
                update: {
                    displayName: '系统管理员',
                    description: '拥有系统所有权限',
                },
                create: {
                    name: 'admin',
                    displayName: '系统管理员',
                    description: '拥有系统所有权限',
                },
            });

            const userRole = await prisma.role.upsert({
                where: { name: 'user' },
                update: {
                    displayName: '普通用户',
                    description: '基础用户权限',
                },
                create: {
                    name: 'user',
                    displayName: '普通用户',
                    description: '基础用户权限',
                },
            });

            // 为管理员角色分配所有权限
            const allPermissions = await prisma.permission.findMany();
            for (const permission of allPermissions) {
                await prisma.rolePermission.upsert({
                    where: {
                        roleId_permissionId: {
                            roleId: adminRole.id,
                            permissionId: permission.id,
                        },
                    },
                    update: {},
                    create: {
                        roleId: adminRole.id,
                        permissionId: permission.id,
                    },
                });
            }

            // 为普通用户角色分配基础权限
            const basicPermissions = await prisma.permission.findMany({
                where: {
                    name: {
                        in: ['user:read', 'audit:read'],
                    },
                },
            });

            for (const permission of basicPermissions) {
                await prisma.rolePermission.upsert({
                    where: {
                        roleId_permissionId: {
                            roleId: userRole.id,
                            permissionId: permission.id,
                        },
                    },
                    update: {},
                    create: {
                        roleId: userRole.id,
                        permissionId: permission.id,
                    },
                });
            }

            logger.info('Default permissions and roles initialized');
        } catch (error) {
            logger.error('Error initializing default permissions and roles:', error);
            throw error;
        }
    },
};
