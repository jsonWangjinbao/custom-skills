# Phase 01 - 入口与需求分析

## 进入条件

- 已 `Read .ai-wiki/.dtc-state.json`。
- `currentPhase` 为 `init` 或 `analyze`。

---

## 初始化入口（Init）

此段仅在 `currentPhase === "init"` 时执行。用于检测已有需求状态，引导用户选择新需求或续接。

### 1. 状态检测

读取 `.dtc-state.json` 后：

1. **文件不存在或 `requirements` 为空数组** → 直接进入「新需求流程」（第 2 节）
2. **`requirements` 存在一个或多个条目** → 展示需求总览表，使用 `AskUserQuestion` 询问：

```
问题：请选择要处理的需求：

| # | 需求名称 | 类型 | 当前阶段 | 状态 | 完成度 |
|---|---------|------|---------|------|--------|
| 1 | 企业认证改版 | 增量 | build | 进行中 | 分组 3/8 |
| 2 | 员工管理重构 | 重构 | done | 已完成 | — |

选项：
- 需求 1：企业认证改版（继续）
- 需求 2：员工管理重构（查看/修改）
- 开始新需求
```

1. 根据用户选择：
   - **已有未完成需求** → 加载对应需求条目，按 `currentPhase` 跳到对应 subskill
   - **已有已完成需求（status === done）** → 询问是否修改
     - **小改**（≤3 功能点、不涉及接口结构、不改路由） → 追加 `changeLog`，`currentPhase` 回退到 `build`
     - **大改/新功能**（>3 功能点、或涉及接口/路由） → 走新需求流程
   - **开始新需求** → 走新需求流程（第 2 节）

### 2. 新需求流程

> **❗️ 执行铁律（不得违反）**：
>
>
> 1. **一次 AskUserQuestion 只能包含 1 个问题**，严禁将多个问题打包。本节 5 个问题必须拆为 **5 次独立调用**，按编号顺序经此询问。
> 2. **每个问题的 header、question 文字、options 均为固定模板**，必须与下方规格 **逐字一致**，禁止：
>    - 改写 header 或 question 文本
>    - 新增 / 删除 / 替换 options
>    - 自行推断 “可多选”、“PRD / Figma / API 文档” 等自创选项
> 3. **严禁以普通文本输出问题**，必须调用 `AskUserQuestion` 工具。
> 4. **上一个问题的答案写入状态后**，才能发起下一个问题。

按编号 1 → 2 → 3 → 4 → 5 的顺序，**逐个调用 `AskUserQuestion`**，每次仅传 1 个问题：

**问题 1 — header: "需求名称"**

- question: `"请输入需求名称（用于创建文档目录，如：门店证件管理、订单列表）："`
- options（**固定 2 项，严禁替换为具体项目名**）：
  - `{ label: "已知名称", description: "在 Other 中输入实际需求名称" }`
  - `{ label: "待确定", description: "暂时未确定，后续讨论" }`

→ 收到答案 → 写入 `requirementName` → 发起问题 2。

**问题 2 — header: "需求类型"**

- question: `"这次是增量需求还是重构需求？"`
- options（**固定 2 项**）：
  - `{ label: "增量需求", description: "在现有 Web/RN/H5 代码上新增或修改功能" }`
  - `{ label: "重构需求", description: "H5→RN、RN→RN、Web→Web 等改写重构" }`

→ 收到答案 → 写入 `requirementType` → 发起问题 3。

**问题 3 — header: "需求文档"**

- question: `"需求文档在哪里？"`
- options（**固定 4 项**）：
  - `{ label: "飞书文档链接", description: "在 Other 中输入飞书文档 URL" }`
  - `{ label: "本地文件路径", description: "在 Other 中输入 Markdown / txt 等文件路径" }`
  - `{ label: "我直接口述", description: "在 Other 中直接输入需求描述文本" }`
  - `{ label: "暂无文档", description: "仅凭设计稿 / 截图推进" }`

→ 收到答案 → 飞书链接/本地路径写入 `inputs.requirementDocPath` 并读取；口述写入 `inputs.description`；暂无标记 `skipped` → 发起问题 4。

**问题 4 — header: "UI 材料"**

- question: `"是否有 UI 材料（设计稿 HTML / 截图）？"`
- options（**固定 4 项，单选，严禁改为多选 / 新增 PRD / Figma / API 等项**）：
  - `{ label: "有 HTML + 截图", description: "同时提供设计稿 HTML 文件路径和截图路径" }`
  - `{ label: "仅 HTML 文件", description: "只有设计稿 HTML 文件路径" }`
  - `{ label: "仅截图", description: "只有 UI 截图路径" }`
  - `{ label: "无 UI 材料", description: "按通用样式实现，还原度有限" }`

→ 收到答案 → 有路径写入 `inputs.htmlPath` / `inputs.screenshotPath`；无则 `materialStatus` 标 `skipped` → 发起问题 5。

