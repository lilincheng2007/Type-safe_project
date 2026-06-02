# Delivery Backend

`backend/` 是外卖平台的 Scala 后端服务。服务以单进程方式启动，监听 `8787` 端口，对外提供统一 `APIMessage` 网关，并连接 PostgreSQL 持久化业务数据。后端覆盖顾客、商家、骑手和 AI 模块，负责鉴权、订单流转、结算、优惠券、钱包、骑手配送和 AI 调用。

## 技术栈

- Scala 3.3.3
- Cats Effect 3
- http4s Ember Server / Client
- Circe JSON
- HikariCP + PostgreSQL JDBC
- JWT 鉴权
- OpenAI Chat Completions API

## 启动

### 1. 启动 PostgreSQL

在仓库根目录：

```bash
npm run dev:db
```

或在 `backend/` 目录：

```bash
docker compose up -d postgres
```

数据库默认账号密码均为 `postgres`。初始化脚本位于 `docker/init-databases.sql`，默认后端连接 `delivery_backend`。

### 2. 启动后端

```bash
cd backend
sbt run
```

启动成功后监听：

```text
http://localhost:8787
```

## 编译检查

```bash
cd backend
sbt compile
```

## 目录结构

```text
backend/
├── build.sbt
├── docker-compose.yml
├── docker/
│   └── init-databases.sql
└── src/
    ├── Main.scala                 # 服务入口，监听 0.0.0.0:8787
    ├── DeliveryRoutes.scala       # API 网关和公开静态路由汇总
    ├── ai/                        # AI 搜索、周报、订单文案、商家文案
    ├── user/                      # 登录注册、顾客资料、钱包、优惠券、收货联系人
    ├── merchant/                  # 商家账号、店铺、商品、目录、图片、订单处理
    ├── order/                     # 下单、订单查询、取消、确认完成、优惠券结算
    ├── rider/                     # 骑手资料、可抢单、抢单、送达、能量/免责卡
    └── shared/                    # API 网关、JWT、数据库、JSON codec、种子数据、共享对象
```

每个业务模块通常包含：

```text
api/       # APIMessage 定义
objects/   # 请求/响应/领域对象
tables/    # 表初始化与数据库访问
routes/    # API 注册或额外公开路由
utils/     # 模块内工具
```

## 服务入口与路由

- `src/Main.scala`
  - 启动 http4s Ember Server。
  - 初始化数据库连接池。
  - 执行表初始化和种子数据。
  - 开启 CORS。
- `src/DeliveryRoutes.scala`
  - 汇总 `UserRoutes`、`MerchantRoutes`、`OrderRoutes`、`RiderRoutes`、`AIRoutes`。
  - 注册 `/api` APIMessage 网关。
  - 注册商家店铺图片公开路由。

主 API：

```text
POST /api/{apiName}
```

公开店铺图片：

```text
GET /api/merchant/store-images/{fileName}
```

## APIMessage 网关

关键实现：

- `src/shared/api/APIMessage.scala`
  - `APIMessage[Response]`
  - `APIWithRoleMessage[Response]`
  - `RegisteredAPIMessage`
  - `APIMessageRouter`
- `src/shared/json/ApiJsonCodecs.scala`：Circe Codec 注册。
- 各模块 `routes/*Routes.scala`：使用 `api` 或 `apiWithRole` 注册消息。

`apiName` 由后端 `*APIMessage` 类名推导。例如：

```text
AISearchAPIMessage -> POST /api/aisearchapi
CustomerVoucherDiscardAPIMessage -> POST /api/customervoucherdiscardapi
```

需要登录的 API 使用 `APIWithRoleMessage` 注册，并通过 `Authorization: Bearer <token>` 校验角色。

## API 清单

### User API

| apiName | 角色 | 响应 |
|---|---|---|
| `loginapi` | 公开 | `LoginResponse` |
| `registerapi` | 公开 | `OkResponse` |
| `customermeapi` | customer | `CustomerMeResponse` |
| `customerprofilepatchapi` | customer | `OkResponse` |
| `customervoucherdiscardapi` | customer | `OkResponse` |
| `customerrechargeapi` | customer | `CustomerWalletTopUpResponse` |

