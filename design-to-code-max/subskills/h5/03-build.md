# Phase 07 - 分组执行与代码生成（H5）

## 进入条件

- 已 `Read .ai-wiki/.dtc-state.json`。
- `phaseOutputs.design.checklistPassed === true` 且 `phaseOutputs.design.userConfirmed === true`。
- `currentPhase` 为 `build`。

---

## 任务

### 1. 生成执行文档

从 `tech-design.md` 拆解为分步执行步骤，使用 `../../templates/h5/execution.md.tpl` 格式生成 `execution.md`。

- 按功能模块或页面拆分为分组（每组 3-8 个步骤）
- 每步标注关联功能点 ID、UI 参考文件、预计耗时
- 将 `docPaths.execution` 设置为生成的 execution.md 路径
- 更新 `.ai-wiki/.dtc-state.json` 的当前需求条目的 `build.totalGroups`

### 2. 读取规范

**先读 `../../reference/h5/h5-guidelines.md`**，确认 H5 组件、CSS 变量、路由、样式等约束。

### 3. 按分组执行（核心：8 步闭环）

H5 代码生成不需要 RN 的 Step 3.5 模式对齐确认表（那是 H5→RN 重构的 RN 特有步骤），也不需要 SafeInput/SafeUploadFile/Dependencies 检查（那是 RN 框架问题）。其余步骤结构与 RN 一致。

按顺序逐一执行每个分组。**每个分组完成后，必须执行以下步骤，缺一不可：**

#### Step 1: 读设计文档

读取 `tech-design.md` 对应部分，特别关注「组件选择决策表」和「UI 样式规格」。

#### Step 2: 读 parsed-styles + 交叉验证 HTML + 读取 api-spec.md

1. 读取 `parsed-styles/*.json` 中当前分组涉及的页面样式数据
2. 读取 `ui-audit.md` 中对应的三要素表进行确认
3. **读取 `api-spec.md`**：对于本分组涉及的 API 调用，读取 `api-spec.md` 中对应接口的请求参数表和响应字段表，确认：
   - 参数名、类型、默认值
   - 响应字段及其用途
   - 取值路径
   - **禁止**绕过 api-spec.md 直接从源码提取参数格式
4. 仅当以下场景回退到读原始 HTML：
   - parsed JSON 中缺少当前元素的数据（该元素在 JSON 中不存在或关键属性为空）
   - 需要确认非样式属性（`placeholder`、`maxlength`、事件绑定等）
   - 模型对 parsed 数据的准确性有疑虑
5. **记录日志**：在 `execution.md` 对应步骤后记录 `解析数据已读: parsed-styles/xxx.json`
   - 如果回退读了原始 HTML，在日志中追加 `HTML 交叉验证: 文件路径`
   - **记录 `API 规格已读: api-spec.md §2.x（接口名）`**

#### Step 3: 读项目代码风格

读取目标目录现有文件，匹配已有 H5 页面模式。确认以下清单：

| 维度         | 说明                                           |
| ------------ | ---------------------------------------------- |
| 页面容器结构 | ProPageContainer 的 navBar prop 用法           |
| 导航跳转     | useXlbRouter 的 push/goBack/replace 用法       |
| 表单模式     | XlbProDetail formList 配置模式                 |
| 路由参数     | useXlbRouter query 取值方式                    |
| API 调用     | request() 调用方式和响应处理（res.code === 0） |
| Toast 调用   | Toast.show() 的 import 和调用方式              |
| 状态管理     | Zustand store 的创建和使用模式                 |

#### Step 4: 生成/修改代码

按以下约束生成代码：

- **页面脚手架**：每个页面使用 `ProPageContainer` + `XlbNavBar` 包装
- **列表页**：使用 `XlbFlatList` + `XlbSearchBar`（如需搜索）实现无限滚动列表
- **表单页**：使用 `XlbProDetail` + `formList` 声明式配置，通过 `componentType` 驱动渲染
- **导航**：使用 `useXlbRouter` hook，禁止 `history.push`
- **API 调用**：使用 `request()` from `umi`，检查 `res.code === 0`
- **字段来源约束**：生成 renderItem / 详情展示 / 表单字段时，**必须对照 `api-spec.md §3` 的字段综合映射表**。每个渲染字段标注 FP-xxx 编号。映射表中标注了 ✅ 的字段代码中必须有，表中没有的字段代码中不能有。
- **样式**：SCSS CSS Module，使用 `var(--xlb-*)` CSS 变量，禁止硬编码 hex/px
- **状态管理**：使用 Zustand + immer（需要时创建独立 store）

**文件结构生成规则：**

每个功能特性目录包含 5 个标准文件：

| 文件         | 说明                        | 必选          |
| ------------ | --------------------------- | ------------- |
| `index.tsx`  | 页面/组件主文件             | 是            |
| `index.scss` | CSS Module 样式文件         | 是            |
| `store.ts`   | Zustand store（页面级状态） | 按需          |
| `server.ts`  | API 接口封装                | 有 API 则必选 |
| `config.tsx` | 常量/配置/formList 定义     | 按需          |

**formList 配置模式：**

