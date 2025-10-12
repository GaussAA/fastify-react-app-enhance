/**
 * 简单的LLM服务测试脚本
 */

const API_BASE_URL = 'http://localhost:8001';

async function testLLMService() {
  console.log('🚀 开始测试LLM服务...\n');

  try {
    // 测试健康检查
    console.log('1. 测试健康检查...');
    const healthResponse = await fetch(`${API_BASE_URL}/api/llm/health`);
    const healthData = await healthResponse.json();
    console.log('健康检查结果:', healthData);
    console.log('');

    // 测试获取支持的提供商
    console.log('2. 测试获取支持的提供商...');
    const providersResponse = await fetch(`${API_BASE_URL}/api/llm/providers`);
    const providersData = await providersResponse.json();
    console.log('支持的提供商:', providersData);
    console.log('');

    // 测试获取模型列表
    console.log('3. 测试获取模型列表...');
    const modelsResponse = await fetch(`${API_BASE_URL}/api/llm/models`);
    const modelsData = await modelsResponse.json();
    console.log('模型列表:', modelsData);
    console.log('');

    // 测试聊天接口
    console.log('4. 测试聊天接口...');
    const chatResponse = await fetch(`${API_BASE_URL}/api/llm/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: '你好，请简单介绍一下自己'
          }
        ],
        model: 'deepseek-chat',
        temperature: 0.7,
        max_tokens: 100
      })
    });
    
    const chatData = await chatResponse.json();
    console.log('聊天响应:', chatData);
    console.log('');

    console.log('✅ LLM服务测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.log('\n请确保：');
    console.log('1. 后端服务正在运行 (pnpm --filter fastify-api run dev)');
    console.log('2. 已配置正确的DeepSeek API密钥');
    console.log('3. 网络连接正常');
  }
}

// 运行测试
testLLMService();
