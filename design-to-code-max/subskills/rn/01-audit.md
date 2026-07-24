# Phase 05 - UI 审计与组件映射（RN）

## 进入条件

- 已 `Read .ai-wiki/.dtc-state.json`。
- `phaseOutputs.api-spec.checklistPassed === true` 且 `phaseOutputs.api-spec.userConfirmed === true`。
- `currentPhase` 为 `audit`。

---

## 任务

> 上下文预算：本阶段读写遵循 `../../reference/common/context-budget.md`——不整篇回读需求原始材料（引用落盘路径）；ui-audit.md 超限时按压缩红线处理（三要素表全等行可合并，组件决策表「差异+补偿方案」列不得删）。

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

> ❗️ 铁律：截图目录存在但 `screenshotList` 为空 → 停下追问；用户未明确「无截图」时禁止推进到 Step 2。

---

### Step 2: 运行 HTML 结构化解析引擎

对每个 HTML 文件，按 `../../reference/common/html-parser-rules.md` 执行结构化解析：

1. **读取解析规则**：`Read ../../reference/common/html-parser-rules.md`，理解解析流程和输出格式；解析/映射中的歧义处理（CSS 变量未解析、图标无映射、尺寸偏差等提问模板）见 `../../reference/common/ambiguity-rules.md`
2. **拆分 HTML**：按页面/组件 DOM 边界拆分，排除非视觉元素
3. **逐元素解析**：提取每个元素的标签、样式、文本、子元素，构建结构化数据
4. **三要素归类**：按 layout / typography / spacingStyle 三要素归类各属性
5. **Token 映射**：
   - 查 `../../reference/rn/token-map.json` 做颜色、间距、圆角、字号映射
   - 查 `../../reference/rn/icon-map.md` 做图标映射
   - 查 `../../reference/rn/xlb-style-system.md` 确认 token 语义
   - 无法映射的值记录到 `unmappedTokens`
6. **写入解析结果**：输出到 `.ai-wiki/【需求名】/parsed-styles/【page-name】.json`

**重要：**

- 每个 HTML 文件生成一个 JSON 文件
- 文件命名：`【HTML 文件名(去扩展名)】.json`
- 输出符合 `html-parser-rules.md` 第 8 节的 Schema
- 记录解析日志到 `phaseOutputs.audit.parsedStyleCount`

---

### Step 2.5: 逐张 Read 截图（强制，不得跳过）

> ❗️ **铁律：HTML 解析与截图扫读是并列的两条腿，不是二选一。** HTML 只描述静态 DOM，截图承载 HTML 未必包含的动态交互与视觉细节（展开/收起、Tab 切换、弹窗、状态标签配色、空态、错误态等）。跳过此步 = Step 3 会漏掉整整一类信息。

对 Step 1 的 `screenshotList`，**逐张调用 `Read` 工具**（图片会被视觉理解），并做以下事情：

1. **一张也不能少**：按 `screenshotList` 顺序逐张 Read，禁止「抽样」或「只看命名相关的」。
2. **提取要素**（每张截图必须回答，写入 `phaseOutputs.audit.screenshotFindings` 数组）：
   - `path`: 截图路径
   - `pageOrBlock`: 对应哪个页面/UI 块
   - `dynamicInteractions`: 从截图能看出、HTML 未必表达的**交互动作**（如「基础信息 ↓/↑ 展开收起」「Tab 切换选中态」「弹窗触发条件」）
   - `visualDetailsBeyondHtml`: HTML 里没有或不精确的**视觉细节**（如实际图标形状、状态标签配色、徽标位置、真实文案）
   - `newFeaturePoints`: 截图里发现但 `features.md` **未收录**的功能点 → 记录 ID 建议（如 `F-15-a`）
3. **交叉核对**：把每张截图的 `pageOrBlock` 与 `parsed-styles/*.json` 页面名对齐；若截图揭示 HTML 未表达的元素（如"过期/下架"红框标签），在对应 parsed JSON 旁边加 `screenshotSupplement` 备注。
4. **产出建议动作**：
   - 有 `newFeaturePoints` → **停下来，先回 feature-spec 阶段补 features.md**，再继续 Step 3。禁止「先做完 audit 再回头补」。
   - 有 `dynamicInteractions` / `visualDetailsBeyondHtml` → 在 Step 3 拆解时必须体现。
   - 截图/解析中发现 `api-spec.md` 未覆盖的接口字段（如截图展示了响应字段表没有的字段）→ 记录到 `phaseOutputs.audit.apiSpecSupplements`，并在本阶段输出前回补到 api-spec.md 对应接口的响应字段表。

**输出示例：**

```jsonc
"screenshotFindings": [
  {
    "path": ".../新增/商品信息/查看收起详细信息逻辑.png",
    "pageOrBlock": "新增页-商品信息卡",
    "dynamicInteractions": ["点击整行 → 展开/收起详细字段", "箭头 ↓/↑ 随状态翻转"],
    "visualDetailsBeyondHtml": ["收起态仅显示 3 行摘要"],
    "newFeaturePoints": ["F-15-a: 商品基础信息展开/收起"]
  }
]
```

