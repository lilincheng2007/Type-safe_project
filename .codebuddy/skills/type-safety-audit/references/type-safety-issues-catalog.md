# 类型安全问题分类与修复指南

> 更新日期：2026-06-02。问题目录已按当前 `sample` 风格结构刷新。

## P0 — API 文件与命名漂移

### 风险

后端聚合 `*APIMessages.scala`、前端 `src/api`、前端 `*Api.ts` 或 `*APIMessages.ts` 会破坏一 API 一文件和前后端文件名对应。

### 当前目标

- 后端：`backend/src/{ai,user,merchant,order,rider}/api/XxxAPIMessage.scala`
- 前端：`frontend/src/apis/{ai,user,merchant,order,rider}/XxxAPI.ts`
- 对应关系：`XxxAPIMessage.scala` ↔ `XxxAPI.ts`
- 禁止：`frontend/src/api`、`*APIMessages.scala`、`*APIMessages.ts`、业务 `*Api.ts`

### 修复方式

1. 将每个 `final case class XxxAPIMessage` 拆到同名文件。
2. 将前端 API 文件迁移到 `src/apis` 并命名为 `XxxAPI.ts`。
3. 删除 barrel 聚合文件，调用方直接导入真实 API 文件。
4. 运行 `check-type-safety.sh` 比对文件名。

## P1 — Request/Response 混入系统 objects

### 风险

`*Request` / `*Response` 放在 `objects/{module}/` 根目录会与真实系统对象混杂，导致审计时无法区分领域模型和 API wrapper。

### 当前目标

- 领域对象：`objects/{module}/{Name}.scala` / `.ts`
- API 类型：`objects/{module}/apiTypes/{Name}.scala` / `.ts`

### 修复方式

1. 将所有 `*Request` / `*Response` 移入 `apiTypes/`。
2. Scala 包名改为 `delivery.{module}.objects.apiTypes`。
3. TypeScript 导入改为 `@/objects/{module}/apiTypes/{Name}`。
4. 保留领域对象之间的 root imports，例如 `Order`、`Product`、`CustomerProfile`。

## P2 — 页面结构过扁平

### 风险

一个页面目录下堆放大量 Tab、Dialog、Card、helper，会导致页面边界不清，后续新增功能难以审计。

### 当前目标

```text
frontend/src/pages/PageName/
├── index.tsx
├── components/
├── hooks/
├── objects/
└── functions/
```

### 修复方式

1. `index.tsx` 只保留页面装配、路由级副作用和状态连接。
2. UI 块进入 `components/`。
3. 页面常量/局部类型进入 `objects/`。
4. 格式化、筛选、类型守卫进入 `functions/`。
5. 数据加载和提交协调后续优先抽成 `hooks/`。

## P3 — 前端越权状态管理

### 风险

前端本地计算钱包余额、订单状态、优惠券数量、骑手能量后写回后端，会绕过后端校验。

### 当前已修复基线

- `CustomerProfilePatch` 不包含 `walletBalance`。
- 充值通过 `CustomerRechargeAPIMessage` 后端原子更新。
- 过期优惠券舍弃通过 `CustomerVoucherDiscardAPIMessage` 后端校验后持久化。
- 结算金额、优惠券消耗、积分与升级奖励由后端 `CheckoutAPIMessage` / `OrderCompleteAPIMessage` 处理。
- 骑手超时免责卡兑换和使用由后端 rider API 校验。

### 审计重点

- 搜索 `patchCustomerProfileIO` 是否写入余额、订单、优惠券等后端业务字段。
- 搜索 `localStorage` 是否保存 JWT 以外的真实业务数据。
- 搜索前端是否直接构造已完成订单、扣款结果、骑手收入等最终业务状态。

## P4 — 枚举和 ID 类型退化

### 风险

共享枚举和 ID type alias 只定义不用，会使类型安全退化为字符串约定。

### 修复方式

- 后端对象字段和 API 参数使用 `UserId`、`MerchantId`、`ProductId`、`OrderId`、`RiderId`、`VoucherId`。
- 前端 interface 字段使用对应 TS type alias。
- 业务判断使用 `OrderStatus.已送达` / `OrderStatuses.已送达` 等共享枚举/常量。
- 用户提示文案可以包含中文状态名，但状态流转条件不能用裸字符串判断。

## P5 — 路由绕过 APIMessage

### 风险

业务 API 若直接写 http4s 字符串路由，会绕过统一 JSON、鉴权和 API 名称对齐规则。

### 当前规则

- 业务 API 必须注册到 `RegisteredAPIMessage`。
- 前端通过 `sendAPI(new XxxAPI(...))` 调用。
- 允许静态资源例外：商户图片访问路由。

## P6 — 文档/规则过时

### 风险

README、AGENTS、Cursor 规则或 skill 引用旧路径，会让后续开发重新引入 `src/api`、聚合 API 文件或扁平页面。

### 修复方式

- 文档统一使用 `frontend/src/apis`。
- 文档统一使用 `backend/src/{module}/api/XxxAPIMessage.scala`。
- objects 文档区分 root 领域对象与 `apiTypes`。
- 更新自动化脚本后再更新契约快照。
