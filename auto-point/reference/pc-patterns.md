# PC 端埋点模式

> 全部示例已内联，不依赖任何外部仓库。目标项目已有埋点基建且与 SCM 样板一致（D 级）时，以既有模式为准，本文件作口径参照；A/B/C 级的基建落位与预改造见 pc-bootstrap.md 与 subskills/03b-retrofit.md。

## 目录结构（基建形态）

```
src/tracking/                      # SCM 样板根目录（已有则复用，禁另起目录）
├── lib/
│   ├── tracking.ts / queue.ts / factory.ts / arms.ts   # SDK 核心（pc-bootstrap.md §4-§7）
│   └── xlbTrackerAdapter.ts     # 官方 @xlb/xlb-tracker 适配器，SLS 主通道（§8）
├── plugins/ utils/ types.ts global.d.ts index.ts       # SDK 骨架（§9-§11）
├── business/
│   ├── chains/<chain>.ts        # 链条定义（ChainDef），每单据链一文件
│   ├── events/<page>.ts         # 事件字典，每页面一文件
│   ├── tracker.ts               # bizTracker 门面（页面唯一入口）
│   ├── apiCapture.ts            # 接口白名单捕获（XlbFetch 版，§15）
│   ├── reportPlugin.ts          # dev 打印插件（§16）
│   └── index.ts                 # 统一出口 + register<X>Tracking()
src/utils/trackingTools.ts         # 入口接线：initTracking + installApiCapture（§18）
```

**通道口径（拍板固化）**：事件流 `bizTracker → getGlobalTracking().track()` → 双适配器 fan-out——ARMSAdapter（ARMS RUM 自定义事件兜底）+ XlbTrackerAdapter（`@xlb/xlb-tracker` → SLS 公司统一 BI 主通道，chain_summary 走 sendCritical）。业务埋点禁止绕过 bizTracker 直调任一通道 SDK，禁止自造 reporter/initTracker 通道。

## 事件字典（events/<page>.ts）

完整写法见 [event-spec.md](event-spec.md)「事件字典文件结构」。此处补充一个真实小页面全量示例（7 个清单事件 + 三件套）：

```ts
/**
 * 采购订单（备货视图）埋点事件字典
 * 页面：pages/stocking；与寄售订单页操作同一 PO 单据池，共用 PO_CHAIN
 */
import type { PageDef, TrackEventDef } from '../types';

export const STOCKING_PAGE: PageDef = {
  pageCode: 'stocking',
  pageName: '采购订单',
  pagePath: 'SCM供应链-业务-采购订单',
};

/** 字典版本：任何变更必须递增，随事件上报，防止历史数据口径断裂
 *  1.0.0：首版，按清单 7 事件 */
export const STOCKING_EVENT_VER = '1.0.0';

export const STOCKING_EVENTS = {
  // ── 浏览（1 个）
  PAGE_VIEW: {
    code: 'view',
    name: '采购订单',
    type: 'view',
    step: 'enter',
  },

  // ── 处理环节（4 个）
  /** 生成发货单：链 B 关键下游转化动作 */
  GEN_DELIVERY: {
    code: 'gen_delivery',
    name: '采购订单-生成发货单',
    type: 'click',
    step: 'handle',
  },
  CLOSE: {
    code: 'close',
    name: '采购订单-关单',
    type: 'click',
    step: 'handle',
    terminal: true,
  },
  /** 重新打开：回退信号；目标状态由后端决定，不臆测 stateAfter */
  REOPEN: {
    code: 'reopen',
    name: '采购订单-重新打开',
    type: 'click',
    step: 'handle',
    regressive: true,
  },

  // ── 异常/中断（1 个）
  INVALID: {
    code: 'invalid',
    name: '采购订单-作废',
    type: 'click',
    step: 'abort',
    terminal: true,
  },

  // ── 浏览环节动作（2 个）
  PRINT: {
    code: 'print',
    name: '采购订单-单据打印',
    type: 'click',
    step: 'browse',
  },
  EXPORT: {
    code: 'export',
    name: '采购订单-导出',
    type: 'click',
    step: 'browse',
  },
} as const satisfies Record<string, TrackEventDef>;

/** 页面离开（系统事件，不在业务清单内） */
export const STOCKING_PAGE_LEAVE: TrackEventDef = {
  code: 'leave',
  name: '采购订单-离开',
  type: 'view',
  step: 'leave',
};

/** 清单外补充事件（链条分析必需的过渡节点） */
export const STOCKING_EXTRA_EVENTS = {
  QUERY: {
    code: 'query',
    name: '采购订单-查询',
    type: 'click',
    step: 'browse',
  },
  DETAIL_VIEW: {
    code: 'detail_view',
    name: '采购订单-打开详情',
    type: 'view',
    step: 'browse',
  },
} as const satisfies Record<string, TrackEventDef>;

export type StockingEventKey = keyof typeof STOCKING_EVENTS;
```

