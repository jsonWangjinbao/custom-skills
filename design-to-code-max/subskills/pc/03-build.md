# Phase 07 - 分组执行与代码生成（PC）

## 进入条件

- 已 `Read .ai-wiki/.dtc-state.json`。
- `phaseOutputs.design.checklistPassed === true` 且 `phaseOutputs.design.userConfirmed === true`。
- `currentPhase` 为 `build`。
- `inputs.platform === "pc"`。

---

## 任务

> 上下文预算：本阶段读写遵循 `../../reference/common/context-budget.md`——每个分组只读 execution.md 当前分组 + 该分组涉及的 parsed-styles JSON，不整篇回读 ui-audit.md / tech-design.md；execution.md 已完成分组压缩为一行摘要。

### 1. 生成执行文档

从 `tech-design.md` 拆解为分步执行步骤，使用 `../../templates/pc/execution.md.tpl` 格式生成 `execution.md`。

- 按功能模块或页面拆分为分组（每组 3-8 个步骤）
- 每步标注关联功能点 ID、UI 参考文件、预计耗时
- 将 `docPaths.execution` 设置为生成的 execution.md 路径
- 更新 `.ai-wiki/.dtc-state.json` 的当前需求条目的 `build.totalGroups`

### 2. 读取规范

**先读 `../../reference/pc/pc-guidelines.md`**，确认组件、路由、状态、权限等约束。
**再读 `../../reference/pc/project-conventions.md`**，确认页面文件结构、service 模式等约定。

### 3. 按分组执行

按顺序逐一执行每个分组。**每个分组完成后，必须执行以下步骤，缺一不可：**

#### Step 1: 读设计文档

读取 `tech-design.md` 对应部分，特别关注「组件选择决策表」和「UI 样式规格」。

#### Step 2: 读 parsed-styles + 交叉验证 HTML + 读取 api-spec.md

1. 读取 `parsed-styles/*.json` 中当前分组涉及的页面样式数据
2. 读取 `ui-audit.md` 中对应的三要素表进行确认
3. **读取 `api-spec.md`**：对于本分组涉及的 API 调用，读取 `api-spec.md` 中对应接口的请求参数表和响应字段表，确认：
   - 参数名、类型、默认值
   - 响应字段及其用途
   - **禁止**绕过 api-spec.md 直接从源码提取参数格式
4. 仅当以下场景回退到读原始 HTML：
   - parsed JSON 中缺少当前元素的数据
   - 需要确认非样式属性（`placeholder`、`maxlength`、`onClick` 等）
5. **记录日志**：在 `execution.md` 对应步骤后记录 `解析数据已读: parsed-styles/xxx.json`
   - **记录 `API 规格已读: api-spec.md §2.x（接口名）`**

#### Step 3: 读项目代码风格 + 识别生存必备模式

读取目标目录现有文件，匹配已有模式。

**生存必备模式清单（每项必须与参照页逐行对照）：**

| 维度         | 说明                                               | 参照页文件名 |
| ------------ | -------------------------------------------------- | ------------ |
| 页面容器结构 | XlbPageContainer vs XlbProPageContainer 的使用差异 | —            |
| 搜索表单定义 | SearchFormType 配置模式（type/options 字段命名）   | —            |
| API 响应取值 | `res?.code === 0` 后的数据路径                     | —            |
| Item props   | data/onRefresh/onClose 命名和类型                  | —            |
| 权限控制     | hasAuth 的调用方式和参数格式                       | —            |
| 列定义       | XlbTableColumnProps 的 name/code/render 使用       | —            |
| 导航方式     | useIRouter / useNavigation / history 的选择        | —            |

**参照页选择规则**：

- 增量需求 → 选本页面同目录下的兄弟文件
- 重构需求 → 必选项目中已有的同类型 PC 页面
- 没有同类型页面 → 选任意已有 PC 页面作参照

参照页选定后必须写入 `execution.md` 的分组日志中。

#### Step 4: 生成/修改代码

##### Mode A 脚手架：XlbPageContainer（标准列表页）

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
          <XlbButton type="primary" onClick={handleAdd}>
            新增
          </XlbButton>
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
        <Item
          data={editItem}
          onRefresh={handleSaveSuccess}
          onClose={() => setModalVisible(false)}
        />
      </ProPageModal>
    </XlbPageContainer>
  );
};
```

##### Mode B 脚手架：XlbProPageContainer（集成 CRUD）

```tsx
// index.tsx — 集成 CRUD
import {
  XlbProPageContainer,
  SearchFormType,
  XlbTableColumnProps,
} from "@xlb/components";
import { hasAuth } from "@xlb/max";
import * as server from "./server";

const searchFormList: SearchFormType[] = [
  { label: "名称", name: "name", type: "input", placeholder: "请输入名称" },
  {
    label: "状态",
    name: "status",
    type: "select",
    options: statusOptions,
    placeholder: "请选择状态",
  },
];

