import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 加载根目录的 .env 文件
  const env = loadEnv(mode, path.resolve(__dirname, '../../'), '');

  return {
    plugins: [react()],
    server: {
      port: parseInt(env.WEB_PORT || '5173', 10),
      host: env.WEB_HOST || 'localhost',
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    define: {
      // 将环境变量暴露给前端
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(
        env.VITE_API_BASE_URL || `http://${env.VITE_API_HOST || env.API_HOST || 'localhost'}:${env.VITE_API_PORT || env.API_PORT || '10000'}/api`
      ),
      'import.meta.env.VITE_API_HOST': JSON.stringify(
        env.VITE_API_HOST || env.API_HOST || 'localhost'
      ),
      'import.meta.env.VITE_API_PORT': JSON.stringify(
        env.VITE_API_PORT || env.API_PORT || '10000'
      ),
      'import.meta.env.VITE_API_URL': JSON.stringify(
        env.VITE_API_URL || `http://${env.VITE_API_HOST || env.API_HOST || 'localhost'}:${env.VITE_API_PORT || env.API_PORT || '10000'}`
      ),
      'import.meta.env.VITE_APP_TITLE': JSON.stringify(
        env.VITE_APP_TITLE || 'Fastify React App'
      ),
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(
        env.VITE_APP_VERSION || '1.0.0'
      ),
      'import.meta.env.VITE_API_KEY': JSON.stringify(env.VITE_API_KEY || ''),
    },
  };
});
