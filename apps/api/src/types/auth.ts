import { FastifyRequest } from 'fastify';

/**
 * 认证用户信息接口
 */
export interface AuthenticatedUser {
  id: number;
  username: string;
  email?: string;
  roles?: string[];
  permissions?: string[];
}

/**
 * 扩展的 FastifyRequest 接口，包含认证用户信息
 */
export interface AuthenticatedRequest extends FastifyRequest {
  user: AuthenticatedUser;
}

/**
 * 角色数据接口
 */
export interface RoleData {
  name: string;
  displayName: string;
  description?: string;
  permissions?: string[];
}

/**
 * 权限数据接口
 */
export interface PermissionData {
  name: string;
  displayName: string;
  description?: string;
  resource: string;
  action: string;
}

/**
 * 角色更新数据接口
 */
export interface RoleUpdateData {
  displayName?: string;
  description?: string;
  isActive?: boolean;
}

/**
 * 权限更新数据接口
 */
export interface PermissionUpdateData {
  displayName?: string;
  description?: string;
  isActive?: boolean;
}
