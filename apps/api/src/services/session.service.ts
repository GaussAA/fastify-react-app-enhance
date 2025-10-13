/**
 * 会话管理服务
 * 提供用户对话状态的实时跟踪与维护
 */

import { PrismaClient } from '@prisma/client';
import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

export interface SessionState {
  id: string;
  userId: string;
  status: 'active' | 'idle' | 'expired' | 'terminated';
  context: Record<string, any>;
  metadata: {
    createdAt: Date;
    lastActivity: Date;
    messageCount: number;
    totalTokens: number;
    model: string;
    temperature: number;
  };
  conversationHistory: ConversationMessage[];
  timeoutId?: NodeJS.Timeout;
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface SessionConfig {
  maxIdleTime: number; // 最大空闲时间（毫秒）
  maxSessionDuration: number; // 最大会话持续时间（毫秒）
  maxMessageCount: number; // 最大消息数量
  maxTokens: number; // 最大token数量
  autoCleanup: boolean; // 是否自动清理过期会话
}

export class SessionManager extends EventEmitter {
  private sessions: Map<string, SessionState> = new Map();
  private userSessions: Map<string, string[]> = new Map(); // userId -> sessionIds
  private prisma: PrismaClient;
  private config: SessionConfig;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(prisma: PrismaClient, config: Partial<SessionConfig> = {}) {
    super();
    this.prisma = prisma;
    this.config = {
      maxIdleTime: 30 * 60 * 1000, // 30分钟
      maxSessionDuration: 2 * 60 * 60 * 1000, // 2小时
      maxMessageCount: 100,
      maxTokens: 100000,
      autoCleanup: true,
      ...config,
    };

    // 启动自动清理
    if (this.config.autoCleanup) {
      this.startAutoCleanup();
    }

    // 监听进程退出事件
    process.on('SIGINT', () => this.cleanup());
    process.on('SIGTERM', () => this.cleanup());
  }

  /**
   * 创建新会话
   */
  async createSession(
    userId: string,
    options: {
      model?: string;
      temperature?: number;
      context?: Record<string, any>;
    } = {}
  ): Promise<SessionState> {
    const sessionId = uuidv4();
    const now = new Date();

    const session: SessionState = {
      id: sessionId,
      userId,
      status: 'active',
      context: options.context || {},
      metadata: {
        createdAt: now,
        lastActivity: now,
        messageCount: 0,
        totalTokens: 0,
        model: options.model || 'deepseek-chat',
        temperature: options.temperature || 0.7,
      },
      conversationHistory: [],
    };

    // 设置会话超时
    this.setSessionTimeout(session);

    // 存储会话
    this.sessions.set(sessionId, session);

    // 更新用户会话列表
    const userSessionIds = this.userSessions.get(userId) || [];
    userSessionIds.push(sessionId);
    this.userSessions.set(userId, userSessionIds);

    // 持久化到数据库
    await this.persistSession(session);

    this.emit('sessionCreated', session);
    return session;
  }

  /**
   * 获取会话
   */
  getSession(sessionId: string): SessionState | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * 获取用户的所有会话
   */
  getUserSessions(userId: string): SessionState[] {
    const sessionIds = this.userSessions.get(userId) || [];
    return sessionIds
      .map(id => this.sessions.get(id))
      .filter(session => session !== undefined) as SessionState[];
  }

  /**
   * 更新会话状态
   */
  async updateSession(
    sessionId: string,
    updates: Partial<SessionState>
  ): Promise<SessionState | null> {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    // 更新会话
    Object.assign(session, updates);
    session.metadata.lastActivity = new Date();

    // 重新设置超时
    this.setSessionTimeout(session);

    // 持久化更新
    await this.persistSession(session);

    this.emit('sessionUpdated', session);
    return session;
  }

  /**
   * 添加消息到会话
   */
  async addMessage(
    sessionId: string,
    message: Omit<ConversationMessage, 'id' | 'timestamp'>
  ): Promise<SessionState | null> {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const newMessage: ConversationMessage = {
      id: uuidv4(),
      timestamp: new Date(),
      ...message,
    };

    session.conversationHistory.push(newMessage);
    session.metadata.messageCount++;
    session.metadata.lastActivity = new Date();

    // 检查是否超过限制
    if (session.metadata.messageCount > this.config.maxMessageCount) {
      await this.terminateSession(sessionId, 'message_limit_exceeded');
      return null;
    }

    // 重新设置超时
    this.setSessionTimeout(session);

    // 持久化更新
    await this.persistSession(session);

    this.emit('messageAdded', { session, message: newMessage });
    return session;
  }

  /**
   * 更新会话上下文
   */
  async updateContext(
    sessionId: string,
    context: Record<string, any>
  ): Promise<SessionState | null> {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    session.context = { ...session.context, ...context };
    session.metadata.lastActivity = new Date();

    // 重新设置超时
    this.setSessionTimeout(session);

    // 持久化更新
    await this.persistSession(session);

    this.emit('contextUpdated', session);
    return session;
  }

  /**
   * 终止会话
   */
  async terminateSession(
    sessionId: string,
    reason: string = 'manual'
  ): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    // 清除超时
    if (session.timeoutId) {
      clearTimeout(session.timeoutId);
    }

    // 更新状态
    session.status = 'terminated';
    session.metadata.lastActivity = new Date();

    // 持久化更新
    await this.persistSession(session);

    // 从内存中移除
    this.sessions.delete(sessionId);

    // 从用户会话列表中移除
    const userSessionIds = this.userSessions.get(session.userId) || [];
    const index = userSessionIds.indexOf(sessionId);
    if (index > -1) {
      userSessionIds.splice(index, 1);
      this.userSessions.set(session.userId, userSessionIds);
    }

