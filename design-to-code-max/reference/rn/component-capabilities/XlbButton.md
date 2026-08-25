# XlbButton

> 数据源：`@xlb/components-react-native@1.0.0-beta.217` · `src/components/XlbButton/index.tsx`
> 由 scripts/dtc-rn-component-cards.mjs 于 2026-08-06 生成；<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

| Prop | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `text` | string | 否 | — | 按钮文案（优先级高于 children） |
| `textStyle` | StyleProp<TextStyle> | 否 | — | 文字自定义样式 |
| `size` | ButtonSize | 否 | `'middle'` | 大小 |
| `type` | ButtonType | 否 | `'fill'` | 类型 |
| `disabled` | boolean | 否 | `false` | 是否禁用按钮 |
| `loading` | boolean | 否 | `false` | 是否显示为加载状态 |
| `loadingText` | string | 否 | — | 加载状态提示文字 |
| `loadingPosition` | 'left' \| 'right' | 否 | `'left'` | 加载状态图标位置 |
| `loadingIcon` | React.ReactNode | 否 | — | 自定义加载状态图标 |
| `square` | boolean | 否 | `false` | 是否为方形按钮（直角） |
| `round` | boolean | 否 | `false` | 是否为圆形按钮 |
| `renderLeftIcon` | (color: ColorValue, size: number) => React.ReactElement | 否 | — | 渲染左侧图标 |
| `renderRightIcon` | (color: ColorValue, size: number) => React.ReactElement | 否 | — | 渲染右侧图标 |
| `color` | ButtonColor | 否 | `'primary'` | 按钮颜色 |
| `textColor` | ColorValue | 否 | — | 按钮文案颜色（覆盖默认颜色） |
| `hairline` | boolean | 否 | `false` | 细边框（仅 outline 类型有效） |
| `onPressDebounceWait` | number | 否 | `0` | 点击事件防抖等待时间（毫秒），0 表示不防抖 |
| `onPress` | () => void | 否 | — | 点击事件 |
| `onLongPress` | () => void | 否 | — | 长按事件 |
| `children` | React.ReactNode | 否 | — | 按钮内容（优先级低于 text） |
| `fontFamily` | string | 否 | — | 自定义字体 |
| `style` | StyleProp<ViewStyle> | 否 | — | 自定义样式 |
| `block` | boolean | 否 | `false` | 是否块级按钮（宽度100%） |
| `pointerEvents` | 'auto' \| 'none' \| 'box-none' \| 'box-only' | 否 | `'auto'` | 事件穿透控制 - 'auto': 默认行为，响应触摸事件 - 'none': 不响应触摸事件，事件会穿透到下层组件 - 'box-none': 自身不响应触摸事件，但子组件可以响应 - 'box-only': 只有自身响应触摸事件，子组件不响应 |
| `bold` | boolean | 否 | `false` | 是否加粗, 透传给XlbText组件, android:700 ios: 500 |

## 附属结构

- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- [component-library-style-override](../gotchas/rn-quirks/component-library-style-override.md)

<!-- AUTO:END -->

<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

| Prop | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `text` | string | 否 | — | 按钮文案（优先级高于 children） |
| `textStyle` | StyleProp<TextStyle> | 否 | — | 文字自定义样式 |
| `size` | ButtonSize | 否 | `'middle'` | 大小 |
| `type` | ButtonType | 否 | `'fill'` | 类型 |
| `disabled` | boolean | 否 | `false` | 是否禁用按钮 |
| `loading` | boolean | 否 | `false` | 是否显示为加载状态 |
| `loadingText` | string | 否 | — | 加载状态提示文字 |
| `loadingPosition` | 'left' \| 'right' | 否 | `'left'` | 加载状态图标位置 |
| `loadingIcon` | React.ReactNode | 否 | — | 自定义加载状态图标 |
| `square` | boolean | 否 | `false` | 是否为方形按钮（直角） |
| `round` | boolean | 否 | `false` | 是否为圆形按钮 |
| `renderLeftIcon` | (color: ColorValue, size: number) => React.ReactElement | 否 | — | 渲染左侧图标 |
| `renderRightIcon` | (color: ColorValue, size: number) => React.ReactElement | 否 | — | 渲染右侧图标 |
| `color` | ButtonColor | 否 | `'primary'` | 按钮颜色 |
| `textColor` | ColorValue | 否 | — | 按钮文案颜色（覆盖默认颜色） |
| `hairline` | boolean | 否 | `false` | 细边框（仅 outline 类型有效） |
| `onPressDebounceWait` | number | 否 | `0` | 点击事件防抖等待时间（毫秒），0 表示不防抖 |
| `onPress` | () => void | 否 | — | 点击事件 |
| `onLongPress` | () => void | 否 | — | 长按事件 |
| `children` | React.ReactNode | 否 | — | 按钮内容（优先级低于 text） |
| `fontFamily` | string | 否 | — | 自定义字体 |
| `style` | StyleProp<ViewStyle> | 否 | — | 自定义样式 |
| `block` | boolean | 否 | `false` | 是否块级按钮（宽度100%） |
| `pointerEvents` | 'auto' \| 'none' \| 'box-none' \| 'box-only' | 否 | `'auto'` | 事件穿透控制 - 'auto': 默认行为，响应触摸事件 - 'none': 不响应触摸事件，事件会穿透到下层组件 - 'box-none': 自身不响应触摸事件，但子组件可以响应 - 'box-only': 只有自身响应触摸事件，子组件不响应 |
| `bold` | boolean | 否 | `false` | 是否加粗, 透传给XlbText组件, android:700 ios: 500 |

