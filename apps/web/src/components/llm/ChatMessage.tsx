/**
 * 聊天消息组件
 * 显示单条聊天消息
 */

import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LLMMessage } from '@/types/llm';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ChatMessageProps {
    message: LLMMessage;
    isLast?: boolean;
    streamingContent?: string;
    isStreaming?: boolean;
}

export function ChatMessage({ message, isLast, streamingContent, isStreaming }: ChatMessageProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(message.content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('复制失败:', error);
        }
    };

    const isUser = message.role === 'user';
    const isSystem = message.role === 'system';

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-3xl ${isUser ? 'order-2' : 'order-1'}`}>
                <div className="flex items-start space-x-3">
                    {!isUser && (
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center order-1">
                            <span className="text-sm font-medium text-blue-600">
                                {isSystem ? 'S' : 'AI'}
                            </span>
                        </div>
                    )}

                    <div className={`flex-1 ${isUser ? 'order-1' : 'order-2'}`}>
                        <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-medium text-gray-900">
                                {isUser ? '您' : isSystem ? '系统' : 'AI助手'}
                            </span>
                            <Badge
                                variant={isUser ? 'default' : isSystem ? 'secondary' : 'outline'}
                                className="text-xs"
                            >
                                {message.role}
                            </Badge>
                        </div>

                        <div
                            className={`rounded-lg p-4 ${isUser
                                ? 'bg-blue-600 text-white'
                                : isSystem
                                    ? 'bg-yellow-50 border border-yellow-200 text-yellow-800'
                                    : 'bg-white border border-gray-200 text-gray-900'
                                }`}
                        >
                            {isUser || isSystem ? (
                                // 用户和系统消息使用普通文本渲染
                                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                    {isLast && isStreaming && streamingContent ? streamingContent : message.content}
                                </div>
                            ) : (
                                // AI消息使用Markdown渲染（包括流式内容）
                                <MarkdownRenderer
                                    content={isLast && isStreaming && streamingContent ? streamingContent : message.content}
                                    isStreaming={isLast && isStreaming}
                                />
                            )}
                        </div>

                        {!isUser && (
                            <div className="flex items-center justify-end mt-2 space-x-2">
                                <Button
                                    onClick={handleCopy}
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 px-2 text-gray-400 hover:text-gray-600"
                                >
                                    {copied ? (
                                        <Check className="h-3 w-3" />
                                    ) : (
                                        <Copy className="h-3 w-3" />
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>

                    {isUser && (
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center order-2">
                            <span className="text-sm font-medium text-gray-600">您</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
