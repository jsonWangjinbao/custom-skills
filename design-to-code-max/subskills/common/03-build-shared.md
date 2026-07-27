# Build 阶段共享模块

> 本文件包含三平台（RN/H5/PC）build 阶段的**完全相同**的指令段落。
> 各平台 `03-build.md` 通过引用本文件的节号来复用这些内容，避免 3 份重复。

---

## §Step 5.5.2 门禁报告

检查全部 PASS 后，在 `execution.md` 本分组末尾输出报告：

```markdown
#### 分组门禁报告 — 分组 N

| 检查项          | 结果 | 证据/说明                          |
| --------------- | ---- | ---------------------------------- |
| 1. {平台特定}   | ✅   | {证据}                             |
| 2. {平台特定}   | ✅   | {证据}                             |
| 3. {平台特定}   | ✅   | {证据}                             |
| 4. 设计偏差闭合 | ✅   | N 条偏差已修复，0 条 defer         |
| 5. 字段完整性   | ✅   | 正反双向验证通过，N 个字段全覆盖    |

**代码变更摘要**：新增 N 个文件，修改 M 个文件。本分组功能点：FP-xxx
```

---

## §Step 5.5.3 人工审查门禁

> ❗️ **铁律**：门禁报告输出后，**必须停止并等待用户审查确认**，禁止自动推进到 Step 6。

**第一步** — 列出本分组所有新增/修改的文件路径，让用户知道审哪些文件。

**第二步** — 调用 `AskUserQuestion`（单问题，严禁多问题打包）：

```
header: "分组N门禁"
question: "分组 N「名称」代码生成完成。门禁全通过。请审查代码变更后确认："
options:
  - label: "审查通过，继续下一分组"
    description: "已审查代码，确认无误，推进到分组 N+1"
  - label: "需要修改"
    description: "在 Other 中输入修改意见，修复后重新过门禁"
```

**第三步** — 处理用户决定：
- 用户选「审查通过」→ 门禁通过，进入 Step 6
- 用户选「需要修改」→ 根据意见修复 → 重跑全部自动检查 → 重新提交人工审查
- 重新提交时在门禁报告中追加：`修订记录：第 K 次 — {用户意见摘要} — {修复内容}`

---

## §Step 5.5.4 更新状态（groupGates）

门禁通过后，写入 `.ai-wiki/.dtc-state.json`：

```jsonc
{
  "build": {
    "groupGates": {
      "N": {
        "passed": true,
        "userApproved": true,
        "deviationsFound": 0,
        "deviationsFixed": 0,
        "minorDeferred": 0,
        "revisions": 0,
        "filesCreated": ["..."],
        "filesModified": [],
        "completedFeatureIds": ["F-xxx"]
      }
    }
  }
}
```

> 中断恢复：检查 `groupGates[N].passed` 和 `groupGates[N].userApproved`。任一不为 true → 该分组必须重过门禁。

---

## §Step 6 更新 execution.md

将该分组标题标记为 ✅，在对应 Step 行末尾追加 `实际: MM 分钟`，确认「解析数据已读」日志、「模式对齐确认表」（如有）、「分组门禁报告」均已填写。

**同步维护「恢复入口」**：

```markdown
## 恢复入口

- 当前进度：分组 X 已完成（门禁 ✅）
- 下一步：分组 Y Step 1（读设计文档）
- 最后更新：YYYY-MM-DD HH:mm
```

---

## §Step 7 更新 features.md

将关联功能点 ⬜ → ✅；追加 `分组 N 完成: HH:MM (实际 MM 分钟)` 到「性能计时日志」。

---

## §Step 8 更新 .dtc-state.json

同步更新 JSON 状态中当前需求条目的 build 字段：

```jsonc
{
  "completedGroups": N,
  "currentGroup": N + 1,
  "createdFiles": ["新增的文件路径"],
  "modifiedFiles": ["修改的文件路径"],
  "htmlReadLog": ["分组N: parsed-styles/xxx.json"],
  "completedFeatureIds": ["F-001", "F-002"]
}
```

**同步更新 `updatedAt` 时间戳。**

---

## §分层验证一览

