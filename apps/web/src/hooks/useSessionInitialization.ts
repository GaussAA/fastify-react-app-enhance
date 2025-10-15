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
        // 从localStorage获取用户信息和token
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('accessToken');

        if (storedUser && token) {
          try {
            const user = JSON.parse(storedUser);
            const userId = user.id?.toString();

            if (userId) {
              // 设置用户ID
              setCurrentUserId(userId);

              // 加载用户会话
              await loadUserSessions(userId);
            } else {
              console.warn('用户对象中没有有效的ID');
              setCurrentUserId(null);
            }
          } catch (parseError) {
            console.error('解析用户信息失败:', parseError);
            setCurrentUserId(null);
          }
        } else {
          // 清除无效的用户状态
          setCurrentUserId(null);
        }
      } catch (error) {
        console.error('会话初始化失败:', error);
        setCurrentUserId(null);
      }
    };

    initializeSession();
  }, [setCurrentUserId, loadUserSessions]);

  // 监听用户登录状态变化
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user' || e.key === 'accessToken') {
        if (e.newValue) {
          // 用户登录
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            try {
              const user = JSON.parse(storedUser);
              const userId = user.id?.toString();
              if (userId && userId !== currentUserId) {
                setCurrentUserId(userId);
                loadUserSessions(userId);
              }
            } catch (parseError) {
              console.error('解析用户信息失败:', parseError);
            }
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
