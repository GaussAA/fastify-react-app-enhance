/**
 * 颜色和列表渲染测试组件
 * 专门测试修复后的颜色和列表渲染效果
 */

import React from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';

const colorTestContent = `
# 人工智能的三个层次

通俗地说，目标就是让机器能够像人一样思考、学习、决策和解决问题。它不是一个单一的技术，而是一个包含众多子领域的综合性学科。根据能力水平，AI通常被划分为：

1. **弱人工智能**：专注于完成特定领域的任务，是目前所有AI系统的形态。例如：人脸识别、语音助手、AlphaGo 下围棋。它很"聪明"，但只在特定领域。

2. **强人工智能**：具备与人类同等水平的智能，能够理解、学习和应用其智能来解决任何问题，具有自我意识和推理能力。目前尚未实现，是许多科研人员努力的方向。

3. **超人工智能**：超越人类智能的AI，能够进行创造性思维和复杂推理。这是AI发展的终极目标，但目前还只是理论概念。

## AI的研究和应用围绕以下几个核心分支展开：

1. **机器学习**：AI的核心驱动力。它不直接编程规则，而是让计算机通过分析大量数据来自动学习和改进。

2. **计算机视觉**：让机器能够"看懂"图像和视频。应用包括人脸识别、自动驾驶、医学影像分析等。

3. **自然语言处理**：让机器能够理解和生成人类语言。应用包括机器翻译、智能客服、文本摘要等。

4. **深度学习**：机器学习的一个重要分支，模仿人脑神经网络的结构。它在图像识别、语音识别和自然语言处理等领域取得了突破性进展。

## 测试要点

- 数字列表应该在同一行显示，不换行
- 所有文本应该有足够的对比度，易于阅读
- 列表项内容不应该超出消息框边界
- 颜色应该一致，没有浅灰色文本

---

*这个测试应该显示正确的颜色和列表格式。*
`;

export function ColorTest() {
    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    颜色和列表渲染修复测试
                </h2>
                <div className="border-t border-gray-200 pt-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                        <MarkdownRenderer content={colorTestContent} />
                    </div>
                </div>

                <div className="mt-4 text-sm text-gray-600">
                    <p><strong>修复要点：</strong></p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>数字列表（1. 2. 3.）后面的文本应该在同一行显示</li>
                        <li>所有文本应该是深灰色（#1f2937），不是浅灰色</li>
                        <li>列表项内容不应该超出消息框边界</li>
                        <li>文本应该有足够的对比度，易于阅读</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
