---
verifiedVersion: "@xlb/components-mobile@1.0.396"
verifiedAt: "2026-07-14"
---
# XlbDatePicker 必须用 DatePickerField 包装 + onConfirm 回填

**条件**：目标代码使用 `XlbDatePicker` 组件，且它在 `XlbForm.Item` 内。

**原因**：`XlbForm.Item` 通过 `FormItemContainer` 给子组件注入 `onChange`（rc-field-form 的字段更新函数）。`XlbDatePicker` 在滚动列时就会调用 `onChange`，触发表单全量重渲染。导致：
1. 所有 `XlbUpload` 实例重渲染，`FormItemContainer` 的 `value || ''` 可能把数组字段值转成空字符串，导致 `.some()` 崩溃
2. `handleConfirm` 中只调用 `onConfirm`，不调用 `onChange`；如果用户打开后直接点"确定"（不滚动），`onConfirm` 为 undefined 则值永远丢失

**处理**：
- 创建 `DatePickerField` 包装组件，**拦截 `onChange` prop**，阻止滚动时表单重渲染
- 通过 `onConfirm` + `form.setFieldsValue` / `form.setFields` 在确认时写入表单值
- 用 `Pressable` 包装触发区域，`visible` + `onClose` 控制显示

**正确示例**：
```tsx
const DatePickerField = (props: any) => {
  const { onChange: _, ...rest } = props;
  return <XlbDatePicker {...rest} />;
};

const form = XlbForm.useFormInstance();
const [visible, setVisible] = useState(false);
const date = XlbForm.useWatch('start_date');

<Pressable onPress={() => setVisible(true)}>
  <XlbText>{date || '请选择'}</XlbText>
  <XlbIcon name="a-OutlineRight" size={14} />
  <XlbForm.Item noStyle name="start_date">
    <DatePickerField
      format="YYYY-MM-DD"
      visible={visible}
      onConfirm={(formattedValue) => {
        form.setFieldsValue({start_date: formattedValue});
      }}
      onClose={() => setVisible(false)}
    />
  </XlbForm.Item>
</Pressable>
```

**嵌套数组字段**：用 `form.setFields` 精确更新：
```tsx
onConfirm={(formattedValue) => {
  form.setFields([{name: ['detail_infos', index, 'start_date'], value: formattedValue}]);
}}
```
