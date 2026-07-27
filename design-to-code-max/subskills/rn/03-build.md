# Phase 07 - 分组执行与代码生成（RN）

## 进入条件

- 已 `Read .ai-wiki/.dtc-state.json`。
- **standard / full / quick**：`phaseOutputs.design.checklistPassed === true` 且 `phaseOutputs.design.userConfirmed === true`。
- **micro**：`inputs.mode === "micro"` 且 `phaseOutputs.feature-spec.checklistPassed === true` 且 `phaseOutputs.feature-spec.userConfirmed === true`（跳过了 api-spec、audit、design 阶段）。
- `currentPhase` 为 `build`。

---

## 任务

> **先读** `../../subskills/common/03-build-shared.md` — 本文件仅包含 RN 平台特有内容，共享步骤（Step 5.5.2-5.5.4 门禁报告/人工审查/状态更新、Step 6-8 更新文档、分层验证、上下文管理、中断恢复、共享禁止项）参见该文件对应节号。
>
> 上下文预算：本阶段读写遵循 `../../reference/common/context-budget.md`——每个分组只读 execution.md 当前分组 + 该分组涉及的 parsed-styles JSON，不整篇回读 ui-audit.md / tech-design.md；execution.md 已完成分组压缩为一行摘要。

### 1. 生成执行文档

从 `tech-design.md` 拆解为分步执行步骤，使用 `../../templates/rn/execution.md.tpl` 格式生成 `execution.md`。

- 按功能模块或页面拆分为分组（每组 3-8 个步骤）
- 每步标注关联功能点 ID、UI 参考文件、预计耗时
- 将 `docPaths.execution` 设置为生成的 execution.md 路径
- 更新 `.ai-wiki/.dtc-state.json` 的当前需求条目的 `build.totalGroups`

### 2. 读取规范

**先读 `../../reference/rn/rn-guidelines.md`**，确认 RN 组件、主题、路由、表单安全等约束。

### 3. 按分组执行（核心：8 步闭环 + Step 3.5 / Step 5.5）

> **quick / micro 模式适配**：当 `inputs.mode === "quick"` 或 `inputs.mode === "micro"` 时，以下步骤有差异：
> - Step 2：API 规格从 `features.md` §接口清单 + §接口补充 消费（无独立 api-spec.md）
> - Step 4：字段来源对照 features.md §接口补充的「关键响应字段」列（无字段综合映射表），不执行零遗漏双向验证
> - Step 5.5 检查 5（字段完整性）：验证代码使用了接口补充中列出的关键响应字段即可，不强求双向全覆盖
> - 上下文管理：不加载 api-spec.md

按顺序逐一执行每个分组。**每个分组完成后，必须执行以下步骤，缺一不可：**

#### Step 1: 读设计文档

读取 `tech-design.md` 对应部分，特别关注「组件选择决策表」和「UI 样式规格」。

#### Step 2: 读 parsed-styles + 交叉验证 HTML + 读取 API 规格

1. 读取 `parsed-styles/*.json` 中当前分组涉及的页面样式数据
2. 读取 `ui-audit.md` 中对应的三要素表进行确认（quick / micro 模式跳过此步（micro 跳过了整个 audit 阶段），直接消费 parsed-styles JSON）
3. **读取 API 规格**（按 mode 选择来源）：

   **standard / full 模式** — 读取 `api-spec.md` 中对应接口的请求参数表和响应字段表，确认：
   - 参数名、类型、默认值
   - 响应字段及其用途
   - 取值路径
   - standard/full 模式: **禁止**绕过 api-spec.md 直接从 H5 源码提取参数格式

   **quick 模式** — 读取 `features.md` §接口清单 + §接口补充：
   - 从「接口清单」获取接口名、URL、方法
   - 从「接口补充」获取关键请求参数和关键响应字段
   - quick / micro 模式无独立 api-spec.md，无字段综合映射表，响应字段直接从「接口补充」消费

