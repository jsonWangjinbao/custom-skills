# 技术设计 — {{需求名称}}

> 生成时间: {{当前日期}}
> 生成耗时: MM 分钟

## 1. 概述

- **改动范围**: {{本次改动的范围描述}}
- **涉及模块**: {{模块列表}}
- **目标平台**: {{Web / RN / H5}}

## 2. 组件架构

```
{{组件树状结构，每个组件标注对应的功能点 ID}}
```

## 3. 数据流

- **状态管理**: {{方案描述}}
- **API 接口**: {{接口定义}}
- **缓存策略**: {{策略描述}}

## 4. 路由设计

- {{路由路径}}: {{参数说明}}

## 5. UI 样式规格

> 从 `ui-audit.md` 提取每个组件的关键样式决策，作为 STEP 4 执行时的样式依据。
> **RN 项目**：所有样式值必须映射为 token 引用（颜色 → `theme['xxx']`，间距 → `SPACE.*`，圆角 → `BORDER.*`，字号 → `FONT.*`，阴影 → `SHADOW.*`）。
> 完整规范见 `references/xlb-style-system.md`。
> 无 UI 材料时写：使用项目通用样式，待 UI 材料补充后完善。
> **强制要求**：本章节必须逐条写出每个样式值对应的 token 引用；不得只写 hex 或 px 值。

### {{组件名}} (关联: F-00X)

- **参考**: {{HTML 文件名}} + {{截图文件名}}
- **布局**: {{flex 方向、对齐}}
- **背景**: `theme['{{theme key}}']`
- **圆角**: `BORDER.RADIUS_{{N}}`
- **字体**: `FONT.SIZE_{{N}}` / `FONT.LINE_HEIGHT_{{N}}` / `FONT.BOLD_{{xxx}}`
- **间距**: `SPACE.SPACE_{{N}}`
- **图标**: 逐条写出图标决策
- {{图标 1 语义}} → `
<XlbIcon name="{{GlyphMapKey}}" size={SPACE.SPACE_{{N}}} color={theme['color-xxx']} />`
- {{图标 2 语义}} → `
<XlbIcon name="{{GlyphMapKey}}" size={SPACE.SPACE_{{N}}} color={theme['color-xxx']} />`
- **图片**: 逐条写出图片资源决策
- {{图片 1 语义}} → `Image/XlbImage source={require('{{路径}}')}`
- **其他**: {{阴影 `SHADOW.S{{N}}`、透明度、动画等特殊样式}}

> 若存在无法映射到 token 的样式值，在此标注「无 token 映射：{{原因}} → 处理方案：{{新增 token / 记录风险 / 其他}}」。
> 若存在无法映射到 `iconfontGlyphMap` 的图标，在此标注「图标无映射：{{语义}} → 处理方案：{{降级替代 name / 新增本地 SVG / 推动补充 icon-rn}}」。

## 5.5 组件选择决策表

> 从 `ui-audit.md` 的「组件库渲染差异分析」章节输入，对每个 UI 元素明确选用哪个组件库组件或自定义实现。
> 此表是 STEP 4 执行时样式还原的直接依据。执行时如果标注了「需要额外定制」，必须在代码中实现补偿方案。

| UI 元素 | 选用组件 | 默认渲染 | 与 HTML 目标差异 | 是否需要额外定制 | 补偿方案 |
|---------|---------|---------|-----------------|----------------|---------|
| {{Tab 导航}} | {{XlbTabs}} | {{标准 Tab}} | {{无差异}} | {{否}} | {{直接使用}} |
| {{表单字段行}} | {{CommonFormItem / XlbForm.Item}} | {{组件库默认行布局}} | {{行高/间距/对齐由组件库决定}} | {{是}} |
{{插入 Divider 分隔线 / 自定义行高 / 覆写 labelStyle}} |
| {{上传缩略图}} | {{XlbUploadFile}} | {{文件卡片列表}} | {{HTML 是 52px 缩略图 + 删除按钮}} | {{是}} | {{检查 props 是否支持缩略图模式，否则自定义渲染}} |
| {{选择器按钮组}} | {{CommonFormItem type="selector"}} | {{XlbSelector 2列}} | {{尺寸/间距与 HTML 不一致}} | {{是}} |
{{自定义 itemStyle / activeItemStyle}} |
| {{底部按钮}} | {{XlbButton}} | {{标准按钮}} | {{无差异}} | {{否}} | {{直接使用}} |

> 对「黑盒封装组件」（如 `CommonFormItem`），参考 `references/gotchas/component-library/blackbox-wrapper-component.md` 了解其样式不可控风险。

## 6. 功能点对照

| ID | 组件 | 文件路径 | UI 参考 | 状态 |
|----|------|---------|---------|------|
| F-001 | {{组件名}} | {{路径}} | {{截图/HTML 文件名}} | {{待开发/已完成}} |

## 7. 关注点 / Gotchas

{{引用 references/gotchas/ 中相关的已知问题}}