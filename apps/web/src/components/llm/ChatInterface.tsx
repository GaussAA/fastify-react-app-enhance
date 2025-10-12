/**
 * 大模型聊天界面组件
 * 提供完整的聊天交互功能
 */

import { useState, useRef, useEffect } from 'react';
import { Send, Settings, Trash2, Plus, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLLMStore } from '@/store/llm';
import { ChatMessage } from '@/components/llm/ChatMessage';
import { ChatSettings } from '@/components/llm/ChatSettings';

export function ChatInterface() {
    const [inputMessage, setInputMessage] = useState('');
    const [showSettings, setShowSettings] = useState(false);
    const [streamingContent, setStreamingContent] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const {
        sessions,
        currentSession,
        isLoading,
        error,
        config,
        createSession,
        deleteSession,
        setCurrentSession,
        sendStreamMessage,
        clearMessages,
        clearError
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
            // 使用流式发送
            await sendStreamMessage(message, (chunk) => {
                setStreamingContent(prev => prev + chunk);
            });
        } catch (error) {
            console.error('发送消息失败:', error);
        } finally {
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
    const handleNewSession = () => {
        createSession();
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
        <div className="flex h-full bg-gray-50">
            {/* 侧边栏 - 会话列表 */}
            <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">对话历史</h2>
                        <Button
                            onClick={handleNewSession}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            新对话
                        </Button>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                            {config.model}
                        </Badge>
                        <Button
                            onClick={() => setShowSettings(!showSettings)}
                            size="sm"
                            variant="outline"
                        >
                            <Settings className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <ScrollArea className="flex-1">
                    <div className="p-2 space-y-2">
                        {sessions.map((session) => (
                            <div
                                key={session.id}
                                className={`p-3 rounded-lg cursor-pointer transition-colors ${currentSession?.id === session.id
                                    ? 'bg-blue-50 border border-blue-200'
                                    : 'bg-gray-50 hover:bg-gray-100'
                                    }`}
                                onClick={() => handleSelectSession(session.id)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-medium text-gray-900 truncate">
                                            {session.title}
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {session.messages.length} 条消息
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {new Date(session.updatedAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <Button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteSession(session.id);
                                        }}
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
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
            <div className="flex-1 flex flex-col">
                {currentSession ? (
                    <>
                        {/* 聊天头部 */}
                        <div className="bg-white border-b border-gray-200 p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <MessageSquare className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <h1 className="text-lg font-semibold text-gray-900">
                                            {currentSession.title}
                                        </h1>
                                        <p className="text-sm text-gray-500">
                                            {currentSession.messages.length} 条消息
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Badge variant="outline">{config.model}</Badge>
                                    <Button
                                        onClick={handleClearMessages}
                                        size="sm"
                                        variant="outline"
                                        disabled={currentSession.messages.length === 0}
                                    >
                                        清空对话
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* 消息列表 */}
                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-4 max-w-4xl mx-auto">
                                {currentSession.messages.map((message, index) => (
                                    <ChatMessage
                                        key={index}
                                        message={message}
                                        isLast={index === currentSession.messages.length - 1}
                                    />
                                ))}

                                {/* 流式消息显示 */}
                                {streamingContent && (
                                    <div className="flex justify-start">
                                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 max-w-3xl">
                                            <div className="flex items-start space-x-3">
                                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                                    <MessageSquare className="h-4 w-4 text-green-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-sm font-medium text-gray-900 mb-1">
                                                        AI助手
                                                    </div>
                                                    <div className="text-gray-700 whitespace-pre-wrap">
                                                        {streamingContent}
                                                        <span className="animate-pulse">|</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>
                        </ScrollArea>

                        {/* 错误提示 */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 p-3 mx-4 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-red-700">{error}</p>
                                    <Button
                                        onClick={clearError}
                                        size="sm"
                                        variant="ghost"
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        ×
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* 输入区域 */}
                        <div className="bg-white border-t border-gray-200 p-4">
                            <div className="max-w-4xl mx-auto">
                                <div className="flex space-x-2">
                                    <Input
                                        ref={inputRef}
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="输入消息... (Enter发送，Shift+Enter换行)"
                                        disabled={isLoading}
                                        className="flex-1"
                                    />
                                    <Button
                                        onClick={handleSendMessage}
                                        disabled={!inputMessage.trim() || isLoading}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                                    <span>按 Enter 发送，Shift + Enter 换行</span>
                                    {isLoading && <span className="text-blue-600">AI正在思考...</span>}
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    /* 空状态 */
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                开始新的对话
                            </h3>
                            <p className="text-gray-500 mb-4">
                                点击"新对话"按钮开始与AI助手交流
                            </p>
                            <Button
                                onClick={handleNewSession}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                创建新对话
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* 设置面板 */}
            {showSettings && (
                <ChatSettings
                    onClose={() => setShowSettings(false)}
                />
            )}
        </div>
    );
}
