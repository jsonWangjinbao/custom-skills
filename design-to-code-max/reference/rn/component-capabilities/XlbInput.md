# XlbInput

> 数据源：`@xlb/components-react-native@1.0.0-beta.217` · `src/components/XlbInput/index.tsx`
> 由 scripts/dtc-rn-component-cards.mjs 于 2026-08-06 生成；<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

> ⚠️ 本接口继承 `Omit<TextInputProps, 'value' | 'defaultValue'>`，下表仅为本组件**扩展**的 Props；其余 Props 见继承来源的定义（本文件或外部依赖）。

| Prop                       | 类型                             | 必填 | 默认值           | 说明                                                                                      |
| -------------------------- | -------------------------------- | ---- | ---------------- | ----------------------------------------------------------------------------------------- |
| `theme`                    | Record<string, any>              | 否   | —                | 自定义主题, 用于自定义输入框的样式                                                        |
| `value`                    | string \| number                 | 否   | —                | 输入框的值，支持字符串和数字                                                              |
| `defaultValue`             | string \| number                 | 否   | —                | 输入框的默认值，支持字符串和数字                                                          |
| `disabled`                 | boolean                          | 否   | `false`          | 是否禁用输入框, 等同于 `editable: false` 和 `disabled: true` 的组合                       |
| `variant`                  | 'showBg' \| 'default'            | 否   | `'default'`      | variant 形态变体 showBg: 显示背景色 内置padding default: 不显示背景色 无内置padding       |
| `type`                     | 'text' \| 'textarea'             | 否   | `'text'`         | 输入框的形状                                                                              |
| `rows`                     | number                           | 否   | `2`              | 多行的时候最低多少行的高度                                                                |
| `clearable`                | boolean                          | 否   | `true`           | 是否启用清除图标，点击清除图标后会清空输入框                                              |
| `clearTrigger`             | 'always' \| 'focus'              | 否   | `'focus'`        | 显示清除图标的时机 - always: 表示输入框不为空时展示 - focus: 表示输入框聚焦且不为空时展示 |
| `formatter`                | (value: string) => string        | 否   | —                | 输入内容格式化函数                                                                        |
| `formatTrigger`            | 'onEndEditing' \| 'onChangeText' | 否   | `'onChangeText'` | 格式化函数触发的时机                                                                      |
| `showWordLimit`            | boolean                          | 否   | `false`          | 是否显示字数统计，需要设置 maxLength 属性，只有 textarea 模式下才有效                     |
| `bordered`                 | boolean                          | 否   | `false`          | 是否显示边框                                                                              |
| `addonBefore`              | ReactNode                        | 否   | —                | 输入框外部前置标签，边框外，textarea 无                                                   |
| `addonAfter`               | ReactNode                        | 否   | —                | 输入框外部后置标签，边框外，textarea 无                                                   |
| `prefix`                   | ReactNode                        | 否   | —                | 输入框内部前缀，边框内部，textarea 无                                                     |
| `suffix`                   | ReactNode                        | 否   | —                | 输入框内部后缀，边框内部，textarea 无                                                     |
| `inputWidth`               | number                           | 否   | —                | 输入框自定义宽                                                                            |
| `size`                     | 'xl' \| 'l' \| 'm' \| 's'        | 否   | `'m'`            | 控件大小                                                                                  |
| `addonGroupStyle`          | StyleProp<ViewStyle>             | 否   | —                | 当设置 addonBefore/addonAfter 的时候就会出现一个组                                        |
| `addonBeforeTextStyle`     | StyleProp<TextStyle>             | 否   | —                | addonBefore 文案的样式                                                                    |
| `addonAfterTextStyle`      | StyleProp<TextStyle>             | 否   | —                | addonAfter 文案的样式                                                                     |
| `addonAfterContainerStyle` | StyleProp<ViewStyle>             | 否   | —                | addonAfter 容器的样式                                                                     |
| `fixGroupStyle`            | StyleProp<ViewStyle>             | 否   | —                | prefix/suffix 相关父组件样式                                                              |
| `prefixTextStyle`          | StyleProp<TextStyle>             | 否   | —                | prefix 文案的样式                                                                         |
| `suffixTextStyle`          | StyleProp<TextStyle>             | 否   | —                | suffix 文案的样式                                                                         |
| `onChange`                 | (value: string) => void          | 否   | —                | 当文本框内容变化时调用此回调函数                                                          |
| `onClear`                  | () => void                       | 否   | —                | 点击清除按钮时的回调函数                                                                  |
| `clearIconStyle`           | StyleProp<ViewStyle>             | 否   | —                | 清除图标的样式                                                                            |
| `containerStyle`           | StyleProp<ViewStyle>             | 否   | —                | 容器样式                                                                                  |
| `inputWrapperStyle`        | StyleProp<ViewStyle>             | 否   | —                | 输入框容器样式                                                                            |

