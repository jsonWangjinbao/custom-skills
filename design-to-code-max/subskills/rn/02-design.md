# Phase 06 - 技术设计（RN）

## 进入条件

- 已 `Read .ai-wiki/.dtc-state.json`。
- `phaseOutputs.audit.checklistPassed === true` 且 `phaseOutputs.audit.userConfirmed === true`。
- `currentPhase` 为 `design`。

## 任务

> 上下文预算：本阶段读写遵循 `../../reference/common/context-budget.md`——只定点读取 ui-audit.md 的「组件选择决策表」与「关键样式规格」章节，不整篇回读；tech-design.md 超限时只保留决策结论与理由。

### 1. 读取规范

**先读 `../../reference/rn/rn-guidelines.md`**，确认路由、状态、接口、表单安全等约束。

### 2. 组件架构设计

设计页面/组件文件结构，输出树状架构图，每个组件标注对应的功能点 ID。

### 3. 数据流设计

- 状态管理方案（页面级 zustand store，遵循已有页面模式）
- **API 接口定义**：API 规格详见 `api-spec.md §2`。在 design 阶段只需说明状态管理方案和缓存策略，**禁止**在 design 中重新定义参数结构。
- 缓存策略

### 4. 路由设计

- 新增页面必须在 `src/config/route.ts` 的 `FsmsRouteKeys` 中注册 key
- 页面间跳转使用 `getRouteName('Fsms', 'YourRouteKey')`

### 5. UI 样式规格

从 `ui-audit.md` 提取每个组件的关键样式决策：

- **RN 项目**：所有样式值必须映射为 token 引用（颜色 → `theme['xxx']`，间距 → `SPACE.*`，圆角 → `BORDER.*`，字号 → `FONT.*`）
- 完整规范见 `../../reference/rn/xlb-style-system.md`
- 无 UI 材料时写：使用项目通用样式，待 UI 材料补充后完善
- **强制要求**：必须逐条写出每个样式值对应的 token 引用；不得只写 hex 或 px 值

### 6. 组件选择决策表

从 `ui-audit.md` 的「组件库渲染差异分析」输入，对每个 UI 元素明确选用哪个组件库组件或自定义实现：

| UI 元素 | 选用组件 | 默认渲染 | 与 HTML 目标差异 | 是否需要额外定制 | 补偿方案 |
| ------- | -------- | -------- | ---------------- | ---------------- | -------- |
| ...     | ...      | ...      | ...              | ...              | ...      |

此表是 build 阶段样式还原的直接依据。build 时如果标注了「需要额外定制」，必须在代码中实现补偿方案。

对「黑盒封装组件」，参考 `../../reference/rn/gotchas/component-library/blackbox-wrapper-component.md`。

#### 组件决策引用规则

tech-design.md 的「组件选择决策表」不重复 ui-audit.md 的完整分析。应：

- 引用 ui-audit.md「组件库渲染差异分析」章节的结论（`组件决策详见 ui-audit.md「组件库渲染差异分析」`）
- 仅补充 audit 阶段未覆盖的新决策（如 audit 后新增的组件需求）
- 在 tech-design.md 中聚焦于「架构层面的组件组合关系」而非重复单个组件的渲染差异

### 7. 动态表单安全检查

- 如果设计中使用了 `XlbForm.Item` + 数组 `name`（如 `name={['detail_infos', index, 'name']}`），**必须**标注哪些字段的直接子组件需要 `SafeInput` / `SafeUploadFile` 包装
- 引用 `../../reference/rn/gotchas/component-library/safeinput-filter-id.md`
- 所有数组 name 必须转换为字符串或使用唯一 key

### 8. 功能点对照表

| ID    | 组件 | 文件路径 | UI 参考 | 状态   |
| ----- | ---- | -------- | ------- | ------ |
| F-001 | ...  | ...      | ...     | 待开发 |

**当 `ui-audit.md` 记录了 UI 分区结构变更（如 Tab 数变化、字段重分区）时**，功能点对照表必须在原表的**基础上追加一节「UI 结构映射表」**，将 features.md 的旧分区对应到新 UI 的 section/卡片：

