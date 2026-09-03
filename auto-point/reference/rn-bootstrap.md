# RN 端从零封装（无基建项目 bootstrap）

> 目标项目**没有任何埋点封装**时使用。本文件内联全套可落位代码（提炼自生产验证过的 SCM RN 产线封装），按文件树落位 + 完成「适配点」改写后，事件即可真实上报。
> 目标项目已有封装时**禁止使用本文件**，复用既有封装（见 02-survey 基建检查分岔）。
> 与 PC 端语义完全对齐：同一套 types、同一套 tracker 公共方法签名；`types.ts` 与 [pc-bootstrap.md](pc-bootstrap.md) 中的完全一致，原样落位即可（本文不重复贴出）。

## 前置检测（02-survey 阶段完成）

| 检测项 | 方法 | 影响 |
| --- | --- | --- |
| 青鸟 SDK | 宿主 App 是否集成 `@xlb/react-native-qingniao-lib` | 未集成 → 优雅降级 no-op（代码能跑、事件不发），**人工依赖** |
| 导航容器 | React Navigation 的 navigationRef 位置 | 【适配点 B】route_url/page_referrer 取数 |
| 用户信息源 | 登录用户状态模型（authModel / store / context） | 【适配点 A】 |
| http 客户端 | axios 实例 / 封装请求库 | 【适配点 D】apiCapture 拦截器挂载 |
| 应用标识 | SLS topic（与 web 端同口径，看板按 `__topic__` 拉取） | 【适配点 E】**人工依赖**，不设置看板查不到 RN 事件 |

## 文件树

```
src/tracking/
├── types.ts        # 与 pc-bootstrap.md 的 types.ts 完全一致，原样落位
├── context.ts      # session/trace 上下文（RN 版：session 退化为进程级内存单例）
├── reporter.ts     # 上报通道（青鸟 RN SDK 适配层，懒加载 + 优雅降级）
├── apiCapture.ts   # 接口白名单捕获（自包含：buffer + 白名单 + 拦截器安装）
├── tracker.ts      # bizTracker 门面（RN 版）
├── chains.ts       # 链条定义（按埋点方案新增；chainId/orderType 与 web 端完全一致）
├── events/         # 事件字典（按埋点方案新增）
└── index.ts        # 统一出口 + register 函数（内含通道初始化）
```

---

## src/tracking/context.ts（原样落位）

