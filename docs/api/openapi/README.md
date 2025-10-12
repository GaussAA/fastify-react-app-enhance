# OpenAPI/Swagger 文档

这个目录包含 OpenAPI 3.0 规范和 Swagger UI 相关文件。

## 📁 文件说明

- **`openapi.json`** - OpenAPI 3.0 规范文件，定义 API 接口
- **`swagger-ui.html`** - Swagger UI 静态页面，用于交互式 API 测试
- **`swagger-setup.md`** - Swagger 配置指南和开发说明

## 🚀 快速访问

- **Swagger UI**: http://localhost:8001/docs
- **OpenAPI JSON**: http://localhost:8001/docs/json

## 🔧 配置

Swagger 配置位于 `apps/api/src/app.ts` 文件中，通过 Fastify Swagger 插件实现。

## 📋 主要功能

- **交互式测试** - 直接在浏览器中测试 API
- **自动验证** - 请求参数自动验证
- **响应示例** - 显示预期的响应格式
- **错误码文档** - 详细的错误响应说明

## 🎯 开发指南

### 添加新的 API 端点

1. 在路由文件中添加 schema 配置
2. 在 `app.ts` 中添加相应的标签
3. 文档会自动更新

### 示例

```typescript
app.get(
  '/api/example',
  {
    schema: {
      description: '示例端点',
      tags: ['example'],
      summary: '示例端点摘要',
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

## 📚 相关资源

- [Fastify Swagger 官方文档](https://github.com/fastify/fastify-swagger)
- [OpenAPI 3.0 规范](https://swagger.io/specification/)
- [Swagger UI 配置选项](https://swagger.io/docs/open-source-tools/swagger-ui/usage/configuration/)
