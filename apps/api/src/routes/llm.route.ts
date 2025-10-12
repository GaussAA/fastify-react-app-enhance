/**
 * 大模型服务路由
 * 提供统一的API接口
 */

import { FastifyInstance, FastifyRequest } from 'fastify';
import { 
  LLMChatRequest, 
  LLMServiceConfig 
} from '../types/llm.js';
import { LLMServiceManager } from '../services/llm/llm.service.manager.js';

// 请求类型定义
interface ChatRequest extends FastifyRequest {
    Body: LLMChatRequest;
}

interface StreamChatRequest extends FastifyRequest {
    Body: LLMChatRequest;
}

interface ModelRequest extends FastifyRequest {
    Params: {
        modelId: string;
    };
}

interface ServiceConfigRequest extends FastifyRequest {
    Body: LLMServiceConfig;
}

export async function llmRoutes(fastify: FastifyInstance) {
    const llmManager = new LLMServiceManager(fastify);

    // 初始化默认服务
    await llmManager.initializeDefaultService();

    // 聊天接口
    fastify.post<ChatRequest>('/chat', {
        schema: {
            description: 'Chat with the LLM service',
            tags: ['LLM'],
            body: {
                type: 'object',
                required: ['messages'],
                properties: {
                    messages: {
                        type: 'array',
                        items: {
                            type: 'object',
                            required: ['role', 'content'],
                            properties: {
                                role: { type: 'string', enum: ['system', 'user', 'assistant'] },
                                content: { type: 'string' },
                                name: { type: 'string' }
                            }
                        }
                    },
                    model: { type: 'string' },
                    temperature: { type: 'number', minimum: 0, maximum: 2 },
                    max_tokens: { type: 'number', minimum: 1 },
                    top_p: { type: 'number', minimum: 0, maximum: 1 },
                    frequency_penalty: { type: 'number', minimum: -2, maximum: 2 },
                    presence_penalty: { type: 'number', minimum: -2, maximum: 2 },
                    user: { type: 'string' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: { type: 'object' },
                        message: { type: 'string' }
                    }
                }
            }
        }
    }, async (_request, reply) => {
        try {
            const response = await llmManager.chat(_request.body);

            return {
                success: true,
                data: response,
                message: 'Chat completed successfully'
            };
        } catch (error: any) {
            fastify.log.error('Chat request failed', error);

            return reply.code(500).send({
                success: false,
                error: error.message || 'Internal server error',
                message: 'Chat request failed'
            });
        }
    });

    // 流式聊天接口
    fastify.post<StreamChatRequest>('/chat/stream', {
        schema: {
            description: 'Stream chat with the LLM service',
            tags: ['LLM'],
            body: {
                type: 'object',
                required: ['messages'],
                properties: {
                    messages: {
                        type: 'array',
                        items: {
                            type: 'object',
                            required: ['role', 'content'],
                            properties: {
                                role: { type: 'string', enum: ['system', 'user', 'assistant'] },
                                content: { type: 'string' },
                                name: { type: 'string' }
                            }
                        }
                    },
                    model: { type: 'string' },
                    temperature: { type: 'number', minimum: 0, maximum: 2 },
                    max_tokens: { type: 'number', minimum: 1 },
                    top_p: { type: 'number', minimum: 0, maximum: 1 },
                    frequency_penalty: { type: 'number', minimum: -2, maximum: 2 },
                    presence_penalty: { type: 'number', minimum: -2, maximum: 2 },
                    user: { type: 'string' }
                }
            }
        }
    }, async (_request, reply) => {
        try {
            // 设置SSE响应头
            reply.raw.setHeader('Content-Type', 'text/event-stream');
            reply.raw.setHeader('Cache-Control', 'no-cache');
            reply.raw.setHeader('Connection', 'keep-alive');
            reply.raw.setHeader('Access-Control-Allow-Origin', '*');
            reply.raw.setHeader('Access-Control-Allow-Headers', 'Cache-Control');

            const stream = llmManager.chatStream(_request.body);

            for await (const chunk of stream) {
                reply.raw.write(`data: ${JSON.stringify(chunk)}\n\n`);
            }

            reply.raw.write('data: [DONE]\n\n');
            reply.raw.end();
        } catch (error: any) {
            fastify.log.error('Stream chat request failed', error);

            reply.raw.write(`data: ${JSON.stringify({
                error: {
                    message: error.message || 'Internal server error',
                    type: 'stream_error'
                }
            })}\n\n`);
            reply.raw.end();
        }
    });

    // 获取模型列表
    fastify.get('/models', {
        schema: {
            description: 'Get list of available models',
            tags: ['LLM'],
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    id: { type: 'string' },
                                    object: { type: 'string' },
                                    created: { type: 'number' },
                                    owned_by: { type: 'string' },
                                    permission: { type: 'array' },
                                    root: { type: 'string' },
                                    parent: { type: 'string' }
                                }
                            }
                        },
                        message: { type: 'string' }
                    }
                }
            }
        }
    }, async (_request, reply) => {
        try {
            const models = await llmManager.listModels();

            return {
                success: true,
                data: models,
                message: 'Models retrieved successfully'
            };
        } catch (error: any) {
            fastify.log.error('Failed to get models', error);

            return reply.code(500).send({
                success: false,
                error: error.message || 'Internal server error',
                message: 'Failed to get models'
            });
        }
    });

    // 获取特定模型信息
    fastify.get<ModelRequest>('/models/:modelId', {
        schema: {
            description: 'Get specific model information',
            tags: ['LLM'],
            params: {
                type: 'object',
                required: ['modelId'],
                properties: {
                    modelId: { type: 'string' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: { type: 'object' },
                        message: { type: 'string' }
                    }
                }
            }
        }
    }, async (_request, reply) => {
        try {
            const model = await llmManager.getModel(_request.params.modelId);

            return {
                success: true,
                data: model,
                message: 'Model information retrieved successfully'
            };
        } catch (error: any) {
            fastify.log.error('Failed to get model', error);

            return reply.code(500).send({
                success: false,
                error: error.message || 'Internal server error',
                message: 'Failed to get model information'
            });
        }
    });

    // 健康检查
    fastify.get('/health', {
        schema: {
            description: 'Check LLM service health',
            tags: ['LLM'],
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: { type: 'object' },
                        message: { type: 'string' }
                    }
                }
            }
        }
    }, async (_request, reply) => {
        try {
            const status = await llmManager.healthCheck();

            return {
                success: true,
                data: status,
                message: 'Health check completed'
            };
        } catch (error: any) {
            fastify.log.error('Health check failed', error);

            return reply.code(500).send({
                success: false,
                error: error.message || 'Internal server error',
                message: 'Health check failed'
            });
        }
    });

    // 健康检查所有服务
    fastify.get('/health/all', {
        schema: {
            description: 'Check health of all LLM services',
            tags: ['LLM'],
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: { type: 'object' },
                        message: { type: 'string' }
                    }
                }
            }
        }
    }, async (_request, reply) => {
        try {
            const statuses = await llmManager.healthCheckAll();

            return {
                success: true,
                data: statuses,
                message: 'All services health check completed'
            };
        } catch (error: any) {
            fastify.log.error('All services health check failed', error);

            return reply.code(500).send({
                success: false,
                error: error.message || 'Internal server error',
                message: 'All services health check failed'
            });
        }
    });

    // 获取服务统计
    fastify.get('/stats', {
        schema: {
            description: 'Get LLM service statistics',
            tags: ['LLM'],
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: { type: 'object' },
                        message: { type: 'string' }
                    }
                }
            }
        }
    }, async (_request, reply) => {
        try {
            const stats = llmManager.getServiceStats();

            return {
                success: true,
                data: stats,
                message: 'Service statistics retrieved successfully'
            };
        } catch (error: any) {
            fastify.log.error('Failed to get service stats', error);

            return reply.code(500).send({
                success: false,
                error: error.message || 'Internal server error',
                message: 'Failed to get service statistics'
            });
        }
    });

    // 获取支持的提供商
    fastify.get('/providers', {
        schema: {
            description: 'Get supported LLM providers',
            tags: ['LLM'],
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: {
                            type: 'array',
                            items: { type: 'string' }
                        },
                        message: { type: 'string' }
                    }
                }
            }
        }
    }, async (_request, reply) => {
        try {
            const providers = llmManager.getSupportedProviders();

            return {
                success: true,
                data: providers,
                message: 'Supported providers retrieved successfully'
            };
        } catch (error: any) {
            fastify.log.error('Failed to get providers', error);

            return reply.code(500).send({
                success: false,
                error: error.message || 'Internal server error',
                message: 'Failed to get supported providers'
            });
        }
    });

    // 配置服务
    fastify.post<ServiceConfigRequest>('/config', {
        schema: {
            description: 'Configure LLM service',
            tags: ['LLM'],
            body: {
                type: 'object',
                required: ['provider', 'apiKey', 'model'],
                properties: {
                    provider: { type: 'string', enum: ['deepseek', 'openai', 'anthropic', 'custom'] },
                    apiKey: { type: 'string' },
                    baseURL: { type: 'string' },
                    model: { type: 'string' },
                    defaultParams: { type: 'object' },
                    timeout: { type: 'number' },
                    maxRetries: { type: 'number' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        message: { type: 'string' }
                    }
                }
            }
        }
    }, async (_request, reply) => {
        try {
            const validation = llmManager.validateConfig(_request.body);

            if (!validation.valid) {
                return reply.code(400).send({
                    success: false,
                    error: 'Invalid configuration',
                    details: validation.errors,
                    message: 'Configuration validation failed'
                });
            }

            llmManager.setDefaultService(_request.body);

            return {
                success: true,
                message: 'Service configured successfully'
            };
        } catch (error: any) {
            fastify.log.error('Failed to configure service', error);

            return reply.code(500).send({
                success: false,
                error: error.message || 'Internal server error',
                message: 'Failed to configure service'
            });
        }
    });
}
