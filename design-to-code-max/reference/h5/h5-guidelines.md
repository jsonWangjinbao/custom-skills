# H5 代码生成规范

> 本规范用于 H5（UmiJS Max v4 + React 18 + TypeScript）项目的代码生成。所有颜色、间距、圆角、字号必须使用 CSS 变量 `var(--xlb-*)`，禁止硬编码 hex、magic number。本文件管"H5 项目特定的组件库和架构约束"；通用 HTML 解析规则见 `reference/common/html-parser-rules.md`。

## 技术栈总览

| 层面     | 技术选型                             | 备注                           |
| -------- | ------------------------------------ | ------------------------------ |
| 框架     | UmiJS Max v4 + React 18 + TypeScript | 约定式路由 + 插件化            |
| 组件库   | `@xlb/components-mobile`             | 移动端 H5 组件，使用指南见下方 |
| 样式方案 | SCSS CSS Modules + PostCSS pxtorem   | `.module.scss` 文件            |
| 状态管理 | Zustand + immer                      | 每个模块独立 store             |
| 路由     | 集中式 `routes.ts` 配置              | `src/config/route.ts`          |
| 导航     | `useXlbRouter` hook                  | 替代 `history.push`            |
| 权限     | `useHasAuth(['module', 'action'])`   | 按钮级控制                     |
| API      | `request()` from `umi`               | 统一请求封装                   |
| 原生桥接 | `NativeBridge.postMessage()`         | RN WebView 通信                |
| 表单     | `XlbProDetail` 声明式 formList       | componentType 驱动             |
| 列表     | `XlbFlatList` 无限滚动               | url + params props             |

## 组件库使用清单

### 页面容器与导航

| 组件               | 用途                                 | 注意                                 |
| ------------------ | ------------------------------------ | ------------------------------------ |
| `ProPageContainer` | 页面级容器，提供统一的布局/安全间距  | 每个页面顶层必须使用                 |
| `XlbNavBar`        | 导航栏组件（标题 + 返回 + 右侧操作） | 作为 ProPageContainer 的 navBar prop |

### 列表与详情

| 组件           | 用途         | 注意                                     |
| -------------- | ------------ | ---------------------------------------- |
| `XlbFlatList`  | 无限滚动列表 | 通过 `url` + `params` props 控制数据加载 |
| `XlbProDetail` | 表单详情容器 | 声明式配置 `formList` 数组               |

### 表单控件

| 组件                | componentType  | 用途                              |
| ------------------- | -------------- | --------------------------------- |
| `XlbForm`           | —              | 表单底层（XlbProDetail 内部使用） |
| `XlbInput`          | `'input'`      | 文本输入                          |
| `XlbSearchBar`      | —              | 搜索栏                            |
| `XlbUpload`         | `'uploadImg'`  | 图片上传                          |
| `XlbDatePicker`     | `'datePicker'` | 日期选择                          |
| `XlbFilter`         | —              | 筛选栏                            |
| `XlbSelectStore`    | —              | 门店选择器                        |
| `XlbCascaderSelect` | `'cascader'`   | 级联选择                          |
| `XlbCheckbox`       | `'checkbox'`   | 多选框                            |
| `XlbRadio`          | `'radio'`      | 单选框                            |
| `XlbTag`            | —              | 标签                              |
| `XlbList`           | —              | 普通列表                          |

### 交互反馈

| 组件                | 用途     | 注意          |
| ------------------- | -------- | ------------- |
| `XlbTabs`           | Tab 切换 | 标签式导航    |
| `XlbButtonGroup`    | 按钮组   | 操作按钮分组  |
| `XlbPopup`          | 弹出层   | 底部/居中弹窗 |
| `XlbDialog`         | 对话框   | 模态确认框    |
| `XlbConfigProvider` | 全局配置 | 包裹根组件    |

### 图标

| 组件      | 用途                                  |
| --------- | ------------------------------------- |
| `XlbIcon` | 图标组件，通过 `type` prop 指定图标名 |

