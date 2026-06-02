# Delivery Frontend

`frontend/` 是外卖平台 Web 前端，基于 Vite + React + TypeScript 构建。前端使用 `APIMessage` 封装访问后端 `POST /api/{apiName}` 网关；页面状态由 Zustand 管理；UI 使用 shadcn/ui、Radix UI 和 Tailwind CSS。

## 技术栈

- Vite 8
- React 19
- TypeScript 5
- React Router
- Zustand
- shadcn/ui + Radix UI
- Tailwind CSS v4
- lucide-react

## 启动

```bash
cd frontend
npm install
npm run dev
```

默认 Vite dev server 会将 `/api` 代理到 `http://localhost:8787`。也可以在仓库根目录一键启动全栈：

```bash
npm install
npm run dev
```

## 常用命令

| 命令 | 说明 |
|---|---|
| `npm run dev` | 启动 Vite 开发服务器 |
| `npm run typecheck` | TypeScript 类型检查 |
| `npm run lint` | ESLint 检查 |
| `npm run lint:fix` | 自动修复可修复的 lint 问题 |
| `npm run build` | 类型检查并构建生产产物 |
| `npm run preview` | 预览生产构建 |
| `npm run ui:add -- <component>` | 添加 shadcn/ui 组件 |

## 环境变量

| 变量 | 默认值 | 说明 |
|---|---|---|
| `VITE_BACKEND_URL` | `http://localhost:8787` | Vite dev proxy 的后端目标 |
| `VITE_API_BASE` | `/api` | 前端 API base path |

示例：

```bash
VITE_BACKEND_URL=http://localhost:8787 npm run dev
```

## 目录结构

```text
src/
├── apis/                    # APIMessage 封装
│   ├── ai/                 # AI 搜索、AI 周报、AI 文案 API
│   ├── merchant/           # 商家、目录、店铺、商品、图片、订单 API
│   ├── order/              # 顾客订单、结算、取消、确认完成 API
│   ├── rider/              # 骑手工作台、抢单、送达、免责卡 API
│   ├── user/               # 登录注册、顾客资料、充值、优惠券舍弃 API
│   └── shared/             # APIMessage、sendAPI、client、TaskIO
├── components/             # 通用组件
│   ├── ui/                 # shadcn/ui 组件
│   ├── AISearchBar.tsx
│   └── AISearchResults.tsx
├── hooks/                  # useAppChrome、auth session 等 hooks
├── lib/                    # auth、媒体 URL、收货联系人等工具
├── objects/                # 与后端 case class 对应的 TS 契约对象
├── pages/                  # 页面模块
├── stores/                 # Zustand store
├── router.tsx              # 路由定义
├── main.tsx                # React 入口
└── index.css               # 全局样式与 Tailwind
```

## 页面路由

路由定义位于 `src/router.tsx`。

| 路由 | 页面 | 角色 |
|---|---|---|
| `/` | 重定向到 `/auth/login` | 游客 |
| `/auth/login` | 登录页 | 游客 |
| `/auth/register` | 注册页 | 游客 |
| `/delivery/customer` | 顾客门户 | 顾客 |
| `/delivery/customer/m/:merchantId` | 店内点餐页 | 顾客 |
| `/delivery/customer/checkout` | 顾客结算页 | 顾客 |
| `/delivery/merchant` | 商家控制台 | 商家 |
| `/delivery/rider` | 骑手工作台 | 骑手 |

路由守卫位于 `src/components/RoleRouteGuards.tsx`，根据 `src/lib/auth-session.ts` 中保存的 JWT 与角色控制访问。

## 页面功能结构

### 顾客端：`src/pages/CustomerPortal/`

