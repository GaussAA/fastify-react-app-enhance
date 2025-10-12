# 综合自动化检查报告

**生成时间**: 2025-10-11T03:49:22.865Z

## 📊 检查摘要

| 状态    | 数量 | 百分比 |
| ------- | ---- | ------ |
| ✅ 通过 | 3    | 43%    |
| ⚠️ 警告 | 1    | 14%    |
| ❌ 失败 | 3    | 43%    |
| 📊 总计 | 7    | 100%   |

**成功率**: 43%

## 📋 详细结果

| 检查项目               | 状态 | 耗时    | 命令                      |
| ---------------------- | ---- | ------- | ------------------------- |
| ✅ 环境检查            | 通过 | 9338ms  | `pnpm run check:env`      |
| ✅ 安全审计            | 通过 | 7345ms  | `pnpm run check:security` |
| ✅ 代码质量检查        | 通过 | 95263ms | `pnpm run check:quality`  |
| ⚠️ 代码规范检查        | 警告 | 3663ms  | `pnpm run lint`           |
| ❌ 代码格式化检查      | 失败 | 5203ms  | `pnpm run format:check`   |
| ❌ TypeScript 类型检查 | 失败 | 3273ms  | `npx tsc --noEmit`        |
| ❌ 测试运行            | 失败 | 14423ms | `pnpm run test`           |

## ❌ 失败检查详情

### 代码格式化检查

**命令**: `pnpm run format:check`

**错误信息**:

```
[warn] apps/api/api-extractor.json
[warn] apps/api/docs/api/api.json
[warn] apps/api/docs/api/fastify-api.api.md
[warn] apps/api/jest.setup.js
[warn] apps/api/package.json
[warn] apps/api/README.md
[warn] apps/api/src/app.ts
[warn] apps/api/src/routes/user.route.ts
[warn] apps/api/tests/integration/user.integration.test.ts
[warn] apps/api/tests/unit/user.service.test.ts
[warn] apps/api/tsconfig.json
[warn] apps/api/tsdoc-metadata.json
[warn] apps/web/package.json
[warn] apps/web/src/App.tsx
[warn] apps/web/src/test/App.test.tsx
[warn] apps/web/src/test/setup.ts
[warn] apps/web/vitest.config.ts
[warn] commitlint.config.js
[warn] docs/api/openapi.json
[warn] docs/api/README.md
[warn] docs/api/swagger-setup.md
[warn] docs/database/README.md
[warn] docs/development/dev-tools.md
[warn] docs/generated/analysis/dependency-analysis.md
[warn] docs/generated/analysis/project-structure.md
[warn] docs/generated/changelog/changelog.md
[warn] docs/generated/cicd/cicd-pipeline.md
[warn] docs/generated/config/docker-config.md
[warn] docs/generated/config/environment-config.md
[warn] docs/generated/database/database-design.md
[warn] docs/generated/README.md
[warn] docs/generated/reports/checks/code-quality.json
[warn] docs/generated/reports/checks/code-quality.md
[warn] docs/generated/reports/checks/environment-check.json
[warn] docs/generated/reports/checks/security-audit.json
[warn] docs/generated/reports/checks/security-audit.md
[warn] docs/generated/reports/duplicate-dir-fix-report.json
[warn] docs/generated/reports/file-organization-report.json
[warn] docs/generated/reports/naming-standardization-report.json
[warn] docs/generated/reports/path-update-report.json
[warn] docs/generated/reports/project-health.md
[warn] docs/generated/testing/test-documentation.md
[warn] eslint.config.js
[warn] infrastructure/docker/docker-compose.yml
[warn] infrastructure/README.md
[warn] package.json
[warn] performance-config.json
[warn] README.md
[warn] services/grpc/README.md
[warn] tests/README.md
[warn] tools/scripts/automation/check-environment.js
[warn] tools/scripts/automation/code-quality-check.js
[warn] tools/scripts/automation/run-all-checks.js
[warn] tools/scripts/automation/security-audit.js
[warn] tools/scripts/development/generate-all-docs.js
[warn] tools/scripts/development/generate-docs.js
[warn] tools/scripts/development/restore-after-clean.js
[warn] tools/scripts/maintenance/clean.js
[warn] tools/scripts/maintenance/maintenance.js
[warn] tools/scripts/monitoring/monitoring-log.js
[warn] tools/scripts/monitoring/performance-test.js
[warn] Code style issues found in 61 files. Run Prettier with --write to fix.

```

**建议**: 运行 pnpm run format 格式化代码

### TypeScript 类型检查

**命令**: `npx tsc --noEmit`

**错误信息**:

```
npm warn Unknown env config "verify-deps-before-run". This will stop working in the next major version of npm.
npm warn Unknown env config "_jsr-registry". This will stop working in the next major version of npm.

```

**建议**: 修复 TypeScript 类型错误

### 测试运行

**命令**: `pnpm run test`

**错误信息**:

