# Phase 05 - UI 审计与组件映射（PC）

## 进入条件

- 已 `Read .ai-wiki/.dtc-state.json`。
- `phaseOutputs.api-spec.checklistPassed === true` 且 `phaseOutputs.api-spec.userConfirmed === true`。
- `currentPhase` 为 `audit`。
- `inputs.platform === "pc"`。

---

## 任务

### Step 1: 收集 UI 材料

使用 `AskUserQuestion` 询问：「请提供 HTML 文件 + 对应截图的目录路径，我会自动扫描并对照功能点生成 UI 完整性报告」

- 自动扫描目录，按文件名模式匹配 HTML 和截图，列出配对清单
- **必须同时输出两份清单**（缺一不可）：
  - `htmlList`：所有 HTML 文件绝对路径
  - `screenshotList`：所有截图（`.png`/`.jpg`/`.jpeg`/`.webp`）绝对路径
- 根据 UI 材料齐全程度确定策略：
  - **全部齐全** → 后续执行阶段必须按 ui-audit 还原样式
  - **部分缺失** → 已覆盖的必须还原，未覆盖的按通用样式实现并标记「UI 待补充」
  - **用户明确跳过** → 全部标记「UI 待补充」，按通用样式实现
- 将 HTML 文件列表写入 `inputs.htmlPath`，截图列表写入 `inputs.screenshotPath`
- 记录材料状态到 `phaseOutputs.audit.materialStatus`

> 铁律：截图目录存在但 `screenshotList` 为空 → 停下追问；用户未明确「无截图」时禁止推进到 Step 2。

---

### Step 2: 运行 HTML 结构化解析引擎

对每个 HTML 文件，按 `../../reference/common/html-parser-rules.md` 执行结构化解析：

1. **读取解析规则**：`Read ../../reference/common/html-parser-rules.md`，理解解析流程和输出格式
2. **拆分 HTML**：按页面/组件 DOM 边界拆分，排除非视觉元素
3. **逐元素解析**：提取每个元素的标签、样式、文本、子元素，构建结构化数据
4. **三要素归类**：按 layout / typography / spacingStyle 三要素归类各属性
5. **Token 映射**：
   - 查 `../../reference/pc/pc-guidelines.md` 的 Less 变量与样式约定做颜色、间距、圆角、字号映射
   - 无法映射的值记录到 `unmappedTokens`
   - 解析/映射中的歧义处理（色值未解析、图标无映射、尺寸偏差等提问模板）见 `../../reference/common/ambiguity-rules.md`
6. **写入解析结果**：输出到 `.ai-wiki/【需求名】/parsed-styles/【page-name】.json`

**重要：**

- 每个 HTML 文件生成一个 JSON 文件
- 文件命名：`【HTML 文件名(去扩展名)】.json`
- 输出符合 `html-parser-rules.md` 第 8 节的 Schema
- 记录解析日志到 `phaseOutputs.audit.parsedStyleCount`

---

### Step 2.5: 逐张 Read 截图（强制，不得跳过）

> 铁律：HTML 解析与截图扫读是并列的两条腿，不是二选一。HTML 只描述静态 DOM，截图承载 HTML 未必包含的动态交互与视觉细节。

对 Step 1 的 `screenshotList`，**逐张调用 `Read` 工具**（图片会被视觉理解），并做以下事情：

1. **一张也不能少**：按 `screenshotList` 顺序逐张 Read，禁止「抽样」或「只看命名相关的」。
2. **提取要素**（每张截图必须回答，写入 `phaseOutputs.audit.screenshotFindings` 数组）：
   - `path`: 截图路径
   - `pageOrBlock`: 对应哪个页面/UI 块
   - `dynamicInteractions`: 从截图能看出、HTML 未必表达的**交互动作**（如「折叠面板展开/收起」「Tab 切换选中态」「弹窗触发条件」）
   - `visualDetailsBeyondHtml`: HTML 里没有或不精确的**视觉细节**（如实际图标形状、状态标签配色、徽标位置、真实文案）
   - `newFeaturePoints`: 截图里发现但 `features.md` **未收录**的功能点 → 记录 ID 建议
