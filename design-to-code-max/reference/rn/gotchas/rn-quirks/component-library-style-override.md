---
verifiedVersion: "@xlb/components-mobile@1.0.396"
verifiedAt: "2026-07-23"
---
# 组件库内置样式覆盖

**条件**：目标代码使用了第三方组件库（如 XlbButton、XlbNavbar），这些组件有内置默认样式。

**原因**：`type="primary"` 之类的 prop 可能映射到组件库自己的颜色/字号体系，与设计稿的精确值不一致。

**处理**：

- 检查组件是否支持 `style` / `textStyle` 等覆盖 prop
- 用 `theme['xxx']` / `SPACE.*` / `FONT.*` / `BORDER.*` 等 token 显式覆盖，**禁止**写死 hex 或 magic number
- 典型需要覆盖的属性：`backgroundColor`、`fontSize`、`fontWeight`、`lineHeight`、`color`、`height`、`borderRadius`
- 覆盖前先在 `reference/rn/token-map.json` 中查找设计稿 hex 对应的 theme key；找不到时标记风险，不要直接写死