```
npm warn Unknown env config "verify-deps-before-run". This will stop working in the next major version of npm.
npm warn Unknown env config "_jsr-registry". This will stop working in the next major version of npm.
ts-jest[ts-jest-transformer] (WARN) Define `ts-jest` config under `globals` is deprecated. Please do
transform: {
    <transform_regex>: ['ts-jest', { /* ts-jest config goes here in Jest */ }],
},
See more at https://kulshekhar.github.io/ts-jest/docs/getting-started/presets#advanced
ts-jest[ts-jest-transformer] (WARN) Define `ts-jest` config under `globals` is deprecated. Please do
transform: {
    <transform_regex>: ['ts-jest', { /* ts-jest config goes here in Jest */ }],
},
See more at https://kulshekhar.github.io/ts-jest/docs/getting-started/presets#advanced
FAIL tests/integration/user.integration.test.ts
  ● User API Integration Tests › GET /users › should return users list

    TypeError: (0 , app_1.build) is not a function

       6 |
       7 |     beforeAll(async () => {
    >  8 |         app = build();
         |                    ^
       9 |         await app.ready();
      10 |     });
      11 |

      at Object.<anonymous> (tests/integration/user.integration.test.ts:8:20)

  ● User API Integration Tests › POST /users › should create a new user

    TypeError: (0 , app_1.build) is not a function

       6 |
       7 |     beforeAll(async () => {
    >  8 |         app = build();
         |                    ^
       9 |         await app.ready();
      10 |     });
      11 |

      at Object.<anonymous> (tests/integration/user.integration.test.ts:8:20)

  ● User API Integration Tests › POST /users › should return 400 for invalid data

    TypeError: (0 , app_1.build) is not a function

       6 |
       7 |     beforeAll(async () => {
    >  8 |         app = build();
         |                    ^
       9 |         await app.ready();
      10 |     });
      11 |

      at Object.<anonymous> (tests/integration/user.integration.test.ts:8:20)


  ● Test suite failed to run

    TypeError: Cannot read properties of undefined (reading 'close')

      11 |
      12 |     afterAll(async () => {
    > 13 |         await app.close();
         |                   ^
      14 |     });
      15 |
      16 |     describe('GET /users', () => {

      at Object.<anonymous> (tests/integration/user.integration.test.ts:13:19)

FAIL tests/unit/user.service.test.ts (9.377 s)
  ● UserService › create › should create a user with valid data

    PrismaClientInitializationError:
    Invalid `prisma.user.create()` invocation in
    D:\WorkSpace\ProjectDevelopment\fastify-react-app-enhance\apps\api\src\services\user.service.ts:5:17

      2 export const userService = {
      3   getAll: async () => prisma.user.findMany(),
      4   create: async (data: { name: string; email: string }) =>
    → 5     prisma.user.create(
    Can't reach database server at `localhost:5432`

    Please make sure your database server is running at `localhost:5432`.

       9 |             };
      10 |
    > 11 |             const result = await userService.create(userData);
         |                            ^
      12 |
      13 |             expect(result).toBeDefined();
      14 |             expect(result.name).toBe(userData.name);

      at $n.handleRequestError (../../node_modules/.pnpm/@prisma+client@5.22.0_prisma@5.22.0/node_modules/@prisma/client/runtime/library.js:121:7615)
      at $n.handleAndLogRequestError (../../node_modules/.pnpm/@prisma+client@5.22.0_prisma@5.22.0/node_modules/@prisma/client/runtime/library.js:121:6623)
      at $n.request (../../node_modules/.pnpm/@prisma+client@5.22.0_prisma@5.22.0/node_modules/@prisma/client/runtime/library.js:121:6307)
      at l (../../node_modules/.pnpm/@prisma+client@5.22.0_prisma@5.22.0/node_modules/@prisma/client/runtime/library.js:130:9633)
      at Object.<anonymous> (tests/unit/user.service.test.ts:11:28)

  ● UserService › findAll › should return an array of users

    TypeError: user_service_1.userService.findAll is not a function

      28 |     describe('findAll', () => {
      29 |         it('should return an array of users', async () => {
    > 30 |             const result = await userService.findAll();
         |                                              ^
      31 |
      32 |             expect(Array.isArray(result)).toBe(true);
      33 |         });

      at Object.<anonymous> (tests/unit/user.service.test.ts:30:46)

Test Suites: 2 failed, 2 total
Tests:       5 failed, 1 passed, 6 total
Snapshots:   0 total
Time:        11.06 s
Ran all test suites.
npm error Lifecycle script `test` failed with error:
npm error code 1
npm error path D:\WorkSpace\ProjectDevelopment\fastify-react-app-enhance\apps\api
npm error workspace fastify-api@0.1.0
npm error location D:\WorkSpace\ProjectDevelopment\fastify-react-app-enhance\apps\api
npm error command failed
npm error command C:\Windows\system32\cmd.exe /d /s /c jest

```

**建议**: 修复失败的测试用例

## ⚠️ 警告检查详情

### 代码规范检查

**命令**: `pnpm run lint`

**警告信息**:

```
Command failed: pnpm run lint
```

**建议**: 运行 pnpm run lint:fix 自动修复

## 💡 修复建议

```bash
# 自动修复代码规范问题
pnpm run lint:fix

# 格式化代码
pnpm run format

# 运行测试
pnpm run test

# 安全审计
pnpm run check:security

# 代码质量检查
pnpm run check:quality
```

---

_此报告由综合自动化检查脚本生成_
