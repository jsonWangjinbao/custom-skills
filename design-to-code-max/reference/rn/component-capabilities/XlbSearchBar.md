# XlbSearchBar

> 数据源：`@xlb/components-react-native@1.0.0-beta.217` · `src/components/XlbSearchBar/index.tsx`
> 由 scripts/dtc-rn-component-cards.mjs 于 2026-08-06 生成；<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

> ⚠️ 本接口继承 `TextInputProps`，下表仅为本组件**扩展**的 Props；其余 Props 见继承来源的定义（本文件或外部依赖）。

| Prop | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `iconSize` | number | 否 | `18` | 搜索图标大小 |
| `iconColor` | ThemeColors \| string \| undefined | 否 | `text_input_placeholder_text_color` | 搜索图标颜色 |
| `showIcon` | boolean | 否 | `true` | 是否显示搜索图标 |
| `onSearch` | (value: string) => void | 否 | — | 点击搜索回调， autoSearch 为 true 时也会触发 |
| `autoSearch` | boolean | 否 | `false` | 内容变化时自动触发 onSearch |
| `onSearchDebounceWait` | number | 否 | `300` | onSearch debounce wait |
| `searchText` | string | 否 | `'搜索'` | 搜索按钮文案 |
| `extra` | ReactNode | 否 | — | 搜索按钮右侧自定义内容 |
| `prefix` | ReactNode | 否 | — | 搜索 icon 左边自定义内容 |
| `suffix` | ReactNode | 否 | — | 搜索框内右边自定义内容 |
| `showSearchButton` | boolean | 否 | `false` | 是否显示搜索按钮 |
| `containerStyle` | ViewStyle | 否 | — | 自定义容器样式 |
| `inputProps` | XlbInputProps | 否 | — | 自定义 XlbInput 组件 props |

## 相关类型

```ts
export type XlbSearchBarRef = TextInputInstance;
```

## 附属结构

- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- [text-input-explicit-fontfamily](../gotchas/rn-quirks/text-input-explicit-fontfamily.md)

<!-- AUTO:END -->

<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

> ⚠️ 本接口继承 `TextInputProps`（外部依赖），下表仅为本组件**扩展**的 Props；基础 Props（如表单三件套 form/initialValues/onFinish）见继承来源。

| Prop | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `iconSize` | number | 否 | `18` | 搜索图标大小 |
| `iconColor` | ThemeColors \| string \| undefined | 否 | `text_input_placeholder_text_color` | 搜索图标颜色 |
| `showIcon` | boolean | 否 | `true` | 是否显示搜索图标 |
| `onSearch` | (value: string) => void | 否 | — | 点击搜索回调， autoSearch 为 true 时也会触发 |
| `autoSearch` | boolean | 否 | `false` | 内容变化时自动触发 onSearch |
| `onSearchDebounceWait` | number | 否 | `300` | onSearch debounce wait |
| `searchText` | string | 否 | `'搜索'` | 搜索按钮文案 |
| `extra` | ReactNode | 否 | — | 搜索按钮右侧自定义内容 |
| `prefix` | ReactNode | 否 | — | 搜索 icon 左边自定义内容 |
| `suffix` | ReactNode | 否 | — | 搜索框内右边自定义内容 |
| `showSearchButton` | boolean | 否 | `false` | 是否显示搜索按钮 |
| `containerStyle` | ViewStyle | 否 | — | 自定义容器样式 |
| `inputProps` | XlbInputProps | 否 | — | 自定义 XlbInput 组件 props |

## 相关类型

```ts
export type XlbSearchBarRef = TextInputInstance;
```

## 附属结构

- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- [text-input-explicit-fontfamily](../gotchas/rn-quirks/text-input-explicit-fontfamily.md)

<!-- AUTO:END -->

<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

> ⚠️ 本接口继承 `TextInputProps`（外部依赖），下表仅为本组件**扩展**的 Props；基础 Props（如表单三件套 form/initialValues/onFinish）见继承来源。

