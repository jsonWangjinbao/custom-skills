---
project: remote-app-fsms
date: 2026-06-24
files:
  - src/pages/storeInformationRN/Detail/chunks/HealthCert.tsx
tags:
  - XlbUpload
  - OCR
  - 身份证识别
  - customUpload
  - onChange
symptoms: 上传身份证图片后，身份证号没有回填到表单
---

# XlbUpload OCR 上传缺少 customUpload 导致 onChange 无 URL

## 症状

员工健康证页面，点击扫描图标上传身份证图片后，身份证号字段未成功回填到表单。

## 触发条件

- 页面：门店信息 → 员工健康证
- 组件：身份证号旁的扫描上传按钮（透明 XlbUpload 覆盖在 Scan 图标上）
- 操作：点击图标 → 选择身份证正面图片 → 上传完成

## 根因

`XlbUpload` 组件选择图片后只返回本地文件路径（`file.path`），不会自动上传到云服务器获取 `url`。需要通过 `customUpload` 属性提供自定义上传逻辑，将图片上传到 OSS 后才能拿到 `url`。原有代码未提供 `customUpload`，`onChange` 收到的 `value[0].url` 为 `undefined`，代码在 `if (!value[0]?.url) return` 处直接返回，OCR API 从未被调用。

## 修复

```diff
 in src/pages/storeInformationRN/Detail/chunks/HealthCert.tsx

+import { uploadFiles } from '@xlb/common/src/utils/oldUpload';

 <XlbUpload
   maxCount={1}
   value={[]}
+  customUpload={async (newFiles) => {
+    const results = await Promise.all(
+      newFiles.map(async (f) => {
+        if (!f?.file) return null;
+        try {
+          return await uploadFiles(
+            f.file,
+            { refType: 'ITEM_Image', refId: Date.now() },
+            Date.now(),
+            '/erp/hxl.erp.file.upload',
+          );
+        } catch { return null; }
+      }),
+    );
+    return results.filter(Boolean);
+  }}
   ...
 />
```
