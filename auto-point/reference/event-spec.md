# 事件定义口径（两端通用）

PC 与 RN 业务埋点层语义完全一致（同一套字段规范），仅基建实现不同。本文件内联全部口径定义与示例，**不依赖任何外部仓库**。

## 核心类型（埋点层 types 口径）

目标项目已有标准结构埋点基建（B/C/D 级）时，以其 types 为准（命名可能略异，语义应对齐）；其他埋点的类型不作参考。无基建时按以下口径出方案：

```ts
/** 链条环节（漏斗归桶维度） */
export type ChainStep =
  | 'enter'    // 进入任务
  | 'browse'   // 浏览/查询/打开详情
  | 'handle'   // 单据处理（审核/处理）
  | 'reply'    // 单据批复
  | 'appoint'  // 发货预约
  | 'abort'    // 异常/中断（作废/删除）
  | 'leave';   // 离开

/** 操作结果 */
export type ActionResult = 'success' | 'fail' | 'cancel' | 'validate_fail';

/** 事件定义（埋点字典条目，与飞书清单一一对应） */
export interface TrackEventDef {
  /** 机器聚合用编码，snake_case */
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
  /** 青鸟平台登记的事件标识（未登记则留空，适配层回退 code） */
  qingniaoId?: string;
}

/** 页面定义 */
export interface PageDef {
  pageCode: string;
  pageName: string;
  /** 清单口径页面路径，如 SCM供应链-业务-发货单 */
  pagePath: string;
}

/** 单据快照（业务侧传入，链 B 串联主键来源） */
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

/** 业务埋点调用参数 */
export interface TrackBizOptions {
  /** 操作目标单据（链 B 串联主键来源），批量操作传数组 */
  order?: OrderSnapshot | OrderSnapshot[] | null;
  /** 操作结果；trackAction 自动填充，手动 track 时可显式指定 */
  result?: ActionResult;
  /** 归一化失败原因 */
  failReason?: string;
  /** 表单校验失败字段名列表（只报字段名，不报值） */
  validateFailFields?: string[];
  /** 校验失败明细：字段语义 + 人类可读原因（看板「校验失败明细」直接展示；
   *  表单校验取 errorFields 的 name/errors，前置拦截取被校验对象语义 + 页面提示文案） */
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
  /** trace 静默超时（毫秒），惯例 30 分钟 */
  idleTimeout: number;
}
```

## ChainStep 归桶判定

| step | 含义 | 典型事件 |
| --- | --- | --- |
| enter | 进入任务 | 页面浏览（PAGE_VIEW） |
| browse | 浏览/查询/打开详情 | 查询、打开详情、导出、打印、生成下游单入口 |
| handle | 单据处理 | 审核、反审核、处理通过/拒绝 |
| reply | 单据批复 | 批复通过/拒绝、驳回、反批复 |
| appoint | 发货预约 | 预约发起、选择预约日期、预约确认/取消/撤销 |
| abort | 异常/中断 | 作废、删除（通常配 terminal: true） |
| leave | 离开 | 页面离开（系统事件，不在业务清单内） |

> 归桶拿不准时在清单标「⚠ 待确认」，不得静默选定。

## 飞书清单字段 → 事件定义映射

| 清单列 | 事件定义字段 | 规则 |
| --- | --- | --- |
| 事件名称 | name | **严格一致**，不改写（如 `发货单-审核`） |
| 事件（浏览/点击） | type | 浏览 → `view`；点击 → `click` |
| 页面路径 | PageDef.pagePath | 原样使用（如 `SCM供应链-业务-发货单`） |
| event_id | qingniaoId | 有值则填；空则省略该字段 |
| 高频页面 | PageDef.pageName | 原样使用 |
| —（推导） | code | snake_case 机器编码，同页面内唯一，见下方命名示例 |

code 命名示例（真实口径）：`view / query / detail_view / audit / un_audit / batch_audit / handle_pass / handle_reject / reply_pass / reply_rej / reject_back / un_reply / invalid / batch_delete / appoint_start / appoint_pick / appoint_confirm / appoint_revoke / appoint_cancel / gen_service / gen_shortage / doc_relation`

## 事件字典文件结构（完整示例）

