# 阶段 01：收集与前置校验

## 目标

锁定目标项目、需求目录、端和看板地址意图；确认埋点已验证通过；识别中断恢复点。此阶段只读，不创建 payload、不调用提交接口。

## 步骤

### 1. 定位需求目录

1. 目标项目取当前工作区；用户明确给路径时以用户路径为准。
2. 查找 `.ai-point/*/verify-report.md`：
   - 当前对话有需求名 → 精确匹配；
   - 只有一个候选 → 自动选中并回显；
   - 多个候选且上下文无法唯一确定 → AskUserQuestion 让用户选择；
   - 没有候选 → 停止，说明「没有已验证的埋点需求，不能同步」。
3. 需求目录记为 `REQ_DIR`，输出目录为 `SYNC_DIR=$REQ_DIR/board-sync`。

### 2. 校验验证结论

完整 Read `verify-report.md`，检查：

- 存在明确的验证通过/完成结论；
- 没有阻断项、失败项、未清理调试代码；
- 若报告写明部分失败/未完成/待验证 → 停止并列出阻断；
- 若报告格式无法判定 → Read `point-plan.md` 对照验证项；仍无法判定时 AskUserQuestion 只能选择「回原开发 skill 补验证 / 取消」，不得让用户强行跳过。

### 3. 识别端

优先从 `point-list.md` 或 `source-list.md` 头部读取 `端：PC / RN`。无法识别时 AskUserQuestion（选项只有 PC、RN）。

### 4. 识别代码位置

默认：

- PC：`src/tracking/business/`（events + chains + index）
- RN：`src/tracking/`（events + chains.ts）

默认目录不存在时，搜索项目内 `tracking/**/events/*.ts` 和含 `chainId` 的文件，提出候选后 AskUserQuestion；确定后后续 extract 传 `--tracking-dir <相对路径>`。

### 5. 看板地址意图

- 用户当前指令或上文明确说「本地看板 / localhost」→ 后续 dry-run 传 `--board-url http://localhost:3001`。
- 用户给出 URL → 后续原样传 `--board-url`。
- 没有指定 → 不问，交给 submit.mjs 按配置文件 / 环境变量 / 线上→本地探测解析。

> 地址与固定令牌完整契约仅在地址/协议失败时 Read `../reference/api-contract.md`，不要在本阶段无故加载。

### 6. 中断恢复

检查 `SYNC_DIR`：

- 有 `submission.json` → 不重新提取，直接 Read 03-submit 的「状态查询」并执行 `status`；根据结果决定后续。
- 有 `dry-run.json` 无 submission → 比对代码是否在 dry-run 后变化：运行 `git status --porcelain` 和比较 payload/source.commit；不确定则重新从阶段 2 提取（安全优先）。
- 其他情况按 SKILL.md 中断恢复表进入对应阶段。

## 阶段完成回显

一句话回显：`需求名 / 端 / tracking 目录 / 看板地址意图（自动解析或显式地址） / 恢复点`。然后 Read `02-extract.md`（如果不是状态查询路径）。
