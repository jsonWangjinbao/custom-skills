# design-to-code-max 架构设计

> 版本: 3.0
> 最后更新: 2026-07-19

---

## 1. 概述

`design-to-code-max` 是一个将产品需求、设计稿（HTML/截图）转换为生产代码的全链路交付 skill。
核心思路是：**让 AI 按标准化流水线工作，而不是自由发挥。**

v3.0 的核心变化：**按技术选型拆分平台流水线**。RN / H5 / PC 三端共用一套通用前置阶段，audit 起按平台路由到各自完全隔离的流水线，渐进式披露平台约束。

### 核心能力

- **三平台支持** — RN / H5 / PC，每个平台一条独立流水线，规则完全隔离（铁律 8）
- **增量需求** — 在现有 RN/H5/PC 代码上加功能
- **重构需求** — H5→RN、RN→RN、H5→H5、PC→PC 重构
- **多需求管理** — 同时跟踪多个需求的进度，支持中断后续接
- **UI 高度还原** — 系统化比对设计稿样式，输出 token 级偏差记录
- **API 规格前置** — api-spec.md 作为 API 唯一事实来源，design / build / verify 统一消费

---

## 2. 文件结构

```
design-to-code-max/
├── SKILL.md                       # 总纲：8 条铁律 + 路由流程 + 参考索引
│
├── subskills/                     # 分阶段执行说明书（通用 + 分平台）
│   ├── common/                    # 平台无关的通用阶段
│   │   ├── 01-analyze.md              # 入口 + 路由（技术选型 / 需求类型）
│   │   ├── 02-collect-materials.md    # 材料收集（需求文档 / 源码路径 / UI 材料）
│   │   ├── 03-feature-spec.md         # 功能点规格（含联动关系拆解）
│   │   └── 04-api-spec.md             # API 规格设计（入参 / 出参 / 取值路径 / mock）
│   ├── rn/                        # RN 流水线
│   │   ├── 01-audit.md                # UI 审计 + HTML 解析
│   │   ├── 02-design.md               # 技术设计
│   │   ├── 03-build.md                # 分组执行 + 偏差捕捉
│   │   └── 04-verify.md               # 自测验证 + 交付
│   ├── h5/                        # H5 流水线（同 4 阶段，约束独立）
│   └── pc/                        # PC 流水线（同 4 阶段，约束独立）
│
├── reference/                     # 知识库（AI 的参考依据）
│   ├── common/                    # 跨平台通用规则
│   │   ├── ambiguity-rules.md         # 歧义检测规则
│   │   └── html-parser-rules.md       # HTML 结构化解析规则
│   ├── rn/                        # RN 平台规则
│   │   ├── rn-guidelines.md           # RN 代码生成约束
│   │   ├── xlb-style-system.md        # XLB 风格系统规范
│   │   ├── token-map.json             # CSS 变量 → theme token 映射
│   │   ├── icon-map.md                # 图标名称映射
│   │   ├── style-scan-checklist.md    # 样式合规扫描清单
│   │   ├── state-schema.md            # 状态机完整字段定义（通用结构适用所有平台）
│   │   ├── deviation-db-schema.md     # 偏差库字段定义
│   │   ├── theme-templates/           # RN 主题模板
│   │   └── gotchas/                   # 已知陷阱/偏差记录
│   │       ├── component-library/         # 组件库相关
│   │       ├── html-parsing/              # HTML 解析相关
│   │       ├── rn-quirks/                 # RN 平台特性
│   │       ├── api-patterns/              # API 响应结构
│   │       └── build-phase/               # 构建阶段问题
│   ├── h5/                        # H5 平台规则
│   │   └── h5-guidelines.md           # H5 代码生成约束（CSS 变量体系）
│   └── pc/                        # PC 平台规则
│       ├── pc-guidelines.md           # PC 代码生成约束
│       ├── component-mapping.md       # UI 块 → @xlb/components 组件映射
│       └── project-conventions.md     # PC 项目约定
│
└── templates/                     # 文档模板（通用 + 分平台）
    ├── common/                        # features.md.tpl / api-spec.md.tpl
    ├── rn/                            # ui-audit / tech-design / execution
    ├── h5/                            # 同上
    └── pc/                            # 同上
```