## Styling: SCSS CSS Modules

### 文件命名

每个组件的样式文件命名为 `index.module.scss`，与组件文件 `index.tsx` 同目录。

```scss
// ExamplePage/index.module.scss
.container {
  background-color: var(--xlb-color-bg);
  padding: var(--xlb-space-8);
}
```

### CSS Module 引用

```tsx
// ExamplePage/index.tsx
import styles from "./index.module.scss";

const ExamplePage = () => <div className={styles.container}>...</div>;
```

### PostCSS pxtorem 自动转换

- **rootValue: 75**（设计稿宽度 750px 场景）
- 在 SCSS 中直接写 px 值，PostCSS 自动转换为 rem
- 设计稿 750px 下的 `width: 750px` → 编译后 `width: 10rem`
- 设计稿 750px 下的 `font-size: 28px` → 编译后 `font-size: 0.37333rem`
- **规则**：始终在 SCSS 中写设计稿的原始 px 值，不要手动计算 rem

### Flexbox

- Web/H5 默认 `flex-direction: row`，HTML 中未显式声明的元素不需要额外写
- CSS Module 中 flex 属性使用 CSS 原生写法（`justify-content: space-between`）
- gap 属性现代浏览器全部原生支持，直接使用

### 属性名转换

在 SCSS CSS Module 文件中使用 CSS 原生写法：

| CSS Module      | JSX 内联 style（尽量避免） |
| --------------- | -------------------------- |
| `border-radius` | `borderRadius`             |
| `font-size`     | `fontSize`                 |
| `line-height`   | `lineHeight`               |
| `box-shadow`    | `boxShadow`                |

**规则**：优先使用 CSS Module，避免 JSX 内联 style。

## Colors: CSS Variables 系统

**绝对禁止硬编码 hex 色值。** 所有颜色必须通过 CSS 变量获取。

```scss
// ✅ 正确
.button {
  background-color: var(--xlb-color-primary-brand);
  color: var(--xlb-color-background-frame);
  border: 1px solid var(--xlb-color-line-2);
}

// ❌ 错误
.button {
  background-color: #1a6aff;
  color: #ffffff;
  border: 1px solid #e5e6eb;
}
```

### 常用 CSS 变量

| CSS 变量                            | 用途          | 对应 RN theme key             |
| ----------------------------------- | ------------- | ----------------------------- |
| `var(--xlb-color-bg)`               | 页面/卡片背景 | `color-background-frame`      |
| `var(--xlb-color-bg-page)`          | 页面灰底      | `color-background-page`       |
| `var(--xlb-color-primary-brand)`    | 品牌色/按钮   | `color-primary-brand`         |
| `var(--xlb-color-text-primary)`     | 标题/正文     | `color-text-icon-0`           |
| `var(--xlb-color-text-secondary)`   | 二级文字      | `color-text-icon-1`           |
| `var(--xlb-color-text-tertiary)`    | 三级文字      | `color-text-icon-2`           |
| `var(--xlb-color-text-placeholder)` | 占位文字      | `color-text-icon-3`           |
| `var(--xlb-color-function-error)`   | 错误色        | `color-function-error-main`   |
| `var(--xlb-color-function-warning)` | 警告色        | `color-function-warning-main` |
| `var(--xlb-color-border)`           | 边框/分割线   | `color-line-2`                |
| `var(--xlb-color-primary-bright)`   | 蓝色浅背景    | `color-primary-bright`        |

### 间距 CSS 变量

| CSS 变量              | 值   | 对应 SPACE |
| --------------------- | ---- | ---------- |
| `var(--xlb-space-4)`  | 4px  | SPACE_1    |
| `var(--xlb-space-8)`  | 8px  | SPACE_2    |
| `var(--xlb-space-12)` | 12px | SPACE_3    |
| `var(--xlb-space-16)` | 16px | SPACE_4    |
| `var(--xlb-space-20)` | 20px | SPACE_5    |
| `var(--xlb-space-24)` | 24px | SPACE_6    |
| `var(--xlb-space-32)` | 32px | SPACE_8    |
| `var(--xlb-space-48)` | 48px | SPACE_12   |

