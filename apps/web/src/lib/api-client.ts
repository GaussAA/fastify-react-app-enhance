/**
 * 统一API客户端
 * 提供通用的API调用功能，避免重复代码
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
  errors?: string[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: string[];
}

export interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * API客户端基类
 */
export class BaseApiClient {
  protected baseURL: string;
  protected defaultHeaders: Record<string, string>;
  protected defaultTimeout: number;
  protected defaultRetries: number;
  protected defaultRetryDelay: number;

  constructor(
    baseURL: string,
    options: {
      defaultHeaders?: Record<string, string>;
      defaultTimeout?: number;
      defaultRetries?: number;
      defaultRetryDelay?: number;
    } = {}
  ) {
    this.baseURL = baseURL.replace(/\/$/, '');
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...options.defaultHeaders,
    };
    this.defaultTimeout = options.defaultTimeout || 30000;
    this.defaultRetries = options.defaultRetries || 3;
    this.defaultRetryDelay = options.defaultRetryDelay || 1000;
  }

  /**
   * 获取认证头
   */
  protected getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  /**
   * 构建URL
   */
  protected buildURL(endpoint: string, params?: Record<string, any>): string {
    const url = new URL(`${this.baseURL}${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  /**
   * 处理响应
   */
  protected async handleResponse<T>(
    response: Response
  ): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');

    let data: any;
    try {
      data = isJson ? await response.json() : await response.text();
    } catch {
      throw new Error('响应解析失败');
    }

    if (!response.ok) {
      const error: ApiError = {
        message: data.message || data.error || '请求失败',
        statusCode: response.status,
        errors: data.errors,
      };
      throw error;
    }

    return data;
  }

  /**
   * 延迟函数
   */
  protected delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 重试机制
   */
  protected async withRetry<T>(
    operation: () => Promise<T>,
    retries: number = this.defaultRetries,
    delay: number = this.defaultRetryDelay
  ): Promise<T> {
    let lastError: Error;

    for (let i = 0; i <= retries; i++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;

        // 如果是客户端错误（4xx），不重试
        if (
          error.statusCode &&
          error.statusCode >= 400 &&
          error.statusCode < 500
        ) {
          throw error;
        }

        // 最后一次尝试失败，抛出错误
        if (i === retries) {
          throw error;
        }

        // 等待后重试
        await this.delay(delay * Math.pow(2, i)); // 指数退避
      }
    }

    throw lastError!;
  }

  /**
   * 发送请求
   */
  protected async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.defaultTimeout,
      retries = this.defaultRetries,
      retryDelay = this.defaultRetryDelay,
    } = config;

    const operation = async (): Promise<ApiResponse<T>> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetch(this.buildURL(endpoint), {
          method,
          headers: {
            ...this.defaultHeaders,
            ...this.getAuthHeaders(),
            ...headers,
          },
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        return await this.handleResponse<T>(response);
      } catch (error: any) {
        clearTimeout(timeoutId);

        if (error.name === 'AbortError') {
          throw new Error('请求超时');
        }

        throw error;
      }
    };

    return this.withRetry(operation, retries, retryDelay);
  }

  /**
   * GET请求
   */
  async get<T>(
    endpoint: string,
    params?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    const url = params
      ? this.buildURL(endpoint, params)
      : this.buildURL(endpoint);
    return this.request<T>(url, {
      method: 'GET',
    });
  }

  /**
   * POST请求
   */
  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body,
    });
  }

  /**
   * PUT请求
   */
  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body,
    });
  }

  /**
   * DELETE请求
   */
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  /**
   * PATCH请求
   */
  async patch<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body,
    });
  }
}

/**
 * 分页API客户端
 */
export class PaginatedApiClient extends BaseApiClient {
  /**
   * 分页查询
   */
  async getPaginated<T>(
    endpoint: string,
    params: PaginationParams = {}
  ): Promise<ApiResponse<T[]>> {
    const queryParams: Record<string, any> = {};

    if (params.page) queryParams.page = params.page;
    if (params.limit) queryParams.limit = params.limit;
    if (params.search) queryParams.search = params.search;
    if (params.sortBy) queryParams.sortBy = params.sortBy;
    if (params.sortOrder) queryParams.sortOrder = params.sortOrder;

    return this.get<T[]>(endpoint, queryParams);
  }
}

/**
 * CRUD API客户端
 */
export class CrudApiClient<T> extends PaginatedApiClient {
  protected resourceEndpoint: string;

  constructor(
    baseURL: string,
    resourceEndpoint: string,
    options?: {
      defaultHeaders?: Record<string, string>;
      defaultTimeout?: number;
      defaultRetries?: number;
      defaultRetryDelay?: number;
    }
  ) {
    super(baseURL, options);
    this.resourceEndpoint = resourceEndpoint;
  }

  /**
   * 获取所有记录（分页）
   */
  async getAll(params: PaginationParams = {}): Promise<ApiResponse<T[]>> {
    return this.getPaginated<T>(this.resourceEndpoint, params);
  }

  /**
   * 根据ID获取记录
   */
  async getById(id: string | number): Promise<ApiResponse<T>> {
    return this.get<T>(`${this.resourceEndpoint}/${id}`);
  }

  /**
   * 创建记录
   */
  async create(data: Partial<T>): Promise<ApiResponse<T>> {
    return this.post<T>(this.resourceEndpoint, data);
  }

  /**
   * 更新记录
   */
  async update(id: string | number, data: Partial<T>): Promise<ApiResponse<T>> {
    return this.put<T>(`${this.resourceEndpoint}/${id}`, data);
  }

  /**
   * 删除记录
   */
  async deleteRecord(id: string | number): Promise<ApiResponse<void>> {
    return this.request<void>(`${this.resourceEndpoint}/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * 批量创建
   */
  async createMany(
    data: Partial<T>[]
  ): Promise<ApiResponse<{ count: number }>> {
    return this.post<{ count: number }>(`${this.resourceEndpoint}/batch`, {
      data,
    });
  }

  /**
   * 批量更新
   */
  async updateMany(
    ids: (string | number)[],
    data: Partial<T>
  ): Promise<ApiResponse<{ count: number }>> {
    return this.put<{ count: number }>(`${this.resourceEndpoint}/batch`, {
      ids,
      data,
    });
  }

  /**
   * 批量删除
   */
  async deleteMany(
    ids: (string | number)[]
  ): Promise<ApiResponse<{ count: number }>> {
    return this.request<{ count: number }>(`${this.resourceEndpoint}/batch`, {
      method: 'DELETE',
      body: { ids },
    });
  }
}

/**
 * 流式API客户端
 */
export class StreamingApiClient extends BaseApiClient {
  /**
   * 流式请求
   */
  async stream(
    endpoint: string,
    body?: any,
    onChunk?: (chunk: string) => void,
    onError?: (error: Error) => void,
    onComplete?: () => void
  ): Promise<void> {
    try {
      const response = await fetch(this.buildURL(endpoint), {
        method: 'POST',
        headers: {
          ...this.defaultHeaders,
          ...this.getAuthHeaders(),
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法获取响应流');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          onComplete?.();
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              onComplete?.();
              return;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.error) {
                onError?.(new Error(parsed.error.message || '流式请求错误'));
                return;
              }

              onChunk?.(parsed.content || data);
            } catch {
              onChunk?.(data);
            }
          }
        }
      }
    } catch (error: any) {
      onError?.(error);
    }
  }
}

