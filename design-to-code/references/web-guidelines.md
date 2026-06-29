# Web React 样式生成规范

## 样式方案

- **优先使用 CSS Module**：`Component.module.css`
- **备选**：内联 style 对象（仅当样式值需要动态计算时）

## Flexbox

- Web 默认 `flex-direction: row`，HTML 中未显式声明的元素不需要额外写
- `flex: none` → `flex: '0 0 auto'`
- 其余 flex 属性保持 HTML 原值

## box-shadow

- 直接使用 CSS `box-shadow`，保留 HTML 中的原始值，不做转换

## 图片引用

- `import logo from './asset/logo.svg'`（Vite 支持 SVG 作为 URL）
- `import { ReactComponent as Logo } from './asset/logo.svg'`（CRA 支持 SVG 作为组件）
- SVG 小图标也可内联为 React 组件

## gap

- 现代浏览器全部原生支持，直接使用

## 字体

- `font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
- 始终加系统字体 fallback

## 单位

- 保持 HTML 中的 px 值不变
- 设计稿宽度 375px → 页面容器 `width: 375px`（不做 viewport 缩放，保持设计稿原始尺寸）

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
