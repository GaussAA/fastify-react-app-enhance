// Jest setup file for ESM
// 设置测试环境变量
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL ||
  'postgresql://postgres_user:postgres_123!@localhost:5432/testdb?schema=public';
process.env.REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
process.env.LOG_LEVEL = process.env.LOG_LEVEL || 'error';
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
process.env.PORT = process.env.PORT || '0'; // 使用随机端口

// 设置超时时间
if (global.jest) {
  global.jest.setTimeout(10000);
}

// ESM 全局设置
global.console = console;
