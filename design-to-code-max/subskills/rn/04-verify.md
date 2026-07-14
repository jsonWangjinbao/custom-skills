# Phase 05 - 自测验证与交付

## 进入条件

- 已 `Read .ai-wiki/.dtc-state.json`。
- `phaseOutputs.build.checklistPassed === true` 且 `phaseOutputs.build.exitGatePassed === true`。
- `currentPhase` 为 `verify`。

---

## 任务

记录 `Phase 05 自测开始: HH:MM` 到 features.md 的「性能计时日志」。

### 验证计时规则

verify 阶段的每个检查项必须单独记录耗时：

- TSC 编译检查：X 分钟
- 样式合规扫描：X 分钟
- 动态表单安全检查：X 分钟
- 图标清单完整性检查：X 分钟
- dependencies 禁用检查：X 分钟
- API 合规检查：X 分钟
- defer 项闭环检查：X 分钟
- label 可见性逐字段核验：X 分钟
- 偏差库同步：X 分钟（新增）
- （其他检查项）：X 分钟

在 execution.md 的 verify 区域逐项记录，而非仅记录总时间。

---

### 1. 功能点逐项验证

逐项检查 `features.md` 的功能点：

- 组件是否存在
- API 调用是否正常（请求参数 + 响应字段完整）
- 联动关系是否实现（analyze 阶段标注的联动/依赖）
- 校验规则、事件处理、OCR、上传回调是否保留

### 1.1 API 合规检查

对照 `api-spec.md` 执行以下 4 项检查：

| # | 检查项 | 检查内容 | 违反后果 |
|---|--------|---------|---------|
| 1 | 字段完整性 | 遍历 api-spec.md 中所有 `status !== "spec-only"` 的接口，对照「字段综合映射表」中标注 ✅ 的字段，检查代码中是否均已使用（列表页/详情页/表单页逐项比对） | 禁止进入下一阶段 |
| 2 | 取值路径 | 对照 api-spec.md 的取值路径配置，扫描代码中每个 API 调用的数据提取方式（`res?.data?.content` vs `res.data`），确认未多解或少解一层 | 禁止进入下一阶段 |
| 3 | 参数默认值 | 对照 api-spec.md 的请求参数表中标注了默认值的参数，检查代码是否实现了该默认值（如列表页默认当月日期范围） | 标记需修复 |
| 4 | mock 残留 | 检查 `status === "available"` 的接口，代码中是否还残留 mock 数据 | 标记需清理 |

**计时规则**：API 合规检查作为一个独立计时项记录：`API 合规检查：X 分钟`

### 2. 视觉还原验证

将实现结果与目标截图做逐项 side-by-side 对比：

- 卡片内部结构（标题→分隔线→字段行→分隔线）是否与 HTML 一致
- 表单行高、对齐方式是否与 `ui-audit.md` 规格一致
- 组件库控件的默认渲染是否与目标存在偏差
- 组件选择决策表中标注的「需要额外定制」项是否已实现

**UI 还原验证规则：**

- `materialStatus` 为 `"complete"` → UI 样式必须对照还原，不通过则修复后再重新验证
- `materialStatus` 为 `"partial"` → 已覆盖的组件必须还原，未覆盖的标记「UI 待补充」
- `materialStatus` 为 `"skipped"` → 输出提示：「UI 样式尚未还原（用户选择跳过），建议补充 UI 材料后再次启动 skill」

#### 2.1 label 可见性逐字段核验（必须执行）

对所有生成的表单页面，**逐字段确认**以下内容：

1. 每个 `XlbForm.Item` / `CommonFormItem` 的 `label` prop 在运行时是否会被渲染。
2. 验证方式：检查该 Item 是否传入了 `dependencies`、`shouldUpdate`、render prop（children as function）。如有任何一项，则 label 不会渲染——必须修复。
3. 核验范围：所有新增/修改的 `.tsx` 文件中的每个表单字段。
4. 对比来源：`ui-audit.md` 中列出的字段 label 列表。每个字段 label 必须在运行时可见。

**未通过处理**：列出 label 缺失的字段，按 `../reference/rn/gotchas/component-library/dependencies-kills-label.md` 修复后重新验证。

