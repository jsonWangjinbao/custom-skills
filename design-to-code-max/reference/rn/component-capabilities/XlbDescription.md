# XlbDescription

> 数据源：`@xlb/components-react-native@1.0.0-beta.217` · `src/components/XlbDescription/index.tsx`
> 由 scripts/dtc-rn-component-cards.mjs 于 2026-08-06 生成；<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

> ⚠️ 本接口继承 `DescriptionProps`，下表仅为本组件**扩展**的 Props；其余 Props 见继承来源的定义（本文件或外部依赖）。

| Prop | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `theme` | Record<string, any> | 否 | `{}` | 自定义主题, 用于自定义描述列表的样式 |
| `options` | DescriptionOption[] | 否 | — | 描述项配置数组，传入后自动渲染 Description.Item |
| `descriptionStyle` | ViewStyle | 否 | — | 针对options中的每个item，自定义容器样式，如设置options之间的间距等 |

## 相关类型

```ts
export interface DescriptionOption {
  /**
   * 标签文本
   */
  label?: string;
  /**
   * 展示的值（优先于 text）
   */
  value?: ReactNode;
  /**
   * 展示的文本
   */
  text?: string;
  /**
   * 自定义渲染函数
   */
  render?: () => ReactNode;
  /**
   * 是否显示冒号
   * @default true
   */
  colon?: boolean;
  /**
   * 自定义标签样式
   * @default { paddingRight: normalize(12) }
   */
  labelStyle?: any;
  /**
   * 自定义内容样式
   */
  contentStyle?: any;
  /**
   * 自定义标签宽度
   */
  labelWidth?: number;
  /**
   * label 与 text 的排版、布局
   */
  layout?: 'horizontal' | 'vertical';
  /**
   * 文案大小
   */
  size?: 's' | 'm' | 'l';
  /**
   * 是否加粗显示内容
   */
  bold?: boolean;
  /**
   * 字体颜色
   */
  color?: string;
  /**
   * 是否隐藏
   */
  hidden?: boolean;
}

export interface XlbDescriptionGroupProps {
  /**
   * 自定义主题, 用于自定义描述列表的样式
   * @default {}
   */
  theme?: Record<string, any>;
}
```

## 附属结构

- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- （无匹配记录）

<!-- AUTO:END -->

<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

> ⚠️ 本接口继承 `DescriptionProps`（外部依赖），下表仅为本组件**扩展**的 Props；基础 Props（如表单三件套 form/initialValues/onFinish）见继承来源。

| Prop | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `theme` | Record<string, any> | 否 | `{}` | 自定义主题, 用于自定义描述列表的样式 |
| `options` | DescriptionOption[] | 否 | — | 描述项配置数组，传入后自动渲染 Description.Item |
| `descriptionStyle` | ViewStyle | 否 | — | 针对options中的每个item，自定义容器样式，如设置options之间的间距等 |

## 相关类型

```ts
export interface DescriptionOption {
  /**
   * 标签文本
   */
  label?: string;
  /**
   * 展示的值（优先于 text）
   */
  value?: ReactNode;
  /**
   * 展示的文本
   */
  text?: string;
  /**
   * 自定义渲染函数
   */
  render?: () => ReactNode;
  /**
   * 是否显示冒号
   * @default true
   */
  colon?: boolean;
  /**
   * 自定义标签样式
   * @default { paddingRight: normalize(12) }
   */
  labelStyle?: any;
  /**
   * 自定义内容样式
   */
  contentStyle?: any;
  /**
   * 自定义标签宽度
   */
  labelWidth?: number;
  /**
   * label 与 text 的排版、布局
   */
  layout?: 'horizontal' | 'vertical';
  /**
   * 文案大小
   */
  size?: 's' | 'm' | 'l';
  /**
   * 是否加粗显示内容
   */
  bold?: boolean;
  /**
   * 字体颜色
   */
  color?: string;
  /**
   * 是否隐藏
   */
  hidden?: boolean;
}

export interface XlbDescriptionGroupProps {
  /**
   * 自定义主题, 用于自定义描述列表的样式
   * @default {}
   */
  theme?: Record<string, any>;
}
```

## 附属结构

- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- （无匹配记录）

<!-- AUTO:END -->

<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

> ⚠️ 本接口继承 `DescriptionProps`（外部依赖），下表仅为本组件**扩展**的 Props；基础 Props（如表单三件套 form/initialValues/onFinish）见继承来源。

| Prop | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `theme` | Record<string, any> | 否 | `{}` | 自定义主题, 用于自定义描述列表的样式 |
| `options` | DescriptionOption[] | 否 | — | 描述项配置数组，传入后自动渲染 Description.Item |
| `descriptionStyle` | ViewStyle | 否 | — | 针对options中的每个item，自定义容器样式，如设置options之间的间距等 |

## 相关类型

