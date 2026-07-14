# PC 设计元素到组件映射表

> 快速对照表：设计稿元素 → PC 端对应组件选择。
> 所有组件来自 `@xlb/components`（基于 Ant Design 5 封装）。

## 页面级映射

| 设计元素 | PC 组件 | 使用说明 |
|----------|---------|----------|
| 标准列表页 | `XlbPageContainer` → SearchForm + ToolBtn + Table + ProPageModal | 标准查询列表页，搜索区 + 工具栏 + 数据表格 + 增改弹窗 |
| 集成 CRUD 页面 | `XlbProPageContainer` | 搜索 + 表格 + 详情 + 新增 + 编辑 + 删除 + 导出一体 |
| 仪表盘/自定义布局 | 自定义布局（子组件分区） | 自由布局结构，无固定模式 |

## 表单映射

| 设计元素 | PC 组件 | 使用说明 |
|----------|---------|----------|
| 搜索表单 | `XlbForm` + `formList: SearchFormType[]` | 配置式 searchFormList 定义 |
| 详情/编辑表单 | `XlbBasicForm` + `XlbBasicForm.Item` + CSS Grid | 声明式，CSS Grid repeat(3, 1fr) |
| 文本输入框 | `XlbInput` | 基本文本输入 |
| 下拉选择 | `XlbSelect` | 单选/多选 |
| 日期选择 | `XlbDatePicker` | 日期范围/单日 |
| 文件上传 | `XlbBaseUpload` | 文件上传组件 |
| 输入弹窗选择 | `XlbInputDialog` | 弹窗式选择输入 |
| 树形选择 | `treeModalConfig` | 树形结构弹窗选择 |
| 跨字段联动 | `ProFormDependency` | 表单内条件字段依赖 |

## 操作与交互映射

| 设计元素 | PC 组件 | 使用说明 |
|----------|---------|----------|
| 操作按钮组 | `XlbButton.Group` + `type="primary"` | 工具栏主要操作 |
| 链接操作 | `XlbButton type="link"` | 表格内行操作 |
| 危险操作 | `XlbButton type="link" danger` | 删除等危险确认操作 |
| 下拉操作 | `XlbDropdownButton` | 导出等复合操作分组 |
| 确认弹窗 | `XlbTipsModal` / `fsmsModal` | 操作前确认提示 |
| 消息提示 | `XlbMessage` | 操作结果反馈 |
| 提示气泡 | `XlbTooltip` | 解释性文字提示 |
| 警告提示条 | `XlbAlert` | 页面级提示信息 |
| 蓝色顶栏提示 | `XlbBlueBar` | 顶部蓝色提示条 |
| 抽屉 | `XlbDrawer` | 侧边弹出详情/表单 |

## 数据展示映射

| 设计元素 | PC 组件 | 使用说明 |
|----------|---------|----------|
| 数据表格 | `XlbTable` + `XlbTableColumnProps[]` | 列表数据展示 |
| 状态标签 | `StatusColorByOptions` | 状态字段颜色渲染 |
| 空状态 | `XlbEmpty` | 无数据时占位 |
| 图标 | `XlbIcon` | 系统图标，使用 predefined name |

## 弹窗映射

| 设计元素 | PC 组件 | 使用说明 |
|----------|---------|----------|
| 新增/编辑弹窗 | `ProPageModal` → `XlbProPageModal` | 集成在 XlbPageContainer 内 |
| 通用弹窗 | `XlbModal` | 普通弹窗 |
| 确认弹窗 | `XlbTipsModal` | 含类型：confirm / tips / error / success / warning |
| 自定义弹窗 | `NiceModal` + `fsmsModal` | 复杂业务弹窗（NiceModal.create） |

## 表格列定义映射

| 设计元素 | PC 配置属性 | 使用说明 |
|----------|-------------|---------|
| 普通列 | `{ name, code, width }` | 名称 + 数据字段 + 宽度 |
| 链接列 | `{ name, code, render: linkStyle }` | render 返回 link 类名 |
| 状态列 | `{ name, code, render: StatusColorByOptions }` | 状态颜色渲染 |
| 操作列 | `{ name: '操作', code: 'action', render: buttons }` | 编辑/删除等行操作 |
| 可排序列 | `{ features: { sortable: true } }` | 表头可点击排序 |
| 详情列 | `{ features: { details: true } }` | 点击查看详情 |
| 格式化列 | `{ features: { format: 'date' } }` | 日期/时间/货币格式化 |
| 自动合并行 | `{ features: { autoRowSpan: true } }` | 相同值自动合并行 |

## 样式映射

| 设计属性 | PC 实现 | 说明 |
|----------|---------|------|
| 色值 hex | Less 变量 `@color_link` / `@color_danger` / `@color_warning` / `@color_success` / `@color_invalid` / `@color_init` | 禁止硬编码 hex |
| 间距 px | CSS 原生 px（Less 文件） | 保持设计稿值 |
| 圆角 px | CSS `border-radius: {{N}}px` | Less 文件中直接书写 |
| 字号 px | CSS `font-size: {{N}}px` | Less 文件中直接书写 |
| 弹性布局 | CSS Flexbox（`.row-flex` / `.col-flex`） | 水平/垂直 flex 容器 |
| 网格布局 | CSS Grid `grid-template-columns: repeat(3, 1fr)` | 表单三列布局 |

## 路由与权限映射

| 设计元素 | PC 实现 | 说明 |
|----------|---------|------|
| 页面路由 | `routeList` 数组配置 | 集中式路由注册 |
| 页面保活 | `keepAlive: true` | 页面缓存 |
| 路由权限 | `wrappers: ['@/wrappers/auth']` | 路由级权限 |
| 按钮权限 | `hasAuth(['module', 'action'])` | 按钮级条件渲染 |
| 子菜单 | `subMenu` key（fsmsStore/fsmsScm/fsmsArchives/fsmsData/fsmsWms/systemCompliance） | 菜单归属 |

## 数据流映射

| 设计元素 | PC 实现 | 说明 |
|----------|---------|------|
| 接口请求 | `XlbFetch.post(url, data)` | 统一 POST 请求 |
| 响应判断 | `res?.code === 0` | 成功条件 |
| 状态管理 | Zustand + immer（页面级 store） | 局部状态 |
| 服务层 | `server.ts`（default export object）或 `service.tsx`（named exports） | API 封装 |
| 服务器地址 | `process.env.BASE_URL` | 请求前缀 |

## Modal 创建映射

| 使用场景 | 推荐方案 |
|----------|----------|
| XlbPageContainer 内置弹窗 | `ProPageModal` |
| 复杂自定义弹窗 | `NiceModal.create` + `fsmsModal` |
| 简单确认弹窗 | `XlbTipsModal` |
| 编辑日志弹窗 | `NiceModal.show('edit-log-modal', { id })` |

## 设计稿元素 → 页面模式快速判定

| 设计特征 | 推荐页面模式 |
|----------|-------------|
| 顶部搜索区 + 下方按钮 + 数据表格 | Mode A: XlbPageContainer |
| 搜索 + 表格 + 详情 + 增删改导出一体化 | Mode B: XlbProPageContainer |
| 自定义卡片布局、仪表盘、看板 | Mode C: 自定义布局 |