### 3. 样式合规扫描

执行 `../reference/rn/style-scan-checklist.md` 的完整扫描，对本次新增/修改的所有 `.ts/.tsx` 文件逐条检查。

**使用 `Grep` 工具在项目目录内搜索**，不要仅凭肉眼检查。

**修复原则：只改样式表达，不改功能逻辑。**

**项目约定例外**：如果项目已建立某种约定模式（如全项目使用 `normalize()` 而非 `SPACE.*` 常量），则遵循项目约定，在扫描报告中标注「项目约定模式，跳过」。

### 4. 动态表单安全终检

扫描所有新增/修改的 `.tsx` 文件：

- 搜索 `name={[` 确认无数组 name 的 `XlbForm.Item`
- 如有数组 name，检查直接子组件是否为 `SafeInput` / `SafeUploadFile`
- 引用 `../reference/rn/gotchas/component-library/safeinput-filter-id.md`

### 5. dependencies 禁用终检

对所有新增/修改的 `.tsx` 文件执行：

```bash
grep -rn "dependencies" --include="*.tsx" src/pages/
```

- 出现任何 `XlbForm.Item` / `CommonFormItem` 传入 `dependencies` → 按 `../reference/rn/gotchas/component-library/dependencies-kills-label.md` 修复
- 此检查项必须通过才能标记 `checklistPassed: true`

### 6. defer/待处理项闭环消费

扫描 `execution.md` 全文，收集所有标注为以下关键词的条目：

- `defer`、`待处理`、`verify 处理`、`后续处理`、`待确认`

**对每条 defer 项**：

1. 确认是否已在 build 出口门禁中修复（标记为「已修复」）
2. 若未修复：评估可行性 → 修复代码 → 更新 execution.md 标记为「已修复」
3. 若确认不可实现：在 execution.md 标注「设计不可实现-原因: XXX」（如"组件库无此 prop"/"RN 平台限制"）

**所有 defer 项必须有明确结论**（已修复 / 不可实现+原因），否则 `checklistPassed` 不可设为 `true`。

### 7. 图标清单完整性门禁

verify 阶段必须执行图标完整性检查：

- 扫描所有生成代码中使用的 XlbIcon name
- 对比 ui-audit.md 的图标清单
- 若代码使用了 audit 未列出的图标，验证该图标在 @xlb/icon-rn 中存在后，追加到 ui-audit.md 图标清单中
- 若图标不存在于组件库，标记为 ❌ 并回退到 build 阶段修复

### 8. 路由注册检查

- 新增页面是否在 `src/config/route.ts` 的 `FsmsRouteKeys` 中注册
- 跳转是否使用 `getRouteName('Fsms', key)`

### 9. 纯函数单测指引（建议项）

当模块包含 ≥3 个纯函数（如 stripPrefix、getCertificateStateStyle、日期校验等）时，建议生成 `__tests__/` 目录的单测文件，覆盖：

- 数据转换函数的输入/输出断言
- 状态映射函数的边界值
- 校验规则的通过/拒绝场景

此项为建议而非强制，在 features.md 的功能点表中标记「可测试纯函数」列即可。

### 10. 偏差库同步（新增）

verify 阶段结束时执行偏差库同步：

1. 读取 `.ai-wiki/design-deviation-db.json`
2. 筛选 `affectedRequirements` 包含当前需求 ID 的条目
3. 对每条偏差：
   - 检查对应代码中是否落实了 `compensation` 方案
   - 已落实 → `resolved = true`, `verifyCount++`
   - 未落实 → 标记为未闭环，列出需要修复的偏差
4. 更新 `design-deviation-db.json`

**规则**：
- 所有 `severity === "critical"` 的偏差必须先 resolved 才能交付
- `severity === "major"` 的偏差如果无法修复，需在 execution.md 标注「设计不可实现-原因」
- 记录偏差库同步耗时到验证计时

---

## 输出要求

### 状态更新

更新 `.ai-wiki/.dtc-state.json` 中当前需求条目的 `phaseOutputs.verify`：

