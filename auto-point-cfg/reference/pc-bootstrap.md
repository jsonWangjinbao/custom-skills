# PC 端从零封装（无基建项目 bootstrap）

> 目标项目**没有任何埋点封装**时使用。本文件内联全套可落位代码（提炼自生产验证过的 SCM 产线封装），按文件树落位 + 完成「适配点」改写后，事件即可真实上报。
> 目标项目已有封装时**禁止使用本文件**，复用既有封装（见 02-survey 基建检查分岔）。

## 前置检测（02-survey 阶段完成）

| 检测项 | 方法 | 影响 |
| --- | --- | --- |
| 上报 SDK | package.json 是否有 `@xlb/xlb-tracker` | 无 → 安装（私有源）；它是上报公司统一 SLS 的官方通道 |
| http 客户端 | 项目是 axios 实例还是封装 fetch（如 XlbFetch） | 决定 apiCapture.ts 拦截器挂载方式【适配点 D】 |
| 用户信息源 | 登录用户信息从哪里读（localStorage / store / utils） | 【适配点 A】 |
| 环境变量 | dev/prod 判定变量（如 XLB_ENV / NODE_ENV） | 【适配点 C】 |
| 微前端 | 是否 wujie/qiankun 子应用 | 【适配点 B】，否则删除该字段 |
| 应用标识 | 平台侧登记的 app.id（= SLS topic，看板按 `__topic__` 拉取） | **人工依赖**，未登记事件落库后看板查不到 |

## 文件树

```
src/tracking/
├── types.ts        # 类型定义（原样落位，无适配点）
├── context.ts      # session/trace 上下文（原样落位，无适配点）
├── reporter.ts     # 上报通道（适配点 C/E）
├── apiCapture.ts   # 接口白名单捕获（适配点 D）
├── tracker.ts      # bizTracker 门面（适配点 A/B）
├── chains/         # 链条定义（按埋点方案新增）
├── events/         # 事件字典（按埋点方案新增）
└── index.ts        # 统一出口 + register 函数（按埋点方案新增）
```

---

## src/tracking/types.ts（原样落位）

