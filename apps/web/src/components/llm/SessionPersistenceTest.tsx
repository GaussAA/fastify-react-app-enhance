/**
 * 会话持久化测试组件
 * 用于测试会话创建、保存和恢复功能
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLLMStore } from '@/store/llm';
import { useSessionInitialization } from '@/hooks/useSessionInitialization';

export function SessionPersistenceTest() {
    const [testResults, setTestResults] = useState<string[]>([]);
    const { currentUserId } = useSessionInitialization();
    const {
        sessions,
        currentSession,
        createSession,
        loadUserSessions,
        syncWithBackend,
        isLoading,
        error
    } = useLLMStore();

    const addTestResult = (result: string) => {
        setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
    };

    const testCreateSession = async () => {
        try {
            addTestResult('开始测试创建会话...');
            await createSession('测试会话');
            addTestResult('✅ 会话创建成功');
        } catch (error: any) {
            addTestResult(`❌ 会话创建失败: ${error.message}`);
        }
    };

    const testLoadSessions = async () => {
        if (!currentUserId) {
            addTestResult('❌ 用户未登录，无法测试加载会话');
            return;
        }

        try {
            addTestResult('开始测试加载用户会话...');
            await loadUserSessions(currentUserId);
            addTestResult(`✅ 加载会话成功，共 ${sessions.length} 个会话`);
        } catch (error: any) {
            addTestResult(`❌ 加载会话失败: ${error.message}`);
        }
    };

    const testSyncWithBackend = async () => {
        try {
            addTestResult('开始测试同步后端数据...');
            await syncWithBackend();
            addTestResult('✅ 同步后端数据成功');
        } catch (error: any) {
            addTestResult(`❌ 同步后端数据失败: ${error.message}`);
        }
    };

    const testLocalStorage = () => {
        try {
            addTestResult('开始测试本地存储...');
            const storedData = localStorage.getItem('llm-store');
            if (storedData) {
                const parsed = JSON.parse(storedData);
                addTestResult(`✅ 本地存储数据存在，包含 ${parsed.state?.sessions?.length || 0} 个会话`);
            } else {
                addTestResult('❌ 本地存储数据不存在');
            }
        } catch (error: any) {
            addTestResult(`❌ 本地存储测试失败: ${error.message}`);
        }
    };

    const simulatePageRefresh = () => {
        addTestResult('模拟页面刷新...');
        window.location.reload();
    };

    const clearTestResults = () => {
        setTestResults([]);
    };

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>会话持久化测试</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* 当前状态 */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-medium mb-2">当前状态</h4>
                            <div className="space-y-1 text-sm">
                                <div>用户ID: {currentUserId || '未登录'}</div>
                                <div>会话数量: {sessions.length}</div>
                                <div>当前会话: {currentSession?.title || '无'}</div>
                                <div>加载状态: {isLoading ? '加载中' : '空闲'}</div>
                                {error && <div className="text-red-600">错误: {error}</div>}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-medium mb-2">会话列表</h4>
                            <div className="space-y-1 max-h-32 overflow-y-auto">
                                {sessions.map(session => (
                                    <div key={session.id} className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-xs">
                                            {session.id.slice(-8)}
                                        </Badge>
                                        <span className="text-xs truncate">{session.title}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 测试按钮 */}
                    <div className="grid grid-cols-2 gap-2">
                        <Button onClick={testCreateSession} disabled={isLoading}>
                            测试创建会话
                        </Button>
                        <Button onClick={testLoadSessions} disabled={isLoading || !currentUserId}>
                            测试加载会话
                        </Button>
                        <Button onClick={testSyncWithBackend} disabled={isLoading}>
                            测试同步后端
                        </Button>
                        <Button onClick={testLocalStorage} variant="outline">
                            测试本地存储
                        </Button>
                        <Button onClick={simulatePageRefresh} variant="destructive">
                            模拟页面刷新
                        </Button>
                        <Button onClick={clearTestResults} variant="outline">
                            清空测试结果
                        </Button>
                    </div>

                    {/* 测试结果 */}
                    <div>
                        <h4 className="font-medium mb-2">测试结果</h4>
                        <div className="bg-gray-50 p-3 rounded-lg max-h-48 overflow-y-auto">
                            {testResults.length === 0 ? (
                                <div className="text-gray-500 text-sm">暂无测试结果</div>
                            ) : (
                                <div className="space-y-1">
                                    {testResults.map((result, index) => (
                                        <div key={index} className="text-sm font-mono">
                                            {result}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