```ts
/**
 * 埋点链条上下文管理：session_id / trace_id / 事件序号
 * 与 web 端逻辑一致；差异：RN 无 sessionStorage，session 退化为进程级内存单例（App 存活期间唯一）
 */
import type {
  ChainDef,
  ChainStep,
  ChainSummary,
  TraceCloseReason,
  TraceContext,
} from './types';

/** 简易 uuid（不引依赖） */
export const genId = (prefix: string): string => {
  const rand = Math.random().toString(36).slice(2, 8);
  const rand2 = Math.random().toString(36).slice(2, 6);
  return `${prefix}_${Date.now().toString(36)}_${rand}${rand2}`;
};

let memorySessionId: string | null = null;

export const getSessionId = (): string => {
  if (!memorySessionId) {
    memorySessionId = genId('sess');
  }
  return memorySessionId;
};

/** trace 生命周期管理（页面级内存单例），规则与 web 端一致 */
class TraceManager {
  private current: TraceContext | null = null;
  private seq = 0;

  nextSeq(): number {
    this.seq += 1;
    return this.seq;
  }

  get(): TraceContext | null {
    return this.current;
  }

  isIdle(chain: ChainDef): boolean {
    if (!this.current) return false;
    return Date.now() - this.current.lastTime > chain.idleTimeout;
  }

  open(chain: ChainDef): TraceContext {
    const now = Date.now();
    this.current = {
      traceId: genId(`trace_${chain.chainId}`),
      chainId: chain.chainId,
      startTime: now,
      lastTime: now,
      path: [],
      regressiveCount: 0,
      regressiveSteps: [],
      validateFailCount: 0,
      apiFailCount: 0,
      lastStep: '',
      reachedTerminal: false,
      orderFids: [],
    };
    return this.current;
  }

  ensure(chain: ChainDef): {
    trace: TraceContext;
    expiredSummary: ChainSummary | null;
  } {
    if (this.current && this.isIdle(chain)) {
      const expiredSummary = this.close('timeout');
      return {trace: this.open(chain), expiredSummary};
    }
    if (!this.current) {
      return {trace: this.open(chain), expiredSummary: null};
    }
    return {trace: this.current, expiredSummary: null};
  }

  touch(
    chain: ChainDef,
    step: ChainStep,
    opts: {
      regressive?: boolean;
      terminal?: boolean;
      orderFids?: (string | number)[];
    },
  ): void {
    const t = this.ensure(chain).trace;
    t.lastTime = Date.now();
    t.path.push(step);
    t.lastStep = step;
    if (opts.regressive) {
      t.regressiveCount += 1;
      if (!t.regressiveSteps.includes(step)) t.regressiveSteps.push(step);
    }
    if (opts.terminal) t.reachedTerminal = true;
    for (const fid of opts.orderFids || []) {
      if (
        fid !== undefined &&
        fid !== null &&
        fid !== '' &&
        !t.orderFids.includes(fid)
      ) {
        t.orderFids.push(fid);
      }
    }
  }

  markValidateFail(): void {
    if (this.current) this.current.validateFailCount += 1;
  }

  markApiFail(): void {
    if (this.current) this.current.apiFailCount += 1;
  }

  close(reason: TraceCloseReason): ChainSummary | null {
    if (!this.current) return null;
    const t = this.current;
    this.current = null;
    const outcome: ChainSummary['outcome'] =
      reason === 'timeout'
        ? 'timeout'
        : reason === 'unload'
          ? 'unload'
          : t.reachedTerminal || reason === 'done'
            ? 'done'
            : 'abort';
    return {
      trace_id: t.traceId,
      chain_id: t.chainId,
      start_time: t.startTime,
      end_time: Date.now(),
      duration_ms: Date.now() - t.startTime,
      step_count: t.path.length,
      path: [...t.path],
      regressive_count: t.regressiveCount,
      regressive_steps: [...t.regressiveSteps],
      validate_fail_count: t.validateFailCount,
      api_fail_count: t.apiFailCount,
      last_step: t.lastStep,
      outcome,
      order_fids: [...t.orderFids],
    };
  }

  switchOrderIfNeeded(
    chain: ChainDef,
    fid?: string | number,
  ): ChainSummary | null {
    if (fid === undefined || fid === null || fid === '') return null;
    const t = this.ensure(chain).trace;
    if (t.orderFids.length > 0 && !t.orderFids.includes(fid)) {
      const summary = this.close('switch_order');
      this.open(chain);
      return summary;
    }
    return null;
  }
}

export const traceManager = new TraceManager();
```

## src/tracking/reporter.ts（上报通道：青鸟 RN SDK 适配层）

```ts
/**
 * 上报通道：青鸟 RN SDK（@xlb/react-native-qingniao-lib）适配层
 *
 * 集成约束：整个 App 只初始化一次，由宿主 App 负责（initQNSDKWithDefaultConfig /
 * setGlobalInfo / registerNavigationContainer）；本层只消费 triggerEvent。
 *
 * 优雅降级：SDK 懒加载 + 调用全 try/catch——宿主未集成 / 原生侧未链接时
 * 静默降级为 no-op，绝不影响业务。
 */

/** 手动埋点事件结构（至少含 event_type + event_id，page/biz 按需） */
export interface QingniaoEventInfo {
  event_type: 'CLICK' | 'CUSTOM';
  /** 青鸟登记标识优先，未登记回退自研 event_code */
  event_id: string;
  page?: {
    name?: string;
    url?: string;
  };
  biz?: Record<string, any>;
}

interface QingniaoSdk {
  triggerEvent: (info: QingniaoEventInfo, flush: boolean) => void;
  /** SLS topic（看板按 __topic__ 拉取；SDK 缺省为空，需显式设置） */
  setTopic?: (topic: string) => void;
}

/** undefined=未探测；null=不可用 */
let cached: QingniaoSdk | null | undefined;

const getSdk = (): QingniaoSdk | null => {
  if (cached !== undefined) return cached;
  try {
    // 懒加载：首次上报时才 require，避免远程包加载期就触碰原生模块
    const mod = require('@xlb/react-native-qingniao-lib');
    cached = typeof mod?.triggerEvent === 'function' ? mod : null;
  } catch {
    cached = null;
  }
  return cached ?? null;
};

/** 通道是否可用（verify 阶段检测用：false 说明宿主未集成，事件不会发出） */
export const isReporterReady = (): boolean => getSdk() !== null;

/**
 * 设置 SLS topic（全局单例，幂等）
 * 【适配点 E】topic 与 web 端同口径；不设置看板查不到 RN 事件
 */
export const setReporterTopic = (topic: string): void => {
  try {
    getSdk()?.setTopic?.(topic);
  } catch (e) {
    if (__DEV__) {
      console.warn('[tracking] setTopic error', e);
    }
  }
};

/**
 * 上报事件（flush=true 立即上报，对应 web 端 chain_summary 的 critical 语义）
 * 宿主未集成 SDK 时静默 no-op
 */
export const reportEvent = (
  info: QingniaoEventInfo,
  flush = false,
): void => {
  try {
    getSdk()?.triggerEvent(info, flush);
  } catch (e) {
    if (__DEV__) {
      console.warn('[tracking] reportEvent error', e);
    }
  }
};
```

