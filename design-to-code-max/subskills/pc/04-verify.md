# Phase 08 - 自测验证与交付（PC）

## 进入条件

- 已 `Read .ai-wiki/.dtc-state.json`。
- `phaseOutputs.build.checklistPassed === true` 且 `phaseOutputs.build.exitGatePassed === true`。
- `currentPhase` 为 `verify`。
- `inputs.platform === "pc"`。

---

## 任务

记录 `verify 开始: HH:MM` 到 features.md 的「性能计时日志」。

### 验证计时规则

只记录阶段级总耗时（`verify 完成: HH:MM (耗时 MM 分钟)`），不逐项计时。

verify 结束时执行指标汇总并生成 `run-metrics.md`：

```bash
node <skill目录>/scripts/dtc-metrics.mjs end ".ai-wiki/【需求名】" verify --first-pass <true|false> --retries <N>
node <skill目录>/scripts/dtc-metrics.mjs doc ".ai-wiki/【需求名】" ".ai-wiki/【需求名】/features.md" ".ai-wiki/【需求名】/api-spec.md" ".ai-wiki/【需求名】/ui-audit.md" ".ai-wiki/【需求名】/tech-design.md" ".ai-wiki/【需求名】/execution.md"
node <skill目录>/scripts/dtc-metrics.mjs summary ".ai-wiki/【需求名】"
```

---

### 1. 功能点逐项验证

逐项检查 `features.md` 的功能点：

- 组件是否存在
- API 调用是否正常（请求参数 + 响应字段完整）
- 联动关系是否实现
- 权限控制是否到位
- 数据流是否正确（XlbFetch + res?.code === 0）

### 1.1 API 合规检查

对照 `api-spec.md` 执行以下 4 项检查：

| #   | 检查项     | 检查内容                                                                                                                | 违反后果         |
| --- | ---------- | ----------------------------------------------------------------------------------------------------------------------- | ---------------- |
| 1   | 字段完整性 | 遍历 api-spec.md 中所有 `status !== "spec-only"` 的接口，对照「字段综合映射表」中标注 ✅ 的字段，检查代码中是否均已使用 | 禁止进入下一阶段 |
| 2   | 取值路径   | 对照 api-spec.md 的取值路径配置，检查每个 API 调用的数据提取方式                                                        | 禁止进入下一阶段 |
| 3   | 参数默认值 | 对照 api-spec.md 的请求参数表中标注了默认值的参数，检查代码是否实现了该默认值                                           | 标记需修复       |
| 4   | mock 残留  | 检查 `status === "available"` 的接口，代码中是否还残留 mock 数据                                                        | 标记需清理       |

### 1.5 双轴 Review（Standards + Spec，基于真实 git diff）

功能点逐项验证后，对本次改动执行独立 Review（基于真实 `git diff`，不通读全量文件）：

1. **确定审查范围**：`git status` + `git diff`（build 阶段新增/修改的全部文件，对照 `createdFiles` / `modifiedFiles`）。非 Git 目录时仅审查上述文件清单，并在 review.md 标注范围限制。
2. **Standards 轴**（平台规范合规）：
   - `../../reference/pc/pc-guidelines.md` 合规（组件映射、数据流、权限、列定义等后续扫描步骤的结论可作为证据引用）
   - gotchas 命中项已规避（build 阶段加载的 gotcha 条目，如有）
   - **Token 唯一来源**：diff 中无硬编码色值/字号/间距（铁律 2）
   - **铁律 1 功能完整性**：不得以样式合规为由删除/简化既有功能逻辑
   - 组件决策表落实：黑盒组件「差异+补偿方案」均已实现
3. **Spec 轴**（规格对照）：
   - 逐项对照 `features.md` 功能点的验收标准
   - 对照 `ui-audit.md` 视觉关键点
   - `inputs.mode === "full"` 时追加：状态迁移矩阵所有路径已实现、禁止迁移已阻断、失败回滚已验证
