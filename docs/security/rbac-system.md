# RBAC 权限管理系统

## 概述

本项目实现了一套完整的基于角色的访问控制（RBAC）系统，提供了细粒度的权限管理、用户认证、会话管理和审计日志功能。

## 系统架构

### 核心组件

1. **用户管理 (User Management)**
   - 用户注册、登录、登出
   - 用户信息管理
   - 密码重置和邮箱验证
   - 用户状态管理（激活/停用）

2. **角色管理 (Role Management)**
   - 角色创建、更新、删除
   - 角色权限分配
   - 用户角色分配

3. **权限管理 (Permission Management)**
   - 权限定义和管理
   - 资源-操作权限模型
   - 权限分组和查询

4. **认证中间件 (Authentication Middleware)**
   - JWT Token 验证
   - 角色权限检查
   - 细粒度权限控制

5. **审计日志 (Audit Logging)**
   - 操作记录和追踪
   - 安全事件监控
   - 合规性支持

## 数据库模型

### 用户表 (users)
```sql
- id: 用户ID
- name: 用户姓名
- email: 邮箱地址（唯一）
- password: 加密密码
- avatar: 头像URL
- phone: 手机号码
- isActive: 是否激活
- isVerified: 是否验证邮箱
- lastLoginAt: 最后登录时间
- createdAt: 创建时间
- updatedAt: 更新时间
```

### 角色表 (roles)
```sql
- id: 角色ID
- name: 角色名称（唯一）
- displayName: 显示名称
- description: 角色描述
- isActive: 是否激活
- createdAt: 创建时间
- updatedAt: 更新时间
```

### 权限表 (permissions)
```sql
- id: 权限ID
- name: 权限名称（唯一）
- displayName: 显示名称
- description: 权限描述
- resource: 资源类型
- action: 操作类型
- isActive: 是否激活
- createdAt: 创建时间
- updatedAt: 更新时间
```

### 关联表
- **user_roles**: 用户角色关联
- **role_permissions**: 角色权限关联
- **user_sessions**: 用户会话管理
- **audit_logs**: 审计日志
- **password_reset_tokens**: 密码重置令牌
- **email_verification_tokens**: 邮箱验证令牌

## API 端点

### 认证相关 (`/api/auth`)

#### 用户注册
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "用户名",
  "email": "user@example.com",
  "password": "Password123!@#"
}
```

#### 用户登录
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!@#",
  "deviceInfo": "设备信息（可选）"
}
```

#### 刷新Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "refresh_token_here"
}
```

#### 用户登出
```http
POST /api/auth/logout
Authorization: Bearer <access_token>
```

#### 登出所有设备
```http
POST /api/auth/logout-all
Authorization: Bearer <access_token>
```

#### 获取用户会话
```http
GET /api/auth/sessions
Authorization: Bearer <access_token>
```

#### 密码重置请求
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### 密码重置
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_here",
  "newPassword": "NewPassword123!@#"
}
```

### 用户管理 (`/api/users`)

#### 获取用户列表
```http
GET /api/users?page=1&limit=20&search=关键词&isActive=true
Authorization: Bearer <access_token>
```

#### 获取用户详情
```http
GET /api/users/{id}
Authorization: Bearer <access_token>
```

#### 创建用户
```http
POST /api/users
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "新用户",
  "email": "newuser@example.com",
  "password": "Password123!@#"
}
```

#### 更新用户
```http
PUT /api/users/{id}
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "更新后的用户名",
  "phone": "13800138000"
}
```

#### 删除用户
```http
DELETE /api/users/{id}
Authorization: Bearer <access_token>
```

#### 激活/停用用户
```http
PATCH /api/users/{id}/toggle-active
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "isActive": true
}
```

#### 获取用户统计
```http
GET /api/users/stats/overview
Authorization: Bearer <access_token>
```

### 角色管理 (`/api/roles`)

#### 获取角色列表
```http
GET /api/roles
Authorization: Bearer <access_token>
```

#### 获取角色详情
```http
GET /api/roles/{id}
Authorization: Bearer <access_token>
```

#### 创建角色
```http
POST /api/roles
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "role-name",
  "displayName": "角色显示名称",
  "description": "角色描述",
  "permissions": ["user:read", "user:create"]
}
```

#### 更新角色
```http
PUT /api/roles/{id}
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "displayName": "更新后的显示名称",
  "description": "更新后的描述"
}
```

#### 删除角色
```http
DELETE /api/roles/{id}
Authorization: Bearer <access_token>
```

#### 分配权限给角色
```http
POST /api/roles/{id}/permissions
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "permissions": ["user:read", "user:create", "user:update"]
}
```

#### 移除角色权限
```http
DELETE /api/roles/{id}/permissions/{permissionId}
Authorization: Bearer <access_token>
```

### 权限管理 (`/api/permissions`)

#### 获取权限列表
```http
GET /api/permissions
Authorization: Bearer <access_token>
```

#### 获取权限详情
```http
GET /api/permissions/{id}
Authorization: Bearer <access_token>
```

#### 创建权限
```http
POST /api/permissions
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "custom:action",
  "displayName": "自定义操作",
  "description": "自定义权限描述",
  "resource": "custom",
  "action": "action"
}
```

#### 更新权限
```http
PUT /api/permissions/{id}
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "displayName": "更新后的显示名称",
  "description": "更新后的描述"
}
```

#### 删除权限
```http
DELETE /api/permissions/{id}
Authorization: Bearer <access_token>
```

#### 按资源分组获取权限
```http
GET /api/permissions/grouped/by-resource
Authorization: Bearer <access_token>
```

### 审计日志 (`/api/audit`)

