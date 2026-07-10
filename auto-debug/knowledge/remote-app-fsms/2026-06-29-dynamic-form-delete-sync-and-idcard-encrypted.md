---
project: remote-app-fsms
date: 2026-06-29
files:
  - src/pages/storeInformationRN/Detail/chunks/WeighingCert.tsx
  - src/pages/storeInformationRN/Detail/chunks/HealthCert.tsx
  - src/pages/storeInformationRN/Detail/index.tsx
tags:
  - WeighingCert
  - HealthCert
  - id_card_encrypted
  - setFieldsValue
  - rc-field-form
  - useWatch
  - 动态表单增删
  - 身份证号查看
  - 敏感数据解密
  - 保存污染
symptoms: 计量秤证件和员工健康证新增后删除失败；员工健康证点击查看身份证号后仍显示加密值
---

# 动态表单增删状态不同步 + 保存时 id_card_encrypted 丢失

## 症状

1. **新增计量秤证件后删除失败**：新增后点击删除图标，确认删除后列表不变
2. **新增员工健康证后删除失败**：同计量秤，删除操作被撤销
3. **员工健康证查看身份证号失败**：点击「查看」后，API 返回的仍是 `3****************X`（加密值），不是明文

## 触发条件

- 页面：证件管理 > 门店证件详情 > 计量秤证件 / 员工健康证
- 组件：`WeighingCert.tsx` (ScaleCard) / `HealthCert.tsx` (EmployeeCard)
- 操作：新增一条后点击删除 → 删除被撤销；点击查看加密身份证号 → 仍显示加密值

## 根因

### 删除被撤销（WeighingCert + HealthCert）

`removeScale` / `removeEmployee` 只更新了本地 `useState(scales/employees)`，没有同步更新表单中的 `fooddetail_infos` / `detail_infos`。同文件内的 `useEffect` 监听 `XlbForm.useWatch('fooddetail_infos')`，发现表单数组长度与本地 state 不一致时，用表单数据覆盖本地 state，删除被撤销。

### 查看身份证号失败（HealthCert + index.tsx）

保存闭环导致 `id_card_encrypted` 污染：
1. 首次录入身份证号 320123... → saveHealth → 服务器存 `id_card_encrypted = AES(320123...)`
2. 加载详情时服务器返回 `id_card = "3****************X"`（掩码）+ `id_card_encrypted = "AES:..."`（原始加密值）
3. 用户点「更新」→ `validateFields` 收集表单数据 → `id_card` 为掩码值 `"3****************X"` → **未携带 `id_card_encrypted`**
4. 服务器收到掩码值，误以为新值 → `id_card_encrypted = AES("3****************X")`
5. 再次查看 → reveal API 解密 `AES("3****************X")` → `"3****************X"` → 永远看不到明文

## 修复

### 1. WeighingCert.tsx — 增删时间步表单数据

```diff
  const addScale = () => {
+   const currentInfos = form.getFieldValue('fooddetail_infos') || [];
+   form.setFieldsValue({fooddetail_infos: [...currentInfos, {files: []}]});
    setScales(prev => [...prev, {} as ScaleRow]);
  };

  const removeScale = (index: number) => {
+   const currentInfos = form.getFieldValue('fooddetail_infos') || [];
+   const newInfos = currentInfos.filter((_: any, i: number) => i !== index);
+   form.setFieldsValue({fooddetail_infos: newInfos});
    setScales(prev => prev.filter((_, i) => i !== index));
  };
```

### 2. HealthCert.tsx — 同上 + handleRevealIdCard 改用 setFieldsValue

```diff
  const addEmployee = () => {
+   const currentInfos = form.getFieldValue('detail_infos') || [];
+   form.setFieldsValue({detail_infos: [...currentInfos, {files: []}]});
    setEmployees(prev => [...prev, {} as EmployeeRow]);
  };

  const removeEmployee = (index: number) => {
+   const currentInfos = form.getFieldValue('detail_infos') || [];
+   const newInfos = currentInfos.filter((_: any, i: number) => i !== index);
+   form.setFieldsValue({detail_infos: newInfos});
    setEmployees(prev => prev.filter((_, i) => i !== index));
  };
```

`handleRevealIdCard` 中改用与 OCR 一致的 `setFieldsValue` 写法更新嵌套数组：
```diff
- formInstance.setFields([
-   {name: ['detail_infos', index, 'id_card'], value: res.data},
- ]);
+ formInstance.setFieldsValue({
+   detail_infos: { [index]: { id_card: res.data } },
+ });
```

### 3. index.tsx — handleSubmit 保留 id_card_encrypted

```diff
+ // 保存健康证时，保留 id_card_encrypted，避免服务器将掩码值重新加密
+ if (activeKey === '3' && Array.isArray(submitData.detail_infos)) {
+   const sourceInfos = form.getFieldValue('detail_infos') || [];
+   submitData.detail_infos = submitData.detail_infos.map(
+     (item: any, i: number) => {
+       const sourceItem = sourceInfos[i] || {};
+       if (typeof item.id_card === 'string' && item.id_card.includes('*')) {
+         return { ...item, id_card_encrypted: sourceItem.id_card_encrypted };
+       }
+       return item;
+     },
+   );
+ }
```

**注意**：对于已被污染的旧数据，需要用户手动重新输入真实身份证号并保存一次才能恢复。
