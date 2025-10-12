/**
 * 前端大模型服务类型定义
 * 与后端API保持一致
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

// 服务状态
export interface LLMServiceStatus {
  provider: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  lastCheck: Date;
  error?: string;
}

// API响应格式
export interface LLMApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message: string;
}

// 聊天会话
export interface LLMChatSession {
  id: string;
  title: string;
  messages: LLMMessage[];
  model: string;
  createdAt: Date;
  updatedAt: Date;
}

// 聊天配置
export interface LLMChatConfig {
  model: string;
  temperature: number;
  max_tokens: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
}

// 默认配置
export const DEFAULT_CHAT_CONFIG: LLMChatConfig = {
  model: 'deepseek-chat',
  temperature: 0.7,
  max_tokens: 2000,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0
};
