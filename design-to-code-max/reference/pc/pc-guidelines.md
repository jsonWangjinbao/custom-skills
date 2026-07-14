# PC 代码生成规范

> 本规范用于 PC 端 Web 项目的代码生成。以项目现有模式为最高优先级，遵循已有代码约定。
> 基于 fsms_web 项目技术栈和实践总结。

## 技术栈

- **框架**: UmiJS Max v4 + TypeScript
- **组件库**: `@xlb/components`（基于 Ant Design 5 封装）
- **样式方案**: Less CSS Modules + Tailwind CSS（`preflight: false`）
- **状态管理**: Zustand + immer（页面级 store）
- **路由**: 集中式 `routeList` + `KeepAlive` + `wrappers`
- **API**: `XlbFetch.post(url, data)` 请求
- **构建工具**: UmiJS 内置（Webpack / Rspack）

## 组件库使用清单

### 页面容器组件

| 组件 | 用途 | 说明 |
|------|------|------|
| `XlbPageContainer` | 标准列表页 | Mode A: SearchForm + ToolBtn + Table + ProPageModal |
| `XlbProPageContainer` | 集成 CRUD 页 | Mode B: 搜索 + 表格 + 详情 + 新增 + 编辑 + 删除 + 导出 |

### 表单组件

| 组件 | 用途 |
|------|------|
| `XlbBasicForm` | 声明式基础表单（htmlForm），配合 `XlbBasicForm.Item` |
| `XlbForm` | 配置式表单（formList/SearchFormType 数组定义字段） |
| `XlbInput` | 输入框 |
| `XlbSelect` | 下拉选择 |
| `XlbDatePicker` | 日期选择器 |
| `XlbBaseUpload` | 文件上传 |
| `XlbInputDialog` | 输入弹窗（选择类字段弹窗） |

### 操作与反馈组件

| 组件 | 用途 |
|------|------|
| `XlbButton` | 按钮，通过 `XlbButton.Group` 组合 |
| `XlbDropdownButton` | 下拉按钮（导出等复合操作） |
| `XlbModal` | 通用弹窗 |
| `XlbTipsModal` | 确认提示弹窗（含类型：confirm / tips / error / success / warning） |
| `XlbDrawer` | 抽屉 |
| `XlbProPageModal` | ProPageContainer 的弹窗包装 |
| `XlbMessage` | 消息提示 |
| `XlbTooltip` | 文字提示 |
| `XlbAlert` | 警告提示 |
| `XlbEmpty` | 空状态 |
| `XlbBlueBar` | 蓝色顶栏提示条 |
| `XlbIcon` | 图标 |

## 三种页面模式

### Mode A: XlbPageContainer（标准列表页）

结构：`XlbPageContainer` 包裹 SearchForm + ToolBtn + Table + ProPageModal

```tsx
<XlbPageContainer>
  {/* 搜索表单区域 */}
  <XlbForm formList={searchFormList} />

  {/* 工具栏按钮 */}
  <XlbButton.Group>
    <XlbButton type="primary" onClick={handleAdd}>新增</XlbButton>
  </XlbButton.Group>

  {/* 数据表格 */}
  <XlbTable columns={columns} dataSource={list} />

  {/* 新增/编辑弹窗 */}
  <ProPageModal>
    <XlbBasicForm>
      <XlbBasicForm.Item name="name" label="名称">
        <XlbInput />
      </XlbBasicForm.Item>
    </XlbBasicForm>
  </ProPageModal>
</XlbPageContainer>
```

### Mode B: XlbProPageContainer（集成 CRUD 页面）

通过配置实现搜索 + 表格 + 详情 + 新增 + 编辑 + 删除 + 导出一体化：

```tsx
<XlbProPageContainer
  searchFormList={searchFormList}
  operateBtnList={operateBtnList}
  columns={columns}
  request={fetchList}
/>
```

### Mode C: Dashboard（自定义布局）

自定义布局 + 子组件分区，无固定模式约束。每个模块独立封装子组件。

## 样式方案

### Less CSS Modules