3. **交叉核对**：把每张截图的 `pageOrBlock` 与 `parsed-styles/*.json` 页面名对齐；若截图揭示 HTML 未表达的元素，在对应 parsed JSON 旁边加 `screenshotSupplement` 备注。
4. **产出建议动作**：
   - 有 `newFeaturePoints` → **停下来，先回 feature-spec 阶段补 features.md**，再继续 Step 3。禁止「先做完 audit 再回头补」。
   - 截图/解析中发现 `api-spec.md` 未覆盖的接口字段 → 记录到 `phaseOutputs.audit.apiSpecSupplements`，并在本阶段输出前回补到 api-spec.md 对应接口的响应字段表。
   - 有 `dynamicInteractions` / `visualDetailsBeyondHtml` → 在 Step 3 拆解时必须体现。

**输出示例：**

```jsonc
"screenshotFindings": [
  {
    "path": ".../列表页/列表页完整.png",
    "pageOrBlock": "列表页-主界面",
    "dynamicInteractions": ["点击搜索按钮触发查询", "点击状态标签跳转筛选", "编辑弹窗从右侧滑出"],
    "visualDetailsBeyondHtml": ["状态标签颜色：启用绿、禁用红、待审核黄"],
    "newFeaturePoints": ["F-15-a: 批量导出功能"]
  }
]
```

> 未产出 `screenshotFindings` 数组（或数组条数 ≠ `screenshotList` 条数）→ audit 不通过，禁止推进。

---

### Step 3: 逐块拆解 UI（HTML + 截图 双源交叉）

对照 parsed-styles JSON 数据 + `screenshotFindings`，逐块拆解 UI。

- **静态结构 / 布局 / token 值** → 优先从 parsed JSON 读取，而非裸读 HTML
- **动态交互 / 视觉细节 / 状态变化** → 优先从 `screenshotFindings` 读取
- 需要确认父子层级关系时交叉验证原始 HTML
- 无法通过 parsed JSON 或截图回答的问题（如图片的精确 src、placeholder 文案）回退到读原始 HTML

对每个 UI 块标注：

- 所属页面/组件
- 关联功能点 ID（从 features.md 获取）
- 关键交互行为（**必须引用来自 `screenshotFindings` 的证据**，若截图有相关信息）
- 视觉细节来源：`parsed-json` / `screenshot` / `html-raw`（三选一或多选）

---

### Step 4: 页面模式识别与组件映射

#### 4.1 页面模式识别

根据 UI 结构识别页面模式，并选择对应 PC 容器组件：

| 设计特征                            | 页面模式 | PC 容器组件           |
| ----------------------------------- | -------- | --------------------- |
| 顶部搜索区 + 工具栏按钮 + 数据表格  | Mode A   | `XlbPageContainer`    |
| 搜索 + 表格 + 详情 + 增删改导出一体 | Mode B   | `XlbProPageContainer` |
| 自定义卡片布局、仪表盘、看板        | Mode C   | 自定义布局            |

#### 4.2 组件映射

根据 `../../reference/pc/component-mapping.md`，为每个 UI 块选择对应 `@xlb/components` 组件：

| UI 块类型     | 推荐组件                                   | 使用方式                     |
| ------------- | ------------------------------------------ | ---------------------------- |
| 搜索区域      | `XlbForm`                                  | `formList: SearchFormType[]` |
| 详情/编辑表单 | `XlbBasicForm` + `XlbBasicForm.Item`       | CSS Grid 三列                |
| 数据表格      | `XlbTable` + `XlbTableColumnProps`         | 列定义                       |
| 工具栏按钮    | `XlbButton.Group`                          | 操作按钮                     |
| 弹窗          | `ProPageModal` / `NiceModal` + `fsmsModal` | 视场景选择                   |
| 状态标签      | `StatusColorByOptions`                     | 颜色映射                     |

