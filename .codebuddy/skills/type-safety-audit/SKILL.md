---
name: type-safety-audit
description: "审计 Type-safe_project 的前后端类型安全一致性。检查 API 消息定义与 objects 类型是否前后端一一对应、是否存在硬编码字符串替代枚举、ID 类型别名是否真正使用、前端 state 是否越权替代后端逻辑、checkout 等模块是否功能完整、路由是否使用纯 API message 类型。适用于代码审查、类型安全检查、前后端契约对齐验证、老师反馈问题排查。"
---

# Type-Safe Project 类型安全审计 Skill

## 目的

对 Type-safe_project 进行系统性类型安全审计，确保前后端契约一一对应，消除老师指出的各类问题。

## 何时使用

- 代码审查时检查前后端类型对齐
- 新增 API / objects 后验证契约一致性
- 排查老师反馈的类型安全问题
- 重构前生成现状报告

## 项目关键路径

| 维度 | 后端路径 | 前端路径 |
|------|---------|---------|
| API 消息 | `backend/src/{module}/api/{Module}APIMessages.scala` | `frontend/src/api/{module}/{ApiName}.ts` |
| 领域对象 | `backend/src/{module}/objects/{ObjectName}.scala` | `frontend/src/objects/{module}/{ObjectName}.ts` |
| 共享枚举/ID | `backend/src/shared/objects/ids.scala` | `frontend/src/objects/shared/ids.ts` |
| 路由注册 | `backend/src/{module}/routes/{Module}Routes.scala` | (前端无对应，由 apiNameOf 动态推导) |
| 数据库表 | `backend/src/{module}/tables/` | (无对应) |

模块列表：`user`、`merchant`、`order`、`rider`、`shared`

## 审计检查清单

按顺序执行以下 6 项检查，每项有明确的通过/失败标准。

### 检查 1：API 一文件一消息，前后端文件名一一对应

**规则**：
- 后端 `backend/src/{module}/api/` 中每个 `case class XxxAPIMessage` 必须在前端 `frontend/src/api/{module}/` 中有对应的 `XxxApi.ts` 文件
- 后端所有 APIMessage 定义在一个 `{Module}APIMessages.scala` 文件中；前端每个 APIMessage 子类必须有独立的 `.ts` 文件
- 前端 `*APIMessages.ts` barrel 文件仅做重导出，不定义新的 APIMessage 子类

**验证步骤**：
1. 读取后端 `{Module}APIMessages.scala`，提取所有 `case class .*APIMessage` 类名
2. 对每个类名，检查前端是否存在对应文件（如 `MerchantCreateProductAPIMessage` → `MerchantCreateProductApi.ts`）
3. 检查前端 `*APIMessages.ts` 中是否有非重导出的 APIMessage 类定义
4. 检查前端是否有后端不存在的孤立 API 文件

**通过标准**：前后端 API 消息类完全对应，无孤立文件，无缺失文件。

### 检查 2：Objects 一对象一文件，前后端字段语义一一对应

**规则**：
- 后端 `backend/src/{module}/objects/{Name}.scala` 与前端 `frontend/src/objects/{module}/{Name}.ts` 必须文件名一致、字段名一致、字段类型语义一致
- `shared/objects/` 同理
- 不允许存在 `index.ts` / `index.scala` barrel 文件（`*APIMessages.ts` 除外）

**验证步骤**：
1. 列出后端各模块 `objects/` 目录下所有 `.scala` 文件名
2. 列出前端各模块 `objects/` 目录下所有 `.ts` 文件名
3. 双向对比：后端有前端无 → 缺失；前端有后端无 → 孤立
4. 对每个匹配的文件对，对比字段名和类型（Scala `String` ↔ TS `string`，Scala `Int`/`Long` ↔ TS `number`，Scala `List` ↔ TS `Array`，Scala enum ↔ TS union type）
5. 检查是否有 `index.ts` 文件

**通过标准**：所有 objects 文件名一一对应，字段完全匹配，无 index barrel 文件。

### 检查 3：枚举与 ID 类型真正使用，无硬编码字符串

**规则**：
- `ids.scala` / `ids.ts` 中定义的枚举类型（`UserRole`、`MerchantCategory`、`RiderStatus`、`ServiceChannel`、`OrderStatus`）必须在业务代码中真正使用，而非用中文字符串字面量比较
- ID 类型别名（`UserId`、`MerchantId` 等）应在 case class / interface 字段类型中使用，而非退化为 `String` / `string`
- 数据库 CHECK 约束、条件判断、模式匹配均应使用枚举值，不得硬编码

