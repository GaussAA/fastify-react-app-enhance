import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { appConfig } from './config/env.js'; // 导入统一配置
import { userRoutes } from './routes/user.route.js';
import { authRoutes } from './routes/auth.route.js';
import { roleRoutes } from './routes/role.route.js';
import { permissionRoutes } from './routes/permission.route.js';
import { auditRoutes } from './routes/audit.route.js';
import { llmSimpleRoutes } from './routes/llm-simple.route.js';
import { aiConversationRoutes } from './routes/ai-conversation.route.js';
import {
  errorHandler,
  notFoundHandler,
} from './middlewares/error.middleware.js';
import { getAIIntegrationService } from './services/ai-integration.service.js';
import { prisma } from './prisma-client.js';
import rateLimit from '@fastify/rate-limit';
import helmet from '@fastify/helmet';
import { FastifyRequest, FastifyReply } from 'fastify';
// Use Fastify's built-in logger via the `logger` option and app.log for logs

// 扩展 Fastify 实例类型
declare module 'fastify' {
  interface FastifyInstance {
    prisma: typeof prisma;
  }
}

import { logging } from './config/env.js';

export const app = Fastify({
  logger: { level: logging.level },
  bodyLimit: 1048576, // 1MB
});

// 注册 Prisma 客户端到 Fastify 实例
app.decorate('prisma', prisma);

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
        url: `http://${appConfig.host}:${appConfig.port}`,
        description: '开发环境',
      },
    ],
    tags: [
      { name: 'users', description: '用户相关操作' },
      { name: 'auth', description: '认证相关操作' },
      { name: 'roles', description: '角色管理' },
      { name: 'permissions', description: '权限管理' },
      { name: 'audit', description: '审计日志' },
      { name: 'LLM', description: '大模型服务' },
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
    onRequest: function (
      _request: FastifyRequest,
      _reply: FastifyReply,
      next: () => void
    ) {
      next();
    },
    preHandler: function (
      _request: FastifyRequest,
      _reply: FastifyReply,
      next: () => void
    ) {
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
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

// 注册速率限制
app.register(rateLimit, {
  max: 100, // 最大请求数
  timeWindow: '1 minute', // 时间窗口
  errorResponseBuilder: (_request: FastifyRequest, _context: any) => ({
    success: false,
    message: '请求过于频繁，请稍后再试',
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfter: 60,
  }),
});

// 配置 JSON 解析器
app.addContentTypeParser(
  'application/json',
  { parseAs: 'string' },
  function (req, body, done) {
    try {
      // 对于DELETE请求，通常没有请求体，直接返回空对象
      if (
        req.method === 'DELETE' &&
        (!body || (body as string).trim() === '')
      ) {
        done(null, {});
        return;
      }

      const json = JSON.parse(body as string);
      done(null, json);
    } catch (err) {
      done(err as any, undefined);
    }
  }
);

// 注册CORS中间件
app.register(cors, {
  // 限制CORS来源
  origin: appConfig.cors.origin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
// 注册错误处理中间件
app.setErrorHandler(errorHandler);
app.setNotFoundHandler(notFoundHandler);

// 注册路由
app.register(authRoutes, { prefix: '/api/auth' });
app.register(userRoutes, { prefix: '/api/users' });
app.register(roleRoutes, { prefix: '/api/roles' });
app.register(permissionRoutes, { prefix: '/api/permissions' });
app.register(auditRoutes, { prefix: '/api/audit' });
app.register(llmSimpleRoutes, { prefix: '/api/llm' });
app.register(aiConversationRoutes, { prefix: '/api/ai' });

// 注册健康检查端点
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
  async (_req: FastifyRequest, _reply: FastifyReply) => {
    return { ok: true, message: 'Fastify API running' };
  }
);

// 初始化AI系统（在应用启动前）
app.addHook('onReady', async () => {
  try {
    console.log('🤖 初始化AI系统...');

    // 初始化AI集成服务
    const aiService = getAIIntegrationService(prisma, app);

    // 系统健康检查
    const health = await aiService.getSystemHealth();
    console.log('✅ AI系统初始化完成，状态:', health.status);
  } catch (error) {
    console.error('❌ AI系统初始化失败:', error);
  }
});

// 设置AI监控中间件（在应用启动前）
app.addHook(
  'onRequest',
  async (request: FastifyRequest, _reply: FastifyReply) => {
    // 简单的请求日志
    console.log(`${request.method} ${request.url}`);
  }
);

// 导出 build 函数用于测试
export const build = () => app;
