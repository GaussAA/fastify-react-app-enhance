/**
 * 认证相关工具函数
 * 基于 localStorage 的认证状态管理
 */

import { STORAGE_KEYS } from '@/utils/constants';

/**
 * 获取认证 token
 */
export function getAuthToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
}

/**
 * 设置认证 token
 */
export function setAuthToken(token: string): void {
  localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
}

/**
 * 移除认证 token
 */
export function removeAuthToken(): void {
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
}

/**
 * 检查是否已登录
 */
export function isAuthenticated(): boolean {
  const token = getAuthToken();
  return !!token;
}

/**
 * 获取用户信息
 */
export function getUserInfo(): any | null {
  const userInfo = localStorage.getItem(STORAGE_KEYS.USER_INFO);
  return userInfo ? JSON.parse(userInfo) : null;
}

/**
 * 设置用户信息
 */
export function setUserInfo(userInfo: any): void {
  localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo));
}

/**
 * 清除用户信息
 */
export function clearUserInfo(): void {
  localStorage.removeItem(STORAGE_KEYS.USER_INFO);
}

/**
 * 登出
 */
export function logout(): void {
  removeAuthToken();
  clearUserInfo();
  window.location.href = '/login';
}