### Merchant API

| apiName | 角色 | 响应 |
|---|---|---|
| `catalogapi` | 公开 | `CatalogResponse` |
| `merchantmeapi` | merchant | `MerchantMeResponse` |
| `merchantprofileapi` | merchant | `OkResponse` |
| `merchantstoreapi` | merchant | `String` |
| `merchantstoredescriptionapi` | merchant | `OkResponse` |
| `merchantstoreimageapi` | merchant | `OkResponse` |
| `merchantstoreimagefileapi` | merchant | `String` |
| `merchantcreateproductapi` | merchant | `Product` |
| `merchantproductapi` | merchant | `Product` |
| `merchantproductdescriptionsapi` | merchant | `OkResponse` |
| `merchantorderreadyapi` | merchant | `OkResponse` |

### Order API

| apiName | 角色 | 响应 |
|---|---|---|
| `customerordersapi` | customer | `CustomerOrdersResponse` |
| `orderdetailapi` | customer | `Order` |
| `ordercancelapi` | customer | `OrderCancelResponse` |
| `ordercompleteapi` | customer | `Order` |
| `checkoutapi` | customer | `CheckoutResponse` |

### Rider API

| apiName | 角色 | 响应 |
|---|---|---|
| `ridermeapi` | rider | `RiderMeResponse` |
| `rideravailableordersapi` | rider | `RiderAvailableOrdersResponse` |
| `ridergraborderapi` | rider | `OkResponse` |
| `riderupdateorderstatusapi` | rider | `RiderDeliverySettlement` |
| `riderredeemtimeoutcardapi` | rider | `RiderTimeoutCardRedeemResponse` |
| `riderusetimeoutcardapi` | rider | `RiderUseTimeoutCardResponse` |

### AI API

| apiName | 角色 | 响应 |
|---|---|---|
| `aisearchapi` | customer | `AISearchResponse` |
| `aidietweeklyreportapi` | customer | `AIDietWeeklyReportResponse` |
| `aiorderprogressnarrativesapi` | customer | `AIOrderProgressNarrativesResponse` |
| `aimerchantstoredescriptionapi` | merchant | `AIMerchantStoreDescriptionResponse` |
| `aimerchantproductdescriptionsapi` | merchant | `AIMerchantProductDescriptionsResponse` |

## 数据库结构

表初始化入口：`src/shared/db/DeliveryStateStore.scala`。各模块通过 `*TableInitializer.scala` 创建表和索引。

### user 模块

主要表：

- `auth_credentials`：登录凭据。
- `customers`：兼容顾客基础资料。
- `customer_profiles`：顾客公开档案、钱包、优惠券、收货联系人、积分等级。
- `customer_sessions`：顾客会话相关表。

重点字段：

- `customer_profiles.vouchers JSONB`
- `customer_profiles.delivery_contacts JSONB`
- `customer_profiles.wallet_balance`
- `customer_profiles.foodie_points`
- `customer_profiles.foodie_level`

### merchant 模块

主要表：

- `merchant_accounts`：商家账号与 profile JSON。
- `merchant_stores`：店铺资料、描述、图片。
- `catalog_merchants`：目录商家快照。
- `catalog_products`：目录商品、库存、上下架状态。

重点字段：

- `merchant_stores.description`
- `merchant_stores.image_url`
- `catalog_products.listing_status`
- `catalog_products.inventory_status`

### order 模块

主要表：

- `orders`：订单主表。
- `order_items`：订单项。
- `checkout_requests`：结算请求记录。

重点字段：

- `orders.original_amount`
- `orders.discount_amount`
- `orders.payable_amount`
- `orders.used_voucher JSONB`
- `orders.points_awarded`

订单查询性能索引：

- `orders_customer_created_idx`
- `orders_merchant_created_idx`
- `orders_rider_created_idx`
- `orders_available_idx`
- `order_items_order_id_idx`

### rider 模块

主要表：