```ts
/**
 * 业务埋点层类型定义
 */

/** 链条环节（漏斗归桶维度） */
export type ChainStep =
  | 'enter' // 进入任务
  | 'browse' // 浏览/查询/打开详情
  | 'handle' // 单据处理（审核/处理）
  | 'reply' // 单据批复
  | 'appoint' // 发货预约
  | 'abort' // 异常/中断（作废/删除）
  | 'leave'; // 离开

/** 操作结果 */
export type ActionResult = 'success' | 'fail' | 'cancel' | 'validate_fail';

/** 事件定义（埋点字典条目，与配置中心事件清单一一对应） */
export interface TrackEventDef {
  /** 机器聚合用编码 */
  code: string;
  /** 事件名称（与清单一致，给人看） */
  name: string;
  /** 事件类型 */
  type: 'view' | 'click' | 'chain';
  /** 所属链条环节 */
  step: ChainStep;
  /** 回退类事件（卡点强信号） */
  regressive?: boolean;
  /** 终态事件（任务达成标志） */
  terminal?: boolean;
  /** 青鸟平台登记的事件标识（未登记留空，上报回退 code） */
  qingniaoId?: string;
}

/** 页面定义 */
export interface PageDef {
  pageCode: string;
  pageName: string;
  /** 清单口径页面路径，如 XXX供应链-业务-发货单 */
  pagePath: string;
}

/** 单据快照（业务侧传入，链 B 数据载体） */
export interface OrderSnapshot {
  fid?: string | number;
  order_no?: string;
  state?: string;
  appoint_state?: string;
  supplier_id?: string | number;
  recv_store_id?: string | number;
  item_count?: number;
  /** 上游来源单据类型（有值即「本单由该上游单生成」） */
  source_type?: string;
  /** 上游来源单据 fid */
  source_fid?: string | number;
  /** 上游来源单据号（人读友好） */
  source_order_no?: string;
  [key: string]: any;
}

/** API 调用结果（trackAction 自动捕获） */
export interface ApiOutcome {
  url?: string;
  code?: number | string;
  msg?: string;
  duration?: number;
  /** 入参快照（JSON 超 8KB 截断） */
  params?: any;
  /** 返回值快照（净化后仅留 code/msg/data，JSON 超 8KB 截断） */
  response?: any;
}

/** 业务埋点调用参数 */
export interface TrackBizOptions {
  /** 操作目标单据（链 B 串联主键来源），批量操作传数组 */
  order?: OrderSnapshot | OrderSnapshot[] | null;
  /** 操作结果；trackAction 自动填充，手动 track 时可显式指定 */
  result?: ActionResult;
  /** API 结果；trackAction 自动填充 */
  api?: ApiOutcome;
  /** 归一化失败原因 */
  failReason?: string;
  /** 表单校验失败字段名列表（只报字段名，不报值） */
  validateFailFields?: string[];
  /** 表单校验失败明细（可视化页排障用） */
  validateFailDetails?: { field: string; reason: string }[];
  /** 操作成功后的单据状态（链 B 状态迁移的 after 边） */
  stateAfter?: string;
  /** 额外自定义字段 */
  extra?: Record<string, any>;
}

/** 链条定义 */
export interface ChainDef {
  chainId: string;
  /** 单据类型标识（缺省取 chainId）；跨类型串联后链 B 主键为 order_type+order_fid */
  orderType?: string;
  /** trace 静默超时（毫秒） */
  idleTimeout: number;
}

/** trace 运行时上下文 */
export interface TraceContext {
  traceId: string;
  chainId: string;
  startTime: number;
  lastTime: number;
  path: ChainStep[];
  regressiveCount: number;
  regressiveSteps: ChainStep[];
  validateFailCount: number;
  apiFailCount: number;
  lastStep: ChainStep | '';
  reachedTerminal: boolean;
  orderFids: (string | number)[];
}

/** trace 关闭原因 */
export type TraceCloseReason =
  | 'leave'
  | 'done'
  | 'timeout'
  | 'unload'
  | 'switch_order';

/** chain_summary 汇总事件负载（trace 关闭时上报，分析侧主要消费对象） */
export interface ChainSummary {
  trace_id: string;
  chain_id: string;
  start_time: number;
  end_time: number;
  duration_ms: number;
  step_count: number;
  path: ChainStep[];
  regressive_count: number;
  regressive_steps: ChainStep[];
  validate_fail_count: number;
  api_fail_count: number;
  last_step: ChainStep | '';
  outcome: 'done' | 'abort' | 'timeout' | 'unload';
  order_fids: (string | number)[];
}
```

## src/tracking/context.ts（原样落位）

