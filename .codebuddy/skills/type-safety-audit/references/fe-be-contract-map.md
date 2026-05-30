# 前后端契约对照表

> 快照日期：2026-05-31 | 基于项目当前代码生成

## 一、API 消息对照

### User 模块（4 个 API）

| 后端 case class | 后端文件 | 前端 class | 前端文件 | 路径 | 状态 |
|---|---|---|---|---|---|
| `LoginAPIMessage` | `user/api/UserAPIMessages.scala` | `LoginAPI` | `user/LoginApi.ts` | `/loginapi` | ✅ 对齐 |
| `RegisterAPIMessage` | 同上 | `RegisterAPI` | `user/RegisterApi.ts` | `/registerapi` | ✅ 对齐 |
| `CustomerMeAPIMessage` | 同上 | `CustomerMeAPI` | `user/CustomerMeApi.ts` | `/customermeapi` | ✅ 对齐 |
| `CustomerProfilePatchAPIMessage` | 同上 | `CustomerProfilePatchAPI` | `user/CustomerProfilePatchApi.ts` | `/customerprofilepatchapi` | ✅ 对齐 |

### Merchant 模块（9 个 API）

| 后端 case class | 后端文件 | 前端 class | 前端文件 | 路径 | 状态 |
|---|---|---|---|---|---|
| `CatalogAPIMessage` | `merchant/api/MerchantAPIMessages.scala` | `CatalogAPI` | `merchant/CatalogApi.ts` | `/catalogapi` | ✅ 对齐 |
| `MerchantMeAPIMessage` | 同上 | `MerchantMeAPI` | `merchant/MerchantMeApi.ts` | `/merchantmeapi` | ✅ 对齐 |
| `MerchantProfileAPIMessage` | 同上 | `MerchantProfileAPI` | `merchant/MerchantProfileApi.ts` | `/merchantprofileapi` | ✅ 对齐 |
| `MerchantStoreAPIMessage` | 同上 | `MerchantStoreAPI` | `merchant/MerchantStoreApi.ts` | `/merchantstoreapi` | ✅ 对齐 |
| `MerchantStoreImageAPIMessage` | 同上 | `MerchantStoreImageAPI` | `merchant/MerchantStoreImageApi.ts` | `/merchantstoreimageapi` | ✅ 对齐 |
| `MerchantStoreImageFileAPIMessage` | 同上 | `MerchantStoreImageFileAPI` | `merchant/MerchantStoreImageFileApi.ts` | `/merchantstoreimagefileapi` | ✅ 对齐 |
| `MerchantCreateProductAPIMessage` | 同上 | `MerchantCreateProductAPI` | `merchant/MerchantProductApi.ts` | `/merchantcreateproductapi` | ⚠️ 文件名不一致 |
| `MerchantProductAPIMessage` | 同上 | `MerchantProductAPI` | `merchant/MerchantProductApi.ts` | `/merchantproductapi` | ⚠️ 两个 class 在同一文件 |
| `MerchantOrderReadyAPIMessage` | 同上 | `MerchantOrderReadyAPI` | `merchant/MerchantProductApi.ts` 旁的重导出文件 | `/merchantorderreadyapi` | ⚠️ 重导出桶文件 |

**问题**：
- `MerchantCreateProductApi.ts` 只有一行重导出 `export { createMerchantProductIO } from './MerchantProductApi'`
- `MerchantProductApi.ts` 包含两个 APIMessage 子类（`MerchantCreateProductAPI` + `MerchantProductAPI`），违反"一 API 一文件"
- `MerchantOrderReadyApi.ts` 只有重导出

### Order 模块（4 个 API）

| 后端 case class | 后端文件 | 前端 class | 前端文件 | 路径 | 状态 |
|---|---|---|---|---|---|
| `CheckoutAPIMessage` | `order/api/OrderAPIMessages.scala` | `CheckoutAPI` | `order/CheckoutApi.ts` | `/checkoutapi` | ✅ 对齐 |
| `CustomerOrdersAPIMessage` | 同上 | `CustomerOrdersAPI` | `order/CustomerOrdersApi.ts` | `/customerordersapi` | ✅ 对齐 |
| `OrderDetailAPIMessage` | 同上 | `OrderDetailAPI` | `order/OrderDetailApi.ts` | `/orderdetailapi` | ✅ 对齐 |
| `OrderCancelAPIMessage` | 同上 | `OrderCancelAPI` | `order/OrderCancelApi.ts` | `/ordercancelapi` | ✅ 对齐 |

**问题**：
- Checkout 只有 1 个 API，缺少结算详情查询、结算确认等

### Rider 模块（3 个 API）

| 后端 case class | 后端文件 | 前端 class | 前端文件 | 路径 | 状态 |
|---|---|---|---|---|---|
| `RiderMeAPIMessage` | `rider/api/RiderAPIMessages.scala` | `RiderMeAPI` | `rider/RiderMeApi.ts` | `/ridermeapi` | ✅ 对齐 |
| `RiderGrabOrderAPIMessage` | 同上 | `RiderGrabOrderAPI` | `rider/RiderOrderApi.ts` | `/ridergraborderapi` | ⚠️ 两个 class 在同一文件 |
| `RiderUpdateOrderStatusAPIMessage` | 同上 | `RiderUpdateOrderStatusAPI` | `rider/RiderOrderApi.ts` | `/riderupdateorderstatusapi` | ⚠️ 同上 |

