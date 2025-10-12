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
  LLMServiceStatus 
} from '../../types/llm.js';
import { LLMServiceFactory } from './llm.service.factory.js';

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
      this.fastify.log.info('Default LLM service initialized', {
        provider: config.provider,
        model: config.model
      });
    }
  }

  // 获取默认服务
  getDefaultService(): ILLMService | null {
    return this.defaultService;
  }

  // 设置默认服务
  setDefaultService(config: LLMServiceConfig): ILLMService {
    this.defaultService = this.factory.createService(config);
    this.fastify.log.info('Default LLM service updated', {
      provider: config.provider,
      model: config.model
    });
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
        error: 'No default service configured'
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
    const provider = process.env.LLM_DEFAULT_PROVIDER || 'deepseek';
    const apiKey = process.env.LLM_API_KEY;
    const model = process.env.LLM_DEFAULT_MODEL;
    const baseURL = process.env.LLM_BASE_URL;

    if (!apiKey) {
      this.fastify.log.warn('No LLM API key configured');
      return null;
    }

    const config: LLMServiceConfig = {
      provider: provider as any,
      apiKey,
      model: model || this.getDefaultModel(provider),
      baseURL,
      timeout: parseInt(process.env.LLM_TIMEOUT || '30000'),
      maxRetries: parseInt(process.env.LLM_MAX_RETRIES || '3'),
      defaultParams: {
        temperature: parseFloat(process.env.LLM_TEMPERATURE || '0.7'),
        max_tokens: parseInt(process.env.LLM_MAX_TOKENS || '2000'),
        top_p: parseFloat(process.env.LLM_TOP_P || '1'),
        frequency_penalty: parseFloat(process.env.LLM_FREQUENCY_PENALTY || '0'),
        presence_penalty: parseFloat(process.env.LLM_PRESENCE_PENALTY || '0')
      }
    };

    return config;
  }

  // 获取默认模型
  private getDefaultModel(provider: string): string {
    const defaultModels: Record<string, string> = {
      deepseek: 'deepseek-chat',
      openai: 'gpt-3.5-turbo',
      anthropic: 'claude-3-sonnet-20240229',
      custom: 'custom-model'
    };

    return defaultModels[provider] || 'default-model';
  }

  // 验证配置
  validateConfig(config: LLMServiceConfig): { valid: boolean; errors: string[] } {
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

    if (config.temperature !== undefined && (config.temperature < 0 || config.temperature > 2)) {
      errors.push('Temperature must be between 0 and 2');
    }

    if (config.max_tokens !== undefined && config.max_tokens < 1) {
      errors.push('Max tokens must be greater than 0');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // 清理资源
  async cleanup(): Promise<void> {
    this.factory.clearAllServices();
    this.defaultService = null;
    this.fastify.log.info('LLM service manager cleaned up');
  }
}
