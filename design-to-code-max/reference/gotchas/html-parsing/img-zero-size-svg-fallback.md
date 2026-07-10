# img 的 width/height 为 0 不代表元素不可见

**条件**：HTML 中 `<img>` 的 `width="0"` 或 `height="0"`。

**原因**：MasterGo 导出 SVG 时，某些元素（如竖线分隔线）的 HTML `width`/`height` 可能为 0，但 **SVG 内部的 `viewBox` 和实际 `<line>`/`<path>` 内容仍然有效**。这是 MasterGo 的导出 bug，不代表设计意图是隐藏该元素。

**处理**：

- 遇到 `width="0"` 或 `height="0"` 的 `<img>`，**必须打开 SVG 源文件读取 `viewBox` 和实际内容**
- 根据 viewBox 尺寸 + 元素语义（`<line>` 是分割线、`<path>` 是图标）判断实际视觉效果
- 在 RN 中用对应组件还原（`<line>` → `<View>` 分割线，`<path>` 按图标处理）

**案例**：

```html
<img src="svg_7c48679f.svg" style="width: 12px; height: 0px" />
```

```svg
<!-- SVG 源文件中的 stroke 颜色是 MasterGo 导出值，仅作参考 -->
<svg viewBox="0 0 2 12"><line x1="1" y1="-0.5" x2="13" y2="-0.5" stroke="#BCC0C7" transform="matrix(0,1,-1,0,1,-1)"/></svg>
```

→ RN：

```tsx
import {useAppContext} from '@xlb/components-react-native';

const {theme} = useAppContext();

<View
  style={{
    width: StyleSheet.hairlineWidth,
    height: 12,
    backgroundColor: theme['color-line-2'],
  }}
/>;
```

> 还原时颜色必须使用 `theme['xxx']`，不要直接复制 SVG 中的 hex。
