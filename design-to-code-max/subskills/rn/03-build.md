# Phase 04 - 分组执行与代码生成

## 进入条件

- 已 `Read .ai-wiki/.dtc-state.json`。
- `phaseOutputs.design.checklistPassed === true` 且 `phaseOutputs.design.userConfirmed === true`。
- `currentPhase` 为 `build`。

---

## 任务

### 1. 生成执行文档

从 `tech-design.md` 拆解为分步执行步骤，使用 `../templates/rn/execution.md.tpl` 格式生成 `execution.md`。

- 按功能模块或页面拆分为分组（每组 3-8 个步骤）
- 每步标注关联功能点 ID、UI 参考文件、预计耗时
- 将 `docPaths.execution` 设置为生成的 execution.md 路径
- 更新 `.ai-wiki/.dtc-state.json` 的当前需求条目的 `build.totalGroups`

### 2. 读取规范

**先读 `../reference/rn/rn-guidelines.md`**，确认 RN 组件、主题、路由、表单安全等约束。

### 3. 按分组执行（核心：9 步闭环 + Step 6.5）

按顺序逐一执行每个分组。**每个分组完成后，必须执行以下步骤，缺一不可：**

#### Step 1: 读设计文档

读取 `tech-design.md` 对应部分，特别关注「组件选择决策表」和「UI 样式规格」。

#### Step 2: 读 parsed-styles + 交叉验证 HTML + 读取 api-spec.md

1. 读取 `parsed-styles/*.json` 中当前分组涉及的页面样式数据
2. 读取 `ui-audit.md` 中对应的三要素表进行确认
3. **读取 `api-spec.md`**：对于本分组涉及的 API 调用，读取 `api-spec.md` 中对应接口的请求参数表和响应字段表，确认：
   - 参数名、类型、默认值
   - 响应字段及其用途
   - 取值路径
   - **禁止**绕过 api-spec.md 直接从 H5 源码提取参数格式
4. 仅当以下场景回退到读原始 HTML：
   - parsed JSON 中缺少当前元素的数据（该元素在 JSON 中不存在或关键属性为空）
   - 需要确认非样式属性（`placeholder`、`maxlength`、`onClick` 等事件绑定）
   - 模型对 parsed 数据的准确性有疑虑
5. **记录日志**：在 `execution.md` 对应步骤后记录 `解析数据已读: parsed-styles/xxx.json`
   - 如果回退读了原始 HTML，在日志中追加 `HTML 交叉验证: 文件路径`
   - **记录 `API 规格已读: api-spec.md §2.x（接口名）`**
6. 记录 `分组 N 读解析数据: MM 分钟`，并将部分计时写入 features.md 性能日志

#### Step 3: 读项目代码风格 + 识别生存必备模式

读取目标目录现有文件，匹配已有模式。**本步骤不仅关注"代码风格"，更关注"不改就会炸"的生存必备模式。必须选择本项目同一架构层（如都是 FLP 架构下的 RN 页面）的一个已有页面作为参照页，并确认以下清单：**

**生存必备模式清单（每项必须与参照页逐行对照）：**

| 维度 | 说明 | 参照页文件名 |
|------|------|-------------|
| 页面容器结构 | XlbPageContainer 的 header/footer prop vs children、scrollable、isSafeArea 配置 | — |
| 导航传参格式 | `navigation.navigate` 的参数结构（`{item}` vs `{fid}`） | — |
| 路由参数取值 | `route.params?.item?.xxx` vs `route.params?.xxx` | — |
| 表单实例获取 | XlbForm.useWatch 的 form 参数来源（`useFormInstance()` vs `ref` vs 不传） | — |
| API 响应取值路径 | `res?.data?.content` vs `res?.data?.data`（按接口分别确认，page/read 可能不同） | — |
| Toast 调用方式 | `Toast.show()` vs `Toast.fail()` vs `Toast.success()`，以及 import 来源 | — |
| XlbNavbar 配置 | `isSafeArea`、`showBackArrow`、`rightExtra` 的用法 | — |

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

