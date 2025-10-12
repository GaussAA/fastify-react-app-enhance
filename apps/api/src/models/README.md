# 📊 数据模型目录

这个目录用于存放数据模型和类型定义。

## 📁 目录结构

```
models/
├── user.model.ts          # 用户模型
├── product.model.ts       # 产品模型
├── order.model.ts         # 订单模型
├── base.model.ts          # 基础模型
└── index.ts               # 模型导出
```

## 🚀 使用示例

```typescript
// 定义数据模型
export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// 定义请求/响应类型
export interface CreateUserRequest {
  name: string;
  email: string;
}

export interface UserResponse {
  success: boolean;
  data: User;
  message: string;
}
```

## 📝 开发指南

1. 使用 TypeScript 接口定义数据模型
2. 分离请求、响应和实体模型
3. 提供完整的类型定义
4. 与 Prisma schema 保持同步
