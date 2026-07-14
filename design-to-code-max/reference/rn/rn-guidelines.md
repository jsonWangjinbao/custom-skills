# React Native 样式生成规范

> 本规范与 `references/xlb-style-system.md` 互补：本文件管"HTML → RN 的转换规则"，xlb-style-system.md 管"RN 样式在 XLB 项目中怎么写"。生成代码前必须同时读两份文件。

## 主题色（最高优先级）

**绝对禁止硬编码 hex 色值。** 所有颜色必须通过主题系统获取。

### 获取主题

项目统一使用 `@xlb/components-react-native` 提供的 `useAppContext`：

```tsx
import { useAppContext } from "@xlb/components-react-native";

const MyComponent = () => {
  const { theme } = useAppContext();
  return <XlbIcon color={theme["color-primary-brand"]} />;
};
```

> ⚠️ 旧版 `useThemeColor` hook 在本项目中不存在，禁止使用。

### 样式工厂模式（推荐）

```tsx
import { useAppContext } from "@xlb/components-react-native";
import { useMemo } from "react";
import { StyleSheet } from "react-native";

// 模块级：工厂函数
const createStyles = (theme: Record<string, string>) =>
  StyleSheet.create({
    title: { color: theme["color-text-icon-0"] },
    button: { backgroundColor: theme["color-primary-brand"] },
    divider: { backgroundColor: theme["color-line-2"] },
  });

// 组件内：useMemo 缓存
const MyComponent = () => {
  const { theme } = useAppContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return <View style={styles.title} />;
};
```

### 共享样式

如果存在 `sharedStyles`，同样改为工厂函数模式：

```tsx
// components/shared/sharedStyles.ts
export function createSharedStyles(theme: Record<string, string>) {
  return StyleSheet.create({ ... });
}
```

### 常用主题 key（项目实际色值）

| hex 原值              | 主题 key                           | 用途                      |
| --------------------- | ---------------------------------- | ------------------------- |
| `#111425`             | `color-text-icon-0`                | 标题、正文                |
| `#5C6070`             | `color-text-icon-1`                | 二级文字                  |
| `#6E7B8C`             | `color-text-icon-2`                | 三级文字                  |
| `#9CA0AE`             | `color-text-icon-3`                | placeholder               |
| `#1A6AFF`             | `color-primary-brand`              | 品牌蓝、按钮              |
| `#FF4949`             | `color-function-error-main`        | 错误红                    |
| `#FF9E3D`             | `color-function-warning-main`      | 警告橙                    |
| `#FFFFFF`             | `color-background-frame`           | 卡片白底                  |
| `#F5F6F8`             | `color-background-page`            | 页面灰底                  |
| `#FAFAFC`             | `color-background-module`          | 模块灰底                  |
| `#E5E6EB`             | `color-line-2`                     | 分割线                    |
| `#E8F0FF`             | `color-primary-bright`             | 蓝色浅背景                |
| `#FFF8EE`             | `color-function-warning-highlight` | 提示框浅黄背景            |
| `rgba(17,20,37,0.05)` | `color-background-opacity-page`    | 5% 灰底（未选中 chip 等） |

> 完整映射 → `references/token-map.json`。设计稿中的 hex 必须先在 token-map 中查找对应 key；找不到时禁止写死 hex，应在 `ui-audit.md` 中标记「无 token 映射」并在技术设计阶段提出风险。

## Flexbox 默认值差异

Web 默认 `flex-direction: row`，RN 默认 `flex-direction: column`。

**规则：**

- HTML 中未显式声明 `flex-direction` 的元素，在 RN 中必须显式写 `flexDirection: 'row'`
- HTML 声明了 `flex-direction: column` 的，RN 中不写（已是默认值）
- 其他 flex 属性直接翻译：`justify-content: center` → `justifyContent: 'center'`，`align-items: flex-start` → `alignItems: 'flex-start'`

## shadow 转换

Web `box-shadow: offsetX offsetY blurRadius spreadRadius color` → RN 四个独立属性 + Android elevation：

```
// Web
box-shadow: 0px 2px 8px 0px rgba(0,0,0,0.08)

// RN
shadowColor: '#000000',
shadowOffset: { width: 0, height: 2 },
shadowOpacity: 0.08,
shadowRadius: 8,
elevation: 3,  // Android 需要，参考 blurRadius 设定
```

