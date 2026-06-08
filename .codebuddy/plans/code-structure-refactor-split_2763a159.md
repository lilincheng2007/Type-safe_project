---
name: code-structure-refactor-split
overview: 按 sample 风格优化项目结构，优先拆分当前体积最大、职责最混杂的前端页面/组件/store 与后端 checkout/order table/status/admin monitor 等聚合逻辑，保持 API 一文件一消息与 objects/apiTypes 分层不破坏。
todos:
  - id: split-merchant-products-orders
    content: 使用 [subagent:code-explorer] 拆分 MerchantConsole 的 ProductsTab 和 OrdersTab
    status: completed
  - id: split-customer-pages
    content: 拆分 CustomerPortal 的 Profile、商家点餐和结算页面模块
    status: completed
    dependencies:
      - split-merchant-products-orders
  - id: split-page-stores
    content: 拆分顾客端和商家端 Zustand store 为业务 slices
    status: completed
    dependencies:
      - split-customer-pages
  - id: split-notifications-admin
    content: 拆分全局通知中心和 AdminConsole 后台面板
    status: completed
    dependencies:
      - split-page-stores
  - id: split-backend-order-merchant
    content: 拆分后端订单结算、订单表、状态机和商家表服务
    status: completed
    dependencies:
      - split-notifications-admin
  - id: verify-refactor
    content: 使用 [skill:type-safety-audit] 验证审计、前端类型检查和后端编译
    status: completed
    dependencies:
      - split-backend-order-merchant
---

## User Requirements

用户希望对当前项目进行代码结构优化，重点是参考此前结构分析结果，对已经变大的页面、组件、store、后端 support/table/service 文件进行尽量充分的拆分。

## Product Overview

本次不新增业务功能，不改变现有用户交互和页面视觉效果。目标是保持当前外卖系统功能不变，同时提升代码可维护性、模块边界清晰度、类型安全和后续扩展效率。

## Core Features

- 拆分前端超大页面组件，减少单文件职责过重问题。
- 拆分顾客端和商家端 Zustand store，将购物车、订单、退款、评价、店铺、商品、AI 等逻辑分层。
- 拆分后端订单结算、订单表读写、订单状态流转、商家店铺表同步等高复杂度文件。
- 保持现有 API 契约、路由、页面行为和数据来源不变。
- 拆分后继续通过类型安全审计、前端 typecheck 和后端编译。

## Tech Stack Selection

- 前端：沿用当前 Vite、React、TypeScript、Zustand、现有 UI 组件体系。
- 后端：沿用 Scala 3、cats-effect IO、http4s、Circe、PostgreSQL。
- 类型安全检查：沿用项目内 `.codebuddy/skills/type-safety-audit/scripts/check-type-safety.sh`。
- 不引入新框架、不迁移状态管理库、不改变 APIMessage 机制。

## Implementation Approach

本次采用“行为保持型结构重构”。优先处理最大、最影响后续开发的文件，先拆 UI 和纯函数，再拆 store slice，最后拆后端 service/table 内部结构。所有拆分都应保留原有对外导出和调用路径，避免扩大影响面。

关键策略：

1. 前端页面先拆组件、hooks、functions、objects，不改变页面路由和父组件 props。
2. Store 拆分时保留原 `useCustomerPortalStore` 和 `useMerchantConsoleStore` 导出，内部组合 slice，避免调用方大规模改动。
3. 后端 APIMessage 文件不拆出新的 APIMessage，不新增聚合 `APIMessages`，只把业务逻辑下沉到 service、validator、mapper、sql 文件。
4. 后端 table 拆分保持 facade 名称不变，例如 `OrderTable.list`、`OrderTable.upsert` 仍保留，避免调用方大范围修改。
5. 每一批拆分后运行类型检查，避免长时间累积迁移风险。

## Implementation Notes

