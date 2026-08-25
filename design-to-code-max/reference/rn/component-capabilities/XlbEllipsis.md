# XlbEllipsis

> 数据源：`@xlb/components-react-native@1.0.0-beta.217` · `src/components/XlbEllipsis/index.tsx`
> 由 scripts/dtc-rn-component-cards.mjs 于 2026-08-06 生成；<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

> ⚠️ 本接口继承 `ViewProps`，下表仅为本组件**扩展**的 Props；其余 Props 见继承来源的定义（本文件或外部依赖）。

| Prop | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `content` | string | **是** | — | 文本内容 |
| `removeLineBreak` | boolean | 否 | `true` | 是否去除换行符 |
| `rows` | number | 否 | `1` | 展示行数 |
| `direction` | XlbEllipsisDirection | 否 | `'end'` | 省略位置 |
| `expandText` | ReactNode | 否 | `'展开'` | 展开操作文案 |
| `collapseText` | ReactNode | 否 | `'收起'` | 收起操作文案 |
| `onContentClick` | (event: GestureResponderEvent) => void | 否 | — | 点击文本内容时触发 |
| `stopPropagationForActionButtons` | XlbEllipsisActionEvent[] | 否 | `[]` | 阻止展开/收起按钮事件冒泡 |
| `defaultExpanded` | boolean | 否 | `false` | 是否默认展开 |
| `onExpand` | ( expanded: boolean, info: { event: GestureResponderEvent }, ) => void | 否 | — | 展开收起回调 |
| `textStyle` | StyleProp<TextStyle> | 否 | — | 文本样式 |
| `actionTextStyle` | StyleProp<TextStyle> | 否 | — | 操作文案样式 |

## 相关类型

```ts
export type XlbEllipsisDirection = 'start' | 'end' | 'middle';

export type XlbEllipsisActionEvent = 'expand' | 'collapse';
```

## 附属结构

- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- （无匹配记录）

<!-- AUTO:END -->

<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

> ⚠️ 本接口继承 `ViewProps`（外部依赖），下表仅为本组件**扩展**的 Props；基础 Props（如表单三件套 form/initialValues/onFinish）见继承来源。

| Prop | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `content` | string | **是** | — | 文本内容 |
| `removeLineBreak` | boolean | 否 | `true` | 是否去除换行符 |
| `rows` | number | 否 | `1` | 展示行数 |
| `direction` | XlbEllipsisDirection | 否 | `'end'` | 省略位置 |
| `expandText` | ReactNode | 否 | `'展开'` | 展开操作文案 |
| `collapseText` | ReactNode | 否 | `'收起'` | 收起操作文案 |
| `onContentClick` | (event: GestureResponderEvent) => void | 否 | — | 点击文本内容时触发 |
| `stopPropagationForActionButtons` | XlbEllipsisActionEvent[] | 否 | `[]` | 阻止展开/收起按钮事件冒泡 |
| `defaultExpanded` | boolean | 否 | `false` | 是否默认展开 |
| `onExpand` | ( expanded: boolean, info: { event: GestureResponderEvent }, ) => void | 否 | — | 展开收起回调 |
| `textStyle` | StyleProp<TextStyle> | 否 | — | 文本样式 |
| `actionTextStyle` | StyleProp<TextStyle> | 否 | — | 操作文案样式 |

## 相关类型

```ts
export type XlbEllipsisDirection = 'start' | 'end' | 'middle';

export type XlbEllipsisActionEvent = 'expand' | 'collapse';
```

## 附属结构

- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- （无匹配记录）

<!-- AUTO:END -->

<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

> ⚠️ 本接口继承 `ViewProps`（外部依赖），下表仅为本组件**扩展**的 Props；基础 Props（如表单三件套 form/initialValues/onFinish）见继承来源。

