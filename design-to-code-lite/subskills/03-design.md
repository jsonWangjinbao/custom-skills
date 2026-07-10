# Phase 03 - 技术设计

## 进入条件

- 已 `Read .qoder/.dtc-state.json`。
- `phaseOutputs.audit.checklistPassed === true` 且 `phaseOutputs.audit.userConfirmed === true`。
- `currentPhase` 为 `audit` 或 `design`。

## 任务

1. **先读 `reference/rn-guidelines.md`**，确认路由、状态、接口、表单规范。
2. 设计页面/组件文件结构。
3. 确定路由（`src/config/route.ts` 中新增 `FsmsRouteKeys`）、状态管理、API 调用点。
4. 明确表单字段 name、校验规则、默认值；确保 name 为字符串，不使用数组。
5. 处理动态表单安全（数组 name、nativeID 崩溃）。
6. 确认不丢失已有功能字段（如 `id_card_encrypted`、OCR、上传回调）。

## 输出要求

1. 更新 `phaseOutputs.design`：

```json
{
  "routes": [
    { "path": "/certificate/health/detail", "component": "HealthCertDetail" }
  ],
  "files": [
    { "path": "src/pages/certificate/health/Detail.tsx", "purpose": "..." }
  ],
  "stateShape": {
    "form": "...",
    "loading": "boolean"
  },
  "apiCalls": [
    {
      "api": "getHealthCertDetail",
      "params": ["id"],
      "responseFields": ["name", "id_card_encrypted"]
    }
  ],
  "dynamicFormSafety": "所有数组 name 转换为字符串；使用 SafeUploadFile",
  "checklistPassed": true,
  "userConfirmed": false
}
```

2. **必须停下来向用户确认**：输出文件结构、路由、API 调用和动态表单安全方案 summary，使用 `AskUserQuestion` 询问用户是否确认。
3. 用户确认后将 `userConfirmed` 设为 `true`，推进到 `build`；如需调整，更新设计并重新确认。

## 用户确认问题示例

```
问题：Phase 03 技术设计结果如下，是否确认进入代码生成？
选项：
- 确认，开始生成代码
- 需要调整（我会输入修改意见）
```

## 禁止

- 不能省略 API 返回字段。
- 不能把动态表单项 name 保留为数组。