```ts
/**
 * 埋点链条上下文管理：session_id / trace_id / 事件序号
 */
import type {
  ChainDef,
  ChainStep,
  ChainSummary,
  TraceCloseReason,
  TraceContext,
} from './types';

const SESSION_KEY = 'xlb_track_session_id';

/** 简易 uuid（不引依赖） */
export const genId = (prefix: string): string => {
  const rand = Math.random().toString(36).slice(2, 8);
  const rand2 = Math.random().toString(36).slice(2, 6);
  return `${prefix}_${Date.now().toString(36)}_${rand}${rand2}`;
};

export const getSessionId = (): string => {
  try {
    let sid = sessionStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = genId('sess');
      sessionStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  } catch {
    // sessionStorage 不可用（如隐私模式）时退化为内存会话
    return 'sess_mem_fallback';
  }
};

/** trace 生命周期管理（页面级内存单例） */
class TraceManager {
  private current: TraceContext | null = null;
  private seq = 0;

  /** 页面内事件自增序号 */
  nextSeq(): number {
    this.seq += 1;
    return this.seq;
  }

  get(): TraceContext | null {
    return this.current;
  }

  /** 当前 trace 是否静默超时 */
  isIdle(chain: ChainDef): boolean {
    if (!this.current) return false;
    return Date.now() - this.current.lastTime > chain.idleTimeout;
  }

  /** 开新 trace（不自动关闭旧的，由 tracker 组合 close+open） */
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

  /** 确保有活跃 trace；若旧 trace 静默超时，自动关闭并返回其汇总（供 chain_summary 上报） */
  ensure(chain: ChainDef): {
    trace: TraceContext;
    expiredSummary: ChainSummary | null;
  } {
    if (this.current && this.isIdle(chain)) {
      const expiredSummary = this.close('timeout');
      return { trace: this.open(chain), expiredSummary };
    }
    if (!this.current) {
      return { trace: this.open(chain), expiredSummary: null };
    }
    return { trace: this.current, expiredSummary: null };
  }

  /** 记录一步 */
  touch(
    chain: ChainDef,
    step: ChainStep,
    opts: {
      regressive?: boolean;
      terminal?: boolean;
      /** 本步涉及的单据 fid（批量操作传全量，逐张去重累积） */
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

  /** 关闭 trace，返回汇总数据（供 chain_summary 事件上报）；无活跃 trace 返回 null */
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

  /** 打开另一张单据详情时的任务切换检测；返回被替换掉的旧 trace 汇总（无替换返回 null） */
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

## src/tracking/reporter.ts（上报通道）

```ts
/**
 * 上报通道：标准事件 → 公司统一数据平台（SLS）
 * 默认实现基于官方 SDK @xlb/xlb-tracker（私有源安装）
 *
 * 【适配点 C】env 判定：改为目标项目的部署环境标定（四态 dev/test/stage/prod，勿两态塌缩）
 * 【适配点 E】目标项目已有其他埋点 SDK 时，不改 tracker.ts，
 *            把 reportEvent 内部桥接到既有 SDK 即可（保持 biz 字段平铺）
 */
import { initTracker, type BrowserTracker } from '@xlb/xlb-tracker';

export interface ReportPayload {
  /** 事件标识：青鸟登记标识 > 自研 event_code */
  event_id: string;
  event_type: 'CLICK' | 'PAGE_VIEW' | 'PAGE_LEAVE' | 'CUSTOM';
  page: { name?: string; url: string; host: string };
  /** 自研字段全量平铺（event_ver/trace_id/chain_step/order_*/api_* 等） */
  biz: Record<string, any>;
}

let client: BrowserTracker | null = null;
let debug = false;

/**
 * 【适配点 C】环境判定：按目标项目的部署环境标定改写。
 * 官方协议 env 为四态 dev | test | stage | prod，须由部署侧显式标定
 * （如 umi/webpack define 按构建配置注入部署环境变量）；勿用 NODE_ENV 类
 * 两态映射塌缩——「非开发即 prod」会把测试/staging 数据错标为 prod
 * （2026-09 SCM 实测事故：XLB_ENV 仅 development/production 两态，
 * 测试环境构建产物被错标 prod，看板按 app.env 过滤全部串档）。
 */
const resolveEnv = (): 'dev' | 'test' | 'stage' | 'prod' => {
  const e = process.env.XLB_DEPLOY_ENV;
  return e === 'dev' || e === 'test' || e === 'stage' || e === 'prod' ? e : 'prod';
};

export interface ReporterInitOptions {
  /** 平台侧登记的应用 ID（= SLS topic，看板按 __topic__ 拉取；未登记则事件查不到） */
  appId: string;
  /** 应用名称（人读） */
  appName: string;
  debug?: boolean;
}

