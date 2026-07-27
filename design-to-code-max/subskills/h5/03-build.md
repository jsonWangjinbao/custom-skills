# Phase 07 - 分组执行与代码生成（H5）

## 进入条件

- 已 `Read .ai-wiki/.dtc-state.json`。
- **standard / full / quick**：`phaseOutputs.design.checklistPassed === true` 且 `phaseOutputs.design.userConfirmed === true`。
- **micro**：`inputs.mode === "micro"` 且 `phaseOutputs.feature-spec.checklistPassed === true` 且 `phaseOutputs.feature-spec.userConfirmed === true`（跳过了 api-spec、audit、design 阶段）。
- `currentPhase` 为 `build`。

---

## 任务

> **先读** `../../subskills/common/03-build-shared.md` — 本文件仅包含 H5 平台特有内容，共享步骤见该文件对应节号。
>
> 上下文预算：本阶段读写遵循 `../../reference/common/context-budget.md`——每个分组只读 execution.md 当前分组 + 该分组涉及的 parsed-styles JSON，不整篇回读 ui-audit.md / tech-design.md；execution.md 已完成分组压缩为一行摘要。

### 1. 生成执行文档

从 `tech-design.md` 拆解为分步执行步骤，使用 `../../templates/h5/execution.md.tpl` 格式生成 `execution.md`。

- 按功能模块或页面拆分为分组（每组 3-8 个步骤）
- 每步标注关联功能点 ID、UI 参考文件、预计耗时
- 将 `docPaths.execution` 设置为生成的 execution.md 路径
- 更新 `.ai-wiki/.dtc-state.json` 的当前需求条目的 `build.totalGroups`

### 2. 读取规范

**先读 `../../reference/h5/h5-guidelines.md`**，确认 H5 组件、CSS 变量、路由、样式等约束。

### 3. 按分组执行（核心：8 步闭环）

H5 代码生成不需要 RN 的 Step 3.5 模式对齐确认表（那是 H5→RN 重构的 RN 特有步骤），也不需要 SafeInput/SafeUploadFile/Dependencies 检查（那是 RN 框架问题）。其余步骤结构与 RN 一致。

> **quick / micro 模式适配**：当 `inputs.mode === "quick"` 或 `inputs.mode === "micro"` 时，以下步骤有差异：
> - Step 2：API 规格从 `features.md` §接口清单 + §接口补充 消费（无独立 api-spec.md）
> - Step 4：字段来源对照 features.md §接口补充的「关键响应字段」列（无字段综合映射表）
> - Step 5.5 检查 5（字段完整性）：验证代码使用了接口补充中列出的关键响应字段即可
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
   - parsed JSON 中缺少当前元素的数据（该元素在 JSON 中不存在或关键属性为空）
   - 需要确认非样式属性（`placeholder`、`maxlength`、事件绑定等）
   - 模型对 parsed 数据的准确性有疑虑
5. **记录日志**：在 `execution.md` 对应步骤后记录 `解析数据已读: parsed-styles/xxx.json`
   - 如果回退读了原始 HTML，在日志中追加 `HTML 交叉验证: 文件路径`
   - standard / full：记录 `API 规格已读: api-spec.md §2.x（接口名）`
   - quick：记录 `API 规格已读: features.md §接口清单（quick 模式）`

#### Step 3: 读项目代码风格

读取目标目录现有文件，匹配已有 H5 页面模式。确认以下清单：

| 维度         | 说明                                           |
| ------------ | ---------------------------------------------- |
| 页面容器结构 | ProPageContainer 的 navBar prop 用法           |
| 导航跳转     | useXlbRouter 的 push/goBack/replace 用法       |
| 表单模式     | XlbProDetail formList 配置模式                 |
| 路由参数     | useXlbRouter query 取值方式                    |
| API 调用     | request() 调用方式和响应处理（res.code === 0） |
| Toast 调用   | Toast.show() 的 import 和调用方式              |
| 状态管理     | Zustand store 的创建和使用模式                 |

#### Step 4: 生成/修改代码

> **先读** `../../reference/h5/h5-code-patterns.md` — 该文件包含 H5 平台所有代码脚手架模板（文件结构、formList 配置、XlbFlatList、API 调用、样式生成、表单提交）。
> 以下为 H5 Build 特有约束，代码模板直接引用该文件。

按以下约束生成代码：

- **页面脚手架**：每个页面使用 `ProPageContainer` + `XlbNavBar` 包装
- **列表页**：使用 `XlbFlatList` + `XlbSearchBar` 实现无限滚动列表
- **表单页**：使用 `XlbProDetail` + `formList` 声明式配置
- **导航**：使用 `useXlbRouter` hook，禁止 `history.push`
- **文件结构**：参考 `h5-code-patterns.md` §文件结构（5 标准文件）
- **formList 配置**：参考 `h5-code-patterns.md` §formList 配置模式
- **数据获取**：参考 `h5-code-patterns.md` §XlbFlatList 配置模式 和 §API 调用模式
- **样式**：参考 `h5-code-patterns.md` §样式生成规则，SCSS CSS Module + `var(--xlb-*)` CSS 变量
- **表单提交**：参考 `h5-code-patterns.md` §表单提交流程
- **API 调用**：`request()` from `umi`，检查 `res.code === 0`
- **字段来源约束**：standard/full 模式对照 `api-spec.md` §3；quick/micro 对照 `features.md` §接口补充
- **状态管理**：使用 Zustand + immer

##### 必须添加注释的场景

Step 4 生成代码时，以下场景**必须**加行内注释：

- 与 RN WebView 通信相关的 `NativeBridge.postMessage()` 调用
- 绕过组件库 bug 的 workaround
- 权限控制相关的 `useHasAuth` 逻辑（标注权限点）

