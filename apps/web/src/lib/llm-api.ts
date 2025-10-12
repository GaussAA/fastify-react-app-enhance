/**
 * 大模型服务API客户端
 * 提供与后端LLM服务的交互功能
 */

import {
    LLMChatRequest,
    LLMChatResponse,
    LLMStreamResponse,
    LLMModel,
    LLMServiceStatus,
    LLMApiResponse,
    LLMChatConfig
} from '../types/llm';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

class LLMApiClient {
    private baseURL: string;

    constructor(baseURL: string = API_BASE_URL) {
        this.baseURL = baseURL;
    }

    // 获取认证头
    private getAuthHeaders(): Record<string, string> {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
        };
    }

    // 处理API响应
    private async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
        }

        const data: LLMApiResponse<T> = await response.json();

        if (!data.success) {
            throw new Error(data.error || data.message || 'API request failed');
        }

        return data.data as T;
    }

    // 聊天接口
    async chat(request: LLMChatRequest): Promise<LLMChatResponse> {
        const response = await fetch(`${this.baseURL}/api/llm/chat`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(request)
        });

        return this.handleResponse<LLMChatResponse>(response);
    }

    // 流式聊天接口
    async *chatStream(request: LLMChatRequest): AsyncIterable<LLMStreamResponse> {
        const response = await fetch(`${this.baseURL}/api/llm/chat/stream`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(request)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
        }

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
                            console.warn('Failed to parse stream data', { data, error });
                        }
                    }
                }
            }
        } finally {
            reader.releaseLock();
        }
    }

    // 获取模型列表
    async listModels(): Promise<LLMModel[]> {
        const response = await fetch(`${this.baseURL}/api/llm/models`, {
            method: 'GET',
            headers: this.getAuthHeaders()
        });

        return this.handleResponse<LLMModel[]>(response);
    }

    // 获取特定模型信息
    async getModel(modelId: string): Promise<LLMModel> {
        const response = await fetch(`${this.baseURL}/api/llm/models/${modelId}`, {
            method: 'GET',
            headers: this.getAuthHeaders()
        });

        return this.handleResponse<LLMModel>(response);
    }

    // 健康检查
    async healthCheck(): Promise<LLMServiceStatus> {
        const response = await fetch(`${this.baseURL}/api/llm/health`, {
            method: 'GET',
            headers: this.getAuthHeaders()
        });

        return this.handleResponse<LLMServiceStatus>(response);
    }

    // 健康检查所有服务
    async healthCheckAll(): Promise<Record<string, LLMServiceStatus>> {
        const response = await fetch(`${this.baseURL}/api/llm/health/all`, {
            method: 'GET',
            headers: this.getAuthHeaders()
        });

        return this.handleResponse<Record<string, LLMServiceStatus>>(response);
    }

    // 获取服务统计
    async getServiceStats(): Promise<{
        totalServices: number;
        providers: Record<string, number>;
        models: Record<string, number>;
    }> {
        const response = await fetch(`${this.baseURL}/api/llm/stats`, {
            method: 'GET',
            headers: this.getAuthHeaders()
        });

        return this.handleResponse(response);
    }

    // 获取支持的提供商
    async getSupportedProviders(): Promise<string[]> {
        const response = await fetch(`${this.baseURL}/api/llm/providers`, {
            method: 'GET',
            headers: this.getAuthHeaders()
        });

        return this.handleResponse<string[]>(response);
    }

    // 配置服务
    async configureService(config: {
        provider: string;
        apiKey: string;
        baseURL?: string;
        model: string;
        defaultParams?: Partial<LLMChatRequest>;
        timeout?: number;
        maxRetries?: number;
    }): Promise<void> {
        const response = await fetch(`${this.baseURL}/api/llm/config`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(config)
        });

        await this.handleResponse(response);
    }
}

// 创建默认实例
export const llmApiClient = new LLMApiClient();

// 导出类以便自定义实例
export { LLMApiClient };
