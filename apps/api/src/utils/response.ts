/**
 * API响应处理工具
 * 统一处理API响应格式，避免重复代码
 */

import { FastifyReply } from 'fastify';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
  errors?: string[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
  errors?: string[];
}

/**
 * 成功响应
 */
export function successResponse<T>(
  reply: FastifyReply,
  data: T,
  message: string = '操作成功',
  statusCode: number = 200
): FastifyReply {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
  };
  return reply.status(statusCode).send(response);
}

/**
 * 创建成功响应
 */
export function createdResponse<T>(
  reply: FastifyReply,
  data: T,
  message: string = '创建成功'
): FastifyReply {
  return successResponse(reply, data, message, 201);
}

/**
 * 分页响应
 */
export function paginatedResponse<T>(
  reply: FastifyReply,
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
  },
  message: string = '获取数据成功'
): FastifyReply {
  const response: ApiResponse<T[]> = {
    success: true,
    data,
    message,
    pagination: {
      ...pagination,
      pages: Math.ceil(pagination.total / pagination.limit),
    },
  };
  return reply.status(200).send(response);
}

/**
 * 错误响应
 */
export function errorResponse(
  reply: FastifyReply,
  message: string,
  statusCode: number = 400,
  error?: string,
  errors?: string[]
): FastifyReply {
  const response: ErrorResponse = {
    success: false,
    message,
    ...(error && { error }),
    ...(errors && { errors }),
  };
  return reply.status(statusCode).send(response);
}

/**
 * 服务器错误响应
 */
export function serverErrorResponse(
  reply: FastifyReply,
  message: string = '服务器内部错误',
  error?: string
): FastifyReply {
  return errorResponse(reply, message, 500, error);
}

/**
 * 未找到响应
 */
export function notFoundResponse(
  reply: FastifyReply,
  message: string = '资源不存在'
): FastifyReply {
  return errorResponse(reply, message, 404);
}

/**
 * 未授权响应
 */
export function unauthorizedResponse(
  reply: FastifyReply,
  message: string = '未授权访问'
): FastifyReply {
  return errorResponse(reply, message, 401);
}

/**
 * 禁止访问响应
 */
export function forbiddenResponse(
  reply: FastifyReply,
  message: string = '禁止访问'
): FastifyReply {
  return errorResponse(reply, message, 403);
}

/**
 * 验证错误响应
 */
export function validationErrorResponse(
  reply: FastifyReply,
  message: string = '输入验证失败',
  errors?: string[]
): FastifyReply {
  return errorResponse(reply, message, 400, undefined, errors);
}

/**
 * 异步路由处理器包装器
 * 统一处理异步路由的错误
 */
export function asyncHandler<T extends any[]>(
  handler: (...args: T) => Promise<any>
) {
  return async (...args: T) => {
    try {
      return await handler(...args);
    } catch (error: any) {
      const reply = args[1] as FastifyReply;
      return serverErrorResponse(
        reply,
        '服务器内部错误',
        error.message || error.toString()
      );
    }
  };
}

/**
 * 路由处理器包装器（带错误处理）
 */
export function routeHandler<T extends any[]>(
  handler: (...args: T) => Promise<any>
) {
  return async (...args: T) => {
    try {
      return await handler(...args);
    } catch (error: any) {
      const reply = args[1] as FastifyReply;
      const errorMessage = error.message || '操作失败';
      const statusCode = error.statusCode || 500;

      return errorResponse(reply, errorMessage, statusCode);
    }
  };
}