---

## 3. 执行流程

### 3.1 总览

```
[init 入口路由] → collect-materials ─✅+确认→ feature-spec ─✅+确认→ api-spec ─✅+确认→ audit ─✅+确认→ design ─✅+确认→ build ─出口门禁→ verify ─✅→ done
                 └──────────── 通用阶段（平台无关）────────────┘   └──── 按 inputs.platform 路由到 rn/ h5/ pc/ 流水线 ────┘
```

- **通用阶段**（`subskills/common/`）：入口路由 → 材料收集 → 功能点规格 → API 规格设计
- **平台阶段**（`subskills/{platform}/`）：UI 审计 → 技术设计 → 代码生成 → 自测验证
- analyze / collect-materials / feature-spec / api-spec / audit / design 六个阶段设用户确认门禁；build 为出口门禁，verify 为终检

### 3.2 阶段一览

| 阶段              | 目录   | 输入                                   | 产出                        | 用户确认       | 说明                                                            |
| ----------------- | ------ | -------------------------------------- | --------------------------- | -------------- | --------------------------------------------------------------- |
| init / 入口路由   | common | 用户回答                               | state.json 需求条目         | 是             | 3 个问题：需求名称、技术选型（RN/H5/PC）、需求类型（增量/重构） |
| collect-materials | common | 需求类型                               | 材料清单写入 state          | 是             | 重构：被重构源码路径必填；增量：目标目录 + 现有代码扫描         |
| feature-spec      | common | 需求文档 + 原代码                      | features.md                 | 是             | 分解功能点，标注来源（from-source / new / change）与联动关系    |
| api-spec          | common | 源码逆向 / 接口文档                    | api-spec.md + mock 模板     | 是             | API 唯一事实来源（见 §7）                                       |
| audit             | 平台   | HTML + 截图                            | ui-audit.md + parsed-styles | 是             | 解析 HTML 为结构化数据，三要素对比，偏差库预标注                |
| design            | 平台   | features + ui-audit + api-spec         | tech-design.md              | 是             | 组件架构、数据流、路由设计                                      |
| build             | 平台   | tech-design + parsed-styles + api-spec | execution.md + 代码         | 否（出口门禁） | 分组生成代码，每组完事后做偏差捕捉                              |
| verify            | 平台   | 全部代码 + 文档                        | 交付总结                    | 否（终检）     | 功能验证 + 样式扫描 + API 合规 + 偏差库同步                     |

### 3.3 入口流程

启动时读取 `.dtc-state.json`：

- 文件不存在或 requirements 为空 → 新需求流程
- 有已有需求 → 用 AskUserQuestion 展示需求列表让用户选择
  - 未完成 → 按 `currentPhase` + `inputs.platform` 恢复进度（路由到对应平台 subskill）
  - 已完成 → 询问是否修改（小改追加 changeLog 回退 build，大改走新需求）
  - 用户选择开始新需求 → 走新需求 init

新需求 init 按 3 个问题逐一收集（一次一问，禁止打包）：

1. 需求名称
2. 技术选型（RN / H5 / PC）→ 写入 `inputs.platform`
3. 需求类型（增量 / 重构）→ 写入 `requirementType`

需求文档、代码路径、UI 材料由 collect-materials 阶段按需求类型分别收集（重构模式源码路径必填，功能点唯一权威来源是被重构的源码）。

### 3.4 渐进式披露与平台隔离

按技术选型加载对应内容，各平台完全隔离（铁律 8）：

| 用户选择     | 加载的子技能   | 加载的 reference                  |
| ------------ | -------------- | --------------------------------- |
| RN 重构/增量 | common/_+ rn/_ | reference/common/ + reference/rn/ |
| H5 重构/增量 | common/_+ h5/_ | reference/common/ + reference/h5/ |
| PC 重构/增量 | common/_+ pc/_ | reference/common/ + reference/pc/ |

