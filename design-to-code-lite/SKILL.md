---
name: design-to-code-lite
description: 轻量级 H5/RN 重构交付 skill。将 design-to-code 拆为分析、UI 审计、技术设计、代码生成、自测验证五个阶段，强制 checkpoint，仅保留 5 条不可违反的铁律。用于产品需求或设计稿转 React Native / H5 生产代码。
---

# design-to-code-lite

## 铁律（不可违反）

1. **功能完整性优先**：不得以样式合规、简化代码、减少文件为由，删除已有功能、接口字段、校验逻辑、事件处理、OCR/上传/动态表单逻辑。
2. **Token 唯一来源**：所有色值、字号、间距、圆角必须来自 `@xlb/components-react-native` 的 theme 或 `reference/token-map.json`；禁止硬编码 hex、magic number。
3. **必须消费输入材料**：生成代码前必须已读取并记录 HTML/截图/设计稿内容；未读不得写代码。
4. **黑盒组件先查差异**：使用 `CommonFormItem` / `XlbUploadFile` / `XlbDialog` 等封装组件前，必须先确认其默认渲染与目标差异，并记录补偿方案。
5. **阶段未 checkpoint 禁止推进**：每阶段结束后必须更新 `.qoder/.dtc-state.json` 并通过本阶段 checklist；任何一项未通过，停止并报给用户。

## 强制 checkpoint

- 状态文件路径：`.qoder/.dtc-state.json`
- 每个阶段开始前必须先 `Read` 它；结束后必须 `Write` 更新它。
- 只有 `phaseOutputs.<current>.checklistPassed === true` 才能进入下一阶段。
- **analyze / audit / design 三个阶段结束后必须经用户确认**（`userConfirmed === true`）才能推进。
- 状态异常时立即停止，向用户说明原因，不得继续生成代码。

## 执行流程

1. `Read .qoder/.dtc-state.json`。不存在则创建初始状态（`currentPhase: "init"`）。
2. 根据 `currentPhase` 进入对应阶段文件：
   - `init` / `analyze` -> [subskills/01-analyze.md](subskills/01-analyze.md)
   - `audit` -> [subskills/02-audit.md](subskills/02-audit.md)
   - `design` -> [subskills/03-design.md](subskills/03-design.md)
   - `build` -> [subskills/04-build.md](subskills/04-build.md)（生成前必须先读 [reference/rn-guidelines.md](reference/rn-guidelines.md)）
   - `verify` -> [subskills/05-verify.md](subskills/05-verify.md)（扫描时对照 [reference/style-scan-checklist.md](reference/style-scan-checklist.md) 与 [reference/rn-guidelines.md](reference/rn-guidelines.md)）
3. 每阶段完成后，更新 `.qoder/.dtc-state.json`。
4. **analyze、audit、design 阶段输出结果后，必须停下来使用 `AskUserQuestion` 询问用户确认或修改**。用户确认后将 `userConfirmed` 设为 `true`，再把 `currentPhase` 推进到下一阶段。
5. 如果用户要求修改，更新对应 `phaseOutputs` 并重新确认，直到用户明确同意后再推进。
6. 当 `currentPhase` 为 `done` 时，输出最终总结，包括已生成文件、剩余风险和未闭环问题。

## 参考文件

- RN 代码约束：[reference/rn-guidelines.md](reference/rn-guidelines.md)
- Token 映射：[reference/token-map.json](reference/token-map.json)
- 样式扫描清单：[reference/style-scan-checklist.md](reference/style-scan-checklist.md)

## 输出格式

最终总结必须包含：

```markdown
# design-to-code-lite 交付总结

## 完成阶段

- [x] analyze
- [x] audit
- [x] design
- [x] build
- [x] verify

## 生成/修改文件

- `src/pages/...`
- `src/components/...`

## 剩余风险

- ...

## 需要人工确认

- ...
```
