/**
 * AI核心功能服务
 * 实现意图识别、知识库查询、质量监控等基础AI功能
 */

import { PrismaClient } from '@prisma/client';
import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

export interface IntentRecognitionResult {
  intent: string;
  confidence: number;
  entities: Record<string, any>;
  slots: Record<string, any>;
  alternatives: Array<{
    intent: string;
    confidence: number;
  }>;
  processingTime: number;
}

export interface KnowledgeBaseEntry {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  relevanceScore: number;
  metadata: Record<string, any>;
}

export interface KnowledgeSearchResult {
  query: string;
  results: KnowledgeBaseEntry[];
  totalResults: number;
  searchTime: number;
  suggestions: string[];
}

export interface QualityMetrics {
  responseTime: number;
  relevanceScore: number;
  completenessScore: number;
  clarityScore: number;
  userSatisfaction?: number;
  errorRate: number;
  contextConsistency: number;
}

export interface QualityReport {
  sessionId: string;
  messageId: string;
  overallScore: number;
  metrics: QualityMetrics;
  recommendations: string[];
  timestamp: Date;
}

export class AICoreService extends EventEmitter {
  private prisma: PrismaClient;
  private intentPatterns: Map<string, RegExp[]> = new Map();
  private knowledgeCache: Map<string, KnowledgeBaseEntry[]> = new Map();
  private qualityThresholds: {
    responseTime: number;
    relevanceScore: number;
    completenessScore: number;
    clarityScore: number;
  };

  constructor(prisma: PrismaClient) {
    super();
    this.prisma = prisma;
    this.qualityThresholds = {
      responseTime: 5000, // 5秒
      relevanceScore: 0.7,
      completenessScore: 0.8,
      clarityScore: 0.7,
    };

    this.initializeIntentPatterns();
    this.loadKnowledgeBase();
  }

  /**
   * 意图识别
   */
  async recognizeIntent(
    text: string,
    context: Record<string, any> = {},
    sessionId?: string
  ): Promise<IntentRecognitionResult> {
    const startTime = Date.now();

    try {
      // 预处理文本
      const processedText = this.preprocessText(text);

      // 多层级意图识别
      const results = await Promise.all([
        this.ruleBasedRecognition(processedText, context),
        this.patternBasedRecognition(processedText),
        this.contextBasedRecognition(processedText, context),
      ]);

      // 融合结果
      const finalResult = this.fuseIntentResults(results, processedText);

      // 记录识别结果
      if (sessionId) {
        await this.recordIntentRecognition(sessionId, text, finalResult);
      }

      const processingTime = Date.now() - startTime;

      return {
        ...finalResult,
        processingTime,
      };
    } catch (error) {
      console.error('Intent recognition error:', error);
      return {
        intent: 'unknown',
        confidence: 0.0,
        entities: {},
        slots: {},
        alternatives: [],
        processingTime: Date.now() - startTime,
      };
    }
  }

  /**
   * 基于规则的意图识别
   */
  private async ruleBasedRecognition(
    text: string,
    _context: Record<string, any>
  ): Promise<Partial<IntentRecognitionResult>> {
    if (!text || typeof text !== 'string') {
      return {
        intent: 'general',
        confidence: 0.5,
        entities: {},
        slots: {},
      };
    }

    const lowerText = text.toLowerCase();

    // 问候意图
    if (
      this.matchesPatterns(lowerText, [
        '你好',
        'hello',
        'hi',
        '嗨',
        '早上好',
        '下午好',
        '晚上好',
      ])
    ) {
      return {
        intent: 'greeting',
        confidence: 0.9,
        entities: this.extractTimeEntities(text),
        slots: {},
      };
    }

    // 告别意图
    if (
      this.matchesPatterns(lowerText, [
        '再见',
        'bye',
        'goodbye',
        '拜拜',
        '晚安',
      ])
    ) {
      return {
        intent: 'farewell',
        confidence: 0.9,
        entities: {},
        slots: {},
      };
    }

    // 帮助请求
    if (
      this.matchesPatterns(lowerText, [
        '帮助',
        'help',
        '怎么用',
        '如何使用',
        '不会',
        '不懂',
      ])
    ) {
      return {
        intent: 'help_request',
        confidence: 0.8,
        entities: {},
        slots: {},
      };
    }

    // 问题询问
    if (
      this.matchesPatterns(lowerText, [
        '什么',
        '怎么',
        '为什么',
        '如何',
        '？',
        '?',
        '吗',
      ])
    ) {
      return {
        intent: 'question',
        confidence: 0.7,
        entities: this.extractQuestionEntities(text),
        slots: this.extractQuestionSlots(text),
      };
    }

    // 感谢意图
    if (
      this.matchesPatterns(lowerText, [
        '谢谢',
        'thank',
        'thanks',
        '感谢',
        '多谢',
      ])
    ) {
      return {
        intent: 'thanks',
        confidence: 0.8,
        entities: {},
        slots: {},
      };
    }

    // 抱怨意图
    if (
      this.matchesPatterns(lowerText, [
        '不好',
        '不行',
        '错误',
        '问题',
        'bug',
        '故障',
      ])
    ) {
      return {
        intent: 'complaint',
        confidence: 0.7,
        entities: this.extractComplaintEntities(text),
        slots: {},
      };
    }

    // 请求意图
    if (
      this.matchesPatterns(lowerText, [
        '请',
        '能不能',
        '可以',
        '能否',
        '希望',
        '想要',
      ])
    ) {
      return {
        intent: 'request',
        confidence: 0.6,
        entities: this.extractRequestEntities(text),
        slots: this.extractRequestSlots(text),
      };
    }

    return {
      intent: 'general',
      confidence: 0.5,
      entities: {},
      slots: {},
    };
  }

