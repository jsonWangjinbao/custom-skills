# 技术设计 — {{需求名称}}

> 生成时间: {{当前日期}}
> 生成耗时: MM 分钟

## 1. 概述

- **改动范围**: {{本次改动的范围描述}}
- **涉及模块**: {{模块列表}}
- **目标平台**: H5（UmiJS Max v4 + React 18 + TypeScript + @xlb/components-mobile）

## 2. 组件架构

```
{{组件树状结构，每个组件标注对应的功能点 ID}}
```

**H5 文件组织示例：**

```
feature-name/
├── index.tsx # 页面/组件主文件 (F-001, F-002)
├── index.scss # CSS Module 样式文件 (F-002 样式)
├── store.ts # Zustand store (F-003 状态)
├── server.ts # API 接口封装 (F-002, F-003 API)
└── config.tsx # formList 配置/常量 (F-002 表单配置)
```

**H5 页面容器模式：**

```
ProPageContainer (页面容器)
├── XlbNavBar (导航栏, navBar prop)
├── XlbFlatList / XlbProDetail (列表/表单内容)
└── 自定义内容区
```

## 3. 数据流

- **状态管理**: {{方案描述，使用 Zustand + immer}}
- **API 接口**: API 规格详见 `api-spec.md §2`。使用 `request()` from `umi`，响应结构 `{ code: 0, data, message }`
- **缓存策略**: {{策略描述}}

## 4. 路由设计

- **路由注册**: {{路由路径}} → 已在集中式路由配置 `src/config/route.ts` 中注册
- **导航方式**: 使用 `useXlbRouter` hook（`router.push()` / `router.goBack()` / `router.replace()`）
- **路由参数**: {{参数说明}}

## 5. UI 样式规格

> 从 `ui-audit.md` 提取每个组件的关键样式决策，作为 build 阶段执行时的样式依据。
> **H5 项目**：所有样式值必须映射为 CSS 变量引用（颜色 → `var(--xlb-color-*)`，间距 → `var(--xlb-space-*)`，圆角 → `var(--xlb-border-radius-*)`，字号
→ `var(--xlb-fontSize-*)`）。
> 完整规范见 `reference/h5/h5-guidelines.md`。
> 无 UI 材料时写：使用项目通用样式，待 UI 材料补充后完善。
> **强制要求**：本章节必须逐条写出每个样式值对应的 CSS 变量引用；不得只写 hex 或 px 值。

### {{组件名}} (关联: F-00X)

- **参考**: {{HTML 文件名}} + {{截图文件名}}
- **布局**: {{flex 方向、对齐}}
- **背景**: `var(--xlb-color-*)`
- **圆角**: `var(--xlb-border-radius-*)`
- **字体**: `var(--xlb-fontSize-*)` / `var(--xlb-lineHeight-*)` / `font-weight: {{值}}`
- **间距**: `var(--xlb-space-*)`
- **图标**: 逐条写出图标决策
- {{图标 1 语义}} → `
<XlbIcon type="{{IconKey}}" size="{{size}}px" color="var(--xlb-color-*)" />`
- {{图标 2 语义}} → `
<XlbIcon type="{{IconKey}}" size="{{size}}px" color="var(--xlb-color-*)" />`
- **图片**: 逐条写出图片资源决策
- {{图片 1 语义}} → `<img src="{{路径}}" alt="{{描述}}" />`
- **其他**: {{box-shadow、透明度、动画等特殊样式}}

> 若存在无法映射到 CSS 变量的样式值，在此标注「无 CSS 变量映射：{{原因}} → 处理方案：{{新增变量 / 记录风险 / 其他}}」。
> 若存在无法映射到组件库的图标，在此标注「图标无映射：{{语义}} → 处理方案：{{降级替代 type / 新增本地 SVG / 推动补充图标库}}」。

## 6. 组件选择决策表

> 从 `ui-audit.md` 的「组件库渲染差异分析」章节输入，对每个 UI 元素明确选用哪个 `@xlb/components-mobile` 组件或自定义实现。
> 此表是 build 阶段执行时样式还原的直接依据。执行时如果标注了「需要额外定制」，必须在代码中实现补偿方案。

| UI 元素 | 选用组件 | 默认渲染 | 与 HTML 目标差异 | 是否需要额外定制 | 补偿方案 |
|---------|---------|---------|-----------------|----------------|---------|
| {{页面容器}} | {{ProPageContainer}} | {{标准页面容器}} | {{无差异}} | {{否}} | {{直接使用}} |
| {{导航栏}} | {{XlbNavBar}} | {{标准导航栏}} | {{无差异}} | {{否}} | {{直接使用}} |
| {{Tab 导航}} | {{XlbTabs}} | {{标准 Tab}} | {{无差异}} | {{否}} | {{直接使用}} |
| {{列表}} | {{XlbFlatList}} | {{标准列表}} | {{无差异}} | {{否}} | {{直接使用}} |
| {{表单字段行}} | {{XlbProDetail formList}} | {{默认表单行布局}} | {{行高/间距/对齐由组件库决定}} | {{是}} |
{{使用 className 覆写样式 / 调整 extraProps}} |
| {{图片上传}} | {{XlbUpload}} | {{标准上传区域}} | {{设计稿为缩略图 + 删除按钮}} | {{是}} | {{配置 extraProps 覆写样式}} |
| {{底部按钮}} | {{XlbButtonGroup}} | {{标准按钮组}} | {{无差异}} | {{否}} | {{直接使用}} |

## 7. 功能点对照

| ID | 组件 | 文件路径 | UI 参考 | 状态 |
|----|------|---------|---------|------|
| F-001 | {{组件名}} | {{路径}} | {{截图/HTML 文件名}} | {{待开发/已完成}} |

## 8. 关注点 / Gotchas

- **PostCSS rem 转换**: 颜色/字号/间距/圆角必须使用 `var(--xlb-*)`；无对应 CSS 变量的尺寸值写设计稿原始 px 值，PostCSS pxtorem (rootValue: 75) 自动转换
- **CSS Module 命名冲突**: 使用 `styles.xxx` 引用，避免全局样式污染
- **NativeBridge 通信**: WebView 中通过 `NativeBridge.postMessage()` 与 RN 原生通信
- **useXlbRouter**: 所有导航必须使用 `useXlbRouter` hook，禁止 `history.push`
- **var(--xlb-*)**: 所有颜色/间距/圆角/字号必须使用 CSS 变量，禁止硬编码
- **XlbProDetail formList**: `componentType` 驱动表单渲染，不要手动拼装 XlbForm.Item
- **XlbFlatList**: 通过 `url` + `params` props 驱动数据加载和分页

{{其他关注点…}}