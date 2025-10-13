import { FastifyInstance } from 'fastify';
import { getPermissionService } from '../services/service-factory.js';
import {
  authenticateToken,
  requirePermission,
} from '../middlewares/auth.middleware.js';
import type {
  AuthenticatedRequest,
  PermissionData,
  PermissionUpdateData,
} from '../types/auth.js';
import { permissionResponses } from '../schemas/responses.js';

export async function permissionRoutes(app: FastifyInstance) {
  // 获取所有权限
  app.get(
    '/',
    {
      preHandler: [authenticateToken, requirePermission('permission', 'read')],
      schema: {
        description: '获取所有权限列表',
        tags: ['permissions'],
        summary: '获取权限列表',
        response: {
          200: permissionResponses.list,
          500: permissionResponses.error,
        },
      },
    },
    async (_request, reply) => {
      try {
        const permissionService = getPermissionService(
          (_request as any).prisma
        );
        const result = await permissionService.getAllPermissions();
        const permissions = result.data;
        return reply.send({
          success: true,
          data: permissions,
          message: '获取权限列表成功',
        });
      } catch {
        return reply.status(500).send({
          success: false,
          message: '获取权限列表失败',
        });
      }
    }
  );

  // 根据ID获取权限
  app.get(
    '/:id',
    {
      preHandler: [authenticateToken, requirePermission('permission', 'read')],
      schema: {
        description: '根据ID获取权限详情',
        tags: ['permissions'],
        summary: '获取权限详情',
        params: {
          type: 'object',
          properties: {
            id: { type: 'number', description: '权限ID' },
          },
          required: ['id'],
        },
        response: {
          200: permissionResponses.detail,
          404: permissionResponses.error,
          500: permissionResponses.error,
        },
      },
    },
    async (_request, reply) => {
      try {
        const { id } = _request.params as { id: number };
        const permissionService = getPermissionService(
          (_request as any).prisma
        );
        const permission = await permissionService.getPermissionById(id);

        if (!permission) {
          return reply.status(404).send({
            success: false,
            message: '权限不存在',
          });
        }

        return reply.send({
          success: true,
          data: permission,
          message: '获取权限详情成功',
        });
      } catch {
        return reply.status(500).send({
          success: false,
          message: '获取权限详情失败',
        });
      }
    }
  );

  // 创建权限
  app.post(
    '/',
    {
      preHandler: [
        authenticateToken,
        requirePermission('permission', 'create'),
      ],
      schema: {
        description: '创建新权限',
        tags: ['permissions'],
        summary: '创建权限',
        body: {
          type: 'object',
          required: ['name', 'displayName', 'resource', 'action'],
          properties: {
            name: {
              type: 'string',
              description: '权限名称',
              minLength: 1,
              maxLength: 100,
            },
            displayName: {
              type: 'string',
              description: '权限显示名称',
              minLength: 1,
              maxLength: 100,
            },
            description: {
              type: 'string',
              description: '权限描述',
              maxLength: 500,
            },
            resource: {
              type: 'string',
              description: '资源类型',
              minLength: 1,
              maxLength: 50,
            },
            action: {
              type: 'string',
              description: '操作类型',
              minLength: 1,
              maxLength: 50,
            },
          },
        },
        response: {
          201: permissionResponses.create,
          400: permissionResponses.error,
        },
      },
    },
    async (request, reply) => {
      try {
        const { name, displayName, description, resource, action } =
          request.body as PermissionData;

        const permissionService = getPermissionService((request as any).prisma);
        const permission = await permissionService.createPermission({
          name,
          displayName,
          description,
          resource,
          action,
        });

        return reply.status(201).send({
          success: true,
          data: permission,
          message: '权限创建成功',
        });
      } catch (error) {
        return reply.status(400).send({
          success: false,
          message: error instanceof Error ? error.message : '权限创建失败',
        });
      }
    }
  );

  // 更新权限
  app.put(
    '/:id',
    {
      preHandler: [
        authenticateToken,
        requirePermission('permission', 'update'),
      ],
      schema: {
        description: '更新权限信息',
        tags: ['permissions'],
        summary: '更新权限',
        params: {
          type: 'object',
          properties: {
            id: { type: 'number', description: '权限ID' },
          },
          required: ['id'],
        },
        body: {
          type: 'object',
          properties: {
            displayName: {
              type: 'string',
              description: '权限显示名称',
              minLength: 1,
              maxLength: 100,
            },
            description: {
              type: 'string',
              description: '权限描述',
              maxLength: 500,
            },
            isActive: {
              type: 'boolean',
              description: '是否激活',
            },
          },
        },
        response: {
          200: permissionResponses.update,
          404: permissionResponses.error,
          400: permissionResponses.error,
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: number };
        const updateData = request.body as PermissionUpdateData;

        const updatedBy = (request as AuthenticatedRequest).user.id;
        const permissionService = getPermissionService((request as any).prisma);
        const permission = await permissionService.updatePermission(
          id,
          updateData,
          updatedBy
        );

        if (!permission) {
          return reply.status(404).send({
            success: false,
            message: '权限不存在',
          });
        }

        return reply.send({
          success: true,
          data: permission,
          message: '权限更新成功',
        });
      } catch (error) {
        return reply.status(400).send({
          success: false,
          message: error instanceof Error ? error.message : '权限更新失败',
        });
      }
    }
  );

  // 删除权限
  app.delete(
    '/:id',
    {
      preHandler: [
        authenticateToken,
        requirePermission('permission', 'delete'),
      ],
      schema: {
        description: '删除权限',
        tags: ['permissions'],
        summary: '删除权限',
        params: {
          type: 'object',
          properties: {
            id: { type: 'number', description: '权限ID' },
          },
          required: ['id'],
        },
        response: {
          200: permissionResponses.delete,
          404: permissionResponses.error,
          400: permissionResponses.error,
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: number };
        const deletedBy = (request as AuthenticatedRequest).user.id;

        const permissionService = getPermissionService((request as any).prisma);
        const result = await permissionService.deletePermission(id, deletedBy);

        if (!result) {
          return reply.status(404).send({
            success: false,
            message: '权限不存在',
          });
        }

        return reply.send({
          success: true,
          message: '权限删除成功',
        });
      } catch (error) {
        return reply.status(400).send({
          success: false,
          message: error instanceof Error ? error.message : '权限删除失败',
        });
      }
    }
  );

  // 按资源分组获取权限
  app.get(
    '/grouped/by-resource',
    {
      preHandler: [authenticateToken, requirePermission('permission', 'read')],
      schema: {
        description: '按资源分组获取权限',
        tags: ['permissions'],
        summary: '获取分组权限',
        response: {
          200: permissionResponses.grouped,
          500: permissionResponses.error,
        },
      },
    },
    async (_request, reply) => {
      try {
        const permissionService = getPermissionService(
          (_request as any).prisma
        );
        const groupedPermissions =
          await permissionService.getPermissionsByResource('all');
        return reply.send({
          success: true,
          data: groupedPermissions,
          message: '获取分组权限成功',
        });
      } catch {
        return reply.status(500).send({
          success: false,
          message: '获取分组权限失败',
        });
      }
    }
  );
}
