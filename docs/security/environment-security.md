# 环境配置安全指南

## 概述

本文档描述了项目中环境配置的安全最佳实践，包括如何安全地管理敏感信息，避免硬编码密码和密钥。

## 安全问题

### 已修复的问题

1. **硬编码 JWT 密钥** - 之前使用默认值 `"your-super-secret-jwt-key-change-this-in-production"`
2. **硬编码数据库密码** - 之前使用 `postgres:postgres`
3. **硬编码连接字符串** - 数据库连接字符串直接写在代码中
4. **敏感信息泄露** - 配置文件可能被提交到版本控制

### 安全风险

- 🔴 **高风险**: 生产环境使用默认密码
- 🔴 **高风险**: JWT 密钥泄露导致身份验证绕过
- 🟡 **中风险**: 数据库连接信息泄露
- 🟡 **中风险**: API 密钥硬编码

## 安全解决方案

### 1. 安全环境管理器

项目现在使用 `SecureEnvManager` 类来管理环境配置：

```javascript
import SecureEnvManager from '../utils/env-manager.js';

const envManager = new SecureEnvManager(projectRoot);
```

**功能特性：**
- 自动生成安全的随机密钥
- 从模板文件生成环境配置
- 验证环境配置完整性
- 确保敏感文件不被提交

### 2. 环境配置模板

使用模板系统替代硬编码：

```
config/env-templates/
├── root.env      # 根目录配置模板
├── api.env       # API 项目配置模板
└── web.env       # Web 项目配置模板
```

**模板变量：**
- `{{JWT_SECRET}}` - 自动生成的 JWT 密钥
- `{{DB_PASSWORD}}` - 自动生成的数据库密码
- `{{API_KEY}}` - 自动生成的 API 密钥

### 3. 安全配置生成

运行以下命令生成安全的环境配置：

```bash
# 生成所有环境配置文件
pnpm run env:generate

# 或使用恢复脚本
pnpm run restore
```

### 4. 安全检查

定期运行安全检查：

```bash
# 检查安全配置问题
pnpm run security:check
```

## 使用指南

### 开发环境设置

1. **首次设置**：
   ```bash
   pnpm run env:generate
   ```

2. **验证配置**：
   ```bash
   pnpm run security:check
   ```

3. **启动开发环境**：
   ```bash
   pnpm run dev
   ```

### 生产环境部署

1. **设置环境变量**：
   ```bash
   export JWT_SECRET="your-production-jwt-secret"
   export DB_PASSWORD="your-production-db-password"
   export API_KEY="your-production-api-key"
   ```

2. **或使用 .env.secrets 文件**：
   ```bash
   # 创建 .env.secrets 文件（不提交到版本控制）
   JWT_SECRET="your-production-jwt-secret"
   DB_PASSWORD="your-production-db-password"
   API_KEY="your-production-api-key"
   ```

### 密钥管理

#### 自动生成密钥

系统会自动生成以下类型的密钥：

- **JWT 密钥**: 64 字符的十六进制字符串
- **数据库密码**: 16 字符的十六进制字符串
- **API 密钥**: 32 字符的十六进制字符串

#### 自定义密钥

如果需要使用自定义密钥，可以：

1. 创建 `.env.secrets` 文件：
   ```bash
   JWT_SECRET="your-custom-jwt-secret"
   DB_PASSWORD="your-custom-db-password"
   API_KEY="your-custom-api-key"
   ```

2. 运行配置生成：
   ```bash
   pnpm run env:generate
   ```

## 安全最佳实践

### 1. 版本控制

**必须忽略的文件：**
```
.env
.env.local
.env.*.local
.env.secrets
```

**可以提交的文件：**
```
config/env-templates/
.env.example
```

### 2. 密钥轮换

定期轮换密钥：

```bash
# 删除旧的 .env.secrets 文件
rm .env.secrets

# 重新生成配置
pnpm run env:generate
```

### 3. 环境隔离

不同环境使用不同的密钥：

- **开发环境**: 自动生成的测试密钥
- **测试环境**: 独立的测试密钥
- **生产环境**: 强随机密钥

### 4. 监控和审计

定期运行安全检查：

```bash
# 检查硬编码敏感信息
pnpm run security:check

# 检查代码质量
pnpm run check:quality

# 运行所有检查
pnpm run check:all
```

## 故障排除

### 常见问题

1. **模板文件不存在**
   ```
   错误: 模板文件不存在: config/env-templates/root.env
   解决: 确保模板文件存在于正确位置
   ```

2. **权限问题**
   ```
   错误: EACCES: permission denied
   解决: 检查文件权限，确保有写入权限
   ```

3. **环境变量未设置**
   ```
   警告: 缺少必需的环境变量: JWT_SECRET
   解决: 运行 pnpm run env:generate 生成配置
   ```

### 调试模式

启用详细日志：

```bash
DEBUG=env-manager pnpm run env:generate
```

## 更新日志

- **v1.0.0**: 初始安全配置系统
- **v1.1.0**: 添加自动密钥生成
- **v1.2.0**: 添加配置验证功能
- **v1.3.0**: 添加安全检查脚本

## 相关文档

- [开发环境设置](../development/dev-tools.md)
- [部署指南](../deployment/docker.md)
- [安全审计](../security/security-audit.md)
