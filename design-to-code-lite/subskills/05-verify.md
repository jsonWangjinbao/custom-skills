# Phase 05 - 自测与样式扫描

## 进入条件

- 已 `Read .qoder/.dtc-state.json`。
- `phaseOutputs.build.checklistPassed === true`。
- `currentPhase` 为 `build` 或 `verify`。

## 任务

1. 读取已生成的文件。
2. 对照截图做 side-by-side 视觉还原检查。
3. 逐条执行 `reference/style-scan-checklist.md`。
4. 对照 `reference/rn-guidelines.md` 的禁止清单，检查组件来源、theme 使用、路由注册、表单 name 类型。
5. 输出扫描结果和剩余 gap。
6. 如果扫描不通过，`checklistPassed` 置为 `false`，并列出必须修复项。

## 输出要求

更新 `phaseOutputs.verify`：

```json
{
  "scanResults": [
    { "item": "无硬编码 hex", "pass": true, "evidence": "所有色值来自 theme" },
    {
      "item": "上传组件保留删除功能",
      "pass": false,
      "evidence": "缺少 showDelete 属性",
      "fix": "XlbUploadFile 传入 showDelete"
    }
  ],
  "pass": false,
  "gaps": ["上传组件缺少删除功能"],
  "checklistPassed": false
}
```

## 禁止

- 不能绕过未通过的扫描项。
- 不能以“UI 材料缺失”为由跳过样式检查。
