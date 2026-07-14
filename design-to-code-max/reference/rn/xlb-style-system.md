# XLB Style System — RN 样式书写规范

> 本文件是 design-to-code skill 在 RN 项目中生成样式代码的**强制基线**。违反本规范的代码不得通过 STEP 5 自测。
> 与 `rn-guidelines.md`（HTML→RN 转换规则）互补：前者管"怎么翻译 HTML"，本文件管"怎么写 RN 样式"。

## 第零原则：样式合规不得牺牲功能完整性

本规范的所有约束（颜色、间距、图标、组件库优先等）都必须在**功能完整、接口正确、数据流不变**的前提下执行。

**禁止行为：**

- ❌ 为把颜色改对而删除字段或简化表单
- ❌ 为使用组件库组件而替换已验证的复杂实现（如用 `XlbUploadFile` 替换 `SafeUpload`）
- ❌ 为修复图标而移除 `validationErrorsStore`、身份证号解密、OCR 等关键功能
- ❌ 为减少硬编码而把复杂状态管理改简单

**正确顺序：**

1. 先生成功能完整、接口正确的代码
2. 再执行「样式合规扫描清单」统一修复样式/图标问题
3. 修复时只改样式表达，不改功能逻辑

## 第一原则：先选组件库，再写自定义

新增 UI 之前，先去 `@xlb/components-react-native` 找现成组件，能用就用，不要自己实现：

| 需求                            | 直接用                                                                           |
| ------------------------------- | -------------------------------------------------------------------------------- |
| 按钮                            | `XlbButton`                                                                      |
| 输入框 / 数字输入               | `XlbInput` / `XlbInputNumber`                                                    |
| 弹窗 / 底部弹层 / 对话框        | `XlbPopup` / `XlbDialog` / `XlbActionSheet`                                      |
| 列表项 / 卡片                   | `XlbCell` / `XlbCard`                                                            |
| 文本 / 价格 / 标签 / 徽标       | `XlbText` / `XlbPrice` / `XlbTag` / `XlbBadge`                                   |
| 顶部导航 / 页面容器             | `XlbNavbar` / `XlbPageContainer`                                                 |
| Tabs / TabBar / 分段器 / 步骤条 | `XlbTabs` / `XlbTabBar` / `XlbSegmented` / `XlbSteps`                            |
| 选择器 / 时间选择 / 级联 / 树   | `XlbPicker` / `XlbDatePicker` / `XlbDateRangePicker` / `XlbCascader` / `XlbTree` |
| 表单                            | `XlbForm`                                                                        |
| 搜索栏 / 下拉 / 气泡            | `XlbSearchBar` / `XlbDropdown` / `XlbPopover`                                    |
| 提示 / 通知 / 空态 / 错误兜底   | `XlbToast` / `XlbNoticeBar` / `XlbEmpty` / `XlbErrorBoundary`                    |
| 图片 / 预览 / 轮播              | `XlbImage` / `XlbPreview` / `XlbSwiper`                                          |
| Switch / Checkbox / 选择列表    | `XlbSwitch` / `XlbCheckbox` / `XlbCheckList` / `XlbSelector`                     |

完整组件清单见 `node_modules/@xlb/components-react-native/src/components/index.ts`。

**自检**：写自定义 View 之前先问：组件库有没有？有就用，不要复制粘贴 RN 原生组件造一遍。

## 第二原则：图标只用 @xlb/icon-rn

```tsx
import {XlbIcon} from '@xlb/icon-rn';
import {SPACE} from '@xlb/components-react-native';

<XlbIcon
  name="Search"
  size={SPACE.SPACE_24}
  color={theme['color-text-icon-1']}
/>;
```

- `name` 必须是 `iconfontGlyphMap` 里存在的 key（如 `Search` / `Close` / `Add` / `Back` / `a-OutlineRight`），写错会 console.error 并渲染 null
- 完整 name 列表见 `node_modules/@xlb/icon-rn/src/stories/icons/index.ts` 的 `iconfontGlyphMap`
- **禁止**引入 `react-native-vector-icons` 或自己造 SVG 组件
- 禁止用 emoji（如 `⚠`、`✕`、`+`）或文字符号代替图标
- 图标尺寸优先使用 `SPACE.*` 常量；若设计稿尺寸不在 SPACE 阶梯中，可写数字但需在代码注释标注原因

### 图标名常见错误

```tsx
// ❌ 错误：name 带 icon_ 前缀，不在 glyph map 中
<XlbIcon name="icon_search" size={16} color={theme['color-primary-brand']} />

// ✅ 正确：name 与 iconfontGlyphMap key 完全一致
<XlbIcon name="Search" size={SPACE.SPACE_16} color={theme['color-primary-brand']} />
```