## 相关类型

```ts
export type XlbInputRef = TextInputInstance;
```

## 附属结构

- `components/`：index.native、index.native.types
- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- [blackbox-wrapper-component](../gotchas/component-library/blackbox-wrapper-component.md)
- [clearable-input-ios-shadow-value](../gotchas/component-library/clearable-input-ios-shadow-value.md)
- [dependencies-setfieldsvalue-conflict](../gotchas/component-library/dependencies-setfieldsvalue-conflict.md)
- [safeinput-filter-id](../gotchas/component-library/safeinput-filter-id.md)
- [text-input-explicit-fontfamily](../gotchas/rn-quirks/text-input-explicit-fontfamily.md)

<!-- AUTO:END -->

<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

> ⚠️ 本接口继承 `Omit<TextInputProps, 'value' | 'defaultValue'>`（外部依赖），下表仅为本组件**扩展**的 Props；基础 Props（如表单三件套 form/initialValues/onFinish）见继承来源。

| Prop                       | 类型                             | 必填 | 默认值           | 说明                                                                                      |
| -------------------------- | -------------------------------- | ---- | ---------------- | ----------------------------------------------------------------------------------------- |
| `theme`                    | Record<string, any>              | 否   | —                | 自定义主题, 用于自定义输入框的样式                                                        |
| `value`                    | string \| number                 | 否   | —                | 输入框的值，支持字符串和数字                                                              |
| `defaultValue`             | string \| number                 | 否   | —                | 输入框的默认值，支持字符串和数字                                                          |
| `disabled`                 | boolean                          | 否   | `false`          | 是否禁用输入框, 等同于 `editable: false` 和 `disabled: true` 的组合                       |
| `variant`                  | 'showBg' \| 'default'            | 否   | `'default'`      | variant 形态变体 showBg: 显示背景色 内置padding default: 不显示背景色 无内置padding       |
| `type`                     | 'text' \| 'textarea'             | 否   | `'text'`         | 输入框的形状                                                                              |
| `rows`                     | number                           | 否   | `2`              | 多行的时候最低多少行的高度                                                                |
| `clearable`                | boolean                          | 否   | `true`           | 是否启用清除图标，点击清除图标后会清空输入框                                              |
| `clearTrigger`             | 'always' \| 'focus'              | 否   | `'focus'`        | 显示清除图标的时机 - always: 表示输入框不为空时展示 - focus: 表示输入框聚焦且不为空时展示 |
| `formatter`                | (value: string) => string        | 否   | —                | 输入内容格式化函数                                                                        |
| `formatTrigger`            | 'onEndEditing' \| 'onChangeText' | 否   | `'onChangeText'` | 格式化函数触发的时机                                                                      |
| `showWordLimit`            | boolean                          | 否   | `false`          | 是否显示字数统计，需要设置 maxLength 属性，只有 textarea 模式下才有效                     |
| `bordered`                 | boolean                          | 否   | `false`          | 是否显示边框                                                                              |
| `addonBefore`              | ReactNode                        | 否   | —                | 输入框外部前置标签，边框外，textarea 无                                                   |
| `addonAfter`               | ReactNode                        | 否   | —                | 输入框外部后置标签，边框外，textarea 无                                                   |
| `prefix`                   | ReactNode                        | 否   | —                | 输入框内部前缀，边框内部，textarea 无                                                     |
| `suffix`                   | ReactNode                        | 否   | —                | 输入框内部后缀，边框内部，textarea 无                                                     |
| `inputWidth`               | number                           | 否   | —                | 输入框自定义宽                                                                            |
| `size`                     | 'xl' \| 'l' \| 'm' \| 's'        | 否   | `'m'`            | 控件大小                                                                                  |
| `addonGroupStyle`          | StyleProp<ViewStyle>             | 否   | —                | 当设置 addonBefore/addonAfter 的时候就会出现一个组                                        |
| `addonBeforeTextStyle`     | StyleProp<TextStyle>             | 否   | —                | addonBefore 文案的样式                                                                    |
| `addonAfterTextStyle`      | StyleProp<TextStyle>             | 否   | —                | addonAfter 文案的样式                                                                     |
| `addonAfterContainerStyle` | StyleProp<ViewStyle>             | 否   | —                | addonAfter 容器的样式                                                                     |
| `fixGroupStyle`            | StyleProp<ViewStyle>             | 否   | —                | prefix/suffix 相关父组件样式                                                              |
| `prefixTextStyle`          | StyleProp<TextStyle>             | 否   | —                | prefix 文案的样式                                                                         |
| `suffixTextStyle`          | StyleProp<TextStyle>             | 否   | —                | suffix 文案的样式                                                                         |
| `onChange`                 | (value: string) => void          | 否   | —                | 当文本框内容变化时调用此回调函数                                                          |
| `onClear`                  | () => void                       | 否   | —                | 点击清除按钮时的回调函数                                                                  |
| `clearIconStyle`           | StyleProp<ViewStyle>             | 否   | —                | 清除图标的样式                                                                            |
| `containerStyle`           | StyleProp<ViewStyle>             | 否   | —                | 容器样式                                                                                  |
| `inputWrapperStyle`        | StyleProp<ViewStyle>             | 否   | —                | 输入框容器样式                                                                            |