    this.emit('sessionTerminated', { session, reason });
    return true;
  }

  /**
   * 设置会话超时
   */
  private setSessionTimeout(session: SessionState): void {
    // 清除现有超时
    if (session.timeoutId) {
      clearTimeout(session.timeoutId);
    }

    // 设置新超时
    session.timeoutId = setTimeout(async () => {
      await this.handleSessionTimeout(session.id);
    }, this.config.maxIdleTime);
  }

  /**
   * 处理会话超时
   */
  private async handleSessionTimeout(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    // 检查会话是否真的超时
    const now = new Date();
    const idleTime = now.getTime() - session.metadata.lastActivity.getTime();
    const totalTime = now.getTime() - session.metadata.createdAt.getTime();

    if (
      idleTime >= this.config.maxIdleTime ||
      totalTime >= this.config.maxSessionDuration
    ) {
      session.status = 'expired';
      await this.persistSession(session);
      this.sessions.delete(sessionId);

      this.emit('sessionExpired', session);
    }
  }

  /**
   * 持久化会话到数据库
   */
  private async persistSession(session: SessionState): Promise<void> {
    try {
      await this.prisma.chatSession.upsert({
        where: { id: session.id },
        update: {
          status: session.status,
          context: session.context,
          metadata: session.metadata,
          conversationHistory: session.conversationHistory as any,
          lastActivity: session.metadata.lastActivity,
        },
        create: {
          id: session.id,
          userId: session.userId as any,
          status: session.status,
          context: session.context,
          metadata: session.metadata,
          conversationHistory: session.conversationHistory as any,
          createdAt: session.metadata.createdAt,
          lastActivity: session.metadata.lastActivity,
        },
      });
    } catch (error) {
      console.error('Failed to persist session:', error);
      this.emit('persistError', { session, error });
    }
  }

  /**
   * 从数据库恢复会话
   */
  async restoreSession(sessionId: string): Promise<SessionState | null> {
    try {
      const dbSession = await this.prisma.chatSession.findUnique({
        where: { id: sessionId },
      });

      if (!dbSession) return null;

      const session: SessionState = {
        id: dbSession.id,
        userId: dbSession.userId as any,
        status: dbSession.status as any,
        context: dbSession.context as Record<string, any>,
        metadata: dbSession.metadata as any,
        conversationHistory: dbSession.conversationHistory as any,
      };

      // 检查会话是否仍然有效
      const now = new Date();
      const idleTime = now.getTime() - session.metadata.lastActivity.getTime();
      const totalTime = now.getTime() - session.metadata.createdAt.getTime();

      if (
        idleTime >= this.config.maxIdleTime ||
        totalTime >= this.config.maxSessionDuration
      ) {
        session.status = 'expired';
        await this.persistSession(session);
        return null;
      }

      // 恢复会话到内存
      this.sessions.set(sessionId, session);

      // 更新用户会话列表
      const userSessionIds = this.userSessions.get(session.userId) || [];
      if (!userSessionIds.includes(sessionId)) {
        userSessionIds.push(sessionId);
        this.userSessions.set(session.userId, userSessionIds);
      }

      // 设置超时
      this.setSessionTimeout(session);

      this.emit('sessionRestored', session);
      return session;
    } catch (error) {
      console.error('Failed to restore session:', error);
      return null;
    }
  }

  /**
   * 启动自动清理
   */
  private startAutoCleanup(): void {
    this.cleanupInterval = setInterval(
      async () => {
        await this.cleanupExpiredSessions();
      },
      5 * 60 * 1000
    ); // 每5分钟清理一次
  }

  /**
   * 清理过期会话
   */
  private async cleanupExpiredSessions(): Promise<void> {
    const now = new Date();
    const expiredSessions: SessionState[] = [];

    for (const session of this.sessions.values()) {
      const idleTime = now.getTime() - session.metadata.lastActivity.getTime();
      const totalTime = now.getTime() - session.metadata.createdAt.getTime();

      if (
        idleTime >= this.config.maxIdleTime ||
        totalTime >= this.config.maxSessionDuration
      ) {
        expiredSessions.push(session);
      }
    }

    for (const session of expiredSessions) {
      await this.terminateSession(session.id, 'auto_cleanup');
    }

    if (expiredSessions.length > 0) {
      this.emit('sessionsCleaned', { count: expiredSessions.length });
    }
  }

  /**
   * 获取会话统计信息
   */
  getSessionStats(): {
    totalSessions: number;
    activeSessions: number;
    idleSessions: number;
    expiredSessions: number;
    totalUsers: number;
  } {
    const stats = {
      totalSessions: this.sessions.size,
      activeSessions: 0,
      idleSessions: 0,
      expiredSessions: 0,
      totalUsers: this.userSessions.size,
    };

    for (const session of this.sessions.values()) {
      switch (session.status) {
        case 'active':
          stats.activeSessions++;
          break;
        case 'idle':
          stats.idleSessions++;
          break;
        case 'expired':
          stats.expiredSessions++;
          break;
      }
    }

    return stats;
  }

  /**
   * 清理资源
   */
  async cleanup(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    // 清理所有会话超时
    for (const session of this.sessions.values()) {
      if (session.timeoutId) {
        clearTimeout(session.timeoutId);
      }
    }

    // 持久化所有会话
    for (const session of this.sessions.values()) {
      await this.persistSession(session);
    }

    this.sessions.clear();
    this.userSessions.clear();
  }
}

// 导出单例实例
let sessionManagerInstance: SessionManager | null = null;

export function getSessionManager(
  prisma?: PrismaClient,
  config?: Partial<SessionConfig>
): SessionManager {
  if (!sessionManagerInstance && prisma) {
    sessionManagerInstance = new SessionManager(prisma, config);
  }
  return sessionManagerInstance!;
}