RN 流水线只能引用 `reference/rn/` 的规则，H5 只能引用 `reference/h5/`，PC 只能引用 `reference/pc/`，禁止跨平台引用；通用规则统一放 `reference/common/`。

---

## 4. 状态管理

### 4.1 文件结构

```
.ai-wiki/
├── .dtc-state.json                    # 状态主文件（多需求数组）
├── design-deviation-db.json           # 偏差库（跨需求共享）
└── 【需求名】/
    ├── features.md
    ├── api-spec.md                    # API 规格（api-spec 阶段产出）
    ├── ui-audit.md
    ├── tech-design.md
    ├── execution.md
    └── parsed-styles/                 # HTML 解析结果
        └── 【页面名】.json
```

### 4.2 状态机 Schema

顶层结构（完整定义见 `reference/rn/state-schema.md`，通用结构适用于所有平台）：

```jsonc
{
  "skill": "design-to-code-max",
  "version": "2.0",
  "startedAt": "",
  "updatedAt": "",
  "requirements": [],
}
```

每个需求条目包含完整字段：`id`、`requirementName`、`requirementType`、`status`、`currentPhase`、`inputs`、`docPaths`、`phaseOutputs`、`performanceLog`、`changeLog`。

v3.0 关键字段变化：

- `inputs.platform`：`rn` / `h5` / `pc`，是平台路由与中断恢复的根据
- `currentPhase` 枚举扩展：`init | analyze | collect-materials | feature-spec | api-spec | audit | design | build | verify | done`
- `docPaths.apiSpec`：api-spec.md 路径
- `phaseOutputs.api-spec`：接口总数、available / spec-only / pending-backend 计数、mock 模板标记
- `phaseOutputs.audit.screenshotFindings`：逐张截图的动态交互与视觉细节发现

### 4.3 设计要点

- **共享顶层 + 需求数组**：`requirements` 数组可存多个需求，互不干扰
- **阶段门禁**：每个阶段必须 `checklistPassed === true` 才能推进；analyze / collect-materials / feature-spec / api-spec / audit / design 还需 `userConfirmed === true`；build 还需 `exitGatePassed === true`
- **变更记录**：`changeLog` 记录每次修改的摘要、影响的功能点、时间戳
- **v1 → v2 迁移**：自动检测旧单对象格式，映射到 `requirements[0]`

---

## 5. HTML 结构化解析引擎

### 5.1 解决的问题

audit 阶段对 HTML 设计稿做系统性样式提取，输出结构化 JSON 数据。后续所有阶段直接消费这份数据，不再裸读 HTML。解析规则统一定义在 `reference/common/html-parser-rules.md`，三平台共用同一解析引擎。

### 5.2 解析流程

```
HTML 文件列表
  │  Step 1: 按页面/组件 DOM 边界拆分
  ▼
Step 2: 逐元素解析（标签、内联样式、文本、子元素）
  ▼
Step 3: 三要素归类（layout / typography / spacing & style）
  ▼
Step 4: Token 映射（按平台查各自的映射体系）
  ▼
Step 5: 输出 parsed-styles/【页面名】.json
```

Token 映射按平台分流：

| 平台 | 映射目标                                                                                                                               |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------- |
| RN   | `reference/rn/token-map.json` → theme token / `SPACE.*` / `FONT.*` / `BORDER.*`；图标查 `icon-map.md`                                  |
| H5   | CSS 变量 `var(--xlb-color-*)` / `var(--xlb-space-*)` / `var(--xlb-fontSize-*)` 等；图标映射 `@xlb/components-mobile` 的 `XlbIcon` type |
| PC   | CSS px 值 + Less 变量（`@color_link` 等）；组件映射查 `reference/pc/component-mapping.md`                                              |

### 5.3 输出格式

每个元素提取三类属性：

- **layout**: display, flexDirection, height, justifyContent, alignItems, padding, gap
- **typography**: fontSize, fontWeight, lineHeight, color, textAlign
- **spacingStyle**: borderRadius, borderWidth, borderColor, backgroundColor, margin

