/**
 * 路由辅助工具
 * 提供可复用的路由模式和中间件
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
    successResponse,
    createdResponse,
    paginatedResponse,
    errorResponse,
    notFoundResponse,
    routeHandler,
} from './response.js';
import { validate, ValidationRuleSets } from './validation.js';
import {
    paginatedQuery,
    findById,
    createRecord,
    updateRecord,
    softDeleteRecord,
} from './database.js';
import { PrismaClient } from '@prisma/client';

export interface RouteConfig {
    model: any;
    resourceName: string;
    include?: any;
    validationRules?: Record<string, any[]>;
    searchFields?: string[];
    sortFields?: string[];
    requireAuth?: boolean;
    permissions?: {
        read?: string;
        create?: string;
        update?: string;
        delete?: string;
    };
}

export interface CrudRouteOptions {
    prefix: string;
    config: RouteConfig;
    customRoutes?: Array<{
        method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
        path: string;
        handler: (request: FastifyRequest, reply: FastifyReply) => Promise<any>;
        schema?: any;
        preHandler?: any[];
    }>;
}

/**
 * CRUD路由生成器
 */
export class CrudRouteGenerator {
    private app: FastifyInstance;
    private prisma: PrismaClient;

    constructor(app: FastifyInstance, prisma: PrismaClient) {
        this.app = app;
        this.prisma = prisma;
    }