**问题 5 — header: "代码路径"**

- question: `"请提供代码路径（重构需求必填：原 H5/RN 源码目录；增量需求可选）："`
- options（**固定 2 项**）：
  - `{ label: "我来提供路径", description: "在 Other 中输入实际路径" }`
  - `{ label: "增量需求 — 自动检索", description: "根据需求描述自动查找，无需提供路径" }`

→ 收到答案 → 有值写入 `inputs.originalCodePath`；选「自动检索」标为 `autoSearch`。
**重构模式未提供代码路径** → 重新发起问题 5，不得跳过。

全部 5 个问题回答完毕后，进入 2.5 初始化步骤。

#### 2.5 初始化

完成以上收集后：

1. 生成唯一 ID：`req-${Date.now()}`
2. 创建 `.ai-wiki/【需求名】/parsed-styles/` 目录
3. 在 `requirements` 数组中追加新条目：

```jsonc
{
  "id": "req-1712345678",
  "requirementName": "企业认证改版",
  "requirementType": "incremental",
  "status": "in-progress",
  "currentPhase": "analyze",
  "inputs": {
    "description": "优化认证流程，增加证件类型选择",
    "htmlPath": "path/to/file.html",
    "screenshotPath": "path/to/screenshot.png",
    "originalCodePath": "",
  },
  "docPaths": {
    "features": "",
    "uiAudit": "",
    "techDesign": "",
    "execution": "",
    "parsedStylesDir": ".ai-wiki/企业认证改版/parsed-styles/",
  },
  "phaseOutputs": {
    /* 各阶段初始空值 */
  },
  "performanceLog": [],
  "changeLog": [
    {
      "type": "initial",
      "desc": "初始需求",
      "changedItems": [],
      "timestamp": "...",
    },
  ],
}
```

1. 记录 `startedAt` 时间
2. 更新 `.dtc-state.json`
3. 推进 `currentPhase` 到 `analyze`
4. 继续下方 analyze 流程

### 3. 已有需求恢复（快速入口）

当选择续接已有需求时，直接跳转到对应阶段：

| 当前阶段 | 跳转到                   | 需额外加载                                                |
| -------- | ------------------------ | --------------------------------------------------------- |
| analyze  | 跳到下方「需求分析」流程 | 无                                                        |
| audit    | `subskills/02-audit.md`  | features.md                                               |
| design   | `subskills/03-design.md` | features.md + ui-audit.md                                 |
| build    | `subskills/04-build.md`  | features.md + ui-audit.md + tech-design.md + execution.md |
| verify   | `subskills/05-verify.md` | 全部文档 + 已生成代码                                     |
| done     | 询问是否修改（见 1.3）   | 无                                                        |

**build 阶段恢复额外检查：**

- 读取 `execution.md` 顶部的「恢复入口」标记，而非遍历全文
- 检查上一个已完成分组的 `htmlReadLog` 或 `解析数据已读` 日志
- 日志缺失 → 提示：「检测到上一分组可能跳过了 HTML 文件读取步骤，建议重新执行该分组的样式还原部分」

---

## 需求分析（Analyze）

此段在 `currentPhase === "analyze"` 时执行，或在 init 阶段完成新需求初始化后继续执行。

### 1. 选择模式

使用 `AskUserQuestion` 询问：「这次是增量需求还是重构需求？」

- **增量** → 在当前代码仓库分析相关模块 + 需求描述 → 生成功能点
- **重构** → **必须先获取原代码并分析**，功能点以原代码为权威来源，HTML/截图仅作 UI 参考 → 生成功能点

（注：如果在 init 阶段已选择过需求类型，此处直接进入对应分支。）

### 2a. 增量模式

1. 读取需求描述或产品文档路径
2. 使用 `AskUserQuestion` 提问涉及哪些现有模块 → 读取相关代码理解现有结构
3. 结合需求 + 现有代码 → 生成 `features.md`
4. 展示给用户确认

### 2b. 重构模式（原代码是功能点唯一权威来源）

> 铁律 9：未获取并分析原代码前，禁止仅凭 HTML/截图生成功能点列表。

1. **强制索取原代码路径**：使用 `AskUserQuestion` 询问原代码路径（H5/RN/Web 源码目录或入口文件）。
   - 用户未提供 → **停下来再次索取，不得用 HTML/截图代替原代码来推断功能点**。
   - 将路径写入 `inputs.originalCodePath`。
2. **深入分析原代码**，逐一抽取功能点（这是功能点列表的主要来源）：
   - 页面/组件结构、状态与数据流
   - 接口调用（请求参数、响应字段、错误处理）
   - 表单字段、校验规则、提交逻辑
   - OCR / 上传 / 动态表单 / 权限等特殊逻辑
   - 边界与异常分支