4. 仅当以下场景回退到读原始 HTML：
   - parsed JSON 中缺少当前元素的数据（该元素在 JSON 中不存在或关键属性为空）
   - 需要确认非样式属性（`placeholder`、`maxlength`、`onClick` 等事件绑定）
   - 模型对 parsed 数据的准确性有疑虑
5. **记录日志**：在 `execution.md` 对应步骤后记录 `解析数据已读: parsed-styles/xxx.json`
   - 如果回退读了原始 HTML，在日志中追加 `HTML 交叉验证: 文件路径`
   - standard / full：记录 `API 规格已读: api-spec.md §2.x（接口名）`
   - quick：记录 `API 规格已读: features.md §接口清单（quick 模式）`

#### Step 3: 读项目代码风格 + 识别生存必备模式

读取目标目录现有文件，匹配已有模式。**本步骤不仅关注"代码风格"，更关注"不改就会炸"的生存必备模式。必须选择本项目同一架构层（如都是 FLP 架构下的 RN 页面）的一个已有页面作为参照页，并确认以下清单：**

**生存必备模式清单（每项必须与参照页逐行对照）：**

| 维度             | 说明                                                                            | 参照页文件名 |
| ---------------- | ------------------------------------------------------------------------------- | ------------ |
| 页面容器结构     | XlbPageContainer 的 header/footer prop vs children、scrollable、isSafeArea 配置 | —            |
| 导航传参格式     | `navigation.navigate` 的参数结构（`{item}` vs `{fid}`）                         | —            |
| 路由参数取值     | `route.params?.item?.xxx` vs `route.params?.xxx`                                | —            |
| 表单实例获取     | XlbForm.useWatch 的 form 参数来源（`useFormInstance()` vs `ref` vs 不传）       | —            |
| API 响应取值路径 | `res?.data?.content` vs `res?.data?.data`（按接口分别确认，page/read 可能不同） | —            |
| Toast 调用方式   | `Toast.show()` vs `Toast.fail()` vs `Toast.success()`，以及 import 来源         | —            |
| XlbNavbar 配置   | `isSafeArea`、`showBackArrow`、`rightExtra` 的用法                              | —            |

**参照页选择规则**：

- 增量需求 → 选本页面同目录下的兄弟文件
- 重构需求（H5→RN） → **必选项目中已有的同类型 RN 页面**（如 H5 的 qualityReporting 重构 → 参照 customerManagement_new）
- 没有同类型页面 → 选任意已有 RN 页面作参照，并在模式对齐表中标注「无同类型参照」

参照页选定后必须写入 `execution.md` 的分组日志中，格式：

```
模式参照页: src/pages/customerManagement_new/Index/chunks/page.tsx
```

#### Step 3.5: 模式对齐确认表（写在代码生成前，强制门禁）

**在 Step 4 生成任何代码之前**，必须先在 `execution.md` 中输出以下表格并逐项确认：

```markdown
#### 模式对齐确认表 — 分组 N

| 维度     | 参照页写法（文件:行号）                               | 本分组写法             | 一致? |
| -------- | ----------------------------------------------------- | ---------------------- | ----- |
| 容器嵌套 | XlbPageContainer + header={Navbar} + isSafeArea=false | ...                    | ✅    |
| 导航传参 | {item} (item.tsx:47-49)                               | {item}                 | ✅    |
| 路由取值 | route.params?.item?.fid (Detail:90)                   | routeParams?.item?.fid | ✅    |
| Form实例 | useWatch 在 Form 内部调用，不传 form                  | useWatch 在 Form 内部  | ✅    |
| API page | res?.data?.content (list.tsx:29)                      | res?.data?.content     | ✅    |
| API read | res?.data?.data (Detail:100)                          | res?.data?.data        | ✅    |
| Toast    | Toast.fail() from xiaoshu (page.tsx)                  | Toast.fail()           | ✅    |
| Navbar   | isSafeArea=false, showBackArrow (page.tsx)            | isSafeArea=false       | ✅    |
```

