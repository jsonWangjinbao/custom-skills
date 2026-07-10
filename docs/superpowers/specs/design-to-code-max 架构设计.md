# design-to-code-max 架构设计

> 版本: 2.0
> 最后更新: 2026-07-09

---

## 1. 概述

`design-to-code-max` 是一个将产品需求、设计稿（HTML/截图）转换为生产代码的全链路交付 skill。
核心思路是：**让 AI 按标准化流水线工作，而不是自由发挥。**

### 核心能力

- **增量需求** — 在现有 Web/RN/H5 上加功能
- **重构需求** — H5→RN、RN→RN、Web→Web 重构
- **多需求管理** — 同时跟踪多个需求的进度，支持中断后续接
- **UI 高度还原** — 系统化比设计稿样式，输出 token 级偏差记录

---

## 2. 文件结构

```
design-to-code-max/
├── SKILL.md                       # 总纲：8 条铁律 + 流程总览 + 参考索引
│
├── subskills/                     # 5 个阶段的执行说明书
│   ├── 01-analyze.md              # 入口 + 需求分析
│   ├── 02-audit.md                # UI 审计 + HTML 解析
│   ├── 03-design.md               # 技术设计
│   ├── 04-build.md                # 分组执行 + 偏差捕捉
│   └── 05-verify.md               # 自测验证 + 交付
│
├── reference/                     # 知识库（AI 的参考依据）
│   ├── state-schema.md            # 状态机完整字段定义
│   ├── html-parser-rules.md       # HTML 结构化解析规则
│   ├── deviation-db-schema.md     # 偏差库字段定义
│   ├── rn-guidelines.md           # RN 代码生成约束
│   ├── xlb-style-system.md        # XLB 风格系统规范
│   ├── token-map.json             # CSS 变量 → theme token 映射
│   ├── icon-map.md                # 图标名称映射
│   ├── style-scan-checklist.md    # 样式合规扫描清单
│   ├── ambiguity-rules.md         # 歧义检测规则
│   ├── web-guidelines.md          # Web 平台规范
│   └── gotchas/                   # 已知陷阱/偏差记录
│       ├── component-library/         # 组件库相关
│       ├── html-parsing/              # HTML 解析相关
│       ├── rn-quirks/                 # RN 平台特性
│       └── api-patterns/              # API 响应结构
│
└── templates/                     # 文档模板
    ├── features.md.tpl
    ├── ui-audit.md.tpl
    ├── tech-design.md.tpl
    └── execution.md.tpl
```

---

## 3. 执行流程

### 3.1 总览

```
[init] → analyze ──✅+确认──→ audit ──✅+确认──→ design ──✅+确认──→ build ──出口门禁──→ verify ──✅──→ done
```

每个阶段产出标准文档，analyze / audit / design 三阶段需要用户确认才能推进。

### 3.2 5 个阶段

| 阶段 | 输入 | 产出 | 用户确认 | 说明 |
|------|------|------|---------|------|
| init | 用户回答 | state.json 需求条目 | — | 新需求时收集名称/类型/代码来源/UI 材料 |
| analyze | 需求文档 + 原代码 | features.md | 是 | 分解功能点，标注联动关系 |
| audit | HTML + 截图 | ui-audit.md + parsed-styles | 是 | 解析 HTML 为结构化数据，三要素对比，偏差库预标注 |
| design | features.md + ui-audit.md | tech-design.md | 是 | 组件架构、数据流、路由设计 |
| build | tech-design.md + parsed-styles | execution.md + 代码 | 否（出口门禁） | 分组生成代码，每组完事后做偏差捕捉 |
| verify | 全部代码 + 文档 | 交付总结 | 否（终检） | 功能验证 + 样式扫描 + 偏差库同步 |

### 3.3 入口流程

启动时读取 `.dtc-state.json`：

- 文件不存在或 requirements 为空 → 新需求流程
- 有已有需求 → 用 AskUserQuestion 展示需求列表让用户选择
  - 未完成 → 恢复进度
  - 已完成 → 询问是否修改（小改追加 changeLog 回退 build，大改走新需求）
  - 用户选择开始新需求 → 走新需求 init

新需求 init 按 5 个问题逐一收集（一次一问）：
1. 需求名称
2. 需求类型（增量 / 重构）
3. 需求文档来源
4. 代码路径（重构强制索取，增量可选）
5. UI 材料