- 严格遵守项目规则：
- 一 API 一文件。
- 前后端 objects 名称分层对应。
- `Request` 和 `Response` 只放 `apiTypes`。
- 页面根目录保留 `index.tsx`。
- 后端 Scala 不新增 `var`。
- 禁止新增 Unsafe、Unsfe、`as any`、`@ts-ignore`、`unsafeFromString` 等逃逸口。
- 优先抽纯函数，降低重构风险。
- 对大型组件拆分时先保持 props 显式传递，不引入全局隐式依赖。
- 对 Zustand store 拆分时保持现有 selector 可用，避免页面一次性联动变更过多。
- 对后端 service 拆分时优先移动私有函数，保留公开方法签名。
- 验证顺序：

1. `npm run typecheck --prefix frontend`
2. `cd backend && sbt -batch compile`
3. `bash .codebuddy/skills/type-safety-audit/scripts/check-type-safety.sh /Users/leonli/Desktop/Type-safe_project`

## Architecture Design

### Frontend Refactor Architecture

将页面从“单文件承载全部 UI 和逻辑”调整为：

- `index.tsx`：页面装配和路由级状态连接。
- `components/feature/`：业务 UI 块。
- `hooks/`：页面局部数据协调、副作用、轮询、URL 同步。
- `functions/`：纯函数、格式化、筛选、分组、计算。
- `objects/`：页面局部类型、草稿对象、常量。

### Store Refactor Architecture

将单个大型 Zustand store 拆为 slice：

- `types.ts`：store state 和 action 类型。
- `initialState.ts`：初始状态。
- `createXxxSlice.ts`：独立业务域 actions。
- 原 store 文件保留为组合入口。

### Backend Refactor Architecture

将后端从“APIMessage/Table 承载大量业务细节”调整为：

- APIMessage：鉴权、参数入口、调用 service。
- Service：业务编排。
- Validator：校验规则。
- Mapper：ResultSet 和 PreparedStatement 映射。
- Sql：SQL 常量。
- Facade：保留原有 `OrderTable` 等调用入口。

## Directory Structure

### Phase 1: MerchantConsole 商品和订单拆分

```text
frontend/src/pages/MerchantConsole/
├── components/
│   ├── ProductsTab.tsx                         # [MODIFY] 缩减为商品页编排入口，引用 products 子模块。
│   ├── OrdersTab.tsx                           # [MODIFY] 缩减为订单页编排入口，引用 orders 子模块。
│   ├── products/
│   │   ├── ProductListSection.tsx              # [NEW] 商品列表和分组展示。
│   │   ├── ProductCard.tsx                     # [NEW] 单个菜品或套餐卡片。
│   │   ├── ProductCreateDialog.tsx             # [NEW] 新建菜品和套餐弹窗。
│   │   ├── ProductEditDialog.tsx               # [NEW] 编辑菜品和套餐弹窗。
│   │   ├── BundleGroupsEditor.tsx              # [NEW] 套餐类别和选项编辑。
│   │   ├── BundleProductPicker.tsx             # [NEW] 套餐内菜品选择界面。
│   │   ├── ProductPromotionDialog.tsx          # [NEW] 单品优惠编辑弹窗。
│   │   └── StorePromotionsPanel.tsx            # [NEW] 店铺优惠摘要和管理入口。
│   └── orders/
│       ├── OrderWorkflowSection.tsx            # [NEW] 待接单、制作中、履约中、历史订单分区。
│       ├── MerchantOrderCard.tsx               # [NEW] 商家订单卡片。
│       ├── PrepTimeControls.tsx                # [NEW] 接单备餐时间选择。
│       └── DelayPrepControls.tsx               # [NEW] 延迟备餐输入和提交。
├── hooks/
│   ├── useProductDraft.ts                      # [NEW] 商品创建和编辑草稿状态。
│   ├── useBundleGroupsDraft.ts                 # [NEW] 套餐组编辑状态。
│   └── useMerchantOrderActions.ts              # [NEW] 订单操作回调封装。
├── functions/
│   ├── productFormMapping.ts                   # [NEW] Product 与表单草稿互转。
│   ├── productGrouping.ts                      # [NEW] 商品按分类和套餐类型分组。
│   ├── bundleValidation.ts                     # [NEW] 套餐本地校验。
│   └── merchantOrderDisplay.ts                 # [NEW] 商家订单文案、分组、状态提示。
└── objects/
    ├── productDraft.ts                         # [NEW] 商品表单草稿类型和默认值。
    └── merchantOrderView.ts                    # [NEW] 商家订单视图局部类型。
```

