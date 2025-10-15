/**
 * 大模型聊天界面组件
 * 提供完整的聊天交互功能
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLLMStore } from '@/store/llm';
import { ChatMessage } from '@/components/llm/ChatMessage';
import { ChatSettings } from '@/components/llm/ChatSettings';
import { useSessionInitialization } from '@/hooks/useSessionInitialization';
import { useAuthSync } from '@/hooks/useAuthSync';

export function ChatInterface() {
  const [inputMessage, setInputMessage] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 初始化会话
  const { currentUserId } = useSessionInitialization();

  // 同步认证状态
  useAuthSync();

  const {
    sessions,
    currentSession,
    isLoading,
    error,
    config,
    isInterrupted,
    createSession,
    deleteSession,
    setCurrentSession,
    sendStreamMessage,
    clearMessages,
    clearError,
    setError,
    interruptGeneration,
  } = useLLMStore();

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages, streamingContent]);

  // 处理发送消息 - 即时聊天模式
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    if (!currentUserId) {
      setError('请先登录后再发送消息');
      return;
    }

    const message = inputMessage.trim();
    setInputMessage('');

    try {
      // 如果没有当前会话，自动创建新会话
      if (!currentSession) {
        await createSession();
      }

      // 使用流式发送
      await sendStreamMessage(message, chunk => {
        setStreamingContent(prev => prev + chunk);
      });
    } catch (error) {
      console.error('发送消息失败:', error);
    } finally {
      // 流式处理完成后清空流式内容
      setStreamingContent('');
    }
  };

  // 处理键盘事件
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 创建新会话
  const handleNewSession = async () => {
    if (!currentUserId) {
      setError('请先登录后再创建会话');
      return;
    }

    await createSession();
    setInputMessage('');
    setStreamingContent('');
  };

  // 删除会话
  const handleDeleteSession = (sessionId: string) => {
    deleteSession(sessionId);
  };

  // 切换会话
  const handleSelectSession = (sessionId: string) => {
    setCurrentSession(sessionId);
    setInputMessage('');
    setStreamingContent('');
  };

  // 清空当前会话
  const handleClearMessages = () => {
    if (currentSession) {
      clearMessages();
    }
  };

  return (
    <div className="flex h-full bg-white">
      {/* 侧边栏 - 会话列表 (参考ChatGPT设计) */}
      <div className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col">
        {/* 侧边栏头部 - ChatGPT风格 */}
        <div className="p-4 border-b border-slate-200 space-y-3">
          <Button
            onClick={handleNewSession}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-lg h-10 font-medium transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            新对话
          </Button>
        </div>

        {/* 会话列表 - ChatGPT风格 */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {sessions.map(session => (
              <div
                key={session.id}
                className={`group relative p-3 rounded-lg cursor-pointer transition-colors mb-1 ${currentSession?.id === session.id
                  ? 'bg-slate-200'
                  : 'hover:bg-slate-100'
                  }`}
                onClick={() => handleSelectSession(session.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-slate-900 truncate">
                      {session.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {session.messages?.length ?? 0} 条消息
                    </p>
                  </div>
                  <Button
                    onClick={e => {
                      e.stopPropagation();
                      handleDeleteSession(session.id);
                    }}
                    size="sm"
                    variant="ghost"
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 h-6 w-6 p-0 transition-opacity"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* 主聊天区域 - 即时聊天模式 */}
      <div className="flex-1 flex flex-col bg-white">
        {/* 聊天头部 - 仅在有会话时显示 */}
        {currentSession && (
          <div className="border-b border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold text-slate-900">
                {currentSession.title}
              </h1>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-500">{config.model}</span>
                <Button
                  onClick={handleClearMessages}
                  size="sm"
                  variant="ghost"
                  disabled={(currentSession.messages?.length ?? 0) === 0}
                  className="text-slate-500 hover:text-slate-700 disabled:opacity-50"
                >
                  清空
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 消息列表 - 始终显示 */}
        <ScrollArea className="flex-1">
          <div className="max-w-4xl mx-auto px-4 py-6">
            {currentSession ? (
              <>
                {currentSession.messages?.map((message, index) => (
                  <ChatMessage
                    key={index}
                    message={message}
                    isLast={
                      index === (currentSession.messages?.length ?? 0) - 1
                    }
                    streamingContent={streamingContent}
                    isStreaming={
                      isLoading &&
                      index === (currentSession.messages?.length ?? 0) - 1 &&
                      message.role === 'assistant'
                    }
                  />
                )) ?? []}
                <div ref={messagesEndRef} />
              </>
            ) : (
              /* 空状态 - 即时聊天模式 */
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md mx-auto">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    开始新的对话
                  </h3>
                  <p className="text-slate-500">
                    在下方输入框中输入消息开始与AI助手交流
                  </p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* 错误提示 */}
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200/60 p-4 mx-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-red-700 font-medium">{error}</p>
              <Button
                onClick={clearError}
                size="sm"
                variant="ghost"
                className="text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full p-1"
              >
                ×
              </Button>
            </div>
          </div>
        )}

        {/* 输入区域 - 始终可见 */}
        <div className="border-t border-slate-200 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  currentSession ? '发送消息...' : '输入消息开始对话...'
                }
                disabled={isLoading}
                className="w-full pr-12 h-12 text-base border-slate-300 focus:border-slate-400 focus:ring-slate-400 rounded-xl"
              />
              <Button
                onClick={isLoading ? interruptGeneration : handleSendMessage}
                disabled={!inputMessage.trim() && !isLoading}
                className={`absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 rounded-lg ${isLoading
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
              >
                {isLoading ? (
                  <div className="w-4 h-4 flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-sm"></div>
                  </div>
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            {isLoading && (
              <div className="flex items-center justify-center mt-2 text-sm text-slate-500">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-400 border-t-transparent mr-2"></div>
                {isInterrupted ? 'AI回复已中断' : 'AI正在思考...'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 设置面板 */}
      {showSettings && <ChatSettings onClose={() => setShowSettings(false)} />}
    </div>
  );
}