#### 4.3 组件选择决策表

填写组件选择决策表：每个 UI 块对应使用的组件、默认渲染差异、是否需要定制、补偿方案。

参考 `../../reference/pc/pc-guidelines.md` 和 `../../reference/pc/component-mapping.md`。

#### 4.4 三要素对比表

从 parsed JSON 的 layout / typography / spacingStyle 数据中读取，填充到 ui-audit.md 的「关键样式规格」章节。

**每个 UI 块必须逐一填写以下三张表：**

##### Layout 布局表

从 parsed JSON 中 `element.layout` 字段读取：

| 属性           | HTML 值       | CSS 值        | 确认 |
| -------------- | ------------- | ------------- | ---- |
| display        | flex          | flex          | ✅   |
| flexDirection  | row           | row           | ✅   |
| height         | 48px          | 48px          | ✅   |
| justifyContent | space-between | space-between | ✅   |
| alignItems     | center        | center        | ✅   |
| padding        | 0 16px        | 0 16px        | ✅   |
| gap            | 8px           | 8px           | ✅   |

##### Typography 字体表

从 parsed JSON 中 `element.typography` 字段读取：

| 属性       | HTML 值 | CSS 值 | 确认      |
| ---------- | ------- | ------ | --------- |
| fontSize   | 14px    | 14px   | ✅        |
| fontWeight | 500     | 500    | ✅        |
| lineHeight | 20px    | 20px   | ✅        |
| color      | #333333 | --     | Less 变量 |
| textAlign  | left    | left   | ✅        |

##### Spacing & Style 间距与修饰表

从 parsed JSON 中 `element.spacingStyle` 字段读取：

| 属性            | HTML 值 | CSS值/ Less变量 | 确认      |
| --------------- | ------- | --------------- | --------- |
| borderRadius    | 4px     | 4px             | ✅        |
| borderWidth     | 1px     | 1px             | ✅        |
| borderColor     | #dddddd | --              | Less 变量 |
| backgroundColor | #ffffff | --              | Less 变量 |
| marginBottom    | 12px    | 12px            | ✅        |

> PC 端样式值直接使用 CSS px 值，色值映射到 Less 变量（`@color_link`、`@color_danger` 等）。参见 `../../reference/pc/pc-guidelines.md`。

---

### Step 5: 组件选择 + 决策表

#### 5.1 组件选择

**先读 `../../reference/pc/pc-guidelines.md` 的组件库使用清单**，为每个 UI 块选择对应 `@xlb/components` 组件，并说明理由。

#### 5.2 表单模式识别

对每个表单区域，识别其模式：

- **搜索表单**：使用 `XlbForm` + `SearchFormType[]` 配置式定义
- **编辑/详情表单**：使用 `XlbBasicForm` + `XlbBasicForm.Item` 声明式定义，配合 CSS Grid 三列布局
- **混合表单**：搜索部分用 XlbForm，弹窗内编辑用 XlbBasicForm

#### 5.3 操作与交互识别

识别 UI 中的操作按钮和交互模式：

- **工具栏操作**：`XlbButton.Group`，包含新增、导出、批量操作等
- **表格行操作**：`XlbButton type="link"`，包含编辑、删除、查看详情等
- **复合操作**：`XlbDropdownButton`，包含导出格式选择等
- **确认弹窗**：`XlbTipsModal`，删除等危险操作前的确认
- **消息提示**：`XlbMessage`，操作结果反馈

---

### Step 6: 偏差库预标注

1. **读取偏差库**：`Read .ai-wiki/design-deviation-db.json`
2. 如果文件不存在 → 跳过此步
3. 筛选 `resolved !== true` 的活跃条目
4. 逐条比对当前组件列表中的组件名称
5. 匹配项 → **预标注到 ui-audit.md 的「组件库渲染差异分析」章节**