## 相关类型

```ts
export type XlbInputRef = TextInputInstance;
```

## 附属结构

- `components/`：index.native、index.native.types
- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- [blackbox-wrapper-component](../gotchas/component-library/blackbox-wrapper-component.md)
- [clearable-input-ios-shadow-value](../gotchas/component-library/clearable-input-ios-shadow-value.md)
- [dependencies-setfieldsvalue-conflict](../gotchas/component-library/dependencies-setfieldsvalue-conflict.md)
- [safeinput-filter-id](../gotchas/component-library/safeinput-filter-id.md)
- [text-input-explicit-fontfamily](../gotchas/rn-quirks/text-input-explicit-fontfamily.md)

<!-- AUTO:END -->

<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

> ⚠️ 本接口继承 `Omit<TextInputProps, 'value' | 'defaultValue'>`（外部依赖），下表仅为本组件**扩展**的 Props；基础 Props（如表单三件套 form/initialValues/onFinish）见继承来源。

| Prop                       | 类型                             | 必填 | 默认值           | 说明                                                                                      |
| -------------------------- | -------------------------------- | ---- | ---------------- | ----------------------------------------------------------------------------------------- |
| `theme`                    | Record<string, any>              | 否   | —                | 自定义主题, 用于自定义输入框的样式                                                        |
| `value`                    | string \| number                 | 否   | —                | 输入框的值，支持字符串和数字                                                              |
| `defaultValue`             | string \| number                 | 否   | —                | 输入框的默认值，支持字符串和数字                                                          |
| `disabled`                 | boolean                          | 否   | `false`          | 是否禁用输入框, 等同于 `editable: false` 和 `disabled: true` 的组合                       |
| `variant`                  | 'showBg' \| 'default'            | 否   | `'default'`      | variant 形态变体 showBg: 显示背景色 内置padding default: 不显示背景色 无内置padding       |
| `type`                     | 'text' \| 'textarea'             | 否   | `'text'`         | 输入框的形状                                                                              |
| `rows`                     | number                           | 否   | `2`              | 多行的时候最低多少行的高度                                                                |
| `clearable`                | boolean                          | 否   | `true`           | 是否启用清除图标，点击清除图标后会清空输入框                                              |
| `clearTrigger`             | 'always' \| 'focus'              | 否   | `'focus'`        | 显示清除图标的时机 - always: 表示输入框不为空时展示 - focus: 表示输入框聚焦且不为空时展示 |
| `formatter`                | (value: string) => string        | 否   | —                | 输入内容格式化函数                                                                        |
| `formatTrigger`            | 'onEndEditing' \| 'onChangeText' | 否   | `'onChangeText'` | 格式化函数触发的时机                                                                      |
| `showWordLimit`            | boolean                          | 否   | `false`          | 是否显示字数统计，需要设置 maxLength 属性，只有 textarea 模式下才有效                     |
| `bordered`                 | boolean                          | 否   | `false`          | 是否显示边框                                                                              |
| `addonBefore`              | ReactNode                        | 否   | —                | 输入框外部前置标签，边框外，textarea 无                                                   |
| `addonAfter`               | ReactNode                        | 否   | —                | 输入框外部后置标签，边框外，textarea 无                                                   |
| `prefix`                   | ReactNode                        | 否   | —                | 输入框内部前缀，边框内部，textarea 无                                                     |
| `suffix`                   | ReactNode                        | 否   | —                | 输入框内部后缀，边框内部，textarea 无                                                     |
| `inputWidth`               | number                           | 否   | —                | 输入框自定义宽                                                                            |
| `size`                     | 'xl' \| 'l' \| 'm' \| 's'        | 否   | `'m'`            | 控件大小                                                                                  |
| `addonGroupStyle`          | StyleProp<ViewStyle>             | 否   | —                | 当设置 addonBefore/addonAfter 的时候就会出现一个组                                        |
| `addonBeforeTextStyle`     | StyleProp<TextStyle>             | 否   | —                | addonBefore 文案的样式                                                                    |
| `addonAfterTextStyle`      | StyleProp<TextStyle>             | 否   | —                | addonAfter 文案的样式                                                                     |
| `addonAfterContainerStyle` | StyleProp<ViewStyle>             | 否   | —                | addonAfter 容器的样式                                                                     |
| `fixGroupStyle`            | StyleProp<ViewStyle>             | 否   | —                | prefix/suffix 相关父组件样式                                                              |
| `prefixTextStyle`          | StyleProp<TextStyle>             | 否   | —                | prefix 文案的样式                                                                         |
| `suffixTextStyle`          | StyleProp<TextStyle>             | 否   | —                | suffix 文案的样式                                                                         |
| `onChange`                 | (value: string) => void          | 否   | —                | 当文本框内容变化时调用此回调函数                                                          |
| `onClear`                  | () => void                       | 否   | —                | 点击清除按钮时的回调函数                                                                  |
| `clearIconStyle`           | StyleProp<ViewStyle>             | 否   | —                | 清除图标的样式                                                                            |
| `containerStyle`           | StyleProp<ViewStyle>             | 否   | —                | 容器样式                                                                                  |
| `inputWrapperStyle`        | StyleProp<ViewStyle>             | 否   | —                | 输入框容器样式                                                                            |

