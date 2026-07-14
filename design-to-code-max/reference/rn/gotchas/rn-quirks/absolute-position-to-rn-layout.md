# HTML absolute/sticky 定位 → RN 布局翻译错误

## 问题描述

HTML 中使用 `position: absolute` 或 `position: sticky` 的元素，在翻译到 RN 时，如果 build 阶段按 HTML DOM 顺序照搬到 RN 的 ScrollView 中，会导致**元素视觉位置错误**——HTML 中通过 CSS 定位覆盖在顶部的元素，在 RN 中变成了按 DOM 顺序排列在错误的位置。

## 典型案例（FSMS-商品自检自查详情页 AnchorNav）

### HTML 设计
```html
<!-- DOM 顺序 -->
<div class="status-progress-bar">...</div>     <!-- 元素 1: 正常流 -->
<div class="detail-product-card">...</div>     <!-- 元素 2: 正常流 -->
<div class="tab-nav">商品信息 | 基本信息...</div>  <!-- 元素 3: position: absolute top:88px -->
```

视觉上：tab-nav 覆盖在顶部 88px 处（在 status-bar 下方），product-card 自然排在它下面。

### 错误的 RN 翻译（build 阶段产物）
```tsx
<ScrollView stickyHeaderIndices={[1]}>
  {/* [0] 按 DOM 顺序照搬 */}
  <View style={topBlock}>
    <StatusBar />       {/* 元素 1 */}
    <ProductCard />     {/* 元素 2 — 错误：应该在 tab 下面 */}
  </View>
  {/* [1] sticky */}
  <AnchorNav />          {/* 元素 3 — 错误：被 product-card 挤到下面了 */}
  <Section0 />
</ScrollView>
```

结果：tab 出现在 product-card **下方**，不符合设计。

### 正确的 RN 翻译
```tsx
{/* AnchorNav 在 ScrollView 外，始终固定在顶部 */}
<AnchorNav />

<ScrollView>
  <StatusBar />        {/* 元素 1 */}
  <ProductCard />      {/* 元素 2 — 正确：在 tab 下方 */}
  <Section0 />
</ScrollView>
```

或使用 `stickyHeaderIndices={[0]}`：
```tsx
<ScrollView stickyHeaderIndices={[0]}>
  <AnchorNav />         {/* [0] sticky — 始终在顶 */}
  <StatusBar />         {/* 元素 1 — 正确：在 tab 下方 */}
  <ProductCard />       {/* 元素 2 */}
</ScrollView>
```

## 根本原因

1. HTML 的 `position: absolute` / `fixed` 脱标，可视位置 ≠ DOM 位置
2. RN 的 `stickyHeaderIndices` / 绝对定位不脱标——按组件树顺序排列
3. design 阶段（tech-design.md）写了"position: absolute 或在 ScrollView 外"的两可方案，build 阶段随机选了错误的那个
4. build 阶段按 HTML DOM 顺序而非视觉顺序排列组件

## 修复方案

### Design 阶段（03-design.md）

在组件架构图中，对每个 `position: absolute | fixed | sticky` 的 HTML 元素，**必须**明确标注 RN 实现方案：

```
组件架构图（含定位标注）：

├── ScrollView 外（固定区域）
│   └── AnchorNav              ← position: absolute top:88px → RN: ScrollView 外固定
│
├── ScrollView 内（stickyHeaderIndices）
│   ├── [0] StatusBar
│   ├── [1] ProductCard
│   ├── [2] Section0
│   └── ...
```

**禁止**写"X 或 Y"而不选定方案。

### Build 阶段

读 tech-design.md 时必须确认：如果组件架构图标注了 "ScrollView 外"，该组件就不能出现在 ScrollView children 中。

## 发现时间

2026-07-09 — FSMS-商品自检自查详情页 AnchorNav 位置错误
