// 认证状态管理

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User, LoginData, RegisterData } from '@/types/auth';
import { apiClient } from '@/lib/api';

interface AuthStore extends AuthState {
  // Actions
  login: (data: LoginData) => Promise<void>;
  register: (
    data: RegisterData
  ) => Promise<{ user: User; token: string; refreshToken: string }>;
  logout: () => Promise<void>;
  logoutAllDevices: () => Promise<void>;
  refreshTokenAction: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (user: Partial<User>) => void;
  confirmAutoLogin: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (data: LoginData) => {
        set({ isLoading: true, error: null });

        try {
          const response = await apiClient.login(data);
          const { user, token, refreshToken } = response.data;

          // 保存到localStorage
          localStorage.setItem('accessToken', token);
          localStorage.setItem('refreshToken', refreshToken);
          localStorage.setItem('user', JSON.stringify(user));

          set({
            user,
            accessToken: token,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          console.error('登录失败:', error);

          // 清除本地存储
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');

          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.message || '登录失败' || 'Unknown error',
          });
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });

        try {
          const response = await apiClient.register(data);
          const { user, token, refreshToken } = response.data;

          // 注册成功，但不自动登录
          // 将认证信息临时保存，等待用户确认
          set({
            user,
            accessToken: token,
            refreshToken,
            isAuthenticated: false, // 不自动设置为已认证
            isLoading: false,
            error: null,
          });

          // 返回认证信息供确认对话框使用
          return { user, token, refreshToken };
        } catch (error: any) {
          console.error('注册失败:', error);

          // 清除本地存储
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');

          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.message || '注册失败' || 'Unknown error',
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });

        try {
          await apiClient.logout();
        } catch (error) {
          // 即使API调用失败，也要清除本地状态
          console.warn('Logout API call failed:', error || 'Unknown error');
        } finally {
          // 清除本地存储
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');

          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      logoutAllDevices: async () => {
        set({ isLoading: true });

        try {
          await apiClient.logoutAllDevices();
        } catch (error) {
          console.warn('Logout all devices API call failed:', error || 'Unknown error');
        } finally {
          // 清除本地存储
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');

          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      refreshTokenAction: async () => {
        const { refreshToken } = get();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        try {
          const response = await apiClient.refreshToken({ refreshToken });
          const { token, refreshToken: newRefreshToken } = response.data;

          // 更新localStorage
          localStorage.setItem('accessToken', token);
          localStorage.setItem('refreshToken', newRefreshToken);

          set({
            accessToken: token,
            refreshToken: newRefreshToken,
            error: null,
          });
        } catch (error: any) {
          console.error('Token刷新失败:', error || 'Unknown error');

          // 刷新失败，清除所有认证信息
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');

          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            error: error.message || 'Token刷新失败' || 'Unknown error',
          });
          throw error;
        }
      },

      getCurrentUser: async () => {
        set({ isLoading: true, error: null });

        try {
          const response = await apiClient.getCurrentUser();
          const { user } = response.data!;

          // 更新localStorage中的用户信息
          localStorage.setItem('user', JSON.stringify(user));

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          console.error('获取用户信息失败:', error || 'Unknown error');

          // 清除本地存储
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.message || '获取用户信息失败' || 'Unknown error',
          });
          throw error;
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      updateUser: (userData: Partial<User>) => {
        const { user } = get();
        if (user) {
          const updatedUser = { ...user, ...userData };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          set({ user: updatedUser });
        }
      },

      confirmAutoLogin: () => {
        const { user, accessToken, refreshToken } = get();
        if (user && accessToken && refreshToken) {
          // 保存到localStorage
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          localStorage.setItem('user', JSON.stringify(user));

          // 设置为已认证状态
          set({ isAuthenticated: true });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: state => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// 权限检查工具函数
export const hasPermission = (permission: string): boolean => {
  const { user } = useAuthStore.getState();
  if (!user || !user.permissions) return false;

  return user.permissions.some(p => p.name === permission);
};

export const hasRole = (roleName: string): boolean => {
  const { user } = useAuthStore.getState();
  if (!user || !user.roles) return false;

  return user.roles.some(r => r.name === roleName);
};

export const hasAnyRole = (roleNames: string[]): boolean => {
  const { user } = useAuthStore.getState();
  if (!user || !user.roles) return false;

  return user.roles.some(r => roleNames.includes(r.name));
};

export const hasAllRoles = (roleNames: string[]): boolean => {
  const { user } = useAuthStore.getState();
  if (!user || !user.roles) return false;

  return roleNames.every(roleName =>
    user.roles!.some(r => r.name === roleName)
  );
};