- 使用 `index.less` 文件配合 CSS Modules
- 属性名使用 CSS 原生写法：`border-radius`，`font-size`
- 颜色值使用 Less 变量，禁止硬编码 hex

```less
// index.less
.container {
  background-color: @color_link;
  border-radius: 4px;
  padding: 16px;
}
```

### Tailwind（preflight: false）

- 辅助类，不覆盖用户代理样式
- 用于快速布局和间距调整

### Less 变量（颜色）

| 变量名 | 语义 |
|--------|------|
| `@color_link` | 链接/主色 |
| `@color_danger` | 危险 |
| `@color_warning` | 警告 |
| `@color_success` | 成功 |
| `@color_invalid` | 无效 |
| `@color_init` | 初始 |

### 全局 CSS 类名

| 类名 | 用途 |
|------|------|
| `.link` | 链接样式的文本 |
| `.danger` | 危险状态的文本/标签 |
| `.success` | 成功状态的文本/标签 |
| `.warning` | 警告状态的文本/标签 |
| `.cursors` | 指针样式 |
| `.row-flex` | 水平 flex 布局容器 |
| `.col-flex` | 垂直 flex 布局容器 |

## 表单模式

### XlbForm（配置式，搜索表单）

通过 `formList` prop 传入 `SearchFormType[]` 数组定义搜索字段：

```tsx
const searchFormList: SearchFormType[] = [
  {
    label: '名称',
    name: 'name',
    type: 'input',
    placeholder: '请输入名称',
  },
  {
    label: '状态',
    name: 'status',
    type: 'select',
    placeholder: '请选择状态',
    options: statusOptions,
  },
];
```

### XlbBasicForm（声明式，详情/编辑表单）

使用 `XlbBasicForm.Item` + CSS Grid 三列布局：

```tsx
<XlbBasicForm>
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
    <XlbBasicForm.Item name="name" label="名称">
      <XlbInput />
    </XlbBasicForm.Item>
    <XlbBasicForm.Item name="status" label="状态">
      <XlbSelect options={statusOptions} />
    </XlbBasicForm.Item>
  </div>
</XlbBasicForm>
```

### ProFormDependency

用于跨字段联动：

```tsx
<ProFormDependency name={['type']}>
  {({ type }) => {
    if (type === 'custom') {
      return <XlbBasicForm.Item name="customValue" label="自定义值"><XlbInput /></XlbBasicForm.Item>;
    }
    return null;
  }}
</ProFormDependency>
```

## 表格定义

### XlbTable + XlbTableColumnProps

```tsx
const columns: XlbTableColumnProps[] = [
  {
    name: '名称',       // 表头显示文本
    code: 'name',       // 数据字段 key
    width: 200,         // 列宽
    render: (val, record) => <span className="link">{val}</span>,
    features: {
      sortable: true,   // 可排序
      details: true,    // 可查看详情
      format: 'date',   // 格式化类型
      autoRowSpan: true,// 自动合并行
    },
  },
];
```

### 状态列渲染

使用 `StatusColorByOptions` 渲染状态：

```tsx
{
  name: '状态',
  code: 'status',
  render: (val) => (
    <StatusColorByOptions
      value={val}
      options={[
        { label: '启用', value: 1, color: '@color_success' },
        { label: '禁用', value: 0, color: '@color_danger' },
      ]}
    />
  ),
}
```

### 操作列

```tsx
{
  name: '操作',
  code: 'action',
  width: 200,
  render: (_, record) => (
    <XlbButton.Group>
      {hasAuth(['module', 'edit']) && (
        <XlbButton type="link" onClick={() => handleEdit(record)}>编辑</XlbButton>
      )}
      {hasAuth(['module', 'delete']) && (
        <XlbButton type="link" danger onClick={() => handleDelete(record)}>删除</XlbButton>
      )}
    </XlbButton.Group>
  ),
}
```

## API 调用

### XlbFetch.post

```tsx
import { XlbFetch } from '@xlb/components';

const res = await XlbFetch.post('/api/list', { page: 1, size: 20 });
if (res?.code === 0) {
  // 成功处理
  setList(res?.data?.list || []);
}
```

