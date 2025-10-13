import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // 创建默认角色
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      displayName: '管理员',
      description: '系统管理员角色',
    },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'user' },
    update: {},
    create: {
      name: 'user',
      displayName: '普通用户',
      description: '普通用户角色',
    },
  });

  // 创建默认权限
  const permissions = [
    { name: 'user:read', displayName: '查看用户', resource: 'user', action: 'read', description: '查看用户' },
    { name: 'user:write', displayName: '编辑用户', resource: 'user', action: 'write', description: '编辑用户' },
    { name: 'user:delete', displayName: '删除用户', resource: 'user', action: 'delete', description: '删除用户' },
    { name: 'role:read', displayName: '查看角色', resource: 'role', action: 'read', description: '查看角色' },
    { name: 'role:write', displayName: '编辑角色', resource: 'role', action: 'write', description: '编辑角色' },
    { name: 'role:delete', displayName: '删除角色', resource: 'role', action: 'delete', description: '删除角色' },
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: {
        ...perm,
        displayName: perm.name,
      },
    });
  }

  // 为管理员角色分配所有权限
  const allPermissions = await prisma.permission.findMany();
  for (const permission of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });
  }

  // 创建默认用户
  const hashedPassword = await bcrypt.hash('Admin123!@#', 12);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      isActive: true,
      isVerified: true,
    },
  });

  // 为管理员用户分配管理员角色
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  console.log('Database seeded successfully!');
  console.log('Admin user created: admin@example.com / Admin123!@#');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