```jsonc
{
  "scanResults": [
    { "item": "无硬编码 hex", "pass": true, "evidence": "所有色值来自 theme" },
    { "item": "dependencies 禁用", "pass": true, "evidence": "grep 无匹配" },
    { "item": "defer 项闭环", "pass": true, "evidence": "3 项全部已修复" },
    {
      "item": "label 可见性",
      "pass": true,
      "evidence": "所有表单字段 label 已核验可见"
    },
    {
      "item": "上传组件保留删除功能",
      "pass": false,
      "evidence": "缺少 showDelete 属性",
      "fix": "XlbUploadFile 传入 showDelete"
    },
    {
      "item": "偏差库同步",
      "pass": true,
      "evidence": "2 条偏差已 verified"
    }
  ],
  "styleScanPassed": true,
  "dynamicFormPassed": true,
  "gaps": [],
  "checklistPassed": true
}
```

### Checklist（必须全部满足才能标记 checklistPassed: true）

- [ ] **API 合规检查通过**（字段完整性、取值路径、参数默认值、mock 残留 4 项全通过）
- [ ] 所有功能点已逐项验证（组件存在 + API 完整 + 联动实现）
- [ ] 视觉还原已通过 side-by-side 对比（或按 materialStatus 规则处理）
- [ ] **label 可见性逐字段核验通过**（所有表单字段的 label 在运行时可见）
- [ ] 样式合规扫描已通过（无硬编码 hex / magic number / 错误图标名）
- [ ] 动态表单安全已通过（无数组 name 或已使用 SafeInput/SafeUploadFile）
- [ ] **dependencies 禁用终检通过**（无 XlbForm.Item/CommonFormItem 传入 dependencies）
- [ ] **defer/待处理项全部闭环**（每条均为「已修复」或「不可实现+原因」）
- [ ] 图标清单完整性已通过（代码使用图标均存在于 @xlb/icon-rn 且已同步到 ui-audit.md）
- [ ] 路由已注册且跳转使用 getRouteName
- [ ] **偏差库已同步**（当前需求关联的偏差已 verified 或已标注原因）
- [ ] 性能计时日志已记录 `Phase 05 自测完成: HH:MM (实际 MM 分钟)`

### 未通过处理

如果扫描不通过：

- `checklistPassed` 置为 `false`
- 列出必须修复项到 `gaps` 数组
- 修复后重新验证
- **禁止绕过未通过的扫描项**
- **禁止以"UI 材料缺失"为由跳过样式检查**（标记「UI 待补充」的除外）

### 交付

全部通过后：

1. 将当前需求条目的 `currentPhase` 设为 `"done"`，`status` 设为 `"done"`
2. 更新 `updatedAt` 时间戳
3. 输出交付总结：

```markdown
# design-to-code-max 交付总结

## 完成阶段

- [x] analyze (功能点: N 个)
- [x] api-spec (接口: N 个, available: N, mock: N)
- [x] audit (组件决策: N 个, 黑盒风险: N 个)
- [x] design (文件: N 个, 路由: N 个)
- [x] build (分组: N/N, 功能点: N/N)
- [x] verify (样式扫描: 通过, 动态表单: 通过, API合规: 通过, label核验: 通过, defer闭环: 通过, 偏差库: 通过)

## 生成/修改文件

- `src/pages/...`
- `src/components/...`

## 性能计时

| 阶段     | 耗时               |
| -------- | ------------------ |
| analyze  | MM 分钟            |
| audit    | MM 分钟            |
| design   | MM 分钟            |
| build    | MM 分钟 (N 个分组) |
| verify   | MM 分钟            |
| **总计** | **MM 分钟**        |

## 剩余风险

- ...

## 需要人工确认

- ...
```

---

## 禁止

- 不能绕过未通过的扫描项。
- 不能以"UI 材料缺失"为由跳过已覆盖组件的样式检查。
- 不能在修复样式时简化功能逻辑。
- 不能跳过视觉还原对比直接标记通过。
- 不能跳过 label 可见性核验。
- 不能跳过 defer 项闭环消费。
- 不能忽略 dependencies 禁用检查。
- **不能跳过偏差库同步步骤。**
