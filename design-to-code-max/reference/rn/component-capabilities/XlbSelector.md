# XlbSelector

> 数据源：`@xlb/components-react-native@1.0.0-beta.217` · `src/components/XlbSelector/index.tsx`
> 由 scripts/dtc-rn-component-cards.mjs 于 2026-08-06 生成；<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

| Prop              | 类型                                                                     | 必填   | 默认值                                                     | 说明                                                                                    |
| ----------------- | ------------------------------------------------------------------------ | ------ | ---------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `options`         | SelectorOption[]                                                         | **是** | —                                                          | 可选项                                                                                  |
| `value`           | SelectorValue[]                                                          | 否     | —                                                          | 当前值（受控）                                                                          |
| `defaultValue`    | SelectorValue[]                                                          | 否     | `[]`                                                       | 默认值（非受控）                                                                        |
| `onChange`        | ( value: SelectorValue[], extend: { items: SelectorOption[] }, ) => void | 否     | —                                                          | 值变化回调                                                                              |
| `beforeOnChange`  | ( newValue: SelectorValue[], extend: { items: SelectorOption[] }, ) => … | 否     | —                                                          | 选中前的校验函数，返回 false 可阻止选中                                                 |
| `multiple`        | boolean                                                                  | 否     | `false`                                                    | 是否允许多选                                                                            |
| `disabled`        | boolean                                                                  | 否     | `false`                                                    | 是否全部禁止选中                                                                        |
| `columns`         | number                                                                   | 否     | —                                                          | 列数 一行显示多少个选项（grid 布局）                                                    |
| `fieldNames`      | { label: string; value: string; disabled: string; }                      | 否     | `{ label: 'label', value: 'value', disabled: 'disabled' }` | 自定义 options 中 label value disabled 的字段                                           |
| `round`           | 'default' \| 'round' \| false                                            | 否     | `'default'`                                                | 圆角类型 - 'default': 默认圆角 (4px) - 'round': 半圆形圆角 (高度的一半) - false: 无圆角 |
| `style`           | StyleProp<ViewStyle>                                                     | 否     | —                                                          | 自定义容器样式                                                                          |
| `itemStyle`       | StyleProp<ViewStyle>                                                     | 否     | —                                                          | 自定义选项样式, 可通过改变paddingVertical来调整选项高度，默认高度36                     |
| `activeItemStyle` | StyleProp<ViewStyle>                                                     | 否     | —                                                          | 自定义选中选项样式                                                                      |
| `textStyle`       | StyleProp<TextStyle>                                                     | 否     | —                                                          | 自定义文本样式                                                                          |
| `activeTextStyle` | StyleProp<TextStyle>                                                     | 否     | —                                                          | 自定义选中文本样式                                                                      |
| `showCheckMark`   | boolean                                                                  | 否     | `false`                                                    | 是否显示选中标记（右上角小三角）                                                        |

## 相关类型

```ts
export type SelectorValue = string | number;

export interface SelectorOption {
  label: string | ReactNode;
  value: SelectorValue;
  disabled?: boolean;
}
```

## 附属结构

- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- [blackbox-wrapper-component](../gotchas/component-library/blackbox-wrapper-component.md)
- [dependencies-setfieldsvalue-conflict](../gotchas/component-library/dependencies-setfieldsvalue-conflict.md)
- [safeinput-filter-id](../gotchas/component-library/safeinput-filter-id.md)

<!-- AUTO:END -->

<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

