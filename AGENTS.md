# 研发子代理（方案三 · 仅 Web）

在 Cursor 中通过 **@ 规则** 或规则面板启用对应 `.mdc`，让每个对话专注一个切片。总览与目录约定见 [.cursor/rules/delivery-project-context.mdc](.cursor/rules/delivery-project-context.mdc)。规则原文备份仍可在 [PLAN_AGENTS_RULES.md](PLAN_AGENTS_RULES.md) 查看。

## 仓库结构

| 路径 | 说明 |
|------|------|
| [frontend/](frontend/) | Vite + React，仅通过 `frontend/src/apis/**` 调用后端 API；业务状态不在浏览器内伪造持久化。 |
| [backend/](backend/) | Scala 3 + http4s + Circe 单进程后端：`ai` / `user` / `order` / `merchant` / `rider` + 网关；对外 API 经网关 `8787`。 |
| [sample/](sample/) | 结构参照样例；当前项目按 sample 的一 API 一文件、页面子目录拆分、`apiTypes/` 分层执行。 |

## 本地启动

1. 安装根目录脚本依赖（可选）：在仓库根执行 `npm install`。
2. PostgreSQL：可用 `docker compose -f backend/docker-compose.yml up -d`（默认用户/密码 `postgres`/`postgres`）。
3. 终端一：`cd backend && sbt run` 或根目录 `npm run dev:backend`，后端监听 **8787**。
4. 终端二：`cd frontend && npm install && npm run dev`，Vite 将 `/api` 代理到 `http://localhost:8787`。
5. 或根目录：`npm run dev`。

演示账号：`customer_demo` / `merchant_demo` / `rider_demo`，密码均为 `123456`。

## 前端 API 层

- API 基础设施：`frontend/src/apis/shared/`，包含 `APIMessage.ts`、`sendAPI.ts`、`client.ts`、`TaskIO.ts`。
- 业务 API：`frontend/src/apis/{ai,user,merchant,order,rider}/XxxAPI.ts`。
- 后端对应：`backend/src/{ai,user,merchant,order,rider}/api/XxxAPIMessage.scala`。
- 命名规则：前端 `XxxAPI.ts` 与后端 `XxxAPIMessage.scala` 一一对应。
- 契约对象：领域对象放 `objects/{module}/`；请求/响应 wrapper 放 `objects/{module}/apiTypes/`。
- 会话仅保存 JWT 与角色：`frontend/src/lib/auth-session.ts`。

## 当前结构规则

1. **一 API 一文件，前后端文件名对应**：
   `backend/src/*/api/XxxAPIMessage.scala` 与 `frontend/src/apis/*/XxxAPI.ts` 必须保持文件数量一致、职责一致。
2. **请求/响应对象与领域对象分层**：
   `*Request` / `*Response` 放入 `objects/*/apiTypes/`；真正系统对象保留在 `objects/*/` 根目录。
3. **页面按 sample 拆分**：
   `frontend/src/pages/{Page}/index.tsx` 只做页面装配，局部 UI 放 `components/`，函数放 `functions/`，局部常量/类型放 `objects/`，复杂数据协调优先进入 `hooks/`。
4. **交互产生的数据必须以后端为准**：
   用户在页面交互中产生的业务数据，必须通过 API 写入后端并可由后端再次查询得到。
5. **后端 Scala 只使用 `val`，不新增 `var`**。

## 子代理分工

| 子代理 | 规则文件 | 何时启用 |
|--------|----------|----------|
| **SliceCheckout** | `agent-slice-checkout.mdc` + `agent-slice-checkout-settlement.mdc` | 购物车、结算、优惠券入口、对齐下单 API |
| **SliceOrderTracking** | `agent-slice-order-tracking.mdc` | 订单详情、时间轴、配送状态、实时更新策略 |
| **SliceMerchantOps** | `agent-slice-merchant-ops.mdc` | 商户接单、备餐时间、营业状态、菜品上下架 |
| **EventReliability** | `agent-event-reliability.mdc` | Outbox、消费者幂等、重试、死信（代码在 `backend/`） |
| **TypeSafetyShared** | `agent-type-safety-shared.mdc` | `frontend/src/objects/**` 与 `backend/src/**/objects/**` 契约对齐 |

## 规则文件位置

全部 `.mdc` 在 [.cursor/rules/](.cursor/rules/)；类型安全审计 skill 在 [.codebuddy/skills/type-safety-audit/](.codebuddy/skills/type-safety-audit/)。