---

## 4. 状态管理

### 4.1 文件结构

```
.ai-wiki/
├── .dtc-state.json                    # 状态主文件（多需求数组）
├── design-deviation-db.json           # 偏差库（跨需求共享）
└── 【需求名】/
    ├── features.md
    ├── ui-audit.md
    ├── tech-design.md
    ├── execution.md
    └── parsed-styles/                 # HTML 解析结果
        └── 【页面名】.json
```

### 4.2 状态机 Schema

顶层结构（完整定义见 `reference/state-schema.md`）：

```jsonc
{
  "skill": "design-to-code-max",
  "version": "2.0",
  "startedAt": "",
  "updatedAt": "",
  "requirements": []
}
```

每个需求条目包含完整字段：`id`、`requirementName`、`requirementType`、`status`、`currentPhase`、`inputs`、`docPaths`、`phaseOutputs`（5 个子对象）、`performanceLog`、`changeLog`。

### 4.3 设计要点

- **共享顶层 + 需求数组**：`requirements` 数组可存多个需求，互不干扰
- **阶段门禁**：每个阶段必须 `checklistPassed === true` 才能推进；analyze/audit/design 还需 `userConfirmed === true`
- **变更记录**：`changeLog` 记录每次修改的摘要、影响的功能点、时间戳
- **v1 → v2 迁移**：自动检测旧单对象格式，映射到 `requirements[0]`

---

## 5. HTML 结构化解析引擎

### 5.1 解决的问题

audit 阶段对 HTML 设计稿做系统性样式提取，输出结构化 JSON 数据。后续所有阶段直接消费这份数据，不再裸读 HTML。

### 5.2 解析流程

```
HTML 文件列表
  │  Step 1: 按页面/组件 DOM 边界拆分
  ▼
Step 2: 逐元素解析（标签、内联样式、文本、子元素）
  ▼
Step 3: 三要素归类（layout / typography / spacing & style）
  ▼
Step 4: Token 映射（查 token-map.json / icon-map.md）
  ▼
Step 5: 输出 parsed-styles/【页面名】.json
```

### 5.3 输出格式

每个元素提取三类属性：

- **layout**: display, flexDirection, height, justifyContent, alignItems, padding, gap
- **typography**: fontSize, fontWeight, lineHeight, color, textAlign
- **spacingStyle**: borderRadius, borderWidth, borderColor, backgroundColor, margin

每个属性同时记录 HTML 原始值和 token 映射值，无法映射的记入 `unmappedTokens`。

### 5.4 消费链路

- **audit 三要素表**：从 parsed JSON 复制数据，模型逐项确认
- **build Step 2**：从 parsed JSON 读样式数据，不再裸读 HTML
- **build Step 5.5**：逐属性对比生成代码与 parsed JSON，输出偏差记录
- **verify**：对比最终代码与 parsed JSON，验证还原度

### 5.5 消费方不用感知原始 HTML

build 的每一组只要读 `parsed-styles/` 里的 JSON 就能拿到精确的样式规格。只有当前解析数据不足以回答非样式问题（placeholder、事件等）时才回退到原始 HTML。

---

## 6. 三要素对比表（Audit）

audit 阶段的核心产出物，每个 UI 块必须填写以下三张表：

**Layout 布局表**：display, flexDirection, height, justifyContent, alignItems, padding, gap
**Typography 字体表**：fontSize, fontWeight, lineHeight, color, textAlign
**Spacing & Style 表**：borderRadius, borderWidth, borderColor, backgroundColor, marginBottom

数据来源：优先从 `parsed-styles/*.json` 读取，模型做确认；无解析数据时才从裸 HTML 提取。

---

## 7. 分组执行与偏差捕捉（Build）

### 7.1 8 + 1 步闭环

每个分组按以下步骤执行，缺一不可：

| 步骤 | 内容 |
|------|------|
| Step 1 | 读设计文档（tech-design.md 对应部分） |
| Step 2 | 读解析数据（parsed-styles JSON，必要时交叉验证 HTML） |
| Step 3 | 读项目代码风格 |
| Step 4 | 生成/修改代码 |
| Step 5 | 编译 + 渲染抽检 |
| Step 5.5 | **设计偏差捕捉**：逐属性对比代码与规格 |
| Step 6 | 更新 execution.md |
| Step 7 | 更新 features.md |
| Step 8 | 更新 .dtc-state.json |

