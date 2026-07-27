# Phase 07 - 分组执行与代码生成（PC）

## 进入条件

- 已 `Read .ai-wiki/.dtc-state.json`。
- **standard / full / quick**：`phaseOutputs.design.checklistPassed === true` 且 `phaseOutputs.design.userConfirmed === true`。
- **micro**：`inputs.mode === "micro"` 且 `phaseOutputs.feature-spec.checklistPassed === true` 且 `phaseOutputs.feature-spec.userConfirmed === true`（跳过了 api-spec、audit、design 阶段）。
- `currentPhase` 为 `build`。
- `inputs.platform === "pc"`。

---

## 任务

> **先读** `../../subskills/common/03-build-shared.md` — 本文件仅包含 PC 平台特有内容，共享步骤见该文件对应节号。
>
> 上下文预算：本阶段读写遵循 `../../reference/common/context-budget.md`——每个分组只读 execution.md 当前分组 + 该分组涉及的 parsed-styles JSON，不整篇回读 ui-audit.md / tech-design.md；execution.md 已完成分组压缩为一行摘要。

### 1. 生成执行文档

从 `tech-design.md` 拆解为分步执行步骤，使用 `../../templates/pc/execution.md.tpl` 格式生成 `execution.md`。

- 按功能模块或页面拆分为分组（每组 3-8 个步骤）
- 每步标注关联功能点 ID、UI 参考文件、预计耗时
- 将 `docPaths.execution` 设置为生成的 execution.md 路径
- 更新 `.ai-wiki/.dtc-state.json` 的当前需求条目的 `build.totalGroups`

### 2. 读取规范

**先读 `../../reference/pc/pc-guidelines.md`**，确认组件、路由、状态、权限等约束。
**再读 `../../reference/pc/project-conventions.md`**，确认页面文件结构、service 模式等约定。

### 3. 按分组执行

> **quick / micro 模式适配**：当 `inputs.mode === "quick"` 或 `inputs.mode === "micro"` 时，以下步骤有差异：
> - Step 2：API 规格从 `features.md` §接口清单 + §接口补充 消费（无独立 api-spec.md）
> - Step 4：字段来源对照 features.md §接口补充的「关键响应字段」列（无字段综合映射表）
> - Step 5.5 检查 4（字段完整性）：验证代码使用了接口补充中列出的关键响应字段即可
> - 上下文管理：不加载 api-spec.md

按顺序逐一执行每个分组。**每个分组完成后，必须执行以下步骤，缺一不可：**

#### Step 1: 读设计文档

读取 `tech-design.md` 对应部分，特别关注「组件选择决策表」和「UI 样式规格」。

#### Step 2: 读 parsed-styles + 交叉验证 HTML + 读取 API 规格

1. 读取 `parsed-styles/*.json` 中当前分组涉及的页面样式数据
2. 读取 `ui-audit.md` 中对应的三要素表进行确认（quick / micro 模式跳过此步（micro 跳过了整个 audit 阶段），直接消费 parsed-styles JSON）
3. **读取 API 规格**（按 mode 选择来源，详见「quick 模式适配」）：

   **standard / full 模式** — 读取 `api-spec.md` 中对应接口的请求参数表和响应字段表。

   **quick 模式** — 读取 `features.md` §接口清单 + §接口补充；无独立 api-spec.md。

4. 仅当以下场景回退到读原始 HTML：
   - parsed JSON 中缺少当前元素的数据
   - 需要确认非样式属性（`placeholder`、`maxlength`、`onClick` 等）
5. **记录日志**：在 `execution.md` 对应步骤后记录 `解析数据已读: parsed-styles/xxx.json`
   - standard / full：记录 `API 规格已读: api-spec.md §2.x（接口名）`
   - quick：记录 `API 规格已读: features.md §接口清单（quick 模式）`

#### Step 3: 读项目代码风格 + 识别生存必备模式

读取目标目录现有文件，匹配已有模式。

**生存必备模式清单（每项必须与参照页逐行对照）：**