/** 初始化上报通道（应用入口调用一次，幂等） */
export const initReporter = (opts: ReporterInitOptions): void => {
  if (client) return;
  debug = opts.debug ?? resolveEnv() === 'dev';
  try {
    client = initTracker({
      enable: true,
      app: {
        id: opts.appId,
        name: opts.appName,
        type: 'xlb',
        env: resolveEnv(),
      },
      // 页面未在青鸟登记时显式关闭页面登记拉取（biz 自含 page_code/page_name）
      qingniao: false,
    });
    if (debug) console.log('[tracking] reporter 初始化完成, env:', resolveEnv());
  } catch (error) {
    client = null;
    console.warn('[tracking] reporter 初始化失败:', error);
  }
};

/**
 * 上报事件（critical=true 立即上报，用于 chain_summary 兜底语义）
 * 全 try/catch 静默失败，绝不影响业务
 */
export const reportEvent = (payload: ReportPayload, critical = false): void => {
  if (!client) return;
  try {
    if (critical) {
      client.sendCritical(payload as any);
    } else {
      client.send(payload as any);
    }
    if (debug) console.log('[tracking] event:', payload.event_id, payload.biz);
  } catch (error) {
    if (debug) console.warn('[tracking] 事件上报失败:', error);
  }
};

/** 设置用户（登录态就绪后调用一次；协议槽位映射在此完成） */
export const reportUser = (user: Record<string, any>): void => {
  if (!client) return;
  try {
    client.setUser({
      user_id: user.id ? String(user.id) : undefined,
      account: user.account,
      name: user.name,
      company_id: user.company_id ? String(user.company_id) : undefined,
      store_id: user.store_id ? String(user.store_id) : undefined,
      store_name: user.store_name,
      user_type: user.user_type,
      tel: user.mobile || user.phone || user.tel,
      mobile: user.mobile,
    } as any);
  } catch (error) {
    if (debug) console.warn('[tracking] 用户信息设置失败:', error);
  }
};
```

## src/tracking/apiCapture.ts（接口白名单捕获）

```ts
/**
 * 操作类接口捕获：http 拦截器 + 白名单
 * 白名单内的接口调用自动捕获 url/params/耗时，trackAction 完成时按时间窗认领关联
 * —— 调用方不再需要手写 apiUrl/apiParams，新增操作接口只需在白名单登记一行
 *
 * 【适配点 D】拦截器挂载：默认按 axios 实例写法；目标项目是封装 fetch（如 XlbFetch）
 *            时改写 installApiCapture 内部，保持 capture/claimApiCapture 不变
 */

/** 接口白名单：trackAction 覆盖的操作类（写）接口全集；查询接口不入列 */
const API_CAPTURE_WHITELIST: readonly string[] = [
  // ── 按埋点方案登记，示例：
  // '/scm/hxl.scm.shippingorder.audit', // 审核
];

/** 捕获的接口调用记录 */
export interface CapturedApiCall {
  url: string;
  /** 请求入参（config.data 反序列化后） */
  params?: any;
  /** 纯接口耗时（请求发出→响应到达，ms） */
  duration?: number;
  /** 响应到达时间戳（ms） */
  ts: number;
}

/** 环形缓冲上限：防异常场景（白名单请求未配对 trackAction）内存膨胀 */
const BUFFER_LIMIT = 20;

const buffer: CapturedApiCall[] = [];

/** 请求体还原：axios transformRequest 后 config.data 可能是 JSON 字符串 */
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

/**
 * 【适配点 D】安装拦截器（幂等，应用入口调用一次）
 * axios 实例：installApiCapture(axiosInstance)
 * 封装 fetch（如 XlbFetch）：去掉参数，直接挂 XlbFetch.interceptors
 */
