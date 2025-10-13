/**
 * 标题和代码高亮测试组件
 * 专门测试修复后的标题颜色和代码高亮效果
 */

import React from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';

const titleCodeTestContent = `
# 一、什么是人工智能？

通俗地说，目标就是让机器能够像人一样思考、学习、决策和解决问题。它不是一个单一的技术，而是一个包含众多子领域的综合性学科。

## 二、人工智能的三个层次

根据能力水平，AI通常被划分为：

1. **弱人工智能**：专注于完成特定领域的任务，是目前所有AI系统的形态。例如：人脸识别、语音助手、AlphaGo 下围棋。它很"聪明"，但只在特定领域。

2. **强人工智能**：具备与人类同等水平的智能，能够理解、学习和应用其智能来解决任何问题，具有自我意识和推理能力。目前尚未实现，是许多科研人员努力的方向。

3. **超人工智能**：超越人类智能的AI，能够进行创造性思维和复杂推理。这是AI发展的终极目标，但目前还只是理论概念。

### 三、AI的核心分支

AI的研究和应用围绕以下几个核心分支展开：

#### 1. 机器学习
机器学习是AI的核心驱动力。它不直接编程规则，而是让计算机通过分析大量数据来自动学习和改进。

#### 2. 计算机视觉
让机器能够"看懂"图像和视频。应用包括人脸识别、自动驾驶、医学影像分析等。

## 代码示例

以下是一个简单的React组件：

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

### Python代码示例

\`\`\`python
def fibonacci(n):
    """计算斐波那契数列的第n项"""
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# 计算前10个斐波那契数
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")
\`\`\`

### SQL查询示例

\`\`\`sql
SELECT 
    u.name,
    u.email,
    COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at >= '2024-01-01'
GROUP BY u.id, u.name, u.email
HAVING COUNT(o.id) > 0
ORDER BY order_count DESC;
\`\`\`

## 内联代码测试

这里有一些内联代码：\`useState\`、\`setCount\`、\`onClick\` 等。

---

*测试要点：*
- 标题应该有足够的对比度，清晰可见
- 代码块应该有良好的语法高亮和对比度
- 内联代码应该有明显的背景色和边框
`;

export function TitleCodeTest() {
    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    标题和代码高亮修复测试
                </h2>
                <div className="border-t border-gray-200 pt-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                        <MarkdownRenderer content={titleCodeTestContent} />
                    </div>
                </div>

                <div className="mt-4 text-sm text-gray-600">
                    <p><strong>修复要点：</strong></p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>标题（# ## ###）应该是深黑色，有足够的对比度</li>
                        <li>代码块应该有深色背景和明亮的语法高亮</li>
                        <li>关键字应该是蓝色，字符串是橙色，注释是绿色</li>
                        <li>内联代码应该有明显的背景色和边框</li>
                        <li>所有文本都应该清晰可读</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
