---
verifiedVersion: "n/a"
verifiedAt: "2026-07-14"
---
# flex gap 值是精确的设计 token，不可近似

**条件**：HTML 中出现 `gap: Npx`，N 不是 0/4/8/12/16 等常见值。

**原因**：设计稿的 gap 值是精确的，近似会导致间距偏差累积。

**处理**：严格按照 HTML 的 px 值设置 `gap: N`。如果 HTML 中有多级嵌套 gap，逐级计算总间距验证合理性。
