/**
 * 全面渲染测试组件
 * 测试所有Markdown元素的渲染效果，包括代码高亮、表格、链接等
 */

import { MarkdownRenderer } from './MarkdownRenderer';

const comprehensiveTestContent = `
# 全面渲染测试

这是一个**全面的Markdown渲染测试**，用于验证所有元素的显示效果。

## 代码高亮测试

### JavaScript代码
\`\`\`javascript
// 简单的AI响应处理
function processAIResponse(response) {
    return {
        content: response,
        timestamp: new Date(),
        type: 'ai'
    };
}

// 异步函数示例
async function fetchUserData(userId) {
    try {
        const response = await fetch(\`/api/users/\${userId}\`);
        const userData = await response.json();
        return userData;
    } catch (error) {
        console.error('获取用户数据失败:', error);
        throw error;
    }
}

// 类定义示例
class UserService {
    constructor(apiClient) {
        this.apiClient = apiClient;
    }
    
    async getUser(id) {
        return await this.apiClient.get(\`/users/\${id}\`);
    }
}
\`\`\`

### Python代码
\`\`\`python
# Python代码示例
import asyncio
from typing import List, Dict, Optional

class DataProcessor:
    def __init__(self, config: Dict[str, str]):
        self.config = config
        self.cache = {}
    
    async def process_data(self, data: List[Dict]) -> Optional[Dict]:
        """处理数据并返回结果"""
        if not data:
            return None
            
        processed = []
        for item in data:
            if item.get('status') == 'active':
                processed.append(self._transform_item(item))
        
        return {
            'processed_count': len(processed),
            'data': processed
        }
    
    def _transform_item(self, item: Dict) -> Dict:
        return {
            'id': item['id'],
            'name': item['name'].upper(),
            'timestamp': item.get('created_at', 'unknown')
        }
\`\`\`

### SQL查询
\`\`\`sql
-- 复杂SQL查询示例
SELECT 
    u.id,
    u.name,
    u.email,
    COUNT(o.id) as order_count,
    SUM(o.total_amount) as total_spent,
    MAX(o.created_at) as last_order_date
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at >= '2024-01-01'
    AND u.status = 'active'
    AND (o.status = 'completed' OR o.status IS NULL)
GROUP BY u.id, u.name, u.email
HAVING COUNT(o.id) > 0
ORDER BY total_spent DESC
LIMIT 100;
\`\`\`

## 表格测试

| 功能 | 状态 | 优先级 | 负责人 | 完成时间 |
|------|------|--------|--------|----------|
| 用户认证 | ✅ 完成 | 高 | 张三 | 2024-01-15 |
| 数据同步 | 🔄 进行中 | 中 | 李四 | 2024-02-01 |
| 报表生成 | ⏳ 待开始 | 低 | 王五 | 2024-02-15 |
| API接口 | ✅ 完成 | 高 | 赵六 | 2024-01-20 |

## 链接测试

这里有一些链接示例：
- [GitHub仓库](https://github.com/example/repo)
- [官方文档](https://docs.example.com)
- [API参考](https://api.example.com/docs)

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

## 引用块测试

> 这是一个引用块的示例。引用块应该有不同的背景色和左边框，以区别于普通文本。
> 
> 引用块可以包含多行内容，并且支持**粗体**和*斜体*等格式。

## 内联代码测试

这里有一些内联代码：\`useState\`、\`useEffect\`、\`async/await\`、\`const response = await fetch()\`

## 强调文本测试

- **粗体文本**：重要信息
- *斜体文本*：强调内容
- ***粗斜体文本***：特别重要
- ~~删除线文本~~：已删除内容

## 分隔线测试

上面的内容

---

下面的内容

## 任务列表测试

- [x] 完成代码高亮修复
- [x] 修复标题颜色问题
- [x] 优化表格样式
- [x] 修复链接颜色
- [ ] 添加更多测试用例
- [ ] 优化响应式设计

---

*测试完成！所有元素都应该有良好的对比度和可读性。*
`;

export function ComprehensiveTest() {
    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    全面渲染测试
                </h2>
                <div className="border-t border-gray-200 pt-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                        <MarkdownRenderer content={comprehensiveTestContent} />
                    </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">
                        测试要点
                    </h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>✅ 代码高亮：注释、关键字、字符串、变量名都应该清晰可见</li>
                        <li>✅ 标题：所有级别的标题都应该是深黑色，对比度足够</li>
                        <li>✅ 表格：表头、单元格、边框都应该清晰可见</li>
                        <li>✅ 链接：应该有明显的蓝色，悬停时有下划线</li>
                        <li>✅ 列表：数字和项目符号应该与文本在同一行</li>
                        <li>✅ 引用块：应该有背景色和左边框</li>
                        <li>✅ 内联代码：应该有背景色和边框</li>
                        <li>✅ 强调文本：粗体、斜体、删除线都应该清晰</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
