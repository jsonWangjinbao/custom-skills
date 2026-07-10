# design-to-code v2 优化实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 design-to-code skill 从单向 HTML→代码转换器升级为全链路需求交付管道，支持增量/重构双模式、文档驱动状态跟踪、中断恢复。

**Architecture:** 文档驱动管道架构。所有状态持久化到 `.design-to-code/` 目录下的四个 markdown 文档（features.md、ui-audit.md、tech-design.md、execution.md），SKILL.md 定义六个步骤的交互流程，步骤之间通过文档状态转移驱动。

**Tech Stack:** Markdown 文档（模板在 `templates/`），SKILL.md 用 instruction 定义流程，所有参考文件（`references/` 下的 guidelines、gotchas、token-map 等）保持不动。

## Global Constraints

- 用户输入的需求名称直接用作文件夹名
- ai-wiki 基础路径：`/Users/wangjinbao/wanchen-code/ai-wiki/`，不存在则回退到当前项目根目录
- 状态文档存储在 `ai-wiki/【需求名】/.design-to-code/` 下
- v1 向下兼容：用户直接提供 HTML+截图（无需求名称）时回退到 v1 线性流程
- 所有 v1 参考文件（`references/` 下的文件）保持不动，不修改
- 提交必须经用户明确同意（遵守 CLAUDE.md 第 13 条）
- 全部用户交互使用中文

---

## File Structure

```
design-to-code/
├── SKILL.md                    # [重写] 主 skill 定义文件 (v2 全链路流程)
├── docs/                       # 设计文档
│   └── 2026-07-02-design-to-code-v2-optimization-design.md
├── references/                 # [不动] 现有参考文件
│   ├── ambiguity-rules.md
│   ├── rn-guidelines.md
│   ├── web-guidelines.md
│   ├── token-map.json
│   ├── theme-templates/
│   └── gotchas/
└── templates/                  # [新增] 生成的文档模板
    ├── features.md.tpl         # 功能点列表模板
    ├── ui-audit.md.tpl         # UI 完整性审计报告模板
    ├── tech-design.md.tpl      # 技术设计文档模板
    └── execution.md.tpl        # 执行文档模板
```

---

### Task 1: 创建 templates/ 目录和文档模板

**Files:**
- Create: `design-to-code/templates/features.md.tpl`
- Create: `design-to-code/templates/ui-audit.md.tpl`
- Create: `design-to-code/templates/tech-design.md.tpl`
- Create: `design-to-code/templates/execution.md.tpl`

**Interfaces:**
- Consumes: 设计文档中规定的四种文档格式 (spec §2.3, §3.1 ~ §3.5)
- Produces: 四个 markdown 模板文件，供 SKILL.md 在对应步骤引用填充

- [ ] **Step 1: 创建 templates/ 目录**

```bash
mkdir -p /Users/wangjinbao/.claude/skills/design-to-code/templates
```

- [ ] **Step 2: 创建 features.md.tpl**

```markdown
# 功能点列表 — {{需求名称}}

> 生成时间: {{当前日期}}
> 需求模式: {{增量/重构}}

## 功能点清单

| ID | 模块 | 功能描述 | 来源 | UI完整 | 联动/依赖 | 状态 | 备注 |
|----|------|---------|------|--------|----------|------|------|
| {{F-N}} | {{模块名}} | {{功能描述}} | {{原代码/需求新增}} | {{⬜/✅}} | {{联动描述}} | {{状态}} | {{备注}} |

> 联动关系说明：每项依赖指**当被依赖功能点发生变化/完成时，当前功能点需要响应**。

## 功能点与 UI 对照

| 功能点 | 关联 HTML | 关联截图 | UI 覆盖情况 |
|--------|----------|---------|------------|
| {{F-N ~ F-M}} | {{待补充}} | {{待补充}} | {{⬜}} |
```

验证：文件存在且格式有效（纯 markdown，含 Liquid 风格占位符供后续替换）

- [ ] **Step 3: 创建 ui-audit.md.tpl**

```markdown
# UI 完整性审计报告 — {{需求名称}}

> 生成时间: {{当前日期}}
> 状态: {{完整/部分缺失/跳过}}

## 功能点 UI 覆盖检查

| ID | 功能 | HTML 文件 | 截图文件 | 状态 |
|----|------|----------|---------|------|
| {{F-N}} | {{功能描述}} | {{文件.html ✅/⬜ 缺失}} | {{文件.png ✅/⬜ 缺失}} | {{完整/不完整/缺失}} |

## 缺失项汇总

| 序号 | 缺失类型 | 涉及功能点 | 影响分析 |
|------|---------|-----------|---------|
| 1 | {{缺 HTML/缺截图/两者皆缺}} | F-00X | {{功能实现不受影响/样式需要后续补充}} |
```

