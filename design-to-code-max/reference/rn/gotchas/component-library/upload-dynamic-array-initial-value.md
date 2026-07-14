# XlbUpload 动态数组字段需要 initialValue={[]}

**条件**：`XlbUpload` 位于动态数组字段中（如 `fooddetail_infos[N].files`）。

**原因**：新增 item 时，表单 `initialValues` 只覆盖初始 item（如 `fooddetail_infos: [{ files: [] }]`），新索引 N≥1 没有对应初始值，`XlbUpload` 收到 `undefined` 导致 `.some()` crash。

**处理**：给 `XlbForm.Item` 显式加 `initialValue={[]}`：
```tsx
<XlbForm.Item noStyle name={['fooddetail_infos', index, 'files']} initialValue={[]}>
  <XlbUpload />
</XlbForm.Item>
```
