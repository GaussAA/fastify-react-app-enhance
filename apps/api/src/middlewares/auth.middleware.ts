import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import { getPermissionService } from '../services/service-factory.js';
import { auditService } from '../services/audit.service.js';

interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    id: number;
    email: string;
    name: string;
    permissions?: string[];
    roles?: string[];
  };
  headers: any;
  ip: string;
  url: string;
  method: string;
  log: any;
}

/**
 * JWT身份验证中间件
 * 验证请求头中的Bearer token
 */
export async function authenticateToken(
  request: AuthenticatedRequest,
  reply: FastifyReply
) {
  try {
    const authHeader = request.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return reply.status(401).send({
        success: false,
        message: '访问令牌缺失',
        code: 'MISSING_TOKEN',
      });
    }

    // 验证JWT token
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      return reply.status(401).send({ message: 'JWT configuration error' });
    }

    const decoded = jwt.verify(token, jwtSecret) as any;

    // 获取prisma实例
    const prisma = (request as any).server.prisma;
    const permissionService = getPermissionService(prisma);

    // 获取用户权限和角色
    const [permissions, userRoles] = await Promise.all([
      permissionService.getUserPermissions(decoded.userId),
      permissionService.getUserRoles(decoded.userId),
    ]);

    // 将用户信息添加到请求对象
    request.user = {
      id: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      permissions: permissions.map(p => p.name),
      roles: userRoles.map((ur: any) => ur.role.name),
    };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return reply.status(401).send({
        success: false,
        message: '访问令牌已过期',
        code: 'TOKEN_EXPIRED',
      });
    } else if (error instanceof jwt.JsonWebTokenError) {
      return reply.status(401).send({
        success: false,
        message: '无效的访问令牌',
        code: 'INVALID_TOKEN',
      });
    } else {
      return reply.status(500).send({
        success: false,
        message: '身份验证失败',
        code: 'AUTH_ERROR',
      });
    }
  }
}

/**
 * 可选身份验证中间件
 * 如果提供了token则验证，否则继续执行
 */
export async function optionalAuth(
  request: AuthenticatedRequest,
  _reply: FastifyReply
) {
  try {
    const authHeader = request.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const jwtSecret = process.env.JWT_SECRET;

      if (jwtSecret) {
        try {
          const decoded = jwt.verify(token, jwtSecret) as any;
          request.user = {
            id: decoded.userId,
            email: decoded.email,
            name: decoded.name,
          };
        } catch (error) {
          // 可选认证失败时不返回错误，继续执行
          // request.log.warn('Optional authentication failed:', error);
        }
      }
    }
  } catch (error) {
    // 可选认证失败时不返回错误，继续执行
    // request.log.warn('Optional authentication failed:', error);
  }
}

/**
 * 角色验证中间件
 * 检查用户是否具有指定角色
 */
export function requireRole(roles: string[]) {
  return async (request: AuthenticatedRequest, reply: FastifyReply) => {
    if (!request.user) {
      return reply.status(401).send({
        success: false,
        message: '需要身份验证',
        code: 'AUTH_REQUIRED',
      });
    }

    const userRoles = request.user.roles || [];
    const hasRequiredRole = roles.some(role => userRoles.includes(role));

    if (!hasRequiredRole) {
      // 记录权限拒绝的审计日志
      await auditService.log({
        userId: request.user.id,
        action: 'access_denied',
        resource: 'role_check',
        details: {
          requiredRoles: roles,
          userRoles,
          path: request.url,
          method: request.method,
        },
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      });

      return reply.status(403).send({
        success: false,
        message: '权限不足，需要以下角色之一: ' + roles.join(', '),
        code: 'INSUFFICIENT_ROLE',
      });
    }

    return;
  };
}

/**
 * 权限验证中间件
 * 检查用户是否具有指定权限
 */
