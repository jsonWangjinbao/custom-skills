# HTML 结构化解析引擎规则

> 本文件定义 audit 阶段对 HTML 设计稿进行结构化解析的规则。
> 输出到 `parsed-styles/*.json`，供三要素表填充和 build 阶段消费。
> 版本: 1.0

---

## 1. 解析流程总览

```
HTML 文件列表
  │
  ▼
Step 1: HTML 拆分
  │   按页面/组件的 DOM 边界或视觉块分割
  ▼
Step 2: 逐元素解析
  │   提取标签、类名、内联样式、文本、子元素
  ▼
Step 3: 三要素归类
  │   layout / typography / spacing & style
  ▼
Step 4: Token 映射
  │   查各平台 token 资源（RN: token-map.json / icon-map.md / xlb-style-system.md；H5/PC: 各自 guidelines 的变量映射）
  ▼
Step 5: 结构化输出
      写入 parsed-styles/【page-name】.json
```

---

## 2. HTML 拆分规则

### 2.1 页面边界

- **一个 HTML 文件 = 一个页面**，除非该文件包含多个独立的视觉块（如 tab 切换的不同面板）
- 多面板场景下，每个面板拆为独立条目，在 `elements` 数组中用不同的 `semanticType` 区分

### 2.2 组件级拆分

每个 HTML 文件拆分为若干组件级元素：

| 场景          | 拆分方式                                 | 示例                    |
| ------------- | ---------------------------------------- | ----------------------- |
| 单个页面      | 按顶级容器拆                             | `div.page` → 1 个 entry |
| 多步骤/多面板 | 按 `div.panel`、`div.step` 等拆分        | 3 个面板 → 3 个 entry   |
| 卡片式布局    | 每张卡片独立                             | 3 张信息卡 → 3 个 entry |
| 表单          | 整张表单 1 个 entry，子字段作为 children | 1 form → 1 entry        |

### 2.3 排除元素

以下元素不应出现在解析输出中：

- `<script>`、`<style>`、`<meta>`、`<link>`、`<head>` 标签
- 空元素（无内容、无样式、无子元素）
- 注释节点 `<!-- ... -->`
- `display:none` 或 `visibility:hidden` 的元素

---

## 3. 元素选择规则

### 3.1 必须解析的元素

| 标签                                    | 原因               | 优先级 |
| --------------------------------------- | ------------------ | ------ |
| `div`, `section`, `article`, `main`     | 布局容器           | 高     |
| `form`, `fieldset`                      | 表单容器           | 高     |
| `label`, `span`, `p`, `h1`~`h6`         | 文本/标签          | 高     |
| `input`, `select`, `textarea`, `button` | 表单控件           | 高     |
| `img`                                   | 图片               | 高     |
| `i`, `svg`, `span.icon-*`               | 图标               | 中     |
| `ul`, `ol`, `li`                        | 列表               | 中     |
| `table`, `tr`, `td`, `th`               | 表格               | 中     |
| `a`, `nav`, `header`, `footer`          | 导航/header/footer | 低     |

### 3.2 提取信息优先级

对每个元素，按以下优先级提取信息：

1. **内联样式**（style 属性）— 最精确，优先使用
2. **计算样式** — 从 class 定义推断（需读取 `<style>` 块或 CSS 文件中的对应规则）
3. **类名推断** — 从 class name 语义推断（如 `class="btn-primary"` → 按钮主样式）
4. **标签默认样式** — HTML 标签的浏览器默认样式（作为最后的 fallback）

### 3.3 元素合并规则

多个相邻的纯文本/内联元素（如 `<label>姓名</label><span>：</span>`）合并为一个字段标签元素，保留完整文本内容 `"姓名："`。

---

## 4. 三要素提取规则

每个元素提取三类属性。标记为「必填」的属性不能为空。

### 4.1 Layout 布局

| 属性             | 来源  | 必填 | 说明                                |
| ---------------- | ----- | ---- | ----------------------------------- |
| `display`        | style | 是   | 通常 `flex` 或 `block`              |
| `flexDirection`  | style | 否   | 默认 `row`                          |
| `height`         | style | 否   | 典型值 48px / 44px / auto           |
| `justifyContent` | style | 否   | flex-start / center / space-between |
| `alignItems`     | style | 否   | center / flex-start / stretch       |
| `padding`        | style | 否   | 四值或双值                          |
| `gap`            | style | 否   | flex 子元素间距                     |