每个属性同时记录 HTML 原始值和 token 映射值，无法映射的记入 `unmappedTokens`。

### 5.4 截图扫读（与解析并列强制）

audit Step 2.5：HTML 解析与截图扫读是并列的两条腿，不是二选一。HTML 只描述静态 DOM，截图承载动态交互与视觉细节（展开/收起、Tab 切换、弹窗、状态标签配色、空态等）。每张截图必须逐张 Read 并产出 `screenshotFindings`（动态交互 / HTML 之外的视觉细节 / 新功能点），条数与截图数不一致则 audit 不通过；发现新功能点必须先回补 features.md 再继续。

### 5.5 消费链路

- **audit 三要素表**：从 parsed JSON 复制数据，模型逐项确认
- **build Step 2**：从 parsed JSON 读样式数据，不再裸读 HTML
- **build Step 5.5**：逐属性对比生成代码与 parsed JSON，输出偏差记录
- **verify**：对比最终代码与 parsed JSON，验证还原度

### 5.6 消费方不用感知原始 HTML

build 的每一组只要读 `parsed-styles/` 里的 JSON 就能拿到精确的样式规格。只有当前解析数据不足以回答非样式问题（placeholder、事件等）时才回退到原始 HTML。

---

## 6. 三要素对比表（Audit）

audit 阶段的核心产出物，每个 UI 块必须填写以下三张表：

**Layout 布局表**：display, flexDirection, height, justifyContent, alignItems, padding, gap
**Typography 字体表**：fontSize, fontWeight, lineHeight, color, textAlign
**Spacing & Style 表**：borderRadius, borderWidth, borderColor, backgroundColor, marginBottom

数据来源：优先从 `parsed-styles/*.json` 读取，模型做确认；无解析数据时才从裸 HTML 提取。

映射列格式按平台区分：RN 填 theme token（`SPACE.*` / `FONT.*`），H5 填 CSS 变量（`var(--xlb-*)`），PC 填 CSS 值 / Less 变量——禁止跨平台混用（如 H5 流水线不得出现 `theme['xxx']`）。

---

## 7. API 规格设计（api-spec，v3.0 新增）

### 7.1 定位

feature-spec 之后、audit 之前（API 设计与 UI 审计互不依赖）。在 pipeline 中建立 API 的**唯一事实来源**：design / build / verify 关于 API 的问题都以 api-spec.md 为准，不允许多头解释。未就绪的 API 不阻塞流程，用 mock 模板替代。

### 7.2 输入来源

| 需求类型 | 主要来源                                    | 次要参考                   |
| -------- | ------------------------------------------- | -------------------------- |
| 重构     | 源码中的 API 调用代码（参数构造、响应取值） | 接口文档（交叉验证）       |
| 增量     | 接口文档（Swagger / YApi / 文本）           | 项目已有相似接口的调用模式 |

接口文档与源码逆向结果不一致时，以接口文档为准并在 spec 中标注差异。

### 7.3 产出物（api-spec.md）

- **请求参数表**：参数名 / 类型 / 必填 / 默认值 / 来源变量 / 说明
- **响应字段表**：字段 / 类型 / 用途 / UI 元素 / 条件显隐
- **取值路径（分平台标注）**：如 RN (fsmshttp) `res?.data?.content` vs H5 (umi request) `res.content`，不确定时标注「待 verify 确认」而非留空
- **字段综合映射表**：跨接口合并同义字段，标注在每个页面的使用位置（FP 编号），是 build 字段完整性校验的直接依据
- **API 状态**：`available` / `spec-only` / `pending-backend` / `deprecated`；非 available 的接口必须生成 mock 数据模板（字段与响应字段表一致、类型匹配、有业务语义）

### 7.4 后续阶段消费方式

| 阶段         | 引用方式                                                                                      |
| ------------ | --------------------------------------------------------------------------------------------- |
| design       | 一句话引用（「API 规格详见 api-spec.md §2」），禁止重复定义参数结构，只设计状态管理与缓存策略 |
| build Step 2 | 读 api-spec.md 对应接口的请求参数表，禁止绕过它从源码裸提取参数格式                           |
| build Step 4 | 对照字段综合映射表生成渲染字段，正反两方向零遗漏（表中有的代码必须有，表中没有的代码不能有）  |
| verify       | API 合规检查 4 项：字段完整性 / 取值路径 / 参数默认值 / mock 残留                             |

