# 技术设计 — {{需求名称}}

> 生成时间: {{当前日期}}
> 生成耗时: MM 分钟

## 1. 概述

- **改动范围**: {{本次改动的范围描述}}
- **涉及模块**: {{模块列表}}
- **目标平台**: PC（UmiJS Max v4 + @xlb/components）

## 2. 组件架构

```
src/pages/your-module/
├── index.tsx            // 页面入口 — F-001
│   ├── XlbPageContainer — F-001
│   │   ├── XlbForm (searchFormList) — F-002
│   │   ├── XlbButton.Group (ToolBtn) — F-003
│   │   ├── XlbTable (columns) — F-004
│   │   └── ProPageModal — F-005
│   │       └── Item (XlbBasicForm) — F-006
├── data.tsx             // 列定义、搜索表单配置、枚举 — F-002, F-004
├── server.ts            // API 定义 — F-001 ~ F-006
├── item.tsx             // 新增/编辑弹窗表单 — F-005, F-006
└── index.less           // 页面样式
```

## 3. 数据流

- **状态管理**: {{useState / useReactive / Zustand store + immer}}
- **API 接口**: API 规格详见 `api-spec.md §2`。此处不重复定义参数结构。
- **Service 文件**: server.ts（default export object）/ service.tsx（named exports）
- **服务器 URL**: `process.env.BASE_URL` 前缀

## 4. 路由设计

```tsx
{
  name: '页面中文名',
  path: '/path/to/page',
  component: '@/pages/your-module',
  wrappers: ['@/wrappers/auth'],
  keepAlive: true,
  subMenu: 'fsmsStore',  // fsmsStore | fsmsScm | fsmsArchives | fsmsData | fsmsWms | systemCompliance
}
```

## 5. 页面模式

| 项 | 值 |
|----|-----|
| 页面模式 | {{Mode A: XlbPageContainer / Mode B: XlbProPageContainer / Mode C: 自定义}} |
| 判定理由 | {{理由}} |

## 6. UI 样式规格

> 从 `ui-audit.md` 提取每个组件的关键样式决策。
> **PC 项目**：颜色值 → Less 变量（`@color_link` 等），间距/字号/圆角 → 直接使用 CSS px 值。
> 无 UI 材料时写：使用项目通用样式，待 UI 材料补充后完善。

### {{组件名}} (关联: F-00X)

- **参考**: {{HTML 文件名}} + {{截图文件名}}
- **布局**: {{flex 方向、对齐}}
- **背景**: `@color_xxx` / #ffffff
- **圆角**: `border-radius: {{N}}px`
- **字体**: `font-size: {{N}}px` / `font-weight: {{N}}`
- **间距**: `padding: {{N}}px` / `margin: {{N}}px`
- **图标**: 逐条写出图标决策
  - {{图标 1 语义}} → `<XlbIcon name="{{iconName}}" />`
- **图片**: 逐条写出图片资源决策
  - {{图片 1 语义}} → `import xxx from './asset/xxx.png'`
- **其他**: {{阴影、透明度等特殊样式}}

## 7. 组件选择决策表

> 从 `ui-audit.md` 的「组件选择决策表」输入。

| UI 元素 | 选用组件 | 默认渲染 | 与 HTML 目标差异 | 是否需要额外定制 | 补偿方案 |
|---------|---------|---------|-----------------|----------------|---------|
| {{搜索表单}} | {{XlbForm}} | {{formList 配置}} | {{无差异}} | {{否}} | {{直接使用}} |
| {{编辑表单}} | {{XlbBasicForm + XlbBasicForm.Item}} | {{Grid 布局}} | {{列数/间距}} | {{是}} | {{自定义 gridTemplateColumns}} |
| {{数据表格}} | {{XlbTable}} | {{标准表格}} | {{无差异}} | {{否}} | {{直接使用}} |
| {{状态列}} | {{StatusColorByOptions}} | {{颜色标签}} | {{无差异}} | {{否}} | {{使用 statusColorOptions}} |
| {{操作按钮}} | {{XlbButton.Group}} | {{按钮组}} | {{无差异}} | {{否}} | {{直接使用}} |
| {{新增弹窗}} | {{ProPageModal}} | {{居中弹窗}} | {{无差异}} | {{否}} | {{直接使用}} |
| {{确认删除}} | {{XlbTipsModal}} | {{confirm 弹窗}} | {{无差异}} | {{否}} | {{直接使用}} |

## 8. 功能点对照

| ID | 组件 | 文件路径 | UI 参考 | 状态 |
|----|------|---------|---------|------|
| F-001 | 页面容器 | index.tsx | {{HTML/截图文件名}} | {{待开发/已完成}} |
| F-002 | 搜索表单 | data.tsx | {{HTML/截图文件名}} | {{待开发/已完成}} |
| F-003 | 工具栏按钮 | index.tsx | {{HTML/截图文件名}} | {{待开发/已完成}} |
| F-004 | 数据表格 | data.tsx | {{HTML/截图文件名}} | {{待开发/已完成}} |
| F-005 | 新增/编辑 | item.tsx | {{HTML/截图文件名}} | {{待开发/已完成}} |
| F-006 | 删除操作 | index.tsx | {{HTML/截图文件名}} | {{待开发/已完成}} |

> 当 UI 分区结构有变更时，追加「UI 结构映射表」章节。

### UI 结构映射表（旧分区 → 新 UI）

| 旧分区（features.md） | 新 UI section/卡片 | 包含功能点 | 备注 |
|------------------------|-------------------|-----------|------|
| {{旧分区名}} | {{新分区名}} | {{F-N}} | {{备注}} |

## 9. 关注点 / Gotchas

- **组件库差异**: `@xlb/components` 封装组件与 Ant Design 原生组件的使用差异
- **Less 变量**: 颜色必须使用 Less 变量而非 hex 值
- **KeepAlive**: 页面保活后不会触发 componentWillUnmount，数据刷新需手动调用
- **权限控制**: 所有操作按钮必须有 hasAuth 包裹
- **动态表单 name**: XlbBasicForm.Item 的 name 必须为字符串，不能是数组
