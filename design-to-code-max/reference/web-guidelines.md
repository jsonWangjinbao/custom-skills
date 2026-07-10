# Web React 样式生成规范

> 本规范用于 Web/H5 项目的代码生成。颜色/间距/圆角/字号/阴影同样优先走项目主题 token，禁止硬编码 hex 和 magic number。

## 样式方案

- **优先使用 CSS Module**：`Component.module.css`
- **备选**：内联 style 对象（仅当样式值需要动态计算时）
- 无论哪种方案，颜色/间距/圆角/字号都必须使用项目 token 变量，禁止写死 hex / px

## Flexbox

- Web 默认 `flex-direction: row`，HTML 中未显式声明的元素不需要额外写
- `flex: none` → `flex: '0 0 auto'`
- 其余 flex 属性保持 HTML 原值

## box-shadow

- 直接使用 CSS `box-shadow`，但颜色应使用项目 token 变量（如 `var(--xlb-shadow-color)` 或语义化变量）
- 若项目提供 shadow token，优先使用 shadow token

## 图片引用

- `import logo from './asset/logo.svg'`（Vite 支持 SVG 作为 URL）
- `import { ReactComponent as Logo } from './asset/logo.svg'`（CRA 支持 SVG 作为组件）
- SVG 小图标也可内联为 React 组件
- 优先使用项目统一图标组件（如 XlbIcon），不要复制粘贴 SVG

## gap

- 现代浏览器全部原生支持，直接使用

## 字体

- `font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
- 始终加系统字体 fallback

## 单位

- 保持 HTML 中的 px 值不变
- 设计稿宽度 375px → 页面容器 `width: 375px`（不做 viewport 缩放，保持设计稿原始尺寸）
- 优先使用 CSS 变量/token，避免手写固定 px

## 属性名

- CSS Module 中：CSS 原生写法（`border-radius`，`font-size`）
- JSX style 对象中：camelCase（`borderRadius`，`fontSize`）
- **规则：** 使用 CSS Module，避免 JSX 内联 style

## 组件映射

| HTML 元素 | Web React 元素 |
|-----------|---------------|
| `<div>` | `<div>` |
| `<span>` | `<span>` |
| `<p>` | `<p>` |
| `<img>` | `<img src={...} />` |

## 主题 token（Web）

Web 项目颜色优先使用项目 CSS 变量或主题 token：

```css
/* CSS Module */
.button {
  background-color: var(--xlb-color-primary-brand);
  color: var(--xlb-color-background-frame);
  border-radius: var(--xlb-border-radius-4);
  padding: var(--xlb-space-12);
}
```

若项目未提供 CSS 变量，则参考 `references/token-map.json` 中的 theme key，在代码中使用对应的 theme 对象。

## 禁止行为

- ❌ 写死 `#1A6AFF`、`#fff`、`rgba(...)` 等 hex 色值
- ❌ 写死 `padding: 12px`、`border-radius: 8px`、`font-size: 14px` 等 magic number
- ❌ 用 emoji 或文字符号代替图标
