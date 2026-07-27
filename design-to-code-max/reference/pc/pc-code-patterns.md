# PC 代码模式参考

> 本文件包含 PC 平台 build 阶段 Step 4 的代码脚手架模板。
> 由 `subskills/pc/03-build.md` 的 `### 2. 读取规范` 步骤引用。

---

## Mode A：XlbPageContainer（标准列表页）

```tsx
// index.tsx — 标准列表页
const Page = () => {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [queryParams, setQueryParams] = useState({ page: 1, size: 20 });
  const [modalVisible, setModalVisible] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  const fetchList = async (params?: any) => {
    const searchParams = params || queryParams;
    setLoading(true);
    const res = await server.fetchList(searchParams);
    if (res?.code === 0) {
      setList(res?.data?.list || []);
      setTotal(res?.data?.total || 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleSearch = (values: any) => {
    const params = { ...queryParams, ...values, page: 1 };
    setQueryParams(params);
    fetchList(params);
  };

  const handleAdd = () => {
    setEditItem(null);
    setModalVisible(true);
  };

  const handleEdit = (record: any) => {
    setEditItem(record);
    setModalVisible(true);
  };

  const handleDelete = async (record: any) => {
    XlbTipsModal.confirm({
      title: "确认删除",
      content: `确定要删除「${record.name}」吗？`,
      onOk: async () => {
        const res = await server.delete({ id: record.id });
        if (res?.code === 0) {
          XlbMessage.success("删除成功");
          fetchList();
        }
      },
    });
  };

  const handleSaveSuccess = () => {
    setModalVisible(false);
    fetchList();
  };

  return (
    <XlbPageContainer>
      <XlbForm formList={searchFormList} onFinish={handleSearch} />
      <XlbButton.Group>
        {hasAuth(["module", "create"]) && (
          <XlbButton type="primary" onClick={handleAdd}>新增</XlbButton>
        )}
        {hasAuth(["module", "export"]) && (
          <XlbDropdownButton text="导出" menuItems={exportMenuItems} />
        )}
      </XlbButton.Group>
      <XlbTable
        columns={columns}
        dataSource={list}
        loading={loading}
        pagination={{
          current: queryParams.page,
          pageSize: queryParams.size,
          total,
          onChange: (page, size) => {
            const params = { ...queryParams, page, size };
            setQueryParams(params);
            fetchList(params);
          },
        }}
      />
      <ProPageModal
        title={editItem ? "编辑" : "新增"}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        width={800}
      >
        <Item data={editItem} onRefresh={handleSaveSuccess} onClose={() => setModalVisible(false)} />
      </ProPageModal>
    </XlbPageContainer>
  );
};
```

## Mode B：XlbProPageContainer（集成 CRUD）

```tsx
// index.tsx — 集成 CRUD
import { XlbProPageContainer, SearchFormType, XlbTableColumnProps } from "@xlb/components";
import { hasAuth } from "@xlb/max";
import * as server from "./server";

const searchFormList: SearchFormType[] = [
  { label: "名称", name: "name", type: "input", placeholder: "请输入名称" },
  { label: "状态", name: "status", type: "select", options: statusOptions, placeholder: "请选择状态" },
];

const columns: XlbTableColumnProps[] = [
  { name: "名称", code: "name", width: 200 },
  { name: "状态", code: "status", render: (val) => <StatusColorByOptions value={val} options={statusOptions} /> },
  {
    name: "操作", code: "action", width: 200,
    render: (_, record) => (
      <XlbButton.Group>
        {hasAuth(["module", "edit"]) && <XlbButton type="link" onClick={() => handleEdit(record)}>编辑</XlbButton>}
        {hasAuth(["module", "delete"]) && <XlbButton type="link" danger onClick={() => handleDelete(record)}>删除</XlbButton>}
      </XlbButton.Group>
    ),
  },
];

const Page = () => (
  <XlbProPageContainer
    searchFormList={searchFormList}
    columns={columns}
    request={(params) => server.fetchList(params)}
    operateBtnList={[hasAuth(["module", "create"]) && { text: "新增", type: "primary" as const, onClick: () => handleAdd() }].filter(Boolean)}
  />
);
```

