#!/usr/bin/env node

/**
 * API 文档自动生成脚本
 *
 * 功能：
 * 1. 扫描 API 路由和控制器
 * 2. 解析路由信息、参数、响应
 * 3. 生成 OpenAPI/Swagger 规范
 * 4. 生成 Markdown 文档
 * 5. 生成 TypeScript 类型定义
 */

import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
} from 'fs';
import { join, dirname, basename, relative } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class APIDocGenerator {
  constructor() {
    this.projectRoot = join(__dirname, '../../..');
    this.apiPath = join(this.projectRoot, 'apps', 'api', 'src');
    this.outputDir = join(this.projectRoot, 'docs', 'api');
    this.routes = [];
  }

  /**
   * 主执行函数
   */
  async generate() {
    console.log('🚀 开始生成 API 文档...');

    try {
      // 确保输出目录存在
      this.ensureOutputDir();

      // 扫描路由
      await this.scanRoutes();

      // 生成 OpenAPI 规范
      const openApiSpec = this.generateOpenAPISpec();

      // 生成文档
      await this.generateMarkdownDocs(openApiSpec);
      await this.generateOpenAPIFile(openApiSpec);
      await this.generateTypeDefinitions();

      console.log('✅ API 文档生成完成！');
      console.log(`📁 输出目录: ${this.outputDir}`);
    } catch (error) {
      console.error('❌ 生成 API 文档时出错:', error);
      process.exit(1);
    }
  }

  /**
   * 确保输出目录存在
   */
  ensureOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
      console.log(`📁 创建输出目录: ${this.outputDir}`);
    }
  }

  /**
   * 扫描 API 路由
   */
  async scanRoutes() {
    console.log('🔍 扫描 API 路由...');

    // 扫描路由文件
    const routesDir = path.join(this.apiPath, 'routes');
    if (fs.existsSync(routesDir)) {
      const routeFiles = fs
        .readdirSync(routesDir)
        .filter(file => file.endsWith('.ts'));

      for (const file of routeFiles) {
        await this.parseRouteFile(path.join(routesDir, file));
      }
    }

    // 添加根路由
    this.routes.push({
      method: 'GET',
      path: '/',
      handler: 'root',
      description: 'API 健康检查',
      responses: [
        {
          status: 200,
          description: 'API 运行正常',
          schema: {
            type: 'object',
            properties: {
              ok: { type: 'boolean' },
              message: { type: 'string' },
            },
          },
        },
      ],
    });

    console.log(`📋 发现 ${this.routes.length} 个路由`);
  }

  /**
   * 解析路由文件
   */
  async parseRouteFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const fileName = path.basename(filePath, '.ts');

    // 简单的路由解析
    const lines = content.split('\n');
    let currentPrefix = '';

    for (const line of lines) {
      // 查找路由前缀
      const prefixMatch = line.match(/prefix:\s*['"`]([^'"`]+)['"`]/);
      if (prefixMatch) {
        currentPrefix = prefixMatch[1];
      }

      // 查找路由定义
      const routeMatch = line.match(
        /app\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/
      );
      if (routeMatch) {
        const method = routeMatch[1].toUpperCase();
        const routePath = currentPrefix + routeMatch[2];
        const handler = this.extractHandlerName(line);

        this.routes.push({
          method,
          path: routePath,
          handler,
          description: this.generateDescription(method, routePath, handler),
          parameters: this.generateParameters(method, routePath),
          responses: this.generateResponses(method, routePath),
        });
      }
    }
  }

  /**
   * 提取处理器名称
   */
  extractHandlerName(line) {
    const match = line.match(/,\s*(\w+)\)/);
    return match ? match[1] : 'unknown';
  }

  /**
   * 生成路由描述
   */
  generateDescription(method, path, handler) {
    const pathParts = path.split('/').filter(p => p && !p.startsWith(':'));
    const resource = pathParts[pathParts.length - 1] || 'resource';

    const descriptions = {
      GET: `获取${resource}列表`,
      POST: `创建新的${resource}`,
      PUT: `更新${resource}`,
      DELETE: `删除${resource}`,
      PATCH: `部分更新${resource}`,
    };

    return descriptions[method] || `${method} ${path}`;
  }

  /**
   * 生成参数信息
   */
  generateParameters(method, path) {
    const parameters = [];

    // 路径参数
    const pathParams = path.match(/:(\w+)/g);
    if (pathParams) {
      pathParams.forEach(param => {
        parameters.push({
          name: param.substring(1),
          type: 'string',
          required: true,
          description: `${param.substring(1)} 标识符`,
          in: 'path',
        });
      });
    }

    // 请求体参数
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      parameters.push({
        name: 'body',
        type: 'object',
        required: true,
        description: '请求体数据',
        in: 'body',
      });
    }

    return parameters;
  }

  /**
   * 生成响应信息
   */
  generateResponses(method, path) {
    const responses = [];

    if (method === 'GET') {
      responses.push({
        status: 200,
        description: '成功获取数据',
        schema: { type: 'array', items: { type: 'object' } },
      });
    } else if (method === 'POST') {
      responses.push({
        status: 201,
        description: '成功创建资源',
        schema: { type: 'object' },
      });
    } else if (['PUT', 'PATCH'].includes(method)) {
      responses.push({
        status: 200,
        description: '成功更新资源',
        schema: { type: 'object' },
      });
    } else if (method === 'DELETE') {
      responses.push({
        status: 204,
        description: '成功删除资源',
      });
    }

    // 通用错误响应
    responses.push(
      { status: 400, description: '请求参数错误' },
      { status: 401, description: '未授权访问' },
      { status: 404, description: '资源不存在' },
      { status: 500, description: '服务器内部错误' }
    );

    return responses;
  }

  /**
   * 生成 OpenAPI 规范
   */
  generateOpenAPISpec() {
    const spec = {
      openapi: '3.0.0',
      info: {
        title: 'Fastify React App API',
        version: '1.0.0',
        description: 'Fastify + React 全栈应用 API 文档',
      },
      servers: [
        {
          url: 'http://localhost:8001',
          description: '开发环境',
        },
        {
          url: 'https://api.example.com',
          description: '生产环境',
        },
      ],
      paths: {},
      components: {
        schemas: {
          User: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              email: { type: 'string', format: 'email' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
          Error: {
            type: 'object',
            properties: {
              error: { type: 'string' },
              message: { type: 'string' },
              statusCode: { type: 'number' },
            },
          },
        },
      },
    };

    // 构建路径
    this.routes.forEach(route => {
      if (!spec.paths[route.path]) {
        spec.paths[route.path] = {};
      }

      spec.paths[route.path][route.method.toLowerCase()] = {
        summary: route.description,
        tags: route.tags || [this.getTagFromPath(route.path)],
        parameters: route.parameters?.map(param => ({
          name: param.name,
          in: param.in,
          required: param.required,
          description: param.description,
          schema: { type: param.type },
        })),
        responses: route.responses?.reduce((acc, response) => {
          acc[response.status.toString()] = {
            description: response.description,
            content: response.schema
              ? {
                  'application/json': {
                    schema: response.schema,
                  },
                }
              : undefined,
          };
          return acc;
        }, {}),
      };
    });

    return spec;
  }

  /**
   * 从路径获取标签
   */
  getTagFromPath(path) {
    const parts = path.split('/').filter(p => p && !p.startsWith(':'));
    return parts[0] || 'General';
  }

  /**
   * 生成 Markdown 文档
   */
  async generateMarkdownDocs(spec) {
    console.log('📝 生成 Markdown 文档...');

    let markdown = `# ${spec.info.title}\n\n`;
    markdown += `${spec.info.description}\n\n`;
    markdown += `**版本**: ${spec.info.version}\n\n`;

    // 服务器信息
    markdown += `## 🌐 服务器\n\n`;
    spec.servers.forEach(server => {
      markdown += `- **${server.description}**: \`${server.url}\`\n`;
    });
    markdown += '\n';

    // API 端点
    markdown += `## 📋 API 端点\n\n`;

    const groupedPaths = this.groupPathsByTag(spec.paths);

    Object.entries(groupedPaths).forEach(([tag, paths]) => {
      markdown += `### ${tag}\n\n`;

      Object.entries(paths).forEach(([path, methods]) => {
        Object.entries(methods).forEach(([method, operation]) => {
          const methodUpper = method.toUpperCase();
          const emoji = this.getMethodEmoji(methodUpper);

          markdown += `#### ${emoji} \`${methodUpper}\` ${path}\n\n`;
          markdown += `${operation.summary}\n\n`;

          // 参数
          if (operation.parameters && operation.parameters.length > 0) {
            markdown += `**参数**:\n\n`;
            markdown += `| 参数名 | 类型 | 位置 | 必需 | 描述 |\n`;
            markdown += `|--------|------|------|------|------|\n`;

            operation.parameters.forEach(param => {
              markdown += `| ${param.name} | ${param.schema.type} | ${param.in} | ${param.required ? '是' : '否'} | ${param.description || '-'} |\n`;
            });
            markdown += '\n';
          }

          // 响应
          if (operation.responses) {
            markdown += `**响应**:\n\n`;
            Object.entries(operation.responses).forEach(
              ([status, response]) => {
                markdown += `- **${status}**: ${response.description}\n`;
              }
            );
            markdown += '\n';
          }

          markdown += '---\n\n';
        });
      });
    });

    // 数据模型
    if (spec.components?.schemas) {
      markdown += `## 📊 数据模型\n\n`;
      Object.entries(spec.components.schemas).forEach(([name, schema]) => {
        markdown += `### ${name}\n\n`;
        markdown += `\`\`\`json\n${JSON.stringify(schema, null, 2)}\n\`\`\`\n\n`;
      });
    }

    // 写入文件
    const outputPath = path.join(this.outputDir, 'README.md');
    fs.writeFileSync(outputPath, markdown, 'utf-8');
    console.log(`📄 生成 Markdown 文档: ${outputPath}`);
  }

  /**
   * 按标签分组路径
   */
  groupPathsByTag(paths) {
    const grouped = {};

    Object.entries(paths).forEach(([path, methods]) => {
      Object.entries(methods).forEach(([method, operation]) => {
        const tag = operation.tags?.[0] || 'General';

        if (!grouped[tag]) {
          grouped[tag] = {};
        }

        if (!grouped[tag][path]) {
          grouped[tag][path] = {};
        }

        grouped[tag][path][method] = operation;
      });
    });

    return grouped;
  }

  /**
   * 获取方法对应的 emoji
   */
  getMethodEmoji(method) {
    const emojis = {
      GET: '📖',
      POST: '➕',
      PUT: '✏️',
      PATCH: '🔧',
      DELETE: '🗑️',
    };
    return emojis[method] || '📋';
  }

  /**
   * 生成 OpenAPI JSON 文件
   */
  async generateOpenAPIFile(spec) {
    console.log('📄 生成 OpenAPI 规范文件...');

    const outputPath = path.join(this.outputDir, 'openapi.json');
    fs.writeFileSync(outputPath, JSON.stringify(spec, null, 2), 'utf-8');
    console.log(`📄 生成 OpenAPI 规范: ${outputPath}`);
  }

  /**
   * 生成 TypeScript 类型定义
   */
  async generateTypeDefinitions() {
    console.log('🔧 生成 TypeScript 类型定义...');

    const types = `/**
 * API 类型定义
 * 自动生成于: ${new Date().toISOString()}
 */

// 用户相关类型
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
}

// API 响应类型
export interface ApiResponse<T = any> {
  ok: boolean;
  message: string;
  data?: T;
}

export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
}

// 分页类型
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API 端点类型
export type ApiEndpoints = {
  'GET /': ApiResponse;
  'GET /api/users': User[];
  'POST /api/users': User;
  'PUT /api/users/:id': User;
  'DELETE /api/users/:id': void;
};
`;

    const outputPath = path.join(this.outputDir, 'types.ts');
    fs.writeFileSync(outputPath, types, 'utf-8');
    console.log(`📄 生成 TypeScript 类型: ${outputPath}`);
  }
}

// 执行生成
const generator = new APIDocGenerator();
generator.generate().catch(console.error);

export { APIDocGenerator };