const columns: XlbTableColumnProps[] = [
  { name: "名称", code: "name", width: 200 },
  {
    name: "状态",
    code: "status",
    render: (val) => (
      <StatusColorByOptions value={val} options={statusOptions} />
    ),
  },
  {
    name: "操作",
    code: "action",
    width: 200,
    render: (_, record) => (
      <XlbButton.Group>
        {hasAuth(["module", "edit"]) && (
          <XlbButton type="link" onClick={() => handleEdit(record)}>
            编辑
          </XlbButton>
        )}
        {hasAuth(["module", "delete"]) && (
          <XlbButton type="link" danger onClick={() => handleDelete(record)}>
            删除
          </XlbButton>
        )}
      </XlbButton.Group>
    ),
  },
];

const Page = () => (
  <XlbProPageContainer
    searchFormList={searchFormList}
    columns={columns}
    request={(params) => server.fetchList(params)}
    operateBtnList={[
      hasAuth(["module", "create"]) && {
        text: "新增",
        type: "primary" as const,
        onClick: () => handleAdd(),
      },
    ].filter(Boolean)}
  />
);
```

##### Mode C 脚手架：自定义布局

```tsx
// index.tsx — 自定义布局
const Page = () => {
  // 数据获取逻辑

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h2>仪表盘标题</h2>
      </div>
      <div className={styles.content}>
        <div className={styles.leftPanel}>{/* 左侧子组件 */}</div>
        <div className={styles.rightPanel}>{/* 右侧子组件 */}</div>
      </div>
    </div>
  );
};
```

##### Item.tsx 模式：XlbBasicForm + CSS Grid

```tsx
// item.tsx — 新增/编辑弹窗表单
import {
  XlbBasicForm,
  XlbBasicFormItem,
  XlbInput,
  XlbSelect,
  XlbMessage,
} from "@xlb/components";

interface ItemProps {
  data?: any;
  onRefresh: () => void;
  onClose: () => void;
}

const Item: React.FC<ItemProps> = ({ data, onRefresh, onClose }) => {
  const [form] = XlbBasicForm.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (data) form.setFieldsValue(data);
  }, [data]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const api = data?.id ? server.update : server.create;
      const res = await api({ ...values, id: data?.id });
      if (res?.code === 0) {
        XlbMessage.success("保存成功");
        onRefresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <XlbBasicForm form={form} onFinish={handleSubmit}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px",
        }}
      >
        <XlbBasicForm.Item
          name="name"
          label="名称"
          rules={[{ required: true, message: "请输入名称" }]}
        >
          <XlbInput placeholder="请输入名称" />
        </XlbBasicForm.Item>
        <XlbBasicForm.Item name="status" label="状态">
          <XlbSelect options={statusOptions} placeholder="请选择状态" />
        </XlbBasicForm.Item>
        {/* 更多字段... */}
      </div>
    </XlbBasicForm>
  );
};
```

##### API 调用：XlbFetch.post + code === 0

```tsx
// server.ts — API 定义
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

##### Modal 模式：fsmsModal / ProPageModal

```tsx
// fsmsModal 模式（NiceModal.create）
import NiceModal from "@ebay/nice-modal-react";
import { fsmsModal } from "@xlb/components";

const YourModal = NiceModal.create("your-modal", () => {
  const modal = NiceModal.useModal();
  const { data } = modal.args;

  return (
    <XlbModal
      title="操作"
      visible={modal.visible}
      onCancel={() => modal.hide()}
    >
      {/* 弹窗内容 */}
    </XlbModal>
  );
});
```

##### Column 定义：XlbTableColumnProps + features

```tsx
// data.tsx — 列定义
const columns: XlbTableColumnProps[] = [
  {
    name: "名称",
    code: "name",
    width: 200,
    render: (val, record) => (
      <span className="link" onClick={() => handleDetail(record)}>
        {val}
      </span>
    ),
    features: { sortable: true, details: true },
  },
  {
    name: "状态",
    code: "status",
    width: 100,
    render: (val) => (
      <StatusColorByOptions value={val} options={statusColorOptions} />
    ),
  },
  {
    name: "操作",
    code: "action",
    width: 200,
    fixed: "right",
    render: (_, record) => (
      <XlbButton.Group>
        <XlbButton type="link" onClick={() => handleEdit(record)}>
          编辑
        </XlbButton>
        <XlbButton type="link" danger onClick={() => handleDelete(record)}>
          删除
        </XlbButton>
      </XlbButton.Group>
    ),
  },
];
```

##### 字段来源约束

生成表格列定义 / 详情展示 / 表单字段时，**必须对照 `api-spec.md §3` 的字段综合映射表**。每个渲染字段标注 FP-xxx 编号。映射表中标注了 ✅ 的字段代码中必须有，表中没有的字段代码中不能有。

#### Step 5: 编译验证（PC）

由于 PC 项目在云端构建，本地无完整编译环境，执行以下检查：

