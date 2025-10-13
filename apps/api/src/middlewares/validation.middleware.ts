import { FastifyRequest, FastifyReply } from 'fastify';

/**
 * 输入验证和清理中间件
 */
export class ValidationMiddleware {
  /**
   * 清理字符串输入
   */
  static sanitizeString(input: string): string {
    if (typeof input !== 'string') {
      return '';
    }

    return input
      .trim()
      .replace(/[<>]/g, '') // 移除潜在的HTML标签
      .replace(/javascript:/gi, '') // 移除javascript:协议
      .replace(/on\w+=/gi, '') // 移除事件处理器
      .substring(0, 1000); // 限制长度
  }

  /**
   * 验证邮箱格式
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 255;
  }

  /**
   * 验证密码强度
   */
  static isValidPassword(password: string): boolean {
    // 至少8位，包含大小写字母、数字和特殊字符
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,128}$/;
    return passwordRegex.test(password);
  }

  /**
   * 验证用户名
   */
  static isValidName(name: string): boolean {
    if (!name || typeof name !== 'string') {
      return false;
    }

    const sanitized = this.sanitizeString(name);
    return sanitized.length >= 1 && sanitized.length <= 50;
  }

  /**
   * 用户输入验证中间件
   */
  static validateUserInput(
    request: FastifyRequest,
    reply: FastifyReply,
    next: () => void
  ) {
    try {
      const body = request.body as any;

      if (body) {
        // 清理字符串字段
        if (body.name) {
          body.name = this.sanitizeString(body.name);
          if (!this.isValidName(body.name)) {
            return reply.status(400).send({
              success: false,
              message: '用户名格式不正确，长度应在1-50字符之间',
            });
          }
        }

        if (body.email) {
          const sanitizedEmail = this.sanitizeString(body.email);
          body.email = sanitizedEmail ? sanitizedEmail.toLowerCase() : '';
          if (!this.isValidEmail(body.email)) {
            return reply.status(400).send({
              success: false,
              message: '邮箱格式不正确',
            });
          }
        }

        if (body.password) {
          if (!this.isValidPassword(body.password)) {
            return reply.status(400).send({
              success: false,
              message:
                '密码强度不足，需要至少8位，包含大小写字母、数字和特殊字符',
            });
          }
        }
      }

      next();
    } catch {
      return reply.status(400).send({
        success: false,
        message: '输入验证失败',
      });
    }
  }

  /**
   * 防止SQL注入的查询参数验证
   */
  static validateQueryParams(
    request: FastifyRequest,
    reply: FastifyReply,
    next: () => void
  ) {
    try {
      const query = request.query as any;

      if (query) {
        // 检查查询参数中的危险字符
        const dangerousPatterns = [
          /union\s+select/i,
          /drop\s+table/i,
          /delete\s+from/i,
          /insert\s+into/i,
          /update\s+set/i,
          /script\s*>/i,
          /javascript:/i,
          /on\w+\s*=/i,
        ];

        for (const [, value] of Object.entries(query)) {
          if (typeof value === 'string') {
            for (const pattern of dangerousPatterns) {
              if (pattern.test(value)) {
                return reply.status(400).send({
                  success: false,
                  message: '查询参数包含非法字符',
                });
              }
            }
          }
        }
      }

      next();
    } catch {
      return reply.status(400).send({
        success: false,
        message: '查询参数验证失败',
      });
    }
  }

  /**
   * 限制请求体大小
   */
  static limitBodySize(maxSize: number = 1024 * 1024) {
    // 默认1MB
    return (request: FastifyRequest, reply: FastifyReply, next: () => void) => {
      const contentLength = request.headers['content-length'];

      if (contentLength && parseInt(contentLength) > maxSize) {
        return reply.status(413).send({
          success: false,
          message: '请求体过大',
        });
      }

      next();
    };
  }
}