- `HomeTab.tsx`：商家目录、AI 搜索入口。
- `CustomerMerchantOrderPage.tsx`：店内点餐、店铺购物车、跳转结算。
- `CustomerCheckoutPage.tsx`：收货信息选择、新增联系人、优惠券选择、钱包校验、提交结算。
- `CartTab.tsx`：购物车汇总和数量修改。
- `ProfileTab.tsx`：钱包、吃货等级、优惠券、待收货订单、历史订单、AI 饮食周报。
- `DeliveryContactsSection.tsx`：多组收货联系人维护。
- `OrderDetailDialog.tsx`：订单详情。
- `RechargeDialog.tsx`：钱包充值。

顾客端支持：

- 浏览商家与商品。
- AI 智能搜索推荐商家和菜品。
- 店内点餐、购物车、结算。
- 多收货联系人，结算时可选择或新增。
- 钱包充值、订单取消退款、确认完成。
- 优惠券抵扣、过期券灰色提示和“含泪舍弃”。
- 吃货积分、等级进度、升级发券。
- AI 饮食周报和订单进度叙事文案。

### 商家端：`src/pages/MerchantConsole/`

- `index.tsx`：商家控制台入口和标签页。
- `ProductsTab.tsx`：商品创建、编辑、上下架、库存管理。
- `OrdersTab.tsx`：订单处理和出餐完成。
- `ProfileTab.tsx`：店铺资料、描述、图片。
- `StoreSelectorDialog.tsx`：店铺选择与创建。
- `MerchantAICopywritingCard.tsx`：AI 店铺描述和菜品描述生成。

商家端支持：

- 多店铺管理。
- 店铺资料和店铺图片维护。
- 商品名称、价格、分类、图片、库存、上下架管理。
- 商家订单出餐处理。
- AI 店铺文案和菜品文案生成后确认保存。

### 骑手端：`src/pages/RiderApp/`

- `RiderOverview.tsx`：骑手状态概览。
- `DispatchCard.tsx`：可抢订单。
- `TaskListCard.tsx`：配送中任务和状态更新。
- `EnergyTimeoutCard.tsx`：服务能量、超时免责卡。
- `SalaryCard.tsx`：薪资与配送统计。

骑手端支持：

- 查看可抢订单、抢单。
- 更新配送状态、完成配送。
- 展示薪资结算、能量值、超时和免责状态。
- 兑换和使用超时免责卡。

## API 调用方式

前端 API 使用统一模式：

```text
APIMessage class -> sendAPI -> POST /api/{apiName}
```

关键文件：

- `src/apis/shared/APIMessage.ts`：前端 APIMessage 基类。
- `src/apis/shared/sendAPI.ts`：根据 `apiName` 发起请求。
- `src/apis/shared/client.ts`：注入 `Authorization: Bearer <token>`，统一处理错误。
- `src/apis/shared/TaskIO.ts`：任务式异步封装。

### API 模块

#### `src/apis/user/`

| apiName | 用途 |
|---|---|
| `loginapi` | 登录 |
| `registerapi` | 注册 |
| `customermeapi` | 获取顾客档案 |
| `customerprofilepatchapi` | 保存顾客资料/收货联系人 |
| `customerrechargeapi` | 顾客钱包充值 |
| `customervoucherdiscardapi` | 舍弃过期优惠券 |

#### `src/apis/merchant/`

| apiName | 用途 |
|---|---|
| `catalogapi` | 获取商家目录 |
| `merchantmeapi` | 获取商家账号与店铺资料 |
| `merchantprofileapi` | 更新商家资料 |
| `merchantstoreapi` | 创建/更新店铺 |
| `merchantstoredescriptionapi` | 保存店铺描述 |
| `merchantstoreimageapi` | 保存店铺图片 URL |
| `merchantstoreimagefileapi` | 上传店铺图片文件 |
| `merchantcreateproductapi` | 创建商品 |
| `merchantproductapi` | 更新商品 |
| `merchantproductdescriptionsapi` | 保存 AI 菜品描述 |
| `merchantorderreadyapi` | 商家完成出餐 |

#### `src/apis/order/`