1. **语法检查**：Check JSX 语法、TypeScript 类型定义正确
2. **props 校验**：检查使用的 `@xlb/components` 组件 props 是否正确（名称、类型、必填项）
3. **import 完整性**：检查所有 import 的来源正确（`@xlb/components`、`@xlb/max` 等）
4. **权限覆盖**：检查每个操作按钮是否有 `hasAuth` 包裹
5. **路由注册**：检查路由是否在 `routeList` 中注册

#### Step 5.5: 设计偏差捕捉

在每个分组校验通过后，检查生成的代码样式是否符合设计规格：

1. 读取 `execution.md` 中本分组的「解析数据已读」日志，确认已消费
2. 读取 `parsed-styles/*.json` 中本分组涉及的样式数据
3. 读取 `ui-audit.md` 中对应组件的三要素表
4. **逐属性检查**：至少检查以下 4 项必查属性：
   - `layout.height` → 代码中的高度是否符合 parsed 值
   - `typography.fontSize` → 字号是否符合
   - `typography.color` → 颜色值是否符合（使用 Less 变量）
   - `spacingStyle.backgroundColor` → 背景色是否符合（使用 Less 变量）
5. 输出「设计偏差记录表」到 `execution.md`：

```markdown
#### 设计偏差记录 — 分组 N

| #   | 元素   | 属性   | 预期(设计值) | 实际(代码) | 偏差类型 | 严重度 | 处理方案 |
| --- | ------ | ------ | ------------ | ---------- | -------- | ------ | -------- |
| 1   | 表格行 | height | 48px         | 44px       | layout   | major  | 立即修复 |
```

偏差类型枚举：`layout | typography | spacing | icon | color | missing`
严重度枚举：`critical`（功能缺失）/ `major`（视觉明显不符）/ `minor`（细微偏差）
处理方案枚举：`立即修复` / `defer 到 verify` / `不可修复-原因`

6. **同步偏差库**：将新偏差追加到 `.ai-wiki/design-deviation-db.json`
   - 新偏差 → 追加新条目（生成 DEV-ID）
   - 命中已知偏差（component + defectType 匹配） → 仅 `occurrenceCount++`, `lastOccurred` 更新

#### Step 6: 更新 execution.md

将该分组标题标记为 ✅，在对应 Step 行末尾追加 `实际: MM 分钟`，确认「解析数据已读」日志已填写。

**同步维护「恢复入口」标记**：

```markdown
## 恢复入口

- 当前进度：分组 X 已完成
- 下一步：分组 Y Step 1（读设计文档）
- 最后更新：YYYY-MM-DD HH:mm
```

#### Step 7: 更新 features.md

将关联功能点 ⬜ → ✅；追加 `分组 N 完成: HH:MM (实际 MM 分钟)` 到「性能计时日志」。

#### Step 8: 更新 .dtc-state.json

```jsonc
{
  "completedGroups": N,
  "currentGroup": N + 1,
  "createdFiles": ["新增的文件路径"],
  "modifiedFiles": ["修改的文件路径"],
  "completedFeatureIds": ["F-001", "F-002"]
}
```

---

## 出口门禁（必须全部通过才能进入 verify 阶段）

在所有分组执行完毕后，**强制执行以下校验**：

1. **分组完成度**：检查 `execution.md` 中所有分组标题是否均标记 ✅
2. **功能点完成度**：检查 `features.md` 中是否仍有未完成功能点
3. **解析数据消费完整性**：检查每个分组的「解析数据已读」日志是否已填写
4. **样式合规终检**：扫描本次新增/修改文件，检查：
   - 无硬编码 hex 色值（已使用 Less 变量）
   - 组件都来自 `@xlb/components`
   - 无 Ant Design 原生组件引用
5. **设计偏差捕捉完整性**：检查 `execution.md` 中每个分组的「设计偏差记录表」是否已生成；所有 `critical` 偏差必须已修复
6. **权限检查**：所有操作按钮都有 `hasAuth` 包裹
7. **路由检查**：新页面路由已在 `routeList` 中注册
8. **defer/待处理项消费检查**：扫描 `execution.md` 中 defer 项是否全部闭环

**全部通过后**：

- 汇报：全部 N 个分组已执行，M 个功能点已完成
- 更新 `.ai-wiki/.dtc-state.json`：`build.exitGatePassed = true`, `build.checklistPassed = true`
- 推进 `currentPhase` 到 `verify`

---

## 禁止

- 未完成所有步骤就汇报分组完成
- 当 `materialStatus` 为 `"complete"` 时跳过 Step 2 写出无样式的代码
- **Step 2 中未读取 `api-spec.md` 就直接用猜测的格式写 API 调用。**
- **Step 4 中未对照 `api-spec.md` 的字段综合映射表就生成表格列/详情/表单字段。**
- 用硬编码 hex 色值（使用 Less 变量）
- 使用 Ant Design 原生组件而非 `@xlb/components` 封装
- 跳过 `hasAuth` 权限控制
- 未在 `routeList` 中注册路由就生成页面
- 一次生成过多文件而不更新 checkpoint
