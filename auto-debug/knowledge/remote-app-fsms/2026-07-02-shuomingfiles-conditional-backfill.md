---
project: remote-app-fsms
date: 2026-07-02
files:
  - src/pages/storeInformationRN/Detail/index.tsx
  - src/pages/storeInformationRN/Detail/chunks/HealthCert.tsx
tags:
  - 证件类型切换
  - shuomingfiles
  - API回填
  - certType
  - healthy_card_type
  - STORE_DESCRIPTION
  - EMPLOYEE_HEALTH
  - 表单回填条件化
symptoms: 店铺说明文件上传后更新，切到员工健康证添加员工，再切回店铺说明文件时旧文件仍然显示，需要再切一次才清空
---

# 切换证件类型后旧文件未清空 — API 回填未按 certType 条件化

## 症状

1. 在店铺说明文件 tab 上传文件并更新保存
2. 切到员工健康证，添加员工并上传
3. 回到列表页，重新进入详情页
4. 切换到店铺说明文件 → 发现之前上传的文件还在
5. 再次切到员工健康证，再切回店铺说明文件 → 文件才被清空

## 触发条件

- 页面：门店证件详情 > 员工健康证 tab
- 组件：HealthCert
- 操作：先保存过店铺说明文件，再进入详情页进行证件类型切换

## 根因

**API 回填时无条件写入 `shuomingfiles`，而 certType 切换到 STORE_DESCRIPTION 的 effect 不清空 shuomingfiles。**

`Detail/index.tsx` 的 API 回填：
```ts
shuomingfiles: hl?.files || [],  // ← 不管 healthy_card_type 是啥，都写入
```

后端在 `healthy_card_type === "EMPLOYEE_HEALTH"` 时仍然返回旧的 `files` 数组（店铺说明文件的图片），`setFieldsValue` 把这些文件写入 `shuomingfiles` 字段。

当用户切换到 STORE_DESCRIPTION，HealthCert 的 certType 切换 effect 走到 else 分支：
- ✅ 清空了 `detail_infos`
- ❌ **不清空 `shuomingfiles`** — 旧数据残留

第一次切回 EMPLOYEE_HEALTH 时，if 分支执行了 `shuomingfiles: []`，所以第二次切到 STORE_DESCRIPTION 文件才被清空。

## 修复

**`Detail/index.tsx`**：只当 certType 为 STORE_DESCRIPTION 时才回填 `shuomingfiles`。

```diff
- shuomingfiles: hl?.files || [],
+ shuomingfiles:
+   hl?.healthy_card_type === 'STORE_DESCRIPTION' ? hl?.files || [] : [],
```