| 维度         | 说明                                               | 参照页文件名 |
| ------------ | -------------------------------------------------- | ------------ |
| 页面容器结构 | XlbPageContainer vs XlbProPageContainer 的使用差异 | —            |
| 搜索表单定义 | SearchFormType 配置模式（type/options 字段命名）   | —            |
| API 响应取值 | `res?.code === 0` 后的数据路径                     | —            |
| Item props   | data/onRefresh/onClose 命名和类型                  | —            |
| 权限控制     | hasAuth 的调用方式和参数格式                       | —            |
| 列定义       | XlbTableColumnProps 的 name/code/render 使用       | —            |
| 导航方式     | useIRouter / useNavigation / history 的选择        | —            |

**参照页选择规则**：

- 增量需求 → 选本页面同目录下的兄弟文件
- 重构需求 → 必选项目中已有的同类型 PC 页面
- 没有同类型页面 → 选任意已有 PC 页面作参照

参照页选定后必须写入 `execution.md` 的分组日志中。

#### Step 4: 生成/修改代码

> **先读** `../../reference/pc/pc-code-patterns.md` — 该文件包含 PC 平台所有代码脚手架模板（Mode A/B/C、Item.tsx、API 调用、Modal、Column 定义、字段来源约束）。
> 以下只列出 PC Build 选择哪个模式的指引，具体代码模板见该文件。

**模式选择**（参考 `pc-code-patterns.md`）：

- **标准列表页**（搜索+表格+弹窗）→ Mode A：`XlbPageContainer` + `XlbForm` + `XlbTable` + `ProPageModal`
- **集成 CRUD**（XlbProPageContainer 封装）→ Mode B：`XlbProPageContainer` + `SearchFormType` + `XlbTableColumnProps`
- **自定义布局**→ Mode C：自定义 `div` + CSS Grid 布局
- **新增/编辑弹窗表单**→ Item.tsx：`XlbBasicForm` + CSS Grid
- **API 封装**→ server.ts：`XlbFetch.post` + `res?.code === 0`
- **Modal**→ fsmsModal / NiceModal 模式
- **Column 定义**→ `XlbTableColumnProps` + `features`

**通用约束**：
- 所有组件来自 `@xlb/components`，禁止 Ant Design 原生组件
- 每个操作按钮必须有 `hasAuth` 包裹
- 新页面路由必须在 `routeList` 中注册

#### Step 5: 编译验证（PC）

由于 PC 项目在云端构建，本地无完整编译环境，执行以下检查：

1. **语法检查**：Check JSX 语法、TypeScript 类型定义正确
2. **props 校验**：检查使用的 `@xlb/components` 组件 props 是否正确（名称、类型、必填项）
3. **import 完整性**：检查所有 import 的来源正确（`@xlb/components`、`@xlb/max` 等）
4. **权限覆盖**：检查每个操作按钮是否有 `hasAuth` 包裹
5. **路由注册**：检查路由是否在 `routeList` 中注册

#### Step 5.5: 分组门禁（硬阻塞 — 不通过禁止进入 Step 6）

> ❗️ **铁律**：每个分组校验通过后，必须执行以下自动检查 + 人工审查。**全部通过 + 用户确认后，才允许进入 Step 6 和下一分组。** 任一项不通过 → 立即修复后重跑门禁。

**5.5.1 自动检查（4 项，全部必须 PASS）**

**检查 1 — 语法/props/import 检查**：JSX 语法、TypeScript 类型、组件 props（来自 @xlb/components）、import 来源正确。有错误 → **FAIL**，修复后重跑。

**检查 2 — 权限覆盖**：每个操作按钮是否有 `hasAuth` 包裹。缺失 → **FAIL**，补全后重跑。

**检查 3 — 设计偏差闭合（扩展 8 属性）**：

1. 复用 Step 2 已加载的 parsed-styles 数据（不重新读取），对照 ui-audit.md 三要素表
2. **逐属性检查 8 项必查属性**：
   - `layout.height` → 代码高度是否符合
   - `layout.padding` → 内边距是否符合
   - `layout.flexDirection` → 布局方向是否符合
   - `typography.fontSize` → 字号是否符合
   - `typography.color` → 颜色值是否符合（使用 Less 变量）
   - `typography.fontWeight` → 字重是否符合
   - `spacingStyle.backgroundColor` → 背景色是否符合
   - `spacingStyle.borderRadius` → 圆角是否符合
