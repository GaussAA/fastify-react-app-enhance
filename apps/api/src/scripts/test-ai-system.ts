/**
 * AI系统测试脚本
 * 测试AI对话系统的各项功能
 */

import { PrismaClient } from '@prisma/client';
import { getAIIntegrationService } from '../services/ai-integration.service.js';

const prisma = new PrismaClient();

async function testAISystem() {
  console.log('🧪 开始测试AI系统...');

  try {
    // 初始化AI集成服务
    const aiService = getAIIntegrationService(prisma);

    // 等待服务初始化
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 1. 测试系统健康状态
    console.log('\n📊 测试系统健康状态...');
    const health = await aiService.getSystemHealth();
    console.log('系统状态:', health.status);
    console.log('服务状态:', health.services);
    console.log('性能指标:', health.metrics);

    // 2. 测试会话创建
    console.log('\n💬 测试会话创建...');
    const testUserId = 'test_user_123';
    const conversationRequest = {
      sessionId: '', // 将自动创建
      userId: testUserId,
      message: '你好，我想了解一下这个AI系统',
      options: {
        model: 'deepseek-chat',
        temperature: 0.7,
      },
    };

    try {
      const response = await aiService.processConversation(conversationRequest);
      console.log('✅ 对话处理成功');
      console.log('会话ID:', response.sessionId);
      console.log('AI回复:', response.response);
      console.log('识别意图:', response.intent);
      console.log('置信度:', response.confidence);
      console.log('质量得分:', response.qualityScore);
      console.log('处理时间:', response.processingTime + 'ms');

      // 3. 测试多轮对话
      console.log('\n🔄 测试多轮对话...');
      const followUpRequest = {
        sessionId: response.sessionId,
        userId: testUserId,
        message: '这个系统有哪些主要功能？',
        options: {
          model: 'deepseek-chat',
          temperature: 0.7,
        },
      };

      const followUpResponse =
        await aiService.processConversation(followUpRequest);
      console.log('✅ 多轮对话成功');
      console.log('AI回复:', followUpResponse.response);
      console.log('识别意图:', followUpResponse.intent);

      // 4. 测试性能统计
      console.log('\n📈 测试性能统计...');
      const stats = aiService.getPerformanceStats();
      console.log('性能统计:', stats);

      // 5. 测试不同意图
      console.log('\n🎯 测试不同意图识别...');
      const testMessages = [
        '谢谢你的帮助',
        '再见',
        '我需要技术支持',
        '这个系统怎么使用？',
      ];

      for (const message of testMessages) {
        const testRequest = {
          sessionId: response.sessionId,
          userId: testUserId,
          message,
          options: {
            model: 'deepseek-chat',
            temperature: 0.7,
          },
        };

        try {
          const testResponse = await aiService.processConversation(testRequest);
          console.log(
            `消息: "${message}" -> 意图: ${testResponse.intent} (置信度: ${testResponse.confidence})`
          );
        } catch (error) {
          console.error(`测试消息失败: "${message}"`, error);
        }
      }

      console.log('\n🎉 AI系统测试完成！');
    } catch (error) {
      console.error('❌ 对话测试失败:', error);
    }
  } catch (error) {
    console.error('❌ AI系统测试失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  testAISystem()
    .then(() => {
      console.log('✅ 测试脚本执行完成');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ 测试脚本执行失败:', error);
      process.exit(1);
    });
}

export { testAISystem };
