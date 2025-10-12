# 🗄️ 数据库管理

Fastify-React-App-Enhance 项目使用 PostgreSQL 作为主数据库，通过 Prisma ORM 进行数据访问。

## 🏗️ 技术栈

- **PostgreSQL 15+** - 关系型数据库
- **Prisma 5.22.0** - 类型安全的 ORM
- **Docker** - 数据库容器化部署

## 📁 数据库结构

```
apps/api/
├── prisma/
│   ├── schema.prisma        # 数据模型定义
│   ├── migrations/          # 数据库迁移文件
│   └── seed.ts             # 种子数据
├── src/
│   └── prisma-client.ts    # Prisma 客户端配置
└── .env                    # 环境变量配置
```

## 🚀 快速开始

### 1. 环境配置

复制环境变量模板：

```bash
cp config/env-templates/api.env apps/api/.env
```

配置数据库连接：

```env
# 开发环境
DATABASE_URL="postgresql://dev:dev@localhost:5432/mydb"

# 生产环境
DATABASE_URL="postgresql://user:password@host:5432/production_db"
```

### 2. 启动数据库

#### 使用 Docker（推荐）

```bash
# 启动 PostgreSQL 容器
docker-compose -f infrastructure/docker/docker-compose.yml up -d postgres

# 或单独启动
docker run --name postgres \
  -e POSTGRES_DB=mydb \
  -e POSTGRES_USER=dev \
  -e POSTGRES_PASSWORD=dev \
  -p 5432:5432 \
  -d postgres:15
```

#### 本地安装

```bash
# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib

# macOS
brew install postgresql
brew services start postgresql

# 创建数据库
sudo -u postgres createdb mydb
sudo -u postgres createuser dev
sudo -u postgres psql -c "ALTER USER dev PASSWORD 'dev';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE mydb TO dev;"
```

### 3. 数据库初始化

```bash
# 生成 Prisma 客户端
pnpm run prisma:generate

# 运行数据库迁移
pnpm run prisma:migrate

# 填充种子数据（可选）
pnpm run prisma:seed
```

## 📊 数据模型

### User 模型

```prisma
model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}
```

### 模型特性

- **唯一标识符**: 使用 `cuid()` 生成唯一 ID
- **时间戳**: 自动管理创建和更新时间
- **唯一约束**: 邮箱地址唯一
- **表映射**: 使用 `@@map` 指定数据库表名

## 🔧 Prisma 命令

### 基础命令

```bash
# 生成 Prisma 客户端
pnpm run prisma:generate

# 创建新的迁移
pnpm run prisma:migrate dev --name add_user_table

# 应用待处理的迁移
pnpm run prisma:migrate deploy

# 重置数据库
pnpm run prisma:migrate reset

# 查看数据库状态
pnpm run prisma:migrate status
```

### 开发工具

```bash
# 打开 Prisma Studio（数据库可视化工具）
pnpm run prisma:studio

# 格式化 schema 文件
pnpm run prisma:format

# 验证 schema 文件
pnpm run prisma:validate
```

### 数据库操作

```bash
# 推送 schema 变更到数据库（开发环境）
pnpm run prisma:db push

# 生成迁移文件
pnpm run prisma:migrate dev

# 重置数据库并重新应用所有迁移
pnpm run prisma:migrate reset
```

## 📝 数据操作示例

### 在代码中使用 Prisma

```typescript
// apps/api/src/services/user.service.ts
import { prisma } from '../prisma-client';

export class UserService {
  // 获取所有用户
  async getAll() {
    return await prisma.user.findMany();
  }

  // 根据 ID 获取用户
  async getById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
    });
  }

  // 创建用户
  async create(data: { name: string; email: string }) {
    return await prisma.user.create({
      data,
    });
  }

  // 更新用户
  async update(id: string, data: { name?: string; email?: string }) {
    return await prisma.user.update({
      where: { id },
      data,
    });
  }

  // 删除用户
  async delete(id: string) {
    return await prisma.user.delete({
      where: { id },
    });
  }
}
```

### 查询示例

```typescript
// 复杂查询示例
const users = await prisma.user.findMany({
  where: {
    email: {
      contains: '@example.com',
    },
    createdAt: {
      gte: new Date('2025-01-01'),
    },
  },
  orderBy: {
    createdAt: 'desc',
  },
  take: 10,
  skip: 0,
});

// 关联查询（如果有关联模型）
const userWithPosts = await prisma.user.findUnique({
  where: { id: 'user_id' },
  include: {
    posts: true,
  },
});
```

## 🧪 测试数据库

### 测试环境配置

```env
# 测试环境数据库
DATABASE_URL="postgresql://test:test@localhost:5432/testdb"
```

### 测试数据管理

```typescript
// tests/setup.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  // 清理测试数据
  await prisma.user.deleteMany();
});

afterEach(async () => {
  // 清理测试数据
  await prisma.user.deleteMany();
});
```

## 🔄 数据库迁移

### 创建迁移

```bash
# 修改 schema.prisma 后创建迁移
pnpm run prisma:migrate dev --name add_user_phone

# 迁移文件会生成在 prisma/migrations/ 目录
```

### 迁移文件示例

```sql
-- prisma/migrations/20250127000000_add_user_phone/migration.sql
-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
```

### 回滚迁移

```bash
# 回滚到上一个迁移
pnpm run prisma:migrate reset

# 或手动回滚
pnpm run prisma:migrate resolve --rolled-back <migration_name>
```

## 📊 数据库备份和恢复

### 自动备份

```bash
# 使用项目提供的备份脚本
pnpm run db:backup

# 恢复数据库
pnpm run db:restore <backup_file>
```

### 手动备份

```bash
# 备份数据库
pg_dump -h localhost -U dev -d mydb > backup.sql

# 恢复数据库
psql -h localhost -U dev -d mydb < backup.sql
```

## 🔍 性能优化

### 索引优化

```prisma
model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([email])
  @@index([createdAt])
  @@map("users")
}
```

### 查询优化

```typescript
// 使用 select 只获取需要的字段
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
  },
});

// 使用分页
const users = await prisma.user.findMany({
  take: 20,
  skip: 0,
  orderBy: {
    createdAt: 'desc',
  },
});
```

## 🚨 故障排除

### 常见问题

1. **连接失败**

   ```bash
   # 检查数据库服务状态
   sudo systemctl status postgresql

   # 检查连接配置
   psql -h localhost -U dev -d mydb
   ```

2. **迁移失败**

   ```bash
   # 检查迁移状态
   pnpm run prisma:migrate status

   # 重置迁移
   pnpm run prisma:migrate reset
   ```

3. **客户端生成失败**
   ```bash
   # 清理并重新生成
   rm -rf node_modules/.prisma
   pnpm run prisma:generate
   ```

## 📚 相关文档

- [Prisma 官方文档](https://www.prisma.io/docs/)
- [PostgreSQL 官方文档](https://www.postgresql.org/docs/)
- [开发指南](../development/README.md)
- [部署指南](../deployment/README.md)

## 🎯 最佳实践

1. **模型设计**: 使用有意义的字段名和约束
2. **迁移管理**: 小步快跑，频繁提交迁移
3. **索引优化**: 为常用查询字段添加索引
4. **数据验证**: 在应用层和数据库层都进行验证
5. **备份策略**: 定期备份重要数据
6. **性能监控**: 监控查询性能和数据库资源使用

---

_最后更新: 2025-01-27_
