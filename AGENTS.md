# 研发子代理（方案三 · 仅 Web）

在 Cursor 中通过 **@ 规则** 或规则面板启用对应 `.mdc`，让每个对话专注一个切片。总览与目录约定见 [.cursor/rules/delivery-project-context.mdc](.cursor/rules/delivery-project-context.mdc)。规则原文备份仍可在 [PLAN_AGENTS_RULES.md](PLAN_AGENTS_RULES.md) 查看。

## 仓库结构

| 路径 | 说明 |
|------|------|
| [frontend/](frontend/) | Vite + React，**仅通过 HTTP 调用** `backend` API；业务状态不在浏览器内伪造持久化。 |
| [backend/](backend/) | TypeScript + Hono，默认端口 **8787**；内存种子数据 + JWT 鉴权。 |
| [backend-scala-sample/](backend-scala-sample/) | 原模版的 Scala/http4s 示例，**与外卖 TS API 无关**。 |
| [模版/](模版/) | 迁移后仅余占位文件时可忽略或清理。 |

## 本地启动

1. 安装根目录脚本依赖（可选，用于一条命令双端）：在仓库根执行 `npm install`。
2. 终端一：`cd backend && npm install && npm run dev`
3. 终端二：`cd frontend && npm install && npm run dev`（Vite 已将 `/api` 代理到 `http://localhost:8787`，见 [frontend/vite.config.ts](frontend/vite.config.ts) 与 [frontend/.env.development](frontend/.env.development)）。
4. 或使用根目录：`npm run dev`（需已 `npm install`）。

演示账号（与种子数据一致）：`customer_demo` / `merchant_demo` / `rider_demo` / `admin`，密码均为 `123456`。

## 前端 API 层

- [frontend/src/lib/api/client.ts](frontend/src/lib/api/client.ts)：带 `Authorization: Bearer` 的 `fetch` 封装。
- [frontend/src/lib/api/authApi.ts](frontend/src/lib/api/authApi.ts)、[deliveryApi.ts](frontend/src/lib/api/deliveryApi.ts)：具体路由。
- 会话仅保存 JWT 与角色：[frontend/src/lib/auth-session.ts](frontend/src/lib/auth-session.ts)。

## 子代理分工

| 子代理 | 规则文件 | 何时启用 |
|--------|----------|----------|
| **SliceCheckout** | `agent-slice-checkout.mdc` + `agent-slice-checkout-settlement.mdc` | 购物车、结算、优惠券入口、对齐下单 API |
| **SliceOrderTracking** | `agent-slice-order-tracking.mdc` | 订单详情、时间轴、配送状态、实时更新策略 |
| **SliceMerchantOps** | `agent-slice-merchant-ops.mdc` | 商户接单、备餐时间、营业状态、菜品上下架 |
| **EventReliability** | `agent-event-reliability.mdc` | Outbox、消费者幂等、重试、死信（**代码在 `backend/`**） |
| **TypeSafetyShared** | `agent-type-safety-shared.mdc` | 共享枚举/DTO、前后端契约对齐（含 [frontend/src/domain-types/](frontend/src/domain-types/) 与后端 `backend/src/types.ts`） |

## 推荐对话起手式

1. 说明当前切片（例如：「只改结算页，对接 POST /delivery/me/customer/checkout」）。
2. @ 对应规则 + @ 相关文件。
3. 明确要求：不修改其他切片目录（除非同步类型定义）。

## 规则文件位置

全部 **7** 个 `.mdc` 在 [.cursor/rules/](.cursor/rules/)；若需修订，可对照 [PLAN_AGENTS_RULES.md](PLAN_AGENTS_RULES.md) 中的原文块同步更新。