| 层级            | 时机             | 范围                                   | 结果              |
| --------------- | ---------------- | -------------------------------------- | ----------------- |
| **分组门禁**    | build Step 5.5   | 自动检查 + 人工审查，硬阻塞            | 通过/重跑         |
| **出口门禁**    | build 全部完成后 | 跨分组全局检查                         | 通过/禁止         |
| **verify 终检** | verify 阶段      | 全部分组 + 完整验证                    | 交付/返回修复     |

---

## §上下文管理

build 阶段的每个分组开始时，**增量加载**而非全量加载：

1. 读取 `execution.md`（从中获取当前分组任务和「恢复入口」标记）
2. 读取 `parsed-styles/*.json` 中对应页面的数据
3. 读取 `ui-audit.md` 中对应分组的规格部分（非整个文件）
4. 读取 `tech-design.md` 中对应分组的决策部分（非整个文件）
5. **standard / full**: 必须读取 `api-spec.md` 中对应接口的规格定义（请求参数表、响应字段表、取值路径），不再从源码裸提取参数格式；**quick / micro**: 读取 `features.md` §接口清单 + §接口补充
6. **不加载**已完成分组的代码文件
7. **不裸读原始 HTML**（除非 parsed 数据不足以回答问题）

---

## §中断恢复

如果在执行中途被中断：

1. 下次启动时 `Read .ai-wiki/.dtc-state.json`
2. 检查当前需求条目的 `build.completedGroups` 和 `build.currentGroup`
3. 跳到当前未完成的分组
4. **分组门禁恢复检测**：检查 `build.groupGates[N]` 中上一分组的 `passed` 和 `userApproved`：
   - `passed: false` → 上一分组未过门禁，重跑 5.5.1 自动检查 + 5.5.3 人工审查
   - `userApproved: false`（passed 为 true 但用户未确认）→ 直接跳到 5.5.3 人工审查步骤
   - 两者均为 true → 正常进入下一分组
5. **上下文恢复检测**：检查上一分组的 `htmlReadLog`，如果日志缺失或在旧版格式下为裸 HTML 路径，提示：
   ```
   检测到上一分组可能跳过了样式数据读取步骤（无「解析数据已读」日志），建议重新执行该分组的样式还原部分
   ```
6. 如果用户选择重新执行，重新读取 `parsed-styles` JSON 并对比已生成的代码，修复样式偏差

---

## §禁止（共享项）

以下禁止项适用于所有平台，各平台 `03-build.md` 的「禁止」段应引用本条并追加平台特有项：

- **跳过 Step 5.5 分组门禁直接进入 Step 6。**
- **Step 5.5 门禁未通过（存在 FAIL 项）时推进到下一分组。**
- **Step 5.5 人工审查未获得用户确认时推进到下一分组。**
- 当 `materialStatus` 为 `"complete"` 时，跳过 Step 2 写出无样式的代码。
- Step 2 中未记录「解析数据已读」日志就跳到 Step 3。
- **standard/full 模式**: Step 2 中未读取 `api-spec.md` 就直接用猜测的格式写 API 调用。
- **quick/micro 模式**: Step 2 中未读取 `features.md` §接口清单 + §接口补充 就写 API 调用。
- **standard/full 模式**: Step 4 中未对照 `api-spec.md` 的字段综合映射表就生成渲染字段。
- 一次生成过多文件而不更新 checkpoint。

---

## §Step 3 项目级缓存（首次分组后复用）

> 本指令写入 build 阶段的「上下文管理」段落之后、Step 3 之前。

Step 3 读取参照页并建立模式对齐确认表，其结果在**同一项目的所有分组中不变**。首次分组完成后将确认表写入临时缓存，后续分组直接复用：

1. **首次分组**：正常执行 Step 3 +
   3.5（如适用），产出完整的「模式对齐确认表」
2. **写入缓存**：将确认表作为 markdown 追加到 `execution.md` 末尾的「项目模式缓存」章节：

   ```markdown
   ## 项目模式缓存
   > 本表在分组 1 的 Step 3 中建立，后续分组复用，无需重读参照页。

   {完整的模式对齐确认表内容}
   ```

3. **后续分组**：Step 3 改为读取 `execution.md` 的「项目模式缓存」章节，直接复用确认结果，**不再重新读取参照页源码**
4. **例外**：如果后续分组的模块使用了新的组件类型（如首次使用上传组件），仅对该维度补充确认