- `rider_profiles`：骑手档案、薪资、能量、免责卡。
- `rider_accounts`：骑手账号。
- `rider_assignments`：骑手订单分配、配送状态、超时信息。

重点字段：

- `rider_profiles.energy_points`
- `rider_profiles.timeout_card_count`
- `rider_profiles.timeout_count`
- `rider_profiles.timeout_exempted_count`
- `rider_assignments.deadline_at`
- `rider_assignments.was_timeout`
- `rider_assignments.timeout_exempted`
- `rider_assignments.timeout_card_used`
- `rider_assignments.overtime_seconds`

## 主要对象结构

### shared objects

- `ids.scala`：`UserId`、`MerchantId`、`RiderId`、`ProductId`、`OrderId`、`VoucherId` 以及角色/状态枚举。
- `Voucher.scala`：优惠券。
- `OkResponse.scala`、`ErrorBody.scala`：通用响应。

### user objects

- `Customer`
- `CustomerProfile`
- `CustomerDeliveryContact`
- `CustomerProfilePatch`
- `CustomerMeResponse`
- `CustomerWalletTopUpResponse`
- `LoginRequest` / `LoginResponse`
- `RegisterRequest`

### merchant objects

- `Merchant`
- `Product`
- `MerchantProfile`
- `MerchantStoreProfile`
- `MerchantMeResponse`
- `CatalogResponse`
- `CreateStoreRequest`
- `CreateProductRequest`
- `UpdateProductRequest`
- `ProductDescriptionPatch`
- `UpdateStoreImageRequest`

### order objects

- `Order`
- `OrderItem`
- `CheckoutLine`
- `CheckoutRequest`
- `CheckoutResponse`
- `CustomerOrdersResponse`
- `OrderCancelResponse`

### rider objects

- `Rider`
- `RiderProfile`
- `RiderMeResponse`
- `RiderAvailableOrdersResponse`
- `RiderDeliveryStatus`
- `RiderDeliverySettlement`
- `RiderTimeoutCardRedeemResponse`
- `RiderUseTimeoutCardResponse`

### ai objects

- `AISearchRequest` / `AISearchResponse`
- `AIDietWeeklyReportRequest` / `AIDietWeeklyReportResponse`
- `AIOrderProgressNarrativesRequest` / `AIOrderProgressNarrativesResponse`
- `AIMerchantStoreDescriptionRequest` / `AIMerchantStoreDescriptionResponse`
- `AIMerchantProductDescriptionsRequest` / `AIMerchantProductDescriptionsResponse`
- `AIGeneratedProductDescription`

## 关键业务规则

### 顾客、优惠券与等级

- 新顾客注册时发放欢迎券。
- 结算时后端校验优惠券归属、剩余次数、是否过期、是否满足满减门槛。
- 使用优惠券后减少 `remainingCount`。
- 确认完成订单后，按实付金额向下取整累计吃货积分。
- 每 200 积分升 1 级，跨级后发放满减券。
- `CustomerVoucherDiscardAPIMessage` 只允许舍弃已过期优惠券；未过期或不存在会返回错误。

### 收货联系人

- 多组联系人保存在 `customer_profiles.delivery_contacts JSONB`。
- 保存时后端校验联系人姓名、电话、地址非空。
- 至少需要一组联系人。
- 必须且只能有一组默认联系人。

### 订单与结算

- 结算会创建订单、订单项并扣减钱包余额。
- 取消订单会退回实付金额。
- 商家完成出餐后，订单进入骑手可抢单流程。
- 骑手抢单后更新订单 rider 与配送分配记录。
- 顾客确认完成后沉淀历史订单和积分。

### 订单查询性能

订单读取使用精准查询和批量加载：

- `OrderTable.listByCustomerId`
- `OrderTable.listByMerchantIds`
- `OrderTable.listByRiderId`
- `OrderTable.listAvailableUnassigned`
- `OrderTable.countActiveByRider`
- `OrderItemTable.listByOrderIds`

这些方法减少全表扫描和订单项 N+1 查询。

### 商家能力

