#!/usr/bin/env tsx

/**
 * RBAC 初始化脚本
 * 用于初始化默认的权限、角色和用户
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { permissionService } from '../services/permission.service.js';
import { logger } from '../utils/logger.js';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('🚀 开始初始化 RBAC 系统...');

        // 1. 初始化默认权限和角色
        console.log('📋 初始化默认权限和角色...');
        await permissionService.initializeDefaultPermissionsAndRoles();
        console.log('✅ 默认权限和角色初始化完成');

        // 2. 创建默认管理员用户
        console.log('👤 创建默认管理员用户...');
        const adminEmail = 'admin@example.com';
        const adminPassword = 'Admin123!@#';

        // 检查管理员用户是否已存在
        const existingAdmin = await prisma.user.findUnique({
            where: { email: adminEmail }
        });

        if (!existingAdmin) {
            // 哈希密码
            const hashedPassword = await bcrypt.hash(adminPassword, 12);

            // 创建管理员用户
            const adminUser = await prisma.user.create({
                data: {
                    name: '系统管理员',
                    email: adminEmail,
                    password: hashedPassword,
                    isActive: true,
                    isVerified: true,
                },
            });

            // 分配管理员角色
            const adminRole = await prisma.role.findUnique({
                where: { name: 'admin' }
            });

            if (adminRole) {
                await prisma.userRole.create({
                    data: {
                        userId: adminUser.id,
                        roleId: adminRole.id,
                    },
                });
            }

            console.log('✅ 默认管理员用户创建完成');
            console.log(`📧 邮箱: ${adminEmail}`);
            console.log(`🔑 密码: ${adminPassword}`);
            console.log('⚠️  请在生产环境中立即修改默认密码！');
        } else {
            console.log('ℹ️  管理员用户已存在，跳过创建');
        }

        // 3. 显示系统概览
        console.log('\n📊 系统概览:');

        const [userCount, roleCount, permissionCount] = await Promise.all([
            prisma.user.count(),
            prisma.role.count({ where: { isActive: true } }),
            prisma.permission.count({ where: { isActive: true } })
        ]);

        console.log(`👥 用户数量: ${userCount}`);
        console.log(`🎭 角色数量: ${roleCount}`);
        console.log(`🔐 权限数量: ${permissionCount}`);

        // 4. 显示角色和权限详情
        console.log('\n🎭 角色列表:');
        const roles = await prisma.role.findMany({
            where: { isActive: true },
            include: {
                rolePermissions: {
                    include: {
                        permission: true
                    }
                }
            }
        });

        for (const role of roles) {
            console.log(`  - ${role.displayName} (${role.name})`);
            console.log(`    权限: ${role.rolePermissions.map(rp => rp.permission.name).join(', ')}`);
        }

        console.log('\n🔐 权限列表:');
        const permissions = await prisma.permission.findMany({
            where: { isActive: true },
            orderBy: [
                { resource: 'asc' },
                { action: 'asc' }
            ]
        });

        const groupedPermissions = permissions.reduce((acc, permission) => {
            if (!acc[permission.resource]) {
                acc[permission.resource] = [];
            }
            acc[permission.resource].push(permission.action);
            return acc;
        }, {} as Record<string, string[]>);

        for (const [resource, actions] of Object.entries(groupedPermissions)) {
            console.log(`  - ${resource}: ${actions.join(', ')}`);
        }

        console.log('\n🎉 RBAC 系统初始化完成！');
        console.log('\n📚 使用说明:');
        console.log('1. 使用管理员账户登录系统');
        console.log('2. 通过 API 或管理界面管理用户、角色和权限');
        console.log('3. 为不同用户分配适当的角色');
        console.log('4. 根据需要创建自定义权限和角色');

    } catch (error) {
        console.error('❌ 初始化失败:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export { main as initRBAC };
