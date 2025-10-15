/**
 * 聊天消息组件
 * 显示单条聊天消息
 */

import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LLMMessage } from '@/types/llm';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ChatMessageProps {
  message: LLMMessage;
  isLast?: boolean;
  streamingContent?: string;
  isStreaming?: boolean;
}

export function ChatMessage({
  message,
  isLast,
  streamingContent,
  isStreaming,
}: ChatMessageProps) {
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
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 chat-message`}
    >
      <div
        className={`${isUser ? 'max-w-xs' : 'max-w-4xl w-full'} message-container`}
      >
        <div
          className={`rounded-2xl px-4 py-3 ${isUser ? 'inline-block' : 'w-full'} ${
            isUser
              ? 'bg-slate-200 text-slate-900'
              : isSystem
                ? 'bg-yellow-50 border border-yellow-200 text-yellow-800'
                : 'text-slate-900'
          }`}
        >
          {isUser || isSystem ? (
            // 用户和系统消息使用普通文本渲染
            <div className="whitespace-pre-wrap text-base leading-relaxed">
              {isLast && isStreaming && streamingContent
                ? streamingContent
                : message.content}
            </div>
          ) : (
            // AI消息使用Markdown渲染（包括流式内容）
            <div className="w-full">
              <MarkdownRenderer
                content={
                  isLast && isStreaming && streamingContent
                    ? streamingContent
                    : message.content
                }
                isStreaming={isLast && isStreaming}
                className="text-base leading-relaxed"
              />
            </div>
          )}
        </div>

        {!isUser && !isStreaming && (
          <div className="flex items-center justify-start mt-2">
            <Button
              onClick={handleCopy}
              size="sm"
              variant="ghost"
              className="h-6 px-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded text-xs"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 mr-1" />
                  已复制
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3 mr-1" />
                  复制
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
