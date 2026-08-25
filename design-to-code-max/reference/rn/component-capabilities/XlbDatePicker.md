# XlbDatePicker

> 数据源：`@xlb/components-react-native@1.0.0-beta.217` · `src/components/XlbDatePicker/index.tsx`
> 由 scripts/dtc-rn-component-cards.mjs 于 2026-08-06 生成；<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

> ⚠️ 本接口继承 `Omit<XlbDatePickerViewProps, 'style'>`，下表仅为本组件**扩展**的 Props；其余 Props 见继承来源的定义（本文件或外部依赖）。

| Prop                  | 类型                                                     | 必填   | 默认值 | 说明                                                           |
| --------------------- | -------------------------------------------------------- | ------ | ------ | -------------------------------------------------------------- |
| `visible`             | boolean                                                  | **是** | —      | 是否显示弹窗                                                   |
| `title`               | React.ReactNode                                          | 否     | —      | 顶部标题                                                       |
| `confirmButtonText`   | string                                                   | 否     | —      | 确认按钮文字                                                   |
| `showToolbar`         | boolean                                                  | 否     | —      | 是否显示标题栏                                                 |
| `closeOnPressOverlay` | boolean                                                  | 否     | —      | 点击遮罩层关闭弹窗                                             |
| `onCancel`            | () => void                                               | 否     | —      | 点击取消按钮时触发                                             |
| `onConfirm`           | (formattedValue: string, pickerDate: PickerDate) => void | 否     | —      | 点击完成按钮时触发，返回格式化后的日期字符串和 PickerDate 对象 |
| `onClose`             | () => void                                               | 否     | —      | 关闭弹窗回调                                                   |

## 附属结构

- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- [blackbox-wrapper-component](../gotchas/component-library/blackbox-wrapper-component.md)
- [datepicker-onchange-conflict](../gotchas/component-library/datepicker-onchange-conflict.md)
- [dynamic-list-independent-component](../gotchas/component-library/dynamic-list-independent-component.md)

<!-- AUTO:END -->

<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

> ⚠️ 本接口继承 `Omit<XlbDatePickerViewProps, 'style'>`（外部依赖），下表仅为本组件**扩展**的 Props；基础 Props（如表单三件套 form/initialValues/onFinish）见继承来源。

| Prop                  | 类型                                                     | 必填   | 默认值 | 说明                                                           |
| --------------------- | -------------------------------------------------------- | ------ | ------ | -------------------------------------------------------------- |
| `visible`             | boolean                                                  | **是** | —      | 是否显示弹窗                                                   |
| `title`               | React.ReactNode                                          | 否     | —      | 顶部标题                                                       |
| `confirmButtonText`   | string                                                   | 否     | —      | 确认按钮文字                                                   |
| `showToolbar`         | boolean                                                  | 否     | —      | 是否显示标题栏                                                 |
| `closeOnPressOverlay` | boolean                                                  | 否     | —      | 点击遮罩层关闭弹窗                                             |
| `onCancel`            | () => void                                               | 否     | —      | 点击取消按钮时触发                                             |
| `onConfirm`           | (formattedValue: string, pickerDate: PickerDate) => void | 否     | —      | 点击完成按钮时触发，返回格式化后的日期字符串和 PickerDate 对象 |
| `onClose`             | () => void                                               | 否     | —      | 关闭弹窗回调                                                   |

## 附属结构

- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- [blackbox-wrapper-component](../gotchas/component-library/blackbox-wrapper-component.md)
- [datepicker-onchange-conflict](../gotchas/component-library/datepicker-onchange-conflict.md)
- [dynamic-list-independent-component](../gotchas/component-library/dynamic-list-independent-component.md)

<!-- AUTO:END -->

<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

> 主文件中未提取到 Props interface（可能为复合导出或定义在 types.ts），请人工查看源码。

## 附属结构

- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- [blackbox-wrapper-component](../gotchas/component-library/blackbox-wrapper-component.md)
- [datepicker-onchange-conflict](../gotchas/component-library/datepicker-onchange-conflict.md)
- [dynamic-list-independent-component](../gotchas/component-library/dynamic-list-independent-component.md)

<!-- AUTO:END -->

<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

> 主文件中未提取到 Props interface（可能为复合导出或定义在 types.ts），请人工查看源码。

## 附属结构

- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- [blackbox-wrapper-component](../gotchas/component-library/blackbox-wrapper-component.md)
- [datepicker-onchange-conflict](../gotchas/component-library/datepicker-onchange-conflict.md)
- [dynamic-list-independent-component](../gotchas/component-library/dynamic-list-independent-component.md)

<!-- AUTO:END -->

<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

> 主文件中未提取到 Props interface（可能为复合导出或定义在 types.ts），请人工查看源码。

## 附属结构

- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- [blackbox-wrapper-component](../gotchas/component-library/blackbox-wrapper-component.md)
- [datepicker-onchange-conflict](../gotchas/component-library/datepicker-onchange-conflict.md)
- [dynamic-list-independent-component](../gotchas/component-library/dynamic-list-independent-component.md)

<!-- AUTO:END -->

<!-- MANUAL:BEGIN -->

## 能力边界（人工维护）

- **在 `XlbForm.Item` 内必须用 DatePickerField 包装拦截 `onChange`**：滚动列即触发 onChange → 表单全量重渲染（`value || ''` 可能把数组字段转空字符串致 `.some()` 崩溃）；且用户不滚动直接点“确定”时值会丢失（见 datepicker-onchange-conflict）
- 确认写入走 `onConfirm` + `form.setFieldsValue`；**嵌套数组字段用 `form.setFields` 精确更新**
- 触发区域需自行用 `Pressable` 包装，`visible` + `onClose` 控制弹层显隐

## 易混淆对比（人工维护）

- **vs `XlbDateRangePicker`**：起止区间（如默认当月范围）用 Range；单日选择用本组件
- **vs `XlbCompactDatePicker` / `XlbCalendarPicker`**：紧凑内联/日历面板形态另选；标准“点击行 → 底部滚轮弹层”用本组件

## 场景绑定（人工维护）

- 有效期、出生日期等**单日选择行**（label 左、右侧值 + 箭头，点击弹滚轮）→ Pressable 触发行 + DatePickerField 包装的本组件
