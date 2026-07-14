# design-to-code-max 技能架构优化 — 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 design-to-code-max 从仅支持 RN/H5→RN 重构的技能，重构为支持 RN/H5/PC 三端 + 重构/增量两种需求类型、各平台约束完全隔离、渐进式披露的通用前端代码生成技能。

**Architecture:** 单主技能(SKILL.md)作为入口路由器，通过 2 个入口问题(技术选型+需求类型)路由到对应平台的子技能链。common/ 共享层负责入口问答、材料收集和功能点生成。rn/h5/pc 三个目录各自持有完整的子技能(01-audit~04-verify) + reference。渐进式披露确保只加载用户所选平台的规则。

**Tech Stack:** Claude Skills (Markdown-based), 现有 reference 资产(guidelines/token-map/gotchas/templates)

## Global Constraints

- 所有现有 RN 资产原封不动搬迁到 reference/rn/ 目录，零内容改动
- html-parser-rules.md 和 ambiguity-rules.md 复制到 reference/common/ 作为通用工具
- web-guidelines.md 在合并到 h5/pc guidelines 后删除
- 每个 Phase 必须原子提交（不得跨 Phase commit）
- 技能基目录：`/Users/wangjinbao/wanchen-code/custom-skills/design-to-code-max/`
- SKILL.md 中参考文件表、子技能表等所有路径引用必须更新到位

---

## 前置：确认当前状态

- [ ] **确认当前目录结构**

  验证以下文件和目录存在：
  ```
  /Users/wangjinbao/wanchen-code/custom-skills/design-to-code-max/
  ├── SKILL.md
  ├── subskills/
  │   ├── 01-analyze.md
  │   ├── 02-audit.md
  │   ├── 03-design.md
  │   ├── 04-build.md
  │   └── 05-verify.md
  ├── reference/
  │   ├── ambiguity-rules.md
  │   ├── deviation-db-schema.md
  │   ├── gotchas/           (目录含 20+ 文件)
  │   ├── html-parser-rules.md
  │   ├── icon-map.md
  │   ├── rn-guidelines.md
  │   ├── state-schema.md
  │   ├── style-scan-checklist.md
  │   ├── theme-templates/   (目录含 5 个文件)
  │   ├── token-map.json
  │   ├── web-guidelines.md
  │   └── xlb-style-system.md
  └── templates/
      ├── execution.md.tpl
      ├── features.md.tpl
      ├── tech-design.md.tpl
      └── ui-audit.md.tpl
  ```

---

## Phase 1: 目录创建与 RN 资产搬迁

> 目标：创建新目录结构，将现有 RN 资产原封不动搬入 rn/ 目录，更新所有路径引用

### Task 1.1: 创建新目录结构

**Files:**
- Create: `design-to-code-max/subskills/common/` (目录)
- Create: `design-to-code-max/subskills/rn/` (目录)
- Create: `design-to-code-max/subskills/h5/` (目录)
- Create: `design-to-code-max/subskills/pc/` (目录)
- Create: `design-to-code-max/reference/common/` (目录)
- Create: `design-to-code-max/reference/rn/` (目录)
- Create: `design-to-code-max/reference/h5/` (目录)
- Create: `design-to-code-max/reference/pc/` (目录)
- Create: `design-to-code-max/templates/common/` (目录)
- Create: `design-to-code-max/templates/rn/` (目录)
- Create: `design-to-code-max/templates/h5/` (目录)
- Create: `design-to-code-max/templates/pc/` (目录)

- [ ] **Step 1: 创建所有空目录**

```bash
cd /Users/wangjinbao/wanchen-code/custom-skills/design-to-code-max
mkdir -p subskills/common subskills/rn subskills/h5 subskills/pc
mkdir -p reference/common reference/rn reference/h5 reference/pc
mkdir -p templates/common templates/rn templates/h5 templates/pc
```

Expected: 12 个新目录创建成功，无报错。

### Task 1.2: 搬迁 subskills 文件到 rn/

**Files:**
- Move: `subskills/02-audit.md` → `subskills/rn/01-audit.md`
- Move: `subskills/03-design.md` → `subskills/rn/02-design.md`
- Move: `subskills/04-build.md` → `subskills/rn/03-build.md`
- Move: `subskills/05-verify.md` → `subskills/rn/04-verify.md`

- [ ] **Step 1: 搬迁 4 个子技能文件**

```bash
cd /Users/wangjinbao/wanchen-code/custom-skills/design-to-code-max
mv subskills/02-audit.md subskills/rn/01-audit.md
mv subskills/03-design.md subskills/rn/02-design.md
mv subskills/04-build.md subskills/rn/03-build.md
mv subskills/05-verify.md subskills/rn/04-verify.md
```

Verify: `ls subskills/rn/` 应包含 `01-audit.md 02-design.md 03-build.md 04-verify.md`

- [ ] **Step 2: 更新 rn/01-audit.md 中的路径引用**

原文件路径引用:
- `reference/html-parser-rules.md` → `../reference/rn/html-parser-rules.md`
- `reference/token-map.json` → `../reference/rn/token-map.json`
- `reference/icon-map.md` → `../reference/rn/icon-map.md`
- `reference/xlb-style-system.md` → `../reference/rn/xlb-style-system.md`
- `reference/rn-guidelines.md` → `../reference/rn/rn-guidelines.md`
- `reference/gotchas/component-library/blackbox-wrapper-component.md` → `../reference/rn/gotchas/component-library/blackbox-wrapper-component.md`
- `templates/ui-audit.md.tpl` → `../templates/rn/ui-audit.md.tpl`
- `subskills/01-analyze.md` 等跨 subskill 引用 → 路由层面由 SKILL.md 管理，子技能内不跨引用

