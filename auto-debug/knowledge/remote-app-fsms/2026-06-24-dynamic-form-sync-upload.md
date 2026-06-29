---
project: remote-app-fsms
date: 2026-06-24
files:
  - src/pages/storeInformationRN/Detail/chunks/WeighingCert.tsx
  - src/pages/storeInformationRN/Detail/chunks/HealthCert.tsx
tags:
  - XlbUpload
  - customUpload
  - SafeUpload
  - 计量秤证件
  - 健康证
  - 表单回填
  - useWatch
  - setFieldsValue
  - rc-field-form
symptoms: 新增多条动态表单项后保存，重新进入只显示1条；上传图片保存后重新进入不显示
---

# 动态表单项回填失败 + 图片上传显示失败

## 症状

1. 在计量秤证件/员工健康证页面新增 N 条数据、上传图片、保存成功
2. 返回列表页再重新进入，只显示 1 条数据
3. 上传的图片在重新进入后不显示（显示空白）

## 触发条件

- 页面：门店证件信息 → 计量秤检定证件（tab 4）或员工健康证（tab 3）
- 组件：WeighingCert / HealthCert，使用动态列表 + SafeUpload
- 操作：新增多条 → 上传图片 → 更新 → 返回 → 重新进入

## 根因

### Bug 1：动态列表项数量不匹配

`scales` / `employees` 是本地 `useState`，初始化为 `[{}]`，从未与表单 `fooddetail_infos` / `detail_infos` 同步。
API 返回 N 条数据 → `form.setFieldsValue` 正确写入表单 → 但本地状态仍为 `[{}]` → 只渲染 1 个卡片。

另外，`rc-field-form` 的 `useWatch('fooddetail_infos')` 对深层嵌套数组的 `setFieldsValue` 触发不可靠（不会触发 re-render），依赖 `useWatch` 的 `useEffect` 不会执行。

### Bug 2：图片未云端上传

`SafeUpload` 没有 `customUpload`。`XlbUpload` 选择图片后只记录本地 `file.path`（如 `content://...`），没有上传到 OSS。
提交时本地路径以 JSON 发送给 API，服务端无法持久化这些本地临时路径。重新加载时 API 返回的 `files` 字段全为 null。

## 修复

### 修复 1：sync useEffect（WeighingCert / HealthCert）

```diff
+import { useEffect } from 'react';
+
 const [scales, setScales] = useState<ScaleRow[]>([{} as ScaleRow]);
+
+// 从表单数据同步 scales 数量
+// useWatch 对嵌套数组 setFieldsValue 触发不可靠，改用 getFieldValue + 延迟检查
+const fooddetailInfos = XlbForm.useWatch('fooddetail_infos');
+useEffect(() => {
+  const timer = setTimeout(() => {
+    const infos = form.getFieldValue('fooddetail_infos');
+    if (Array.isArray(infos) && infos.length > 0 && infos.length !== scales.length) {
+      setScales(infos.map(() => ({} as ScaleRow)));
+    }
+  }, 0);
+  return () => clearTimeout(timer);
+});
```

`useEffect` 无依赖数组，每次渲染后通过 `setTimeout(0)` 延迟读 `form.getFieldValue`。`infos.length !== scales.length` 防止无限循环。

### 修复 2：customUpload

```diff
+import { uploadFiles } from '@xlb/common/src/utils/oldUpload';
+
-<SafeUpload />
+<SafeUpload
+  customUpload={async (newFiles: any[]) => {
+    const results = await Promise.all(
+      newFiles.map(async (f: any) => {
+        if (!f?.file) return null;
+        try {
+          return await uploadFiles(
+            f.file,
+            { refType: 'ITEM_Image', refId: Date.now() },
+            Date.now(),
+            '/erp/hxl.erp.file.upload',
+          );
+        } catch {
+          return null;
+        }
+      }),
+    );
+    return results.filter(Boolean);
+  }}
+/>
```
