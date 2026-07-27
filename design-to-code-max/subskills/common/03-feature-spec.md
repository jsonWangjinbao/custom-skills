# Phase 03 — 功能点规格生成

## 进入条件

- 已 `Read .ai-wiki/.dtc-state.json`。
- `currentPhase` 为 `feature-spec`。

---

## 功能点生成

根据需求类型走不同分析路径：

### 重构模式

1. 读取 `inputs.originalCodePath` 指定的源码目录
2. **深入分析原代码**，逐一抽取功能点（这是功能点列表的主要来源）：
   - 页面/组件结构、状态与数据流
   - 接口调用（请求参数、响应字段、错误处理）
   - 表单字段、校验规则、提交逻辑
   - OCR / 上传 / 动态表单 / 权限等特殊逻辑
   - 边界与异常分支（空态、错误态、网络中断等）
3. 尤其关注**组件联动关系**：
   - 组件 A 值变化 → 组件 B 状态/数据变化
   - 跨表单字段联动：字段 A 选中值 → 字段 B 选项列表更新
   - 校验规则联动：字段 A 值范围 → 字段 B 校验规则动态变化
   - 组件显隐联动：组件 A 状态 → 组件 B 显示/隐藏/禁用
   - 表单之间联动：表单 A 提交成功 → 表单 B 刷新或预填充
   - 异步回调链：上传成功 → 调用 OCR API → 识别结果回填字段
   - 条件显隐：权限/状态/数据条件 → 按钮/字段/区块显示/隐藏/禁用
4. **提取接口清单表**（api-spec 阶段的直接输入）：从源码中搜索所有接口调用（`request`、`Fsmshttp` 等），逐一记录接口名、URL、方法、用途、关联功能点，写入 features.md 的「接口清单表」章节
5. 再读取 UI 参考材料（HTML/截图），作为 UI 还原参考
6. 生成功能点，每个标注来源：`from-source`（来自原代码）/ `new`（需求新增）/ `change`（需求变更）
7. 标记风险点（黑盒表单、上传、OCR、动态字段等）

### 增量模式

1. 读取 `inputs.originalCodePath` 指定的增量模块目录
2. 扫描现有代码，了解已有逻辑、数据流、API 接口
3. 结合需求文档分析新增/修改内容
4. **提取接口清单表**（api-spec 阶段的直接输入）：复用已有接口从源码提取；新增接口根据需求文档列出，URL 未确定时标注「待确认」
5. 生成功能点，每个标注来源：
   - `new` — 全新功能点
   - `change` — 修改已有功能点

---

## 功能点格式

功能点列表输出到 `features.md`，每项包含：

```json
{
  "id": "FP-001",
  "title": "XX模块列表页",
  "module": "XX模块",
  "type": "from-source",
  "source": "原代码 / 需求新增 / 需求变更",
  "description": "...",
  "risk": "high / medium / low",
  "dependencies": ["FP-002", "FP-003"],
  "interactions": [
    {
      "id": "F-001-a",
      "desc": "触发事件 + 预期响应",
      "trigger": "字段A选中 → 字段B选项列表更新"
    }
  ]
}
```

### 联动记录规则

每个联动必须拆解为独立的交互子项：

- 主功能点：F-N（UI 元素本身）
- 交互子项：F-N-a（触发事件 + 预期响应），独立记录，可独立验证

---

## 确认复杂度分级（用户确认前强制执行）

> 此时已具备真实数据：功能点列表、接口清单表、风险项数量、源码分析结果。在此阶段重新判定复杂度，作为后续流程裁剪的**正式依据**。

1. **收集确认输入**（基于本阶段已产出的真实数据，不再估算）：

   | 参数                  | 取值来源                                                     |
   | --------------------- | ------------------------------------------------------------ |
   | `--feature-count`     | `features.md` 功能点列表的条目数                             |
   | `--api-count`         | `接口清单表` 的接口数                                        |
   | `--ui-files`          | `inputs.htmlPath` 中的 HTML 文件数（无 UI 材料时传 0）       |
   | `--risk-count`        | `phaseOutputs.feature-spec.risks` 中 high 风险项的数量       |
   | `--has-state-machine` | 功能点分析结果中是否涉及状态流转（`true` / `false`）         |
   | `--has-auth`          | 功能点分析结果中是否涉及权限控制（`true` / `false`）         |
   | `--estimated-files`   | 预估生成文件数（按功能点数量 × 1.5 估算，最小为功能点数）    |

