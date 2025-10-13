/**
 * 大模型服务基类
 * 提供通用的错误处理、日志记录和重试机制
 */

import { FastifyInstance } from 'fastify';
import {
  ILLMService,
  LLMChatRequest,
  LLMChatResponse,
  LLMStreamResponse,
  LLMModel,
  LLMServiceConfig,
  LLMServiceStatus,
  LLMError,
} from '../../types/llm.js';

export abstract class BaseLLMService implements ILLMService {
  protected config: LLMServiceConfig;
  protected logger: any;
  protected retryCount = 0;

  constructor(config: LLMServiceConfig, fastify: FastifyInstance) {
    this.config = config;
    this.logger = fastify.log;
  }

  // 抽象方法，由具体实现类提供
  abstract chat(request: LLMChatRequest): Promise<LLMChatResponse>;
  abstract chatStream(
    request: LLMChatRequest
  ): AsyncIterable<LLMStreamResponse>;
  abstract listModels(): Promise<LLMModel[]>;
  abstract getModel(modelId: string): Promise<LLMModel>;

  // 通用方法
  getConfig(): LLMServiceConfig {
    return { ...this.config };
  }

  updateConfig(config: Partial<LLMServiceConfig>): void {
    this.config = { ...this.config, ...config };
    this.logger.info('LLM service config updated', {
      provider: this.config.provider,
    });
  }

  async healthCheck(): Promise<LLMServiceStatus> {
    try {
      // 尝试获取模型列表来检查服务健康状态
      await this.listModels();
      return {
        provider: this.config.provider,
        status: 'healthy',
        lastCheck: new Date(),
      };
    } catch (error: any) {
      this.logger.error('LLM service health check failed', {
        provider: this.config.provider,
        error: error.message,
      });
      return {
        provider: this.config.provider,
        status: 'unhealthy',
        lastCheck: new Date(),
        error: error.message,
      };
    }
  }

  // 通用错误处理
  protected handleError(error: any, context: string): never {
    this.logger.error(`LLM service error in ${context}`, {
      provider: this.config.provider,
      error: error.message,
      stack: error.stack,
    });

    // 标准化错误格式
    const llmError: LLMError = {
      error: {
        message: error.message || 'Unknown error occurred',
        type: error.type || 'service_error',
        code: error.code || 'INTERNAL_ERROR',
      },
    };

    throw llmError;
  }

  // 重试机制
  protected async withRetry<T>(
    operation: () => Promise<T>,
    context: string,
    maxRetries?: number
  ): Promise<T> {
    const retries = maxRetries || this.config.maxRetries || 3;
    let lastError: any;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;

        // 如果是最后一次尝试，直接抛出错误
        if (attempt === retries) {
          break;
        }

        // 检查是否应该重试
        if (!this.shouldRetry(error)) {
          break;
        }

        // 计算退避时间
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        this.logger.warn(
          `LLM service retry attempt ${attempt + 1}/${retries}`,
          {
            provider: this.config.provider,
            context,
            delay,
            error: error.message,
          }
        );

        await this.sleep(delay);
      }
    }

    this.handleError(lastError, context);
  }

  // 判断是否应该重试
  private shouldRetry(error: any): boolean {
    // 网络错误、超时错误、5xx错误可以重试
    if (
      error.code === 'ECONNRESET' ||
      error.code === 'ETIMEDOUT' ||
      error.code === 'ENOTFOUND' ||
      (error.status >= 500 && error.status < 600)
    ) {
      return true;
    }

    // 4xx错误通常不应该重试
    if (error.status >= 400 && error.status < 500) {
      return false;
    }

    return true;
  }

  // 睡眠函数
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 验证请求参数
  protected validateRequest(request: LLMChatRequest): void {
    if (
      !request.messages ||
      !Array.isArray(request.messages) ||
      request.messages.length === 0
    ) {
      throw new Error('Messages array is required and cannot be empty');
    }

    for (const message of request.messages) {
      if (!message.role || !message.content) {
        throw new Error('Each message must have role and content');
      }

      if (!['system', 'user', 'assistant'].includes(message.role)) {
        throw new Error('Message role must be system, user, or assistant');
      }
    }

    if (
      request.temperature !== undefined &&
      (request.temperature < 0 || request.temperature > 2)
    ) {
      throw new Error('Temperature must be between 0 and 2');
    }

    if (request.max_tokens !== undefined && request.max_tokens < 1) {
      throw new Error('Max tokens must be greater than 0');
    }
  }

  // 合并默认参数
  protected mergeDefaultParams(request: LLMChatRequest): LLMChatRequest {
    const defaultParams = this.config.defaultParams || {};
    return {
      ...defaultParams,
      ...request,
      model: request.model || this.config.model,
    };
  }

  // 记录请求日志
  protected logRequest(request: LLMChatRequest, context: string): void {
    this.logger.info(`LLM service request: ${context}`, {
      provider: this.config.provider,
      model: request.model || this.config.model,
      messageCount: request.messages.length,
      temperature: request.temperature,
      maxTokens: request.max_tokens,
      stream: request.stream,
    });
  }

  // 记录响应日志
  protected logResponse(response: LLMChatResponse, context: string): void {
    this.logger.info(`LLM service response: ${context}`, {
      provider: this.config.provider,
      model: response.model,
      usage: response.usage,
      choiceCount: response.choices.length,
    });
  }
}