| apiName | 用途 |
|---|---|
| `customerordersapi` | 顾客订单列表 |
| `orderdetailapi` | 订单详情 |
| `ordercancelapi` | 取消订单 |
| `ordercompleteapi` | 确认完成订单 |
| `checkoutapi` | 提交结算 |

#### `src/apis/rider/`

| apiName | 用途 |
|---|---|
| `ridermeapi` | 骑手工作台数据 |
| `rideravailableordersapi` | 可抢订单 |
| `ridergraborderapi` | 抢单 |
| `riderupdateorderstatusapi` | 更新配送状态 |
| `riderredeemtimeoutcardapi` | 兑换超时免责卡 |
| `riderusetimeoutcardapi` | 使用超时免责卡 |

#### `src/apis/ai/`

| apiName | 用途 |
|---|---|
| `aisearchapi` | 顾客 AI 搜索 |
| `aidietweeklyreportapi` | AI 饮食周报 |
| `aiorderprogressnarrativesapi` | AI 订单进度文案 |
| `aimerchantstoredescriptionapi` | AI 店铺描述 |
| `aimerchantproductdescriptionsapi` | AI 菜品描述 |

## 状态管理

页面级业务状态使用 Zustand：

```text
src/stores/
├── use-app-store.ts
└── pages/
    ├── use-login-page-store.ts
    ├── use-register-page-store.ts
    ├── use-customer-portal-store.ts
    ├── use-merchant-console-store.ts
    └── use-rider-app-store.ts
```

重点 store：

- `use-customer-portal-store.ts`
  - 保存顾客档案、商家目录、商品、购物车、钱包余额、订单、AI 周报和 AI 订单文案。
  - 提供刷新、加购、改数量、结算、取消、确认完成、充值、舍弃过期券、保存收货联系人、生成 AI 周报等动作。
  - `refreshPortal` 做 in-flight 去重，并并行加载顾客档案、目录和订单。
- `use-merchant-console-store.ts`
  - 保存商家账号、店铺列表、当前店铺和标签页。
  - 提供刷新、创建店铺、出餐完成、创建/更新商品、保存店铺/菜品描述、更新/上传店铺图等动作。
- `use-rider-app-store.ts`
  - 保存骑手账号、可抢订单、配送状态。
  - 提供刷新、抢单、更新配送状态、兑换免责卡、使用免责卡等动作。

注意：前端状态只负责页面展示和交互缓存。订单、钱包、优惠券、商家商品、骑手状态等真实业务数据必须以后端返回为准。

## 数据刷新策略

顾客门户的自动刷新位于 `src/pages/CustomerPortal/index.tsx`：

- 首次进入时执行 `bootstrap`。
- 页面重新可见时立即刷新。
- 自动刷新间隔为 15 秒。
- 页面隐藏时跳过刷新。
- AI 订单进度文案按天缓存，不在每轮短周期刷新中重复生成。

## UI 与样式

- `src/components/ui/` 存放 shadcn/ui 组件。
- `src/lib/utils.ts` 提供 `cn()`。
- `src/index.css` 定义 Tailwind CSS v4、主题变量和全局样式。

添加 shadcn/ui 组件：

```bash
npm run ui:add -- button
npm run ui:add -- card dialog sheet
```

## 开发约定

- 新增业务接口时，在 `src/apis/<module>/` 增加一个对应 API 文件。
- 新增领域对象时，在 `src/objects/<module>/` 增加同名对象文件；新增请求/响应包装类型时放入 `src/objects/<module>/apiTypes/`，并同步后端 `objects` / `objects/apiTypes`。
- 不在前端伪造真实业务结果；涉及下单、取消、充值、保存资料、抢单、出餐等操作必须调用后端 API。
- 会话本地只保存 JWT、账号、角色和登录时间，业务数据通过 API 刷新。

## 构建产物

生产构建输出到：

```text
dist/
```

运行：

```bash
npm run build
npm run preview
```
