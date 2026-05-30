# 类型安全问题分类与修复指南

> 基于老师反馈及代码审计整理

---

## P0 — 枚举硬编码字符串（最高优先级）

### 问题描述

`ids.scala` / `ids.ts` 定义了枚举类型（`OrderStatus`、`RiderStatus`、`MerchantCategory` 等），但业务代码中大量使用中文字符串字面量进行比较和赋值，枚举形同虚设。

### 具体位置

#### 后端 — 字符串状态比较

| 文件 | 模式 | 应改为 |
|---|---|---|
| `order/tables/order/OrderTable.scala` | `status == "已送达"` | `status == OrderStatus.已送达.toString` 或模式匹配 |
| `merchant/tables/catalogproduct/CatalogProductTable.scala` | `listingStatus != "上架" && listingStatus != "下架"` | 枚举匹配 |
| `merchant/api/MerchantAPIMessages.scala` | 硬编码 `"上架"` / `"下架"` 赋值 | 使用枚举值 |
| `rider/api/RiderAPIMessages.scala` | 状态流转硬编码中文 | 使用 `RiderStatus` / `OrderStatus` 枚举 |
| 各 `TableInitializer.scala` | `CHECK (status IN ('制作中', '待接单', ...))` | 应用枚举生成 |

#### 后端 — ID 类型别名未使用

| 文件 | 现状 | 应改为 |
|---|---|---|
| `order/objects/Order.scala` | `customerId: String` | `customerId: UserId` |
| `merchant/objects/Product.scala` | `merchantId: String` | `merchantId: MerchantId` |
| `rider/objects/Rider.scala` | `id: String` | `id: RiderId` |
| 所有 domain objects | ID 字段均为 `String` | 使用对应的类型别名 |

#### 前端 — 同样的问题

| 文件 | 现状 | 应改为 |
|---|---|---|
| `objects/order/Order.ts` | `status: OrderStatus`（类型标注正确但运行时仍是字符串） | 确保所有赋值走枚举常量 |
| `stores/pages/use-customer-portal-store.ts` | 可能存在字符串比较 | 使用 `ids.ts` 中的联合类型常量 |

### 修复方案

1. **后端**：在 Scala enum 上添加 `.value` / `.toString` 方法，所有状态比较改用模式匹配或枚举值
2. **后端**：case class 中所有 ID 字段改用类型别名（`UserId` 等），Circe 编解码自动处理 `type X = String` 的透明别名
3. **前端**：从 `ids.ts` 导出枚举常量对象，所有状态判断使用常量而非字符串字面量
4. **前端**：ID 字段改用类型别名（`type UserId = string`），IDE 会提供类型提示

---

## P1 — 前后端契约不对齐

### 问题描述

部分 API 消息未严格遵守"一 API 一文件"规则，存在重导出桶文件和合并文件。

### 具体位置

| 问题 | 文件 | 修复 |
|---|---|---|
| 两个 APIMessage 在同一文件 | `frontend/src/api/merchant/MerchantProductApi.ts` 包含 `MerchantCreateProductAPI` + `MerchantProductAPI` | 拆分为 `MerchantCreateProductApi.ts` 和 `MerchantProductApi.ts` |
| 两个 APIMessage 在同一文件 | `frontend/src/api/rider/RiderOrderApi.ts` 包含 `RiderGrabOrderAPI` + `RiderUpdateOrderStatusAPI` | 拆分为 `RiderGrabOrderApi.ts` 和 `RiderUpdateOrderStatusApi.ts` |
| 仅重导出的桶文件 | `frontend/src/api/merchant/MerchantCreateProductApi.ts` | 拆分后改为真实定义 |
| 仅重导出的桶文件 | `frontend/src/api/merchant/MerchantOrderReadyApi.ts` | 确认是否需要 |
| 仅重导出的桶文件 | `frontend/src/api/rider/RiderGrabOrderApi.ts` | 拆分后改为真实定义 |
| 仅重导出的桶文件 | `frontend/src/api/rider/RiderUpdateOrderStatusApi.ts` | 拆分后改为真实定义 |
| DeliveryState.ts 前端独有 | `frontend/src/objects/shared/DeliveryState.ts` | 如无实际用途应删除 |

