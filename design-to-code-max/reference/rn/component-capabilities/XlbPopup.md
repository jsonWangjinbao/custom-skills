# XlbPopup

> 数据源：`@xlb/components-react-native@1.0.0-beta.217` · `src/components/XlbPopup/index.tsx`
> 由 scripts/dtc-rn-component-cards.mjs 于 2026-08-06 生成；<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

> ⚠️ 本接口继承 `Omit<PopupProps, 'visible'>`，下表仅为本组件**扩展**的 Props；其余 Props 见继承来源的定义（本文件或外部依赖）。

| Prop | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `visible` | boolean | **是** | `false` | 是否显示弹窗（受控） |
| `horizontal` | boolean | 否 | `false` | 是否横屏模式（右侧弹出，宽度50%） |
| `position` | 'top' \| 'bottom' \| 'left' \| 'right' | 否 | `'bottom'` | 弹窗位置 |
| `round` | boolean | 否 | `true` | 是否显示圆角, 横屏模式下无效 |
| `closeOnPressOverlay` | boolean | 否 | `true` | 点击遮罩层关闭弹窗 |
| `children` | ReactNode | 否 | — | 弹窗内容 |
| `onClose` | () => void | 否 | — | 关闭弹窗回调 |
| `onPressOverlay` | () => void | 否 | — | 点击遮罩层回调 |
| `style` | StyleProp<ViewStyle> | 否 | — | 自定义弹窗样式 |
| `duration` | number | 否 | — | 动画时长（毫秒） |
| `overlay` | boolean | 否 | `true` | 是否显示遮罩层 |
| `overlayBackgroundColor` | string | 否 | — | 自定义遮罩层颜色 |
| `safeAreaInsetBottom` | boolean | 否 | `true` | 是否开启底部安全区适配 |
| `safeAreaInsetTop` | boolean | 否 | `false` | 是否开启顶部安全区适配 |
| `lazyRender` | boolean | 否 | `true` | 是否在显示弹层时才渲染节点 |
| `destroyOnClosed` | boolean | 否 | `false` | 关闭时销毁 Popup |
| `height` | '50%' \| '80%' \| '100%' \| number \| string | 否 | `'80%'` | 弹窗高度 - '50%': 屏幕高度的50% - '80%': 屏幕高度的80%（默认） - '100%': 屏幕高度的100% - number: 自定义高度（像素值） |

## 相关类型

```ts
export type XlbPopupHeaderProps = PickComponentProps<typeof PopupHeader>;

export type XlbPopupPageProps = PickComponentProps<typeof XlbPopupPage>;

export type XlbPopupKeyboardShimProps = PickComponentProps<
  typeof PopupKeyboardShim
>;
```

## 附属结构

- `components/`：header
- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- （无匹配记录）

<!-- AUTO:END -->

<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

> ⚠️ 本接口继承 `Omit<PopupProps, 'visible'>`（外部依赖），下表仅为本组件**扩展**的 Props；基础 Props（如表单三件套 form/initialValues/onFinish）见继承来源。

| Prop | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `visible` | boolean | **是** | `false` | 是否显示弹窗（受控） |
| `horizontal` | boolean | 否 | `false` | 是否横屏模式（右侧弹出，宽度50%） |
| `position` | 'top' \| 'bottom' \| 'left' \| 'right' | 否 | `'bottom'` | 弹窗位置 |
| `round` | boolean | 否 | `true` | 是否显示圆角, 横屏模式下无效 |
| `closeOnPressOverlay` | boolean | 否 | `true` | 点击遮罩层关闭弹窗 |
| `children` | ReactNode | 否 | — | 弹窗内容 |
| `onClose` | () => void | 否 | — | 关闭弹窗回调 |
| `onPressOverlay` | () => void | 否 | — | 点击遮罩层回调 |
| `style` | StyleProp<ViewStyle> | 否 | — | 自定义弹窗样式 |
| `duration` | number | 否 | — | 动画时长（毫秒） |
| `overlay` | boolean | 否 | `true` | 是否显示遮罩层 |
| `overlayBackgroundColor` | string | 否 | — | 自定义遮罩层颜色 |
| `safeAreaInsetBottom` | boolean | 否 | `true` | 是否开启底部安全区适配 |
| `safeAreaInsetTop` | boolean | 否 | `false` | 是否开启顶部安全区适配 |
| `lazyRender` | boolean | 否 | `true` | 是否在显示弹层时才渲染节点 |
| `destroyOnClosed` | boolean | 否 | `false` | 关闭时销毁 Popup |
| `height` | '50%' \| '80%' \| '100%' \| number \| string | 否 | `'80%'` | 弹窗高度 - '50%': 屏幕高度的50% - '80%': 屏幕高度的80%（默认） - '100%': 屏幕高度的100% - number: 自定义高度（像素值） |