## src/tracking/apiCapture.ts（自包含：buffer + 白名单 + 拦截器安装）

```ts
/**
 * 操作类接口捕获：http 拦截器 + 白名单
 * 白名单内的接口调用自动捕获 url/params/耗时，trackAction 完成时按时间窗认领关联
 * 口径与 web 端一致：只收操作类（写）接口，查询接口不入列
 *
 * 【适配点 D】拦截器挂载：installApiCapture(axiosInstance)，在应用入口或首个
 *            register 时调用一次；目标项目是封装请求库时改内部实现
 */

/** 接口白名单：trackAction 覆盖的操作类（写）接口全集 */
const API_CAPTURE_WHITELIST: readonly string[] = [
  // ── 按埋点方案登记，示例：
  // '/scm/hxl.scm.shippingorder.audit', // 审核
];

export interface CapturedApiCall {
  url: string;
  params?: any;
  duration?: number;
  ts: number;
}

const BUFFER_LIMIT = 20;
const buffer: CapturedApiCall[] = [];
let installed = false;

const parseRequestData = (data: any): any => {
  if (typeof data !== 'string') return data;
  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
};

const capture = (config: any): void => {
  try {
    const url: string = config?.url ?? '';
    const path = url.split('?')[0];
    if (!API_CAPTURE_WHITELIST.includes(path)) return;
    buffer.push({
      url: path,
      params: parseRequestData(config?.data),
      duration: config?.__captureStart
        ? Date.now() - config.__captureStart
        : undefined,
      ts: Date.now(),
    });
    if (buffer.length > BUFFER_LIMIT)
      buffer.splice(0, buffer.length - BUFFER_LIMIT);
  } catch {
    // 捕获异常静默，绝不影响业务请求链
  }
};

/** 安装拦截器（幂等） */
export const installApiCapture = (http?: {
  interceptors: { request: { use: (f: any) => void }; response: { use: (onOk: any, onErr: any) => void } };
}): void => {
  if (installed || !http) return;
  installed = true;
  try {
    http.interceptors.request.use((config: any) => {
      config.__captureStart = Date.now();
      return config;
    });
    http.interceptors.response.use(
      (response: any) => {
        capture(response?.config);
        return response;
      },
      (error: any) => {
        capture(error?.config);
        return Promise.reject(error);
      },
    );
  } catch (e) {
    console.warn('[tracking] installApiCapture error', e);
  }
};

/** 认领 sinceTs 之后捕获的接口记录（弹出缓冲区，防重复关联） */
export const claimApiCapture = (
  sinceTs: number,
  expectedUrl?: string,
): CapturedApiCall | undefined => {
  for (let i = buffer.length - 1; i >= 0; i--) {
    if (buffer[i].ts < sinceTs) buffer.splice(i, 1);
  }
  const idx = expectedUrl
    ? buffer.findIndex(r => r.url === expectedUrl)
    : buffer.length > 0
      ? 0
      : -1;
  if (idx < 0) return undefined;
  const [record] = buffer.splice(idx, 1);
  return record;
};
```

## src/tracking/tracker.ts（bizTracker 门面，RN 版）

