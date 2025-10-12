import { jest } from '@jest/globals';
import { FastifyInstance } from 'fastify';

// 模拟 Prisma 客户端
jest.unstable_mockModule('../../../apps/api/src/prisma-client.js', () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// 动态导入
const { build } = await import('../../../apps/api/src/app.js');

describe('User API Integration Tests', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = build();
    await app.ready();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('GET /', () => {
    it('should return API health check', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.ok).toBe(true);
      expect(body.message).toBe('Fastify API running');
    });
  });

  // 注意：这些测试需要实际的数据库连接，目前使用模拟
  describe('API Structure', () => {
    it('should have app instance', () => {
      expect(app).toBeDefined();
      expect(app.ready).toBeDefined();
    });
  });
});
