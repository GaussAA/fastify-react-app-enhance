/**
 * 大模型服务管理器
 * 提供统一的服务管理和配置功能
 */

import { FastifyInstance } from 'fastify';
import {
  ILLMService,
  LLMServiceConfig,
  LLMChatRequest,
  LLMChatResponse,
  LLMStreamResponse,
  LLMModel,
  LLMServiceStatus,
} from '../../types/llm.js';
import { LLMServiceFactory } from './llm.service.factory.js';
import { llm as llmConfig } from '../../config/env.js';

export class LLMServiceManager {
  private factory: LLMServiceFactory;
  private defaultService: ILLMService | null = null;
  private fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
    this.factory = new LLMServiceFactory(fastify);
  }

  // 初始化默认服务
  async initializeDefaultService(): Promise<void> {
    const config = this.getDefaultConfig();
    if (config) {
      this.defaultService = this.factory.createService(config);
      this.fastify.log.info('Default LLM service initialized');
    }
  }

  // 获取默认服务
  getDefaultService(): ILLMService | null {
    return this.defaultService;
  }

  // 设置默认服务
  setDefaultService(config: LLMServiceConfig): ILLMService {
    this.defaultService = this.factory.createService(config);
    this.fastify.log.info('Default LLM service updated');
    return this.defaultService;
  }

  // 创建服务
  createService(config: LLMServiceConfig): ILLMService {
    return this.factory.createService(config);
  }

  // 获取服务
  getService(config: LLMServiceConfig): ILLMService | undefined {
    return this.factory.getService(config);
  }

  // 聊天接口（使用默认服务）
  async chat(request: LLMChatRequest): Promise<LLMChatResponse> {
    if (!this.defaultService) {
      throw new Error('No default LLM service configured');
    }
    return this.defaultService.chat(request);
  }

  // 流式聊天接口（使用默认服务）
  async *chatStream(request: LLMChatRequest): AsyncIterable<LLMStreamResponse> {
    if (!this.defaultService) {
      throw new Error('No default LLM service configured');
    }
    yield* this.defaultService.chatStream(request);
  }

  // 获取模型列表（使用默认服务）
  async listModels(): Promise<LLMModel[]> {
    if (!this.defaultService) {
      throw new Error('No default LLM service configured');
    }
    return this.defaultService.listModels();
  }

  // 获取模型信息（使用默认服务）
  async getModel(modelId: string): Promise<LLMModel> {
    if (!this.defaultService) {
      throw new Error('No default LLM service configured');
    }
    return this.defaultService.getModel(modelId);
  }

  // 健康检查（使用默认服务）
  async healthCheck(): Promise<LLMServiceStatus> {
    if (!this.defaultService) {
      return {
        provider: 'none',
        status: 'unknown',
        lastCheck: new Date(),
        error: 'No default service configured',
      };
    }
    return this.defaultService.healthCheck();
  }

  // 健康检查所有服务
  async healthCheckAll(): Promise<Record<string, LLMServiceStatus>> {
    return this.factory.healthCheckAll();
  }

  // 获取服务统计
  getServiceStats() {
    return this.factory.getServiceStats();
  }

  // 获取支持的提供商
  getSupportedProviders(): string[] {
    return this.factory.getSupportedProviders();
  }

  // 获取默认配置
  private getDefaultConfig(): LLMServiceConfig | null {
    if (!llmConfig.apiKey) {
      this.fastify.log.warn('No LLM API key configured');
      return null;
    }

    const config: LLMServiceConfig = {
      provider: llmConfig.defaultProvider as any,
      apiKey: llmConfig.apiKey,
      model: llmConfig.defaultModel || this.getDefaultModel(llmConfig.defaultProvider),
      baseURL: llmConfig.baseUrl,
      timeout: llmConfig.timeout,
      maxRetries: llmConfig.maxRetries,
      defaultParams: {
        temperature: llmConfig.temperature,
        max_tokens: llmConfig.maxTokens,
        top_p: llmConfig.topP,
        frequency_penalty: llmConfig.frequencyPenalty,
        presence_penalty: llmConfig.presencePenalty,
      },
    };

    return config;
  }

  // 获取默认模型
  private getDefaultModel(provider: string): string {
    const defaultModels: Record<string, string> = {
      deepseek: 'deepseek-chat',
      openai: 'gpt-3.5-turbo',
      anthropic: 'claude-3-sonnet-20240229',
      custom: 'custom-model',
    };

    return defaultModels[provider] || 'default-model';
  }

  // 验证配置
  validateConfig(config: LLMServiceConfig): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!config.provider) {
      errors.push('Provider is required');
    }

    if (!config.apiKey) {
      errors.push('API key is required');
    }

    if (!config.model) {
      errors.push('Model is required');
    }

    const supportedProviders = this.getSupportedProviders();
    if (config.provider && !supportedProviders.includes(config.provider)) {
      errors.push(`Unsupported provider: ${config.provider}`);
    }

    if (
      config.defaultParams?.temperature !== undefined &&
      (config.defaultParams.temperature < 0 ||
        config.defaultParams.temperature > 2)
    ) {
      errors.push('Temperature must be between 0 and 2');
    }

    if (
      config.defaultParams?.max_tokens !== undefined &&
      config.defaultParams.max_tokens < 1
    ) {
      errors.push('Max tokens must be greater than 0');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // 清理资源
  async cleanup(): Promise<void> {
    this.factory.clearAllServices();
    this.defaultService = null;
    this.fastify.log.info('LLM service manager cleaned up');
  }
}
