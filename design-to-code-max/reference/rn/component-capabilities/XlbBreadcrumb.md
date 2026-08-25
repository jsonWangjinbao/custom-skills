# XlbBreadcrumb

> 数据源：`@xlb/components-react-native@1.0.0-beta.217` · `src/components/XlbBreadcrumb/index.tsx`
> 由 scripts/dtc-rn-component-cards.mjs 于 2026-08-06 生成；<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

| Prop | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `items` | XlbBreadcrumbItem[] | **是** | — | 面包屑数据源 |
| `separator` | ReactNode | 否 | `'>'` | 自定义分隔符 |
| `itemRender` | ( item: XlbBreadcrumbItem, index: number, items: XlbBreadcrumbItem[], paths: string[], ) => … | 否 | — | 自定义节点渲染 |
| `onPressItem` | (item: XlbBreadcrumbItem, index: number) => void | 否 | — | 统一点击回调 |
| `containerStyle` | StyleProp<ViewStyle> | 否 | — | 容器样式 |
| `itemStyle` | StyleProp<ViewStyle> | 否 | — | 面包屑项样式 |
| `textStyle` | StyleProp<TextStyle> | 否 | — | 文本样式 |
| `activeTextStyle` | StyleProp<TextStyle> | 否 | — | 激活项文本样式 |
| `separatorStyle` | StyleProp<TextStyle> | 否 | — | 分隔符样式 |

## 相关类型

