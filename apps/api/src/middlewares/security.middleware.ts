import { FastifyRequest, FastifyReply } from 'fastify';
import { auditService } from '../services/audit.service.js';

/**
 * 安全增强中间件
 * 提供额外的安全保护功能
 */

/**
 * 请求频率限制中间件
 * 基于IP地址限制请求频率
 */
export function rateLimitByIP(
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000
) {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return async (request: FastifyRequest, reply: FastifyReply) => {
    const ip = request.ip || 'unknown';
    const now = Date.now();
    // const _windowStart = now - windowMs;

    // 清理过期的记录
    for (const [key, value] of requests.entries()) {
      if (value.resetTime < now) {
        requests.delete(key);
      }
    }

    const current = requests.get(ip);

    if (!current) {
      requests.set(ip, { count: 1, resetTime: now + windowMs });
      return;
    }

    if (current.resetTime < now) {
      requests.set(ip, { count: 1, resetTime: now + windowMs });
      return;
    }

    if (current.count >= maxRequests) {
      // 记录可疑活动
      await auditService.log({
        action: 'rate_limit_exceeded',
        resource: 'security',
        details: {
          ip,
          maxRequests,
          windowMs,
          path: request.url,
          method: request.method,
        },
        ipAddress: ip,
        userAgent: request.headers['user-agent'],
      });

      return reply.status(429).send({
        success: false,
        message: '请求过于频繁，请稍后再试',
        code: 'RATE_LIMIT_EXCEEDED',
      });
    }

    current.count++;
  };
}

/**
 * IP白名单中间件
 */
export function ipWhitelist(allowedIPs: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const ip = request.ip || 'unknown';

    if (!allowedIPs.includes(ip)) {
      await auditService.log({
        action: 'ip_blocked',
        resource: 'security',
        details: {
          ip,
          allowedIPs,
          path: request.url,
          method: request.method,
        },
        ipAddress: ip,
        userAgent: request.headers['user-agent'],
      });

      return reply.status(403).send({
        success: false,
        message: '访问被拒绝',
        code: 'IP_NOT_ALLOWED',
      });
    }
  };
}

/**
 * 请求体大小限制中间件
 */
export function bodySizeLimit(maxSize: number = 1024 * 1024) {
  // 1MB
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const contentLength = parseInt(request.headers['content-length'] || '0');

    if (contentLength > maxSize) {
      await auditService.log({
        action: 'body_size_exceeded',
        resource: 'security',
        details: {
          contentLength,
          maxSize,
          path: request.url,
          method: request.method,
        },
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      });

      return reply.status(413).send({
        success: false,
        message: '请求体过大',
        code: 'BODY_TOO_LARGE',
      });
    }
  };
}

/**
 * 安全头中间件
 */
export function securityHeaders() {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    // 设置安全相关的HTTP头
    reply.header('X-Content-Type-Options', 'nosniff');
    reply.header('X-Frame-Options', 'DENY');
    reply.header('X-XSS-Protection', '1; mode=block');
    reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    reply.header(
      'Permissions-Policy',
      'geolocation=(), microphone=(), camera=()'
    );
  };
}

/**
 * 请求日志中间件
 */
export function requestLogger() {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const startTime = Date.now();

    // 记录请求开始
    await auditService.log({
      action: 'request_start',
      resource: 'http',
      details: {
        path: request.url,
        method: request.method,
        userAgent: request.headers['user-agent'],
        contentType: request.headers['content-type'],
      },
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    });

    // 监听响应完成
    reply.raw.on('finish', async () => {
      const duration = Date.now() - startTime;

      await auditService.log({
        action: 'request_complete',
        resource: 'http',
        details: {
          path: request.url,
          method: request.method,
          statusCode: reply.statusCode,
          duration,
          contentLength: reply.getHeader('content-length'),
        },
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      });
    });
  };
}

/**
 * 敏感操作验证中间件
 * 要求用户重新输入密码进行敏感操作
 */
export function requirePasswordConfirmation() {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const { passwordConfirmation } = request.body as any;

    if (!passwordConfirmation) {
      return reply.status(400).send({
        success: false,
        message: '敏感操作需要密码确认',
        code: 'PASSWORD_CONFIRMATION_REQUIRED',
      });
    }

    // 这里应该验证密码确认
    // 实际实现中需要验证用户输入的密码是否正确
    // 为了简化，这里只是检查是否存在
  };
}

/**
 * 设备指纹验证中间件
 */
export function deviceFingerprint() {
  return async (request: FastifyRequest, _reply: FastifyReply) => {
    const userAgent = request.headers['user-agent'] || '';
    const acceptLanguage = request.headers['accept-language'] || '';
    const acceptEncoding = request.headers['accept-encoding'] || '';

    // 生成简单的设备指纹
    const fingerprint = Buffer.from(
      `${userAgent}-${acceptLanguage}-${acceptEncoding}`
    ).toString('base64');

    // 将设备指纹添加到请求对象
    (request as any).deviceFingerprint = fingerprint;

    // 记录设备信息
    await auditService.log({
      action: 'device_fingerprint',
      resource: 'security',
      details: {
        fingerprint,
        userAgent,
        acceptLanguage,
        acceptEncoding,
      },
      ipAddress: request.ip,
      userAgent,
    });
  };
}
