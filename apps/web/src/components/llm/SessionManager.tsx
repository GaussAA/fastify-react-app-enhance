/**
 * 会话管理组件
 * 显示用户登录状态和会话管理功能
 */

import { useState } from 'react';
import { User, LogIn, LogOut, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSessionInitialization } from '@/hooks/useSessionInitialization';
import { useLLMStore } from '@/store/llm';

export function SessionManager() {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const { currentUserId, syncWithBackend } = useSessionInitialization();
    const { sessions, currentSession, isLoading } = useLLMStore();

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await syncWithBackend();
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleLogin = () => {
        // 这里应该跳转到登录页面或打开登录模态框
        // 暂时使用模拟登录
        const mockUserId = `user_${Date.now()}`;
        localStorage.setItem('userId', mockUserId);
        localStorage.setItem('token', 'mock_token');
        window.location.reload();
    };

    const handleLogout = () => {
        localStorage.removeItem('userId');
        localStorage.removeItem('token');
        window.location.reload();
    };

    if (!currentUserId) {
        return (
            <div className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <LogIn className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">请先登录以使用AI对话功能</span>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={handleLogin}
                    className="ml-auto"
                >
                    登录
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* 用户状态 */}
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                        用户: {currentUserId}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                        已登录
                    </Badge>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleRefresh}
                        disabled={isRefreshing || isLoading}
                    >
                        <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleLogout}
                    >
                        <LogOut className="h-3 w-3" />
                    </Button>
                </div>
            </div>

            {/* 会话统计 */}
            <div className="flex items-center justify-between text-sm text-gray-600">
                <span>会话总数: {sessions.length}</span>
                {currentSession && (
                    <span>当前会话: {currentSession.title}</span>
                )}
            </div>
        </div>
    );
}
