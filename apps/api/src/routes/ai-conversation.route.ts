/**
 * AI对话API路由
 * 提供完整的对话功能接口
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getAIIntegrationService } from '../services/ai-integration.service.js';
import { getSessionManager } from '../services/session.service.js';
import { getDialogueManager } from '../services/dialogue.service.js';
import { getAICoreService } from '../services/ai-core.service.js';
import { prisma } from '../prisma-client.js';

export async function aiConversationRoutes(fastify: FastifyInstance) {
    const aiIntegrationService = getAIIntegrationService(prisma);
    const sessionManager = getSessionManager(prisma);
    const dialogueManager = getDialogueManager(sessionManager);
    const aiCoreService = getAICoreService(prisma);

    // 处理对话请求
    fastify.post('/conversation', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const body = request.body as any;

            // 如果没有提供sessionId，创建新会话
            let sessionId = body.sessionId;
            if (!sessionId) {
                const session = await sessionManager.createSession(body.userId, body.options);
                sessionId = session.id;
            }

            const conversationRequest = {
                sessionId,
                userId: body.userId,
                message: body.message,
                options: body.options
            };

            const result = await aiIntegrationService.processConversation(conversationRequest);

            return {
                success: true,
                data: result,
                message: '对话处理成功'
            };
        } catch (error: any) {
            fastify.log.error('Conversation error:', error);
            return reply.status(500).send({
                success: false,
                error: error.message || '对话处理失败',
                message: '服务器内部错误'
            });
        }
    });

    // 创建新会话
    fastify.post('/session', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const body = request.body as any;
            const session = await sessionManager.createSession(body.userId, body.options);

            return {
                success: true,
                data: {
                    sessionId: session.id,
                    userId: session.userId,
                    status: session.status,
                    createdAt: session.metadata.createdAt
                },
                message: '会话创建成功'
            };
        } catch (error: any) {
            fastify.log.error('Session creation error:', error);
            return reply.status(500).send({
                success: false,
                error: error.message || '会话创建失败',
                message: '服务器内部错误'
            });
        }
    });

    // 获取会话信息
    fastify.get('/session/:sessionId', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { sessionId } = request.params as { sessionId: string };
            const session = sessionManager.getSession(sessionId);

            if (!session) {
                return reply.status(404).send({
                    success: false,
                    error: '会话不存在',
                    message: '未找到指定的会话'
                });
            }

            return {
                success: true,
                data: {
                    id: session.id,
                    userId: session.userId,
                    status: session.status,
                    context: session.context,
                    metadata: session.metadata,
                    messageCount: session.conversationHistory.length
                },
                message: '会话信息获取成功'
            };
        } catch (error: any) {
            fastify.log.error('Session retrieval error:', error);
            return reply.status(500).send({
                success: false,
                error: error.message || '会话获取失败',
                message: '服务器内部错误'
            });
        }
    });

    // 获取用户的所有会话
    fastify.get('/sessions/:userId', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { userId } = request.params as { userId: string };
            const sessions = sessionManager.getUserSessions(userId);

            return {
                success: true,
                data: sessions.map(session => ({
                    id: session.id,
                    status: session.status,
                    messageCount: session.conversationHistory.length,
                    lastActivity: session.metadata.lastActivity,
                    createdAt: session.metadata.createdAt
                })),
                message: '用户会话列表获取成功'
            };
        } catch (error: any) {
            fastify.log.error('User sessions retrieval error:', error);
            return reply.status(500).send({
                success: false,
                error: error.message || '会话列表获取失败',
                message: '服务器内部错误'
            });
        }
    });

    // 终止会话
    fastify.delete('/session/:sessionId', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { sessionId } = request.params as { sessionId: string };
            const success = await sessionManager.terminateSession(sessionId, 'manual');

            if (!success) {
                return reply.status(404).send({
                    success: false,
                    error: '会话不存在',
                    message: '未找到指定的会话'
                });
            }

            return {
                success: true,
                message: '会话终止成功'
            };
        } catch (error: any) {
            fastify.log.error('Session termination error:', error);
            return reply.status(500).send({
                success: false,
                error: error.message || '会话终止失败',
                message: '服务器内部错误'
            });
        }
    });

    // 意图识别
    fastify.post('/intent', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const body = request.body as any;
            const result = await aiCoreService.recognizeIntent(
                body.text,
                body.context,
                body.sessionId
            );

            return {
                success: true,
                data: result,
                message: '意图识别成功'
            };
        } catch (error: any) {
            fastify.log.error('Intent recognition error:', error);
            return reply.status(500).send({
                success: false,
                error: error.message || '意图识别失败',
                message: '服务器内部错误'
            });
        }
    });

    // 知识库搜索
    fastify.post('/knowledge/search', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const body = request.body as any;
            const result = await aiCoreService.searchKnowledgeBase(body.query, {
                category: body.category,
                limit: body.limit,
                minRelevance: body.minRelevance
            });

            return {
                success: true,
                data: result,
                message: '知识库搜索成功'
            };
        } catch (error: any) {
            fastify.log.error('Knowledge search error:', error);
            return reply.status(500).send({
                success: false,
                error: error.message || '知识库搜索失败',
                message: '服务器内部错误'
            });
        }
    });

    // 系统健康检查
    fastify.get('/health', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const health = await aiIntegrationService.getSystemHealth();
            const statusCode = health.status === 'healthy' ? 200 :
                health.status === 'degraded' ? 200 : 503;

            return reply.status(statusCode).send({
                success: health.status !== 'unhealthy',
                data: health,
                message: `系统状态: ${health.status}`
            });
        } catch (error: any) {
            fastify.log.error('Health check error:', error);
            return reply.status(503).send({
                success: false,
                error: error.message || '健康检查失败',
                message: '系统不可用'
            });
        }
    });

    // 性能统计
    fastify.get('/stats', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const performanceStats = aiIntegrationService.getPerformanceStats();
            const sessionStats = sessionManager.getSessionStats();
            const dialogueStats = dialogueManager.getDialogueStats();

            return {
                success: true,
                data: {
                    performance: performanceStats,
                    sessions: sessionStats,
                    dialogues: dialogueStats
                },
                message: '统计信息获取成功'
            };
        } catch (error: any) {
            fastify.log.error('Stats retrieval error:', error);
            return reply.status(500).send({
                success: false,
                error: error.message || '统计信息获取失败',
                message: '服务器内部错误'
            });
        }
    });

    // 流式对话接口（暂时禁用WebSocket）
    // fastify.get('/conversation/stream/:sessionId', { websocket: true }, (connection, req) => {
    //     // WebSocket实现暂时禁用
    // });
}
