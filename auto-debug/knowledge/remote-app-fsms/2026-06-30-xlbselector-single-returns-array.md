---
project: remote-app-fsms
date: 2026-06-30
files:
  - src/pages/storeInformationRN/Detail/chunks/FoodLicense.tsx
tags:
  - XlbSelector
  - card_type
  - getValueFromEvent
  - rc-field-form
  - 食品经营许可证
  - 单选返回数组
symptoms: 食品经营许可证 OCR 失败后手动填写表单，点击更新保存失败（后端静默无响应）
---

# XlbSelector 单选模式返回数组导致 form 字段值格式不一致

## 症状

食品经营许可证（FoodLicense）页面，OCR 识别失败后手动填写表单信息，点击「更新」按钮保存失败 — 后端返回的响应无 `code` 无 `msg`，前端表现为静默失败。但如果用户不碰证件类型选择器，直接填写其他字段提交则能成功。

## 触发条件

- 页面：证件管理 → 食品经营许可证（Tab key='2'）
- 组件：`FoodLicense.tsx` 中的 `card_type` 字段（XlbSelector 单选）
- 操作：用户触碰（点击）证件类型选择器后，再提交表单

## 根因

XlbSelector 组件内部始终以数组存储 / 返回值（源码 `XlbSelector/index.tsx:131` `useState<SelectorValue[]>`，L150-151 单选模式也返回 `[optionValue]`）。当用户未触碰选择器时，`card_type` 保持 `initialValue` 或 `setFieldsValue` 写入的字符串 `"FOODBUSINESSLICENCE"`；一旦用户轻触选择器，`onChange` 回调将数组 `["FOODBUSINESSLICENCE"]` 写入 form，导致值格式不一致。后端无法解析数组格式，静默失败。

## 修复

在 `Form.Item` 上添加 `getValueFromEvent` 归一化，确保选择器返回值始终是字符串：

```diff
 <XlbForm.Item
   noStyle
   name="card_type"
   initialValue="FOODBUSINESSLICENCE"
+  getValueFromEvent={(val: any) => (Array.isArray(val) ? val[0] : val)}
   rules={[{required: true, message: '请选择证件类型'}]}>
   <XlbSelector options={CARD_TYPE_OPTIONS} placeholder="请选择" />
 </XlbForm.Item>
```
