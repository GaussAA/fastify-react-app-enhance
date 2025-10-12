/**
 * API 类型定义
 * 自动生成于: 2025-10-11T02:39:48.535Z
 */

// 用户相关类型
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
}

// API 响应类型
export interface ApiResponse<T = any> {
  ok: boolean;
  message: string;
  data?: T;
}

export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
}

// 分页类型
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API 端点类型
export type ApiEndpoints = {
  'GET /': ApiResponse;
  'GET /api/users': User[];
  'POST /api/users': User;
  'PUT /api/users/:id': User;
  'DELETE /api/users/:id': void;
};
