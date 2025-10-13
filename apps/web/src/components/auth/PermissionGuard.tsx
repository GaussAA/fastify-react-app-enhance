// 权限守卫组件

import React, { ReactNode } from 'react';
import {
  useAuthStore,
  hasPermission,
  hasRole,
  hasAnyRole,
  hasAllRoles,
} from '@/store/auth';

interface PermissionGuardProps {
  children: ReactNode;
  permission?: string;
  role?: string;
  roles?: string[];
  requireAll?: boolean;
  fallback?: ReactNode;
  showError?: boolean;
}

export function PermissionGuard({
  children,
  permission,
  role,
  roles,
  requireAll = false,
  fallback = null,
  showError = false,
}: PermissionGuardProps) {
  const { isAuthenticated, user } = useAuthStore();

  // 检查是否已认证
  if (!isAuthenticated || !user) {
    return showError ? (
      <div className="p-4 text-center text-red-600 bg-red-50 rounded-lg">
        请先登录以访问此内容
      </div>
    ) : (
      <>{fallback}</>
    );
  }

  // 检查权限
  if (permission && !hasPermission(permission)) {
    return showError ? (
      <div className="p-4 text-center text-red-600 bg-red-50 rounded-lg">
        您没有访问此内容的权限
      </div>
    ) : (
      <>{fallback}</>
    );
  }

  // 检查单个角色
  if (role && !hasRole(role)) {
    return showError ? (
      <div className="p-4 text-center text-red-600 bg-red-50 rounded-lg">
        您需要 {role} 角色才能访问此内容
      </div>
    ) : (
      <>{fallback}</>
    );
  }

  // 检查多个角色
  if (roles && roles.length > 0) {
    const hasRequiredRoles = requireAll
      ? hasAllRoles(roles)
      : hasAnyRole(roles);

    if (!hasRequiredRoles) {
      return showError ? (
        <div className="p-4 text-center text-red-600 bg-red-50 rounded-lg">
          您需要以下角色之一才能访问此内容: {roles.join(', ')}
        </div>
      ) : (
        <>{fallback}</>
      );
    }
  }

  return <>{children}</>;
}

// 高阶组件版本
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  permission?: string,
  role?: string,
  roles?: string[],
  requireAll?: boolean
) {
  return function PermissionWrappedComponent(props: P) {
    return (
      <PermissionGuard
        permission={permission}
        role={role}
        roles={roles}
        requireAll={requireAll}
      >
        <Component {...props} />
      </PermissionGuard>
    );
  };
}

// 权限检查钩子
export function usePermission() {
  const { user, isAuthenticated } = useAuthStore();

  const checkPermission = (permission: string): boolean => {
    return hasPermission(permission);
  };

  const checkRole = (role: string): boolean => {
    return hasRole(role);
  };

  const checkAnyRole = (roles: string[]): boolean => {
    return hasAnyRole(roles);
  };

  const checkAllRoles = (roles: string[]): boolean => {
    return hasAllRoles(roles);
  };

  const getUserPermissions = (): string[] => {
    if (!user || !user.permissions) return [];
    return user.permissions.map(p => p.name);
  };

  const getUserRoles = (): string[] => {
    if (!user || !user.roles) return [];
    return user.roles.map(r => r.name);
  };

  const hasResourcePermission = (resource: string, action: string): boolean => {
    if (!user || !user.permissions) return false;
    return user.permissions.some(
      p => p.resource === resource && p.action === action
    );
  };

  return {
    isAuthenticated,
    user,
    checkPermission,
    checkRole,
    checkAnyRole,
    checkAllRoles,
    getUserPermissions,
    getUserRoles,
    hasResourcePermission,
  };
}
