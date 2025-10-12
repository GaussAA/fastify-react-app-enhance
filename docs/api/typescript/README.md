# TypeScript API 文档

这个目录包含由 API Extractor 自动生成的 TypeScript API 文档。

## 📁 文件说明

- **`api.json`** - API Extractor 生成的 JSON 报告，包含完整的 API 元数据
- **`fastify-api.api.md`** - 自动生成的 Markdown 格式 API 文档

## 🔄 生成方式

这些文件通过以下命令自动生成：

```bash
# 在 apps/api 目录下运行
pnpm run build:api-docs
```

## 📋 配置

生成配置位于 `apps/api/api-extractor.json` 文件中。

## 🎯 用途

- **开发参考** - 查看完整的 TypeScript API 接口
- **类型检查** - 确保 API 接口的一致性
- **文档生成** - 自动生成最新的 API 文档

## ⚠️ 注意事项

- 这些文件是自动生成的，请勿手动编辑
- 每次 API 变更后需要重新生成
- 生成前需要先构建项目 (`pnpm run build`)
