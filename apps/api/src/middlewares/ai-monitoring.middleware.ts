/**
 * AI系统监控中间件
 * 提供性能监控、错误追踪、质量分析等功能
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';

export interface MonitoringMetrics {
    requestId: string;
    timestamp: Date;
    method: string;
    url: string;
    userId?: string;
    sessionId?: string;
    responseTime: number;
    statusCode: number;
    errorMessage?: string;
    aiProcessingTime?: number;
    intentRecognitionTime?: number;
    knowledgeSearchTime?: number;
    qualityScore?: number;
    memoryUsage: number;
    cpuUsage: number;
}

export class AIMonitoringMiddleware {
    private prisma: PrismaClient;
    private metricsBuffer: MonitoringMetrics[] = [];
    private bufferSize: number = 100;
    private flushInterval: NodeJS.Timeout;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
        this.startMetricsFlush();
    }

    /**
     * 请求监控中间件
     */
    async monitoringMiddleware(request: FastifyRequest, reply: FastifyReply) {
        const startTime = Date.now();
        const requestId = this.generateRequestId();
        const memoryUsage = process.memoryUsage();

        // 添加请求ID到请求对象
        (request as any).requestId = requestId;
        (request as any).startTime = startTime;

        // 监听响应完成
        reply.raw.on('finish', () => {
            const responseTime = Date.now() - startTime;
            const metrics: MonitoringMetrics = {
                requestId,
                timestamp: new Date(),
                method: request.method,
                url: request.url,
                userId: (request as any).user?.id,
                sessionId: (request as any).sessionId,
                responseTime,
                statusCode: reply.statusCode,
                errorMessage: reply.statusCode >= 400 ? 'Request failed' : undefined,
                memoryUsage: memoryUsage.heapUsed,
                cpuUsage: process.cpuUsage().user / 1000000 // 转换为毫秒
            };

            // 添加AI相关指标
            if (this.isAIRequest(request.url)) {
                this.addAIMetrics(metrics, request, reply);
            }

            this.recordMetrics(metrics);
        });

        // 监听错误
        reply.raw.on('error', (error) => {
            const responseTime = Date.now() - startTime;
            const metrics: MonitoringMetrics = {
                requestId,
                timestamp: new Date(),
                method: request.method,
                url: request.url,
                userId: (request as any).user?.id,
                sessionId: (request as any).sessionId,
                responseTime,
                statusCode: 500,
                errorMessage: error.message,
                memoryUsage: process.memoryUsage().heapUsed,
                cpuUsage: process.cpuUsage().user / 1000000
            };

            this.recordMetrics(metrics);
        });
    }

    /**
     * 添加AI相关指标
     */
    private addAIMetrics(metrics: MonitoringMetrics, request: FastifyRequest, reply: FastifyReply) {
        const aiMetrics = (request as any).aiMetrics;
        if (aiMetrics) {
            metrics.aiProcessingTime = aiMetrics.processingTime;
            metrics.intentRecognitionTime = aiMetrics.intentRecognitionTime;
            metrics.knowledgeSearchTime = aiMetrics.knowledgeSearchTime;
            metrics.qualityScore = aiMetrics.qualityScore;
        }
    }

    /**
     * 判断是否为AI请求
     */
    private isAIRequest(url: string): boolean {
        return url.includes('/ai/') || url.includes('/conversation') || url.includes('/intent');
    }

    /**
     * 记录指标
     */
    private recordMetrics(metrics: MonitoringMetrics) {
        this.metricsBuffer.push(metrics);

        // 如果缓冲区满了，立即刷新
        if (this.metricsBuffer.length >= this.bufferSize) {
            this.flushMetrics();
        }

        // 记录到控制台（开发环境）
        if (process.env.NODE_ENV === 'development') {
            console.log(`📊 [${metrics.requestId}] ${metrics.method} ${metrics.url} - ${metrics.statusCode} (${metrics.responseTime}ms)`);
        }
    }

    /**
     * 刷新指标到数据库
     */
    private async flushMetrics() {
        if (this.metricsBuffer.length === 0) return;

        const metricsToFlush = [...this.metricsBuffer];
        this.metricsBuffer = [];

        try {
            // 这里可以将指标保存到数据库或发送到监控系统
            // 目前先记录到控制台
            console.log(`📈 刷新 ${metricsToFlush.length} 条监控指标`);

            // 计算统计信息
            const stats = this.calculateStats(metricsToFlush);
            console.log('📊 性能统计:', stats);

            // 检查异常
            this.checkAnomalies(metricsToFlush);

        } catch (error) {
            console.error('❌ 指标刷新失败:', error);
        }
    }

    /**
     * 计算统计信息
     */
    private calculateStats(metrics: MonitoringMetrics[]) {
        const responseTimes = metrics.map(m => m.responseTime);
        const errorCount = metrics.filter(m => m.statusCode >= 400).length;
        const aiRequests = metrics.filter(m => m.aiProcessingTime !== undefined);

        return {
            totalRequests: metrics.length,
            averageResponseTime: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
            maxResponseTime: Math.max(...responseTimes),
            minResponseTime: Math.min(...responseTimes),
            errorRate: errorCount / metrics.length,
            aiRequests: aiRequests.length,
            averageAIProcessingTime: aiRequests.length > 0
                ? aiRequests.reduce((sum, m) => sum + (m.aiProcessingTime || 0), 0) / aiRequests.length
                : 0
        };
    }

    /**
     * 检查异常
     */
    private checkAnomalies(metrics: MonitoringMetrics[]) {
        const responseTimes = metrics.map(m => m.responseTime);
        const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        const threshold = avgResponseTime * 2; // 2倍平均响应时间作为阈值

        const slowRequests = metrics.filter(m => m.responseTime > threshold);
        if (slowRequests.length > 0) {
            console.warn(`⚠️ 发现 ${slowRequests.length} 个慢请求 (超过 ${threshold}ms)`);
        }

        const errorRequests = metrics.filter(m => m.statusCode >= 400);
        if (errorRequests.length > 0) {
            console.warn(`⚠️ 发现 ${errorRequests.length} 个错误请求`);
        }

        const highMemoryUsage = metrics.filter(m => m.memoryUsage > 100 * 1024 * 1024); // 100MB
        if (highMemoryUsage.length > 0) {
            console.warn(`⚠️ 发现 ${highMemoryUsage.length} 个高内存使用请求`);
        }
    }

    /**
     * 启动指标刷新定时器
     */
    private startMetricsFlush() {
        this.flushInterval = setInterval(() => {
            this.flushMetrics();
        }, 30000); // 每30秒刷新一次
    }

    /**
     * 生成请求ID
     */
    private generateRequestId(): string {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 获取系统性能指标
     */
    getSystemMetrics(): {
        memory: NodeJS.MemoryUsage;
        cpu: NodeJS.CpuUsage;
        uptime: number;
        metricsBufferSize: number;
    } {
        return {
            memory: process.memoryUsage(),
            cpu: process.cpuUsage(),
            uptime: process.uptime(),
            metricsBufferSize: this.metricsBuffer.length
        };
    }

    /**
     * 清理资源
     */
    cleanup() {
        if (this.flushInterval) {
            clearInterval(this.flushInterval);
        }
        this.flushMetrics(); // 最后一次刷新
    }
}

// 导出中间件工厂函数
export function createAIMonitoringMiddleware(prisma: PrismaClient) {
    const monitoring = new AIMonitoringMiddleware(prisma);

    return {
        middleware: monitoring.monitoringMiddleware.bind(monitoring),
        getSystemMetrics: monitoring.getSystemMetrics.bind(monitoring),
        cleanup: monitoring.cleanup.bind(monitoring)
    };
}
