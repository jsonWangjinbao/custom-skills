# XlbIcon

> 数据源：`@xlb/components-react-native@1.0.0-beta.217` · `src/components/XlbIcon/index.tsx`
> 由 scripts/dtc-rn-component-cards.mjs 于 2026-08-06 生成；<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

| Prop    | 类型   | 必填 | 默认值 | 说明     |
| ------- | ------ | ---- | ------ | -------- |
| `name`  | string | 否   | —      | 图标名称 |
| `color` | string | 否   | —      | 图标颜色 |
| `size`  | number | 否   | —      | 图标大小 |

## 附属结构

- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- [datepicker-onchange-conflict](../gotchas/component-library/datepicker-onchange-conflict.md)
- [icon-name-mismatch](../gotchas/component-library/icon-name-mismatch.md)
- [icon-overlay-pattern](../gotchas/component-library/icon-overlay-pattern.md)
- [force-full-element-mapping](../gotchas/html-parsing/force-full-element-mapping.md)

<!-- AUTO:END -->

<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

| Prop    | 类型   | 必填 | 默认值 | 说明     |
| ------- | ------ | ---- | ------ | -------- |
| `name`  | string | 否   | —      | 图标名称 |
| `color` | string | 否   | —      | 图标颜色 |
| `size`  | number | 否   | —      | 图标大小 |

## 附属结构

- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- [datepicker-onchange-conflict](../gotchas/component-library/datepicker-onchange-conflict.md)
- [icon-name-mismatch](../gotchas/component-library/icon-name-mismatch.md)
- [icon-overlay-pattern](../gotchas/component-library/icon-overlay-pattern.md)
- [force-full-element-mapping](../gotchas/html-parsing/force-full-element-mapping.md)

<!-- AUTO:END -->

<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

| Prop    | 类型   | 必填 | 默认值 | 说明     |
| ------- | ------ | ---- | ------ | -------- |
| `name`  | string | 否   | —      | 图标名称 |
| `color` | string | 否   | —      | 图标颜色 |
| `size`  | number | 否   | —      | 图标大小 |

## 附属结构

- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- [datepicker-onchange-conflict](../gotchas/component-library/datepicker-onchange-conflict.md)
- [icon-name-mismatch](../gotchas/component-library/icon-name-mismatch.md)
- [icon-overlay-pattern](../gotchas/component-library/icon-overlay-pattern.md)
- [force-full-element-mapping](../gotchas/component-library/force-full-element-mapping.md)

<!-- AUTO:END -->

<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

| Prop    | 类型   | 必填 | 默认值 | 说明     |
| ------- | ------ | ---- | ------ | -------- |
| `name`  | string | 否   | —      | 图标名称 |
| `color` | string | 否   | —      | 图标颜色 |
| `size`  | number | 否   | —      | 图标大小 |

## 附属结构

- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- [datepicker-onchange-conflict](../gotchas/component-library/datepicker-onchange-conflict.md)
- [icon-name-mismatch](../gotchas/component-library/icon-name-mismatch.md)
- [icon-overlay-pattern](../gotchas/component-library/icon-overlay-pattern.md)
- [force-full-element-mapping](../gotchas/component-library/force-full-element-mapping.md)

<!-- AUTO:END -->

<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

| Prop    | 类型   | 必填 | 默认值 | 说明     |
| ------- | ------ | ---- | ------ | -------- |
| `name`  | string | 否   | —      | 图标名称 |
| `color` | string | 否   | —      | 图标颜色 |
| `size`  | number | 否   | —      | 图标大小 |

## 附属结构

- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- [datepicker-onchange-conflict](../gotchas/component-library/datepicker-onchange-conflict.md)
- [form-item-render-prop-unreliable](../gotchas/component-library/form-item-render-prop-unreliable.md)
- [icon-name-mismatch](../gotchas/component-library/icon-name-mismatch.md)
- [icon-overlay-pattern](../gotchas/component-library/icon-overlay-pattern.md)
- [force-full-element-mapping](../gotchas/component-library/force-full-element-mapping.md)

<!-- AUTO:END -->

<!-- MANUAL:BEGIN -->

## 能力边界（人工维护）

- **项目图标统一使用 `@xlb/icon-rn` 的 `XlbIcon`**（与本组件同名不同包）：name 必须是 `iconfontGlyphMap` 的 key（`Search` / `Close` / `a-OutlineRight` 等），**禁止 `icon_` 前缀写法**——写错不报错、渲染为 null（见 icon-name-mismatch）
- 图标映射查 `reference/rn/icon-map.md`；查不到用语义最近 key 降级并在代码注释说明；禁止编造 name、禁止 emoji/文字符号替代
- **禁止直接 require SVG 文件当图标**；真实照片/插画才用 Image/XlbImage

## 易混淆对比（人工维护）

- **vs 真实图片（Image/XlbImage）**：矢量小图标用 @xlb/icon-rn；照片、插画、装饰性 PNG 用 Image/XlbImage + require
- **vs 内联 SVG / 字体图标**：设计稿 HTML 里的 `<img src=".svg">`、`<i class="icon-*">` 一律映射为 @xlb/icon-rn 图标，不直接搬运

## 场景绑定（人工维护）

- 设计稿中所有矢量图标（箭头、关闭、搜索、状态图标等）→ @xlb/icon-rn `XlbIcon`，size 用 `SPACE.*`、color 用 theme key
