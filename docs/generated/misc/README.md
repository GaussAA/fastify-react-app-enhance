# 自动生成文档索引

**生成时间**: 2025-10-10T17:13:01.072Z

## 📚 文档列表

| 文档名称                               | 描述                        | 文件路径                                |
| -------------------------------------- | --------------------------- | --------------------------------------- |
| [数据库设计文档](database-design.md)   | Prisma 数据模型和数据库配置 | `docs/generated/database-design.md`     |
| [项目结构文档](project-structure.md)   | 项目目录结构和文件分析      | `docs/generated/project-structure.md`   |
| [环境配置文档](environment-config.md)  | 环境变量配置说明            | `docs/generated/environment-config.md`  |
| [Docker 配置文档](docker-config.md)    | Docker 容器和服务配置       | `docs/generated/docker-config.md`       |
| [CI/CD 流程文档](cicd-pipeline.md)     | GitHub Actions 工作流配置   | `docs/generated/cicd-pipeline.md`       |
| [依赖分析文档](dependency-analysis.md) | 项目依赖包分析              | `docs/generated/dependency-analysis.md` |
| [测试文档](test-documentation.md)      | 测试配置和用例分析          | `docs/generated/test-documentation.md`  |
| [项目健康度报告](project-health.md)    | 项目质量评估和改进建议      | `docs/generated/project-health.md`      |
| [更新日志](changelog.md)               | 项目版本更新记录            | `docs/generated/changelog.md`           |

## 🔄 自动生成说明

这些文档由 `scripts/generate-all-docs.js` 脚本自动生成，包含：

- 📊 **数据分析**: 自动分析项目结构和配置
- 🔍 **代码扫描**: 扫描源代码和配置文件
- 📝 **文档生成**: 生成多种格式的文档
- 🎯 **质量评估**: 评估项目健康度

## 🚀 使用方法

```bash
# 生成所有文档
pnpm run docs:generate:all

# 生成特定文档
node scripts/generate-all-docs.js
```

---

_此索引由自动化脚本生成_