## 相关类型

```ts
export type XlbInputRef = TextInputInstance;
```

## 附属结构

- `components/`：index.native、index.native.types
- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- [blackbox-wrapper-component](../gotchas/component-library/blackbox-wrapper-component.md)
- [clearable-input-ios-shadow-value](../gotchas/component-library/clearable-input-ios-shadow-value.md)
- [dependencies-setfieldsvalue-conflict](../gotchas/component-library/dependencies-setfieldsvalue-conflict.md)
- [safeinput-filter-id](../gotchas/component-library/safeinput-filter-id.md)
- [text-input-explicit-fontfamily](../gotchas/component-library/text-input-explicit-fontfamily.md)

<!-- AUTO:END -->

<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

> ⚠️ 本接口继承 `Omit<TextInputProps, 'value' | 'defaultValue'>`（外部依赖），下表仅为本组件**扩展**的 Props；基础 Props（如表单三件套 form/initialValues/onFinish）见继承来源。

| Prop                       | 类型                             | 必填 | 默认值           | 说明                                                                                      |
| -------------------------- | -------------------------------- | ---- | ---------------- | ----------------------------------------------------------------------------------------- |
| `theme`                    | Record<string, any>              | 否   | —                | 自定义主题, 用于自定义输入框的样式                                                        |
| `value`                    | string \| number                 | 否   | —                | 输入框的值，支持字符串和数字                                                              |
| `defaultValue`             | string \| number                 | 否   | —                | 输入框的默认值，支持字符串和数字                                                          |
| `disabled`                 | boolean                          | 否   | `false`          | 是否禁用输入框, 等同于 `editable: false` 和 `disabled: true` 的组合                       |
| `variant`                  | 'showBg' \| 'default'            | 否   | `'default'`      | variant 形态变体 showBg: 显示背景色 内置padding default: 不显示背景色 无内置padding       |
| `type`                     | 'text' \| 'textarea'             | 否   | `'text'`         | 输入框的形状                                                                              |
| `rows`                     | number                           | 否   | `2`              | 多行的时候最低多少行的高度                                                                |
| `clearable`                | boolean                          | 否   | `true`           | 是否启用清除图标，点击清除图标后会清空输入框                                              |
| `clearTrigger`             | 'always' \| 'focus'              | 否   | `'focus'`        | 显示清除图标的时机 - always: 表示输入框不为空时展示 - focus: 表示输入框聚焦且不为空时展示 |
| `formatter`                | (value: string) => string        | 否   | —                | 输入内容格式化函数                                                                        |
| `formatTrigger`            | 'onEndEditing' \| 'onChangeText' | 否   | `'onChangeText'` | 格式化函数触发的时机                                                                      |
| `showWordLimit`            | boolean                          | 否   | `false`          | 是否显示字数统计，需要设置 maxLength 属性，只有 textarea 模式下才有效                     |
| `bordered`                 | boolean                          | 否   | `false`          | 是否显示边框                                                                              |
| `addonBefore`              | ReactNode                        | 否   | —                | 输入框外部前置标签，边框外，textarea 无                                                   |
| `addonAfter`               | ReactNode                        | 否   | —                | 输入框外部后置标签，边框外，textarea 无                                                   |
| `prefix`                   | ReactNode                        | 否   | —                | 输入框内部前缀，边框内部，textarea 无                                                     |
| `suffix`                   | ReactNode                        | 否   | —                | 输入框内部后缀，边框内部，textarea 无                                                     |
| `inputWidth`               | number                           | 否   | —                | 输入框自定义宽                                                                            |
| `size`                     | 'xl' \| 'l' \| 'm' \| 's'        | 否   | `'m'`            | 控件大小                                                                                  |
| `addonGroupStyle`          | StyleProp<ViewStyle>             | 否   | —                | 当设置 addonBefore/addonAfter 的时候就会出现一个组                                        |
| `addonBeforeTextStyle`     | StyleProp<TextStyle>             | 否   | —                | addonBefore 文案的样式                                                                    |
| `addonAfterTextStyle`      | StyleProp<TextStyle>             | 否   | —                | addonAfter 文案的样式                                                                     |
| `addonAfterContainerStyle` | StyleProp<ViewStyle>             | 否   | —                | addonAfter 容器的样式                                                                     |
| `fixGroupStyle`            | StyleProp<ViewStyle>             | 否   | —                | prefix/suffix 相关父组件样式                                                              |
| `prefixTextStyle`          | StyleProp<TextStyle>             | 否   | —                | prefix 文案的样式                                                                         |
| `suffixTextStyle`          | StyleProp<TextStyle>             | 否   | —                | suffix 文案的样式                                                                         |
| `onChange`                 | (value: string) => void          | 否   | —                | 当文本框内容变化时调用此回调函数                                                          |
| `onClear`                  | () => void                       | 否   | —                | 点击清除按钮时的回调函数                                                                  |
| `clearIconStyle`           | StyleProp<ViewStyle>             | 否   | —                | 清除图标的样式                                                                            |
| `containerStyle`           | StyleProp<ViewStyle>             | 否   | —                | 容器样式                                                                                  |
| `inputWrapperStyle`        | StyleProp<ViewStyle>             | 否   | —                | 输入框容器样式                                                                            |