**规则：** 按 `offsetX offsetY blurRadius spreadRadius color` 顺序解析。`inset` 阴影（内阴影）RN 不原生支持，生成代码中注释标注。

> RN 项目优先使用 `SHADOW.S1 / S2 / S3`（见 `xlb-style-system.md`），不要手写 shadow 常量。

## 图片与图标引用

RN 中必须区分「图标（icon）」和「图片（image/illustration）」。图标处理不应影响功能架构。

### 图标一律用 @xlb/icon-rn

设计稿/HTML 中的图标元素（`<img src="...svg">`、`<i class="icon-xxx">`、字体图标、内联 SVG、截图矢量图标），**优先映射为 `@xlb/icon-rn` 的 `XlbIcon`**：

1. 在 `node_modules/@xlb/icon-rn/src/stories/icons/index.ts` 的 `iconfontGlyphMap` 中查找语义最接近的 key
2. 使用 `<XlbIcon name="Key" size={SPACE.SPACE_*} color={theme['color-xxx']} />`
3. **禁止**直接 `require('./asset/icons/foo.svg')` 或 `<Image source={require('...svg')} />`

> ⚠️ `name` 必须与 `iconfontGlyphMap` 的 key **完全一致**。常见错误是把 `Search` 写成 `icon_search`，会渲染为 `null`。完整映射见 `references/icon-map.md`。

### 真实图片用 Image / XlbImage

只有照片、头像、营业执照扫描件、装饰性 PNG/JPG/WebP 才使用本地图片：

```tsx
const headerImg = require('./asset/headerDecorHalf.png');
<Image source={headerImg} style={{width: 375, height: 120}} />
// 或优先使用 XlbImage
<XlbImage source={require('@xlb/common/src/assets/empty.png')} />
```

### 图标缺失时的处理

当图标在 `iconfontGlyphMap` 中找不到时：

1. 在 `references/icon-map.md` 中找最接近的语义替代
2. 仍找不到 → 使用最接近的 key（如健康证用 `File`），在代码注释中说明
3. **禁止**：凭空编造 `name`、用 emoji/文字符号代替、直接丢弃
4. **禁止**：为处理图标缺失而简化组件、删除字段、改变数据流或替换已验证的复杂实现

## gap 兼容性

RN 0.71+ 原生支持 gap，但为兼容旧版：

```js
// 优先使用 gap（简洁）
container: { gap: SPACE.SPACE_8 }

// 降级方案（兼容 < 0.71）
container: {},
child: { marginTop: SPACE.SPACE_8 },  // column 方向，非首子元素
```

**规则：** 生成代码中使用 `gap` + `SPACE.*` 常量，在 DESIGN-REVIEW.md 中标注"依赖 RN 0.71+"。

## 字体处理

- iOS：`PingFang SC` 系统原生支持
- Android：`PingFang SC` 默认不可用
- **规则：** 保留设计稿字体名 `fontFamily: 'PingFang SC'`，在 DESIGN-REVIEW.md 中标注"Android 需配置自定义字体或替换为系统字体"

## 单位处理

- HTML 的 px 值在 RN 中为逻辑像素，直接去掉 `px` 后缀
- `width: 375px` → `width: 375`
- `font-size: 14px` → `fontSize: FONT.SIZE_14`
- `line-height: 20px` → `lineHeight: FONT.LINE_HEIGHT_20`

> 禁止手写 `normalize(12)`、`fontSize: 14` 等 magic number。间距、圆角、字号、行高、字重必须使用 `SPACE.* / BORDER.* / FONT.*` 常量（见 `xlb-style-system.md`）。

## 属性名转换（全部 camelCase）

| CSS（HTML）                  | RN StyleSheet                                                                          |
| ---------------------------- | -------------------------------------------------------------------------------------- |
| `background`                 | `backgroundColor`                                                                      |
| `border-radius`              | `borderRadius` → `BORDER.RADIUS_*`                                                     |
| `border-bottom-right-radius` | `borderBottomRightRadius`                                                              |
| `padding-top`                | `paddingTop` → `SPACE.SPACE_*`                                                         |
| `font-size`                  | `fontSize` → `FONT.SIZE_*`                                                             |
| `font-weight`                | `fontWeight` → `FONT.BOLD_*`                                                           |
| `font-family`                | `fontFamily`                                                                           |
| `line-height`                | `lineHeight` → `FONT.LINE_HEIGHT_*`                                                    |
| `text-align`                 | `textAlign`                                                                            |
| `box-shadow`                 | `SHADOW.S1/S2/S3` 或 `shadowColor` + `shadowOffset` + `shadowOpacity` + `shadowRadius` |
| `z-index`                    | `zIndex`                                                                               |