### Phase 2: CustomerPortal 页面拆分

```text
frontend/src/pages/CustomerPortal/
├── components/
│   ├── ProfileTab.tsx                          # [MODIFY] 缩减为我的页 panel 编排。
│   ├── CustomerMerchantOrderPage.tsx           # [MODIFY] 缩减为商家点餐页编排。
│   ├── CustomerCheckoutPage.tsx                # [MODIFY] 缩减为结算页编排。
│   ├── profile/
│   │   ├── ProfileOverviewPanel.tsx            # [NEW] 我的页首页概览。
│   │   ├── WalletCard.tsx                      # [NEW] 钱包卡片。
│   │   ├── FoodieLevelCard.tsx                 # [NEW] 吃货等级。
│   │   ├── AIDietReportCard.tsx                # [NEW] AI 饮食周报。
│   │   ├── PendingOrdersPanel.tsx              # [NEW] 待收货订单列表。
│   │   ├── HistoryOrdersPanel.tsx              # [NEW] 历史订单列表。
│   │   ├── ProfileOrderCard.tsx                # [NEW] 我的页订单卡片。
│   │   ├── FavoritesPanel.tsx                  # [NEW] 收藏商家和菜品。
│   │   ├── CouponsPanel.tsx                    # [NEW] 优惠券列表。
│   │   └── RefundFeedback.tsx                  # [NEW] 退款状态反馈。
│   ├── merchantOrder/
│   │   ├── MerchantHeader.tsx                  # [NEW] 商家头部、营业状态、公告。
│   │   ├── StorePromotionsBanner.tsx           # [NEW] 商家促销展示。
│   │   ├── CategorySidebar.tsx                 # [NEW] 分类导航。
│   │   ├── ProductMenu.tsx                     # [NEW] 菜单列表容器。
│   │   ├── CustomerProductCard.tsx             # [NEW] 顾客端商品卡。
│   │   ├── FloatingCartBar.tsx                 # [NEW] 本店购物车底栏。
│   │   ├── ReviewsPane.tsx                     # [NEW] 评价页。
│   │   └── AIReviewSummaryCard.tsx             # [NEW] AI 评价总结。
│   └── checkout/
│       ├── CheckoutLineList.tsx                # [NEW] 结算商品明细。
│       ├── CheckoutPriceSummary.tsx            # [NEW] 价格和优惠汇总。
│       ├── CheckoutVoucherPicker.tsx           # [NEW] 优惠券选择。
│       ├── CheckoutContactSection.tsx          # [NEW] 收货联系人。
│       ├── MerchantNotesSection.tsx            # [NEW] 商家备注和图片。
│       └── CheckoutSubmitBar.tsx               # [NEW] 底部提交栏。
├── hooks/
│   ├── useProfilePanels.ts                     # [NEW] 我的页面板切换。
│   ├── useVoucherBuckets.ts                    # [NEW] 优惠券可用和过期分组。
│   ├── useOrderProgressNarratives.ts           # [NEW] 订单进度 AI 文案选择。
│   ├── useCategoryScrollSpy.ts                 # [NEW] 商家页分类滚动定位。
│   ├── useMerchantReviews.ts                   # [NEW] 商家评价加载和筛选。
│   ├── useBundleUrlSync.ts                     # [NEW] 套餐弹窗 URL 同步。
│   ├── useCheckoutDraft.ts                     # [NEW] 结算联系人、优惠券、备注草稿。
│   └── useCheckoutPricing.ts                   # [NEW] 结算页本地展示计算。
├── functions/
│   ├── profileOrderDisplay.ts                  # [NEW] 我的页订单文案。
│   ├── refundFeedback.ts                       # [NEW] 退款反馈文案和样式。
│   ├── voucherFilters.ts                       # [NEW] 优惠券过滤。
│   ├── merchantProductGrouping.ts              # [NEW] 商家商品分组。
│   ├── productPromotionDisplay.ts              # [NEW] 商品优惠展示计算。
│   ├── reviewSummaryParts.ts                   # [NEW] AI 评价高亮拆分。
│   ├── checkoutPricing.ts                      # [NEW] 结算展示价格计算。
│   └── merchantNotes.ts                        # [NEW] 商家备注归一化。
└── objects/
    ├── profilePanels.ts                        # [NEW] 我的页面板类型。
    ├── checkoutDraft.ts                        # [NEW] 结算草稿类型。
    └── merchantOrderView.ts                    # [NEW] 商家点餐页局部类型。
```

