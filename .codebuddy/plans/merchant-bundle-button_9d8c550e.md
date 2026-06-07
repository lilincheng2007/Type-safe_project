---
name: merchant-bundle-button
overview: 在商家端商品管理中，在“新建/新增菜品”按钮旁新增“新建套餐”入口，并复用现有套餐配置能力，让商家可选择已有普通菜品组成套餐。
todos:
  - id: verify-bundle-flow
    content: 使用 [subagent:code-explorer] 复核套餐创建到顾客端展示链路
    status: completed
  - id: add-bundle-button
    content: 在 ProductsTab 添加“新建套餐”并列入口
    status: completed
    dependencies:
      - verify-bundle-flow
  - id: differentiate-create-dialog
    content: 区分普通菜品和套餐创建弹窗状态文案
    status: completed
    dependencies:
      - add-bundle-button
  - id: harden-bundle-validation
    content: 完善套餐可选菜品和空配置提交校验
    status: completed
    dependencies:
      - differentiate-create-dialog
  - id: audit-type-safety
    content: 使用 [skill:type-safety-audit] 校验类型与 API 对齐
    status: completed
    dependencies:
      - harden-bundle-validation
  - id: verify-ui-build
    content: 运行前端类型检查并验证商家端套餐创建
    status: completed
    dependencies:
      - audit-type-safety
---

## User Requirements

- 在商家端商品管理区域，为“新建菜品”旁新增一个独立的“新建套餐”入口。
- 商家创建套餐时，可以从当前店铺已有普通菜品中选择组合项，配置成套餐商品。
- 套餐商品保存后应出现在商品列表中，并可被顾客端识别为套餐进行选择和下单。

## Product Overview

商家端商品管理支持普通菜品与套餐商品两种创建入口。普通菜品继续使用现有“新建菜品”流程；套餐通过专门按钮进入套餐创建流程，突出“选择已有菜品组成套餐”的使用场景。

## Core Features

- 在商品管理标题栏右侧并列展示“新建菜品”和“新建套餐”按钮。
- 点击“新建套餐”后打开创建商品弹窗，并默认启用套餐配置。
- 套餐配置支持添加套餐类别、设置每类可选件数、从已有普通菜品中勾选可选项。
- 套餐默认最低价根据已选菜品自动计算，商家无需手动填写。
- 缺少可选菜品或套餐配置不完整时，界面提供明确提示，避免创建空套餐。
- 商品列表中继续以“套餐”标签和“类别选件数”摘要展示套餐视觉效果。

## Tech Stack Selection

- 前端：沿用现有 Vite + React + TypeScript 架构。
- UI：沿用当前项目的 shadcn 风格组件、Tailwind CSS class、lucide-react 图标。
- 状态管理：沿用 `frontend/src/stores/pages/use-merchant-console-store.ts` 的 Zustand store。
- API：沿用一 API 一文件模式，继续通过 `MerchantCreateProductAPI.ts` 调用后端。
- 后端：当前 Scala 3 + http4s + Circe + PostgreSQL 已具备套餐字段、校验与持久化能力，本次优先复用，不新增后端 API。

## Implementation Approach

本次采用“复用现有套餐能力，补齐商家端显式入口”的策略。代码探索确认 `Product.bundleGroups`、前后端创建/更新 API、`bundle_config JSONB`、顾客端套餐选择和结算链路已存在，因此不重做模型和结算，只在商家端商品管理中增加“新建套餐”按钮，并让创建弹窗根据入口区分普通菜品和套餐的初始状态、标题、说明、校验与按钮文案。

关键决策：

- 复用 `ProductsTab.tsx` 中现有创建弹窗和 `BundleGroupsEditor`，避免引入第二套重复表单。
- 新增一个打开创建弹窗的轻量入口函数，例如普通菜品入口重置为 `bundleGroups: []`，套餐入口重置为 `[createBundleGroup()]`。
- 保持后端为最终校验源：前端做交互提示与禁用按钮，后端继续验证套餐类别、可选件数、可选菜品归属、不能嵌套套餐、不能选择自身等规则。
- 不新增数据库迁移：`catalog_products.bundle_config JSONB` 已存在，套餐配置已可持久化。
- 性能方面，套餐价格和可选项只在当前店铺商品数组上计算，复杂度约为 O(g * o * p)，当前商家单店菜品规模较小可接受；必要处使用现有 `useMemo` 和局部计算，避免全局状态冗余。

## Implementation Notes