export function requirePermission(resource: string, action: string) {
  return async (request: AuthenticatedRequest, reply: FastifyReply) => {
    if (!request.user) {
      return reply.status(401).send({
        success: false,
        message: '需要身份验证',
        code: 'AUTH_REQUIRED',
      });
    }

    const prisma = (request as any).server.prisma;
    const permissionService = getPermissionService(prisma);
    const hasPermission = await permissionService.hasPermission(
      request.user.id,
      resource,
      action
    );

    if (!hasPermission) {
      // 记录权限拒绝的审计日志
      await auditService.log({
        userId: request.user.id,
        action: 'access_denied',
        resource: 'permission_check',
        details: {
          requiredPermission: `${resource}:${action}`,
          userPermissions: request.user.permissions,
          path: request.url,
          method: request.method,
        },
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      });

      return reply.status(403).send({
        success: false,
        message: `权限不足，需要权限: ${resource}:${action}`,
        code: 'INSUFFICIENT_PERMISSION',
      });
    }

    return;
  };
}

/**
 * 组合权限验证中间件
 * 支持多个权限的AND/OR逻辑
 */
export function requirePermissions(
  permissions: Array<{ resource: string; action: string }>,
  logic: 'AND' | 'OR' = 'AND'
) {
  return async (request: AuthenticatedRequest, reply: FastifyReply) => {
    if (!request.user) {
      return reply.status(401).send({
        success: false,
        message: '需要身份验证',
        code: 'AUTH_REQUIRED',
      });
    }

    const prisma = (request as any).server.prisma;
    const permissionService = getPermissionService(prisma);
    const permissionChecks = await Promise.all(
      permissions.map(p =>
        permissionService.hasPermission(request.user!.id, p.resource, p.action)
      )
    );

    const hasPermission =
      logic === 'AND'
        ? permissionChecks.every((check: boolean) => check)
        : permissionChecks.some((check: boolean) => check);

    if (!hasPermission) {
      // 记录权限拒绝的审计日志
      await auditService.log({
        userId: request.user.id,
        action: 'access_denied',
        resource: 'permission_check',
        details: {
          requiredPermissions: permissions,
          logic,
          userPermissions: request.user.permissions,
          path: request.url,
          method: request.method,
        },
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      });

      return reply.status(403).send({
        success: false,
        message: `权限不足，需要权限: ${permissions.map(p => `${p.resource}:${p.action}`).join(logic === 'AND' ? ' 且 ' : ' 或 ')}`,
        code: 'INSUFFICIENT_PERMISSION',
      });
    }

    return;
  };
}

/**
 * 生成JWT token
 */
export function generateToken(payload: {
  userId: number;
  email: string;
  name: string;
}): string {
  const jwtSecret = process.env.JWT_SECRET;
  const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';

  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  return jwt.sign(
    {
      userId: payload.userId,
      email: payload.email,
      name: payload.name,
      iat: Math.floor(Date.now() / 1000),
    },
    jwtSecret,
    {
      expiresIn: jwtExpiresIn,
      issuer: 'fastify-react-app',
      audience: 'fastify-react-app-users',
    } as jwt.SignOptions
  );
}

/**
 * 生成Refresh Token
 */
export function generateRefreshToken(payload: {
  userId: number;
  email: string;
  name: string;
}): string {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  return jwt.sign(
    {
      userId: payload.userId,
      email: payload.email,
      name: payload.name,
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000),
    },
    jwtSecret,
    {
      expiresIn: '7d', // Refresh token有效期7天
      issuer: 'fastify-react-app',
      audience: 'fastify-react-app-users',
    } as jwt.SignOptions
  );
}

/**
 * 验证JWT token
 */
export function verifyToken(token: string): any {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  return jwt.verify(token, jwtSecret);
}

/**
 * 验证Refresh Token
 */
export function verifyRefreshToken(token: string): any {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  const decoded = jwt.verify(token, jwtSecret) as any;
  if (decoded.type !== 'refresh') {
    throw new Error('Invalid token type');
  }
  return decoded;
}
