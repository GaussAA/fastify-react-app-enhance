/**
 * 配置加载器包装器
 * 为启动脚本提供配置访问
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 解析环境文件
 */
function parseEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return {};
  }

  const content = readFileSync(filePath, 'utf-8');
  const env = {};

  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        let value = valueParts.join('=').trim();
        // 移除引号
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }
        env[key.trim()] = value;
      }
    }
  });

  return env;
}

/**
 * 加载应用配置
 */
export function loadAppConfig() {
  // 加载环境变量
  const envPath = join(__dirname, '../.env');
  const env = parseEnvFile(envPath);

  // 合并环境变量
  const allEnv = { ...env, ...process.env };

  return {
    PORTS: {
      POSTGRES: 15432,
      REDIS: 6379,
      API: parseInt(allEnv.PORT || '8001'),
      WEB: 3000,
    },
    URLS: {
      API: allEnv.API_BASE_URL || 'http://localhost:8001',
      WEB: allEnv.WEB_BASE_URL || 'http://localhost:3000',
    },
    DOCKER: {
      COMPOSE_FILE: 'infrastructure/docker/docker-compose.yml',
    },
  };
}

export default loadAppConfig;
