# Phase 3 - 收集 & 分析

## 进入条件

- 用户告知「操作完了」「日志产生了」等；或 Phase 4 修复后用户反馈仍未修复

## 任务

1. **读取日志文件**：`.claude/auto-debug/{DEBUG_ID}.log`（JSONL 格式见 [../reference/dbg-spec.md](../reference/dbg-spec.md)）
   - 不要 kill 服务器 — 修复后需要重新收集日志验证
2. **日志为空时**：按 [../reference/troubleshooting.md](../reference/troubleshooting.md)「日志为空分级诊断」逐项排查，直到日志产生
3. **分析日志**：按时间线展开，关联 label + file:line 还原执行路径

## 输出要求

```
📋 调试分析：<问题简述>

Timeline:
HH:MM:SS.mmm | <label> → <数据摘要>

🔴 根因：<简明描述>
🔧 修复方案：<具体修复，包含代码 diff>
```

输出后征求用户确认修复方案。

## 出口

- 用户确认修复方案 → 进入 [04-fix-verify.md](04-fix-verify.md)
- 用户否定方案 → 补充注入点（回 [02-inject.md](02-inject.md) 步骤 10-11）或重新分析