```ts
/**
 * 业务埋点门面：页面唯一入口（RN 版，语义与 web 端一致）
 * 职责：公共字段注入、trace 生命周期、操作三段式（点击→校验→API 结果）、chain_summary
 *
 * 与 web 端差异：
 * - 上报通道：青鸟 RN SDK（宿主 App 负责初始化，未集成时降级 no-op）
 * - route_url/page_referrer：无 location，取 React Navigation 当前/上一路由名
 * - 环境标识：is_wujie → client_platform: 'rn'
 * - dev 判定：__DEV__
 * - tab 关闭兜底：beforeunload → AppState 进后台
 *
 * 防污染原则：所有 public 方法整体 try/catch，埋点异常绝不影响业务
 *
 * 【适配点 A】getTrackingUserInfo：改为目标项目的用户状态源（authModel / store / context）
 * 【适配点 B】navigationRef：改为目标项目的 React Navigation 容器 ref 来源
 */
import {AppState} from 'react-native';
import {claimApiCapture} from './apiCapture';
import {genId, getSessionId, traceManager} from './context';
import {reportEvent} from './reporter';
import type {
  ChainDef,
  ChainSummary,
  OrderSnapshot,
  PageDef,
  TrackBizOptions,
  TrackEventDef,
} from './types';

interface RegisterOptions {
  page: PageDef;
  chain: ChainDef;
  eventVer: string;
  pageViewDef: TrackEventDef;
  pageLeaveDef: TrackEventDef;
}

/** 【适配点 A：用户信息源】务必按目标项目实际用户状态改写 */
const getTrackingUserInfo = (): Record<string, any> => {
  try {
    // 示例：return authModel?.state?.userInfos || {};
    return {};
  } catch {
    return {};
  }
};

/** 【适配点 B：导航 ref】返回当前路由名（web 端 route_url 的 RN 对应物） */
const getRouteUrl = (): string | undefined => {
  try {
    // 示例：return navigationRef?.current?.getCurrentRoute?.()?.name;
    return undefined;
  } catch {
    return undefined;
  }
};

/** 【适配点 B：导航 ref】返回上一路由名（web 端 page_referrer 的 RN 对应物） */
const getRouteReferrer = (): string | undefined => {
  try {
    // 示例：
    // const state = navigationRef?.current?.getState?.();
    // const index = state?.index ?? 0;
    // return index > 0 ? state.routes[index - 1]?.name : undefined;
    return undefined;
  } catch {
    return undefined;
  }
};

/** 业务侧 API 约定：code === 0 成功（按目标项目响应结构调整） */
const isApiSuccess = (res: any): boolean => res?.code === 0;

/** 仅 dev 环境附加 api_params/api_response/validate_fail_details */
const IS_DEV = __DEV__;

const DEV_PAYLOAD_LIMIT = 8192;
const TRUNC_MARK = '…[truncated]';

const truncateDevPayload = (value: any): string | undefined => {
  if (value === undefined || value === null) return undefined;
  try {
    const text = JSON.stringify(value);
    if (!text) return undefined;
    return text.length > DEV_PAYLOAD_LIMIT
      ? `${text.slice(0, DEV_PAYLOAD_LIMIT)}${TRUNC_MARK}`
      : text;
  } catch {
    return undefined;
  }
};

const sanitizeApiResponse = (res: any): Record<string, any> | undefined => {
  if (res === undefined || res === null || typeof res !== 'object') {
    return undefined;
  }
  return {code: res.code, msg: res.msg, data: res.data};
};

class BizTracker {
  private page: PageDef | null = null;
  private chain: ChainDef | null = null;
  private eventVer = '';
  private pageViewDef: TrackEventDef | null = null;
  private pageLeaveDef: TrackEventDef | null = null;
  private appStateBound = false;

  /** 页面初始化时注册（useFocusEffect 中调用，每次聚焦都安全） */
  register(options: RegisterOptions): void {
    this.page = options.page;
    this.chain = options.chain;
    this.eventVer = options.eventVer;
    this.pageViewDef = options.pageViewDef;
    this.pageLeaveDef = options.pageLeaveDef;
    this.bindAppStateOnce();
  }

  /** 页面聚焦：trace 生成/继承的核心时机（规则与 web 端一致） */
  pageEnter(): void {
    try {
      if (!this.ready() || !this.pageViewDef) return;
      const {expiredSummary} = traceManager.ensure(this.chain!);
      if (expiredSummary) this.emitSummary(expiredSummary);
      this.track(this.pageViewDef, {extra: {is_chain_start: true}});
    } catch (e) {
      console.warn('[tracking] pageEnter error', e);
    }
  }

  /** 页面失焦：trace 关闭判定 */
  pageLeave(): void {
    try {
      if (!this.ready() || !this.pageLeaveDef) return;
      if (!traceManager.get()) return;
      this.track(this.pageLeaveDef);
      const summary = traceManager.close('leave');
      if (summary) this.emitSummary(summary);
    } catch (e) {
      console.warn('[tracking] pageLeave error', e);
    }
  }

  /** 打开另一张单据详情时调用：触发任务切换检测 */
  switchOrderIfNeeded(fid?: string | number): void {
    try {
      if (!this.ready()) return;
      const summary = traceManager.switchOrderIfNeeded(this.chain!, fid);
      if (summary) this.emitSummary(summary);
    } catch (e) {
      console.warn('[tracking] switchOrder error', e);
    }
  }

  /** 普通事件上报（浏览/表单校验失败等不伴随 API 的场景） */
  track(def: TrackEventDef, options: TrackBizOptions = {}): void {
    try {
      if (!this.ready()) return;
      const {expiredSummary} = traceManager.ensure(this.chain!);
      if (expiredSummary) this.emitSummary(expiredSummary);

      traceManager.touch(this.chain!, def.step, {
        regressive: def.regressive,
        terminal: def.terminal,
        orderFids: this.normalizeOrders(options.order)
          .map(o => o.fid)
          .filter(
            (f): f is string | number =>
              f !== undefined && f !== null && f !== '',
          ),
      });
      if (options.result === 'validate_fail') traceManager.markValidateFail();
      if (options.result === 'fail') traceManager.markApiFail();

      this.send(def, this.buildProperties(def, options));

      if (
        def.terminal &&
        options.result !== 'fail' &&
        options.result !== 'validate_fail'
      ) {
        const summary = traceManager.close('done');
        if (summary) this.emitSummary(summary);
      }
    } catch (e) {
      console.warn('[tracking] track error', e);
    }
  }

  /**
   * 操作类事件：包装 API 调用，自动捕获操作结果与接口状况
   * 不改变业务行为：异常原样抛出，返回值原样返回
   */
  async trackAction<T>(
    def: TrackEventDef,
    options: {
      order?: OrderSnapshot | OrderSnapshot[] | null;
      action: () => Promise<T>;
      stateAfter?: string;
      apiUrl?: string;
      apiParams?: any;
      extra?: Record<string, any>;
    },
  ): Promise<T> {
    const start = Date.now();
    try {
      const res: any = await options.action();
      const captured = claimApiCapture(start, options.apiUrl);
      const success = isApiSuccess(res);
      this.track(def, {
        order: options.order,
        result: success ? 'success' : 'fail',
        stateAfter: success ? options.stateAfter : undefined,
        failReason: success ? undefined : 'api_biz_fail',
        api: {
          url: options.apiUrl ?? captured?.url,
          code: res?.code,
          msg: res?.msg,
          duration: captured?.duration ?? Date.now() - start,
          params: options.apiParams ?? captured?.params,
          response: res,
        },
        extra: options.extra,
      });
      return res;
    } catch (e: any) {
      const captured = claimApiCapture(start, options.apiUrl);
      this.track(def, {
        order: options.order,
        result: 'fail',
        failReason: 'api_exception',
        api: {
          url: options.apiUrl ?? captured?.url,
          msg: e?.message,
          duration: captured?.duration ?? Date.now() - start,
          params: options.apiParams ?? captured?.params,
        },
        extra: options.extra,
      });
      throw e;
    }
  }

  // ──────────────────────────── 内部 ────────────────────────────

  private ready(): boolean {
    return !!(this.page && this.chain);
  }

  private normalizeOrders(
    order?: OrderSnapshot | OrderSnapshot[] | null,
  ): OrderSnapshot[] {
    if (!order) return [];
    return Array.isArray(order) ? order : [order];
  }

  /** 公共字段注入（标识/页面/用户/链条/单据/结果/接口/环境 八组） */
  private buildProperties(
    def: TrackEventDef,
    options: TrackBizOptions,
  ): Record<string, any> {
    const userInfo = getTrackingUserInfo();
    const trace = traceManager.get();
    const orders = this.normalizeOrders(options.order);
    const first = orders[0];

    return {
      // 事件标识组
      event_id: genId('evt'),
      event_code: def.code,
      event_name: def.name,
      event_ver: this.eventVer,
      qingniao_id: def.qingniaoId,
      // 页面组
      page_code: this.page!.pageCode,
      page_name: this.page!.pageName,
      page_path: this.page!.pagePath,
      route_url: getRouteUrl(),
      page_referrer: getRouteReferrer(),
      // 用户组
      company_id: userInfo.company_id,
      company_name: userInfo.company_name,
      org_ids: userInfo.org_ids,
      store_id: userInfo.store_id ?? userInfo.store?.id,
      store_name: userInfo.store_name ?? userInfo.store?.store_name,
      user_id: userInfo.id,
      user_name: userInfo.name,
      user_type: userInfo.user_type,
      phone: userInfo.tel ?? userInfo.mobile ?? userInfo.phone,
      supplier_id: userInfo.supplier?.id,
      // 链条组
      session_id: getSessionId(),
      trace_id: trace?.traceId,
      page_event_seq: traceManager.nextSeq(),
      chain_id: trace?.chainId,
      chain_step: def.step,
      is_chain_start: def.step === 'enter',
      is_chain_end: !!def.terminal,
      // 单据组
      order_type: this.chain?.orderType ?? this.chain?.chainId,
      order_fid: first?.fid,
      order_no: first?.order_no,
      order_state: first?.state,
      order_state_after: options.stateAfter,
      appoint_state: first?.appoint_state,
      order_supplier_id: first?.supplier_id,
      recv_store_id: first?.recv_store_id,
      batch_count: orders.length > 1 ? orders.length : undefined,
      order_fids: orders.length > 1 ? orders.map(o => o.fid) : undefined,
      item_count: first?.item_count,
      // 上游来源单据
      source_type: first?.source_type,
      source_fid: first?.source_fid,
      source_order_no: first?.source_order_no,
      // 结果组
      action_result: options.result,
      fail_reason: options.failReason,
      validate_fail_fields: options.validateFailFields,
      validate_fail_details: IS_DEV ? options.validateFailDetails : undefined,
      // 接口组（params/response 仅 dev 且截断）
      api_url: options.api?.url,
      api_code: options.api?.code,
      api_msg: options.api?.msg,
      api_duration: options.api?.duration,
      api_params: IS_DEV ? truncateDevPayload(options.api?.params) : undefined,
      api_response: IS_DEV
        ? truncateDevPayload(sanitizeApiResponse(options.api?.response))
        : undefined,
      // 环境组
      client_platform: 'rn',
      // 自定义
      ...options.extra,
    };
  }

  /** trace 关闭时上报汇总事件（分析侧主要消费对象） */
  private emitSummary(summary: ChainSummary): void {
    const userInfo = getTrackingUserInfo();
    const summaryName = `${this.page?.pageName ?? '页面'}-任务链汇总`;
    this.rawSend(
      {
        event_id: genId('evt'),
        event_code: 'chain_summary',
        event_name: summaryName,
        event_ver: this.eventVer,
        page_code: this.page?.pageCode,
        page_name: this.page?.pageName,
        page_path: this.page?.pagePath,
        route_url: getRouteUrl(),
        user_id: userInfo.id,
        user_name: userInfo.name,
        store_id: userInfo.store_id ?? userInfo.store?.id,
        company_id: userInfo.company_id,
        session_id: getSessionId(),
        client_platform: 'rn',
        ...summary,
      },
      true, // chain_summary 立即 flush
    );
  }

  private send(def: TrackEventDef, properties: Record<string, any>): void {
    this.rawSend(properties, false, def.type === 'click');
  }

  /** 青鸟协议映射：event_type click→CLICK 其余→CUSTOM；event_id 青鸟标识 > event_code；biz 全量平铺 */
  private rawSend(
    properties: Record<string, any>,
    flush: boolean,
    isClick = false,
  ): void {
    reportEvent(
      {
        event_type: isClick ? 'CLICK' : 'CUSTOM',
        event_id: properties.qingniao_id ?? properties.event_code,
        page: {
          name: properties.page_name,
          url: properties.route_url,
        },
        biz: {
          biz_product: properties.page_code,
          biz_module: properties.page_code,
          biz_scene: properties.chain_step,
          biz_action: properties.event_code,
          ...properties,
        },
      },
      flush,
    );
  }

  /** App 进后台时兜底关闭 trace（仅监听 background，避免 iOS inactive 误触发） */
  private bindAppStateOnce(): void {
    if (this.appStateBound) return;
    this.appStateBound = true;
    try {
      AppState.addEventListener('change', state => {
        if (state !== 'background') return;
        try {
          const summary = traceManager.close('unload');
          if (summary) this.emitSummary(summary);
        } catch {
          // 后台阶段静默
        }
      });
    } catch {
      // 监听注册失败静默
    }
  }
}

export const bizTracker = new BizTracker();
```

