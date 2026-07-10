# design-to-code-max 状态机 Schema (v2.0)

> 本文件是 `.ai-wiki/.dtc-state.json` 的完整字段定义。
> 从 SKILL.md 拆分而来，供所有 subskill 引用。
> 版本: 2.0

---

## 1. 顶层结构

```jsonc
{
  "skill": "design-to-code-max",
  "version": "2.0",
  "startedAt": "2026-07-09T10:00:00Z",
  "updatedAt": "2026-07-09T12:00:00Z",
  "requirements": []
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `skill` | string | 是 | 固定为 `"design-to-code-max"`，不匹配时拒绝执行 |
| `version` | string | 是 | 状态版本号，当前 `"2.0"` |
| `startedAt` | string | 是 | ISO 时间戳，首次创建时写入 |
| `updatedAt` | string | 是 | ISO 时间戳，每次写文件时更新 |
| `requirements` | array | 是 | 需求条目数组，至少含一个元素 |

---

## 2. 需求条目字段

```jsonc
{
  "id": "req-1712345678",
  "requirementName": "企业认证改版",
  "requirementType": "incremental",
  "status": "in-progress",
  "currentPhase": "build",
  "inputs": {
    "htmlPath": "src/cert-approve.html",
    "screenshotPath": "screenshots/cert.png",
    "apiDocPath": "docs/api.md",
    "description": "优化企业认证流程",
    "originalCodePath": "src/pages/cert/"
  },
  "docPaths": {
    "features": ".ai-wiki/企业认证/features.md",
    "uiAudit": ".ai-wiki/企业认证/ui-audit.md",
    "techDesign": ".ai-wiki/企业认证/tech-design.md",
    "execution": ".ai-wiki/企业认证/execution.md",
    "parsedStylesDir": ".ai-wiki/企业认证/parsed-styles/"
  },
  "phaseOutputs": { /* 见第 3 节 */ },
  "performanceLog": [],
  "changeLog": []
}
```

### 顶层需求字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | 唯一标识，建议 `req-${Date.now()}` |
| `requirementName` | string | 是 | 需求名称，init 阶段由用户输入 |
| `requirementType` | string | 是 | `"incremental"` | `"refactor"` |
| `status` | string | 是 | `"in-progress"` | `"done"` |
| `currentPhase` | string | 是 | `"init"` | `"analyze"` | `"audit"` | `"design"` | `"build"` | `"verify"` | `"done"` |
| `inputs` | object | 是 | 输入材料路径 |
| `docPaths` | object | 是 | 各阶段生成的文档路径 |
| `phaseOutputs` | object | 是 | 各阶段输出状态 |
| `performanceLog` | array | 是 | 性能计时日志数组 |
| `changeLog` | array | 是 | 变更记录数组 |

### inputs 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `htmlPath` | string | HTML 设计稿路径（可多个，逗号分隔） |
| `screenshotPath` | string | 截图路径（可多个，逗号分隔） |
| `apiDocPath` | string | 接口文档路径 |
| `description` | string | 需求描述（口述需求时填入） |
| `originalCodePath` | string | 原代码路径（重构模式必填） |

### docPaths 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `features` | string | features.md 路径 |
| `uiAudit` | string | ui-audit.md 路径 |
| `techDesign` | string | tech-design.md 路径 |
| `execution` | string | execution.md 路径 |
| `parsedStylesDir` | string | parsed-styles/ 目录路径（HTML 解析引擎输出目录） |

---

## 3. phaseOutputs 字段

### 3.1 analyze

```jsonc
{
  "analyze": {
    "featureCount": 12,
    "materialsReadLog": [
      "已分析原代码 src/pages/cert/*：提取 12 个功能点、3 个接口、2 组表单联动",
      "已读取 src/xxx.html（UI 参考）：包含 5 个字段、1 个上传区",
      "已读取截图（UI 参考）：确认底部有提交按钮"
    ],
    "openQuestions": [],
    "risks": [
      {
        "id": "R01",
        "desc": "动态表单字段 nativeID 风险",
        "mitigation": "使用 SafeInput / SafeUploadFile"
      }
    ],
    "checklistPassed": false,
    "userConfirmed": false
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `featureCount` | number | 功能点数量 |
| `materialsReadLog` | string[] | 已读材料清单 |
| `openQuestions` | string[] | 待解答问题 |
| `risks` | object[] | 风险项数组 |
| `checklistPassed` | boolean | 阶段 checklist 是否通过 |
| `userConfirmed` | boolean | 用户是否确认 |

### 3.2 audit

```jsonc
{
  "audit": {
    "materialStatus": "complete",
    "componentDecisionCount": 8,
    "blackBoxRisks": [
      {
        "component": "XlbUploadFile",
        "risk": "默认不显示删除按钮",
        "compensation": "传入 showDelete=true"
      }
    ],
    "parsedStyleCount": 3,
    "unmappedTokens": [
      { "value": "14px", "reason": "FONT.SIZE_14 不存在", "action": "使用 FONT.SIZE_16 近似" }
    ],
    "deviationMatches": 2,
    "checklistPassed": false,
    "userConfirmed": false
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `materialStatus` | string | `"complete"` | `"partial"` | `"skipped"` |
| `componentDecisionCount` | number | 组件决策数量 |
| `blackBoxRisks` | object[] | 黑盒组件风险 |
| `parsedStyleCount` | number | 【v2.0 新增】已解析的样式文件数 |
| `unmappedTokens` | object[] | 【v2.0 新增】无法 token 映射的清单 |
| `deviationMatches` | number | 【v2.0 新增】命中偏差库的条目数 |
| `checklistPassed` | boolean | 阶段 checklist 是否通过 |
| `userConfirmed` | boolean | 用户是否确认 |

### 3.3 design

```jsonc
{
  "design": {
    "fileCount": 5,
    "routeCount": 2,
    "apiCallCount": 3,
    "dynamicFormSafety": "所有数组 name 转换为字符串；动态字段使用 SafeInput / SafeUploadFile",
    "checklistPassed": false,
    "userConfirmed": false
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `fileCount` | number | 设计文件数 |
| `routeCount` | number | 路由数 |
| `apiCallCount` | number | API 调用数 |
| `dynamicFormSafety` | string | 动态表单安全方案说明 |
| `checklistPassed` | boolean | 阶段 checklist 是否通过 |
| `userConfirmed` | boolean | 用户是否确认 |

### 3.4 build

```jsonc
{
  "build": {
    "totalGroups": 4,
    "completedGroups": 2,
    "currentGroup": 3,
    "createdFiles": ["src/pages/cert/FormItems.tsx"],
    "modifiedFiles": ["src/pages/cert/index.tsx"],
    "htmlReadLog": ["分组1: parsed-styles/cert-approve.json"],
    "completedFeatureIds": ["F-001", "F-002"],
    "exitGatePassed": false,
    "checklistPassed": false
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `totalGroups` | number | 总分数组 |
| `completedGroups` | number | 已完成组数 |
| `currentGroup` | number | 当前组号 |
| `createdFiles` | string[] | 新增文件列表 |
| `modifiedFiles` | string[] | 修改文件列表 |
| `htmlReadLog` | string[] | 【v2.0 增强】记录"HTML 已读"或"解析数据已读" |
| `completedFeatureIds` | string[] | 已完成功能点 ID |
| `exitGatePassed` | boolean | 出口门禁是否通过 |
| `checklistPassed` | boolean | 阶段 checklist 是否通过 |

### 3.5 verify

```jsonc
{
  "verify": {
    "scanResults": [
      { "item": "无硬编码 hex", "pass": true, "evidence": "所有色值来自 theme" },
      { "item": "dependencies 禁用", "pass": true, "evidence": "grep 无匹配" },
      { "item": "defer 项闭环", "pass": true, "evidence": "3 项全部已修复" },
      { "item": "label 可见性", "pass": true, "evidence": "所有表单字段 label 已核验可见" },
      { "item": "上传组件保留删除功能", "pass": false, "evidence": "缺少 showDelete", "fix": "XlbUploadFile 传入 showDelete" }
    ],
    "styleScanPassed": true,
    "dynamicFormPassed": true,
    "gaps": [],
    "checklistPassed": false
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `scanResults` | object[] | 扫描结果列表 |
| `styleScanPassed` | boolean | 样式合规扫描是否通过 |
| `dynamicFormPassed` | boolean | 动态表单安全检查是否通过 |
| `gaps` | string[] | 未通过项清单 |
| `checklistPassed` | boolean | 阶段 checklist 是否通过 |

---

## 4. changeLog 结构

```jsonc
{
  "changeLog": [
    {
      "type": "initial",
      "desc": "初始需求",
      "changedItems": [],
      "timestamp": "2026-07-09T10:00:00Z"
    },
    {
      "type": "modification",
      "desc": "增加证件类型字段",
      "changedItems": ["F-004"],
      "timestamp": "2026-07-09T14:30:00Z"
    }
  ]
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `type` | string | `"initial"`（初始创建）/ `"modification"`（需求变更） |
| `desc` | string | 变更描述 |
| `changedItems` | string[] | 受影响的功能点 ID 列表 |
| `timestamp` | string | ISO 时间戳 |

---

## 5. 状态迁移规则

```text
[init] → analyze ──✅+确认──→ audit ──✅+确认──→ design ──✅+确认──→ build ──出口门禁──→ verify ──✅──→ done
```

- 每个阶段必须 `checklistPassed === true` 才能推进
- analyze / audit / design 三个阶段还需 `userConfirmed === true`
- build 阶段还需 `exitGatePassed === true`
- 任何阶段不满足条件 → 停止并告知用户
- 用户提出修改时，从 done 或 verify 回退到 build，追加 changeLog 条目

---

## 6. 版本迁移 (v1 → v2)

从旧版单对象升级到 v2.0 数组结构时：

```text
检测到 version < 2.0:
1. 将旧对象的字段映射为 requirements[0]
   - requirementName ← 旧对象.requirementName
   - requirementType ← 旧对象.requirementType
   - currentPhase ← 旧对象.currentPhase
   - inputs ← 旧对象.inputs
   - docPaths ← 旧对象.docPaths（parsedStylesDir 置空）
   - phaseOutputs ← 旧对象.phaseOutputs
   - performanceLog ← 旧对象.performanceLog
   - id ← "req-migrated-${Date.now()}"
   - status ← (currentPhase === "done") ? "done" : "in-progress"
   - changeLog ← [{ type: "initial", desc: "从 v1 迁移", ... }]
2. 保留共享字段: skill, version="2.0", startedAt, updatedAt
3. 写回 .dtc-state.json
4. 输出提示: "已从旧版状态迁移"
```