| 维度 | 参照页写法（文件:行号） | 本分组写法 | 一致? |
|------|----------------------|-----------|-------|
| 容器嵌套 | XlbPageContainer + header={Navbar} + isSafeArea=false | ... | ✅ |
| 导航传参 | {item} (item.tsx:47-49) | {item} | ✅ |
| 路由取值 | route.params?.item?.fid (Detail:90) | routeParams?.item?.fid | ✅ |
| Form实例 | useWatch 在 Form 内部调用，不传 form | useWatch 在 Form 内部 | ✅ |
| API page | res?.data?.content (list.tsx:29) | res?.data?.content | ✅ |
| API read | res?.data?.data (Detail:100) | res?.data?.data | ✅ |
| Toast | Toast.fail() from xiaoshu (page.tsx) | Toast.fail() | ✅ |
| Navbar | isSafeArea=false, showBackArrow (page.tsx) | isSafeArea=false | ✅ |
```

**门禁规则**：
- 每个维度必须填充参照页的**具体文件:行号**，不能写"同上"或"已知"
- 有任一维度未填写 → **禁止进入 Step 4**，补全后重新提交
- 有任一维度不一致 → 必须附带理由（如"设计稿要求"、"H5 原有行为"），不可无理由偏离

#### Step 4: 生成/修改代码

按以下约束生成代码：

- 按照「组件选择决策表」选择组件
- 如果决策表标注了「需要额外定制」，必须在代码中实现补偿方案
- 所有色值/字号/间距必须来自 `../reference/rn/token-map.json` 或 theme；禁止硬编码
- 优先使用 parsed-styles 中的 token 映射值，而非从 HTML 重新提取
- 保留所有已有功能字段、事件、校验、OCR、上传逻辑
- 表单 name 必须为字符串，不使用数组
- **禁止向 `XlbForm.Item` / `CommonFormItem` 传入 `dependencies` 或 `shouldUpdate` prop**（参照 `../reference/rn/gotchas/component-library/dependencies-kills-label.md`）。联动校验用 `form.getFieldValue(path)` 在 validator 内直接获取；条件渲染用 `useWatch`。
- **API 响应取值**：生成数据请求代码前，先确认目标接口的响应结构（读 `api-spec.md` 的取值路径配置）。`response.data` 可能就是顶层，不要再解一层 `.data`。引用 `../reference/rn/gotchas/api-patterns/fsms-response-structure.md`。**特别注意**：`page` 列表接口返回 `content`，`read` 详情接口可能返回 `data`，两者路径不同，必须按接口逐一确认。
- **字段来源约束**：生成 renderItem / 详情展示 / 表单字段时，**必须对照 `api-spec.md §3` 的字段综合映射表**。每个渲染字段在代码中需标注 FP-xxx 编号的注释。映射表中「字段→UI 元素」列标注了 ✅ 的字段代码中必须有，表中没有的字段代码中不能有。**零遗漏规则：正反两方向验证**——映射表中属于本页面的每个字段都必须在代码中出现，代码中的每个字段在映射表中必须有一行。
- **XlbForm 水平内边距**：如果 ui-audit.md / parsed-styles 中记录了表单项存在水平 padding（如 `padding: 0 12px`），必须通过 `XlbForm` 的 `cellTheme` prop 全局设置，而不是加到每个 Item 的 style 上。引用 `../reference/rn/gotchas/component-library/xlbform-celltheme-horizontal-padding.md`。
- **XlbForm.useWatch 调用位置**：`useWatch` 必须在 `<XlbForm>` 内部调用（作为 Form children 的子孙组件），不能在 Form 挂载前或 Form 外部调用。从 Form 外部传 `formRef.current` 给 `useWatch` 会导致 `form` 为 null。
- **onLayout 回调保护**：任何 `onLayout` 回调中访问 `e.nativeEvent.layout` 前必须加 null guard：`e?.nativeEvent?.layout?.y`。在 ScrollView 中绑定 onLayout 时 nativeEvent 可能在 unmount 后为 null。

##### UI 结构变更时的字段分配表（当 features.md 的分区结构与新 UI 不匹配时必须执行）

当 `ui-audit.md` 记录了 UI 结构调整（如 4 Tab → 5 锚点、字段重新分区）时，**在写代码之前必须**：

1. 从 `features.md` 提取本分组所有功能点涉及的**每个字段**
2. 从 `tech-design.md` / `parsed-styles` 提取新 UI 的 section/锚点列表
3. **输出字段分配表到 execution.md**，格式如下。**未经此步骤不得生成代码**：

```markdown
#### 字段分配表 — 分组 N

