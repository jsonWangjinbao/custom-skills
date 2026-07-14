# Phase 03 - 技术设计（PC）

## 进入条件

- 已 `Read .ai-wiki/.dtc-state.json`。
- `phaseOutputs.audit.checklistPassed === true` 且 `phaseOutputs.audit.userConfirmed === true`。
- `currentPhase` 为 `design`。
- `inputs.platform === "pc"`。

---

## 任务

### 1. 读取规范

**先读 `../reference/pc/pc-guidelines.md`**，确认组件库、路由、状态、权限、API 调用等约束。

**再读 `../reference/pc/project-conventions.md`**，确认页面文件结构、service 模式、路由注册等项目约定。

### 2. 组件架构设计

设计页面/组件文件结构，输出树状架构图，每个组件标注对应的功能点 ID。

```
src/pages/your-page/
├── index.tsx           // 页面入口（XlbPageContainer / XlbProPageContainer / 自定义布局）— F-001
├── data.tsx            // 列定义、搜索表单配置、枚举 — F-002, F-003
├── server.ts           // API 定义 — F-001 ~ F-005
├── item.tsx            // 新增/编辑弹窗表单 — F-004, F-005
└── index.less          // 页面样式
```

**文件规模控制**：
- 每个文件的预估行数必须标注（如 `index.tsx: ~200-300 行`）
- 预估超过 300 行的文件，必须在文件清单中标注拆分方案或说明为何不拆分
- 分组拆解时，超过 300 行的文件应单独作为一步

### 3. 数据流设计

- **状态管理方案**：页面级 `useState` / `useReactive` 或 Zustand store + immer
- **API 接口定义**：API 规格详见 `api-spec.md §2`。在 design 阶段只需说明状态管理方案和缓存策略，**禁止**在 design 中重新定义参数结构。
- **Service 文件模式**：根据复杂度选择 `server.ts`（default export）或 `service.tsx`（named exports）

**API 定义格式示例**：

```typescript
// server.ts
const server = {
  // F-001: 获取列表
  fetchList: (params: { page: number; size: number; name?: string; status?: number }) =>
    XlbFetch.post('/api/your-module/list', params),
  // F-004: 创建
  create: (params: CreateParams) =>
    XlbFetch.post('/api/your-module/create', params),
  // F-005: 更新
  update: (params: UpdateParams) =>
    XlbFetch.post('/api/your-module/update', params),
  // F-006: 删除
  delete: (params: { id: number }) =>
    XlbFetch.post('/api/your-module/delete', params),
};
```

### 4. 路由设计

- 新增页面必须在 `src/config/route.ts` 的 `routeList` 中注册
- 使用已有 `subMenu` key（`fsmsStore` / `fsmsScm` / `fsmsArchives` / `fsmsData` / `fsmsWms` / `systemCompliance`）
- 默认开启 `keepAlive: true`
- 必须添加 `wrappers: ['@/wrappers/auth']` 权限控制

**路由注册格式示例**：

```tsx
{
  name: '页面中文名',
  path: '/path/to/page',
  component: '@/pages/your-page',
  wrappers: ['@/wrappers/auth'],
  keepAlive: true,
  subMenu: 'fsmsStore',
}
```

### 5. 页面模式确认

根据 `ui-audit.md` 的页面模式识别结果，确认采用的页面模式：

| 页面模式 | 容器组件 | 适用场景 |
|----------|----------|----------|
| Mode A | `XlbPageContainer` | 搜索 + 表格 + 弹窗，需灵活控制 |
| Mode B | `XlbProPageContainer` | 标准 CRUD 一体化 |
| Mode C | 自定义布局 | Dashboard/仪表盘 |

### 6. UI 样式规格

从 `ui-audit.md` 提取每个组件的关键样式决策：

- **PC 项目**：颜色值 → Less 变量（`@color_link` 等），间距/字号/圆角 → 直接使用 CSS px 值
- 无 UI 材料时写：使用项目通用样式，待 UI 材料补充后完善
- **强制要求**：必须逐条写出每个样式值；颜色不得只写 hex

**示例**：

```less
// 组件: 表格操作列
// 样式: 链接按钮
// 颜色: @color_link
// 字号: 14px
// 间距: padding 8px 16px
```

### 7. 组件选择决策表

从 `ui-audit.md` 的「组件选择决策表」输入，对每个 UI 元素明确选用哪个组件库组件或自定义实现：

