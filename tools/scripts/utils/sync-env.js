#!/usr/bin/env node

/**
 * 环境变量同步脚本
 * 将根目录的 .env 文件同步到各个子项目
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const projectRoot = process.cwd();
const rootEnvPath = join(projectRoot, '.env');

console.log('🔄 同步环境变量配置...\n');

// 检查根目录 .env 文件是否存在
if (!existsSync(rootEnvPath)) {
  console.log('❌ 根目录 .env 文件不存在');
  console.log('💡 请先运行: pnpm run setup:env');
  process.exit(1);
}

// 读取根目录的 .env 文件
const envContent = readFileSync(rootEnvPath, 'utf-8');

// 需要同步的目录
const syncDirs = ['apps/api', 'apps/web'];

let syncedCount = 0;

syncDirs.forEach(dir => {
  const envPath = join(projectRoot, dir, '.env');

  try {
    writeFileSync(envPath, envContent, 'utf-8');
    console.log(`✅ 已同步到: ${dir}/.env`);
    syncedCount++;
  } catch (error) {
    console.log(`❌ 同步失败: ${dir}/.env - ${error.message}`);
  }
});

console.log(`\n🎉 环境变量同步完成！共同步 ${syncedCount} 个文件`);
console.log('💡 现在可以运行: pnpm run start');
