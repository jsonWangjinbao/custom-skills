# Phase 5 - 实施埋点

## 进入条件

- `point-plan.md` 已通过门禁 2

## 任务

严格按 point-plan.md 实施，顺序：

0. **基建封装（仅无基建项目）**：按方案「基建封装」节落位 types / context / reporter / apiCapture / tracker / index 并完成全部适配点改写，接通应用入口初始化（initReporter + installApiCapture）。**跳过此步的埋点只是无法上报的空壳，不可省略**
1. **事件字典**：新建/修改 events 文件（含 `XXX_EVENT_VER`、`XXX_PAGE_LEAVE`、`XXX_EXTRA_EVENTS`），口径以 config-bundle.json 为唯一事实来源（详见 [../reference/config-sync.md](../reference/config-sync.md)）：
   - 事件条目逐字段原样映射 `code/name/type/step/regressive/terminal/qingniaoId`；`terminalKind`/`remark` 是配置中心字段，**不写入代码**（remark 可转为注释）
   - `XXX_EVENT_VER` 原样取 bundle `eventVer`（不递增、不改写）；`XXX_PAGE_LEAVE` 按 pageName 派生；`XXX_EXTRA_EVENTS` 取 bundle `extraEvents`
2. **链条定义**：新建/修改 chain 定义，`idleTimeout` 取 bundle `common.idleTimeoutMs`
3. **注册函数与出口**：`register<X>Tracking()` + 统一出口导出
4. **页面接入**：register + pageEnter / pageLeave 挂载（幂等，按端 patterns）
5. **逐事件埋点**：按方案「逐事件实施明细」逐条落地
6. **API 白名单**：如需，补充白名单 url

每完成一个文件，运行目标项目的类型检查（`tsc --noEmit` 或既有 lint 命令）确认无错，再改下一个文件。

## 实施纪律

- 只做方案内改动；发现方案遗漏 → **停止**，回门禁 2 补充确认后再继续
- 发现 bundle 与 point-plan.md 不一致（如 eventVer 漂移、事件字段对不上）→ **停止**，以 bundle 为准回门禁 2 修正方案后再继续，不得自行迁就代码现状
- trackAction 包装不得吞异常、不得改返回值；埋点调用不得出现在业务判定条件中
- 代码风格、import 习惯、注释密度对齐目标项目既有埋点代码
- 完成一批改动后向用户汇报进度（已改文件 + 已落地事件数）

## 出口

- 全部落地且类型检查通过 → 进入 [06-verify.md](06-verify.md)
