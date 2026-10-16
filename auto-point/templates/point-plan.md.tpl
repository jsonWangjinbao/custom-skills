# 【需求名】埋点方案

> 基于 point-list.md（门禁 1 已通过）｜ 端：PC/RN
> 状态：待用户确认（门禁 2）

## 零、基建封装（按 survey.md 形态判定分支填写）

**A 级（无基建，全套落位）——PC**：

| 落位文件 | 来源（pc-bootstrap §） | 适配点决策 |
| --- | --- | --- |
| src/tracking/types.ts / global.d.ts / index.ts | §1-§3 原样落位 | 无 |
| src/tracking/lib/（tracking/queue/arms/factory/xlbTrackerAdapter） | §4-§8 原样落位 | 适配点 D：appId/appName/biz_product =（填入口收集值） |
| src/tracking/plugins/ + utils/ | §9-§11 原样落位 | 无 |
| src/tracking/business/（types/context/tracker/apiCapture/reportPlugin/index） | §12-§17 原样落位 | 适配点 A 用户源：（填）；B 微前端：（填）；C http 客户端：（填） |
| src/utils/trackingTools.ts | §18 | 适配点 E：ARMS key 变量名/endpoint：（填） |
| 各 .umirc.*.ts | §19 | XLB_DEPLOY_ENV 四态注入（逐配置列出） |
| package.json | §前置检测 1 | npm i @xlb/xlb-tracker @xlb/utils @arms/rum-browser |

**A 级（无标准结构，全套落位）——RN**（文件树以 rn-bootstrap 为准，不得删减或改名）：

| 落位文件 | 来源（rn-bootstrap §） | 适配点决策 |
| --- | --- | --- |
| src/tracking/types.ts | pc-bootstrap types.ts 原样落位 | 无 |
| src/tracking/context.ts | context.ts 原样落位 | 无 |
| src/tracking/reporter.ts | reporter.ts | 无 |
| src/tracking/apiCapture.ts | apiCapture.ts | 无 |
| src/tracking/tracker.ts | tracker.ts | 适配点 A 用户源：（填）；B navigationRef：（填）；F BIZ_PRODUCT：（填） |
| src/tracking/index.ts | index.ts | 适配点 D http 实例：（填）；E SLS_TOPIC：（填） |
| src/tracking/chains.ts / events/ | 按本方案二、三节 | 无 |

**其他埋点**（survey 盘点结果，无则写「无」）：原样保留，不迁移、不桥接、不复用。

**B/C 级（预改造已完成）**：预改造项见 retrofit.md（门禁 1.5 已通过），本方案不再涉及基建结构，仅列 events/chains/页面接入。

**D 级（样板一致）**：复用既有基建，本节写「复用既有基建」即可。

### 人工依赖（流程外事项，需用户跟进）

- [ ] 平台侧应用登记（app.id / SLS topic）：
- [ ] 青鸟事件登记（需 qingniaoId 的事件）：
- [ ] （RN）宿主 App 集成青鸟 SDK：

## 一、改动文件总览

| 文件 | 改动类型 | 说明 |
| --- | --- | --- |
| src/tracking/.../events/xxx.ts | 新增 | 事件字典（N 个清单事件 + M 个补充事件） |
| src/tracking/.../chains/xxx.ts | 新增 | 链条定义 |
| src/tracking/.../index.ts | 修改 | 注册函数 + 导出 |
| src/pages/xxx/index.tsx | 修改 | 页面接入 + X 个事件埋点 |

## 二、事件字典

（每个 events 文件一个完整代码块：XXX_PAGE / XXX_EVENT_VER / XXX_EVENTS / XXX_PAGE_LEAVE / XXX_EXTRA_EVENTS）

```ts
// src/tracking/.../events/xxx.ts
```

## 三、链条定义

（新增 chain 完整代码块，或「复用既有 XX_CHAIN」说明；跨端/跨页面共用时注明 chainId 与既有保持一致的理由）

```ts
```

## 四、注册函数与出口

（register<X>Tracking() 完整代码块 + 统一出口的导出改动）

```ts
```

## 五、页面接入

（register / pageEnter / pageLeave 挂载位置：文件 + 生命周期 + 代码块）

```tsx
```

## 六、逐事件实施明细

| # | 事件 code | 方式 | 落点（文件:函数） | order 取数 | stateAfter | validate_fail 分支 | extra | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | check_click | trackAction | pages/xxx/index.tsx:handleAudit | selectRow.map(toOrderSnapshot) | 'AUDIT' | state_not_init | - | |
| 2 | query | track | pages/xxx/index.tsx:onSearch | - | - | - | - | 补充事件 |

## 七、API 白名单

| url | 对应事件 | 说明 |
| --- | --- | --- |
| | | |

## 八、明确不做

- 不改业务逻辑、不重构、不动清单外代码
- 不动其他埋点（有则逐条列出）
- （其他边界声明）

## 九、验证计划

- 类型检查 / lint 命令：（目标项目实际命令）
- grep 覆盖核对：每个事件 code ↔ 调用点
- 本地联调手动验证路径：（列出操作路径，如「打开发货单列表 → 勾选 2 条 → 点击审核」）