/**
 * API客户端工厂
 */
export class ApiClientFactory {
  private static instances: Map<string, BaseApiClient> = new Map();

  /**
   * 获取API客户端实例
   */
  static getClient(
    name: string,
    baseURL: string,
    options?: {
      defaultHeaders?: Record<string, string>;
      defaultTimeout?: number;
      defaultRetries?: number;
      defaultRetryDelay?: number;
    }
  ): BaseApiClient {
    if (!this.instances.has(name)) {
      this.instances.set(name, new BaseApiClient(baseURL, options));
    }
    return this.instances.get(name)!;
  }

  /**
   * 获取CRUD客户端
   */
  static getCrudClient<T>(
    name: string,
    baseURL: string,
    resourceEndpoint: string,
    options?: {
      defaultHeaders?: Record<string, string>;
      defaultTimeout?: number;
      defaultRetries?: number;
      defaultRetryDelay?: number;
    }
  ): CrudApiClient<T> {
    const key = `${name}_crud_${resourceEndpoint}`;
    if (!this.instances.has(key)) {
      const client = new CrudApiClient<T>(baseURL, resourceEndpoint, options);
      this.instances.set(key, client as any);
    }
    return this.instances.get(key)! as CrudApiClient<T>;
  }

  /**
   * 获取流式客户端
   */
  static getStreamingClient(
    name: string,
    baseURL: string,
    options?: {
      defaultHeaders?: Record<string, string>;
      defaultTimeout?: number;
      defaultRetries?: number;
      defaultRetryDelay?: number;
    }
  ): StreamingApiClient {
    const key = `${name}_streaming`;
    if (!this.instances.has(key)) {
      this.instances.set(key, new StreamingApiClient(baseURL, options));
    }
    return this.instances.get(key)! as StreamingApiClient;
  }
}
