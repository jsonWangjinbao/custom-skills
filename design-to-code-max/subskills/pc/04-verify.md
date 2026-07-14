# Phase 05 - 自测验证与交付（PC）

## 进入条件

- 已 `Read .ai-wiki/.dtc-state.json`。
- `phaseOutputs.build.checklistPassed === true` 且 `phaseOutputs.build.exitGatePassed === true`。
- `currentPhase` 为 `verify`。
- `inputs.platform === "pc"`。

---

## 任务

记录 `Phase 05 自测开始: HH:MM` 到 features.md 的「性能计时日志」。

### 验证计时规则

verify 阶段的每个检查项必须单独记录耗时：

- 页面模式检查：X 分钟
- 组件映射检查：X 分钟
- 数据流检查：X 分钟
- 权限覆盖检查：X 分钟
- 列定义完整性检查：X 分钟
- API 合规检查：X 分钟
- 路由注册检查：X 分钟
- defer 项闭环检查：X 分钟

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

| # | 检查项 | 检查内容 | 违反后果 |
|---|--------|---------|---------|
| 1 | 字段完整性 | 遍历 api-spec.md 中所有 `status !== "spec-only"` 的接口，对照「字段综合映射表」中标注 ✅ 的字段，检查代码中是否均已使用 | 禁止进入下一阶段 |
| 2 | 取值路径 | 对照 api-spec.md 的取值路径配置，检查每个 API 调用的数据提取方式 | 禁止进入下一阶段 |
| 3 | 参数默认值 | 对照 api-spec.md 的请求参数表中标注了默认值的参数，检查代码是否实现了该默认值 | 标记需修复 |
| 4 | mock 残留 | 检查 `status === "available"` 的接口，代码中是否还残留 mock 数据 | 标记需清理 |

**计时规则**：API 合规检查作为一个独立计时项记录：`API 合规检查：X 分钟`

### 2. 页面模式验证

验证页面使用的容器组件是否正确：

| 识别模式 | 应使用的容器 | 检查点 |
|----------|-------------|--------|
| Mode A | `XlbPageContainer` | 是否包含了 SearchForm + ToolBtn + Table + ProPageModal |
| Mode B | `XlbProPageContainer` | 是否配置了 searchFormList、columns、request、operateBtnList |
| Mode C | 自定义布局 | 布局结构是否合理，子组件是否独立封装 |

### 3. 组件映射验证

验证设计稿元素到 `@xlb/components` 组件的映射是否正确：

- 搜索表单 → `XlbForm` + `SearchFormType[]`
- 详情/编辑表单 → `XlbBasicForm` + `XlbBasicForm.Item`
- 数据表格 → `XlbTable` + `XlbTableColumnProps`
- 操作按钮 → `XlbButton.Group`
- 确认弹窗 → `XlbTipsModal`
- 页面弹窗 → `ProPageModal` / `NiceModal` + `fsmsModal`

### 4. 数据流验证

验证 API 调用的数据流是否正确：

- 是否使用 `XlbFetch.post(url, data)` 调用
- 成功判断是否为 `res?.code === 0`
- 响应数据路径是否正确（res?.data?.list / res?.data?.total 等）
- Service 文件格式正确（server.ts default export / service.tsx named exports）

### 5. 权限覆盖验证

验证权限控制是否全面：

- `hasAuth(['module', 'create'])` — 新增按钮
- `hasAuth(['module', 'edit'])` — 编辑按钮
- `hasAuth(['module', 'delete'])` — 删除按钮
- `hasAuth(['module', 'export'])` — 导出按钮
- 路由级权限通过 `wrappers: ['@/wrappers/auth']` 控制

### 6. 列定义完整性验证

验证 `XlbTableColumnProps` 列定义是否完整：

- 每个列都有 `name`（表头显示文本）
- 每个列都有 `code`（数据字段 key）
- 操作列有 `width` 和 `fixed`（如需固定右侧）
- 状态列有 `render` + `StatusColorByOptions`
- 链接列有 `render` + `.link` 类名
- 需要排序的列有 `features: { sortable: true }`
- 需要查看详情的列有 `features: { details: true }`

### 7. 路由注册验证

- 新增页面是否在 `src/config/route.ts` 的 `routeList` 中注册
- subMenu 是否为已有 key
- 是否包含 `wrappers` 和 `keepAlive`
- path 是否与其他页面风格一致

