# SafeInput 过滤 id 防止 Android nativeID 崩溃

**条件**：`XlbForm.Item` 的数组 `name` 导致 Android nativeID 崩溃。

**原因**：`rc-field-form` 会用数组 `name` 生成字段 `id` 并传给子组件。`id` 传到原生 Android TextInput 映射为 `nativeID`，Android 期望 String 收到 Array 崩溃。

**处理**：用 `forwardRef` 包装 `XlbInput`，解构掉 `id` prop：
```tsx
const SafeInput = forwardRef((props: any, ref: any) => {
  const {id, ...rest} = props;
  return <XlbInput ref={ref} {...rest} />;
});
```
