# SafeInput / SafeUploadFile 过滤 id 防止 Android nativeID 崩溃

**条件**：`XlbForm.Item` 使用数组 `name`（如 `['detail_infos', 0, 'name']`）时，其直接子组件是原生组件（`XlbInput`、`XlbUploadFile` 等）。

**原因**：`rc-field-form` 会用数组 `name` 生成字段 `id`（类型为数组）并传给子组件。`id` 传到原生 Android TextInput 映射为 `nativeID`，Android 期望 String，收到 Array 崩溃：`com.facebook.react.bridge.ReadableNativeArray cannot be cast to java.lang.String`。

**受影响组件**：所有直接作为 `XlbForm.Item` 子组件、且内部渲染原生 TextInput 或将 `id` 透传给原生组件的组件：

- `XlbInput` → 内部直接渲染 AndroidTextInput
- `XlbUploadFile` → 内部透传 `id` 到原生组件
- 其他可能透传 `id` 的自定义组件

**不受影响**：`CommonFormItem type="date"`（内部 `DatePickerField` 不透传 `id` 到原生组件）、`CommonFormItem type="selector"`（内部 `XlbSelector` 不透传 `id`）

**处理**：用 `forwardRef` 包装受影响组件，解构掉 `id` prop。建议统一放在 `SafeComponents.tsx` 文件中：

```tsx
// SafeComponents.tsx
import { forwardRef } from "react";
import { XlbInput, XlbUploadFile } from "@xlb/components-react-native";

export const SafeInput = forwardRef((props: any, ref: any) => {
  const { id, ...rest } = props;
  return <XlbInput ref={ref} {...rest} />;
});

export const SafeUploadFile = forwardRef((props: any, ref: any) => {
  const { id, ...rest } = props;
  return <XlbUploadFile ref={ref} {...rest} />;
});
```

**使用示例**：

```tsx
// ❌ 崩溃：数组 name + XlbInput 直接子组件
<XlbForm.Item name={['detail_infos', index, 'name']} label="姓名">
  <XlbInput placeholder="请输入" />
</XlbForm.Item>

// ✅ 正确：用 SafeInput 包装
<XlbForm.Item name={['detail_infos', index, 'name']} label="姓名">
  <SafeInput placeholder="请输入" />
</XlbForm.Item>

// ✅ 正确：字符串 name 不受影响，无需包装
<XlbForm.Item name="name" label="姓名">
  <XlbInput placeholder="请输入" />
</XlbForm.Item>
```

**判断标准**：在代码中使用 `name={[...]}`（数组形式）时，检查 `XlbForm.Item` 的直接子组件：

- 如果是 `XlbInput` → 用 `SafeInput`
- 如果是 `XlbUploadFile` → 用 `SafeUploadFile`
- 如果是 `CommonFormItem type="date"/"selector"` → 无需包装
- 如果是其他自定义组件 → 检查该组件是否透传 `id` 到原生组件
