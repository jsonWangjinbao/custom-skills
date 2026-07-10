# Phase 03 - 技术设计

## 进入条件

- 已 `Read .ai-wiki/.dtc-state.json`。
- `phaseOutputs.audit.checklistPassed === true` 且 `phaseOutputs.audit.userConfirmed === true`。
- `currentPhase` 为 `design`。

## 任务

### 1. 读取规范

**先读 `reference/rn-guidelines.md`**，确认路由、状态、接口、表单安全等约束。

### 2. 组件架构设计

设计页面/组件文件结构，输出树状架构图，每个组件标注对应的功能点 ID。

### 3. 数据流设计

- 状态管理方案（页面级 zustand store，遵循已有页面模式）
- API 接口定义（请求参数 + 响应字段，不遗漏任何字段）
- 缓存策略

### 4. 路由设计

- 新增页面必须在 `src/config/route.ts` 的 `FsmsRouteKeys` 中注册 key
- 页面间跳转使用 `getRouteName('Fsms', 'YourRouteKey')`

### 5. UI 样式规格

从 `ui-audit.md` 提取每个组件的关键样式决策：

- **RN 项目**：所有样式值必须映射为 token 引用（颜色 → `theme['xxx']`，间距 → `SPACE.*`，圆角 → `BORDER.*`，字号 → `FONT.*`）
- 完整规范见 `reference/xlb-style-system.md`
- 无 UI 材料时写：使用项目通用样式，待 UI 材料补充后完善
- **强制要求**：必须逐条写出每个样式值对应的 token 引用；不得只写 hex 或 px 值

### 6. 组件选择决策表

从 `ui-audit.md` 的「组件库渲染差异分析」输入，对每个 UI 元素明确选用哪个组件库组件或自定义实现：

| UI 元素 | 选用组件 | 默认渲染 | 与 HTML 目标差异 | 是否需要额外定制 | 补偿方案 |
| ------- | -------- | -------- | ---------------- | ---------------- | -------- |
| ...     | ...      | ...      | ...              | ...              | ...      |

此表是 Phase 04 执行时样式还原的直接依据。执行时如果标注了「需要额外定制」，必须在代码中实现补偿方案。

对「黑盒封装组件」，参考 `reference/gotchas/component-library/blackbox-wrapper-component.md`。

#### 组件决策引用规则

tech-design.md 的「组件选择决策表」不重复 ui-audit.md 的完整分析。应：

- 引用 ui-audit.md §5.5 的结论（`组件决策详见 ui-audit.md §5.5`）
- 仅补充 audit 阶段未覆盖的新决策（如 audit 后新增的组件需求）
- 在 tech-design.md 中聚焦于「架构层面的组件组合关系」而非重复单个组件的渲染差异

### 7. 动态表单安全检查

- 如果设计中使用了 `XlbForm.Item` + 数组 `name`（如 `name={['detail_infos', index, 'name']}`），**必须**标注哪些字段的直接子组件需要 `SafeInput` / `SafeUploadFile` 包装
- 引用 `reference/gotchas/component-library/safeinput-filter-id.md`
- 所有数组 name 必须转换为字符串或使用唯一 key

### 8. 功能点对照表

| ID    | 组件 | 文件路径 | UI 参考 | 状态   |
| ----- | ---- | -------- | ------- | ------ |
| F-001 | ...  | ...      | ...     | 待开发 |

### 9. 关注点 / Gotchas

引用 `reference/gotchas/` 下相关的已知问题（组件库陷阱、跨平台差异等）。

## 输出要求

### 文档输出

使用 `templates/tech-design.md.tpl` 格式生成 `tech-design.md`，包含以下章节：

1. **概述** — 改动范围、涉及模块、目标平台
2. **组件架构** — 树状结构图，标注功能点 ID
3. **数据流** — 状态管理、API 接口、缓存策略
4. **路由设计** — 新增路由及参数
5. **UI 样式规格** — token 化的样式决策
6. **5.5 组件选择决策表** — 组件选择 + 差异 + 补偿
7. **功能点对照** — ID → 组件 → 文件 → UI 参考 → 状态
8. **关注点** — gotchas 引用

记录 `Phase 03 完成: HH:MM (耗时 MM 分钟)` 到 features.md 的「性能计时日志」。

### 文件规模预估与拆分规则

tech-design.md 的文件清单必须标注**预估行数区间**（如 `FormItems.tsx: ~400-600 行`）。

- 预估超过 300 行的文件，必须在文件清单中标注拆分方案或说明为何不拆分
- 分组拆解时，超过 300 行的文件应单独作为一步（不与其他文件合并在同一步骤中生成）

### 状态更新

更新 `.ai-wiki/.dtc-state.json` 中当前需求条目的 `phaseOutputs.design`：

```json
{
  "fileCount": 5,
  "routeCount": 2,
  "apiCallCount": 3,
  "dynamicFormSafety": "所有数组 name 转换为字符串；动态字段使用 SafeInput / SafeUploadFile",
  "checklistPassed": true,
  "userConfirmed": false
}
```

同时将 `docPaths.techDesign` 设置为生成的 tech-design.md 路径。

### Checklist（必须全部满足才能标记 checklistPassed: true）

- [ ] tech-design.md 已生成且包含完整章节
- [ ] 组件架构图已输出，每个组件标注功能点 ID
- [ ] API 接口定义包含请求参数和响应字段（不遗漏 `id_card_encrypted`、OCR、上传回调等）
- [ ] 组件选择决策表已输出（含差异分析和补偿方案）
- [ ] 动态表单安全方案已明确（无数组 name，或使用 SafeInput/SafeUploadFile）
- [ ] 路由已在设计中注册（FsmsRouteKeys）
- [ ] 功能点对照表已输出
- [ ] 性能计时日志已记录

## 用户确认门禁

1. **必须停下来向用户确认**：输出文件结构、路由、API 调用、组件决策和动态表单安全方案 summary，使用 `AskUserQuestion` 询问：
   ```
   问题：Phase 03 技术设计完成，共设计 N 个文件、N 条路由、N 个 API。是否确认开始生成代码？
   选项：
   - 确认，开始生成代码
   - 需要调整（我会输入修改意见）
   ```
2. 用户确认后将 `userConfirmed` 设为 `true`，推进到 `build` 阶段。
3. 如需调整，更新设计并重新确认。

## 禁止

- 不能省略 API 返回字段。
- 不能把动态表单项 name 保留为数组而不提供安全方案。
- 不能在样式规格中写死 hex/px 而不用 token。
- 不能跳过组件选择决策表。
