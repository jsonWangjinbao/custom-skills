---
verifiedVersion: "@xlb/components-mobile@1.0.396"
verifiedAt: "2026-07-14"
---
# 动态列表每项需独立子组件管理 hooks

**条件**：表单中有动态数组字段（如 `detail_infos[0]...detail_infos[N]`），用 `map` 渲染多个 item。

**原因**：`useState`、`XlbForm.useWatch` 等 hooks 不能在 `map` 回调中直接调用。每个动态 item 需要自己的 `visible` 状态来独立控制 DatePicker。

**处理**：为动态 item 抽取独立的子组件（如 `ScaleCard`），在子组件内部调用 hooks。父组件通过 props 传递 `index`、`styles` 等。
