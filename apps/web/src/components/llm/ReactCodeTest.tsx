/**
 * React代码高亮测试组件
 * 专门测试React/JSX代码的语法高亮效果
 */

import { MarkdownRenderer } from './MarkdownRenderer';

const reactCodeTestContent = `
# React代码高亮测试

这是一个**专门的React代码高亮测试**，用于验证React/JSX代码的语法高亮效果。

## 1. 代码生成和解释

我可以帮您生成各种编程语言的代码,比如:

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

## 2. 更复杂的React组件

\`\`\`javascript
// 用户管理组件
import React, { useState, useEffect } from 'react';

function UserManager() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    
    useEffect(() => {
        fetchUsers();
    }, []);
    
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/users');
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error('获取用户失败:', error);
        } finally {
            setLoading(false);
        }
    };
    
    const handleDeleteUser = (userId) => {
        setUsers(users.filter(user => user.id !== userId));
    };
    
    return (
        <div className="user-manager">
            <h2>用户管理</h2>
            {loading ? (
                <p>加载中...</p>
            ) : (
                <ul>
                    {users.map(user => (
                        <li key={user.id}>
                            {user.name} - {user.email}
                            <button onClick={() => handleDeleteUser(user.id)}>
                                删除
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default UserManager;
\`\`\`

## 3. TypeScript React组件

\`\`\`typescript
// TypeScript React组件
import React, { useState, useEffect } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    isActive: boolean;
}

interface UserManagerProps {
    apiUrl: string;
    onUserSelect?: (user: User) => void;
}

function UserManager({ apiUrl, onUserSelect }: UserManagerProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        fetchUsers();
    }, [apiUrl]);
    
    const fetchUsers = async (): Promise<void> => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(\`\${apiUrl}/users\`);
            if (!response.ok) {
                throw new Error(\`HTTP error! status: \${response.status}\`);
            }
            const data: User[] = await response.json();
            setUsers(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : '未知错误');
        } finally {
            setLoading(false);
        }
    };
    
    const handleUserClick = (user: User): void => {
        if (onUserSelect) {
            onUserSelect(user);
        }
    };
    
    if (loading) return <div>加载中...</div>;
    if (error) return <div>错误: {error}</div>;
    
    return (
        <div className="user-manager">
            <h2>用户列表</h2>
            <ul>
                {users.map(user => (
                    <li 
                        key={user.id}
                        onClick={() => handleUserClick(user)}
                        className={\`user-item \${user.isActive ? 'active' : 'inactive'}\`}
                    >
                        {user.name} ({user.email})
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default UserManager;
\`\`\`

## 4. 自定义Hook

\`\`\`javascript
// 自定义Hook
import { useState, useEffect } from 'react';

function useLocalStorage(key, initialValue) {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(\`Error reading localStorage key "\${key}":\`, error);
            return initialValue;
        }
    });
    
    const setValue = (value) => {
        try {
            setStoredValue(value);
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(\`Error setting localStorage key "\${key}":\`, error);
        }
    };
    
    return [storedValue, setValue];
}

// 使用自定义Hook
function MyComponent() {
    const [name, setName] = useLocalStorage('name', '');
    
    return (
        <div>
            <input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="输入您的姓名"
            />
            <p>您好, {name || '匿名用户'}!</p>
        </div>
    );
}
\`\`\`

---

*测试完成！所有React/JSX代码都应该有清晰的语法高亮和良好的对比度。*
`;

export function ReactCodeTest() {
    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    React代码高亮测试
                </h2>
                <div className="border-t border-gray-200 pt-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                        <MarkdownRenderer content={reactCodeTestContent} />
                    </div>
                </div>

                <div className="mt-6 p-4 bg-red-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-red-900 mb-2">
                        重点测试项目
                    </h3>
                    <ul className="text-sm text-red-800 space-y-1">
                        <li>🔍 <strong>字符串插值</strong>：<code>{count}</code>、<code>{setCount(count + 1)}</code> 应该与字符串颜色一致</li>
                        <li>🔍 <strong>注释对比度</strong>：<code>// 创建一个简单的React组件</code> 应该清晰可见</li>
                        <li>🔍 <strong>JSX表达式</strong>：<code>{user.name}</code>、<code>{user.email}</code> 应该有正确的颜色</li>
                        <li>🔍 <strong>模板字符串</strong>：<code>\`\${apiUrl}/users\`</code> 中的插值应该与字符串颜色一致</li>
                        <li>🔍 <strong>TypeScript类型</strong>：<code>User[]</code>、<code>boolean</code> 等应该有正确的颜色</li>
                        <li>🔍 <strong>函数参数</strong>：<code>userId</code>、<code>user</code> 等应该有正确的颜色</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