### 4.2 Typography 字体

| 属性         | 来源  | 必填 | 说明                  |
| ------------ | ----- | ---- | --------------------- |
| `fontSize`   | style | 是   | px 值                 |
| `fontWeight` | style | 否   | 数值或名称            |
| `lineHeight` | style | 否   | px 值                 |
| `color`      | style | 是   | hex 值                |
| `textAlign`  | style | 否   | left / center / right |

### 4.3 Spacing & Style 间距与修饰

| 属性              | 来源  | 必填 | 说明             |
| ----------------- | ----- | ---- | ---------------- |
| `borderRadius`    | style | 否   | px 值            |
| `borderWidth`     | style | 否   | px 值            |
| `borderColor`     | style | 否   | hex 值           |
| `backgroundColor` | style | 否   | hex 值           |
| `margin`          | style | 否   | 四值或单值       |
| `marginBottom`    | style | 否   | 多用于表单项间距 |
| `boxShadow`       | style | 否   | 阴影定义         |

---

## 5. Token 映射规则

> **平台适配声明**：本节示例以 RN token 格式（`FONT.SIZE_*` / `SPACE.*` / `BORDER.*` / `theme['xxx']`）演示映射方法。各平台实际使用的 token 资源以各自 guidelines 为准：
>
> - **RN**：`reference/rn/token-map.json` + `reference/rn/icon-map.md` → `FONT.*` / `SPACE.*` / `BORDER.*` / `theme['xxx']`
> - **H5**：`reference/h5/h5-guidelines.md` 的变量映射 → `var(--xlb-*)` CSS 变量
> - **PC**：`reference/pc/pc-guidelines.md` → Less 变量 + px
>
> parsed-styles JSON 中的 `token` 字段按目标平台格式填写；映射方法论（精确匹配 → 最近值近似 → 无 token 标注）三平台通用。

### 5.1 映射优先级

```
精确匹配 > 最近值近似 > 标注无 token（记入 unmappedTokens）
```

1. **精确匹配**：值完全匹配 token
2. **最近值近似**：精确值不存在，找最近的 token 并标注偏差（如 14px → FONT.SIZE_16）
3. **无 token 映射**：标注原因和处理方案（如「FONT.SIZE_14 不存在」）

### 5.2 颜色映射

优先查 `reference/rn/token-map.json` 的 `colors` 字段，然后查 `themeObject` 字段（以下为 RN 示例）：

```text
#333333 → 查找 token-map.json → theme['color-text-body']
#1890ff → 查找 token-map.json → theme['color-primary']
```

**规则：**

- 小写 hex，压缩值展开（`#333` → `#333333`）
- 忽略 alpha 通道差异（`#333333` 和 `rgba(51,51,51,1)` 视为同一个颜色）
- 映射前做 value normalization

### 5.3 间距映射

查 `reference/rn/token-map.json` 的 `constants.SPACE` 字段（RN 示例）：

```text
4px  → SPACE.SPACE_1     (4px)
8px  → SPACE.SPACE_2     (8px)
12px → SPACE.SPACE_3     (12px)
16px → SPACE.SPACE_4     (16px)
20px → SPACE.SPACE_5     (20px)
24px → SPACE.SPACE_6     (24px)
32px → SPACE.SPACE_8     (32px)
48px → SPACE.SPACE_12    (48px)
```

**近似规则：** 如果找不到精确值，取最接近的小值。如 14px → 使用 SPACE.SPACE_3 (12px) 并用额外 margin/padding 调整。

### 5.4 圆角映射

查 `reference/rn/token-map.json` 的 `constants.BORDER` 字段（RN 示例）：

```text
2px → BORDER.RADIUS_2
4px → BORDER.RADIUS_4
6px → BORDER.RADIUS_6
8px → BORDER.RADIUS_8
```

### 5.5 字号映射

查 `reference/rn/token-map.json` 的 `constants.FONT` 字段（RN 示例）：

