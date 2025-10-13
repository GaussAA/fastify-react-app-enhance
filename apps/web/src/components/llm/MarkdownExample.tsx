/**
 * Markdown渲染使用示例
 * 展示如何在不同场景下使用MarkdownRenderer组件
 */

import React from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';

// 示例1: 简单的AI回复
const simpleAIResponse = `
你好！我是你的AI助手。

我可以帮你：
- 回答问题
- 生成代码
- 分析数据

有什么我可以帮助你的吗？
`;

// 示例2: 包含代码的回复
const codeExampleResponse = `
## 代码示例

这里是一个简单的JavaScript函数：

\`\`\`javascript
function greetUser(name) {
    return \`Hello, \${name}! Welcome to our platform.\`;
}

// 使用示例
const message = greetUser('张三');
console.log(message); // 输出: Hello, 张三! Welcome to our platform.
\`\`\`

这个函数接受一个用户名参数，返回个性化的问候语。
`;

// 示例3: 包含表格的回复
const tableExampleResponse = `
## 数据对比

| 功能 | 免费版 | 专业版 | 企业版 |
|------|--------|--------|--------|
| 用户数量 | 1-5人 | 6-50人 | 无限制 |
| 存储空间 | 1GB | 10GB | 100GB |
| 技术支持 | 邮件 | 电话+邮件 | 专属客服 |
| 价格 | 免费 | ¥99/月 | 定制 |

**推荐**: 对于小团队，专业版是最佳选择。
`;

// 示例4: 包含链接和引用的回复
const linkExampleResponse = `
## 有用的资源

以下是一些你可能感兴趣的链接：

- [React官方文档](https://react.dev/)
- [TypeScript手册](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/)

> **提示**: 建议先阅读官方文档，然后查看社区教程。

---

*希望这些资源对你有帮助！*
`;

export function MarkdownExample() {
    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Markdown渲染使用示例
                </h1>
                <p className="text-gray-600">
                    展示MarkdownRenderer组件在不同场景下的使用效果
                </p>
            </div>

            {/* 示例1: 简单回复 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    示例1: 简单AI回复
                </h2>
                <div className="bg-gray-50 rounded-lg p-4">
                    <MarkdownRenderer content={simpleAIResponse} />
                </div>
            </div>

            {/* 示例2: 代码示例 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    示例2: 包含代码的回复
                </h2>
                <div className="bg-gray-50 rounded-lg p-4">
                    <MarkdownRenderer content={codeExampleResponse} />
                </div>
            </div>

            {/* 示例3: 表格示例 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    示例3: 包含表格的回复
                </h2>
                <div className="bg-gray-50 rounded-lg p-4">
                    <MarkdownRenderer content={tableExampleResponse} />
                </div>
            </div>

            {/* 示例4: 链接和引用 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    示例4: 包含链接和引用的回复
                </h2>
                <div className="bg-gray-50 rounded-lg p-4">
                    <MarkdownRenderer content={linkExampleResponse} />
                </div>
            </div>

            {/* 使用说明 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">
                    💡 使用说明
                </h3>
                <div className="text-blue-800 space-y-2">
                    <p>
                        <strong>基本用法:</strong> 直接传入Markdown文本内容即可
                    </p>
                    <p>
                        <strong>流式处理:</strong> 设置 <code>isStreaming</code> 属性为 <code>true</code>
                    </p>
                    <p>
                        <strong>自定义样式:</strong> 通过 <code>className</code> 属性添加自定义样式
                    </p>
                </div>
            </div>
        </div>
    );
}
