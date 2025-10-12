# 🧪 测试文档

项目的测试体系文档，包含单元测试、集成测试、端到端测试等。

## 📁 测试结构

```
tests/
├── unit/                # 单元测试
│   └── api/             # API 单元测试
│       └── user.service.test.ts
├── integration/         # 集成测试
│   └── api/             # API 集成测试
│       └── user.integration.test.ts
├── e2e/                 # 端到端测试
│   └── user-flow.test.ts
├── utils/               # 测试工具
│   └── mock.ts
└── README.md            # 测试文档 (本文件)
```

### 📋 目录说明

- **`unit/api/`** - API 应用的单元测试
- **`integration/api/`** - API 应用的集成测试
- **`e2e/`** - 端到端测试
- **`utils/`** - 测试工具和辅助函数

## 🏗️ 测试技术栈

### 测试框架

- **Jest 30.2.0** - JavaScript 测试框架 (ESM 模式)
- **Supertest** - HTTP 断言库
- **Playwright** - 端到端测试框架
- **@testing-library/react** - React 组件测试

### 测试工具

- **ts-jest** - TypeScript 支持 (ESM 配置)
- **jest-environment-node** - Node.js 测试环境
- **@types/jest** - Jest 类型定义
- **cross-env** - 跨平台环境变量设置

## 🚀 快速开始

### 1. 运行所有测试

```bash
# 在项目根目录
pnpm run test

# 或单独运行
cd apps/api && pnpm run test
cd apps/web && pnpm run test
```

### 2. 运行特定类型测试

```bash
# 单元测试
pnpm run test:unit

# 集成测试
pnpm run test:integration

# 端到端测试
pnpm run test:e2e

# 性能测试
pnpm run test:performance
```

### 3. 生成测试覆盖率报告

```bash
# 生成覆盖率报告
pnpm run test:coverage

# 查看覆盖率报告
open coverage/lcov-report/index.html
```

## 📝 测试类型

### 🔬 单元测试

测试单个函数、方法或组件的功能。

#### API 单元测试示例

```typescript
// tests/unit/api/user.service.test.ts
import { userService } from '../../../apps/api/src/services/user.service';
import { prisma } from '../../../apps/api/src/prisma-client';

jest.mock('../../../apps/api/src/prisma-client');

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all users', async () => {
      const mockUsers = [
        { id: '1', name: 'John Doe', email: 'john@example.com' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
      ];

      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

      const result = await userService.getAll();

      expect(result).toEqual(mockUsers);
      expect(prisma.user.findMany).toHaveBeenCalledTimes(1);
    });

    it('should handle database errors', async () => {
      const error = new Error('Database connection failed');
      (prisma.user.findMany as jest.Mock).mockRejectedValue(error);

      await expect(userService.getAll()).rejects.toThrow(
        'Database connection failed'
      );
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const userData = { name: 'John Doe', email: 'john@example.com' };
      const createdUser = { id: '1', ...userData };

      (prisma.user.create as jest.Mock).mockResolvedValue(createdUser);

      const result = await userService.create(userData);

      expect(result).toEqual(createdUser);
      expect(prisma.user.create).toHaveBeenCalledWith({ data: userData });
    });
  });
});
```

#### React 组件单元测试示例

```typescript
// tests/unit/web/UserList.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { UserList } from '../../../apps/web/src/components/UserList';

const mockUsers = [
  { id: '1', name: 'John Doe', email: 'john@example.com' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com' }
];

describe('UserList', () => {
  it('should render user list', () => {
    render(<UserList users={mockUsers} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('should handle user selection', () => {
    const onUserSelect = jest.fn();
    render(<UserList users={mockUsers} onUserSelect={onUserSelect} />);

    fireEvent.click(screen.getByText('John Doe'));

    expect(onUserSelect).toHaveBeenCalledWith(mockUsers[0]);
  });
});
```

### 🔗 集成测试

测试多个组件或服务之间的交互。

#### API 集成测试示例

```typescript
// tests/integration/api/user.integration.test.ts
import request from 'supertest';
import { app } from '../../../apps/api/src/app';

describe('User API Integration Tests', () => {
  describe('GET /api/users', () => {
    it('should return user list', async () => {
      const response = await request(app).get('/api/users').expect(200);

      expect(response.body).toHaveProperty('users');
      expect(Array.isArray(response.body.users)).toBe(true);
    });
  });

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user.name).toBe(userData.name);
      expect(response.body.user.email).toBe(userData.email);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });
});
```

### 🌐 端到端测试

测试完整的用户流程。

#### E2E 测试示例

