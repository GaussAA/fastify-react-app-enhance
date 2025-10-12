# 项目结构文档

**生成时间**: 2025-10-10T17:13:01.072Z

## 📊 项目概览

| 统计项          | 数量 |
| --------------- | ---- |
| 总文件数        | 1350 |
| 总目录数        | 73   |
| TypeScript 文件 | 18   |
| JavaScript 文件 | 9    |
| 配置文件        | 10   |
| 文档文件        | 17   |

## 📂 目录结构

```
├── apps
  ├── api
    ├── jest.config.js
    ├── jest.setup.js
    ├── package.json
    ├── prisma
      └── schema.prisma
    ├── README.md
    ├── src
      ├── app.ts
      ├── config
      ├── controllers
      ├── middlewares
      ├── models
      ├── plugins
      ├── prismaClient.ts
      ├── routes
      ├── server.ts
      ├── services
      └── utils
    ├── tests
      ├── integration
      ├── prisma-test.js
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
├── config
  ├── env.ts
  └── logger.ts
├── docs
  ├── api
    ├── openapi.json
    ├── README.md
    ├── swagger-ui.html
    └── types.ts
  ├── architecture
    └── architecture.md
  ├── database
    └── README.md
  ├── deployment
    ├── docker.md
    └── README.md
  ├── development
    ├── optimization-plan.md
    └── README.md
  ├── generated
    └── database-design.md
  ├── PROJECT_STATUS.md
  └── README.md
├── env-templates
  ├── api.env
  ├── root.env
  └── web.env
├── eslint.config.js
├── grpc
  ├── client.ts
  ├── proto
    └── user.proto
  ├── README.md
  └── server.ts
├── infra
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
  ├── k8s
  ├── README.md
  └── scripts
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── README.md
├── scripts
  ├── build.sh
  ├── clean.bat
  ├── clean.js
  ├── clean.sh
  ├── db
    ├── reset.sh
    └── setup.sh
  ├── deploy.sh
  ├── dev
    ├── dev.sh
    ├── setup.sh
    └── stop.sh
  ├── generate-all-docs.js
  ├── generate-docs.js
  ├── migrate.ts
  ├── README.md
  ├── seed.ts
  └── test.sh
└── tests
  ├── e2e
    └── user-flow.test.ts
  ├── README.md
  └── utils
    └── mock.ts

```

## 📈 文件类型分析

- \*\*\*\*: 1260 个文件
- **.js**: 9 个文件
- **.json**: 7 个文件
- **.prisma**: 1 个文件
- **.md**: 17 个文件
- **.ts**: 18 个文件
- **.html**: 2 个文件
- **.tsx**: 1 个文件
- **.env**: 3 个文件
- **.proto**: 1 个文件
- **.map**: 5 个文件
- **.init**: 4 个文件
- **.conf**: 4 个文件
- **.stat**: 1 个文件
- **.opts**: 1 个文件
- **.rdb**: 1 个文件
- **.yml**: 1 个文件
- **.Dockerfile**: 2 个文件
- **.yaml**: 2 个文件
- **.sh**: 9 个文件
- **.bat**: 1 个文件