## 链条定义（chains/<chain>.ts）

```ts
import type { ChainDef } from '../types';

export const DN_CHAIN_ID = 'delivery_note';

export const DN_CHAIN: ChainDef = {
  chainId: DN_CHAIN_ID,
  orderType: DN_CHAIN_ID,
  /** 静默 30 分钟无事件，trace 判悬置 */
  idleTimeout: 30 * 60 * 1000,
};
```

> 同一单据池跨页面共用一个 chain（如两个页面都操作 PO 单 → 共用 `PO_CHAIN`），生命周期才能跨页面拼接。

## 注册函数与统一出口（business/index.ts）

```ts
// 出口：页面侧只需要 import { bizTracker, DN_EVENTS, registerDeliveryNoteTracking } from '@/tracking/business'
export { DN_CHAIN, DN_CHAIN_ID } from './chains/deliveryNote';
export {
  DN_EVENT_VER,
  DN_EVENTS,
  DN_EXTRA_EVENTS,
  DN_PAGE,
  DN_PAGE_LEAVE,
} from './events/deliveryNote';
export type { DnEventKey } from './events/deliveryNote';
export { bizTracker } from './tracker';
export * from './types';

import { DN_CHAIN } from './chains/deliveryNote';
import {
  DN_EVENT_VER,
  DN_EVENTS,
  DN_PAGE,
  DN_PAGE_LEAVE,
} from './events/deliveryNote';
import { bizTracker } from './tracker';

/** 发货单页面埋点注册（useActivate 中调用一次） */
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

## 页面接入模式

列表页/详情页入口组件（KeepAlive 场景用 useActivate/useUnactivate，普通页面用 useEffect）：

```tsx
const trackInRef = useRef(false);
const trackEnter = () => {
  if (trackInRef.current) return;
  trackInRef.current = true;
  registerDeliveryNoteTracking();
  bizTracker.pageEnter();
};
const trackLeave = () => {
  if (!trackInRef.current) return;
  trackInRef.current = false;
  bizTracker.pageLeave();
};
useEffect(() => {
  trackEnter();
  return trackLeave;
}, []);
```

- register / pageEnter 幂等：重复激活安全
- 打开另一张单据详情前先 `bizTracker.switchOrderIfNeeded(fid)`（任务切换检测）

## 接口白名单捕获（apiCapture）

- **默认 XlbFetch 版**：完整实现见 pc-bootstrap.md §15（拦截器 + 环形缓冲 20 条 + 白名单），入口接线时调一次 `installApiCapture()`（§18）；http 客户端非 XlbFetch 时仅替换拦截器挂载点（axios 实例同名 API），缓冲与认领逻辑不变。
- **白名单口径**：只收操作类（写）接口；read/page/find 查询接口不入列。首批入列接口由 04 方案决定。
- **调用侧**：白名单已覆盖→trackAction 免传 apiUrl，按时间窗自动认领；未覆盖→显式传 `apiUrl/apiParams`（精确匹配认领）。

## 调用实战（真实模式提炼）

```tsx
// ① 操作 + API：trackAction 包装（批量传数组，stateAfter 按动作映射）
const res = await bizTracker.trackAction(DN_EVENTS.BATCH_AUDIT, {
  order: fids.map((fid) => ({ fid })),
  stateAfter: 'AUDIT',
  action: () => batchaudit(params),
});
// res 原样返回，业务后续逻辑不变；action 抛错时事件照常上报 result:'fail'，异常原样抛出