```tsx
// config.tsx
export const formList = [
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
  {
    label: "证件照片",
    name: "images",
    componentType: "uploadImg",
    extraProps: { maxCount: 5 },
  },
];
```

**XlbFlatList 配置模式：**

```tsx
<XlbFlatList
  url="/api/xxx/page"
  params={{ status: "active" }}
  renderItem={({ item }) => <CellItem data={item} />}
  emptyText="暂无数据"
/>
```

**API 调用模式：**

```tsx
import { request } from "umi";

const res = await request("/api/xxx/page", {
  method: "POST",
  data: params,
});
if (res.code === 0) {
  // 处理数据
}
```

**样式生成规则（px → PostCSS auto-convert to rem, rootValue: 75）：**

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

> **关于 px 单位**：颜色、字号、间距、圆角必须使用 `var(--xlb-*)` CSS 变量，禁止直接写 hex 或 px 数值；无对应 CSS 变量的尺寸值（如特殊宽度/高度）可直接写设计稿 750px 下的 px 值，PostCSS pxtorem 插件（rootValue: 75）会自动转换为 rem，不要手动计算 rem。

**表单提交流程：**

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

##### 必须添加注释的场景

Step 4 生成代码时，以下场景**必须**加行内注释：

- 与 RN WebView 通信相关的 `NativeBridge.postMessage()` 调用
- 绕过组件库 bug 的 workaround
- 权限控制相关的 `useHasAuth` 逻辑（标注权限点）

##### 设计偏差记录

当实现方案与设计稿/UI 审计存在偏差时，必须在 execution.md 对应分组中记录：

- **偏差项**：具体哪个 UI 元素或交互与设计稿不同
- **偏差原因**：为何无法按设计稿实现
- **决策依据**：选择当前方案的理由

#### Step 5: 编译 + 渲染抽检

1. **编译验证**：运行 `tsc --noEmit` 或 `npm run build -- --analyze`，修复所有编译错误后再继续
2. **样式合规速查**：检查本分组新增/修改的 `.scss` 文件中是否存在硬编码 hex 或 magic number（无 `var(--xlb-*)` 包裹的值），发现则修复
3. **导航合规速查**：检查本分组新增/修改的 `.tsx` 文件中是否存在 `history.push` / `history.replace`，发现则替换为 `useXlbRouter`

#### Step 5.5: 设计偏差捕捉

在每个分组编译通过后，检查生成的代码样式是否符合设计规格：

1. 读取 `execution.md` 中本分组的「解析数据已读」日志，确认已消费
2. 读取 `parsed-styles/*.json` 中本分组涉及的样式数据
3. 读取 `ui-audit.md` 中对应组件的三要素表
4. **逐属性检查**：至少检查以下 4 项必查属性：
   - `layout.height` → 代码中的高度是否符合 parsed 值（使用对应的 CSS 变量）
   - `typography.fontSize` → 字号是否符合（使用 `var(--xlb-fontSize-*)`）
   - `typography.color` → 颜色值是否符合（使用 `var(--xlb-color-*)`）
   - `spacingStyle.backgroundColor` → 背景色是否符合
5. 输出「设计偏差记录表」到 `execution.md`：

```markdown
#### 设计偏差记录 — 分组 N

| #   | 元素   | 属性   | 预期(CSS变量)       | 实际(代码) | 偏差类型 | 严重度 | 处理方案 |
| --- | ------ | ------ | ------------------- | ---------- | -------- | ------ | -------- |
| 1   | 标题栏 | height | var(--xlb-space-48) | 44px       | layout   | major  | 立即修复 |
```

偏差类型枚举：`layout | typography | spacing | icon | color | missing`
严重度枚举：`critical`（功能缺失）/ `major`（视觉明显不符）/ `minor`（细微偏差）
处理方案枚举：`立即修复` / `defer 到 verify` / `不可修复-原因`

6. **同步偏差库**：将新偏差追加到 `.ai-wiki/design-deviation-db.json`
   - 新偏差 → 追加新条目（生成 DEV-ID）
   - 命中已知偏差（component + defectType 匹配） → 仅 `occurrenceCount++`, `lastOccurred` 更新

#### Step 6: 更新 execution.md

将该分组标题标记为 ✅，在对应 Step 行末尾追加 `实际: MM 分钟`，确认「解析数据已读」日志已填写。

**同步维护「恢复入口」标记：**

```markdown
## 恢复入口

- 当前进度：分组 X 已完成
- 下一步：分组 Y Step 1（读设计文档）
- 最后更新：YYYY-MM-DD HH:mm
```

此标记确保模型重新加载 context 时可直接定位续接位置。

#### Step 7: 更新 features.md

将关联功能点 ⬜ → ✅；追加 `分组 N 完成: HH:MM (实际 MM 分钟)` 到「性能计时日志」。

#### Step 8: 更新 .dtc-state.json

同步更新 JSON 状态中当前需求条目的 build 字段：

```jsonc
{
  "completedGroups": N,
  "currentGroup": N + 1,
  "createdFiles": ["新增的文件路径"],
  "modifiedFiles": ["修改的文件路径"],
  "htmlReadLog": ["分组1: parsed-styles/cert-approve.json", "分组N: ..."],
  "completedFeatureIds": ["F-001", "F-002"]
}
```

