# Phase 05 - H5 自测验证与交付

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
- 导航合规检查：X 分钟
- API 合规检查：X 分钟
- defer 项闭环检查：X 分钟
- 偏差库同步：X 分钟
- 路由注册检查：X 分钟
- 权限检查：X 分钟
- （其他检查项）：X 分钟

在 execution.md 的 verify 区域逐项记录，而非仅记录总时间。

---

### 1. 功能点逐项验证

逐项检查 `features.md` 的功能点：

- 组件是否存在
- API 调用是否正常（请求参数 + 响应字段完整）
- 联动关系是否实现（analyze 阶段标注的联动/依赖）
- 校验规则、事件处理是否保留

### 1.1 API 合规检查

对照 `api-spec.md` 执行以下 4 项检查：

| # | 检查项 | 检查内容 | 违反后果 |
|---|--------|---------|---------|
| 1 | 字段完整性 | 遍历 api-spec.md 中所有 `status !== "spec-only"` 的接口，对照「字段综合映射表」中标注 ✅ 的字段，检查代码中是否均已使用 | 禁止进入下一阶段 |
| 2 | 取值路径 | 对照 api-spec.md 的取值路径配置，检查每个 API 调用的数据提取方式 | 禁止进入下一阶段 |
| 3 | 参数默认值 | 对照 api-spec.md 的请求参数表中标注了默认值的参数，检查代码是否实现了该默认值 | 标记需修复 |
| 4 | mock 残留 | 检查 `status === "available"` 的接口，代码中是否还残留 mock 数据 | 标记需清理 |

**计时规则**：API 合规检查作为一个独立计时项记录：`API 合规检查：X 分钟`

### 2. 视觉还原验证

将实现结果与目标截图做逐项 side-by-side 对比：

- 页面结构（ProPageContainer + XlbNavBar）是否与设计稿一致
- 表单行高、对齐方式是否与 `ui-audit.md` 规格一致
- 组件库控件的默认渲染是否与目标存在偏差
- 组件选择决策表中标注的「需要额外定制」项是否已实现

**UI 还原验证规则：**

- `materialStatus` 为 `"complete"` → UI 样式必须对照还原，不通过则修复后再重新验证
- `materialStatus` 为 `"partial"` → 已覆盖的组件必须还原，未覆盖的标记「UI 待补充」
- `materialStatus` 为 `"skipped"` → 输出提示：「UI 样式尚未还原（用户选择跳过），建议补充 UI 材料后再次启动 skill」

### 3. 样式合规扫描

对本次新增/修改的所有 `.scss` 文件执行扫描：

1. **使用 `Grep` 工具在项目目录内搜索**，不要仅凭肉眼检查
2. 扫描内容：

```bash
# 搜索硬编码 hex 色值（排除 var(--xlb-*) 中的 # 符号）
grep -rn "color:\s*#" --include="*.scss" src/pages/
grep -rn "background:\s*#" --include="*.scss" src/pages/
grep -rn "background-color:\s*#" --include="*.scss" src/pages/
grep -rn "border:\s*.*#" --include="*.scss" src/pages/
grep -rn "border-color:\s*#" --include="*.scss" src/pages/

# 搜索 magic number 值
grep -rn "font-size:\s*[0-9]" --include="*.scss" src/pages/
grep -rn "padding:\s*[0-9]" --include="*.scss" src/pages/
grep -rn "border-radius:\s*[0-9]" --include="*.scss" src/pages/
```

3. 检查每个属性值是否使用了 `var(--xlb-*)` CSS 变量
4. 发现硬编码 → 列出并修复

**修复原则：只改样式表达，不改功能逻辑。**

**例外规则**：如果项目中已有约定使用特定 CSS 变量（如 `--xlb-space-8` 而非 `--xlb-space-8`），遵循项目约定。

### 4. 导航合规检查

扫描所有新增/修改的 `.tsx` 文件：

```bash
grep -rn "history\.push\|history\.replace" --include="*.tsx" src/pages/
```

- 发现 `history.push` 或 `history.replace` → 替换为 `useXlbRouter` hook
- 此检查项必须通过才能标记 `checklistPassed: true`

### 5. 页面结构检查

扫描所有新增的页面级别 `.tsx` 文件，确认：