4. **Findings 记录**：按 P0-P3 分级，每条含文件/行号/证据/修复建议，置于报告前部；无问题时明确写「未发现问题」，并记录测试缺口与剩余风险。
5. **产物**：按 `../../templates/common/review.md.tpl` 输出 `.ai-wiki/【需求名】/review.md`。
6. **处置**：P0 → 修复后重跑 Review；P1 → 修复或在 review.md 记录接受风险；P2/P3 → 记录即可。Review 结论非「通过/修复后通过」时，禁止标记 `checklistPassed: true`。

### 2. 视觉还原验证

将实现结果与目标截图做逐项 side-by-side 对比：

- 页面结构（容器组件 + 搜索区 + 表格）是否与设计稿一致
- 表格列宽、行高、对齐方式是否与 `ui-audit.md` 规格一致
- 组件库控件的默认渲染是否与目标存在偏差
- 组件选择决策表中标注的「需要额外定制」项是否已实现

**UI 还原验证规则：**

- `materialStatus` 为 `"complete"` → UI 样式必须对照还原，不通过则修复后再重新验证
- `materialStatus` 为 `"partial"` → 已覆盖的组件必须还原，未覆盖的标记「UI 待补充」
- `materialStatus` 为 `"skipped"` → 输出提示：「UI 样式尚未还原（用户选择跳过），建议补充 UI 材料后再次启动 skill」

### 2.5 浏览器验收（Playwright，UI 风险触发时强制）

**触发条件**：`materialStatus === "complete"` 且本次交付包含主路径页面 → 必跑；其余情况可选但推荐。依赖目标项目可本地启动；确无法启动时在 `gaps` 记录原因，不得静默跳过。

1. **准备浏览器环境**：优先复用目标项目已有 Playwright；项目无 Playwright 时使用 xlb-playwright MCP 工具。
2. **启动并打开页面**：本地启动目标项目，浏览器打开本次新增/修改的页面路由。
3. **验收项**（逐项记录证据）：
   - 页面正常打开，无白屏/报错页
   - 核心交互可执行：按 features.md 主路径功能点逐项操作（按钮点击、表单提交、弹窗打开等）
   - 控制台无 error 级日志
   - 无失败的网络请求（4xx/5xx；业务码非 0 的响应需单独标注）
4. **真实截图对比**：对页面关键区域截图，与设计稿截图 side-by-side 对比，记录差异。
5. **新偏差入库**：浏览器验收发现的组件库渲染新偏差，追加到 `.ai-wiki/design-deviation-db.json`（与「11. 偏差库同步」衔接）。
6. **产物**：输出 `.ai-wiki/【需求名】/playwright-report.md`（页面清单、验收项结论、控制台/网络证据、截图对比结论），截图证据存 `.ai-wiki/【需求名】/artifacts/`。

> ❗️ 主流程（页面打开或主路径交互）失败时，**禁止给出通过结论**：先修复再重跑；确属环境阻塞时在 `gaps` 记录并告知用户。

### 3. 页面模式验证

验证页面使用的容器组件是否正确：

| 识别模式 | 应使用的容器          | 检查点                                                      |
| -------- | --------------------- | ----------------------------------------------------------- |
| Mode A   | `XlbPageContainer`    | 是否包含了 SearchForm + ToolBtn + Table + ProPageModal      |
| Mode B   | `XlbProPageContainer` | 是否配置了 searchFormList、columns、request、operateBtnList |
| Mode C   | 自定义布局            | 布局结构是否合理，子组件是否独立封装                        |

### 4. 组件映射验证

验证设计稿元素到 `@xlb/components` 组件的映射是否正确：

- 搜索表单 → `XlbForm` + `SearchFormType[]`
- 详情/编辑表单 → `XlbBasicForm` + `XlbBasicForm.Item`
- 数据表格 → `XlbTable` + `XlbTableColumnProps`
- 操作按钮 → `XlbButton.Group`
- 确认弹窗 → `XlbTipsModal`
- 页面弹窗 → `ProPageModal` / `NiceModal` + `fsmsModal`

### 5. 数据流验证

验证 API 调用的数据流是否正确：

- 是否使用 `XlbFetch.post(url, data)` 调用
- 成功判断是否为 `res?.code === 0`
- 响应数据路径是否正确（res?.data?.list / res?.data?.total 等）
- Service 文件格式正确（server.ts default export / service.tsx named exports）

