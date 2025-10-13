import { FastifyInstance } from 'fastify';
import { getRoleService } from '../services/service-factory.js';
import {
  authenticateToken,
  requirePermission,
} from '../middlewares/auth.middleware.js';
import type {
  AuthenticatedRequest,
  RoleData,
  RoleUpdateData,
} from '../types/auth.js';
import { roleResponses } from '../schemas/responses.js';

export async function roleRoutes(app: FastifyInstance) {
  // 获取所有角色
  app.get(
    '/',
    {
      preHandler: [authenticateToken, requirePermission('role', 'read')],
      schema: {
        description: '获取所有角色列表',
        tags: ['roles'],
        summary: '获取角色列表',
        response: {
          200: roleResponses.list,
          500: roleResponses.error,
        },
      },
    },
    async (request, reply) => {
      try {
        const roleService = getRoleService((request as any).prisma);
        const result = await roleService.getAllRoles();
        const roles = result.data;
        return reply.send({
          success: true,
          data: roles,
          message: '获取角色列表成功',
        });
      } catch {
        return reply.status(500).send({
          success: false,
          message: '获取角色列表失败',
        });
      }
    }
  );

  // 根据ID获取角色
  app.get(
    '/:id',
    {
      preHandler: [authenticateToken, requirePermission('role', 'read')],
      schema: {
        description: '根据ID获取角色详情',
        tags: ['roles'],
        summary: '获取角色详情',
        params: {
          type: 'object',
          properties: {
            id: { type: 'number', description: '角色ID' },
          },
          required: ['id'],
        },
        response: {
          200: roleResponses.detail,
          404: roleResponses.error,
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: number };
        const roleService = getRoleService((request as any).prisma);
        const role = await roleService.getRoleById(id);

        if (!role) {
          return reply.status(404).send({
            success: false,
            message: '角色不存在',
          });
        }

        return reply.send({
          success: true,
          data: role,
          message: '获取角色详情成功',
        });
      } catch {
        return reply.status(404).send({
          success: false,
          message: '获取角色详情失败',
        });
      }
    }
  );

  // 创建角色
  app.post(
    '/',
    {
      preHandler: [authenticateToken, requirePermission('role', 'create')],
      schema: {
        description: '创建新角色',
        tags: ['roles'],
        summary: '创建角色',
        body: {
          type: 'object',
          required: ['name', 'displayName'],
          properties: {
            name: {
              type: 'string',
              description: '角色名称',
              minLength: 1,
              maxLength: 50,
            },
            displayName: {
              type: 'string',
              description: '角色显示名称',
              minLength: 1,
              maxLength: 100,
            },
            description: {
              type: 'string',
              description: '角色描述',
              maxLength: 500,
            },
            permissions: {
              type: 'array',
              items: { type: 'string' },
              description: '权限名称列表',
            },
          },
        },
        response: {
          201: roleResponses.create,
          400: roleResponses.error,
        },
      },
    },
    async (request, reply) => {
      try {
        const { name, displayName, description, permissions } =
          request.body as RoleData;

        const createdBy = (request as AuthenticatedRequest).user.id;
        const roleService = getRoleService((request as any).prisma);
        const role = await roleService.createRole(
          {
            name,
            displayName,
            description,
            permissions,
          },
          createdBy
        );

        return reply.status(201).send({
          success: true,
          data: role,
          message: '角色创建成功',
        });
      } catch (error) {
        return reply.status(400).send({
          success: false,
          message: error instanceof Error ? error.message : '角色创建失败',
        });
      }
    }
  );

  // 更新角色
  app.put(
    '/:id',
    {
      preHandler: [authenticateToken, requirePermission('role', 'update')],
      schema: {
        description: '更新角色信息',
        tags: ['roles'],
        summary: '更新角色',
        params: {
          type: 'object',
          properties: {
            id: { type: 'number', description: '角色ID' },
          },
          required: ['id'],
        },
        body: {
          type: 'object',
          properties: {
            displayName: {
              type: 'string',
              description: '角色显示名称',
              minLength: 1,
              maxLength: 100,
            },
            description: {
              type: 'string',
              description: '角色描述',
              maxLength: 500,
            },
            isActive: {
              type: 'boolean',
              description: '是否激活',
            },
          },
        },
        response: {
          200: roleResponses.update,
          404: roleResponses.error,
          400: roleResponses.error,
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: number };
        const updateData = request.body as RoleUpdateData;

        const updatedBy = (request as AuthenticatedRequest).user.id;
        const roleService = getRoleService((request as any).prisma);
        const role = await roleService.updateRole(id, updateData, updatedBy);

        if (!role) {
          return reply.status(404).send({
            success: false,
            message: '角色不存在',
          });
        }

        return reply.send({
          success: true,
          data: role,
          message: '角色更新成功',
        });
      } catch (error) {
        return reply.status(400).send({
          success: false,
          message: error instanceof Error ? error.message : '角色更新失败',
        });
      }
    }
  );

  // 删除角色
  app.delete(
    '/:id',
    {
      preHandler: [authenticateToken, requirePermission('role', 'delete')],
      schema: {
        description: '删除角色',
        tags: ['roles'],
        summary: '删除角色',
        params: {
          type: 'object',
          properties: {
            id: { type: 'number', description: '角色ID' },
          },
          required: ['id'],
        },
        response: {
          200: roleResponses.delete,
          404: roleResponses.error,
          400: roleResponses.error,
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: number };
        const deletedBy = (request as AuthenticatedRequest).user.id;

        const roleService = getRoleService((request as any).prisma);
        const result = await roleService.deleteRole(id, deletedBy);

        if (!result) {
          return reply.status(404).send({
            success: false,
            message: '角色不存在',
          });
        }

        return reply.send({
          success: true,
          message: '角色删除成功',
        });
      } catch (error) {
        return reply.status(400).send({
          success: false,
          message: error instanceof Error ? error.message : '角色删除失败',
        });
      }
    }
  );

  // 为角色分配权限
  app.post(
    '/:id/permissions',
    {
      preHandler: [authenticateToken, requirePermission('role', 'update')],
      schema: {
        description: '为角色分配权限',
        tags: ['roles'],
        summary: '分配角色权限',
        params: {
          type: 'object',
          properties: {
            id: { type: 'number', description: '角色ID' },
          },
          required: ['id'],
        },
        body: {
          type: 'object',
          required: ['permissions'],
          properties: {
            permissions: {
              type: 'array',
              items: { type: 'string' },
              description: '权限名称列表',
            },
          },
        },
        response: {
          200: roleResponses.assign,
          400: roleResponses.error,
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: number };
        const { permissions } = request.body as { permissions: string[] };
        const assignedBy = (request as AuthenticatedRequest).user.id;

        const roleService = getRoleService((request as any).prisma);
        await roleService.assignPermissions(id, permissions, assignedBy);

        return reply.send({
          success: true,
          message: '权限分配成功',
        });
      } catch (error) {
        return reply.status(400).send({
          success: false,
          message: error instanceof Error ? error.message : '权限分配失败',
        });
      }
    }
  );

  // 移除角色权限
  app.delete(
    '/:id/permissions/:permissionId',
    {
      preHandler: [authenticateToken, requirePermission('role', 'update')],
      schema: {
        description: '移除角色权限',
        tags: ['roles'],
        summary: '移除角色权限',
        params: {
          type: 'object',
          properties: {
            id: { type: 'number', description: '角色ID' },
            permissionId: { type: 'number', description: '权限ID' },
          },
          required: ['id', 'permissionId'],
        },
        response: {
          200: roleResponses.remove,
          400: roleResponses.error,
        },
      },
    },
    async (request, reply) => {
      try {
        const { id, permissionId } = request.params as {
          id: number;
          permissionId: number;
        };

        const roleService = getRoleService((request as any).prisma);
        await roleService.removeRolePermissions(id, [String(permissionId)]);

        return reply.send({
          success: true,
          message: '权限移除成功',
        });
      } catch (error) {
        return reply.status(400).send({
          success: false,
          message: error instanceof Error ? error.message : '权限移除失败',
        });
      }
    }
  );
}
