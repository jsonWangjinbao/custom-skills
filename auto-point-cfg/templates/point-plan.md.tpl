# 【需求名】埋点方案

> 基于 point-list.md（门禁 1 已通过）｜ 端：PC/RN
> 状态：待用户确认（门禁 2）

## 零、基建封装（目标项目无埋点基建时必填；有则写「复用既有基建」）

| 落位文件 | 来源 | 适配点决策 |
| --- | --- | --- |
| src/tracking/types.ts | bootstrap 原样落位 | 无 |
| src/tracking/context.ts | bootstrap 原样落位 | 无 |
| src/tracking/reporter.ts | bootstrap | 通道选择 / env 判定：（填写） |
| src/tracking/apiCapture.ts | bootstrap | http 实例：（填写目标项目请求库） |
| src/tracking/tracker.ts | bootstrap | 用户信息源：（填写） |
| src/tracking/index.ts | bootstrap 骨架 | 出口 + register |
| 应用入口（文件:位置） | bootstrap 接线 | initReporter(appId) + installApiCapture |

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
- （其他边界声明）

## 九、验证计划

- 类型检查 / lint 命令：（目标项目实际命令）
- grep 覆盖核对：每个事件 code ↔ 调用点
- dev 环境手动验证路径：（列出操作路径，如「打开发货单列表 → 勾选 2 条 → 点击审核」）
