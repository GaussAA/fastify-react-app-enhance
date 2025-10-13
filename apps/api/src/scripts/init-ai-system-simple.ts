/**
 * AI系统简化初始化脚本
 * 初始化数据库表、知识库数据，不依赖LLM API
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function initializeAISystemSimple() {
    console.log('🚀 开始初始化AI系统（简化版）...');

    try {
        // 1. 检查数据库连接
        console.log('📊 检查数据库连接...');
        await prisma.$connect();
        console.log('✅ 数据库连接成功');

        // 2. 初始化知识库数据
        console.log('📚 初始化知识库数据...');
        await initializeKnowledgeBase();
        console.log('✅ 知识库数据初始化完成');

        // 3. 创建示例数据
        console.log('📝 创建示例数据...');
        await createSampleData();
        console.log('✅ 示例数据创建完成');

        console.log('🎉 AI系统初始化完成！');

    } catch (error) {
        console.error('❌ AI系统初始化失败:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

async function initializeKnowledgeBase() {
    const knowledgeEntries = [
        {
            title: '系统功能介绍',
            content: '本AI系统提供智能对话、意图识别、知识库查询等功能。支持多轮对话、会话管理和质量监控。',
            category: 'system',
            tags: ['系统', '功能', '介绍'],
            metadata: { priority: 'high', version: '1.0' }
        },
        {
            title: '如何使用对话功能',
            content: '用户可以直接发送消息与AI进行对话。系统会自动识别用户意图，提供相关回答。支持上下文理解和多轮对话。',
            category: 'usage',
            tags: ['使用', '对话', '指南'],
            metadata: { priority: 'high', version: '1.0' }
        },
        {
            title: '会话管理说明',
            content: '系统会自动管理用户会话，包括会话创建、超时处理、状态跟踪等。每个会话都有独立的上下文和状态。',
            category: 'session',
            tags: ['会话', '管理', '说明'],
            metadata: { priority: 'medium', version: '1.0' }
        },
        {
            title: '意图识别功能',
            content: '系统能够识别用户的意图，包括问候、问题、请求、感谢等。基于规则和模式匹配进行意图识别。',
            category: 'intent',
            tags: ['意图', '识别', '功能'],
            metadata: { priority: 'medium', version: '1.0' }
        },
        {
            title: '知识库查询',
            content: '系统内置知识库，可以根据用户问题搜索相关信息。支持按类别、标签和相关性进行搜索。',
            category: 'knowledge',
            tags: ['知识库', '查询', '搜索'],
            metadata: { priority: 'medium', version: '1.0' }
        },
        {
            title: '质量监控机制',
            content: '系统会监控对话质量，包括响应时间、相关性、完整性等指标。提供质量报告和改进建议。',
            category: 'quality',
            tags: ['质量', '监控', '指标'],
            metadata: { priority: 'low', version: '1.0' }
        },
        {
            title: '常见问题解答',
            content: 'Q: 如何开始对话？A: 直接发送消息即可开始对话。Q: 如何结束会话？A: 会话会自动超时或手动终止。',
            category: 'faq',
            tags: ['常见问题', '解答', 'FAQ'],
            metadata: { priority: 'high', version: '1.0' }
        },
        {
            title: '技术支持',
            content: '如遇到技术问题，请联系技术支持团队。系统提供详细的错误日志和性能监控信息。',
            category: 'support',
            tags: ['技术支持', '帮助', '联系'],
            metadata: { priority: 'medium', version: '1.0' }
        }
    ];

    for (const entry of knowledgeEntries) {
        try {
            await prisma.knowledgeBase.upsert({
                where: { title: entry.title },
                update: entry,
                create: entry
            });
        } catch (error) {
            console.warn(`⚠️ 知识库条目创建失败: ${entry.title}`, error);
        }
    }
}

async function createSampleData() {
    // 创建示例用户（如果不存在）
    const sampleUser = await prisma.user.upsert({
        where: { email: 'demo@example.com' },
        update: {},
        create: {
            email: 'demo@example.com',
            username: 'demo_user',
            password: 'hashed_password', // 实际应用中应该使用加密密码
            isVerified: true
        }
    });

    console.log(`📝 示例用户创建/更新: ${sampleUser.username}`);

    // 创建示例会话
    const sampleSession = await prisma.chatSession.create({
        data: {
            userId: sampleUser.id,
            status: 'active',
            context: {
                demo: true,
                initialized: new Date().toISOString()
            },
            metadata: {
                createdAt: new Date(),
                lastActivity: new Date(),
                messageCount: 0,
                totalTokens: 0,
                model: 'deepseek-chat',
                temperature: 0.7
            },
            conversationHistory: []
        }
    });

    console.log(`📝 示例会话创建: ${sampleSession.id}`);
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
    initializeAISystemSimple()
        .then(() => {
            console.log('✅ 初始化脚本执行完成');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ 初始化脚本执行失败:', error);
            process.exit(1);
        });
}

export { initializeAISystemSimple };
