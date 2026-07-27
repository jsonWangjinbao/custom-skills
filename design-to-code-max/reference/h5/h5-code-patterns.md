# H5 代码模式参考

> 本文件包含 H5 平台 build 阶段 Step 4 的代码脚手架模板和文件结构规则。
> 由 `subskills/h5/03-build.md` 的 `### 2. 读取规范` 步骤引用。

---

## 文件结构

每个功能特性目录包含 5 个标准文件：

| 文件         | 说明                        | 必选          |
| ------------ | --------------------------- | ------------- |
| `index.tsx`  | 页面/组件主文件             | 是            |
| `index.scss` | CSS Module 样式文件         | 是            |
| `store.ts`   | Zustand store（页面级状态） | 按需          |
| `server.ts`  | API 接口封装                | 有 API 则必选 |
| `config.tsx` | 常量/配置/formList 定义     | 按需          |

## formList 配置模式

```tsx
// config.tsx
export const formList = [
  { label: "企业名称", name: "name", componentType: "input", rules: [{ required: true, message: "请输入企业名称" }] },
  { label: "有效期", name: "validDate", componentType: "datePicker", extraProps: { picker: "date" } },
  { label: "证件照片", name: "images", componentType: "uploadImg", extraProps: { maxCount: 5 } },
];
```

## XlbFlatList 配置模式

```tsx
<XlbFlatList
  url="/api/xxx/page"
  params={{ status: "active" }}
  renderItem={({ item }) => <CellItem data={item} />}
  emptyText="暂无数据"
/>
```

## API 调用模式

```tsx
import { request } from "umi";

const res = await request("/api/xxx/page", { method: "POST", data: params });
if (res.code === 0) {
  // 处理数据
}
```

## 样式生成规则

px 通过 PostCSS pxtorem（rootValue: 75）自动转换为 rem，不要手动计算 rem。

```scss
// index.scss
.container {
  background-color: var(--xlb-color-bg);
  padding: var(--xlb-space-16);
  border-radius: var(--xlb-border-radius-8);
  font-size: var(--xlb-fontSize-14);

  .title {
    color: var(--xlb-color-text-primary);
    line-height: var(--xlb-lineHeight-22);
  }
}
```

> 颜色、字号、间距、圆角必须使用 `var(--xlb-*)` CSS 变量，禁止直接写 hex 或 px 数值。
> 无对应 CSS 变量的尺寸值可直接写设计稿 750px 下的 px 值。

## 表单提交流程

```tsx
const handleSubmit = async () => {
  try {
    const values = await form.getFieldsValue(true);
    const res = await request("/api/xxx/save", { data: values });
    if (res.code === 0) {
      Toast.show({ content: "保存成功" });
      router.goBack();
    } else {
      Toast.show({ content: res.message || "操作失败" });
    }
  } catch (err) {
    console.error("submit error", err);
  }
};
```
