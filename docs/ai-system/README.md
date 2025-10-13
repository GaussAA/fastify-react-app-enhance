# AI对话系统集成文档

## 概述

本系统集成了完整的AI对话功能模块，提供生产环境可用的智能对话服务。系统包含会话管理、多轮对话支持、意图识别、知识库查询、质量监控等核心功能。

## 核心功能模块

### 1. 会话管理功能

#### 功能特性
- **实时状态跟踪**：监控用户对话状态，支持活跃、空闲、过期、终止等状态
- **持久化存储**：会话数据自动保存到数据库，支持服务重启后恢复
- **自动清理机制**：支持会话超时和自动清理，防止资源泄露
- **多用户支持**：每个用户可拥有多个独立会话

#### 配置参数
```typescript
{
  maxIdleTime: 30 * 60 * 1000,        // 最大空闲时间：30分钟
  maxSessionDuration: 2 * 60 * 60 * 1000, // 最大会话持续时间：2小时
  maxMessageCount: 100,                // 最大消息数量
  maxTokens: 100000,                   // 最大token数量
  autoCleanup: true                    // 自动清理过期会话
}
```

#### API接口
- `POST /api/ai/session` - 创建新会话
- `GET /api/ai/session/:sessionId` - 获取会话信息
- `GET /api/ai/sessions/:userId` - 获取用户所有会话
- `DELETE /api/ai/session/:sessionId` - 终止会话

### 2. 多轮对话支持

#### 功能特性
- **上下文理解**：基于对话历史理解用户意图
- **状态机管理**：使用状态机管理对话流程
- **中断恢复**：支持对话中断和恢复功能
- **意图识别**：自动识别用户意图并调整响应策略

#### 支持的状态
- `greeting` - 问候状态
- `help` - 帮助状态
- `answering` - 回答状态
- `farewell` - 告别状态

#### 意图识别
- `greeting` - 问候意图
- `farewell` - 告别意图
- `help_request` - 帮助请求
- `question` - 问题询问
- `thanks` - 感谢意图
- `complaint` - 抱怨意图
- `request` - 请求意图

### 3. 基础AI功能集成

#### 意图识别与实体提取
- **多层级识别**：规则匹配 + 模式识别 + 上下文分析
- **实体提取**：时间、数字、人名等实体自动提取
- **置信度评估**：为每个识别结果提供置信度分数
- **备选方案**：提供多个可能的意图识别结果

#### 知识库查询
- **智能搜索**：基于关键词和相关性得分搜索
- **分类过滤**：支持按类别过滤搜索结果
- **相关性评分**：计算查询与知识库条目的相关性
- **搜索建议**：提供相关搜索建议

#### 质量监控
- **多维度评估**：响应时间、相关性、完整性、清晰度
- **实时监控**：实时监控对话质量指标
- **异常检测**：自动检测异常对话和质量问题
- **改进建议**：提供质量改进建议

## API接口文档

### 对话接口

#### 处理对话请求
```http
POST /api/ai/conversation
Content-Type: application/json

{
  "sessionId": "optional_session_id",
  "userId": "user_123",
  "message": "你好，我想了解一下这个系统",
  "options": {
    "model": "deepseek-chat",
    "temperature": 0.7,
    "maxTokens": 2000,
    "stream": false,
    "context": {}
  }
}
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "sessionId": "session_123",
    "messageId": "msg_456",
    "response": "你好！很高兴为您介绍这个AI系统...",
    "intent": "greeting",
    "confidence": 0.9,
    "entities": {},
    "qualityScore": 0.85,
    "processingTime": 1200,
    "metadata": {
      "model": "deepseek-chat",
      "tokens": 150,
      "context": {}
    }
  },
  "message": "对话处理成功"
}
```

### 意图识别接口

```http
POST /api/ai/intent
Content-Type: application/json

{
  "text": "我想了解如何使用这个系统",
  "context": {},
  "sessionId": "optional_session_id"
}
```

### 知识库搜索接口

