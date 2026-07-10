---
name: design-to-code-max
description: >-
  用于将产品需求、设计稿（HTML/截图）转换为生产代码的全链路交付 skill。
  融合 design-to-code 的高还原力文档体系与 design-to-code-lite 的 JSON 状态机，实现高度还原 + 不忘步骤 + 可中断续接。
  拆分为分析、UI 审计、技术设计、分组执行、自测验证五个阶段，强制 checkpoint 与用户确认门禁。
  涵盖增量需求（H5/Web/RN 上加功能）和重构需求（H5→RN、RN→Web 等），适用于 React Native / H5 生产代码生成。
---

# design-to-code-max

全链路 H5/RN 重构交付 skill。融合高还原力文档体系与可靠状态机，实现**高度还原 + 不忘步骤 + 可中断续接**。

## 工作模式

- **增量需求** — 在现有 Web/RN/H5 上加功能
- **重构需求** — H5→RN、RN→RN、Web→Web 重构

## 八条铁律（不可违反）

1. **功能完整性优先**：不得以样式合规、简化代码为由，删除已有功能、接口字段、校验逻辑、事件处理、OCR/上传/动态表单逻辑。图标/颜色问题应在功能完整后再修复。
2. **Token 唯一来源**：所有色值、字号、间距、圆角必须来自 `@xlb/components-react-native` 的 theme 或 `reference/token-map.json`；禁止硬编码 hex、magic number。RN 项目遵循 `reference/xlb-style-system.md`。
   - 当设计稿指定的尺寸无对应 token 时，必须在 constants.ts 中定义为具名常量（如 `const TAB_PADDING_H = 10`），禁止内联 magic number。注释标注来源（如 `// 设计稿指定值，无对应 SPACE token`）。
3. **必须消费输入材料才能写代码**：每个执行分组开始前必须已读取对应 HTML 文件 + ui-audit 样式规格，并在 execution.md 中记录 `HTML 已读` 日志；未读不得写代码。
4. **黑盒组件先查差异**：使用 `CommonFormItem` / `XlbUploadFile` / `XlbDialog` 等封装组件前，必须先确认其默认渲染与目标差异，写入组件选择决策表，并记录补偿方案。引用 `reference/gotchas/component-library/blackbox-wrapper-component.md`。
5. **阶段未 checkpoint 禁止推进**：每阶段结束后必须更新 `.ai-wiki/.dtc-state.json` 并通过本阶段 checklist；analyze / audit / design 三阶段还需用户确认（`userConfirmed === true`）。任何一项未通过，停止并报给用户。
6. **执行分组 8 步闭环**：每个分组完成后必须完成 8 步（读设计 → 读 HTML → 读风格 → 生成代码 → 编译抽检 → 更新 execution → 更新 features → 更新 JSON 状态），缺一不可。
7. **样式合规是终检门禁，不是执行中途的改写指令**：先生成功能完整、接口正确的代码，所有分组完成后统一扫描修复样式/图标问题。修复时禁止为改样式而简化功能。
8. **禁止 dependencies/shouldUpdate 传入表单项**：永远不要向 `XlbForm.Item` 或 `CommonFormItem` 传入 `dependencies` 或 `shouldUpdate` prop——它们会导致 label 不渲染（编译通过但运行时视觉缺失）。联动校验用 `form.getFieldValue(path)`；条件渲染用 `useWatch`。引用 `reference/gotchas/component-library/dependencies-kills-label.md`。

## 执行流程总览

```
[init] → analyze ──✅+用户确认──→ audit ──✅+用户确认──→ design ──✅+用户确认──→ build ──出口门禁──→ verify ──✅──→ done
```

每个阶段的详细任务见 `subskills/` 目录：

| 阶段    | 文件                      | 输出文档         | 用户确认       |
| ------- | ------------------------- | ---------------- | -------------- |
| analyze | `subskills/01-analyze.md` | `features.md`    | 是             |
| audit   | `subskills/02-audit.md`   | `ui-audit.md`    | 是             |
| design  | `subskills/03-design.md`  | `tech-design.md` | 是             |
| build   | `subskills/04-build.md`   | `execution.md`   | 否（出口门禁） |
| verify  | `subskills/05-verify.md`  | —                | 否（终检）     |

## 强制 checkpoint 机制

- **状态文件路径**：`.ai-wiki/.dtc-state.json`
- 每个阶段**开始前**必须先 `Read` 它；**结束后**必须 `Write` 更新它。
- 只有 `phaseOutputs.<current>.checklistPassed === true` 才能进入下一阶段。
- analyze / audit / design 三阶段还需 `userConfirmed === true`。
- 状态异常时立即停止，向用户说明原因，不得继续。

## 文档输出

- **路径**：当前项目根目录下的 `.ai-wiki/【需求名】/{features.md, ui-audit.md, tech-design.md, execution.md}`
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
   - `currentPhase !== "done"` → 跳到对应阶段 subskill，从断点继续
   - `currentPhase === "done"` → 询问是否需要修改，小改追加 changeLog 回退 build，大改走新需求
5. 用户选择新需求 → 走 init 流程（见 `subskills/01-analyze.md`）
6. **build 阶段恢复额外检查**：检查上一个已完成分组的 `htmlReadLog` 或 `解析数据已读` 日志，缺失则提示重新读取 HTML 或解析数据

