/**
 * 实时流式Markdown渲染测试组件
 * 模拟AI回复的实时渲染效果
 */

import { useState, useEffect } from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { Button } from '@/components/ui/button';

const streamingContent = `
# 人工智能的三个层次

通常，我们根据AI的智能水平将其分为三个层次：

1. **弱人工智能**：专注于完成特定领域的任务，是当前AI的主流形态。
   - 特点：专门化、高效率、成本低
   - 例子：图像识别软件、语音助手(如Siri、小爱同学)、围棋程序AlphaGo

2. **强人工智能**：具备与人类同等水平的智能，能够理解、学习和应用其智能来解决任何问题。
   - 特点：通用智能、自我意识、推理能力
   - 现状：目前尚未实现，是许多科研人员努力的方向

3. **超人工智能**：超越人类智能的AI，能够进行创造性思维和复杂推理。
   - 特点：超级智能、创造性、自主性
   - 前景：理论上的概念，存在争议

## 代码示例

\`\`\`javascript
// 简单的AI响应处理
function processAIResponse(response) {
    return {
        content: response,
        timestamp: new Date(),
        type: 'ai'
    };
}
\`\`\`

## 总结

AI的发展是一个渐进的过程，从弱AI到强AI再到超AI，每一步都需要突破性的技术进步。
`;

export function StreamingTest() {
    const [displayedContent, setDisplayedContent] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const startStreaming = () => {
        setIsStreaming(true);
        setCurrentIndex(0);
        setDisplayedContent('');
    };

    const stopStreaming = () => {
        setIsStreaming(false);
        setDisplayedContent(streamingContent);
    };

    useEffect(() => {
        if (isStreaming && currentIndex < streamingContent.length) {
            const timer = setTimeout(() => {
                setDisplayedContent(streamingContent.slice(0, currentIndex + 1));
                setCurrentIndex(currentIndex + 1);
            }, 20); // 每20ms添加一个字符，模拟流式效果

            return () => clearTimeout(timer);
        } else if (isStreaming && currentIndex >= streamingContent.length) {
            setIsStreaming(false);
        }
    }, [isStreaming, currentIndex]);

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                        实时流式Markdown渲染测试
                    </h2>
                    <div className="flex space-x-2">
                        <Button
                            onClick={startStreaming}
                            disabled={isStreaming}
                            variant="default"
                        >
                            {isStreaming ? '流式渲染中...' : '开始流式渲染'}
                        </Button>
                        <Button
                            onClick={stopStreaming}
                            variant="outline"
                        >
                            完整显示
                        </Button>
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                    <div className="bg-gray-50 rounded-lg p-4 min-h-[400px]">
                        <MarkdownRenderer
                            content={displayedContent}
                            isStreaming={isStreaming}
                        />
                    </div>
                </div>

                <div className="mt-4 text-sm text-gray-600">
                    <p><strong>说明：</strong></p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>点击"开始流式渲染"可以看到Markdown内容逐步显示</li>
                        <li>流式过程中会显示光标动画</li>
                        <li>数字列表和项目符号列表应该正确显示在同一行</li>
                        <li>代码块、表格等复杂格式也会实时渲染</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