执行替换：

```bash
cd /Users/wangjinbao/wanchen-code/custom-skills/design-to-code-max
# 替换 reference/ -> ../reference/rn/ （注意确保不重复替换）
sed -i '' 's|reference/|../reference/rn/|g' subskills/rn/01-audit.md
# 注意：html-parser-rules.md 实际已搬到 reference/common/，所以要单独改
# 但 Phase 1 先全部指向 reference/rn/，Phase 2 再调整 common 引用
# 实际上搬迁后 html-parser 在 reference/rn/ 下也有一份，路径正确
# 更新 templates 路径
sed -i '' 's|templates/|../templates/rn/|g' subskills/rn/01-audit.md
```

- [ ] **Step 3: 更新 rn/02-design.md 中的路径引用**

```bash
cd /Users/wangjinbao/wanchen-code/custom-skills/design-to-code-max
sed -i '' 's|reference/|../reference/rn/|g' subskills/rn/02-design.md
sed -i '' 's|templates/|../templates/rn/|g' subskills/rn/02-design.md
```

- [ ] **Step 4: 更新 rn/03-build.md 中的路径引用**

```bash
cd /Users/wangjinbao/wanchen-code/custom-skills/design-to-code-max
sed -i '' 's|reference/|../reference/rn/|g' subskills/rn/03-build.md
sed -i '' 's|templates/|../templates/rn/|g' subskills/rn/03-build.md
```

- [ ] **Step 5: 更新 rn/04-verify.md 中的路径引用**

```bash
cd /Users/wangjinbao/wanchen-code/custom-skills/design-to-code-max
sed -i '' 's|reference/|../reference/rn/|g' subskills/rn/04-verify.md
sed -i '' 's|templates/|../templates/rn/|g' subskills/rn/04-verify.md
# verify 提到 reference/gotchas/component-library/blackbox-wrapper-component.md
# 替换后为 ../reference/rn/gotchas/component-library/blackbox-wrapper-component.md
```

- [ ] **Step 6: 验证路径修改正确性**

用 grep 检查所有新路径是否存在且有内容：
```bash
cd /Users/wangjinbao/wanchen-code/custom-skills/design-to-code-max
# 检查是否存在未更新的旧路径引用
grep -n 'reference/' subskills/rn/*.md | grep -v '../reference/rn/'
# 应该无输出（全部已更新）
```

### Task 1.3: 搬迁 reference 文件到 reference/rn/

**Files:**
- Move: `reference/deviation-db-schema.md` → `reference/rn/deviation-db-schema.md`
- Move: `reference/gotchas/` → `reference/rn/gotchas/`
- Move: `reference/icon-map.md` → `reference/rn/icon-map.md`
- Move: `reference/rn-guidelines.md` → `reference/rn/rn-guidelines.md`
- Move: `reference/state-schema.md` → `reference/rn/state-schema.md`
- Move: `reference/style-scan-checklist.md` → `reference/rn/style-scan-checklist.md`
- Move: `reference/token-map.json` → `reference/rn/token-map.json`
- Move: `reference/theme-templates/` → `reference/rn/theme-templates/`
- Move: `reference/xlb-style-system.md` → `reference/rn/xlb-style-system.md`
- Copy: `reference/ambiguity-rules.md` → `reference/common/ambiguity-rules.md`
- Copy: `reference/html-parser-rules.md` → `reference/common/html-parser-rules.md`
- Keep: `reference/web-guidelines.md` 暂时不动（Phase 5 删除，Phase 3/4 合并）