## 性能计时

每个阶段记录起止时间，写入 `features.md` 的「性能计时日志」章节：

- 阶段完成时追加：`Phase X 完成: HH:MM (耗时 MM 分钟)`
- build 阶段每个分组记录：`分组 N 开始: HH:MM` / `分组 N 完成: HH:MM (实际 MM 分钟)`
- 编译/测试等长耗时操作单独记录
- 某阶段超过预估 50% 或单次编译超过 5 分钟，标注瓶颈

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

### ❗️ init 5 问 —— 全局铁律（不得违反）

新需求 init 流程的 5 个问题（需求名称 / 需求类型 / 需求文档 / UI 材料 / 代码路径）**必须严格按 `subskills/01-analyze.md` 第 2 节的模板执行**：

1. **一次 `AskUserQuestion` 只允许包含 1 个问题**，5 个问题拆成 **5 次独立调用**，按 1→2→3→4→5 顺序推进。
2. 每个问题的 `header`、`question` 文字、`options` 数组**逐字使用模板原文**，禁止：
   - 改写 header 或 question 措辞
   - 新增 / 删除 / 替换 / 重排 options
   - 自行合成「可多选」「PRD」「Figma」「API 文档」「H5 源文件」等模板未列出的选项
   - 把示例项目名（如「门店证件管理」「订单列表」）当作 options 展示给用户
3. 上一个问题的答案写入状态后，才能发起下一个问题；禁止一次性收集或跳问。
4. 如需扩充选项，先修改 `subskills/01-analyze.md` 模板，再执行；运行时不得临场发挥。

## 参考文件

| 文件                                                              | 用途                                        | 消费时机                                            |
| ----------------------------------------------------------------- | ------------------------------------------- | --------------------------------------------------- |
| `reference/rn-guidelines.md`                                      | RN 代码生成约束                             | build Step 2 必读                                   |
| `reference/xlb-style-system.md`                                   | XLB 风格系统规范                            | build Step 4 样式实现参考                           |
| `reference/icon-map.md`                                           | 图标名称映射                                | build Step 4 图标使用参考                           |
| `reference/token-map.json`                                        | CSS 变量 → theme token 映射                 | build Step 4 样式实现参考                           |
| `reference/style-scan-checklist.md`                               | 样式合规扫描清单（终检用）                  | verify 阶段终检                                     |
| `reference/ambiguity-rules.md`                                    | 歧义检测规则                                | analyze 阶段                                        |
| `reference/web-guidelines.md`                                     | Web 平台规范                                | Web 平台生成时参考                                  |
| `reference/state-schema.md`                                       | **完整状态机 Schema（v2.0）**               | 所有阶段读取/写入 state.json 时参考                 |
| `reference/html-parser-rules.md`                                  | **HTML 结构化解析引擎规则**                 | audit 阶段 Step 2 解析 HTML 时使用                  |
| `reference/deviation-db-schema.md`                                | **偏差持久化库 Schema**                     | audit 偏差库预标注 / build Step 5.5 / verify 时参考 |
| `reference/gotchas/`                                              | 已知问题库（组件库/HTML解析/RN特性）        | build Step 2 + Step 5（按相关性必读）               |
| `reference/gotchas/api-patterns/fsms-response-structure.md`       | **FSMS API 响应格式（`res?.data` 即顶层）** | build Step 4 取值约束 / 出口门禁 item 10 扫描依据   |
| `reference/gotchas/component-library/dependencies-kills-label.md` | **XlbForm.Item dependencies 致 label 消失** | build Step 4/5 + verify 阶段（**高优先级**）        |
| `reference/gotchas/component-library/xlbform-celltheme-horizontal-padding.md` | **XlbForm cellTheme 控制水平内边距（两个 key 都要设）** | audit 三要素表标注引用 / build Step 4 cellTheme 映射约束 |

## 状态机 Schema

完整的状态机 Schema 定义见 `reference/state-schema.md`。

`.dtc-state.json` 顶层结构：

```jsonc
{
  "skill": "design-to-code-max",
  "version": "2.0",
  "startedAt": "",
  "updatedAt": "",
  "requirements": [],
}
```

## 偏差持久化库

跨需求积累组件库与设计稿的已知差异，保存在 `.ai-wiki/design-deviation-db.json`。

| 阶段           | 操作                                                    |
| -------------- | ------------------------------------------------------- |
| audit 开始     | 读取偏差库，匹配已知组件，预标注到 ui-audit.md          |
| build Step 5.5 | 发现新偏差 → 追加到库；命中已知偏差 → occurrenceCount+1 |
| verify 结束    | 验证已修复的偏差标记 resolved=true                      |

完整 Schema 定义见 `reference/deviation-db-schema.md`。

## 交付总结格式

交付总结在 verify 通过后输出，格式为 markdown，包含：

- 完成阶段清单（各阶段功能点/组件决策数/文件数等摘要）
- 生成/修改文件列表
- 性能计时摘要（各阶段耗时 + 总计）
- 剩余风险
- 需要人工确认项

> 完整示例及各阶段详细格式参见各 subskill 的输出要求。
