/**
 * 实时流式Markdown渲染测试组件
 * 模拟AI回复的实时流式渲染效果
 */

import { useState, useEffect } from 'react';
import { MarkdownRenderer } from '../../../apps/web/src/components/llm/MarkdownRenderer';
import { Button } from '../../../apps/web/src/components/ui/button';

const streamingContent = `
# 人工智能的三个层次

通常，我们根据AI的智能水平将其分为三个层次：

1. **弱人工智能**：专注于完成特定领域的任务，是当前AI的主流形态。
   - 特点：专注于完成特定领域的任务，是当前AI的主流形态。
   - 例子：图像识别软件、语音助手(如Siri、小爱同学)、围棋程序AlphaGo、推荐算法(如淘宝、Netflix的推荐)。你正在对话的我，就属于弱人工智能。

2. **强人工智能**：具备与人类同等水平的智能，能够理解、学习和应用其智能来解决任何问题，具有自我意识和推理能力。
   - 特点：具备与人类同等水平的智能，能够理解、学习和应用其智能来解决任何问题，具有自我意识和推理能力。
   - 现状：目前尚未实现，是许多科研人员努力的方向。

3. **超人工智能**：超越人类智能的AI，能够进行创造性思维和复杂推理。
   - 特点：超越人类智能，能够进行创造性思维和复杂推理。
   - 展望：这是AI发展的终极目标，但目前还只是理论概念。

## 代码示例

以下是一个简单的JavaScript函数：

\`\`\`javascript
function greetUser(name) {
    return \`Hello, \${name}! Welcome to our AI platform.\`;
}

// 使用示例
const message = greetUser('张三');
console.log(message); // 输出: Hello, 张三! Welcome to our AI platform.
\`\`\`

## 总结

AI技术的发展正在不断推进，从弱人工智能到强人工智能，再到超人工智能，每一步都是人类智慧的体现。

---

*希望这个解释对您有帮助！*
`;

export function StreamingTest() {
    const [displayedContent, setDisplayedContent] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const startStreaming = () => {
        setDisplayedContent('');
        setCurrentIndex(0);
        setIsStreaming(true);
    };

    const stopStreaming = () => {
        setIsStreaming(false);
        setDisplayedContent(streamingContent);
    };

    useEffect(() => {
        if (!isStreaming) return;

        const interval = setInterval(() => {
            setCurrentIndex(prev => {
                if (prev >= streamingContent.length) {
                    setIsStreaming(false);
                    return prev;
                }

                const nextIndex = prev + Math.floor(Math.random() * 3) + 1; // 随机速度
                const newContent = streamingContent.slice(0, Math.min(nextIndex, streamingContent.length));
                setDisplayedContent(newContent);

                return nextIndex;
            });
        }, 50); // 50ms间隔

        return () => clearInterval(interval);
    }, [isStreaming]);

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
                            开始流式渲染
                        </Button>
                        <Button
                            onClick={stopStreaming}
                            disabled={!isStreaming}
                            variant="outline"
                        >
                            立即完成
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
                    <p><strong>测试说明：</strong></p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>点击"开始流式渲染"按钮模拟AI实时回复</li>
                        <li>观察Markdown内容是否实时渲染，而不是等全部内容完成后才渲染</li>
                        <li>检查数字列表是否正确显示在同一行</li>
                        <li>验证代码块、粗体、斜体等格式是否正确渲染</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
