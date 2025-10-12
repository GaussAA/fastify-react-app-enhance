# Fastify React App API

Fastify + React 全栈应用 API 文档

**版本**: 1.0.0

## 📁 文档结构

```
docs/api/
├── openapi/              # OpenAPI/Swagger 文档
│   ├── openapi.json      # OpenAPI 3.0 规范
│   ├── swagger-ui.html   # Swagger UI 静态页面
│   └── swagger-setup.md  # Swagger 配置指南
├── typescript/           # TypeScript API 文档
│   ├── api.json         # API Extractor 报告
│   └── fastify-api.api.md # TypeScript API 文档
├── types.ts             # TypeScript 类型定义
└── README.md            # 主文档 (本文件)
```

## 🌐 服务器

- **开发环境**: `http://localhost:8001`
- **生产环境**: `https://api.example.com`

## 📖 文档访问

- **Swagger UI**: http://localhost:8001/docs
- **OpenAPI JSON**: http://localhost:8001/docs/json
- **TypeScript API**: 查看 `typescript/` 目录

## 📋 API 端点

### General

#### 📖 `GET` /

API 健康检查

**响应**:

- **200**: API 运行正常

---

#### ➕ `POST` /

创建新的resource

**参数**:

| 参数名 | 类型   | 位置 | 必需 | 描述       |
| ------ | ------ | ---- | ---- | ---------- |
| body   | object | body | 是   | 请求体数据 |

**响应**:

- **201**: 成功创建资源
- **400**: 请求参数错误
- **401**: 未授权访问
- **404**: 资源不存在
- **500**: 服务器内部错误

---

## 📊 数据模型

### User

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string"
    },
    "name": {
      "type": "string"
    },
    "email": {
      "type": "string",
      "format": "email"
    },
    "createdAt": {
      "type": "string",
      "format": "date-time"
    },
    "updatedAt": {
      "type": "string",
      "format": "date-time"
    }
  }
}
```

### Error

```json
{
  "type": "object",
  "properties": {
    "error": {
      "type": "string"
    },
    "message": {
      "type": "string"
    },
    "statusCode": {
      "type": "number"
    }
  }
}
```
