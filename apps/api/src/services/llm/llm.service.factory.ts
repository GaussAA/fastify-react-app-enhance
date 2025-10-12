/**
 * 大模型服务工厂
 * 负责创建和管理不同的大模型服务实例
 */

import { FastifyInstance } from 'fastify';
import {
    ILLMService,
    ILLMServiceFactory,
    LLMServiceConfig
} from '../../types/llm.js';
import { DeepSeekService } from './deepseek.service.js';

export class LLMServiceFactory implements ILLMServiceFactory {
    private fastify: FastifyInstance;
    private services: Map<string, ILLMService> = new Map();

    constructor(fastify: FastifyInstance) {
        this.fastify = fastify;
    }

    createService(config: LLMServiceConfig): ILLMService {
        const serviceKey = this.getServiceKey(config);

        // 如果服务已存在，返回现有实例
        if (this.services.has(serviceKey)) {
            return this.services.get(serviceKey)!;
        }

        let service: ILLMService;

        switch (config.provider) {
            case 'deepseek':
                service = new DeepSeekService(config, this.fastify);
                break;

            case 'openai':
                // TODO: 实现 OpenAI 服务
                throw new Error('OpenAI service not implemented yet');

            case 'anthropic':
                // TODO: 实现 Anthropic 服务
                throw new Error('Anthropic service not implemented yet');

            case 'custom':
                // TODO: 实现自定义服务
                throw new Error('Custom service not implemented yet');

            default:
                throw new Error(`Unsupported LLM provider: ${config.provider}`);
        }

        // 缓存服务实例
        this.services.set(serviceKey, service);

    this.fastify.log.info('LLM service created');

        return service;
    }

    getSupportedProviders(): string[] {
        return ['deepseek', 'openai', 'anthropic', 'custom'];
    }

    // 获取服务实例
    getService(config: LLMServiceConfig): ILLMService | undefined {
        const serviceKey = this.getServiceKey(config);
        return this.services.get(serviceKey);
    }

    // 移除服务实例
    removeService(config: LLMServiceConfig): boolean {
        const serviceKey = this.getServiceKey(config);
        return this.services.delete(serviceKey);
    }

    // 获取所有服务实例
    getAllServices(): ILLMService[] {
        return Array.from(this.services.values());
    }

    // 清理所有服务实例
    clearAllServices(): void {
        this.services.clear();
        this.fastify.log.info('All LLM services cleared');
    }

    // 生成服务唯一标识
    private getServiceKey(config: LLMServiceConfig): string {
        return `${config.provider}:${config.model}:${config.baseURL || 'default'}`;
    }

    // 健康检查所有服务
    async healthCheckAll(): Promise<Record<string, any>> {
        const results: Record<string, any> = {};

        for (const [key, service] of Array.from(this.services.entries())) {
            try {
                results[key] = await service.healthCheck();
            } catch (error: any) {
                results[key] = {
                    provider: service.getConfig().provider,
                    status: 'error',
                    lastCheck: new Date(),
                    error: error.message
                };
            }
        }

        return results;
    }

    // 获取服务统计信息
    getServiceStats(): {
        totalServices: number;
        providers: Record<string, number>;
        models: Record<string, number>;
    } {
        const stats = {
            totalServices: this.services.size,
            providers: {} as Record<string, number>,
            models: {} as Record<string, number>
        };

        for (const service of Array.from(this.services.values())) {
            const config = service.getConfig();

            // 统计提供商
            stats.providers[config.provider] = (stats.providers[config.provider] || 0) + 1;

            // 统计模型
            stats.models[config.model] = (stats.models[config.model] || 0) + 1;
        }

        return stats;
    }
}
