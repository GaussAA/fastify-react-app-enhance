# 🛡️ 中间件目录

这个目录用于存放 Fastify 中间件。

## 📁 目录结构

```
middlewares/
├── auth.middleware.ts      # 身份验证中间件
├── cors.middleware.ts      # CORS 中间件
├── rate-limit.middleware.ts # 限流中间件
├── validation.middleware.ts # 请求验证中间件
└── error-handler.middleware.ts # 错误处理中间件
```

## 🚀 使用示例

```typescript
// 在 app.ts 中注册中间件
import { authMiddleware } from './middlewares/auth.middleware.js';

app.register(authMiddleware);
```

## 📝 开发指南

1. 每个中间件应该是一个独立的文件
2. 使用 TypeScript 编写，提供类型安全
3. 遵循 Fastify 中间件规范
4. 添加适当的错误处理和日志记录