2. **执行确认脚本**：

   ```bash
   node <skill目录>/scripts/dtc-classify-mode.mjs --phase confirm \
     --feature-count <N> --api-count <M> --ui-files <K> --risk-count <R> \
     --has-state-machine <true|false> --has-auth <true|false> --estimated-files <E>
   ```

3. **验证升级合规性**：先执行 metrics 确认不降级（metrics 内部拒绝 quick→standard→full 的反向操作）：

   ```bash
   node <skill目录>/scripts/dtc-metrics.mjs mode ".ai-wiki/【需求名】" <newMode> --reason "feature-spec confirmed"
   ```

4. **写入 `inputs.mode`**：metrics 通过后，将脚本输出的 `mode` 写入 `inputs.mode`，追加 `modeHistory`（`[{ mode, phase: "confirmed", evidence, at }]`）。若 metrics 拒绝（如尝试降级），停止并告知用户原因，**不写入**。

5. **分级裁剪规则**（`inputs.mode` 写入后生效，保护性约束不得削弱）：

   | mode       | 裁剪内容                                                                                                       | 强制执行（不裁剪）                                                                                        |
   | ---------- | -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
   | `quick`    | feature-spec + api-spec 可合并为轻量版；audit 免做全量三要素表；verify 不检查 api-spec.md                       | 组件选择决策表（差异+补偿方案）；截图逐张 Read 双源交叉（有截图材料时）                                   |
   | `standard` | 无裁剪，全流程                                                                                                 | —                                                                                                         |
   | `full`     | 无裁剪；额外强制输出状态迁移矩阵（见上方「full 模式状态矩阵门禁」）                                            | feature-spec 状态迁移矩阵 4 项；verify Spec 轴追加状态机全路径验证；dtc-artifacts 额外检查状态矩阵章节    |

   各阶段具体裁剪指引见对应 subskill 文件的「quick 模式裁剪指引」小节。

6. **只升不降**：后续任何阶段发现新风险信号时，重新执行 `--phase confirm` 升级 mode（quick→standard→full），追加 `modeHistory`；**禁止降级**。升级时参考 state-schema §5.3 模式升级回退路径补全缺失的产物。

7. **回写 features.md**：若为 `full` 模式且命中状态流转 — 检查功能点列表中是否有联动子项覆盖了所有迁移路径，不足则补充；若为 `quick` — 接口清单表可在 features.md 中简化（仅保留接口名和用途两列）。

---

## full 模式状态矩阵门禁（确认分级后强制执行）

> 此门禁在「确认复杂度分级」步骤之后触发——此时 `inputs.mode` 已写入正式值。

**触发条件**：`inputs.mode === "full"` 且功能点分析中发现命中状态流转类信号（撤回 / 撤销 / 退回 / 作废 / 回滚 / 审批 / 审核流 / 状态流转 / 状态机）。

**执行时机**：确认分级后、输出 features.md 之前。若确认结果为 full → 退回到功能点分析步骤补全所需信息 → 生成状态矩阵 → 再继续输出。

**强制输出**（模板见 `templates/common/features.md.tpl`），四项内容缺一不可：

1. **状态迁移矩阵**：当前状态 / 操作人 / 前置条件 / 动作 / 目标状态
2. **业务不变量**：任何迁移发生后必须为真的约束（如「已终审通过的单据不可再编辑」）
3. **禁止迁移**：不允许的状态跳转及拦截方式（前端禁用 + 接口校验）
4. **失败用例与回滚**：每个写操作的失败路径与回滚/补偿方案

> ❗️ 门禁：状态矩阵缺失或四项不全 → `checklistPassed` 不得置 `true`，change plan（tech-design / execution）不得进入 build。quick / standard 模式不强制，但若执行中升级为 full 须补齐。

---

## 输出

**根据 `inputs.mode` 选择输出格式**（在「确认复杂度分级」步骤之后）：

### micro 模式（极简格式）

跳过 api-spec、audit、design 阶段，仅生成极简 features.md 供 build 直接消费：

```markdown
# 功能点规格 — {{需求名称}}

> 生成时间: {{当前日期}} | 模式: micro | 来源: {{重构/增量}}

## 功能点

| ID    | 标题       | 描述                   | 关联接口 |
|-------|-----------|-----------------------|---------|
| FP-01 | {{标题}}   | {{一句话描述核心行为}}  | {{接口名}} |

## 接口

| 接口名 | URL              | 方法 | 关键响应字段          |
|--------|------------------|------|---------------------|
| page   | /api/xxx/page    | POST | content[], total     |
```

