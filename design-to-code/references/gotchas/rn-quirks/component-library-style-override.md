# 组件库内置样式覆盖

**条件**：目标代码使用了第三方组件库（如 XlbButton、XlbNavbar），这些组件有内置默认样式。

**原因**：`type="primary"` 之类的 prop 可能映射到组件库自己的颜色/字号体系，与设计稿的精确值（如 `#0080FF`、`fontSize: 16`）不一致。

**处理**：
- 检查组件是否支持 `style` / `textStyle` 等覆盖 prop
- 用设计稿的精确值显式覆盖，不依赖组件库默认值
- 典型需要覆盖的属性：`backgroundColor`、`fontSize`、`fontWeight`、`lineHeight`、`color`、`height`、`borderRadius`
