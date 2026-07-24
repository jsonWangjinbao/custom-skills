---
verifiedVersion: "@xlb/components-mobile@1.0.396"
verifiedAt: "2026-07-14"
---
# 条件分支切换用 useWatch 替代 Form.Item dependencies

**条件**：需要根据某个表单字段的值切换显示不同内容。

**原因**：`XlbForm.Item` 的 `dependencies` prop + render prop 在字段值通过 `form.setFieldsValue` 更新时可能不触发重渲染。

**处理**：在组件顶层用 `XlbForm.useWatch` 监听字段值，直接做条件渲染。