| 功能点 ID | 字段 | features.md 原归属 | → 新 UI section | 条件显示 |
|-----------|------|-------------------|----------------|----------|
| F-41     | item_code | 商品信息(Tab1) | Section 0 商品信息 | — |
| F-45     | find_name | 问题处理(Tab3) | Section 3 问题处理 | quality_type=SELF |
| F-45     | handle_type | 问题处理(Tab3) | Section 3 问题处理 | — |
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
   - 若发现任何 `XlbForm.Item` / `CommonFormItem` 传入了 `dependencies` prop，**立即修复**：按 `../reference/rn/gotchas/component-library/dependencies-kills-label.md` 替换为 `form.getFieldValue` / `useWatch`。
   - 依据：`dependencies` 会导致 label 不渲染（编译通过但运行时表现错误）。
3. **prop 兼容性速查**：检查本组使用的每个黑盒组件 prop 是否有对应 gotcha 文件（`../reference/rn/gotchas/component-library/`），有则核对用法合规。
4. **模式对齐复审**：对照 Step 3.5 输出的「模式对齐确认表」，快速复审代码中每个维度是否确实按表中"本分组写法"列实现。发现不一致但无理由的 → 修正。
5. 记录 `分组 N 编译/抽检: MM 分钟`。

#### Step 5.5: 设计偏差捕捉（新增）

在每个分组编译通过后，检查生成的代码样式是否符合设计规格：

1. 读取 `execution.md` 中本分组的「解析数据已读」日志，确认已消费
2. 读取 `parsed-styles/*.json` 中本分组涉及的样式数据
3. 读取 `ui-audit.md` 中对应组件的三要素表
4. **逐属性检查**：至少检查以下 4 项必查属性：
   - `layout.height` → 代码中的高度是否符合 parsed 值
   - `typography.fontSize` → 字号是否符合
   - `typography.color` → 颜色值是否符合（以 token 为准，不是 hex）
   - `spacingStyle.backgroundColor` → 背景色是否符合
5. 输出「设计偏差记录表」到 `execution.md`：

```markdown
#### 设计偏差记录 — 分组 N

| # | 元素 | 属性 | 预期(token) | 实际(代码) | 偏差类型 | 严重度 | 处理方案 |
|---|------|------|-------------|-----------|---------|--------|---------|
| 1 | 标题栏 | height | SPACE_12(48px) | 44px | layout | major | 立即修复 |
```

偏差类型枚举：`layout | typography | spacing | icon | color | missing`
严重度枚举：`critical`（功能缺失）/ `major`（视觉明显不符）/ `minor`（细微偏差）
处理方案枚举：`立即修复` / `defer 到 verify` / `不可修复-原因`

6. **同步偏差库**：将新偏差追加到 `.ai-wiki/design-deviation-db.json`
   - 新偏差 → 追加新条目（生成 DEV-ID）
   - 命中已知偏差（component + defectType 匹配） → 仅 `occurrenceCount++`, `lastOccurred` 更新，不重复写入
7. 记录 `分组 N 偏差捕捉: MM 分钟`

#### Step 6: 更新 execution.md

将该分组标题标记为 ✅，在对应 Step 行末尾追加 `实际: MM 分钟`，确认「解析数据已读」日志和「模式对齐确认表」已填写，「模式参照页」已记录。

**同步维护「恢复入口」标记**：

```markdown
## 恢复入口

- 当前进度：分组 X 已完成
- 下一步：分组 Y Step 1（读设计文档）
- 最后更新：YYYY-MM-DD HH:mm
```

此标记确保模型重新加载 context 时可直接定位续接位置，无需遍历全文。

#### Step 7: 更新 features.md

将关联功能点 ⬜ → ✅；追加 `分组 N 完成: HH:MM (实际 MM 分钟)` 到「性能计时日志」。

#### Step 8: 更新 .dtc-state.json

同步更新 JSON 状态中当前需求条目的 build 字段：

```jsonc
{
  "completedGroups": N,
  "currentGroup": N + 1,
  "createdFiles": ["新增的文件路径"],
  "modifiedFiles": ["修改的文件路径"],
  "htmlReadLog": ["分组1: parsed-styles/cert-approve.json", "分组N: ..."],
  "completedFeatureIds": ["F-001", "F-002"]
}
```