3. 输出「设计偏差记录表」到 execution.md：

```markdown
#### 设计偏差记录 — 分组 N

| #   | 元素   | 属性        | 预期(设计值) | 实际(代码) | 偏差类型 | 严重度 | 处理方案 |
| --- | ------ | ----------- | ------------ | ---------- | -------- | ------ | -------- |
| 1   | 表格行 | height      | 48px         | 44px       | layout   | major  | 立即修复 |
```

偏差类型枚举：`layout | typography | spacing | icon | color | missing`
严重度枚举：`critical`（功能缺失）/ `major`（视觉明显不符）/ `minor`（细微偏差）

**严重度处理规则（硬约束）**：
- `critical` + `major` → **必须立即修复**，禁止标记 defer
- `minor` → 可标记 `不可修复-原因`，需在 execution.md 详细说明原因
- 门禁判定：存在未修复的 critical 或 major → **FAIL**，修复后重跑检查 3

4. **同步偏差库**：将新偏差追加到 `.ai-wiki/design-deviation-db.json`

**检查 4 — 字段完整性**：
1. 对照 api-spec.md §3 字段综合映射表中属于本分组页面的字段
2. 正反双向验证：映射表中本分组的每个 ✅ 字段 → 代码中必须有；代码中每个渲染字段 → 映射表中必须有一行
3. 有缺失/多余 → **FAIL**，补全/删除后重跑

> 以下 5.5.2-5.5.4 见 `../../subskills/common/03-build-shared.md` §Step 5.5.2-5.5.4。
> Step 6-8 见 `../../subskills/common/03-build-shared.md` §Step 6-8。

---

### 4. 分层验证一览

| 层级            | 时机             | 范围                                   | 结果              |
| --------------- | ---------------- | -------------------------------------- | ----------------- |
| **分组门禁**    | build Step 5.5   | 4 项自动检查 + 人工审查，硬阻塞        | 通过/重跑         |
| **出口门禁**    | build 全部完成后 | 跨分组全局检查（4 项）                 | 通过/禁止         |
| **verify 终检** | verify 阶段      | 全部分组 + 完整验证                    | 交付/返回修复     |

---

> 上下文管理见 `../../subskills/common/03-build-shared.md` §上下文管理。
## 出口门禁（必须全部通过才能进入 verify 阶段）

> 分组门禁已保障每个分组的代码质量。出口门禁聚焦于**跨分组的全局一致性**。

在所有分组执行完毕后，**强制执行以下 4 项全局校验**：

1. **分组门禁完整性**：读取 `.dtc-state.json` 中 `build.groupGates`，确认所有分组的 `passed === true` 且 `userApproved === true` — 有遗漏则**禁止进入 verify 阶段**
2. **功能点全覆盖**：读取 `features.md`，检查是否仍有未完成功能点 — 有则列出，**禁止进入 verify 阶段**
3. **跨分组一致性**：同一接口取值路径在不同分组是否一致；不一致则修正后重校
4. **defer 项兜底消费**：扫描所有分组门禁报告中标记为 defer 的 minor 项，确保未遗漏

**全部通过后**：

- 汇报：「全部 N 个分组已执行（全部通过分组门禁），M 个功能点已完成，跨分组一致性通过」
- 更新 `.ai-wiki/.dtc-state.json`：`build.exitGatePassed = true`, `build.checklistPassed = true`
- 推进 `currentPhase` 到 `verify`

---

> 中断恢复见 `../../subskills/common/03-build-shared.md` §中断恢复。

---

## 禁止

> 共享禁止项见 `../../subskills/common/03-build-shared.md` §禁止（共享项）。以下为 PC 平台特有禁止项：

- 未完成所有步骤就汇报分组完成
- 用硬编码 hex 色值（使用 Less 变量）
- 使用 Ant Design 原生组件而非 `@xlb/components` 封装
- 跳过 `hasAuth` 权限控制
- 未在 `routeList` 中注册路由就生成页面