```typescript
// tests/e2e/user-flow/user-registration.e2e.test.ts
import { test, expect } from '@playwright/test';

test.describe('User Registration Flow', () => {
  test('should register a new user', async ({ page }) => {
    // 访问注册页面
    await page.goto('http://localhost:5173/register');

    // 填写注册表单
    await page.fill('[data-testid="name-input"]', 'John Doe');
    await page.fill('[data-testid="email-input"]', 'john@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');

    // 提交表单
    await page.click('[data-testid="submit-button"]');

    // 验证成功消息
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-message"]')).toContainText(
      'Registration successful'
    );

    // 验证重定向到登录页面
    await expect(page).toHaveURL('http://localhost:5173/login');
  });

  test('should show validation errors', async ({ page }) => {
    await page.goto('http://localhost:5173/register');

    // 提交空表单
    await page.click('[data-testid="submit-button"]');

    // 验证错误消息
    await expect(page.locator('[data-testid="name-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="password-error"]')).toBeVisible();
  });
});
```

## 🧪 测试配置

### Jest 配置 (ESM)

```javascript
// jest.config.js
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts', '**/*.spec.ts'],
  roots: ['<rootDir>/src', '<rootDir>/../../tests/unit/api', '<rootDir>/../../tests/integration/api'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          module: 'ESNext',
          moduleResolution: 'node',
          allowSyntheticDefaultImports: true,
          esModuleInterop: true,
        },
      },
    ],
  },
  extensionsToTreatAsEsm: ['.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
};
```

### Playwright 配置

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'pnpm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

## 📊 测试数据管理

### 测试数据

```json
// tests/fixtures/users.json
{
  "validUsers": [
    {
      "id": "1",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2025-01-27T00:00:00.000Z"
    },
    {
      "id": "2",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "createdAt": "2025-01-27T00:00:00.000Z"
    }
  ],
  "invalidUsers": [
    {
      "name": "",
      "email": "invalid-email"
    }
  ]
}
```

### 模拟数据

```typescript
// tests/mocks/database.js
export const mockDatabase = {
  users: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

export const mockPrisma = {
  user: mockDatabase.users,
};
```

## 🔧 测试工具

### 测试辅助函数

```typescript
// tests/utils/test-helpers.ts
import { PrismaClient } from '@prisma/client';

export const createTestUser = async (prisma: PrismaClient, userData: any) => {
  return await prisma.user.create({
    data: {
      name: userData.name || 'Test User',
      email: userData.email || 'test@example.com',
      ...userData,
    },
  });
};

export const cleanupTestData = async (prisma: PrismaClient) => {
  await prisma.user.deleteMany({
    where: {
      email: {
        contains: 'test@example.com',
      },
    },
  });
};

export const waitFor = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms));
```

### 测试设置

```typescript
// tests/setup.ts
import { beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeAll(async () => {
  // 测试前设置
  await prisma.$connect();
});

afterAll(async () => {
  // 测试后清理
  await prisma.$disconnect();
});

beforeEach(async () => {
  // 每个测试前清理数据
  await prisma.user.deleteMany();
});

afterEach(async () => {
  // 每个测试后清理
  await prisma.user.deleteMany();
});
```

## 📈 测试覆盖率

### 覆盖率目标

- **语句覆盖率**: ≥ 80%
- **分支覆盖率**: ≥ 75%
- **函数覆盖率**: ≥ 80%
- **行覆盖率**: ≥ 80%

### 覆盖率报告

```bash
# 生成覆盖率报告
pnpm run test:coverage

# 查看覆盖率报告
open coverage/lcov-report/index.html
```

## 🚀 CI/CD 集成

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: testdb
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '22'
          cache: 'pnpm'

      - run: pnpm install
      - run: pnpm run test:coverage
      - run: pnpm run test:e2e

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
```

## 📚 相关文档

- [Jest 官方文档](https://jestjs.io/docs/getting-started)
- [Playwright 官方文档](https://playwright.dev/docs/intro)
- [Testing Library 文档](https://testing-library.com/docs/)
- [测试最佳实践](../../docs/development/README.md)

## 🎯 测试最佳实践

1. **测试金字塔**: 单元测试 > 集成测试 > E2E 测试
2. **AAA 模式**: Arrange, Act, Assert
3. **测试隔离**: 每个测试应该独立运行
4. **描述性命名**: 测试名称应该清楚描述测试内容
5. **模拟外部依赖**: 使用 Mock 隔离测试单元
6. **测试数据管理**: 使用 Fixtures 管理测试数据
7. **持续集成**: 在 CI/CD 中运行所有测试

---

_最后更新: 2025-01-27_
