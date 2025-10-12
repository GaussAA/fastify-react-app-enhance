#!/usr/bin/env node

/**
 * 数据库配置检查脚本
 * 检查 PostgreSQL 和 Redis 的配置和连接状态
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../../../../');

class DatabaseConfigChecker {
  constructor() {
    this.projectRoot = projectRoot;
    this.results = {
      postgres: { status: 'unknown', details: [] },
      redis: { status: 'unknown', details: [] },
      docker: { status: 'unknown', details: [] },
      config: { status: 'unknown', details: [] },
    };
  }

  /**
   * 检查 Docker 服务状态
   */
  checkDockerService() {
    try {
      execSync('docker --version', { encoding: 'utf-8' });
      this.results.docker.details.push('✅ Docker 已安装');

      try {
        execSync('docker ps', { encoding: 'utf-8' });
        this.results.docker.status = 'running';
        this.results.docker.details.push('✅ Docker 服务正在运行');
      } catch (error) {
        this.results.docker.status = 'stopped';
        this.results.docker.details.push('❌ Docker 服务未运行');
      }
    } catch (error) {
      this.results.docker.status = 'not_installed';
      this.results.docker.details.push('❌ Docker 未安装');
    }
  }

  /**
   * 检查 Docker Compose 配置
   */
  checkDockerComposeConfig() {
    const composeFile = join(
      this.projectRoot,
      'infrastructure/docker/docker-compose.yml'
    );

    if (!existsSync(composeFile)) {
      this.results.config.status = 'missing';
      this.results.config.details.push('❌ docker-compose.yml 文件不存在');
      return;
    }

    try {
      const content = readFileSync(composeFile, 'utf-8');

      // 检查 PostgreSQL 配置
      if (content.includes('postgres:')) {
        this.results.postgres.details.push('✅ PostgreSQL 服务已配置');

        if (
          content.includes(
            '../../infrastructure/database/postgres:/var/lib/postgresql/data'
          )
        ) {
          this.results.postgres.details.push(
            '✅ PostgreSQL 数据持久化已配置到项目目录'
          );
        } else {
          this.results.postgres.details.push(
            '⚠️ PostgreSQL 数据持久化配置可能有问题'
          );
        }
      } else {
        this.results.postgres.details.push('❌ PostgreSQL 服务未配置');
      }

      // 检查 Redis 配置
      if (content.includes('redis:')) {
        this.results.redis.details.push('✅ Redis 服务已配置');

        if (content.includes('../../infrastructure/database/redis:/data')) {
          this.results.redis.details.push(
            '✅ Redis 数据持久化已配置到项目目录'
          );
        } else {
          this.results.redis.details.push('⚠️ Redis 数据持久化配置可能有问题');
        }
      } else {
        this.results.redis.details.push('❌ Redis 服务未配置');
      }

      this.results.config.status = 'valid';
      this.results.config.details.push('✅ Docker Compose 配置文件有效');
    } catch (error) {
      this.results.config.status = 'invalid';
      this.results.config.details.push('❌ Docker Compose 配置文件读取失败');
    }
  }

  /**
   * 检查环境变量配置
   */
  checkEnvironmentConfig() {
    const envTemplates = [
      'env-templates/api.env',
      'env-templates/web.env',
      'env-templates/root.env',
    ];

    envTemplates.forEach(template => {
      const filePath = join(this.projectRoot, template);
      if (existsSync(filePath)) {
        this.results.config.details.push(`✅ ${template} 存在`);
      } else {
        this.results.config.details.push(`❌ ${template} 不存在`);
      }
    });

    // 检查 API 环境配置
    const envConfigFile = join(this.projectRoot, 'apps/api/src/config/env.ts');
    if (existsSync(envConfigFile)) {
      this.results.config.details.push('✅ API 环境配置加载器存在');
    } else {
      this.results.config.details.push('❌ API 环境配置加载器不存在');
    }
  }

  /**
   * 检查数据库目录结构
   */
  checkDatabaseDirectories() {
    const postgresDir = join(
      this.projectRoot,
      'infrastructure/database/postgres'
    );
    const redisDir = join(this.projectRoot, 'infrastructure/database/redis');

    if (existsSync(postgresDir)) {
      this.results.postgres.details.push('✅ PostgreSQL 数据目录存在');
    } else {
      this.results.postgres.details.push(
        '⚠️ PostgreSQL 数据目录不存在（首次运行时会自动创建）'
      );
    }

    if (existsSync(redisDir)) {
      this.results.redis.details.push('✅ Redis 数据目录存在');
    } else {
      this.results.redis.details.push(
        '⚠️ Redis 数据目录不存在（首次运行时会自动创建）'
      );
    }
  }

  /**
   * 检查 Prisma 配置
   */
  checkPrismaConfig() {
    const schemaFile = join(this.projectRoot, 'apps/api/prisma/schema.prisma');

    if (existsSync(schemaFile)) {
      this.results.postgres.details.push('✅ Prisma schema 文件存在');

      try {
        const content = readFileSync(schemaFile, 'utf-8');
        if (content.includes('provider = "postgresql"')) {
          this.results.postgres.details.push('✅ Prisma 配置为 PostgreSQL');
        } else {
          this.results.postgres.details.push('⚠️ Prisma 数据库配置可能有问题');
        }
      } catch (error) {
        this.results.postgres.details.push('❌ Prisma schema 文件读取失败');
      }
    } else {
      this.results.postgres.details.push(
        `❌ Prisma schema 文件不存在: ${schemaFile}`
      );
    }
  }

  /**
   * 运行所有检查
   */
  async run() {
    console.log('🔍 检查数据库配置...\n');

    this.checkDockerService();
    this.checkDockerComposeConfig();
    this.checkEnvironmentConfig();
    this.checkDatabaseDirectories();
    this.checkPrismaConfig();

    // 输出结果
    console.log('📊 检查结果:\n');

    Object.entries(this.results).forEach(([service, result]) => {
      const statusIcon =
        result.status === 'running' || result.status === 'valid'
          ? '✅'
          : result.status === 'stopped' || result.status === 'missing'
            ? '❌'
            : '⚠️';

      console.log(`${statusIcon} ${service.toUpperCase()}:`);
      result.details.forEach(detail => {
        console.log(`   ${detail}`);
      });
      console.log('');
    });

    // 提供建议
    this.provideRecommendations();
  }

  /**
   * 提供配置建议
   */
  provideRecommendations() {
    console.log('💡 配置建议:\n');

    if (this.results.docker.status === 'not_installed') {
      console.log(
        '1. 安装 Docker Desktop: https://www.docker.com/products/docker-desktop'
      );
    } else if (this.results.docker.status === 'stopped') {
      console.log('1. 启动 Docker Desktop 服务');
    }

    if (this.results.config.status !== 'valid') {
      console.log('2. 检查并修复 Docker Compose 配置文件');
    }

    console.log('3. 启动数据库服务:');
    console.log('   cd infrastructure/docker');
    console.log('   docker compose up -d postgres redis');

    console.log('4. 运行数据库迁移:');
    console.log('   pnpm --filter fastify-api run prisma:migrate');

    console.log('5. 生成 Prisma 客户端:');
    console.log('   pnpm --filter fastify-api run prisma:generate');
  }
}

// 运行检查
const checker = new DatabaseConfigChecker();
checker.run().catch(console.error);