export const installApiCapture = (http?: {
  interceptors: { request: { use: (f: any) => void }; response: { use: (onOk: any, onErr: any) => void } };
}): void => {
  if (!http) return;
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

/**
 * 认领 sinceTs 之后捕获的接口记录（弹出缓冲区，防重复关联）
 * expectedUrl 有值时优先精确匹配（调用方显式声明 apiUrl 的场景）
 */
export const claimApiCapture = (
  sinceTs: number,
  expectedUrl?: string,
): CapturedApiCall | undefined => {
  // 先清理过期记录（sinceTs 之前的孤儿：未被任何 trackAction 认领的白名单调用）
  for (let i = buffer.length - 1; i >= 0; i--) {
    if (buffer[i].ts < sinceTs) buffer.splice(i, 1);
  }
  const idx = expectedUrl
    ? buffer.findIndex((r) => r.url === expectedUrl)
    : buffer.length > 0
      ? 0
      : -1;
  if (idx < 0) return undefined;
  const [record] = buffer.splice(idx, 1);
  return record;
};
```

## src/tracking/tracker.ts（bizTracker 门面）

```ts
/**
 * 业务埋点门面：页面唯一入口
 * 职责：公共字段注入、trace 生命周期、操作三段式（点击→校验→API 结果）、chain_summary
 *
 * 防污染原则：所有 public 方法整体 try/catch，埋点异常绝不影响业务
 *
 * 【适配点 A】getTrackingUserInfo：改为目标项目的用户信息获取（同步返回登录用户对象）
 * 【适配点 B】isSubAppEnv：微前端子应用环境标识；非微前端项目删除该字段
 */
import { claimApiCapture } from './apiCapture';
import { genId, getSessionId, traceManager } from './context';
import { reportEvent } from './reporter';
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

/** 【适配点 A：用户信息源】务必按目标项目实际用户存储改写（localStorage / store / utils） */
const getTrackingUserInfo = (): Record<string, any> => {
  try {
    return JSON.parse(localStorage.getItem('userInfo') || '{}');
  } catch {
    return {};
  }
};

/** 【适配点 B：环境标识】微前端子应用返回 true；非微前端项目删除此函数及 is_wujie 字段 */
const isSubAppEnv = (): boolean => false;

/** 业务侧 API 约定：code === 0 成功（按目标项目响应结构调整） */
const isApiSuccess = (res: any): boolean => res?.code === 0;

/** 载荷截断上限（字符数） */
const PAYLOAD_LIMIT = 8192;

/** 截断标记：看板识别后修复 JSON 前缀再美化展示 */
const TRUNC_MARK = '…[truncated]';

const truncatePayload = (value: any): string | undefined => {
  if (value === undefined || value === null) return undefined;
  try {
    const text = JSON.stringify(value);
    if (!text) return undefined;
    return text.length > PAYLOAD_LIMIT
      ? `${text.slice(0, PAYLOAD_LIMIT)}${TRUNC_MARK}`
      : text;
  } catch {
    return undefined;
  }
};

/** api_response 净化：剥离传输层，仅留业务三元组 code/msg/data */
const sanitizeApiResponse = (res: any): Record<string, any> | undefined => {
  if (res === undefined || res === null || typeof res !== 'object') {
    return undefined;
  }
  return { code: res.code, msg: res.msg, data: res.data };
};

class BizTracker {
  private page: PageDef | null = null;
  private chain: ChainDef | null = null;
  private eventVer = '';
  private pageViewDef: TrackEventDef | null = null;
  private pageLeaveDef: TrackEventDef | null = null;
  private unloadBound = false;

  /** 页面初始化时注册（页面激活钩子中调用，重复激活安全） */
  register(options: RegisterOptions): void {
    this.page = options.page;
    this.chain = options.chain;
    this.eventVer = options.eventVer;
    this.pageViewDef = options.pageViewDef;
    this.pageLeaveDef = options.pageLeaveDef;
    this.bindUnloadOnce();
  }

  /**
   * 页面激活：trace 生成/继承的核心时机
   * - 无活跃 trace → 开新 trace
   * - 活跃未过期 → 继承（列表↔详情同批单据连续操作）
   * - 静默超 idleTimeout → 关闭旧 trace（summary: timeout）后开新 trace
   */
  pageEnter(): void {
    try {
      if (!this.ready() || !this.pageViewDef) return;
      const { expiredSummary } = traceManager.ensure(this.chain!);
      if (expiredSummary) this.emitSummary(expiredSummary);
      this.track(this.pageViewDef, { extra: { is_chain_start: true } });
    } catch (e) {
      console.warn('[tracking] pageEnter error', e);
    }
  }

  /** 页面失活/关闭：trace 关闭判定 */
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
      const { expiredSummary } = traceManager.ensure(this.chain!);
      if (expiredSummary) this.emitSummary(expiredSummary);

      traceManager.touch(this.chain!, def.step, {
        regressive: def.regressive,
        terminal: def.terminal,
        orderFids: this.normalizeOrders(options.order)
          .map((o) => o.fid)
          .filter(
            (f): f is string | number =>
              f !== undefined && f !== null && f !== '',
          ),
      });
      if (options.result === 'validate_fail') traceManager.markValidateFail();
      if (options.result === 'fail') traceManager.markApiFail();

      this.send(def, this.buildProperties(def, options));

      // 终态达成 → 关闭 trace
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
      /** 操作触发的接口路径：白名单已覆盖时无需声明；声明则精确匹配认领 */
      apiUrl?: string;
      /** 接口入参（缺省取拦截器捕获值；上报 api_params，8KB 截断） */
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
      route_url: `${location.pathname}${location.search}`,
      page_referrer: document.referrer || undefined,
      // 用户组
      company_id: userInfo.company_id,
      company_name: userInfo.company_name,
      org_ids: userInfo.org_ids,
      store_id: userInfo.store_id,
      store_name: userInfo.store_name,
      user_id: userInfo.id,
      user_name: userInfo.name,
      user_type: userInfo.user_type,
      phone: userInfo.mobile || userInfo.phone || userInfo.tel,
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
      order_fids: orders.length > 1 ? orders.map((o) => o.fid) : undefined,
      item_count: first?.item_count,
      // 上游来源单据
      source_type: first?.source_type,
      source_fid: first?.source_fid,
      source_order_no: first?.source_order_no,
      // 结果组
      action_result: options.result,
      fail_reason: options.failReason,
      validate_fail_fields: options.validateFailFields,
      validate_fail_details: options.validateFailDetails,
      // 接口组（params/response 截断后全环境上报）
      api_url: options.api?.url,
      api_code: options.api?.code,
      api_msg: options.api?.msg,
      api_duration: options.api?.duration,
      api_params: truncatePayload(options.api?.params),
      api_response: truncatePayload(sanitizeApiResponse(options.api?.response)),
      // 环境组
      is_wujie: isSubAppEnv(),
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
        route_url: `${location.pathname}${location.search}`,
        user_id: userInfo.id,
        user_name: userInfo.name,
        store_id: userInfo.store_id,
        company_id: userInfo.company_id,
        session_id: getSessionId(),
        is_wujie: isSubAppEnv(),
        ...summary,
      },
      true, // chain_summary 立即上报（critical 兜底语义）
    );
  }

  private send(def: TrackEventDef, properties: Record<string, any>): void {
    this.rawSend(properties, false, def.type === 'click');
  }

  /** 协议映射：event_id 取 青鸟标识 > event_code；biz 全量平铺 + BI 惯例归桶字段 */
  private rawSend(
    properties: Record<string, any>,
    critical: boolean,
    isClick = false,
  ): void {
    reportEvent(
      {
        event_id: properties.qingniao_id ?? properties.event_code,
        event_type: isClick
          ? 'CLICK'
          : properties.chain_step === 'enter'
            ? 'PAGE_VIEW'
            : properties.chain_step === 'leave'
              ? 'PAGE_LEAVE'
              : 'CUSTOM',
        page: {
          name: properties.page_name,
          url: location.href,
          host: location.host,
        },
        biz: {
          biz_product: properties.page_code,
          biz_module: properties.page_code,
          biz_scene: properties.chain_step,
          biz_action: properties.event_code,
          ...properties,
        },
      },
      critical,
    );
  }

  /** 关闭浏览器 tab 时兜底关闭 trace */
  private bindUnloadOnce(): void {
    if (this.unloadBound || typeof window === 'undefined') return;
    this.unloadBound = true;
    window.addEventListener('beforeunload', () => {
      try {
        const summary = traceManager.close('unload');
        if (summary) this.emitSummary(summary);
      } catch {
        // 卸载阶段静默
      }
    });
  }
}

