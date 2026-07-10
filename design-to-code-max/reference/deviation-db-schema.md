# 偏差持久化库 Schema

> 本文件定义 `.ai-wiki/design-deviation-db.json` 的字段结构。
> 跨需求积累组件库与设计稿的已知差异，避免重复发现同一问题。
> 版本: 1.0

---

## 1. 顶层结构

```jsonc
{
  "version": "1.0",
  "lastUpdated": "2026-07-09T12:00:00Z",
  "deviations": []
}
```

---

## 2. 偏差条目字段

```jsonc
{
  "id": "DEV-001",
  "component": "CommonFormItem",
  "defectType": "layout",
  "defect": "默认行高不可控，HTML 常见 48px 行高无法直接设置",
  "compensation": "使用自定义 View 包裹，设置 height:SPACE.SPACE_12 + justifyContent:center",
  "severity": "major",
  "firstDiscovered": "2026-07-09",
  "lastOccurred": "2026-07-09",
  "occurrenceCount": 3,
  "affectedRequirements": ["req-xxx"],
  "verifyCount": 2,
  "resolved": false
}
```

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | 唯一标识，格式 `DEV-NNN` |
| `component` | string | 是 | 组件名称，用于匹配（如 `CommonFormItem`, `XlbUploadFile`） |
| `defectType` | string | 是 | 缺陷类型枚举 |
| `defect` | string | 是 | 问题描述，清晰说明偏差现象 |
| `compensation` | string | 是 | 补偿方案，应包含可操作的代码说明 |
| `severity` | string | 是 | 严重度枚举 |
| `firstDiscovered` | string | 是 | 首次发现日期 `YYYY-MM-DD` |
| `lastOccurred` | string | 是 | 最近一次出现日期 |
| `occurrenceCount` | number | 是 | 出现次数，命中时递增 |
| `affectedRequirements` | string[] | 是 | 受影响的需求 ID 列表 |
| `verifyCount` | number | 是 | 已验证修复次数 |
| `resolved` | boolean | 是 | 是否已修复（true 表示已闭环，新需求不再预标注） |

---

## 3. 枚举值

### defectType

| 值 | 说明 | 示例 |
|----|------|------|
| `layout` | 布局差异（高度、对齐、顺序） | 行高不可控、flex 方向不一致 |
| `color` | 颜色差异 | 默认色值与设计稿不一致 |
| `spacing` | 间距差异 | padding/margin 不可控 |
| `icon` | 图标差异 | 图标名称映射错误、尺寸不匹配 |
| `typography` | 字体差异 | 字号、字重、行高不可控 |
| `missing` | 功能缺失 | 组件的某个 prop 无效或不支持 |

### severity

| 值 | 说明 | 处理要求 |
|----|------|---------|
| `critical` | 功能缺失或严重视觉偏差 | build 出口门禁时禁止通过，必须修复 |
| `major` | 视觉明显不符但功能不受影响 | 建议修复，可 defer 到 verify |
| `minor` | 细微偏差（1-2px 偏移） | 可 defer，累积到一定数量后批量修复 |

---

## 4. 生命周期

```text
[discovery]                     [recurrence]                    [resolution]
    │                               │                               │
    ▼                               ▼                               ▼
audit 发现新偏差 → → → 新需求命中 → → → verify 验证修复
build 未达预期      → occurrenceCount++    → resolved = true
                    lastOccurred = today    verifyCount++
```

### 各阶段操作

| 阶段 | 操作 |
|------|------|
| audit 开始 | 读取偏差库，筛选 `resolved !== true` 的条目，逐条比对当前组件列表 |
| audit 匹配 | 匹配到的偏差预标注到 ui-audit.md，格式：`【来源：偏差库 DEV-XXX】` |
| build Step 5.5 | 新偏差 → 追加新条目；已知偏差 → occurrenceCount++、lastOccurred 更新 |
| verify 结束 | 检查已修复条目：代码中确实落实补偿 → resolved=true、verifyCount++ |

---

## 5. 匹配规则

按 `component` 名称精确匹配。同一组件可有多条偏差（不同 defectType）。

```text
输入: 当前设计的组件列表 ["CommonFormItem", "XlbUploadFile", "XlbButton"]
偏差库: [{ component: "CommonFormItem", ... }, { component: "XlbButton", ... }]
匹配: CommonFormItem + XlbButton（匹配成功）
      XlbUploadFile（未匹配，无已知偏差）
```

---

## 6. 示例数据

```jsonc
{
  "version": "1.0",
  "lastUpdated": "2026-07-09T15:00:00Z",
  "deviations": [
    {
      "id": "DEV-001",
      "component": "CommonFormItem",
      "defectType": "layout",
      "defect": "默认行高不可控，HTML 常见 48px form-row 高度无法直接设置",
      "compensation": "使用自定义 View 包裹 form-row，设置 height:SPACE.SPACE_12 + justifyContent:center，不使用 CommonFormItem 默认行高",
      "severity": "major",
      "firstDiscovered": "2026-06-20",
      "lastOccurred": "2026-07-09",
      "occurrenceCount": 5,
      "affectedRequirements": ["req-001", "req-007", "req-012"],
      "verifyCount": 3,
      "resolved": false
    },
    {
      "id": "DEV-002",
      "component": "XlbUploadFile",
      "defectType": "missing",
      "defect": "默认不显示删除按钮，用户无法删除已上传的文件",
      "compensation": "传入 showDelete=true 属性",
      "severity": "critical",
      "firstDiscovered": "2026-06-22",
      "lastOccurred": "2026-07-08",
      "occurrenceCount": 4,
      "affectedRequirements": ["req-001", "req-007"],
      "verifyCount": 4,
      "resolved": true
    }
  ]
}
```

---

## 7. 最佳实践

- **一个偏差一个问题**：不要在同一条目中描述多个不同的问题
- **补偿方案可操作**：compensation 应该直接可复制到代码中使用
- **及时 resolve**：验证修复后立即标记 resolved=true
- **定期 review**：检查 occurrenceCount 持续增长的条目，考虑推动组件库改进
