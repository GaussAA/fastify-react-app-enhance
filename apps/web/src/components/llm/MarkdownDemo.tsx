/**
 * Markdown演示组件
 * 展示AI回复中的Markdown渲染效果
 */

import React from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';

const demoAIResponse = `
# 欢迎使用AI助手！

我是您的智能助手，可以帮您处理各种任务。以下是一些我支持的功能：

## 🚀 主要功能

### 1. 代码生成和解释
我可以帮您生成各种编程语言的代码，比如：

\`\`\`javascript
// 创建一个简单的React组件
import React, { useState } from 'react';

function Counter() {
    const [count, setCount] = useState(0);
    
    return (
        <div>
            <p>当前计数: {count}</p>
            <button onClick={() => setCount(count + 1)}>
                增加
            </button>
        </div>
    );
}

export default Counter;
\`\`\`

### 2. 数据分析
我可以帮您分析数据并提供见解：

| 指标 | 数值 | 趋势 |
|------|------|------|
| 用户增长 | +15% | 📈 上升 |
| 转化率 | 3.2% | 📊 稳定 |
| 满意度 | 4.8/5 | ⭐ 优秀 |

### 3. 问题解答
- **技术问题**: 我可以解答编程、系统设计等技术问题
- **业务咨询**: 提供商业策略和决策建议
- **学习指导**: 帮助您制定学习计划和路径

## 💡 使用技巧

1. **具体描述**: 请尽可能详细地描述您的需求
2. **提供上下文**: 包含相关的背景信息
3. **分步骤**: 对于复杂任务，可以分步骤进行

## 🔧 支持的格式

- ✅ **Markdown语法**: 完整的Markdown支持
- ✅ **代码高亮**: 多种编程语言语法高亮
- ✅ **表格**: 支持复杂表格结构
- ✅ **列表**: 有序、无序和任务列表
- ✅ **链接**: 外部链接和引用
- ✅ **图片**: 图片显示和优化

## 📞 联系支持

如果您有任何问题，请随时联系我们的技术支持团队：

> **注意**: 我们提供7x24小时技术支持服务，确保您的问题能够得到及时解决。

---

*感谢您选择我们的AI助手服务！* 🎉
`;

export function MarkdownDemo() {
    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">AI</span>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">AI助手</h2>
                        <p className="text-sm text-gray-500">刚刚</p>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <MarkdownRenderer content={demoAIResponse} />
                </div>
            </div>
        </div>
    );
}
