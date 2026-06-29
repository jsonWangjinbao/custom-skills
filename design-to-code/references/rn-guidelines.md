# React Native 样式生成规范

## 主题色（最高优先级）

**绝对禁止硬编码 hex 色值。** 所有颜色必须通过主题系统获取。

### 样式工厂模式

```tsx
import { useThemeColor } from '<相对路径>/hooks/useThemeColor';

// 模块级：工厂函数
const createStyles = (getColor: (k: string) => string) =>
  StyleSheet.create({
    title: { color: getColor('color-text-icon-0') },
    button: { backgroundColor: getColor('color-primary-brand') },
    divider: { backgroundColor: getColor('color-line-2') },
  });

// 组件内：useMemo 缓存
const MyComponent = () => {
  const { getColor } = useThemeColor();
  const styles = useMemo(() => createStyles(getColor), [getColor]);
  // 内联动态色直接调用 getColor
  return <XlbIcon color={getColor('color-primary-brand')} />;
};
```

### 共享样式

如果存在 `sharedStyles`，同样改为工厂函数模式：
```tsx
// components/shared/sharedStyles.ts
export function createSharedStyles(getColor: (k: string) => string) {
  return StyleSheet.create({ ... });
}
```

### 常用主题 key

| hex 原值 | 主题 key | 用途 |
|----------|----------|------|
| `#111425` | `color-text-icon-0` | 标题、正文 |
| `#434955` | `color-text-icon-1` | 二级文字 |
| `#6E7B8C` | `color-text-icon-2` | 三级文字 |
| `#C9CDD4` | `color-text-icon-3` | placeholder |
| `#0080FF` | `color-primary-brand` | 品牌蓝、按钮 |
| `#FF3B52` | `color-function-error-main` | 错误红 |
| `#FF5C00` | `color-function-warning-main` | 警告橙 |
| `#FFFFFF` | `color-background-frame` | 卡片白底 |
| `#F4F5F7` | `color-background-page` | 页面灰底 |
| `#F8F9FA` | `color-background-module` | 模块灰底 |
| `#E5E6EB` | `color-line-2` | 分割线 |

> 完整映射 → `references/token-map.json`

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

## 图片引用

- `<img src="./asset/icons/foo.svg">` → `const FooIcon = require('./asset/icons/foo.svg')` 或 `<Image source={require('./asset/icons/foo.svg')} />`
- SVG 资源在 RN 中需要 `react-native-svg` 库支持；生成代码时使用 `<Image>` 组件并注释提示 SVG 处理方式

## gap 兼容性

RN 0.71+ 原生支持 gap，但为兼容旧版：

```js
// 优先使用 gap（简洁）
container: { gap: 8 }

// 降级方案（兼容 < 0.71）
container: {},
child: { marginTop: 8 },  // column 方向，非首子元素
```

**规则：** 生成代码中使用 gap，在 DESIGN-REVIEW.md 中标注"依赖 RN 0.71+"。

## 字体处理

- iOS：`PingFang SC` 系统原生支持
- Android：`PingFang SC` 默认不可用
- **规则：** 保留设计稿字体名 `fontFamily: 'PingFang SC'`，在 DESIGN-REVIEW.md 中标注"Android 需配置自定义字体或替换为系统字体"

## 单位处理

- HTML 的 px 值在 RN 中为逻辑像素，直接去掉 `px` 后缀
- `width: 375px` → `width: 375`
- `font-size: 14px` → `fontSize: 14`
- `line-height: 20px` → `lineHeight: 20`

## 属性名转换（全部 camelCase）

| CSS（HTML） | RN StyleSheet |
|-------------|---------------|
| `background` | `backgroundColor` |
| `border-radius` | `borderRadius` |
| `border-bottom-right-radius` | `borderBottomRightRadius` |
| `padding-top` | `paddingTop` |
| `font-size` | `fontSize` |
| `font-weight` | `fontWeight` |
| `font-family` | `fontFamily` |
| `line-height` | `lineHeight` |
| `text-align` | `textAlign` |
| `box-shadow` | `shadowColor` + `shadowOffset` + `shadowOpacity` + `shadowRadius` |
| `z-index` | `zIndex` |

## 特殊属性处理

| CSS 值 | RN 处理 |
|--------|---------|
| `flex: none` | 不写 flex 属性（或用 `flex: 0`） |
| `position: relative` | 默认值，不写 |
| `position: absolute` | `position: 'absolute'` |
| `overflow: hidden` | `overflow: 'hidden'` |
| `display: flex` | 默认，不写 |

## 组件映射

| HTML 元素 | RN 组件 |
|-----------|---------|
| `<div>` | `<View>` |
| `<span>` | `<Text>` |
| `<p>` | `<Text>` |
| `<img>` | `<Image source={...} />` |
| 包含文本的 `<div>` | `<Text>` |

## fontFamily 显式传递

`XlbText` 内置 fontFamily 注入，但 `<Text>` 和 `<XlbInput>` 底层使用系统默认字体。
- 所有 `<Text>` → `style={{ fontFamily }}`
- 所有 `<XlbInput>` → 通过 `style` 或 `SafeInput`/`ClearableInput` 注入
- 从 `useAppContext()` 解构 `{ fontFamily }`

## SafeInput / ClearableInput 包装模式

### SafeInput（防止 Android nativeID 崩溃）
数组 `name` 生成的 `id` 传到原生 Android TextInput 映射为 `nativeID`，Android 期望 String 收到 Array 崩溃。

```tsx
const SafeInput = forwardRef((props: any, ref: any) => {
  const { id, ...rest } = props;
  return <XlbInput ref={ref} {...rest} />;
});
```

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
      onClear={() => { onClear?.(); form.setFieldsValue({ [name]: '' }); }}
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
import {FsmsRoutes} from 'src/config/route';
navigation.navigate(FsmsRoutes.DayReport, { id });
```

> ⚠️ 这是最容易出错的坑。只改 remote app 不够，host app 的 Navigator 中 Screen 是通过 CDN router.json 动态注册的。完整步骤和验证清单见 `gotchas/rn-quirks/module-federation-route-registration.md`