## 附属结构

- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- [component-library-style-override](../gotchas/rn-quirks/component-library-style-override.md)

<!-- AUTO:END -->

<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

| Prop | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `text` | string | 否 | — | 按钮文案（优先级高于 children） |
| `textStyle` | StyleProp<TextStyle> | 否 | — | 文字自定义样式 |
| `size` | ButtonSize | 否 | `'middle'` | 大小 |
| `type` | ButtonType | 否 | `'fill'` | 类型 |
| `disabled` | boolean | 否 | `false` | 是否禁用按钮 |
| `loading` | boolean | 否 | `false` | 是否显示为加载状态 |
| `loadingText` | string | 否 | — | 加载状态提示文字 |
| `loadingPosition` | 'left' \| 'right' | 否 | `'left'` | 加载状态图标位置 |
| `loadingIcon` | React.ReactNode | 否 | — | 自定义加载状态图标 |
| `square` | boolean | 否 | `false` | 是否为方形按钮（直角） |
| `round` | boolean | 否 | `false` | 是否为圆形按钮 |
| `renderLeftIcon` | (color: ColorValue, size: number) => React.ReactElement | 否 | — | 渲染左侧图标 |
| `renderRightIcon` | (color: ColorValue, size: number) => React.ReactElement | 否 | — | 渲染右侧图标 |
| `color` | ButtonColor | 否 | `'primary'` | 按钮颜色 |
| `textColor` | ColorValue | 否 | — | 按钮文案颜色（覆盖默认颜色） |
| `hairline` | boolean | 否 | `false` | 细边框（仅 outline 类型有效） |
| `onPressDebounceWait` | number | 否 | `0` | 点击事件防抖等待时间（毫秒），0 表示不防抖 |
| `onPress` | () => void | 否 | — | 点击事件 |
| `onLongPress` | () => void | 否 | — | 长按事件 |
| `children` | React.ReactNode | 否 | — | 按钮内容（优先级低于 text） |
| `fontFamily` | string | 否 | — | 自定义字体 |
| `style` | StyleProp<ViewStyle> | 否 | — | 自定义样式 |
| `block` | boolean | 否 | `false` | 是否块级按钮（宽度100%） |
| `pointerEvents` | 'auto' \| 'none' \| 'box-none' \| 'box-only' | 否 | `'auto'` | 事件穿透控制 - 'auto': 默认行为，响应触摸事件 - 'none': 不响应触摸事件，事件会穿透到下层组件 - 'box-none': 自身不响应触摸事件，但子组件可以响应 - 'box-only': 只有自身响应触摸事件，子组件不响应 |
| `bold` | boolean | 否 | `false` | 是否加粗, 透传给XlbText组件, android:700 ios: 500 |

## 附属结构

- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- [component-library-style-override](../gotchas/component-library/component-library-style-override.md)

<!-- AUTO:END -->

<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