**门禁规则**：

- 每个维度必须填充参照页的**具体文件:行号**，不能写"同上"或"已知"
- 有任一维度未填写 → **禁止进入 Step 4**，补全后重新提交
- 有任一维度不一致 → 必须附带理由（如"设计稿要求"、"H5 原有行为"），不可无理由偏离

#### Step 4: 生成/修改代码

> **先读** `../../reference/rn/rn-code-patterns.md` — 该文件包含 RN 平台所有代码约束要点（API 取值、XlbForm 用法、gotchas 加载、注释场景）。

按以下约束生成代码：

- 按照「组件选择决策表」选择组件
- 如果决策表标注了「需要额外定制」，必须在代码中实现补偿方案
- 所有色值/字号/间距必须来自 `../../reference/rn/token-map.json` 或 theme；禁止硬编码
- 优先使用 parsed-styles 中的 token 映射值，而非从 HTML 重新提取
- 保留所有已有功能字段、事件、校验、OCR、上传逻辑
- 表单 name 必须为字符串，不使用数组
- **禁止向 `XlbForm.Item` / `CommonFormItem` 传入 `dependencies` 或 `shouldUpdate` prop**（参照 `../../reference/rn/gotchas/component-library/dependencies-kills-label.md`）。联动校验用 `form.getFieldValue(path)` 在 validator 内直接获取；条件渲染用 `useWatch`。
- **API 响应取值**：生成数据请求代码前，先确认目标接口的响应结构（standard/full：读 `api-spec.md` 取值路径配置；quick：参考 features.md §接口补充）。`response.data` 可能就是顶层，不要再解一层 `.data`。引用 `../../reference/rn/gotchas/api-patterns/fsms-response-structure.md`。**特别注意**：`page` 列表接口返回 `content`，`read` 详情接口可能返回 `data`，两者路径不同，必须按接口逐一确认。
- **字段来源约束**：standard / full 模式——必须对照 `api-spec.md §3` 的字段综合映射表，正反双向零遗漏验证。quick 模式——对照 `features.md` §接口补充的「关键响应字段」列，确认代码使用了这些字段即可。
- **XlbForm 水平内边距**：如果 ui-audit.md / parsed-styles 中记录了表单项存在水平 padding（如 `padding: 0 12px`），必须通过 `XlbForm` 的 `cellTheme` prop 全局设置，而不是加到每个 Item 的 style 上。引用 `../../reference/rn/gotchas/component-library/xlbform-celltheme-horizontal-padding.md`。
- **XlbForm.useWatch 调用位置**：`useWatch` 必须在 `<XlbForm>` 内部调用（作为 Form children 的子孙组件），不能在 Form 挂载前或 Form 外部调用。从 Form 外部传 `formRef.current` 给 `useWatch` 会导致 `form` 为 null。
- **onLayout 回调保护**：任何 `onLayout` 回调中访问 `e.nativeEvent.layout` 前必须加 null guard：`e?.nativeEvent?.layout?.y`。在 ScrollView 中绑定 onLayout 时 nativeEvent 可能在 unmount 后为 null。
- **gotchas 按需加载**：写代码前用本分组组件列表查 `../../reference/gotchas-manifest.json`，按 `components` / `keywords` 匹配，只 `Read` 命中的 1-2 篇 gotcha，禁止全量扫读 `reference/rn/gotchas/`。条目的 `verifiedVersion` 与目标项目实际组件库版本（`@xlb/components-mobile`）不一致或为 `n/a` 时，该条目仅作线索，生成代码前须核对目标项目实际组件版本的用法。

##### UI 结构变更时的字段分配表（当 features.md 的分区结构与新 UI 不匹配时必须执行）