### 6. 权限覆盖验证

验证权限控制是否全面：

- `hasAuth(['module', 'create'])` — 新增按钮
- `hasAuth(['module', 'edit'])` — 编辑按钮
- `hasAuth(['module', 'delete'])` — 删除按钮
- `hasAuth(['module', 'export'])` — 导出按钮
- 路由级权限通过 `wrappers: ['@/wrappers/auth']` 控制

### 7. 列定义完整性验证

验证 `XlbTableColumnProps` 列定义是否完整：

- 每个列都有 `name`（表头显示文本）
- 每个列都有 `code`（数据字段 key）
- 操作列有 `width` 和 `fixed`（如需固定右侧）
- 状态列有 `render` + `StatusColorByOptions`
- 链接列有 `render` + `.link` 类名
- 需要排序的列有 `features: { sortable: true }`
- 需要查看详情的列有 `features: { details: true }`

### 8. 路由注册验证

- 新增页面是否在 `src/config/route.ts` 的 `routeList` 中注册
- subMenu 是否为已有 key
- 是否包含 `wrappers` 和 `keepAlive`
- path 是否与其他页面风格一致

### 9. 样式合规验证

扫描本次新增/修改的文件：

- 无色值硬编码（使用 Less 变量 `@color_link` 等）
- 组件均来自 `@xlb/components`，没有直接引用 Ant Design 原生组件
- 字体使用项目默认字体族
- CSS 属性使用原生写法（Less 文件中使用 `border-radius`，非 camelCase）

### 10. defer/待处理项闭环消费

扫描 `execution.md` 全文，收集所有标注为 `defer`、`待处理`、`verify 处理` 的条目：

- 每条 defer 项必须有明确结论（已修复 / 不可实现+原因）
- 所有 defer 项闭环后才能标记 `checklistPassed: true`

### 11. 偏差库同步

1. 读取 `.ai-wiki/design-deviation-db.json`
2. 筛选 `affectedRequirements` 包含当前需求 ID 的条目
3. 对每条偏差检查对应代码中是否落实了 `compensation` 方案
4. 已落实 → `resolved = true`

### 12. 产物完整性脚本检查（交付前强制）

在标记 `checklistPassed: true` 之前，必须执行确定性脚本检查（禁止仅凭人工核对宣布完成）：

```bash
node <skill目录>/scripts/dtc-artifacts.mjs check ".ai-wiki/【需求名】" --platform pc --mode "${inputs.mode:-standard}"
```

- 输出 `ok: true` 才能进入交付；`ok: false` 时按 `missingArtifacts` / `stateIssues` 逐项补齐后重跑
- 因外部阻塞无法补齐时，在 `gaps` 中明确记录阻塞项，**禁止口头宣布完成**
- `<skill目录>` 指本 skill 的安装根目录（scripts 与 reference 同级）

---

## 输出要求

### 状态更新

更新 `.ai-wiki/.dtc-state.json` 中当前需求条目的 `phaseOutputs.verify`：

```jsonc
{
  "scanResults": [
    {
      "item": "页面模式",
      "pass": true,
      "evidence": "Mode A: XlbPageContainer",
    },
    {
      "item": "组件映射",
      "pass": true,
      "evidence": "所有组件来自 @xlb/components",
    },
    { "item": "数据流", "pass": true, "evidence": "XlbFetch + code===0" },
    {
      "item": "API 合规",
      "pass": true,
      "evidence": "字段完整性/取值路径/参数默认值/mock 残留 4 项全通过",
    },
    { "item": "权限覆盖", "pass": true, "evidence": "4个按钮均有 hasAuth" },
    { "item": "列定义", "pass": true, "evidence": "所有列含 name/code/render" },
    { "item": "路由注册", "pass": true, "evidence": "已注册到 routeList" },
    { "item": "样式合规", "pass": true, "evidence": "无硬编码 hex" },
    { "item": "defer 闭环", "pass": true, "evidence": "0 项 defer" },
    {
      "item": "浏览器验收",
      "pass": true,
      "evidence": "playwright-report.md 已产出，主流程无失败",
    },
    {
      "item": "双轴 Review",
      "pass": true,
      "evidence": "review.md 已产出，无 P0/P1 遗留",
    },
  ],
  "pageModePassed": true,
  "componentMappingPassed": true,
  "dataFlowPassed": true,
  "permissionPassed": true,
  "columnDefsPassed": true,
  "routePassed": true,
  "gaps": [],
  "checklistPassed": true,
}
```