> ❗️ 未产出 `screenshotFindings` 数组（或数组条数 ≠ `screenshotList` 条数）→ audit 不通过，禁止推进。

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

### Step 4: 填充三要素对比表

从 parsed JSON 的 layout / typography / spacingStyle 数据中读取，填充到 ui-audit.md 的「关键样式规格」章节。

**每个 UI 块必须逐一填写以下三张表：**

#### 4.1 Layout 布局表

从 parsed JSON 中 `element.layout` 字段读取：

| 属性           | HTML 值       | token 映射     | 确认 |
| -------------- | ------------- | -------------- | ---- |
| display        | flex          | —              | ✅   |
| flexDirection  | row           | —              | ✅   |
| height         | 48px          | SPACE.SPACE_12 | ✅   |
| justifyContent | space-between | —              | ✅   |
| alignItems     | center        | —              | ✅   |
| padding        | 0 16px        | SPACE.SPACE_4  | ✅   |
| gap            | 8px           | SPACE.SPACE_2  | ✅   |

#### 4.2 Typography 字体表

从 parsed JSON 中 `element.typography` 字段读取：

| 属性       | HTML 值 | token 映射               | 确认 |
| ---------- | ------- | ------------------------ | ---- |
| fontSize   | 14px    | FONT.SIZE_14             | ✅   |
| fontWeight | 500     | FONT.BOLD_500            | ✅   |
| lineHeight | 20px    | FONT.LINE_HEIGHT_20      | ✅   |
| color      | #333333 | theme['color-text-body'] | ✅   |
| textAlign  | left    | —                        | ✅   |

#### 4.3 Spacing & Style 间距与修饰表

从 parsed JSON 中 `element.spacingStyle` 字段读取：

| 属性            | HTML 值 | token 映射            | 确认 |
| --------------- | ------- | --------------------- | ---- |
| borderRadius    | 4px     | BORDER.RADIUS_4       | ✅   |
| borderWidth     | 1px     | —                     | ✅   |
| borderColor     | #dddddd | theme['color-border'] | ✅   |
| backgroundColor | #ffffff | theme['color-bg']     | ✅   |
| marginBottom    | 12px    | SPACE.SPACE_3         | ✅   |

**填充规则：**

- 优先从 parsed JSON 复制数据，模型只需逐项确认标注 ✅
- 如果 parsed JSON 中某字段为 `{ "html": "...", "token": "—" }`，表示该值无对应 token，保持 `—` 标注
- 如果 parsed JSON 数据缺失（如空对象 `{}`），则回退到读原始 HTML 补充
- `unmappedTokens` 中有值的，在表格旁备注「无 token 映射」

**⚠️ 设计值 → 组件 API 映射标记：** 当 `spacingStyle.padding` 或 `spacingStyle.marginHorizontal` 存在水平内边距值（如 `0 12px`）时，必须在三要素表旁标注：

> **组件 API 映射提示**：此 padding 值需通过 `XlbForm` 的 `cellTheme` prop 全局设置（`cell_group_title_padding_horizontal`），不可加到单个 `XlbForm.Item` 的 style 上。详见 `../../reference/rn/gotchas/component-library/xlbform-celltheme-horizontal-padding.md`。

---

### Step 5: 组件选择 + 黑盒分析

#### 5.1 组件选择

**先读 `../../reference/rn/rn-guidelines.md` 的组件库使用清单**，为每个 UI 块选择对应 XLB 组件，并说明理由。

#### 5.2 表单布局方向识别

对每个表单项，从 parsed JSON 或 HTML 中识别并标注其布局方向：

- **水平布局**（label 左、value/input 右）：label 与输入控件在同一行，通常行高固定 48px，用 `space-between` 分离
  - 典型场景：文本输入行、日期选择行、下拉选择行
- **上下布局**（label 上、content 下）：label 独占一行，内容区在 label 下方，label 与内容间有竖向间距
  - 典型场景：上传区域、单选按钮组、动态列表块、多行文本区

在 ui-audit.md 的「关键样式规格」中，必须为每类表单项标注布局方向，示例：

- **表单行（水平布局）**：适用字段：名称、法人、信用代码、执照类型、有效期等。行高 48px，水平 flex space-between。
- **表单块（上下布局）**：适用字段：上传区域、证件类型选择器、动态员工列表等。label 下方 marginBottom 间距，内容区占整行宽度。

未标注布局方向的表单项 → 审计不通过。

#### 5.3 黑盒组件渲染差异分析

对每个 UI 元素，检查项目组件库（如 `CommonFormItem`、`XlbUploadFile`、`XlbCard`）的默认渲染输出，与 HTML 目标的差异。具体回答：

- 该 UI 元素如果用组件库的 XX 组件渲染，默认输出是什么？
- 与 HTML 目标的关键差异在哪（行高、分隔线、对齐方式、尺寸等）？
- 是否需要额外定制（插入分隔线、自定义行高、覆写样式）？
- 引用 `../../reference/rn/gotchas/component-library/blackbox-wrapper-component.md` 识别黑盒封装组件风险

---