## 相关类型

```ts
export type XlbPopupHeaderProps = PickComponentProps<typeof PopupHeader>;

export type XlbPopupPageProps = PickComponentProps<typeof XlbPopupPage>;

export type XlbPopupKeyboardShimProps = PickComponentProps<
  typeof PopupKeyboardShim
>;
```

## 附属结构

- `components/`：header
- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- （无匹配记录）

<!-- AUTO:END -->

<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

> ⚠️ 本接口继承 `Omit<PopupProps, 'visible'>`（外部依赖），下表仅为本组件**扩展**的 Props；基础 Props（如表单三件套 form/initialValues/onFinish）见继承来源。

| Prop | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `visible` | boolean | **是** | `false` | 是否显示弹窗（受控） |
| `horizontal` | boolean | 否 | `false` | 是否横屏模式（右侧弹出，宽度50%） |
| `position` | 'top' \| 'bottom' \| 'left' \| 'right' | 否 | `'bottom'` | 弹窗位置 |
| `round` | boolean | 否 | `true` | 是否显示圆角, 横屏模式下无效 |
| `closeOnPressOverlay` | boolean | 否 | `true` | 点击遮罩层关闭弹窗 |
| `children` | ReactNode | 否 | — | 弹窗内容 |
| `onClose` | () => void | 否 | — | 关闭弹窗回调 |
| `onPressOverlay` | () => void | 否 | — | 点击遮罩层回调 |
| `style` | StyleProp<ViewStyle> | 否 | — | 自定义弹窗样式 |
| `duration` | number | 否 | — | 动画时长（毫秒） |
| `overlay` | boolean | 否 | `true` | 是否显示遮罩层 |
| `overlayBackgroundColor` | string | 否 | — | 自定义遮罩层颜色 |
| `safeAreaInsetBottom` | boolean | 否 | `true` | 是否开启底部安全区适配 |
| `safeAreaInsetTop` | boolean | 否 | `false` | 是否开启顶部安全区适配 |
| `lazyRender` | boolean | 否 | `true` | 是否在显示弹层时才渲染节点 |
| `destroyOnClosed` | boolean | 否 | `false` | 关闭时销毁 Popup |
| `height` | '50%' \| '80%' \| '100%' \| number \| string | 否 | `'80%'` | 弹窗高度 - '50%': 屏幕高度的50% - '80%': 屏幕高度的80%（默认） - '100%': 屏幕高度的100% - number: 自定义高度（像素值） |

## 相关类型

```ts
export type XlbPopupHeaderProps = PickComponentProps<typeof PopupHeader>;

export type XlbPopupPageProps = PickComponentProps<typeof XlbPopupPage>;

export type XlbPopupKeyboardShimProps = PickComponentProps<
  typeof PopupKeyboardShim
>;
```

## 附属结构

- `components/`：header
- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- （无匹配记录）

<!-- AUTO:END -->

<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

> ⚠️ 本接口继承 `Omit<PopupProps, 'visible'>`（外部依赖），下表仅为本组件**扩展**的 Props；基础 Props（如表单三件套 form/initialValues/onFinish）见继承来源。

