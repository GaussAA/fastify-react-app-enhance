import { FastifyInstance } from 'fastify';
import { authService } from '../services/auth.service.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

export async function authRoutes(app: FastifyInstance) {
    // 用户注册
    app.post(
        '/register',
        {
            schema: {
                description: '用户注册',
                tags: ['auth'],
                summary: '创建新用户账户',
                body: {
                    type: 'object',
                    required: ['name', 'email', 'password'],
                    properties: {
                        name: {
                            type: 'string',
                            description: '用户姓名',
                            minLength: 1,
                            maxLength: 50
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: '用户邮箱',
                            minLength: 5,
                            maxLength: 255
                        },
                        password: {
                            type: 'string',
                            description: '用户密码',
                            minLength: 8,
                            maxLength: 128
                        }
                    }
                },
                response: {
                    201: {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean' },
                            message: { type: 'string' },
                            data: {
                                type: 'object',
                                properties: {
                                    user: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'number' },
                                            name: { type: 'string' },
                                            email: { type: 'string' },
                                            createdAt: { type: 'string', format: 'date-time' }
                                        }
                                    },
                                    token: { type: 'string' }
                                }
                            }
                        }
                    },
                    400: {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean' },
                            message: { type: 'string' }
                        }
                    }
                }
            }
        },
        async (request, reply) => {
            const { name, email, password } = request.body as {
                name: string;
                email: string;
                password: string;
            };

            // 基本验证
            if (!name || !email || !password) {
                return reply.status(400).send({
                    success: false,
                    message: '请填写所有必填字段'
                });
            }

            if (!authService.isValidEmail(email)) {
                return reply.status(400).send({
                    success: false,
                    message: '邮箱格式不正确'
                });
            }

            const result = await authService.register({ name, email, password });

            if (result.success) {
                return reply.status(201).send(result);
            } else {
                return reply.status(400).send(result);
            }
        }
    );

    // 用户登录
    app.post(
        '/login',
        {
            schema: {
                description: '用户登录',
                tags: ['auth'],
                summary: '用户身份验证',
                body: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            description: '用户邮箱'
                        },
                        password: {
                            type: 'string',
                            description: '用户密码'
                        }
                    }
                },
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean' },
                            message: { type: 'string' },
                            data: {
                                type: 'object',
                                properties: {
                                    user: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'number' },
                                            name: { type: 'string' },
                                            email: { type: 'string' },
                                            createdAt: { type: 'string', format: 'date-time' }
                                        }
                                    },
                                    token: { type: 'string' }
                                }
                            }
                        }
                    },
                    400: {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean' },
                            message: { type: 'string' }
                        }
                    },
                    401: {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean' },
                            message: { type: 'string' }
                        }
                    }
                }
            }
        },
        async (request, reply) => {
            const { email, password } = request.body as {
                email: string;
                password: string;
            };

            // 基本验证
            if (!email || !password) {
                return reply.status(400).send({
                    success: false,
                    message: '请填写邮箱和密码'
                });
            }

            const result = await authService.login({ email, password });

            if (result.success) {
                return reply.send(result);
            } else {
                return reply.status(401).send(result);
            }
        }
    );


    // 获取当前用户信息
    app.get(
        '/me',
        {
            preHandler: [authenticateToken],
            schema: {
                description: '获取当前用户信息',
                tags: ['auth'],
                summary: '获取已认证用户的信息',
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean' },
                            data: {
                                type: 'object',
                                properties: {
                                    id: { type: 'number' },
                                    name: { type: 'string' },
                                    email: { type: 'string' },
                                    createdAt: { type: 'string', format: 'date-time' }
                                }
                            }
                        }
                    },
                    401: {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean' },
                            message: { type: 'string' }
                        }
                    }
                }
            }
        },
        async (request, reply) => {
            const user = (request as any).user;

            return reply.send({
                success: true,
                data: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    createdAt: user.createdAt
                }
            });
        }
    );

    // 刷新token
    app.post(
        '/refresh',
        {
            schema: {
                description: '刷新访问令牌',
                tags: ['auth'],
                summary: '获取新的访问令牌',
                body: {
                    type: 'object',
                    required: ['refreshToken'],
                    properties: {
                        refreshToken: {
                            type: 'string',
                            description: '刷新令牌'
                        },
                        deviceInfo: {
                            type: 'string',
                            description: '设备信息'
                        }
                    }
                },
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean' },
                            message: { type: 'string' },
                            data: {
                                type: 'object',
                                properties: {
                                    user: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'number' },
                                            name: { type: 'string' },
                                            email: { type: 'string' },
                                            createdAt: { type: 'string', format: 'date-time' },
                                            isActive: { type: 'boolean' },
                                            isVerified: { type: 'boolean' }
                                        }
                                    },
                                    token: { type: 'string' },
                                    refreshToken: { type: 'string' }
                                }
                            }
                        }
                    },
                    401: {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean' },
                            message: { type: 'string' }
                        }
                    }
                }
            }
        },
        async (request, reply) => {
            const { refreshToken, deviceInfo } = request.body as {
                refreshToken: string;
                deviceInfo?: string;
            };

            const result = await authService.refreshToken({
                refreshToken,
                deviceInfo,
                ipAddress: request.ip,
                userAgent: request.headers['user-agent']
            });

            if (result.success) {
                return reply.send(result);
            } else {
                return reply.status(401).send(result);
            }
        }
    );

    // 登出
    app.post(
        '/logout',
        {
            preHandler: [authenticateToken],
            schema: {
                description: '用户登出',
                tags: ['auth'],
                summary: '登出当前会话',
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean' },
                            message: { type: 'string' }
                        }
                    }
                }
            }
        },
        async (request, reply) => {
            const token = request.headers.authorization?.split(' ')[1];
            const userId = (request as any).user?.id;

            await authService.logout(token!, userId);

            return reply.send({
                success: true,
                message: '登出成功'
            });
        }
    );

    // 登出所有设备
    app.post(
        '/logout-all',
        {
            preHandler: [authenticateToken],
            schema: {
                description: '登出所有设备',
                tags: ['auth'],
                summary: '登出所有设备会话',
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean' },
                            message: { type: 'string' }
                        }
                    }
                }
            }
        },
        async (request, reply) => {
            const userId = (request as any).user?.id;

            await authService.logoutAllDevices(userId);

            return reply.send({
                success: true,
                message: '所有设备登出成功'
            });
        }
    );

    // 获取用户会话列表
    app.get(
        '/sessions',
        {
            preHandler: [authenticateToken],
            schema: {
                description: '获取用户会话列表',
                tags: ['auth'],
                summary: '获取当前用户的活跃会话',
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean' },
                            data: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'number' },
                                        deviceInfo: { type: 'string' },
                                        ipAddress: { type: 'string' },
                                        userAgent: { type: 'string' },
                                        isActive: { type: 'boolean' },
                                        lastUsedAt: { type: 'string', format: 'date-time' },
                                        createdAt: { type: 'string', format: 'date-time' }
                                    }
                                }
                            },
                            message: { type: 'string' }
                        }
                    }
                }
            }
        },
        async (request, reply) => {
            const userId = (request as any).user?.id;

            const sessions = await authService.getUserSessions(userId);

            return reply.send({
                success: true,
                data: sessions,
                message: '获取会话列表成功'
            });
        }
    );

    // 请求密码重置
    app.post(
        '/forgot-password',
        {
            schema: {
                description: '请求密码重置',
                tags: ['auth'],
                summary: '发送密码重置令牌',
                body: {
                    type: 'object',
                    required: ['email'],
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            description: '用户邮箱'
                        }
                    }
                },
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean' },
                            message: { type: 'string' }
                        }
                    }
                }
            }
        },
        async (request, reply) => {
            const { email } = request.body as { email: string };

            const result = await authService.generatePasswordResetToken(email);

            return reply.send(result);
        }
    );

    // 重置密码
    app.post(
        '/reset-password',
        {
            schema: {
                description: '重置密码',
                tags: ['auth'],
                summary: '使用重置令牌重置密码',
                body: {
                    type: 'object',
                    required: ['token', 'newPassword'],
                    properties: {
                        token: {
                            type: 'string',
                            description: '密码重置令牌'
                        },
                        newPassword: {
                            type: 'string',
                            description: '新密码',
                            minLength: 8
                        }
                    }
                },
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean' },
                            message: { type: 'string' }
                        }
                    }
                }
            }
        },
        async (request, reply) => {
            const { token, newPassword } = request.body as {
                token: string;
                newPassword: string;
            };

            const result = await authService.resetPassword(token, newPassword);

            return reply.send(result);
        }
    );
}
