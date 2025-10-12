# 🛠️ 开发工具配置指南

## 📋 概述

项目已集成多种自动化开发工具，提升开发效率和代码质量。

## 🚀 已配置的工具

### 1. **代码质量工具**

#### ESLint + Prettier

- **配置**: `eslint.config.js` (ESM), `.prettierrc`
- **功能**: 代码检查和格式化
- **模块系统**: 使用 ESM 格式配置
- **命令**:
  ```bash
  pnpm run lint          # 检查代码
  pnpm run lint:fix      # 自动修复
  pnpm run format        # 格式化代码
  pnpm run format:check  # 检查格式
  ```

#### TypeScript

- **配置**: `tsconfig.json`
- **功能**: 类型检查和编译
- **模块系统**: 支持 ESM 模块
- **命令**:
  ```bash
  npx tsc --noEmit       # 类型检查
  ```

### 2. **Git 工作流工具**

#### Husky + lint-staged

- **配置**: `.husky/`, `lint-staged`
- **功能**: Git hooks 自动化
- **触发时机**: 提交前自动检查

#### Commitlint

- **配置**: `commitlint.config.js` (ESM)
- **功能**: 提交信息规范检查
- **模块系统**: 使用 ESM 格式配置
- **规范**: Conventional Commits
- **示例**:
  ```bash
  feat: 添加用户登录功能
  fix: 修复登录验证问题
  docs: 更新 API 文档
  ```

### 3. **测试工具**

#### Jest (API 测试)

- **配置**: `jest.config.js` (ESM)
- **功能**: 单元测试和集成测试
- **模块系统**: 使用 ESM 格式配置
- **命令**:
  ```bash
  pnpm run test              # 运行测试
  pnpm run test:coverage     # 测试覆盖率
  ```

#### Vitest (Web 测试)

- **配置**: `vitest.config.ts`
- **功能**: 现代化测试框架
- **命令**:
  ```bash
  pnpm run test:web          # 运行 Web 测试
  pnpm run test:web:ui       # 测试 UI 界面
  pnpm run test:web:coverage # Web 测试覆盖率
  ```

#### Testing Library

- **功能**: React 组件测试
- **特性**: 更接近真实用户行为

### 4. **版本管理工具**

#### Changesets

- **配置**: `.changeset/`
- **功能**: 自动化版本管理和发布
- **命令**:
  ```bash
  pnpm run changeset         # 创建变更集
  pnpm run version-packages  # 更新版本
  pnpm run release          # 发布包
  ```

### 5. **API 文档工具**

#### Swagger/OpenAPI

- **访问**: http://localhost:8001/docs
- **功能**: 交互式 API 文档

#### API Extractor

- **配置**: `api-extractor.json`
- **功能**: TypeScript API 文档生成
- **命令**:
  ```bash
  pnpm run api-docs         # 生成 API 文档
  pnpm run api-docs:generate # 生成 Markdown 文档
  ```

### 6. **开发服务器**

#### tsx (API)

- **功能**: 现代 TypeScript 执行器，支持 ESM
- **命令**: `pnpm run dev:api`
- **优势**: 比 ts-node-dev 更快，原生支持 ESM

#### Vite (Web)

- **功能**: 快速开发服务器
- **命令**: `pnpm run dev:web`

## 🔧 使用指南

### 开发流程

1. **开始开发**

   ```bash
   pnpm run dev  # 启动开发环境
   ```

2. **代码检查**

   ```bash
   pnpm run lint:fix  # 自动修复代码问题
   pnpm run format    # 格式化代码
   ```

3. **运行测试**

   ```bash
   pnpm run test      # API 测试
   pnpm run test:web  # Web 测试
   ```

4. **提交代码**

   ```bash
   git add .
   git commit -m "feat: 添加新功能"  # 遵循 Conventional Commits
   ```

5. **版本发布**
   ```bash
   pnpm run changeset         # 创建变更集
   pnpm run version-packages  # 更新版本
   pnpm run release          # 发布
   ```

### 测试开发

#### API 测试

```typescript
// apps/api/tests/unit/user.test.ts
import { describe, it, expect } from '@jest/globals';

describe('User Service', () => {
  it('should create user', async () => {
    // 测试逻辑
  });
});
```

#### Web 测试

```typescript
// apps/web/src/test/App.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText(/welcome/i)).toBeInTheDocument();
  });
});
```

### API 文档开发

#### 添加新的 API 端点

```typescript
app.get(
  '/api/example',
  {
    schema: {
      description: '示例端点',
      tags: ['example'],
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

## 📊 工具对比

| 工具类型 | 之前   | 现在                    | 改进           |
| -------- | ------ | ----------------------- | -------------- |
| 测试框架 | Jest   | Jest + Vitest           | 更快的测试执行 |
| 代码检查 | ESLint | ESLint + Commitlint     | 更严格的规范   |
| 版本管理 | 手动   | Changesets              | 自动化发布     |
| API 文档 | 手动   | Swagger + API Extractor | 自动生成       |
| 开发体验 | 基础   | 完整工具链              | 显著提升       |

## 🎯 最佳实践

### 1. 提交规范

```bash
# 功能开发
feat: 添加用户管理功能

# 问题修复
fix: 修复登录验证问题

# 文档更新
docs: 更新 API 文档

# 代码重构
refactor: 重构用户服务

# 性能优化
perf: 优化数据库查询

# 测试相关
test: 添加用户服务测试
```

### 2. 测试策略

- **单元测试**: 测试单个函数/组件
- **集成测试**: 测试模块间交互
- **E2E 测试**: 测试完整用户流程

### 3. 代码质量

- 提交前自动检查
- 定期运行测试
- 保持高测试覆盖率

### 4. ESM 模块系统

- 统一使用 ES Modules 格式
- 配置文件使用 ESM 语法
- 相对导入需要明确文件扩展名
- 更好的类型安全和性能

## 🔮 未来扩展

### 可考虑添加的工具

1. **Storybook** - 组件开发工具
2. **Playwright** - E2E 测试
3. **Dependabot** - 依赖更新
4. **Codecov** - 测试覆盖率
5. **Sentry** - 错误监控
6. **Lighthouse CI** - 性能监控

### 配置建议

```bash
# 添加 Storybook
pnpm add -D @storybook/react @storybook/react-vite

# 添加 Playwright
pnpm add -D @playwright/test

# 添加 Dependabot
# 创建 .github/dependabot.yml
```

---

**最后更新**: 2025-01-27  
**维护者**: 开发团队
