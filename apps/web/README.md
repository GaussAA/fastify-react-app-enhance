# 🌐 React Web 应用

基于 React + Vite 构建的现代前端应用，提供用户界面和交互体验。

## 🏗️ 技术栈

- **React 19.2.0** - 用户界面库
- **Vite 7.1.9** - 快速构建工具
- **TypeScript 5.7.2** - 类型安全的 JavaScript
- **ESM (ES Modules)** - 现代模块系统
- **TailwindCSS** - 实用优先的 CSS 框架
- **shadcn/ui** - 现代 UI 组件库
- **Vitest** - 现代化测试框架
- **Testing Library** - React 组件测试工具

## 📁 项目结构

```
apps/web/
├── src/
│   ├── api/             # API 调用
│   ├── components/      # React 组件
│   ├── hooks/           # 自定义 Hooks
│   ├── pages/           # 页面组件
│   ├── store/           # 状态管理
│   ├── utils/           # 工具函数
│   ├── lib/             # 工具库
│   │   └── utils.ts     # 通用工具函数
│   ├── components/      # React 组件
│   │   └── ui/          # shadcn/ui 组件
│   │       ├── button.tsx # 按钮组件
│   │       └── card.tsx   # 卡片组件
│   ├── test/            # 测试文件
│   │   ├── App.test.tsx # 组件测试
│   │   └── setup.ts     # 测试设置
│   ├── index.css        # TailwindCSS 样式
│   ├── main.tsx         # 应用入口
│   └── App.tsx          # 根组件
├── index.html           # HTML 模板
├── package.json         # 依赖配置
├── tsconfig.json        # TypeScript 配置
├── tsconfig.node.json   # Node.js TypeScript 配置
├── vite.config.ts       # Vite 配置
├── vitest.config.ts     # Vitest 配置
├── tailwind.config.js   # TailwindCSS 配置 (ESM)
├── postcss.config.js    # PostCSS 配置 (ESM)
├── components.json      # shadcn/ui 配置
└── README.md           # 本文档
```

## 🚀 快速开始

### 1. 安装依赖

```bash
# 在项目根目录
pnpm install

# 或单独安装 Web 依赖
cd apps/web
pnpm install
```

### 2. 环境配置

复制环境变量模板：

```bash
cp ../../config/env-templates/web.env .env
```

主要配置项：

```env
VITE_API_URL=http://localhost:8001
VITE_APP_TITLE=Fastify React App
VITE_APP_VERSION=1.0.0
```

### 3. 启动开发服务器

```bash
# 开发模式
pnpm run dev

# 或从根目录启动
cd ../..
pnpm run dev:web
```

应用启动后访问：http://localhost:5173

## 🧪 测试

```bash
# 运行所有测试
pnpm run test

# 运行测试并生成覆盖率报告
pnpm run test:coverage

# 运行 E2E 测试
pnpm run test:e2e
```

## 🎨 开发工具

### 代码质量

```bash
# 代码检查
pnpm run lint

# 代码格式化
pnpm run format

# 类型检查
pnpm run type-check
```

### 构建

```bash
# 开发构建
pnpm run build:dev

# 生产构建
pnpm run build

# 预览构建结果
pnpm run preview
```

## 📱 功能特性

### 核心功能

- ✅ 用户认证和授权
- ✅ 响应式设计
- ✅ 暗色/亮色主题切换
- ✅ 国际化支持（i18n）
- ✅ 错误边界处理
- ✅ 加载状态管理

### UI 组件

- ✅ 现代化设计系统
- ✅ 可访问性支持
- ✅ 动画和过渡效果
- ✅ 移动端优化

## 🔧 开发规范

1. **组件设计**: 使用函数组件和 Hooks
2. **状态管理**: 使用 React Context 或 Zustand
3. **样式方案**: 使用 TailwindCSS + CSS Modules
4. **类型安全**: 严格使用 TypeScript 类型定义
5. **代码风格**: 使用 ESLint + Prettier 统一代码风格

## 📦 构建和部署

### 开发构建

```bash
pnpm run build:dev
```

### 生产构建

```bash
pnpm run build
```

构建产物位于 `dist/` 目录。

### 部署选项

1. **静态托管**: 部署到 Vercel、Netlify 等
2. **CDN**: 使用 Cloudflare、AWS CloudFront 等
3. **容器化**: 使用 Docker 部署

## 🌍 环境配置

### 开发环境

```env
VITE_API_URL=http://localhost:8001
VITE_APP_ENV=development
VITE_DEBUG=true
```

### 生产环境

```env
VITE_API_URL=https://api.yourdomain.com
VITE_APP_ENV=production
VITE_DEBUG=false
```

## 📚 相关文档

- [API 文档](../../docs/api/README.md)
- [部署指南](../../docs/deployment/README.md)
- [开发指南](../../docs/development/README.md)
- [架构设计](../../docs/architecture/architecture.md)

## 🎯 开发指南

### 添加新页面

1. 在 `src/pages/` 创建页面组件
2. 在路由配置中添加路由
3. 更新导航菜单（如需要）

### 添加新组件

1. 在 `src/components/` 创建组件
2. 导出组件和类型定义
3. 编写组件文档和测试

### API 集成

1. 在 `src/api/` 创建 API 客户端
2. 使用 TypeScript 定义接口类型
3. 添加错误处理和加载状态

### ESM 模块使用

1. 使用 `import/export` 语法进行模块导入导出
2. 相对导入需要明确的文件扩展名 (`.js`)
3. 配置文件使用 ESM 格式 (`export default`)

---

_最后更新: 2025-01-27_