| Prop              | 类型                                                                     | 必填   | 默认值                                                     | 说明                                                                                    |
| ----------------- | ------------------------------------------------------------------------ | ------ | ---------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `options`         | SelectorOption[]                                                         | **是** | —                                                          | 可选项                                                                                  |
| `value`           | SelectorValue[]                                                          | 否     | —                                                          | 当前值（受控）                                                                          |
| `defaultValue`    | SelectorValue[]                                                          | 否     | `[]`                                                       | 默认值（非受控）                                                                        |
| `onChange`        | ( value: SelectorValue[], extend: { items: SelectorOption[] }, ) => void | 否     | —                                                          | 值变化回调                                                                              |
| `beforeOnChange`  | ( newValue: SelectorValue[], extend: { items: SelectorOption[] }, ) => … | 否     | —                                                          | 选中前的校验函数，返回 false 可阻止选中                                                 |
| `multiple`        | boolean                                                                  | 否     | `false`                                                    | 是否允许多选                                                                            |
| `disabled`        | boolean                                                                  | 否     | `false`                                                    | 是否全部禁止选中                                                                        |
| `columns`         | number                                                                   | 否     | —                                                          | 列数 一行显示多少个选项（grid 布局）                                                    |
| `fieldNames`      | { label: string; value: string; disabled: string; }                      | 否     | `{ label: 'label', value: 'value', disabled: 'disabled' }` | 自定义 options 中 label value disabled 的字段                                           |
| `round`           | 'default' \| 'round' \| false                                            | 否     | `'default'`                                                | 圆角类型 - 'default': 默认圆角 (4px) - 'round': 半圆形圆角 (高度的一半) - false: 无圆角 |
| `style`           | StyleProp<ViewStyle>                                                     | 否     | —                                                          | 自定义容器样式                                                                          |
| `itemStyle`       | StyleProp<ViewStyle>                                                     | 否     | —                                                          | 自定义选项样式, 可通过改变paddingVertical来调整选项高度，默认高度36                     |
| `activeItemStyle` | StyleProp<ViewStyle>                                                     | 否     | —                                                          | 自定义选中选项样式                                                                      |
| `textStyle`       | StyleProp<TextStyle>                                                     | 否     | —                                                          | 自定义文本样式                                                                          |
| `activeTextStyle` | StyleProp<TextStyle>                                                     | 否     | —                                                          | 自定义选中文本样式                                                                      |
| `showCheckMark`   | boolean                                                                  | 否     | `false`                                                    | 是否显示选中标记（右上角小三角）                                                        |

## 相关类型

```ts
export type SelectorValue = string | number;

export interface SelectorOption {
  label: string | ReactNode;
  value: SelectorValue;
  disabled?: boolean;
}
```

## 附属结构

- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- [blackbox-wrapper-component](../gotchas/component-library/blackbox-wrapper-component.md)
- [dependencies-setfieldsvalue-conflict](../gotchas/component-library/dependencies-setfieldsvalue-conflict.md)
- [safeinput-filter-id](../gotchas/component-library/safeinput-filter-id.md)

<!-- AUTO:END -->

<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

| Prop              | 类型                                                                     | 必填   | 默认值                                                     | 说明                                                                                    |
| ----------------- | ------------------------------------------------------------------------ | ------ | ---------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `options`         | SelectorOption[]                                                         | **是** | —                                                          | 可选项                                                                                  |
| `value`           | SelectorValue[]                                                          | 否     | —                                                          | 当前值（受控）                                                                          |
| `defaultValue`    | SelectorValue[]                                                          | 否     | `[]`                                                       | 默认值（非受控）                                                                        |
| `onChange`        | ( value: SelectorValue[], extend: { items: SelectorOption[] }, ) => void | 否     | —                                                          | 值变化回调                                                                              |
| `beforeOnChange`  | ( newValue: SelectorValue[], extend: { items: SelectorOption[] }, ) => … | 否     | —                                                          | 选中前的校验函数，返回 false 可阻止选中                                                 |
| `multiple`        | boolean                                                                  | 否     | `false`                                                    | 是否允许多选                                                                            |
| `disabled`        | boolean                                                                  | 否     | `false`                                                    | 是否全部禁止选中                                                                        |
| `columns`         | number                                                                   | 否     | —                                                          | 列数 一行显示多少个选项（grid 布局）                                                    |
| `fieldNames`      | { label: string; value: string; disabled: string; }                      | 否     | `{ label: 'label', value: 'value', disabled: 'disabled' }` | 自定义 options 中 label value disabled 的字段                                           |
| `round`           | 'default' \| 'round' \| false                                            | 否     | `'default'`                                                | 圆角类型 - 'default': 默认圆角 (4px) - 'round': 半圆形圆角 (高度的一半) - false: 无圆角 |
| `style`           | StyleProp<ViewStyle>                                                     | 否     | —                                                          | 自定义容器样式                                                                          |
| `itemStyle`       | StyleProp<ViewStyle>                                                     | 否     | —                                                          | 自定义选项样式, 可通过改变paddingVertical来调整选项高度，默认高度36                     |
| `activeItemStyle` | StyleProp<ViewStyle>                                                     | 否     | —                                                          | 自定义选中选项样式                                                                      |
| `textStyle`       | StyleProp<TextStyle>                                                     | 否     | —                                                          | 自定义文本样式                                                                          |
| `activeTextStyle` | StyleProp<TextStyle>                                                     | 否     | —                                                          | 自定义选中文本样式                                                                      |
| `showCheckMark`   | boolean                                                                  | 否     | `false`                                                    | 是否显示选中标记（右上角小三角）                                                        |