// ② 校验拦截（未发 API）：validate_fail 卡点信号；field 用被校验对象语义，reason 复用页面提示文案
bizTracker.track(DN_EVENTS.BATCH_AUDIT, {
  order: selectRows.map(toOrderSnapshot),
  result: 'validate_fail',
  failReason: 'state_not_init',
  validateFailFields: ['order_state'],
  validateFailDetails: [
    { field: 'order_state', reason: '存在非制单的单据，不可审核' },
  ],
});

// ③ 表单校验失败（antd/rc-form catch 到 errorFields）：字段名 + 校验文案全量提取
try {
  await form.validateFields();
} catch (e: any) {
  bizTracker.track(DN_EVENTS.APPOINT_CONFIRM, {
    order: trackOrders(),
    result: 'validate_fail',
    failReason: 'form_validate',
    validateFailFields: e?.errorFields
      ?.map((f: any) => f?.name?.[0])
      .filter(Boolean),
    validateFailDetails: e?.errorFields
      ?.map((f: any) => ({
        field: f?.name?.[0],
        reason: f?.errors?.[0] || '',
      }))
      .filter((d: any) => d.field),
  });
  return;
}

// ④ 查询等过渡节点（EXTRA_EVENTS）
bizTracker.track(DN_EXTRA_EVENTS.QUERY);

// ⑤ 打开详情：先 switchOrderIfNeeded 再 track DETAIL_VIEW
const gotoDetail = (info: any) => {
  bizTracker.switchOrderIfNeeded(info?.fid);
  bizTracker.track(DN_EXTRA_EVENTS.DETAIL_VIEW, {
    order: toOrderSnapshot(info),
  });
  // ...原有跳转逻辑
};

// ⑥ 同一按钮多种动作：按动作映射 eventDef + stateAfter
const stateAfterMap = { batch_reply_pass: 'APPROVE', batch_reply_rej: 'REFUSE' };
const res = await bizTracker.trackAction(eventDef, {
  order: selectRow.map(toOrderSnapshot),
  stateAfter: stateAfterMap[eventDef.code],
  action: () => handlePost(type, params),
});

// ⑦ 预检+确认两段式：预检失败手动补报（trackAction 只包了确认段）
const checkStart = Date.now();
const checkRes = await batchAppointCheck({ fids });
if (checkRes?.code !== 0) {
  const captured = claimApiCapture(checkStart); // 认领拦截器捕获的接口信息
  bizTracker.track(DN_EVENTS.APPOINT_START, {
    order: selectRow.map(toOrderSnapshot),
    result: 'fail',
    failReason: 'api_biz_fail',
    api: { url: captured?.url, code: checkRes?.code, msg: checkRes?.msg, duration: captured?.duration },
  });
  return;
}
```

## 注意

- 页面侧 import 一律走统一出口（如 `@/tracking/business`），不直接引内部文件
- 业务事件统一经 XlbTrackerAdapter 走 `@xlb/xlb-tracker` 上报 SLS；禁止绕过 bizTracker 直调通道 SDK、禁止自造 reporter 通道
- 确认弹窗类操作：埋点放在「用户确认后、API 调用前」的 trackAction 包装处，不放在弹窗打开时
- 操作触发的接口 url 在 apiCapture 白名单内可自动认领；未覆盖时显式传 `apiUrl`
- `toOrderSnapshot` 统一单据取数：`fid / order_no / state / appoint_state / supplier_id / recv_store_id / source_*`
