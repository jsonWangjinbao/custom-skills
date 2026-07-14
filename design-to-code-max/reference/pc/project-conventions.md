# PC 项目约定

> 本约定依据 fsms_web 项目的代码实践归纳，所有生成的 PC 端代码必须遵循。

## 页面文件结构

每个页面目录遵循以下文件结构：

```
src/pages/your-page/
├── index.tsx      // 页面入口：XlbPageContainer / XlbProPageContainer / 自定义布局
├── data.tsx       // 列定义、搜索表单配置、枚举、options 常量
├── server.ts      // API 定义（default export 对象）
├── item.tsx       // 新增/编辑弹窗表单（XlbBasicForm + CSS Grid）
└── index.less     // 页面样式（Less CSS Modules）
```

**约定**：
- `index.tsx` 负责页面容器和整体布局
- `data.tsx` 存放所有表格列定义、表单配置、枚举值
- `server.ts` 存放所有 API 请求方法
- `item.tsx` 存放新增/编辑弹窗的表单内容
- `index.less` 存放页面专用样式

**例外**：简单页面（如纯展示或只有 1 个功能的表单）可以合并到单一 `index.tsx`，不需要拆分成上述 5 个文件。

## XlbPageContainer vs XlbProPageContainer 使用指南

### XlbPageContainer（Mode A — 简单列表页）

使用场景：
- 需要手动控制搜索 + 按钮 + 表格 + 弹窗的布局
- CRUD 操作分散且需要自定义逻辑
- 表格数据需要通过业务逻辑处理后再渲染

```tsx
// index.tsx
const Page = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  const fetchList = async (params) => {
    setLoading(true);
    const res = await server.fetchList(params);
    if (res?.code === 0) {
      setList(res?.data?.list || []);
    }
    setLoading(false);
  };

  return (
    <XlbPageContainer>
      <XlbForm formList={searchFormList} onFinish={fetchList} />
      <XlbButton.Group>
        {hasAuth(['module', 'create']) && (
          <XlbButton type="primary" onClick={() => { setCurrentItem(null); setModalVisible(true); }}>
            新增
          </XlbButton>
        )}
      </XlbButton.Group>
      <XlbTable columns={columns} dataSource={list} loading={loading} />
      <ProPageModal title={currentItem ? '编辑' : '新增'} visible={modalVisible} onCancel={() => setModalVisible(false)}>
        <Item data={currentItem} onRefresh={() => { setModalVisible(false); fetchList(); }} />
      </ProPageModal>
    </XlbPageContainer>
  );
};
```

### XlbProPageContainer（Mode B — 集成 CRUD 页）

使用场景：
- 标准的 CRUD 流程（搜索 + 新增 + 编辑 + 删除 + 导出）
- 需要内置的分页、排序、筛选能力
- 表单逻辑标准化，不需要高度定制

```tsx
// index.tsx
const searchFormList: SearchFormType[] = [
  { label: '名称', name: 'name', type: 'input', placeholder: '请输入名称' },
  { label: '状态', name: 'status', type: 'select', options: statusOptions, placeholder: '请选择状态' },
];

const columns: XlbTableColumnProps[] = [
  { name: '名称', code: 'name', width: 200, features: { details: true } },
  { name: '状态', code: 'status', render: (val) => <StatusColorByOptions value={val} options={statusOptions} /> },
  { name: '操作', code: 'action', width: 200, render: (_, record) => (
    <XlbButton.Group>
      <XlbButton type="link" onClick={() => handleEdit(record)}>编辑</XlbButton>
      <XlbButton type="link" danger onClick={() => handleDelete(record)}>删除</XlbButton>
    </XlbButton.Group>
  )},
];

<XlbProPageContainer
  searchFormList={searchFormList}
  columns={columns}
  request={(params) => server.fetchList(params)}
  operateBtnList={[
    { text: '新增', type: 'primary', onClick: () => handleAdd() },
    { text: '导出', type: 'default', onClick: () => handleExport() },
  ]}
/>
```

## SearchFormType 配置模式

搜索表单字段通过 `SearchFormType` 数组定义：

```tsx
import { SearchFormType } from '@xlb/components';

const searchFormList: SearchFormType[] = [
  {
    label: '字段名称',
    name: 'fieldName',      // 必须为字符串，不能是数组
    type: 'input' | 'select' | 'compactDatePicker' | 'inputDialog' | 'treeModalConfig',
    placeholder: '请输入/选择',
    options?: { label: string; value: any }[],   // select 类型必填
    initialValue?: any,     // 默认值
    hidden?: boolean,       // 条件隐藏
    props?: Record<string, any>,  // 传递给输入组件的额外 props
  },
];
```

## Service 文件模式

### server.ts（统一默认导出）