### Phase 3: Store slice 拆分

```text
frontend/src/stores/pages/
├── use-customer-portal-store.ts                # [MODIFY] 保留原导出，组合 customerPortal slices。
├── use-merchant-console-store.ts               # [MODIFY] 保留原导出，组合 merchantConsole slices。
├── customerPortal/
│   ├── types.ts                                # [NEW] CustomerPortalStore 类型。
│   ├── initialState.ts                         # [NEW] 初始状态。
│   ├── favoritesStorage.ts                     # [NEW] 收藏 localStorage，仍只保存 UI 偏好。
│   ├── createCustomerDataSlice.ts              # [NEW] bootstrap、refresh、目录和账户。
│   ├── createCartSlice.ts                      # [NEW] 购物车和库存裁剪动作。
│   ├── createOrderSlice.ts                     # [NEW] 订单详情、取消、完成、再来一单。
│   ├── createRefundSlice.ts                    # [NEW] 退款申请和仲裁。
│   ├── createReviewSlice.ts                    # [NEW] 评价上传、提交、投票。
│   ├── createWalletSlice.ts                    # [NEW] 充值和优惠券舍弃。
│   └── createAISlice.ts                        # [NEW] AI 周报和订单进度叙事。
└── merchantConsole/
    ├── types.ts                                # [NEW] MerchantConsoleStore 类型。
    ├── initialState.ts                         # [NEW] 初始状态。
    ├── createSessionSlice.ts                   # [NEW] session 和页面状态。
    ├── createStoreProfileSlice.ts              # [NEW] 店铺加载、创建、描述、图片。
    ├── createOrderOpsSlice.ts                  # [NEW] 接单、拒单、出餐、延迟备餐。
    ├── createProductSlice.ts                   # [NEW] 商品创建、编辑、图片。
    ├── createBusinessHoursSlice.ts             # [NEW] 营业状态和时间。
    ├── createPromotionSlice.ts                 # [NEW] 店铺优惠保存。
    └── createAISlice.ts                        # [NEW] 商家 AI 文案。
```

### Phase 4: Notifications 和 AdminConsole 拆分

```text
frontend/src/components/
├── GlobalNotificationCenter.tsx                # [MODIFY] 缩减为全局通知入口和组件组合。
└── notifications/
    ├── NotificationBell.tsx                    # [NEW] 铃铛按钮和红点。
    ├── NotificationList.tsx                    # [NEW] 通知列表容器。
    ├── NotificationItem.tsx                    # [NEW] 单条通知。
    ├── useGlobalNotifications.ts               # [NEW] 通知聚合 hook。
    ├── useNotificationPolling.ts               # [NEW] 轮询和刷新节流。
    ├── notificationStorage.ts                  # [NEW] 本地展示缓存。
    ├── customerNotificationEvents.ts           # [NEW] 顾客事件构建。
    ├── merchantNotificationEvents.ts           # [NEW] 商家事件构建。
    ├── riderNotificationEvents.ts              # [NEW] 骑手事件构建。
    └── adminNotificationEvents.ts              # [NEW] 管理员事件构建。

frontend/src/pages/AdminConsole/
├── index.tsx                                   # [MODIFY] 缩减为后台页面装配。
├── components/
│   ├── PlatformPromotionsSummary.tsx           # [NEW] 平台优惠摘要。
│   ├── OrderMonitorPanel.tsx                   # [NEW] 订单监控。
│   ├── OnboardingRequestsPanel.tsx             # [NEW] 入驻审核。
│   ├── AdminRefundRequestsPanel.tsx            # [NEW] 退款仲裁。
│   ├── RejectOnboardingDialog.tsx              # [NEW] 入驻驳回弹窗。
│   └── RefundReviewDialog.tsx                  # [NEW] 退款审核弹窗。
├── hooks/
│   ├── useAdminConsoleData.ts                  # [NEW] 后台首页数据加载。
│   ├── useOnboardingReview.ts                  # [NEW] 入驻审核操作。
│   └── useAdminRefundReview.ts                 # [NEW] 退款仲裁操作。
└── functions/
    ├── adminFormatters.ts                      # [NEW] 日期和金额格式化。
    └── statusBadges.ts                         # [NEW] 状态 badge 映射。
```