验证：文件存在且格式完整

- [ ] **Step 4: 创建 tech-design.md.tpl**

```markdown
# 技术设计 — {{需求名称}}

## 1. 概述

- **改动范围**: {{本次改动的范围描述}}
- **涉及模块**: {{模块列表}}
- **目标平台**: {{Web / RN / H5}}

## 2. 组件架构

```
{{组件树状结构}}
```

## 3. 数据流

- **状态管理**: {{方案描述}}
- **API 接口**: {{接口定义}}
- **缓存策略**: {{策略描述}}

## 4. 路由设计

- {{路由路径}}: {{参数说明}}

## 5. UI 说明

{{有 UI 材料时注明参考的 HTML+截图 / 无 UI 材料则写: 使用项目通用样式，待 UI 材料补充后完善}}

## 6. 功能点对照

| ID | 组件 | 文件路径 | 状态 |
|----|------|---------|------|
| F-001 | {{组件名}} | {{路径}} | {{待开发/已完成}} |

## 7. 关注点 / Gotchas

{{引用 references/gotchas/ 中相关的已知问题}}
```

验证：文件存在且结构完整

- [ ] **Step 5: 创建 execution.md.tpl**

```markdown
# 执行文档 — {{需求名称}}

> 每完成一步，标记 ✅。
> 每完成一步，关联功能点同步勾掉。

## 执行步骤

### 第一阶段: {{阶段名称}}

- [ ] Step 1: {{步骤描述}} → 关联: F-00X | 预计: {{时间}}
- [ ] Step 2: {{步骤描述}} → 关联: F-00X | 预计: {{时间}}

### 第二阶段: {{阶段名称}}

- [ ] Step N: {{步骤描述}} → 关联: F-00X | 预计: {{时间}}

### 最终阶段: 自测

- [ ] Step N: 自测功能点 → 关联: 全部功能点
```

验证：文件存在且 checklist 格式正确

---

### Task 2: 重写 SKILL.md 为 v2 全链路流程

**Files:**
- Modify: `design-to-code/SKILL.md` (完整重写，从 133 行 v1 替换为 v2)

**Interfaces:**
- Consumes: `templates/features.md.tpl`, `templates/ui-audit.md.tpl`, `templates/tech-design.md.tpl`, `templates/execution.md.tpl`
- Produces: 完整的 skill 定义，包含 6 步管道 + v1 向后兼容

- [ ] **Step 1: 更新 frontmatter description**

将当前专注于 HTML→代码转换的描述，改为覆盖全链路的描述：

```yaml
---
name: design-to-code
description: >-
  Use when you need to convert design materials (HTML/screenshots) and requirements into production code.
  Supports full delivery pipeline: feature analysis → UI audit → tech design → execution → self-test.
  Handles incremental features and cross-platform refactoring (H5→RN, Web→RN, etc).
  When only HTML+images are provided (no requirement name), falls back to direct code generation (v1 mode).
---
```

- [ ] **Step 2: 写入 v2 整体架构和核心原则**

在 frontmatter 下方，替换原有的"输入要求"和"工作流"为 v2 的核心描述：

```markdown
# design-to-code v2

将产品需求/设计稿/截图转换为生产代码的全链路交付管道。**功能点列表是一切行动的真理源**。

## 工作模式

- **增量需求** — 在现有 Web/RN/H5 上加功能，需求描述 + HTML+截图 → 实现
- **重构需求** — H5→RN、RN→RN、Web→Web 重构，先还原功能再还原样式

## 核心原则

- 功能点列表是一切行动的真理源
- UI 是锦上添花，不阻塞功能开发
- 所有状态由文档持久化，天然支持中断恢复
- 每一步完成双向更新：执行步骤 ✅ → 对应功能点 ✅
- 后续修改从功能点列表开始，同步更新技术文档

## 管道总览

[1. 启动&初始化] → [2. 功能点分析] → [3. UI审计] → [4. 技术设计] → [5. 执行&勾选] → [6. 自测验证]

状态文档 → {需求目录}/.design-to-code/{features.md, ui-audit.md, tech-design.md, execution.md}
```

- [ ] **Step 3: 写入 STEP 0 (启动 & 初始化)**

