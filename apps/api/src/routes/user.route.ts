import { FastifyInstance } from 'fastify';
import { getAllUsers, createUser } from '../controllers/user.controller.js';
import { authenticateToken, requirePermission } from '../middlewares/auth.middleware.js';
import { userService } from '../services/user.service.js';

export async function userRoutes(app: FastifyInstance) {
  // 获取所有用户
  app.get(
    '/',
    {
      preHandler: [authenticateToken],
      schema: {
        description: '获取所有用户列表',
        tags: ['users'],
        summary: '获取用户列表',
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', description: '请求是否成功' },
              data: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'number', description: '用户ID' },
                    name: { type: 'string', description: '用户姓名' },
                    email: { type: 'string', description: '用户邮箱' },
                    createdAt: {
                      type: 'string',
                      format: 'date-time',
                      description: '创建时间',
                    },
                  },
                },
              },
              message: { type: 'string', description: '响应消息' },
            },
          },
          500: {
            type: 'object',
            properties: {
              success: { type: 'boolean', description: '请求是否成功' },
              message: { type: 'string', description: '错误消息' },
            },
          },
        },
      },
    },
    getAllUsers
  );

  // 创建新用户
  app.post(
    '/',
    {
      preHandler: [authenticateToken],
      schema: {
        description: '创建新用户',
        tags: ['users'],
        summary: '创建用户',
        body: {
          type: 'object',
          required: ['name', 'email'],
          properties: {
            name: {
              type: 'string',
              description: '用户姓名',
              minLength: 1,
              maxLength: 100,
            },
            email: {
              type: 'string',
              format: 'email',
              description: '用户邮箱',
              minLength: 5,
              maxLength: 255,
            },
          },
        },
        response: {
          201: {
            type: 'object',
            properties: {
              success: { type: 'boolean', description: '请求是否成功' },
              data: {
                type: 'object',
                properties: {
                  id: { type: 'number', description: '用户ID' },
                  name: { type: 'string', description: '用户姓名' },
                  email: { type: 'string', description: '用户邮箱' },
                  createdAt: {
                    type: 'string',
                    format: 'date-time',
                    description: '创建时间',
                  },
                },
              },
              message: { type: 'string', description: '响应消息' },
            },
          },
          400: {
            type: 'object',
            properties: {
              success: { type: 'boolean', description: '请求是否成功' },
              message: { type: 'string', description: '错误消息' },
              errors: {
                type: 'array',
                items: { type: 'string' },
                description: '详细错误信息',
              },
            },
          },
          500: {
            type: 'object',
            properties: {
              success: { type: 'boolean', description: '请求是否成功' },
              message: { type: 'string', description: '错误消息' },
            },
          },
        },
      },
    },
    createUser
  );

  // 根据ID获取用户
  app.get(
    '/:id',
    {
      preHandler: [authenticateToken, requirePermission('user', 'read')],
      schema: {
        description: '根据ID获取用户详情',
        tags: ['users'],
        summary: '获取用户详情',
        params: {
          type: 'object',
          properties: {
            id: { type: 'number', description: '用户ID' }
          },
          required: ['id']
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  name: { type: 'string' },
                  email: { type: 'string' },
                  phone: { type: 'string' },
                  avatar: { type: 'string' },
                  isActive: { type: 'boolean' },
                  isVerified: { type: 'boolean' },
                  lastLoginAt: { type: 'string', format: 'date-time' },
                  createdAt: { type: 'string', format: 'date-time' },
                  userRoles: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        role: {
                          type: 'object',
                          properties: {
                            id: { type: 'number' },
                            name: { type: 'string' },
                            displayName: { type: 'string' }
                          }
                        }
                      }
                    }
                  }
                }
              },
              message: { type: 'string' }
            }
          },
          404: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' }
            }
          }
        }
      }
    },
    async (request: any, reply: any) => {
      try {
        const { id } = request.params as { id: number };
        const user = await userService.getById(id);

        if (!user) {
          return reply.status(404).send({
            success: false,
            message: '用户不存在'
          });
        }

        return reply.send({
          success: true,
          data: user,
          message: '获取用户详情成功'
        });
      } catch (error) {
        return reply.status(500).send({
          success: false,
          message: '获取用户详情失败'
        });
      }
    }
  );

  // 更新用户
  app.put(
    '/:id',
    {
      preHandler: [authenticateToken, requirePermission('user', 'update')],
      schema: {
        description: '更新用户信息',
        tags: ['users'],
        summary: '更新用户',
        params: {
          type: 'object',
          properties: {
            id: { type: 'number', description: '用户ID' }
          },
          required: ['id']
        },
        body: {
          type: 'object',
          properties: {
            name: { type: 'string', minLength: 1, maxLength: 100 },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            avatar: { type: 'string' },
            isActive: { type: 'boolean' },
            isVerified: { type: 'boolean' }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'object' },
              message: { type: 'string' }
            }
          }
        }
      }
    },
    async (request: any, reply: any) => {
      try {
        const { id } = request.params as { id: number };
        const updateData = request.body as any;
        const updatedBy = (request as any).user?.id;

        const user = await userService.update(id, updateData, updatedBy);

        return reply.send({
          success: true,
          data: user,
          message: '用户更新成功'
        });
      } catch (error) {
        return reply.status(400).send({
          success: false,
          message: error instanceof Error ? error.message : '用户更新失败'
        });
      }
    }
  );

  // 删除用户
  app.delete(
    '/:id',
    {
      preHandler: [authenticateToken, requirePermission('user', 'delete')],
      schema: {
        description: '删除用户',
        tags: ['users'],
        summary: '删除用户',
        params: {
          type: 'object',
          properties: {
            id: { type: 'number', description: '用户ID' }
          },
          required: ['id']
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' }
            }
          }
        }
      }
    },
    async (request: any, reply: any) => {
      try {
        const { id } = request.params as { id: number };
        const deletedBy = (request as any).user?.id;

        await userService.delete(id, deletedBy);

        return reply.send({
          success: true,
          message: '用户删除成功'
        });
      } catch (error) {
        return reply.status(400).send({
          success: false,
          message: error instanceof Error ? error.message : '用户删除失败'
        });
      }
    }
  );

  // 激活/停用用户
  app.patch(
    '/:id/toggle-active',
    {
      preHandler: [authenticateToken, requirePermission('user', 'update')],
      schema: {
        description: '激活或停用用户',
        tags: ['users'],
        summary: '切换用户状态',
        params: {
          type: 'object',
          properties: {
            id: { type: 'number', description: '用户ID' }
          },
          required: ['id']
        },
        body: {
          type: 'object',
          required: ['isActive'],
          properties: {
            isActive: { type: 'boolean', description: '是否激活' }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'object' },
              message: { type: 'string' }
            }
          }
        }
      }
    },
    async (request: any, reply: any) => {
      try {
        const { id } = request.params as { id: number };
        const { isActive } = request.body as { isActive: boolean };
        const updatedBy = (request as any).user?.id;

        const user = await userService.toggleActive(id, isActive, updatedBy);

        return reply.send({
          success: true,
          data: user,
          message: `用户${isActive ? '激活' : '停用'}成功`
        });
      } catch (error) {
        return reply.status(400).send({
          success: false,
          message: error instanceof Error ? error.message : '用户状态更新失败'
        });
      }
    }
  );

  // 获取用户统计信息
  app.get(
    '/stats/overview',
    {
      preHandler: [authenticateToken, requirePermission('user', 'read')],
      schema: {
        description: '获取用户统计信息',
        tags: ['users'],
        summary: '获取用户概览统计',
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  totalUsers: { type: 'number' },
                  activeUsers: { type: 'number' },
                  verifiedUsers: { type: 'number' },
                  recentUsers: { type: 'number' },
                  inactiveUsers: { type: 'number' },
                  unverifiedUsers: { type: 'number' }
                }
              },
              message: { type: 'string' }
            }
          }
        }
      }
    },
    async (request: any, reply: any) => {
      try {
        const stats = await userService.getStats();

        return reply.send({
          success: true,
          data: stats,
          message: '获取用户统计成功'
        });
      } catch (error) {
        return reply.status(500).send({
          success: false,
          message: '获取用户统计失败'
        });
      }
    }
  );
}