### 字号 CSS 变量

| CSS 变量                 | 值   | 对应 FONT |
| ------------------------ | ---- | --------- |
| `var(--xlb-fontSize-12)` | 12px | SIZE_12   |
| `var(--xlb-fontSize-14)` | 14px | SIZE_14   |
| `var(--xlb-fontSize-16)` | 16px | SIZE_16   |
| `var(--xlb-fontSize-18)` | 18px | SIZE_18   |
| `var(--xlb-fontSize-20)` | 20px | SIZE_20   |
| `var(--xlb-fontSize-24)` | 24px | SIZE_24   |

### 圆角 CSS 变量

| CSS 变量                     | 值  | 对应 BORDER |
| ---------------------------- | --- | ----------- |
| `var(--xlb-border-radius-2)` | 2px | RADIUS_2    |
| `var(--xlb-border-radius-4)` | 4px | RADIUS_4    |
| `var(--xlb-border-radius-8)` | 8px | RADIUS_8    |

### 行高 CSS 变量

| CSS 变量                   | 值   |
| -------------------------- | ---- |
| `var(--xlb-lineHeight-20)` | 20px |
| `var(--xlb-lineHeight-22)` | 22px |
| `var(--xlb-lineHeight-24)` | 24px |

## Box-shadow

直接使用 CSS `box-shadow`，颜色应使用 CSS 变量：

```scss
.card {
  box-shadow: 0 2px 8px 0 var(--xlb-shadow-color, rgba(0, 0, 0, 0.08));
}
```

## 字体

```scss
font-family:
  "PingFang SC",
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  sans-serif;
```

始终加系统字体 fallback。

## 页面模式

### 列表页面模式

```tsx
// pages/xxx/index.tsx
import {
  ProPageContainer,
  XlbNavBar,
  XlbFlatList,
} from "@xlb/components-mobile";
import { useXlbRouter } from "@/hooks";

const ListPage = () => {
  const router = useXlbRouter();

  return (
    <ProPageContainer navBar={<XlbNavBar title="页面标题" />}>
      <XlbFlatList
        url="/api/xxx/page"
        params={
          {
            /* 搜索参数 */
          }
        }
        renderItem={({ item }) => <div>{item.name}</div>}
      />
    </ProPageContainer>
  );
};
```

### 表单/详情页面模式

```tsx
// pages/xxx/index.tsx
import {
  ProPageContainer,
  XlbNavBar,
  XlbProDetail,
} from "@xlb/components-mobile";
import { useXlbRouter } from "@/hooks";

const FormPage = () => {
  const router = useXlbRouter();
  const [form] = XlbProDetail.useForm();

  const formList = [
    {
      label: "企业名称",
      name: "name",
      componentType: "input",
      rules: [{ required: true, message: "请输入企业名称" }],
    },
    {
      label: "有效期",
      name: "validDate",
      componentType: "datePicker",
      extraProps: { picker: "date" },
    },
  ];

  const handleSubmit = async () => {
    try {
      const values = await form.getFieldsValue(true);
      // expand array values if needed
      const res = await request("/api/xxx/save", { data: values });
      if (res.code === 0) {
        Toast.show({ content: "保存成功" });
        router.goBack();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <ProPageContainer navBar={<XlbNavBar title="详情页面" />}>
      <XlbProDetail form={form} formList={formList} />
      <button onClick={handleSubmit}>提交</button>
    </ProPageContainer>
  );
};
```

### formList componentType 对照表

| componentType  | 渲染组件          | 适用场景 |
| -------------- | ----------------- | -------- |
| `'input'`      | XlbInput          | 文本输入 |
| `'datePicker'` | XlbDatePicker     | 日期选择 |
| `'uploadImg'`  | XlbUpload         | 图片上传 |
| `'radio'`      | XlbRadio          | 单选     |
| `'checkbox'`   | XlbCheckbox       | 多选     |
| `'cascader'`   | XlbCascaderSelect | 级联选择 |
| `'select'`     | 下拉选择器        | 下拉选择 |
| `'textArea'`   | 文本域            | 多行文本 |
| `'switch'`     | 开关              | 开关切换 |