**同步更新 `updatedAt` 时间戳。**

---

### 4. 分层验证一览

| 层级 | 时机 | 范围 | 结果 |
|------|------|------|------|
| **模式对齐** | build Step 3.5 | 本分组 vs 参照页逐项对照 | 确认表 |
| **分组自检** | build Step 5.5 | 本分组代码 vs parsed-styles + 三要素表 | 偏差记录表 |
| **出口门禁** | build 全部完成后 | 全部分组 + 全量扫描 | 通过/禁止 |
| **verify 终检** | verify 阶段 | 全部分组 + 完整扫描 | 交付/返回修复 |

---

### 5. 上下文管理

build 阶段的每个分组开始时，**增量加载**而非全量加载：

1. 读取 `execution.md`（从中获取当前分组任务和「恢复入口」标记）
2. 读取 `parsed-styles/*.json` 中对应页面的数据
3. 读取 `ui-audit.md` 中对应分组的规格部分（非整个文件）
4. 读取 `tech-design.md` 中对应分组的决策部分（非整个文件）
5. **必须读取 `api-spec.md` 中对应接口的规格定义**（请求参数表、响应字段表、取值路径），不再从 H5 源码裸提取参数格式
6. **不加载**已完成分组的代码文件
7. **不裸读原始 HTML**（除非 parsed 数据不足以回答问题）

---

## 出口门禁（必须全部通过才能进入 Phase 05）

在所有分组执行完毕后，**强制执行以下校验**：

1. **分组完成度**：读取 `execution.md`，检查所有分组标题是否均标记 ✅ — 有遗漏则列出，禁止进入 Phase 05
2. **功能点完成度**：读取 `features.md`，检查是否仍有 `⬜` — 有则列出遗漏功能点，禁止进入 Phase 05
3. **解析数据消费完整性**：检查 `execution.md` 中每个分组的「解析数据已读」日志是否已填写 — 有缺失则标记，提示该分组可能跳过了样式数据读取步骤
4. **模式对齐表完整性**：检查 `execution.md` 中每个分组的「模式对齐确认表」是否存在且所有维度均标 ✅ — 有缺失或未确认的维度则**禁止进入 Phase 05**
5. **H5 参数验证日志完整性**：检查 `execution.md` 中每个涉及 API 调用的分组是否记录了「API 规格已读」日志 — 有缺失则标记
6. **样式合规终检**：对本次新增/修改的 `.ts/.tsx` 文件执行 `../reference/rn/style-scan-checklist.md`，发现硬编码颜色、magic number、错误图标名等问题后统一修复。修复时**禁止**为改样式而简化功能
7. **动态表单安全检查**：扫描本次新增/修改的 `.tsx` 文件中所有 `name={[`（数组 name）的 `XlbForm.Item`，检查其直接子组件：
   - `XlbInput` → 必须替换为 `SafeInput`
   - `XlbUploadFile` → 必须替换为 `SafeUploadFile`
   - 未包装则**禁止进入 Phase 05**，修复后重新校验
   - 引用 `../reference/rn/gotchas/component-library/safeinput-filter-id.md`
8. **设计定制落实检查**：遍历 tech-design.md 的「组件选择决策表」，对所有标注为「需要额外定制: 是」的项，在对应 `.tsx` 代码中验证补偿方案已实现：
   - 上传组件（XlbUploadFile/SafeUploadFile）：检查是否传入了 `customUpload`、`filesMax`、`uploadText`；数组 name 场景必须用 SafeUploadFile；组件默认已渲染图片缩略图，无需 renderItem/thumbnailSize 等不存在的 props
   - 选择器/单选组：检查是否自定义了容器样式和交互（而非使用 CommonFormItem 默认渲染）
   - 其他标注定制项：逐一验证代码中是否有对应的补偿实现
   - 未找到补偿方案的 → **禁止进入 Phase 05**，列出遗漏的定制项并修复