```ts
export interface XlbBreadcrumbItem {
  /**
   * 唯一标识
   */
  key?: string;
  /**
   * 面包屑展示内容
   */
  title: ReactNode;
  /**
   * 路径标识
   */
  path?: string;
  /**
   * 点击事件
   */
  onPress?: () => void;
  /**
   * 是否为当前激活项
   * 激活项后面的项不会展示
   */
  active?: boolean;
  /**
   * 其他字段
   */
  [key: string]: any;
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
| `items` | XlbBreadcrumbItem[] | **是** | — | 面包屑数据源 |
| `separator` | ReactNode | 否 | `'>'` | 自定义分隔符 |
| `itemRender` | ( item: XlbBreadcrumbItem, index: number, items: XlbBreadcrumbItem[], paths: string[], ) => … | 否 | — | 自定义节点渲染 |
| `onPressItem` | (item: XlbBreadcrumbItem, index: number) => void | 否 | — | 统一点击回调 |
| `containerStyle` | StyleProp<ViewStyle> | 否 | — | 容器样式 |
| `itemStyle` | StyleProp<ViewStyle> | 否 | — | 面包屑项样式 |
| `textStyle` | StyleProp<TextStyle> | 否 | — | 文本样式 |
| `activeTextStyle` | StyleProp<TextStyle> | 否 | — | 激活项文本样式 |
| `separatorStyle` | StyleProp<TextStyle> | 否 | — | 分隔符样式 |

## 相关类型

```ts
export interface XlbBreadcrumbItem {
  /**
   * 唯一标识
   */
  key?: string;
  /**
   * 面包屑展示内容
   */
  title: ReactNode;
  /**
   * 路径标识
   */
  path?: string;
  /**
   * 点击事件
   */
  onPress?: () => void;
  /**
   * 是否为当前激活项
   * 激活项后面的项不会展示
   */
  active?: boolean;
  /**
   * 其他字段
   */
  [key: string]: any;
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
| `items` | XlbBreadcrumbItem[] | **是** | — | 面包屑数据源 |
| `separator` | ReactNode | 否 | `'>'` | 自定义分隔符 |
| `itemRender` | ( item: XlbBreadcrumbItem, index: number, items: XlbBreadcrumbItem[], paths: string[], ) => … | 否 | — | 自定义节点渲染 |
| `onPressItem` | (item: XlbBreadcrumbItem, index: number) => void | 否 | — | 统一点击回调 |
| `containerStyle` | StyleProp<ViewStyle> | 否 | — | 容器样式 |
| `itemStyle` | StyleProp<ViewStyle> | 否 | — | 面包屑项样式 |
| `textStyle` | StyleProp<TextStyle> | 否 | — | 文本样式 |
| `activeTextStyle` | StyleProp<TextStyle> | 否 | — | 激活项文本样式 |
| `separatorStyle` | StyleProp<TextStyle> | 否 | — | 分隔符样式 |

## 相关类型

```ts
export interface XlbBreadcrumbItem {
  /**
   * 唯一标识
   */
  key?: string;
  /**
   * 面包屑展示内容
   */
  title: ReactNode;
  /**
   * 路径标识
   */
  path?: string;
  /**
   * 点击事件
   */
  onPress?: () => void;
  /**
   * 是否为当前激活项
   * 激活项后面的项不会展示
   */
  active?: boolean;
  /**
   * 其他字段
   */
  [key: string]: any;
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
| `items` | XlbBreadcrumbItem[] | **是** | — | 面包屑数据源 |
| `separator` | ReactNode | 否 | `'>'` | 自定义分隔符 |
| `itemRender` | ( item: XlbBreadcrumbItem, index: number, items: XlbBreadcrumbItem[], paths: string[], ) => … | 否 | — | 自定义节点渲染 |
| `onPressItem` | (item: XlbBreadcrumbItem, index: number) => void | 否 | — | 统一点击回调 |
| `containerStyle` | StyleProp<ViewStyle> | 否 | — | 容器样式 |
| `itemStyle` | StyleProp<ViewStyle> | 否 | — | 面包屑项样式 |
| `textStyle` | StyleProp<TextStyle> | 否 | — | 文本样式 |
| `activeTextStyle` | StyleProp<TextStyle> | 否 | — | 激活项文本样式 |
| `separatorStyle` | StyleProp<TextStyle> | 否 | — | 分隔符样式 |

## 相关类型

```ts
export interface XlbBreadcrumbItem {
  /**
   * 唯一标识
   */
  key?: string;
  /**
   * 面包屑展示内容
   */
  title: ReactNode;
  /**
   * 路径标识
   */
  path?: string;
  /**
   * 点击事件
   */
  onPress?: () => void;
  /**
   * 是否为当前激活项
   * 激活项后面的项不会展示
   */
  active?: boolean;
  /**
   * 其他字段
   */
  [key: string]: any;
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
| `items` | XlbBreadcrumbItem[] | **是** | — | 面包屑数据源 |
| `separator` | ReactNode | 否 | `'>'` | 自定义分隔符 |
| `itemRender` | ( item: XlbBreadcrumbItem, index: number, items: XlbBreadcrumbItem[], paths: string[], ) => … | 否 | — | 自定义节点渲染 |
| `onPressItem` | (item: XlbBreadcrumbItem, index: number) => void | 否 | — | 统一点击回调 |
| `containerStyle` | StyleProp<ViewStyle> | 否 | — | 容器样式 |
| `itemStyle` | StyleProp<ViewStyle> | 否 | — | 面包屑项样式 |
| `textStyle` | StyleProp<TextStyle> | 否 | — | 文本样式 |
| `activeTextStyle` | StyleProp<TextStyle> | 否 | — | 激活项文本样式 |
| `separatorStyle` | StyleProp<TextStyle> | 否 | — | 分隔符样式 |

## 相关类型

```ts
export interface XlbBreadcrumbItem {
  /**
   * 唯一标识
   */
  key?: string;
  /**
   * 面包屑展示内容
   */
  title: ReactNode;
  /**
   * 路径标识
   */
  path?: string;
  /**
   * 点击事件
   */
  onPress?: () => void;
  /**
   * 是否为当前激活项
   * 激活项后面的项不会展示
   */
  active?: boolean;
  /**
   * 其他字段
   */
  [key: string]: any;
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
