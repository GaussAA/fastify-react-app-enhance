# 大模型服务集成文档

## 概述

本项目集成了大模型服务，支持多种AI模型提供商，提供统一的API接口和前端交互界面。当前主要支持DeepSeek，并具备良好的扩展性以支持其他大模型服务。

## 架构设计

### 后端架构

```
apps/api/src/
├── types/llm.ts                    # 类型定义
├── services/llm/
│   ├── base-llm.service.ts         # 基础服务类
│   ├── deepseek.service.ts         # DeepSeek实现
│   ├── llm.service.factory.ts      # 服务工厂
│   └── llm.service.manager.ts      # 服务管理器
└── routes/llm.route.ts             # API路由
```

### 前端架构

```
apps/web/src/
├── types/llm.ts                    # 类型定义
├── lib/llm-api.ts                  # API客户端
├── store/llm.ts                    # 状态管理
└── components/llm/
    ├── ChatInterface.tsx           # 聊天界面
    ├── ChatMessage.tsx             # 消息组件
    └── ChatSettings.tsx            # 设置组件
```

## 功能特性

### 核心功能

- ✅ **多模型支持**：支持DeepSeek、OpenAI、Anthropic等
- ✅ **统一接口**：标准化的API调用规范
- ✅ **流式响应**：支持实时流式对话
- ✅ **会话管理**：多会话支持和历史记录
- ✅ **配置管理**：灵活的参数配置
- ✅ **错误处理**：完善的错误处理和重试机制
- ✅ **健康检查**：服务状态监控
- ✅ **日志记录**：完整的操作日志

### 扩展性设计

- 🔧 **模块化架构**：抽象接口 + 具体实现
- 🔧 **工厂模式**：动态创建服务实例
- 🔧 **配置驱动**：通过配置文件切换服务
- 🔧 **插件化**：易于添加新的模型提供商

## 快速开始

### 1. 环境配置

复制环境配置文件：

```bash
cp config/env-templates/llm.env .env
```

配置必要的环境变量：

```env
# 大模型服务配置
LLM_DEFAULT_PROVIDER=deepseek
LLM_API_KEY=your_deepseek_api_key_here
LLM_DEFAULT_MODEL=deepseek-chat
```

### 2. 启动服务

```bash
# 安装依赖
pnpm install

# 启动后端服务
pnpm --filter fastify-api run dev

# 启动前端服务
pnpm --filter fastify-web run dev
```

### 3. 访问界面

打开浏览器访问：http://localhost:5173

在Dashboard中点击"AI助手"标签页即可开始使用。

## API接口

### 基础接口

#### 聊天接口

```http
POST /api/llm/chat
Content-Type: application/json

{
  "messages": [
    {
      "role": "user",
      "content": "你好，请介绍一下自己"
    }
  ],
  "model": "deepseek-chat",
  "temperature": 0.7,
  "max_tokens": 2000
}
```

#### 流式聊天接口

```http
POST /api/llm/chat/stream
Content-Type: application/json

{
  "messages": [
    {
      "role": "user", 
      "content": "请写一首诗"
    }
  ],
  "stream": true
}
```

#### 获取模型列表

```http
GET /api/llm/models
```

#### 健康检查

```http
GET /api/llm/health
```

### 响应格式

所有API响应都遵循统一格式：

```json
{
  "success": true,
  "data": {
    // 具体数据
  },
  "message": "操作成功"
}
```

## 配置说明

### 环境变量

| 变量名                 | 说明             | 默认值                        |
| ---------------------- | ---------------- | ----------------------------- |
| `LLM_DEFAULT_PROVIDER` | 默认提供商       | `deepseek`                    |
| `LLM_API_KEY`          | API密钥          | -                             |
| `LLM_DEFAULT_MODEL`    | 默认模型         | `deepseek-chat`               |
| `LLM_BASE_URL`         | 服务基础URL      | `https://api.deepseek.com/v1` |
| `LLM_TIMEOUT`          | 请求超时时间(ms) | `30000`                       |
| `LLM_MAX_RETRIES`      | 最大重试次数     | `3`                           |
| `LLM_TEMPERATURE`      | 默认温度         | `0.7`                         |
| `LLM_MAX_TOKENS`       | 默认最大令牌数   | `2000`                        |