**同步更新 `updatedAt` 时间戳。**

---

### 4. 分层验证一览

| 层级            | 时机             | 范围                                   | 结果          |
| --------------- | ---------------- | -------------------------------------- | ------------- |
| **分组自检**    | build Step 5.5   | 本分组代码 vs parsed-styles + 三要素表 | 偏差记录表    |
| **出口门禁**    | build 全部完成后 | 全部分组 + 全量扫描                    | 通过/禁止     |
| **verify 终检** | verify 阶段      | 全部分组 + 完整扫描                    | 交付/返回修复 |

---

### 5. 上下文管理

build 阶段的每个分组开始时，**增量加载**而非全量加载：

1. 读取 `execution.md`（从中获取当前分组任务和「恢复入口」标记）
2. 读取 `parsed-styles/*.json` 中对应页面的数据
3. 读取 `ui-audit.md` 中对应分组的规格部分（非整个文件）
4. 读取 `tech-design.md` 中对应分组的决策部分（非整个文件）
5. **不加载**已完成分组的代码文件

---

## 出口门禁（必须全部通过才能进入 verify 阶段）

在所有分组执行完毕后，**强制执行以下校验**：

1. **分组完成度**：读取 `execution.md`，检查所有分组标题是否均标记 ✅ — 有遗漏则列出，禁止进入 verify 阶段
2. **功能点完成度**：读取 `features.md`，检查是否仍有 `⬜` — 有则列出遗漏功能点
3. **解析数据消费完整性**：检查 `execution.md` 中每个分组的「解析数据已读」日志是否已填写 — 有缺失则标记
4. **样式合规终检**：对本次新增/修改的 `.scss` 文件搜索硬编码 hex 色值（`#` + 6 位十六进制）和 magic number，检查是否使用了 `var(--xlb-*)`。发现硬编码 → 统一修复。修复时**禁止**为改样式而简化功能
5. **导航合规终检**：搜索本次新增/修改的 `.tsx` 文件中的 `history.push` / `history.replace`。存在 → 替换为 `useXlbRouter`，**禁止进入 verify 阶段**，修复后重新校验
6. **defer/待处理项消费检查**：扫描 `execution.md` 中所有标注为 `defer`、`待处理`、`verify 处理`、`后续处理` 的条目，为每条生成对应的修复动作项。所有 defer 项必须在进入 verify 阶段前闭环（已修复 或 明确标注「设计不可实现-原因」）
7. **偏差库同步检查**：扫描 `design-deviation-db.json` 中当前需求关联的偏差条目，确认所有 `severity === "critical"` 的条目已有 `处理方案` 或已 `resolved`
8. **授权检查**：检查使用 `useHasAuth` 的组件是否与功能点中的权限要求一致
9. **路由注册检查**：新增页面是否在集中式路由配置 `src/config/route.ts` 中注册

**全部通过后**：

- 汇报：「全部 N 个分组已执行，M 个功能点已标记完成，样式合规终检通过，导航合规检查通过，defer 项全部闭环，偏差库已同步」
- 更新 `.ai-wiki/.dtc-state.json` 当前需求条目：`build.exitGatePassed = true`, `build.checklistPassed = true`
- 推进 `currentPhase` 到 `verify`

**任一项不通过** → 修正后重新校验

---

## 中断恢复

如果在执行中途被中断：

1. 下次启动时 `Read .ai-wiki/.dtc-state.json`
2. 检查当前需求条目的 `build.completedGroups` 和 `build.currentGroup`
3. 跳到当前未完成的分组
4. **上下文恢复检测**：检查上一个已完成分组的 `htmlReadLog`，如果日志缺失或在旧版格式下为裸 HTML 路径，提示：
   ```
   检测到上一分组可能跳过了样式数据读取步骤（无「解析数据已读」日志），建议重新执行该分组的样式还原部分
   ```
5. 如果用户选择重新执行，重新读取 `parsed-styles` JSON 并对比已生成的代码，修复样式偏差

---

## 禁止

- 未完成所有步骤就汇报分组完成或跳到下一分组
- 使用 `history.push` 或裸字符串路径导航（必须用 `useXlbRouter`）
- 在 SCSS 中写硬编码 hex 色值或 magic number（必须用 `var(--xlb-*)`）
- **Step 2 中未读取 `api-spec.md` 就直接用猜测的格式写 API 调用。**
- **Step 4 中未对照 `api-spec.md` 的字段综合映射表就生成 renderItem/详情/表单字段。**
- 省略 API 响应字段
- Step 2 中未记录「解析数据已读」日志就跳到下一步
- 一次生成过多文件而不更新 checkpoint
- **H5 项目不需要 SafeInput/SafeUploadFile/SafeComponents.tsx（那是 RN 特有的）**
- **H5 项目不需要 Step 3.5 模式对齐确认表（那是 H5→RN 重构的 RN 特有步骤）**
- H5 不需要 dependencies 禁用检查（XlbProDetail 内部处理，不存在该问题）