## 第三原则：颜色 / 间距 / 圆角 / 字号 / 阴影 全部走常量

### 颜色 → `theme`（运行时主题）

```tsx
import {useAppContext} from '@xlb/components-react-native';

const MyComponent = () => {
  const {theme} = useAppContext();

  const styles = StyleSheet.create({
    title: {color: theme['color-text-icon-0']},
    btn: {backgroundColor: theme['color-primary-brand']},
  });

  return <View style={styles.title} />;
};
```

> ⚠️ 旧版 `useThemeColor` 在本项目中不存在，禁止使用。统一从 `useAppContext()` 取 `theme`。

### 间距 / 字号 / 圆角 / 阴影 → 常量（编译期固定）

```tsx
import {SPACE, FONT, BORDER, SHADOW} from '@xlb/components-react-native';

const styles = StyleSheet.create({
  card: {
    padding: SPACE.SPACE_12,
    borderRadius: BORDER.RADIUS_8,
    marginBottom: SPACE.SPACE_8,
  },
  title: {
    fontSize: FONT.SIZE_16,
    lineHeight: FONT.LINE_HEIGHT_24,
    fontWeight: FONT.BOLD_MEDIUM,
  },
});
```

### 禁止行为

- ❌ 写死十六进制色 `#0080FF`、`#fff`、`rgba(...)` — 一律换成 `theme['color-xxx']`
- ❌ 写死 magic number 间距 `padding: 12`、`borderRadius: 8`、`fontSize: 14` — 一律换成 `SPACE.* / BORDER.* / FONT.*`
- ❌ 用 `normalize(12)` 代替 `SPACE.SPACE_12` — `normalize` 仅用于组件库未覆盖的少量场景（如特殊宽度、高度）
- ❌ 自定义 `boxShadow` / `elevation` — 用 `SHADOW.S1 / S2 / S3`
- ❌ 在 RN 中跨包从 `node_modules/@xlb/components-react-native/src/...` 深路径 import；只从包入口 `@xlb/components-react-native` 导入

### 例外

- `normalize()` 函数可直接从 `@xlb/components-react-native` 导入，用于需要手动适配的场景（如特殊宽度/高度、非标准间距）
- `fontWeight` 在 RN 中是字符串/数字皆可，统一用 `FONT.BOLD_REGULAR / BOLD_MEDIUM / BOLD_SEMI / BOLD_BOLD`

## 第四原则：设计稿色值必须映射到 token

从 HTML/截图中提取到的 hex 值，**必须先在 `references/token-map.json` 中查找对应 theme key**：

1. 找到 → 使用 `theme['color-xxx']`
2. 找不到 → 在 `ui-audit.md` 中标记「无 token 映射」，并在 `tech-design.md` 中提出风险
3. **禁止**因为"看起来接近"就随意选一个 theme key，也禁止直接写死 hex

> 例如：设计稿主色是 `#1A6AFF`，对应 `theme['color-primary-brand']`；设计稿页面背景是 `#F5F6F8`，对应 `theme['color-background-page']`。具体以 `token-map.json` 为准。

## token 速查

### 颜色（`theme['xxx']`）

- 文字图标：`color-text-icon-0/1/2/3`（主 → 次 → 辅 → 禁用）
- 主色：`color-primary-active/brand/secondary/disable/bright/highlight`
- 背景：`color-background-page/module/frame`
- 描边：`color-line-1/2`
- 状态：`color-function-error|warning|success-active/main/hover/disable/bright/highlight`

> 完整 hex → theme key 映射见 `references/token-map.json` 的 `colors` 字段和 `themeObject` 字段。

### 间距（`SPACE.*`）

| token            | 值  |
| ---------------- | --- |
| `SPACE.SPACE_0`  | 0   |
| `SPACE.SPACE_1`  | 1   |
| `SPACE.SPACE_2`  | 2   |
| `SPACE.SPACE_3`  | 3   |
| `SPACE.SPACE_4`  | 4   |
| `SPACE.SPACE_6`  | 6   |
| `SPACE.SPACE_8`  | 8   |
| `SPACE.SPACE_10` | 10  |
| `SPACE.SPACE_12` | 12  |
| `SPACE.SPACE_14` | 14  |
| `SPACE.SPACE_16` | 16  |
| `SPACE.SPACE_24` | 24  |

### 圆角（`BORDER.*`）

