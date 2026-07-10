# Phase 02 - UI 审计与组件映射

## 进入条件

- 已 `Read .qoder/.dtc-state.json`。
- `phaseOutputs.analyze.checklistPassed === true` 且 `phaseOutputs.analyze.userConfirmed === true`。
- `currentPhase` 为 `analyze` 或 `audit`。

## 任务

1. 对照 HTML/截图，逐块拆解 UI。
2. **先读 `reference/rn-guidelines.md` 的组件库使用清单**，为每个 UI 块选择对应 XLB 组件。
3. 为每个 UI 块选择组件，并说明理由。
4. 识别黑盒封装组件（如 `CommonFormItem` / `XlbUploadFile` / `XlbDialog`）的默认渲染差异。
5. 输出组件选择决策表。
6. 记录必须使用的 theme token（色值、字号、间距）。

## 输出要求

1. 更新 `phaseOutputs.audit`：

```json
{
  "componentDecisionTable": [
    {
      "uiBlock": "姓名输入框",
      "candidate": ["CommonFormItem", "XlbForm.Item"],
      "selected": "CommonFormItem",
      "reason": "项目已有表单项统一封装",
      "renderDiff": "默认无底部边框，需手动加 borderBottom",
      "compensation": "包裹一层带 borderBottom 的 View"
    }
  ],
  "blackBoxRisks": [
    {
      "component": "XlbUploadFile",
      "risk": "默认不显示删除按钮",
      "compensation": "传入 showDelete=true"
    }
  ],
  "styleTokens": [
    { "target": "主按钮背景", "token": "colors.primary", "value": "#1A6AFF" }
  ],
  "checklistPassed": true,
  "userConfirmed": false
}
```

2. **必须停下来向用户确认**：输出组件选择决策表和黑盒风险 summary，使用 `AskUserQuestion` 询问用户是否确认。
3. 用户确认后将 `userConfirmed` 设为 `true`，推进到 `design`；如需调整，更新决策表并重新确认。

## 用户确认问题示例

```
问题：Phase 02 UI 审计与组件映射结果如下，是否确认进入技术设计？
选项：
- 确认，进入技术设计
- 需要调整（我会输入修改意见）
```

## 禁止

- 不能跳过“默认渲染差异”列。
- 不能只写组件名不写理由。
