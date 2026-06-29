# XlbInput 清空按钮不生效 — 禁止依赖 FormItemContainer 注入的 value/onChange

**条件**：`XlbInput` 在 `XlbForm.Item` 内部使用时，点击清空按钮（×）后内容未清除。

**原因**：三层问题叠加：
1. **FormItemContainer 注入 `value || ''`**：把 rc-field-form 的字段值强制转为字符串（`undefined` → `''`），使 XlbInput 始终处于受控模式
2. **iOS shadow value 模式**：iOS 上 XlbInput 用本地 `innerValue` 驱动 TextInput 显示，通过 `useEffect` 将外部 `propsValue` 同步到 `innerValue`
3. **React Native 不批处理原生事件**：`handleClear` 由 `TouchableOpacity.onPressIn` 触发，其中的 `setInnerValue('')` 和 `props.onChange('')` 可能在不同渲染批次执行，导致文字回退

**处理**：创建 `ClearableInput` 包装组件，**丢弃** FormItemContainer 注入的 `value` 和 `onChange`，自己用 `useWatch(name)` 读取表单值 + `onChangeText` 写入表单值。

**正确示例**：
```tsx
const ClearableInput = forwardRef((props: any, ref: any) => {
  const { name, value: _value, onChange: _onChange, onClear, ...rest } = props;
  const formValue = XlbForm.useWatch(name);
  const form = XlbForm.useFormInstance();
  return (
    <XlbInput
      ref={ref}
      value={formValue}
      onChangeText={(text: string) => form.setFieldsValue({ [name]: text })}
      onClear={() => {
        onClear?.();
        form.setFieldsValue({ [name]: '' });
      }}
      {...rest}
    />
  );
});

// 数组字段用 SafeInput 模式：
const SafeInput = forwardRef((props: any, ref: any) => {
  const { id, value: _value, onChange: _onChange, style, onClear, ...rest } = props;
  const formValue = XlbForm.useWatch(id);
  const form = XlbForm.useFormInstance();
  return (
    <XlbInput
      ref={ref}
      value={formValue}
      style={[style, { fontFamily }]}
      onChangeText={(text: string) => form.setFields([{ name: id, value: text }])}
      onClear={() => { onClear?.(); form.setFields([{ name: id, value: '' }]); }}
      {...rest}
    />
  );
});
```
