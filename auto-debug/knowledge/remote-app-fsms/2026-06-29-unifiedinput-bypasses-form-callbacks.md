---
project: remote-app-fsms
date: 2026-06-29
files:
  - src/pages/storeInformationRN/components/shared/UnifiedInput.tsx
  - src/pages/storeInformationRN/Detail/index.tsx
  - src/pages/storeInformationRN/Detail/validationErrorsStore.ts
tags:
  - UnifiedInput
  - form.setFields
  - onValuesChange
  - onFieldsChange
  - useWatch
  - rc-field-form
  - 校验错误清除
  - 红色提示词
  - 表单校验
  - iOS shadow value
symptoms: 必填项未填点更新出现红色校验提示后，重新输入内容红色提示不消失；再次点更新直接成功
---

# UnifiedInput 绕过 form 回调导致校验错误无法清除

## 症状

1. 必填表单项留空，点击「更新」→ 出现红色校验提示词（预期）
2. 在输入框中重新输入内容 → 红色校验提示仍然存在（Bug）
3. 再次点击「更新」→ 直接提交成功（因为值已填好，但错误提示未清除，用户困惑）

## 触发条件

- 页面：证件管理 > 门店证件详情（任意 tab）
- 组件：`UnifiedInput`（所有使用该组件的表单字段）
- 操作：留空必填字段 → 点更新 → 输入框中重新输入

## 根因

`UnifiedInput` 为修复 iOS shadow value bug（`XlbInput` 内置 `handleClear` 的 `setInnerValue` 被 `useEffect` 回退），使用 `form.setFields()` 直写 rc-form store，**绕过**了 `FormItemContainer` 注入的 `onChange`。这个路径同样绕过了 rc-form 的全部三个回调：
- `XlbForm.onValuesChange` — 不触发
- `XlbForm.onFieldsChange` — 不触发
- `XlbForm.useWatch()` 顶层订阅 — 不触发

因此 `onValuesChange` 中清除校验错误的逻辑从未执行。`DatePickerField` 和 `SafeUpload` 使用标准的注入 `onChange`，不受影响。

## 修复

在 `UnifiedInput` 中的 `onChangeText` 和 `onClear` 处直接调用 `clearError`：

```diff
+ import useValidationErrorsStore from '../../Detail/validationErrorsStore';

  onChangeText={(text: string) => {
    form.setFields([{ name: fieldKey, value: text }]);
+   useValidationErrorsStore.getState().clearError(fieldKey);
  }}
  onClear={() => {
    onClear?.();
    form.setFields([{ name: fieldKey, value: '' }]);
+   useValidationErrorsStore.getState().clearError(fieldKey);
  }}
```

同时 `validationErrorsStore` 新增 `clearErrorTree` 方法（前缀匹配清除嵌套数组后代错误），用于 `onValuesChange` 中处理 `DatePickerField`/`SafeUpload` 触发的变更：

```diff
+ clearErrorTree: (name) =>
+   set((state) => {
+     const prefix = serializeName(name);
+     const next = { ...state.errors };
+     let changed = false;
+     for (const k of Object.keys(next)) {
+       if (k === prefix || k.startsWith(prefix + '.')) {
+         delete next[k];
+         changed = true;
+       }
+     }
+     return changed ? { errors: next } : state;
+   }),
```

```diff
  onValuesChange={(changedValues: any) => {
    Object.keys(changedValues).forEach(key => {
-     useValidationErrorsStore.getState().clearError(key);
+     useValidationErrorsStore.getState().clearErrorTree(key);
    });
  }}
```

## 设计要点

两路清除覆盖全部表单控件：
- **UnifiedInput**：在 `onChangeText`/`onClear` 中直接 `clearError(fieldKey)`
- **DatePickerField / SafeUpload**：通过 `onValuesChange → clearErrorTree(key)` 清除
