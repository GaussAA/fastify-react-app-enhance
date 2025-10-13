import { FastifyRequest, FastifyReply, FastifyError } from 'fastify';
import { Prisma } from '@prisma/client';
import { logger } from '../utils/logger.js';

/**
 * 统一错误处理中间件
 */
export function errorHandler(
    error: FastifyError,
    request: FastifyRequest,
    reply: FastifyReply
) {
    // 记录错误日志
    logger.error('API Error:', {
        error: error.message,
        stack: error.stack,
        url: request.url,
        method: request.method,
        ip: request.ip,
        userAgent: request.headers['user-agent'],
        body: request.body
    });

    // 根据错误类型返回不同的响应
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        return handlePrismaError(error, reply);
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
        return reply.status(400).send({
            success: false,
            message: '数据验证失败',
            code: 'VALIDATION_ERROR'
        });
    }

    if (error.statusCode) {
        return reply.status(error.statusCode).send({
            success: false,
            message: error.message,
            code: error.code || 'UNKNOWN_ERROR'
        });
    }

    // 默认服务器错误
    const isDevelopment = process.env.NODE_ENV === 'development';
    return reply.status(500).send({
        success: false,
        message: '服务器内部错误',
        code: 'INTERNAL_SERVER_ERROR',
        ...(isDevelopment && {
            error: error.message,
            stack: error.stack
        })
    });
}

/**
 * 处理Prisma数据库错误
 */
function handlePrismaError(error: Prisma.PrismaClientKnownRequestError, reply: FastifyReply) {
    switch (error.code) {
        case 'P2002':
            // 唯一约束违反
            return reply.status(409).send({
                success: false,
                message: '数据已存在',
                code: 'DUPLICATE_ENTRY'
            });

        case 'P2025':
            // 记录未找到
            return reply.status(404).send({
                success: false,
                message: '记录未找到',
                code: 'NOT_FOUND'
            });

        case 'P2003':
            // 外键约束违反
            return reply.status(400).send({
                success: false,
                message: '关联数据不存在',
                code: 'FOREIGN_KEY_CONSTRAINT'
            });

        case 'P2014':
            // 关系冲突
            return reply.status(400).send({
                success: false,
                message: '数据关系冲突',
                code: 'RELATION_CONFLICT'
            });

        default:
            // 其他数据库错误
            return reply.status(500).send({
                success: false,
                message: '数据库操作失败',
                code: 'DATABASE_ERROR'
            });
    }
}

/**
 * 404错误处理
 */
export function notFoundHandler(request: FastifyRequest, reply: FastifyReply) {
    return reply.status(404).send({
        success: false,
        message: '请求的资源不存在',
        code: 'NOT_FOUND',
        path: request.url
    });
}

/**
 * 请求验证错误处理
 */
export function validationErrorHandler(
    error: FastifyError,
    request: FastifyRequest,
    reply: FastifyReply
) {
    return reply.status(400).send({
        success: false,
        message: '请求参数验证失败',
        code: 'VALIDATION_ERROR',
        details: error.validation || []
    });
}
