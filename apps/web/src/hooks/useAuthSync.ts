/**
 * 认证状态同步钩子
 * 负责同步认证状态和LLM store的用户ID
 */

import { useEffect } from 'react';
import { useAuthStore } from '../store/auth';
import { useLLMStore } from '../store/llm';

export function useAuthSync() {
    const { user, isAuthenticated, accessToken } = useAuthStore();
    const { setCurrentUserId, currentUserId } = useLLMStore();

    useEffect(() => {
        if (isAuthenticated && user && accessToken) {
            // 用户已认证，同步用户ID到LLM store
            const userId = user.id?.toString();
            if (userId && userId !== currentUserId) {
                console.log('🔄 同步认证状态到LLM store:', userId);
                setCurrentUserId(userId);
            }
        } else {
            // 用户未认证，清除LLM store中的用户ID
            if (currentUserId) {
                console.log('🔄 清除LLM store中的用户ID');
                setCurrentUserId(null);
            }
        }
    }, [isAuthenticated, user, accessToken, currentUserId, setCurrentUserId]);

    return {
        isAuthenticated,
        user,
        currentUserId,
    };
}
