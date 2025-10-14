/**
 * 大模型服务页面
 * 集成聊天界面和模型管理功能
 */

import { useEffect } from 'react';
import { DeepSeekChatInterface } from '@/components/llm/DeepSeekChatInterface';
import { useLLMStore } from '@/store/llm';

export function LLMPage() {
  const { error, loadModels, checkServiceHealth } = useLLMStore();

  useEffect(() => {
    // 初始化时加载模型列表和检查服务健康状态
    loadModels();
    checkServiceHealth();
  }, [loadModels, checkServiceHealth]);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 m-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* 主内容区域 */}
      <div className="flex-1 overflow-hidden">
        <DeepSeekChatInterface />
      </div>
    </div>
  );
}
