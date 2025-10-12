# 🛠️ 项目工具函数目录

这个目录用于存放项目特定的工具函数和业务逻辑相关的工具。

## 📁 目录结构

```
utils/
├── format.ts          # 格式化工具函数
├── validation.ts      # 验证工具函数
├── constants.ts       # 项目常量
├── helpers.ts         # 通用辅助函数
├── date.ts           # 日期处理工具
├── string.ts         # 字符串处理工具
└── index.ts          # 统一导出
```

## 🚀 使用示例

```typescript
// 格式化工具
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
  }).format(amount);
}

// 验证工具
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// 项目常量
export const API_ENDPOINTS = {
  USERS: '/api/users',
  PRODUCTS: '/api/products',
} as const;
```

## 📝 开发指南

1. **业务相关**: 存放与项目业务逻辑相关的工具函数
2. **项目特定**: 不依赖第三方库的纯函数
3. **可复用**: 在多个组件中可能用到的函数
4. **类型安全**: 使用 TypeScript 提供完整的类型定义