```ts
// server.ts
import { XlbFetch } from '@xlb/components';

const server = {
  fetchList: (params) => XlbFetch.post('/api/your-module/list', params),
  create: (params) => XlbFetch.post('/api/your-module/create', params),
  update: (params) => XlbFetch.post('/api/your-module/update', params),
  delete: (params) => XlbFetch.post('/api/your-module/delete', params),
  getDetail: (params) => XlbFetch.post('/api/your-module/detail', params),
  export: (params) => XlbFetch.post('/api/your-module/export', params),
};

export default server;
```

### service.tsx（具名导出，适用于需要 hooks 的场景）

```tsx
// service.tsx
import { XlbFetch } from '@xlb/components';

export const fetchList = (params) => XlbFetch.post('/api/your-module/list', params);
export const createItem = (params) => XlbFetch.post('/api/your-module/create', params);
```

**选择规则**：
- 简单的 CRUD 页面 → 使用 `server.ts` 默认导出
- 需要 hooks 或复杂逻辑的场景 → 使用 `service.tsx` 具名导出

## 路由注册

```tsx
// src/config/route.ts
import { FsmsRouteKeys } from 'xlb-max';

export const routeList = [
  // ... 已有路由
  {
    name: '页面中文名',
    path: '/path/to/page',
    component: '@/pages/your-page',
    wrappers: ['@/wrappers/auth'],
    keepAlive: true,
    subMenu: 'fsmsStore',  // 注意：使用现有 subMenu key，不新增
  },
];
```

### 子菜单 SubMenu Keys

| Key | 语义 |
|-----|------|
| `fsmsStore` | 门店管理 |
| `fsmsScm` | 供应链 |
| `fsmsArchives` | 档案 |
| `fsmsData` | 数据 |
| `fsmsWms` | 仓库 |
| `systemCompliance` | 系统合规 |

**规则**：
- 使用已有 `subMenu` key，不新增
- 路由 path 保持与同类页面一致的前缀风格
- 页面保活（`keepAlive: true`）作为默认值

## 权限 hooks

```tsx
import { hasAuth } from '@xlb/max';

// 按钮级权限控制
{hasAuth(['module', 'action']) && (
  <XlbButton type="primary" onClick={handleAdd}>新增</XlbButton>
)}

// 可选参数：app_type
{hasAuth(['module', 'action', 'app_type']) && (...)}
```

**规则**：
- 每个操作按钮都必须包裹 `hasAuth` 判断
- `module` 为所属模块名，`action` 为操作（create / edit / delete / export / view）
- 不满足权限的按钮直接不渲染（不返回 null），使用 `&&` 短路

## Modal + Save + Refesh 模式

### XlbPageContainer 模式（手动）

```tsx
// index.tsx
const [modalVisible, setModalVisible] = useState(false);
const [editItem, setEditItem] = useState(null);

const handleAdd = () => {
  setEditItem(null);
  setModalVisible(true);
};

const handleEdit = (record) => {
  setEditItem(record);
  setModalVisible(true);
};

const handleSaveSuccess = () => {
  setModalVisible(false);
  fetchList();  // 刷新列表
};

// Item 中通过 onRefresh 回调通知父组件刷新
<Item data={editItem} onRefresh={handleSaveSuccess} onClose={() => setModalVisible(false)} />
```

### NiceModal 模式（复杂业务）

```tsx
// index.tsx
const handleEdit = (record) => {
  NiceModal.show('your-modal', { data: record }).then((refresh) => {
    if (refresh) fetchList();
  });
};

// modal 定义
const YourModal = NiceModal.create('your-modal', () => {
  const modal = NiceModal.useModal();
  const { data } = modal.args;

  const handleSubmit = async () => {
    const res = await server.update(data);
    if (res?.code === 0) {
      XlbMessage.success('操作成功');
      modal.resolve(true);  // 通知调用方刷新
      modal.hide();
    }
  };

  return (
    <XlbModal title="编辑" visible={modal.visible} onOk={handleSubmit} onCancel={() => modal.hide()}>
      {/* 表单内容 */}
    </XlbModal>
  );
});
```

## Item.tsx 模式

新增/编辑弹窗的表单文件 `item.tsx` 的约定模式：