micro 模式只保留功能点表和接口表两个章节，不生成联动/依赖分析、风险标注、字段综合映射表等。

### standard / full 模式

使用 `templates/common/features.md.tpl` 格式生成 `features.md`，包含以下栏目：

- 功能点列表：ID、模块、功能描述、来源、UI 完整度、联动/依赖、状态、备注
- 接口清单表：接口名、URL、方法、用途、关联功能点、来源（api-spec 阶段的直接输入）
- 状态迁移矩阵（仅 full 模式且命中状态流转类信号时必填，见上方门禁）

### quick 模式（精简合并格式）

使用 `templates/common/features-quick.md.tpl` 格式生成 features.md，跳过独立 api-spec 阶段，接口规格合并到 features.md。

**quick 模式裁掉的内容（不再生成）**：

| 裁掉 | 理由 |
|------|------|
| 联动/依赖分析（interactions 子项） | quick 需求通常无复杂联动 |
| 风险标注（risk 字段） | 简单需求无特殊风险 |
| 来源标注（type / source 字段） | 重构/增量已在文档头标注 |
| 接口完整请求参数表 | 用「接口补充」的「关键请求参数」替代 |
| 字段综合映射表（api-spec.md §3） | 字段少，参数表已够用 |
| mock 数据模板 | API 通常已可用或简单到无需 mock |
| 独立 `api-spec.md` 文件 | 合并进 features.md，不生成独立文件 |
| 状态迁移矩阵 | quick 不可能触发 full |
| 完整响应字段表（UI 元素列） | 精简为「关键响应字段」 |

---

## 路由到下一阶段

根据 `inputs.mode` 确认结果路由：

- `micro` — 跳过 api-spec、audit、design，直接进入 build（接口规格合并到 features.md §接口清单表）
- `quick` — 可跳过独立 api-spec 阶段（接口规格合并到 features.md §接口清单表），直接进入 audit
- `standard` / `full` — 正常进入 `subskills/common/04-api-spec.md`（API 规格设计阶段）

> micro 模式还会跳过 audit 和 design 阶段，build 阶段直接从 features.md 和 materials 中消费信息。

---

## 用户确认门禁

功能点列表生成后，输出功能点摘要**和确认分级结果**，使用 `AskUserQuestion` 确认：

**micro 模式**：

```
问题：功能点规格生成完成，共识别 N 个功能点（≤2）、M 个接口（≤1）、0 个风险项。复杂度确认：micro（极简模式，跳过 API 规格/UI 审计/技术设计，直接生成代码）。
请确认：
选项：
- 确认，直接进入代码生成
- 需要调整（我会输入修改意见或升级模式）
```

**quick 模式**：

```
问题：功能点规格生成完成，共识别 N 个功能点、M 个接口、K 个风险项。复杂度确认：quick（轻量模式，跳过独立 API 规格，接口信息已合并到 features.md）。
请确认：
选项：
- 确认，进入 UI 审计
- 需要调整（我会输入修改意见）
```

**standard / full 模式**：

```
问题：功能点规格生成完成，共识别 N 个功能点、M 个接口、K 个风险项。复杂度确认：[standard|full]。
请确认：
选项：
- 确认，进入 API 规格设计
- 需要调整（我会输入修改意见）
```

用户确认后：
- **若 `inputs.mode === "micro"`** → 将 `currentPhase` 推进到 `build`，fallthrough 到 `subskills/{platform}/03-build.md`（跳过 api-spec、audit、design 阶段）
- **若 `inputs.mode === "quick"`** → 将 `currentPhase` 推进到 `audit`，fallthrough 到 `subskills/{platform}/01-audit.md`（跳过 api-spec 阶段）
- **若 `inputs.mode !== "micro" && inputs.mode !== "quick"`** → 将 `currentPhase` 推进到 `api-spec`，fallthrough 到 `subskills/common/04-api-spec.md`

---

## 禁止

- 重构模式下，未获取并分析原代码前，不得仅凭 HTML/截图生成功能点列表
- 不能不读 HTML/截图/原代码就下结论
- 不能把未确认的需求当作已确认处理
- 不能跳过联动关系分析
- 不能跨平台路由（RN 需求不能路由到 pc/）
- full 模式不能跳过状态迁移矩阵门禁，或矩阵四项不全时标记 `checklistPassed`