当 `ui-audit.md` 记录了 UI 结构调整（如 4 Tab → 5 锚点、字段重新分区）时，**在写代码之前必须**：

1. 从 `features.md` 提取本分组所有功能点涉及的**每个字段**
2. 从 `tech-design.md` / `parsed-styles` 提取新 UI 的 section/锚点列表
3. **输出字段分配表到 execution.md**，格式如下。**未经此步骤不得生成代码**：

```markdown
#### 字段分配表 — 分组 N

| 功能点 ID | 字段        | features.md 原归属 | → 新 UI section    | 条件显示          |
| --------- | ----------- | ------------------ | ------------------ | ----------------- |
| F-41      | item_code   | 商品信息(Tab1)     | Section 0 商品信息 | —                 |
| F-45      | find_name   | 问题处理(Tab3)     | Section 3 问题处理 | quality_type=SELF |
| F-45      | handle_type | 问题处理(Tab3)     | Section 3 问题处理 | —                 |

...
```

4. 对照此表逐字段生成代码，每完成一个字段在表中标记 ✅
5. **零遗漏规则**：正反两方向验证——
   - **正向**：`features.md` 中属于本页面的每个字段都必须在表中有一行（不允许"我认为不需要"）
   - **反向**：表中的每个字段都必须在代码中出现（表中有而代码中没有 = 遗漏 bug）
6. **条件显示**：表中"条件显示"列非空的字段，代码中必须实现对应的条件渲染（`useWatch` + 三元/&&）
7. **parsed-styles 元素全覆盖**：parsed-styles JSON 中每个 `semanticType === "容器"` 且 `tag !== "div"`（有业务语义）的元素，必须在分配表中有一行，标记其代码对应关系

##### 必须添加注释的场景

Step 4 生成代码时，以下场景**必须**加 JSDoc 或行内注释：

- 与 H5 源码逻辑对应但 API/实现方式不同的转换函数（标注 H5 原实现方式）
- 绕过框架 bug 的 workaround（标注 bug 原因和修复原理，如 nativeID 过滤）
- 动态数组操作的边界处理（标注为何需要特殊处理）
- stripPrefix 类的数据变换函数（标注转换规则和调用时机）

##### 设计偏差记录

当实现方案与设计稿/UI 审计存在偏差时，必须在 execution.md 对应分组中记录：

- **偏差项**：具体哪个 UI 元素或交互与设计稿不同
- **偏差原因**：为何无法按设计稿实现（如"H5 源码未实现此功能"/"组件库不支持"/"无独立设计规格"）
- **决策依据**：选择当前方案的理由（如"保持与 H5 一致"/"降级为默认渲染"）

#### Step 5: 编译 + 渲染抽检

1. **编译验证**：运行 `tsc --noEmit`，修复所有编译错误后再继续。
2. **dependencies 禁用扫描**（必须执行）：
   - 对本分组新增/修改的 `.tsx` 文件执行 `grep -n "dependencies" <file>`。
   - 若发现任何 `XlbForm.Item` / `CommonFormItem` 传入了 `dependencies` prop，**立即修复**：按 `../../reference/rn/gotchas/component-library/dependencies-kills-label.md` 替换为 `form.getFieldValue` / `useWatch`。
   - 依据：`dependencies` 会导致 label 不渲染（编译通过但运行时表现错误）。
3. **prop 兼容性速查**：以 Step 4 按 `gotchas-manifest.json` 命中的 1-2 篇 gotcha 为准，核对本组使用的每个黑盒组件 prop 用法合规；组件列表有新组件但未命中任何条目时，才按组件名检索 `../../reference/rn/gotchas/component-library/` 补充。
4. **模式对齐复审**：对照 Step 3.5 输出的「模式对齐确认表」，快速复审代码中每个维度是否确实按表中"本分组写法"列实现。发现不一致但无理由的 → 修正。

#### Step 5.5: 分组门禁（硬阻塞 — 不通过禁止进入 Step 6）