## 相关类型

```ts
export type XlbInputRef = TextInputInstance;
```

## 附属结构

- `components/`：index.native、index.native.types
- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- [blackbox-wrapper-component](../gotchas/component-library/blackbox-wrapper-component.md)
- [clearable-input-ios-shadow-value](../gotchas/component-library/clearable-input-ios-shadow-value.md)
- [dependencies-setfieldsvalue-conflict](../gotchas/component-library/dependencies-setfieldsvalue-conflict.md)
- [safeinput-filter-id](../gotchas/component-library/safeinput-filter-id.md)
- [text-input-explicit-fontfamily](../gotchas/component-library/text-input-explicit-fontfamily.md)

<!-- AUTO:END -->

<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

| Prop                       | 类型                             | 必填 | 默认值           | 说明                                                                                      |
| -------------------------- | -------------------------------- | ---- | ---------------- | ----------------------------------------------------------------------------------------- |
| `theme`                    | Record<string, any>              | 否   | —                | 自定义主题, 用于自定义输入框的样式                                                        |
| `value`                    | string \| number                 | 否   | —                | 输入框的值，支持字符串和数字                                                              |
| `defaultValue`             | string \| number                 | 否   | —                | 输入框的默认值，支持字符串和数字                                                          |
| `disabled`                 | boolean                          | 否   | `false`          | 是否禁用输入框, 等同于 `editable: false` 和 `disabled: true` 的组合                       |
| `variant`                  | 'showBg' \| 'default'            | 否   | `'default'`      | variant 形态变体 showBg: 显示背景色 内置padding default: 不显示背景色 无内置padding       |
| `type`                     | 'text' \| 'textarea'             | 否   | `'text'`         | 输入框的形状                                                                              |
| `rows`                     | number                           | 否   | `2`              | 多行的时候最低多少行的高度                                                                |
| `clearable`                | boolean                          | 否   | `true`           | 是否启用清除图标，点击清除图标后会清空输入框                                              |
| `clearTrigger`             | 'always' \| 'focus'              | 否   | `'focus'`        | 显示清除图标的时机 - always: 表示输入框不为空时展示 - focus: 表示输入框聚焦且不为空时展示 |
| `formatter`                | (value: string) => string        | 否   | —                | 输入内容格式化函数                                                                        |
| `formatTrigger`            | 'onEndEditing' \| 'onChangeText' | 否   | `'onChangeText'` | 格式化函数触发的时机                                                                      |
| `showWordLimit`            | boolean                          | 否   | `false`          | 是否显示字数统计，需要设置 maxLength 属性，只有 textarea 模式下才有效                     |
| `bordered`                 | boolean                          | 否   | `false`          | 是否显示边框                                                                              |
| `addonBefore`              | ReactNode                        | 否   | —                | 输入框外部前置标签，边框外，textarea 无                                                   |
| `addonAfter`               | ReactNode                        | 否   | —                | 输入框外部后置标签，边框外，textarea 无                                                   |
| `prefix`                   | ReactNode                        | 否   | —                | 输入框内部前缀，边框内部，textarea 无                                                     |
| `suffix`                   | ReactNode                        | 否   | —                | 输入框内部后缀，边框内部，textarea 无                                                     |
| `inputWidth`               | number                           | 否   | —                | 输入框自定义宽                                                                            |
| `size`                     | 'xl' \| 'l' \| 'm' \| 's'        | 否   | `'m'`            | 控件大小                                                                                  |
| `addonGroupStyle`          | StyleProp<ViewStyle>             | 否   | —                | 当设置 addonBefore/addonAfter 的时候就会出现一个组                                        |
| `addonBeforeTextStyle`     | StyleProp<TextStyle>             | 否   | —                | addonBefore 文案的样式                                                                    |
| `addonAfterTextStyle`      | StyleProp<TextStyle>             | 否   | —                | addonAfter 文案的样式                                                                     |
| `addonAfterContainerStyle` | StyleProp<ViewStyle>             | 否   | —                | addonAfter 容器的样式                                                                     |
| `fixGroupStyle`            | StyleProp<ViewStyle>             | 否   | —                | prefix/suffix 相关父组件样式                                                              |
| `prefixTextStyle`          | StyleProp<TextStyle>             | 否   | —                | prefix 文案的样式                                                                         |
| `suffixTextStyle`          | StyleProp<TextStyle>             | 否   | —                | suffix 文案的样式                                                                         |
| `onChange`                 | (value: string) => void          | 否   | —                | 当文本框内容变化时调用此回调函数                                                          |
| `onClear`                  | () => void                       | 否   | —                | 点击清除按钮时的回调函数                                                                  |
| `clearIconStyle`           | StyleProp<ViewStyle>             | 否   | —                | 清除图标的样式                                                                            |
| `containerStyle`           | StyleProp<ViewStyle>             | 否   | —                | 容器样式                                                                                  |
| `inputWrapperStyle`        | StyleProp<ViewStyle>             | 否   | —                | 输入框容器样式                                                                            |

