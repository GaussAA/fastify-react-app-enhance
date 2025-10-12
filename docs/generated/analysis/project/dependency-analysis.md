# 依赖分析文档

**生成时间**: 2025-10-10T17:13:01.072Z

## 📊 依赖概览

| 项目 | 生产依赖 | 开发依赖 | 总依赖 |
| ---- | -------- | -------- | ------ |
| root | 0        | 10       | 10     |
| api  | 6        | 10       | 16     |
| web  | 2        | 5        | 7      |

## 📋 项目依赖详情

### root

#### 开发依赖

| 包名                             | 版本    |
| -------------------------------- | ------- |
| @typescript-eslint/eslint-plugin | ^8.46.0 |
| @typescript-eslint/parser        | ^8.46.0 |
| concurrently                     | ^9.2.1  |
| eslint                           | ^9.37.0 |
| eslint-config-prettier           | ^10.1.8 |
| eslint-plugin-prettier           | ^5.5.4  |
| husky                            | ^9.1.7  |
| lint-staged                      | ^16.2.3 |
| prettier                         | ^3.6.2  |
| ts-node                          | ^10.9.2 |

### api

#### 生产依赖

| 包名           | 版本    |
| -------------- | ------- |
| @fastify/cors  | ^10.0.1 |
| @grpc/grpc-js  | ^1.14.0 |
| @prisma/client | ^5.22.0 |
| dotenv         | ^16.4.5 |
| fastify        | ^5.6.1  |
| pino           | ^9.5.0  |

#### 开发依赖

| 包名             | 版本     |
| ---------------- | -------- |
| @types/dotenv    | ^8.2.3   |
| @types/jest      | ^30.0.0  |
| @types/node      | ^22.10.2 |
| @types/supertest | ^6.0.3   |
| jest             | ^30.2.0  |
| prisma           | ^5.22.0  |
| supertest        | ^7.1.4   |
| ts-jest          | ^29.4.5  |
| ts-node-dev      | ^2.0.0   |
| typescript       | ^5.7.2   |

### web

#### 生产依赖

| 包名      | 版本    |
| --------- | ------- |
| react     | ^19.2.0 |
| react-dom | ^19.2.0 |

#### 开发依赖

| 包名                 | 版本    |
| -------------------- | ------- |
| vite                 | ^7.1.9  |
| typescript           | ^5.7.2  |
| @types/react         | ^19.0.0 |
| @types/react-dom     | ^19.0.0 |
| @vitejs/plugin-react | ^4.3.4  |