> ❗️ **铁律**：每个分组编译通过后，必须执行以下 5 项自动检查 + 1 项人工审查。**全部通过 + 用户确认后，才允许进入 Step 6 和下一分组。** 任一项不通过 → 立即修复后重跑门禁。

**5.5.1 自动检查（5 项，全部必须 PASS）**

**检查 1 — 编译通过**：`tsc --noEmit`，本分组涉及文件零错误。

**检查 2 — dependencies 禁用**：对本分组新增/修改的 `.tsx` 文件执行 `grep -n "dependencies"`。若任何 `XlbForm.Item` / `CommonFormItem` 传入了 `dependencies` prop → **FAIL**，按 `../../reference/rn/gotchas/component-library/dependencies-kills-label.md` 修复后重跑。

**检查 3 — API 响应取值**：对本分组涉及 API 调用的 `.ts/.tsx` 文件搜索 `?.data?.data`。若取到的是 `content`、`total_elements` 等顶层字段的子属性 → **FAIL**，按 `../../reference/rn/gotchas/api-patterns/fsms-response-structure.md` 修正后重跑。

**检查 4 — 设计偏差闭合（扩展 8 属性）**：

1. 复用 Step 2 已加载的 `parsed-styles/*.json` 数据（不重新读取），对照 `ui-audit.md` 中对应三要素表
2. **逐属性检查 8 项必查属性**：
   - `layout.height` → 代码高度是否符合
   - `layout.padding` → 内边距是否符合（含水平内边距 → cellTheme 映射）
   - `layout.flexDirection` → 布局方向是否符合
   - `typography.fontSize` → 字号是否符合
   - `typography.color` → 颜色值是否符合（以 token 为准）
   - `typography.fontWeight` → 字重是否符合
   - `spacingStyle.backgroundColor` → 背景色是否符合
   - `spacingStyle.borderRadius` → 圆角是否符合
3. 输出「设计偏差记录表」到 `execution.md`：

```markdown
#### 设计偏差记录 — 分组 N

| #   | 元素   | 属性        | 预期(token)    | 实际(代码) | 偏差类型 | 严重度 | 处理方案 |
| --- | ------ | ----------- | -------------- | ---------- | -------- | ------ | -------- |
| 1   | 标题栏 | height      | SPACE_12(48px) | 44px       | layout   | major  | 立即修复 |
```

偏差类型枚举：`layout | typography | spacing | icon | color | missing`
严重度枚举：`critical`（功能缺失）/ `major`（视觉明显不符）/ `minor`（细微偏差）

**严重度处理规则（硬约束）**：
- `critical` + `major` → **必须立即修复**，禁止标记 defer
- `minor` → 可标记 `不可修复-原因`，需在 execution.md 详细说明原因
- 门禁判定：存在未修复的 critical 或 major → **FAIL**，修复后重跑检查 4

4. **同步偏差库**：将新偏差追加到 `.ai-wiki/design-deviation-db.json`

**检查 5 — 字段完整性**：
1. standard/full 模式——对照本分组「字段分配表」+ `api-spec.md` §3 字段综合映射表，正反双向验证
2. quick / micro 模式——对照 `features.md` §接口补充「关键响应字段」确认代码已使用
3. 有缺失/多余 → **FAIL**，补全/删除后重跑

> 以下 5.5.2-5.5.4 步骤见 `../../subskills/common/03-build-shared.md` §Step 5.5.2-5.5.4。
> 执行时先 Read 该文件对应节号，按其中模板输出门禁报告、执行人工审查、更新 groupGates。

> Step 6-8 见 `../../subskills/common/03-build-shared.md` §Step 6-8。
> 执行时先 Read 该文件对应节号。


---

### 4. 分层验证一览