| UI 元素 | 选用组件 | 默认渲染 | 与 HTML 目标差异 | 是否需要额外定制 | 补偿方案 |
|---------|---------|---------|-----------------|----------------|---------|
| 搜索表单 | XlbForm | — | — | 否 | 直接使用 formList 配置 |
| 编辑表单 | XlbBasicForm | CSS Grid 默认三列 | 可能不匹配设计稿列数 | 是 | 自定义 gridTemplateColumns |
| 数据表格 | XlbTable | 标准表格 | — | 否 | 直接使用 |
| 状态列 | StatusColorByOptions | 颜色标签 | — | 否 | 使用 statusColorOptions 配置 |
| 操作按钮 | XlbButton.Group | — | — | 否 | 直接使用 |
| 新增弹窗 | ProPageModal | 居中弹窗 | — | 否 | 直接使用 |
| 确认删除 | XlbTipsModal | confirm 类型弹窗 | — | 否 | 直接使用 |

此表是 Phase 04 执行时样式还原的直接依据。

### 8. 功能点对照表

| ID | 组件 | 文件路径 | UI 参考 | 状态 |
|----|------|---------|---------|------|
| F-001 | 页面容器 | index.tsx | 列表页.html | 待开发 |
| F-002 | 搜索表单 | index.tsx / data.tsx | 列表页.html | 待开发 |
| F-003 | 数据表格 | index.tsx / data.tsx | 列表页.html | 待开发 |
| F-004 | 新增弹窗 | item.tsx | 新增弹窗.png | 待开发 |
| F-005 | 编辑弹窗 | item.tsx | 编辑弹窗.png | 待开发 |

**当 `ui-audit.md` 记录了 UI 分区结构变更时**，必须在原表的基础上追加一节「UI 结构映射表」：

```markdown
### UI 结构映射表（旧分区 → 新 UI）

| 旧分区（features.md） | 新 UI section/卡片 | 包含功能点 | 备注 |
|------------------------|-------------------|-----------|------|
| Tab1 基本信息 | 基本信息卡片 | F-40, F-41 | — |
| Tab2 高级设置 | 配置区域 | F-42 | — |
```

### 9. 动态表单安全检查

- 如果设计中使用 `XlbBasicForm.Item` 的 `name` 为数组（如 `name={['detail_infos', index, 'name']}`），必须标注安全方案
- 所有数组 name 必须转换为字符串或使用唯一 key
- PC 端无 SafeInput 机制，但需确保动态表单的 name 不会被 DOM 属性污染

### 10. 关注点 / Gotchas

引用 `../reference/pc/pc-guidelines.md` 中的已知约束：

- 组件库封装差异：`@xlb/components` 封装组件的行为与 Ant Design 原生组件不同
- Less 变量使用：颜色必须通过 Less 变量而非 hex
- KeepAlive 行为：页面销毁不触发组件卸载，需要手动刷新
- 权限控制：hasAuth 必须覆盖每个操作按钮

---

## 输出要求

### 文档输出

使用 `../templates/pc/tech-design.md.tpl` 格式生成 `tech-design.md`，包含以下章节：

1. **概述** — 改动范围、涉及模块、目标平台
2. **组件架构** — 树状结构图，标注功能点 ID
3. **数据流** — 状态管理、API 接口定义
4. **路由设计** — 新增路由及参数
5. **页面模式** — Mode A/B/C 确认
6. **UI 样式规格** — 样式决策（Less 变量 + px 值）
7. **组件选择决策表** — 组件选择 + 差异 + 补偿
8. **功能点对照** — ID → 组件 → 文件 → UI 参考 → 状态
9. **关注点** — gotchas 引用

记录 `Phase 03 完成: HH:MM (耗时 MM 分钟)` 到 features.md 的「性能计时日志」。

### 状态更新

更新 `.ai-wiki/.dtc-state.json` 中当前需求条目的 `phaseOutputs.design`：

```jsonc
{
  "fileCount": 5,
  "routeCount": 1,
  "apiCallCount": 4,
  "dynamicFormSafety": "所有数组 name 转换为字符串",
  "pageMode": "mode_a",
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
- [ ] 页面模式已确认（Mode A / B / C）
- [ ] 路由已在 routeList 中注册
- [ ] 功能点对照表已输出
- [ ] 若 UI 分区结构有变更，已输出「UI 结构映射表」
- [ ] 动态表单安全方案已明确
- [ ] 性能计时日志已记录

---

## 用户确认门禁

1. **必须停下来向用户确认**：

   ```
   问题：Phase 03 技术设计完成，共设计 N 个文件、1 条路由、N 个 API 调用，页面模式为 {A/B/C}。
   是否确认开始生成代码？
   选项：
   - 确认，开始生成代码
   - 需要调整（我会输入修改意见）
   ```

2. 用户确认后将 `userConfirmed` 设为 `true`，推进到 `build` 阶段。
3. 如需调整，更新设计并重新确认。

---

## 禁止

- **不能在设计阶段重新定义 api-spec.md 中已定义的参数结构。**
- 不能跳过组件选择决策表
- 不能在样式规格中写死 hex 色值（使用 Less 变量）
- 不能使用 Ant Design 原生组件替代 `@xlb/components` 封装组件
- 不能在路由注册中使用不存在的 subMenu key
