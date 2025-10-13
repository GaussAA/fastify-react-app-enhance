/**
 * Markdown渲染测试组件
 * 用于测试各种Markdown格式的渲染效果
 */

import { MarkdownRenderer } from './MarkdownRenderer';
import { MarkdownDemo } from './MarkdownDemo';
import { ListTest } from './ListTest';
import { StreamingTest } from './StreamingTest';
import { ColorTest } from './ColorTest';
import { TitleCodeTest } from './TitleCodeTest';
import { ComprehensiveTest } from './ComprehensiveTest';
import { ContrastTest } from './ContrastTest';
import { CodeHighlightTest } from './CodeHighlightTest';
import { ReactCodeTest } from './ReactCodeTest';

const testMarkdownContent = `
# Markdown渲染测试

这是一个**完整的Markdown渲染测试**，包含各种常用语法。

## 文本格式

- **粗体文本**
- *斜体文本*
- ~~删除线文本~~
- \`内联代码\`
- [链接示例](https://example.com)

## 列表

### 无序列表
- 项目 1
- 项目 2
  - 子项目 2.1
  - 子项目 2.2
- 项目 3

### 有序列表
1. 第一步
2. 第二步
3. 第三步

### 任务列表
- [x] 已完成的任务
- [ ] 未完成的任务
- [x] 另一个已完成的任务

## 代码块

### JavaScript代码
\`\`\`javascript
function greet(name) {
    console.log(\`Hello, \${name}!\`);
    return \`Welcome, \${name}!\`;
}

greet('World');
\`\`\`

### Python代码
\`\`\`python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# 计算前10个斐波那契数
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")
\`\`\`

### SQL代码
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

## 引用块

> 这是一个引用块的示例。
> 
> 它可以包含多行文本，并且会以特殊的样式显示。
> 
> > 这是嵌套的引用块。

## 表格

| 功能 | 支持状态 | 说明 |
|------|----------|------|
| 标题 | ✅ | 支持1-6级标题 |
| 列表 | ✅ | 支持有序、无序和任务列表 |
| 代码 | ✅ | 支持内联代码和代码块 |
| 表格 | ✅ | 支持完整表格语法 |
| 链接 | ✅ | 支持外部链接 |
| 图片 | ✅ | 支持图片显示 |
| 引用 | ✅ | 支持引用块 |

## 分隔线

---

## 数学公式（如果支持）

行内公式：$E = mc^2$

块级公式：
$$
\\sum_{i=1}^{n} x_i = x_1 + x_2 + \\cdots + x_n
$$

## 总结

这个Markdown渲染器支持：

1. **完整的Markdown语法**
2. **代码高亮**
3. **响应式设计**
4. **良好的可读性**
5. **流式处理支持**

---

*测试完成！*
`;

export function MarkdownTest() {
    return (
        <div className="h-full overflow-y-auto p-6 space-y-6">
            {/* React代码高亮测试 */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                    React代码高亮测试（最新修复）
                </h2>
                <ReactCodeTest />
            </div>

            {/* 代码高亮测试 */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                    代码高亮测试（最新修复）
                </h2>
                <CodeHighlightTest />
            </div>

            {/* 对比度测试 */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                    对比度测试（最新修复）
                </h2>
                <ContrastTest />
            </div>

            {/* 全面渲染测试 */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                    全面渲染测试（推荐）
                </h2>
                <ComprehensiveTest />
            </div>

            {/* 标题和代码高亮修复测试 */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                    标题和代码高亮修复测试
                </h2>
                <TitleCodeTest />
            </div>

            {/* 颜色和列表修复测试 */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                    颜色和列表渲染修复测试
                </h2>
                <ColorTest />
            </div>

            {/* 实时流式渲染测试 */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                    实时流式Markdown渲染测试
                </h2>
                <StreamingTest />
            </div>

            {/* 列表渲染测试 */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                    列表渲染测试（修复数字列表换行问题）
                </h2>
                <ListTest />
            </div>

            {/* AI回复演示 */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                    AI回复Markdown渲染演示
                </h2>
                <MarkdownDemo />
            </div>

            {/* 完整语法测试 */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                    完整Markdown语法测试
                </h2>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <MarkdownRenderer content={testMarkdownContent} />
                </div>
            </div>
        </div>
    );
}
