# 阶段 01：收集与前置校验

## 目标

锁定目标项目、埋点代码位置、端、输出目录和看板地址意图；识别中断恢复点。此阶段只读，不创建 payload、不调用提交接口。只要有埋点代码即可继续，不要求 `.ai-point` 目录或验证报告。

## 步骤

### 1. 定位埋点代码

1. 目标项目取当前工作区；用户明确给路径时以用户路径为准。
2. 检查默认目录：
   - PC：`src/tracking/business/`（events + chains + index）
   - RN：`src/tracking/`（events + chains.ts）
3. 默认目录不存在时，搜索项目内 `tracking/**/events/*.ts` 和含 `chainId` 的文件，提出候选后 AskUserQuestion；确定后后续 extract 传 `--tracking-dir <相对项目根路径>`。
4. 找不到 events / chains 代码才停止，说明「没有可提交的埋点代码」。

### 2. 识别端

优先按 tracking 目录结构判定：`src/tracking/business` → PC，`src/tracking` → RN。自定义目录无法判定时，再看 `point-list.md` / `source-list.md` 头部的 `端：PC / RN`；仍无法识别时 AskUserQuestion（选项只有 PC、RN）。两端目录同时存在时，AskUserQuestion 让用户选本次提交端。

### 3. 确定输出目录

输出目录记为 `SYNC_DIR`，按以下优先级确定：

1. 用户指定需求目录 → 该目录下 `board-sync/`；
2. 项目存在唯一 `.ai-point/*/` → 自动选中并回显，用 `.ai-point/【需求名】/board-sync/`；
3. 多个 `.ai-point/*/` 且上下文无法唯一确定 → AskUserQuestion 让用户选择；
4. 没有 `.ai-point` → 项目根 `.board-sync/`，产物直接放在该目录下。

### 4. 看板地址意图

- 用户当前指令或上文明确说「本地看板 / localhost」→ 后续 dry-run 传 `--board-url http://localhost:3001`。
- 用户给出 URL → 后续原样传 `--board-url`。
- 没有指定 → 不问，交给 submit.mjs 按配置文件 / 环境变量 / 线上→本地探测解析。

> 地址与固定令牌完整契约仅在地址/协议失败时 Read `../reference/api-contract.md`，不要在本阶段无故加载。

### 5. 中断恢复

检查 `SYNC_DIR`：

- 有 `submission.json` → 不重新提取，直接 Read 03-submit 的「状态查询」并执行 `status`；根据结果决定后续。
- 有 `dry-run.json` 无 submission → 比对代码是否在 dry-run 后变化：运行 `git status --porcelain` 和比较 payload/source.commit；不确定则重新从阶段 2 提取（安全优先）。
- 其他情况按 SKILL.md 中断恢复表进入对应阶段。

## 阶段完成回显

一句话回显：`端 / tracking 目录 / SYNC_DIR / 看板地址意图（自动解析或显式地址） / 恢复点`。然后 Read `02-extract.md`（如果不是状态查询路径）。
