# UI 完整性审计报告 — {{需求名称}}

> 生成时间: {{当前日期}}
> 生成耗时: MM 分钟
> **整体状态**: {{完整 / 部分缺失 / 跳过}}
>
> 状态定义：
> - **完整**: 所有功能点均有 HTML + 截图覆盖，执行阶段必须按此还原样式
> - **部分缺失**: 部分功能点缺少 UI 材料，已覆盖的必须还原，未覆盖的按通用样式实现
> - **跳过**: 用户明确选择不提供 UI 材料，全部按通用样式实现

## 样式规范引用

> 本报告提取的样式值必须映射为 token 引用，供 build 阶段执行时直接使用。
> - 颜色：hex 值 → `theme['xxx']`（映射见 `reference/rn/token-map.json` colors 字段和 themeObject 字段）
> - 间距：px 值 → `SPACE.SPACE_{{N}}`（映射见 `reference/rn/token-map.json` constants.SPACE 字段）
> - 圆角：px 值 → `BORDER.RADIUS_{{N}}`（映射见 `reference/rn/token-map.json` constants.BORDER 字段）
> - 字号：px 值 → `FONT.SIZE_{{N}}` / `FONT.LINE_HEIGHT_{{N}}` / `FONT.BOLD_{{xxx}}`（映射见 `reference/rn/token-map.json`
constants.FONT 字段）
> - 阴影：`SHADOW.S1 / S2 / S3`（语义见 `reference/rn/xlb-style-system.md`）
> - 图标：HTML/截图中的图标 → `@xlb/icon-rn` 的 `XlbIcon`，`name` 必须是 `iconfontGlyphMap` 中的 key（映射见 `reference/rn/icon-map.md`）
> - 图片：照片/装饰性 PNG/JPG/WebP → `Image` / `XlbImage` + `require`
> - 完整规范见 `reference/rn/xlb-style-system.md` 和 `reference/rn/rn-guidelines.md`
> - **禁止**在 ui-audit 中写死 hex 供执行阶段直接复制；所有样式值必须以 token 形式输出

## 扫描配对清单

| 页面 | HTML 文件 | 截图文件 | 配对状态 |
|------|----------|---------|---------|
| {{页面名}} | {{文件.html ✅ / ⬜ 缺失}} | {{文件.png ✅ / ⬜ 缺失}} | {{✅ 完整 / ⬜ 不完整 / ❌ 缺失}} |

## 功能点 UI 覆盖检查

| ID | 功能 | HTML 文件 | 截图文件 | 状态 |
|----|------|----------|---------|------|
| {{F-N}} | {{功能描述}} | {{文件.html ✅/⬜ 缺失}} | {{文件.png ✅/⬜ 缺失}} | {{完整/不完整/缺失}} |

## 关键样式规格

> 从 HTML 和截图中提取的样式信息，**必须映射为 token 引用**，供 build 阶段执行时直接参考。
> 映射规则见上方"样式规范引用"章节。

### {{组件/页面名}}

- **布局**: {{flex 方向、对齐、间距、gap}}
- **背景**: {{hex 值}} → `theme['{{theme key}}']`
- **圆角**: {{px 值}}px → `BORDER.RADIUS_{{N}}`
- **字体**: {{字号 px 值}}px → `FONT.SIZE_{{N}}` / {{行高 px 值}}px → `FONT.LINE_HEIGHT_{{N}}` / {{字重}} → `FONT.BOLD_{{xxx}}`
- **间距**: {{px 值}}px → `SPACE.SPACE_{{N}}`
- **边框**: {{边框样式、颜色 hex → theme key、宽度}}
- **图标**: 逐条列出组件中用到的图标
- {{图标 1 语义/HTML 元素}} → `XlbIcon name="{{GlyphMapKey}}" size={SPACE.SPACE_{{N}}} color={theme['color-xxx']}`
- {{图标 2 语义/HTML 元素}} → `XlbIcon name="{{GlyphMapKey}}" size={SPACE.SPACE_{{N}}} color={theme['color-xxx']}`
- **图片**: 逐条列出真实图片资源
- {{图片 1 语义/HTML src}} → `Image source={require('{{路径}}')}`
- **其他**: {{阴影 → `SHADOW.S{{N}}`、透明度、特殊效果}}

> 若某样式值无法映射到现有 token，在此明确标注「无 token 映射：{{原因}}」，并在技术设计阶段决定是否新增 token 或记录风险。
> 若图标无法映射到 `iconfontGlyphMap`，在此明确标注「图标无映射：{{HTML 元素/截图位置/语义}} → 处理方案：{{降级替代 / 新增 SVG / 补充 icon-rn}}」。

## 组件库渲染差异分析

> 对每个 UI 元素，检查项目组件库的默认渲染输出与 HTML 目标的差异。
> 重点关注「黑盒封装组件」（如 `CommonFormItem`、`XlbUploadFile`、`XlbCard`），它们的内部布局/间距/行高由组件库决定，使用者无法直接控制。
> 参考 `reference/rn/gotchas/component-library/blackbox-wrapper-component.md` 识别风险。

| UI 元素 | 候选组件库组件 | 默认渲染输出 | 与 HTML 目标的差异 | 是否需要额外定制 | 补偿方案 |
|---------|---------------|------------|-------------------|----------------|---------|
| {{表单字段行}} | {{CommonFormItem type="input"}} | {{XlbForm.Item 默认行布局}} | {{行高不可控、无分隔线、对齐方式取决于组件库}} | {{是}} |
{{插入 Divider / 自定义 XlbForm.Item}} |
| {{上传缩略图}} | {{XlbUploadFile}} | {{文件卡片列表}} | {{HTML 是 52px 缩略图 + 删除按钮}} | {{是}} | {{检查 props 或自定义渲染}} |
| {{Tab 导航}} | {{XlbTabs}} | {{标准 Tab}} | {{无差异}} | {{否}} | {{直接使用}} |
| {{选择器按钮组}} | {{CommonFormItem type="selector"}} | {{XlbSelector 2列}} | {{尺寸/间距与 HTML 不一致}} | {{是}} | {{自定义 itemStyle}}
|

> 差异分析结果将作为 `tech-design.md` 「组件选择决策表」的输入。

## 缺失项汇总

| 序号 | 缺失类型 | 涉及功能点 | 影响分析 |
|------|---------|-----------|---------|
| 1 | {{缺 HTML/缺截图/两者皆缺}} | F-00X | {{功能实现不受影响/样式需要后续补充}} |