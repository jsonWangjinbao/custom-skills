# 所有 Text / TextInput 必须显式传入 fontFamily

**条件**：RN 页面中使用了 `<Text>`（react-native）或 `XlbInput` / `XlbSearchBar` 等输入组件。

**原因**：`XlbText` 内部从 `useAppContext()` 获取 `fontFamily` 并显式设置到 `<Text>` 上（Android = `'SourceHanSans'`，iOS = `'PingFang SC'`）。但 `<Text>` 和 `XlbInput` 底层 `<TextInput>` 使用**系统默认字体**（Android = `Roboto`，iOS = `San Francisco`）。同一字号和字重下，系统默认字体笔画更粗，导致输入框文字看起来「加粗」。

**处理**：
- 所有 `<Text>` 加 `style={{ fontFamily }}`
- 所有 `XlbInput` 通过 `style` prop 传 `{ fontFamily }`（或通过 `SafeInput`/`ClearableInput` 统一注入）
- `XlbSearchBar` 通过 `inputProps.style` 传入 `{ fontFamily }`
- 从 `useAppContext()` 解构 `{ fontFamily }`

**不需要处理**：`XlbText` 已内置 fontFamily 注入，无需额外传。
