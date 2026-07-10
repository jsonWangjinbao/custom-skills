# design-to-code-max v2 实现计划

> 基于: `docs/superpowers/specs/2026-07-09-design-to-code-max-v2-design.md`
> 生成时间: 2026-07-09
> 总阶段数: 6

## 阶段总览

| # | 阶段名 | 涉及文件 | 预计文件数 | 前置依赖 |
|---|--------|---------|-----------|---------|
| 1 | 状态层改造 | `SKILL.md`, `reference/state-schema.md`（新） | 2 | 无 |
| 2 | 入口流程重构 | `01-analyze.md`, `templates/features.md.tpl` | 2 | Phase 1 |
| 3 | HTML 解析引擎 + Audit 增强 | `reference/html-parser-rules.md`（新）, `reference/deviation-db-schema.md`（新）, `02-audit.md` | 3 | Phase 1 |
| 4 | Build 偏差捕捉 | `04-build.md`, `templates/execution.md.tpl` | 2 | Phase 3 |
| 5 | Verify + 清理 | `05-verify.md` | 1 | Phase 4 |
| 6 | 模板收尾 + 联调 | `templates/*` | 2 | Phase 2 + 5 |

---

## Phase 1: 状态层改造

### 目标
将 `.dtc-state.json` 从单需求对象改为数组结构，SKILL.md 瘦身，状态机 Schema 拆分到独立文件。

### 任务清单

#### 1.1 新建 `reference/state-schema.md`
- [ ] 从 SKILL.md 中提取完整的 `.dtc-state.json` 状态机 Schema（原 SKILL.md §「状态机 Schema」章节）
- [ ] 更新为新版数组结构：共享顶层字段 + 需求条目字段 + 偏差库字段
- [ ] 在文档中标注版本号 `2.0`
- [ ] 确认格式：完整 JSON 注释文档，每个字段有说明

**输出文件：** `reference/state-schema.md`
**验证：** 引用该文件的 subskill 能获取到完整 Schema 定义

#### 1.2 精简 SKILL.md
- [ ] 删除「状态机 Schema」完整定义段（移到 reference/state-schema.md）
- [ ] 在原文位置替换为简短引用：`完整状态机 Schema 见 reference/state-schema.md`
- [ ] 删除「交付总结格式」完整定义段（仅保留名称引用）
- [ ] 中断恢复协议重写：
  - [ ] 改为多需求数组的恢复逻辑
  - [ ] 状态不存在时走新需求 init 流程
  - [ ] 存在未完成需求时展示列表让用户选择
- [ ] 更新版本号从 `1.0` → `2.0`
- [ ] 增加偏差库的引用说明
- [ ] 增加 HTML 解析引擎的引用说明
- [ ] 精简性能计时章节为简短描述
- [ ] 确保 8 条铁律保持完整不变

**验证：** SKILL.md 行数从 ~224 行降至 ~150 行以内，信息完整

#### 1.3 更新 `.dtc-state.json` 读写逻辑
- [ ] 在 SKILL.md 和 01-analyze.md 中明确：
  - [ ] 读：解析 `requirements` 数组，无数组或空数组时走 init
  - [ ] 写：Read → 修改对应 requirement → Write 覆盖写回
  - [ ] 迁移：检测 `version < 2.0` 时自动映射旧数据到 `requirements[0]`

---

## Phase 2: 入口流程重构

### 目标
Phase 01 拆分为 init 入口 + analyze 两段逻辑，实现新需求/续接流程的系统化对话。

### 任务清单

#### 2.1 重写 `01-analyze.md`

**Init 段（新增前半段）：**
- [ ] 启动后先 Read `.dtc-state.json`
- [ ] 如果文件不存在或 requirements 为空 → 直接进入新需求 init 流程
- [ ] 如果存在已有需求 → AskUserQuestion：「开始新需求 还是 继续已有？」
- [ ] 新需求流程：
  - [ ] 依次询问（一次一问 AskUserQuestion）：
    1. 需求名称 → `requirementName`
    2. 需求类型（incremental / refactor）
    3. 需求文档来源（飞书链接 / md 文件路径 / 口述）
    4. 代码来源：重构→索取原代码路径；增量→询问模块范围/自动检索
    5. UI 材料：html+截图 / 仅html / 仅截图 / 无
  - [ ] 生成 requirement id（示例：`req-${Date.now()}`）
  - [ ] 创建 `.ai-wiki/【需求名】/parsed-styles/` 目录
  - [ ] 初始化 requirements 数组条目，写入 state.json
