# Phase 1 - 分析 & 注入计划

## 进入条件

- Phase 0 无高匹配知识条目

## 任务

1. 读取用户指定的相关源文件，理解代码逻辑
2. 确定项目类型：检查 `package.json` — 有 `react-native` 依赖 → RN 项目，否则 → Web 项目
3. 确定需要观察的注入点：函数入参、API 响应、状态变化、条件分支、错误路径
4. 注入点 label 遵循命名规范（见 [../reference/dbg-spec.md](../reference/dbg-spec.md)）

## 输出要求

告知用户计划并等待确认：

「我将在以下 N 个位置插入调试日志，用于追踪 xxx 问题：」

- `file.ts:行号` — 观察 xxx
- `file.ts:行号` — 观察 xxx

## 出口

- 用户确认注入计划 → 进入 [02-inject.md](02-inject.md)
- 用户要求调整 → 修改注入点后重新确认
