# Phase 04 — API 规格设计

## 进入条件

- 已 `Read .ai-wiki/.dtc-state.json`。
- `phaseOutputs.analyze.checklistPassed === true` 且 `phaseOutputs.analyze.userConfirmed === true`。
- `phaseOutputs.collect-materials.checklistPassed === true` 且 `phaseOutputs.collect-materials.userConfirmed === true`。
- `phaseOutputs.feature-spec.checklistPassed === true` 且 `phaseOutputs.feature-spec.userConfirmed === true`。
- `currentPhase` 为 `api-spec`。

## 阶段定位

```
feature-spec → api-spec → audit → design(引用 api-spec) → build(查 api-spec)
                  ↓
            api-spec.md
            入参 | 出参 | 字段→UI映射 | mock模板 | 状态
```

- **位置**：feature-spec 之后、audit 之前。API 设计与 UI 设计并行无关，先定 API 再审计不会产生冲突。
- **目的**：在 pipeline 中建立 API 的**唯一事实来源**。所有后续阶段（design/build/verify）关于 API 的问题，都以 api-spec.md 为准，不允许多头解释。
- **状态管理**：api-spec.md 内的每个 API 可独立标记状态。未就绪的 API 不影响其他阶段的推进（使用 mock 模板替代）。

## 输入来源

| 需求类型                                | 主要来源                                                  | 次要参考                     |
| --------------------------------------- | --------------------------------------------------------- | ---------------------------- |
| **重构**（H5 → RN / H5 → H5 / PC → PC） | H5/PC 源码中的 API 调用代码（请求参数构造、响应字段取值） | 接口文档（如有，做交叉验证） |
| **增量/全新**                           | 接口文档（Swagger/YApi/文本）                             | 同项目已有相似接口的调用模式 |
| **混合**（重构+增量）                   | 已有功能走源码逆向，新增功能走接口文档                    | —                            |

### 来源优先级规则

1. **接口文档优先**：当接口文档和源码逆向结果不一致时，以接口文档为准，并在 spec 中标注差异
2. **无接口文档时**：完全从源码逆向分析，标注 `status: from-source`
3. **源码逆向时的 H5 参数构造代码定位**：在 H5 源码中搜索 `params` 定义、`search` state 初始值、`useMemo` 中的参数拼装逻辑、`setSearch`/`setParams` 调用、`request`/`Fsmshttp.post` 传参

## 任务

### Step 1: 确定需求类型，选择 API 输入来源

1. 从 `.dtc-state.json` 读取 `inputs.platform` 和 `inputs.requirementType`
2. 如果是 **重构**，读取 `inputs.originalCodePath` 指定的源码目录
3. 如果是 **增量**，使用 `AskUserQuestion` 询问：「请提供接口文档（Swagger/YApi 链接或接口定义文本），如果没有接口文档，我会从现有代码中类似的接口调用模式推导」

### Step 2: 分析 API 入参

对**每个 API**（从 features.md 的「接口清单表」中获取 URL 列表；清单缺失或不全时，回退到在源码中全局搜索 `request` / `Fsmshttp` 等接口调用补齐清单），分析其请求参数：

#### 2.1 重构模式：从源码逆向

1. 在源码中搜索该 API URL 的调用位置
2. 定位**参数构造代码**（params 定义、search state、useMemo 拼装逻辑）
3. 提取每个参数的：
   - **参数名**（保持和源码一致）
   - **类型**（string / string[] / number / boolean / object）
   - **必填**（是/否，从调用链判断）
   - **默认值**（初始值定义，如 `date: [月初, 月末]`）
   - **来源变量**（源码中的变量名，如 `keyword` / `search.date` / `selectedStates`）
   - **说明**（业务语义）

#### 2.2 增量模式：从接口文档

1. 逐接口提取请求参数定义
2. 对于文档中未明确的参数（如分页参数 page_num/page_size），参考项目已有页面的模式补充
3. 对于文档中缺失的必填参数，标注「待确认」

#### 2.3 输出：请求参数表

