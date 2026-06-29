---
project: remote-app-fsms
date: 2026-06-24
files:
  - src/pages/storeInformationRN/Detail/index.tsx
  - src/pages/storeInformationRN/Detail/chunks/HealthCert.tsx
tags:
  - HealthCert
  - 员工健康证
  - validateFields
  - TAB_FIELDS
  - shuomingfiles
  - 校验失败
  - 静默错误
symptoms: 员工健康证模式下点击更新无反应，不报错也不提示成功
---

# 员工健康证更新无反应 — TAB_FIELDS 校验了隐藏字段

## 症状

员工健康证 tab（certType = EMPLOYEE_HEALTH）下，新增员工后点击「更新」按钮没有任何反应 — 既不显示错误，也不提示成功。

## 触发条件

- 页面：门店证件信息 → 员工健康证（tab 3）
- 操作：选择「员工健康证」模式 → 新增员工 → 填写信息 → 点击更新
- certType 为默认的 `EMPLOYEE_HEALTH`

## 根因

`TAB_FIELDS['3']` 固定包含 `['healthy_card_type', 'shuomingfiles', 'detail_infos']`，在 `handleSubmit` 中始终校验这三个字段。

当 certType = `EMPLOYEE_HEALTH` 时：
- `shuomingfiles`（店铺说明文件）上传组件被 CSS 隐藏
- 表单中 `shuomingfiles` 值为空数组 `[]`
- 校验规则 `{required: true, message: '请上传附件'}` → 校验失败

同时，catch 块只做了 `console.log`，没有 toast 提示，导致用户完全看不到错误。

## 修复

### 1. 动态校验字段

```diff
-      const fieldNames = TAB_FIELDS[activeKey] || [];
+      let fieldNames = TAB_FIELDS[activeKey] || [];
+      if (activeKey === '3') {
+        const certType = form.getFieldValue('healthy_card_type');
+        const normalized = Array.isArray(certType) ? certType[0] : certType;
+        if (normalized === 'STORE_DESCRIPTION') {
+          fieldNames = ['healthy_card_type', 'shuomingfiles'];
+        } else {
+          fieldNames = ['healthy_card_type', 'detail_infos'];
+        }
+      }
```

### 2. 校验失败 toast 提示

```diff
     } catch (e: any) {
-      console.log('校验失败', e);
+      const firstError = e?.errorFields?.[0];
+      const firstMsg = firstError?.errors?.[0];
+      if (firstMsg) XlbToast.show(firstMsg);
+      console.log('校验失败', e);
     }
```
