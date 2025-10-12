/**
 * 大模型服务页面
 * 集成聊天界面和模型管理功能
 */

import { useEffect } from 'react';
import { Brain, MessageSquare, Settings, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChatInterface } from '@/components/llm/ChatInterface';
import { useLLMStore } from '@/store/llm';

export function LLMPage() {
  const {
    serviceStatus,
    models,
    isLoading,
    error,
    loadModels,
    checkServiceHealth,
    createSession
  } = useLLMStore();

  useEffect(() => {
    // 初始化时加载模型列表和检查服务健康状态
    loadModels();
    checkServiceHealth();
  }, [loadModels, checkServiceHealth]);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'unhealthy':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* 页面头部 */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Brain className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI助手</h1>
              <p className="text-gray-600">与智能助手进行对话交流</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* 服务状态 */}
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-gray-400" />
              <Badge className={getStatusColor(serviceStatus?.status)}>
                {serviceStatus?.status === 'healthy' ? '服务正常' : 
                 serviceStatus?.status === 'unhealthy' ? '服务异常' : '状态未知'}
              </Badge>
            </div>
            
            {/* 模型数量 */}
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {models.length} 个可用模型
              </span>
            </div>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-sm text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* 服务信息 */}
        {serviceStatus && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Settings className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-900">服务提供商</span>
                </div>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {serviceStatus.provider}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-900">服务状态</span>
                </div>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {serviceStatus.status === 'healthy' ? '正常' : 
                   serviceStatus.status === 'unhealthy' ? '异常' : '未知'}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-900">最后检查</span>
                </div>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {new Date(serviceStatus.lastCheck).toLocaleTimeString()}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* 聊天界面 */}
      <div className="flex-1 overflow-hidden">
        <ChatInterface />
      </div>
    </div>
  );
}