```markdown
| 参数名          | 类型     | 必填 | 默认值                                      | 来源           | 说明         |
| --------------- | -------- | ---- | ------------------------------------------- | -------------- | ------------ |
| keyword         | string   | 否   | undefined                                   | search keyword | 搜索关键词   |
| date            | string[] | 否   | [月初,月末]                                 | search.date    | 日期范围     |
| states          | string[] | 否   | []                                          | search.states  | 状态多选     |
| orders          | object[] | 否   | [{direction:'DESC',property:'create_time'}] | H5 硬编码      | 排序         |
| query_date_type | string   | 否   | 'CREATE'                                    | H5 硬编码      | 日期查询类型 |
```

### Step 3: 分析 API 出参

对**每个 API**，分析其响应字段：

#### 3.1 重构模式：从源码取值路径

1. 在源码中搜索该接口响应数据的消费方式
2. 定位**取值代码**（`res?.data?.content`、`res.data?.list` 等）
3. 提取：
   - **取值路径**（如 `res.data.content`）
   - **分页字段**（如 `total_elements`）
   - **列表字段**（如 `content`，`content` 内每个 item 的可用字段）
4. 从 renderItem / 详情渲染代码中提取**每个被使用的字段**
5. 对于每个字段，标注其：
   - **数据类型**
   - **在哪些页面被使用**（列表/详情/表单）
   - **UI 用途**（展示在哪个组件/卡片）

#### 3.2 增量模式：从接口文档

1. 逐接口提取响应字段定义
2. 对于每个字段，标注预期用途（需要在 UI 的哪些位置展示）

#### 3.3 输出：响应字段表

```markdown
| 字段         | 类型   | 来源 API | 用途         | UI 元素                       | 条件显隐     |
| ------------ | ------ | -------- | ------------ | ----------------------------- | ------------ |
| item_name    | string | page     | 列表展示标题 | Index.tsx → renderItem 顶部   | —            |
| item_code    | string | page     | 列表展示     | Index.tsx → renderItem        | —            |
| quality_type | string | page     | 质量类型展示 | Index.tsx → renderItem        | —            |
| state        | enum   | page     | 状态标签     | Index.tsx → StatusTag         | —            |
| fid          | string | page     | 导航参数传递 | Index.tsx → onPress           | —            |
| problem_name | string | page     | 一级类目展示 | Index.tsx → renderItem        | 有值才显示行 |
| create_by    | string | page     | 提报人       | Index.tsx → renderItem footer | —            |
| create_time  | string | page     | 提报时间     | Index.tsx → renderItem footer | —            |
```

#### 3.4 取值路径适配（跨平台）

由于不同平台（RN/H5）的 HTTP 客户端可能返回不同的响应结构，取值路径必须按平台分别标注：

```markdown
| 平台                  | 取值路径             | 说明                       |
| --------------------- | -------------------- | -------------------------- |
| RN (fsmshttp)         | `res?.data?.content` | fsmshttp 内部已解一层 data |
| H5 (request from umi) | `res.content`        | 标准 axios 响应            |
```

**覆写规则**：如果 api-spec 阶段无法确认某个平台的取值路径（无参照页、无接口响应示例），将其标记为「待 verify 阶段确认」，不可留空或使用猜测值。

### Step 4: 构建字段综合映射表

跨接口合并相同业务含义的字段，标注在各页面中的使用方式：

```markdown
## 字段综合映射表

| 业务字段   | page 接口 | read 接口 | save 接口 | 列表页            | 详情页           | 表单页           |
| ---------- | --------- | --------- | --------- | ----------------- | ---------------- | ---------------- |
| item_name  | ✅        | ✅        | ✅        | title(FP-001)     | Section0(FP-041) | 商品名称(FP-017) |
| item_code  | ✅        | ✅        | —         | 展示(FP-001)      | Section0(FP-041) | 自动填充         |
| state      | ✅        | ✅        | —         | StatusTag(FP-001) | Banner(FP-032)   | —                |
| store_name | ✅        | ✅        | ✅        | —                 | InfoRow(FP-042)  | 门店选择(FP-013) |
```

**说明**：