| Prop | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `content` | string | **是** | — | 文本内容 |
| `removeLineBreak` | boolean | 否 | `true` | 是否去除换行符 |
| `rows` | number | 否 | `1` | 展示行数 |
| `direction` | XlbEllipsisDirection | 否 | `'end'` | 省略位置 |
| `expandText` | ReactNode | 否 | `'展开'` | 展开操作文案 |
| `collapseText` | ReactNode | 否 | `'收起'` | 收起操作文案 |
| `onContentClick` | (event: GestureResponderEvent) => void | 否 | — | 点击文本内容时触发 |
| `stopPropagationForActionButtons` | XlbEllipsisActionEvent[] | 否 | `[]` | 阻止展开/收起按钮事件冒泡 |
| `defaultExpanded` | boolean | 否 | `false` | 是否默认展开 |
| `onExpand` | ( expanded: boolean, info: { event: GestureResponderEvent }, ) => void | 否 | — | 展开收起回调 |
| `textStyle` | StyleProp<TextStyle> | 否 | — | 文本样式 |
| `actionTextStyle` | StyleProp<TextStyle> | 否 | — | 操作文案样式 |

## 相关类型

```ts
export type XlbEllipsisDirection = 'start' | 'end' | 'middle';

export type XlbEllipsisActionEvent = 'expand' | 'collapse';
```

## 附属结构

- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- （无匹配记录）

<!-- AUTO:END -->

<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

> ⚠️ 本接口继承 `ViewProps`（外部依赖），下表仅为本组件**扩展**的 Props；基础 Props（如表单三件套 form/initialValues/onFinish）见继承来源。

| Prop | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `content` | string | **是** | — | 文本内容 |
| `removeLineBreak` | boolean | 否 | `true` | 是否去除换行符 |
| `rows` | number | 否 | `1` | 展示行数 |
| `direction` | XlbEllipsisDirection | 否 | `'end'` | 省略位置 |
| `expandText` | ReactNode | 否 | `'展开'` | 展开操作文案 |
| `collapseText` | ReactNode | 否 | `'收起'` | 收起操作文案 |
| `onContentClick` | (event: GestureResponderEvent) => void | 否 | — | 点击文本内容时触发 |
| `stopPropagationForActionButtons` | XlbEllipsisActionEvent[] | 否 | `[]` | 阻止展开/收起按钮事件冒泡 |
| `defaultExpanded` | boolean | 否 | `false` | 是否默认展开 |
| `onExpand` | ( expanded: boolean, info: { event: GestureResponderEvent }, ) => void | 否 | — | 展开收起回调 |
| `textStyle` | StyleProp<TextStyle> | 否 | — | 文本样式 |
| `actionTextStyle` | StyleProp<TextStyle> | 否 | — | 操作文案样式 |

## 相关类型

```ts
export type XlbEllipsisDirection = 'start' | 'end' | 'middle';

export type XlbEllipsisActionEvent = 'expand' | 'collapse';
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
| `content` | string | **是** | — | 文本内容 |
| `removeLineBreak` | boolean | 否 | `true` | 是否去除换行符 |
| `rows` | number | 否 | `1` | 展示行数 |
| `direction` | XlbEllipsisDirection | 否 | `'end'` | 省略位置 |
| `expandText` | ReactNode | 否 | `'展开'` | 展开操作文案 |
| `collapseText` | ReactNode | 否 | `'收起'` | 收起操作文案 |
| `onContentClick` | (event: GestureResponderEvent) => void | 否 | — | 点击文本内容时触发 |
| `stopPropagationForActionButtons` | XlbEllipsisActionEvent[] | 否 | `[]` | 阻止展开/收起按钮事件冒泡 |
| `defaultExpanded` | boolean | 否 | `false` | 是否默认展开 |
| `onExpand` | ( expanded: boolean, info: { event: GestureResponderEvent }, ) => void | 否 | — | 展开收起回调 |
| `textStyle` | StyleProp<TextStyle> | 否 | — | 文本样式 |
| `actionTextStyle` | StyleProp<TextStyle> | 否 | — | 操作文案样式 |

## 相关类型

```ts
export type XlbEllipsisDirection = 'start' | 'end' | 'middle';

export type XlbEllipsisActionEvent = 'expand' | 'collapse';
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