---

## 8. 分组执行与偏差捕捉（Build）

### 8.1 分组闭环

每个分组按以下步骤执行，缺一不可（以 RN 流水线为例；H5 / PC 流水线步骤结构相同，约束内容各自独立）：

| 步骤     | 内容                                                                               |
| -------- | ---------------------------------------------------------------------------------- |
| Step 1   | 读设计文档（tech-design.md 对应部分）                                              |
| Step 2   | 读解析数据（parsed-styles JSON）+ 读 api-spec.md 对应接口规格，必要时交叉验证 HTML |
| Step 3   | 读项目代码风格 + 识别「生存必备模式」（选定参照页）                                |
| Step 3.5 | **模式对齐确认表**：与参照页逐维度对照，未全部确认禁止生成代码                     |
| Step 4   | 生成/修改代码（对照 api-spec.md 字段综合映射表，零遗漏）                           |
| Step 5   | 编译 + 渲染抽检（含 dependencies 禁用扫描、模式对齐复审）                          |
| Step 5.5 | **设计偏差捕捉**：逐属性对比代码与规格                                             |
| Step 6   | 更新 execution.md（含「恢复入口」标记）                                            |
| Step 7   | 更新 features.md                                                                   |
| Step 8   | 更新 .dtc-state.json                                                               |

### 8.2 Step 3 / 3.5 模式对齐

Step 3 不只对齐代码风格，更对齐「不改就会炸」的生存必备模式：页面容器结构、导航传参格式、路由参数取值、表单实例获取、API 响应取值路径、Toast 调用、Navbar 配置——每项必须与同一架构层的一个参照页逐行对照。Step 3.5 在写代码前输出「模式对齐确认表」到 execution.md，每个维度必须填参照页的具体文件:行号，任一维度未填写或不一致且无理由，禁止进入 Step 4。

### 8.3 Step 5.5 偏差捕捉

每组生成代码后，逐属性检查至少 4 项：

- `layout.height` → 是否符合设计值
- `typography.fontSize` → 字号是否正确
- `typography.color` → 颜色值是否匹配 token
- `spacingStyle.backgroundColor` → 背景色是否正确

输出偏差记录表到 execution.md，新偏差同步到 `design-deviation-db.json`。

### 8.4 分层验证

| 层级        | 时机             | 范围                             |
| ----------- | ---------------- | -------------------------------- |
| 模式对齐    | build Step 3.5   | 本分组 vs 参照页逐项对照         |
| 分组自检    | build Step 5.5   | 本分组代码 vs parsed-styles      |
| 出口门禁    | build 全部完成后 | 全部分组 + 全量扫描（13 项检查） |
| verify 终检 | verify 阶段      | 全部分组 + 完整扫描              |

### 8.5 出口门禁

build 完成后强制检查 13 项，任一项不通过禁止进入 verify：

1. 分组完成度
2. 功能点完成度
3. 解析数据消费完整性
4. 模式对齐表完整性
5. API 规格读取日志完整性
6. 样式合规终检
7. 动态表单安全检查
8. 设计定制落实检查
9. dependencies 禁用终检
10. defer/待处理项消费
11. 偏差库同步
12. API 响应取值检查
13. UI 结构变更字段完整性检查

---

## 9. 偏差持久化数据库

### 9.1 定位

跨需求积累组件库与设计稿的已知差异，存储在 `.ai-wiki/design-deviation-db.json`。

**解决的问题**：同一个组件库问题（如 `CommonFormItem` 行高不可控），每次做新需求都会遇到。偏差库让问题只被发现一次，后续自动预标注。

### 9.2 偏差条目结构