```text
12px → FONT.SIZE_12
14px → FONT.SIZE_14 (若不存在 → 标注无 token)
16px → FONT.SIZE_16
18px → FONT.SIZE_18
20px → FONT.SIZE_20
24px → FONT.SIZE_24
```

### 5.6 图标映射

查 `reference/rn/icon-map.md`（RN 示例）：

```text
HTML 中的 <i class="icon-camera"> → XlbIcon name="camera"
HTML 中的 <i class="icon-delete"> → XlbIcon name="delete"
```

**规则：**

- 从 HTML 元素的 class name 或 inline SVG 推断语义
- 对比 icon-map.md 的 `glyphMap` 查找对应 key
- 无法找到 → 标注「图标无映射：{{语义}} → 处理方案：{{降级 / SVG / 推动补充}}」

### 5.7 图片映射

```text
HTML <img src="./logo.png"> → Image source={require('./logo.png')}
```

**规则：**

- 保留相对路径，转换为 RN 兼容的 require 路径
- 图片路径如果跨目录，标注需调整路径
- 占位图（placeholder/empty state）标注来源

---

## 6. 布局推断规则

当 HTML 没有明确的 style 属性时，通过以下规则推断：

| 场景                               | 推断结论                                              |
| ---------------------------------- | ----------------------------------------------------- |
| `div > (label + input)` 水平排列   | `flexDirection: row`, `alignItems: center`            |
| `div > div` 垂直排列               | `flexDirection: column`                               |
| `div > (label above, input below)` | `flexDirection: column`                               |
| `class="xxx-row"` 且子元素水平排列 | `justifyContent: space-between`, `alignItems: center` |
| `class="xxx-card"`                 | 通常有 `borderRadius`, `backgroundColor`, `padding`   |
| 底部有 `button` 且独占一行         | `position: fixed` 或 `alignSelf: stretch`             |

---

## 7. 文本推断规则

用于推断字段语义和 label：

| 来源                               | 推断                                                    |
| ---------------------------------- | ------------------------------------------------------- |
| `<label>姓名</label>`              | label text = "姓名"                                     |
| `<input placeholder="请输入姓名">` | placeholder = "请输入姓名"，字段语义从 placeholder 推断 |
| `aria-label="name"`                | 字段名 = "name"                                         |
| 相邻 `label` + `input`             | 字段语义 = 最近的 label text                            |
| `button: 提交`                     | 按钮语义 = "提交"                                       |

---

## 8. 完整输出 Schema

> 以下示例中 `token` 字段的值为 RN 格式（`FONT.*` / `SPACE.*` / `theme['xxx']`）；H5 填 `var(--xlb-*)`，PC 填 Less 变量或 px 值。无映射时填 `"—"` 并记入 `unmappedTokens`。

```jsonc
{
  // 必填
  "page": "页面名（从 HTML 文件名推断）",
  "sourceFile": "原始 HTML 文件名",
  "parsedAt": "ISO 时间戳",

  // 必填，至少一个元素
  "elements": [
    {
      "selector": "CSS 选择器或唯一类名",
      "semanticType": "容器 | 表单行 | 字段标签 | 输入框 | 下拉框 | 按钮 | 上传区 | 标题 | 图标 | 图片",
      "tag": "HTML 标签名",
      "textContent": "元素的文本内容（无文本则为空字符串）",
      "children": [
        // 递归的子元素，结构相同
      ],
      "layout": {
        "display": { "html": "flex", "token": "—" },
        "flexDirection": { "html": "row", "token": "—" },
        "height": { "html": "48px", "token": "SPACE.SPACE_12" },
        "justifyContent": { "html": "space-between", "token": "—" },
        "alignItems": { "html": "center", "token": "—" },
        "padding": { "html": "0 16px", "token": "0 SPACE.SPACE_4" },
        "gap": { "html": "8px", "token": "SPACE.SPACE_2" },
      },
      "typography": {
        "fontSize": { "html": "14px", "token": "FONT.SIZE_14" },
        "fontWeight": { "html": "500", "token": "FONT.BOLD_500" },
        "lineHeight": { "html": "20px", "token": "FONT.LINE_HEIGHT_20" },
        "color": { "html": "#333333", "token": "theme['color-text-body']" },
        "textAlign": { "html": "left", "token": "—" },
      },
      "spacingStyle": {
        "borderRadius": { "html": "4px", "token": "BORDER.RADIUS_4" },
        "borderWidth": { "html": "1px", "token": "—" },
        "borderColor": { "html": "#dddddd", "token": "theme['color-border']" },
        "backgroundColor": { "html": "#ffffff", "token": "theme['color-bg']" },
        "marginBottom": { "html": "12px", "token": "SPACE.SPACE_3" },
      },
    },
  ],

  // 可选
  "iconMap": [
    {
      "html": "<i class='icon-camera'>",
      "semantic": "相机图标",
      "token": "XlbIcon name='camera'",
    },
  ],
  "imageMap": [
    {
      "html": "<img src='./logo.png'>",
      "semantic": "logo",
      "token": "require('./logo.png')",
    },
  ],
  "unmappedTokens": [
    {
      "value": "14px",
      "reason": "FONT.SIZE_14 不存在",
      "action": "使用 FONT.SIZE_16 近似",
    },
  ],
}
```

