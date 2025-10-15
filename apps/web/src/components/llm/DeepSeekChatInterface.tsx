/**
 * DeepSeek官网风格聊天界面
 * 精确复刻DeepSeek官网的AI聊天界面设计
 */

import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';

// 类型声明
declare global {
  interface Window {
    IntersectionObserver: typeof IntersectionObserver;
  }
}
import {
  Send,
  Sparkles,
  Plus,
  Trash2,
  Brain,
  Search,
  Menu,
} from 'lucide-react';
import { useLLMStore } from '@/store/llm';
import { ChatMessage } from '@/components/llm/ChatMessage';
import { MessageSearch } from '@/components/llm/MessageSearch';
import { useSessionInitialization } from '@/hooks/useSessionInitialization';
import { useAuthSync } from '@/hooks/useAuthSync';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import './deepseek-styles.css';

export function DeepSeekChatInterface() {
  const [inputMessage, setInputMessage] = useState('');
  const [streamingContent, setStreamingContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMessages, setFilteredMessages] = useState<any[]>([]);
  const [textColor, setTextColor] = useState('text-slate-700');
  const [placeholderColor, setPlaceholderColor] = useState(
    'placeholder:text-slate-500/80'
  );
  const [lastColorState, setLastColorState] = useState({
    hasDarkContent: false,
    isHovered: false,
  });
  const [charCount, setCharCount] = useState(0);
  const MAX_MESSAGE_LENGTH = 4000; // 最大消息长度
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);

  // 初始化会话
  useSessionInitialization();

  // 同步认证状态
  useAuthSync();

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
    setStreamingContent('');
    clearError(); // 清除之前的错误

    try {
      // 如果没有活跃会话，sendStreamMessage会自动创建一个新会话
      await sendStreamMessage(message, setStreamingContent);
    } catch (error: unknown) {
      setError((error as Error).message || '发送消息失败');
      // 恢复输入内容，让用户可以重试
      setInputMessage(message);
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

  // 处理全局键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K: 新建会话
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        handleNewSession();
      }
      // Ctrl/Cmd + /: 清空对话
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        if (currentSession && currentSession.messages.length > 0) {
          handleClearMessages();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown as any);
    return () => document.removeEventListener('keydown', handleKeyDown as any);
  }, [currentSession]);

  // 处理输入框变化
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_MESSAGE_LENGTH) {
      setInputMessage(value);
      setCharCount(value.length);
    }
  };

  // 处理粘贴事件，确保高度正确调整
  const handleTextareaPaste = () => {
    // 延迟调整高度，确保粘贴内容已处理
    setTimeout(() => {
      adjustTextareaHeight();
    }, 10);
  };

  // 处理输入框滚动事件，防止在focus状态下滚动页面
  const handleTextareaWheel = (e: React.WheelEvent<HTMLTextAreaElement>) => {
    if (inputRef.current === document.activeElement) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  // 自动调整输入框高度
  const adjustTextareaHeight = () => {
    if (inputRef.current) {
      const textarea = inputRef.current;
      // 重置高度以获取正确的scrollHeight
      textarea.style.height = 'auto';
      // 计算新高度，最小40px（单行），最大200px
      const newHeight = Math.min(Math.max(textarea.scrollHeight, 40), 200);
      textarea.style.height = `${newHeight}px`;

      // 如果内容超过最大高度，启用滚动
      if (textarea.scrollHeight > 200) {
        textarea.style.overflowY = 'auto';
      } else {
        textarea.style.overflowY = 'hidden';
      }
    }
  };

  // 会话管理函数
  const handleNewSession = async () => {
    try {
      await createSession();
    } catch (error: unknown) {
      setError((error as Error).message || '创建会话失败');
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await deleteSession(sessionId);
    } catch (error: unknown) {
      setError((error as Error).message || '删除会话失败');
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

  // 搜索功能
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!currentSession || !query.trim()) {
      setFilteredMessages([]);
      return;
    }

    const filtered =
      currentSession.messages?.filter(message =>
        message.content.toLowerCase().includes(query.toLowerCase())
      ) || [];
    setFilteredMessages(filtered);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setFilteredMessages([]);
  };

  // 获取要显示的消息
  const getDisplayMessages = () => {
    if (searchQuery.trim() && filteredMessages.length > 0) {
      return filteredMessages;
    }
    return currentSession?.messages || [];
  };

  // 防抖函数
  const debounce = <T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
  ) => {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: Parameters<T>) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // 精确检测文字区域背景颜色
  const adjustTextColorForBackground = () => {
    if (!inputContainerRef.current || !inputRef.current) return;

    // 获取输入框文字区域的位置（更精确）
    const inputRect = inputRef.current.getBoundingClientRect();
    const textAreaTop = inputRect.top;
    const textAreaBottom = inputRect.bottom;
    const textAreaLeft = inputRect.left;
    const textAreaRight = inputRect.right;

    // 创建文字区域的检测范围（稍微扩大一点以确保覆盖）
    const detectionMargin = 20; // 20px的检测边距
    const detectionTop = textAreaTop - detectionMargin;
    const detectionBottom = textAreaBottom + detectionMargin;
    const detectionLeft = textAreaLeft - detectionMargin;
    const detectionRight = textAreaRight + detectionMargin;

    let hasDarkContent = false;
    let maxDarkness = 0;

    // 精确检测：只检查文字区域下方的背景内容
    const allElements = document.querySelectorAll('*');
    for (let i = 0; i < allElements.length; i++) {
      const element = allElements[i];
      const elementRect = element.getBoundingClientRect();

      // 检查元素是否在文字检测范围内
      if (
        elementRect.top < detectionBottom &&
        elementRect.bottom > detectionTop &&
        elementRect.left < detectionRight &&
        elementRect.right > detectionLeft
      ) {
        // 跳过输入框本身和其子元素
        if (
          inputContainerRef.current.contains(element) ||
          element.contains(inputRef.current)
        ) {
          continue;
        }

        // 检查元素背景色
        const computedStyle = window.getComputedStyle(element);
        const backgroundColor = computedStyle.backgroundColor;

        if (backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)') {
          const rgb = backgroundColor.match(/\d+/g);
          if (rgb && rgb.length >= 3) {
            const r = parseInt(rgb[0]);
            const g = parseInt(rgb[1]);
            const b = parseInt(rgb[2]);
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;
            const darkness = (255 - brightness) / 255;

            // 浅色背景优化：降低深色检测阈值，更容易检测到深色内容
            if (brightness < 180) {
              // 从150提高到180，更容易检测深色
              hasDarkContent = true;
              maxDarkness = Math.max(maxDarkness, darkness);

              console.log('🎯 文字区域发现深色背景:', {
                element: element.tagName,
                className: element.className,
                backgroundColor,
                brightness,
                darkness,
                position: { top: elementRect.top, bottom: elementRect.bottom },
              });
            }
          }
        }

        // 检查元素内是否有深色子元素
        const darkChildren = element.querySelectorAll(
          'pre, code, .code-block, .bg-slate-900, .bg-gray-900, .bg-black, .bg-gray-800, .bg-slate-800'
        );
        if (darkChildren.length > 0) {
          hasDarkContent = true;
          maxDarkness = Math.max(maxDarkness, 0.8);

          console.log('🎯 文字区域发现深色子元素:', {
            parentElement: element.tagName,
            parentClassName: element.className,
            darkChildrenCount: darkChildren.length,
          });
        }
      }
    }

    // 检查液态玻璃容器的hover状态
    const liquidGlassContainer = inputContainerRef.current;
    const isHovered = liquidGlassContainer.matches(':hover');

    // 字体颜色判断：基于文字区域背景检测结果
    // 浅色背景优化：默认使用深色文字，只有确认有深色背景时才使用白色文字
    let shouldUseWhiteText = false;

    if (hasDarkContent) {
      // 有深色内容时，根据黑暗程度决定
      if (maxDarkness > 0.3) {
        shouldUseWhiteText = true;
      }
    } else {
      // 没有检测到深色内容时，检查页面整体背景
      const bodyStyle = window.getComputedStyle(document.body);
      const bodyBg = bodyStyle.backgroundColor;

      if (bodyBg && bodyBg !== 'rgba(0, 0, 0, 0)') {
        const rgb = bodyBg.match(/\d+/g);
        if (rgb && rgb.length >= 3) {
          const r = parseInt(rgb[0]);
          const g = parseInt(rgb[1]);
          const b = parseInt(rgb[2]);
          const brightness = (r * 299 + g * 587 + b * 114) / 1000;

          // 如果页面背景是深色，使用白色文字
          if (brightness < 150) {
            shouldUseWhiteText = true;
            console.log('🎯 页面背景为深色，使用白色文字:', {
              bodyBg,
              brightness,
            });
          }
        }
      }

      // 浅色背景优化：检查输入框容器的实际背景色
      if (!shouldUseWhiteText && inputContainerRef.current) {
        const containerStyle = window.getComputedStyle(
          inputContainerRef.current
        );
        const containerBg = containerStyle.backgroundColor;

        if (containerBg && containerBg !== 'rgba(0, 0, 0, 0)') {
          const rgb = containerBg.match(/\d+/g);
          if (rgb && rgb.length >= 3) {
            const r = parseInt(rgb[0]);
            const g = parseInt(rgb[1]);
            const b = parseInt(rgb[2]);
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;

            // 如果输入框容器背景是深色，使用白色文字
            if (brightness < 150) {
              shouldUseWhiteText = true;
              console.log('🎯 输入框容器背景为深色，使用白色文字:', {
                containerBg,
                brightness,
              });
            }
          }
        }
      }
    }

    // 检查状态是否真的改变了
    const stateChanged = lastColorState.hasDarkContent !== shouldUseWhiteText;

    if (!stateChanged) {
      return; // 状态没有改变，不需要更新
    }

    // 详细调试日志
    console.log('🎨 精确文字区域检测:', {
      hasDarkContent,
      maxDarkness,
      shouldUseWhiteText,
      stateChanged,
      textAreaRect: {
        top: textAreaTop,
        bottom: textAreaBottom,
        left: textAreaLeft,
        right: textAreaRight,
      },
      detectionArea: {
        top: detectionTop,
        bottom: detectionBottom,
        left: detectionLeft,
        right: detectionRight,
      },
      isHovered,
      note: '精确检测文字区域背景，浅色背景优化',
    });

    // 更新状态缓存
    setLastColorState({ hasDarkContent: shouldUseWhiteText, isHovered });

    if (shouldUseWhiteText) {
      setTextColor('text-white');
      setPlaceholderColor('placeholder:text-slate-300/80');
    } else {
      setTextColor('text-slate-700');
      setPlaceholderColor('placeholder:text-slate-500/80');
    }
  };

  // 创建防抖版本的颜色调整函数 - 减少延迟以提高响应速度
  const debouncedAdjustTextColor = debounce(adjustTextColorForBackground, 8); // 约120fps，更快响应

  // 创建超快速版本用于关键事件
  const immediateAdjustTextColor = () => {
    adjustTextColorForBackground();
  };

  // 监听消息变化，重新调整颜色
  useEffect(() => {
    debouncedAdjustTextColor();
  }, [currentSession?.messages, streamingContent]);

  // 监听滚动事件，动态调整颜色 - 使用更快的响应
  useEffect(() => {
    const handleScroll = () => {
      // 滚动时使用快速响应，减少防抖延迟
      debouncedAdjustTextColor();
    };

    const scrollContainer = document.querySelector('.scroll-area');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll as any);
      return () =>
        scrollContainer.removeEventListener('scroll', handleScroll as any);
    }
  }, []);

  // 监听输入框容器的hover事件 - 仅用于背景效果，不影响字体颜色
  useEffect(() => {
    const handleMouseEnter = () => {
      // hover时检查颜色，但字体颜色不再受hover影响
      immediateAdjustTextColor();
    };

    const handleMouseLeave = () => {
      // 离开时检查颜色，但字体颜色不再受hover影响
      immediateAdjustTextColor();
    };

    if (inputContainerRef.current) {
      inputContainerRef.current.addEventListener(
        'mouseenter',
        handleMouseEnter
      );
      inputContainerRef.current.addEventListener(
        'mouseleave',
        handleMouseLeave
      );

      return () => {
        if (inputContainerRef.current) {
          inputContainerRef.current.removeEventListener(
            'mouseenter',
            handleMouseEnter
          );
          inputContainerRef.current.removeEventListener(
            'mouseleave',
            handleMouseLeave
          );
        }
      };
    }
  }, []);

  // 初始化时调整颜色
  useEffect(() => {
    const initTimeout = setTimeout(() => {
      adjustTextColorForBackground();
    }, 500); // 延迟执行，确保所有组件都已渲染

    return () => clearTimeout(initTimeout);
  }, []);

  // 使用Intersection Observer监控文字区域附近的深色元素
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        // 当深色元素进入或离开文字区域附近时，重新检测颜色
        let shouldRecheck = false;
        entries.forEach(entry => {
          if (entry.isIntersecting || !entry.isIntersecting) {
            shouldRecheck = true;
          }
        });

        if (shouldRecheck) {
          setTimeout(() => {
            adjustTextColorForBackground();
          }, 30); // 减少延迟，提高响应速度
        }
      },
      {
        root: null,
        rootMargin: '50px', // 缩小监控范围，只监控文字区域附近
        threshold: 0.1,
      }
    );

    // 只监控文字区域附近的深色元素
    const darkElements = document.querySelectorAll(
      'pre, code, .code-block, .bg-slate-900, .bg-gray-900, .bg-black, .bg-gray-800, .bg-slate-800'
    );
    darkElements.forEach(element => {
      // 只监控在输入框附近的元素
      const elementRect = element.getBoundingClientRect();
      const inputRect = inputRef.current?.getBoundingClientRect();

      if (inputRect) {
        const distance = Math.min(
          Math.abs(elementRect.top - inputRect.bottom),
          Math.abs(elementRect.bottom - inputRect.top)
        );

        // 只监控距离输入框200px以内的深色元素
        if (distance < 200) {
          observer.observe(element);
        }
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [currentSession?.messages]); // 当消息变化时重新设置观察器

  // 监听输入内容变化，自动调整输入框高度
  useEffect(() => {
    adjustTextareaHeight();
  }, [inputMessage]);

  // 初始化时调整输入框高度和自动聚焦
  useEffect(() => {
    const initHeightTimeout = setTimeout(() => {
      adjustTextareaHeight();
      // 自动聚焦到输入框
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);

    return () => clearTimeout(initHeightTimeout);
  }, []);

  // 当AI回复完成后自动聚焦到输入框
  useEffect(() => {
    if (!isLoading && !streamingContent && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading, streamingContent]);

  return (
    <div className="flex h-full bg-white">
      {/* 侧边栏 - 会话管理 */}
      <div className="w-64 lg:w-72 xl:w-80 bg-slate-50 border-r border-slate-200 flex flex-col hidden lg:flex">
        {/* 侧边栏头部 */}
        <div className="p-4 space-y-4">
          <Button
            onClick={handleNewSession}
            className="w-full bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white rounded-xl h-11 font-medium transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            title="新建对话 (Ctrl+K)"
          >
            <Plus className="h-4 w-4 mr-2 transition-transform duration-200 group-hover:rotate-90" />
            新对话
          </Button>

          {/* 消息搜索组件 */}
          {currentSession && (
            <MessageSearch
              onSearch={handleSearch}
              onClear={handleClearSearch}
              messageCount={currentSession.messages?.length ?? 0}
              className="w-full"
            />
          )}
        </div>

        {/* 会话列表 */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {sessions.map(session => (
              <div
                key={session.id}
                className={`group relative p-3 rounded-xl cursor-pointer transition-all duration-200 mb-2 ${currentSession?.id === session.id
                  ? 'bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-200 shadow-sm'
                  : 'hover:bg-slate-100 hover:shadow-sm hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                onClick={() => handleSwitchSession(session.id)}
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
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 hover:bg-red-50 h-7 w-7 p-0 transition-all duration-200 rounded-lg hover:scale-110 active:scale-95"
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
          <div className="p-4 bg-white/95 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              {/* 移动端会话管理按钮 */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden text-slate-600 hover:text-slate-800 hover:bg-slate-100"
              >
                <Menu className="h-4 w-4 mr-2" />
                会话
              </Button>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {currentSession.title}
                </h2>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span>deepseek-chat</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <div
                      className={`w-2 h-2 rounded-full ${serviceStatus?.status === 'healthy'
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
                disabled={(currentSession.messages?.length ?? 0) === 0}
                className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-50 transition-all duration-200 rounded-lg px-3 py-1 hover:scale-105 active:scale-95"
                title="清空对话 (Ctrl+/)"
              >
                清空对话
              </Button>
            </div>
          </div>
        )}

        {/* 聊天内容区域 */}
        <div className="flex-1 overflow-y-auto pb-40">
          <div className="max-w-4xl mx-auto px-4 pt-6 pb-0">
            {currentSession ? (
              <>
                {searchQuery.trim() && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      搜索到 {filteredMessages.length} 条相关消息
                    </p>
                  </div>
                )}

                {getDisplayMessages().map(message => {
                  const originalIndex =
                    currentSession?.messages?.findIndex(m => m === message) ??
                    -1;
                  return (
                    <ChatMessage
                      key={originalIndex}
                      message={message}
                      isLast={
                        originalIndex ===
                        (currentSession?.messages?.length ?? 0) - 1
                      }
                      streamingContent={streamingContent}
                      isStreaming={
                        isLoading &&
                        originalIndex ===
                        (currentSession?.messages?.length ?? 0) - 1 &&
                        message.role === 'assistant'
                      }
                    />
                  );
                })}
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
        <div className="absolute bottom-0 left-0 right-0 px-4 lg:px-6 pb-4 lg:pb-6 z-30">
          <div className="max-w-4xl mx-auto">
            {/* 主输入框容器 - 增强的液态玻璃效果 */}
            <div
              ref={inputContainerRef}
              className="relative bg-white/15 backdrop-blur-2xl shadow-2xl border border-white/25 border-t-white/35 before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/25 before:via-white/10 before:to-transparent before:pointer-events-none after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/5 after:to-transparent after:pointer-events-none hover:bg-white/20 hover:border-white/35 hover:border-t-white/45 hover:shadow-3xl transition-all duration-500 ease-out group liquid-glass-container"
              style={{
                borderRadius: '24px',
                background:
                  'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.1) 100%)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                boxShadow:
                  '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)',
              }}
            >
              {/* 功能按钮区域 - 在输入框内部左下角 */}
              <div className="absolute left-4 bottom-2 flex items-center gap-2 z-10">
                <Button
                  variant="outline"
                  size="sm"
                  className={`hidden sm:flex items-center gap-2 px-4 py-2 border-white/30 bg-white/15 backdrop-blur-md hover:bg-white/25 hover:border-white/50 ${textColor} hover:${textColor === 'text-white' ? 'text-slate-200' : 'text-slate-800'} transition-all duration-300 ease-out shadow-lg hover:shadow-xl hover:scale-105 text-xs`}
                  style={{ borderRadius: '16px' }}
                >
                  <Brain className="w-3 h-3 transition-transform duration-300 group-hover:scale-110" />
                  <span className="font-medium">DeepThink</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className={`hidden sm:flex items-center gap-2 px-4 py-2 border-white/30 bg-white/15 backdrop-blur-md hover:bg-white/25 hover:border-white/50 ${textColor} hover:${textColor === 'text-white' ? 'text-slate-200' : 'text-slate-800'} transition-all duration-300 ease-out shadow-lg hover:shadow-xl hover:scale-105 text-xs`}
                  style={{ borderRadius: '16px' }}
                >
                  <Search className="w-3 h-3 transition-transform duration-300 group-hover:scale-110" />
                  <span className="font-medium">Search</span>
                </Button>

                {/* 移动端简化按钮 */}
                <div className="flex sm:hidden items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`w-9 h-9 p-0 border-white/30 bg-white/15 backdrop-blur-md hover:bg-white/25 ${textColor} hover:${textColor === 'text-white' ? 'text-slate-200' : 'text-slate-800'} transition-all duration-300 shadow-sm hover:shadow-md`}
                    style={{ borderRadius: '16px' }}
                  >
                    <Brain className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`w-9 h-9 p-0 border-white/30 bg-white/15 backdrop-blur-md hover:bg-white/25 ${textColor} hover:${textColor === 'text-white' ? 'text-slate-200' : 'text-slate-800'} transition-all duration-300 shadow-sm hover:shadow-md`}
                    style={{ borderRadius: '16px' }}
                  >
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                onWheel={handleTextareaWheel}
                onPaste={handleTextareaPaste}
                placeholder="Message DeepSeek"
                aria-label="输入消息"
                aria-describedby="input-help"
                className={`w-full pr-14 pl-6 py-3 pb-12 text-lg border-0 focus:outline-none focus:ring-0 resize-none bg-transparent ${textColor} ${placeholderColor} focus:placeholder:text-slate-400/60 transition-all duration-300 ease-out`}
                style={{
                  outline: 'none',
                  boxShadow: 'none',
                  border: 'none',
                  minHeight: '40px',
                  maxHeight: '200px',
                  height: '40px',
                  overflowY: 'hidden',
                }}
                disabled={isLoading}
              />
              <div id="input-help" className="sr-only">
                按Enter发送消息，按Shift+Enter换行
              </div>

              {/* 字符计数 */}
              {charCount > 0 && (
                <div
                  className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 text-xs ${textColor === 'text-white' ? 'text-slate-300' : 'text-slate-400'} pointer-events-none`}
                >
                  {charCount}/{MAX_MESSAGE_LENGTH}
                </div>
              )}

              {/* 发送按钮 */}
              <Button
                onClick={isLoading ? handleInterrupt : handleSendMessage}
                disabled={!inputMessage.trim() && !isLoading}
                aria-label={isLoading ? '中断生成' : '发送消息'}
                className={`absolute right-4 bottom-2 h-10 w-10 p-0 transition-all duration-300 ease-out backdrop-blur-md hover:scale-110 active:scale-95 ${isLoading
                  ? 'bg-red-500/85 hover:bg-red-600/85 text-white shadow-xl border border-red-400/60 hover:shadow-2xl hover:border-red-300/70'
                  : 'bg-gradient-to-r from-purple-500/85 to-blue-500/85 hover:from-purple-600/85 hover:to-blue-600/85 text-white shadow-xl hover:shadow-2xl border border-purple-400/60 hover:border-purple-300/70'
                  }`}
                style={{ borderRadius: '16px' }}
              >
                {isLoading ? (
                  <div className="w-5 h-5 flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-sm animate-pulse"></div>
                  </div>
                ) : (
                  <Send className="w-5 h-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