3. 尤其关注**组件联动关系**：
   - 组件 A 值变化 → 组件 B 状态/数据变化
   - 跨表单字段联动：字段 A 选中值 → 字段 B 选项列表更新
   - 校验规则联动：字段 A 值范围 → 字段 B 校验规则动态变化
   - 组件显隐联动：组件 A 状态 → 组件 B 显示/隐藏/禁用
   - 表单之间联动：表单 A 提交成功 → 表单 B 刷新或预填充
   - 异步回调链：上传成功 → 调用 OCR API → 识别结果回填字段
   - 条件显隐：权限/状态/数据条件 → 按钮/字段/区块 显示/隐藏/禁用

   **每个联动必须拆解为独立的交互子项**（不能仅写在联动/依赖列的备注中）：
   - 主功能点：F-N（UI 元素本身）
   - 交互子项：F-N-a（触发事件 + 预期响应），独立记录，可独立验证

4. **再读取 UI 参考材料**（服务于后续 UI 审计，不作为功能点主要来源）：
   - HTML 设计稿路径（`inputs.htmlPath`）
   - 截图路径（`inputs.screenshotPath`）
   - 接口文档路径（`inputs.apiDocPath`）
   - 需求描述中新增/变更的部分
5. 以原代码分析为基线，结合需求变更 → 生成 `features.md`（每个功能点标注来源：`原代码` / `需求新增` / `需求变更`）。
   - UI 完整度列仅表示 UI 还原参考的充分度，不影响功能点是否成立。
6. 展示给用户确认。

### 3. 标记风险

识别高风险点（黑盒表单、上传、OCR、动态字段、nativeID 崩溃等），写入 `risks` 数组。

---

## 输出要求

### 文档输出

使用 `templates/features.md.tpl` 格式生成 `features.md`，八列：ID、模块、功能描述、来源、UI 完整度、联动/依赖、状态、备注。

每项依赖描述**当被依赖功能点变化/完成时，当前功能点需如何响应**。联动关系独立子项记录。

记录 `Phase 01 完成: HH:MM (耗时 MM 分钟)` 到 features.md 的「性能计时日志」。

### 状态更新

更新 `.ai-wiki/.dtc-state.json` 中当前需求条目的 `phaseOutputs.analyze`：

```jsonc
{
  "featureCount": 12,
  "materialsReadLog": [
    "已分析原代码 src/pages/cert/*：提取 12 个功能点、3 个接口、2 组表单联动（重构模式主要来源）",
    "已读取 src/xxx.html（UI 参考）：包含 5 个字段、1 个上传区",
    "已读取截图（UI 参考）：确认底部有提交按钮",
  ],
  "openQuestions": [],
  "risks": [
    {
      "id": "R01",
      "desc": "动态表单字段 nativeID 风险",
      "mitigation": "使用 SafeInput / SafeUploadFile",
    },
  ],
  "checklistPassed": true,
  "userConfirmed": false,
      "id": "R01",
      "desc": "动态表单字段 nativeID 风险",
      "mitigation": "使用 SafeInput / SafeUploadFile"
    }
  ],
  "checklistPassed": true,
  "userConfirmed": false
}
```

同时将 `docPaths.features` 设置为生成的 features.md 路径。

### Checklist（必须全部满足才能标记 checklistPassed: true）

- [ ] features.md 已生成且包含完整的八列表格
- [ ] **重构模式**：已获取 `inputs.originalCodePath` 并完成原代码分析，功能点以原代码为主要来源（`materialsReadLog` 含原代码分析条目）
- [ ] 每个功能点有明确的来源标注（原代码 / 需求新增 / 需求变更）
- [ ] 联动关系已独立记录
- [ ] 「交互规则清单」已输出（字段联动 + 条件显隐 + 异步流程三张表）
- [ ] 高风险点已识别并写入 risks
- [ ] 性能计时日志已记录
- [ ] 变更日志已包含初始条目（changeLog）(v2.0)

---

## 用户确认门禁

1. **必须停下来向用户确认**：输出本阶段总结（功能清单摘要、模糊点、风险），然后使用 `AskUserQuestion` 询问：

   ```
   问题：Phase 01 分析完成，共识别 N 个功能点、N 个风险项。是否确认进入 UI 审计？
   选项：
   - 确认，进入 UI 审计
   - 需要调整（我会输入修改意见）
   ```

2. 只有在用户明确确认后，才将 `userConfirmed` 设为 `true` 并推进到 `audit` 阶段。
3. 如果用户提出修改，更新 `featureList`/`openQuestions`/`risks`，重新确认，直到用户满意。

---

## 禁止

- 不写任何代码。
- **重构模式下，未获取并分析原代码，不得仅凭 HTML/截图生成功能点列表。**
- 不能不读 HTML/截图/原代码就下结论。
- 不能把未确认的需求当作已确认处理。
- 不能跳过联动关系分析。
- 不能在 init 阶段跳过材料收集直接进入 analyze。