| token               | 值   |
| ------------------- | ---- |
| `BORDER.RADIUS_2`   | 2    |
| `BORDER.RADIUS_4`   | 4    |
| `BORDER.RADIUS_6`   | 6    |
| `BORDER.RADIUS_8`   | 8    |
| `BORDER.RADIUS_12`  | 12   |
| `BORDER.RADIUS_16`  | 16   |
| `BORDER.RADIUS_MAX` | 9999 |

### 字号（`FONT.*`）

| token          | 值  | 用途      |
| -------------- | --- | --------- |
| `FONT.SIZE_8`  | 8   | 极小标注  |
| `FONT.SIZE_10` | 10  | 辅助文字  |
| `FONT.SIZE_12` | 12  | 标签/描述 |
| `FONT.SIZE_14` | 14  | 正文      |
| `FONT.SIZE_16` | 16  | 标题      |
| `FONT.SIZE_18` | 18  | 大标题    |
| `FONT.SIZE_20` | 20  | 页面标题  |

| token                 | 值  |
| --------------------- | --- |
| `FONT.LINE_HEIGHT_10` | 10  |
| `FONT.LINE_HEIGHT_12` | 12  |
| `FONT.LINE_HEIGHT_14` | 14  |
| `FONT.LINE_HEIGHT_16` | 16  |
| `FONT.LINE_HEIGHT_20` | 20  |
| `FONT.LINE_HEIGHT_22` | 22  |
| `FONT.LINE_HEIGHT_24` | 24  |
| `FONT.LINE_HEIGHT_32` | 32  |
| `FONT.LINE_HEIGHT_36` | 36  |
| `FONT.LINE_HEIGHT_44` | 44  |
| `FONT.HEIGHT_48`      | 48  |

| token               | 值  | 对应     |
| ------------------- | --- | -------- |
| `FONT.BOLD_REGULAR` | 400 | normal   |
| `FONT.BOLD_MEDIUM`  | 500 | medium   |
| `FONT.BOLD_SEMI`    | 600 | semibold |
| `FONT.BOLD_BOLD`    | 700 | bold     |

### 阴影（`SHADOW.*`）

| token       | 用途                                                 |
| ----------- | ---------------------------------------------------- |
| `SHADOW.S1` | 组件小元素之间，轻量级组件投影（如 Tab 滚动）        |
| `SHADOW.S2` | 模块弹层及页面模块中需要激活操作的元素（如气泡提示） |
| `SHADOW.S3` | 页面大模块区分（如吸底/吸顶导航）                    |

## 常见违规示例（反面教材）

```tsx
// ❌ 错误：硬编码颜色 + magic number + 文字符号代替图标 + 图标名错误
<View style={{backgroundColor: '#E8F0FF', padding: 12, borderRadius: 4}}>
  <XlbIcon name="icon_add" size={14} color="#1A6AFF" />
  <Text style={{color: '#1A6AFF', fontSize: 14}}>+ 添加</Text>
</View>;

// ✅ 正确：theme + 常量 + XlbIcon（name 用 glyph map key）
import {useAppContext, SPACE, FONT, BORDER} from '@xlb/components-react-native';
import {XlbIcon} from '@xlb/icon-rn';

const {theme} = useAppContext();

<View
  style={{
    backgroundColor: theme['color-primary-bright'],
    padding: SPACE.SPACE_12,
    borderRadius: BORDER.RADIUS_4,
  }}>
  <XlbIcon
    name="Add"
    size={SPACE.SPACE_14}
    color={theme['color-primary-brand']}
  />
  <XlbText
    style={{color: theme['color-primary-brand'], fontSize: FONT.SIZE_14}}>
    添加
  </XlbText>
</View>;
```

## 落地自检清单（STEP 5 自测必须逐条检查）

在产出代码前 / 提交前过一遍：

- [ ] 用到的 UI 已经在组件库里找过，没有再自定义
- [ ] 图标全部是 `@xlb/icon-rn` 的 `XlbIcon`，且 `name` 在 `iconfontGlyphMap` 内
- [ ] 没有任何 `#xxx`、`rgb(`、`rgba(` 直接写在样式里
- [ ] 没有任何 magic number 用在 padding / margin / borderRadius / fontSize / lineHeight
- [ ] 没有用 `normalize(N)` 代替 `SPACE.* / BORDER.* / FONT.*`
- [ ] 没有用 emoji 或文字符号代替图标
- [ ] 颜色通过 `useAppContext().theme` 读取，确保挂在 `XlbAppProvider` 之下
- [ ] 仅从 `@xlb/components-react-native` 包入口导入，未走 `src/...` 深路径
- [ ] 图标名已对照 `node_modules/@xlb/icon-rn/src/stories/icons/index.ts` 校验，未凭空捏造
