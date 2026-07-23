---
name: design-to-code-max
description: >-
  全链路前端代码生成 skill。支持 RN/H5/PC 三端 + 重构/增量两种需求类型。
  按技术选型渐进式披露平台约束，各平台流水线完全隔离。
---

# design-to-code-max

全链路前端代码生成 skill。支持 **RN** / **H5** / **PC** 三个平台，**重构** / **增量**两种需求类型。

## 八条铁律（不可违反）

1. **功能完整性优先**：不得以样式合规、简化代码为由，删除已有功能、接口字段、校验逻辑、事件处理。
2. **Token 唯一来源**：所有色值、字号、间距、圆角必须来自项目 token 系统；禁止硬编码 hex、magic number。各平台 token 系统参见对应平台的 guidelines。
3. **必须消费输入材料才能写代码**：每个执行分组开始前必须已读取对应 UI 分析文档并记录日志；未读不得写代码。
4. **黑盒组件先查差异**：使用封装组件前，必须先确认其默认渲染与目标差异，写入组件选择决策表。
5. **阶段未 checkpoint 禁止推进**：每阶段结束后必须更新 `.ai-wiki/.dtc-state.json` 并通过本阶段 checklist。analyze / collect-materials / feature-spec / api-spec / audit / design 六阶段还需用户确认（`userConfirmed === true`）。
6. **执行分组闭环**：每个分组完成后必须完成所有步骤（读设计 → 读样式 → 生成代码 → 编译抽检 → 更新文档 → 更新状态），缺一不可。
7. **样式合规是终检门禁**：先生成功能完整代码，所有分组完成后统一扫描修复样式问题。修复时禁止为改样式而简化功能。
8. **平台约束隔离**：RN 流水线只能引用 `reference/rn/` 的规则，H5 流水线只能引用 `reference/h5/`，PC 流水线只能引用 `reference/pc/`，禁止跨平台引用。

## 路由流程

```
用户输入需求
    │
    ├── Q1: 需求名称?        → 用于创建文档目录
    ├── Q2: 技术选型?        → RN / H5 / PC
    ├── Q3: 需求类型?        → 重构 / 增量
    │
    ├── common/01-analyze              → 入口与需求分析
    ├── common/02-collect-materials    → 材料收集
    ├── common/03-feature-spec         → 功能点规格
    ├── common/04-api-spec             → API 规格设计
    │
    └── 根据平台路由到对应流水线
        ├── RN: rn/01-audit → rn/02-design → rn/03-build → rn/04-verify
        ├── H5: h5/01-audit → h5/02-design → h5/03-build → h5/04-verify
        └── PC: pc/01-audit → pc/02-design → pc/03-build → pc/04-verify
```

每个阶段的详细任务见 `subskills/` 目录：

| 阶段         | 文件                                       | 用户确认 |
| ------------ | ------------------------------------------ | -------- |
| 入口路由     | `subskills/common/01-analyze.md`           | 是       |
| 材料收集     | `subskills/common/02-collect-materials.md` | 是       |
| 功能点规格   | `subskills/common/03-feature-spec.md`      | 是       |
| API 规格设计 | `subskills/common/04-api-spec.md`          | 是       |
| UI 审计      | `subskills/{platform}/01-audit.md`         | 是       |
| 技术设计     | `subskills/{platform}/02-design.md`        | 是       |
| 代码生成     | `subskills/{platform}/03-build.md`         | 否       |
| 验证         | `subskills/{platform}/04-verify.md`        | 否       |

## 渐进式披露

本技能按技术选型进行渐进式加载：

| 用户选择     | 加载的子技能        | 加载的 reference                  |
| ------------ | ------------------- | --------------------------------- |
| RN 重构/增量 | `common/*` + `rn/*` | reference/common/ + reference/rn/ |
| H5 重构/增量 | `common/*` + `h5/*` | reference/common/ + reference/h5/ |
| PC 重构/增量 | `common/*` + `pc/*` | reference/common/ + reference/pc/ |

> 各平台子技能和 reference 完全独立，不跨平台引用。
> 通用规则放在 reference/common/ 下，各平台专用规则放在各平台目录下。

## 强制 checkpoint 机制

- **状态文件路径**：`.ai-wiki/.dtc-state.json`
- 每个阶段**开始前**必须先 `Read` 它；**结束后**必须 `Write` 更新它。
- 只有 `phaseOutputs.<current>.checklistPassed === true` 才能进入下一阶段。
- analyze / collect-materials / feature-spec / api-spec / audit / design 六阶段还需 `userConfirmed === true`。
- 状态异常时立即停止，向用户说明原因，不得继续。
- 状态机完整 Schema 见 `reference/common/state-schema.md`（通用结构适用于所有平台）。

## 文档输出

