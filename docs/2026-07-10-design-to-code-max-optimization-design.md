# design-to-code-max 技能架构优化设计

> 日期：2026-07-10
> 状态：已批准

## 1. 问题陈述

当前 `design-to-code-max` skill 存在以下问题：

1. **平台约束混在一起** — RN、H5、PC 的约束规则全部放在同一个目录下，导致技能越来越臃肿
2. **无渐进式披露** — 所有 reference 文件一次性加载，不区分用户所选的技术平台
3. **入口未拆分** — 虽然 01-analyze 区分了重构/增量，但后续流水线未按「技术：RN/H5/PC」分流
4. **PC 支持缺失** — 完全无 PC 端的约束规则和生成流程
5. **H5 支持薄弱** — 仅有一个 `web-guidelines.md`，远不够完整

## 2. 核心设计

### 2.1 架构原则

| 原则 | 说明 |
|:----|:------|
| **入口拆分** | 用户一开始选择 RN/H5/PC + 重构/增量，后续路由到不同分支 |
| **平台隔离** | 每个平台的子技能和 reference 完全独立，互不引用 |
| **渐进披露** | 只加载用户所选平台的规则，其他平台的 token/guidelines/gotcha 不加载 |
| **资产保留** | 现有 RN 全部资产原封不动搬迁到 rn/ 子目录 |
| **公共共享** | 入口问答、材料收集、功能点生成、HTML 解析引擎等跨平台通用功能提取到 common/ |

### 2.2 入口路由流程

```
用户输入需求
    │
    ├── Q1: 技术选型?        → RN / H5 / PC
    ├── Q2: 需求类型?        → 重构 / 增量
    │
    ├── 材料收集
    │   ├── 重构: 需求文档 + 被重构模块源码路径 + UI 材料
    │   └── 增量: 需求文档 + 增量模块路径(或扫描定位) + UI 材料
    │
    ├── 功能点规格生成
    │
    └── 根据技术选型路由到对应平台流水线
        ├── RN: rn/01-audit → rn/02-design → rn/03-build → rn/04-verify
        ├── H5: h5/01-audit → h5/02-design → h5/03-build → h5/04-verify
        └── PC: pc/01-audit → pc/02-design → pc/03-build → pc/04-verify
```

## 3. 目录结构

```
design-to-code-max/
├── SKILL.md                              ← 路由器 + 通用流程定义 + 铁律
├── subskills/
│   ├── common/                           ← 共享阶段（所有平台共用）
│   │   ├── 01-analyze.md                 ← 入口：2 个问题 + 需求理解
│   │   ├── 02-collect-materials.md       ← 材料收集（增量/重构不同路径）
│   │   └── 03-feature-spec.md            ← 功能点规格生成
│   ├── rn/                               ← React Native 专属流水线
│   │   ├── 01-audit.md                   ← (原 02-audit) UI 审计 & 组件映射
│   │   ├── 02-design.md                  ← (原 03-design) 技术设计
│   │   ├── 03-build.md                   ← (原 04-build) 代码生成
│   │   └── 04-verify.md                  ← (原 05-verify) 验证
│   ├── h5/                               ← H5 专属流水线（新建）
│   │   ├── 01-audit.md
│   │   ├── 02-design.md
│   │   ├── 03-build.md
│   │   └── 04-verify.md
│   └── pc/                               ← PC 专属流水线（新建）
│       ├── 01-audit.md
│       ├── 02-design.md
│       ├── 03-build.md
│       └── 04-verify.md
├── reference/
│   ├── common/                           ← 通用引用
│   │   ├── ambiguity-rules.md            ← 从现有 reference/ 移入
│   │   └── html-parser-rules.md          ← 从现有 reference/ 移入（通用工具）
│   ├── rn/                               ← 现有全部 RN 资产搬入
│   │   ├── rn-guidelines.md
│   │   ├── xlb-style-system.md
│   │   ├── icon-map.md
│   │   ├── token-map.json
│   │   ├── style-scan-checklist.md
│   │   ├── deviation-db-schema.md
│   │   └── gotchas/
│   │       ├── api-patterns/
│   │       ├── build-phase/
│   │       ├── component-library/
│   │       ├── html-parsing/
│   │       └── rn-quirks/
│   ├── h5/                               ← H5 引用（新建）
│   │   ├── h5-guidelines.md              ← 从 xlb_mobile_fsms 提炼
│   │   └── gotchas/
│   └── pc/                               ← PC 引用（新建）
│       ├── pc-guidelines.md              ← 从 fsms_web 提炼
│       ├── component-mapping.md          ← 设计稿 → PC 组件映射
│       ├── project-conventions.md        ← fsms_web 项目约定
│       └── gotchas/
└── templates/
    ├── common/
    │   └── features.md.tpl
    ├── rn/
    │   ├── ui-audit.md.tpl
    │   ├── tech-design.md.tpl
    │   └── execution.md.tpl
    ├── h5/
    │   ├── ui-audit.md.tpl
    │   ├── tech-design.md.tpl
    │   └── execution.md.tpl
    └── pc/
        ├── ui-audit.md.tpl
        ├── tech-design.md.tpl
        └── execution.md.tpl
```

