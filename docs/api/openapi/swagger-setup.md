# 📖 Swagger/OpenAPI 3.0 配置指南

## 🎯 概述

项目已集成 **Fastify Swagger** 插件，自动生成交互式 API 文档。

## 🚀 快速访问

- **Swagger UI**: http://localhost:8001/docs
- **OpenAPI JSON**: http://localhost:8001/docs/json

## 📦 已安装的依赖

```json
{
  "@fastify/swagger": "^9.5.2",
  "@fastify/swagger-ui": "^5.2.3"
}
```

## ⚙️ 配置详情

### 1. 主配置文件 (`apps/api/src/app.ts`)

```typescript
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
  staticCSP: true,
});
```

### 2. 路由文档配置示例

```typescript
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
```

## 📋 已配置的 API 端点

### 健康检查

- `GET /` - API 服务状态检查

### 用户管理

- `GET /api/users` - 获取用户列表
- `POST /api/users` - 创建用户

## 🔧 开发指南

### 添加新的 API 端点文档

1. **在路由文件中添加 schema 配置**：

```typescript
app.get(
  '/api/example',
  {
    schema: {
      description: '示例端点描述',
      tags: ['example'],
      summary: '示例端点摘要',
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', description: '页码' },
          limit: { type: 'number', description: '每页数量' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'array' },
          },
        },
      },
    },
  },
  handler
);
```

2. **添加新的标签**（在 `app.ts` 中）：

```typescript
tags: [
  { name: 'users', description: '用户相关操作' },
  { name: 'health', description: '健康检查' },
  { name: 'example', description: '示例操作' }, // 新增
],
```

### 请求/响应示例

#### GET 请求示例

```typescript
app.get(
  '/api/users/:id',
  {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'number', description: '用户ID' },
        },
        required: ['id'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            name: { type: 'string' },
            email: { type: 'string' },
          },
        },
      },
    },
  },
  handler
);
```

#### POST 请求示例

```typescript
app.post(
  '/api/users',
  {
    schema: {
      body: {
        type: 'object',
        required: ['name', 'email'],
        properties: {
          name: { type: 'string', minLength: 1 },
          email: { type: 'string', format: 'email' },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            name: { type: 'string' },
            email: { type: 'string' },
          },
        },
      },
    },
  },
  handler
);
```

## 🎨 Swagger UI 特性

- ✅ **交互式测试** - 直接在浏览器中测试 API
- ✅ **自动验证** - 请求参数自动验证
- ✅ **响应示例** - 显示预期的响应格式
- ✅ **错误码文档** - 详细的错误响应说明
- ✅ **参数说明** - 完整的参数类型和约束

## 🔄 自动更新

文档会根据代码中的 schema 配置自动更新，无需手动维护。

## 📚 相关资源

- [Fastify Swagger 官方文档](https://github.com/fastify/fastify-swagger)
- [OpenAPI 3.0 规范](https://swagger.io/specification/)
- [Swagger UI 配置选项](https://swagger.io/docs/open-source-tools/swagger-ui/usage/configuration/)

---

**最后更新**: 2025-01-27  
**维护者**: 开发团队