9. **dependencies 禁用终检**：对本次所有新增/修改的 `.tsx` 文件执行 `grep -rn "dependencies" --include="*.tsx"`。出现任何 `XlbForm.Item` 或 `CommonFormItem` 传入 `dependencies` 的代码 → **禁止进入 Phase 05**，按 `../reference/rn/gotchas/component-library/dependencies-kills-label.md` 修复后重新校验
10. **defer/待处理项消费检查**：扫描 `execution.md` 中所有标注为 `defer`、`待处理`、`verify 处理`、`后续处理` 的条目，为每条生成对应的修复动作项。所有 defer 项必须在进入 Phase 05 前闭环（已修复 或 明确标注「设计不可实现-原因」）→ 有未消费的 defer 项则**禁止进入 Phase 05**
11. **偏差库同步检查**（新增）：扫描 `design-deviation-db.json` 中当前需求关联的偏差条目，确认所有 `severity === "critical"` 的条目已有 `处理方案` 或已 `resolved` — 有未处理的 critical 偏差则**禁止进入 Phase 05**
12. **API 响应取值检查**（新增）：对本次新增/修改的 `.ts/.tsx` 文件搜索 `?.data?.data` 模式。如果取到的是 `content`、`total_elements` 等顶层字段的子属性，说明多解了一层 → 按 `../reference/rn/gotchas/api-patterns/fsms-response-structure.md` 修正为 `res?.data` 取值，修正后重新校验
13. **UI 结构变更字段完整性检查**（新增）：当 `ui-audit.md` 记录了 UI 分区结构调整（如 Tab 数变更、字段重新分区），检查 `execution.md` 中是否每个涉及的分组都输出了「字段分配表」。若存在分配表但表中字段数 < `features.md` 同页面字段总数，说明有遗漏 → **禁止进入 Phase 05**，参考 `../reference/rn/gotchas/build-phase/ui-structure-remap-field-loss.md` 补全字段后再校验。同时检查分配表中的"条件显示"列非空字段是否在代码中有对应的条件渲染。

**全部通过后**：

- 汇报：「全部 N 个分组已执行，M 个功能点已标记完成，样式合规终检通过，动态表单安全检查通过，dependencies 禁用检查通过，defer 项全部闭环，偏差库已同步，API 响应取值检查通过，模式对齐确认表全部完成」
- 更新 `.ai-wiki/.dtc-state.json` 当前需求条目：`build.exitGatePassed = true`, `build.checklistPassed = true`
- 推进 `currentPhase` 到 `verify`

**任一项不通过** → 修正后重新校验

---

## 中断恢复

如果在执行中途被中断：

1. 下次启动时 `Read .ai-wiki/.dtc-state.json`
2. 检查当前需求条目的 `build.completedGroups` 和 `build.currentGroup`
3. 跳到当前未完成的分组
4. **上下文恢复检测**：检查上一个已完成分组的 `htmlReadLog` 和「模式对齐确认表」。如果日志缺失或在旧版格式下为裸 HTML 路径，提示：
   ```
   检测到上一分组可能跳过了样式数据读取步骤（无「解析数据已读」日志），建议重新执行该分组的样式还原部分
   ```
5. 如果用户选择重新执行，重新读取 `parsed-styles` JSON 并对比已生成的代码，修复样式偏差

---

## 禁止

- 未完成所有步骤就汇报分组完成或跳到下一分组。
- 当 `materialStatus` 为 `"complete"` 时，跳过 Step 2 写出无样式的代码。
- Step 2 中未记录「解析数据已读」日志就跳到 Step 3。
- **Step 2 中未读取 `api-spec.md` 就直接用猜测的格式写 API 调用。**
- **Step 3 中未记录「模式参照页」就跳到 Step 4。**
- **Step 3.5 中未输出「模式对齐确认表」且所有维度均标 ✅ 就生成代码。**
- **Step 4 中未对照 `api-spec.md` 的字段综合映射表就生成 renderItem/详情/表单字段。**
- 用硬编码 color/margin/fontSize。
- 删除 `phaseOutputs.design` 中定义的 API 字段。
- 让 `XlbForm.Item` 的 `name` 为数组。
- 向 `XlbForm.Item` / `CommonFormItem` 传入 `dependencies` 或 `shouldUpdate` prop。
- 一次生成过多文件而不更新 checkpoint。
- **跳过 Step 3.5 模式对齐确认表直接进入代码生成。**
- **跳过 Step 5.5 偏差捕捉直接进入下一个分组。**
- 在 `XlbForm` 外部调用 `XlbForm.useWatch` 或传入未挂载的 `formRef.current`。
- onLayout 回调中不加 null guard 直接访问 `e.nativeEvent.layout`。
