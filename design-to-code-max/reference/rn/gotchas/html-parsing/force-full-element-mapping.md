---
verifiedVersion: "n/a"
verifiedAt: "2026-07-14"
---
# 强制全量元素映射，禁止跳过

**条件**：开始写代码前。

**原因**：跳过任何一个 HTML 元素（即使认为它不可见或无关紧要）都会导致遗漏功能或视觉元素，需要多轮反馈才能补齐。

**处理**：
- 解析 HTML 后，**必须列出所有子元素**（包括 `height: 0` 的 img、嵌套的空 div 等）
- 逐个标注映射结果：✅ 已映射 / ⚠️ 需确认 / ❌ 有意省略并注明原因
- 映射表写入最终回复的注释中，让用户能一眼看出是否有遗漏

**示例格式**：
```
HTML 元素映射：
├── span "身份证号"            → XlbText labelText     ✅
├── span "*"                  → XlbText requiredStar  ✅
├── p "320322..."             → SafeInput             ✅
├── img svg_7c48679f (分隔线)  → View divider          ✅
└── img svg_9832fcb1 (扫描)    → XlbIcon Scan          ✅
```