### Checklist（必须全部满足才能标记 checklistPassed: true）

- [ ] **API 合规检查通过**（字段完整性、取值路径、参数默认值、mock 残留 4 项全通过）
- [ ] 所有功能点已逐项验证
- [ ] 视觉还原已通过 side-by-side 对比（或按 materialStatus 规则处理）
- [ ] **浏览器验收通过**（触发条件命中时必跑；playwright-report.md 已产出，页面打开与主路径交互无失败，控制台无 error，无失败网络请求）
- [ ] 页面模式正确（XlbPageContainer / XlbProPageContainer / 自定义）
- [ ] 组件映射正确（XlbBasicForm.Item / XlbForm formList / XlbTable 等）
- [ ] 数据流正确（XlbFetch + res?.code === 0）
- [ ] 权限覆盖完整（hasAuth 包裹每个操作按钮）
- [ ] 列定义完整（name/code/width/render/features）
- [ ] 路由已注册（routeList + wrappers + keepAlive + subMenu）
- [ ] 样式合规（无硬编码 hex、使用 Less 变量）
- [ ] defer/待处理项全部闭环
- [ ] 偏差库已同步
- [ ] **双轴 Review 通过**（review.md 已产出；无 P0 遗留，P1 已修复或记录接受风险）
- [ ] **产物完整性脚本检查通过**（dtc-artifacts.mjs 输出 `ok: true`）
- [ ] 性能计时日志已记录 `verify 完成: HH:MM (耗时 MM 分钟)`

### 交付

全部通过后：

1. 将当前需求条目的 `currentPhase` 设为 `"done"`，`status` 设为 `"done"`
2. 更新 `updatedAt` 时间戳
3. 输出交付总结：

```markdown
# design-to-code-max 交付总结（PC）

## 完成阶段

- [x] analyze (平台/需求类型确认)
- [x] collect-materials (材料收集完成)
- [x] feature-spec (功能点: N 个)
- [x] api-spec (接口: N 个, available: N, mock: N)
- [x] audit (页面模式: Mode X, 组件决策: N 个)
- [x] design (文件: N 个, 路由: N 个)
- [x] build (分组: N/N, 功能点: N/N)
- [x] verify (视觉还原: 通过, 页面模式: 通过, 权限覆盖: 通过, API合规: 通过, 路由注册: 通过)

## 生成/修改文件

- `src/pages/.../index.tsx`
- `src/pages/.../data.tsx`
- `src/pages/.../server.ts`
- `src/pages/.../item.tsx`
- `src/pages/.../index.less`

## 性能计时

| 阶段              | 耗时        |
| ----------------- | ----------- |
| analyze           | MM 分钟     |
| collect-materials | MM 分钟     |
| feature-spec      | MM 分钟     |
| api-spec          | MM 分钟     |
| audit             | MM 分钟     |
| design            | MM 分钟     |
| build             | MM 分钟     |
| verify            | MM 分钟     |
| **总计**          | **MM 分钟** |

## 剩余风险

- ...

## 需要人工确认

- ...
```

---

## 禁止

- 不能绕过未通过的扫描项
- 不能跳过组件映射检查
- 不能跳过权限覆盖检查
- 不能跳过路由注册检查
- 不能跳过 defer 项闭环消费
- 不能以"UI 材料缺失"为由跳过样式检查
- 不能在浏览器验收主流程失败时给出通过结论（页面打不开/主路径交互失败必须先修复再重跑）
- 不能跳过双轴 Review，或存在未修复 P0 / 未记录接受风险的 P1 时标记 `checklistPassed`
- 不能跳过产物完整性脚本检查，或在脚本输出 `ok: false` 时宣布交付