```http
POST /api/ai/knowledge/search
Content-Type: application/json

{
  "query": "如何使用系统",
  "category": "usage",
  "limit": 10,
  "minRelevance": 0.5
}
```

### 系统监控接口

#### 健康检查
```http
GET /api/ai/health
```

#### 性能统计
```http
GET /api/ai/stats
```

## 部署和配置

### 环境变量配置

```bash
# 数据库配置
DATABASE_URL=postgresql://user:password@localhost:5432/fastify_react_app

# LLM服务配置
LLM_DEFAULT_PROVIDER=deepseek
LLM_API_KEY=your_api_key
LLM_DEFAULT_MODEL=deepseek-chat
LLM_BASE_URL=https://api.deepseek.com/v1
LLM_TIMEOUT=30000
LLM_MAX_RETRIES=3
LLM_TEMPERATURE=0.7
LLM_MAX_TOKENS=2000

# 系统配置
NODE_ENV=production
LOG_LEVEL=info
CORS_ORIGIN=http://localhost:5173
```

### 数据库迁移

```bash
# 运行数据库迁移
cd apps/api
npx prisma db push

# 初始化AI系统
npx tsx src/scripts/init-ai-system.ts
```

### 启动服务

```bash
# 开发环境
pnpm run dev

# 生产环境
pnpm run start
```

## 监控和维护

### 性能监控

系统提供全面的性能监控功能：

- **请求统计**：总请求数、成功/失败率、平均响应时间
- **会话统计**：活跃会话数、用户数、消息数
- **质量指标**：对话质量得分、异常检测
- **资源使用**：内存使用、CPU使用率

### 日志记录

系统记录详细的日志信息：

- **请求日志**：每个API请求的详细信息
- **错误日志**：系统错误和异常信息
- **性能日志**：性能指标和统计信息
- **业务日志**：对话处理、意图识别等业务日志

### 健康检查

系统提供多层次的健康检查：

- **服务状态**：各个服务组件的运行状态
- **数据库连接**：数据库连接和查询状态
- **外部依赖**：LLM API等外部服务的可用性
- **资源状态**：内存、CPU等系统资源状态

## 扩展和定制

### 添加新的意图类型

1. 在 `AICoreService` 中添加新的意图识别规则
2. 在 `DialogueManager` 中添加对应的状态转换
3. 更新响应生成逻辑

### 扩展知识库

1. 向 `KnowledgeBase` 表添加新的条目
2. 更新搜索算法以支持新的内容类型
3. 调整相关性评分算法

### 自定义质量指标

1. 在 `QualityMetrics` 接口中添加新指标
2. 实现相应的计算逻辑
3. 更新质量报告生成逻辑

## 故障排除

### 常见问题

1. **会话超时**：检查 `maxIdleTime` 配置
2. **响应缓慢**：检查LLM API连接和性能
3. **意图识别不准确**：调整识别规则和阈值
4. **知识库搜索无结果**：检查知识库数据和搜索算法

### 调试工具

- 使用 `/api/ai/health` 检查系统状态
- 使用 `/api/ai/stats` 查看性能统计
- 查看应用日志获取详细错误信息
- 使用测试脚本验证功能

## 安全考虑

- **输入验证**：所有用户输入都经过验证和清理
- **速率限制**：防止API滥用和DDoS攻击
- **会话隔离**：用户会话完全隔离，防止数据泄露
- **错误处理**：敏感错误信息不会暴露给用户

## 性能优化

- **缓存机制**：知识库和配置信息缓存
- **连接池**：数据库连接池优化
- **异步处理**：非阻塞的异步处理机制
- **资源清理**：自动清理过期资源和会话

---

## 总结

本AI对话系统提供了完整的生产环境可用功能，包括：

✅ **会话管理**：实时跟踪、持久化存储、自动清理  
✅ **多轮对话**：上下文理解、状态机管理、中断恢复  
✅ **AI核心功能**：意图识别、知识库查询、质量监控  
✅ **生产环境**：稳定性、可扩展性、性能优化  

系统设计遵循最佳实践，具备良好的可维护性和扩展性，能够满足企业级应用的需求。
