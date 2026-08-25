---
project: remote-app-fsms
date: 2026-07-24
files:
  - src/pages/storeHouseFsmsNative/BatchAdd/index.tsx
  - src/pages/storeHouseFsmsNative/Add/chunks/BaseInfoSection.tsx
  - src/pages/storeHouseFsmsNative/Add/chunks/CheckItemsSection.tsx
  - src/pages/storeHouseFsmsNative/Add/chunks/JudgeSection.tsx
  - src/pages/storeHouseFsmsNative/Add/chunks/ResultSection.tsx
tags:
  - XlbForm
  - useWatch
  - preserve
  - rc-field-form
  - setFieldsValue
  - 未注册字段
  - check_type
symptoms: setFieldsValue 已把值写入 form store，但 useWatch 恒 undefined（批次质检页缺「抽检明细」tab、只读行全显示「-」）
---

# rc-field-form useWatch 默认丢未注册字段值，需 preserve:true

## 症状

重点待检测单据进入批次质检页：「抽检明细」tab 不出现（只有 2 个 tab），只读行（检测报告/AI识别/商品规格书/抽检类别等）全显示「-」。运行时日志证实 check_type='IMPORTANT' 已通过 setFieldsValue 写入 store（patch 写入后 551ms useWatch 仍返回 undefined）。

## 触发条件

- 页面：任意使用 XlbForm（rc-field-form 2.7.0）的页面
- 组件：XlbForm.useWatch
- 操作：useWatch 订阅**没有注册对应 XlbForm.Item** 的纯数据字段（仅靠 setFieldsValue 写入）

## 根因

rc-field-form 2.7.0 的 notifyWatch 给 watch 回调传两份值：`values = getFieldsValue()`（**仅已注册 Form.Item 的字段**）与 `allValues = getFieldsValue(true)`（全量 store）。useWatch 默认取前者：

```js
// node_modules/rc-field-form/lib/useWatch.js
var watchValue = options.preserve ? allValues : values; // 默认 preserve=false → 丢未注册字段
```

字段未注册 Form.Item 时，store 有值但 useWatch 永远 undefined。静态极难察觉——必须用运行时日志对比「setFieldsValue 写入值」与「useWatch 读取值」才能确诊。H5 端无此问题（H5 用 state/souceInfo 判断，不靠 useWatch）。

## 修复

```diff
- const checkType = XlbForm.useWatch('check_type', form);
+ const checkType = XlbForm.useWatch('check_type', {form, preserve: true});

- const iteminfo = XlbForm.useWatch('iteminfo', form);
- const allValues = XlbForm.useWatch([], form);
+ const iteminfo = XlbForm.useWatch('iteminfo', {form, preserve: true});
+ const allValues = XlbForm.useWatch([], {form, preserve: true});
```

规则：**useWatch 订阅任何「setFieldsValue 写入但无 Form.Item 注册」的字段（配置数组、只读展示数据、快照拷贝字段）时，必须传 `{form, preserve: true}`**；useWatch([]) 全量订阅做跨字段计算（扣分总计、required_condition 显隐）时同样必须加，否则读到的 values 缺未注册字段。
