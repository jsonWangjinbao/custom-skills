---
verifiedVersion: "@xlb/components-mobile@1.0.396"
verifiedAt: "2026-07-23"
---
# XlbIcon name 错误导致图标渲染为空

## 现象

代码里写了 `<XlbIcon name="icon_search" />`，运行后图标不显示，控制台出现 warn 或错误，组件渲染为 `null`。

## 原因

`@xlb/icon-rn` 的 `iconfontGlyphMap` 中的 key 是 `Search`、`Add`、`Close`、`a-OutlineRight` 等，**没有** `icon_search`、`icon_add`、`icon_close` 这种带 `icon_` 前缀的写法。

`XlbIcon` 内部通过 `getIconComponent(name)` 查找：

```ts
export const getIconComponent = (name: IconfontGlyphMapType) => {
  const componentName = iconfontGlyphMap[name];
  return componentName ? (Icons as any)[componentName] : null;
};
```

当 `name` 不在 `iconfontGlyphMap` 中时，返回 `null`，图标自然渲染为空。

## 正确示例

```tsx
import { XlbIcon } from "@xlb/icon-rn";
import { SPACE } from "@xlb/components-react-native";

// ✅ 正确：name 与 iconfontGlyphMap key 完全一致
<XlbIcon
  name="Search"
  size={SPACE.SPACE_16}
  color={theme["color-text-icon-1"]}
/>;

// ❌ 错误：带 icon_ 前缀，找不到对应组件
<XlbIcon name="icon_search" size={16} color="#5C6070" />;
```

## 排查步骤

1. 找到代码中所有 `<XlbIcon` 的使用位置
2. 打开 `node_modules/@xlb/icon-rn/src/stories/icons/index.ts`
3. 搜索 `iconfontGlyphMap`，确认 `name` 是否在 key 列表中
4. 若不存在，到 `reference/rn/icon-map.md` 查找语义最接近的 key
5. 若仍找不到，按「图标缺失」流程处理，不要编造 name

## 常见错误对照

| 错误写法               | 正确写法                |
| ---------------------- | ----------------------- |
| `name="icon_search"`   | `name="Search"`         |
| `name="icon_add"`      | `name="Add"`            |
| `name="icon_close"`    | `name="Close"`          |
| `name="icon_back"`     | `name="Back"`           |
| `name="icon_right"`    | `name="a-OutlineRight"` |
| `name="icon_check"`    | `name="Check"`          |
| `name="icon_delete"`   | `name="Delete"`         |
| `name="icon_edit"`     | `name="Edit"`           |
| `name="icon_time"`     | `name="Time"`           |
| `name="icon_location"` | `name="Location"`       |

## 预防

- 写 `XlbIcon` 时同时打开 `iconfontGlyphMap` 对照
- 不要凭直觉写 `icon_xxx`
- 优先使用 `reference/rn/icon-map.md` 查询语义映射
- 样式合规扫描时，用 `Grep` 搜索 `name="icon_` / `name='icon_` / `name={"icon_` 等模式
