/**
 * 列表渲染测试组件
 * 专门测试数字列表和项目符号列表的渲染效果
 */

import React from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';

const listTestContent = `
# 列表渲染测试

## 数字列表测试

1. 弱人工智能：专注于完成特定领域的任务，是当前AI的主流形态。
2. 强人工智能：具备与人类同等水平的智能，能够理解、学习和应用其智能来解决任何问题。
3. 超人工智能：超越人类智能的AI，能够进行创造性思维和复杂推理。

## 项目符号列表测试

- 特点：专注于完成特定领域的任务，是当前AI的主流形态。
- 例子：图像识别软件、语音助手(如Siri、小爱同学)、围棋程序AlphaGo。
- 现状：目前尚未实现，是许多科研人员努力的方向。

## 嵌套列表测试

1. 第一级项目
   - 第二级项目A
   - 第二级项目B
     1. 第三级项目1
     2. 第三级项目2
2. 另一个第一级项目
   - 另一个第二级项目

## 任务列表测试

- [x] 已完成的任务
- [ ] 未完成的任务
- [x] 另一个已完成的任务

## 混合内容测试

1. **粗体文本**：这是粗体文本
2. *斜体文本*：这是斜体文本
3. \`内联代码\`：这是内联代码
4. [链接示例](https://example.com)：这是一个链接

## 长文本测试

1. 这是一个很长的列表项，包含多个句子。它应该正确显示在数字后面，而不是换行显示。这样可以确保列表的可读性和美观性。
2. 另一个长列表项，同样应该在同一行显示，不应该出现换行问题。这样可以保持列表的整洁和一致性。
`;

export function ListTest() {
    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    列表渲染测试
                </h2>
                <div className="border-t border-gray-200 pt-4">
                    <MarkdownRenderer content={listTestContent} />
                </div>
            </div>
        </div>
    );
}