- 对齐状态：✅=接口有该字段，—=接口无该字段
- 用途列：标注 FP 编号 + 页面位置
- 此表是后续 build 阶段**校验字段完整性**的直接依据

### Step 5: 标注 API 状态

每个接口的状态独立标注：

| 状态              | 含义                                        | 后续处理                                 |
| ----------------- | ------------------------------------------- | ---------------------------------------- |
| `available`       | 接口已可用（源码已调通 / 后端已上线）       | 按 spec 正常使用                         |
| `spec-only`       | 仅有接口文档 / 从需求推导，后端未开发       | build 阶段使用 mock 模板                 |
| `pending-backend` | 接口文档未提供，仅标注了 URL 和用途         | build 阶段使用 mock 模板，标记「待联调」 |
| `deprecated`      | H5 有但新页面不再使用（重构模式迁移后淘汰） | 不生成代码，在 tech-design 中标注已弃用  |

### Step 5.5: 生成 Mock 数据模板

对于 `status !== "available"` 的接口，生成 mock 数据模板：

````markdown
### Mock：qualityreport.page

```typescript
export const mockQualityReportPage = {
  code: 0,
  content: [
    {
      fid: "mock-001",
      item_name: "示例商品",
      item_code: "MOCK-001",
      state: "INIT",
      quality_type: "SELF",
      problem_name: "包装破损",
      one_category_name: "标签问题",
      create_by: "张三",
      create_time: "2026-07-01 10:00:00",
    },
  ],
  total_elements: 1,
};
```
````

````

**mock 数据规则**：
- mock 数据的字段必须和响应字段表完全一致（每个字段都有对应 mock 值）
- mock 数据的类型必须匹配字段类型（string 字段不能给 number）
- mock 数据的值要有业务语义（不要全部填 "test" 或空字符串）

### Step 6: 输出 api-spec.md

使用以下格式写入 `.ai-wiki/【需求名】/api-spec.md`：

```markdown
# API 规格 — 【需求名称】

> 生成时间: {{当前日期}}
> 来源: {{源码逆向(重构) / 接口文档(增量)}}

## 1. API 总览

| 接口名 | URL | 用途 | 关联功能点 | 状态 |
|--------|-----|------|-----------|------|
| ... | ... | ... | FP-001,FP-002 | available |

## 2. 接口详表

### 2.1 {接口名}

**URL:** /xxx
**方法:** POST

#### 请求参数表

| 参数名 | 类型 | 必填 | 默认值 | 来源 | 说明 |
|--------|------|------|--------|------|------|

#### 响应字段表

| 字段 | 类型 | 来源 API | 用途 | UI 元素 | 条件显隐 |
|------|------|----------|------|---------|---------|

#### 取值路径

| 平台 | 取值路径 |
|------|---------|
| RN | `res?.data?.content` |
| H5 | `res.content` |

## 3. 字段综合映射表

| 业务字段 | page 接口 | read 接口 | save 接口 | 列表页 | 详情页 | 表单页 |
|---------|----------|----------|----------|--------|--------|--------|

## 4. Mock 数据

### {接口名} (status: spec-only/pending-backend)

```typescript
// mock 代码
````

## 5. API 状态清单

| 接口               | status    | 备注         |
| ------------------ | --------- | ------------ |
| qualityreport.page | available | 已从 H5 确认 |

````

更新 `.dtc-state.json` 当前需求条目的 `phaseOutputs.api-spec`：