### 模型参数

| 参数                | 类型   | 范围  | 说明           |
| ------------------- | ------ | ----- | -------------- |
| `temperature`       | number | 0-2   | 控制输出随机性 |
| `max_tokens`        | number | >0    | 最大输出长度   |
| `top_p`             | number | 0-1   | 核采样参数     |
| `frequency_penalty` | number | -2到2 | 频率惩罚       |
| `presence_penalty`  | number | -2到2 | 存在惩罚       |

## 扩展开发

### 添加新的模型提供商

1. **创建服务实现类**

```typescript
// apps/api/src/services/llm/custom.service.ts
export class CustomService extends BaseLLMService {
  async chat(request: LLMChatRequest): Promise<LLMChatResponse> {
    // 实现具体的API调用逻辑
  }
  
  // 实现其他抽象方法...
}
```

2. **更新服务工厂**

```typescript
// apps/api/src/services/llm/llm.service.factory.ts
switch (config.provider) {
  case 'custom':
    service = new CustomService(config, this.fastify);
    break;
}
```

3. **添加类型定义**

```typescript
// apps/api/src/types/llm.ts
export interface LLMServiceConfig {
  provider: 'deepseek' | 'openai' | 'anthropic' | 'custom';
  // ...
}
```

### 自定义前端组件

1. **创建新组件**

```typescript
// apps/web/src/components/llm/CustomComponent.tsx
export function CustomComponent() {
  const { /* 使用LLM状态 */ } = useLLMStore();
  // 组件实现...
}
```

2. **集成到页面**

```typescript
// apps/web/src/pages/LLMPage.tsx
import { CustomComponent } from '@/components/llm/CustomComponent';
```

## 错误处理

### 常见错误

| 错误码                | 说明         | 解决方案               |
| --------------------- | ------------ | ---------------------- |
| `INVALID_API_KEY`     | API密钥无效  | 检查环境变量配置       |
| `MODEL_NOT_FOUND`     | 模型不存在   | 使用正确的模型名称     |
| `RATE_LIMIT_EXCEEDED` | 请求频率超限 | 降低请求频率           |
| `INSUFFICIENT_QUOTA`  | 配额不足     | 检查账户余额           |
| `TIMEOUT`             | 请求超时     | 增加超时时间或检查网络 |

### 调试技巧

1. **启用详细日志**

```env
LOG_LEVEL=debug
```

2. **检查服务健康状态**

```bash
curl http://localhost:8001/api/llm/health
```

3. **查看服务统计**

```bash
curl http://localhost:8001/api/llm/stats
```

## 性能优化

### 后端优化

- 使用连接池管理HTTP连接
- 实现请求缓存机制
- 优化错误重试策略
- 添加请求限流

### 前端优化

- 实现消息虚拟滚动
- 添加请求防抖
- 优化状态更新频率
- 使用React.memo优化渲染

## 安全考虑

### API安全

- 使用HTTPS传输
- 实现API密钥轮换
- 添加请求签名验证
- 限制API调用频率

### 数据安全

- 敏感信息加密存储
- 实现数据脱敏
- 添加访问日志
- 定期安全审计

## 监控和运维

### 监控指标

- API响应时间
- 错误率统计
- 请求量统计
- 服务健康状态

### 日志管理

- 结构化日志输出
- 日志级别控制
- 日志轮转策略
- 集中日志收集

## 常见问题

### Q: 如何切换不同的模型提供商？

A: 修改环境变量 `LLM_DEFAULT_PROVIDER` 和相应的API密钥即可。

### Q: 支持哪些模型提供商？

A: 当前支持DeepSeek，OpenAI和Anthropic正在开发中。

### Q: 如何自定义模型参数？

A: 可以通过前端设置界面或API请求参数进行配置。

### Q: 流式响应有什么优势？

A: 流式响应可以提供更好的用户体验，实时显示AI回复内容。

## 更新日志

### v1.0.0 (2024-10-12)

- ✅ 初始版本发布
- ✅ 支持DeepSeek模型
- ✅ 完整的聊天界面
- ✅ 流式响应支持
- ✅ 会话管理功能
- ✅ 配置管理界面

## 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 创建 Pull Request

## 许可证

本项目采用 MIT 许可证。
