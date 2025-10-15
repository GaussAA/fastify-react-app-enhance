/**
 * AI会话管理API客户端
 * 提供与后端AI对话系统的完整集成
 */

export interface AISession {
  id: string;
  userId: string;
  status: 'active' | 'idle' | 'expired' | 'terminated';
  context: Record<string, any>;
  metadata: {
    createdAt: Date;
    lastActivity: Date;
    messageCount: number;
    totalTokens: number;
    model: string;
    temperature: number;
  };
  conversationHistory: ConversationMessage[];
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface CreateSessionRequest {
  userId: string;
  options?: {
    model?: string;
    temperature?: number;
    context?: Record<string, any>;
  };
}

export interface ConversationRequest {
  sessionId?: string;
  userId: string;
  message: string;
  options?: {
    model?: string;
    temperature?: number;
    context?: Record<string, any>;
  };
}

export interface ConversationResponse {
  sessionId: string;
  message: ConversationMessage;
  response: ConversationMessage;
  context: Record<string, any>;
  metadata: {
    tokensUsed: number;
    processingTime: number;
    model: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  error?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  `http://${import.meta.env.VITE_API_HOST || 'localhost'}:${import.meta.env.VITE_API_PORT || '10000'}`;

class AISessionApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  // 获取认证头
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // 获取认证头（不包含Content-Type，用于DELETE等请求）
  private getAuthHeadersWithoutContentType(): Record<string, string> {
    const token = localStorage.getItem('accessToken');
    return {
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // 处理API响应
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: 'Unknown error' }));
      throw new Error(
        errorData.error || errorData.message || `HTTP ${response.status}`
      );
    }

    // 安全地解析JSON响应
    let data: ApiResponse<T>;
    try {
      const responseText = await response.text();
      if (!responseText.trim()) {
        throw new Error('Empty response from server');
      }
      data = JSON.parse(responseText);
    } catch (parseError: any) {
      throw new Error(`Invalid JSON response: ${parseError.message}`);
    }

    if (!data.success) {
      throw new Error(data.error || data.message || 'API request failed');
    }

    // 对于void类型的响应（如删除操作），返回undefined
    if (data.data === null || data.data === undefined) {
      return undefined as T;
    }

    return data.data as T;
  }

  // 创建新会话
  async createSession(request: CreateSessionRequest): Promise<{
    sessionId: string;
    userId: string;
    status: string;
    createdAt: Date;
  }> {
    const response = await fetch(`${this.baseURL}/api/ai/session`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request),
    });

    return this.handleResponse(response);
  }

  // 获取会话信息
  async getSession(sessionId: string): Promise<{
    id: string;
    userId: string;
    status: string;
    context: Record<string, any>;
    metadata: any;
    messageCount: number;
  }> {
    const response = await fetch(
      `${this.baseURL}/api/ai/session/${sessionId}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      }
    );

    return this.handleResponse(response);
  }

  // 获取用户的所有会话
  async getUserSessions(userId: string): Promise<
    Array<{
      id: string;
      status: string;
      messageCount: number;
      lastActivity: Date;
      createdAt: Date;
    }>
  > {
    const response = await fetch(`${this.baseURL}/api/ai/sessions/${userId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  // 处理对话
  async processConversation(
    request: ConversationRequest
  ): Promise<ConversationResponse> {
    const response = await fetch(`${this.baseURL}/api/ai/conversation`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request),
    });

    return this.handleResponse(response);
  }

  // 终止会话
  async terminateSession(sessionId: string): Promise<void> {
    const response = await fetch(
      `${this.baseURL}/api/ai/session/${sessionId}`,
      {
        method: 'DELETE',
        headers: this.getAuthHeadersWithoutContentType(),
      }
    );

    await this.handleResponse(response);
  }

  // 系统健康检查
  async healthCheck(): Promise<{
    status: string;
    services: Record<string, boolean>;
    uptime: number;
    version: string;
  }> {
    const response = await fetch(`${this.baseURL}/api/ai/health`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  // 获取系统统计
  async getStats(): Promise<{
    performance: any;
    sessions: any;
    dialogues: any;
  }> {
    const response = await fetch(`${this.baseURL}/api/ai/stats`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }
}

// 创建默认实例
export const aiSessionApiClient = new AISessionApiClient();

// 导出类以便自定义实例
export { AISessionApiClient };
