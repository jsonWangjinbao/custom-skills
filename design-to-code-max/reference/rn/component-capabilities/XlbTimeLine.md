# XlbTimeLine

> 数据源：`@xlb/components-react-native@1.0.0-beta.217` · `src/components/XlbTimeLine/index.tsx`
> 由 scripts/dtc-rn-component-cards.mjs 于 2026-08-06 生成；<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

| Prop | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `items` | Omit<XlbTimeLineItemProps, 'isLast' \| 'lineType'>[] | 否 | — | 时间轴数据 |
| `children` | ReactNode | 否 | — | 子节点（使用 XlbTimeLine.Item） |
| `lineType` | 'dashed' \| 'solid' \| 'none' | 否 | `'solid'` | 连线类型 |
| `leftWidth` | number | 否 | `80` | 左侧容器宽度 |
| `centerWidth` | number | 否 | `32` | 中间容器宽度 |
| `style` | ViewStyle | 否 | — | 自定义样式 |

## 相关类型

```ts
export interface XlbTimeLineItemData {
  /**
   * 是否为最后一个节点
   */
  isLast?: boolean;
  /**
   * 连线类型
   */
  lineType?: 'dashed' | 'solid' | 'none';
}

export interface XlbTimeLineItemProps {
  /**
   * 左侧内容
   */
  left?: ReactNode | ((data: XlbTimeLineItemData) => ReactNode);
  /**
   * 右侧内容
   */
  right?: ReactNode | ((data: XlbTimeLineItemData) => ReactNode);
  /**
   * 是否激活状态
   * @default false
   */
  active?: boolean;
  /**
   * 自定义图标
   */
  icon?: ReactNode | ((data: XlbTimeLineItemData) => ReactNode);
  /**
   * 激活状态的图标
   */
  activeIcon?: ReactNode | ((data: XlbTimeLineItemData) => ReactNode);
  /**
   * 左侧容器宽度
   * @default 80
   */
  leftWidth?: number;
  /**
   * 中间容器宽度
   * @default 32
   */
  centerWidth?: number;
  /**
   * 左侧容器样式（可覆盖 width 等属性）
   */
  leftStyle?: ViewStyle;
  /**
   * 中间容器样式（可覆盖 width 等属性）
   */
  centerStyle?: ViewStyle;
  /**
   * 连线类型（内部自动传递）
   * @default 'dashed'
   */
  lineType?: 'dashed' | 'solid' | 'none';
  /**
   * 是否为最后一个节点（内部自动计算）
   * @default false
   */
  isLast?: boolean;
  /**
   * 自定义样式
   */
  style?: ViewStyle;
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
| `items` | Omit<XlbTimeLineItemProps, 'isLast' \| 'lineType'>[] | 否 | — | 时间轴数据 |
| `children` | ReactNode | 否 | — | 子节点（使用 XlbTimeLine.Item） |
| `lineType` | 'dashed' \| 'solid' \| 'none' | 否 | `'solid'` | 连线类型 |
| `leftWidth` | number | 否 | `80` | 左侧容器宽度 |
| `centerWidth` | number | 否 | `32` | 中间容器宽度 |
| `style` | ViewStyle | 否 | — | 自定义样式 |

## 相关类型

```ts
export interface XlbTimeLineItemData {
  /**
   * 是否为最后一个节点
   */
  isLast?: boolean;
  /**
   * 连线类型
   */
  lineType?: 'dashed' | 'solid' | 'none';
}