| 层级            | 时机             | 范围                                   | 结果              |
| --------------- | ---------------- | -------------------------------------- | ----------------- |
| **模式对齐**    | build Step 3.5   | 本分组 vs 参照页逐项对照               | 确认表            |
| **分组门禁**    | build Step 5.5   | 5 项自动检查 + 人工审查，硬阻塞        | 通过/重跑         |
| **出口门禁**    | build 全部完成后 | 跨分组全局检查（5 项）                 | 通过/禁止         |
| **verify 终检** | verify 阶段      | 全部分组 + 完整验证                    | 交付/返回修复     |

---

> 上下文管理见 `../../subskills/common/03-build-shared.md` §上下文管理。以下为 RN 特有补充：
> - Step 3.5 模式对齐确认表在首次分组建立后写入「项目模式缓存」，后续分组复用（见 `../../subskills/common/03-build-shared.md` §Step 3 项目级缓存）。
> - **不裸读原始 HTML**（除非 parsed 数据不足以回答问题）

## 出口门禁（必须全部通过才能进入 verify 阶段）

> 分组门禁已保障每个分组的代码质量（编译、dependencies、API 取值、偏差闭合、字段完整性）。
> 出口门禁聚焦于**跨分组的全局一致性**，不再重复单个分组的检查。

在所有分组执行完毕后，**强制执行以下 5 项全局校验**：

1. **分组门禁完整性**：读取 `.dtc-state.json` 中 `build.groupGates`，确认所有分组的 `passed === true` 且 `userApproved === true` — 有遗漏则**禁止进入 verify 阶段**
2. **功能点全覆盖**：读取 `features.md`，检查是否仍有 `⬜` — 有则列出遗漏功能点，**禁止进入 verify 阶段**
3. **跨分组一致性**：
   - 同一接口在不同分组中的取值路径是否一致
   - 同一组件选择决策在不同分组是否一致
   - 不一致则修正后重校
4. **样式合规终检**：对本次新增/修改的 `.ts/.tsx` 文件执行 `../../reference/rn/style-scan-checklist.md`，发现硬编码颜色、magic number、错误图标名等问题后统一修复。修复时**禁止**为改样式而简化功能
5. **动态表单安全终检**：扫描本次新增/修改的 `.tsx` 文件中所有 `name={[`（数组 name）的 `XlbForm.Item`，检查其直接子组件：
   - `XlbInput` → 必须替换为 `SafeInput`
   - `XlbUploadFile` → 必须替换为 `SafeUploadFile`
   - 未包装则**禁止进入 verify 阶段**，修复后重新校验
   - 引用 `../../reference/rn/gotchas/component-library/safeinput-filter-id.md`

**全部通过后**：

- 汇报：「全部 N 个分组已执行（全部通过分组门禁），M 个功能点已标记完成，跨分组一致性通过，样式合规终检通过，动态表单安全通过」
- 更新 `.ai-wiki/.dtc-state.json`：`build.exitGatePassed = true`, `build.checklistPassed = true`
- 推进 `currentPhase` 到 `verify`

**任一项不通过** → 修正后重新校验

---

---

> 中断恢复见 `../../subskills/common/03-build-shared.md` §中断恢复。


---

---

## 禁止

> 共享禁止项见 `../../subskills/common/03-build-shared.md` §禁止（共享项）。以下为 RN 平台特有禁止项：

- 当 `materialStatus` 为 `"complete"` 时，跳过 Step 2 写出无样式的代码。
- Step 2 中未记录「解析数据已读」日志就跳到 Step 3。
- **Step 3 中未记录「模式参照页」就跳到 Step 4。**
- **Step 3.5 中未输出「模式对齐确认表」且所有维度均标 ✅ 就生成代码。**
- 用硬编码 color/margin/fontSize。
- 删除 `phaseOutputs.design` 中定义的 API 字段。
- 让 `XlbForm.Item` 的 `name` 为数组。
- 向 `XlbForm.Item` / `CommonFormItem` 传入 `dependencies` 或 `shouldUpdate` prop。
