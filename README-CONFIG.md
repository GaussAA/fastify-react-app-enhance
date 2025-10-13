# 🔒 安全配置管理方案

## 概述

本项目采用**安全优先**的环境配置管理方案，确保敏感信息得到妥善保护，同时保持配置的便捷性和可维护性。

## 📁 配置文件结构

```
项目根目录/
├── env.example          # 配置模板文件 (AI可见，可提交到版本控制)
├── .env                 # 实际配置文件 (用户填写，不提交到版本控制)
├── .gitignore          # 已包含 .env 文件排除规则
└── scripts/
    └── check-llm-config.js  # 配置检查脚本
```

## 🛡️ 安全设计原则

### 1. **敏感信息隔离**

- `.env` 文件包含所有敏感信息，已添加到 `.gitignore`
- AI 无法访问真实的 API 密钥和密码
- 用户完全控制敏感信息的输入

### 2. **模板化管理**

- `env.example` 作为配置模板，AI 可以安全地更新
- 使用占位符格式 `{CONFIG_NAME}` 标识需要用户填写的配置项
- 清晰的配置项说明和默认值

### 3. **配置验证**

- 提供配置检查脚本验证配置完整性
- 自动检测配置错误和缺失项
- 提供详细的错误信息和解决方案

## 🚀 快速开始

### 1. 复制配置模板

```bash
cp env.example .env
```

### 2. 编辑配置文件

使用您喜欢的编辑器打开 `.env` 文件，填写所有配置项的实际值：

```env
# 数据库配置
DATABASE_URL=postgresql://username:password@localhost:5432/database_name

# JWT配置
JWT_SECRET=your-super-secret-jwt-key-here

# API密钥
API_KEY=your-api-key-here

# LLM配置
LLM_DEFAULT_PROVIDER=deepseek
LLM_API_KEY=your-deepseek-api-key-here
LLM_DEFAULT_MODEL=deepseek-chat
LLM_BASE_URL=https://api.deepseek.com/v1
# ... 其他配置项
```

### 3. 验证配置

```bash
node scripts/check-llm-config.js
```

### 4. 启动服务

```bash
# 启动后端
pnpm --filter fastify-api run dev

# 启动前端
pnpm --filter fastify-web run dev
```

## 🔧 配置管理流程

### 添加新配置项

1. **AI 更新模板**：在 `env.example` 中添加新的配置项
2. **用户填写值**：在 `.env` 文件中添加对应的实际值
3. **验证配置**：运行检查脚本确保配置正确

### 更新现有配置

1. **直接编辑**：修改 `.env` 文件中的配置值
2. **重启服务**：重启相关服务以加载新配置
3. **验证功能**：测试相关功能是否正常工作

## 📋 配置项说明

### LLM 服务配置

| 配置项                 | 说明          | 默认值                        | 示例                 |
| ---------------------- | ------------- | ----------------------------- | -------------------- |
| `LLM_DEFAULT_PROVIDER` | LLM服务提供商 | `deepseek`                    | `deepseek`, `openai` |
| `LLM_API_KEY`          | API密钥       | -                             | `sk-xxx...`          |
| `LLM_DEFAULT_MODEL`    | 默认模型      | `deepseek-chat`               | `deepseek-chat`      |
| `LLM_BASE_URL`         | 服务基础URL   | `https://api.deepseek.com/v1` | API服务地址          |
| `LLM_TIMEOUT`          | 请求超时(ms)  | `30000`                       | `30000`              |
| `LLM_MAX_RETRIES`      | 最大重试次数  | `3`                           | `3`                  |
| `LLM_TEMPERATURE`      | 温度参数      | `0.7`                         | `0.0-2.0`            |
| `LLM_MAX_TOKENS`       | 最大令牌数    | `2000`                        | `1000-4000`          |

## 🔍 故障排除

### 常见问题

1. **配置检查失败**
   - 检查 `.env` 文件是否存在
   - 确认所有必需配置项都已填写
   - 确保没有使用占位符格式

2. **LLM服务无法启动**
   - 验证 API 密钥是否正确
   - 检查网络连接
   - 查看后端服务日志

3. **配置不生效**
   - 重启相关服务
   - 清除缓存
   - 检查配置文件语法

## 🛡️ 安全最佳实践

1. **密钥管理**
   - 使用强密码和随机生成的密钥
   - 定期轮换 API 密钥
   - 不要在代码中硬编码敏感信息

2. **访问控制**
   - 限制配置文件的访问权限
   - 使用环境变量隔离不同环境
   - 定期审查配置访问日志

3. **监控审计**
   - 监控 API 使用情况
   - 记录配置变更
   - 设置异常告警

## 📞 获取帮助

- 查看 `docs/llm/configuration-guide.md` 获取详细配置说明
- 运行 `node scripts/check-llm-config.js` 检查配置状态
- 查看服务日志排查问题

---

**⚠️ 重要提醒**：请妥善保管您的配置文件，不要将 `.env` 文件分享给他人或提交到版本控制系统。
