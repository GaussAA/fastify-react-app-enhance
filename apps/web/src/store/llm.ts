/**
 * 大模型服务状态管理
 * 使用Zustand管理LLM相关的状态
 */

import { create } from 'zustand';
import {
    LLMChatSession,
    LLMMessage,
    LLMChatConfig,
    LLMModel,
    LLMServiceStatus,
    DEFAULT_CHAT_CONFIG
} from '../types/llm';
import { llmApiClient } from '../lib/llm-api';

interface LLMState {
    // 状态
    sessions: LLMChatSession[];
    currentSession: LLMChatSession | null;
    models: LLMModel[];
    serviceStatus: LLMServiceStatus | null;
    isLoading: boolean;
    error: string | null;
    config: LLMChatConfig;

    // 会话管理
    createSession: (title?: string) => void;
    deleteSession: (sessionId: string) => void;
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
    sendStreamMessage: (message: string, onChunk: (chunk: string) => void) => Promise<void>;

    // 数据获取
    loadModels: () => Promise<void>;
    checkServiceHealth: () => Promise<void>;

    // 工具方法
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    clearError: () => void;
}

export const useLLMStore = create<LLMState>((set, get) => ({
    // 初始状态
    sessions: [],
    currentSession: null,
    models: [],
    serviceStatus: null,
    isLoading: false,
    error: null,
    config: { ...DEFAULT_CHAT_CONFIG },

    // 会话管理
    createSession: (title?: string) => {
        const session: LLMChatSession = {
            id: Date.now().toString(),
            title: title || `新对话 ${new Date().toLocaleString()}`,
            messages: [],
            model: get().config.model,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        set(state => ({
            sessions: [session, ...state.sessions],
            currentSession: session
        }));
    },

    deleteSession: (sessionId: string) => {
        set(state => ({
            sessions: state.sessions.filter(s => s.id !== sessionId),
            currentSession: state.currentSession?.id === sessionId ? null : state.currentSession
        }));
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
            currentSession: state.currentSession?.id === sessionId
                ? { ...state.currentSession, title, updatedAt: new Date() }
                : state.currentSession
        }));
    },

    // 消息管理
    addMessage: (message: LLMMessage) => {
        const { currentSession } = get();
        if (!currentSession) return;

        const updatedSession = {
            ...currentSession,
            messages: [...currentSession.messages, message],
            updatedAt: new Date()
        };

        set(state => ({
            currentSession: updatedSession,
            sessions: state.sessions.map(s =>
                s.id === currentSession.id ? updatedSession : s
            )
        }));
    },

    updateMessage: (messageId: string, content: string) => {
        const { currentSession } = get();
        if (!currentSession) return;

        const updatedSession = {
            ...currentSession,
            messages: currentSession.messages.map(m =>
                m === currentSession.messages[parseInt(messageId)]
                    ? { ...m, content }
                    : m
            ),
            updatedAt: new Date()
        };

        set(state => ({
            currentSession: updatedSession,
            sessions: state.sessions.map(s =>
                s.id === currentSession.id ? updatedSession : s
            )
        }));
    },

    clearMessages: () => {
        const { currentSession } = get();
        if (!currentSession) return;

        const updatedSession = {
            ...currentSession,
            messages: [],
            updatedAt: new Date()
        };

        set(state => ({
            currentSession: updatedSession,
            sessions: state.sessions.map(s =>
                s.id === currentSession.id ? updatedSession : s
            )
        }));
    },

    // 配置管理
    updateConfig: (newConfig: Partial<LLMChatConfig>) => {
        set(state => ({
            config: { ...state.config, ...newConfig }
        }));
    },

    resetConfig: () => {
        set({ config: { ...DEFAULT_CHAT_CONFIG } });
    },

    // API调用
    sendMessage: async (message: string) => {
        const { currentSession, config, addMessage, setLoading, setError } = get();

        if (!currentSession) {
            setError('没有活跃的对话会话');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // 添加用户消息
            const userMessage: LLMMessage = {
                role: 'user',
                content: message
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
                presence_penalty: config.presence_penalty
            };

            // 发送请求
            const response = await llmApiClient.chat(request);

            // 添加助手回复
            if (response.choices && response.choices.length > 0) {
                const assistantMessage: LLMMessage = {
                    role: 'assistant',
                    content: response.choices[0].message.content
                };
                addMessage(assistantMessage);
            }
        } catch (error: any) {
            setError(error.message || '发送消息失败');
        } finally {
            setLoading(false);
        }
    },

    sendStreamMessage: async (message: string, onChunk: (chunk: string) => void) => {
        const { currentSession, config, addMessage, setLoading, setError } = get();

        if (!currentSession) {
            setError('没有活跃的对话会话');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // 添加用户消息
            const userMessage: LLMMessage = {
                role: 'user',
                content: message
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
                stream: true
            };

            // 创建助手消息占位符
            const assistantMessage: LLMMessage = {
                role: 'assistant',
                content: ''
            };
            addMessage(assistantMessage);

            // 流式处理响应
            let fullContent = '';
            for await (const chunk of llmApiClient.chatStream(request)) {
                if (chunk.choices && chunk.choices.length > 0) {
                    const delta = chunk.choices[0].delta;
                    if (delta?.content) {
                        fullContent += delta.content;
                        onChunk(delta.content);

                        // 更新消息内容
                        get().updateMessage(
                            (currentSession.messages.length - 1).toString(),
                            fullContent
                        );
                    }
                }
            }
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

    // 工具方法
    setLoading: (loading: boolean) => {
        set({ isLoading: loading });
    },

    setError: (error: string | null) => {
        set({ error });
    },

    clearError: () => {
        set({ error: null });
    }
}));
