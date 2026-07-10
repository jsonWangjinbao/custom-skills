# Phase 01 - 需求与输入材料分析

## 进入条件

- 已 `Read .qoder/.dtc-state.json`。
- `currentPhase` 为 `init` 或 `analyze`。

## 任务

1. 读取用户提供的所有输入材料：
   - 需求描述
   - HTML 设计稿路径（`inputs.htmlPath`）
   - 截图路径（`inputs.screenshotPath`）
   - 接口文档路径（`inputs.apiDocPath`）
2. 提取功能点清单。
3. 标记模糊点（`openQuestions`），必要时询问用户。
4. 识别高风险点（黑盒表单、上传、OCR、动态字段等）。

## 输出要求

1. 先更新 `.qoder/.dtc-state.json` 的 `phaseOutputs.analyze`：

```json
{
  "featureList": [
    {
      "id": "F01",
      "name": "...",
      "priority": "must|should|nice",
      "notes": "..."
    }
  ],
  "materialsReadLog": [
    "已读取 src/xxx.html：包含 5 个字段、1 个上传区",
    "已读取截图：确认底部有提交按钮"
  ],
  "openQuestions": [],
  "risks": [
    {
      "id": "R01",
      "desc": "动态表单字段 nativeID 风险",
      "mitigation": "使用 SafeInput / SafeUploadFile"
    }
  ],
  "checklistPassed": true,
  "userConfirmed": false
}
```

2. **必须停下来向用户确认**：输出本阶段总结（功能清单、模糊点、风险），然后使用 `AskUserQuestion` 询问用户是否确认，或需要调整。
3. 只有在用户明确确认后，才将 `userConfirmed` 设为 `true` 并推进到 `audit` 阶段。
4. 如果用户提出修改，更新 `featureList`/`openQuestions`/`risks`，重新确认，直到用户满意。

## 用户确认问题示例

```
问题：Phase 01 分析结果如下，是否确认进入下一步 UI 审计？
选项：
- 确认，进入 UI 审计
- 需要调整（我会输入修改意见）
```

## 禁止

- 不写任何代码。
- 不能不读 HTML/截图就下结论。
- 不能把未确认的需求当作已确认处理。