```markdown
### UI 结构映射表（旧分区 → 新 UI）

| 旧分区（features.md） | 新 UI section/卡片 | 包含功能点             | 备注                   |
| --------------------- | ------------------ | ---------------------- | ---------------------- |
| Tab1 基本信息         | Section 0 商品信息 | F-40, F-41             | 拆分自旧 Tab1          |
| Tab1 基本信息         | Section 1 基本信息 | F-42                   | —                      |
| Tab3 问题处理         | Section 2 提报信息 | F-45（相关人信息子块） | ⚠️ F-45 含两个逻辑子块 |
| Tab3 问题处理         | Section 3 问题处理 | F-45（处理信息子块）   | —                      |
```

规则：

- **一个功能点如果跨越多个新 UI 区域**，必须拆成多行（如 F-45 的"处理信息"和"相关人信息"归属不同 section）
- 此表的目的是让 build 阶段看到 F-45 被拆成了两块，不会遗漏子区块
- 不需要到此表到字段粒度（字段粒度的分配表由 build 阶段负责）

### 9. 关注点 / Gotchas

引用 `../../reference/rn/gotchas/` 下相关的已知问题（组件库陷阱、跨平台差异等）。

**当 parsed-styles 中存在 `position: absolute` / `position: fixed` / `position: sticky` 的元素时**，必须在组件架构图中明确指定每个此类元素在 RN 中的实现方案，**不允许写"方案 A 或方案 B"的两可表述**：

| HTML 定位                   | RN 等效方案                          | 何时使用                 |
| --------------------------- | ------------------------------------ | ------------------------ |
| `position: fixed`           | 放在 ScrollView **外部**，用绝对定位 | 始终固定在屏幕某位置不动 |
| `position: sticky`          | ScrollView 的 `stickyHeaderIndices`  | 滚动过某位置后吸顶       |
| `position: absolute` 覆盖层 | 放在 ScrollView **外部**             | 需要覆盖在滚动内容上方   |

**关键规则：**

- 组件架构图中必须标注**每个元素的放置位置**（ScrollView 外 vs ScrollView 内 × 索引号）
- 如果 HTML 中是 `position: absolute` 且需要覆盖内容，RN 中该元素**必须在 ScrollView 外**——不能按 HTML DOM 顺序照搬到 ScrollView 内
- **禁止**在 design 文档中写"X 或 Y"而不选定方案——build 阶段会随机选一个，导致 visual order 错乱

## 输出要求

### 文档输出

使用 `../../templates/rn/tech-design.md.tpl` 格式生成 `tech-design.md`，包含以下章节：

1. **概述** — 改动范围、涉及模块、目标平台
2. **组件架构** — 树状结构图，标注功能点 ID
3. **数据流** — 状态管理、API 接口、缓存策略
4. **路由设计** — 新增路由及参数
5. **UI 样式规格** — token 化的样式决策
6. **组件选择决策表** — 组件选择 + 差异 + 补偿
7. **功能点对照** — ID → 组件 → 文件 → UI 参考 → 状态
8. **关注点** — gotchas 引用

记录 `design 完成: HH:MM (耗时 MM 分钟)` 到 features.md 的「性能计时日志」。

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
- [ ] API 规格已引用 `api-spec.md §2`（不重复定义参数结构，仅链接到 api-spec.md）
- [ ] 组件选择决策表已输出（含差异分析和补偿方案）
- [ ] 动态表单安全方案已明确（无数组 name，或使用 SafeInput/SafeUploadFile）
- [ ] 路由已在设计中注册（FsmsRouteKeys）
- [ ] 功能点对照表已输出
- [ ] **若 UI 分区结构有变更**，已输出「UI 结构映射表」，一个功能点跨越多个新区域时已拆成多行
- [ ] 性能计时日志已记录

## 用户确认门禁

1. **必须停下来向用户确认**：输出文件结构、路由、API 调用、组件决策和动态表单安全方案 summary，使用 `AskUserQuestion` 询问：
   ```
   问题：技术设计完成，共设计 N 个文件、N 条路由、N 个 API。是否确认开始生成代码？
   选项：
   - 确认，开始生成代码
   - 需要调整（我会输入修改意见）
   ```
2. 用户确认后将 `userConfirmed` 设为 `true`，推进到 `build` 阶段。
3. 如需调整，更新设计并重新确认。

## 禁止

- 不能跳过组件选择决策表。
- **不能在设计阶段重新定义 api-spec.md 中已定义的参数结构。**
- 不能把动态表单项 name 保留为数组而不提供安全方案。
- 不能在样式规格中写死 hex/px 而不用 token。
