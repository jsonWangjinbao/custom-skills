# 父级 flex-start + 子级 text-align:center 对齐冲突

**条件**：父容器 `align-items: flex-start`（或 `justify-content: flex-start`），子元素声明了 `text-align: center`。

**原因**：标准 CSS 中 `align-items: flex-start` 使子元素只占内容宽度（不撑满），子元素的 `text-align: center` 在自身宽度内居中 = 无效果，实际渲染为**居左**。MasterGo 中块级元素行为可能有差异。

**处理**：目标平台为 RN 时，**不**因子元素有 `text-align: center` 而给父容器加 `alignItems: 'center'`。仅在用户明确反馈对齐不对时才考虑修正。
