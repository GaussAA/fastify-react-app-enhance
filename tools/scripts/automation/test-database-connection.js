#!/usr/bin/env node

/**
 * 数据库连接测试脚本
 *
 * 测试 PostgreSQL 和 Redis 的连接状态
 * 支持多种连接方式和详细的错误报告
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../../../../');

class DatabaseConnectionTester {
  constructor() {
    this.projectRoot = projectRoot;
    this.results = {
      postgres: { status: 'unknown', details: [] },
      redis: { status: 'unknown', details: [] },
      prisma: { status: 'unknown', details: [] },
    };
  }

  /**
   * 测试 PostgreSQL 连接
   */
  testPostgreSQLConnection() {
    try {
      // 使用 docker exec 测试 PostgreSQL 连接
      const result = execSync(
        'docker exec docker-postgres-1 psql -U postgres_user -d mydb -c "SELECT version();"',
        { encoding: 'utf-8', timeout: 10000 }
      );

      this.results.postgres.status = 'connected';
      this.results.postgres.details.push('✅ PostgreSQL 连接成功');
      this.results.postgres.details.push(`📊 版本信息: ${result.trim()}`);
    } catch (error) {
      this.results.postgres.status = 'failed';
      this.results.postgres.details.push('❌ PostgreSQL 连接失败');
      this.results.postgres.details.push(`🔍 错误信息: ${error.message}`);
    }
  }

  /**
   * 测试 Redis 连接
   */
  testRedisConnection() {
    try {
      // 使用 docker exec 测试 Redis 连接
      const result = execSync('docker exec docker-redis-1 redis-cli ping', {
        encoding: 'utf-8',
        timeout: 5000,
      });

      if (result.trim() === 'PONG') {
        this.results.redis.status = 'connected';
        this.results.redis.details.push('✅ Redis 连接成功');
        this.results.redis.details.push('📊 响应: PONG');
      } else {
        this.results.redis.status = 'failed';
        this.results.redis.details.push('❌ Redis 响应异常');
      }
    } catch (error) {
      this.results.redis.status = 'failed';
      this.results.redis.details.push('❌ Redis 连接失败');
      this.results.redis.details.push(`🔍 错误信息: ${error.message}`);
    }
  }

  /**
   * 测试 Prisma 数据库连接
   */
  async testPrismaConnection() {
    try {
      // 尝试运行 Prisma 数据库推送命令
      execSync('npx prisma db push --skip-generate', {
        cwd: join(this.projectRoot, 'apps/api'),
        stdio: 'pipe',
        timeout: 15000,
      });

      this.results.prisma.status = 'connected';
      this.results.prisma.details.push('✅ Prisma 数据库连接成功');
      this.results.prisma.details.push('📊 数据库模式已同步');
    } catch (error) {
      this.results.prisma.status = 'failed';
      this.results.prisma.details.push('❌ Prisma 数据库连接失败');
      this.results.prisma.details.push(`🔍 错误信息: ${error.message}`);
      this.results.prisma.details.push(
        '💡 提示: 请检查数据库服务是否运行，或运行 "npx prisma db push --skip-generate" 进行验证'
      );
    }
  }

  /**
   * 检查 Docker 容器状态
   */
  checkDockerContainers() {
    try {
      const result = execSync('docker ps --filter "name=docker-"', {
        encoding: 'utf-8',
      });

      console.log('🐳 Docker 容器状态:');
      console.log(result);
      console.log('');
    } catch (error) {
      console.log('❌ 无法获取 Docker 容器状态');
      console.log(`🔍 错误信息: ${error.message}`);
    }
  }

  /**
   * 运行所有测试
   */
  async run() {
    console.log('🔍 测试数据库连接...\n');

    this.checkDockerContainers();
    this.testPostgreSQLConnection();
    this.testRedisConnection();
    await this.testPrismaConnection();

    // 输出结果
    console.log('📊 连接测试结果:\n');

    Object.entries(this.results).forEach(([service, result]) => {
      const statusIcon =
        result.status === 'connected'
          ? '✅'
          : result.status === 'failed'
            ? '❌'
            : '⚠️';

      console.log(`${statusIcon} ${service.toUpperCase()}:`);
      result.details.forEach(detail => {
        console.log(`   ${detail}`);
      });
      console.log('');
    });

    // 总结
    const allConnected = Object.values(this.results).every(
      r => r.status === 'connected'
    );
    if (allConnected) {
      console.log('🎉 所有数据库连接测试通过！');
    } else {
      console.log('⚠️ 部分数据库连接测试失败，请检查配置。');
    }
  }
}

// 运行测试
const tester = new DatabaseConnectionTester();
tester.run().catch(console.error);