```markdown
### STEP 0: 启动 & 初始化

1. Skill: "请为这次需求输入一个名称："
2. 用户输入名称（如 "FSMS-证件管理 APP交互体验优化"）
3. 检查是否已有 `.design-to-code/execution.md` 且存在未完成步骤：
   - 有未完成 → 提示恢复进度或开始新需求
   - 无 → 创建 `【需求名】/` 及其 `.design-to-code/` 子目录
4. ai-wiki 路径优先使用 `/Users/wangjinbao/wanchen-code/ai-wiki/`，不存在则回退到当前工作目录
```

- [ ] **Step 4: 写入 STEP 1 (功能点分析 — 核心步骤)**

包含模式选择分支：

```markdown
### STEP 1: 功能点分析

#### 1.1 选择模式

"这次是增量需求还是重构需求？"

#### 1.2a 增量模式

1. 读取需求描述或产品文档路径
2. 提问涉及哪些现有模块 → 读取相关代码理解现有结构
3. 结合需求 + 现有代码 → 生成 features.md
4. 展示给用户确认

#### 1.2b 重构模式

1. 读取需求描述或产品文档路径
2. 提问原始代码路径 → 深入分析原始代码
3. 尤其关注组件联动关系：
   - 组件 A 值变化 → 组件 B 状态/数据变化
   - 跨表单字段联动
   - 校验规则联动
   - 组件显隐联动
   - 表单之间联动（提交→刷新/预填充）
4. 结合需求 + 原代码分析 → 生成 features.md（标注 "来自原代码" / "需求新增"）
5. 展示给用户确认

#### 1.3 输出：features.md

功能点列表格式（参照 templates/features.md.tpl），包含 ID、模块、功能描述、来源、UI 完整度、联动/依赖、状态、备注 八列。
```

- [ ] **Step 5: 写入 STEP 2 (UI 审计 — 可选)**

```markdown
### STEP 2: UI 材料收集 & 审计（可选）

1. 用户确认功能点后询问："请提供 HTML 文件 + 对应截图的目录路径"
2. 自动扫描目录，按文件名模式匹配 HTML 和截图，列出配对清单
3. 生成 ui-audit.md，对照功能点检查覆盖情况
4. 询问是否跳过 UI 还原：
   - 是 → 标记"UI 待补充"，功能按项目通用样式实现
   - 否 → 补充文件后再继续
   - 以后再补 → 标记"UI 待补充"
```

- [ ] **Step 6: 写入 STEP 3 (技术设计)**

```markdown
### STEP 3: 技术设计文档

输入 features.md + ui-audit.md（可选），生成 tech-design.md：

1. 概述（改动范围、涉及模块、目标平台）
2. 组件架构（树状结构图）
3. 数据流（状态管理、API 接口、缓存策略）
4. 路由设计
5. UI 说明（有/无 UI 材料分别处理）
6. 功能点对照表
7. 关注点（引用 references/gotchas/ 相关已知问题）

用户审阅后通过或修改。
```

- [ ] **Step 7: 写入 STEP 4 (执行 & 勾选)**

```markdown
### STEP 4: 执行 & 勾选

#### 4.1 生成 execution.md

从 tech-design.md 拆解为分步执行步骤，每步标注关联功能点 ID。

#### 4.2 分步执行

按顺序逐一执行每步：
1. 读取技术文档对应部分
2. 读取项目代码风格
3. 生成/修改代码
4. 更新 execution.md：步骤标记 ✅
5. 更新 features.md：关联功能点标记 ✅
6. 展示变更摘要

#### 4.3 中断恢复

检测 .design-to-code/execution.md：
- 有未完成步骤 → 提示恢复
- 用户选择继续 → 跳到下一个未完成步骤
- 用户选择新需求 → 进入 STEP 0
```

- [ ] **Step 8: 写入 STEP 5 (自测验证) 和后续修改流程**

```markdown
### STEP 5: 自测验证

逐项检查 features.md 的功能点：
- 组件是否存在
- API 调用是否正常
- 联动关系是否实现
- UI 是否还原（如有 HTML+截图）

全部通过 → 完成。未通过 → 标记并修复。

### 后续修改

用户提出变更 → 检查 features.md → 询问是否更新功能点列表
→ 在 features.md 上新增/修改（标记"需求变更"）
→ 同步更新 tech-design.md
→ 更新 execution.md 插入新步骤
→ 继续执行
```

- [ ] **Step 9: 写入 v1 兼容模式**

放在完整 v2 流程后面的独立章节：