```jsonc
{
  "apiCount": 19,
  "availableCount": 15,
  "specOnlyCount": 2,
  "pendingBackendCount": 2,
  "hasMockTemplates": true,
  "source": "source-code-reverse(重构) / api-doc(增量)",
  "docPath": ".ai-wiki/【需求名】/api-spec.md",
  "checklistPassed": true,
  "userConfirmed": false
}
````

## 后续阶段对 api-spec.md 的引用方式

| 阶段               | 引用方式                                                                                       | 约束                                                                                        |
| ------------------ | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| **audit**          | 不直接引用。UI 审计与 API 无关                                                                 | ⚠️ audit 中如果通过截图发现 api-spec.md 未覆盖的字段，必须在 audit 完成后补充到 api-spec.md |
| **design (§3.3)**  | 由现在的「定义接口参数」变为**一句话引用**：「API 规格详见 api-spec.md §2」                    | 禁止在 design §3.3 中重复定义参数结构。design 只需说明「状态管理方案」和「缓存策略」        |
| **build (Step 2)** | 每个分组读 H5 源码的参数构造逻辑改为**读 api-spec.md 对应接口的请求参数表**                    | 确定参数格式和默认值，不再自行从 H5 源码提取                                                |
| **build (Step 4)** | 生成 renderItem / 详情展示 / 表单字段时，**必须对照 api-spec.md 的字段综合映射表和响应字段表** | 每个渲染字段在代码中标注 FP-xxx 编号。表中有的字段代码中必须有，表中没有的字段代码中不能有  |
| **verify**         | 验证 API 相关的 3 项合规性                                                                     | 见下方「verify 阶段新增检查项」                                                             |

### verify 阶段新增检查项

在现有的 verify 阶段（`04-verify.md`）中追加以下 API 相关检查：

```markdown
## API 合规检查

1. **字段完整性检查**：遍历 api-spec.md 中所有 `status !== "spec-only"` 的接口，对照「字段综合映射表」中标注「✅」的字段，检查代码中是否均已使用（列表页/详情页/表单页逐项比对）
2. **取值路径检查**：对照 api-spec.md 的取值路径配置，扫描代码中每个 API 调用的数据提取方式（`res?.data?.content` vs `res.data`），确认未多解或少解一层
3. **参数默认值检查**：对照 api-spec.md 的请求参数表，检查代码中每个 API 调用的默认值是否正确实现（如列表页默认当月日期范围）
4. **mock 替换检查**：对于 `status === "pending-backend"` 的接口，检查是否还残留 mock 代码或仅使用 mock 数据（应在联调后移除 mock）
```

## 性能计时

记录 `api-spec 完成: HH:MM (耗时 MM 分钟)` 到 features.md 的「性能计时日志」。

## Checklist（必须全部满足才能标记 checklistPassed: true）

- [ ] api-spec.md 已生成且包含完整章节
- [ ] 每个 API 有完整的请求参数表（参数名、类型、必填、默认值、来源、说明）
- [ ] 每个 API 有完整的响应字段表（字段、类型、来源 API、用途、UI 元素）
- [ ] 字段综合映射表已输出
- [ ] 取值路径已按平台标注
- [ ] 每个接口的 status 已标注（available / spec-only / pending-backend）
- [ ] status 非 available 的接口均已生成 mock 数据模板
- [ ] mock 数据字段与响应字段表一致，类型匹配，有业务语义的值
- [ ] features.md 已追加「性能计时日志」的 api-spec 记录
- [ ] 接口来源已记录（source-code-reverse / api-doc）

## 用户确认门禁

**必须停下来向用户确认**：使用 `AskUserQuestion` 询问：

```text
问题：Phase 04 API 规格设计完成，共分析 N 个接口（available: M, spec-only: K, pending-backend: L），生成了 X 份 mock 模板。

是否确认进入 UI 审计？
选项：
- 确认，进入 UI 审计
- 需要调整（我会输入修改意见）
```

用户确认后将 `userConfirmed` 设为 `true`，推进 `currentPhase` 到 `audit`。

## 禁止

- 不能在不读 H5 源码（重构模式）或不读接口文档（增量模式）的情况下凭空编写请求参数表
- 不能省略任何接口的请求参数表（至少标注参数名+类型，即使不确定类型也写「待确认」）
- 不能省略字段综合映射表（零遗漏规则：每个接口的每个字段都必须有一行）
- 不能为 status=available 的接口提供 mock 模板（不应存在 mock 数据与正式数据两套）
- 不能 mock 数据与实际字段类型不一致（如 string 字段给 number）
- 不能 mock 数据全部填 "test" 或空字符串（必须有业务语义）
- 取值路径不能留空（不确定时标注「待 verify 确认」而不是空白）
- 不能将 api-spec 阶段放在 audit 之后（API 设计不依赖 UI 审计结果）