- [ ] 已有需求选择逻辑：
  - [ ] 展示表格：编号、名称、类型、当前阶段、完成度
  - [ ] AskUserQuestion 让用户选择
  - [ ] 有未完成阶段 → 恢复进度（直接跳对应 currentPhase）
  - [ ] 已全部完成（status=done） → 询问是否要修改
    - [ ] 小改（≤3 功能点、不涉及接口/路由） → 追加 changeLog，回退到 build
    - [ ] 大改/新功能 → 走新需求流程

**Analyze 段（保持原有逻辑）：**
- [ ] 原「选择模式」（增量/重构）的 analyze 逻辑保持基本不变
- [ ] 重构模式：铁律 9 保持（未获原代码不得仅凭 HTML/截图生成功能点）
- [ ] 输出 features.md 时增加「变更记录」章节

#### 2.2 修改 `templates/features.md.tpl`
- [ ] 增加「变更记录」章节模板：

```markdown
## 变更记录

| 日期 | 类型 | 描述 | 影响功能点 |
|------|------|------|-----------|
| {{日期}} | {{初始/需求变更}} | {{描述}} | {{F-001, F-002}} |
```

- [ ] 去重：移除文件底部重复的内容段
- [ ] 验证：模板无占位符遗漏

**验证：** 01-analyze.md 读完后，新需求和续接已有需求都能跑通入口流程

---

## Phase 3: HTML 解析引擎 + Audit 增强

### 目标
建立 HTML 结构化解析规则文档，改造 audit 阶段流程，使其按规则解析 HTML、输出 parsed-styles、填充三要素表。

### 任务清单

#### 3.1 新建 `reference/html-parser-rules.md`
- [ ] 定义 HTML 拆分规则：按页面/组件的 DOM 边界或视觉块分割
- [ ] 定义元素选择规则：排除 script/style/meta，选择 visible 元素
- [ ] 定义单位映射规则：px → token 的映射优先级（精确映射 > 最近值近似 > 标注无 token）
- [ ] 定义布局推断规则：从 inline style 推断 flex 方向、对齐方式
- [ ] 定义文本推断规则：从 placeholder / aria-label / 相邻 label 推断字段语义
- [ ] 定义输出格式规范：严格按照设计文档 4.3 的 JSON Schema
- [ ] 包含一个完整示例：从一个简单 HTML 到 parsed JSON 的转换演示

**输出文件：** `reference/html-parser-rules.md`

#### 3.2 新建 `reference/deviation-db-schema.md`
- [ ] 定义 `design-deviation-db.json` 的结构和字段约束（同设计文档 7.2）
- [ ] 包含字段说明表

**输出文件：** `reference/deviation-db-schema.md`

#### 3.3 改造 `02-audit.md`

重写流程为 6 步：

- [ ] **Step 1: 收集 UI 材料**（基本不变）
  - [ ] AskUserQuestion 询问 HTML 文件 + 截图路径
  - [ ] 自动扫描目录，列出配对清单
- [ ] **Step 2: 运行 HTML 结构化解析**（新增）
  - [ ] 对每个 HTML 文件，按 `reference/html-parser-rules.md` 执行 5 步解析
  - [ ] 输出到 `parsed-styles/【page-name】.json`
  - [ ] 记录解析日志到 performanceLog
- [ ] **Step 3: 逐块拆解 UI**（改为从 parsed JSON 读取）
  - [ ] 读取 parsed-styles JSON 获取结构化数据
  - [ ] 必要时交叉验证原始 HTML
- [ ] **Step 4: 填充三要素表**（增强）
  - [ ] 从 parsed JSON 复制数据 → Layout 表 / Typography 表 / Spacing 表
  - [ ] 模型逐项确认，标记 ✅
  - [ ] 首次跑时建立三要素表模板格式
- [ ] **Step 5: 组件选择 + 黑盒分析**（基本不变）
  - [ ] 每个 UI 块选组件、分析黑盒差异