## 4. 渐进式披露

本技能按技术选型进行渐进式加载，每个平台的知识完全隔离：

| 用户选择 | 加载的子技能 | 加载的 reference |
|:--------|:------------|:----------------|
| RN 重构 | common/* + rn/* | reference/common/ + reference/rn/ |
| RN 增量 | common/* + rn/* | reference/common/ + reference/rn/ |
| H5 重构 | common/* + h5/* | reference/common/ + reference/h5/ |
| H5 增量 | common/* + h5/* | reference/common/ + reference/h5/ |
| PC 重构 | common/* + pc/* | reference/common/ + reference/pc/ |
| PC 增量 | common/* + pc/* | reference/common/ + reference/pc/ |

> RN 子技能不会引用 reference/pc/ 的内容，PC 子技能不会引用 reference/rn/ 的 gotcha。
> 通用规则放在 reference/common/ 下，各平台专用规则放在各平台目录下。

## 5. 各平台技术约束概要

### 5.1 RN（现有，搬迁）

- 目标库：`@xlb/components-react-native` + `@xlb/icon-rn`
- 样式：xlb-style-system（SPACE/BORDER/FONT/SHADOW token）
- 颜色：`useAppContext()` → `theme['xxx']`
- 表单：XlbForm + XlbProDetail + SafeInput/SafeUploadFile 防 Android crash
- 路由：Module Federation 四仓库联动
- 禁止：XlbForm.Item 上使用 dependencies/shouldUpdate

### 5.2 H5（新建，基于 xlb_mobile_fsms）

- 框架：UmiJS Max v4 + TypeScript + React 18
- 组件库：`@xlb/components-mobile`
- 样式：SCSS CSS Modules + PostCSS pxtorem（rootValue: 75, 设计稿 750px）
- 颜色：CSS 变量 `var(--xlb-*)`
- 页面模式：ProPageContainer + XlbNavBar + XlbFlatList / XlbProDetail
- 表单：XlbProDetail 声明式 formList（componentType 驱动）
- 路由：集中式 routes.ts 配置
- 导航：`useXlbRouter`（替代 history.push）
- 状态：Zustand + immer（每个模块独立的 store）
- 权限：`useHasAuth(['模块', '动作'])`
- 原生桥接：NativeBridge.postMessage() 通信

### 5.3 PC（新建，基于 fsms_web）

- 框架：UmiJS Max v4 + TypeScript
- 组件库：`@xlb/components`（封装 Ant Design 5）
- 样式：Less CSS Modules + Tailwind（preflight: false）
- 页面模式：
  - **模式 A** — XlbPageContainer（SearchForm + ToolBtn + Table + ProPageModal）
  - **模式 B** — XlbProPageContainer（集成 CRUD：search + table + detail + add + delete）
  - **模式 C** — 看板（自定义布局 + 子组件分区）
- 表单：XlbForm（声明式 formList）或 XlbBasicForm（命令式 Item + CSS Grid 布局）
- 表格：XlbTable + XlbTableColumnProps（name/code/width/render/features）
- 路由：集中式 routeList + KeepAlive + wrappers
- 导航：`useNavigation()` from `@xlb/max` 或 `useIRouter()`
- 权限：`hasAuth(['模块', '操作'])`
- API：`XlbFetch.post(url, data)` → 检查 `res?.code === 0`
- 模态框：NiceModal + fsmsModal / ProPageModal

## 6. 实施计划

### Phase 1 — 目录迁移与 RN 资产搬迁
- 创建新目录结构（common/、rn/、h5/、pc/、reference/common/、reference/rn/、reference/h5/、reference/pc/）
- 将现有 `subskills/02-audit.md~05-verify.md` 移入 `rn/` 目录，重新编号 01~04
- 将现有 `reference/` 全部移入 `reference/rn/`
- 将 `ambiguity-rules.md` 和 `html-parser-rules.md` 复制到 `reference/common/`
- 重写 SKILL.md 为路由器模式
- 从 SKILL.md 中提取入口逻辑到 `common/01-analyze.md`
- 更新所有相对路径引用

### Phase 2 — common 共享层
- 写 `common/01-analyze.md`（入口 2 问）
- 写 `common/02-collect-materials.md`（重构/增量不同材料清单）
- 写 `common/03-feature-spec.md`（功能点生成）
- 写 `templates/common/features.md.tpl`

### Phase 3 — H5 流水线
- 写 `reference/h5/h5-guidelines.md`（合并 `web-guidelines.md` 有用内容）
- 写 `subskills/h5/01-audit.md` ~ `04-verify.md`
- 写 `templates/h5/` 模板

### Phase 4 — PC 流水线
- 写 `reference/pc/pc-guidelines.md`（合并 `web-guidelines.md` 有用内容）
- 写 `reference/pc/component-mapping.md`
- 写 `subskills/pc/01-audit.md` ~ `04-verify.md`
- 写 `templates/pc/` 模板

### Phase 5 — 联动测试
- 测试 RN 重构流程
- 测试 H5 增量流程
- 测试 PC 增量流程
- 验证渐进式披露（仅加载对应平台 reference）
- 删除 `web-guidelines.md`

## 7. 资产迁移清单

| 原路径 | 目标路径 | 操作 |
|:------|:--------|:----|
| `subskills/01-analyze.md` | → 拆分为 `common/01-analyze` + `rn/01-audit` 入口适配 | 拆分 |
| `subskills/02-audit.md` | → `rn/01-audit.md` | 搬迁 |
| `subskills/03-design.md` | → `rn/02-design.md` | 搬迁 |
| `subskills/04-build.md` | → `rn/03-build.md` | 搬迁 |
| `subskills/05-verify.md` | → `rn/04-verify.md` | 搬迁 |
| `reference/ambiguity-rules.md` | → `reference/common/ambiguity-rules.md` | 搬迁 |
| `reference/html-parser-rules.md` | → `reference/common/html-parser-rules.md` | 搬迁 |
| `reference/rn-guidelines.md` | → `reference/rn/rn-guidelines.md` | 搬迁 |
| `reference/xlb-style-system.md` | → `reference/rn/xlb-style-system.md` | 搬迁 |
| `reference/icon-map.md` | → `reference/rn/icon-map.md` | 搬迁 |
| `reference/token-map.json` | → `reference/rn/token-map.json` | 搬迁 |
| `reference/style-scan-checklist.md` | → `reference/rn/style-scan-checklist.md` | 搬迁 |
| `reference/deviation-db-schema.md` | → `reference/rn/deviation-db-schema.md` | 搬迁 |
| `reference/gotchas/*` | → `reference/rn/gotchas/*` | 搬迁 |
| `reference/state-schema.md` | → `reference/rn/state-schema.md` | 搬迁 |
| `reference/web-guidelines.md` | → 合并入 h5/pc guidelines 后删除 | 删除 |
| `templates/*` | → 分散到 `templates/{common,rn,h5,pc}/` | 拆分 |
| `reference/theme-templates/*` | → `reference/rn/theme-templates/*` | 搬迁 |
