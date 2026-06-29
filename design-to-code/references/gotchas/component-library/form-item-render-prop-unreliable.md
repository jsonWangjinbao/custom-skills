# XlbForm.Item render prop 不可靠，优先用 useWatch + setFieldsValue

**条件**：需要用自定义 UI（如 Chip 按钮）控制表单字段值。

**原因**：`XlbForm.Item` 的 render prop（children as function）在某些场景下不触发或不渲染，导致自定义 UI 消失。依赖 `dependencies` 的属性变化通知也不可靠。

**处理**：使用 `XlbForm.useWatch` 获取响应式值 + `XlbForm.useFormInstance().setFieldsValue` 写入值 + 隐藏的 `XlbForm.Item` 注册字段用于校验。

**正确示例**：
```tsx
const CertTypeChips = () => {
  const form = XlbForm.useFormInstance();
  const value = XlbForm.useWatch('field_name');

  return (
    <View style={{flexDirection: 'row', gap: 8}}>
      {OPTIONS.map(opt => (
        <Pressable
          key={opt.value}
          onPress={() => form.setFieldsValue({field_name: opt.value})}
          style={{backgroundColor: value === opt.value ? '#E5F2FF' : 'rgba(17,20,37,0.05)'}}>
          <Text style={{color: value === opt.value ? '#0080FF' : '#111425'}}>{opt.label}</Text>
        </Pressable>
      ))}
      <XlbForm.Item noStyle name="field_name" rules={[{required: true}]}>
        <View />
      </XlbForm.Item>
    </View>
  );
};
```
