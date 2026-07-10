# Phase 04 - 代码生成

## 进入条件

- 已 `Read .qoder/.dtc-state.json`。
- `phaseOutputs.design.checklistPassed === true` 且 `phaseOutputs.design.userConfirmed === true`。
- `currentPhase` 为 `design` 或 `build`。

## 任务

1. **先读 `reference/rn-guidelines.md`**，确认 RN 组件、主题、路由、表单安全等约束。
2. 按 `phaseOutputs.design.files` 逐文件生成代码。
3. 所有色值/字号/间距必须来自 `reference/token-map.json` 或 `@xlb/components-react-native` theme；禁止硬编码。
4. 严格使用 `phaseOutputs.audit.componentDecisionTable` 里的组件选择。
5. 保留所有已有功能字段、事件、校验、OCR、上传逻辑。
6. 每生成/修改一个文件后，记录到状态文件。

## 输出要求

更新 `phaseOutputs.build`：

```json
{
  "createdFiles": ["src/pages/certificate/health/Detail.tsx"],
  "modifiedFiles": [],
  "notes": [
    "使用 theme.colors.primary 替代硬编码 #1A6AFF",
    "使用 SafeUploadFile 处理上传组件"
  ],
  "checklistPassed": true
}
```

## 禁止

- 不能一次生成过多文件而不更新 checkpoint。
- 不能跳过 `reference/rn-guidelines.md`。
- 不能用硬编码 color/margin/fontSize。
- 不能删除 `phaseOutputs.design.apiCalls` 中的字段。
- 不能让 `XlbForm.Item` 的 `name` 为数组。
