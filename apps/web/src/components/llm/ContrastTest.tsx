/**
 * 对比度测试组件
 * 专门测试所有元素的对比度和可读性
 */

import { MarkdownRenderer } from './MarkdownRenderer';

const contrastTestContent = `
# 对比度测试

这是一个**全面的对比度测试**，用于验证所有元素的显示效果。

## 引用块测试

> 这是一个引用块的测试。引用块应该有浅色背景和深色文字，确保良好的对比度。
> 
> 引用块可以包含**粗体文本**和*斜体文本*，以及[链接](https://example.com)。
> 
> 引用块还应该支持多行内容，并且每行都应该清晰可读。

## 表格测试

| 功能 | 支持状态 | 说明 |
|------|----------|------|
| 列表 | ✅ | 支持有序、无序和任务列表 |
| 代码高亮 | ✅ | 支持多种编程语言的语法高亮 |
| 表格 | ✅ | 支持复杂的表格结构 |
| 链接 | ✅ | 支持外部链接和内部链接 |
| 引用块 | ✅ | 支持多行引用内容 |
| 强调文本 | ✅ | 支持粗体、斜体、删除线 |

## 强调文本测试

- **粗体文本**：应该清晰可见，有足够的对比度
- *斜体文本*：应该清晰可见，有足够的对比度
- ***粗斜体文本***：应该清晰可见，有足够的对比度
- ~~删除线文本~~：应该清晰可见，有足够的对比度

## 链接测试

这里有一些链接示例：
- [GitHub仓库](https://github.com/example/repo)
- [官方文档](https://docs.example.com)
- [API参考](https://api.example.com/docs)

## 代码测试

### 内联代码
这里有一些内联代码：\`useState\`、\`useEffect\`、\`async/await\`、\`const response = await fetch()\`

### 代码块
\`\`\`javascript
// 这是一个JavaScript代码示例
function processData(data) {
    const result = data.map(item => ({
        id: item.id,
        name: item.name.toUpperCase(),
        status: item.active ? 'active' : 'inactive'
    }));
    
    return result.filter(item => item.status === 'active');
}
\`\`\`

## 列表测试

### 无序列表
- 第一项内容
- 第二项内容
  - 嵌套项目1
  - 嵌套项目2
- 第三项内容

### 有序列表
1. 第一步：初始化项目
2. 第二步：配置环境
3. 第三步：开发功能
4. 第四步：测试验证
5. 第五步：部署上线

### 任务列表
- [x] 完成代码高亮修复
- [x] 修复标题颜色问题
- [x] 优化表格样式
- [x] 修复链接颜色
- [x] 修复引用块样式
- [ ] 添加更多测试用例
- [ ] 优化响应式设计

---

*测试完成！所有元素都应该有良好的对比度和可读性。*
`;

export function ContrastTest() {
    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    对比度测试
                </h2>
                <div className="border-t border-gray-200 pt-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                        <MarkdownRenderer content={contrastTestContent} />
                    </div>
                </div>

                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-900 mb-2">
                        测试要点
                    </h3>
                    <ul className="text-sm text-green-800 space-y-1">
                        <li>✅ 引用块：浅色背景，深色文字，清晰可读</li>
                        <li>✅ 表格：表头深色，单元格浅色背景，文字清晰</li>
                        <li>✅ 链接：蓝色链接，悬停时有下划线</li>
                        <li>✅ 强调文本：粗体、斜体、删除线都清晰可见</li>
                        <li>✅ 代码高亮：深色背景，明亮的语法高亮</li>
                        <li>✅ 内联代码：明显的背景色和边框</li>
                        <li>✅ 列表：数字和项目符号与文本在同一行</li>
                        <li>✅ 标题：深黑色，高对比度</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