## 相关类型

```ts
export type SelectorValue = string | number;

export interface SelectorOption {
  label: string | ReactNode;
  value: SelectorValue;
  disabled?: boolean;
}
```

## 附属结构

- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- [blackbox-wrapper-component](../gotchas/component-library/blackbox-wrapper-component.md)
- [dependencies-setfieldsvalue-conflict](../gotchas/component-library/dependencies-setfieldsvalue-conflict.md)
- [safeinput-filter-id](../gotchas/component-library/safeinput-filter-id.md)

<!-- AUTO:END -->

<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

| Prop              | 类型                                                                     | 必填   | 默认值                                                     | 说明                                                                                    |
| ----------------- | ------------------------------------------------------------------------ | ------ | ---------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `options`         | SelectorOption[]                                                         | **是** | —                                                          | 可选项                                                                                  |
| `value`           | SelectorValue[]                                                          | 否     | —                                                          | 当前值（受控）                                                                          |
| `defaultValue`    | SelectorValue[]                                                          | 否     | `[]`                                                       | 默认值（非受控）                                                                        |
| `onChange`        | ( value: SelectorValue[], extend: { items: SelectorOption[] }, ) => void | 否     | —                                                          | 值变化回调                                                                              |
| `beforeOnChange`  | ( newValue: SelectorValue[], extend: { items: SelectorOption[] }, ) => … | 否     | —                                                          | 选中前的校验函数，返回 false 可阻止选中                                                 |
| `multiple`        | boolean                                                                  | 否     | `false`                                                    | 是否允许多选                                                                            |
| `disabled`        | boolean                                                                  | 否     | `false`                                                    | 是否全部禁止选中                                                                        |
| `columns`         | number                                                                   | 否     | —                                                          | 列数 一行显示多少个选项（grid 布局）                                                    |
| `fieldNames`      | { label: string; value: string; disabled: string; }                      | 否     | `{ label: 'label', value: 'value', disabled: 'disabled' }` | 自定义 options 中 label value disabled 的字段                                           |
| `round`           | 'default' \| 'round' \| false                                            | 否     | `'default'`                                                | 圆角类型 - 'default': 默认圆角 (4px) - 'round': 半圆形圆角 (高度的一半) - false: 无圆角 |
| `style`           | StyleProp<ViewStyle>                                                     | 否     | —                                                          | 自定义容器样式                                                                          |
| `itemStyle`       | StyleProp<ViewStyle>                                                     | 否     | —                                                          | 自定义选项样式, 可通过改变paddingVertical来调整选项高度，默认高度36                     |
| `activeItemStyle` | StyleProp<ViewStyle>                                                     | 否     | —                                                          | 自定义选中选项样式                                                                      |
| `textStyle`       | StyleProp<TextStyle>                                                     | 否     | —                                                          | 自定义文本样式                                                                          |
| `activeTextStyle` | StyleProp<TextStyle>                                                     | 否     | —                                                          | 自定义选中文本样式                                                                      |
| `showCheckMark`   | boolean                                                                  | 否     | `false`                                                    | 是否显示选中标记（右上角小三角）                                                        |

## 相关类型

```ts
export type SelectorValue = string | number;

export interface SelectorOption {
  label: string | ReactNode;
  value: SelectorValue;
  disabled?: boolean;
}
```

## 附属结构

- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- [blackbox-wrapper-component](../gotchas/component-library/blackbox-wrapper-component.md)
- [dependencies-setfieldsvalue-conflict](../gotchas/component-library/dependencies-setfieldsvalue-conflict.md)
- [safeinput-filter-id](../gotchas/component-library/safeinput-filter-id.md)

<!-- AUTO:END -->

<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

