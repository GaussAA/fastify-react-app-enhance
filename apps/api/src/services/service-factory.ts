/**
 * 服务工厂
 * 统一管理所有服务的创建和获取
 */

import { PrismaClient } from '@prisma/client';
import { UserService } from './user.service.js';
import { RoleService } from './role.service.js';
import { PermissionService } from './permission.service.js';

/**
 * 服务工厂类
 */
export class ServiceFactory {
  private static instance: ServiceFactory;
  private prisma: PrismaClient;
  private services: Map<string, any> = new Map();

  private constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * 获取服务工厂单例
   */
  public static getInstance(prisma: PrismaClient): ServiceFactory {
    if (!ServiceFactory.instance) {
      ServiceFactory.instance = new ServiceFactory(prisma);
    }
    return ServiceFactory.instance;
  }

  /**
   * 获取用户服务
   */
  public getUserService(): UserService {
    const key = 'userService';
    if (!this.services.has(key)) {
      this.services.set(key, new UserService(this.prisma));
    }
    return this.services.get(key);
  }

  /**
   * 获取角色服务
   */
  public getRoleService(): RoleService {
    const key = 'roleService';
    if (!this.services.has(key)) {
      this.services.set(key, new RoleService(this.prisma));
    }
    return this.services.get(key);
  }

  /**
   * 获取权限服务
   */
  public getPermissionService(): PermissionService {
    const key = 'permissionService';
    if (!this.services.has(key)) {
      this.services.set(key, new PermissionService(this.prisma));
    }
    return this.services.get(key);
  }

  /**
   * 获取所有服务
   */
  public getAllServices(): {
    userService: UserService;
    roleService: RoleService;
    permissionService: PermissionService;
  } {
    return {
      userService: this.getUserService(),
      roleService: this.getRoleService(),
      permissionService: this.getPermissionService(),
    };
  }

  /**
   * 清除所有服务缓存
   */
  public clearAllCaches(): void {
    this.services.forEach(service => {
      if (service && typeof service.clearCache === 'function') {
        service.clearCache();
      }
    });
  }

  /**
   * 获取服务统计信息
   */
  public async getServicesStats(): Promise<{
    userService: any;
    roleService: any;
    permissionService: any;
  }> {
    const [userStats, roleStats, permissionStats] = await Promise.all([
      this.getUserService().getStats(),
      this.getRoleService().getStats(),
      this.getPermissionService().getStats(),
    ]);

    return {
      userService: userStats,
      roleService: roleStats,
      permissionService: permissionStats,
    };
  }

  /**
   * 销毁服务工厂
   */
  public destroy(): void {
    this.clearAllCaches();
    this.services.clear();
    ServiceFactory.instance = null as any;
  }
}

// 便捷函数
export function getServiceFactory(prisma: PrismaClient): ServiceFactory {
  return ServiceFactory.getInstance(prisma);
}

export function getUserService(prisma: PrismaClient): UserService {
  return getServiceFactory(prisma).getUserService();
}

export function getRoleService(prisma: PrismaClient): RoleService {
  return getServiceFactory(prisma).getRoleService();
}

export function getPermissionService(prisma: PrismaClient): PermissionService {
  return getServiceFactory(prisma).getPermissionService();
}