- **路径**：当前项目根目录下的 `.ai-wiki/【需求名】/{features.md, api-spec.md, ui-audit.md, tech-design.md, execution.md}`
- **HTML 解析输出**：`.ai-wiki/【需求名】/parsed-styles/【页面名】.json`（audit 阶段生成，build 阶段消费）
- 状态文件固定为项目根目录下的 `.ai-wiki/.dtc-state.json`
- `.ai-wiki` 目录不存在时自动创建
- 文档格式使用 `templates/` 下的模板

## 中断恢复协议

下次启动时：

1. `Read .ai-wiki/.dtc-state.json`
2. 不存在或 `requirements` 为空 → 走新需求 init 流程
3. 存在已完成/未完成需求 → 展示需求总览表，使用 `AskUserQuestion` 让用户选择：
   - 「请选择要处理的需求：」
   - 选项列出每个需求的名称、类型、阶段、完成度
   - 额外选项：开始新需求
4. 用户选择已有需求：
   - `currentPhase !== "done"` → 跳到对应阶段 subskill（根据 `inputs.platform` 路由到对应平台），从断点继续
   - `currentPhase === "done"` → 询问是否需要修改，小改追加 changeLog 回退 build，大改走新需求
5. 用户选择新需求 → 走 init 流程（见 `subskills/common/01-analyze.md`）
6. **build 阶段恢复额外检查**：检查上一个已完成分组的 `htmlReadLog` 或 `解析数据已读` 日志，缺失则提示重新读取 HTML 或解析数据

## 性能计时

每个阶段完成时在 `features.md` 的「性能计时日志」追加一行：`阶段名 完成: HH:MM (耗时 MM 分钟)`。

- 只记录阶段级耗时（build 阶段按分组记录起止），不逐项计时
- 某阶段超过预估 50% 时标注瓶颈

## 后续修改

用户提出变更时：

1. 检查 `features.md` → 使用 `AskUserQuestion` 询问是否更新功能点列表
2. 确认后在 `features.md` 上新增/修改功能点（标记「需求变更」）
3. 同步更新 `tech-design.md`（受影响的设计部分）
4. 更新 `execution.md` 插入新步骤
5. 更新 `.dtc-state.json` 中对应需求条目的 `currentPhase` 回退到 `build`，追加 `changeLog` 条目
6. 按更新后的执行文档继续执行

## 所有提问必须通过 AskUserQuestion

所有需要用户做选择或提供信息的提问，必须通过 `AskUserQuestion` 工具生成结构化问题卡片，禁止以普通文本方式直接询问。

入口 3 个问题定义在 `subskills/common/01-analyze.md` 中，必须按该文件的模板执行。

## 参考文件索引

| 文件                                      | 用途                        | 消费时机                |
| ----------------------------------------- | --------------------------- | ----------------------- |
| `reference/common/ambiguity-rules.md`     | 歧义检测规则                | audit / build 阶段      |
| `reference/common/html-parser-rules.md`   | HTML 结构化解析引擎规则     | audit 阶段              |
| `reference/common/gotchas/`               | 平台通用已知问题库          | audit / design 阶段按需 |
| `reference/rn/rn-guidelines.md`           | RN 代码生成约束             | RN build 阶段           |
| `reference/rn/xlb-style-system.md`        | XLB 风格系统规范            | RN build 阶段样式参考   |
| `reference/rn/icon-map.md`                | 图标名称映射                | RN build 阶段           |
| `reference/rn/token-map.json`             | CSS 变量 → theme token 映射 | RN build 阶段样式参考   |
| `reference/rn/style-scan-checklist.md`    | 样式合规扫描清单（终检）    | verify 阶段             |
| `reference/common/state-schema.md`        | 状态机 Schema（v2.0）       | 所有阶段读写 state.json |
| `reference/common/deviation-db-schema.md` | 偏差持久化库 Schema         | audit / build / verify  |
| `reference/rn/gotchas/`                   | 已知问题库                  | build 阶段按需          |
| H5 和 PC 的参考文件在各平台目录中声明     |                             |                         |

## 偏差持久化库

跨需求积累组件库与设计稿的已知差异，保存在 `.ai-wiki/design-deviation-db.json`。

| 阶段           | 操作                                                    |
| -------------- | ------------------------------------------------------- |
| audit 开始     | 读取偏差库，匹配已知组件，预标注到 ui-audit.md          |
| build Step 5.5 | 发现新偏差 → 追加到库；命中已知偏差 → occurrenceCount+1 |
| verify 结束    | 验证已修复的偏差标记 resolved=true                      |

完整 Schema 定义见 `reference/common/deviation-db-schema.md`。

## 交付总结格式

交付总结在 verify 通过后输出，格式为 markdown，包含：

- 完成阶段清单（各阶段功能点/组件决策数/文件数等摘要）
- 生成/修改文件列表
- 性能计时摘要（各阶段耗时 + 总计）
- 剩余风险
- 需要人工确认项

> 完整示例及各阶段详细格式参见各 subskill 的输出要求。