```ts
/**
 * 发货单埋点事件字典
 * 对照《XX产线埋点XXXXXX》清单：1 浏览 + N 点击 = M 事件
 */
import type { PageDef, TrackEventDef } from '../types';

export const DN_PAGE: PageDef = {
  pageCode: 'deliveryNote',
  pageName: '发货单',
  pagePath: 'SCM供应链-业务-发货单',
};

/** 字典版本：任何变更必须递增，随事件上报，防止历史数据口径断裂
 *  1.0.0：首版，按清单 N 事件
 *  1.1.0：新增 xxx 事件（示例变更记录格式） */
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
    qingniaoId: 'xlb_scm_check_click', // 青鸟登记标识，清单 event_id 列
  },
  UN_AUDIT: {
    code: 'un_audit',
    name: '发货单-反审核',
    type: 'click',
    step: 'handle',
    regressive: true, // 回退类：反审核/驳回/反批复/撤销等
  },

  // ── 异常/中断
  INVALID: {
    code: 'invalid',
    name: '发货单-作废',
    type: 'click',
    step: 'abort',
    terminal: true, // 终态：作废/删除/关单/预约确认完成等
  },
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
  /** 单据流转关系：标记「本单由上游单据生成」，链 B 流转图的边来源 */
  DOC_RELATION: {
    code: 'doc_relation',
    name: '单据流转关系',
    type: 'chain',
    step: 'browse',
  },
} as const satisfies Record<string, TrackEventDef>;

export type DnEventKey = keyof typeof DN_EVENTS;
```

要点：

- 事件按 step 分组排列并加分组注释，与清单阅读顺序一致
- `PAGE_VIEW` / `PAGE_LEAVE` / `EXTRA_EVENTS` 是每个页面字典的固定三件套
- `as const satisfies Record<string, TrackEventDef>` 保证类型安全且保留字面量

## 上报方式判定（track vs trackAction）

| 场景 | 方式 | 说明 |
| --- | --- | --- |
| 操作触发 API 调用 | `await bizTracker.trackAction(def, { order, action, stateAfter?, apiUrl?, extra? })` | 自动捕获 success/fail 与接口状况；**异常原样抛出、返回值原样返回** |
| 纯点击意图、无 API | `bizTracker.track(def, { order?, extra? })` | 如「发货预约」入口点击 |
| 前置校验拦截（未发 API） | `bizTracker.track(def, { order?, result: 'validate_fail', failReason, validateFailFields?, validateFailDetails? })` | 卡点信号；只报字段语义与原因，不报值；details 缺省时看板「校验失败明细」为空 |
| 接口业务失败手动补报 | `bizTracker.track(def, { order?, result: 'fail', failReason: 'api_biz_fail', api })` | 仅限 trackAction 未覆盖的组装场景（如预检+确认两段式） |

## 单据快照（order，链 B 载体）

- 单个传对象，批量传数组；`order.fid` 是链 B 主键，**必须可取**
- `stateAfter`：仅在代码明确知道目标状态时填（如审核通过 → `'AUDIT'`）；目标状态由后端决定时不臆测、留空
- 建议页面内定义 `toOrderSnapshot(row)` 转换函数统一取数，避免各处字段不一致

## 公共字段（tracker 自动注入，调用方不传）

event_id / event_ver、page_* 组（page_code/page_name/page_path/route_url/page_referrer）、用户组（company/store/user/supplier）、链条组（session_id/trace_id/page_event_seq/chain_id/chain_step/is_chain_start/is_chain_end）、单据组（order_type/order_fid/order_no/order_state/order_state_after/batch_count/order_fids/source_*）、结果组（action_result/fail_reason/validate_fail_fields/validate_fail_details）、接口组（api_url/api_code/api_msg/api_duration，trackAction 自动捕获；RN 端另带 api_start_time/api_end_time（ms 时间戳）与 api_trace_id（服务端响应头 traceid）；api_params/api_response 全环境截断附加）。

调用方只关心 `def + order + result + stateAfter + extra`。

## 防污染原则

- tracker 所有 public 方法整体 try/catch，埋点异常绝不影响业务
- 调用方禁止把埋点调用写进业务判定条件；禁止为埋点增删业务逻辑