##### 设计偏差记录

当实现方案与设计稿/UI 审计存在偏差时，必须在 execution.md 对应分组中记录：

- **偏差项**：具体哪个 UI 元素或交互与设计稿不同
- **偏差原因**：为何无法按设计稿实现
- **决策依据**：选择当前方案的理由

#### Step 5: 编译 + 渲染抽检

1. **编译验证**：运行 `tsc --noEmit` 或 `npm run build -- --analyze`，修复所有编译错误后再继续
2. **样式合规速查**：检查本分组新增/修改的 `.scss` 文件中是否存在硬编码 hex 或 magic number（无 `var(--xlb-*)` 包裹的值），发现则修复
3. **导航合规速查**：检查本分组新增/修改的 `.tsx` 文件中是否存在 `history.push` / `history.replace`，发现则替换为 `useXlbRouter`

#### Step 5.5: 分组门禁（硬阻塞 — 不通过禁止进入 Step 6）

> ❗️ **铁律**：每个分组编译/校验通过后，必须执行以下自动检查 + 人工审查。**全部通过 + 用户确认后，才允许进入 Step 6 和下一分组。** 任一项不通过 → 立即修复后重跑门禁。

**5.5.1 自动检查（全部必须 PASS）**

**检查 1 — 编译通过**：`tsc --noEmit`，本分组涉及文件零错误。

**检查 2 — 样式合规速查**：检查本分组新增/修改的 `.scss` 文件中是否存在硬编码 hex 或 magic number（无 `var(--xlb-*)` 包裹的值）。存在 → **FAIL**，修复后重跑。

**检查 3 — 导航合规速查**：检查本分组新增/修改的 `.tsx` 文件中是否存在 `history.push` / `history.replace`。存在 → **FAIL**，替换为 `useXlbRouter` 后重跑。

**检查 4 — 设计偏差闭合（扩展 8 属性）**：

1. 复用 Step 2 已加载的 `parsed-styles/*.json`（不重新读取），对照 `ui-audit.md` 三要素表
2. **逐属性检查 8 项**：layout.height / layout.padding / layout.flexDirection / typography.fontSize / typography.color / typography.fontWeight / spacingStyle.backgroundColor / spacingStyle.borderRadius
3. 输出「设计偏差记录表」到 `execution.md`
4. **严重度处理（硬约束）**：`critical` + `major` → **必须立即修复**，禁止 defer；`minor` → 可标记不可修复+原因
5. 存在未修复 critical/major → **FAIL**，修复后重跑
6. **同步偏差库**

**检查 5 — 字段完整性**：standard/full 模式——对照 `api-spec.md` §3 字段综合映射表正反双向验证。quick 模式——对照 `features.md` §接口补充「关键响应字段」确认代码已使用。有缺失/多余 → **FAIL**，补全/删除后重跑

> 以下 5.5.2-5.5.4 见 `../../subskills/common/03-build-shared.md` §Step 5.5.2-5.5.4。
> Step 6-8 见 `../../subskills/common/03-build-shared.md` §Step 6-8。

---

### 4. 分层验证一览

| 层级            | 时机             | 范围                                   | 结果              |
| --------------- | ---------------- | -------------------------------------- | ----------------- |
| **分组门禁**    | build Step 5.5   | 自动检查 + 人工审查，硬阻塞            | 通过/重跑         |
| **出口门禁**    | build 全部完成后 | 跨分组全局检查                         | 通过/禁止         |
| **verify 终检** | verify 阶段      | 全部分组 + 完整验证                    | 交付/返回修复     |

---

> 上下文管理见 `../../subskills/common/03-build-shared.md` §上下文管理。
## 出口门禁（必须全部通过才能进入 verify 阶段）

> 分组门禁已保障每个分组的代码质量。出口门禁聚焦于**跨分组的全局一致性**。

在所有分组执行完毕后，**强制执行以下 4 项全局校验**：

1. **分组门禁完整性**：读取 `.dtc-state.json` 中 `build.groupGates`，确认所有分组的 `passed === true` 且 `userApproved === true` — 有遗漏则**禁止进入 verify 阶段**
2. **功能点全覆盖**：读取 `features.md`，检查是否仍有未完成功能点 — 有则列出，**禁止进入 verify 阶段**
3. **跨分组一致性**：同一组件选择决策在不同分组是否一致；不一致则修正后重校
4. **defer 项兜底消费**：扫描所有分组门禁报告中标记为 defer 的 minor 项，确保未遗漏

**全部通过后**：

- 汇报：「全部 N 个分组已执行（全部通过分组门禁），M 个功能点已完成，跨分组一致性通过」
- 更新 `.ai-wiki/.dtc-state.json`：`build.exitGatePassed = true`, `build.checklistPassed = true`
- 推进 `currentPhase` 到 `verify`

**任一项不通过** → 修正后重新校验

---

> 中断恢复见 `../../subskills/common/03-build-shared.md` §中断恢复。

---

## 禁止

> 共享禁止项见 `../../subskills/common/03-build-shared.md` §禁止（共享项）。以下为 H5 平台特有禁止项：

- 未完成所有步骤就汇报分组完成或跳到下一分组
- 使用 `history.push` 或裸字符串路径导航（必须用 `useXlbRouter`）
- 在 SCSS 中写硬编码 hex 色值或 magic number（必须用 `var(--xlb-*)`）
- 省略 API 响应字段
- **H5 项目不需要 SafeInput/SafeUploadFile/SafeComponents.tsx（那是 RN 特有的）**
- **H5 项目不需要 Step 3.5 模式对齐确认表（那是 H5→RN 重构的 RN 特有步骤）**
- H5 不需要 dependencies 禁用检查（XlbProDetail 内部处理，不存在该问题）
