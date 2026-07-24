---
verifiedVersion: "@xlb/components-mobile@1.0.396"
verifiedAt: "2026-07-14"
---
# XlbForm cellTheme 控制水平内边距

> 本文件记录 XlbForm 组件通过 `cellTheme` 控制表单项水平内边距的正确方式。
> 违反此规则会导致表单行内容贴边，与设计稿的 `padding: 0 12px` 不符。

---

## 问题背景

XlbForm 下的每个表单项（`XlbForm.Item`）背后由 xiaoshu Cell 组件渲染。
Cell 组件控制水平间距的机制**和直觉不符**：

| 属性 | 在 Cell 中是否生效 | 说明 |
|------|-------------------|------|
| `cell_padding_horizontal` | ❌ **无效** | varCreator 里有定义，但 styleCreator 没有在任何样式中引用它 |
| `cell_group_title_padding_horizontal` | ✅ **真正有效** | 被 `cell_inner` 样式用作 `marginHorizontal`，控制每个行容器的水平间距 |

FormItemContainer 默认把这两个值都设为 `0`，所以不加 cellTheme 时所有表单项贴边。

## 正确写法

覆盖水平内边距时，**两个 key 都要设**（尽管一个有效、一个无效）：

```tsx
<XlbForm
  form={form}
  cellTheme={{
    cell_group_title_padding_horizontal: normalize(12),  // ← 真正生效
    cell_padding_horizontal: normalize(12),               // ← 无效但保持一致性
  }}
/>
```

## 何时触发

当 ui-audit.md 或 parsed-styles 中记录了表单项存在水平 padding 时（如 `padding: 0 12px`），
需要将这个设计值翻译为 `XlbForm` 的 `cellTheme` prop，而不是加到每个 `XlbForm.Item` 的 `style` 上。

## 参考写法（已有页面）

```tsx
// 虫害管理页面 add.tsx（已正常工作）
<XlbForm
  form={form}
  cellTheme={{
    cell_group_title_padding_horizontal: normalize(12),
    cell_padding_horizontal: normalize(12),
  }}
/>
```

## 排查方法

- 表单行内容贴边 → 检查 `XlbForm` 上是否有 `cellTheme` 且含有 `cell_group_title_padding_horizontal`
- 搜索已工作页面（如虫害管理、人员管理等）对比 `cellTheme` 用法
- 确认设的是 `cell_group_title_padding_horizontal` 而非仅设 `cell_padding_horizontal`
