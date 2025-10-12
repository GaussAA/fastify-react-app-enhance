# 🔌 插件目录

这个目录用于存放 Fastify 插件。

## 📁 目录结构

```
plugins/
├── swagger.plugin.ts       # Swagger 文档插件
├── cors.plugin.ts          # CORS 插件
├── helmet.plugin.ts        # 安全插件
├── rate-limit.plugin.ts    # 限流插件
└── index.ts                # 插件导出
```

## 🚀 使用示例

```typescript
// 定义插件
import { FastifyPluginAsync } from 'fastify';

const swaggerPlugin: FastifyPluginAsync = async fastify => {
  await fastify.register(import('@fastify/swagger'), {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'API Documentation',
        version: '1.0.0',
      },
    },
  });
};

export default swaggerPlugin;
```

## 📝 开发指南

1. 每个插件应该是一个独立的文件
2. 使用 TypeScript 编写，提供类型安全
3. 遵循 Fastify 插件规范
4. 提供适当的配置选项
5. 添加错误处理和日志记录
