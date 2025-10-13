/**
 * 代码高亮测试组件
 * 专门测试各种编程语言的语法高亮效果
 */

import { MarkdownRenderer } from './MarkdownRenderer';

const codeHighlightTestContent = `
# 代码高亮测试

这是一个**全面的代码高亮测试**，用于验证各种编程语言的语法高亮效果。

## JavaScript代码测试

\`\`\`javascript
// JavaScript代码示例
function greet(name) {
    console.log(\`Hello, \${name}!\`);
    return \`Welcome, \${name}!\`;
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

greet('World');
\`\`\`

## Python代码测试

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

# 计算前10个斐波那契数
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")
\`\`\`

## TypeScript代码测试

\`\`\`typescript
// TypeScript代码示例
interface User {
    id: number;
    name: string;
    email: string;
    isActive: boolean;
}

interface ApiResponse<T> {
    data: T;
    status: number;
    message: string;
}

class UserManager {
    private users: User[] = [];
    
    constructor(private apiClient: ApiClient) {}
    
    async fetchUser(id: number): Promise<ApiResponse<User>> {
        try {
            const response = await this.apiClient.get<User>(\`/users/\${id}\`);
            return {
                data: response,
                status: 200,
                message: 'Success'
            };
        } catch (error) {
            throw new Error(\`Failed to fetch user \${id}: \${error.message}\`);
        }
    }
    
    addUser(user: Omit<User, 'id'>): User {
        const newUser: User = {
            id: this.users.length + 1,
            ...user
        };
        this.users.push(newUser);
        return newUser;
    }
}
\`\`\`

## SQL代码测试

\`\`\`sql
-- SQL查询示例
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

## HTML代码测试

\`\`\`html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>代码高亮测试</title>
    <style>
        .code-block {
            background: #1e1e1e;
            color: #d4d4d4;
            padding: 1rem;
            border-radius: 8px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>代码高亮测试</h1>
        <div class="code-block">
            <p>这是一个代码块示例</p>
        </div>
    </div>
    
    <script>
        // JavaScript代码
        function init() {
            console.log('页面初始化完成');
        }
        
        document.addEventListener('DOMContentLoaded', init);
    </script>
</body>
</html>
\`\`\`

## CSS代码测试

\`\`\`css
/* CSS代码示例 */
.markdown-code-block {
    background: #1e1e1e !important;
    color: #d4d4d4 !important;
    border-radius: 8px;
    padding: 1rem;
    overflow-x: auto;
    font-size: 14px;
    margin-bottom: 1rem;
    border: 1px solid #374151;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}

/* 语法高亮样式 */
.markdown-code-block .hljs-keyword {
    color: #569cd6 !important;
    font-weight: bold;
}

.markdown-code-block .hljs-string {
    color: #ce9178 !important;
}

.markdown-code-block .hljs-comment {
    color: #6a9955 !important;
    font-style: italic;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .markdown-code-block {
        font-size: 12px;
        padding: 0.75rem;
    }
}
\`\`\`

## JSON代码测试

\`\`\`json
{
    "name": "代码高亮测试",
    "version": "1.0.0",
    "description": "测试各种编程语言的语法高亮效果",
    "main": "index.js",
    "scripts": {
        "start": "node index.js",
        "test": "jest",
        "build": "webpack --mode production"
    },
    "dependencies": {
        "react": "^18.2.0",
        "react-dom": "^18.2.0",
        "highlight.js": "^11.9.0"
    },
    "devDependencies": {
        "@types/react": "^18.2.0",
        "typescript": "^5.0.0",
        "webpack": "^5.0.0"
    },
    "keywords": [
        "syntax-highlighting",
        "code",
        "markdown",
        "react"
    ],
    "author": "开发者",
    "license": "MIT"
}
\`\`\`

---

*测试完成！所有代码块都应该有清晰的语法高亮和良好的对比度。*
`;

export function CodeHighlightTest() {
    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    代码高亮测试
                </h2>
                <div className="border-t border-gray-200 pt-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                        <MarkdownRenderer content={codeHighlightTestContent} />
                    </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">
                        测试要点
                    </h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>✅ 字符串插值：JavaScript模板字符串和Python f-string中的插值部分应该与字符串颜色一致</li>
                        <li>✅ 注释：应该有足够的对比度，清晰可读</li>
                        <li>✅ 关键字：蓝色高亮，加粗显示</li>
                        <li>✅ 字符串：橙色高亮，与插值部分颜色一致</li>
                        <li>✅ 变量名：浅蓝色，清晰可见</li>
                        <li>✅ 数字：浅绿色，清晰可见</li>
                        <li>✅ 函数名：黄色，清晰可见</li>
                        <li>✅ 运算符：浅灰色，清晰可见</li>
                        <li>✅ 所有元素都应该有良好的对比度</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
