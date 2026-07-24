---
verifiedVersion: "@xlb/components-mobile@1.0.396"
verifiedAt: "2026-07-14"
---
# 组件库内置图标不可替换时必须用覆盖层

**条件**：设计稿使用图标 A，但三方组件（如 XlbUpload）内部硬编码图标 B 且不暴露 `iconName` prop。

**原因**：`XlbUpload` 的 `AddButton` 子组件硬编码 `name="Add"`（加号图标），无 prop 可改。直接使用会导致视觉与设计稿不符。

**处理**：

1. 先确认组件库是否暴露了图标相关 prop（搜索 types.ts 中的 prop 定义）
2. 如果没有 → 使用**覆盖层模式**：
   - 外层 `<View style={{ position: 'relative' }}>`
   - 底层放设计稿要求的 `<XlbIcon name="目标图标" />`
   - 顶层放三方组件，`position: 'absolute'` + `opacity: 0`，扩展 touch area
3. 在代码注释中标注原因和组件库限制

**正确示例**：

```tsx
import {useAppContext, SPACE} from '@xlb/components-react-native';
import {XlbIcon} from '@xlb/icon-rn';

const {theme} = useAppContext();

<View style={{position: 'relative'}}>
  <XlbIcon
    name="Scan"
    size={SPACE.SPACE_16}
    color={theme['color-text-icon-0']}
  />
  <XlbUpload
    maxCount={1}
    value={[]}
    style={{
      position: 'absolute',
      top: -SPACE.SPACE_12,
      left: -SPACE.SPACE_12,
      opacity: 0,
    }}
    onChange={handleOcr}
  />
</View>;
```

> 即使是覆盖层中的图标，颜色也必须走 `theme['xxx']`，尺寸走 `SPACE.*`。