### 修复方案

1. 将合并文件中的每个 APIMessage 子类拆到独立 `.ts` 文件
2. 删除纯重导出桶文件，或将其实名化为对应的 APIMessage 定义文件
3. 更新 `*APIMessages.ts` barrel 文件的重导出路径
4. 确认 `DeliveryState.ts` 用途，无实际使用则删除

---

## P2 — 前端越权状态管理

### 问题描述

前端 Zustand store 中存在客户端修改后端业务数据再写回的模式，违反"交互数据以后端为准"原则。

### 具体位置

| 问题 | 文件 | 详情 |
|---|---|---|
| 充值逻辑前端计算余额 | `stores/pages/use-customer-portal-store.ts` 的 `recharge()` | 客户端 `walletBalance + amount` → `patchCustomerProfileIO({ walletBalance: next })` |
| CustomerProfilePatch 含 walletBalance | `objects/user/CustomerProfilePatch.ts` | 允许客户端直接设置余额 |
| CheckoutCompleteRequest 含 totalDebit | `objects/user/CheckoutCompleteRequest.ts` | 前端传入扣款金额，应由后端计算 |

### 修复方案

1. **新增后端 API**：`POST /rechargeapi`（或 `WalletRechargeAPIMessage`），后端原子操作：验证 → 加余额 → 返回新余额
2. **从 `CustomerProfilePatch` 移除 `walletBalance` 字段**，余额修改只能通过专用 API
3. **`CheckoutCompleteRequest` 移除 `totalDebit`**，后端根据订单项计算金额
4. 前端 recharge 功能改为调用新 API，而非本地计算

---

## P3 — API 功能缺失

### 问题描述

部分微服务 API 数量偏少，无法覆盖核心业务场景。

### 具体缺失

| 模块 | 缺失 API | 优先级 | 说明 |
|---|---|---|---|
| Order / Checkout | 结算详情查询 | 高 | 当前 checkout 只有提交，无法查看结算状态 |
| Order / Checkout | 结算确认/完成 | 高 | CheckoutCompleteRequest 已定义但无对应 API |
| Merchant | 营业状态切换 | 中 | 商户无法开关店 |
| Merchant | 备餐时间设置 | 中 | 商户无法设置预估备餐时间 |
| Merchant | 菜品上下架（独立 API） | 低 | 当前通过 updateProduct 间接实现 |
| Rider | 获取可接订单列表 | 高 | 当前 RiderMeResponse 包含 availableOrders，但缺少独立查询 API |
| Rider | 更新配送状态（含状态参数） | 高 | `RiderUpdateOrderStatusAPIMessage` 只有 orderId，无目标状态 |

### 修复方案

1. **Rider 状态参数**：给 `RiderUpdateOrderStatusAPIMessage` 添加 `targetStatus: OrderStatus` 字段
2. **Checkout 扩展**：新增 `CheckoutDetailAPIMessage` 和 `CheckoutCompleteAPIMessage`
3. **Merchant 补充**：新增 `MerchantToggleOpenAPIMessage`（营业状态切换）
4. **Rider 补充**：新增 `RiderAvailableOrdersAPIMessage`（可接订单列表）

---

## P4 — 路由残留与构建配置

### 问题描述

1. 后端存在 1 个非 APIMessage 的传统 HTTP 路由（静态文件服务），虽属合理例外但需标注
2. 前端 `apiNameOf()` 依赖 `constructor.name`，生产构建的代码压缩会破坏类名

### 具体位置

| 问题 | 文件 | 修复 |
|---|---|---|
| 静态文件未走 APIMessage | `merchant/routes/MerchantRoutes.scala` 的 `GET /api/merchant/store-images/{imageFile}` | 可保留但需注释说明 |
| 构建压缩会破坏类名 | `frontend/vite.config.ts` 未配置 `keep_classnames` | 添加 Terser 配置 `keep_classnames: true` |

### 修复方案

1. 在 `vite.config.ts` 中配置：
   ```typescript
   build: {
     minify: 'terser',
     terserOptions: { keep_classnames: true }
   }
   ```
2. 或在 APIMessage 基类中添加显式 `apiName` 属性，不依赖 `constructor.name`
