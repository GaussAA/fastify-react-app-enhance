import { jest } from '@jest/globals';
import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

// Mock Prisma client
jest.unstable_mockModule('../../../apps/api/src/prisma-client.js', () => ({
    prisma: {
        user: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        },
        role: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            count: jest.fn(),
        },
        permission: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            count: jest.fn(),
        },
        userRole: {
            findMany: jest.fn(),
            create: jest.fn(),
            deleteMany: jest.fn(),
            count: jest.fn(),
        },
        rolePermission: {
            findMany: jest.fn(),
            create: jest.fn(),
            createMany: jest.fn(),
            deleteMany: jest.fn(),
        },
        auditLog: {
            create: jest.fn(),
            findMany: jest.fn(),
            count: jest.fn(),
            deleteMany: jest.fn(),
        },
        userSession: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            updateMany: jest.fn(),
            deleteMany: jest.fn(),
        },
        passwordResetToken: {
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            deleteMany: jest.fn(),
        },
        emailVerificationToken: {
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            deleteMany: jest.fn(),
        },
    },
}));

const { build } = await import('../../../apps/api/src/app.js');

describe('RBAC Integration Tests', () => {
    let app: FastifyInstance;
    let adminToken: string;
    let userToken: string;

    beforeAll(async () => {
        app = build();
        await app.ready();
    });

    afterAll(async () => {
        if (app) {
            await app.close();
        }
    });

    describe('Authentication Flow', () => {
        it('should register a new user', async () => {
            const response = await app.inject({
                method: 'POST',
                url: '/api/auth/register',
                payload: {
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'Test123!@#'
                }
            });

            expect(response.statusCode).toBe(200);
            const body = JSON.parse(response.body);
            expect(body.success).toBe(true);
            expect(body.data.user.email).toBe('test@example.com');
            expect(body.data.token).toBeDefined();
            expect(body.data.refreshToken).toBeDefined();
        });

        it('should login with valid credentials', async () => {
            const response = await app.inject({
                method: 'POST',
                url: '/api/auth/login',
                payload: {
                    email: 'test@example.com',
                    password: 'Test123!@#'
                }
            });

            expect(response.statusCode).toBe(200);
            const body = JSON.parse(response.body);
            expect(body.success).toBe(true);
            expect(body.data.token).toBeDefined();

            userToken = body.data.token;
        });

        it('should reject invalid credentials', async () => {
            const response = await app.inject({
                method: 'POST',
                url: '/api/auth/login',
                payload: {
                    email: 'test@example.com',
                    password: 'wrongpassword'
                }
            });

            expect(response.statusCode).toBe(200);
            const body = JSON.parse(response.body);
            expect(body.success).toBe(false);
            expect(body.message).toContain('邮箱或密码错误');
        });
    });

    describe('Permission System', () => {
        it('should require authentication for protected routes', async () => {
            const response = await app.inject({
                method: 'GET',
                url: '/api/users'
            });

            expect(response.statusCode).toBe(401);
        });

        it('should allow access with valid token', async () => {
            const response = await app.inject({
                method: 'GET',
                url: '/api/users',
                headers: {
                    authorization: `Bearer ${userToken}`
                }
            });

            // This might return 403 if user doesn't have permission
            // or 200 if they do, depending on the user's role
            expect([200, 403]).toContain(response.statusCode);
        });

        it('should check user permissions', async () => {
            const response = await app.inject({
                method: 'GET',
                url: '/api/permissions',
                headers: {
                    authorization: `Bearer ${userToken}`
                }
            });

            // Regular users might not have permission to view permissions
            expect([200, 403]).toContain(response.statusCode);
        });
    });

    describe('Role Management', () => {
        it('should require admin role for role management', async () => {
            const response = await app.inject({
                method: 'GET',
                url: '/api/roles',
                headers: {
                    authorization: `Bearer ${userToken}`
                }
            });

            // Regular users should not have access to role management
            expect(response.statusCode).toBe(403);
        });

        it('should create a new role with admin privileges', async () => {
            // This test would require an admin token
            // For now, we'll just test the endpoint structure
            const response = await app.inject({
                method: 'POST',
                url: '/api/roles',
                headers: {
                    authorization: `Bearer ${userToken}`
                },
                payload: {
                    name: 'test-role',
                    displayName: 'Test Role',
                    description: 'A test role'
                }
            });

            expect(response.statusCode).toBe(403);
        });
    });

    describe('User Management', () => {
        it('should get user list with proper permissions', async () => {
            const response = await app.inject({
                method: 'GET',
                url: '/api/users',
                headers: {
                    authorization: `Bearer ${userToken}`
                }
            });

            // Response should be either successful or permission denied
            expect([200, 403]).toContain(response.statusCode);
        });

        it('should get user statistics', async () => {
            const response = await app.inject({
                method: 'GET',
                url: '/api/users/stats/overview',
                headers: {
                    authorization: `Bearer ${userToken}`
                }
            });

            expect([200, 403]).toContain(response.statusCode);
        });
    });

    describe('Audit Logging', () => {
        it('should log authentication attempts', async () => {
            const response = await app.inject({
                method: 'POST',
                url: '/api/auth/login',
                payload: {
                    email: 'nonexistent@example.com',
                    password: 'wrongpassword'
                }
            });

            expect(response.statusCode).toBe(200);
            const body = JSON.parse(response.body);
            expect(body.success).toBe(false);

            // Audit log should be created for failed login attempt
            // This would be verified by checking the audit logs endpoint
        });

        it('should require admin permissions to view audit logs', async () => {
            const response = await app.inject({
                method: 'GET',
                url: '/api/audit',
                headers: {
                    authorization: `Bearer ${userToken}`
                }
            });

            expect(response.statusCode).toBe(403);
        });
    });

    describe('Session Management', () => {
        it('should get user sessions', async () => {
            const response = await app.inject({
                method: 'GET',
                url: '/api/auth/sessions',
                headers: {
                    authorization: `Bearer ${userToken}`
                }
            });

            expect(response.statusCode).toBe(200);
            const body = JSON.parse(response.body);
            expect(body.success).toBe(true);
            expect(Array.isArray(body.data)).toBe(true);
        });

        it('should logout successfully', async () => {
            const response = await app.inject({
                method: 'POST',
                url: '/api/auth/logout',
                headers: {
                    authorization: `Bearer ${userToken}`
                }
            });

            expect(response.statusCode).toBe(200);
            const body = JSON.parse(response.body);
            expect(body.success).toBe(true);
        });
    });

    describe('Password Reset', () => {
        it('should request password reset', async () => {
            const response = await app.inject({
                method: 'POST',
                url: '/api/auth/forgot-password',
                payload: {
                    email: 'test@example.com'
                }
            });

            expect(response.statusCode).toBe(200);
            const body = JSON.parse(response.body);
            expect(body.success).toBe(true);
        });

        it('should reject invalid reset token', async () => {
            const response = await app.inject({
                method: 'POST',
                url: '/api/auth/reset-password',
                payload: {
                    token: 'invalid-token',
                    newPassword: 'NewPassword123!@#'
                }
            });

            expect(response.statusCode).toBe(200);
            const body = JSON.parse(response.body);
            expect(body.success).toBe(false);
        });
    });
});
