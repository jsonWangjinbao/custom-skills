---
name: auto-api-debug
description: 自动接口联调 — 当用户说「联调」「接口联调」「前后端联调」「对一下接口」等表述并指定模块时，盘点模块全部联调接口、注入出入参日志、自动操作浏览器走流程、比对契约输出联调报告（少参数/缺字段/接口报错/渲染问题），前端问题可确认后修复回归。支持 Web（PC/H5）与 React Native 项目。
---

# auto-api-debug

前后端接口联调工作流：接口盘点 → 步骤与注入计划（门禁）→ 注入 → 自动执行 → 比对报告 → 修复回归 → 清理 → 沉淀。Web 项目由 agent 自动操作浏览器，RN 项目由用户手动操作。

## 铁律（不可违反）

1. **全程只用 apiDbg()**：联调会话期间禁止 `console.log` / `console.warn` 等任何其他方式输出调试信息。
2. **服务器贯穿会话**：日志服务器在用户确认「联调完成」之前不 kill；修复回归时只重启服务器 + 清空日志，不删除 apiDbg 注入。
3. **清理必须彻底**：用户确认完成后，按 manifest.json 精确还原所有注入点，删除全部临时文件，grep 验证无残留。
4. **沉淀不可跳过**：清理完成后必须执行沉淀评估并主动给出建议；写入知识库必须经用户确认。
5. **apiDbg 不侵入业务**：绝不劫持 console；apiDbg 内的网络请求静默失败，错误原样 rethrow，绝不改变业务行为。
6. **Phase 1 是人工门禁**：操作步骤清单和注入计划未经用户确认，不得注入。
7. **只修前端待修项**：响应缺字段、后端报错等问题只写入报告，不替后端改东西。

## 触发条件

- **触发**：用户表述包含「联调」「接口联调」「前后端联调」「对一下接口」等，且指定了模块/页面范围。
- **不触发**：单个 bug 的调试（走 auto-debug）；纯接口文档咨询（静态阅读即可）。

## 工作流

```
用户说「联调 xxx 模块」
  → Phase 0: 接口盘点（扫描模块 → inventory.json）
  → Phase 1: 操作步骤清单 + 注入计划 ── 用户确认（门禁）
  → Phase 2: 注入 apiDbg + 启动日志服务器
  → Phase 3: Web → Browser 子代理按步骤自动操作（截图 + console）;RN → 用户手动操作
  → Phase 4: 日志 × 清单比对 → 联调报告
       ├─ 有未触发接口 → 补步骤回 Phase 3
       ├─ 有前端待修 → 用户确认 → Phase 5 修复 → 回 Phase 3/4 回归
       └─ 用户确认完成 → Phase 5 最终清理
  → Phase 6: 沉淀确认
```

## 阶段路由

| 阶段         | 文件                                                         | 进入时机                               |
| ------------ | ------------------------------------------------------------ | -------------------------------------- |
| 0 接口盘点   | [subskills/00-inventory.md](subskills/00-inventory.md)       | 联调入口，必做                         |
| 1 步骤与计划 | [subskills/01-plan.md](subskills/01-plan.md)                 | 盘点完成后（人工门禁）                 |
| 2 注入       | [subskills/02-inject.md](subskills/02-inject.md)             | 用户确认计划后                         |
| 3 执行操作   | [subskills/03-execute.md](subskills/03-execute.md)           | Web：注入完成且用户确认开始；RN 跳过   |
| 4 比对报告   | [subskills/04-report.md](subskills/04-report.md)             | 执行完成 / 用户告知操作完成            |
| 5 修复与清理 | [subskills/05-fix-verify.md](subskills/05-fix-verify.md)     | 修复方案确认后 / 用户确认完成          |
| 6 沉淀       | [subskills/06-distill.md](subskills/06-distill.md)           | 清理完成后必做                         |

## 参考文件索引

| 文件                                                             | 用途                                             | 加载时机                   |
| ---------------------------------------------------------------- | ------------------------------------------------ | -------------------------- |
| [reference/api-dbg-spec.md](reference/api-dbg-spec.md)           | label 命名、注入示例、日志/inventory/manifest 格式 | Phase 0/2/4                |
| [reference/inventory-rules.md](reference/inventory-rules.md)     | 接口盘点规则、契约推断优先级                     | Phase 0 盘点               |
| [reference/troubleshooting.md](reference/troubleshooting.md)     | 登录态、日志为空、端口冲突、浏览器操作失败等异常 | 遇到异常时按需             |

## 关键路径

- 知识库：`~/.claude/skills/auto-api-debug/knowledge/`（全局索引 `_index.json`，条目 `<项目名>/YYYY-MM-DD-{slug}.md`）
- 联调临时目录：项目根目录 `.claude/auto-api-debug/`（manifest、inventory、日志、report、shots）
- apiDbg 模板：`templates/claudeApiDebug.ts` → 注入时写入项目 `src/utils/claudeApiDebug.ts`
- 报告模板：`templates/api-report.md.tpl` → 输出到 `.claude/auto-api-debug/report.md`
- 日志服务器：`scripts/server.mjs`
