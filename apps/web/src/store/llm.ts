/**
 * 大模型服务状态管理
 * 使用Zustand管理LLM相关的状态，支持持久化和后端集成
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  LLMChatSession,
  LLMMessage,
  LLMChatConfig,
  LLMModel,
  LLMServiceStatus,
  DEFAULT_CHAT_CONFIG,
} from '../types/llm';
import { llmApiClient } from '../lib/llm-api';
import { aiSessionApiClient } from '../lib/ai-session-api';

interface LLMState {
  // 状态
  sessions: LLMChatSession[];
  currentSession: LLMChatSession | null;
  models: LLMModel[];
  serviceStatus: LLMServiceStatus | null;
  isLoading: boolean;
  error: string | null;
  config: LLMChatConfig;
  currentUserId: string | null;
  backendSessionId: string | null;
  isInterrupted: boolean;

  // 会话管理
  createSession: (title?: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  setCurrentSession: (sessionId: string) => void;
  updateSessionTitle: (sessionId: string, title: string) => void;

  // 消息管理
  addMessage: (message: LLMMessage) => void;
  updateMessage: (messageId: string, content: string) => void;
  clearMessages: () => void;

  // 配置管理
  updateConfig: (config: Partial<LLMChatConfig>) => void;
  resetConfig: () => void;

  // API调用
  sendMessage: (message: string) => Promise<void>;
  sendStreamMessage: (
    message: string,
    onChunk: (chunk: string) => void
  ) => Promise<void>;

  // 数据获取
  loadModels: () => Promise<void>;
  checkServiceHealth: () => Promise<void>;

  // 会话持久化
  loadUserSessions: (userId: string) => Promise<void>;
  restoreSession: (sessionId: string) => Promise<void>;
  syncWithBackend: () => Promise<void>;

  // 工具方法
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  setCurrentUserId: (userId: string | null) => void;
  interruptGeneration: () => void;
}

export const useLLMStore = create<LLMState>()(
  persist(
    (set, get) => ({
      // 初始状态
      sessions: [],
      currentSession: null,
      models: [],
      serviceStatus: null,
      isLoading: false,
      error: null,
      config: { ...DEFAULT_CHAT_CONFIG },
      currentUserId: null,
      backendSessionId: null,
      isInterrupted: false,

      // 会话管理
      createSession: async (title?: string) => {
        const { currentUserId, config, setLoading, setError } = get();

        if (!currentUserId) {
          setError('用户未登录');
          return;
        }

        setLoading(true);
        setError(null);

        try {
          // 创建后端会话
          const backendSession = await aiSessionApiClient.createSession({
            userId: currentUserId,
            options: {
              model: config.model,
              temperature: config.temperature,
              context: {
                title: title || `新对话 ${new Date().toLocaleString()}`,
              },
            },
          });

          // 创建前端会话
          const session: LLMChatSession = {
            id: backendSession.sessionId,
            title: title || `新对话 ${new Date().toLocaleString()}`,
            messages: [],
            model: config.model,
            createdAt: new Date(backendSession.createdAt),
            updatedAt: new Date(backendSession.createdAt),
          };

          set(state => ({
            sessions: [session, ...state.sessions],
            currentSession: session,
            backendSessionId: backendSession.sessionId,
          }));
        } catch (error: any) {
          setError(error.message || '创建会话失败');
        } finally {
          setLoading(false);
        }
      },

      deleteSession: async (sessionId: string) => {
        const { setLoading, setError } = get();

        setLoading(true);
        setError(null);

        try {
          // 删除后端会话
          await aiSessionApiClient.terminateSession(sessionId);

          // 删除前端会话
          set(state => ({
            sessions: state.sessions.filter(s => s.id !== sessionId),
            currentSession:
              state.currentSession?.id === sessionId
                ? null
                : state.currentSession,
            backendSessionId:
              state.backendSessionId === sessionId
                ? null
                : state.backendSessionId,
          }));
        } catch (error: any) {
          setError(error.message || '删除会话失败');
        } finally {
          setLoading(false);
        }
      },

      setCurrentSession: (sessionId: string) => {
        const session = get().sessions.find(s => s.id === sessionId);
        if (session) {
          set({ currentSession: session });
        }
      },

      updateSessionTitle: (sessionId: string, title: string) => {
        set(state => ({
          sessions: state.sessions.map(s =>
            s.id === sessionId ? { ...s, title, updatedAt: new Date() } : s
          ),
          currentSession:
            state.currentSession?.id === sessionId
              ? { ...state.currentSession, title, updatedAt: new Date() }
              : state.currentSession,
        }));
      },

      // 消息管理
      addMessage: (message: LLMMessage) => {
        const { currentSession } = get();
        if (!currentSession) return;

        const updatedSession = {
          ...currentSession,
          messages: [...currentSession.messages, message],
          updatedAt: new Date(),
        };

        set(state => ({
          currentSession: updatedSession,
          sessions: state.sessions.map(s =>
            s.id === currentSession.id ? updatedSession : s
          ),
        }));
      },

      updateMessage: (messageId: string, content: string) => {
        const { currentSession } = get();
        if (!currentSession) return;

        const messageIndex = parseInt(messageId);
        if (
          messageIndex < 0 ||
          messageIndex >= currentSession.messages.length
        ) {
          console.warn('Invalid message index:', messageId);
          return;
        }

        const updatedSession = {
          ...currentSession,
          messages: currentSession.messages.map((m, index) =>
            index === messageIndex ? { ...m, content } : m
          ),
          updatedAt: new Date(),
        };

        set(state => ({
          currentSession: updatedSession,
          sessions: state.sessions.map(s =>
            s.id === currentSession.id ? updatedSession : s
          ),
        }));
      },

      clearMessages: () => {
        const { currentSession } = get();
        if (!currentSession) return;

        const updatedSession = {
          ...currentSession,
          messages: [],
          updatedAt: new Date(),
        };

        set(state => ({
          currentSession: updatedSession,
          sessions: state.sessions.map(s =>
            s.id === currentSession.id ? updatedSession : s
          ),
        }));
      },

      // 配置管理
      updateConfig: (newConfig: Partial<LLMChatConfig>) => {
        set(state => ({
          config: { ...state.config, ...newConfig },
        }));
      },

      resetConfig: () => {
        set({ config: { ...DEFAULT_CHAT_CONFIG } });
      },

      // API调用
      sendMessage: async (message: string) => {
        const {
          currentSession,
          addMessage,
          setLoading,
          setError,
          config,
          currentUserId,
          backendSessionId,
        } = get();

        if (!currentSession || !currentUserId) {
          setError('没有活跃的会话或用户未登录');
          return;
        }

        setLoading(true);
        setError(null);

        try {
          // 添加用户消息
          const userMessage: LLMMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: message,
            timestamp: new Date(),
          };
          addMessage(userMessage);

          // 发送到AI对话系统
          const response = await aiSessionApiClient.processConversation({
            sessionId: backendSessionId || undefined,
            userId: currentUserId,
            message: message,
            options: {
              model: config.model,
              temperature: config.temperature,
              context:
                currentSession.messages.length > 0
                  ? {
                      previousMessages: currentSession.messages.slice(-5), // 只保留最近5条消息作为上下文
                    }
                  : undefined,
            },
          });

          // 更新后端会话ID
          if (response.sessionId && response.sessionId !== backendSessionId) {
            set({ backendSessionId: response.sessionId });
          }

          // 添加AI回复
          const aiMessage: LLMMessage = {
            id: response.response.id,
            role: 'assistant',
            content: response.response.content,
            timestamp: new Date(response.response.timestamp),
          };
          addMessage(aiMessage);
        } catch (error: any) {
          setError(error.message || '发送消息失败');
        } finally {
          setLoading(false);
        }
      },

      sendStreamMessage: async (
        message: string,
        onChunk: (chunk: string) => void
      ) => {
        const { currentSession, config, addMessage, setLoading, setError } =
          get();

        if (!currentSession) {
          setError('没有活跃的对话会话');
          return;
        }

        setLoading(true);
        setError(null);
        set({ isInterrupted: false }); // 重置中断状态

        try {
          // 添加用户消息
          const userMessage: LLMMessage = {
            role: 'user',
            content: message,
          };
          addMessage(userMessage);

          // 准备请求
          const request = {
            messages: [...currentSession.messages, userMessage],
            model: config.model,
            temperature: config.temperature,
            max_tokens: config.max_tokens,
            top_p: config.top_p,
            frequency_penalty: config.frequency_penalty,
            presence_penalty: config.presence_penalty,
            stream: true,
          };

          // 创建助手消息占位符
          const assistantMessage: LLMMessage = {
            role: 'assistant',
            content: '',
          };
          addMessage(assistantMessage);

          // 获取助手消息的索引
          const assistantMessageIndex =
            get().currentSession!.messages.length - 1;

          // 流式处理响应
          let fullContent = '';
          for await (const chunk of llmApiClient.chatStream(request)) {
            // 检查是否被中断
            if (get().isInterrupted) {
              break;
            }

            if (chunk.choices && chunk.choices.length > 0) {
              const delta = chunk.choices[0].delta;
              if (delta?.content) {
                fullContent += delta.content;
                onChunk(delta.content);
              }
            }
          }

          // 流式处理完成后，更新最终消息内容
          get().updateMessage(assistantMessageIndex.toString(), fullContent);
        } catch (error: any) {
          setError(error.message || '发送流式消息失败');
        } finally {
          setLoading(false);
        }
      },

      // 数据获取
      loadModels: async () => {
        const { setLoading, setError } = get();

        setLoading(true);
        setError(null);

        try {
          const models = await llmApiClient.listModels();
          set({ models });
        } catch (error: any) {
          setError(error.message || '加载模型列表失败');
        } finally {
          setLoading(false);
        }
      },

      checkServiceHealth: async () => {
        const { setError } = get();

        try {
          const status = await llmApiClient.healthCheck();
          set({ serviceStatus: status });
        } catch (error: any) {
          setError(error.message || '健康检查失败');
          set({ serviceStatus: null });
        }
      },

      // 会话持久化
      loadUserSessions: async (userId: string) => {
        const { setLoading, setError } = get();

        setLoading(true);
        setError(null);

        try {
          const backendSessions =
            await aiSessionApiClient.getUserSessions(userId);

          // 将后端会话转换为前端会话格式
          const sessions: LLMChatSession[] = backendSessions.map(session => ({
            id: session.id,
            title: `会话 ${new Date(session.createdAt).toLocaleString()}`,
            messages: [], // 消息将在需要时单独加载
            model: 'gpt-3.5-turbo', // 默认模型，实际应该从后端获取
            createdAt: new Date(session.createdAt),
            updatedAt: new Date(session.lastActivity),
          }));

          set({
            sessions,
            currentUserId: userId,
          });
        } catch (error: any) {
          setError(error.message || '加载用户会话失败');
        } finally {
          setLoading(false);
        }
      },

      restoreSession: async (sessionId: string) => {
        const { setLoading, setError } = get();

        setLoading(true);
        setError(null);

        try {
          const sessionData = await aiSessionApiClient.getSession(sessionId);

          // 创建前端会话对象
          const session: LLMChatSession = {
            id: sessionData.id,
            title: `会话 ${new Date(sessionData.metadata.createdAt).toLocaleString()}`,
            messages: [], // 消息历史需要单独处理
            model: sessionData.metadata.model || 'gpt-3.5-turbo',
            createdAt: new Date(sessionData.metadata.createdAt),
            updatedAt: new Date(sessionData.metadata.lastActivity),
          };

          set({
            currentSession: session,
            backendSessionId: sessionId,
          });
        } catch (error: any) {
          setError(error.message || '恢复会话失败');
        } finally {
          setLoading(false);
        }
      },

      syncWithBackend: async () => {
        const { currentUserId, loadUserSessions } = get();

        if (currentUserId) {
          await loadUserSessions(currentUserId);
        }
      },

      // 工具方法
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      setCurrentUserId: (userId: string | null) => {
        set({ currentUserId: userId });
      },

      interruptGeneration: () => {
        set({ isInterrupted: true, isLoading: false });
      },
    }),
    {
      name: 'llm-store',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        sessions: state.sessions,
        currentSession: state.currentSession,
        config: state.config,
        currentUserId: state.currentUserId,
        backendSessionId: state.backendSessionId,
      }),
      onRehydrateStorage: () => state => {
        // 页面加载时恢复状态
        if (state?.currentUserId) {
          // 异步同步后端数据
          setTimeout(() => {
            state.syncWithBackend();
          }, 100);
        }
      },
    }
  )
);
