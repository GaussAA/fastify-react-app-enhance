# 项目结构文档

**生成时间**: 2025-10-11T02:49:13.514Z

## 📊 项目概览

| 统计项          | 数量 |
| --------------- | ---- |
| 总文件数        | 1410 |
| 总目录数        | 98   |
| TypeScript 文件 | 20   |
| JavaScript 文件 | 25   |
| 配置文件        | 22   |
| 文档文件        | 47   |

## 📂 目录结构

```
├── apps
  ├── api
    ├── jest.config.js
    ├── jest.setup.js
    ├── package.json
    ├── prisma
      ├── migrations
      ├── schema.prisma
      └── seed.ts
    ├── README.md
    ├── src
      ├── app.ts
      ├── config
      ├── controllers
      ├── middlewares
      ├── models
      ├── plugins
      ├── prisma-client.ts
      ├── routes
      ├── server.ts
      ├── services
      └── utils
    ├── tests
      ├── integration
      └── unit
    └── tsconfig.json
  └── web
    ├── index.html
    ├── package.json
    ├── README.md
    ├── src
      ├── api
      ├── components
      ├── hooks
      ├── main.tsx
      ├── pages
      ├── store
      └── utils
    ├── tsconfig.json
    ├── tsconfig.node.json
    └── vite.config.ts
├── backups
├── cache
├── config
  ├── env-templates
    ├── api.env
    ├── root.env
    └── web.env
  ├── env.ts
  ├── eslint.config.js
  ├── logger.ts
  └── monitoring-config.json
├── docs
  ├── api
    ├── openapi.json
    ├── README.md
    ├── swagger-ui.html
    └── types.ts
  ├── architecture
    └── architecture.md
  ├── automation-summary.md
  ├── database
    └── README.md
  ├── deployment
    ├── docker.md
    └── README.md
  ├── development
    ├── optimization-plan.md
    └── README.md
  ├── generated
    ├── analysis
      ├── automation
      └── project
    ├── automation-analysis.md
    ├── changelog
      └── changelog.md
    ├── changelog.md
    ├── cicd
      └── cicd-pipeline.md
    ├── cicd-pipeline.md
    ├── config
      ├── docker-config.md
      └── environment-config.md
    ├── database
      └── database-design.md
    ├── database-design.md
    ├── dependency-analysis.md
    ├── docker-config.md
    ├── environment-check.json
    ├── environment-config.md
    ├── misc
      ├── README.md
      └── simple-reorganization-report.json
    ├── project-health.md
    ├── project-structure.md
    ├── README.md
    ├── reports
      ├── checks
      ├── duplicate-dir-fix-report.json
      ├── file-organization-report.json
      ├── monitoring
      ├── naming-standardization-report.json
      └── path-update-report.json
    ├── test-documentation.md
    └── testing
      └── test-documentation.md
  ├── NAMING_STANDARDIZATION_SUMMARY.md
  ├── project-status.md
  ├── README.md
  ├── reorganization-summary.md
  └── structure-reorganization-plan.md
├── eslint.config.js
├── infrastructure
  ├── database
    ├── postgres
      ├── base
      ├── global
      ├── pg_commit_ts
      ├── pg_dynshmem
      ├── pg_hba.conf
      ├── pg_ident.conf
      ├── pg_logical
      ├── pg_multixact
      ├── pg_notify
      ├── pg_replslot
      ├── pg_serial
      ├── pg_snapshots
      ├── pg_stat
      ├── pg_stat_tmp
      ├── pg_subtrans
      ├── pg_tblspc
      ├── pg_twophase
      ├── PG_VERSION
      ├── pg_wal
      ├── pg_xact
      ├── postgresql.auto.conf
      ├── postgresql.conf
      └── postmaster.opts
    └── redis
      └── dump.rdb
  ├── docker
    ├── docker-compose.yml
    ├── fastify.Dockerfile
    └── web.Dockerfile
  ├── kubernetes
  ├── README.md
  └── scripts
├── logs
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── README.md
├── scripts
  ├── fix-duplicate-generated-dirs.js
  ├── organize-generated-files.js
  ├── README.md
  ├── reorganize-structure.js
  ├── simple-reorganize.js
  ├── standardize-naming.js
  └── update-path-references.js
├── services
  └── grpc
    ├── client
      └── client.ts
    ├── proto
      └── user.proto
    ├── README.md
    └── server
      └── server.ts
├── tests
  ├── e2e
    └── user-flow.test.ts
  ├── README.md
  └── utils
    └── mock.ts
└── tools
  └── scripts
    ├── automation
      ├── automation-analysis.js
      ├── check-environment.js
      ├── code-quality-check.js
      ├── run-all-checks.js
      └── security-audit.js
    ├── build
      ├── build.sh
      └── deploy.sh
    ├── database
      ├── database-backup.js
      ├── prisma-test.js
      ├── reset.sh
      └── setup.sh
    ├── development
      ├── dev.sh
      ├── generate-all-docs.js
      ├── generate-docs.js
      ├── setup.sh
      └── stop.sh
    ├── maintenance
      ├── clean.bat
      ├── clean.js
      ├── clean.sh
      └── maintenance.js
    ├── monitoring
      ├── monitoring-log.js
      └── performance-test.js
    ├── README.md
    └── test.sh

```

## 📈 文件类型分析

- \*\*\*\*: 1260 个文件
- **.js**: 25 个文件
- **.json**: 19 个文件
- **.ts**: 20 个文件
- **.prisma**: 1 个文件
- **.md**: 47 个文件
- **.html**: 2 个文件
- **.tsx**: 1 个文件
- **.env**: 3 个文件
- **.map**: 5 个文件
- **.init**: 4 个文件
- **.conf**: 4 个文件
- **.stat**: 1 个文件
- **.opts**: 1 个文件
- **.rdb**: 1 个文件
- **.yml**: 1 个文件
- **.Dockerfile**: 2 个文件
- **.yaml**: 2 个文件
- **.proto**: 1 个文件
- **.sh**: 9 个文件
- **.bat**: 1 个文件