```markdown
## v1 兼容模式

当用户直接提供 HTML 文件路径（未输入需求名称）时，回退到 v1 线性流程：
- 收集输入 → 解析 HTML → 解析 CSS 变量 → 歧义检测 → 主题环境检测 → 生成代码 → 输出结果

所有 v1 参考文件（references/ 下的 guidelines、gotchas、theme-templates 等）保持不动。
```

- [ ] **Step 10: 验证 SKILL.md 完整性和格式**

验证点：
- YAML frontmatter 正确闭合（`---` 包裹）
- description 不超过 1024 字符
- 所有步骤编号连续（0~5 + 后续修改 + v1 兼容）
- 引用路径正确（`templates/xxx.md.tpl`、`references/xxx`）
- 没有 TBD/TODO 占位符
- 中英文混排正确性
- 行数控制在 500 行以内

---

### Task 3: 验证整个 skill 的完整性和流程走通

**Files:**
- Read: `design-to-code/SKILL.md`
- Read: `templates/*.md.tpl` (全部四个)

- [ ] **Step 1: 做完整的一致性检查**

```bash
# 验证所有文件存在
ls -la /Users/wangjinbao/.claude/skills/design-to-code/SKILL.md
ls -la /Users/wangjinbao/.claude/skills/design-to-code/templates/*.md.tpl

# 统计行数（SKILL.md 应 ≤ 500 行）
wc -l /Users/wangjinbao/.claude/skills/design-to-code/SKILL.md

# 验证 YAML 前 5 行是否正确
head -5 /Users/wangjinbao/.claude/skills/design-to-code/SKILL.md
```

预期：所有文件存在，SKILL.md 行数在 300~500 之间（v2 比 v1 长但受规范约束）。

- [ ] **Step 2: 手动走读全覆盖检查**

按顺序检查每条路径的通达性：

| 检查路径 | 步骤序列 | 预期结果 |
|---------|---------|---------|
| 增量+有UI | 0→1(增量)→2(有UI)→3→4→5 | 全流程走通 |
| 增量+无UI | 0→1(增量)→2(跳过)→3→4→5 | 跳过 UI 步骤 |
| 重构+有UI | 0→1(重构)→2(有UI)→3→4→5 | 全流程走通 |
| 重构+无UI | 0→1(重构)→2(跳过)→3→4→5 | 跳过 UI 步骤 |
| v1 兼容 | 直接给 HTML→v1 流程 | 回退到线性代码生成 |
| 中断恢复 | 有 execution.md→提示恢复 | 正确跳到未完成步骤 |
| 后续修改 | 完成→提出变更→更新文档 | 功能点和设计文档同步更新 |

**检查点：寻找漏洞——每个分支的每一个步骤是否都能在 SKILL.md 中找到对应的指令？**

- [ ] **Step 3: 检查 Gotchas 引用完整性**

确保 v1 的 gotchas 引用路径在 v2 的 STEP 3 (技术设计) 和 v1 兼容模式中仍然正确：`references/gotchas/` 路径不变，重写的 SKILL.md 中所有引用路径与文件系统一致。

---

## Self-Review Checklist

| 检查项 | 状态 |
|--------|------|
| **Spec 覆盖** — 设计文档的每节是否都能对应到计划中的任务？ | 待确认 |
| | §1 背景 → 覆盖在 Task 2 Step 2（核心原则） |
| | §2 整体架构 → 覆盖在 Task 2 Step 2（管道总览） |
| | §3.1 STEP 0 → 覆盖在 Task 2 Step 3 |
| | §3.2 STEP 1 → 覆盖在 Task 2 Step 4 |
| | §3.3 STEP 2 → 覆盖在 Task 2 Step 5 |
| | §3.4 STEP 3 → 覆盖在 Task 2 Step 6 |
| | §3.5 STEP 4 → 覆盖在 Task 2 Step 7 |
| | §3.6 STEP 5 → 覆盖在 Task 2 Step 8 |
| | §3.7 后续修改 → 覆盖在 Task 2 Step 8 |
| | §5 结构变更 → 覆盖在 Task 1 |
| | §5.2 v1 兼容 → 覆盖在 Task 2 Step 9 |
| **占位符扫描** — 计划中无 TBD/TODO/占位内容 | ✅ 所有模板使用 `{{占位符}}` 格式（设计意图）而非 TBD |
| **类型一致性** — 模板文件和 SKILL.md 的引用一致 | Task 1 模板在 Task 2 以 `templates/xxx` 引用，路径一致 |