## 特殊属性处理

| CSS 值               | RN 处理                          |
| -------------------- | -------------------------------- |
| `flex: none`         | 不写 flex 属性（或用 `flex: 0`） |
| `position: relative` | 默认值，不写                     |
| `position: absolute` | `position: 'absolute'`           |
| `overflow: hidden`   | `overflow: 'hidden'`             |
| `display: flex`      | 默认，不写                       |

## 组件映射

| HTML 元素          | RN 组件                  |
| ------------------ | ------------------------ |
| `<div>`            | `<View>`                 |
| `<span>`           | `<Text>`                 |
| `<p>`              | `<Text>`                 |
| `<img>`            | `<Image source={...} />` |
| 包含文本的 `<div>` | `<Text>`                 |

## fontFamily 显式传递

`XlbText` 内置 fontFamily 注入，但 `<Text>` 和 `<XlbInput>` 底层使用系统默认字体。

- 所有 `<Text>` → `style={{ fontFamily: 'PingFang SC' }}`
- 所有 `<XlbInput>` → 通过 `style` 或 `SafeInput`/`ClearableInput` 注入
- 从 `useAppContext()` 中无法直接拿到 `fontFamily`，需要时直接写 `'PingFang SC'` 并标注 Android 风险

## SafeInput / SafeUploadFile / ClearableInput 包装模式

### SafeInput / SafeUploadFile（防止 Android nativeID 崩溃）

数组 `name` 生成的 `id` 传到原生 Android TextInput 映射为 `nativeID`，Android 期望 String 收到 Array 崩溃。受影响组件：`XlbInput`、`XlbUploadFile`。不受影响：`CommonFormItem type="date"/"selector"`。详见 `references/gotchas/component-library/safeinput-filter-id.md`。

建议统一放在 `SafeComponents.tsx` 文件中：

```tsx
import { forwardRef } from "react";
import { XlbInput, XlbUploadFile } from "@xlb/components-react-native";

export const SafeInput = forwardRef((props: any, ref: any) => {
  const { id, ...rest } = props;
  return <XlbInput ref={ref} {...rest} />;
});

export const SafeUploadFile = forwardRef((props: any, ref: any) => {
  const { id, ...rest } = props;
  return <XlbUploadFile ref={ref} {...rest} />;
});
```

**判断标准**：使用 `name={[...]}`（数组形式）时，`XlbForm.Item` 直接子组件是 `XlbInput` → 用 `SafeInput`，是 `XlbUploadFile` → 用 `SafeUploadFile`。字符串 `name` 不受影响。

### ClearableInput（iOS 清空按钮回退）

FormItemContainer 注入的 `value || ''` 导致 iOS shadow value 模式下清空按钮回退。用 `useWatch` + `setFieldsValue` 自行管理受控循环。

```tsx
const ClearableInput = forwardRef((props: any, ref: any) => {
  const { name, value: _value, onChange: _onChange, onClear, ...rest } = props;
  const formValue = XlbForm.useWatch(name);
  const form = XlbForm.useFormInstance();
  return (
    <XlbInput
      ref={ref}
      value={formValue}
      onChangeText={(text: string) => form.setFieldsValue({ [name]: text })}
      onClear={() => {
        onClear?.();
        form.setFieldsValue({ [name]: "" });
      }}
      {...rest}
    />
  );
});
```

## 新增页面路由注册（Module Federation 项目）

本仓库是 Module Federation 架构，新增页面需要 **四仓库联动注册**：

- 远程仓库：`src/config/route.ts` + `src/routes/index.ts`
- Host 仓库：`navigation/fsmsRoute/index.tsx` + `config/fields.ts`
- 路由仓库 v1/v2：`fsms/index.json`

导航时必须用 `FsmsRoutes.Xxx`，不能用裸字符串：

```tsx
import { FsmsRoutes } from "src/config/route";
navigation.navigate(FsmsRoutes.DayReport, { id });
```

> ⚠️ 这是最容易出错的坑。只改 remote app 不够，host app 的 Navigator 中 Screen 是通过 CDN router.json 动态注册的。完整步骤和验证清单见 `references/gotchas/rn-quirks/module-federation-route-registration.md`
