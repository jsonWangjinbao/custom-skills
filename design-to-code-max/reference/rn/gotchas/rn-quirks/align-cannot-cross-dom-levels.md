# 对齐属性不可跨 DOM 层级平移

**条件**：HTML 中父容器有 `justify-content: space-between`（或 `align-items: center`），但该属性只作用于子元素层级。当 HTML 的子元素是**嵌套容器**（内有多子元素），而 RN 中是**扁平直接子元素**时。

**原因**：不可直接把父容器的对齐属性套到 RN 上。对齐属性的作用范围是直接子元素，跨层级后效果完全不同。

**典型案例**：
```html
<!-- HTML：space-between 作用于一个嵌套 div，不影响内部 span -->
<div style="justify-content: space-between">
  <div style="gap: 4px">          ← 只有一个子元素，space-between 无效果
    <span>门店名</span>
    <span>门店编码</span>
  </div>
</div>
```
若 RN 将「门店名」和「门店编码」扁平化为直接子元素，再加 `justifyContent: 'space-between'` → 两者被推到两端，完全错误。

**处理**：翻译对齐属性前，先对比 HTML DOM 层级和 RN 组件层级。层级不同时，对齐属性不能照搬，需根据子元素的实际排列关系重新判断。
