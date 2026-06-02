# Type-safe Delivery Platform

一个类型安全的外卖平台全栈项目，覆盖顾客、商家、骑手三类角色。前端使用 Vite + React + TypeScript，后端使用 Scala 3 + http4s + Circe + PostgreSQL。前端只通过统一 `APIMessage` 网关访问后端，业务数据以后端数据库为准。

## 功能概览

### 顾客端

- 三角色账号体系中的顾客注册、登录、JWT 会话。
- 浏览商家目录、进入店铺点餐、维护购物车。
- 结算页选择收货联系人、优惠券并提交订单。
- 钱包充值、余额校验、订单取消退款。
- 多组收货联系人管理，必须且只能有一组默认联系人。
- 优惠券抵扣、过期券灰色提示和“含泪舍弃”。
- 吃货积分与等级：确认完成订单后按实付金额累计积分，升级发券。
- 待收货/历史订单、订单详情、确认完成。
- AI 智能搜索、AI 饮食周报、AI 订单进度叙事文案。

### 商家端

- 商家登录后管理一个或多个店铺。
- 店铺资料、店铺描述、店铺图片 URL 或文件上传。
- 商品创建、编辑、库存、上下架和库存状态。
- 商家订单处理，完成出餐后进入骑手可抢单流程。
- AI 店铺描述生成、AI 菜品描述批量生成并确认保存。

### 骑手端

- 查看可抢订单并抢单。
- 更新配送状态，完成配送后生成结算结果。
- 薪资累计、服务能量值、超时统计。
- 100 能量兑换超时免责卡。
- 超时送达时自动或手动使用免责卡。
- 同一骑手最多同时配送 5 单。

### 性能与一致性

- 订单列表按顾客、商家、骑手精准查询，不再全表读取后内存过滤。
- 订单项按订单集合批量加载，避免订单列表 N+1 查询。
- 顾客端刷新做 in-flight 去重，顾客信息/目录/订单并行加载。
- 顾客端自动刷新降频到 15 秒，页面不可见时跳过刷新。

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | Vite、React、TypeScript、React Router、Zustand、shadcn/ui、Tailwind CSS |
| 后端 | Scala 3、Cats Effect、http4s、Circe、JWT、HikariCP |
| 数据库 | PostgreSQL 16（Docker Compose 可一键启动） |
| AI | OpenAI Chat Completions API（后端代理调用） |

## 目录结构

```text
.
├── README.md
├── package.json                 # 根目录联动启动脚本
├── API_INVENTORY.md
├── frontend/
│   ├── README.md
│   └── src/
│       ├── api/                 # 前端 APIMessage 封装
│       ├── objects/             # 与后端对象对应的 TS 契约
│       ├── pages/               # 登录、注册、顾客、商家、骑手页面
│       ├── stores/              # Zustand 页面状态
│       ├── components/          # 通用组件、AI 搜索组件、UI 组件
│       ├── hooks/               # app chrome、鉴权等 hooks
│       └── lib/                 # 会话、媒体 URL、收货联系人等工具
└── backend/
    ├── README.md
    ├── build.sbt
    ├── docker-compose.yml
    ├── docker/init-databases.sql
    └── src/
        ├── Main.scala           # 服务入口，监听 8787
        ├── DeliveryRoutes.scala # API 网关和公开静态路由汇总
        ├── user/                # 登录注册、顾客资料、钱包、优惠券
        ├── merchant/            # 商家、店铺、商品、目录、图片
        ├── order/               # 下单、订单、结算、取消、确认完成
        ├── rider/               # 骑手、抢单、配送状态、免责卡
        ├── ai/                  # AI 搜索、周报、文案生成
        └── shared/              # API、JWT、数据库、JSON、种子数据
```

## 快速启动

### 环境要求

- Node.js + npm
- JDK 17 或更高版本
- sbt
- Docker（用于本地 PostgreSQL）

### 一键启动

```bash
npm install
npm run dev
```

`npm run dev` 会自动：

1. 启动 `backend/docker-compose.yml` 中的 PostgreSQL；
2. 等待数据库可用；
3. 启动后端 `http://localhost:8787`；
4. 等待 `POST /api/catalogapi` 可用；
5. 启动前端 Vite 开发服务器。