| Prop              | 类型                                                                     | 必填   | 默认值                                                     | 说明                                                                                    |
| ----------------- | ------------------------------------------------------------------------ | ------ | ---------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `options`         | SelectorOption[]                                                         | **是** | —                                                          | 可选项                                                                                  |
| `value`           | SelectorValue[]                                                          | 否     | —                                                          | 当前值（受控）                                                                          |
| `defaultValue`    | SelectorValue[]                                                          | 否     | `[]`                                                       | 默认值（非受控）                                                                        |
| `onChange`        | ( value: SelectorValue[], extend: { items: SelectorOption[] }, ) => void | 否     | —                                                          | 值变化回调                                                                              |
| `beforeOnChange`  | ( newValue: SelectorValue[], extend: { items: SelectorOption[] }, ) => … | 否     | —                                                          | 选中前的校验函数，返回 false 可阻止选中                                                 |
| `multiple`        | boolean                                                                  | 否     | `false`                                                    | 是否允许多选                                                                            |
| `disabled`        | boolean                                                                  | 否     | `false`                                                    | 是否全部禁止选中                                                                        |
| `columns`         | number                                                                   | 否     | —                                                          | 列数 一行显示多少个选项（grid 布局）                                                    |
| `fieldNames`      | { label: string; value: string; disabled: string; }                      | 否     | `{ label: 'label', value: 'value', disabled: 'disabled' }` | 自定义 options 中 label value disabled 的字段                                           |
| `round`           | 'default' \| 'round' \| false                                            | 否     | `'default'`                                                | 圆角类型 - 'default': 默认圆角 (4px) - 'round': 半圆形圆角 (高度的一半) - false: 无圆角 |
| `style`           | StyleProp<ViewStyle>                                                     | 否     | —                                                          | 自定义容器样式                                                                          |
| `itemStyle`       | StyleProp<ViewStyle>                                                     | 否     | —                                                          | 自定义选项样式, 可通过改变paddingVertical来调整选项高度，默认高度36                     |
| `activeItemStyle` | StyleProp<ViewStyle>                                                     | 否     | —                                                          | 自定义选中选项样式                                                                      |
| `textStyle`       | StyleProp<TextStyle>                                                     | 否     | —                                                          | 自定义文本样式                                                                          |
| `activeTextStyle` | StyleProp<TextStyle>                                                     | 否     | —                                                          | 自定义选中文本样式                                                                      |
| `showCheckMark`   | boolean                                                                  | 否     | `false`                                                    | 是否显示选中标记（右上角小三角）                                                        |

## 相关类型

```ts
export type SelectorValue = string | number;

export interface SelectorOption {
  label: string | ReactNode;
  value: SelectorValue;
  disabled?: boolean;
}
```

## 附属结构

- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- [blackbox-wrapper-component](../gotchas/component-library/blackbox-wrapper-component.md)
- [dependencies-setfieldsvalue-conflict](../gotchas/component-library/dependencies-setfieldsvalue-conflict.md)
- [safeinput-filter-id](../gotchas/component-library/safeinput-filter-id.md)

<!-- AUTO:END -->

<!-- MANUAL:BEGIN -->

## 能力边界（人工维护）

- **单选也返回数组**：`value` / `onChange` 值类型恒为 `SelectorValue[]`，单选取值必须取 `[0]`，当标量直接用会出隐蔽 bug
- **在 `XlbForm.Item` 内 `onChange` 会被 FormItemContainer 覆盖、不执行**，选中后的联动逻辑必须 `useWatch` + `useEffect`（见 dependencies-setfieldsvalue-conflict）
- 选项**平铺渲染**在页面上，无弹层、无搜索；需要弹层选择/搜索/大量选项的场景不要用它

## 易混淆对比（人工维护）

- **vs `XlbPicker`**：选项以 chip/网格**直接平铺在页面上**（选项少、一眼看全）→ 本组件；选项收在“请选择”行内、点击弹**底部滚轮/列表弹层**（选项多）→ XlbPicker
- **vs `XlbCheckList`**：多选为整行列表、左侧勾选形态 → XlbCheckList；多选为 chip 网格 → 本组件 `multiple`
- **vs `CommonFormItem type="selector"`**：业务封装选择行，内部即本组件，但样式不可控

## 场景绑定（人工维护）

- 证件类型、是否含 X 等**少量选项以按钮/chip 平铺**的选择组 → 本组件（`columns` 控制列数，单选默认）
