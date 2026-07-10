---
project: remote-app-fsms
date: 2026-06-29
files:
  - src/pages/storeInformationRN/Detail/index.tsx
tags:
  - lackConfirm
  - 缺项确认
  - authModel
  - store_id
  - 门店不存在
  - userInfos
symptoms: RN端点击缺项确认提示"当前门店不存在"，PC端同样操作正常成功
---

# 缺项确认 store_id 误用 authModel 用户门店 ID

## 症状

- RN 端：证件管理详情页点击「缺项确认」→ 提示"当前门店不存在"
- PC 端：同样门店同样操作 → 成功

## 触发条件

- 页面：证件管理 > 门店证件详情 > 营业执照 / 食品经营许可证 tab
- 条件：当前查看的门店与当前登录用户归属门店不同
- 操作：点击「缺项确认」按钮

## 根因

`handleLackConfirm` 错误地使用了 `authModel.state.userInfos?.store?.id`（当前登录用户归属的门店 ID）作为 `store_id`，而应该使用 `item?.id`（详情页当前正在查看的业务门店 ID）。当用户查看的不是自己归属的门店时，两个 ID 不同，服务器根据错误的 `store_id` 找不到门店就报"不存在"。

## 修复

```diff
  const res = await lackConfirm({
    business_order_file_type: manage,
-   store_id: authModel.state.userInfos?.store?.id,
+   store_id: item?.id,
  });
```

`authModel.state.userInfos?.store?.id` — 用户归属门店，`item?.id` — 当前业务门店，两者概念不同，不可混用。
