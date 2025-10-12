# 📚 第三方库封装目录

这个目录用于存放第三方库的封装、配置和工具函数。

## 📁 目录结构

```
lib/
├── utils.ts          # shadcn/ui 工具函数 (clsx + tailwind-merge)
├── api.ts            # API 客户端封装
├── auth.ts           # 认证相关工具
├── storage.ts        # 本地存储封装
├── config.ts         # 配置文件
└── index.ts          # 统一导出
```

## 🚀 使用示例

```typescript
// utils.ts - shadcn/ui 工具函数
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// api.ts - API 客户端封装
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

// auth.ts - 认证工具
export function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}
```

## 📝 开发指南

1. **第三方库封装**: 对外部库进行包装和配置
2. **统一接口**: 提供一致的 API 接口
3. **配置管理**: 集中管理第三方库的配置
4. **类型安全**: 为第三方库提供 TypeScript 类型定义