- 重点修改 `frontend/src/pages/MerchantConsole/components/ProductsTab.tsx`，不要大范围重构无关促销、图片上传、编辑商品逻辑。
- 保留现有 `handleCreate` 调用 `onCreateProduct` 的链路，确保交互产生的数据仍以后端返回和 `refreshMerchant()` 为准。
- 套餐按钮应放在现有“新建菜品”按钮旁，使用 `flex flex-wrap` 保障窄屏不挤压标题。
- 创建套餐时如当前店铺没有可选普通菜品，应展示“请先创建普通菜品”的提示，并禁用或阻止提交空套餐。
- 保存前继续调用 `sanitizeBundleGroups`，但前端应补充套餐模式下“至少一个类别且类别内至少一个菜品”的提交限制，避免空配置被静默转换为普通菜品。
- 错误提示复用 `useAppChrome().showNotice`，不记录敏感信息，不新增日志噪声。
- 修改后使用 `type-safety-audit` 检查前后端对象与 API 结构一致性，并至少运行前端类型检查或相关 lint。

## Architecture Design

当前链路保持不变：

商家点击“新建套餐”
→ `ProductsTab` 初始化创建表单为套餐模式
→ `BundleGroupsEditor` 选择已有普通菜品组成 `bundleGroups`
→ `handleCreate` 计算套餐默认最低价并调用 `onCreateProduct`
→ `useMerchantConsoleStore.createProduct` 调用 `MerchantCreateProductAPI`
→ 后端 `MerchantCreateProductAPIMessage` 校验套餐并写入 `catalog_products.bundle_config`
→ 商家端刷新并展示新套餐
→ 顾客端 Catalog 获取套餐商品并使用现有套餐选择弹窗下单

## Directory Structure

```text
Type-safe_project/
├── frontend/
│   └── src/
│       └── pages/
│           └── MerchantConsole/
│               └── components/
│                   └── ProductsTab.tsx
│                       # [MODIFY] 商家端商品管理核心组件。
│                       # 新增“新建套餐”按钮，与“新建菜品”并列。
│                       # 抽取或新增打开创建弹窗的入口方法，区分普通菜品和套餐初始状态。
│                       # 调整创建弹窗标题、说明、提交按钮文案和套餐校验提示。
│                       # 复用现有 BundleGroupsEditor、handleCreate、createBundleGroup、bundleGroupsBasePrice。
├── frontend/
│   └── src/
│       └── stores/
│           └── pages/
│               └── use-merchant-console-store.ts
│                   # [AFFECTED] 创建套餐仍复用 createProduct。
│                   # 通常无需修改；验证传入 bundleGroups 后刷新商家数据正常。
├── frontend/
│   └── src/
│       └── apis/
│           └── merchant/
│               └── MerchantCreateProductAPI.ts
│                   # [AFFECTED] 已支持 bundleGroups。
│                   # 通常无需修改；验证套餐创建请求字段完整。
├── frontend/
│   └── src/
│       └── objects/
│           └── merchant/
│               ├── Product.ts
│               │   # [AFFECTED] 已定义 ProductBundleGroup。
│               │   # 通常无需修改；作为前端套餐编辑与展示的类型来源。
│               └── apiTypes/
│                   └── CreateProductRequest.ts
│                       # [AFFECTED] 已支持 bundleGroups 可选字段。
│                       # 通常无需修改；验证创建请求类型未被破坏。
└── backend/
    └── src/
        └── merchant/
            └── api/
                └── MerchantCreateProductAPIMessage.scala
                    # [AFFECTED] 已支持套餐校验与基础价计算。
                    # 通常无需修改；作为后端最终校验来源。
```

## Key Code Structures

无需新增跨模块类型。实现时应复用现有：

- `ProductBundleGroup`
- `CreateProductRequest.bundleGroups`
- `BundleGroupsEditor`
- `createBundleGroup`
- `sanitizeBundleGroups`
- `bundleGroupsBasePrice`

## Agent Extensions

### SubAgent

- **code-explorer**
- Purpose: 在实现前后继续核对商家端商品管理、套餐创建链路、顾客端展示链路是否存在遗漏文件。
- Expected outcome: 明确所有受影响路径，避免重复实现已有套餐能力或误改无关模块。

### Skill

- **type-safety-audit**
- Purpose: 审计前后端 API、objects、apiTypes 与项目 sample 风格是否保持一致。
- Expected outcome: 确认套餐创建入口变更未破坏类型安全、API 对齐和页面拆分约定。