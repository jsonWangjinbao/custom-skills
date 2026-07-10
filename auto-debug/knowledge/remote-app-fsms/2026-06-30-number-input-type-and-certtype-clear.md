---
project: remote-app-fsms
date: 2026-06-30
files:
  - src/pages/storeInformationRN/components/shared/UnifiedInput.tsx
  - src/pages/storeInformationRN/Detail/chunks/HealthCert.tsx
tags:
  - UnifiedInput
  - XlbInput
  - number类型
  - TextInput
  - STORE_DESCRIPTION
  - shuomingfiles
  - 表单回填
  - certType切换
  - measuring_scale_quantity
  - useWatch
symptoms: 计量秤数量保存后回到详情页不回填（显示空白），切换为店铺说明文件保存后回到详情页图片不回填
---

# 计量秤数量 + 店铺说明文件图片回填失败

## 症状

1. 计量秤证件 tab 下填写计量秤数量保存成功后，返回列表页再进入详情页，计量秤数量未回填（输入框空白）
2. 员工健康证 tab 下切换到店铺说明文件，上传图片保存后，返回列表页再进入详情页，图片未回填

## 触发条件

- 页面：门店证件信息 → 计量秤证件（tab 4）/ 员工健康证（tab 3）
- 组件：WeighingCert / HealthCert
- 操作：保存后返回列表页，重新进入详情页

## 根因

### Bug 1：UnifiedInput 未处理 number 类型 value

后端 API 返回的 `measuring_scale_quantity` 是 `number` 类型（如 `222`）。`UnifiedInput` 通过 `useWatch` 读取后直接传给 `XlbInput`，最终传入 RN `TextInput` 的 `value` 属性。RN `TextInput` 要求 `value` 为 `string`，传入 `number` 时不会渲染文本内容，表现为输入框空白。

### Bug 2：certType 切换 useEffect 在 API 回填后又清空数据

时序：
1. 首次渲染 → `certType = "EMPLOYEE_HEALTH"`，`skipClear = true`
2. 500ms 后 `skipClear = false`
3. API 返回 → `setFieldsValue({healthy_card_type: "STORE_DESCRIPTION", shuomingfiles: [10图]})`
4. `certType` 从 `"EMPLOYEE_HEALTH"` 变为 `"STORE_DESCRIPTION"` → 切换 useEffect 触发
5. `prevCardType ≠ certType` → 执行 else 分支：`form.setFieldsValue({shuomingfiles: []})`，刚回填的图片被清空

## 修复

### 修复 1：UnifiedInput value 类型转换

```diff
- value={formValue}
+ value={typeof formValue === 'number' ? String(formValue) : (formValue ?? '')}
```

### 修复 2：切换到店铺说明文件时不清空 shuomingfiles

```diff
  } else {
-   form.setFieldsValue({shuomingfiles: []});
    form.setFields([
```