export interface XlbTimeLineItemProps {
  /**
   * 左侧内容
   */
  left?: ReactNode | ((data: XlbTimeLineItemData) => ReactNode);
  /**
   * 右侧内容
   */
  right?: ReactNode | ((data: XlbTimeLineItemData) => ReactNode);
  /**
   * 是否激活状态
   * @default false
   */
  active?: boolean;
  /**
   * 自定义图标
   */
  icon?: ReactNode | ((data: XlbTimeLineItemData) => ReactNode);
  /**
   * 激活状态的图标
   */
  activeIcon?: ReactNode | ((data: XlbTimeLineItemData) => ReactNode);
  /**
   * 左侧容器宽度
   * @default 80
   */
  leftWidth?: number;
  /**
   * 中间容器宽度
   * @default 32
   */
  centerWidth?: number;
  /**
   * 左侧容器样式（可覆盖 width 等属性）
   */
  leftStyle?: ViewStyle;
  /**
   * 中间容器样式（可覆盖 width 等属性）
   */
  centerStyle?: ViewStyle;
  /**
   * 连线类型（内部自动传递）
   * @default 'dashed'
   */
  lineType?: 'dashed' | 'solid' | 'none';
  /**
   * 是否为最后一个节点（内部自动计算）
   * @default false
   */
  isLast?: boolean;
  /**
   * 自定义样式
   */
  style?: ViewStyle;
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
| `items` | Omit<XlbTimeLineItemProps, 'isLast' \| 'lineType'>[] | 否 | — | 时间轴数据 |
| `children` | ReactNode | 否 | — | 子节点（使用 XlbTimeLine.Item） |
| `lineType` | 'dashed' \| 'solid' \| 'none' | 否 | `'solid'` | 连线类型 |
| `leftWidth` | number | 否 | `80` | 左侧容器宽度 |
| `centerWidth` | number | 否 | `32` | 中间容器宽度 |
| `style` | ViewStyle | 否 | — | 自定义样式 |

## 相关类型

```ts
export interface XlbTimeLineItemData {
  /**
   * 是否为最后一个节点
   */
  isLast?: boolean;
  /**
   * 连线类型
   */
  lineType?: 'dashed' | 'solid' | 'none';
}

export interface XlbTimeLineItemProps {
  /**
   * 左侧内容
   */
  left?: ReactNode | ((data: XlbTimeLineItemData) => ReactNode);
  /**
   * 右侧内容
   */
  right?: ReactNode | ((data: XlbTimeLineItemData) => ReactNode);
  /**
   * 是否激活状态
   * @default false
   */
  active?: boolean;
  /**
   * 自定义图标
   */
  icon?: ReactNode | ((data: XlbTimeLineItemData) => ReactNode);
  /**
   * 激活状态的图标
   */
  activeIcon?: ReactNode | ((data: XlbTimeLineItemData) => ReactNode);
  /**
   * 左侧容器宽度
   * @default 80
   */
  leftWidth?: number;
  /**
   * 中间容器宽度
   * @default 32
   */
  centerWidth?: number;
  /**
   * 左侧容器样式（可覆盖 width 等属性）
   */
  leftStyle?: ViewStyle;
  /**
   * 中间容器样式（可覆盖 width 等属性）
   */
  centerStyle?: ViewStyle;
  /**
   * 连线类型（内部自动传递）
   * @default 'dashed'
   */
  lineType?: 'dashed' | 'solid' | 'none';
  /**
   * 是否为最后一个节点（内部自动计算）
   * @default false
   */
  isLast?: boolean;
  /**
   * 自定义样式
   */
  style?: ViewStyle;
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
| `items` | Omit<XlbTimeLineItemProps, 'isLast' \| 'lineType'>[] | 否 | — | 时间轴数据 |
| `children` | ReactNode | 否 | — | 子节点（使用 XlbTimeLine.Item） |
| `lineType` | 'dashed' \| 'solid' \| 'none' | 否 | `'solid'` | 连线类型 |
| `leftWidth` | number | 否 | `80` | 左侧容器宽度 |
| `centerWidth` | number | 否 | `32` | 中间容器宽度 |
| `style` | ViewStyle | 否 | — | 自定义样式 |

## 相关类型

```ts
export interface XlbTimeLineItemData {
  /**
   * 是否为最后一个节点
   */
  isLast?: boolean;
  /**
   * 连线类型
   */
  lineType?: 'dashed' | 'solid' | 'none';
}

export interface XlbTimeLineItemProps {
  /**
   * 左侧内容
   */
  left?: ReactNode | ((data: XlbTimeLineItemData) => ReactNode);
  /**
   * 右侧内容
   */
  right?: ReactNode | ((data: XlbTimeLineItemData) => ReactNode);
  /**
   * 是否激活状态
   * @default false
   */
  active?: boolean;
  /**
   * 自定义图标
   */
  icon?: ReactNode | ((data: XlbTimeLineItemData) => ReactNode);
  /**
   * 激活状态的图标
   */
  activeIcon?: ReactNode | ((data: XlbTimeLineItemData) => ReactNode);
  /**
   * 左侧容器宽度
   * @default 80
   */
  leftWidth?: number;
  /**
   * 中间容器宽度
   * @default 32
   */
  centerWidth?: number;
  /**
   * 左侧容器样式（可覆盖 width 等属性）
   */
  leftStyle?: ViewStyle;
  /**
   * 中间容器样式（可覆盖 width 等属性）
   */
  centerStyle?: ViewStyle;
  /**
   * 连线类型（内部自动传递）
   * @default 'dashed'
   */
  lineType?: 'dashed' | 'solid' | 'none';
  /**
   * 是否为最后一个节点（内部自动计算）
   * @default false
   */
  isLast?: boolean;
  /**
   * 自定义样式
   */
  style?: ViewStyle;
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
| `items` | Omit<XlbTimeLineItemProps, 'isLast' \| 'lineType'>[] | 否 | — | 时间轴数据 |
| `children` | ReactNode | 否 | — | 子节点（使用 XlbTimeLine.Item） |
| `lineType` | 'dashed' \| 'solid' \| 'none' | 否 | `'solid'` | 连线类型 |
| `leftWidth` | number | 否 | `80` | 左侧容器宽度 |
| `centerWidth` | number | 否 | `32` | 中间容器宽度 |
| `style` | ViewStyle | 否 | — | 自定义样式 |

## 相关类型

```ts
export interface XlbTimeLineItemData {
  /**
   * 是否为最后一个节点
   */
  isLast?: boolean;
  /**
   * 连线类型
   */
  lineType?: 'dashed' | 'solid' | 'none';
}

export interface XlbTimeLineItemProps {
  /**
   * 左侧内容
   */
  left?: ReactNode | ((data: XlbTimeLineItemData) => ReactNode);
  /**
   * 右侧内容
   */
  right?: ReactNode | ((data: XlbTimeLineItemData) => ReactNode);
  /**
   * 是否激活状态
   * @default false
   */
  active?: boolean;
  /**
   * 自定义图标
   */
  icon?: ReactNode | ((data: XlbTimeLineItemData) => ReactNode);
  /**
   * 激活状态的图标
   */
  activeIcon?: ReactNode | ((data: XlbTimeLineItemData) => ReactNode);
  /**
   * 左侧容器宽度
   * @default 80
   */
  leftWidth?: number;
  /**
   * 中间容器宽度
   * @default 32
   */
  centerWidth?: number;
  /**
   * 左侧容器样式（可覆盖 width 等属性）
   */
  leftStyle?: ViewStyle;
  /**
   * 中间容器样式（可覆盖 width 等属性）
   */
  centerStyle?: ViewStyle;
  /**
   * 连线类型（内部自动传递）
   * @default 'dashed'
   */
  lineType?: 'dashed' | 'solid' | 'none';
  /**
   * 是否为最后一个节点（内部自动计算）
   * @default false
   */
  isLast?: boolean;
  /**
   * 自定义样式
   */
  style?: ViewStyle;
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
