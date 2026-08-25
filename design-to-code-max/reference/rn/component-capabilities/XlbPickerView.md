# XlbPickerView

> 数据源：`@xlb/components-react-native@1.0.0-beta.217` · `src/components/XlbPickerView/index.tsx`
> 由 scripts/dtc-rn-component-cards.mjs 于 2026-08-06 生成；<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

| Prop | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `value` | PickerValue[] | 否 | — |  |
| `defaultValue` | PickerValue[] | 否 | — |  |
| `onChange` | (values: PickerValue[], options: Column[]) => void | 否 | — |  |
| `columns` | Column[] | **是** | — |  |
| `loading` | boolean | 否 | — |  |
| `itemHeight` | number | 否 | — |  |
| `visibleItemCount` | number | 否 | `7` |  |
| `testID` | string | 否 | — |  |
| `style` | any | 否 | — |  |
| `theme` | Partial<PickerViewTheme> | 否 | — |  |
| `disabled` | boolean | 否 | — |  |

## 相关类型

```ts
export type PickerValue = string | number;

export interface PickerOption {
  value: PickerValue;
  label: PickerValue;
  disabled?: boolean;
  [key: string]: any;
}

export interface PickerOptionMultipleWidthDefaultValue {
  defaultValue?: PickerValue;
  options: PickerOption[];
}

export type PickerOptionMultiple =
  | PickerOptionMultipleWidthDefaultValue
  | PickerOption[];

export interface PickerOptionCascade {
  children?: PickerOptionCascade[];
  [key: string]: any;
}

export type Column = PickerOption | PickerOptionMultiple | PickerOptionCascade;
```

## 附属结构

- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- （无匹配记录）

<!-- AUTO:END -->

<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

| Prop | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `value` | PickerValue[] | 否 | — |  |
| `defaultValue` | PickerValue[] | 否 | — |  |
| `onChange` | (values: PickerValue[], options: Column[]) => void | 否 | — |  |
| `columns` | Column[] | **是** | — |  |
| `loading` | boolean | 否 | — |  |
| `itemHeight` | number | 否 | — |  |
| `visibleItemCount` | number | 否 | `7` |  |
| `testID` | string | 否 | — |  |
| `style` | any | 否 | — |  |
| `theme` | Partial<PickerViewTheme> | 否 | — |  |
| `disabled` | boolean | 否 | — |  |

## 相关类型

```ts
export type PickerValue = string | number;

export interface PickerOption {
  value: PickerValue;
  label: PickerValue;
  disabled?: boolean;
  [key: string]: any;
}

export interface PickerOptionMultipleWidthDefaultValue {
  defaultValue?: PickerValue;
  options: PickerOption[];
}

export type PickerOptionMultiple =
  | PickerOptionMultipleWidthDefaultValue
  | PickerOption[];

export interface PickerOptionCascade {
  children?: PickerOptionCascade[];
  [key: string]: any;
}

export type Column = PickerOption | PickerOptionMultiple | PickerOptionCascade;
```

## 附属结构

- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- （无匹配记录）

<!-- AUTO:END -->

<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

| Prop | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `value` | PickerValue[] | 否 | — |  |
| `defaultValue` | PickerValue[] | 否 | — |  |
| `onChange` | (values: PickerValue[], options: Column[]) => void | 否 | — |  |
| `columns` | Column[] | **是** | — |  |
| `loading` | boolean | 否 | — |  |
| `itemHeight` | number | 否 | — |  |
| `visibleItemCount` | number | 否 | `7` |  |
| `testID` | string | 否 | — |  |
| `style` | any | 否 | — |  |
| `theme` | Partial<PickerViewTheme> | 否 | — |  |
| `disabled` | boolean | 否 | — |  |

## 相关类型

```ts
export type PickerValue = string | number;

export interface PickerOption {
  value: PickerValue;
  label: PickerValue;
  disabled?: boolean;
  [key: string]: any;
}

export interface PickerOptionMultipleWidthDefaultValue {
  defaultValue?: PickerValue;
  options: PickerOption[];
}

export type PickerOptionMultiple =
  | PickerOptionMultipleWidthDefaultValue
  | PickerOption[];

export interface PickerOptionCascade {
  children?: PickerOptionCascade[];
  [key: string]: any;
}

export type Column = PickerOption | PickerOptionMultiple | PickerOptionCascade;
```

## 附属结构

- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- （无匹配记录）

<!-- AUTO:END -->

<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

| Prop | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `value` | PickerValue[] | 否 | — |  |
| `defaultValue` | PickerValue[] | 否 | — |  |
| `onChange` | (values: PickerValue[], options: Column[]) => void | 否 | — |  |
| `columns` | Column[] | **是** | — |  |
| `loading` | boolean | 否 | — |  |
| `itemHeight` | number | 否 | — |  |
| `visibleItemCount` | number | 否 | `7` |  |
| `testID` | string | 否 | — |  |
| `style` | any | 否 | — |  |
| `theme` | Partial<PickerViewTheme> | 否 | — |  |
| `disabled` | boolean | 否 | — |  |

## 相关类型

```ts
export type PickerValue = string | number;

export interface PickerOption {
  value: PickerValue;
  label: PickerValue;
  disabled?: boolean;
  [key: string]: any;
}

export interface PickerOptionMultipleWidthDefaultValue {
  defaultValue?: PickerValue;
  options: PickerOption[];
}

export type PickerOptionMultiple =
  | PickerOptionMultipleWidthDefaultValue
  | PickerOption[];

export interface PickerOptionCascade {
  children?: PickerOptionCascade[];
  [key: string]: any;
}

export type Column = PickerOption | PickerOptionMultiple | PickerOptionCascade;
```

## 附属结构

- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- （无匹配记录）

<!-- AUTO:END -->

<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

| Prop | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `value` | PickerValue[] | 否 | — |  |
| `defaultValue` | PickerValue[] | 否 | — |  |
| `onChange` | (values: PickerValue[], options: Column[]) => void | 否 | — |  |
| `columns` | Column[] | **是** | — |  |
| `loading` | boolean | 否 | — |  |
| `itemHeight` | number | 否 | — |  |
| `visibleItemCount` | number | 否 | `7` |  |
| `testID` | string | 否 | — |  |
| `style` | any | 否 | — |  |
| `theme` | Partial<PickerViewTheme> | 否 | — |  |
| `disabled` | boolean | 否 | — |  |

## 相关类型

```ts
export type PickerValue = string | number;

export interface PickerOption {
  value: PickerValue;
  label: PickerValue;
  disabled?: boolean;
  [key: string]: any;
}

export interface PickerOptionMultipleWidthDefaultValue {
  defaultValue?: PickerValue;
  options: PickerOption[];
}

export type PickerOptionMultiple =
  | PickerOptionMultipleWidthDefaultValue
  | PickerOption[];

export interface PickerOptionCascade {
  children?: PickerOptionCascade[];
  [key: string]: any;
}

export type Column = PickerOption | PickerOptionMultiple | PickerOptionCascade;
```

## 附属结构

- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- （无匹配记录）

<!-- AUTO:END -->

<!-- MANUAL:BEGIN -->

## 能力边界（人工维护）

> 该组件**不能**做什么、常见误用场景。（待补充）

## 易混淆对比（人工维护)

> 与最易误选的组件对比：看到什么特征用本组件，看到什么特征用对方。（待补充）

## 场景绑定（人工维护）

> 命中即直接选用本组件的设计稿特征，禁止自由发挥。（待补充）
