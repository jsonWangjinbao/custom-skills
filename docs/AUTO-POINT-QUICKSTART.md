# 行为埋点最简接入文档（auto-point）

> 适用：XLB PC（umi/web）与 RN（App）业务页面的行为埋点接入。
> 推荐方式：直接用 `auto-point` skill 完成接入——你提供埋点范围，skill 按「收集材料 → 梳理代码 → 埋点清单 → 埋点方案 → 实施 → 验证」流程推进，清单、方案两道门禁经你确认后才动手。

## 0. 一分钟了解

- **统一门面 `bizTracker`**：页面只接触 4 个方法——`pageEnter()` / `pageLeave()` / `track()`（普通事件）/ `trackAction()`（操作 + API 包装）。
- **统一上报通道**：
  - PC：业务事件 → `XlbTrackerAdapter` → `@xlb/xlb-tracker` → **SLS（公司统一 BI）主通道**，同时 fan-out ARMS RUM 兜底（双发不裁剪）。
  - RN：业务事件 → 青鸟 RN SDK（`@xlb/react-native-qingniao-lib`）→ SLS；宿主未集成 SDK 时静默降级 no-op，绝不影响业务。
- **事件三要素**：事件字典（`events/<page>.ts`，含 `code/name/type/step`）+ 链条定义（`chains`，`chainId/orderType` 跨端一致）+ 注册函数（`register<X>Tracking()`）。
- **红线**：禁止绕过 `bizTracker` 直调通道 SDK；禁止自造 reporter 通道；`trackAction` 原样透传返回值与异常，埋点不得改变业务行为。

## 1. 用 skill 接入（最简路径）

对 AI 说一句即可触发，例如：

```
帮我把「发货单列表页」的行为埋点做了，端：PC，清单如下：……（贴清单/截图/飞书文档）
```

skill 入口会一次性问 3 件事（此后除门禁外不再打扰）：

| 收集项 | 说明 |
| --- | --- |
| 端 | `PC` 或 `RN` |
| 需求名 | 产物目录名：目标项目 `.ai-point/【需求名】/` |
| 埋点范围 | 提供清单材料，或选「AI 自动识别埋点范围」 |

之后流程：**门禁 1（埋点清单确认）→ 门禁 2（埋点方案确认）→ 实施 → 验证报告**。目标项目无埋点基建时 skill 会全套落位 `src/tracking/` 骨架并接通入口；已有基建则复用或先对齐 SCM 样板。

**你可能需要准备**：应用标识 `appId`（即 SLS topic 登记值，如 `xlb-scm-web`；未登记可先用占位，正式登记后替换）、青鸟 `event_id` 登记情况（有则提供）。

---

## 2. PC 接入

### 2.1 前置条件

- 依赖 `@xlb/xlb-tracker`（skill 会自动检测；A 级基建由 skill 全套落位）。
- 应用入口接线 `initTracking + installApiCapture`（skill 落位时完成）。
- 环境标识 `XLB_DEPLOY_ENV` 四态注入（dev/test/stage/prod，skill 落位时检查 umirc）。

### 2.2 接入示例（skill 实施后的最小代码形态）

**目录结构**（`src/tracking/`，lib 为 SDK 骨架，business 为业务层）：

```
src/tracking/
├── lib/                     # SDK 核心 + XlbTrackerAdapter（SLS 主通道）
└── business/
    ├── chains/deliveryNote.ts   # 链条定义
    ├── events/deliveryNote.ts   # 事件字典
    ├── tracker.ts               # bizTracker 门面
    └── index.ts                 # 统一出口 + registerDeliveryNoteTracking()
```

**事件字典** `business/events/deliveryNote.ts`：