**验证步骤**：
1. 在后端搜索中文字符串字面量用于状态比较：`"待接单"`、`"制作中"`、`"配送中"`、`"已送达"`、`"已完成"`、`"已取消"`、`"上架"`、`"下架"`、`"空闲"`、`"接单"` 等
2. 检查 case class 中 ID 字段是否使用类型别名（如 `customerId: UserId`）而非裸 `String`
3. 检查数据库 DDL 中的 CHECK 约束是否引用枚举值
4. 在前端搜索同样的硬编码字符串

**通过标准**：零硬编码字符串状态比较，ID 字段使用类型别名。

### 检查 4：前端 state 不越权替代后端业务逻辑

**规则**：
- 业务数据（钱包余额、订单状态等）必须以后端为准
- 前端不得在本地计算后重新写回后端（如充值时客户端计算新余额再 PATCH）
- Zustand store 中缓存的后端数据应仅作展示优化，不能作为数据源修改后再同步
- `DeliveryState` 等全局 state 类型如果不是纯 UI 状态，应删除或改为从 API 获取

**验证步骤**：
1. 搜索 Zustand store 中是否有本地修改后端数据再写回的模式（如 `walletBalance + amount` → `patchCustomerProfileIO`）
2. 检查 `CustomerProfilePatch` 中是否包含不应由客户端控制的字段（如 `walletBalance`）
3. 检查 `DeliveryState` 接口的实际用途
4. 检查 `localStorage` 中是否存储了业务数据（JWT session 除外）

**通过标准**：前端不越权修改后端业务状态，充值等操作由后端原子完成。

### 检查 5：各微服务 API 数量与功能完整性

**规则**：
- 每个微服务应有足够的 API 覆盖核心业务场景
- 当前各模块 API 数量基准：user ≥ 4、merchant ≥ 9、order ≥ 4、rider ≥ 3
- checkout 流程应至少包含：提交结算、查询结算详情、确认结算完成等
- 商户应有：营业状态切换、备餐时间设置、菜品上下架（独立 API）
- 骑手应有：获取可接订单列表、更新配送状态（含具体状态参数）

**验证步骤**：
1. 统计每个模块的 API 数量
2. 对照业务需求识别缺失的 API（如 checkout 只有 1 个 API、商户缺营业状态 API、骑手缺获取可接单列表 API）
3. 检查现有 API 的参数完整性（如 `RiderUpdateOrderStatusAPIMessage` 应有目标状态参数而非仅 orderId）

**通过标准**：各模块 API 覆盖核心业务场景，无明显的功能缺失。

### 检查 6：路由使用纯 API Message 类型，无残留字符串路由

**规则**：
- 所有业务 API 必须通过 `APIMessage` / `APIWithRoleMessage` 模式注册，走 `POST /api/{apiName}` 统一入口
- 不允许存在传统的 http4s 字符串模式匹配路由（静态文件服务除外）
- 前端 `apiNameOf()` 基于 `constructor.name` 推导路径，生产构建必须配置 `keep_classnames: true`

**验证步骤**：
1. 搜索后端路由文件中的 `GET`、`PUT`、`DELETE`、`PATCH` 方法（除健康检查和静态文件外）
2. 搜索 http4s 字符串路由模式：`Root / "api" /` 后跟硬编码路径
3. 检查前端 Vite/Terser 构建配置是否保留类名

**通过标准**：所有业务 API 均为 APIMessage 模式，无字符串路由残留。

## 工作流

```
1. 读取 references/fe-be-contract-map.md 获取当前前后端契约对照快照
2. 读取 references/type-safety-issues-catalog.md 获取已知问题分类
3. 按检查清单逐项执行，更新契约对照表和问题清单
4. 输出审计报告：
   - 通过的检查项（绿色）
   - 失败的检查项（红色），附具体文件和行号
   - 修复建议
5. 如用户要求修复，按优先级排序：
   P0: 枚举硬编码 → 使用真正的枚举类型
   P1: 前后端契约不对齐 → 补齐缺失文件/字段
   P2: 前端越权状态 → 迁移逻辑到后端
   P3: API 功能缺失 → 设计并补充新 API
```

## 参考文件

- `references/fe-be-contract-map.md` — 前后端 API + Objects 契约对照表（含当前快照）
- `references/type-safety-issues-catalog.md` — 已知类型安全问题分类与修复指南
- `scripts/check-type-safety.sh` — 自动化检查脚本（检查文件对应、硬编码字符串等）
