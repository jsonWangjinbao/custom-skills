# Phase 5 - 实施埋点

## 进入条件

- `point-plan.md` 已通过门禁 2

## 任务

严格按 point-plan.md 实施，顺序：

0. **基建封装（仅 A 级）**：PC → 按方案「基建封装」节与 pc-bootstrap.md 逐节落位 SDK 骨架 + business 层并完成全部适配点改写（A 用户源/B 微前端/C http 客户端/D 应用标识/E ARMS key），接通应用入口（initTracking + installApiCapture）与 umirc 四态注入；RN → 按 rn-bootstrap.md 文件树全量落位 `src/tracking` 并完成适配点 A/B/D/E/F。**跳过此步的埋点只是无法上报的空壳，不可省略**。B/C 级基建已在 03b 预改造批完成，本阶段只核对一致性；D 级跳过
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
- 代码风格（缩进、引号、import 写法、注释密度）对齐目标项目；**目录结构、文件名、导出名、上报通道一律以对应端 bootstrap 为准**，不得向项目内其他埋点的结构或调用方式对齐
- 其他埋点（铁律 6）的文件与调用点不得改动；同一操作点已有其他埋点调用时，新增 bizTracker 调用与其并存
- 完成一批改动后向用户汇报进度（已改文件 + 已落地事件数）

## 出口

- 全部落地且类型检查通过 → 进入 [06-verify.md](06-verify.md)
