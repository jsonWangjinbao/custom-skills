# Phase 01 — 入口与需求分析（通用）

## 进入条件

- 已 `Read .ai-wiki/.dtc-state.json`。
- `currentPhase` 为 `init` 或 `analyze`。

---

## 初始化入口（Init）

此段仅在 `currentPhase === "init"` 时执行。

### 1. 状态检测

读取 `.dtc-state.json` 后：

1. **文件不存在或 `requirements` 为空数组** → 直接进入「新需求流程」
2. **`requirements` 存在一个或多个条目** → 展示需求总览表，使用 `AskUserQuestion` 让用户选择续接或新建

### 2. 新需求流程

> **❗️ 执行铁律（不得违反）**：一次 AskUserQuestion 只能包含 1 个问题，严禁多问题打包。

按顺序逐个调用 `AskUserQuestion`，每次仅传 1 个问题：

**问题 1 — header: "需求名称"**

- question: `"请输入需求名称（用于创建文档目录，如：门店证件管理、订单列表）："`
- options（固定 2 项，严禁替换为具体项目名）：
  - `{ label: "已知名称", description: "在 Other 中输入实际需求名称" }`
  - `{ label: "待确定", description: "暂时未确定，后续讨论" }`

→ 收到答案 → 写入 `requirementName` → 发起问题 2。

**问题 2 — header: "技术选型"**

- question: `"目标平台是哪个？"`
- options（固定 3 项）：
  - `{ label: "React Native", description: "移动端 RN 应用，使用 @xlb/components-react-native" }`
  - `{ label: "H5", description: "移动端 H5 WebView，使用 @xlb/components-mobile、UmiJS Max" }`
  - `{ label: "PC", description: "桌面端 PC 应用，使用 @xlb/components、UmiJS Max" }`

→ 收到答案 → 写入 `inputs.platform`（`rn` / `h5` / `pc`）→ 发起问题 3。

**问题 3 — header: "需求类型"**

- question: `"这次是增量需求还是重构需求？"`
- options（固定 2 项）：
  - `{ label: "增量需求", description: "在现有代码上新增或修改功能" }`
  - `{ label: "重构需求", description: "基于现有源码进行改写重构" }`

→ 收到答案 → 写入 `requirementType`（`incremental` / `refactor`）→ 执行复杂度分级。

**复杂度分级（问题 3 之后强制执行）**

复杂度分级与需求类型正交：分型决定流水线内容，分级决定流程深度。

1. **收集分级输入**（轻量侦察，不额外追问用户；信息严重不足时才补问）：
   - `--text`：需求名称 + 需求描述（`inputs.description`，未收集时仅用需求名称）
   - `--files`：预计涉及文件数。重构模式按 `inputs.originalCodePath` 目录规模估算；增量模式按新增/修改文件数估算；无法估算时传 `0`
   - `--has-similar`：是否存在已验证同类实现可参照。重构模式默认 `true`（有原代码）；增量模式检索相似页面/模块后判断 `true` / `false` / `unknown`
2. **执行分级脚本**：

   ```bash
   node <skill目录>/scripts/dtc-classify-mode.mjs --text "<需求名称+描述>" --files <N> --has-similar <true|false|unknown>
   ```

3. **写入状态**：将输出 `mode` 写入 `inputs.mode`（`quick` / `standard` / `full`），并初始化 `modeHistory`（`[{ mode, evidence, at }]`，evidence 取自脚本输出的 reasons）。同时初始化指标记录：

   ```bash
   node <skill目录>/scripts/dtc-metrics.mjs init ".ai-wiki/【需求名】" --mode <分级结果>
   ```

   后续 mode 升级时执行 `node <skill目录>/scripts/dtc-metrics.mjs mode ".ai-wiki/【需求名】" <newMode> --reason "<原因>"`（只升不降，与 `modeHistory` 同步）。

4. **只升不降**：后续任何阶段发现新风险信号（撤回/审批/状态流转/权限/并发/跨项目等）时，重新执行脚本并**升级** mode（quick→standard→full），追加 `modeHistory` 记录；**禁止降级**。
5. **分级裁剪规则**（保护性约束，不得削弱）：
   - `quick`：feature-spec + api-spec 可合并为轻量版、audit 免做全量三要素表；但组件选择决策表（默认渲染差异 + 补偿方案）与截图逐张 Read 双源交叉（有截图材料时）仍强制执行
   - `standard`：默认全流程
   - `full`：feature-spec 阶段追加状态迁移矩阵强制输出（见 `subskills/common/03-feature-spec.md`）
6. **断点恢复**：已有需求恢复时按 `inputs.mode` 恢复对应裁剪流程；`inputs.mode` 缺失时按 `standard` 处理。

### 3. 推进

3 个问题回答完毕且复杂度分级已写入 `inputs.mode` 后，推进 `currentPhase` 到 `collect-materials`，fallthrough 到 `subskills/common/02-collect-materials.md`。

---

## 已有需求恢复（快速入口）

当选择续接已有需求时，根据 `currentPhase` 跳到对应阶段：

| 当前阶段          | 跳转到                                                            |
| ----------------- | ----------------------------------------------------------------- |
| analyze           | 跳到上方「新需求流程」（仅状态检测后）                            |
| collect-materials | `subskills/common/02-collect-materials.md`                        |
| feature-spec      | `subskills/common/03-feature-spec.md`                             |
| api-spec          | `subskills/common/04-api-spec.md`                                 |
| audit             | `subskills/{platform}/01-audit.md`（根据 `inputs.platform` 路由） |
| design            | `subskills/{platform}/02-design.md`                               |
| build             | `subskills/{platform}/03-build.md`                                |
| verify            | `subskills/{platform}/04-verify.md`                               |
| done              | 询问是否修改                                                      |

---

## 用户确认门禁

新需求流程完成后，输出需求名称、平台、需求类型和复杂度分级摘要（必须包含 mode），使用 `AskUserQuestion` 确认：

```
问题：需求初始化完成：「门店证件管理」[RN] + [重构] + [standard]。是否确认进入材料收集？
选项：
- 确认，进入材料收集
- 重新选择（我会输入修改意见）
```

用户确认后，将 `currentPhase` 推进到 `collect-materials`，fallthrough。

---

## 禁止

- 不能在未询问技术选型时假设平台
- 不能在未询问需求名称时开始流程
- 不能一次询问多个问题
- 重构模式下不能跳过后续的材料收集步骤
- 不能跳过复杂度分级步骤、或分级结果未写入 `inputs.mode` 就推进到材料收集
- 不能降低已写入的 mode（只升不降；升级须追加 `modeHistory`）