```jsonc
{
  "id": "DEV-001",
  "component": "CommonFormItem",
  "defectType": "layout | color | spacing | icon | typography | missing",
  "defect": "问题描述",
  "compensation": "可操作的补偿方案",
  "severity": "critical | major | minor",
  "firstDiscovered": "2026-07-09",
  "lastOccurred": "2026-07-09",
  "occurrenceCount": 3,
  "affectedRequirements": ["req-xxx"],
  "resolved": false,
}
```

### 9.3 生命周期

| 阶段           | 操作                                           |
| -------------- | ---------------------------------------------- |
| audit 开始     | 读取偏差库，匹配已知组件，预标注到 ui-audit.md |
| build Step 5.5 | 新偏差追加到库；命中已知偏差 occurrenceCount++ |
| verify 结束    | 验证已修复的偏差标记 resolved=true             |

---

## 10. 中断恢复

### 10.1 多需求选择

下次启动时读取 `.dtc-state.json`，展示需求总览（名称、类型、阶段、完成度），让用户选择继续哪个需求。

### 10.2 平台路由恢复

恢复时根据需求条目的 `inputs.platform` 路由到对应平台的 subskill（rn/ h5/ pc/），禁止跨平台路由。

### 10.3 上下文刷新

build 阶段的每个分组增量加载，不加载已完成分组的代码文件：

- 读 `execution.md` 获取当前分组任务和恢复入口标记
- 读 `parsed-styles` 获取样式数据
- 读 `ui-audit.md` / `tech-design.md` 对应分组的规格部分
- 读 `api-spec.md` 对应接口的规格定义
- 不加载已完成分组的代码
- 不裸读原始 HTML（除非解析数据不足）

### 10.4 保障机制

- 每个分组完成后更新 state.json（含 `completedGroups`、`completedFeatureIds`）
- execution.md 顶部维护「恢复入口」标记
- 恢复时优先读「恢复入口」而非遍历全文

---

## 11. Gotchas 体系

`reference/rn/gotchas/` 收录 AI 生成代码时容易踩的坑，按分类存放（当前积累以 RN 平台为主，黑盒组件识别等通用方法可跨平台参考）：

| 分类                 | 内容              | 文件示例                                                                                           |
| -------------------- | ----------------- | -------------------------------------------------------------------------------------------------- |
| `component-library/` | 组件库已知陷阱    | `dependencies-kills-label.md`, `xlbform-celltheme-horizontal-padding.md`, `safeinput-filter-id.md` |
| `html-parsing/`      | HTML 解析注意事项 | `flex-gap-exact-token.md`, `force-full-element-mapping.md`                                         |
| `rn-quirks/`         | RN 平台特性       | `flex-container-height-collapse.md`, `absolute-position-to-rn-layout.md`                           |
| `api-patterns/`      | API 响应结构规范  | `fsms-response-structure.md`                                                                       |
| `build-phase/`       | 构建阶段问题      | `ui-structure-remap-field-loss.md`                                                                 |

每条 gotcha 在 build 和 verify 阶段按需引用，作为生成和校验的依据。

---

## 12. 生成代码约束

以下为 build Step 4 的共性约束，各平台专有约束见各自的 guidelines（`rn-guidelines.md` / `h5-guidelines.md` / `pc-guidelines.md`）：

- **Token 唯一来源**：RN 用 theme / `SPACE.*` / `FONT.*` / `BORDER.*`；H5 用 `var(--xlb-*)`；PC 用 CSS px + Less 变量。禁止硬编码 hex、magic number
- **功能完整性优先**：不得以样式合规为由删除已有功能
- **API 规格以 api-spec.md 为准**：参数格式、默认值、取值路径、字段清单不自行发挥；`res?.data` 可能就是顶层，不额外解 `.data`
- **字段零遗漏**：渲染字段与 api-spec.md 字段综合映射表正反两方向对齐
- **表单安全（RN）**：name 用字符串不用数组；禁止 `dependencies` / `shouldUpdate` prop；联动用 `form.getFieldValue` / `useWatch`
- **水平内边距（RN）**：通过 `XlbForm` 的 `cellTheme` prop 全局设置，不加到单个 Item style 上