#### 获取审计日志
```http
GET /api/audit?userId=1&action=login&resource=user&startDate=2024-01-01&endDate=2024-12-31&page=1&limit=20
Authorization: Bearer <access_token>
```

#### 获取用户活动统计
```http
GET /api/audit/user/{userId}/activity?days=30
Authorization: Bearer <access_token>
```

#### 清理过期审计日志
```http
DELETE /api/audit/cleanup?daysToKeep=365
Authorization: Bearer <access_token>
```

## 默认权限和角色

### 默认权限

系统初始化时会创建以下默认权限：

#### 用户管理权限
- `user:create` - 创建用户
- `user:read` - 查看用户
- `user:update` - 更新用户
- `user:delete` - 删除用户

#### 角色管理权限
- `role:create` - 创建角色
- `role:read` - 查看角色
- `role:update` - 更新角色
- `role:delete` - 删除角色

#### 权限管理权限
- `permission:create` - 创建权限
- `permission:read` - 查看权限
- `permission:update` - 更新权限
- `permission:delete` - 删除权限

#### 审计日志权限
- `audit:read` - 查看审计日志

### 默认角色

#### 管理员角色 (admin)
- 拥有所有权限
- 可以管理用户、角色、权限
- 可以查看审计日志

#### 普通用户角色 (user)
- 拥有基础权限：`user:read`, `audit:read`
- 可以查看自己的信息和基础审计日志

## 安全特性

### 密码安全
- 使用 bcrypt 进行密码哈希（12轮）
- 强制密码复杂度要求
- 密码重置令牌机制

### 会话管理
- JWT Access Token（短期有效）
- Refresh Token（长期有效）
- 多设备会话管理
- 会话过期和清理

### 审计日志
- 记录所有敏感操作
- 包含IP地址、用户代理等信息
- 支持日志查询和分析
- 自动清理过期日志

### 安全中间件
- 请求频率限制
- IP白名单支持
- 请求体大小限制
- 安全HTTP头设置
- 设备指纹识别

## 使用指南

### 初始化系统

1. **运行数据库迁移**
```bash
pnpm run prisma:migrate
```

2. **初始化RBAC系统**
```bash
pnpm run init:rbac
```

3. **启动服务**
```bash
pnpm run dev
```

### 创建自定义权限

1. **定义权限**
```javascript
const permission = {
  name: 'product:manage',
  displayName: '产品管理',
  description: '管理产品信息',
  resource: 'product',
  action: 'manage'
};
```

2. **创建权限**
```http
POST /api/permissions
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "product:manage",
  "displayName": "产品管理",
  "description": "管理产品信息",
  "resource": "product",
  "action": "manage"
}
```

### 创建自定义角色

1. **创建角色**
```http
POST /api/roles
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "product-manager",
  "displayName": "产品经理",
  "description": "负责产品管理",
  "permissions": ["product:manage", "user:read"]
}
```

2. **分配角色给用户**
```javascript
// 通过用户管理接口或直接数据库操作
await prisma.userRole.create({
  data: {
    userId: user.id,
    roleId: role.id
  }
});
```

### 权限检查

在路由中使用权限中间件：

```javascript
// 检查单个权限
app.get('/api/products', {
  preHandler: [authenticateToken, requirePermission('product', 'read')]
}, handler);

// 检查多个权限（AND逻辑）
app.post('/api/products', {
  preHandler: [
    authenticateToken, 
    requirePermissions([
      {resource: 'product', action: 'create'},
      {resource: 'user', action: 'read'}
    ], 'AND')
  ]
}, handler);

// 检查角色
app.delete('/api/products/:id', {
  preHandler: [authenticateToken, requireRole(['admin', 'product-manager'])]
}, handler);
```

## 最佳实践

### 权限设计
1. **遵循最小权限原则** - 只授予必要的权限
2. **使用资源-操作模型** - 清晰定义资源和操作
3. **权限命名规范** - 使用一致的命名约定
4. **定期审查权限** - 定期检查和清理不必要的权限

### 安全实践
1. **强密码策略** - 要求复杂密码
2. **定期密码更新** - 建议定期更换密码
3. **会话管理** - 及时清理过期会话
4. **监控异常活动** - 关注审计日志中的异常

### 性能优化
1. **权限缓存** - 缓存用户权限信息
2. **批量操作** - 使用批量权限检查
3. **索引优化** - 为权限查询添加适当索引
4. **日志清理** - 定期清理过期审计日志

## 故障排除

### 常见问题

1. **权限检查失败**
   - 检查用户是否具有相应角色
   - 验证角色是否分配了正确权限
   - 确认权限名称和资源-操作匹配

2. **Token验证失败**
   - 检查Token是否过期
   - 验证JWT_SECRET配置
   - 确认Token格式正确

3. **会话管理问题**
   - 检查会话是否过期
   - 验证Refresh Token有效性
   - 确认会话清理机制

### 调试技巧

1. **启用详细日志**
```javascript
// 在环境变量中设置
LOG_LEVEL=debug
```

2. **检查审计日志**
```http
GET /api/audit?action=access_denied&limit=50
```

3. **验证权限**
```javascript
// 在代码中检查权限
const hasPermission = await permissionService.hasPermission(
  userId, 'resource', 'action'
);
```

## 扩展功能

### 计划中的功能
1. **OAuth2.0 支持** - 集成第三方登录
2. **多租户支持** - 支持多组织架构
3. **权限继承** - 角色权限继承机制
4. **动态权限** - 基于上下文的动态权限
5. **权限模板** - 预定义权限模板

### 自定义扩展
系统设计支持以下扩展：
- 自定义权限检查逻辑
- 集成外部认证系统
- 添加新的安全中间件
- 扩展审计日志功能
- 集成监控和告警系统
