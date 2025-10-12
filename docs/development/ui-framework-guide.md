# 🎨 UI 框架使用指南

## 📋 概述

项目已集成 **TailwindCSS** 和 **shadcn/ui**，提供现代化的 UI 开发体验。

## 🚀 技术栈

- **TailwindCSS** - 实用优先的 CSS 框架
- **shadcn/ui** - 基于 Radix UI 的组件库
- **Lucide React** - 现代图标库
- **Class Variance Authority** - 组件变体管理
- **ESM** - 现代模块系统支持

## 🛠️ 配置说明

### TailwindCSS 配置

配置文件：`apps/web/tailwind.config.js` (ESM 格式)

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // shadcn/ui 颜色系统
        border: 'hsl(var(--border))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        // ... 更多颜色
      },
    },
  },
  plugins: [],
};
```

### PostCSS 配置

配置文件：`apps/web/postcss.config.js` (ESM 格式)

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

### shadcn/ui 配置

配置文件：`apps/web/components.json`

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

## 🎯 使用方法

### 1. 使用 TailwindCSS 类

```tsx
// 基础样式
<div className="bg-blue-500 text-white p-4 rounded-lg">
  Hello World
</div>

// 响应式设计
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>

// 悬停效果
<button className="bg-blue-600 hover:bg-blue-700 transition-colors">
  Click me
</button>
```

### 2. 使用 shadcn/ui 组件

```tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome</CardTitle>
      </CardHeader>
      <CardContent>
        <Button variant="outline" size="lg">
          Get Started
        </Button>
      </CardContent>
    </Card>
  );
}
```

### 3. 使用图标

```tsx
import { Heart, Star, User } from 'lucide-react';

function IconExample() {
  return (
    <div className="flex space-x-4">
      <Heart className="w-6 h-6 text-red-500" />
      <Star className="w-6 h-6 text-yellow-500" />
      <User className="w-6 h-6 text-blue-500" />
    </div>
  );
}
```

## 🧩 可用组件

### 基础组件

- **Button** - 按钮组件，支持多种变体和尺寸
- **Card** - 卡片容器组件
- **Input** - 输入框组件
- **Label** - 标签组件

### 布局组件

- **Container** - 容器组件
- **Grid** - 网格布局
- **Flex** - 弹性布局

### 反馈组件

- **Alert** - 警告提示
- **Toast** - 消息提示
- **Dialog** - 对话框
- **Modal** - 模态框

## 🎨 主题定制

### 颜色系统

项目使用 CSS 变量定义颜色系统，支持明暗主题：

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  /* ... 更多颜色变量 */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... 暗色主题颜色 */
}
```

### 自定义主题

1. 修改 `src/index.css` 中的颜色变量
2. 更新 `tailwind.config.js` 中的主题配置
3. 重新构建项目

## 📦 添加新组件

### 使用 shadcn/ui CLI

```bash
# 安装 shadcn/ui CLI
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add card
pnpm dlx shadcn@latest add input
```

### 手动添加组件

1. 从 [shadcn/ui 官网](https://ui.shadcn.com/) 复制组件代码
2. 创建组件文件：`src/components/ui/component-name.tsx`
3. 安装必要的依赖
4. 在项目中使用组件

## 🔧 开发工具

### VS Code 扩展推荐

- **Tailwind CSS IntelliSense** - TailwindCSS 智能提示
- **PostCSS Language Support** - PostCSS 语法支持
- **Auto Rename Tag** - 自动重命名标签

### 调试工具

- **Tailwind CSS DevTools** - 浏览器扩展
- **React Developer Tools** - React 组件调试

## 📚 学习资源

- [TailwindCSS 官方文档](https://tailwindcss.com/docs)
- [shadcn/ui 官方文档](https://ui.shadcn.com/)
- [Lucide React 图标库](https://lucide.dev/)
- [Radix UI 组件库](https://www.radix-ui.com/)

## 💡 最佳实践

1. **组件复用** - 优先使用 shadcn/ui 组件
2. **ESM 模块** - 使用现代 ES Modules 语法
3. **样式一致性** - 使用设计系统颜色和间距
4. **响应式设计** - 使用 TailwindCSS 响应式类
5. **性能优化** - 按需导入组件和图标
6. **可访问性** - 使用 Radix UI 的无障碍特性

## 🚀 示例项目

查看 `src/App.tsx` 了解完整的使用示例，包括：

- 响应式布局
- 组件组合
- 图标使用
- 主题应用
