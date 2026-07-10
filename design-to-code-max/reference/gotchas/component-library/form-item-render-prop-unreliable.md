# XlbForm.Item render prop 不可靠，优先用 useWatch + setFieldsValue

**条件**：需要用自定义 UI（如 Chip 按钮）控制表单字段值。

**原因**：`XlbForm.Item` 的 render prop（children as function）在某些场景下不触发或不渲染，导致自定义 UI 消失。依赖 `dependencies` 的属性变化通知也不可靠。

**处理**：使用 `XlbForm.useWatch` 获取响应式值 + `XlbForm.useFormInstance().setFieldsValue` 写入值 + 隐藏的 `XlbForm.Item` 注册字段用于校验。

**正确示例**：

```tsx
import {
  useAppContext,
  SPACE,
  BORDER,
  XlbText,
} from '@xlb/components-react-native';

const CertTypeChips = () => {
  const form = XlbForm.useFormInstance();
  const value = XlbForm.useWatch('field_name');
  const {theme} = useAppContext();

  return (
    <View style={{flexDirection: 'row', gap: SPACE.SPACE_8}}>
      {OPTIONS.map(opt => {
        const selected = value === opt.value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => form.setFieldsValue({field_name: opt.value})}
            style={{
              backgroundColor: selected
                ? theme['color-primary-bright']
                : theme['color-background-opacity-page'],
              borderRadius: BORDER.RADIUS_2,
              paddingHorizontal: SPACE.SPACE_12,
              paddingVertical: SPACE.SPACE_4,
            }}>
            <XlbText
              style={{
                color: selected
                  ? theme['color-primary-brand']
                  : theme['color-text-icon-0'],
                fontSize: FONT.SIZE_14,
                lineHeight: FONT.LINE_HEIGHT_20,
              }}>
              {opt.label}
            </XlbText>
          </Pressable>
        );
      })}
      <XlbForm.Item noStyle name="field_name" rules={[{required: true}]}>
        <View />
      </XlbForm.Item>
    </View>
  );
};
```

> 注意：示例中颜色全部使用 `theme['xxx']`，间距/圆角/字号全部使用 `SPACE.* / BORDER.* / FONT.*`，文本使用 `XlbText`，符合 `xlb-style-system.md` 规范。