| Prop | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `text` | string | 否 | — | 按钮文案（优先级高于 children） |
| `textStyle` | StyleProp<TextStyle> | 否 | — | 文字自定义样式 |
| `size` | ButtonSize | 否 | `'middle'` | 大小 |
| `type` | ButtonType | 否 | `'fill'` | 类型 |
| `disabled` | boolean | 否 | `false` | 是否禁用按钮 |
| `loading` | boolean | 否 | `false` | 是否显示为加载状态 |
| `loadingText` | string | 否 | — | 加载状态提示文字 |
| `loadingPosition` | 'left' \| 'right' | 否 | `'left'` | 加载状态图标位置 |
| `loadingIcon` | React.ReactNode | 否 | — | 自定义加载状态图标 |
| `square` | boolean | 否 | `false` | 是否为方形按钮（直角） |
| `round` | boolean | 否 | `false` | 是否为圆形按钮 |
| `renderLeftIcon` | (color: ColorValue, size: number) => React.ReactElement | 否 | — | 渲染左侧图标 |
| `renderRightIcon` | (color: ColorValue, size: number) => React.ReactElement | 否 | — | 渲染右侧图标 |
| `color` | ButtonColor | 否 | `'primary'` | 按钮颜色 |
| `textColor` | ColorValue | 否 | — | 按钮文案颜色（覆盖默认颜色） |
| `hairline` | boolean | 否 | `false` | 细边框（仅 outline 类型有效） |
| `onPressDebounceWait` | number | 否 | `0` | 点击事件防抖等待时间（毫秒），0 表示不防抖 |
| `onPress` | () => void | 否 | — | 点击事件 |
| `onLongPress` | () => void | 否 | — | 长按事件 |
| `children` | React.ReactNode | 否 | — | 按钮内容（优先级低于 text） |
| `fontFamily` | string | 否 | — | 自定义字体 |
| `style` | StyleProp<ViewStyle> | 否 | — | 自定义样式 |
| `block` | boolean | 否 | `false` | 是否块级按钮（宽度100%） |
| `pointerEvents` | 'auto' \| 'none' \| 'box-none' \| 'box-only' | 否 | `'auto'` | 事件穿透控制 - 'auto': 默认行为，响应触摸事件 - 'none': 不响应触摸事件，事件会穿透到下层组件 - 'box-none': 自身不响应触摸事件，但子组件可以响应 - 'box-only': 只有自身响应触摸事件，子组件不响应 |
| `bold` | boolean | 否 | `false` | 是否加粗, 透传给XlbText组件, android:700 ios: 500 |

## 附属结构

- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- [component-library-style-override](../gotchas/component-library/component-library-style-override.md)

<!-- AUTO:END -->

<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

| Prop | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `text` | string | 否 | — | 按钮文案（优先级高于 children） |
| `textStyle` | StyleProp<TextStyle> | 否 | — | 文字自定义样式 |
| `size` | ButtonSize | 否 | `'middle'` | 大小 |
| `type` | ButtonType | 否 | `'fill'` | 类型 |
| `disabled` | boolean | 否 | `false` | 是否禁用按钮 |
| `loading` | boolean | 否 | `false` | 是否显示为加载状态 |
| `loadingText` | string | 否 | — | 加载状态提示文字 |
| `loadingPosition` | 'left' \| 'right' | 否 | `'left'` | 加载状态图标位置 |
| `loadingIcon` | React.ReactNode | 否 | — | 自定义加载状态图标 |
| `square` | boolean | 否 | `false` | 是否为方形按钮（直角） |
| `round` | boolean | 否 | `false` | 是否为圆形按钮 |
| `renderLeftIcon` | (color: ColorValue, size: number) => React.ReactElement | 否 | — | 渲染左侧图标 |
| `renderRightIcon` | (color: ColorValue, size: number) => React.ReactElement | 否 | — | 渲染右侧图标 |
| `color` | ButtonColor | 否 | `'primary'` | 按钮颜色 |
| `textColor` | ColorValue | 否 | — | 按钮文案颜色（覆盖默认颜色） |
| `hairline` | boolean | 否 | `false` | 细边框（仅 outline 类型有效） |
| `onPressDebounceWait` | number | 否 | `0` | 点击事件防抖等待时间（毫秒），0 表示不防抖 |
| `onPress` | () => void | 否 | — | 点击事件 |
| `onLongPress` | () => void | 否 | — | 长按事件 |
| `children` | React.ReactNode | 否 | — | 按钮内容（优先级低于 text） |
| `fontFamily` | string | 否 | — | 自定义字体 |
| `style` | StyleProp<ViewStyle> | 否 | — | 自定义样式 |
| `block` | boolean | 否 | `false` | 是否块级按钮（宽度100%） |
| `pointerEvents` | 'auto' \| 'none' \| 'box-none' \| 'box-only' | 否 | `'auto'` | 事件穿透控制 - 'auto': 默认行为，响应触摸事件 - 'none': 不响应触摸事件，事件会穿透到下层组件 - 'box-none': 自身不响应触摸事件，但子组件可以响应 - 'box-only': 只有自身响应触摸事件，子组件不响应 |
| `bold` | boolean | 否 | `false` | 是否加粗, 透传给XlbText组件, android:700 ios: 500 |

## 附属结构

- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- [component-library-style-override](../gotchas/component-library/component-library-style-override.md)

<!-- AUTO:END -->

<!-- MANUAL:BEGIN -->

## 能力边界（人工维护）

> 该组件**不能**做什么、常见误用场景。（待补充）

## 易混淆对比（人工维护)

> 与最易误选的组件对比：看到什么特征用本组件，看到什么特征用对方。（待补充）

## 场景绑定（人工维护）

> 命中即直接选用本组件的设计稿特征，禁止自由发挥。（待补充）
