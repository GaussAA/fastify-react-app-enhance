#!/usr/bin/env node

/**
 * LLM配置检查脚本
 * 检查LLM服务配置是否正确
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const projectRoot = process.cwd();
const envPath = join(projectRoot, '.env');

console.log('🔍 检查LLM服务配置...\n');

// 检查.env文件是否存在
if (!existsSync(envPath)) {
  console.log('❌ .env文件不存在');
  console.log('💡 请运行: cp env.example .env');
  process.exit(1);
}

// 读取.env文件内容
const envContent = readFileSync(envPath, 'utf-8');
const envLines = envContent.split('\n');

// 检查必需的LLM配置项
const requiredConfigs = [
  'LLM_DEFAULT_PROVIDER',
  'LLM_API_KEY',
  'LLM_DEFAULT_MODEL',
  'LLM_BASE_URL',
];

const optionalConfigs = [
  'LLM_TIMEOUT',
  'LLM_MAX_RETRIES',
  'LLM_TEMPERATURE',
  'LLM_MAX_TOKENS',
  'LLM_TOP_P',
  'LLM_FREQUENCY_PENALTY',
  'LLM_PRESENCE_PENALTY',
];

console.log('📋 配置检查结果:');

let hasErrors = false;
const configs = {};

// 解析环境变量
envLines.forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    if (key && valueParts.length > 0) {
      configs[key.trim()] = valueParts.join('=').trim();
    }
  }
});

// 检查必需配置
console.log('\n🔑 必需配置:');
requiredConfigs.forEach(config => {
  if (configs[config] && configs[config] !== `{${config}}`) {
    if (config === 'LLM_API_KEY') {
      const masked =
        configs[config].length > 8
          ? `${configs[config].substring(0, 4)}...${configs[config].substring(configs[config].length - 4)}`
          : '***';
      console.log(`  ✅ ${config}: ${masked}`);
    } else {
      console.log(`  ✅ ${config}: ${configs[config]}`);
    }
  } else {
    console.log(`  ❌ ${config}: 未配置或使用占位符`);
    hasErrors = true;
  }
});

// 检查可选配置
console.log('\n⚙️ 可选配置:');
optionalConfigs.forEach(config => {
  if (configs[config] && configs[config] !== `{${config}}`) {
    console.log(`  ✅ ${config}: ${configs[config]}`);
  } else {
    console.log(`  ⚠️ ${config}: 使用默认值`);
  }
});

// 输出结果
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.log('❌ 配置检查失败');
  console.log('\n💡 解决方案:');
  console.log('1. 编辑 .env 文件');
  console.log('2. 填写所有必需的LLM配置项');
  console.log('3. 确保不使用占位符格式 {CONFIG_NAME}');
  console.log('4. 重新运行此脚本验证');
  process.exit(1);
} else {
  console.log('✅ LLM配置检查通过');
  console.log('\n🚀 下一步:');
  console.log('1. 重启后端服务: pnpm --filter fastify-api run dev');
  console.log('2. 访问前端界面测试LLM功能');
  console.log('3. 查看AI助手页面是否正常显示');
}
