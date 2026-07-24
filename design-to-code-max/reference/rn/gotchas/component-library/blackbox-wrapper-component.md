---
verifiedVersion: "@xlb/components-mobile@1.0.396"
verifiedAt: "2026-07-23"
---
# 黑盒封装组件：内部样式不可控

**条件**：使用 `CommonFormItem`、`XlbUploadFile` 等封装了 `XlbForm.Item` + 原生控件的"黑盒"组件，且 HTML 设计稿有精确的行高、分隔线、对齐方式等布局要求。

**原因**：这类组件在内部组合了 `XlbForm.Item` + `XlbInput`/`XlbSelector`/`XlbDatePicker`，其行高、间距、对齐方式、分隔线等布局由组件库默认样式决定，使用者无法通过 props 精确控制。

**典型不可控的样式**：

| 样式维度         | 黑盒组件默认行为           | 常见设计稿要求         | 差异     |
| ---------------- | -------------------------- | ---------------------- | -------- |
| 行高             | 由 `XlbForm.Item` 默认决定 | 48px 固定行高          | 不可控   |
| 字段间分隔线     | 无                         | 1px 灰色分隔线         | 完全缺失 |
| label-value 布局 | 由组件库决定 space-between | 可能需要不同对齐       | 不可控   |
| selector 尺寸    | 固定 176px 宽 / 28px 高    | 设计稿可能有不同尺寸   | 需覆写   |
| date 类型箭头    | 可能不显示 ">"             | 设计稿通常有右箭头提示 | 需自定义 |
| upload 渲染      | 图片缩略图网格（默认即可） | 图片缩略图 + 删除按钮  | 无需定制 |

**处理**：

1. **audit 阶段**：在 `ui-audit.md` 的「组件库渲染差异分析」章节中，对每个使用黑盒组件的 UI 元素标注差异和补偿方案

2. **design 阶段**：在 `tech-design.md` 的「组件选择决策表」中，明确每个元素是使用黑盒组件还是自定义实现

3. **build 阶段**：
   - 如果选择使用黑盒组件，必须在代码中实现补偿方案（如手动插入分隔线、覆写 itemStyle）
   - 如果设计稿要求精确控制行高/分隔线/对齐，优先使用 `XlbForm.Item` + 原生控件（`XlbInput`、`XlbSelector`）自定义实现，而非使用 `CommonFormItem`

4. **verify 阶段**：将渲染结果与目标截图做 side-by-side 对比，确认黑盒组件的默认样式不产生偏差

**正确示例 — 使用黑盒组件 + 补偿分隔线**：

```tsx
// 在 CommonFormItem 之间手动插入分隔线
<View style={{height: StyleSheet.hairlineWidth, backgroundColor: theme['color-line-2']}} />
<CommonFormItem type="input" name="name" label="名称" required />
<View style={{height: StyleSheet.hairlineWidth, backgroundColor: theme['color-line-2']}} />
<CommonFormItem type="input" name="credit_code" label="社会信用代码" required />
```

**正确示例 — 完全自定义实现（精确控制）**：

```tsx
// 不用 CommonFormItem，直接用 XlbForm.Item + XlbInput 自定义
<XlbForm.Item name="name" label="名称" required labelStyle={{...}}>
  <XlbInput style={{textAlign: 'right', ...}} />
</XlbForm.Item>
<View style={{height: StyleSheet.hairlineWidth, backgroundColor: theme['color-line-2']}} />
```

> 注意：选择完全自定义时，需要自行处理 `getValueFromEvent`、`getValueProps` 等表单值转换逻辑，参考 `CommonFormItem` 源码中对应 type 的实现。