- 统一使用 `XlbFetch.post(url, data)`
- 响应结构：`{ code: number, data: any, message?: string }`
- 成功判断：`res?.code === 0`
- 服务器 URL 前缀：`process.env.BASE_URL`

## 路由

### 集中式 routeList

```tsx
// src/config/route.ts
import { FsmsRouteKeys } from 'xlb-max';

export const routeList = [
  {
    name: '页面名称',
    path: '/path/to/page',
    component: '@/pages/your-page',
    wrappers: ['@/wrappers/auth'],   // 权限 wrapper
    keepAlive: true,                  // 保活
    subMenu: 'fsmsStore',            // 子菜单归属
  },
];
```

### 导航

```tsx
import { useNavigation } from '@xlb/max';
// 或
import { useIRouter } from '@xlb/max';

const router = useIRouter();
router.push('/path/to/page');
```

或通过 `history.location.state` 传参：

```tsx
// 跳转
router.push(`/path/to/page?id=${record.id}`, { extra: record });

// 接收
const { id } = history.location.query;
const state = history.location.state;
```

## 权限

```tsx
import { hasAuth } from '@xlb/max';

// hasAuth(['module', 'action', 'app_type'])
if (hasAuth(['store', 'create'])) {
  // 有权限
}
```

- 按钮级权限控制：使用 `hasAuth` 包裹
- 路由级权限控制：通过 `wrappers` 配置

## Modal 模式

### NiceModal + fsmsModal

```tsx
import NiceModal from '@ebay/nice-modal-react';
import { fsmsModal } from '@xlb/components';

const modal = NiceModal.create('modal-name', () => {
  const modal = NiceModal.useModal();
  return (
    <XlbModal
      title="标题"
      visible={modal.visible}
      onOk={handleSubmit}
      onCancel={() => modal.hide()}
    >
      {/* 弹窗内容 */}
    </XlbModal>
  );
});

// 打开
NiceModal.show('modal-name', { id: record.id });
```

### ProPageModal（XlbProPageModal 包装）

```tsx
<ProPageModal title="新增">
  <XlbBasicForm>
    {/* 表单字段 */}
  </XlbBasicForm>
</ProPageModal>
```

## Service 文件

### server.ts（默认导出对象）

```ts
// server.ts
const server = {
  fetchList: (params) => XlbFetch.post('/api/list', params),
  createItem: (params) => XlbFetch.post('/api/create', params),
  updateItem: (params) => XlbFetch.post('/api/update', params),
  deleteItem: (params) => XlbFetch.post('/api/delete', params),
};

export default server;
```

### service.tsx（具名导出）

```tsx
// service.tsx
export const fetchList = (params) => XlbFetch.post('/api/list', params);
export const createItem = (params) => XlbFetch.post('/api/create', params);
```

## ConfigProvider

```tsx
import { XlbConfigProvider } from '@xlb/components';

<XlbConfigProvider.Provider
  globalFetch={XlbFetch}
  fieldList={fieldList}
  config={appConfig}
>
  <App />
</XlbConfigProvider.Provider>
```

## 表单字段类型

| 类型 | 组件 | 说明 |
|------|------|------|
| `compactDatePicker` | XlbDatePicker | 紧凑日期选择器 |
| `select` | XlbSelect | 下拉选择 |
| `input` | XlbInput | 文本输入 |
| `inputDialog` | XlbInputDialog | 输入弹窗选择 |
| `treeModalConfig` | 树形弹窗 | 树形选择弹窗 |

## 编辑日志 Modal 模式

```tsx
const showEditLog = (record) => {
  NiceModal.show('edit-log-modal', { id: record.id });
};
```

## 文件架构

### 页面文件结构

```
src/pages/your-page/
├── index.tsx      // 页面入口（XlbPageContainer / XlbProPageContainer）
├── data.tsx       // 列定义、搜索表单配置、枚举等数据
├── server.ts      // API 定义
├── item.tsx       // 新增/编辑弹窗表单
└── index.less     // 页面样式
```

### 子菜单 keys

```
fsmsStore      — 门店管理
fsmsScm        — 供应链
fsmsArchives   — 档案
fsmsData       — 数据
fsmsWms        — 仓库
systemCompliance — 系统合规
```

