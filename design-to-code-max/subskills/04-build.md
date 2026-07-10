# Phase 04 - 分组执行与代码生成

## 进入条件

- 已 `Read .ai-wiki/.dtc-state.json`。
- `phaseOutputs.design.checklistPassed === true` 且 `phaseOutputs.design.userConfirmed === true`。
- `currentPhase` 为 `build`。

---

## 任务

### 1. 生成执行文档

从 `tech-design.md` 拆解为分步执行步骤，使用 `templates/execution.md.tpl` 格式生成 `execution.md`。

- 按功能模块或页面拆分为分组（每组 3-8 个步骤）
- 每步标注关联功能点 ID、UI 参考文件、预计耗时
- 将 `docPaths.execution` 设置为生成的 execution.md 路径
- 更新 `.ai-wiki/.dtc-state.json` 的当前需求条目的 `build.totalGroups`

### 2. 读取规范

**先读 `reference/rn-guidelines.md`**，确认 RN 组件、主题、路由、表单安全等约束。

### 3. 按分组执行（核心：8 步闭环 + Step 5.5）

按顺序逐一执行每个分组。**每个分组完成后，必须执行以下步骤，缺一不可：**

#### Step 1: 读设计文档

读取 `tech-design.md` 对应部分，特别关注「组件选择决策表」和「UI 样式规格」。

#### Step 2: 读取 parsed-styles + 交叉验证 HTML（改造）

**改前：** 强制读 HTML + UI 审计
**改后：** 从 parsed-styles JSON 读取样式数据，必要时回退到原始 HTML

1. 读取 `parsed-styles/*.json` 中当前分组涉及的页面样式数据
2. 读取 `ui-audit.md` 中对应的三要素表进行确认
3. 仅当以下场景回退到读原始 HTML：
   - parsed JSON 中缺少当前元素的数据（该元素在 JSON 中不存在或关键属性为空）
   - 需要确认非样式属性（`placeholder`、`maxlength`、`onClick` 等事件绑定）
   - 模型对 parsed 数据的准确性有疑虑
4. **记录日志**：在 `execution.md` 对应步骤后记录 `解析数据已读: parsed-styles/xxx.json`
   - 如果回退读了原始 HTML，在日志中追加 `HTML 交叉验证: 文件路径`
5. 记录 `分组 N 读解析数据: MM 分钟`，并将部分计时写入 features.md 性能日志

#### Step 3: 读项目代码风格

读取目标目录现有文件，匹配已有模式（命名风格、import 顺序、store 结构等）。

#### Step 4: 生成/修改代码

按以下约束生成代码：

- 按照「组件选择决策表」选择组件
- 如果决策表标注了「需要额外定制」，必须在代码中实现补偿方案
- 所有色值/字号/间距必须来自 `reference/token-map.json` 或 theme；禁止硬编码
- 优先使用 parsed-styles 中的 token 映射值，而非从 HTML 重新提取
- 保留所有已有功能字段、事件、校验、OCR、上传逻辑
- 表单 name 必须为字符串，不使用数组
- **禁止向 `XlbForm.Item` / `CommonFormItem` 传入 `dependencies` 或 `shouldUpdate` prop**（参照 `reference/gotchas/component-library/dependencies-kills-label.md`）。联动校验用 `form.getFieldValue(path)` 在 validator 内直接获取；条件渲染用 `useWatch`。
- **API 响应取值**：生成数据请求代码前，先确认目标接口的响应结构（读现有代码或接口文档）。`response.data` 可能就是顶层，不要再解一层 `.data`。引用 `reference/gotchas/api-patterns/fsms-response-structure.md`。
- **XlbForm 水平内边距**：如果 ui-audit.md / parsed-styles 中记录了表单项存在水平 padding（如 `padding: 0 12px`），必须通过 `XlbForm` 的 `cellTheme` prop 全局设置，而不是加到每个 Item 的 style 上。引用 `reference/gotchas/component-library/xlbform-celltheme-horizontal-padding.md`。

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
   - 若发现任何 `XlbForm.Item` / `CommonFormItem` 传入了 `dependencies` prop，**立即修复**：按 `reference/gotchas/component-library/dependencies-kills-label.md` 替换为 `form.getFieldValue` / `useWatch`。
   - 依据：`dependencies` 会导致 label 不渲染（编译通过但运行时表现错误）。
3. **prop 兼容性速查**：检查本组使用的每个黑盒组件 prop 是否有对应 gotcha 文件（`reference/gotchas/component-library/`），有则核对用法合规。
4. 记录 `分组 N 编译/抽检: MM 分钟`。

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

将该分组标题标记为 ✅，在对应 Step 行末尾追加 `实际: MM 分钟`，确认「解析数据已读」日志已填写。

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
5. **不加载**已完成分组的代码文件
6. **不裸读原始 HTML**（除非 parsed 数据不足以回答问题）

---

## 出口门禁（必须全部通过才能进入 Phase 05）

在所有分组执行完毕后，**强制执行以下校验**：