---

## 输出要求

### 文档输出

使用 `../../templates/pc/ui-audit.md.tpl` 格式生成 `ui-audit.md`，包含以下章节：

1. **扫描配对清单** — HTML + 截图配对状态
2. **页面模式识别** — Mode A / B / C 判定及理由
3. **功能点 UI 覆盖检查** — 每个功能点的 UI 材料覆盖情况
4. **关键样式规格** — 三要素表（由 Step 4 填充）
5. **组件选择决策表** — 组件映射 + 默认渲染差异 + 补偿方案
6. **组件库渲染差异分析** — 黑盒组件差异（识别方法参考 `../../reference/common/gotchas/blackbox-wrapper-component.md`）+ 偏差库预标注
7. **缺失项汇总** — 缺失的 UI 材料及影响

若 `phaseOutputs.audit.apiSpecSupplements` 非空，先将补充字段回补到 api-spec.md 对应接口的响应字段表，再输出本阶段文档。

记录 `audit 完成: HH:MM (耗时 MM 分钟)` 到 features.md 的「性能计时日志」。

### 状态更新

更新 `.ai-wiki/.dtc-state.json` 中当前需求条目的 `phaseOutputs.audit`：

```jsonc
{
  "materialStatus": "complete",
  "pageMode": "mode_a",
  "componentDecisionCount": 8,
  "parsedStyleCount": 3,
  "unmappedTokens": [],
  "deviationMatches": 0,
  "checklistPassed": true,
  "userConfirmed": false,
}
```

同时将 `docPaths.uiAudit` 设置为生成的 ui-audit.md 路径，`docPaths.parsedStylesDir` 设置为 parsed-styles 目录路径。

### Checklist（必须全部满足才能标记 checklistPassed: true）

- [ ] ui-audit.md 已生成且包含完整章节
- [ ] Step 2 HTML 结构化解析已完成，parsed-styles JSON 已输出
- [ ] Step 2.5 截图已逐张 Read，`screenshotFindings` 条数 = `screenshotList` 条数（用户明确「无截图」除外）
- [ ] 截图揭示的 `newFeaturePoints` 已回补到 features.md（如有）
- [ ] 截图/解析发现的 api-spec.md 未覆盖字段已回补（如有）
- [ ] **页面模式已识别**（Mode A / B / C），且理由充分
- [ ] 三要素表已填充（每个 UI 块包含 Layout / Typography / Spacing 三张表）
- [ ] 每个 UI 块有组件选择 + 理由
- [ ] 组件选择决策表已输出（含差异分析和补偿方案）
- [ ] 样式规格使用 CSS px 值 + Less 变量
- [ ] 偏差库预标注已完成（如偏差库存在）
- [ ] 性能计时日志已记录

---

## 用户确认门禁

1. **必须停下来向用户确认**：输出页面模式、组件选择决策表摘要，使用 `AskUserQuestion` 询问：

   ```
   问题：PC UI 审计完成，共分析 N 个 UI 块、识别为 Mode {A/B/C}、解析 M 个 HTML 文件。
   是否确认进入技术设计？
   选项：
   - 确认，进入技术设计
   - 需要调整（我会输入修改意见）
   ```

2. 用户确认后将 `userConfirmed` 设为 `true`，推进到 `design` 阶段。
3. 如需调整，更新决策表并重新确认。

---

## 禁止

- 不能跳过 Step 2 HTML 结构化解析（UI 材料完整时）
- **不能跳过 Step 2.5 截图逐张 Read**（用户明确「无截图」除外）
- 不能只看 HTML 不看截图，或反之
- 不能跳过页面模式识别
- 不能跳过组件选择决策表
- 不能在样式规格中写死 hex 色值（使用 Less 变量）
- 不能使用 Ant Design 原生组件替代 `@xlb/components` 封装组件