- 是否使用了 `ProPageContainer` 作为页面容器
- 是否使用了 `XlbNavBar` 作为导航栏（作为 `navBar` prop）
- 列表页是否使用了 `XlbFlatList`
- 表单页是否使用了 `XlbProDetail`
- 导航是否使用 `useXlbRouter`

### 6. defer/待处理项闭环消费

扫描 `execution.md` 全文，收集所有标注为以下关键词的条目：

- `defer`、`待处理`、`verify 处理`、`后续处理`、`待确认`

**对每条 defer 项**：

1. 确认是否已在 build 出口门禁中修复（标记为「已修复」）
2. 若未修复：评估可行性 → 修复代码 → 更新 execution.md 标记为「已修复」
3. 若确认不可实现：在 execution.md 标注「设计不可实现-原因: XXX」

**所有 defer 项必须有明确结论**（已修复 / 不可实现+原因），否则 `checklistPassed` 不可设为 `true`。

### 7. 路由注册检查

- 新增页面是否在 `src/config/route.ts` 的 `FsmsRouteKeys` 中注册
- 跳转是否使用 `useXlbRouter` 的 `push` / `replace` 方法

### 8. 权限检查

- 检查代码中是否遗漏了权限检查（与 features.md 中的权限要求对比）
- 确认 `useHasAuth(['module', 'action'])` 在需要权限控制的组件中已正确使用

### 9. NativeBridge 合规检查

- 检查 WebView 通信相关的 `NativeBridge.postMessage()` 是否符合预期调用方式
- 确认 `onMessage` 监听器正确注册

### 10. 纯函数单测指引（建议项）

当模块包含 ≥3 个纯函数（如数据转换、状态映射、校验规则等）时，建议生成 `__tests__/` 目录的单测文件，覆盖：

- 数据转换函数的输入/输出断言
- 状态映射函数的边界值
- 校验规则的通过/拒绝场景

此项为建议而非强制，在 features.md 的功能点表中标记「可测试纯函数」列即可。

### 11. 偏差库同步

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
    { "item": "无硬编码 hex", "pass": true, "evidence": "所有色值来自 CSS 变量 var(--xlb-*)" },
    { "item": "导航合规", "pass": true, "evidence": "grep 无 history.push 匹配" },
    { "item": "API 合规", "pass": true, "evidence": "字段完整性/取值路径/参数默认值/mock 残留 4 项全通过" },
    { "item": "页面结构", "pass": true, "evidence": "ProPageContainer + XlbNavBar 已使用" },
    { "item": "defer 项闭环", "pass": true, "evidence": "3 项全部已修复" },
    { "item": "路由注册", "pass": true, "evidence": "新页面已注册到 routes.ts" },
    { "item": "权限检查", "pass": true, "evidence": "useHasAuth 已正确使用" },
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

- [ ] 所有功能点已逐项验证（组件存在 + API 完整 + 联动实现）
- [ ] **API 合规检查通过**（字段完整性、取值路径、参数默认值、mock 残留 4 项全通过）
- [ ] 视觉还原已通过 side-by-side 对比（或按 materialStatus 规则处理）
- [ ] 样式合规扫描已通过（无硬编码 hex / magic number）
- [ ] **导航合规检查通过**（无 `history.push` / `history.replace`）
- [ ] **页面结构检查通过**（ProPageContainer + XlbNavBar 已使用）
- [ ] **defer/待处理项全部闭环**（每条均为「已修复」或「不可实现+原因」）
- [ ] 路由已注册且跳转使用 `useXlbRouter`
- [ ] 权限检查通过（useHasAuth 正确使用）
- [ ] NativeBridge 合规检查通过
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
- [x] verify (样式扫描: 通过, 导航合规: 通过, API合规: 通过, defer闭环: 通过, 偏差库: 通过)

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

- 不能绕过未通过的扫描项
- 不能以"UI 材料缺失"为由跳过已覆盖组件的样式检查
- 不能在修复样式时简化功能逻辑
- 不能跳过视觉还原对比直接标记通过
- 不能跳过 defer 项闭环消费
- 不能忽略导航合规检查
- **不能跳过偏差库同步步骤**
- **H5 项目不需要 label 可见性核验（那是 RN XlbForm.Item 的 dependencies 问题）**
- **H5 项目不需要 dependencies 禁用检查（那是 RN 框架的特有问题）**
