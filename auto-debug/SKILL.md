---
name: auto-debug
description: 自动调试 — 当用户说「调试一下」「为什么不行」「帮我看看这个bug」「定位一下」等表述时，自动在代码中注入日志、收集日志、分析定位问题、修复后清理。支持 React Native 和 Web 项目。
---

# auto-debug

自动化调试工作流：知识匹配 → 注入日志 → 收集分析 → 修复验证 → 清理 → 沉淀。支持 React Native 和 Web 项目。

## 铁律（不可违反）

1. **全程只用 dbg()**：调试会话期间禁止 `console.log` / `console.warn` / `XlbToast.show` 等任何其他方式输出调试信息。
2. **服务器贯穿会话**：日志服务器在用户确认「修好了」之前不 kill；修复重验时只重启服务器 + 清空日志，不删除 dbg 注入。
3. **清理必须彻底**：用户确认修复后，按 manifest.json 精确还原所有注入点，删除全部临时文件，grep 验证无残留。
4. **沉淀不可跳过**：清理完成后必须执行沉淀评估并主动给出建议；写入知识库必须经用户确认。
5. **dbg 不侵入业务**：绝不劫持 console；dbg 内的网络请求静默失败，绝不影响业务。

## 触发条件

- **触发**：用户表述包含「调试」「bug」「为什么不行」「定位」「帮我看看」等，且问题需要运行时才能确认（非纯代码阅读可解决）。
- **不触发**：纯咨询问题、代码审查请求（先读代码静态分析，不确定再提议注入）。

## 工作流

```
用户说「帮我调试 xxx」
  → Phase 0: 知识匹配 ── 高匹配 → 复用修复方案 → Phase 4 验证
  → Phase 1~3: 分析计划 → 注入 → 收集分析
  → Phase 4: 修复 + 用户验证（未完成 → 回 Phase 3 循环）
  → 用户确认修好 → 最终清理
  → Phase 5: 沉淀确认
```

## 阶段路由

| 阶段             | 文件                                                               | 进入时机                           |
| ---------------- | ------------------------------------------------------------------ | ---------------------------------- |
| 0 知识匹配       | [subskills/00-knowledge-match.md](subskills/00-knowledge-match.md) | 调试入口，必做                     |
| 1 分析计划       | [subskills/01-analyze.md](subskills/01-analyze.md)                 | 无高匹配知识时                     |
| 2 注入           | [subskills/02-inject.md](subskills/02-inject.md)                   | 用户确认注入计划后                 |
| 3 收集分析       | [subskills/03-collect.md](subskills/03-collect.md)                 | 用户告知操作完成后                 |
| 4 修复验证与清理 | [subskills/04-fix-verify.md](subskills/04-fix-verify.md)           | 修复方案确认后（含循环与最终清理） |
| 5 沉淀           | [subskills/05-distill.md](subskills/05-distill.md)                 | 清理完成后必做                     |

## 参考文件索引

| 文件                                                           | 用途                                        | 加载时机                   |
| -------------------------------------------------------------- | ------------------------------------------- | -------------------------- |
| [reference/dbg-spec.md](reference/dbg-spec.md)                 | label 命名、注入示例、日志/manifest 格式    | Phase 2 注入、Phase 3 分析 |
| [reference/troubleshooting.md](reference/troubleshooting.md)   | IP 变更、端口冲突、日志为空、并发会话等异常 | 遇到异常时按需             |
| [reference/knowledge-format.md](reference/knowledge-format.md) | 知识条目模板、索引 schema、评估维度         | Phase 0 匹配、Phase 5 写入 |

## 关键路径

- 知识库：`~/.claude/skills/auto-debug/knowledge/`（全局索引 `_index.json`，条目 `<项目名>/YYYY-MM-DD-{slug}.md`）
- 调试临时目录：项目根目录 `.claude/auto-debug/`（manifest、日志、服务器副本）
- dbg 模板：`templates/claudeDebug.ts` → 注入时写入项目 `src/utils/claudeDebug.ts`
- 日志服务器：`scripts/server.mjs`