## 表格列渲染模式

### 链接列

```tsx
{
  name: '名称',
  code: 'name',
  render: (val, record) => (
    <span className="link" onClick={() => handleDetail(record)}>{val}</span>
  ),
}
```

### 状态颜色列

```tsx
{
  name: '状态',
  code: 'status',
  render: (val) => (
    <StatusColorByOptions value={val} options={statusColorOptions} />
  ),
}
```

### 操作列

```tsx
{
  name: '操作',
  code: 'action',
  width: 200,
  render: (_, record) => (
    <XlbButton.Group>
      <XlbButton type="link" onClick={() => handleEdit(record)}>编辑</XlbButton>
      <XlbButton type="link" danger onClick={() => handleDelete(record)}>删除</XlbButton>
    </XlbButton.Group>
  ),
}
```

## Form 字段搜索类型（SearchFormType）

```tsx
const searchFormList: SearchFormType[] = [
  {
    label: '关键字',
    name: 'keyword',
    type: 'input',
    placeholder: '请输入关键字',
  },
  {
    label: '状态',
    name: 'status',
    type: 'select',
    placeholder: '请选择状态',
    options: [
      { label: '启用', value: 1 },
      { label: '禁用', value: 0 },
    ],
  },
  {
    label: '创建时间',
    name: 'createTime',
    type: 'compactDatePicker',
  },
];
```

## XlbTableColumnProps 类型

```tsx
interface XlbTableColumnProps {
  name: string;        // 表头名称
  code: string;        // 数据字段 key
  width?: number;      // 列宽
  fixed?: 'left' | 'right';
  render?: (value: any, record: any, index: number) => ReactNode;
  features?: {
    sortable?: boolean;
    details?: boolean;
    format?: 'date' | 'datetime' | 'currency' | 'enum';
    autoRowSpan?: boolean;
    copyable?: boolean;
  };
  hidden?: boolean;
  children?: XlbTableColumnProps[];  // 分组表头
}
```

## XlbTipsModal 类型

```tsx
interface XlbTipsModalProps {
  type: 'confirm' | 'tips' | 'error' | 'success' | 'warning';
  title?: string;
  content: ReactNode;
  onOk?: () => void;
  onCancel?: () => void;
}
```

## 单位

- 保持 px 值不变
- 字号：以 `font-size: {{N}}px` 形式书写
- 间距：以 `padding` / `margin` 的 px 值直接书写

## Flexbox

- PC Web 默认 `flex-direction: row`，不需要额外声明
- `flex: none` → `flex: 0 0 auto`
- 其余 flex 属性保持 CSS 原生值

## 属性名

- Less 文件中：CSS 原生写法（`border-radius`，`font-size`）
- JSX style 对象中：camelCase（`borderRadius`，`fontSize`）
- 优先使用 Less CSS Modules，避免 JSX 内联 style

## 图片引用

- 使用 `import logo from './asset/logo.svg'`（UmiJS 支持）
- SVG 小图标使用 `XlbIcon` 组件，不要复制粘贴 SVG
- 静态图片资源放在 `assets/` 目录

## 字体

- `font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
- 始终加系统字体 fallback

## StatusColorByOptions

```tsx
import { StatusColorByOptions } from '@xlb/components';

const options = [
  { label: '已启用', value: 1, color: '@color_success' },
  { label: '已禁用', value: 0, color: '@color_danger' },
  { label: '审核中', value: 2, color: '@color_warning' },
];

<StatusColorByOptions value={status} options={options} />
```

## 禁止行为

- 禁止硬编码 hex 色值（如 `#1A6AFF`），必须使用 Less 变量
- 禁止跳过 `hasAuth` 权限控制
- 禁止在未读取项目现有页面代码的情况下生成全新不匹配的代码
- 禁止跨平台引用（PC 流水线只能引用 `reference/pc/` 下的规则）
- 禁止使用 Ant Design 原生组件代替 `@xlb/components` 封装组件
- 禁止在 XlbForm.Item 的 name 中使用数组（必须使用字符串）