## Mode C：自定义布局

```tsx
// index.tsx — 自定义布局
const Page = () => {
  return (
    <div className={styles.dashboard}>
      <div className={styles.header}><h2>仪表盘标题</h2></div>
      <div className={styles.content}>
        <div className={styles.leftPanel}>{/* 左侧子组件 */}</div>
        <div className={styles.rightPanel}>{/* 右侧子组件 */}</div>
      </div>
    </div>
  );
};
```

## Item.tsx：XlbBasicForm + CSS Grid

```tsx
// item.tsx — 新增/编辑弹窗表单
const Item: React.FC<ItemProps> = ({ data, onRefresh, onClose }) => {
  const [form] = XlbBasicForm.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (data) form.setFieldsValue(data); }, [data]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const api = data?.id ? server.update : server.create;
      const res = await api({ ...values, id: data?.id });
      if (res?.code === 0) { XlbMessage.success("保存成功"); onRefresh(); }
    } finally { setLoading(false); }
  };

  return (
    <XlbBasicForm form={form} onFinish={handleSubmit}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
        <XlbBasicForm.Item name="name" label="名称" rules={[{ required: true }]}><XlbInput /></XlbBasicForm.Item>
        <XlbBasicForm.Item name="status" label="状态"><XlbSelect options={statusOptions} /></XlbBasicForm.Item>
      </div>
    </XlbBasicForm>
  );
};
```

## API 调用：XlbFetch.post + code === 0

```tsx
// server.ts
import { XlbFetch } from "@xlb/components";

const server = {
  fetchList: (params) => XlbFetch.post("/api/your-module/list", params),
  create: (params) => XlbFetch.post("/api/your-module/create", params),
  update: (params) => XlbFetch.post("/api/your-module/update", params),
  delete: (params) => XlbFetch.post("/api/your-module/delete", params),
  getDetail: (params) => XlbFetch.post("/api/your-module/detail", params),
};
export default server;
```

## Modal：fsmsModal / ProPageModal

```tsx
// fsmsModal 模式（NiceModal.create）
import NiceModal from "@ebay/nice-modal-react";
import { fsmsModal } from "@xlb/components";

const YourModal = NiceModal.create("your-modal", () => {
  const modal = NiceModal.useModal();
  const { data } = modal.args;
  return (
    <XlbModal title="操作" visible={modal.visible} onCancel={() => modal.hide()}>
      {/* 弹窗内容 */}
    </XlbModal>
  );
});
```

## Column 定义：XlbTableColumnProps + features

```tsx
// data.tsx — 列定义
const columns: XlbTableColumnProps[] = [
  {
    name: "名称", code: "name", width: 200,
    render: (val, record) => <span className="link" onClick={() => handleDetail(record)}>{val}</span>,
    features: { sortable: true, details: true },
  },
  {
    name: "状态", code: "status", width: 100,
    render: (val) => <StatusColorByOptions value={val} options={statusColorOptions} />,
  },
  {
    name: "操作", code: "action", width: 200, fixed: "right",
    render: (_, record) => (
      <XlbButton.Group>
        <XlbButton type="link" onClick={() => handleEdit(record)}>编辑</XlbButton>
        <XlbButton type="link" danger onClick={() => handleDelete(record)}>删除</XlbButton>
      </XlbButton.Group>
    ),
  },
];
```

## 字段来源约束

生成表格列定义 / 详情展示 / 表单字段时，**必须对照 `api-spec.md` §3 的字段综合映射表**。每个渲染字段标注 FP-xxx 编号。映射表中标注了 ✅ 的字段代码中必须有，表中没有的字段代码中不能有。quick / micro 模式对照 `features.md` §接口补充的「关键响应字段」列。
