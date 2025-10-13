import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { prisma } from '../prisma-client.js';
import {
  generateToken,
  generateRefreshToken,
} from '../middlewares/auth.middleware.js';
import { logger } from '../utils/logger.js';
import { auditService } from './audit.service.js';
import { getUserService } from './service-factory.js';

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
  deviceInfo?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuthResult {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: number;
      name: string;
      email: string;
      createdAt: Date;
      isActive: boolean;
      isVerified: boolean;
    };
    token: string;
    refreshToken?: string;
  };
}

export interface RefreshTokenData {
  refreshToken: string;
  deviceInfo?: string;
  ipAddress?: string;
  userAgent?: string;
}

export const authService = {
  /**
   * 用户注册
   */
  async register(
    userData: CreateUserData,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuthResult> {
    try {
      // 检查邮箱是否已存在
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (existingUser) {
        return {
          success: false,
          message: '邮箱已被注册',
        };
      }

      // 验证密码强度
      if (!this.isValidPassword(userData.password)) {
        return {
          success: false,
          message: '密码强度不足，需要至少8位，包含大小写字母、数字和特殊字符',
        };
      }

      // 哈希密码
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      // 创建用户
      const userService = getUserService(prisma);
      const user = await userService.createUser({
        ...userData,
        password: hashedPassword,
      });

      // 为新用户分配默认角色
      const defaultRole = await prisma.role.findUnique({
        where: { name: 'user' },
      });

      if (defaultRole) {
        await prisma.userRole.create({
          data: {
            userId: user.id,
            roleId: defaultRole.id,
          },
        });
      }

      // 生成JWT token和refresh token
      const token = generateToken({
        userId: user.id,
        email: user.email,
        name: user.name,
      });

      const refreshToken = generateRefreshToken({
        userId: user.id,
        email: user.email,
        name: user.name,
      });

      // 创建用户会话
      await this.createUserSession(
        user.id,
        token,
        refreshToken,
        ipAddress,
        userAgent
      );

      // 记录审计日志
      await auditService.log({
        userId: user.id,
        action: 'register',
        resource: 'user',
        resourceId: user.id.toString(),
        details: {
          email: user.email,
          name: user.name,
        },
        ipAddress,
        userAgent,
      });

      logger.info(`用户注册成功: ${user.email}`);

      return {
        success: true,
        message: '注册成功',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
            isActive: user.isActive,
            isVerified: user.isVerified,
          },
          token,
          refreshToken,
        },
      };
    } catch (error) {
      logger.error('用户注册失败:', error as any);
      return {
        success: false,
        message: '注册失败，请稍后重试',
      };
    }
  },

  /**
   * 用户登录
   */
  async login(loginData: LoginData): Promise<AuthResult> {
    try {
      // 查找用户
      const user = await prisma.user.findUnique({
        where: { email: loginData.email },
        include: {
          userRoles: {
            include: {
              role: true,
            },
          },
        },
      });

      if (!user) {
        // 记录失败的登录尝试
        await auditService.log({
          action: 'login_failed',
          resource: 'user',
          details: {
            email: loginData.email,
            reason: 'user_not_found',
          },
          ipAddress: loginData.ipAddress,
          userAgent: loginData.userAgent,
        });

        return {
          success: false,
          message: '邮箱或密码错误',
        };
      }

      // 检查用户是否激活
      if (!user.isActive) {
        await auditService.log({
          userId: user.id,
          action: 'login_failed',
          resource: 'user',
          resourceId: user.id.toString(),
          details: {
            email: user.email,
            reason: 'account_inactive',
          },
          ipAddress: loginData.ipAddress,
          userAgent: loginData.userAgent,
        });

        return {
          success: false,
          message: '账户已被停用，请联系管理员',
        };
      }

      // 验证密码
      const isPasswordValid = await bcrypt.compare(
        loginData.password,
        user.password
      );

      if (!isPasswordValid) {
        await auditService.log({
          userId: user.id,
          action: 'login_failed',
          resource: 'user',
          resourceId: user.id.toString(),
          details: {
            email: user.email,
            reason: 'invalid_password',
          },
          ipAddress: loginData.ipAddress,
          userAgent: loginData.userAgent,
        });

        logger.warn(`登录失败 - 密码错误: ${loginData.email}`);
        return {
          success: false,
          message: '邮箱或密码错误',
        };
      }

      // 生成JWT token和refresh token
      const token = generateToken({
        userId: user.id,
        email: user.email,
        name: user.name,
      });

      const refreshToken = generateRefreshToken({
        userId: user.id,
        email: user.email,
        name: user.name,
      });

      // 创建用户会话
      await this.createUserSession(
        user.id,
        token,
        refreshToken,
        loginData.ipAddress,
        loginData.userAgent
      );

      // 更新最后登录时间
      const userService = getUserService(prisma);
      await userService.updateUser(user.id, {
        updatedAt: new Date(),
      });

      // 记录成功的登录
      await auditService.log({
        userId: user.id,
        action: 'login',
        resource: 'user',
        resourceId: user.id.toString(),
        details: {
          email: user.email,
          deviceInfo: loginData.deviceInfo,
        },
        ipAddress: loginData.ipAddress,
        userAgent: loginData.userAgent,
      });

      logger.info(`用户登录成功: ${user.email}`);

      return {
        success: true,
        message: '登录成功',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
            isActive: user.isActive,
            isVerified: user.isVerified,
          },
          token,
          refreshToken,
        },
      };
    } catch (error) {
      logger.error('用户登录失败:', error as any);
      return {
        success: false,
        message: '登录失败，请稍后重试',
      };
    }
  },

  /**
   * 验证密码强度
   */
  isValidPassword(password: string): boolean {
    // 至少8位，包含大小写字母、数字和特殊字符
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  },

  /**
   * 验证邮箱格式
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * 刷新token
   */
  async refreshToken(refreshData: RefreshTokenData): Promise<AuthResult> {
    try {
      // 验证refresh token
      const session = await prisma.userSession.findUnique({
        where: { refreshToken: refreshData.refreshToken },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              createdAt: true,
              isActive: true,
              isVerified: true,
            },
          },
        },
      });

      if (!session || !session.isActive || session.expiresAt < new Date()) {
        return {
          success: false,
          message: '无效的刷新令牌',
        };
      }

      if (!session.user.isActive) {
        return {
          success: false,
          message: '账户已被停用',
        };
      }

      // 生成新的token
      const newToken = generateToken({
        userId: session.user.id,
        email: session.user.email,
        name: session.user.name,
      });

      const newRefreshToken = generateRefreshToken({
        userId: session.user.id,
        email: session.user.email,
        name: session.user.name,
      });

      // 更新会话
      await prisma.userSession.update({
        where: { id: session.id },
        data: {
          token: newToken,
          refreshToken: newRefreshToken,
          lastUsedAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天
        },
      });

      // 记录审计日志
      await auditService.log({
        userId: session.user.id,
        action: 'refresh_token',
        resource: 'user',
        resourceId: session.user.id.toString(),
        details: {
          email: session.user.email,
        },
        ipAddress: refreshData.ipAddress,
        userAgent: refreshData.userAgent,
      });

      return {
        success: true,
        message: 'Token刷新成功',
        data: {
          user: session.user,
          token: newToken,
          refreshToken: newRefreshToken,
        },
      };
    } catch (error) {
      logger.error('Token刷新失败:', error as any);
      return {
        success: false,
        message: 'Token刷新失败',
      };
    }
  },

  /**
   * 创建用户会话
   */
  async createUserSession(
    userId: number,
    token: string,
    refreshToken: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    try {
      // 清理过期的会话
      await prisma.userSession.deleteMany({
        where: {
          userId,
          OR: [{ expiresAt: { lt: new Date() } }, { isActive: false }],
        },
      });

      // 创建新会话
      return await prisma.userSession.create({
        data: {
          userId,
          token,
          refreshToken,
          ipAddress,
          userAgent,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天
        },
      });
    } catch (error) {
      logger.error('创建用户会话失败:', error as any);
      throw error;
    }
  },

  /**
   * 登出
   */
  async logout(token: string, userId?: number) {
    try {
      // 停用会话
      await prisma.userSession.updateMany({
        where: {
          token,
          ...(userId && { userId }),
        },
        data: {
          isActive: false,
        },
      });

      // 记录审计日志
      if (userId) {
        await auditService.log({
          userId,
          action: 'logout',
          resource: 'user',
          resourceId: userId.toString(),
          details: {},
        });
      }

      logger.info(`用户登出: ${userId || 'unknown'}`);
      return { success: true };
    } catch (error) {
      logger.error('登出失败:', error as any);
      throw error;
    }
  },

  /**
   * 登出所有设备
   */
  async logoutAllDevices(userId: number) {
    try {
      // 停用用户所有会话
      await prisma.userSession.updateMany({
        where: { userId },
        data: { isActive: false },
      });

      // 记录审计日志
      await auditService.log({
        userId,
        action: 'logout_all_devices',
        resource: 'user',
        resourceId: userId.toString(),
        details: {},
      });

      logger.info(`用户登出所有设备: ${userId}`);
      return { success: true };
    } catch (error) {
      logger.error('登出所有设备失败:', error as any);
      throw error;
    }
  },

  /**
   * 获取用户会话列表
   */
  async getUserSessions(userId: number) {
    try {
      return await prisma.userSession.findMany({
        where: {
          userId,
          isActive: true,
          expiresAt: { gt: new Date() },
        },
        orderBy: {
          lastUsedAt: 'desc',
        },
      });
    } catch (error) {
      logger.error('获取用户会话失败:', error as any);
      throw error;
    }
  },

  /**
   * 生成密码重置令牌
   */
  async generatePasswordResetToken(email: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return {
          success: false,
          message: '用户不存在',
        };
      }

      // 生成重置令牌
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1小时

      // 删除旧的令牌
      await prisma.passwordResetToken.deleteMany({
        where: { userId: user.id },
      });

      // 创建新令牌
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token,
          expiresAt,
        },
      });

      // 记录审计日志
      await auditService.log({
        userId: user.id,
        action: 'password_reset_requested',
        resource: 'user',
        resourceId: user.id.toString(),
        details: {
          email: user.email,
        },
      });

      return {
        success: true,
        message: '密码重置令牌已生成',
        data: { token },
      };
    } catch (error) {
      logger.error('生成密码重置令牌失败:', error as any);
      return {
        success: false,
        message: '生成密码重置令牌失败',
      };
    }
  },

  /**
   * 重置密码
   */
  async resetPassword(token: string, newPassword: string) {
    try {
      const resetToken = await prisma.passwordResetToken.findUnique({
        where: { token },
        include: { user: true },
      });

      if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
        return {
          success: false,
          message: '无效或已过期的重置令牌',
        };
      }

      // 验证新密码强度
      if (!this.isValidPassword(newPassword)) {
        return {
          success: false,
          message: '密码强度不足，需要至少8位，包含大小写字母、数字和特殊字符',
        };
      }

      // 哈希新密码
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // 更新用户密码
      await prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      });

      // 标记令牌为已使用
      await prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true },
      });

      // 停用用户所有会话
      await prisma.userSession.updateMany({
        where: { userId: resetToken.userId },
        data: { isActive: false },
      });

      // 记录审计日志
      await auditService.log({
        userId: resetToken.userId,
        action: 'password_reset',
        resource: 'user',
        resourceId: resetToken.userId.toString(),
        details: {
          email: resetToken.user.email,
        },
      });

      return {
        success: true,
        message: '密码重置成功',
      };
    } catch (error) {
      logger.error('重置密码失败:', error as any);
      return {
        success: false,
        message: '重置密码失败',
      };
    }
  },
};
