/**
 * 大模型服务类型定义
 * 定义统一的接口规范，确保不同大模型服务的一致性
 */

// 基础消息类型
export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  name?: string;
}

// 聊天请求参数
export interface LLMChatRequest {
  messages: LLMMessage[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stream?: boolean;
  user?: string;
}

// 聊天响应
export interface LLMChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: LLMChoice[];
  usage: LLMUsage;
}

// 选择项
export interface LLMChoice {
  index: number;
  message: LLMMessage;
  finish_reason: 'stop' | 'length' | 'function_call' | 'content_filter' | null;
  delta?: Partial<LLMMessage>;
}

// 使用统计
export interface LLMUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

// 流式响应
export interface LLMStreamResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: LLMStreamChoice[];
}

export interface LLMStreamChoice {
  index: number;
  delta: Partial<LLMMessage>;
  finish_reason: 'stop' | 'length' | 'function_call' | 'content_filter' | null;
}

// 模型信息
export interface LLMModel {
  id: string;
  object: string;
  created: number;
  owned_by: string;
  permission: any[];
  root: string;
  parent?: string;
}

// 模型列表响应
export interface LLMModelsResponse {
  object: string;
  data: LLMModel[];
}

// 错误响应
export interface LLMError {
  error: {
    message: string;
    type: string;
    param?: string;
    code?: string;
  };
}

// 大模型服务配置
export interface LLMServiceConfig {
  provider: 'deepseek' | 'openai' | 'anthropic' | 'custom';
  apiKey: string;
  baseURL?: string;
  model: string;
  defaultParams?: Partial<LLMChatRequest>;
  timeout?: number;
  maxRetries?: number;
}

// 服务状态
export interface LLMServiceStatus {
  provider: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  lastCheck: Date;
  error?: string;
}

// 抽象服务接口
export interface ILLMService {
  // 基础方法
  chat(request: LLMChatRequest): Promise<LLMChatResponse>;
  chatStream(request: LLMChatRequest): AsyncIterable<LLMStreamResponse>;
  listModels(): Promise<LLMModel[]>;
  getModel(modelId: string): Promise<LLMModel>;

  // 健康检查
  healthCheck(): Promise<LLMServiceStatus>;

  // 配置管理
  getConfig(): LLMServiceConfig;
  updateConfig(config: Partial<LLMServiceConfig>): void;
}

// 服务工厂接口
export interface ILLMServiceFactory {
  createService(config: LLMServiceConfig): ILLMService;
  getSupportedProviders(): string[];
}
