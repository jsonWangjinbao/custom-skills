# font-weight 跨平台视觉差异

**条件**：HTML 声明的 `font-weight` 值在 300~600 范围内，目标平台为 RN。

**原因**：PingFang SC 在 RN 中 400（Regular）和 500（Medium）视觉差异极小，几乎看不出加粗效果。通常需要 `600`（Semi Bold）或 `700`（Bold）才有明显加粗。

**提问模板**：
```
⚠️ font-weight 跨平台差异：
- HTML：font-weight = {X}
- RN 中 PingFang SC 的 {X} 和 400 视觉差异几乎不可见
- 需要调整 weight 值吗？（建议 600 或 700）
```
