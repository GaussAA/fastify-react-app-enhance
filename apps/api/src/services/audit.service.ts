import { prisma } from '../prisma-client.js';
import { logger } from '../utils/logger.js';

export interface AuditLogData {
    userId?: number;
    action: string;
    resource: string;
    resourceId?: string;
    details?: any;
    ipAddress?: string;
    userAgent?: string;
}

export interface AuditLogQuery {
    userId?: number;
    action?: string;
    resource?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
}

export const auditService = {
    /**
     * 记录审计日志
     */
    async log(data: AuditLogData): Promise<void> {
        try {
            await prisma.auditLog.create({
                data: {
                    userId: data.userId,
                    action: data.action,
                    resource: data.resource,
                    resourceId: data.resourceId,
                    details: data.details,
                    ipAddress: data.ipAddress,
                    userAgent: data.userAgent,
                },
            });

            logger.info('Audit log recorded', {
                action: data.action,
                resource: data.resource,
                userId: data.userId,
            });
        } catch (error) {
            logger.error('Failed to record audit log:', error);
            // 审计日志记录失败不应该影响主业务流程
        }
    },

    /**
     * 查询审计日志
     */
    async getLogs(query: AuditLogQuery) {
        const {
            userId,
            action,
            resource,
            startDate,
            endDate,
            page = 1,
            limit = 20,
        } = query;

        const where: any = {};

        if (userId) where.userId = userId;
        if (action) where.action = action;
        if (resource) where.resource = resource;
        if (startDate || endDate) {
            where.timestamp = {};
            if (startDate) where.timestamp.gte = startDate;
            if (endDate) where.timestamp.lte = endDate;
        }

        const [logs, total] = await Promise.all([
            prisma.auditLog.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
                orderBy: {
                    timestamp: 'desc',
                },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.auditLog.count({ where }),
        ]);

        return {
            logs,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    },

    /**
     * 获取用户活动统计
     */
    async getUserActivityStats(userId: number, days: number = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const stats = await prisma.auditLog.groupBy({
            by: ['action'],
            where: {
                userId,
                timestamp: {
                    gte: startDate,
                },
            },
            _count: {
                action: true,
            },
        });

        return stats.map(stat => ({
            action: stat.action,
            count: stat._count.action,
        }));
    },

    /**
     * 清理过期审计日志
     */
    async cleanupExpiredLogs(daysToKeep: number = 365) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

        const result = await prisma.auditLog.deleteMany({
            where: {
                timestamp: {
                    lt: cutoffDate,
                },
            },
        });

        logger.info(`Cleaned up ${result.count} expired audit logs`);
        return result.count;
    },
};