### Step 6: 偏差库预标注

1. **读取偏差库**：`Read .ai-wiki/design-deviation-db.json`
2. 如果文件不存在 → 跳过此步
3. 筛选 `resolved !== true` 的活跃条目
4. 逐条比对当前组件列表中的组件名称
5. 匹配项 → **预标注到 ui-audit.md 的「组件库渲染差异分析」章节**：

```markdown
| UI 元素    | 候选组件       | 默认渲染                | 差异       | 定制 | 补偿方案                                                                               |
| ---------- | -------------- | ----------------------- | ---------- | ---- | -------------------------------------------------------------------------------------- |
| 表单字段行 | CommonFormItem | XlbForm.Item 默认行布局 | 行高不可控 | 是   | 【来源：偏差库 DEV-001】自定义 View 包裹 height:SPACE.SPACE_12 + justifyContent:center |
```

6. 更新 `phaseOutputs.audit.deviationMatches` 为命中条目数

---

## 输出要求

### 文档输出

使用 `../../templates/rn/ui-audit.md.tpl` 格式生成 `ui-audit.md`，包含以下章节：

1. **扫描配对清单** — HTML + 截图配对状态
2. **功能点 UI 覆盖检查** — 每个功能点的 UI 材料覆盖情况
3. **关键样式规格** — 三要素表（由 Step 4 填充）

   格式示例：

   ```markdown
   ### 【组件名】三要素对比

   #### Layout 布局

   | 属性 | HTML 值 | token 映射 | 确认 |
   | display | flex | — | ✅ |

   #### Typography 字体

   | fontSize | 14px | FONT.SIZE_14 | ✅ |

   #### Spacing & Style 间距与修饰

   | borderRadius | 4px | BORDER.RADIUS_4 | ✅ |
   ```

4. **组件库渲染差异分析** — 含偏差库预标注
5. **缺失项汇总** — 缺失的 UI 材料及影响

如 Step 2.5 记录了 `apiSpecSupplements`（截图/解析发现的 api-spec.md 未覆盖字段），在生成 ui-audit.md 的同时将其回补到 api-spec.md 对应接口的响应字段表。

记录 `audit 完成: HH:MM (耗时 MM 分钟)` 到 features.md 的「性能计时日志」。

### 状态更新

更新 `.ai-wiki/.dtc-state.json` 中当前需求条目的 `phaseOutputs.audit`：

```jsonc
{
  "materialStatus": "complete",
  "componentDecisionCount": 8,
  "blackBoxRisks": [
    {
      "component": "XlbUploadFile",
      "risk": "默认不显示删除按钮",
      "compensation": "传入 showDelete=true",
    },
  ],
  "parsedStyleCount": 3,
  "unmappedTokens": [
    {
      "value": "14px",
      "reason": "FONT.SIZE_14 不存在",
      "action": "使用 FONT.SIZE_16 近似",
    },
  ],
  "deviationMatches": 2,
  "checklistPassed": true,
  "userConfirmed": false,
}
```

同时将 `docPaths.uiAudit` 设置为生成的 ui-audit.md 路径，`docPaths.parsedStylesDir` 设置为 parsed-styles 目录路径。

### Checklist（必须全部满足才能标记 checklistPassed: true）

- [ ] ui-audit.md 已生成且包含完整章节
- [ ] Step 2 HTML 结构化解析已完成，parsed-styles JSON 已输出
- [ ] **Step 2.5 截图已逐张 Read**，`screenshotFindings` 条数 = `screenshotList` 条数（用户明确「无截图」除外）
- [ ] 截图揭示的 `newFeaturePoints` 已回补到 features.md（如有）
- [ ] 截图/解析发现的 api-spec.md 未覆盖字段已回补到 api-spec.md（如有）
- [ ] **三要素表已填充**（每个 UI 块包含 Layout / Typography / Spacing 三张表，且逐项确认 ✅）
- [ ] 每个 UI 块有组件选择 + 理由
- [ ] 每个含交互的 UI 块，关键交互行为列出了 `screenshot` 来源证据
- [ ] 黑盒组件差异分析已完成（不跳过"默认渲染差异"列）
- [ ] 样式规格已 token 化（非原始 hex/px）
- [ ] 图标已映射到 XlbIcon name（未映射的标注「图标无映射」）
- [ ] 偏差库预标注已完成（如偏差库存在）
- [ ] 性能计时日志已记录

---

## 用户确认门禁

1. **必须停下来向用户确认**：输出组件选择决策表摘要和黑盒风险 summary，使用 `AskUserQuestion` 询问：

   ```
   问题：UI 审计完成，共分析 N 个 UI 块、N 个黑盒风险项、解析 M 个 HTML 文件。
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
- **不能只看 HTML 不看截图**，或反之——两者是并列强制项
- 不能对用户谎称「截图已看」；若实际未 Read 截图，必须诚实说明并立即补读
- 不能跳过"默认渲染差异"列
- 不能只写组件名不写理由
- 不能在样式规格中写死 hex/px 而不用 token
- 不能不读 HTML/截图/parsed-styles 就生成审计报告
- 不能跳过三要素表