## 导航: useXlbRouter 规则

**禁止直接使用 `history.push` 或 `history.replace`。** 必须使用 `useXlbRouter` hook。

```tsx
import { useXlbRouter } from "@/hooks";

const Comp = () => {
  const router = useXlbRouter();

  // 跳转
  router.push("/path/to/page", { id: 123 });

  // 返回
  router.goBack();

  // 替换
  router.replace("/path/to/page", { id: 456 });

  // 获取当前路由参数
  const { query } = router;
  const id = query?.id;
};
```

## 路由: centralized routes.ts

所有页面路由在 `src/config/route.ts` 中集中配置：

```typescript
// 示例: routes.ts 配置片段
export const routes = [
  {
    path: "/cert-approve",
    name: "企业认证",
    component: "@/pages/cert-approve",
  },
  // ...
];
```

重构项目中新增页面必须在 `src/config/route.ts` 的 `FsmsRouteKeys` 中注册 key，跳转使用对应的路由 key 而非硬编码路径。

## 权限: useHasAuth

```tsx
import { useHasAuth } from "@/hooks";

const Comp = () => {
  const canEdit = useHasAuth(["certificate", "edit"]);

  return <div>{canEdit && <button>编辑</button>}</div>;
};
```

## API: request() from umi

```tsx
import { request } from "umi";

const res = await request("/api/xxx/page", {
  method: "POST",
  data: { page: 1, size: 20 },
});
```

### 响应结构

```typescript
interface ApiResponse<T> {
  code: number; // 0 表示成功
  data: T; // 响应数据
  message: string; // 错误信息
}
```

**响应处理规则**:

```tsx
const res = await request("/api/xxx/save", { data: formData });
if (res.code === 0) {
  // 成功处理
  Toast.show({ content: "操作成功" });
} else {
  // 失败处理
  Toast.show({ content: res.message || "操作失败" });
}
```

## NativeBridge: RN WebView 通信

当 H5 页面运行在 RN WebView 中时，通过 `NativeBridge.postMessage()` 与原生通信：

```tsx
// 向 RN 原生层发送消息
NativeBridge.postMessage({
  type: "navTo",
  payload: { path: "/some-page", params: { id: 123 } },
});

// 监听 RN 原生层消息
NativeBridge.onMessage((event) => {
  const { type, payload } = event.data;
  // 处理消息
});
```

## 文件组织

每个功能特性 = 一个目录，包含以下文件：

```
feature-name/
├── index.tsx      # 页面/组件主文件
├── index.scss     # 样式文件（CSS Module）
├── store.ts       # Zustand store（状态管理）
├── server.ts      # API 接口封装
└── config.tsx     # 常量/配置（formList、options 等）
```

如果某个文件无需独立存在（如 store 无状态），可以合并到 `index.tsx`。

## Zustand Store 模式

```tsx
// store.ts
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface CertStore {
  loading: boolean;
  formData: Record<string, any>;
  setLoading: (v: boolean) => void;
  setFormData: (data: Record<string, any>) => void;
}

export const useCertStore = create<CertStore>()(
  immer((set) => ({
    loading: false,
    formData: {},
    setLoading: (v) =>
      set((state) => {
        state.loading = v;
      }),
    setFormData: (data) =>
      set((state) => {
        state.formData = data;
      }),
  })),
);
```

## Enum / 常量模式

```tsx
// config.tsx
// let 用于可变 option 数组（可能根据权限动态过滤）
export let certificateTypes = [
  { label: "营业执照", value: "business_license" },
  { label: "食品经营许可证", value: "food_license" },
];

// const 用于不可变常量
export const FORM_LAYOUT = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};
```

## 表单提交模式