- [ ] **Step 6: 偏差库预标注**（新增）
  - [ ] 读取 `design-deviation-db.json`
  - [ ] 匹配当前组件列表中的已知偏差组件
  - [ ] 预标注到 ui-audit.md 的「组件库渲染差异分析」章节
  - [ ] 标注格式：`【来源：偏差库 DEV-XXX】`

#### 3.4 状态更新
- [ ] `phaseOutputs.audit` 增加新字段：
  - [ ] `parsedStyleCount` — 已解析的样式文件数
  - [ ] `unmappedTokens` — 无法映射的 token 清单
  - [ ] `deviationMatches` — 命中偏差库的条目数

**验证：**
- 对一个测试 HTML 执行解析流程，能输出符合 schema 的 parsed JSON
- 三要素表能从 parsed JSON 正确填充
- ui-audit.md 中包含偏差库预标注数据

---

## Phase 4: Build 偏差捕捉

### 目标
Build 阶段引入 Step 5.5 设计偏差自动捕捉，Step 2 改为消费 parsed-styles，实现分层验证。

### 任务清单

#### 4.1 改造 `04-build.md`

**Step 2 改造（从裸读 HTML 改为读 parsed-styles）：**

- [ ] 修改 Step 2 描述：
  ```text
  Step 2（新版）: 读取 parsed-styles + 交叉验证 HTML
  ```
- [ ] 新流程：
  1. 读取 `parsed-styles/*.json` 中当前分组涉及的页面数据
  2. 读取 ui-audit.md 中对应的三要素表确认
  3. 仅在以下场景回退到读原始 HTML：
     - parsed JSON 缺少该元素的数据
     - 需要确认非样式属性（placeholder、maxlength、事件等）
     - 模型对 parsed 数据的准确性有疑虑
- [ ] 记录格式从「HTML 已读」改为「解析数据已读: parsed-styles/xxx.json」
- [ ] 如果 parsed JSON 不存在（旧需求恢复场景），fallback 到裸读 HTML

**Step 5.5 新增（设计偏差捕捉）：**

- [ ] 在 Step 5 编译抽检之后，Step 6 更新 execution.md 之前插入：
  ```text
  Step 5.5: 设计偏差捕捉（新增）
  ─────────────────────────────────
  1. 读取 execution.md 中本分组的「解析数据已读」日志，确认已消费
  2. 读取 parsed-styles 中本分组涉及的样式数据
  3. 逐个属性检查生成的代码是否与规格一致
  4. 输出「设计偏差记录表」到 execution.md
  5. 将新偏差追加到 design-deviation-db.json
  ```
- [ ] 偏差记录表模板：
  ```markdown
  #### 设计偏差记录 — 分组 N

  | # | 元素 | 属性 | 预期(token) | 实际(代码) | 偏差类型 | 严重度 | 处理方案 |
  |---|------|------|-------------|-----------|---------|--------|---------|
  ```
- [ ] 偏差类型枚举：`layout | typography | spacing | icon | color | missing`
- [ ] 严重度枚举：`critical | major | minor`
- [ ] 处理方案枚举：`立即修复 | defer 到 verify | 不可修复-原因`
- [ ] 规范：至少检查 layout.height、typography.fontSize、typography.color、spacingStyle.backgroundColor 四项；关键性显著的属性越多越好

**偏差库同步：**
- [ ] Step 5.5 完成后，将新偏差写入 `design-deviation-db.json`
- [ ] 命中已知偏差时：仅 `occurrenceCount++`，不重复写入

**出口门禁增强：**
- [ ] 检查 design-deviation-db.json 中本需求的条目是否已全部消费
- [ ] 有未关闭的 `critical` 偏差 → 禁止进入 verify

**分层验证结构：**
- [ ] 在文档中明确三层验证的职责和触发时机表
- [ ] 分组自检：build Step 5.5（本分组）
- [ ] 出口门禁：全部 build 完成后（全部）
- [ ] verify 终检：verify 阶段（全部+扫描）

#### 4.2 修改 `templates/execution.md.tpl`

- [ ] 在每一步模板中，`HTML 已读` 改为 `HTML/解析数据已读`
- [ ] 设计偏差记录表模板追加到 execution.md 模板末尾
- [ ] 8 步闭环新序号对齐（Step 5.5 后的 Step 6/7/8 序号不变）

**验证：**
- 能对已完成的分组产出偏差记录表
- 新偏差能正确追加到 design-deviation-db.json
- Step 2 在 parsed JSON 存在时不裸读 HTML

