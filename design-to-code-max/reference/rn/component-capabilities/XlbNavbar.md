# XlbNavbar

> 数据源：`@xlb/components-react-native@1.0.0-beta.217` · `src/components/XlbNavbar/index.tsx`
> 由 scripts/dtc-rn-component-cards.mjs 于 2026-08-06 生成；<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

| Prop | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `title` | string \| ReactNode | 否 | — | 导航栏标题，可以是字符串或 React 节点 title="页面标题" title={<XlbText>自定义标题</XlbText>} |
| `onPressBackArrow` | () => void | 否 | — | 点击返回箭头的回调函数 onPressBackArrow={() => console.log('返回按钮被点击')} |
| `rightStyle` | StyleProp<ViewStyle> | 否 | — | 右侧布局的样式 rightStyle={{ marginRight: 10 }} |
| `rightExtra` | \| React.ReactNode \| ((props: { color: string; fontSize: number }) => … | 否 | — | 右侧自定义内容，可以是字符串、React 节点或渲染函数 rightExtra="更多" rightExtra={<View><XlbText>更多</XlbText></View>} rightExtra={({ color }) => <XlbText style={{ color }}>更多</XlbText>} |
| `showBackArrow` | boolean | 否 | `true` | 是否显示返回箭头 showBackArrow={false} |
| `leftExtra` | JSX.Element | 否 | — | 左侧自定义内容 leftExtra={<View><XlbText>左侧内容</XlbText></View>} |
| `leftStyle` | StyleProp<ViewStyle> | 否 | — | 左侧布局的样式 leftStyle={{ marginLeft: 10 }} |
| `onLayout` | (e: LayoutChangeEvent) => void | 否 | — | 布局事件回调 onLayout={(e) => console.log(e.nativeEvent.layout)} |
| `isSafeArea` | boolean | 否 | `true` | 是否开启安全区域 |
| `safeAreaViewStyle` | StyleProp<ViewStyle> | 否 | — | 安全区域样式 safeAreaViewStyle={{ backgroundColor: 'red' }} |
| `containerStyle` | StyleProp<ViewStyle> | 否 | — | 导航栏容器样式 containerStyle={{ height: FONT.LINE_HEIGHT_44 }} |
| `titleStyle` | StyleProp<ViewStyle> | 否 | — | 标题样式 titleStyle={{ fontSize: FONT.SIZE_18 }} |
| `searchMode` | boolean | 否 | `false` | 是否为搜索模式，title 占满右侧剩余宽度 searchMode={true} |

## 附属结构

- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- [component-library-style-override](../gotchas/rn-quirks/component-library-style-override.md)

<!-- AUTO:END -->

<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

| Prop | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `title` | string \| ReactNode | 否 | — | 导航栏标题，可以是字符串或 React 节点 title="页面标题" title={<XlbText>自定义标题</XlbText>} |
| `onPressBackArrow` | () => void | 否 | — | 点击返回箭头的回调函数 onPressBackArrow={() => console.log('返回按钮被点击')} |
| `rightStyle` | StyleProp<ViewStyle> | 否 | — | 右侧布局的样式 rightStyle={{ marginRight: 10 }} |
| `rightExtra` | \| React.ReactNode \| ((props: { color: string; fontSize: number }) => … | 否 | — | 右侧自定义内容，可以是字符串、React 节点或渲染函数 rightExtra="更多" rightExtra={<View><XlbText>更多</XlbText></View>} rightExtra={({ color }) => <XlbText style={{ color }}>更多</XlbText>} |
| `showBackArrow` | boolean | 否 | `true` | 是否显示返回箭头 showBackArrow={false} |
| `leftExtra` | JSX.Element | 否 | — | 左侧自定义内容 leftExtra={<View><XlbText>左侧内容</XlbText></View>} |
| `leftStyle` | StyleProp<ViewStyle> | 否 | — | 左侧布局的样式 leftStyle={{ marginLeft: 10 }} |
| `onLayout` | (e: LayoutChangeEvent) => void | 否 | — | 布局事件回调 onLayout={(e) => console.log(e.nativeEvent.layout)} |
| `isSafeArea` | boolean | 否 | `true` | 是否开启安全区域 |
| `safeAreaViewStyle` | StyleProp<ViewStyle> | 否 | — | 安全区域样式 safeAreaViewStyle={{ backgroundColor: 'red' }} |
| `containerStyle` | StyleProp<ViewStyle> | 否 | — | 导航栏容器样式 containerStyle={{ height: FONT.LINE_HEIGHT_44 }} |
| `titleStyle` | StyleProp<ViewStyle> | 否 | — | 标题样式 titleStyle={{ fontSize: FONT.SIZE_18 }} |
| `searchMode` | boolean | 否 | `false` | 是否为搜索模式，title 占满右侧剩余宽度 searchMode={true} |

## 附属结构

- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- [component-library-style-override](../gotchas/rn-quirks/component-library-style-override.md)

<!-- AUTO:END -->

<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

| Prop | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `title` | string \| ReactNode | 否 | — | 导航栏标题，可以是字符串或 React 节点 title="页面标题" title={<XlbText>自定义标题</XlbText>} |
| `onPressBackArrow` | () => void | 否 | — | 点击返回箭头的回调函数 onPressBackArrow={() => console.log('返回按钮被点击')} |
| `rightStyle` | StyleProp<ViewStyle> | 否 | — | 右侧布局的样式 rightStyle={{ marginRight: 10 }} |
| `rightExtra` | \| React.ReactNode \| ((props: { color: string; fontSize: number }) => … | 否 | — | 右侧自定义内容，可以是字符串、React 节点或渲染函数 rightExtra="更多" rightExtra={<View><XlbText>更多</XlbText></View>} rightExtra={({ color }) => <XlbText style={{ color }}>更多</XlbText>} |
| `showBackArrow` | boolean | 否 | `true` | 是否显示返回箭头 showBackArrow={false} |
| `leftExtra` | JSX.Element | 否 | — | 左侧自定义内容 leftExtra={<View><XlbText>左侧内容</XlbText></View>} |
| `leftStyle` | StyleProp<ViewStyle> | 否 | — | 左侧布局的样式 leftStyle={{ marginLeft: 10 }} |
| `onLayout` | (e: LayoutChangeEvent) => void | 否 | — | 布局事件回调 onLayout={(e) => console.log(e.nativeEvent.layout)} |
| `isSafeArea` | boolean | 否 | `true` | 是否开启安全区域 |
| `safeAreaViewStyle` | StyleProp<ViewStyle> | 否 | — | 安全区域样式 safeAreaViewStyle={{ backgroundColor: 'red' }} |
| `containerStyle` | StyleProp<ViewStyle> | 否 | — | 导航栏容器样式 containerStyle={{ height: FONT.LINE_HEIGHT_44 }} |
| `titleStyle` | StyleProp<ViewStyle> | 否 | — | 标题样式 titleStyle={{ fontSize: FONT.SIZE_18 }} |
| `searchMode` | boolean | 否 | `false` | 是否为搜索模式，title 占满右侧剩余宽度 searchMode={true} |

## 附属结构

- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- [component-library-style-override](../gotchas/component-library/component-library-style-override.md)

<!-- AUTO:END -->

<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

| Prop | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `title` | string \| ReactNode | 否 | — | 导航栏标题，可以是字符串或 React 节点 title="页面标题" title={<XlbText>自定义标题</XlbText>} |
| `onPressBackArrow` | () => void | 否 | — | 点击返回箭头的回调函数 onPressBackArrow={() => console.log('返回按钮被点击')} |
| `rightStyle` | StyleProp<ViewStyle> | 否 | — | 右侧布局的样式 rightStyle={{ marginRight: 10 }} |
| `rightExtra` | \| React.ReactNode \| ((props: { color: string; fontSize: number }) => … | 否 | — | 右侧自定义内容，可以是字符串、React 节点或渲染函数 rightExtra="更多" rightExtra={<View><XlbText>更多</XlbText></View>} rightExtra={({ color }) => <XlbText style={{ color }}>更多</XlbText>} |
| `showBackArrow` | boolean | 否 | `true` | 是否显示返回箭头 showBackArrow={false} |
| `leftExtra` | JSX.Element | 否 | — | 左侧自定义内容 leftExtra={<View><XlbText>左侧内容</XlbText></View>} |
| `leftStyle` | StyleProp<ViewStyle> | 否 | — | 左侧布局的样式 leftStyle={{ marginLeft: 10 }} |
| `onLayout` | (e: LayoutChangeEvent) => void | 否 | — | 布局事件回调 onLayout={(e) => console.log(e.nativeEvent.layout)} |
| `isSafeArea` | boolean | 否 | `true` | 是否开启安全区域 |
| `safeAreaViewStyle` | StyleProp<ViewStyle> | 否 | — | 安全区域样式 safeAreaViewStyle={{ backgroundColor: 'red' }} |
| `containerStyle` | StyleProp<ViewStyle> | 否 | — | 导航栏容器样式 containerStyle={{ height: FONT.LINE_HEIGHT_44 }} |
| `titleStyle` | StyleProp<ViewStyle> | 否 | — | 标题样式 titleStyle={{ fontSize: FONT.SIZE_18 }} |
| `searchMode` | boolean | 否 | `false` | 是否为搜索模式，title 占满右侧剩余宽度 searchMode={true} |

## 附属结构

- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- [component-library-style-override](../gotchas/component-library/component-library-style-override.md)

<!-- AUTO:END -->

<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

| Prop | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `title` | string \| ReactNode | 否 | — | 导航栏标题，可以是字符串或 React 节点 title="页面标题" title={<XlbText>自定义标题</XlbText>} |
| `onPressBackArrow` | () => void | 否 | — | 点击返回箭头的回调函数 onPressBackArrow={() => console.log('返回按钮被点击')} |
| `rightStyle` | StyleProp<ViewStyle> | 否 | — | 右侧布局的样式 rightStyle={{ marginRight: 10 }} |
| `rightExtra` | \| React.ReactNode \| ((props: { color: string; fontSize: number }) => … | 否 | — | 右侧自定义内容，可以是字符串、React 节点或渲染函数 rightExtra="更多" rightExtra={<View><XlbText>更多</XlbText></View>} rightExtra={({ color }) => <XlbText style={{ color }}>更多</XlbText>} |
| `showBackArrow` | boolean | 否 | `true` | 是否显示返回箭头 showBackArrow={false} |
| `leftExtra` | JSX.Element | 否 | — | 左侧自定义内容 leftExtra={<View><XlbText>左侧内容</XlbText></View>} |
| `leftStyle` | StyleProp<ViewStyle> | 否 | — | 左侧布局的样式 leftStyle={{ marginLeft: 10 }} |
| `onLayout` | (e: LayoutChangeEvent) => void | 否 | — | 布局事件回调 onLayout={(e) => console.log(e.nativeEvent.layout)} |
| `isSafeArea` | boolean | 否 | `true` | 是否开启安全区域 |
| `safeAreaViewStyle` | StyleProp<ViewStyle> | 否 | — | 安全区域样式 safeAreaViewStyle={{ backgroundColor: 'red' }} |
| `containerStyle` | StyleProp<ViewStyle> | 否 | — | 导航栏容器样式 containerStyle={{ height: FONT.LINE_HEIGHT_44 }} |
| `titleStyle` | StyleProp<ViewStyle> | 否 | — | 标题样式 titleStyle={{ fontSize: FONT.SIZE_18 }} |
| `searchMode` | boolean | 否 | `false` | 是否为搜索模式，title 占满右侧剩余宽度 searchMode={true} |

## 附属结构

- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- [component-library-style-override](../gotchas/component-library/component-library-style-override.md)

<!-- AUTO:END -->

<!-- MANUAL:BEGIN -->

## 能力边界（人工维护）

> 该组件**不能**做什么、常见误用场景。（待补充）

## 易混淆对比（人工维护)

> 与最易误选的组件对比：看到什么特征用本组件，看到什么特征用对方。（待补充）

## 场景绑定（人工维护）

> 命中即直接选用本组件的设计稿特征，禁止自由发挥。（待补充）