- [ ] **Step 1: 搬迁 9 个 reference 文件/目录到 reference/rn/**

```bash
cd /Users/wangjinbao/wanchen-code/custom-skills/design-to-code-max
mv reference/deviation-db-schema.md reference/rn/
mv reference/gotchas/ reference/rn/
mv reference/icon-map.md reference/rn/
mv reference/rn-guidelines.md reference/rn/
mv reference/state-schema.md reference/rn/
mv reference/style-scan-checklist.md reference/rn/
mv reference/token-map.json reference/rn/
mv reference/theme-templates/ reference/rn/
mv reference/xlb-style-system.md reference/rn/
```

Verify: `ls reference/rn/` 应包含所有 9 项 + 目录。

- [ ] **Step 2: 复制通用 reference 到 reference/common/**

```bash
cd /Users/wangjinbao/wanchen-code/custom-skills/design-to-code-max
cp reference/ambiguity-rules.md reference/common/
cp reference/html-parser-rules.md reference/common/
```

Verify: `ls reference/common/` 应包含 `ambiguity-rules.md html-parser-rules.md`

- [ ] **Step 3: 从 reference 根目录删除已搬迁的原文件**

```bash
cd /Users/wangjinbao/wanchen-code/custom-skills/design-to-code-max
# 确认只留下 web-guidelines.md
ls reference/
# 预期输出: web-guidelines.md
```

### Task 1.4: 拆分 templates 目录

**Files:**
- Copy: `templates/features.md.tpl` → `templates/common/features.md.tpl`
- Copy: `templates/ui-audit.md.tpl` → `templates/rn/ui-audit.md.tpl`
- Copy: `templates/tech-design.md.tpl` → `templates/rn/tech-design.md.tpl`
- Copy: `templates/execution.md.tpl` → `templates/rn/execution.md.tpl`

- [ ] **Step 1: 拆分 templates 到对应目录**

```bash
cd /Users/wangjinbao/wanchen-code/custom-skills/design-to-code-max
cp templates/features.md.tpl templates/common/
cp templates/ui-audit.md.tpl templates/rn/
cp templates/tech-design.md.tpl templates/rn/
cp templates/execution.md.tpl templates/rn/
```

Verify: `ls templates/common/` 应包含 `features.md.tpl`；`ls templates/rn/` 应包含 3 个 tpl 文件。

- [ ] **Step 2: 删除旧 templates 根目录文件**

```bash
cd /Users/wangjinbao/wanchen-code/custom-skills/design-to-code-max
rm templates/features.md.tpl
rm templates/ui-audit.md.tpl
rm templates/tech-design.md.tpl
rm templates/execution.md.tpl
```

Verify: `ls templates/` 应只包含 `common/ rn/ h5/ pc/` 子目录。

### Task 1.5: 从现有 01-analyze.md 提取并改写 common/01-analyze.md

**Files:**
- Modify: `subskills/01-analyze.md` → 保留原地但内容缩减为入口路由（后续 common/01-analyze.md 将替代它）
- Create: `subskills/common/01-analyze.md` — 新入口，2 个问题（技术选型 + 需求类型）

- [ ] **Step 1: 创建 common/01-analyze.md**

从现有 `01-analyze.md` 中提取入口逻辑，改写为新架构的 2 问流程。包含：
- Q1: 技术选型 (RN / H5 / PC)
- Q2: 需求类型 (重构 / 增量)
- 根据答案决定材料收集路径

写入 `subskills/common/01-analyze.md`，内容如下：

```markdown
# Phase 01 — 入口与需求分析（通用）

## 进入条件

- 已 `Read .ai-wiki/.dtc-state.json`。
- `currentPhase` 为 `init` 或 `analyze`。

---

## 初始化入口（Init）

此段仅在 `currentPhase === "init"` 时执行。

### 1. 状态检测

读取 `.dtc-state.json` 后：

1. **文件不存在或 `requirements` 为空数组** → 直接进入「新需求流程」
2. **`requirements` 存在一个或多个条目** → 展示需求总览表，使用 `AskUserQuestion` 让用户选择续接或新建

（此部分状态检测逻辑与现有 `01-analyze.md` 第 1 节相同）

### 2. 新需求流程

> **❗️ 执行铁律（不得违反）**：一次 AskUserQuestion 只能包含 1 个问题，严禁多问题打包。

按顺序逐个调用 `AskUserQuestion`，每次仅传 1 个问题：

**问题 1 — header: "技术选型"**

- question: `"目标平台是哪个？"`
- options（固定 3 项）：
  - `{ label: "React Native", description: "移动端 RN 应用，使用 @xlb/components-react-native" }`
  - `{ label: "H5", description: "移动端 H5 WebView，使用 @xlb/components-mobile、UmiJS Max" }`
  - `{ label: "PC", description: "桌面端 PC 应用，使用 @xlb/components、UmiJS Max" }`

→ 收到答案 → 写入 `inputs.platform`（`rn` / `h5` / `pc`）→ 发起问题 2。

**问题 2 — header: "需求类型"**

- question: `"这次是增量需求还是重构需求？"`
- options（固定 2 项）：
  - `{ label: "增量需求", description: "在现有代码上新增或修改功能" }`
  - `{ label: "重构需求", description: "基于现有源码进行改写重构" }`

→ 收到答案 → 写入 `requirementType`（`incremental` / `refactor`）→ 进入材料收集阶段。

### 3. 推进

2 个问题回答完毕后，推进 `currentPhase` 到 `collect-materials`，fallthrough 到 `subskills/common/02-collect-materials.md`。

---

## 已有需求恢复（快速入口）

当选择续接已有需求时，根据 `currentPhase` 跳到对应阶段：

| 当前阶段           | 跳转到                                                       |
| ------------------ | ------------------------------------------------------------ |
| analyze            | 跳到上方「新需求流程」（仅状态检测后）                         |
| collect-materials  | `subskills/common/02-collect-materials.md`                    |
| feature-spec       | `subskills/common/03-feature-spec.md`                         |
| audit              | `subskills/{platform}/01-audit.md`（根据 `inputs.platform` 路由） |
| design             | `subskills/{platform}/02-design.md`                           |
| build              | `subskills/{platform}/03-build.md`                            |
| verify             | `subskills/{platform}/04-verify.md`                           |
| done               | 询问是否修改                                                 |

---

## 用户确认门禁

新需求流程完成后，输出平台和需求类型摘要，使用 `AskUserQuestion` 确认：

```
问题：需求初始化完成：[RN] + [重构]。是否确认进入材料收集？
选项：
- 确认，进入材料收集
- 重新选择（我会输入修改意见）
```

用户确认后，将 `currentPhase` 推进到 `collect-materials`，fallthrough。

---

## 禁止

- 不能在未询问技术选型时假设平台
- 不能一次询问多个问题
- 重构模式下不能跳过后续的材料收集步骤
```

- [ ] **Step 2: 保留并重命名旧 01-analyze.md 作为备份**

```bash
cd /Users/wangjinbao/wanchen-code/custom-skills/design-to-code-max
# 旧 01-analyze.md 中的 init/analyze 逻辑已被 common/01-analyze.md 继承
# 将其移走作为备份参考
mv subskills/01-analyze.md subskills/01-analyze.md.bak
```

### Task 1.6: 更新 SKILL.md 为路由器模式

**Files:**
- Modify: `SKILL.md` — 重写为路由器模式

- [ ] **Step 1: 重写 SKILL.md**

SKILL.md 保留以下内容：
- 八条铁律（精简为通用版本，去除 RN 专属约束）
- 整体路由流程（替换旧 5 阶段流程）
- 渐进式披露加载表
- 中断恢复协议
- 参考文件表（更新为新的路径）
- 状态机 Schema 引用
- 偏差持久化库引用
- 交付总结格式

将以下内容从 SKILL.md 中移除：
- RN 专属铁律（移至 reference/rn/rn-guidelines.md 或各 RN subskill 中）
- 旧的 5 阶段流程表（替换为路由流程）
- 旧的 init 5 问铁律引用（common/01-analyze.md 已定义新的 2 问）

写入新 SKILL.md：

```markdown
---
name: design-to-code-max
description: >-
  全链路前端代码生成 skill。支持 RN/H5/PC 三端 + 重构/增量两种需求类型。
  按技术选型渐进式披露平台约束，各平台流水线完全隔离。
---

# design-to-code-max

全链路前端代码生成 skill。支持 **RN** / **H5** / **PC** 三个平台，**重构** / **增量**两种需求类型。

## 八条铁律（不可违反）

1. **功能完整性优先**：不得以样式合规、简化代码为由，删除已有功能、接口字段、校验逻辑、事件处理。
2. **Token 唯一来源**：所有色值、字号、间距、圆角必须来自项目 token 系统；禁止硬编码 hex、magic number。
3. **必须消费输入材料才能写代码**：每个执行分组开始前必须已读取对应 UI 分析文档并记录日志；未读不得写代码。
4. **黑盒组件先查差异**：使用封装组件前，必须先确认其默认渲染与目标差异，写入组件选择决策表。
5. **阶段未 checkpoint 禁止推进**：每阶段结束后必须更新 `.ai-wiki/.dtc-state.json` 并通过本阶段 checklist。
6. **执行分组闭环**：每个分组完成后必须完成所有步骤（读设计 → 读样式 → 生成代码 → 编译抽检 → 更新文档 → 更新状态），缺一不可。
7. **样式合规是终检门禁**：先生成功能完整代码，所有分组完成后统一扫描修复样式问题。
8. **平台约束隔离**：RN 流水线只能引用 reference/rn/ 的规则，H5 流水线只能引用 reference/h5/，禁止跨平台引用。

## 路由流程

```
用户输入需求
    │
    ├── Q1: 技术选型?        → RN / H5 / PC
    ├── Q2: 需求类型?        → 重构 / 增量
    │
    ├── common/02-collect-materials    → 材料收集
    ├── common/03-feature-spec         → 功能点规格
    │
    └── 根据平台路由到对应流水线
        ├── RN: rn/01-audit → rn/02-design → rn/03-build → rn/04-verify
        ├── H5: h5/01-audit → h5/02-design → h5/03-build → h5/04-verify
        └── PC: pc/01-audit → pc/02-design → pc/03-build → pc/04-verify
```

| 阶段             | 文件                          | 用户确认 |
| ---------------- | ----------------------------- | -------- |
| 入口路由         | `common/01-analyze.md`        | 是       |
| 材料收集         | `common/02-collect-materials` | 是       |
| 功能点规格       | `common/03-feature-spec`      | 是       |
| UI 审计          | `{platform}/01-audit.md`      | 是       |
| 技术设计         | `{platform}/02-design.md`     | 是       |
| 代码生成         | `{platform}/03-build.md`      | 否       |
| 验证             | `{platform}/04-verify.md`     | 否       |

## 渐进式披露

本技能按技术选型进行渐进式加载：

| 用户选择      | 加载的子技能      | 加载的 reference                |
| ------------- | ----------------- | ------------------------------- |
| RN 重构/增量  | common/* + rn/*   | reference/common/ + reference/rn/ |
| H5 重构/增量  | common/* + h5/*   | reference/common/ + reference/h5/ |
| PC 重构/增量  | common/* + pc/*   | reference/common/ + reference/pc/ |

> 各平台子技能和 reference 完全独立，不跨平台引用。

## 强制 checkpoint 机制

（保留原有 checkpoint 机制描述，更新路径引用为 `reference/rn/state-schema.md`）

## 中断恢复协议

（保留原有中断恢复逻辑，更新子技能路径引用为各平台目录）

## 参考文件索引

| 文件                                              | 用途                | 消费时机                |
| ------------------------------------------------- | ------------------- | ----------------------- |
| `reference/common/ambiguity-rules.md`             | 歧义检测规则        | analyze 阶段            |
| `reference/common/html-parser-rules.md`           | HTML 结构化解析引擎  | audit 阶段              |
| `reference/rn/rn-guidelines.md`                   | RN 代码生成约束     | RN build 阶段           |
| `reference/rn/xlb-style-system.md`                | XLB 风格系统规范    | RN build 阶段           |
| `reference/rn/token-map.json`                     | token 映射          | RN build 阶段           |
| `reference/rn/gotchas/`                           | 已知问题库          | 各阶段按需              |
| (H5 和 PC 参考文件在各平台目录中声明)             |                     |                         |

## 状态机 Schema

完整状态机 Schema 见 `reference/rn/state-schema.md`。

## 偏差持久化库

完整 Schema 见 `reference/rn/deviation-db-schema.md`。

## 交付总结格式

（保留原有交付总结格式）
```

- [ ] **Step 2: 验证路径一致性**

```bash
cd /Users/wangjinbao/wanchen-code/custom-skills/design-to-code-max
# 检查 SKILL.md 中引用的路径是否都存在
grep -oP 'reference/[^\s)]+' SKILL.md | while read path; do
  if [ ! -f "$path" ] && [ ! -d "$path" ]; then
    echo "MISSING: $path"
  fi
done
```

Expected: 无 "MISSING" 输出。

- [ ] **Step 3: Phase 1 完成确认**

验证 Phase 1 完成后的目录结构：

```
design-to-code-max/
├── SKILL.md                          ← 路由器模式（已更新）
├── subskills/
│   ├── 01-analyze.md.bak             ← 旧入口备份
│   ├── common/
│   │   └── 01-analyze.md             ← 新入口（2 问）
│   ├── rn/
│   │   ├── 01-audit.md               ← 原 02-audit（路径已更新）
│   │   ├── 02-design.md              ← 原 03-design（路径已更新）
│   │   ├── 03-build.md               ← 原 04-build（路径已更新）
│   │   └── 04-verify.md              ← 原 05-verify（路径已更新）
│   ├── h5/                           ← 空目录
│   └── pc/                           ← 空目录
├── reference/
│   ├── common/
│   │   ├── ambiguity-rules.md
│   │   └── html-parser-rules.md
│   ├── rn/
│   │   ├── deviation-db-schema.md
│   │   ├── gotchas/                  ← 全部
│   │   ├── icon-map.md
│   │   ├── rn-guidelines.md
│   │   ├── state-schema.md
│   │   ├── style-scan-checklist.md
│   │   ├── theme-templates/
│   │   ├── token-map.json
│   │   └── xlb-style-system.md
│   ├── h5/                           ← 空目录
│   └── pc/                           ← 空目录
├── templates/
│   ├── common/
│   │   └── features.md.tpl
│   ├── rn/
│   │   ├── execution.md.tpl
│   │   ├── tech-design.md.tpl
│   │   └── ui-audit.md.tpl
│   ├── h5/                           ← 空目录
│   └── pc/                           ← 空目录
└── web-guidelines.md                 ← 暂时保留，阶段 5 删除
```

---

## Phase 2: common 共享层

> 目标：完成材料收集和功能点规格生成两个公共阶段

### Task 2.1: 创建 common/02-collect-materials.md

**Files:**
- Create: `subskills/common/02-collect-materials.md`

- [ ] **Step 1: 写入材料收集逻辑**

重构和增量走两条不同的材料收集路径：

```markdown
# Phase 02 — 材料收集

## 进入条件

- `currentPhase` 为 `collect-materials`

---

## 材料收集

根据需求类型走不同路径：

### 路径 A: 重构模式

必须收集以下材料（使用 AskUserQuestion 逐一询问）：

1. **需求文档** — 飞书链接 / 本地文件 / 口述 / 暂无
2. **被重构模块源码路径** — 必填，必须提供精确的目录路径
3. **UI 材料（设计稿 HTML / 截图）** — 有 HTML+截图 / 仅 HTML / 仅截图 / 无

铁律：重构模式下，功能点唯一权威来源是被重构的源码。UI 材料仅做参考校验。

### 路径 B: 增量模式

必须收集以下材料（使用 AskUserQuestion 逐一询问）：

1. **需求文档** — 飞书链接 / 本地文件 / 口述 / 暂无
2. **增量模块所在目录路径** — 用户提供路径；若用户不确定，根据需求文档扫描代码库定位
3. **UI 材料（设计稿 HTML / 截图）** — 有 HTML+截图 / 仅 HTML / 仅截图 / 无

### 材料写入状态

所有收集到的材料写入 `.ai-wiki/.dtc-state.json` 的 `inputs`：

- `inputs.requirementDocPath` — 需求文档路径
- `inputs.description` — 需求描述文本
- `inputs.originalCodePath` — 重构：被重构模块路径 / 增量：增量模块路径
- `inputs.htmlPath` — HTML 文件路径
- `inputs.screenshotPath` — 截图路径
- `inputs.platform` — 来自 Phase 01 的技术选型

### 用户确认门禁

材料收集完成后，输出材料清单摘要，询问是否确认进入功能点规格生成。

---

## 禁止

- 重构模式不能跳过源码路径收集
- 增量模式不能以「无路径」为由跳过现有代码扫描
```

### Task 2.2: 创建 common/03-feature-spec.md

**Files:**
- Create: `subskills/common/03-feature-spec.md`

- [ ] **Step 1: 写入功能点规格生成逻辑**

```markdown
# Phase 03 — 功能点规格生成

## 进入条件

- `currentPhase` 为 `feature-spec`

---

## 功能点生成

根据需求类型走不同分析路径：

### 重构模式

1. 读取 `inputs.originalCodePath` 指定的源码目录
2. 深入分析原代码，逐一抽取功能点：
   - 页面/组件结构、状态与数据流
   - 接口调用（请求参数、响应字段、错误处理）
   - 表单字段、校验规则、提交逻辑
   - OCR / 上传 / 动态表单 / 权限等特殊逻辑
   - 边界与异常分支
3. 再读取 UI 参考材料（HTML/截图），作为 UI 还原参考
4. 生成功能点，每个标注来源：`from-source` / `new` / `change`

### 增量模式

1. 读取 `inputs.originalCodePath` 指定的增量模块目录
2. 扫描现有代码，了解已有逻辑、数据流、API 接口
3. 结合需求文档分析新增/修改内容
4. 生成功能点，每个标注来源：`new` / `change`

### 功能点格式

```json
{
  "id": "FP-001",
  "title": "XX模块列表页",
  "type": "from-source",
  "source": "原代码 / 需求新增 / 需求变更",
  "description": "...",
  "risk": "high / medium / low"
}
```

### 输出

使用 `templates/common/features.md.tpl` 格式生成 `features.md`。

### 路由到平台流水线

功能点生成并确认后，根据 `inputs.platform` 值路由到对应平台：

| inputs.platform | 下一阶段文件               |
| --------------- | -------------------------- |
| `rn`            | `subskills/rn/01-audit.md` |
| `h5`            | `subskills/h5/01-audit.md` |
| `pc`            | `subskills/pc/01-audit.md` |
```

**注意**：platform 路由逻辑在 SKILL.md 中定义，common/03-feature-spec.md 在完成时告知上游应该 fallthrough 到哪个平台。

---

## Phase 3: H5 流水线

> 目标：基于 xlb_mobile_fsms 仓库的分析，创建完整的 H5 流水线

### Task 3.1: 创建 reference/h5/h5-guidelines.md

**Files:**
- Create: `reference/h5/h5-guidelines.md`

- [ ] **Step 1: 基于 xlb_mobile_fsms 的分析，合并 web-guidelines.md 的有用内容，写入 h5-guidelines.md**

内容应包含（完整内容基于之前的 H5 探索报告）：
- 框架：UmiJS Max v4 + TypeScript + React 18
- 组件库：`@xlb/components-mobile`（ProPageContainer, XlbNavBar, XlbFlatList, XlbProDetail, XlbForm, XlbSearchBar, XlbTabs 等）
- 样式：SCSS CSS Modules + PostCSS pxtorem（rootValue: 75, 设计稿 750px）
- 颜色：CSS 变量 `var(--xlb-*)`，禁止硬编码 hex
- 页面模式：ProPageContainer + XlbNavBar + XlbFlatList（列表） / XlbProDetail（表单）
- 状态管理：Zustand + immer（每模块独立 store）
- 路由：集中式 routes.ts 配置
- 导航：useXlbRouter hook（替代 history.push）
- 权限：useHasAuth(['模块', '动作'])
- API：request() 来自 umi，响应 `{ code: 0, data, message }`
- 原生桥接：NativeBridge.postMessage()
- 文件组织：每个功能一个目录（index.tsx + index.scss + store.ts + server.ts + config.tsx）
- 从 web-guidelines.md 合并的内容：CSS Module 写法、px 单位规则、flexbox 默认值、属性名转换规则

### Task 3.2: 创建 subskills/h5/01-audit.md

**Files:**
- Create: `subskills/h5/01-audit.md`

- [ ] **Step 1: 基于 RN audit 的模板结构，改写为 H5 专属版本**

核心差异：
- 不需要 HTML 解析引擎（但如果 HTML 存在也可以使用 reference/common/html-parser-rules.md）
- 组件映射到 @xlb/components-mobile 而非 @xlb/components-react-native
- token 映射使用 CSS 变量 `var(--xlb-*)` 而非 `theme['xxx']`
- 三要素表样式值对应 CSS 属性而非 RN StyleSheet 属性

### Task 3.3: 创建 subskills/h5/02-design.md

**Files:**
- Create: `subskills/h5/02-design.md`

- [ ] **Step 1: H5 技术设计**

核心差异：
- 路由：集中式 routes.ts
- 导航：useXlbRouter
- 状态：Zustand + immer store
- 样式 token：var(--xlb-*) CSS 变量
- 组件选择：@xlb/components-mobile

### Task 3.4: 创建 subskills/h5/03-build.md

**Files:**
- Create: `subskills/h5/03-build.md`

- [ ] **Step 1: H5 代码生成**

核心差异：
- 代码生成脚手架：XlbNavBar + ProPageContainer + XlbFlatList / XlbProDetail
- 样式单位：px → PostCSS 自动转 rem（rootValue: 75）
- 表单模式：XlbProDetail 声明式 formList
- 无需 SafeInput/SafeUploadFile（RN 专属问题）
- 无需模式对齐表（RN 专属 H5→RN 重构问题）

### Task 3.5: 创建 subskills/h5/04-verify.md

**Files:**
- Create: `subskills/h5/04-verify.md`

- [ ] **Step 1: H5 验证**

核心检查项：
- 页面结构完整（XlbNavBar + ProPageContainer）
- 数据流正确（useXlbRouter 导航）
- 样式合规（CSS 变量、px→rem）
- 权限检查（useHasAuth）
- 原生桥接合规（NativeBridge 调用）

### Task 3.6: 创建 H5 模板文件

**Files:**
- Create: `templates/h5/ui-audit.md.tpl`
- Create: `templates/h5/tech-design.md.tpl`
- Create: `templates/h5/execution.md.tpl`

- [ ] **Step 1: 从 templates/rn/ 复制并改写**

```bash
cd /Users/wangjinbao/wanchen-code/custom-skills/design-to-code-max
cp templates/rn/ui-audit.md.tpl templates/h5/
cp templates/rn/tech-design.md.tpl templates/h5/
cp templates/rn/execution.md.tpl templates/h5/
```
然后修改模板中的 RN 专属引用为 H5 的组件和路径。

---

## Phase 4: PC 流水线

> 目标：基于 fsms_web 仓库的分析，创建完整的 PC 流水线

### Task 4.1: 创建 reference/pc/pc-guidelines.md

**Files:**
- Create: `reference/pc/pc-guidelines.md`

- [ ] **Step 1: 基于 fsms_web 的分析，合并 web-guidelines.md 的有用内容，写入 pc-guidelines.md**

内容应包含（完整内容基于之前的 PC 探索报告）：
- 框架：UmiJS Max v4 + TypeScript
- 组件库：`@xlb/components`（封装 Ant Design 5）— XlbPageContainer, XlbProPageContainer, XlbBasicForm, XlbForm, XlbTable, XlbButton, XlbModal 等
- 样式：Less CSS Modules + Tailwind（preflight: false）
- 颜色：Less 变量（`@color_link`, `@color_danger` 等）+ Ant Design 主题
- 页面模式 A：XlbPageContainer（SearchForm + ToolBtn + Table + ProPageModal）
- 页面模式 B：XlbProPageContainer（集成 CRUD）
- 页面模式 C：看板（自定义布局）
- 表单：XlbForm（formList 声明式）或 XlbBasicForm（命令式 Item + CSS Grid）
- 表格：XlbTable + XlbTableColumnProps
- 状态：Zustand + immer，局部 state
- 路由：集中式 routeList + KeepAlive
- 导航：useNavigation() from @xlb/max / useIRouter()
- 权限：hasAuth(['模块', '操作'])
- API：XlbFetch.post(url, data) → 检查 `res?.code === 0`
- 模态框：NiceModal + fsmsModal / ProPageModal
- 服务文件：server.ts（默认导出对象）/ service.tsx（命名导出）

### Task 4.2: 创建 reference/pc/component-mapping.md

**Files:**
- Create: `reference/pc/component-mapping.md`

- [ ] **Step 1: 设计稿 → PC 组件映射表**

对照表：
| 设计稿元素 | PC 组件 | 使用场景 |
|-----------|---------|---------|
| 列表页 | XlbPageContainer → SearchForm + ToolBtn + Table + ProPageModal | 标准列表 |
| CRUD 页 | XlbProPageContainer | 搜索+表格+详情+增删改 |
| 详情表单 | XlbBasicForm + XlbBasicForm.Item + CSS Grid | 模态框/详情 |
| 搜索表单 | XlbForm + formList[SearchFormType] | 搜索区域 |
| 操作按钮 | XlbButton.Group (type="primary") | 工具栏 |
| 下拉操作 | XlbDropdownButton | 导出等 |
| 确认弹窗 | XlbTipsModal / fsmsModal | 操作确认 |
| 表格列 | XlbTableColumnProps (name/code/width/render/features) | 表格 |
| 状态标签 | StatusColorByOptions | 状态列 |
| 模态框 | ProPageModal → XlbProPageModal | 新增/编辑 |

### Task 4.3: 创建 reference/pc/project-conventions.md

**Files:**
- Create: `reference/pc/project-conventions.md`

- [ ] **Step 1: 项目约定文档**

内容：
- 页面文件结构约定（index.tsx / data.tsx / server.ts / item.tsx / index.less）
- 页面模式选择指南（什么时候用 XlbPageContainer vs XlbProPageContainer）
- 搜索表单配置模式（SearchFormType 字段定义）
- 服务文件模式（server.ts 默认导出）
- 路由注册方式（routeList + wrappers）
- 权限 hooks 使用
- 模态框与保存刷新模式

### Task 4.4: 创建 subskills/pc/01-audit.md

**Files:**
- Create: `subskills/pc/01-audit.md`

- [ ] **Step 1: PC UI 审计**

核心逻辑（基于 RN audit 改编）：
- 收集 UI 材料（HTML/截图）
- 运行 HTML 结构化解析引擎（如果 HTML 存在）
- 截图逐张读取
- 组件映射：设计稿元素 → @xlb/components 组件
- 页面模式识别：模式 A/B/C
- 三要素表（与 RN 类似，但样式属性为 CSS 属性而非 RN StyleSheet）
- 组件选择决策表

### Task 4.5: 创建 subskills/pc/02-design.md

**Files:**
- Create: `subskills/pc/02-design.md`

- [ ] **Step 1: PC 技术设计**

核心逻辑（基于 RN design 改编）：
- 组件架构设计
- 数据流设计（Zustand store + XlbFetch API）
- 路由设计（routeList 注册）
- 页面模式选择（A/B/C）
- 表单布局设计（CSS Grid 3 列）
- 组件选择决策表
- 动态表单项安全检查（PC 无需 SafeInput，但需注意 Ant Design 的 Form.List 用法）

### Task 4.6: 创建 subskills/pc/03-build.md

**Files:**
- Create: `subskills/pc/03-build.md`

- [ ] **Step 1: PC 代码生成**

核心脚手架：
- 模式 A 脚手架：XlbPageContainer + SearchForm + ToolBtn + Table + ProPageModal
- 模式 B 脚手架：XlbProPageContainer CRUD 全配置
- 模式 C 脚手架：自定义布局 + 子组件分区
- item.tsx 模式：XlbBasicForm + CSS Grid
- API 调用：XlbFetch.post() + res?.code === 0
- 模态框：fsmsModal / ProPageModal 模式

### Task 4.7: 创建 subskills/pc/04-verify.md

**Files:**
- Create: `subskills/pc/04-verify.md`

- [ ] **Step 1: PC 验证**

核心检查项：
- 页面模式正确（XlbPageContainer / XlbProPageContainer / 自定义）
- 组件映射正确（XlbBasicForm.Item / XlbForm formList）
- 数据流正确（XlbFetch + code===0）
- 权限覆盖（hasAuth()）
- 列定义完整（name/code/width/render/features）
- 路由注册（routeList 已添加）

### Task 4.8: 创建 PC 模板文件

**Files:**
- Create: `templates/pc/ui-audit.md.tpl`
- Create: `templates/pc/tech-design.md.tpl`
- Create: `templates/pc/execution.md.tpl`

- [ ] **Step 1: 从 templates/rn/ 复制并改写为 PC 版本**

```bash
cd /Users/wangjinbao/wanchen-code/custom-skills/design-to-code-max
cp templates/rn/ui-audit.md.tpl templates/pc/
cp templates/rn/tech-design.md.tpl templates/pc/
cp templates/rn/execution.md.tpl templates/pc/
```
然后修改模板中的 RN 专属引用（XlbForm.Item、theme['xxx']、SPACE.* 等）为 PC 的（XlbBasicForm.Item、Less 变量、CSS Grid 等）。

---

## Phase 5: 收尾

> 目标：清理旧文件、验证渐进式披露、联动测试

### Task 5.1: 删除 web-guidelines.md

- [ ] **Step 1: 确认内容已合并**

在 Phase 3 和 Phase 4 中，`web-guidelines.md` 中有用的内容已被合并到 `reference/h5/h5-guidelines.md` 和 `reference/pc/pc-guidelines.md`。验证：
```bash
cd /Users/wangjinbao/wanchen-code/custom-skills/design-to-code-max
# 检查 web-guidelines.md 中每个有用段落是否已在目标文件中
grep -c "CSS Module" reference/h5/h5-guidelines.md reference/pc/pc-guidelines.md
# 应输出 > 0
```

- [ ] **Step 2: 删除 web-guidelines.md**

```bash
rm reference/web-guidelines.md
```

### Task 5.2: 验证渐进式披露

- [ ] **Step 1: 确认 RN 流水线不引用 PC/H5 的 reference**

```bash
cd /Users/wangjinbao/wanchen-code/custom-skills/design-to-code-max
# 检查 RN 子技能中没有引用 h5 或 pc 路径
grep -rn 'reference/h5\|reference/pc' subskills/rn/
# 应无输出
```

- [ ] **Step 2: 确认 reference/common/ 中的文件确实通用**

```bash
cd /Users/wangjinbao/wanchen-code/custom-skills/design-to-code-max
ls reference/common/
# 应包含 ambiguity-rules.md 和 html-parser-rules.md
```

### Task 5.3: 清理旧文件

- [ ] **Step 1: 删除备份文件**

```bash
cd /Users/wangjinbao/wanchen-code/custom-skills/design-to-code-max
rm subskills/01-analyze.md.bak
```

Verify: `ls subskills/` 应只包含 `common/ rn/ h5/ pc/`

### Task 5.4: 联动测试

- [ ] **Step 1: 模拟 RN 重构流程**

人工模拟入口流程：
1. SKILL.md 被加载
2. fallthrough 到 common/01-analyze.md → Q1: RN → Q2: 重构
3. common/02-collect-materials → 收集源码路径 + 需求文档 + UI 材料
4. common/03-feature-spec → 生成功能点
5. 路由到 rn/01-audit.md
6. rn/02-design.md → rn/03-build.md → rn/04-verify.md

检查点：所有路径引用正确，技能能完整走到 verify。

- [ ] **Step 2: 模拟 H5 增量流程**

人工模拟：
1. Q1: H5 → Q2: 增量
2. 材料收集：需求文档 + 增量模块路径 + UI 材料
3. 路由到 h5/01-audit.md
4. h5/02-design.md → h5/03-build.md → h5/04-verify.md

检查点：H5 子技能存在且可读，无 RN 专属引用。

- [ ] **Step 3: 模拟 PC 增量流程**

人工模拟：
1. Q1: PC → Q2: 增量
2. 材料收集
3. 路由到 pc/01-audit.md
4. pc/02-design.md → pc/03-build.md → pc/04-verify.md

检查点：PC 子技能存在且可读，组件映射符合 fsms_web 模式。

---

## 任务总览

| Phase | 任务 | 文件数 | 预计耗时 |
|-------|------|--------|----------|
| 1 | 目录创建 + RN 资产搬迁 + 路径更新 | ~20 个文件 | 中等 |
| 2 | common 共享层（3 个子技能） | 3 个文件 | 中等 |
| 3 | H5 流水线（guidelines + 4 subskills + 3 templates） | 8 个文件 | 大 |
| 4 | PC 流水线（3 refs + 4 subskills + 3 templates） | 10 个文件 | 大 |
| 5 | 清理 + 验证 | 3 个文件删除 | 小 |
