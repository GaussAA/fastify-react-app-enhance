/**
 * 重构后的用户路由
 * 使用重构后的服务层，减少重复代码
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getUserService } from '../services/service-factory.js';
import {
  successResponse,
  createdResponse,
  paginatedResponse,
  notFoundResponse,
  routeHandler,
} from '../utils/response.js';
import { userResponses } from '../schemas/responses.js';

/**
 * 用户路由插件
 */
export async function userRoutes(fastify: FastifyInstance) {
  const userService = getUserService((fastify as any).prisma);

  // 获取所有用户
  fastify.get(
    '/',
    {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer', minimum: 1, default: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
            search: { type: 'string' },
            isActive: { type: 'boolean' },
            isVerified: { type: 'boolean' },
            role: { type: 'string' },
            sortBy: {
              type: 'string',
              enum: ['name', 'email', 'createdAt', 'updatedAt'],
            },
            sortOrder: {
              type: 'string',
              enum: ['asc', 'desc'],
              default: 'desc',
            },
          },
        },
        // response: userResponses, // 临时注释掉以修复启动问题
      },
    },
    routeHandler(async (request: FastifyRequest, reply: FastifyReply) => {
      const query = request.query as any;
      const result = await userService.getAllUsers(query);
      return paginatedResponse(
        reply,
        result.data,
        result.pagination,
        '获取用户列表成功'
      );
    })
  );

  // 根据ID获取用户
  fastify.get(
    '/:id',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
          },
          required: ['id'],
        },
        // response: userResponses, // 临时注释掉以修复启动问题
      },
    },
    routeHandler(async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: number };
      const user = await userService.getUserById(id);
      if (!user) {
        return notFoundResponse(reply, '用户未找到');
      }
      return successResponse(reply, user, '获取用户成功');
    })
  );

  // 创建用户
  fastify.post(
    '/',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            name: { type: 'string', minLength: 1, maxLength: 100 },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
            isActive: { type: 'boolean', default: true },
            isVerified: { type: 'boolean', default: false },
            roles: {
              type: 'array',
              items: { type: 'string' },
            },
          },
          required: ['name', 'email', 'password'],
        },
        // response: userResponses, // 临时注释掉以修复启动问题
      },
    },
    routeHandler(async (request: FastifyRequest, reply: FastifyReply) => {
      const userData = request.body as any;
      const createdBy = (request as any).user?.id;
      const user = await userService.createUser(userData, createdBy);
      return createdResponse(reply, user, '用户创建成功');
    })
  );

  // 更新用户
  fastify.put(
    '/:id',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
          },
          required: ['id'],
        },
        body: {
          type: 'object',
          properties: {
            name: { type: 'string', minLength: 1, maxLength: 100 },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
            isActive: { type: 'boolean' },
            isVerified: { type: 'boolean' },
            roles: {
              type: 'array',
              items: { type: 'string' },
            },
          },
        },
        // response: userResponses, // 临时注释掉以修复启动问题
      },
    },
    routeHandler(async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: number };
      const userData = request.body as any;
      const updatedBy = (request as any).user?.id;
      const user = await userService.updateUser(id, userData, updatedBy);
      if (!user) {
        return notFoundResponse(reply, '用户未找到');
      }
      return successResponse(reply, user, '用户更新成功');
    })
  );

  // 删除用户
  fastify.delete(
    '/:id',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
          },
          required: ['id'],
        },
        // response: userResponses, // 临时注释掉以修复启动问题
      },
    },
    routeHandler(async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: number };
      const deletedBy = (request as any).user?.id;
      const result = await userService.deleteUser(id, deletedBy);
      if (!result) {
        return notFoundResponse(reply, '用户未找到');
      }
      return successResponse(reply, null, '用户删除成功');
    })
  );

  // 激活用户
  fastify.patch(
    '/:id/activate',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
          },
          required: ['id'],
        },
        // response: userResponses, // 临时注释掉以修复启动问题
      },
    },
    routeHandler(async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: number };
      const activatedBy = (request as any).user?.id;
      const user = await userService.activateUser(id, activatedBy);
      if (!user) {
        return notFoundResponse(reply, '用户未找到');
      }
      return successResponse(reply, user, '用户激活成功');
    })
  );

  // 停用用户
  fastify.patch(
    '/:id/deactivate',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
          },
          required: ['id'],
        },
        // response: userResponses, // 临时注释掉以修复启动问题
      },
    },
    routeHandler(async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: number };
      const deactivatedBy = (request as any).user?.id;
      const user = await userService.deactivateUser(id, deactivatedBy);
      if (!user) {
        return notFoundResponse(reply, '用户未找到');
      }
      return successResponse(reply, user, '用户停用成功');
    })
  );

  // 验证用户邮箱
  fastify.patch(
    '/:id/verify',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
          },
          required: ['id'],
        },
        // response: userResponses, // 临时注释掉以修复启动问题
      },
    },
    routeHandler(async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: number };
      const verifiedBy = (request as any).user?.id;
      const user = await userService.verifyUserEmail(id, verifiedBy);
      if (!user) {
        return notFoundResponse(reply, '用户未找到');
      }
      return successResponse(reply, user, '用户邮箱验证成功');
    })
  );

  // 搜索用户
  fastify.get(
    '/search/:query',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            query: { type: 'string', minLength: 1 },
          },
          required: ['query'],
        },
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer', minimum: 1, default: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
            isActive: { type: 'boolean' },
            isVerified: { type: 'boolean' },
            role: { type: 'string' },
            sortBy: {
              type: 'string',
              enum: ['name', 'email', 'createdAt', 'updatedAt'],
            },
            sortOrder: {
              type: 'string',
              enum: ['asc', 'desc'],
              default: 'desc',
            },
          },
        },
        // response: userResponses, // 临时注释掉以修复启动问题
      },
    },
    routeHandler(async (request: FastifyRequest, reply: FastifyReply) => {
      const { query } = request.params as { query: string };
      const options = request.query as any;
      const result = await userService.searchUsers(query, options);
      return paginatedResponse(
        reply,
        result.data,
        result.pagination,
        '搜索用户成功'
      );
    })
  );

  // 获取用户统计信息
  fastify.get(
    '/stats/overview',
    {
      schema: {
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  total: { type: 'integer' },
                  active: { type: 'integer' },
                  inactive: { type: 'integer' },
                  verified: { type: 'integer' },
                  unverified: { type: 'integer' },
                  byRole: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        role: { type: 'string' },
                        count: { type: 'integer' },
                      },
                    },
                  },
                },
              },
              message: { type: 'string' },
            },
          },
          500: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    routeHandler(async (request: FastifyRequest, reply: FastifyReply) => {
      const stats = await userService.getUserStats();
      return successResponse(reply, stats, '获取用户统计信息成功');
    })
  );

  // 批量创建用户
  fastify.post(
    '/batch',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            users: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string', minLength: 1, maxLength: 100 },
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 6 },
                  isActive: { type: 'boolean', default: true },
                  isVerified: { type: 'boolean', default: false },
                  roles: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                },
                required: ['name', 'email', 'password'],
              },
            },
          },
          required: ['users'],
        },
        // response: userResponses, // 临时注释掉以修复启动问题
      },
    },
    routeHandler(async (request: FastifyRequest, reply: FastifyReply) => {
      const { users } = request.body as { users: any[] };
      const createdBy = (request as any).user?.id;
      const result = await userService.createUsersBatch(users, createdBy);
      return createdResponse(reply, result, '批量创建用户成功');
    })
  );

  // 批量更新用户状态
  fastify.patch(
    '/batch/status',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            userIds: {
              type: 'array',
              items: { type: 'integer' },
            },
            isActive: { type: 'boolean' },
          },
          required: ['userIds', 'isActive'],
        },
        // response: userResponses, // 临时注释掉以修复启动问题
      },
    },
    routeHandler(async (request: FastifyRequest, reply: FastifyReply) => {
      const { userIds, isActive } = request.body as {
        userIds: number[];
        isActive: boolean;
      };
      const updatedBy = (request as any).user?.id;
      const result = await userService.updateUsersStatus(
        userIds,
        isActive,
        updatedBy
      );
      return successResponse(reply, result, '批量更新用户状态成功');
    })
  );
}