## src/tracking/index.ts（统一出口骨架）

```ts
/**
 * 埋点统一出口
 * 页面侧只需要：import {bizTracker, XX_EVENTS, registerXxTracking} from 'src/tracking'
 */
export {claimApiCapture, installApiCapture} from './apiCapture';
export {isReporterReady, setReporterTopic} from './reporter';
export {bizTracker} from './tracker';
export * from './types';

import {installApiCapture} from './apiCapture';
import {setReporterTopic} from './reporter';
import {bizTracker} from './tracker';
// import {XX_CHAIN} from './chains';
// import {XX_EVENT_VER, XX_EVENTS, XX_PAGE, XX_PAGE_LEAVE} from './events/xxx';

/** 【适配点 E】SLS topic：与 web 端同口径（看板按 __topic__ 拉取；缺省为空看板查不到 RN 事件） */
const SLS_TOPIC = 'xlb-xxx-web';

/** 【适配点 D】目标项目的 http 实例（axios）；封装请求库则改 apiCapture 内部 */
// import http from 'src/utils/request';

/** 页面埋点注册（useFocusEffect 聚焦时调用一次）；每个页面一个 register 函数，示例：
export const registerXxTracking = (): void => {
  installApiCapture(http);
  setReporterTopic(SLS_TOPIC);
  bizTracker.register({
    page: XX_PAGE,
    chain: XX_CHAIN,
    eventVer: XX_EVENT_VER,
    pageViewDef: XX_EVENTS.PAGE_VIEW,
    pageLeaveDef: XX_PAGE_LEAVE,
  });
};
*/
```

