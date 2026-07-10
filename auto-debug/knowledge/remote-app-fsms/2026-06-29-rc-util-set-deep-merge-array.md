---
project: remote-app-fsms
date: 2026-06-29
files:
  - src/pages/storeInformationRN/Detail/chunks/HealthCert.tsx
  - src/pages/storeInformationRN/Detail/chunks/WeighingCert.tsx
tags:
  - rc-util/set
  - deep merge
  - setFields
  - setFieldsValue
  - rc-field-form
  - 动态表单增删
  - 数组字段
  - 数据串扰
  - key=index
symptoms: 新增员工2后删除员工1，员工2的表单项显示了员工1的姓名/身份证号/工种
---

# rc-util/set 对数组元素也做 deep merge 导致删除后数据残留

## 症状

- 员工健康证：有员工1（各字段有值）→ 新增员工2（不填）→ 删除员工1 → 员工2的姓名/身份证号/工种显示员工1的数据
- 计量秤证件：同样场景，删除后剩余的表单显示已删除项的数据

## 触发条件

- 页面：证件管理 > 门店证件详情 > 员工健康证 / 计量秤证件
- 组件：`EmployeeCard` / `ScaleCard`（动态数组表单）
- 操作：新增一条 → 删除旧的有数据的条目 → 新条目显示被删条目数据

## 根因

`rc-util/set` 在数组每个元素上也做深度合并（deep merge）。当删除数组某元素后写入新数组：

```
旧 store[index=0]: {name:"张三", id_card:"123", work:"工人", ...}
新数组元素: {}   ← 只包含 files:[]

rc-util/set deep merge 后:
{} merge {name:"张三", id_card:"123", work:"工人"}
→ {name:"张三", id_card:"123", work:"工人"}  ← 数据残留！
```

`form.setFields()` 和 `form.setFieldsValue()` 都受此影响，因为底层都走 `rc-util/set`。

## 修复

**关键原则**：写入嵌套数组时，每个元素必须显式写出全部字段，缺失的 key 用空字符串/null/[] 占位。

### 1. addEmployee / removeEmployee 修改

```diff
  const addEmployee = () => {
    const currentInfos = form.getFieldValue('detail_infos') || [];
-   form.setFieldsValue({detail_infos: [...currentInfos, {files: []}]});
+   const newItem = {name: '', id_card: '', id_card_encrypted: undefined,
+                    work: '', start_date: '', end_date: '', files: []};
+   form.setFields([{name: 'detail_infos', value: [...currentInfos, newItem]}]);
  };

  const removeEmployee = (index: number) => {
    const currentInfos = form.getFieldValue('detail_infos') || [];
-   const newInfos = currentInfos.filter((_, i) => i !== index);
+   const newInfos = currentInfos
+     .filter((_, i) => i !== index)
+     .map((item) => ({
+       name: item.name ?? '',
+       id_card: item.id_card ?? '',
+       id_card_encrypted: item.id_card_encrypted ?? undefined,
+       work: item.work ?? '',
+       start_date: item.start_date ?? '',
+       end_date: item.end_date ?? '',
+       files: item.files ?? [],
+     }));
    form.setFields([{name: 'detail_infos', value: newInfos}]);
  };
```

### 2. WeighingCert.tsx 同理

```diff
  const addScale = () => {
-   form.setFieldsValue({fooddetail_infos: [...currentInfos, {files: []}]});
+   form.setFields([{name: 'fooddetail_infos',
+                    value: [...currentInfos, {start_date: '', end_date: '', files: []}]}]);
  };

  const removeScale = (index: number) => {
-   const newInfos = currentInfos.filter((_, i) => i !== index);
+   const newInfos = currentInfos
+     .filter((_, i) => i !== index)
+     .map((item) => ({
+       start_date: item.start_date ?? '',
+       end_date: item.end_date ?? '',
+       files: item.files ?? [],
+     }));
    form.setFields([{name: 'fooddetail_infos', value: newInfos}]);
  };
```

**设计要点**：`setFields`（而非 `setFieldsValue`）+ 显式全部字段，这是绕过 rc-util deep merge 的唯一方式。