**问题**：
- `RiderGrabOrderApi.ts` 和 `RiderUpdateOrderStatusApi.ts` 都是只有一行的重导出文件，实际定义在 `RiderOrderApi.ts`
- `RiderOrderApi.ts` 包含两个 APIMessage 子类，违反"一 API 一文件"
- `RiderUpdateOrderStatusAPIMessage` 缺少目标状态参数（仅传 orderId，后端自己决定状态流转）

## 二、Objects 契约对照

### shared/objects

| 后端文件 | 前端文件 | 字段对齐 | 状态 |
|---|---|---|---|
| `ids.scala` | `ids.ts` | ✅ 类型别名 + 枚举均对应 | ⚠️ 枚举未真正使用 |
| `ErrorBody.scala` | `ErrorBody.ts` | ✅ | ✅ |
| `HealthOk.scala` | `HealthOk.ts` | ✅ | ✅ |
| `OkResponse.scala` | `OkResponse.ts` | ✅ | ✅ |
| `Voucher.scala` | `Voucher.ts` | ✅ | ✅ |
| — | `DeliveryState.ts` | 前端独有 | ❓ 是否需要？ |

### user/objects（11 后端 vs 11 前端）

| 后端文件 | 前端文件 | 字段对齐 | 状态 |
|---|---|---|---|
| `Customer.scala` | `Customer.ts` | ✅ | ✅ |
| `CustomerAccountPublic.scala` | `CustomerAccountPublic.ts` | ✅ | ✅ |
| `CustomerMeResponse.scala` | `CustomerMeResponse.ts` | ✅ | ✅ |
| `CustomerProfile.scala` | `CustomerProfile.ts` | ✅ | ✅ |
| `CustomerProfilePatch.scala` | `CustomerProfilePatch.ts` | ✅ | ⚠️ 含 walletBalance |
| `CustomerDeliveryContact.scala` | `CustomerDeliveryContact.ts` | ✅ | ✅ |
| `LoginRequest.scala` | `LoginRequest.ts` | ✅ | ✅ |
| `LoginResponse.scala` | `LoginResponse.ts` | ✅ | ✅ |
| `RegisterRequest.scala` | `RegisterRequest.ts` | ✅ | ✅ |
| `MeResponse.scala` | `MeResponse.ts` | ✅ 联合类型 | ✅ |
| `CheckoutCompleteRequest.scala` | `CheckoutCompleteRequest.ts` | ✅ | ✅ |

### merchant/objects（12 后端 vs 12 前端）

| 后端文件 | 前端文件 | 字段对齐 | 状态 |
|---|---|---|---|
| `Merchant.scala` | `Merchant.ts` | ✅ | ✅ |
| `MerchantAccountPublic.scala` | `MerchantAccountPublic.ts` | ✅ | ✅ |
| `MerchantMeResponse.scala` | `MerchantMeResponse.ts` | ✅ | ✅ |
| `MerchantProfile.scala` | `MerchantProfile.ts` | ✅ | ✅ |
| `MerchantProfileBody.scala` | `MerchantProfileBody.ts` | ✅ | ✅ |
| `MerchantStoreProfile.scala` | `MerchantStoreProfile.ts` | ✅ | ✅ |
| `Product.scala` | `Product.ts` | ✅ | ✅ |
| `CatalogResponse.scala` | `CatalogResponse.ts` | ✅ | ✅ |
| `CreateProductRequest.scala` | `CreateProductRequest.ts` | ✅ | ✅ |
| `CreateStoreRequest.scala` | `CreateStoreRequest.ts` | ✅ | ✅ |
| `UpdateProductRequest.scala` | `UpdateProductRequest.ts` | ✅ | ✅ |
| `UpdateStoreImageRequest.scala` | `UpdateStoreImageRequest.ts` | ✅ | ✅ |

### order/objects（7 后端 vs 7 前端）

| 后端文件 | 前端文件 | 字段对齐 | 状态 |
|---|---|---|---|
| `Order.scala` | `Order.ts` | ✅ | ✅ |
| `OrderItem.scala` | `OrderItem.ts` | ✅ | ✅ |
| `CheckoutLine.scala` | `CheckoutLine.ts` | ✅ | ✅ |
| `CheckoutRequest.scala` | `CheckoutRequest.ts` | ✅ | ✅ |
| `CheckoutResponse.scala` | `CheckoutResponse.ts` | ✅ | ✅ |
| `CustomerOrdersResponse.scala` | `CustomerOrdersResponse.ts` | ✅ | ✅ |
| `OrderCancelResponse.scala` | `OrderCancelResponse.ts` | ✅ | ✅ |

### rider/objects（4 后端 vs 4 前端）

| 后端文件 | 前端文件 | 字段对齐 | 状态 |
|---|---|---|---|
| `Rider.scala` | `Rider.ts` | ✅ | ✅ |
| `RiderAccountPublic.scala` | `RiderAccountPublic.ts` | ✅ | ✅ |
| `RiderMeResponse.scala` | `RiderMeResponse.ts` | ✅ | ✅ |
| `RiderProfile.scala` | `RiderProfile.ts` | ✅ | ✅ |

## 三、API 总览

| 模块 | API 数量 | 健康检查 | 备注 |
|---|---|---|---|
| User | 4 | ✅ | 基本完整 |
| Merchant | 9 | ✅ | 静态文件路由未走 APIMessage |
| Order | 4 | ✅ | Checkout 功能偏少 |
| Rider | 3 | ✅ | 缺少独立的状态参数 |
| **合计** | **20** | | + 1 静态文件 HTTP 路由 |