  /**
   * 基于模式的意图识别
   */
  private async patternBasedRecognition(
    text: string
  ): Promise<Partial<IntentRecognitionResult>> {
    const patterns = this.intentPatterns;
    let bestMatch = { intent: 'general', confidence: 0.0 };

    for (const [intent, regexPatterns] of patterns) {
      for (const pattern of regexPatterns) {
        if (pattern.test(text)) {
          const confidence = this.calculatePatternConfidence(text, pattern);
          if (confidence > bestMatch.confidence) {
            bestMatch = { intent, confidence };
          }
        }
      }
    }

    return bestMatch;
  }

  /**
   * 基于上下文的意图识别
   */
  private async contextBasedRecognition(
    text: string,
    context: Record<string, any>
  ): Promise<Partial<IntentRecognitionResult>> {
    // 基于对话历史的上下文分析
    const lastIntent = context.lastIntent;
    const conversationHistory = context.conversationHistory || [];

    // 如果上一个意图是问题，当前可能是追问
    if (lastIntent === 'question' && this.isFollowUpQuestion(text)) {
      return {
        intent: 'follow_up_question',
        confidence: 0.7,
        entities: {},
        slots: {},
      };
    }

    // 如果对话刚开始，可能是问候
    if (conversationHistory.length === 0 && this.isGreeting(text)) {
      return {
        intent: 'greeting',
        confidence: 0.8,
        entities: {},
        slots: {},
      };
    }

    return {
      intent: 'general',
      confidence: 0.3,
      entities: {},
      slots: {},
    };
  }

