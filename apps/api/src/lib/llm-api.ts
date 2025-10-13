/**
 * LLM API客户端
 * 适配现有的LLM服务管理器
 */

import { LLMServiceManager } from '../services/llm/llm.service.manager.js';
import { FastifyInstance } from 'fastify';

// 全局LLM服务管理器实例
let llmServiceManager: LLMServiceManager | null = null;

/**
 * 初始化LLM API客户端
 */
export function initializeLLMApi(fastify: FastifyInstance): LLMServiceManager {
  if (!llmServiceManager) {
    llmServiceManager = new LLMServiceManager(fastify);
  }
  return llmServiceManager;
}

/**
 * 获取LLM API客户端
 */
export function getLLMApiClient(): LLMServiceManager {
  if (!llmServiceManager) {
    throw new Error('LLM API client not initialized');
  }
  return llmServiceManager;
}

/**
 * LLM API客户端类
 * 提供与现有服务兼容的接口
 */
export class LLMApiClient {
  private serviceManager: LLMServiceManager;

  constructor(serviceManager: LLMServiceManager) {
    this.serviceManager = serviceManager;
  }

  /**
   * 聊天接口
   */
  async chat(request: any): Promise<any> {
    return this.serviceManager.chat(request);
  }

  /**
   * 流式聊天接口
   */
  async *chatStream(request: any): AsyncIterable<any> {
    yield* this.serviceManager.chatStream(request);
  }

  /**
   * 获取模型列表
   */
  async listModels(): Promise<any[]> {
    return this.serviceManager.listModels();
  }

  /**
   * 获取模型信息
   */
  async getModel(modelId: string): Promise<any> {
    return this.serviceManager.getModel(modelId);
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<any> {
    return this.serviceManager.healthCheck();
  }

  /**
   * 健康检查所有服务
   */
  async healthCheckAll(): Promise<Record<string, any>> {
    return this.serviceManager.healthCheckAll();
  }

  /**
   * 获取服务统计
   */
  getServiceStats(): any {
    return this.serviceManager.getServiceStats();
  }

  /**
   * 获取支持的提供商
   */
  getSupportedProviders(): string[] {
    return this.serviceManager.getSupportedProviders();
  }
}

// 创建默认实例（延迟初始化）
let _llmApiClient: LLMApiClient | null = null;

export function getLLMApiClientInstance(): LLMApiClient {
  if (!_llmApiClient) {
    _llmApiClient = new LLMApiClient(getLLMApiClient());
  }
  return _llmApiClient;
}

export const llmApiClient = {
  get chat() {
    return getLLMApiClientInstance().chat.bind(getLLMApiClientInstance());
  },
  get chatStream() {
    return getLLMApiClientInstance().chatStream.bind(getLLMApiClientInstance());
  },
  get listModels() {
    return getLLMApiClientInstance().listModels.bind(getLLMApiClientInstance());
  },
  get getModel() {
    return getLLMApiClientInstance().getModel.bind(getLLMApiClientInstance());
  },
  get healthCheck() {
    return getLLMApiClientInstance().healthCheck.bind(
      getLLMApiClientInstance()
    );
  },
  get healthCheckAll() {
    return getLLMApiClientInstance().healthCheckAll.bind(
      getLLMApiClientInstance()
    );
  },
  get getServiceStats() {
    return getLLMApiClientInstance().getServiceStats.bind(
      getLLMApiClientInstance()
    );
  },
  get getSupportedProviders() {
    return getLLMApiClientInstance().getSupportedProviders.bind(
      getLLMApiClientInstance()
    );
  },
};
