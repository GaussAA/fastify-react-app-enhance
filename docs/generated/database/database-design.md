# 数据库设计文档

**生成时间**: 2025-10-11T02:49:13.514Z

## 📊 数据模型概览

| 统计项   | 数量 |
| -------- | ---- |
| 数据模型 | 1    |
| 字段总数 | 4    |
| 关系总数 | 0    |

## 📋 User

暂无描述

### 字段列表

| 字段名    | 类型     | 约束               | 描述 |
| --------- | -------- | ------------------ | ---- |
| id        | Int      | 主键, 必填, 默认值 | -    |
| name      | String   | 必填               | -    |
| email     | String   | 唯一, 必填         | -    |
| createdAt | DateTime | 必填, 默认值       | -    |

---

## ⚙️ 数据库配置

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id    Int    @id @default(autoincrement())
  name  String
  email String @unique
  createdAt DateTime @default(now())
}

```
