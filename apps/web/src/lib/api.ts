// API客户端配置和请求处理

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse, AuthResult, LoginData, RegisterData, RefreshTokenData, User, Role, Permission, UserSession, AuditLog, PaginatedResponse } from '@/types/auth';

class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api';

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // 请求拦截器 - 添加认证token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // 响应拦截器 - 处理token刷新
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              const response = await this.refreshToken({ refreshToken });
              const { token } = response.data;

              localStorage.setItem('accessToken', token);
              originalRequest.headers.Authorization = `Bearer ${token}`;

              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // 刷新失败，清除本地存储并跳转到登录页
            this.clearAuth();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private clearAuth() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  // 通用请求方法
  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client(config);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  }

  // 认证相关API
  async register(data: RegisterData): Promise<AuthResult> {
    return this.request<AuthResult>({
      method: 'POST',
      url: '/auth/register',
      data,
    });
  }

  async login(data: LoginData): Promise<AuthResult> {
    return this.request<AuthResult>({
      method: 'POST',
      url: '/auth/login',
      data: {
        ...data,
        deviceInfo: navigator.userAgent,
        ipAddress: '', // 后端会自动获取
      },
    });
  }

  async refreshToken(data: RefreshTokenData): Promise<AuthResult> {
    return this.request<AuthResult>({
      method: 'POST',
      url: '/auth/refresh',
      data,
    });
  }

  async logout(): Promise<ApiResponse> {
    return this.request<ApiResponse>({
      method: 'POST',
      url: '/auth/logout',
    });
  }

  async logoutAllDevices(): Promise<ApiResponse> {
    return this.request<ApiResponse>({
      method: 'POST',
      url: '/auth/logout-all',
    });
  }

  async getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
    return this.request<ApiResponse<{ user: User }>>({
      method: 'GET',
      url: '/auth/me',
    });
  }

  async getUserSessions(): Promise<ApiResponse<UserSession[]>> {
    return this.request<ApiResponse<UserSession[]>>({
      method: 'GET',
      url: '/auth/sessions',
    });
  }

  // 用户管理API
  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    isVerified?: boolean;
    roleId?: number;
  }): Promise<PaginatedResponse<User>> {
    return this.request<PaginatedResponse<User>>({
      method: 'GET',
      url: '/users',
      params,
    });
  }

  async getUserById(id: number): Promise<ApiResponse<{ user: User }>> {
    return this.request<ApiResponse<{ user: User }>>({
      method: 'GET',
      url: `/users/${id}`,
    });
  }

  async updateUser(id: number, data: Partial<User>): Promise<ApiResponse<{ user: User }>> {
    return this.request<ApiResponse<{ user: User }>>({
      method: 'PUT',
      url: `/users/${id}`,
      data,
    });
  }

  async deleteUser(id: number): Promise<ApiResponse> {
    return this.request<ApiResponse>({
      method: 'DELETE',
      url: `/users/${id}`,
    });
  }

  async toggleUserActive(id: number): Promise<ApiResponse<{ user: User }>> {
    return this.request<ApiResponse<{ user: User }>>({
      method: 'PATCH',
      url: `/users/${id}/toggle-active`,
    });
  }

  // 角色管理API
  async getRoles(): Promise<ApiResponse<Role[]>> {
    return this.request<ApiResponse<Role[]>>({
      method: 'GET',
      url: '/roles',
    });
  }

  async getRoleById(id: number): Promise<ApiResponse<{ role: Role }>> {
    return this.request<ApiResponse<{ role: Role }>>({
      method: 'GET',
      url: `/roles/${id}`,
    });
  }

  async createRole(data: {
    name: string;
    displayName: string;
    description: string;
    permissionIds?: number[];
  }): Promise<ApiResponse<{ role: Role }>> {
    return this.request<ApiResponse<{ role: Role }>>({
      method: 'POST',
      url: '/roles',
      data,
    });
  }

  async updateRole(id: number, data: Partial<Role>): Promise<ApiResponse<{ role: Role }>> {
    return this.request<ApiResponse<{ role: Role }>>({
      method: 'PUT',
      url: `/roles/${id}`,
      data,
    });
  }

  async deleteRole(id: number): Promise<ApiResponse> {
    return this.request<ApiResponse>({
      method: 'DELETE',
      url: `/roles/${id}`,
    });
  }

  async assignRoleToUser(userId: number, roleId: number): Promise<ApiResponse> {
    return this.request<ApiResponse>({
      method: 'POST',
      url: `/roles/${roleId}/assign`,
      data: { userId },
    });
  }

  async removeRoleFromUser(userId: number, roleId: number): Promise<ApiResponse> {
    return this.request<ApiResponse>({
      method: 'DELETE',
      url: `/roles/${roleId}/unassign`,
      data: { userId },
    });
  }

  async assignPermissionsToRole(roleId: number, permissionIds: number[]): Promise<ApiResponse> {
    return this.request<ApiResponse>({
      method: 'POST',
      url: `/roles/${roleId}/permissions`,
      data: { permissionIds },
    });
  }

  // 权限管理API
  async getPermissions(): Promise<ApiResponse<Permission[]>> {
    return this.request<ApiResponse<Permission[]>>({
      method: 'GET',
      url: '/permissions',
    });
  }

  async getPermissionById(id: number): Promise<ApiResponse<{ permission: Permission }>> {
    return this.request<ApiResponse<{ permission: Permission }>>({
      method: 'GET',
      url: `/permissions/${id}`,
    });
  }

  async createPermission(data: {
    name: string;
    resource: string;
    action: string;
    description: string;
  }): Promise<ApiResponse<{ permission: Permission }>> {
    return this.request<ApiResponse<{ permission: Permission }>>({
      method: 'POST',
      url: '/permissions',
      data,
    });
  }

  async updatePermission(id: number, data: Partial<Permission>): Promise<ApiResponse<{ permission: Permission }>> {
    return this.request<ApiResponse<{ permission: Permission }>>({
      method: 'PUT',
      url: `/permissions/${id}`,
      data,
    });
  }

  async deletePermission(id: number): Promise<ApiResponse> {
    return this.request<ApiResponse>({
      method: 'DELETE',
      url: `/permissions/${id}`,
    });
  }

  // 审计日志API
  async getAuditLogs(params?: {
    page?: number;
    limit?: number;
    userId?: number;
    action?: string;
    resource?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PaginatedResponse<AuditLog>> {
    return this.request<PaginatedResponse<AuditLog>>({
      method: 'GET',
      url: '/audit-logs',
      params,
    });
  }

  async getAuditLogById(id: number): Promise<ApiResponse<{ auditLog: AuditLog }>> {
    return this.request<ApiResponse<{ auditLog: AuditLog }>>({
      method: 'GET',
      url: `/audit-logs/${id}`,
    });
  }
}

// 创建单例实例
export const apiClient = new ApiClient();
export default apiClient;