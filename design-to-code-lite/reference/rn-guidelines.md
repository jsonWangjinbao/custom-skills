# React Native 代码生成指南

本文件约束 `04-build.md` 阶段产出的 RN 代码。所有 RN 重构任务必须遵守下列规则。

## 1. 页面骨架

- 页面最外层使用 `XlbPageContainer`。
- 顶部导航使用 `XlbNavbar`，返回按钮、标题按设计稿配置。
- 标题文字使用 `XlbText`，不要直接用 React Native 的 `Text`。

```tsx
import {
  XlbPageContainer,
  XlbNavbar,
  XlbText,
  useAppContext,
} from "@xlb/components-react-native";
import { useNavigation } from "@react-navigation/native";

const MyPage = () => {
  const { theme } = useAppContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<any>();

  return (
    <XlbPageContainer
      header={
        <XlbNavbar
          showBackArrow
          onPressBackArrow={() => navigation.goBack()}
          title={<XlbText bold>{"页面标题"}</XlbText>}
        />
      }
    >
      {/* 内容 */}
    </XlbPageContainer>
  );
};
```

## 2. 主题与样式

- **优先使用 `useAppContext().theme`**：所有色值/背景/边框必须使用 `theme['color-...']` token。
- 当 `theme` token 无法表达时（如项目自定义语义色），可回退到 `@xlb/common/src/config/theme.ts` 的 `colors` / `fonts`。
- **禁止硬编码 hex、magic number**。
- 尺寸使用 `normalize()`（来自 `@xlb/components-react-native`）。
- 样式统一写成 `createStyles(theme)` + `StyleSheet.create`，并在组件内用 `useMemo` 缓存。

```tsx
const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme["color-background-page"],
      paddingHorizontal: normalize(12),
    },
    title: {
      fontSize: normalize(16),
      color: theme["color-text-icon-0"],
    },
  });
```

## 3. 组件库使用清单

| 场景      | 应使用的组件/来源                                                                |
| --------- | -------------------------------------------------------------------------------- |
| 页面容器  | `XlbPageContainer`                                                               |
| 导航栏    | `XlbNavbar`                                                                      |
| 文字      | `XlbText`                                                                        |
| 按钮      | `XlbButton`                                                                      |
| 表单      | `XlbForm`, `XlbForm.Item`, `XlbInput`                                            |
| 弹窗/确认 | `XlbDialog`, `XlbPopup`                                                          |
| 标签      | `XlbTag`                                                                         |
| 卡片      | `XlbCard`                                                                        |
| 列表      | `XlbList`（业务列表）或 `XlbList` from `@xlb/components-react-native-biz-common` |
| Tab       | `XlbTabs`                                                                        |
| 图标      | `XlbIcon` from `@xlb/icon-rn`                                                    |
| 上传      | `XlbUploadFile`                                                                  |
| 权限判断  | `useHasAuth` from `@xlb/common/src/hooks/useHasAuth`                             |
| 网络请求  | `Fsmshttp` from `@xlb/common/src/services/fsmshttp`                              |

禁止直接引入 `antd-mobile-rn` 或自己造基础组件，除非设计稿明确没有对应 XLB 组件。

## 4. 表单安全

- `XlbForm.Item` 的 `name` 必须是**字符串**。
- 动态字段不要传数组 name（如 `name={['list', index, 'key']}`），会触发 Android nativeID 崩溃。
- 对于动态表单项，使用字符串路径或唯一 key，必要时封装 `SafeInput` / `SafeUploadFile` 组件，或遵循项目现有表单安全实践。
- 必须保留表单的 `rules`、`initialValues`、`onFinish`、`onValuesChange` 等已有逻辑。

## 5. 路由与导航

- 新增页面必须在 `src/config/route.ts` 的 `FsmsRouteKeys` 中注册 key。
- 页面间跳转使用 `getRouteName('Fsms', 'YourRouteKey')`：

```tsx
import { getRouteName } from "src/config/route";

navigation.navigate(getRouteName("Fsms", "FoodSafetyCheck"));
```

## 6. 接口与状态

- 接口请求统一通过 `Fsmshttp.post(url, params)` 或项目现有 service 层。
- 不要删除 API 返回字段，尤其是 `id_card_encrypted`、OCR 结果、上传回调字段等。
- 状态管理优先使用页面级 zustand store（`src/pages/<feature>/store.ts`），遵循已有页面模式。

## 7. 禁止清单

- 禁止硬编码 `color`、`fontSize`、`margin`、`padding` 数值。
- 禁止删除已有功能字段、事件、校验、OCR、上传、删除逻辑。
- 禁止为样式合规而牺牲功能。
- 禁止数组 name 的动态表单实现。
- 禁止绕过 `reference/style-scan-checklist.md` 的终检。
