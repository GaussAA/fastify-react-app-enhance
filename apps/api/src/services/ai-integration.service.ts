/**
 * AI集成服务
 * 整合所有AI功能模块，提供统一的对话接口
 */

import { EventEmitter } from 'events';
import { PrismaClient } from '@prisma/client';
import { SessionManager, getSessionManager } from './session.service.js';
import { DialogueManager, getDialogueManager } from './dialogue.service.js';
import { AICoreService, getAICoreService } from './ai-core.service.js';
import { initializeLLMApi, getLLMApiClient } from '../lib/llm-api.js';

export interface ConversationRequest {
  sessionId: string;
  userId: string;
  message: string;
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
    context?: Record<string, any>;
  };
}

export interface ConversationResponse {
  sessionId: string;
  messageId: string;
  response: string;
  intent: string;
  confidence: number;
  entities: Record<string, any>;
  qualityScore: number;
  processingTime: number;
  metadata: {
    model: string;
    tokens: number;
    context: Record<string, any>;
  };
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: {
    sessionManager: boolean;
    dialogueManager: boolean;
    aiCoreService: boolean;
    llmApi: boolean;
    database: boolean;
  };
  metrics: {
    activeSessions: number;
    averageResponseTime: number;
    errorRate: number;
    memoryUsage: number;
  };
  timestamp: Date;
}

