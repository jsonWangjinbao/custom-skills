---
project: remote-app-fsms
date: 2025-06-25
files:
  - src/pages/storeInformationRN/Detail/index.tsx
  - src/pages/storeInformationRN/Detail/chunks/HealthCert.tsx
tags:
  - validateFields
  - 嵌套数组校验
  - rc-field-form
  - 表单校验
  - 内联错误
symptoms: 必填字段不填直接点更新，不显示错误提示直接提交成功
---

# validateFields 传数组名不递归校验嵌套子字段

## 症状

表单有嵌套数组字段（如 `detail_infos` 下有 `name`、`files` 等），点击更新时即使子字段为空也不触发校验，直接提交成功。

## 触发条件

- `form.validateFields(['parentField'])` 传入数组父字段名
- 父字段本身没有 rules，rules 都在子字段上
- rc-field-form 不会自动递归展开嵌套字段

## 根因

`rc-field-form` 的 `validateFields(names)` 只校验传入 `names` 中精确匹配的字段路径。传入 `['detail_infos']` 时，只校验路径为 `['detail_infos']` 的 Form.Item（数组本身无 rules → 通过），不会递归校验 `['detail_infos', 0, 'name']` 等子字段。

H5 端调用 `validateFields()` 无参数 → 校验所有已注册字段（含嵌套），所以不存在此问题。

## 修复

在 `handleSubmit` 中动态展开嵌套字段路径为完整列表：

```tsx
// tab 3: 展开 detail_infos 子字段
const detailInfos = form.getFieldValue('detail_infos') || [];
const nested = ['healthy_card_type'];
for (let i = 0; i < detailInfos.length; i++) {
  nested.push(
    ['detail_infos', i, 'name'],
    ['detail_infos', i, 'id_card'],
    ['detail_infos', i, 'work'],
    ['detail_infos', i, 'start_date'],
    ['detail_infos', i, 'end_date'],
    ['detail_infos', i, 'files'],
  );
}
await form.validateFields(nested);
```

同样处理 tab 4 的 `fooddetail_infos`。