  /**
   * 融合意图识别结果
   */
  private fuseIntentResults(
    results: Partial<IntentRecognitionResult>[],
    _text: string
  ): IntentRecognitionResult {
    // 简单的加权融合策略
    const intentScores: Record<string, number> = {};
    const entityMaps: Record<string, any>[] = [];
    const slotMaps: Record<string, any>[] = [];

    results.forEach((result, index) => {
      if (result.intent && result.confidence) {
        const weight = [0.5, 0.3, 0.2][index] || 0.1; // 权重分配
        intentScores[result.intent] =
          (intentScores[result.intent] || 0) + result.confidence * weight;
      }

      if (result.entities) entityMaps.push(result.entities);
      if (result.slots) slotMaps.push(result.slots);
    });

    // 选择得分最高的意图
    const bestIntent = Object.entries(intentScores).sort(
      ([, a], [, b]) => b - a
    )[0];

    // 合并实体和槽位
    const mergedEntities = this.mergeEntities(entityMaps);
    const mergedSlots = this.mergeSlots(slotMaps);

    return {
      intent: bestIntent ? bestIntent[0] : 'general',
      confidence: bestIntent ? bestIntent[1] : 0.5,
      entities: mergedEntities,
      slots: mergedSlots,
      alternatives: Object.entries(intentScores)
        .filter(([intent]) => intent !== bestIntent?.[0])
        .map(([intent, score]) => ({ intent, confidence: score }))
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 3),
      processingTime: 0, // 简化实现
    };
  }

  /**
   * 知识库查询
   */
  async searchKnowledgeBase(
    query: string,
    options: {
      category?: string;
      limit?: number;
      minRelevance?: number;
    } = {}
  ): Promise<KnowledgeSearchResult> {
    const startTime = Date.now();

    try {
      const { category, limit = 10, minRelevance = 0.3 } = options;

      // 预处理查询
      const processedQuery = this.preprocessText(query);
      const keywords = this.extractKeywords(processedQuery);

      // 构建搜索条件
      const whereClause: any = {
        isActive: true,
        ...(category && { category }),
      };

      // 执行数据库查询
      const entries = await this.prisma.knowledgeBase.findMany({
        where: whereClause,
        take: limit * 2, // 获取更多结果用于评分
        orderBy: { updatedAt: 'desc' },
      });

      // 计算相关性得分
      const scoredEntries = entries.map((entry: any) => ({
        ...entry,
        relevanceScore: this.calculateRelevanceScore(
          entry as unknown as KnowledgeBaseEntry,
          keywords,
          [],
          processedQuery
        ),
      })) as KnowledgeBaseEntry[];

      // 过滤和排序
      const filteredEntries = scoredEntries
        .filter((entry: any) => entry.relevanceScore >= minRelevance)
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, limit);

      // 生成建议
      const suggestions = this.generateSearchSuggestions(
        keywords,
        filteredEntries
      );

      const searchTime = Date.now() - startTime;

      return {
        query,
        results: filteredEntries as KnowledgeBaseEntry[],
        totalResults: filteredEntries.length,
        searchTime,
        suggestions,
      };
    } catch (error) {
      console.error('Knowledge base search error:', error);
      return {
        query,
        results: [],
        totalResults: 0,
        searchTime: Date.now() - startTime,
        suggestions: [],
      };
    }
  }

  /**
   * 质量监控
   */
  async monitorQuality(
    sessionId: string,
    messageId: string,
    userInput: string,
    aiResponse: string,
    keywords: string[],
    alternatives: string[],
    query: string,
    metrics: Partial<QualityMetrics> = {}
  ): Promise<QualityReport> {
    try {
      // 计算质量指标
      const qualityMetrics: QualityMetrics = {
        responseTime: metrics.responseTime || 0,
        relevanceScore: await this.calculateRelevanceScore(
          userInput as unknown as KnowledgeBaseEntry,
          keywords,
          alternatives,
          query
        ),
        completenessScore: await this.calculateCompletenessScore(
          userInput as unknown as KnowledgeBaseEntry,
          keywords,
          alternatives,
          query
        ),
        clarityScore: await this.calculateClarityScore(
          aiResponse as unknown as KnowledgeBaseEntry,
          keywords,
          alternatives,
          query
        ),
        errorRate: await this.calculateErrorRate(
          aiResponse as unknown as KnowledgeBaseEntry,
          keywords,
          alternatives,
          query
        ),
        contextConsistency: await this.calculateContextConsistency(
          sessionId as unknown as KnowledgeBaseEntry,
          keywords,
          alternatives,
          query
        ),
        ...metrics,
      };

      // 计算总体得分
      const overallScore = this.calculateOverallScore(qualityMetrics);

      // 生成建议
      const recommendations =
        this.generateQualityRecommendations(qualityMetrics);

      const report: QualityReport = {
        sessionId,
        messageId,
        overallScore,
        metrics: qualityMetrics,
        recommendations,
        timestamp: new Date(),
      };

      // 保存质量报告
      await this.saveQualityReport(report);

      // 触发质量事件
      this.emit('qualityReported', report);

      return report;
    } catch (error) {
      console.error('Quality monitoring error:', error);
      throw error;
    }
  }

  /**
   * 初始化意图模式
   */
  private initializeIntentPatterns(): void {
    this.intentPatterns.set('greeting', [
      /^(你好|hello|hi|嗨)/i,
      /(早上好|下午好|晚上好)/i,
    ]);

    this.intentPatterns.set('farewell', [/(再见|bye|goodbye|拜拜|晚安)$/i]);

    this.intentPatterns.set('help_request', [
      /(帮助|help|怎么用|如何使用|不会|不懂)/i,
    ]);

    this.intentPatterns.set('question', [/(什么|怎么|为什么|如何|？|\?|吗)/i]);

    this.intentPatterns.set('thanks', [/(谢谢|thank|thanks|感谢|多谢)/i]);
  }

  /**
   * 加载知识库
   */
  private async loadKnowledgeBase(): Promise<void> {
    try {
      const entries = await this.prisma.knowledgeBase.findMany({
        where: { isActive: true },
        take: 1000, // 限制加载数量
      });

      // 按类别缓存
      const categoryCache: Record<string, KnowledgeBaseEntry[]> = {};
      entries.forEach((entry: any) => {
        if (!categoryCache[entry.category]) {
          categoryCache[entry.category] = [];
        }
        categoryCache[entry.category].push(
          entry as unknown as KnowledgeBaseEntry
        );
      });

      // 更新缓存
      Object.entries(categoryCache).forEach(([category, entries]) => {
        this.knowledgeCache.set(category, entries);
      });

      console.log(`Loaded ${entries.length} knowledge base entries`);
    } catch (error) {
      console.error('Failed to load knowledge base:', error);
    }
  }

  /**
   * 预处理文本
   */
  private preprocessText(text: string): string {
    if (!text || typeof text !== 'string') {
      return '';
    }

    return text
      .toLowerCase()
      .replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, ' ') // 移除特殊字符
      .replace(/\s+/g, ' ') // 合并多个空格
      .trim();
  }

  /**
   * 模式匹配
   */
  private matchesPatterns(text: string, patterns: string[]): boolean {
    return patterns.some((pattern: string) => text.includes(pattern));
  }

  /**
   * 提取关键词
   */
  private extractKeywords(text: string): string[] {
    // 简单的关键词提取，可以集成更复杂的NLP算法
    const words = text.split(' ').filter((word: string) => word.length > 1);
    return [...new Set(words)]; // 去重
  }

  /**
   * 计算相关性得分
   */
  private calculateRelevanceScore(
    entry: KnowledgeBaseEntry,
    keywords: string[],
    alternatives: string[],
    query: string
  ): number {
    let score = 0;
    const content = (entry.title + ' ' + entry.content).toLowerCase();

    // 关键词匹配得分
    keywords.forEach((keyword: string) => {
      if (content.includes(keyword) || alternatives.includes(keyword)) {
        score += 0.1;
      }
    });

    // 标题匹配得分更高
    if (
      entry.title.toLowerCase().includes(query.toLowerCase()) ||
      alternatives.includes(entry.title.toLowerCase())
    ) {
      score += 0.3;
    }

    // 内容匹配得分
    if (
      entry.content.toLowerCase().includes(query.toLowerCase()) ||
      alternatives.includes(entry.content.toLowerCase())
    ) {
      score += 0.2;
    }

    // 标签匹配得分
    entry.tags.forEach((tag: any) => {
      if (keywords.includes(tag) || alternatives.includes(tag)) {
        score += 0.15;
      }
    });

    return Math.min(score, 1.0);
  }

  /**
   * 计算总体质量得分
   */
  private calculateOverallScore(metrics: QualityMetrics): number {
    const weights = {
      responseTime: 0.1,
      relevanceScore: 0.3,
      completenessScore: 0.25,
      clarityScore: 0.2,
      errorRate: 0.1,
      contextConsistency: 0.05,
    };

    let score = 0;

    // 响应时间得分（越短越好）
    const timeScore = Math.max(
      0,
      1 - metrics.responseTime / this.qualityThresholds.responseTime
    );
    score += timeScore * weights.responseTime;

    // 相关性得分
    score += metrics.relevanceScore * weights.relevanceScore;

    // 完整性得分
    score += metrics.completenessScore * weights.completenessScore;

    // 清晰度得分
    score += metrics.clarityScore * weights.clarityScore;

    // 错误率得分（越低越好）
    const errorScore = Math.max(0, 1 - metrics.errorRate);
    score += errorScore * weights.errorRate;

    // 上下文一致性得分
    score += metrics.contextConsistency * weights.contextConsistency;

    return Math.min(score, 1.0);
  }

  /**
   * 生成质量建议
   */
  private generateQualityRecommendations(metrics: QualityMetrics): string[] {
    const recommendations: string[] = [];

    if (metrics.responseTime > this.qualityThresholds.responseTime) {
      recommendations.push('响应时间过长，建议优化模型性能或减少处理复杂度');
    }

    if (metrics.relevanceScore < this.qualityThresholds.relevanceScore) {
      recommendations.push('回答相关性较低，建议改进意图识别和知识库匹配');
    }

    if (metrics.completenessScore < this.qualityThresholds.completenessScore) {
      recommendations.push('回答不够完整，建议提供更详细的信息');
    }

    if (metrics.clarityScore < this.qualityThresholds.clarityScore) {
      recommendations.push('回答不够清晰，建议简化表达方式');
    }

    if (metrics.errorRate > 0.1) {
      recommendations.push('错误率较高，建议检查模型输出和错误处理机制');
    }

    return recommendations;
  }

  /**
   * 记录意图识别结果
   */
  private async recordIntentRecognition(
    sessionId: string,
    text: string,
    result: IntentRecognitionResult
  ): Promise<void> {
    try {
      await this.prisma.intentRecognition.create({
        data: {
          sessionId,
          messageId: uuidv4(),
          intent: result.intent,
          confidence: result.confidence,
          entities: result.entities,
          metadata: {
            alternatives: result.alternatives,
            processingTime: result.processingTime,
          },
        },
      });
    } catch (error) {
      console.error('Failed to record intent recognition:', error);
    }
  }

  /**
   * 保存质量报告
   */
  private async saveQualityReport(report: QualityReport): Promise<void> {
    try {
      await this.prisma.conversationQuality.create({
        data: {
          sessionId: report.sessionId,
          messageId: report.messageId,
          qualityScore: report.overallScore,
          metrics: report.metrics as any,
          feedback: report.recommendations.join('; '),
        },
      });
    } catch (error) {
      console.error('Failed to save quality report:', error);
    }
  }

  // 其他辅助方法的实现...
  private extractTimeEntities(text: string): Record<string, any> {
    const timePattern =
      /(\d{1,2}[:：]\d{2}|\d{1,2}点|\d{1,2}时|今天|明天|昨天|现在)/g;
    const matches = text.match(timePattern);
    return matches ? { time: matches } : {};
  }

  private extractQuestionEntities(text: string): Record<string, any> {
    return this.extractTimeEntities(text); // 简化实现
  }

  private extractQuestionSlots(_text: string): Record<string, any> {
    return {}; // 简化实现
  }

  private extractComplaintEntities(_text: string): Record<string, any> {
    return {}; // 简化实现
  }

  private extractRequestEntities(_text: string): Record<string, any> {
    return {}; // 简化实现
  }

  private extractRequestSlots(_text: string): Record<string, any> {
    return {}; // 简化实现
  }

  private calculatePatternConfidence(_text: string, _pattern: RegExp): number {
    return 0.8; // 简化实现
  }

  private isFollowUpQuestion(text: string): boolean {
    return /(还有|另外|其他|补充)/i.test(text);
  }

  private isGreeting(text: string): boolean {
    return /^(你好|hello|hi|嗨)/i.test(text);
  }

  private mergeEntities(
    entityMaps: Record<string, any>[]
  ): Record<string, any> {
    const merged: Record<string, any> = {};
    entityMaps.forEach((map: any) => {
      Object.assign(merged, map);
    });
    return merged;
  }

  private mergeSlots(slotMaps: Record<string, any>[]): Record<string, any> {
    return this.mergeEntities(slotMaps);
  }

  private generateSearchSuggestions(
    keywords: string[],
    _entries: KnowledgeBaseEntry[]
  ): string[] {
    return keywords.slice(0, 3); // 简化实现
  }

  private async calculateCompletenessScore(
    _entry: KnowledgeBaseEntry,
    _keywords: string[],
    _alternatives: string[],
    _query: string
  ): Promise<number> {
    return 0.7; // 简化实现
  }

  private async calculateClarityScore(
    _entry: KnowledgeBaseEntry,
    _keywords: string[],
    _alternatives: string[],
    _query: string
  ): Promise<number> {
    return 0.8; // 简化实现
  }

  private async calculateErrorRate(
    _entry: KnowledgeBaseEntry,
    _keywords: string[],
    _alternatives: string[],
    _query: string
  ): Promise<number> {
    return 0.05; // 简化实现
  }

  private async calculateContextConsistency(
    _entry: KnowledgeBaseEntry,
    _keywords: string[],
    _alternatives: string[],
    _query: string
  ): Promise<number> {
    return 0.9; // 简化实现
  }
}

// 导出单例实例
let aiCoreServiceInstance: AICoreService | null = null;

export function getAICoreService(prisma?: PrismaClient): AICoreService {
  if (!aiCoreServiceInstance && prisma) {
    aiCoreServiceInstance = new AICoreService(prisma);
  }
  return aiCoreServiceInstance!;
}
