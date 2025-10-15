/**
 * DeepSeek官网风格聊天界面
 * 精确复刻DeepSeek官网的AI聊天界面设计
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Plus, Trash2, Brain, Search } from 'lucide-react';
import { useLLMStore } from '@/store/llm';
import { ChatMessage } from '@/components/llm/ChatMessage';
import { useSessionInitialization } from '@/hooks/useSessionInitialization';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import './deepseek-styles.css';

export function DeepSeekChatInterface() {
  const [inputMessage, setInputMessage] = useState('');
  const [streamingContent, setStreamingContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 初始化会话
  useSessionInitialization();

  const {
    sessions,
    currentSession,
    isLoading,
    error,
    serviceStatus,
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

  // 处理发送消息
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const message = inputMessage.trim();
    setInputMessage('');

    try {
      await sendStreamMessage(message, setStreamingContent);
    } catch (error: any) {
      setError(error.message || '发送消息失败');
    }
  };

  // 处理中断生成
  const handleInterrupt = () => {
    interruptGeneration();
    setStreamingContent('');
  };

  // 处理键盘事件
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 处理输入框变化
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);

    // 自动调整高度
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  // 会话管理函数
  const handleNewSession = async () => {
    try {
      await createSession();
    } catch (error: any) {
      setError(error.message || '创建会话失败');
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await deleteSession(sessionId);
    } catch (error: any) {
      setError(error.message || '删除会话失败');
    }
  };

  const handleSwitchSession = (sessionId: string) => {
    setCurrentSession(sessionId);
  };

  const handleClearMessages = () => {
    if (currentSession) {
      clearMessages();
    }
  };

  return (
    <div className="flex h-full bg-white">
      {/* 侧边栏 - 会话管理 */}
      <div className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col">
        {/* 侧边栏头部 */}
        <div className="p-4">
          <Button
            onClick={handleNewSession}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-lg h-10 font-medium transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            新对话
          </Button>
        </div>

        {/* 会话列表 */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {sessions.map(session => (
              <div
                key={session.id}
                className={`group relative p-3 rounded-lg cursor-pointer transition-colors mb-1 ${
                  currentSession?.id === session.id
                    ? 'bg-slate-200'
                    : 'hover:bg-slate-100'
                }`}
                onClick={() => handleSwitchSession(session.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-slate-900 truncate">
                      {session.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {session.messages.length} 条消息
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

      {/* 主聊天区域 */}
      <div className="flex-1 flex flex-col relative">
        {/* 聊天头部 */}
        {currentSession && (
          <div className="p-4 bg-white/95 backdrop-blur-sm border-b border-slate-200/50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {currentSession.title}
                </h2>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span>deepseek-chat</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        serviceStatus?.status === 'healthy'
                          ? 'bg-green-500'
                          : 'bg-red-500'
                      }`}
                    ></div>
                    {serviceStatus?.status === 'healthy' ? '在线' : '离线'}
                  </span>
                </div>
              </div>
              <Button
                onClick={handleClearMessages}
                size="sm"
                variant="ghost"
                disabled={currentSession.messages.length === 0}
                className="text-slate-500 hover:text-slate-700 disabled:opacity-50"
              >
                清空
              </Button>
            </div>
          </div>
        )}

        {/* 聊天内容区域 - 可以滚动到输入框后面 */}
        <div className="flex-1 overflow-y-auto pb-24">
          <div className="max-w-4xl mx-auto px-4 pt-6 pb-0">
            {currentSession ? (
              <>
                {currentSession.messages.map((message, index) => (
                  <ChatMessage
                    key={index}
                    message={message}
                    isLast={index === currentSession.messages.length - 1}
                    streamingContent={streamingContent}
                    isStreaming={
                      isLoading &&
                      index === currentSession.messages.length - 1 &&
                      message.role === 'assistant'
                    }
                  />
                ))}
                <div ref={messagesEndRef} />
              </>
            ) : (
              /* 欢迎区域 - 只在没有会话时显示 */
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md mx-auto">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    How can I help you?
                  </h3>
                  <p className="text-slate-500">
                    在下方输入框中输入消息开始与AI助手交流
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="absolute top-20 left-6 right-6 z-20 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200/60 p-4 rounded-xl shadow-lg">
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

        {/* 输入区域 - 固定在主聊天区域底部 */}
        <div className="absolute bottom-0 left-0 right-0 px-6 pt-4 pb-6 bg-gradient-to-t from-white via-white/95 to-transparent backdrop-blur-sm z-30">
          <div className="max-w-4xl mx-auto">
            {/* 主输入框容器 - 移除边框，让消息可以滚动到后面 */}
            <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* 功能按钮区域 - 在输入框内部左下角 */}
              <div className="absolute left-3 bottom-3 flex items-center gap-2 z-10">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border-slate-200 bg-white/90 hover:bg-slate-50 text-slate-600 hover:text-slate-700 transition-all duration-200 shadow-sm hover:shadow-md text-xs"
                >
                  <Brain className="w-3 h-3" />
                  <span className="font-medium">DeepThink</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border-slate-200 bg-white/90 hover:bg-slate-50 text-slate-600 hover:text-slate-700 transition-all duration-200 shadow-sm hover:shadow-md text-xs"
                >
                  <Search className="w-3 h-3" />
                  <span className="font-medium">Search</span>
                </Button>
              </div>

              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Message DeepSeek"
                className="w-full pr-16 pl-6 py-4 pb-16 text-base border-0 focus:outline-none focus:ring-0 resize-none min-h-[60px] max-h-[200px] bg-transparent placeholder:text-slate-400"
                rows={1}
                disabled={isLoading}
              />

              {/* 发送按钮 */}
              <Button
                onClick={isLoading ? handleInterrupt : handleSendMessage}
                disabled={!inputMessage.trim() && !isLoading}
                className={`absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 p-0 rounded-xl transition-all duration-200 ${
                  isLoading
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg'
                    : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl'
                }`}
              >
                {isLoading ? (
                  <div className="w-5 h-5 flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-sm"></div>
                  </div>
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