```ts
import type { PageDef, TrackEventDef } from '../types';

export const DN_PAGE: PageDef = {
  pageCode: 'deliveryNote',
  pageName: '发货单',
  pagePath: 'SCM供应链-业务-发货单',
};

/** 字典版本：任何变更必须递增，随事件上报，防止历史数据口径断裂 */
export const DN_EVENT_VER = '1.0.0';

export const DN_EVENTS = {
  PAGE_VIEW: { code: 'view', name: '发货单', type: 'view', step: 'enter' },
  AUDIT: { code: 'audit', name: '发货单-审核', type: 'click', step: 'handle' },
  APPOINT_CONFIRM: {
    code: 'appoint_confirm', name: '发货单-发货预约确认',
    type: 'click', step: 'appoint', terminal: true, // terminal = 链条终点
  },
} as const satisfies Record<string, TrackEventDef>;

export const DN_PAGE_LEAVE: TrackEventDef = {
  code: 'leave', name: '发货单-离开', type: 'view', step: 'leave',
};
```

**链条定义** `business/chains/deliveryNote.ts`：

```ts
import type { ChainDef } from '../types';

export const DN_CHAIN: ChainDef = {
  chainId: 'delivery_note',
  orderType: 'delivery_note',   // 与 RN 端同名单据链完全一致（跨端拼接依赖）
  idleTimeout: 30 * 60 * 1000,  // 静默 30 分钟 trace 判悬置
};
```

**注册函数**（`business/index.ts` 内）：

```ts
export const registerDeliveryNoteTracking = (): void => {
  bizTracker.register({
    page: DN_PAGE,
    chain: DN_CHAIN,
    eventVer: DN_EVENT_VER,
    pageViewDef: DN_EVENTS.PAGE_VIEW,
    pageLeaveDef: DN_PAGE_LEAVE,
  });
};
```

**页面接入**（列表页/详情页入口组件，三行核心代码）：

```tsx
import { bizTracker, DN_EVENTS, registerDeliveryNoteTracking } from '@/tracking/business';

useEffect(() => { // KeepAlive 页面用 useActivate/useUnactivate
  registerDeliveryNoteTracking();
  bizTracker.pageEnter();
  return () => bizTracker.pageLeave();
}, []);
```

**业务调用**：

```tsx
// ① 操作 + API：trackAction 包装（返回值原样透传，异常原样抛出）
const res = await bizTracker.trackAction(DN_EVENTS.AUDIT, {
  order: selectRows.map(toOrderSnapshot), // { fid, order_no, state, ... }
  stateAfter: 'AUDIT',
  action: () => audit(params),
});

// ② 无 API 的普通事件（查询/打开详情/校验拦截等）
bizTracker.track(DN_EXTRA_EVENTS.QUERY);

// ③ 打开另一张单据详情前：任务切换检测
bizTracker.switchOrderIfNeeded(info?.fid);
```

---

## 3. RN 接入

### 3.1 前置条件

RN 接入只修改业务远程包。以下事项归属宿主 App、青鸟平台或 SDK 方，不在远程包代码范围内：skill 负责检测、兜底和登记待办，修复需人工跟进。

| # | 前置项 | 归属 | skill 自动处理 | 需人工跟进 |
| --- | --- | --- | --- | --- |
| 1 | 宿主集成青鸟 RN SDK（`@xlb/react-native-qingniao-lib`，初始化由宿主负责） | 宿主 App | 检测宿主 SDK 版本并回显；未集成时降级为 no-op，事件静默不发，不影响业务 | 宿主集成 SDK 并发版 |
| 2 | 宿主 `initQNSDKWithDefaultConfig` 第三参传 `Config.ENV`，`.env.dev / .env.test / .env.staging / .env.prod` 的 ENV 取值正确 | 宿主 App | 检测第三参来源及四个 `.env.*` 取值；verify 阶段核对诊断结果中的 `env` | 宿主修正配置；远程包不自行判定 env，配置错误时所有事件的 `app.env` 标错 |
| 3 | SLS topic 登记（与 web 端同口径，看板按 `__topic__` 拉取） | 平台 | 埋点方案「人工依赖」列出待登记项 | 平台登记；未登记时看板查不到 RN 事件 |
| 4 | `qingniaoId` 事件登记 | 青鸟平台 | 埋点清单含 `qingniaoId` 列；未登记的事件留空，回退使用 `event_code` | 需要 `qingniaoId` 的事件逐条登记并回填 |
| 5 | SDK 方确认两项：① topic 为宿主全局单例，多业务域远程包接入后会互相覆盖；② Android 端 `setTopic` 在 SDK 初始化完成前调用会访问空配置 | 青鸟 SDK 方 | verify 报告固定登记 ① 为风险项；② 代码侧在读到宿主 app 信息后才调用 `setTopic`，仅降低风险 | 与 SDK 方确定 topic 区分方案；SDK 补判空 |