    /**
     * 生成完整的CRUD路由
     */
    async generateCrudRoutes(options: CrudRouteOptions): Promise<void> {
        const { prefix, config, customRoutes = [] } = options;
        const {
            model,
            resourceName,
            include,
            validationRules,
            searchFields,
            requireAuth = true,
        } = config;

        // 获取所有记录（分页）
        this.app.get(
            prefix,
            {
                preHandler: requireAuth
                    ? await this.getAuthMiddleware(config.permissions?.read)
                    : [],
                schema: {
                    description: `获取${resourceName}列表`,
                    tags: [resourceName],
                    querystring: {
                        type: 'object',
                        properties: {
                            page: { type: 'number', minimum: 1, default: 1 },
                            limit: { type: 'number', minimum: 1, maximum: 100, default: 20 },
                            search: { type: 'string' },
                            sortBy: { type: 'string' },
                            sortOrder: {
                                type: 'string',
                                enum: ['asc', 'desc'],
                                default: 'desc',
                            },
                            isActive: { type: 'boolean' },
                        },
                    },
                    response: {
                        200: {
                            type: 'object',
                            properties: {
                                success: { type: 'boolean' },
                                data: {
                                    type: 'array',
                                    items: { type: 'object' },
                                },
                                pagination: {
                                    type: 'object',
                                    properties: {
                                        page: { type: 'number' },
                                        limit: { type: 'number' },
                                        total: { type: 'number' },
                                        pages: { type: 'number' },
                                    },
                                },
                                message: { type: 'string' },
                            },
                        },
                        500: {
                            type: 'object',
                            properties: {
                                success: { type: 'boolean' },
                                message: { type: 'string' },
                            },
                        },
                    },
                },
            },
            routeHandler(async (request: FastifyRequest, reply: FastifyReply) => {
                const query = request.query as any;
                const result = await paginatedQuery(
                    this.prisma,
                    model,
                    {
                        page: query.page,
                        limit: query.limit,
                        search: query.search,
                        searchFields,
                        sortBy: query.sortBy,
                        sortOrder: query.sortOrder,
                        isActive: query.isActive,
                    },
                    include
                );

                return paginatedResponse(
                    reply,
                    result.data,
                    result.pagination,
                    `获取${resourceName}列表成功`
                );
            })
        );

        // 根据ID获取记录
        this.app.get(
            `${prefix}/:id`,
            {
                preHandler: requireAuth
                    ? await this.getAuthMiddleware(config.permissions?.read)
                    : [],
                schema: {
                    description: `根据ID获取${resourceName}详情`,
                    tags: [resourceName],
                    params: {
                        type: 'object',
                        properties: {
                            id: { type: 'number', description: `${resourceName}ID` },
                        },
                        required: ['id'],
                    },
                    response: {
                        200: {
                            type: 'object',
                            properties: {
                                success: { type: 'boolean' },
                                data: { type: 'object' },
                                message: { type: 'string' },
                            },
                        },
                        404: {
                            type: 'object',
                            properties: {
                                success: { type: 'boolean' },
                                message: { type: 'string' },
                            },
                        },
                        500: {
                            type: 'object',
                            properties: {
                                success: { type: 'boolean' },
                                message: { type: 'string' },
                            },
                        },
                    },
                },
            },
            routeHandler(async (request: FastifyRequest, reply: FastifyReply) => {
                const { id } = request.params as { id: number };
                const item = await findById(this.prisma, model, id, include);

                if (!item) {
                    return notFoundResponse(reply, `${resourceName}不存在`);
                }

                return successResponse(reply, item, `获取${resourceName}详情成功`);
            })
        );

        // 创建记录
        this.app.post(
            prefix,
            {
                preHandler: requireAuth
                    ? await this.getAuthMiddleware(config.permissions?.create)
                    : [],
                schema: {
                    description: `创建新${resourceName}`,
                    tags: [resourceName],
                    body: this.getCreateSchema(validationRules),
                    response: {
                        201: {
                            type: 'object',
                            properties: {
                                success: { type: 'boolean' },
                                data: { type: 'object' },
                                message: { type: 'string' },
                            },
                        },
                        400: {
                            type: 'object',
                            properties: {
                                success: { type: 'boolean' },
                                message: { type: 'string' },
                                errors: {
                                    type: 'array',
                                    items: { type: 'string' },
                                },
                            },
                        },
                        500: {
                            type: 'object',
                            properties: {
                                success: { type: 'boolean' },
                                message: { type: 'string' },
                            },
                        },
                    },
                },
            },
            routeHandler(async (request: FastifyRequest, reply: FastifyReply) => {
                const data = request.body as any;

                // 验证数据
                if (validationRules) {
                    const validation = validate(data, validationRules);
                    if (!validation.isValid) {
                        return errorResponse(
                            reply,
                            '输入验证失败',
                            400,
                            undefined,
                            validation.errors
                        );
                    }
                }

                const item = await createRecord(this.prisma, model, data, include);
                return createdResponse(reply, item, `${resourceName}创建成功`);
            })
        );

        // 更新记录
        this.app.put(
            `${prefix}/:id`,
            {
                preHandler: requireAuth
                    ? await this.getAuthMiddleware(config.permissions?.update)
                    : [],
                schema: {
                    description: `更新${resourceName}信息`,
                    tags: [resourceName],
                    params: {
                        type: 'object',
                        properties: {
                            id: { type: 'number', description: `${resourceName}ID` },
                        },
                        required: ['id'],
                    },
                    body: this.getUpdateSchema(validationRules),
                    response: {
                        200: {
                            type: 'object',
                            properties: {
                                success: { type: 'boolean' },
                                data: { type: 'object' },
                                message: { type: 'string' },
                            },
                        },
                        404: {
                            type: 'object',
                            properties: {
                                success: { type: 'boolean' },
                                message: { type: 'string' },
                            },
                        },
                        400: {
                            type: 'object',
                            properties: {
                                success: { type: 'boolean' },
                                message: { type: 'string' },
                                errors: {
                                    type: 'array',
                                    items: { type: 'string' },
                                },
                            },
                        },
                        500: {
                            type: 'object',
                            properties: {
                                success: { type: 'boolean' },
                                message: { type: 'string' },
                            },
                        },
                    },
                },
            },
            routeHandler(async (request: FastifyRequest, reply: FastifyReply) => {
                const { id } = request.params as { id: number };
                const data = request.body as any;

                // 验证数据
                if (validationRules) {
                    const validation = validate(data, validationRules);
                    if (!validation.isValid) {
                        return errorResponse(
                            reply,
                            '输入验证失败',
                            400,
                            undefined,
                            validation.errors
                        );
                    }
                }

                const item = await updateRecord(this.prisma, model, id, data, include);
                if (!item) {
                    return notFoundResponse(reply, `${resourceName}不存在`);
                }

                return successResponse(reply, item, `${resourceName}更新成功`);
            })
        );

        // 删除记录
        this.app.delete(
            `${prefix}/:id`,
            {
                preHandler: requireAuth
                    ? await this.getAuthMiddleware(config.permissions?.delete)
                    : [],
                schema: {
                    description: `删除${resourceName}`,
                    tags: [resourceName],
                    params: {
                        type: 'object',
                        properties: {
                            id: { type: 'number', description: `${resourceName}ID` },
                        },
                        required: ['id'],
                    },
                    response: {
                        200: {
                            type: 'object',
                            properties: {
                                success: { type: 'boolean' },
                                message: { type: 'string' },
                            },
                        },
                        404: {
                            type: 'object',
                            properties: {
                                success: { type: 'boolean' },
                                message: { type: 'string' },
                            },
                        },
                        500: {
                            type: 'object',
                            properties: {
                                success: { type: 'boolean' },
                                message: { type: 'string' },
                            },
                        },
                    },
                },
            },
            routeHandler(async (request: FastifyRequest, reply: FastifyReply) => {
                const { id } = request.params as { id: number };
                const user = (request as any).user;
                const deletedBy = user?.id;

                const result = await softDeleteRecord(
                    this.prisma,
                    model,
                    id,
                    deletedBy
                );
                if (!result) {
                    return notFoundResponse(reply, `${resourceName}不存在`);
                }

                return successResponse(reply, null, `${resourceName}删除成功`);
            })
        );

        // 注册自定义路由
        customRoutes.forEach(async (route: any) => {
            if (!route.method || typeof route.method !== 'string') {
                console.warn('Invalid route method:', route.method);
                return;
            }

            const middlewares = await this.getAuthMiddleware();
            const method = route.method.toLowerCase() as
                | 'get'
                | 'post'
                | 'put'
                | 'delete'
                | 'patch';
            this.app[method](
                route.path,
                {
                    preHandler: middlewares as any,
                    schema: middlewares as any,
                },
                routeHandler(route.handler)
            );
        });
    }

