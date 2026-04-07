# 研发子代理（方案三 · 仅 Web）

在 Cursor 中通过 **@ 规则** 或规则面板启用对应 `.mdc`，让每个对话专注一个切片。总览与目录约定见 [.cursor/rules/delivery-project-context.mdc](.cursor/rules/delivery-project-context.mdc)。规则原文备份仍可在 [PLAN_AGENTS_RULES.md](PLAN_AGENTS_RULES.md) 查看。

## 仓库结构

| 路径 | 说明 |
|------|------|
| [frontend/](frontend/) | Vite + React，**仅通过 HTTP 调用** `backend` API；业务状态不在浏览器内伪造持久化。 |
| [backend/](backend/) | **Scala 3 + http4s + Circe** 微服务：`user` / `order` / `merchant` / `rider` / `admin` + **网关**；**对外 API 经网关 `8787`**（`npm run dev:backend` 用 `stack/run` 单进程起全栈）。每服务独立 PostgreSQL 库（`delivery_user` 等），JSONB 快照 + JWT。 |
| [backend-scala-sample/](backend-scala-sample/) | 原模版的 Scala/http4s + PostgreSQL 示例，**与当前外卖 API 独立**，仅供对照。 |
| [模版/](模版/) | 迁移后仅余占位文件时可忽略或清理。 |

## 本地启动

1. 安装根目录脚本依赖（可选）：在仓库根执行 `npm install`。
2. PostgreSQL：可用 `docker compose -f backend/docker-compose.yml up -d`（默认用户/密码 `postgres`/`postgres`，与代码默认一致）；首次初始化会建库 `delivery_user`、`delivery_order` 等（见 [backend/docker/init-databases.sql](backend/docker/init-databases.sql)）。**若用本机已装的 Postgres**，请保证存在上述五个库，或通过环境变量覆盖连接：`DB_HOST`、`DB_PORT`、`DB_USER`、`DB_PASSWORD`（默认 `postgres`/`postgres`）。若仍见 `role "db" does not exist`，说明曾用旧默认；请不要再使用用户 `db`，或显式 `export DB_USER=…` 指向你实例中的角色。
3. 终端一：`cd backend && sbt run` 或 `sbt stack/run`（或根目录 `npm run dev:backend`）；单 JVM 起全栈并监听网关 **8787**。也可分别 `sbt userService/run` 等（端口 8782–8786 + 网关 8787）。
4. 终端二：`cd frontend && npm install && npm run dev`（Vite 将 `/api` 代理到 `http://localhost:8787`）。
5. 或根目录：`npm run dev`（需已 `npm install`）。

演示账号（与种子数据一致）：`customer_demo` / `merchant_demo` / `rider_demo` / `admin`，密码均为 `123456`。

## 前端 API 层

- [frontend/src/api/client.ts](frontend/src/api/client.ts)：带 `Authorization: Bearer` 的 `fetch` 与 **`TaskIO`**；[frontend/src/api/services/](frontend/src/api/services/) 按 **user / order / merchant / admin / rider** 微服务拆分调用（路径常量 [gateway-paths.ts](frontend/src/api/gateway-paths.ts)）；入口 [frontend/src/api/index.ts](frontend/src/api/index.ts)。
- 契约类型：[frontend/src/delivery/model/](frontend/src/delivery/model/)。`lib/api/*` 为兼容重导出（deprecated）。
- 会话仅保存 JWT 与角色：[frontend/src/lib/auth-session.ts](frontend/src/lib/auth-session.ts)。

## 子代理分工

| 子代理 | 规则文件 | 何时启用 |
|--------|----------|----------|
| **SliceCheckout** | `agent-slice-checkout.mdc` + `agent-slice-checkout-settlement.mdc` | 购物车、结算、优惠券入口、对齐下单 API |
| **SliceOrderTracking** | `agent-slice-order-tracking.mdc` | 订单详情、时间轴、配送状态、实时更新策略 |
| **SliceMerchantOps** | `agent-slice-merchant-ops.mdc` | 商户接单、备餐时间、营业状态、菜品上下架 |
| **EventReliability** | `agent-event-reliability.mdc` | Outbox、消费者幂等、重试、死信（**代码在 `backend/`**） |
| **TypeSafetyShared** | `agent-type-safety-shared.mdc` | 共享枚举/DTO、前后端契约对齐（含 [frontend/src/delivery/model/](frontend/src/delivery/model/) 与 `backend/src/main/scala/delivery/model/`；`domain-types/` 为重导出） |

## 推荐对话起手式

1. 说明当前切片（例如：「只改结算页，对接 POST /delivery/me/customer/checkout」）。
2. @ 对应规则 + @ 相关文件。
3. 明确要求：不修改其他切片目录（除非同步类型定义）。

## 规则文件位置

全部 **7** 个 `.mdc` 在 [.cursor/rules/](.cursor/rules/)；若需修订，可对照 [PLAN_AGENTS_RULES.md](PLAN_AGENTS_RULES.md) 中的原文块同步更新。
