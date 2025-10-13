#!/usr/bin/env node

/**
 * 环境配置设置脚本
 * 从模板创建 .env 配置文件
 */

import { existsSync, copyFileSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const projectRoot = process.cwd();
const envExamplePath = join(projectRoot, 'env.example');
const envPath = join(projectRoot, '.env');

console.log('🔧 设置环境配置...\n');

// 检查模板文件是否存在
if (!existsSync(envExamplePath)) {
  console.log('❌ env.example 文件不存在');
  console.log('💡 请确保项目根目录存在 env.example 文件');
  process.exit(1);
}

// 检查 .env 文件是否已存在
if (existsSync(envPath)) {
  console.log('⚠️ .env 文件已存在');
  console.log('💡 如需重新创建，请先删除现有文件');
  process.exit(0);
}

try {
  // 复制模板文件
  copyFileSync(envExamplePath, envPath);
  console.log('✅ 已从 env.example 创建 .env 文件');

  // 读取并显示配置说明
  const envContent = readFileSync(envPath, 'utf-8');
  const lines = envContent.split('\n');

  console.log('\n📋 请在 .env 文件中填写以下配置项的实际值:');
  console.log('='.repeat(50));

  let inLLMSection = false;
  let hasLLMConfig = false;

  lines.forEach(line => {
    const trimmed = line.trim();

    if (trimmed.includes('llm configuration')) {
      inLLMSection = true;
      console.log('\n🤖 LLM 配置:');
      return;
    }

    if (inLLMSection && trimmed && !trimmed.startsWith('#')) {
      const [key] = trimmed.split('=');
      if (key && key.includes('LLM_')) {
        hasLLMConfig = true;
        console.log(`  - ${key}: 请填写您的实际值`);
      }
    }

    if (inLLMSection && trimmed.startsWith('#') && !trimmed.includes('llm')) {
      inLLMSection = false;
    }
  });

  if (!hasLLMConfig) {
    console.log('\n⚠️ 未找到 LLM 配置项');
    console.log('💡 请检查 env.example 文件是否包含 LLM 配置');
  }

  console.log('\n' + '='.repeat(50));
  console.log('🚀 下一步:');
  console.log('1. 编辑 .env 文件，填写所有配置项的实际值');
  console.log('2. 运行: node scripts/check-llm-config.js 验证配置');
  console.log('3. 运行: pnpm run start 启动项目');
} catch (error) {
  console.log('❌ 创建配置文件失败:', error.message);
  process.exit(1);
}
