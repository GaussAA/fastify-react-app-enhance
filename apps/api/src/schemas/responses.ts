/**
 * 统一的 API 响应状态码和 Schema 定义
 * 用于避免重复定义，便于统一管理和修改
 */

// 基础响应结构
const baseResponse = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    message: { type: 'string' },
  },
} as const;

/**
 * 通用响应状态码
 */
export const commonResponses = {
  success: baseResponse,
  error: baseResponse,
} as const;

/**
 * 用户相关响应状态码
 */
export const userResponses = {
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
  400: {
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
  detail: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      data: { type: 'object' },
      message: { type: 'string' },
    },
  },
  error: baseResponse,
} as const;

/**
 * 角色相关的响应状态码
 */
export const roleResponses = {
  list: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      data: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            name: { type: 'string' },
            displayName: { type: 'string' },
            description: { type: 'string' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            permissions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  name: { type: 'string' },
                  displayName: { type: 'string' },
                  resource: { type: 'string' },
                  action: { type: 'string' },
                },
              },
            },
          },
        },
      },
      message: { type: 'string' },
    },
  },
  detail: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      data: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          name: { type: 'string' },
          displayName: { type: 'string' },
          description: { type: 'string' },
          isActive: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          permissions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                name: { type: 'string' },
                displayName: { type: 'string' },
                resource: { type: 'string' },
                action: { type: 'string' },
              },
            },
          },
        },
      },
      message: { type: 'string' },
    },
  },
  create: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      data: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          name: { type: 'string' },
          displayName: { type: 'string' },
          description: { type: 'string' },
          isActive: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      message: { type: 'string' },
    },
  },
  update: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      data: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          name: { type: 'string' },
          displayName: { type: 'string' },
          description: { type: 'string' },
          isActive: { type: 'boolean' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      message: { type: 'string' },
    },
  },
  delete: baseResponse,
  assign: baseResponse,
  remove: baseResponse,
  error: baseResponse,
} as const;

/**
 * 权限相关的响应状态码
 */
export const permissionResponses = {
  list: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      data: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            name: { type: 'string' },
            displayName: { type: 'string' },
            description: { type: 'string' },
            resource: { type: 'string' },
            action: { type: 'string' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
      message: { type: 'string' },
    },
  },
  detail: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      data: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          name: { type: 'string' },
          displayName: { type: 'string' },
          description: { type: 'string' },
          resource: { type: 'string' },
          action: { type: 'string' },
          isActive: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      message: { type: 'string' },
    },
  },
  create: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      data: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          name: { type: 'string' },
          displayName: { type: 'string' },
          description: { type: 'string' },
          resource: { type: 'string' },
          action: { type: 'string' },
          isActive: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      message: { type: 'string' },
    },
  },
  update: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      data: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          name: { type: 'string' },
          displayName: { type: 'string' },
          description: { type: 'string' },
          resource: { type: 'string' },
          action: { type: 'string' },
          isActive: { type: 'boolean' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      message: { type: 'string' },
    },
  },
  delete: baseResponse,
  grouped: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      data: {
        type: 'object',
        additionalProperties: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              name: { type: 'string' },
              displayName: { type: 'string' },
              description: { type: 'string' },
              resource: { type: 'string' },
              action: { type: 'string' },
              isActive: { type: 'boolean' },
            },
          },
        },
      },
      message: { type: 'string' },
    },
  },
  error: baseResponse,
} as const;