> 与 PC 差异：RN 的通道初始化（installApiCapture + setReporterTopic）内聚在每个 register 函数里（幂等），页面无需关心；PC 在应用入口统一初始化。

## 适配点汇总

| # | 位置 | 改什么 | 默认行为（不改也能跑） |
| --- | --- | --- | --- |
| A | tracker.ts `getTrackingUserInfo` | 目标项目用户状态源 | 返回空对象，用户组字段为空 |
| B | tracker.ts `getRouteUrl` / `getRouteReferrer` | 目标项目 navigationRef 来源 | 返回 undefined |
| C | tracker.ts `IS_DEV` | dev 判定 | `__DEV__`（RN 通用，通常无需改） |
| D | index.ts register 内 `installApiCapture(http)` | 目标项目 http 实例 | 不传则接口捕获不生效（事件照发，仅缺 api 自动关联） |
| E | index.ts `SLS_TOPIC` | 平台侧登记的 topic | 占位 `xlb-xxx-web`，**必须改** |

## 依赖与人工依赖

**代码依赖**：`@xlb/react-native-qingniao-lib`（宿主 App 集成；远程包代码里懒加载，package.json 不强制声明）

**人工依赖（必须列入方案并告知用户，skill 无法代劳）**：

- [ ] 宿主 App 集成青鸟 RN SDK（initQNSDKWithDefaultConfig 等初始化由宿主负责）——未集成时 `isReporterReady()` 返回 false，事件静默不发
- [ ] 平台侧 topic 登记（与 web 端同口径）
- [ ] 青鸟事件登记：需要 `qingniaoId` 的事件逐条登记

## 验证钩子

verify 阶段在 RN debug 包中执行：

```ts
import {isReporterReady} from 'src/tracking';
console.log('[tracking] reporter ready:', isReporterReady());
```

- `false` → 宿主未集成 SDK，标记「上报未验证」并提示人工依赖
- `true` → 操作已埋点路径，观察 SDK 日志/看板落库