```tsx
const handleSubmit = async () => {
  try {
    // 1. 获取并校验表单值
    const values = await form.getFieldsValue(true);

    // 2. 展开数组值（如动态列表的 detail_infos）
    const payload = {
      ...values,
      detail_infos: values.detail_infos?.map((item: any) => ({
        ...item,
      })),
    };

    // 3. 调用 API
    const res = await request("/api/xxx/save", { data: payload });

    // 4. 判断响应
    if (res.code === 0) {
      Toast.show({ content: "保存成功" });
      router.goBack();
    } else {
      Toast.show({ content: res.message || "操作失败" });
    }
  } catch (err) {
    // 表单校验失败或网络错误
    console.error("submit error", err);
  }
};
```

## 错误处理

```tsx
try {
  const res = await request(url, options);
  if (res.code === 0) {
    // 成功
  } else {
    // 业务错误
  }
} catch (error) {
  // 网络/运行时错误
}
```

## 自定义 Hooks

| Hook                 | 用途              |
| -------------------- | ----------------- |
| `useXlbRouter`       | 统一路由导航      |
| `useHasAuth`         | 按钮级权限检查    |
| `useSensitiveReveal` | 敏感信息脱敏/显示 |

## Design-to-Code 设计稿映射规则

### 750px 设计稿 → px → rem

1. 设计稿按 750px 宽度设计
2. 在 SCSS 中直接使用设计稿的 px 值（如 `width: 750px`, `font-size: 28px`, `height: 48px`）
3. PostCSS pxtorem 插件自动将 px 转换为 rem，rootValue 为 75
4. **规则**：永远在 SCSS 中写设计稿原始 px 值，不要手动计算 rem

### HTML 设计稿 → CSS Module

| HTML 元素                    | SCSS CSS Module                                 |
| ---------------------------- | ----------------------------------------------- |
| `<div>`                      | `.class { display: flex; }`                     |
| `<span>`                     | `.class { }`（或直接内联 `<span>`）             |
| `<p>`                        | `.class { font-size: var(--xlb-fontSize-14); }` |
| `<img>`                      | `.class { width: 200px; height: 200px; }`       |
| `style="color: #333"`        | `color: var(--xlb-color-text-primary)`          |
| `style="font-size: 14px"`    | `font-size: var(--xlb-fontSize-14)`             |
| `style="padding: 16px"`      | `padding: var(--xlb-space-16)`                  |
| `style="border-radius: 8px"` | `border-radius: var(--xlb-border-radius-8)`     |

## 禁止行为

- ❌ 写死 `#1A6AFF`、`#333`、`#fff` 等 hex 色值
- ❌ 写死 `padding: 12px`、`border-radius: 8px`、`font-size: 14px` 等 magic number（必须使用 CSS 变量）
- ❌ 用 emoji 或文字符号代替图标
- ❌ 直接使用 `history.push` / `history.replace`（必须用 `useXlbRouter`）
- ❌ 在 `XlbProDetail` 的 `formList` 外手动管理表单控件
- ❌ 使用 `FlatList` 或其他列表组件代替 `XlbFlatList`
- ❌ 在样式值中手动计算 rem（PostCSS 自动完成）
- ❌ 跨平台引用（H5 流水线只能引用 `reference/h5/` 的规则）

## 样式引用清单

三要素的 CSS 变量映射优先级：

| 要素          | CSS 变量                     | 回退                          |
| ------------- | ---------------------------- | ----------------------------- |
| color         | `var(--xlb-color-*)`         | 使用语义最接近的现有变量      |
| fontSize      | `var(--xlb-fontSize-*)`      | 使用最接近的字体大小变量      |
| space/padding | `var(--xlb-space-*)`         | 使用最接近的间距变量          |
| borderRadius  | `var(--xlb-border-radius-*)` | 使用最接近的圆角变量          |
| lineHeight    | `var(--xlb-lineHeight-*)`    | 使用最接近的行高变量          |
| boxShadow     | `box-shadow` + CSS 变量      | 使用设计稿原始值 + 变量化颜色 |