### 8. 样式合规验证

扫描本次新增/修改的文件：

- 无色值硬编码（使用 Less 变量 `@color_link` 等）
- 组件均来自 `@xlb/components`，没有直接引用 Ant Design 原生组件
- 字体使用项目默认字体族
- CSS 属性使用原生写法（Less 文件中使用 `border-radius`，非 camelCase）

### 9. defer/待处理项闭环消费

扫描 `execution.md` 全文，收集所有标注为 `defer`、`待处理`、`verify 处理` 的条目：

- 每条 defer 项必须有明确结论（已修复 / 不可实现+原因）
- 所有 defer 项闭环后才能标记 `checklistPassed: true`

### 10. 偏差库同步

1. 读取 `.ai-wiki/design-deviation-db.json`
2. 筛选 `affectedRequirements` 包含当前需求 ID 的条目
3. 对每条偏差检查对应代码中是否落实了 `compensation` 方案
4. 已落实 → `resolved = true`

---

## 输出要求

### 状态更新

更新 `.ai-wiki/.dtc-state.json` 中当前需求条目的 `phaseOutputs.verify`：

```jsonc
{
  "scanResults": [
    { "item": "页面模式", "pass": true, "evidence": "Mode A: XlbPageContainer" },
    { "item": "组件映射", "pass": true, "evidence": "所有组件来自 @xlb/components" },
    { "item": "数据流", "pass": true, "evidence": "XlbFetch + code===0" },
    { "item": "API 合规", "pass": true, "evidence": "字段完整性/取值路径/参数默认值/mock 残留 4 项全通过" },
    { "item": "权限覆盖", "pass": true, "evidence": "4个按钮均有 hasAuth" },
    { "item": "列定义", "pass": true, "evidence": "所有列含 name/code/render" },
    { "item": "路由注册", "pass": true, "evidence": "已注册到 routeList" },
    { "item": "样式合规", "pass": true, "evidence": "无硬编码 hex" },
    { "item": "defer 闭环", "pass": true, "evidence": "0 项 defer" }
  ],
  "pageModePassed": true,
  "componentMappingPassed": true,
  "dataFlowPassed": true,
  "permissionPassed": true,
  "columnDefsPassed": true,
  "routePassed": true,
  "gaps": [],
  "checklistPassed": true
}
```

### Checklist（必须全部满足才能标记 checklistPassed: true）

- [ ] **API 合规检查通过**（字段完整性、取值路径、参数默认值、mock 残留 4 项全通过）
- [ ] 所有功能点已逐项验证
- [ ] 页面模式正确（XlbPageContainer / XlbProPageContainer / 自定义）
- [ ] 组件映射正确（XlbBasicForm.Item / XlbForm formList / XlbTable 等）
- [ ] 数据流正确（XlbFetch + res?.code === 0）
- [ ] 权限覆盖完整（hasAuth 包裹每个操作按钮）
- [ ] 列定义完整（name/code/width/render/features）
- [ ] 路由已注册（routeList + wrappers + keepAlive + subMenu）
- [ ] 样式合规（无硬编码 hex、使用 Less 变量）
- [ ] defer/待处理项全部闭环
- [ ] 偏差库已同步

### 交付

全部通过后：

1. 将当前需求条目的 `currentPhase` 设为 `"done"`，`status` 设为 `"done"`
2. 更新 `updatedAt` 时间戳
3. 输出交付总结：

```markdown
# design-to-code-max 交付总结（PC）

## 完成阶段

- [x] analyze (功能点: N 个)
- [x] api-spec (接口: N 个, available: N, mock: N)
- [x] audit (页面模式: Mode X, 组件决策: N 个)
- [x] design (文件: N 个, 路由: N 个)
- [x] build (分组: N/N, 功能点: N/N)
- [x] verify (页面模式: 通过, 权限覆盖: 通过, API合规: 通过, 路由注册: 通过)

## 生成/修改文件

- `src/pages/.../index.tsx`
- `src/pages/.../data.tsx`
- `src/pages/.../server.ts`
- `src/pages/.../item.tsx`
- `src/pages/.../index.less`

## 性能计时

| 阶段     | 耗时 |
|----------|------|
| analyze  | MM 分钟 |
| audit    | MM 分钟 |
| design   | MM 分钟 |
| build    | MM 分钟 |
| verify   | MM 分钟 |
| **总计** | **MM 分钟** |

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