1. **分组完成度**：读取 `execution.md`，检查所有分组标题是否均标记 ✅ — 有遗漏则列出，禁止进入 Phase 05
2. **功能点完成度**：读取 `features.md`，检查是否仍有 `⬜` — 有则列出遗漏功能点，禁止进入 Phase 05
3. **解析数据消费完整性**：检查 `execution.md` 中每个分组的「解析数据已读」日志是否已填写 — 有缺失则标记，提示该分组可能跳过了样式数据读取步骤
4. **样式合规终检**：对本次新增/修改的 `.ts/.tsx` 文件执行 `reference/style-scan-checklist.md`，发现硬编码颜色、magic number、错误图标名等问题后统一修复。修复时**禁止**为改样式而简化功能
5. **动态表单安全检查**：扫描本次新增/修改的 `.tsx` 文件中所有 `name={[`（数组 name）的 `XlbForm.Item`，检查其直接子组件：
   - `XlbInput` → 必须替换为 `SafeInput`
   - `XlbUploadFile` → 必须替换为 `SafeUploadFile`
   - 未包装则**禁止进入 Phase 05**，修复后重新校验
   - 引用 `reference/gotchas/component-library/safeinput-filter-id.md`
6. **设计定制落实检查**：遍历 tech-design.md 的「组件选择决策表」，对所有标注为「需要额外定制: 是」的项，在对应 `.tsx` 代码中验证补偿方案已实现：
   - 上传组件（XlbUploadFile/SafeUploadFile）：检查是否传入了 `customUpload`、`filesMax`、`uploadText`；数组 name 场景必须用 SafeUploadFile；组件默认已渲染图片缩略图，无需 renderItem/thumbnailSize 等不存在的 props
   - 选择器/单选组：检查是否自定义了容器样式和交互（而非使用 CommonFormItem 默认渲染）
   - 其他标注定制项：逐一验证代码中是否有对应的补偿实现
   - 未找到补偿方案的 → **禁止进入 Phase 05**，列出遗漏的定制项并修复
7. **dependencies 禁用终检**：对本次所有新增/修改的 `.tsx` 文件执行 `grep -rn "dependencies" --include="*.tsx"`。出现任何 `XlbForm.Item` 或 `CommonFormItem` 传入 `dependencies` 的代码 → **禁止进入 Phase 05**，按 `reference/gotchas/component-library/dependencies-kills-label.md` 修复后重新校验
8. **defer/待处理项消费检查**：扫描 `execution.md` 中所有标注为 `defer`、`待处理`、`verify 处理`、`后续处理` 的条目，为每条生成对应的修复动作项。所有 defer 项必须在进入 Phase 05 前闭环（已修复 或 明确标注「设计不可实现-原因」）→ 有未消费的 defer 项则**禁止进入 Phase 05**
9. **偏差库同步检查**（新增）：扫描 `design-deviation-db.json` 中当前需求关联的偏差条目，确认所有 `severity === "critical"` 的条目已有 `处理方案` 或已 `resolved` — 有未处理的 critical 偏差则**禁止进入 Phase 05**
10. **API 响应取值检查**（新增）：对本次新增/修改的 `.ts/.tsx` 文件搜索 `?.data?.data` 模式。如果取到的是 `content`、`total_elements` 等顶层字段的子属性，说明多解了一层 → 按 `reference/gotchas/api-patterns/fsms-response-structure.md` 修正为 `res?.data` 取值，修正后重新校验

**全部通过后**：

- 汇报：「全部 N 个分组已执行，M 个功能点已标记完成，样式合规终检通过，动态表单安全检查通过，dependencies 禁用检查通过，defer 项全部闭环，偏差库已同步，API 响应取值检查通过」
- 更新 `.ai-wiki/.dtc-state.json` 当前需求条目：`build.exitGatePassed = true`, `build.checklistPassed = true`
- 推进 `currentPhase` 到 `verify`

**任一项不通过** → 修正后重新校验

---

## 中断恢复

如果在执行中途被中断：

1. 下次启动时 `Read .ai-wiki/.dtc-state.json`
2. 检查当前需求条目的 `build.completedGroups` 和 `build.currentGroup`
3. 跳到当前未完成的分组
4. **上下文恢复检测**：检查上一个已完成分组的 `htmlReadLog`。如果日志缺失或在旧版格式下为裸 HTML 路径，提示：
   ```
   检测到上一分组可能跳过了样式数据读取步骤（无「解析数据已读」日志），建议重新执行该分组的样式还原部分
   ```
5. 如果用户选择重新执行，重新读取 `parsed-styles` JSON 并对比已生成的代码，修复样式偏差

---

## 禁止

- 未完成所有步骤就汇报分组完成或跳到下一分组。
- 当 `materialStatus` 为 `"complete"` 时，跳过 Step 2 写出无样式的代码。
- Step 2 中未记录「解析数据已读」日志就跳到 Step 3。
- 用硬编码 color/margin/fontSize。
- 删除 `phaseOutputs.design` 中定义的 API 字段。
- 让 `XlbForm.Item` 的 `name` 为数组。
- 向 `XlbForm.Item` / `CommonFormItem` 传入 `dependencies` 或 `shouldUpdate` prop。
- 一次生成过多文件而不更新 checkpoint。
- **跳过 Step 5.5 偏差捕捉直接进入下一个分组。**