```tsx
// item.tsx
import { XlbBasicForm, XlbBasicFormItem, XlbInput, XlbSelect, XlbMessage } from '@xlb/components';

interface ItemProps {
  data?: any;          // 编辑时传入数据，新增时为 null
  onRefresh: () => void;  // 保存成功后调用，刷新父页面
  onClose: () => void;    // 关闭弹窗
}

const Item: React.FC<ItemProps> = ({ data, onRefresh, onClose }) => {
  const [form] = XlbBasicForm.useForm();
  const loading = useReactive(false);

  useEffect(() => {
    if (data) {
      form.setFieldsValue(data);  // 编辑时回填数据
    }
  }, [data]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      loading.value = true;
      const api = data?.id ? server.update : server.create;
      const res = await api({ ...values, id: data?.id });
      if (res?.code === 0) {
        XlbMessage.success('保存成功');
        onRefresh();
      }
    } catch (err) {
      // 表单校验失败或请求报错
    } finally {
      loading.value = false;
    }
  };

  return (
    <XlbBasicForm form={form} onFinish={handleSubmit}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <XlbBasicForm.Item name="name" label="名称" rules={[{ required: true, message: '请输入名称' }]}>
          <XlbInput placeholder="请输入名称" />
        </XlbBasicForm.Item>
        <XlbBasicForm.Item name="status" label="状态">
          <XlbSelect options={statusOptions} placeholder="请选择状态" />
        </XlbBasicForm.Item>
        {/* 更多字段 */}
      </div>
    </XlbBasicForm>
  );
};
```

**props 约定**：
- `data?: any` — 编辑模式下传入已有数据，新增模式下为 null/undefined
- `onRefresh?: () => void` — 保存成功后回调父页面刷新数据
- `onClose?: () => void` — 关闭弹窗回调（通常在取消时调用）

**渲染约定**：
- 表单使用 CSS Grid 三列布局（`repeat(3, 1fr)`）
- 编辑模式在 `useEffect` 中通过 `form.setFieldsValue(data)` 回填
- 表单校验规则写在对应 Item 的 `rules` prop 中
- 提交前必须 `form.validateFields()`

## XlbPageContainerRef

```tsx
import { XlbPageContainerRef } from '@xlb/components';

const pageRef = useRef<XlbPageContainerRef>(null);

// 刷新
pageRef.current?.refresh();
```

## 状态管理

- 页面级状态使用 `useState` 或 `useReactive`
- 复杂页面使用 Zustand store + immer
- 全局状态（用户信息、权限）已在 `XlbConfigProvider` 中统一管理，页面不需要重复管理

## 服务端请求 URL

使用 `process.env.BASE_URL` 拼接：

```tsx
const res = await XlbFetch.post(`${process.env.BASE_URL}/api/your-path`, params);
```

## 列选中态与颜色渲染

```tsx
// data.tsx — 状态枚举 + 颜色定义
export const statusColorOptions = [
  { label: '启用', value: 1, color: '@color_success' },
  { label: '禁用', value: 0, color: '@color_danger' },
  { label: '待审核', value: 2, color: '@color_warning' },
  { label: '已过期', value: 3, color: '@color_invalid' },
];

// columns 中使用
{
  name: '状态',
  code: 'status',
  render: (val) => <StatusColorByOptions value={val} options={statusColorOptions} />,
}
```

## Edit Log 弹窗模式

编辑日志的弹窗模式：

```tsx
// 在 data.tsx 或独立文件中定义弹窗
import NiceModal from '@ebay/nice-modal-react';
import { fsmsModal } from '@xlb/components';

const EditLogModal = NiceModal.create('edit-log-modal', () => {
  const modal = NiceModal.useModal();
  const { id } = modal.args;
  // ...日志列表逻辑

  return (
    <XlbModal title="编辑日志" visible={modal.visible} onCancel={() => modal.hide()} width={800}>
      <XlbTable columns={logColumns} dataSource={logList} />
    </XlbModal>
  );
});

// 使用
const showEditLog = (record) => {
  NiceModal.show('edit-log-modal', { id: record.id });
};
```

## XlbTipsModal 确认弹窗

```tsx
import { XlbTipsModal } from '@xlb/components';

const confirmDelete = (record) => {
  XlbTipsModal.confirm({
    title: '确认删除',
    content: `确定要删除「${record.name}」吗？`,
    onOk: async () => {
      const res = await server.delete({ id: record.id });
      if (res?.code === 0) {
        XlbMessage.success('删除成功');
        fetchList();
      }
    },
  });
};
```

## KeepAlive 说明

- 所有业务页面默认开启 `keepAlive: true`
- 组件卸载时不销毁 DOM，页面切换时保持滚动位置和数据
- 页面刷新时机：通过 `fetchList` / `pageRef.current?.refresh()` 手动控制
- 不需要额外配置 keep-alive 属性

## 禁止行为

- 禁止使用 `@ant-design/icons` 等 Ant Design 原生 icon（使用 `XlbIcon`）
- 禁止使用 `Form` / `Table` 等 Ant Design 原生组件（使用 `@xlb/components` 封装）
- 禁止在路由配置中硬编码 path 字符串（通过 `routeList` 统一管理）
- 禁止在 XlbForm.Item 的 name 中使用数组结构
- 禁止在 style 中硬编码 hex 色值（使用 Less 变量）