| Prop | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `iconSize` | number | 否 | `18` | 搜索图标大小 |
| `iconColor` | ThemeColors \| string \| undefined | 否 | `text_input_placeholder_text_color` | 搜索图标颜色 |
| `showIcon` | boolean | 否 | `true` | 是否显示搜索图标 |
| `onSearch` | (value: string) => void | 否 | — | 点击搜索回调， autoSearch 为 true 时也会触发 |
| `autoSearch` | boolean | 否 | `false` | 内容变化时自动触发 onSearch |
| `onSearchDebounceWait` | number | 否 | `300` | onSearch debounce wait |
| `searchText` | string | 否 | `'搜索'` | 搜索按钮文案 |
| `extra` | ReactNode | 否 | — | 搜索按钮右侧自定义内容 |
| `prefix` | ReactNode | 否 | — | 搜索 icon 左边自定义内容 |
| `suffix` | ReactNode | 否 | — | 搜索框内右边自定义内容 |
| `showSearchButton` | boolean | 否 | `false` | 是否显示搜索按钮 |
| `containerStyle` | ViewStyle | 否 | — | 自定义容器样式 |
| `inputProps` | XlbInputProps | 否 | — | 自定义 XlbInput 组件 props |

## 相关类型

```ts
export type XlbSearchBarRef = TextInputInstance;
```

## 附属结构

- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- [text-input-explicit-fontfamily](../gotchas/component-library/text-input-explicit-fontfamily.md)

<!-- AUTO:END -->

<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

> ⚠️ 本接口继承 `TextInputProps`（外部依赖），下表仅为本组件**扩展**的 Props；基础 Props（如表单三件套 form/initialValues/onFinish）见继承来源。

| Prop | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `iconSize` | number | 否 | `18` | 搜索图标大小 |
| `iconColor` | ThemeColors \| string \| undefined | 否 | `text_input_placeholder_text_color` | 搜索图标颜色 |
| `showIcon` | boolean | 否 | `true` | 是否显示搜索图标 |
| `onSearch` | (value: string) => void | 否 | — | 点击搜索回调， autoSearch 为 true 时也会触发 |
| `autoSearch` | boolean | 否 | `false` | 内容变化时自动触发 onSearch |
| `onSearchDebounceWait` | number | 否 | `300` | onSearch debounce wait |
| `searchText` | string | 否 | `'搜索'` | 搜索按钮文案 |
| `extra` | ReactNode | 否 | — | 搜索按钮右侧自定义内容 |
| `prefix` | ReactNode | 否 | — | 搜索 icon 左边自定义内容 |
| `suffix` | ReactNode | 否 | — | 搜索框内右边自定义内容 |
| `showSearchButton` | boolean | 否 | `false` | 是否显示搜索按钮 |
| `containerStyle` | ViewStyle | 否 | — | 自定义容器样式 |
| `inputProps` | XlbInputProps | 否 | — | 自定义 XlbInput 组件 props |

## 相关类型

```ts
export type XlbSearchBarRef = TextInputInstance;
```

## 附属结构

- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- [text-input-explicit-fontfamily](../gotchas/component-library/text-input-explicit-fontfamily.md)

<!-- AUTO:END -->

<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

| Prop | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `iconSize` | number | 否 | `18` | 搜索图标大小 |
| `iconColor` | ThemeColors \| string \| undefined | 否 | `text_input_placeholder_text_color` | 搜索图标颜色 |
| `showIcon` | boolean | 否 | `true` | 是否显示搜索图标 |
| `onSearch` | (value: string) => void | 否 | — | 点击搜索回调， autoSearch 为 true 时也会触发 |
| `autoSearch` | boolean | 否 | `false` | 内容变化时自动触发 onSearch |
| `onSearchDebounceWait` | number | 否 | `300` | onSearch debounce wait |
| `searchText` | string | 否 | `'搜索'` | 搜索按钮文案 |
| `extra` | ReactNode | 否 | — | 搜索按钮右侧自定义内容 |
| `prefix` | ReactNode | 否 | — | 搜索 icon 左边自定义内容 |
| `suffix` | ReactNode | 否 | — | 搜索框内右边自定义内容 |
| `showSearchButton` | boolean | 否 | `false` | 是否显示搜索按钮 |
| `containerStyle` | ViewStyle | 否 | — | 自定义容器样式 |
| `inputProps` | XlbInputProps | 否 | — | 自定义 XlbInput 组件 props |

## 相关类型

```ts
export type XlbSearchBarRef = TextInputInstance;
```

## 附属结构

- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- [text-input-explicit-fontfamily](../gotchas/component-library/text-input-explicit-fontfamily.md)

<!-- AUTO:END -->

<!-- MANUAL:BEGIN -->

## 能力边界（人工维护）

> 该组件**不能**做什么、常见误用场景。（待补充）

## 易混淆对比（人工维护)

> 与最易误选的组件对比：看到什么特征用本组件，看到什么特征用对方。（待补充）

## 场景绑定（人工维护）

> 命中即直接选用本组件的设计稿特征，禁止自由发挥。（待补充）