---

## 9. 解析示例

### 输入 HTML

```html
<div
  class="form-row"
  style="display:flex; height:48px; justify-content:space-between; align-items:center; padding:0 16px;"
>
  <label style="font-size:14px; font-weight:500; color:#333;">企业名称</label>
  <input
    style="width:200px; border:1px solid #ddd; border-radius:4px; padding:0 8px;"
    placeholder="请输入企业全称"
  />
</div>
```

### 输出 parsed JSON

```jsonc
{
  "page": "企业认证",
  "sourceFile": "cert-approve.html",
  "parsedAt": "2026-07-09T10:30:00Z",
  "elements": [
    {
      "selector": ".form-row",
      "semanticType": "表单行",
      "tag": "div",
      "textContent": "企业名称",
      "children": [
        {
          "selector": ".form-row label",
          "semanticType": "字段标签",
          "tag": "label",
          "textContent": "企业名称",
          "children": [],
          "layout": {},
          "typography": {
            "fontSize": { "html": "14px", "token": "FONT.SIZE_14" },
            "fontWeight": { "html": "500", "token": "FONT.BOLD_500" },
            "color": { "html": "#333333", "token": "theme['color-text-body']" },
          },
          "spacingStyle": {},
        },
        {
          "selector": ".form-row input",
          "semanticType": "输入框",
          "tag": "input",
          "textContent": "",
          "placeholder": "请输入企业全称",
          "children": [],
          "layout": { "width": { "html": "200px", "token": "—" } },
          "typography": {},
          "spacingStyle": {
            "borderWidth": { "html": "1px", "token": "—" },
            "borderColor": {
              "html": "#dddddd",
              "token": "theme['color-border']",
            },
            "borderRadius": { "html": "4px", "token": "BORDER.RADIUS_4" },
          },
        },
      ],
      "layout": {
        "display": { "html": "flex", "token": "—" },
        "flexDirection": { "html": "row", "token": "—" },
        "height": { "html": "48px", "token": "SPACE.SPACE_12" },
        "justifyContent": { "html": "space-between", "token": "—" },
        "alignItems": { "html": "center", "token": "—" },
        "padding": { "html": "0 16px", "token": "0 SPACE.SPACE_4" },
      },
      "typography": {},
      "spacingStyle": {},
    },
  ],
  "unmappedTokens": [],
}
```

---

## 10. 质量检查清单

解析完成后，在 ui-audit.md 中确认：

- [ ] 所有 visible 元素已解析（无遗漏）
- [ ] 每个元素的三要素已提取完整
- [ ] Layout 必填字段已填充（display、height）
- [ ] Typography 必填字段已填充（fontSize、color）
- [ ] 颜色值已做 hex 标准化（#333 → #333333）
- [ ] Token 映射已优先精确匹配
- [ ] 无法映射的 token 已记录到 `unmappedTokens`
- [ ] 图标和图片已按要求提取到独立的 map 中
- [ ] 输出 JSON 符合第 8 节的 Schema
