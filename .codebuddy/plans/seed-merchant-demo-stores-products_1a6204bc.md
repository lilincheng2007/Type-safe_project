---
name: seed-merchant-demo-stores-products
overview: 为 `merchant_demo` 直接向 PostgreSQL 添加 10 个商店及每店 10 个菜品，不修改业务代码，并在执行前后做数据库校验。
todos:
  - id: verify-db-schema
    content: 使用 [subagent:code-explorer] 复核商店、目录、菜品表结构和 merchant_demo 账户关系
    status: completed
  - id: check-postgres
    content: 确认 PostgreSQL 可连接，必要时启动 backend/docker-compose.yml 的 postgres
    status: completed
    dependencies:
      - verify-db-schema
  - id: run-seed-sql
    content: 执行单事务幂等 SQL，插入 10 家店和 100 个菜品
    status: completed
    dependencies:
      - check-postgres
  - id: validate-seeded-data
    content: 校验目标店铺、目录镜像、菜品数量和外键一致性
    status: completed
    dependencies:
      - run-seed-sql
  - id: report-result
    content: 汇总写入结果、数据库范围和可重复执行说明
    status: completed
    dependencies:
      - validate-seeded-data
---

## User Requirements

- 向本地 PostgreSQL 数据库直接添加演示数据，不通过修改业务代码实现。
- 新增 10 个商店，全部归属于 `merchant_demo` 商家账户。
- 每个商店包含 10 个菜品，总计新增 100 个菜品。
- 尽量保持代码仓库不变，避免改 Scala/TypeScript 源码、README 或种子数据文件。

## Product Overview

为商家演示账号补充批量店铺与商品数据，使商家端和顾客端能看到更丰富的商店目录、商品列表、库存和上架状态。

## Core Features

- 新增 10 个可营业、可展示的商店。
- 每家店新增 10 个上架菜品。
- 商店同步写入商家后台表与顾客目录表。
- 菜品关联到对应商店，并设置价格、库存、分类、图片、销量等展示字段。
- 使用可重复执行的幂等写入方式，避免重复插入脏数据。

## Tech Stack Selection

- 数据库：PostgreSQL，本项目 Docker Compose 默认暴露 `127.0.0.1:5432`。
- 连接库：默认使用 `delivery_backend`，账号密码为 `postgres` / `postgres`。
- 执行方式：通过 `psql` 或 Docker 容器内 `psql` 执行 SQL，不改业务代码。
- 数据表：
- `merchant_accounts`：确认 `merchant_demo` 是否存在。
- `merchant_stores`：商家后台店铺表，`owner_username='merchant_demo'`。
- `catalog_merchants`：顾客端目录商店镜像表。
- `catalog_products`：商品表，`merchant_id` 指向 `merchant_stores.id`。

## Implementation Approach

采用单事务 SQL 直接写入数据库：先检查 `merchant_demo` 账户存在，再生成固定 ID 的 10 个商店和 100 个菜品，分别 upsert 到 `merchant_stores`、`catalog_merchants`、`catalog_products`。使用确定性 ID 如 `demo-extra-store-01` 和 `demo-extra-store-01-product-01`，配合 `ON CONFLICT DO UPDATE` 实现幂等，可重复执行且不会重复创建。

关键决策：

- 不修改 `SeedData.scala`：满足“尽量不改代码，直接加入数据库”，但数据仅存在当前数据库卷中，重建数据库后不会自动恢复。
- 同时写 `merchant_stores` 与 `catalog_merchants`：符合现有 `MerchantStoreTable.upsert` 的双表镜像模式，确保商家端和顾客端均可见。
- 写入 `featured_product_ids`：每家店选择前 3 个商品作为推荐商品，保持前端展示完整。
- 商品使用 `listing_status='上架'`、`inventory_mode='finite'`、`inventory_status='充足'`、`bundle_config='[]'::jsonb`：符合当前商品表约束与普通菜品模型。
- 使用事务和执行后校验：避免部分写入导致孤儿商品或目录表不一致。

## Implementation Notes

- 执行前先确认 PostgreSQL 是否运行；若未运行，启动 `backend/docker-compose.yml` 中的 `postgres` 服务。
- 不触碰业务源码，不新增迁移文件，不修改 README。
- SQL 必须检查 `merchant_demo` 是否存在；不存在则中止，避免创建无归属店铺。
- 避免覆盖非本批次店铺：只操作 ID 前缀为 `demo-extra-store-` 的记录。
- 采用 `ON CONFLICT` 而非先删后插，降低对已有测试数据的破坏风险。
- 写入后执行统计校验：10 家目标店、100 个目标商品、目录镜像 10 条、无 orphan 商品。
- 若用户需要长期保留到初始化流程，再另行评估是否加入种子数据；本次按要求仅写数据库。

## Architecture Design

本次不改变应用架构，只向现有持久化层注入演示数据：

```text
merchant_demo
  └── merchant_stores: 10 stores
        ├── catalog_merchants: 10 mirrored catalog rows
        └── catalog_products: 100 products, 10 per store
```

## Directory Structure

本次预期不修改项目源码文件；仅可能执行临时 SQL 命令。

```text
/Users/leonli/Desktop/Type-safe_project/
├── backend/docker-compose.yml          # [READ] 确认 PostgreSQL 服务和端口
├── backend/src/merchant/tables/...     # [READ] 确认表结构和字段约束
└── /tmp或shell heredoc                 # [TEMP] 临时 SQL，不提交到仓库
```

## Key Code Structures

SQL 数据约束重点：

- `merchant_stores.owner_username` 必须引用 `merchant_accounts(username)`。
- `catalog_merchants.id` 必须引用 `merchant_stores(id)`。
- `catalog_products.merchant_id` 必须引用 `merchant_stores(id)`。
- JSON 字段使用合法 JSONB：`tags`、`featured_product_ids`、`promotions`、`weekly_business_hours`、`holiday_business_hours`、`bundle_config`。

## Agent Extensions

### SubAgent

- **code-explorer**
- Purpose: 在执行前复核数据库表结构、字段约束和现有写入模式，避免 SQL 与当前 schema 不一致。
- Expected outcome: 确认 `merchant_stores`、`catalog_merchants`、`catalog_products` 的必填字段、外键和枚举值，生成安全可执行的 SQL。