export const bizTracker = new BizTracker();
```

## src/tracking/index.ts（统一出口骨架）

```ts
/**
 * 埋点统一出口
 * 页面侧只需要：import { bizTracker, XX_EVENTS, registerXxTracking } from '@/tracking'
 */
export { claimApiCapture, installApiCapture } from './apiCapture';
export { initReporter, reportUser } from './reporter';
export { bizTracker } from './tracker';
export * from './types';

// ── 以下按埋点方案追加（chains/events 导出 + register 函数），示例：
// export { DN_CHAIN, DN_CHAIN_ID } from './chains/deliveryNote';
// export { DN_EVENT_VER, DN_EVENTS, DN_EXTRA_EVENTS, DN_PAGE, DN_PAGE_LEAVE } from './events/deliveryNote';
//
// import { DN_CHAIN } from './chains/deliveryNote';
// import { DN_EVENT_VER, DN_EVENTS, DN_PAGE, DN_PAGE_LEAVE } from './events/deliveryNote';
// import { bizTracker } from './tracker';
//
// /** 发货单页面埋点注册（页面激活钩子中调用一次） */
// export const registerDeliveryNoteTracking = (): void => {
//   bizTracker.register({
//     page: DN_PAGE,
//     chain: DN_CHAIN,
//     eventVer: DN_EVENT_VER,
//     pageViewDef: DN_EVENTS.PAGE_VIEW,
//     pageLeaveDef: DN_PAGE_LEAVE,
//   });
// };
```

## 应用入口接线（必须完成，否则事件不会发出）

在应用入口（如 `src/app.ts` / `src/layouts/index.tsx`，按目标项目结构）：

```ts
import { initReporter, installApiCapture } from '@/tracking';
import axiosInstance from '@/utils/request'; // 【适配点 D】目标项目的 http 实例

