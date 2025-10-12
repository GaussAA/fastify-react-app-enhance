import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import dotenv from 'dotenv';
import { userRoutes } from './routes/user.route.js';
import { authRoutes } from './routes/auth.route.js';
import { roleRoutes } from './routes/role.route.js';
import { permissionRoutes } from './routes/permission.route.js';
import { auditRoutes } from './routes/audit.route.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import rateLimit from '@fastify/rate-limit';
import helmet from '@fastify/helmet';
// Use Fastify's built-in logger via the `logger` option and app.log for logs

dotenv.config();

export const app = Fastify({
  logger: { level: process.env.LOG_LEVEL || 'info' },
});

// 注册 Swagger 插件
app.register(swagger, {
  openapi: {
    openapi: '3.0.0',
    info: {
      title: 'Fastify React App API',
      description: 'Fastify + React 全栈应用 API 文档',
      version: '1.0.0',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 8001}`,
        description: '开发环境',
      },
    ],
    tags: [
      { name: 'users', description: '用户相关操作' },
      { name: 'auth', description: '认证相关操作' },
      { name: 'roles', description: '角色管理' },
      { name: 'permissions', description: '权限管理' },
      { name: 'audit', description: '审计日志' },
      { name: 'health', description: '健康检查' },
    ],
  },
});

// 注册 Swagger UI 插件
app.register(swaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false,
  },
  uiHooks: {
    onRequest: function (_request, _reply, next) {
      next();
    },
    preHandler: function (_request, _reply, next) {
      next();
    },
  },
  staticCSP: true,
  transformStaticCSP: header => header,
  transformSpecification: (swaggerObject, _request, _reply) => {
    return swaggerObject;
  },
  transformSpecificationClone: true,
});

// 注册安全头
app.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false
});

// 注册速率限制
app.register(rateLimit, {
  max: 100, // 最大请求数
  timeWindow: '1 minute', // 时间窗口
  errorResponseBuilder: (request, context) => ({
    success: false,
    message: '请求过于频繁，请稍后再试',
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfter: Math.round(context.timeWindow / 1000)
  })
});

app.register(cors, {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
});
// 注册错误处理中间件
app.setErrorHandler(errorHandler);
app.setNotFoundHandler(notFoundHandler);

app.register(authRoutes, { prefix: '/api/auth' });
app.register(userRoutes, { prefix: '/api/users' });
app.register(roleRoutes, { prefix: '/api/roles' });
app.register(permissionRoutes, { prefix: '/api/permissions' });
app.register(auditRoutes, { prefix: '/api/audit' });

app.get(
  '/',
  {
    schema: {
      description: 'API 健康检查端点',
      tags: ['health'],
      summary: '检查 API 服务状态',
      response: {
        200: {
          type: 'object',
          properties: {
            ok: { type: 'boolean', description: '服务状态' },
            message: { type: 'string', description: '状态消息' },
          },
        },
      },
    },
  },
  async (_req, _reply) => {
    return { ok: true, message: 'Fastify API running' };
  }
);

// 导出 build 函数用于测试
export const build = () => app;