export class AIIntegrationService extends EventEmitter {
  private sessionManager!: SessionManager;
  private dialogueManager!: DialogueManager;
  private aiCoreService!: AICoreService;
  private llmApiClient: any;
  private prisma: PrismaClient;
  private isInitialized: boolean = false;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private performanceMetrics: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    responseTimes: number[];
  };

  constructor(prisma: PrismaClient, fastify?: any) {
    super();
    this.prisma = prisma;
    this.performanceMetrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      responseTimes: [],
    };

    this.initialize(fastify);
    this.startHealthMonitoring();
  }

  /**
   * 初始化服务
   */
  private async initialize(fastify?: any): Promise<void> {
    try {
      // 初始化各个服务
      this.sessionManager = getSessionManager(this.prisma, {
        maxIdleTime: 30 * 60 * 1000, // 30分钟
        maxSessionDuration: 2 * 60 * 60 * 1000, // 2小时
        maxMessageCount: 100,
        maxTokens: 100000,
        autoCleanup: true,
      });

      this.dialogueManager = getDialogueManager(this.sessionManager, {
        maxContextTurns: 10,
        stateTimeout: 5 * 60 * 1000, // 5分钟
        enableInterruption: true,
        enableRecovery: true,
      });

      this.aiCoreService = getAICoreService(this.prisma);

      // 初始化LLM API客户端
      if (fastify) {
        const llmServiceManager = initializeLLMApi(fastify);
        await llmServiceManager.initializeDefaultService();
        this.llmApiClient = getLLMApiClient();
      }

      // 设置事件监听
      this.setupEventListeners();

      this.isInitialized = true;
      console.log('AI Integration Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AI Integration Service:', error);
      throw error;
    }
  }

  /**
   * 处理对话请求
   */
  async processConversation(
    request: ConversationRequest
  ): Promise<ConversationResponse> {
    const startTime = Date.now();
    this.performanceMetrics.totalRequests++;

    try {
      if (!this.isInitialized) {
        throw new Error('Service not initialized');
      }

      // 获取或创建会话
      let session = this.sessionManager.getSession(request.sessionId);
      if (!session) {
        session = await this.sessionManager.createSession(request.userId, {
          model: request.options?.model,
          temperature: request.options?.temperature,
          context: request.options?.context,
        });
      }

      // 更新会话活动时间
      await this.sessionManager.updateSession(request.sessionId, {
        metadata: {
          ...session.metadata,
          lastActivity: new Date(),
        },
      });

      // 添加用户消息到会话
      await this.sessionManager.addMessage(request.sessionId, {
        role: 'user',
        content: request.message,
      });

      // 意图识别
      const intentResult = await this.aiCoreService.recognizeIntent(
        request.message,
        session.context,
        request.sessionId
      );

      // 多轮对话处理
      const dialogueResult = await this.dialogueManager.processUserInput(
        request.sessionId,
        request.message
      );

      // 知识库查询（如果需要）
      let knowledgeResults = null;
      if (intentResult.intent === 'question' || intentResult.confidence < 0.7) {
        knowledgeResults = await this.aiCoreService.searchKnowledgeBase(
          request.message,
          { limit: 3, minRelevance: 0.5 }
        );
      }

      // 生成AI响应
      const aiResponse = await this.generateAIResponse({
        userMessage: request.message,
        intent: intentResult,
        dialogueResult,
        knowledgeResults,
        session,
        options: request.options,
      });

      // 添加AI响应到会话
      await this.sessionManager.addMessage(request.sessionId, {
        role: 'assistant',
        content: aiResponse,
      });

      // 质量监控
      const qualityReport = await this.aiCoreService.monitorQuality(
        request.sessionId,
        `msg_${Date.now()}`,
        request.message,
        aiResponse,
        intentResult.alternatives.map(alternative => alternative.intent),
        [],
        { responseTime: Date.now() - startTime } as any // eslint-disable-line @typescript-eslint/no-explicit-any
      );

      const processingTime = Date.now() - startTime;
      this.updatePerformanceMetrics(processingTime, true);

      const response: ConversationResponse = {
        sessionId: request.sessionId,
        messageId: `msg_${Date.now()}`,
        response: aiResponse,
        intent: intentResult.intent,
        confidence: intentResult.confidence,
        entities: intentResult.entities,
        qualityScore: qualityReport.overallScore,
        processingTime,
        metadata: {
          model: session.metadata.model,
          tokens: 0, // 可以从LLM API响应中获取
          context: session.context,
        },
      };

      this.emit('conversationProcessed', response);
      return response;
    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.updatePerformanceMetrics(processingTime, false);

      console.error('Conversation processing error:', error);
      this.emit('conversationError', { request, error, processingTime });
      throw error;
    }
  }

  /**
   * 生成AI响应
   */
  private async generateAIResponse(params: {
    userMessage: string;
    intent: any;
    dialogueResult: any;
    knowledgeResults: any;
    session: any;
    options?: any;
  }): Promise<string> {
    const {
      userMessage,
      intent,
      dialogueResult,
      knowledgeResults,
      session,
      options,
    } = params;

    // 构建上下文
    // const _context = this.buildContext(session, intent, knowledgeResults);

    // 准备LLM请求
    const llmRequest = {
      messages: [
        ...session.conversationHistory.slice(-5), // 最近5条消息作为上下文
        {
          role: 'user',
          content: userMessage,
        },
      ],
      model: options?.model || session.metadata.model,
      temperature: options?.temperature || session.metadata.temperature,
      max_tokens: options?.maxTokens || 2000,
      stream: options?.stream || false,
    };

    try {
      // 调用LLM API
      const llmResponse = await this.llmApiClient.chat(llmRequest);

      if (llmResponse.choices && llmResponse.choices.length > 0) {
        let response = llmResponse.choices[0].message.content;

        // 根据意图和知识库结果优化响应
        response = this.optimizeResponse(
          response,
          intent,
          knowledgeResults,
          dialogueResult
        );

        return response;
      } else {
        return dialogueResult.response || '抱歉，我暂时无法回答您的问题。';
      }
    } catch (error) {
      console.error('LLM API error:', error);
      // 回退到对话管理器的响应
      return (
        dialogueResult.response || '抱歉，我遇到了一些技术问题，请稍后再试。'
      );
    }
  }

  /**
   * 构建上下文
   */
  private buildContext(
    session: any,
    intent: any,
    knowledgeResults: any
  ): Record<string, any> {
    const context: Record<string, any> = {
      sessionId: session.id,
      userId: session.userId,
      currentState: session.context.currentState || 'greeting',
      intent: intent.intent,
      confidence: intent.confidence,
      entities: intent.entities,
      messageCount: session.metadata.messageCount,
      model: session.metadata.model,
    };

    if (knowledgeResults && knowledgeResults.results.length > 0) {
      context.knowledgeBase = {
        hasResults: true,
        resultCount: knowledgeResults.results.length,
        topResult: knowledgeResults.results[0],
      };
    }

    return context;
  }

  /**
   * 优化响应
   */
  private optimizeResponse(
    response: string,
    intent: any,
    knowledgeResults: any,
    _dialogueResult: any
  ): string {
    let optimizedResponse = response;

    // 如果知识库有相关结果，可以增强响应
    if (knowledgeResults && knowledgeResults.results.length > 0) {
      const topResult = knowledgeResults.results[0];
      if (topResult.relevanceScore > 0.8) {
        // 高相关性结果，可以引用知识库内容
        optimizedResponse = this.enhanceWithKnowledge(
          optimizedResponse,
          topResult
        );
      }
    }

    // 根据意图调整响应风格
    optimizedResponse = this.adjustResponseStyle(
      optimizedResponse,
      intent?.intent
    );

    return optimizedResponse;
  }

  /**
   * 用知识库内容增强响应
   */
  private enhanceWithKnowledge(response: string, knowledgeEntry: any): string {
    // 简单的增强策略，可以根据需要扩展
    if (response.length < 100 && knowledgeEntry.content.length > 50) {
      return `${response}\n\n根据相关信息：${knowledgeEntry.content.substring(0, 200)}...`;
    }
    return response;
  }

  /**
   * 调整响应风格
   */
  private adjustResponseStyle(response: string, intent: string | undefined): string {
    if (!intent) {
      return response;
    }

    switch (intent) {
      case 'greeting':
        return response.replace(/^/, '😊 ');
      case 'farewell':
        return response.replace(/^/, '👋 ');
      case 'thanks':
        return response.replace(/^/, '😊 ');
      case 'complaint':
        return response.replace(/^/, '😔 ');
      default:
        return response;
    }
  }

  /**
   * 获取系统健康状态
   */
  async getSystemHealth(): Promise<SystemHealth> {
    const health: SystemHealth = {
      status: 'healthy',
      services: {
        sessionManager: false,
        dialogueManager: false,
        aiCoreService: false,
        llmApi: false,
        database: false,
      },
      metrics: {
        activeSessions: 0,
        averageResponseTime: 0,
        errorRate: 0,
        memoryUsage: 0,
      },
      timestamp: new Date(),
    };

    try {
      // 检查会话管理器
      if (this.sessionManager) {
        const stats = this.sessionManager.getSessionStats();
        health.services.sessionManager = true;
        health.metrics.activeSessions = stats.activeSessions;
      }

      // 检查对话管理器
      if (this.dialogueManager) {
        // const stats = this.dialogueManager.getDialogueStats();
        health.services.dialogueManager = true;
      }

      // 检查AI核心服务
      if (this.aiCoreService) {
        health.services.aiCoreService = true;
      }

      // 检查LLM API
      try {
        if (this.llmApiClient) {
          await this.llmApiClient.healthCheck();
          health.services.llmApi = true;
        } else {
          health.services.llmApi = false;
        }
      } catch {
        health.services.llmApi = false;
      }

      // 检查数据库
      try {
        await this.prisma.$queryRaw`SELECT 1`;
        health.services.database = true;
      } catch {
        health.services.database = false;
      }

      // 计算性能指标
      health.metrics.averageResponseTime =
        this.performanceMetrics.averageResponseTime;
      health.metrics.errorRate =
        this.performanceMetrics.totalRequests > 0
          ? this.performanceMetrics.failedRequests /
          this.performanceMetrics.totalRequests
          : 0;

      // 获取内存使用情况
      const memUsage = process.memoryUsage();
      health.metrics.memoryUsage = memUsage.heapUsed / memUsage.heapTotal;

      // 确定整体状态
      const serviceCount = Object.values(health.services).filter(
        Boolean
      ).length;
      const totalServices = Object.keys(health.services).length;

      if (serviceCount === totalServices) {
        health.status = 'healthy';
      } else if (serviceCount >= totalServices * 0.7) {
        health.status = 'degraded';
      } else {
        health.status = 'unhealthy';
      }
    } catch (error) {
      console.error('Health check error:', error);
      health.status = 'unhealthy';
    }

    return health;
  }

  /**
   * 设置事件监听
   */
  private setupEventListeners(): void {
    // 会话管理器事件
    this.sessionManager.on('sessionCreated', session => {
      this.emit('sessionCreated', session);
    });

    this.sessionManager.on('sessionExpired', session => {
      this.emit('sessionExpired', session);
    });

    // 对话管理器事件
    this.dialogueManager.on('dialogueStateUpdated', dialogue => {
      this.emit('dialogueStateUpdated', dialogue);
    });

    // AI核心服务事件
    this.aiCoreService.on('qualityReported', report => {
      this.emit('qualityReported', report);
    });
  }

  /**
   * 启动健康监控
   */
  private startHealthMonitoring(): void {
    this.healthCheckInterval = setInterval(async () => {
      try {
        const health = await this.getSystemHealth();
        this.emit('healthChecked', health);

        // 如果系统不健康，触发告警
        if (health.status === 'unhealthy') {
          this.emit('systemUnhealthy', health);
        }
      } catch (error) {
        console.error('Health monitoring error:', error);
      }
    }, 60000); // 每分钟检查一次
  }

  /**
   * 更新性能指标
   */
  private updatePerformanceMetrics(
    responseTime: number,
    success: boolean
  ): void {
    this.performanceMetrics.responseTimes.push(responseTime);

    // 保持最近1000个响应时间
    if (this.performanceMetrics.responseTimes.length > 1000) {
      this.performanceMetrics.responseTimes =
        this.performanceMetrics.responseTimes.slice(-1000);
    }

    // 计算平均响应时间
    this.performanceMetrics.averageResponseTime =
      this.performanceMetrics.responseTimes.reduce((a, b) => a + b, 0) /
      this.performanceMetrics.responseTimes.length;

    if (success) {
      this.performanceMetrics.successfulRequests++;
    } else {
      this.performanceMetrics.failedRequests++;
    }
  }

  /**
   * 获取性能统计
   */
  getPerformanceStats(): {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    successRate: number;
    averageResponseTime: number;
    errorRate: number;
  } {
    const total = this.performanceMetrics.totalRequests;
    const successful = this.performanceMetrics.successfulRequests;
    const failed = this.performanceMetrics.failedRequests;

    return {
      totalRequests: total,
      successfulRequests: successful,
      failedRequests: failed,
      successRate: total > 0 ? successful / total : 0,
      averageResponseTime: this.performanceMetrics.averageResponseTime,
      errorRate: total > 0 ? failed / total : 0,
    };
  }

  /**
   * 清理资源
   */
  async cleanup(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    if (this.sessionManager) {
      await this.sessionManager.cleanup();
    }

    console.log('AI Integration Service cleaned up');
  }
}

// 导出单例实例
let aiIntegrationServiceInstance: AIIntegrationService | null = null;

export function getAIIntegrationService(
  prisma?: PrismaClient,
  fastify?: any
): AIIntegrationService {
  if (!aiIntegrationServiceInstance && prisma) {
    aiIntegrationServiceInstance = new AIIntegrationService(prisma, fastify);
  }
  return aiIntegrationServiceInstance!;
}