    /**
     * 获取认证中间件
     */
    private async getAuthMiddleware(permission?: string): Promise<any[]> {
        const middlewares: any[] = [] as any;

        // 动态导入认证中间件
        try {
            const { authenticateToken } = await import(
                '../middlewares/auth.middleware.js'
            );
            middlewares.push(authenticateToken);

            if (permission) {
                const { requirePermission } = await import(
                    '../middlewares/auth.middleware.js'
                );
                const [resource, action] = permission.split(':');
                middlewares.push(requirePermission(resource, action));
            }
        } catch (error) {
            console.warn('认证中间件导入失败:', error);
        }

        return middlewares;
    }

    /**
     * 获取创建请求的Schema
     */
    private getCreateSchema(validationRules?: Record<string, any[]>): any {
        if (!validationRules) return { type: 'object' };

        const properties: any = {};
        const required: string[] = [];

        Object.entries(validationRules).forEach(([field, rules]) => {
            const hasRequired = rules.some(rule => rule.type === 'required');
            if (hasRequired) {
                required.push(field);
            }

            properties[field] = this.getFieldSchema(rules);
        });

        return {
            type: 'object',
            properties,
            required,
        };
    }

    /**
     * 获取更新请求的Schema
     */
    private getUpdateSchema(validationRules?: Record<string, any[]>): any {
        if (!validationRules) return { type: 'object' };

        const properties: any = {};

        Object.entries(validationRules).forEach(([field, rules]) => {
            // 更新时移除required规则
            const updateRules = rules.filter(rule => rule.type !== 'required');
            if (updateRules.length > 0) {
                properties[field] = this.getFieldSchema(updateRules);
            }
        });

        return {
            type: 'object',
            properties,
        };
    }

    /**
     * 获取字段Schema
     */
    private getFieldSchema(rules: any[]): any {
        const schema: any = { type: 'string' };

        rules.forEach(rule => {
            switch (rule.type) {
                case 'minLength':
                    schema.minLength = rule.params;
                    break;
                case 'maxLength':
                    schema.maxLength = rule.params;
                    break;
                case 'email':
                    schema.format = 'email';
                    break;
                case 'numeric':
                    schema.type = 'number';
                    break;
                case 'boolean':
                    schema.type = 'boolean';
                    break;
                case 'array':
                    schema.type = 'array';
                    break;
                case 'object':
                    schema.type = 'object';
                    break;
            }
        });

        return schema;
    }
}

/**
 * 快速创建CRUD路由的工厂函数
 */
export function createCrudRoutes(
    app: FastifyInstance,
    prisma: PrismaClient,
    options: CrudRouteOptions
): void {
    const generator = new CrudRouteGenerator(app, prisma);
    generator.generateCrudRoutes(options);
}

/**
 * 预定义的CRUD配置
 */
export const CrudConfigs = {
    user: {
        model: null, // 需要在运行时设置
        resourceName: '用户',
        include: {
            userRoles: {
                include: {
                    role: {
                        select: {
                            id: true,
                            name: true,
                            displayName: true,
                        },
                    },
                },
            },
        },
        validationRules: ValidationRuleSets.user,
        searchFields: ['name', 'email'],
        permissions: {
            read: 'user:read',
            create: 'user:create',
            update: 'user:update',
            delete: 'user:delete',
        },
    },
    role: {
        model: null, // 需要在运行时设置
        resourceName: '角色',
        include: {
            permissions: {
                select: {
                    id: true,
                    name: true,
                    displayName: true,
                    resource: true,
                    action: true,
                },
            },
        },
        validationRules: ValidationRuleSets.role,
        searchFields: ['name', 'displayName', 'description'],
        permissions: {
            read: 'role:read',
            create: 'role:create',
            update: 'role:update',
            delete: 'role:delete',
        },
    },
    permission: {
        model: null, // 需要在运行时设置
        resourceName: '权限',
        validationRules: ValidationRuleSets.permission,
        searchFields: ['name', 'displayName', 'resource', 'action'],
        permissions: {
            read: 'permission:read',
            create: 'permission:create',
            update: 'permission:update',
            delete: 'permission:delete',
        },
    },
};
