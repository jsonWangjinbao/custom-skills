# Phase 4 - 埋点方案（门禁 2）

## 进入条件

- `point-list.md` 已通过门禁 1

## 任务

1. 按 [../templates/point-plan.md.tpl](../templates/point-plan.md.tpl) 生成 `.ai-point/【需求名】/point-plan.md`：
   - **基建封装（按 survey 形态判定分支）**：A 级按对应端 bootstrap 列落位文件清单 + 适配点决策表（PC：用户源/http 客户端/ARMS key/应用标识；RN：用户源/navigationRef/http 实例/SLS_TOPIC/BIZ_PRODUCT）+ 入口接线位置 + 人工依赖清单；B/C 级引用 retrofit.md（门禁 1.5 已过，本方案只列 events/chains/页面接入）；D 级写「复用既有基建」
   - **事件字典改动**：新增/修改的文件清单 + 每个事件定义完整代码块 + event_ver 版本决策（新字典从 `1.0.0` 起；改既有字典必须递增并写变更注释）
   - **链条定义**：新增 chain（chainId/orderType/idleTimeout）或「复用既有 XX_CHAIN」说明；跨页面/跨端共用同一单据池时 chainId 必须与既有保持一致
   - **注册函数与出口**：`register<X>Tracking()` 定义位置与代码块 + 统一出口导出改动
   - **页面接入**：register / pageEnter / pageLeave 的挂载文件与生命周期位置（按端 patterns 的接入模式）
   - **逐事件实施明细**：每个事件的埋点方式（track / trackAction，判定规则见 event-spec.md）、落点（文件:函数）、order 快照取数来源、stateAfter、validate_fail 分支、extra 字段
   - **API 白名单**：目标项目有接口捕获白名单机制时，列出需加入的 url
2. 明确不做的事：不改业务逻辑、不重构、不动清单外代码；survey 盘点到其他埋点时加一条「其他埋点 X 原样保留，不迁移、不桥接、不复用」（逐条写入方案「明确不做」节）

## 门禁 2（必须执行）

用 AskUserQuestion 请用户审阅：

「埋点方案已生成：`.ai-point/【需求名】/point-plan.md`，涉及 X 个文件改动、Y 个事件埋点。请确认：」

- 选项：确认按方案实施 / 需要调整（说明调整点）

## 出口

- 用户确认 → 进入 [05-implement.md](05-implement.md)
- 用户要求调整 → 修改方案后重新走门禁 2
