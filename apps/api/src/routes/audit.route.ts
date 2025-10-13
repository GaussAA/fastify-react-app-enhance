import { FastifyInstance } from 'fastify';
import { auditService } from '../services/audit.service.js';
import {
  authenticateToken,
  requirePermission,
} from '../middlewares/auth.middleware.js';

export async function auditRoutes(app: FastifyInstance) {
  // 获取审计日志
  app.get(
    '/',
    {
      preHandler: [authenticateToken, requirePermission('audit', 'read')],
      schema: {
        description: '获取审计日志列表',
        tags: ['audit'],
        summary: '获取审计日志',
        querystring: {
          type: 'object',
          properties: {
            userId: { type: 'number', description: '用户ID' },
            action: { type: 'string', description: '操作类型' },
            resource: { type: 'string', description: '资源类型' },
            startDate: {
              type: 'string',
              format: 'date-time',
              description: '开始时间',
            },
            endDate: {
              type: 'string',
              format: 'date-time',
              description: '结束时间',
            },
            page: {
              type: 'number',
              minimum: 1,
              default: 1,
              description: '页码',
            },
            limit: {
              type: 'number',
              minimum: 1,
              maximum: 100,
              default: 20,
              description: '每页数量',
            },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  logs: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'number' },
                        userId: { type: 'number' },
                        action: { type: 'string' },
                        resource: { type: 'string' },
                        resourceId: { type: 'string' },
                        details: { type: 'object' },
                        ipAddress: { type: 'string' },
                        userAgent: { type: 'string' },
                        timestamp: { type: 'string', format: 'date-time' },
                        user: {
                          type: 'object',
                          properties: {
                            id: { type: 'number' },
                            name: { type: 'string' },
                            email: { type: 'string' },
                          },
                        },
                      },
                    },
                  },
                  pagination: {
                    type: 'object',
                    properties: {
                      page: { type: 'number' },
                      limit: { type: 'number' },
                      total: { type: 'number' },
                      pages: { type: 'number' },
                    },
                  },
                },
              },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const query = request.query as {
          userId?: number;
          action?: string;
          resource?: string;
          startDate?: string;
          endDate?: string;
          page?: number;
          limit?: number;
        };

        const result = await auditService.getLogs({
          userId: query.userId,
          action: query.action,
          resource: query.resource,
          startDate: query.startDate ? new Date(query.startDate) : undefined,
          endDate: query.endDate ? new Date(query.endDate) : undefined,
          page: query.page,
          limit: query.limit,
        });

        return reply.send({
          success: true,
          data: result,
          message: '获取审计日志成功',
        });
      } catch {
        return reply.status(200).send({
          success: false,
          message: '获取审计日志失败',
        });
      }
    }
  );

  // 获取用户活动统计
  app.get(
    '/user/:userId/activity',
    {
      preHandler: [authenticateToken, requirePermission('audit', 'read')],
      schema: {
        description: '获取用户活动统计',
        tags: ['audit'],
        summary: '获取用户活动统计',
        params: {
          type: 'object',
          properties: {
            userId: { type: 'number', description: '用户ID' },
          },
          required: ['userId'],
        },
        querystring: {
          type: 'object',
          properties: {
            days: {
              type: 'number',
              minimum: 1,
              maximum: 365,
              default: 30,
              description: '统计天数',
            },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    action: { type: 'string' },
                    count: { type: 'number' },
                  },
                },
              },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { userId } = request.params as { userId: number };
        const { days } = request.query as { days?: number };

        const stats = await auditService.getUserActivityStats(userId, days);

        return reply.send({
          success: true,
          data: stats,
          message: '获取用户活动统计成功',
        });
      } catch {
        return reply.status(200).send({
          success: false,
          message: '获取用户活动统计失败',
        });
      }
    }
  );

  // 清理过期审计日志
  app.delete(
    '/cleanup',
    {
      preHandler: [authenticateToken, requirePermission('audit', 'delete')],
      schema: {
        description: '清理过期审计日志',
        tags: ['audit'],
        summary: '清理过期日志',
        querystring: {
          type: 'object',
          properties: {
            daysToKeep: {
              type: 'number',
              minimum: 30,
              maximum: 3650,
              default: 365,
              description: '保留天数',
            },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  deletedCount: { type: 'number' },
                },
              },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { daysToKeep } = request.query as { daysToKeep?: number };
        const deletedCount = await auditService.cleanupExpiredLogs(daysToKeep);

        return reply.send({
          success: true,
          data: { deletedCount },
          message: `成功清理 ${deletedCount} 条过期审计日志`,
        });
      } catch {
        return reply.status(200).send({
          success: false,
          message: '清理过期审计日志失败',
        });
      }
    }
  );
}
