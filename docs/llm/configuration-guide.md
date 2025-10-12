# LLM服务配置指南

## 🔒 安全配置原则

本项目采用**安全优先**的配置管理方案，确保敏感信息得到妥善保护。

## 📁 配置文件说明

### 1. `env.example` - 配置模板文件
- **用途**：AI可见的配置模板，用于开发时更新配置项
- **内容**：包含所有配置项的结构和占位符
- **安全级别**：公开，可提交到版本控制

### 2. `.env` - 实际配置文件
- **用途**：存储所有敏感环境变量的实际值
- **内容**：用户手动填写的真实配置值
- **安全级别**：私有，已添加到`.gitignore`，不会提交到版本控制

## 🚀 LLM服务配置步骤

### 步骤1：复制配置模板
```bash
cp env.example .env
```

### 步骤2：编辑`.env`文件，填写LLM配置
```env
# LLM配置 - 请填写您的实际值
LLM_DEFAULT_PROVIDER=deepseek
LLM_API_KEY=your_deepseek_api_key_here
LLM_DEFAULT_MODEL=deepseek-chat
LLM_BASE_URL=https://api.deepseek.com/v1
LLM_TIMEOUT=30000
LLM_MAX_RETRIES=3
LLM_TEMPERATURE=0.7
LLM_MAX_TOKENS=2000
LLM_TOP_P=1
LLM_FREQUENCY_PENALTY=0
LLM_PRESENCE_PENALTY=0
```

### 步骤3：重启后端服务
```bash
pnpm --filter fastify-api run dev
```

## 🔧 配置项说明

| 配置项 | 说明 | 默认值 | 示例 |
|--------|------|--------|------|
| `LLM_DEFAULT_PROVIDER` | 默认LLM提供商 | `deepseek` | `deepseek`, `openai`, `anthropic` |
| `LLM_API_KEY` | LLM服务API密钥 | - | `sk-xxx...` |
| `LLM_DEFAULT_MODEL` | 默认模型名称 | `deepseek-chat` | `deepseek-chat`, `gpt-3.5-turbo` |
| `LLM_BASE_URL` | LLM服务基础URL | `https://api.deepseek.com/v1` | 服务商提供的API地址 |
| `LLM_TIMEOUT` | 请求超时时间(毫秒) | `30000` | `30000` |
| `LLM_MAX_RETRIES` | 最大重试次数 | `3` | `3` |
| `LLM_TEMPERATURE` | 温度参数 | `0.7` | `0.0-2.0` |
| `LLM_MAX_TOKENS` | 最大令牌数 | `2000` | `1000-4000` |
| `LLM_TOP_P` | 核采样参数 | `1` | `0.0-1.0` |
| `LLM_FREQUENCY_PENALTY` | 频率惩罚 | `0` | `-2.0-2.0` |
| `LLM_PRESENCE_PENALTY` | 存在惩罚 | `0` | `-2.0-2.0` |

## 🛡️ 安全最佳实践

### 1. 密钥管理
- ✅ 使用强密码和随机生成的API密钥
- ✅ 定期轮换API密钥
- ✅ 不要在代码中硬编码密钥
- ❌ 不要将`.env`文件提交到版本控制

### 2. 访问控制
- ✅ 限制API密钥的权限范围
- ✅ 使用环境变量隔离不同环境的配置
- ✅ 定期审查配置文件的访问权限

### 3. 监控和审计
- ✅ 监控API使用情况
- ✅ 记录配置变更日志
- ✅ 设置异常使用告警

## 🔍 故障排除

### 问题1：LLM服务显示"No default service configured"
**原因**：`.env`文件中缺少LLM配置或配置错误
**解决方案**：
1. 检查`.env`文件是否存在
2. 确认所有LLM配置项都已填写
3. 重启后端服务

### 问题2：API密钥无效
**原因**：API密钥错误或已过期
**解决方案**：
1. 检查API密钥是否正确
2. 确认密钥权限是否足够
3. 联系服务提供商确认密钥状态

### 问题3：请求超时
**原因**：网络问题或服务响应慢
**解决方案**：
1. 增加`LLM_TIMEOUT`值
2. 检查网络连接
3. 确认服务商服务状态

## 📞 获取帮助

如果您在配置过程中遇到问题，请：

1. 查看本文档的故障排除部分
2. 检查后端服务日志
3. 确认所有配置项都已正确填写
4. 联系技术支持团队

---

**⚠️ 重要提醒**：请妥善保管您的API密钥，不要与他人分享或在公共场所暴露。
