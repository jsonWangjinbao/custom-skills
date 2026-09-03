# Phase 5 - 实施埋点

## 进入条件

- `point-plan.md` 已通过门禁 2

## 任务

严格按 point-plan.md 实施，顺序：

0. **基建封装（仅无基建项目）**：按方案「基建封装」节落位 types / context / reporter / apiCapture / tracker / index 并完成全部适配点改写，接通应用入口初始化（initReporter + installApiCapture）。**跳过此步的埋点只是无法上报的空壳，不可省略**
1. **事件字典**：新建/修改 events 文件（含 `XXX_EVENT_VER`、`XXX_PAGE_LEAVE`、`XXX_EXTRA_EVENTS`）
2. **链条定义**：新建/修改 chain 定义
3. **注册函数与出口**：`register<X>Tracking()` + 统一出口导出
4. **页面接入**：register + pageEnter / pageLeave 挂载（幂等，按端 patterns）
5. **逐事件埋点**：按方案「逐事件实施明细」逐条落地
6. **API 白名单**：如需，补充白名单 url

每完成一个文件，运行目标项目的类型检查（`tsc --noEmit` 或既有 lint 命令）确认无错，再改下一个文件。

## 实施纪律

- 只做方案内改动；发现方案遗漏 → **停止**，回门禁 2 补充确认后再继续
- trackAction 包装不得吞异常、不得改返回值；埋点调用不得出现在业务判定条件中
- 代码风格、import 习惯、注释密度对齐目标项目既有埋点代码
- 完成一批改动后向用户汇报进度（已改文件 + 已落地事件数）

## 出口

- 全部落地且类型检查通过 → 进入 [06-verify.md](06-verify.md)