### 分开启动

```bash
# 终端 1：数据库
npm run dev:db

# 终端 2：后端
cd backend
sbt run

# 终端 3：前端
cd frontend
npm install
npm run dev
```

前端默认通过 Vite proxy 将 `/api` 转发到 `http://localhost:8787`。

## 演示账号

| 角色 | 账号 | 密码 |
|---|---|---|
| 顾客 | `customer_demo` | `123456` |
| 商家 | `merchant_demo` | `123456` |
| 骑手 | `rider_demo` | `123456` |

## 常用命令

| 命令 | 说明 |
|---|---|
| `npm run dev` | 根目录一键启动数据库、后端、前端 |
| `npm run dev:db` | 仅启动 PostgreSQL |
| `npm run dev:backend` | 启动数据库后运行后端 |
| `npm run dev:frontend` | 仅启动前端 |
| `cd backend && sbt compile` | 后端编译检查 |
| `cd frontend && npm run typecheck` | 前端类型检查 |
| `cd frontend && npm run lint` | 前端 lint |
| `cd frontend && npm run build` | 前端生产构建 |

## API 约定

后端统一暴露 APIMessage 网关：

```text
POST /api/{apiName}
```

前端通过 `frontend/src/api/shared/sendAPI.ts` 发送 `APIMessage`；后端通过 `backend/src/shared/api/APIMessage.scala` 注册、解码、鉴权并执行。需要鉴权的 API 使用 `Authorization: Bearer <token>`，网关根据注册角色校验权限。

示例：

| 能力 | apiName |
|---|---|
| 目录 | `catalogapi` |
| 登录 | `loginapi` |
| 顾客结算 | `checkoutapi` |
| 商家出餐完成 | `merchantorderreadyapi` |
| 骑手抢单 | `ridergraborderapi` |
| AI 搜索 | `aisearchapi` |
| 舍弃过期优惠券 | `customervoucherdiscardapi` |

除 APIMessage 网关外，店铺图片通过公开静态路由访问：

```text
GET /api/merchant/store-images/{fileName}
```

## 环境变量

### 后端

| 变量 | 默认值 | 说明 |
|---|---|---|
| `DB_HOST` | `127.0.0.1` | PostgreSQL 主机 |
| `DB_PORT` | `5432` | PostgreSQL 端口 |
| `DB_NAME` | `delivery_backend` | 数据库名 |
| `DB_USER` | `postgres` | 数据库用户 |
| `DB_PASSWORD` | `postgres` | 数据库密码 |
| `DB_MAX_POOL_SIZE` | `10` | Hikari 连接池大小 |
| `DB_CONNECTION_TIMEOUT_MS` | `3000` | 连接超时 |
| `JWT_SECRET` | 开发默认值 | JWT 签名密钥，生产环境必须覆盖 |
| `OPENAI_API_KEY` | 无 | AI 功能所需 OpenAI Key |
| `OPENAI_BASE_URL` | `https://api.openai.com/v1` | OpenAI 兼容 API 地址 |
| `OPENAI_MODEL` | `gpt-4o-mini` | AI 使用模型 |

未配置 `OPENAI_API_KEY` 时，普通业务功能可运行；AI 搜索、AI 周报、AI 文案等能力会提示服务未配置或返回兜底结果。

### 前端

| 变量 | 默认值 | 说明 |
|---|---|---|
| `VITE_BACKEND_URL` | `http://localhost:8787` | Vite dev proxy 后端目标 |
| `VITE_API_BASE` | `/api` | 前端 API base path |

## 开发约定

- 前端只通过 HTTP API 获取和提交业务数据，不把浏览器本地状态作为真实数据源。
- 新增业务 API 时，前后端 `api/` 文件、`objects/` 契约应保持语义一致。
- 后端 Scala 代码使用不可变绑定 `val`，避免新增 `var`。
- 新增业务路由优先使用 `APIMessage` / `APIWithRoleMessage`，不要新增零散字符串路由。
- AI 能力优先复用 `backend/src/ai/utils/OpenAIClient.scala`。

更多说明见：

- [`frontend/README.md`](frontend/README.md)
- [`backend/README.md`](backend/README.md)