- 店铺描述可由商家手动保存或 AI 生成后保存。
- 菜品描述可批量 AI 生成并确认保存。
- 店铺图片支持 URL 保存和文件上传。
- 商品支持上下架、库存数量和库存状态。
- 商家只能操作自己拥有的店铺与商品。

### 骑手能力

- 同一骑手最多同时配送 5 单。
- 每单配送成功薪资增加 `5`。
- 非超时送达获得 `10` 能量。
- `100` 能量可兑换 1 张超时免责卡。
- 配送超时阈值由 `RiderTimeoutPolicy` 管理，当前为 45 分钟。
- 超时且有免责卡时自动消耗；超时无卡时可后续手动补用。

### AI 能力

`src/ai/utils/OpenAIClient.scala` 负责 OpenAI 兼容接口调用，支持超时与重试。

AI 功能包括：

- 顾客 AI 搜索：根据自然语言需求推荐商家与菜品。
- 顾客 AI 饮食周报：基于近 7 天订单生成分析。
- 顾客 AI 订单进度叙事：按订单状态生成展示文案。
- 商家 AI 店铺描述：根据店铺与商品生成描述。
- 商家 AI 菜品描述：批量生成菜品卖点文案。

## 配置

### 数据库

| 环境变量 | 默认值 | 说明 |
|---|---|---|
| `DB_HOST` | `127.0.0.1` | PostgreSQL 主机 |
| `DB_PORT` | `5432` | PostgreSQL 端口 |
| `DB_NAME` | `delivery_backend` | 连接数据库 |
| `DB_USER` | `postgres` | 数据库用户 |
| `DB_PASSWORD` | `postgres` | 数据库密码 |
| `DB_MAX_POOL_SIZE` | `10` | 连接池大小 |
| `DB_CONNECTION_TIMEOUT_MS` | `3000` | 连接超时 |
| `DB_POOL_NAME` | `delivery-backend-pool` | 连接池名称 |

相关文件：

- `src/shared/db/DatabaseConfig.scala`
- `src/shared/db/DatabasePool.scala`
- `src/shared/db/DeliveryStateStore.scala`

### JWT

JWT 实现在 `src/shared/auth/JwtSupport.scala`。开发环境会使用默认密钥，生产或多人协作环境建议显式配置：

```bash
export JWT_SECRET=replace-with-a-strong-secret
```

### AI

启动后端前配置：

```bash
export OPENAI_API_KEY=your-key-here
# 可选
export OPENAI_BASE_URL=https://api.openai.com/v1
export OPENAI_MODEL=gpt-4o-mini
```

未配置 `OPENAI_API_KEY` 时，普通业务功能仍可运行；AI 功能会提示服务未配置或返回兜底内容。

## 演示数据

种子数据位于 `src/shared/bootstrap/SeedData.scala` 和 `src/shared/bootstrap/SeedBootstrap.scala`，包含默认顾客、商家、菜品、骑手与初始订单。

演示账号：

| 角色 | 账号 | 密码 |
|---|---|---|
| 顾客 | `customer_demo` | `123456` |
| 商家 | `merchant_demo` | `123456` |
| 骑手 | `rider_demo` | `123456` |

## 新增后端 API 的推荐步骤

1. 在对应模块 `objects/` 新增请求/响应或领域对象。
2. 在对应模块 `api/` 新增 `*APIMessage`。
3. 在 `routes/` 中使用 `api` 或 `apiWithRole` 注册。
4. 在 `src/shared/json/ApiJsonCodecs.scala` 注册 Codec。
5. 同步前端 `frontend/src/api/*` 与 `frontend/src/objects/*` 的契约。
6. 运行 `sbt compile` 验证。

## 代码约定

- 后端 Scala 新代码使用 `val`，避免新增 `var`。
- 业务 API 优先走 `APIMessage` 网关，不新增零散字符串路由；静态资源等特殊场景除外。
- 需要鉴权的业务操作必须使用 `APIWithRoleMessage` 并声明角色。
- 业务数据以后端数据库为准，不依赖前端本地状态作为真实数据源。
- 修改 API 或对象时，保持前后端契约字段语义一致。
