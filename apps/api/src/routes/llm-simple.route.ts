/**
 * 简化版大模型服务路由
 * 避免复杂的类型问题，专注于核心功能
 */

import { FastifyInstance } from 'fastify';
import { LLMServiceManager } from '../services/llm/llm.service.manager.js';

export async function llmSimpleRoutes(fastify: FastifyInstance) {
  const llmManager = new LLMServiceManager(fastify);

  // 初始化默认服务
  await llmManager.initializeDefaultService();

  // 聊天接口
  fastify.post('/chat', async (request, reply) => {
    try {
      const response = await llmManager.chat(request.body as any);

      return {
        success: true,
        data: response,
        message: 'Chat completed successfully',
      };
    } catch (error: any) {
      fastify.log.error('Chat request failed');

      return reply.code(500).send({
        success: false,
        error: error.message || 'Internal server error',
        message: 'Chat request failed',
      });
    }
  });

  // 流式聊天接口
  fastify.post('/chat/stream', async (request, reply) => {
    try {
      // 设置SSE响应头
      reply.raw.setHeader('Content-Type', 'text/event-stream');
      reply.raw.setHeader('Cache-Control', 'no-cache');
      reply.raw.setHeader('Connection', 'keep-alive');
      reply.raw.setHeader('Access-Control-Allow-Origin', '*');
      reply.raw.setHeader('Access-Control-Allow-Headers', 'Cache-Control');

      // 使用真实的LLM服务进行流式聊天
      const stream = llmManager.chatStream(request.body as any);

      for await (const chunk of stream) {
        reply.raw.write(`data: ${JSON.stringify(chunk)}\n\n`);
      }

      reply.raw.write('data: [DONE]\n\n');
      reply.raw.end();
    } catch (error: any) {
      fastify.log.error('Stream chat request failed', error);

      reply.raw.write(
        `data: ${JSON.stringify({
          error: {
            message: error.message || 'Internal server error',
            type: 'stream_error',
          },
        })}\n\n`
      );
      reply.raw.end();
    }
  });

  // 获取模型列表
  fastify.get('/models', async (_request, reply) => {
    try {
      const models = await llmManager.listModels();

      return {
        success: true,
        data: models,
        message: 'Models retrieved successfully',
      };
    } catch (error: any) {
      fastify.log.error('Failed to get models');

      return reply.code(500).send({
        success: false,
        error: error.message || 'Internal server error',
        message: 'Failed to get models',
      });
    }
  });

  // 健康检查
  fastify.get('/health', async (_request, reply) => {
    try {
      const status = await llmManager.healthCheck();

      return {
        success: true,
        data: status,
        message: 'Health check completed',
      };
    } catch (error: any) {
      fastify.log.error('Health check failed');

      return reply.code(500).send({
        success: false,
        error: error.message || 'Internal server error',
        message: 'Health check failed',
      });
    }
  });

  // 获取支持的提供商
  fastify.get('/providers', async (_request, reply) => {
    try {
      const providers = llmManager.getSupportedProviders();

      return {
        success: true,
        data: providers,
        message: 'Supported providers retrieved successfully',
      };
    } catch (error: any) {
      fastify.log.error('Failed to get providers');

      return reply.code(500).send({
        success: false,
        error: error.message || 'Internal server error',
        message: 'Failed to get supported providers',
      });
    }
  });
}