// 埋点上报通道初始化（appId 需平台侧登记，见「人工依赖」）
initReporter({
  appId: 'xlb-xxx-web', // 【人工依赖】平台侧登记的应用 ID（= SLS topic）
  appName: 'XXX系统',
});

// 接口白名单捕获（trackAction 自动关联 api 信息）
installApiCapture(axiosInstance);
```

## 适配点汇总

| # | 位置 | 改什么 | 默认行为（不改也能跑） |
| --- | --- | --- | --- |
| A | tracker.ts `getTrackingUserInfo` | 目标项目用户信息获取 | localStorage `userInfo` key，取不到则用户组字段为空 |
| B | tracker.ts `isSubAppEnv` | 微前端子应用环境判断；否则删除 `is_wujie` 字段 | 恒 false |
| C | reporter.ts / tracker.ts 环境判定 | 目标项目部署环境标定（四态 dev/test/stage/prod，勿两态塌缩） | `process.env.XLB_DEPLOY_ENV`，未注入回退 prod |
| D | apiCapture.ts `installApiCapture` + 入口调用 | 目标项目 http 客户端（axios 实例直传；封装 fetch 则改内部实现） | 标准 axios 实例拦截器 |
| E | reporter.ts `reportEvent` | 目标项目已有其他埋点 SDK 时桥接 | `@xlb/xlb-tracker` 官方通道 |

## 依赖与人工依赖

**代码依赖**：`@xlb/xlb-tracker`（私有源；目标项目已有等价官方 SDK 则复用，见适配点 E）

**人工依赖（必须列入方案并告知用户，skill 无法代劳）**：

- [ ] 平台侧应用登记：app.id（= SLS topic）申请——未登记事件落库后看板查不到
- [ ] 青鸟事件登记：需要 `qingniaoId` 的事件逐条登记（清单 event_id 列已有的除外）