---

## Phase 5: Verify + 清理

### 目标
Verify 阶段增加偏差库更新步骤，清理 05-verify.md 文件中的重复内容。

### 任务清单

#### 5.1 改造 `05-verify.md`

**偏差库更新步骤（新增）：**

- [ ] verify 阶段结束时增加「偏差库同步」步骤：
  ```text
  ### X. 偏差库同步

  1. 读取当前需求的偏差记录（从 design-deviation-db.json 筛选 affectedRequirements 含当前需求 ID 的条目）
  2. 对每条已修复的偏差：
     - 验证代码中是否确实实现补偿方案
     - 已修复 → resolved=true, verifyCount++
     - 未修复 → 标记为未闭环，禁止通过
  3. 更新 design-deviation-db.json
  ```

**偏差记录消费检查：**
- [ ] 在 checklist 中增加一项：
  - [ ] 偏差记录已全部消费（每个 defer 项有明确结论）

**文件去重：**
- [ ] 移除文件底部的重复段（现有 05-verify.md 在 ~238 行后存在完全重复的第二遍内容）
- [ ] 保留唯一的完整版本，删除所有重复的 section

**验证：** 文件行数从 ~420 行降至 ~200 行，无内容丢失

---

## Phase 6: 模板收尾 + 联调

### 目标
清理剩余模板，确保整体一致性。

### 任务清单

#### 6.1 清理 `templates/features.md.tpl`
- [ ] 确认「变更记录」章节已加入
- [ ] 去重：移除底部重复的功能点表内容（现有文件在 ~34 行后存在重复）
- [ ] 确认「性能计时日志」章节格式对齐新版本

#### 6.2 联调验证
- [ ] 检查所有 subskills 对 SKILL.md 的引用一致性
- [ ] 检查所有 reference 文件路径引用正确
- [ ] 检查所有 phaseOutputs 字段在 state.json 和 subskills 中一致
- [ ] 逐阶段通读：init → analyze → audit(含HTML解析) → design → build(含Step5.5) → verify

#### 6.3 最终检查
- [ ] 无 broken link、无占位符残留、无矛盾指令

---

## 执行顺序与依赖图

```text
Phase 1 (状态层) ──────────────────────┐
      │                                │
      ▼                                │
Phase 2 (入口流程) ◄───────────────────┤
      │                                │
      ▼                                │
Phase 3 (HTML解析+Audit) ◄────────────┤
      │                                │
      ▼                                │
Phase 4 (Build偏差捕捉) ◄──────────────┤
      │                                │
      ▼                                │
Phase 5 (Verify+清理) ◄───────────────┤
      │                                │
      ▼                                │
Phase 6 (模板收尾+联调) ◄──────────────┘
```

**关键路径：** Phase 1 → Phase 3 → Phase 4 → Phase 5（串行依赖）
**可并行：** Phase 2 可在 Phase 1 后与 Phase 3 并行执行

---

## 预估工作量

| 阶段 | 文件数 | 操作类型 | 预估复杂度 |
|------|--------|---------|-----------|
| Phase 1 | 2 | 拆分 + 修改 | 中（涉及 Schema 设计） |
| Phase 2 | 2 | 重写 + 修改 | 高（入口对话流程设计） |
| Phase 3 | 3 | 新建 + 重写 | 高（核心引擎设计） |
| Phase 4 | 2 | 增强 + 修改 | 高（偏差捕捉机制） |
| Phase 5 | 1 | 增强 + 去重 | 低 |
| Phase 6 | 2 | 清理 + 检查 | 低 |

**总预估行数变动：** +~300 行（新增 reference 文件） + ~100 行（subskills 净增）

---

## 风险提示

1. **Phase 3 是最关键的创新点** — HTML 解析规则写得好不好直接影响整个链路的收益。如果规则写得太松散，parsed JSON 质量低，build 阶段消费时反而增加模型困惑
2. **Phase 4 Step 5.5 的偏差检查粒度** — 检查得太细会大幅增加 build 阶段耗时，太粗则漏问题。建议聚焦 4 个必查属性（height、fontSize、color、backgroundColor）再按需扩展
3. **旧版 state.json 迁移** — Phase 1 的迁移逻辑必须健壮，否则现有用户恢复时出问题
