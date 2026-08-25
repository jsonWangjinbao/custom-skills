# XlbActionSheet

> 数据源：`@xlb/components-react-native@1.0.0-beta.217` · `src/components/XlbActionSheet/index.tsx`
> 由 scripts/dtc-rn-component-cards.mjs 于 2026-08-06 生成；<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

> 主文件中未提取到 Props interface（可能为复合导出或定义在 types.ts），请人工查看源码。

## 相关类型

```ts
export interface Action {
  /** 选项名称 */
  name: string;
  /** 选项文字颜色 */
  color?: string;
  /** 是否为加载状态 */
  loading?: boolean;
  /** 是否为禁用状态 */
  disabled?: boolean;
  /** 其他自定义属性 */
  [key: string]: unknown;
}

export type ActionSheetAction = 'item' | 'cancel';

export interface XlbActionSheetOptions {
  /** 面板选项列表，支持字符串数组或 Action 对象数组 */
  actions: (string | Action)[];
  /** 顶部标题 */
  title?: ReactNode;
  /** 取消按钮文字 */
  cancelText?: string;
  /** 取消按钮文字样式 */
  cancelTextStyle?: StyleProp<TextStyle>;
  /** 选项上方的描述信息 */
  description?: ReactNode;
  /** 描述信息样式 */
  descriptionStyle?: StyleProp<TextStyle>;
  /** 是否显示圆角 */
  round?: boolean;
  /** 关闭前的回调函数，返回 false 可阻止关闭，支持返回 Promise */
  beforeClose?: (
    action: ActionSheetAction,
    item?: Action,
    index?: number,
  ) => boolean | Promise<boolean>;
}
```

## 附属结构

- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- （无匹配记录）

<!-- AUTO:END -->

<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

> 主文件中未提取到 Props interface（可能为复合导出或定义在 types.ts），请人工查看源码。

## 相关类型

```ts
export interface Action {
  /** 选项名称 */
  name: string;
  /** 选项文字颜色 */
  color?: string;
  /** 是否为加载状态 */
  loading?: boolean;
  /** 是否为禁用状态 */
  disabled?: boolean;
  /** 其他自定义属性 */
  [key: string]: unknown;
}

export type ActionSheetAction = 'item' | 'cancel';

export interface XlbActionSheetOptions {
  /** 面板选项列表，支持字符串数组或 Action 对象数组 */
  actions: (string | Action)[];
  /** 顶部标题 */
  title?: ReactNode;
  /** 取消按钮文字 */
  cancelText?: string;
  /** 取消按钮文字样式 */
  cancelTextStyle?: StyleProp<TextStyle>;
  /** 选项上方的描述信息 */
  description?: ReactNode;
  /** 描述信息样式 */
  descriptionStyle?: StyleProp<TextStyle>;
  /** 是否显示圆角 */
  round?: boolean;
  /** 关闭前的回调函数，返回 false 可阻止关闭，支持返回 Promise */
  beforeClose?: (
    action: ActionSheetAction,
    item?: Action,
    index?: number,
  ) => boolean | Promise<boolean>;
}
```

## 附属结构

- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- （无匹配记录）

<!-- AUTO:END -->

<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

> 主文件中未提取到 Props interface（可能为复合导出或定义在 types.ts），请人工查看源码。

## 相关类型

```ts
export interface Action {
  /** 选项名称 */
  name: string;
  /** 选项文字颜色 */
  color?: string;
  /** 是否为加载状态 */
  loading?: boolean;
  /** 是否为禁用状态 */
  disabled?: boolean;
  /** 其他自定义属性 */
  [key: string]: unknown;
}

export type ActionSheetAction = 'item' | 'cancel';

export interface XlbActionSheetOptions {
  /** 面板选项列表，支持字符串数组或 Action 对象数组 */
  actions: (string | Action)[];
  /** 顶部标题 */
  title?: ReactNode;
  /** 取消按钮文字 */
  cancelText?: string;
  /** 取消按钮文字样式 */
  cancelTextStyle?: StyleProp<TextStyle>;
  /** 选项上方的描述信息 */
  description?: ReactNode;
  /** 描述信息样式 */
  descriptionStyle?: StyleProp<TextStyle>;
  /** 是否显示圆角 */
  round?: boolean;
  /** 关闭前的回调函数，返回 false 可阻止关闭，支持返回 Promise */
  beforeClose?: (
    action: ActionSheetAction,
    item?: Action,
    index?: number,
  ) => boolean | Promise<boolean>;
}
```

## 附属结构

- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- （无匹配记录）

<!-- AUTO:END -->

<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

> 主文件中未提取到 Props interface（可能为复合导出或定义在 types.ts），请人工查看源码。

## 相关类型

```ts
export interface Action {
  /** 选项名称 */
  name: string;
  /** 选项文字颜色 */
  color?: string;
  /** 是否为加载状态 */
  loading?: boolean;
  /** 是否为禁用状态 */
  disabled?: boolean;
  /** 其他自定义属性 */
  [key: string]: unknown;
}

export type ActionSheetAction = 'item' | 'cancel';

export interface XlbActionSheetOptions {
  /** 面板选项列表，支持字符串数组或 Action 对象数组 */
  actions: (string | Action)[];
  /** 顶部标题 */
  title?: ReactNode;
  /** 取消按钮文字 */
  cancelText?: string;
  /** 取消按钮文字样式 */
  cancelTextStyle?: StyleProp<TextStyle>;
  /** 选项上方的描述信息 */
  description?: ReactNode;
  /** 描述信息样式 */
  descriptionStyle?: StyleProp<TextStyle>;
  /** 是否显示圆角 */
  round?: boolean;
  /** 关闭前的回调函数，返回 false 可阻止关闭，支持返回 Promise */
  beforeClose?: (
    action: ActionSheetAction,
    item?: Action,
    index?: number,
  ) => boolean | Promise<boolean>;
}
```

## 附属结构

- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- （无匹配记录）

<!-- AUTO:END -->

<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

> 主文件中未提取到 Props interface（可能为复合导出或定义在 types.ts），请人工查看源码。

## 相关类型

```ts
export interface Action {
  /** 选项名称 */
  name: string;
  /** 选项文字颜色 */
  color?: string;
  /** 是否为加载状态 */
  loading?: boolean;
  /** 是否为禁用状态 */
  disabled?: boolean;
  /** 其他自定义属性 */
  [key: string]: unknown;
}

export type ActionSheetAction = 'item' | 'cancel';

export interface XlbActionSheetOptions {
  /** 面板选项列表，支持字符串数组或 Action 对象数组 */
  actions: (string | Action)[];
  /** 顶部标题 */
  title?: ReactNode;
  /** 取消按钮文字 */
  cancelText?: string;
  /** 取消按钮文字样式 */
  cancelTextStyle?: StyleProp<TextStyle>;
  /** 选项上方的描述信息 */
  description?: ReactNode;
  /** 描述信息样式 */
  descriptionStyle?: StyleProp<TextStyle>;
  /** 是否显示圆角 */
  round?: boolean;
  /** 关闭前的回调函数，返回 false 可阻止关闭，支持返回 Promise */
  beforeClose?: (
    action: ActionSheetAction,
    item?: Action,
    index?: number,
  ) => boolean | Promise<boolean>;
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
