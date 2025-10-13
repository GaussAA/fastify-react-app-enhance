/**
 * 会话初始化钩子
 * 负责在应用启动时恢复用户会话状态
 */

import { useEffect } from 'react';
import { useLLMStore } from '../store/llm';

export function useSessionInitialization() {
  const {
    currentUserId,
    setCurrentUserId,
    loadUserSessions,
    syncWithBackend,
    isLoading,
    error,
  } = useLLMStore();

  useEffect(() => {
    const initializeSession = async () => {
      try {
        // 从localStorage获取用户ID
        const storedUserId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');

        if (storedUserId && token) {
          // 设置用户ID
          setCurrentUserId(storedUserId);

          // 加载用户会话
          await loadUserSessions(storedUserId);
        } else {
          // 清除无效的用户状态
          setCurrentUserId(null);
        }
      } catch (error) {
        console.error('会话初始化失败:', error);
      }
    };

    initializeSession();
  }, [setCurrentUserId, loadUserSessions]);

  // 监听用户登录状态变化
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userId' || e.key === 'token') {
        if (e.newValue) {
          // 用户登录
          const userId = localStorage.getItem('userId');
          if (userId && userId !== currentUserId) {
            setCurrentUserId(userId);
            loadUserSessions(userId);
          }
        } else {
          // 用户登出
          setCurrentUserId(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [currentUserId, setCurrentUserId, loadUserSessions]);

  return {
    currentUserId,
    isLoading,
    error,
    syncWithBackend,
  };
}