## 相关类型

```ts
export type XlbInputRef = TextInputInstance;
```

## 附属结构

- `components/`：index.native、index.native.types
- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- [blackbox-wrapper-component](../gotchas/component-library/blackbox-wrapper-component.md)
- [clearable-input-ios-shadow-value](../gotchas/component-library/clearable-input-ios-shadow-value.md)
- [dependencies-setfieldsvalue-conflict](../gotchas/component-library/dependencies-setfieldsvalue-conflict.md)
- [safeinput-filter-id](../gotchas/component-library/safeinput-filter-id.md)
- [text-input-explicit-fontfamily](../gotchas/component-library/text-input-explicit-fontfamily.md)

<!-- AUTO:END -->

<!-- MANUAL:BEGIN -->

## 能力边界（人工维护）

- **数组 name 场景必须用 SafeInput 包装**（过滤 id prop），否则 Android nativeID 崩溃；字符串 name 不受影响（见 safeinput-filter-id）
- **iOS 清空按钮回退问题**：FormItemContainer 注入的 `value || ''` 导致受控异常 → 用 ClearableInput 模式（`useWatch` + `setFieldsValue` 自行管理受控循环）（见 clearable-input-ios-shadow-value）
- 底层使用系统默认字体，需显式传 `fontFamily: 'PingFang SC'`（Android 需配置自定义字体或接受系统字体替换）

## 易混淆对比（人工维护）

- **vs `XlbInputNumber`**：纯数字录入（金额、数量）用 XlbInputNumber；文本/混合内容用本组件
- **vs `XlbSearchBar`**：列表页顶部搜索框用 XlbSearchBar，禁止拿本组件拼搜索框

## 场景绑定（人工维护）

- 表单文本输入行（名称、证件号、地址等 label 左输入右的水平布局）→ `XlbForm.Item` + 本组件（数组 name 时换 SafeInput）