| Prop | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `visible` | boolean | **是** | `false` | 是否显示弹窗（受控） |
| `horizontal` | boolean | 否 | `false` | 是否横屏模式（右侧弹出，宽度50%） |
| `position` | 'top' \| 'bottom' \| 'left' \| 'right' | 否 | `'bottom'` | 弹窗位置 |
| `round` | boolean | 否 | `true` | 是否显示圆角, 横屏模式下无效 |
| `closeOnPressOverlay` | boolean | 否 | `true` | 点击遮罩层关闭弹窗 |
| `children` | ReactNode | 否 | — | 弹窗内容 |
| `onClose` | () => void | 否 | — | 关闭弹窗回调 |
| `onPressOverlay` | () => void | 否 | — | 点击遮罩层回调 |
| `style` | StyleProp<ViewStyle> | 否 | — | 自定义弹窗样式 |
| `duration` | number | 否 | — | 动画时长（毫秒） |
| `overlay` | boolean | 否 | `true` | 是否显示遮罩层 |
| `overlayBackgroundColor` | string | 否 | — | 自定义遮罩层颜色 |
| `safeAreaInsetBottom` | boolean | 否 | `true` | 是否开启底部安全区适配 |
| `safeAreaInsetTop` | boolean | 否 | `false` | 是否开启顶部安全区适配 |
| `lazyRender` | boolean | 否 | `true` | 是否在显示弹层时才渲染节点 |
| `destroyOnClosed` | boolean | 否 | `false` | 关闭时销毁 Popup |
| `height` | '50%' \| '80%' \| '100%' \| number \| string | 否 | `'80%'` | 弹窗高度 - '50%': 屏幕高度的50% - '80%': 屏幕高度的80%（默认） - '100%': 屏幕高度的100% - number: 自定义高度（像素值） |

## 相关类型

```ts
export type XlbPopupHeaderProps = PickComponentProps<typeof PopupHeader>;

export type XlbPopupPageProps = PickComponentProps<typeof XlbPopupPage>;

export type XlbPopupKeyboardShimProps = PickComponentProps<
  typeof PopupKeyboardShim
>;
```

## 附属结构

- `components/`：header
- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- （无匹配记录）

<!-- AUTO:END -->

<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

| Prop | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `visible` | boolean | **是** | `false` | 是否显示弹窗（受控） |
| `horizontal` | boolean | 否 | `false` | 是否横屏模式（右侧弹出，宽度50%） |
| `position` | 'top' \| 'bottom' \| 'left' \| 'right' | 否 | `'bottom'` | 弹窗位置 |
| `round` | boolean | 否 | `true` | 是否显示圆角, 横屏模式下无效 |
| `closeOnPressOverlay` | boolean | 否 | `true` | 点击遮罩层关闭弹窗 |
| `children` | ReactNode | 否 | — | 弹窗内容 |
| `onClose` | () => void | 否 | — | 关闭弹窗回调 |
| `onPressOverlay` | () => void | 否 | — | 点击遮罩层回调 |
| `style` | StyleProp<ViewStyle> | 否 | — | 自定义弹窗样式 |
| `duration` | number | 否 | — | 动画时长（毫秒） |
| `overlay` | boolean | 否 | `true` | 是否显示遮罩层 |
| `overlayBackgroundColor` | string | 否 | — | 自定义遮罩层颜色 |
| `safeAreaInsetBottom` | boolean | 否 | `true` | 是否开启底部安全区适配 |
| `safeAreaInsetTop` | boolean | 否 | `false` | 是否开启顶部安全区适配 |
| `lazyRender` | boolean | 否 | `true` | 是否在显示弹层时才渲染节点 |
| `destroyOnClosed` | boolean | 否 | `false` | 关闭时销毁 Popup |
| `height` | '50%' \| '80%' \| '100%' \| number \| string | 否 | `'80%'` | 弹窗高度 - '50%': 屏幕高度的50% - '80%': 屏幕高度的80%（默认） - '100%': 屏幕高度的100% - number: 自定义高度（像素值） |

## 相关类型

```ts
export type XlbPopupHeaderProps = PickComponentProps<typeof PopupHeader>;

export type XlbPopupPageProps = PickComponentProps<typeof XlbPopupPage>;

export type XlbPopupKeyboardShimProps = PickComponentProps<
  typeof PopupKeyboardShim
>;
```

## 附属结构

- `components/`：header
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