- 宿主仓库不在工作区时，第 1、2 项标「未检测」，转为人工确认。
- 第 1、2、3、5 项每个宿主 App 只需处理一次；宿主接好后，其他业务域接入通常只需处理第 4 项。

### 3.2 接入示例（与 PC 语义完全对齐）

**事件字典 / 链条**：结构与 PC 一致（同一套 `TrackEventDef`）；**同一业务事件两端 `code`、`chainId/orderType` 必须一致**，`name` 随各端清单口径。

**注册函数**（`src/tracking/index.ts`，RN 差异：通道初始化内聚在 register 里，幂等）：

```ts
const SLS_TOPIC = 'xlb-scm-web'; // 与 web 端同口径，按项目实际 topic 调整

export const registerDeliveryNoteTracking = (): void => {
  installApiCapture(http);       // 接口白名单捕获（axios 实例）
  setReporterTopic(SLS_TOPIC);   // SLS topic，必设
  bizTracker.register({
    page: DN_PAGE,
    chain: DN_CHAIN,
    eventVer: DN_EVENT_VER,
    pageViewDef: DN_EVENTS.PAGE_VIEW,
    pageLeaveDef: DN_PAGE_LEAVE,
  });
};
```

`tracker.ts` 中的 `BIZ_PRODUCT` 填业务域（如 `scm`），与 PC 同值，写入 `biz.biz_product`。上报环境由宿主决定，远程包不写 env；上报方法优先用 `triggerEventBeforeInit`，SDK 初始化前的事件会先缓存，登录后首屏的页面浏览事件不会丢失。

**页面接入**（用 `useFocusEffect` 替代 PC 的 `useEffect`）：

```tsx
import { useFocusEffect } from '@react-navigation/native';
import { bizTracker, DN_EVENTS, registerDeliveryNoteTracking } from 'src/tracking';

useFocusEffect(
  useCallback(() => {
    registerDeliveryNoteTracking();
    bizTracker.pageEnter();
    return () => bizTracker.pageLeave();
  }, []),
);
```

**业务调用**：`track` / `trackAction` / `switchOrderIfNeeded` 用法与 PC 完全一致（见 §2.2）。

```tsx
const res = await bizTracker.trackAction(DN_EVENTS.AUDIT, {
  order: { fid: item.fid, order_no: item.order_no, state: item.state },
  stateAfter: 'AUDIT',
  action: () => audit(params),
});
```

---

## 4. SLS 平台验证

### 4.1 本地验证（dev 环境，先做）

| 端 | 方法 | 通过标准 |
| --- | --- | --- |
| PC | dev 启动项目，操作已埋点路径（进入页面 + 一个点击） | 控制台出现 `[track] 发货单 audit {…properties}` 打印（dev 打印插件），或 Network 面板确认上报请求发出 |
| RN | debug 包执行 `getReporterDiagnostics().then(console.log)`，再操作一条已埋点路径 | `sdkLoaded` 与 `initCalled` 均为 true，`env` 与当前包环境一致；Metro 控制台出现 `[track]` 打印 |

### 4.2 环境区分

dev / test / staging / prod 四个环境的数据**全部写入同一个 logstore**（`tracking-point-project / prod_tracking_point_log`，两端 SDK 均写死），只能通过 `app.env` 区分。检索与统计必须先加 `app.env` 过滤。

