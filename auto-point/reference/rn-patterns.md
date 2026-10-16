# RN 端埋点模式

> 与 PC 端语义完全对齐（同一套字段规范，见 [event-spec.md](event-spec.md)），仅基建与生命周期不同。全部示例已内联，不依赖任何外部仓库。目录结构以 [rn-bootstrap.md](rn-bootstrap.md) 为唯一标准；项目中其他埋点不算基建，不得以其结构为准（SKILL 铁律 6）。

## 目录结构（基建形态）

```
src/tracking/
├── types.ts             # 与 web 端同一套类型
├── context.ts           # session/trace 上下文
├── chains.ts            # 全部 chain 定义（chainId/orderType 与 web 端完全一致）
├── events/<page>.ts     # 事件字典，每页面一文件（与 web 同口径）
├── tracker.ts           # bizTracker 门面（RN 版，含 BIZ_PRODUCT 与 dev 打印）
├── reporter.ts          # 青鸟 RN SDK 通道（reportEvent / setReporterTopic / getReporterDiagnostics）
├── apiCapture.ts        # installApiCapture(http) / claimApiCapture
└── index.ts             # 统一出口 + register<X>Tracking()（内含 installApiCapture(http) + setReporterTopic）
```

> 文件名与导出名以 [rn-bootstrap.md](rn-bootstrap.md) 为准。仅当既有 `src/tracking` 已判为 RN B/C/D 级（文件树与标准结构对应，只是上报通道另有命名，如 SCM RN 的 `qingniao.ts` / `setQingniaoTopic`）时，才沿用既有命名，不为改名而改名；口径仍须对齐 rn-bootstrap（triggerEventBeforeInit、BIZ_PRODUCT、setTopic 初始化守卫），不符合的按 C 级走预改造。A 级一律按 rn-bootstrap 命名落位。

## 事件字典（events/<page>.ts）

结构与 PC 完全一致（同一套 TrackEventDef），差异只有两点：**清单口径按 APP 端清单**（事件集合通常比 PC 少，如无批量类/打印导出）、**pageCode/pagePath 与 PC 同页面保持一致**。示例：

```ts
/**
 * 发货单埋点事件字典 —— RN 端
 * 对照清单 APP 端：1 浏览 + 14 点击 = 15 事件
 * （与 PC 清单差异：无批量类/生成类/打印导出；「发货预约编辑确认」APP 口径为「发货预约确认」）
 */
import type {PageDef, TrackEventDef} from '../types';

export const DN_PAGE: PageDef = {
  pageCode: 'deliveryNote',
  pageName: '发货单',
  pagePath: 'SCM供应链-业务-发货单',
};

/** 字典版本：任何变更必须递增，随事件上报，防止历史数据口径断裂
 *  1.0.0：RN 端首版，按 APP 端 15 事件清单 */
export const DN_EVENT_VER = '1.0.0';

export const DN_EVENTS = {
  // ── 浏览（1 个）
  PAGE_VIEW: {
    code: 'view',
    name: '发货单',
    type: 'view',
    step: 'enter',
  },

  // ── 处理环节
  AUDIT: {
    code: 'audit',
    name: '发货单-审核',
    type: 'click',
    step: 'handle',
    qingniaoId: 'xlb_scm_check_click', // 与 PC 同一事件共用青鸟标识
  },
  UN_AUDIT: {
    code: 'un_audit',
    name: '发货单-反审核',
    type: 'click',
    step: 'handle',
    regressive: true,
  },

  // ── 预约环节
  APPOINT_CONFIRM: {
    code: 'appoint_confirm',
    name: '发货单-发货预约确认', // APP 清单口径；code 与 PC 一致，name 随本端清单
    type: 'click',
    step: 'appoint',
    terminal: true,
  },
  // ...其余事件同结构
} as const satisfies Record<string, TrackEventDef>;

/** 页面离开（系统事件，不在业务清单内） */
export const DN_PAGE_LEAVE: TrackEventDef = {
  code: 'leave',
  name: '发货单-离开',
  type: 'view',
  step: 'leave',
};

/** 清单外补充事件（链条分析必需的过渡节点，不占清单事件数） */
export const DN_EXTRA_EVENTS = {
  QUERY: {
    code: 'query',
    name: '发货单-查询',
    type: 'click',
    step: 'browse',
  },
  DETAIL_VIEW: {
    code: 'detail_view',
    name: '发货单-打开详情',
    type: 'view',
    step: 'browse',
  },
  /** 单据流转关系：标记「本单由上游单据生成」（PO→发货单 跨单据串联） */
  DOC_RELATION: {
    code: 'doc_relation',
    name: '单据流转关系',
    type: 'chain',
    step: 'browse',
  },
} as const satisfies Record<string, TrackEventDef>;

export type DnEventKey = keyof typeof DN_EVENTS;
```

> **跨端对齐规则**：同一业务事件两端 `code` 必须一致（机器聚合维度）；`name` 随各端清单口径（可不同）；`qingniaoId` 同一事件两端共用同一登记标识。

## 链条定义（chains.ts）

```ts
/**
 * 任务链条定义
 * chainId/orderType 与 web 端完全一致（链 B 主键 order_type+order_fid 跨端对齐，
 * 采购订单与发货单的跨单据流转边才能在分析侧拼起来）
 */
import type {ChainDef} from './types';

export const DN_CHAIN_ID = 'delivery_note';

export const DN_CHAIN: ChainDef = {
  chainId: DN_CHAIN_ID,
  orderType: DN_CHAIN_ID,
  /** 静默 30 分钟无事件，trace 判悬置 */
  idleTimeout: 30 * 60 * 1000,
};
```