### 7.2 Step 5.5 偏差捕捉

每组生成代码后，逐属性检查至少 4 项：
- `layout.height` → 是否符合设计值
- `typography.fontSize` → 字号是否正确
- `typography.color` → 颜色值是否匹配 token
- `spacingStyle.backgroundColor` → 背景色是否正确

输出偏差记录表到 execution.md，新偏差同步到 `design-deviation-db.json`。

### 7.3 分层验证

| 层级 | 时机 | 范围 |
|------|------|------|
| 分组自检 | build Step 5.5 | 本分组代码 vs parsed-styles |
| 出口门禁 | build 全部完成后 | 全部分组 + 全量扫描（10 项检查） |
| verify 终检 | verify 阶段 | 全部分组 + 完整扫描 |

### 7.4 出口门禁

build 完成后强制检查 10 项，任一项不通过禁止进入 verify：

1. 分组完成度
2. 功能点完成度
3. 解析数据消费完整性
4. 样式合规终检
5. 动态表单安全检查
6. 设计定制落实检查
7. dependencies 禁用终检
8. defer/待处理项消费
9. 偏差库同步
10. API 响应取值检查

---

## 8. 偏差持久化数据库

### 8.1 定位

跨需求积累组件库与设计稿的已知差异，存储在 `.ai-wiki/design-deviation-db.json`。

**解决的问题**：同一个组件库问题（如 `CommonFormItem` 行高不可控），每次做新需求都会遇到。偏差库让问题只被发现一次，后续自动预标注。

### 8.2 偏差条目结构

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
  "resolved": false
}
```

### 8.3 生命周期

| 阶段 | 操作 |
|------|------|
| audit 开始 | 读取偏差库，匹配已知组件，预标注到 ui-audit.md |
| build Step 5.5 | 新偏差追加到库；命中已知偏差 occurrenceCount++ |
| verify 结束 | 验证已修复的偏差标记 resolved=true |

---

## 9. 中断恢复

### 9.1 多需求选择

下次启动时读取 `.dtc-state.json`，展示需求总览（名称、类型、阶段、完成度），让用户选择继续哪个需求。

### 9.2 上下文刷新

build 阶段的每个分组增量加载，不加载已完成分组的代码文件：

- 读 `execution.md` 获取当前分组任务和恢复入口标记
- 读 `parsed-styles` 获取样式数据
- 读 `ui-audit.md` 对应分组的规格部分
- 不加载已完成分组的代码
- 不裸读原始 HTML（除非解析数据不足）

### 9.3 保障机制

- 每个分组完成后更新 state.json（含 `completedGroups`、`completedFeatureIds`）
- execution.md 顶部维护「恢复入口」标记
- 恢复时优先读「恢复入口」而非遍历全文

---

## 10. Gotchas 体系

`reference/gotchas/` 收录 AI 生成代码时容易踩的坑，按分类存放：

| 分类 | 内容 | 文件示例 |
|------|------|---------|
| `component-library/` | 组件库已知陷阱 | `dependencies-kills-label.md`, `xlbform-celltheme-horizontal-padding.md`, `safeinput-filter-id.md` |
| `html-parsing/` | HTML 解析注意事项 | `flex-gap-exact-token.md`, `force-full-element-mapping.md` |
| `rn-quirks/` | RN 平台特性 | `flex-container-height-collapse.md`, `text-input-explicit-fontfamily.md` |
| `api-patterns/` | API 响应结构规范 | `fsms-response-structure.md` |

每条 gotcha 在 build 和 verify 阶段按需引用，作为生成和校验的依据。

---

## 11. 生成代码约束

build Step 4 生成代码时，以下约束必须遵守：

- **Token 唯一来源**：所有色值、字号、间距、圆角来自 theme 或 token-map.json
- **功能完整性优先**：不得以样式合规为由删除已有功能
- **表单安全**：name 用字符串不用数组；禁止 `dependencies`/`shouldUpdate` prop
- **API 取值**：先确认接口响应结构，`res?.data` 可能是顶层，不额外解 `.data`
- **水平内边距**：通过 `XlbForm` 的 `cellTheme` prop 全局设置，不加到单个 Item style 上