| 项 | PC | RN |
| --- | --- | --- |
| 环境来源 | `XLB_DEPLOY_ENV` 构建注入 dev / test / stage / prod | 宿主初始化传入 `Config.ENV`（DEV / TEST / STAGING / PROD） |
| SLS 中 `app.env` 取值 | dev / test / staging / prod（SDK 将 stage 映射为 staging） | dev / test / staging / prod（原生层转为小写） |
| 本地调试 | dev | 默认 `.env` 为 TEST，本地事件标为 test；需标 dev 时切换到 `.env.dev` |

### 4.3 SLS 平台核对

```sql
-- PC 某页面的全部行为事件（测试环境）
__topic__: xlb-scm-web and app.env: test and biz.page_code: deliveryNote

-- RN 某页面的全部行为事件（topic 为宿主全局单例，RN 按业务域 + 端过滤）
app.env: test and biz.biz_product: scm and biz.client_platform: rn and biz.page_code: deliveryNote

-- 本地调试自查：按自己的用户 ID 拉取刚刚上报的事件
app.env: test and biz.biz_product: scm and biz.user_id: 12345
```

> topic 在青鸟 SDK 内是宿主全局单例，多业务域接入后会互相覆盖；最终方案待与青鸟 SDK 方确认，在此之前 RN 数据按 `biz.biz_product` + `biz.client_platform: rn` 过滤。若检索无结果，先确认 logstore 已为该字段建立索引。

1. **按环境 + 业务域过滤**：先加 `app.env`；PC 可再按 `__topic__`（= 应用标识 `appId`，如 `xlb-scm-web`），RN 按 `biz.biz_product` + `biz.client_platform: rn`。
2. **区分环境**：`app.env` 取值为 `dev/test/staging/prod`（见 4.2），验证时选对应环境。
3. **关键字段核对**：

| 字段 | 含义 | 核对点 |
| --- | --- | --- |
| `event_code` / `event_name` | 事件标识/名称 | 与埋点清单逐条对应 |
| `page_code` / `page_name` | 页面标识 | 与事件字典一致 |
| `trace_id` / `chain_id` / `chain_step` | 任务链路 | 同一次操作链路 `trace_id` 相同，`chain_step` 按 enter→handle→…递进 |
| `action_result` / `fail_reason` | 操作结果 | 成功 `success`；拦截 `validate_fail`；失败 `fail` |
| `order_fid` / `order_no` / `order_state_after` | 单据快照 | 与实际操作单据一致 |
| `event_ver` | 字典版本 | 与当前 `XXX_EVENT_VER` 一致 |

4. **链条汇总事件**：页面离开/任务完成时上报 `chain_summary`（`sendCritical` 立即上报），分析侧主要消费对象，验证时确认其落库。

### 4.4 验证纪律

- 通道未就绪（依赖未装 / 宿主未集成 / topic 未登记）时，结论必须显式标注「**上报未验证**」及原因与待办人，不得静默宣称完成。
- skill 会在 `.ai-point/【需求名】/verify-report.md` 产出：改动文件清单、事件覆盖表（清单条目 ↔ 事件 code ↔ 落点文件）、验证结论、人工依赖待办。

---

## 5. 红线速查

1. 业务事件一律走 `bizTracker`，禁止直调 `@xlb/xlb-tracker` / 青鸟 SDK / 自造通道。
2. 修改事件字典任意条目（含新增）必须递增 `XXX_EVENT_VER` 并注释变更。
3. 埋点不侵入业务：`trackAction` 原样透传返回值、原样抛出异常；不为埋点改业务逻辑。
4. 跨端同一单据链：`chainId / orderType / 事件 code` 两端必须一致。
5. 确认弹窗类操作：埋点放在「用户确认后、API 调用前」的 `trackAction` 处，不放在弹窗打开时。

## 参考

- 飞书《行为埋点接入文档》：https://gaor4awyz1u.feishu.cn/wiki/RqNkwkl1wi1GuNkfUH8cnZtjnbt
- skill 详细口径：`auto-point/reference/event-spec.md`（事件/字段规范）、`pc-bootstrap.md`（PC 全套骨架）、`rn-bootstrap.md`（RN 全套骨架）