```ts
export interface DescriptionOption {
  /**
   * 标签文本
   */
  label?: string;
  /**
   * 展示的值（优先于 text）
   */
  value?: ReactNode;
  /**
   * 展示的文本
   */
  text?: string;
  /**
   * 自定义渲染函数
   */
  render?: () => ReactNode;
  /**
   * 是否显示冒号
   * @default true
   */
  colon?: boolean;
  /**
   * 自定义标签样式
   * @default { paddingRight: normalize(12) }
   */
  labelStyle?: any;
  /**
   * 自定义内容样式
   */
  contentStyle?: any;
  /**
   * 自定义标签宽度
   */
  labelWidth?: number;
  /**
   * label 与 text 的排版、布局
   */
  layout?: 'horizontal' | 'vertical';
  /**
   * 文案大小
   */
  size?: 's' | 'm' | 'l';
  /**
   * 是否加粗显示内容
   */
  bold?: boolean;
  /**
   * 字体颜色
   */
  color?: string;
  /**
   * 是否隐藏
   */
  hidden?: boolean;
}

export interface XlbDescriptionGroupProps {
  /**
   * 自定义主题, 用于自定义描述列表的样式
   * @default {}
   */
  theme?: Record<string, any>;
}
```

## 附属结构

- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- （无匹配记录）

<!-- AUTO:END -->

<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

> ⚠️ 本接口继承 `DescriptionProps`（外部依赖），下表仅为本组件**扩展**的 Props；基础 Props（如表单三件套 form/initialValues/onFinish）见继承来源。

| Prop | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `theme` | Record<string, any> | 否 | `{}` | 自定义主题, 用于自定义描述列表的样式 |
| `options` | DescriptionOption[] | 否 | — | 描述项配置数组，传入后自动渲染 Description.Item |
| `descriptionStyle` | ViewStyle | 否 | — | 针对options中的每个item，自定义容器样式，如设置options之间的间距等 |

## 相关类型

```ts
export interface DescriptionOption {
  /**
   * 标签文本
   */
  label?: string;
  /**
   * 展示的值（优先于 text）
   */
  value?: ReactNode;
  /**
   * 展示的文本
   */
  text?: string;
  /**
   * 自定义渲染函数
   */
  render?: () => ReactNode;
  /**
   * 是否显示冒号
   * @default true
   */
  colon?: boolean;
  /**
   * 自定义标签样式
   * @default { paddingRight: normalize(12) }
   */
  labelStyle?: any;
  /**
   * 自定义内容样式
   */
  contentStyle?: any;
  /**
   * 自定义标签宽度
   */
  labelWidth?: number;
  /**
   * label 与 text 的排版、布局
   */
  layout?: 'horizontal' | 'vertical';
  /**
   * 文案大小
   */
  size?: 's' | 'm' | 'l';
  /**
   * 是否加粗显示内容
   */
  bold?: boolean;
  /**
   * 字体颜色
   */
  color?: string;
  /**
   * 是否隐藏
   */
  hidden?: boolean;
}

export interface XlbDescriptionGroupProps {
  /**
   * 自定义主题, 用于自定义描述列表的样式
   * @default {}
   */
  theme?: Record<string, any>;
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
| `theme` | Record<string, any> | 否 | `{}` | 自定义主题, 用于自定义描述列表的样式 |
| `options` | DescriptionOption[] | 否 | — | 描述项配置数组，传入后自动渲染 Description.Item |
| `descriptionStyle` | ViewStyle | 否 | — | 针对options中的每个item，自定义容器样式，如设置options之间的间距等 |

## 相关类型

```ts
export interface DescriptionOption {
  /**
   * 标签文本
   */
  label?: string;
  /**
   * 展示的值（优先于 text）
   */
  value?: ReactNode;
  /**
   * 展示的文本
   */
  text?: string;
  /**
   * 自定义渲染函数
   */
  render?: () => ReactNode;
  /**
   * 是否显示冒号
   * @default true
   */
  colon?: boolean;
  /**
   * 自定义标签样式
   * @default { paddingRight: normalize(12) }
   */
  labelStyle?: any;
  /**
   * 自定义内容样式
   */
  contentStyle?: any;
  /**
   * 自定义标签宽度
   */
  labelWidth?: number;
  /**
   * label 与 text 的排版、布局
   */
  layout?: 'horizontal' | 'vertical';
  /**
   * 文案大小
   */
  size?: 's' | 'm' | 'l';
  /**
   * 是否加粗显示内容
   */
  bold?: boolean;
  /**
   * 字体颜色
   */
  color?: string;
  /**
   * 是否隐藏
   */
  hidden?: boolean;
}

export interface XlbDescriptionGroupProps {
  /**
   * 自定义主题, 用于自定义描述列表的样式
   * @default {}
   */
  theme?: Record<string, any>;
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