> 全部 chain 集中在一个 chains.ts；**chainId / orderType 必须与 web 端同名单据链完全一致**。

## 注册函数与统一出口（index.ts）

```ts
// 出口：页面侧只需要 import {bizTracker, DN_EVENTS, registerDeliveryNoteTracking} from 'src/tracking'
export {installApiCapture} from './apiCapture';
export {DN_CHAIN, DN_CHAIN_ID} from './chains';
export {
  DN_EVENT_VER,
  DN_EVENTS,
  DN_EXTRA_EVENTS,
  DN_PAGE,
  DN_PAGE_LEAVE,
} from './events/deliveryNote';
export type {DnEventKey} from './events/deliveryNote';
export {bizTracker} from './tracker';
export * from './types';

import {installApiCapture} from './apiCapture';
import {DN_CHAIN} from './chains';
import {
  DN_EVENT_VER,
  DN_EVENTS,
  DN_PAGE,
  DN_PAGE_LEAVE,
} from './events/deliveryNote';
import {setReporterTopic} from './reporter';
import {bizTracker} from './tracker';
import http from 'src/utils/request'; // 目标项目 axios 实例

/** SLS topic：与 web 端同口径（看板按 topic 拉取；不设置看板查不到 RN 事件） */
const SLS_TOPIC = 'xlb-scm-web';

/** 发货单页面埋点注册（useFocusEffect 聚焦时调用一次） */
export const registerDeliveryNoteTracking = (): void => {
  installApiCapture(http); // 必须传 http 实例，不传则接口捕获不生效
  setReporterTopic(SLS_TOPIC);
  bizTracker.register({
    page: DN_PAGE,
    chain: DN_CHAIN,
    eventVer: DN_EVENT_VER,
    pageViewDef: DN_EVENTS.PAGE_VIEW,
    pageLeaveDef: DN_PAGE_LEAVE,
  });
};
```

> 与 PC 差异：RN 注册函数内封装 `installApiCapture(http) + setReporterTopic()`，页面无需关心；topic 与 web 端同口径（按目标项目实际 topic 调整）。`setReporterTopic` 内置初始化守卫与只生效一次的逻辑，重复调用安全。
>
> ⚠ topic 在 SDK 内是宿主全局单例，多业务域远程包接入时会互相覆盖；最终方案待与青鸟 SDK 方确认，确认前在方案与 verify-report 中登记该风险。业务域分析优先用 `biz.biz_product`。

## 页面接入模式（useFocusEffect）

```tsx
import {useCallback} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {bizTracker, DN_EVENTS, DN_EXTRA_EVENTS, registerDeliveryNoteTracking} from 'src/tracking';

// 埋点：注册 + 进入/离开（useFocusEffect 幂等，聚焦即上报页面浏览）
useFocusEffect(
  useCallback(() => {
    registerDeliveryNoteTracking();
    bizTracker.pageEnter();
    return () => bizTracker.pageLeave();
  }, []),
);
```

## 调用实战

track / trackAction / validate_fail / switchOrderIfNeeded 用法与 PC 完全一致（见 [pc-patterns.md](pc-patterns.md)「调用实战」与 [event-spec.md](event-spec.md)），仅 import 来源为 `src/tracking`。RN 真实片段：

```tsx
// 列表搜索/筛选：查询过渡事件
<XlbSearchBar
  onSearch={v => {
    bizTracker.track(DN_EXTRA_EVENTS.QUERY);
    setParams({...params, fid: v});
  }}
/>

// 发货预约入口点击（意图事件，无 API）：先 track 再走业务
const onConfirm = () => {
  bizTracker.track(DN_EVENTS.APPOINT_START, {
    order: selectedFids.map((o: any) => ({
      fid: o?.fid,
      state: o?.state,
      appoint_state: o?.appoint_state,
      supplier_id: o?.supplier_id,
    })),
  });
  // ...原有跳转/弹窗逻辑
};
```

## 与 PC 端差异速查（实现层，页面调用无感知）

| 维度 | PC | RN |
| --- | --- | --- |
| 生命周期 | useEffect / useActivate（KeepAlive） | useFocusEffect |
| route_url / referrer | location / document.referrer | navigationRef 当前/上一路由名 |
| 环境判定 | XLB_DEPLOY_ENV 构建注入（dev/test/stage/prod 四态） | 宿主 init 第三参 `Config.ENV`（DEV/TEST/STAGING/PROD），远程包不判定；`__DEV__` 只控制本地打印 |
| SLS `app.env` | dev/test/staging/prod | dev/test/staging/prod（两端一致） |
| 关闭兜底 | beforeunload | AppState 进后台 |
| 环境标识 | is_wujie | client_platform: 'rn' |
| 上报通道 | SDK 适配层 | 青鸟 RN SDK triggerEventBeforeInit（旧版回退 triggerEvent；宿主 App 初始化） |
| 本地验证 | 控制台 `[track]` 打印 | Metro 控制台 `[track]` 打印 + `getReporterDiagnostics()` |

## 注意

- 页面侧 import 走 `src/tracking` 统一出口
- 跨端同一单据链：chainId / orderType / 事件 code 必须与 web 端完全一致（链 B 跨端拼接依赖）
- RN 端字典事件集合按 APP 端清单，不要照抄 PC 清单（通常无批量类/打印导出）
