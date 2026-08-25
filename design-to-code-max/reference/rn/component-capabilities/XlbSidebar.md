# XlbSidebar

> 数据源：`@xlb/components-react-native@1.0.0-beta.217` · `src/components/XlbSidebar/index.tsx`
> 由 scripts/dtc-rn-component-cards.mjs 于 2026-08-06 生成；<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

> ⚠️ 本接口继承 `CustomSidebarProps`，下表仅为本组件**扩展**的 Props；其余 Props 见继承来源的定义（本文件或外部依赖）。

| Prop | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `width` | number | 否 | — | 宽度 |
| `loading` | boolean | 否 | — | 当选项还在加载中时，可以用 loading 展示一个占位 |
| `options` | XlbSidebarOption[] | **是** | — | 选项 |
| `activeValue` | XlbSidebarValue | 否 | — | 当前激活 item 的 value |
| `defaultActiveValue` | XlbSidebarValue | 否 | — | 初始化选中 item 的 value |
| `onChange` | (value: XlbSidebarValue) => void | 否 | — | 切换面板的回调 |
| `empty` | React.ReactNode | 否 | — | 空数据占位符 |
| `containerStyle` | ViewStyle | 否 | — | 容器样式 |
| `labelNumberOfLines` | number | 否 | — | label 最多显示行数，默认为 0（不限制），设置为大于0的值可以限制行数 |
| `itemStyle` | ViewStyle | 否 | — | 自定义 tab 项容器样式 |

## 相关类型

```ts
export type XlbSidebarValue = SidebarValue;

export interface XlbSidebarOption {
  label: string;
  value: XlbSidebarValue;
  disabled?: boolean;
  badge?: any;
}
```

## 附属结构

- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- （无匹配记录）

<!-- AUTO:END -->

<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

> ⚠️ 本接口继承 `CustomSidebarProps`（外部依赖），下表仅为本组件**扩展**的 Props；基础 Props（如表单三件套 form/initialValues/onFinish）见继承来源。

| Prop | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `width` | number | 否 | — | 宽度 |
| `loading` | boolean | 否 | — | 当选项还在加载中时，可以用 loading 展示一个占位 |
| `options` | XlbSidebarOption[] | **是** | — | 选项 |
| `activeValue` | XlbSidebarValue | 否 | — | 当前激活 item 的 value |
| `defaultActiveValue` | XlbSidebarValue | 否 | — | 初始化选中 item 的 value |
| `onChange` | (value: XlbSidebarValue) => void | 否 | — | 切换面板的回调 |
| `empty` | React.ReactNode | 否 | — | 空数据占位符 |
| `containerStyle` | ViewStyle | 否 | — | 容器样式 |
| `labelNumberOfLines` | number | 否 | — | label 最多显示行数，默认为 0（不限制），设置为大于0的值可以限制行数 |
| `itemStyle` | ViewStyle | 否 | — | 自定义 tab 项容器样式 |

## 相关类型

```ts
export type XlbSidebarValue = SidebarValue;

export interface XlbSidebarOption {
  label: string;
  value: XlbSidebarValue;
  disabled?: boolean;
  badge?: any;
}
```

## 附属结构

- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- （无匹配记录）

<!-- AUTO:END -->

<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

> ⚠️ 本接口继承 `CustomSidebarProps`（外部依赖），下表仅为本组件**扩展**的 Props；基础 Props（如表单三件套 form/initialValues/onFinish）见继承来源。

| Prop | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `width` | number | 否 | — | 宽度 |
| `loading` | boolean | 否 | — | 当选项还在加载中时，可以用 loading 展示一个占位 |
| `options` | XlbSidebarOption[] | **是** | — | 选项 |
| `activeValue` | XlbSidebarValue | 否 | — | 当前激活 item 的 value |
| `defaultActiveValue` | XlbSidebarValue | 否 | — | 初始化选中 item 的 value |
| `onChange` | (value: XlbSidebarValue) => void | 否 | — | 切换面板的回调 |
| `empty` | React.ReactNode | 否 | — | 空数据占位符 |
| `containerStyle` | ViewStyle | 否 | — | 容器样式 |
| `labelNumberOfLines` | number | 否 | — | label 最多显示行数，默认为 0（不限制），设置为大于0的值可以限制行数 |
| `itemStyle` | ViewStyle | 否 | — | 自定义 tab 项容器样式 |

## 相关类型

```ts
export type XlbSidebarValue = SidebarValue;

export interface XlbSidebarOption {
  label: string;
  value: XlbSidebarValue;
  disabled?: boolean;
  badge?: any;
}
```

## 附属结构

- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- （无匹配记录）

<!-- AUTO:END -->

<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

> ⚠️ 本接口继承 `CustomSidebarProps`（外部依赖），下表仅为本组件**扩展**的 Props；基础 Props（如表单三件套 form/initialValues/onFinish）见继承来源。

| Prop | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `width` | number | 否 | — | 宽度 |
| `loading` | boolean | 否 | — | 当选项还在加载中时，可以用 loading 展示一个占位 |
| `options` | XlbSidebarOption[] | **是** | — | 选项 |
| `activeValue` | XlbSidebarValue | 否 | — | 当前激活 item 的 value |
| `defaultActiveValue` | XlbSidebarValue | 否 | — | 初始化选中 item 的 value |
| `onChange` | (value: XlbSidebarValue) => void | 否 | — | 切换面板的回调 |
| `empty` | React.ReactNode | 否 | — | 空数据占位符 |
| `containerStyle` | ViewStyle | 否 | — | 容器样式 |
| `labelNumberOfLines` | number | 否 | — | label 最多显示行数，默认为 0（不限制），设置为大于0的值可以限制行数 |
| `itemStyle` | ViewStyle | 否 | — | 自定义 tab 项容器样式 |

## 相关类型

```ts
export type XlbSidebarValue = SidebarValue;

export interface XlbSidebarOption {
  label: string;
  value: XlbSidebarValue;
  disabled?: boolean;
  badge?: any;
}
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
| `width` | number | 否 | — | 宽度 |
| `loading` | boolean | 否 | — | 当选项还在加载中时，可以用 loading 展示一个占位 |
| `options` | XlbSidebarOption[] | **是** | — | 选项 |
| `activeValue` | XlbSidebarValue | 否 | — | 当前激活 item 的 value |
| `defaultActiveValue` | XlbSidebarValue | 否 | — | 初始化选中 item 的 value |
| `onChange` | (value: XlbSidebarValue) => void | 否 | — | 切换面板的回调 |
| `empty` | React.ReactNode | 否 | — | 空数据占位符 |
| `containerStyle` | ViewStyle | 否 | — | 容器样式 |
| `labelNumberOfLines` | number | 否 | — | label 最多显示行数，默认为 0（不限制），设置为大于0的值可以限制行数 |
| `itemStyle` | ViewStyle | 否 | — | 自定义 tab 项容器样式 |

## 相关类型

```ts
export type XlbSidebarValue = SidebarValue;

export interface XlbSidebarOption {
  label: string;
  value: XlbSidebarValue;
  disabled?: boolean;
  badge?: any;
}
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