### Phase 5: Backend order 和 merchant 拆分

```text
backend/src/order/
├── api/
│   ├── OrderAPIMessageSupport.scala            # [MODIFY] 缩减为兼容 facade，或逐步由 service 替代。
│   └── OrderStatusTransitionService.scala      # [MODIFY] 缩减为状态流转编排。
├── services/
│   ├── checkout/
│   │   ├── CheckoutOrderBuilder.scala          # [NEW] 下单构建订单。
│   │   ├── CheckoutPricingService.scala        # [NEW] 价格、优惠和分摊。
│   │   ├── CheckoutLineValidator.scala         # [NEW] 购物车行合法性校验。
│   │   ├── BundleSelectionValidator.scala      # [NEW] 套餐选择校验。
│   │   ├── InventoryDeductionService.scala     # [NEW] 库存扣减。
│   │   ├── VoucherUsageService.scala           # [NEW] 优惠券校验和消耗。
│   │   └── OrderItemNameBuilder.scala          # [NEW] 订单商品展示名。
│   └── status/
│       ├── OrderTransitionRules.scala          # [NEW] 状态流转矩阵。
│       ├── OrderTimelineEventFactory.scala     # [NEW] 时间线事件生成。
│       └── OrderTransitionNotifier.scala       # [NEW] 系统聊天通知。
└── tables/order/
    ├── OrderTable.scala                        # [MODIFY] 保留公开 facade。
    ├── OrderSql.scala                          # [NEW] SQL 字符串和列名。
    ├── OrderRowMapper.scala                    # [NEW] bindOrder 和 readOrderRow。
    ├── OrderQueries.scala                      # [NEW] 查询方法。
    ├── OrderWrites.scala                       # [NEW] upsert、update、delete。
    └── OrderItemAttach.scala                   # [NEW] OrderItem 回填。

backend/src/merchant/
├── api/
│   ├── MerchantCreateProductAPIMessage.scala   # [MODIFY] 移除重复套餐校验。
│   └── MerchantProductAPIMessage.scala         # [MODIFY] 移除重复套餐校验。
├── services/
│   └── ProductBundleValidator.scala            # [NEW] 复用套餐校验。
└── tables/merchantstore/
    ├── MerchantStoreTable.scala                # [MODIFY] 保留 facade。
    ├── MerchantStoreSql.scala                  # [NEW] merchant_stores 和 catalog_merchants SQL。
    ├── MerchantStoreRowMapper.scala            # [NEW] bind 和 read。
    └── CatalogMerchantSync.scala               # [NEW] 目录表同步职责。
```

## Key Code Structures

建议默认不改变公开 API 签名。必要的 store slice 类型可采用项目现有 Zustand 模式，保持原 selector 不变：

```ts
export type CustomerPortalSliceCreator<TSlice> = (
  set: StoreApi<CustomerPortalStore>['setState'],
  get: StoreApi<CustomerPortalStore>['getState'],
) => TSlice
```

若 exact signature 在实现中因 Zustand 版本需要调整，应以当前 `create<CustomerPortalStore>()((set, get) => ...)` 的实际类型推导为准，不强行引入复杂泛型。

## Agent Extensions

### Skill

- **type-safety-audit**
- Purpose: 在拆分过程中持续检查 API 一文件一消息、objects/apiTypes 分层、页面目录结构、Unsafe 逃逸口和前端越权状态。
- Expected outcome: 每个拆分阶段后审计通过，最终保持 `0 失败`。

### SubAgent

- **code-explorer**
- Purpose: 在实施每个大文件拆分前定位精确调用方、props、内部 helper、可抽取纯函数和依赖边界。
- Expected outcome: 每轮拆分前获得具体文件引用关系和安全迁移顺序，避免遗漏调用点。