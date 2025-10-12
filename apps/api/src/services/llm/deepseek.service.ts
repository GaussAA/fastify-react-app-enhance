/**
 * DeepSeek 大模型服务实现
 * 实现与 DeepSeek API 的交互
 */

import { FastifyInstance } from 'fastify';
import { 
  LLMChatRequest, 
  LLMChatResponse, 
  LLMStreamResponse, 
  LLMModel, 
  LLMServiceConfig 
} from '../../types/llm.js';
import { BaseLLMService } from './base-llm.service.js';

export class DeepSeekService extends BaseLLMService {
    private readonly baseURL = 'https://api.deepseek.com/v1';
    private readonly defaultModel = 'deepseek-chat';

    constructor(config: LLMServiceConfig, fastify: FastifyInstance) {
        super(config, fastify);

        // 设置默认配置
        this.config = {
            ...config,
            baseURL: config.baseURL || this.baseURL,
            model: config.model || this.defaultModel,
            defaultParams: {
                temperature: 0.7,
                max_tokens: 2000,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0,
                ...config.defaultParams
            }
        };
    }

    async chat(request: LLMChatRequest): Promise<LLMChatResponse> {
        return this.withRetry(async () => {
            this.validateRequest(request);
            const mergedRequest = this.mergeDefaultParams(request);
            this.logRequest(mergedRequest, 'chat');

            const response = await this.makeRequest('/chat/completions', {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    model: mergedRequest.model,
                    messages: mergedRequest.messages,
                    temperature: mergedRequest.temperature,
                    max_tokens: mergedRequest.max_tokens,
                    top_p: mergedRequest.top_p,
                    frequency_penalty: mergedRequest.frequency_penalty,
                    presence_penalty: mergedRequest.presence_penalty,
                    user: mergedRequest.user
                })
            });

            const result: LLMChatResponse = await response.json();
            this.logResponse(result, 'chat');
            return result;
        }, 'chat');
    }

    async *chatStream(request: LLMChatRequest): AsyncIterable<LLMStreamResponse> {
        this.validateRequest(request);
        const mergedRequest = this.mergeDefaultParams(request);
        this.logRequest(mergedRequest, 'chatStream');

        const response = await this.makeRequest('/chat/completions', {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({
                model: mergedRequest.model,
                messages: mergedRequest.messages,
                temperature: mergedRequest.temperature,
                max_tokens: mergedRequest.max_tokens,
                top_p: mergedRequest.top_p,
                frequency_penalty: mergedRequest.frequency_penalty,
                presence_penalty: mergedRequest.presence_penalty,
                user: mergedRequest.user,
                stream: true
            })
        });

        if (!response.body) {
            throw new Error('Response body is null');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') {
                            return;
                        }

                        try {
                            const parsed: LLMStreamResponse = JSON.parse(data);
                            yield parsed;
                        } catch (error) {
                            this.logger.warn('Failed to parse stream data', { data, error });
                        }
                    }
                }
            }
        } finally {
            reader.releaseLock();
        }
    }

    async listModels(): Promise<LLMModel[]> {
        return this.withRetry(async () => {
            const response = await this.makeRequest('/models', {
                method: 'GET',
                headers: this.getHeaders()
            });

            const result = await response.json();
            return result.data || [];
        }, 'listModels');
    }

    async getModel(modelId: string): Promise<LLMModel> {
        return this.withRetry(async () => {
            const response = await this.makeRequest(`/models/${modelId}`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            return await response.json();
        }, 'getModel');
    }

    private getHeaders(): Record<string, string> {
        return {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
            'User-Agent': 'Fastify-LLM-Service/1.0.0'
        };
    }

    private async makeRequest(
        endpoint: string,
        options: RequestInit
    ): Promise<Response> {
        const url = `${this.config.baseURL}${endpoint}`;
        const timeout = this.config.timeout || 30000;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorText = await response.text();
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch {
                    errorData = { message: errorText };
                }

                const error = new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
                (error as any).status = response.status;
                (error as any).type = 'http_error';
                (error as any).code = `HTTP_${response.status}`;
                throw error;
            }

            return response;
        } catch (error: any) {
            clearTimeout(timeoutId);

            if (error.name === 'AbortError') {
                const timeoutError = new Error(`Request timeout after ${timeout}ms`);
                (timeoutError as any).type = 'timeout_error';
                (timeoutError as any).code = 'TIMEOUT';
                throw timeoutError;
            }

            throw error;
        }
    }
}
