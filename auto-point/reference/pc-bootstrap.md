# PC 基建落位（SCM 样板全套，A 级专用）

本文件是「XLB PC 业务埋点」的**唯一标准形态**，内联自生产验证过的 SCM 产线（xlb_scm_web/src/tracking）全套源码。
原则：**照抄落位，不即兴设计**。字段口径与链路行为见 event-spec.md；页面调用模式见 pc-patterns.md。

## 适用范围（先判定再使用）

| 目标项目形态（02-survey 判定） | 使用方式 |
| --- | --- |
| **A 级：无 `src/tracking`** | 本文件全套落位（SDK 骨架 + business 层 + 入口接线） |
| **B/C 级：有 `src/tracking` 但偏离样板** | **禁用本文件**，走 subskills/03b-retrofit.md 预改造（差异项补齐，不整体覆盖） |
| **D 级：与样板一致** | 跳过本文件，直接用 pc-patterns.md 加 events/chains/页面接入 |

## 架构口径（拍板固化，不得偏离）

1. **业务事件统一经 `XlbTrackerAdapter` 走 `@xlb/xlb-tracker` 上报公司统一 BI（SLS）**；禁止自造 reporter/initTracker 通道。
2. **双发保持**：业务事件同时 fan-out 到 ARMSAdapter（ARMS RUM 侧保留自定义事件，作 RUM 上下文兜底）与 XlbTrackerAdapter（SLS 主通道）。不裁剪任一通道。
3. **ARMS 通道标准修正项**（样板遗留问题，落位时即修正，不照抄 SCM 的旧值）：ARMS config 的 `env` 用 XLB_DEPLOY_ENV 四态映射；`debug` 与打印插件跟随本地开发模式（`XLB_ENV === 'development'`），不跟 env；`sessionConfig.sampleRate` 为 **1**（0.2 是 ARMS 会话级采样，会让 80% 会话整体不上报，业务埋点场景必须调 1）。
4. `qingniao` 页面登记拉取显式关闭（`qingniao: false`），page_code/page_name 由 biz 自含。

## 前置检测（落位前逐项确认；检测不到的在入口提问阶段已收集）

| # | 检测项 | 检测方式 | 不满足的处置 |
| --- | --- | --- | --- |
| 1 | 私有源依赖可装：`@xlb/xlb-tracker`、`@xlb/utils`、`@arms/rum-browser` | `cat package.json` + `npm view @xlb/xlb-tracker version`（私有源） | 缺依赖先 `npm i`；装不上→报告用户 |
| 2 | 用户信息工具（`getUserInfo()`，返回 id/name/company_id/company_name/store_id/store_name/user_type/org_ids/supplier 等） | `grep -rn "getUserInfo" src/utils src/services` | 找不到→按入口收集的用户源路径改适配点 A |
| 3 | 微前端标识（wujie 判断函数） | `grep -rn "isWUJIE" src/` | 非 wujie 项目→适配点 B 返回 false |
| 4 | http 客户端为 XlbFetch（apiCapture 挂拦截器用） | `grep -rn "XlbFetch" src/services src/utils package.json` | axios 实例→apiCapture 改用 axios 版（见 pc-patterns.md 附录）；其他→人工指定拦截点 |
| 5 | ARMS key 环境变量名（如 `TRACKING_KEY` / `SCM_TRACKING_KEY`）与各 umirc 配置的 define 注入 | `grep -rn "TRACKING_KEY" .umirc*.ts` | 全配置补齐 define；缺失时入口兜底值必须保留（SCM 同款 `'37f23f543e4cb3b984ea1'` 仅为 SCM 值，新项目按产线实际 key 填） |
| 6 | `XLB_DEPLOY_ENV` 四态注入，按前端连接的后端环境标定（与 App `Config.ENV` 同口径）：本地 start 连测试后端=test、测试=test、staging=stage、生产=prod；仅连 dev 后端时才标 dev | `grep -n "XLB_DEPLOY_ENV" .umirc*.ts` | 逐配置补 define（映射见「入口接线」节）；缺了 env 标定全错 |
| 7 | 入口已收集：appId（SLS topic 登记值或占位）、appName、青鸟 event_id 登记情况 | 无（入口提问产物） | appId 未登记→占位 `xlb-<域>-web` 并在 verify-report 记人工依赖 |

## 文件树（落位产物）

```
src/tracking/
├── types.ts                  # SDK 统一类型（含 ARMSConfig.sessionConfig/filters 完整声明）
├── global.d.ts               # Window 全局类型扩展（__ARMS_* / $wujie）
├── index.ts                  # SDK 统一出口
├── lib/
│   ├── tracking.ts           # TrackingSDK 核心（fan-out 多适配器 + 插件管线）
│   ├── queue.ts              # 初始化前调用队列
│   ├── factory.ts            # initTracking/createTracking + 双适配器注册
│   ├── arms.ts               # ARMS RUM 适配器
│   └── xlbTrackerAdapter.ts  # 官方 @xlb/xlb-tracker 适配器（业务事件 → SLS 主通道）
├── plugins/
│   ├── ARMSInitPlugin.ts     # ARMS 实例初始化（main/sub/single 三形态）
│   ├── FilterPlugin.ts       # 敏感字段/URL 过滤
│   └── index.ts              # 插件出口 + PLUGIN_REGISTRY
├── utils/
│   └── index.ts              # createLogger / normalizePlugins / getAppName
└── business/
    ├── types.ts              # 业务埋点类型（TrackEventDef/ChainDef/OrderSnapshot...）
    ├── context.ts            # session/trace 生命周期 + chain_summary
    ├── tracker.ts            # bizTracker 门面（页面唯一入口）
    ├── apiCapture.ts         # XlbFetch 白名单接口自动捕获
    ├── reportPlugin.ts       # dev 控制台打印插件
    ├── index.ts              # business 统一出口 + registerXxxTracking
    ├── chains/<chain>.ts     # 链条定义（每需求新增）
    └── events/<page>.ts      # 事件字典（每需求新增）
src/utils/trackingTools.ts    # 入口接线（initTracking + installApiCapture + ARMS config）
```

## 适配点总表（落位时只改这些，其余逐字照抄）

| 适配点 | 位置 | 改动 |
| --- | --- | --- |
| A 用户信息源 | business/tracker.ts 顶部 import + buildProperties 用户组 | 按前置检测 2 的实际路径/字段名替换 `getUserInfo` |
| B 微前端标识 | business/tracker.ts 顶部 import `isWUJIE` | 非 wujie 项目改为 `() => false` |
| C http 客户端 | business/apiCapture.ts 顶部 import `XlbFetch` | axios 项目换拦截器实现（pc-patterns.md 附录） |
| D 应用标识 | lib/xlbTrackerAdapter.ts 顶部 `APP_ID` / `APP_NAME` 常量 | 入口收集值替换占位 |
| E ARMS key 变量名 | src/utils/trackingTools.ts `process.env.<KEY>` | 按前置检测 5 的实际变量名替换 |
| F umirc 四态注入 | 各 .umirc*.ts `define` | 补 `'process.env.XLB_DEPLOY_ENV'` |

---

## 一、src/tracking/types.ts（SDK 统一类型，逐字落位）

```typescript
/**
 * 统一类型定义
 */

/**
 * 应用类型
 */
export enum AppType {
  /** 主应用 */
  MAIN = 'main',
  /** 子应用 */
  SUB = 'sub',
  /** 单个应用 */
  SINGLE = 'single',
}

/**
 * 环境类型
 */
export type EnvType = 'dev' | 'daily' | 'pre' | 'production';

/**
 * 埋点事件类型
 */
export enum EventType {
  /** 页面浏览 */
  PAGE_VIEW = 'page_view',

  /** 页面离开 */
  PAGE_LEAVE = 'page_leave',

  /** 用户行为 */
  CLICK = 'click',

  // 组件渲染离开
  VIEW_HIDE = 'view_hide',

  // 组件渲染
  VIEW = 'view',
}

/**
 * 基础事件数据结构
 */
export interface BaseEvent {
  /** 事件类型 */
  type: EventType;
  /** 事件名称 */
  name: string;
  /** 事件分组 */
  group: string;
  /** 时间戳 */
  timestamp?: number;
  /** 自定义属性 */
  properties?: Record<string, any>;
  /** 用户信息 */
  user?: UserInfo;
  /** 应用信息 */
  app?: AppInfo;
}

/**
 * 用户信息
 */
export interface UserInfo {
  id?: string;
  name?: string;
  email?: string;
  company_id?: string;
  company_name?: string;
  [key: string]: any;
}

/**
 * 应用信息
 */
export interface AppInfo {
  /** 应用名称 */
  name: string;
  /** 应用版本 */
  version: string;
  /** 应用环境 */
  env: EnvType;
  /** 应用类型 */
  appType: AppType;
  /** 子应用ID（仅子应用） */
  subAppId?: string;
}

/**
 * 埋点平台适配器接口
 */
export interface TrackingAdapter {
  /** 适配器名称 */
  name: string;
  /** 初始化 */
  init: (config: any) => Promise<void>;
  /** 发送事件 */
  track: (event: BaseEvent) => void;
  /** 上报页面PV */
  reportPage: (pagePath: string, extraInfo?: any) => void;
  /** 设置用户信息 */
  setUser: (user: UserInfo) => void;
  /** 设置自定义属性 */
  setCustomProperties: (properties: Record<string, any>) => void;
}

/**
 * 插件接口
 */
export interface TrackingPlugin {
  /** 插件名称 */
  name: string;
  /** SDK 初始化前执行（异步） */
  beforeInit?: () => Promise<void>;
  /** 初始化插件 */
  init?: (sdk: any) => void;
  /** 事件前置处理 */
  beforeTrack?: (event: BaseEvent) => BaseEvent | null;
  /** 事件后置处理 */
  afterTrack?: (event: BaseEvent) => void;
}

/**
 * ARMS 配置
 */
export interface ARMSConfig {
  /** ARMS endpoint */
  endpoint: string;
  /** 环境 */
  env: EnvType;
  /** 版本号 */
  release?: string;
  /** SPA 模式 */
  spaMode?: 'history' | 'hash';
  /** 数据收集器配置 */
  collectors?: {
    perf?: boolean;
    webVitals?: boolean;
    api?: boolean;
    staticResource?: boolean;
    jsError?: boolean;
    consoleError?: boolean;
    action?: boolean;
  };
  /** 链路追踪 */
  tracing?: boolean;
  /** 会话采样配置 */
  sessionConfig?: {
    /** 会话采样率（0-1） */
    sampleRate?: number;
  };
  /** 上报过滤器（匹配项将被丢弃，支持字面量与正则表达式字符串） */
  filters?: {
    /** 异常过滤 */
    exception?: string[];
    /** 资源过滤 */
    resource?: string[];
  };
}

/**
 * 子应用控制配置
 */
export interface SubAppControl {
  /** 子应用ID */
  subAppId: string;
  /** 是否启用 */
  enabled: boolean;
  /** 采样率 (0-1) */
  sampleRate?: number;
  /** 事件类型过滤 */
  eventTypes?: EventType[];
}

/**
 * SDK配置
 */
export interface TrackingConfig {
  /** 应用信息 */
  app: AppInfo;
  /** ARMS 配置 */
  arms?: ARMSConfig;
  /** 适配器列表 */
  adapters?: TrackingAdapter[];
  /** 插件列表 */
  plugins?: TrackingPlugin[];
  /** 是否启用 */
  enabled?: boolean;
  /** 是否启用调试 */
  debug?: boolean;
  /** 采样率 (0-1) */
  sampleRate?: number;
  /** 子应用控制配置 */
  subApps?: SubAppControl[];
}

/**
 * 配置文件格式（用于主应用的JSON配置）
 */
export interface TrackingConfigFile {
  /** 主应用配置 */
  main: {
    enabled: boolean;
    debug?: boolean;
    sampleRate?: number;
    arms?: ARMSConfig;
  };
  /** 子应用控制配置 */
  subApps: Record<string, SubAppControl>;
}

/**
 * 创建追踪实例的便捷方法配置
 */
export interface CreateTrackingOptions {
  app: AppInfo;
  arms: ARMSConfig;
  enabled?: boolean;
  debug?: boolean;
  sampleRate?: number;
  plugins?: any[];
  subApps?: SubAppControl[];
}

/**
 * 初始化追踪配置选项
 */
export interface InitTrackingOptions {
  /** 应用名称 */
  appName?: string;
  /** 应用版本 */
  appVersion?: string;
  /** 环境类型 */
  env: EnvType;
  /** 应用类型 */
  appType: AppType;
  /** 是否启用 */
  enabled?: boolean;
  /** 是否启用调试 */
  debug?: boolean;
  /** 采样率 (0-1) */
  sampleRate?: number;
  /** 用户信息（可选，如果不提供则不会自动设置用户信息） */
  userInfo?: {
    id?: string;
    name?: string;
    company_id?: string;
    company_name?: string;
    account?: string;
    user_id?: string;
    store_id?: string | number;
    store_name?: string;
    user_type?: string;
  };
  /** 插件列表（可选，默认包含 ARMSInitPlugin） */
  plugins?: any[];
  /** ARMS 初始化插件配置（可选） */
  armsInitConfig?: {
    debug?: boolean;
    timeout?: number;
    autoRegister?: boolean;
  };
  /** ARMS 配置（用于 single 类型） */
  config?: ARMSConfig;
  /** 子应用控制配置 */
  subApps?: SubAppControl[];
}
```

## 二、src/tracking/global.d.ts（Window 扩展，逐字落位）

```typescript
/**
 * 全局类型声明
 * 统一管理 tracking 相关的全局 Window 类型扩展
 */

declare global {
  interface Window {
    /** ARMS 配置 */
    __ARMS_CONFIG__?: any;
    /** ARMS 实例（单例） */
    __ARMS_INSTANCE__?: any;
    /** ARMS 实例集合（多实例） */
    __ARMS_INSTANCES__?: Record<string, any>;
    /** ARMS SDK 工厂函数 */
    __ARMS_SDK_FACTORY__?: (() => any) | null;
    /** ARMS OSS 配置对象 */
    _arms?: {
      /** 获取指定应用的 ARMS 实例 */
      getInstance: (appName?: string) => any;
      /** 获取所有 ARMS 实例 */
      getAllInstances: () => Record<string, any>;
      /** 获取当前应用名称 */
      getCurrentAppName: () => string;
    };
    /** ARMS 页面追踪器实例 */
    __armsPageTracker?: {
      /** 追踪主应用页面 */
      trackMasterPage: (path: string, title?: string) => void;
      /** 追踪 Wujie 子应用页面 */
      trackWujiePage: (appName: string, appRoute: string, masterRoute?: string) => void;
      /** 从 Wujie 路由 ID 解析页面信息 */
      trackWujieFromId: (id: string, appName: string, masterPath: string) => void;
      /** 追踪子应用路由变化 */
      onSubAppRouteChange: (appName: string, route: string) => void;
      /** 重置当前页面 */
      reset: () => void;
    };
    /** Wujie 微前端相关 */
    $wujie?: {
      props?: {
        parentWindow?: Window & {
          __ARMS_CONFIG__?: any;
        };
      };
    };
  }
}

export {};
```

## 三、src/tracking/index.ts（SDK 出口，逐字落位）

```typescript
// 导出类型定义
export * from './types';

// 导出核心库
export * from './lib/tracking';
export * from './lib/arms';

// 导出工厂方法和工具
export * from './lib/factory';

// 导出插件
export * from './plugins';
```

## 四、src/tracking/lib/tracking.ts（SDK 核心，逐字落位）

```typescript
/**
 * XLB 统一埋点 SDK
 */
import type {
  BaseEvent,
  SubAppControl,
  TrackingAdapter,
  TrackingConfig,
  TrackingPlugin,
  UserInfo,
} from '../types';
import { AppType, EventType } from '../types';
import { createLogger, type Logger } from '../utils';

/**
 * 统一埋点SDK
 */
export class TrackingSDK {
  private config: TrackingConfig;
  private adapters: TrackingAdapter[] = [];
  private plugins: TrackingPlugin[] = [];
  private globalProperties: Record<string, any> = {};
  private userInfo?: UserInfo;
  private initPromise?: Promise<void>;
  private logger: Logger;
  group: string = 'custom';

  constructor(config: TrackingConfig) {
    this.config = {
      enabled: true,
      debug: false,
      sampleRate: 1, // 默认 100% 采样
      subApps: [],
      ...config,
    };

    this.logger = createLogger('XlbTracking', this.config.debug ?? false);
  }

  /**
   * 初始化 SDK
   */
  async init(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this._init();
    return this.initPromise;
  }

  private async _init(): Promise<void> {
    if (!this.config.enabled) {
      this.logger.log('SDK 已禁用');
      return;
    }

    this.logger.log('开始初始化 SDK...');

    // 初始化适配器
    if (this.config.adapters && this.config.adapters.length > 0) {
      this.adapters = this.config.adapters;
      for (const adapter of this.adapters) {
        try {
          await adapter.init(this.config);
          this.logger.log(`适配器 ${adapter.name} 初始化成功`);
        } catch (error) {
          this.logger.error(`适配器 ${adapter.name} 初始化失败:`, error);
        }
      }
    }

    // 注册插件
    if (this.config.plugins) {
      this.plugins = this.config.plugins;
      this.plugins.forEach((plugin) => {
        if (plugin.init) {
          plugin.init(this);
        }
      });
      this.logger.log(`已注册 ${this.plugins.length} 个插件`);
    }

    // 设置全局应用信息
    this.setGlobalProperties({
      appName: this.config.app.name,
      appVersion: this.config.app.version,
      appEnv: this.config.app.env,
      appType: this.config.app.appType,
      subAppId: this.config.app.subAppId,
    });

    this.logger.log('SDK 初始化完成');
  }

  /**
   * 发送事件
   */
  track(event: Omit<BaseEvent, 'timestamp' | 'app' | 'user'>): void {
    this.logger.log('track===', event);

    if (!this.config.enabled) {
      return;
    }

    // 子应用控制检查
    if (
      this.config.app.appType === AppType.SUB &&
      !this.isSubAppAllowed(event)
    ) {
      this.logger.log(`子应用 ${this.config.app.subAppId} 的事件被禁用`);
      return;
    }

    // 采样判断
    if (!this.shouldSample()) {
      return;
    }

    // 补充完整信息
    let fullEvent: BaseEvent = {
      ...event,
      timestamp: Date.now(),
      app: this.config.app,
      user: this.userInfo,
      properties: {
        ...this.globalProperties,
        ...event.properties,
      },
    };

    // 执行插件前置处理
    for (const plugin of this.plugins) {
      if (plugin.beforeTrack) {
        const result = plugin.beforeTrack(fullEvent);
        if (result === null) {
          this.logger.log(`事件被插件 ${plugin.name} 拦截`);
          return;
        }
        fullEvent = result;
      }
    }

    this.logger.log('上报事件:', fullEvent);

    // 发送到各个适配器
    this.adapters.forEach((adapter) => {
      try {
        adapter.track(fullEvent);
      } catch (error) {
        this.logger.error(`适配器 ${adapter.name} 上报失败:`, error);
      }
    });

    // 执行插件后置处理
    this.plugins.forEach((plugin) => {
      if (plugin.afterTrack) {
        try {
          plugin.afterTrack(fullEvent);
        } catch (error) {
          this.logger.error(`插件 ${plugin.name} 后置处理失败:`, error);
        }
      }
    });
  }

  pageView(eventName: string, properties?: Record<string, any>): void {
    this.group = eventName;
    this.track({
      type: EventType.PAGE_VIEW,
      name: eventName,
      group: this.group,
      properties,
    });
  }

  pageLeave(eventName: string, properties?: Record<string, any>): void {
    this.track({
      type: EventType.PAGE_LEAVE,
      name: eventName,
      group: this.group,
      properties,
    });

    // 离开了 清理掉
    if (this.group === eventName) {
      this.group = 'custom';
    }
  }

  click(eventName: string, properties?: Record<string, any>): void {
    this.track({
      type: EventType.CLICK,
      name: eventName,
      properties,
      group: this.group,
    });
  }

  view(eventName: string, properties?: Record<string, any>): void {
    this.track({
      type: EventType.PAGE_VIEW,
      name: eventName,
      group: this.group,
      properties,
    });
  }

  viewHide(eventName: string, properties?: Record<string, any>): void {
    this.track({
      type: EventType.VIEW_HIDE,
      name: eventName,
      group: this.group,
      properties,
    });
  }

  /**
   * 上报页面 PV
   */
  reportPage(pagePath: string, extraInfo?: any): void {
    if (!this.config.enabled) return;

    // 子应用控制检查
    if (
      this.config.app.appType === AppType.SUB &&
      !this.isSubAppAllowed({ type: EventType.PAGE_VIEW, name: 'PageView' })
    ) {
      this.logger.log(`子应用 ${this.config.app.subAppId} 的页面上报被禁用`);
      return;
    }

    this.logger.log('上报页面:', pagePath, extraInfo);

    this.adapters.forEach((adapter) => {
      try {
        adapter.reportPage(pagePath, {
          ...this.globalProperties,
          ...extraInfo,
        });
      } catch (error) {
        this.logger.error(`适配器 ${adapter.name} 页面上报失败:`, error);
      }
    });
  }

  /**
   * 设置用户信息
   */
  setUser(user: UserInfo): void {
    this.userInfo = user;
    this.adapters.forEach((adapter) => {
      try {
        adapter.setUser(user);
      } catch (error) {
        this.logger.error(`适配器 ${adapter.name} 设置用户失败:`, error);
      }
    });
    this.logger.log('设置用户信息:', user);
  }

  /**
   * 设置全局属性
   */
  setGlobalProperties(properties: Record<string, any>): void {
    this.globalProperties = {
      ...this.globalProperties,
      ...properties,
    };

    this.adapters.forEach((adapter) => {
      try {
        adapter.setCustomProperties(properties);
      } catch (error) {
        this.logger.error(`适配器 ${adapter.name} 设置属性失败:`, error);
      }
    });

    this.logger.log('设置全局属性:', properties);
  }

  /**
   * 更新子应用控制配置
   */
  updateSubAppControl(subApps: SubAppControl[]): void {
    this.config.subApps = subApps;
    this.logger.log('更新子应用控制配置:', subApps);
  }

  /**
   * 采样判断
   * @returns true 表示应该采样，false 表示不采样
   */
  private shouldSample(): boolean {
    const sampleRate = this.config.sampleRate || 1;
    return Math.random() < sampleRate;
  }

  /**
   * 检查子应用是否允许上报
   */
  private isSubAppAllowed(event: Partial<BaseEvent>): boolean {
    if (this.config.app.appType !== AppType.SUB) {
      return true;
    }

    const subAppId = this.config.app.subAppId;
    if (!subAppId) {
      return true;
    }

    const subAppConfig = this.config.subApps?.find(
      (config) => config.subAppId === subAppId,
    );

    if (!subAppConfig) {
      // 如果没有配置，默认允许
      return true;
    }

    // 检查是否启用
    if (!subAppConfig.enabled) {
      return false;
    }

    // 检查事件类型过滤
    if (subAppConfig.eventTypes && event.type) {
      if (!subAppConfig.eventTypes.includes(event.type)) {
        return false;
      }
    }

    // 检查采样率
    if (subAppConfig.sampleRate !== undefined) {
      return Math.random() < subAppConfig.sampleRate;
    }

    return true;
  }

  /**
   * 获取配置
   */
  getConfig(): TrackingConfig {
    return this.config;
  }

  /**
   * 获取适配器
   */
  getAdapter(name: string): TrackingAdapter | undefined {
    return this.adapters.find((adapter) => adapter.name === name);
  }
}
```

## 五、src/tracking/lib/queue.ts（初始化前队列，逐字落位）

```typescript
/**
 * 埋点队列 - 用于在 SDK 初始化前收集埋点调用
 */
import type { BaseEvent, UserInfo } from '../types';
import { createLogger, type Logger } from '../utils';
import type { TrackingSDK } from './tracking';

/**
 * 队列中的事件项
 */
interface QueuedEvent {
  method: string;
  args: any[];
  timestamp: number;
}

/**
 * 埋点队列代理类
 * 在 SDK 初始化前收集所有调用，初始化完成后统一上报
 */
export class TrackingQueue implements Partial<TrackingSDK> {
  private queue: QueuedEvent[] = [];
  private maxQueueSize: number = 20; // 最大队列长度
  private realSDK: TrackingSDK | null = null;
  private isReady: boolean = false;
  private logger: Logger;

  constructor() {
    this.logger = createLogger('TrackingQueue', false);
  }

  /**
   * 设置真实的 SDK 实例
   */
  setRealSDK(sdk: TrackingSDK): void {
    this.realSDK = sdk;
    this.isReady = true;

    const sdkDebug = sdk.getConfig()?.debug ?? false;
    this.logger = createLogger('TrackingQueue', sdkDebug);

    if (this.queue.length > 0) {
      this.logger.log(`开始上报 ${this.queue.length} 个缓存事件`);
      this.flushQueue();
    }
  }

  /**
   * 清空队列并上报所有事件
   */
  private flushQueue(): void {
    if (!this.realSDK || this.queue.length === 0) {
      return;
    }

    // 按时间顺序上报队列中的事件
    const events = [...this.queue];
    this.queue = [];

    events.forEach((queuedEvent) => {
      try {
        const method = (this.realSDK as any)[queuedEvent.method];
        if (typeof method === 'function') {
          method.apply(this.realSDK, queuedEvent.args);
        }
      } catch (error) {
        this.logger.error(`上报队列事件失败:`, error);
      }
    });
  }

  /**
   * 添加事件到队列
   */
  private enqueue(method: string, args: any[]): void {
    // 如果 SDK 已就绪，直接调用
    if (this.isReady && this.realSDK) {
      const methodFn = (this.realSDK as any)[method];
      if (typeof methodFn === 'function') {
        methodFn.apply(this.realSDK, args);
      }
      return;
    }

    // 队列大小限制
    if (this.queue.length >= this.maxQueueSize) {
      this.logger.warn('队列已满，丢弃最早的事件');
      this.queue.shift();
    }

    // 添加到队列
    this.queue.push({
      method,
      args,
      timestamp: Date.now(),
    });
  }

  // 实现 TrackingSDK 的主要方法
  track(event: Omit<BaseEvent, 'timestamp' | 'app' | 'user'>): void {
    this.enqueue('track', [event]);
  }

  pageView(eventName: string, properties?: Record<string, any>): void {
    this.enqueue('pageView', [eventName, properties]);
  }

  pageLeave(eventName: string, properties?: Record<string, any>): void {
    this.enqueue('pageLeave', [eventName, properties]);
  }

  click(eventName: string, properties?: Record<string, any>): void {
    this.enqueue('click', [eventName, properties]);
  }

  view(eventName: string, properties?: Record<string, any>): void {
    this.enqueue('view', [eventName, properties]);
  }

  viewHide(eventName: string, properties?: Record<string, any>): void {
    this.enqueue('viewHide', [eventName, properties]);
  }

  reportPage(pagePath: string, extraInfo?: any): void {
    this.enqueue('reportPage', [pagePath, extraInfo]);
  }

  setUser(user: UserInfo): void {
    this.enqueue('setUser', [user]);
  }

  setGlobalProperties(properties: Record<string, any>): void {
    this.enqueue('setGlobalProperties', [properties]);
  }

  updateSubAppControl(subApps: any[]): void {
    this.enqueue('updateSubAppControl', [subApps]);
  }

  getConfig(): any {
    if (this.isReady && this.realSDK) {
      return this.realSDK.getConfig();
    }
    return null;
  }

  getAdapter(name: string): any {
    if (this.isReady && this.realSDK) {
      return this.realSDK.getAdapter(name);
    }
    return undefined;
  }
}
```

## 六、src/tracking/lib/arms.ts（ARMS 适配器，逐字落位）

```typescript
/**
 * 阿里云 ARMS 适配器
 */
import type {
  TrackingAdapter,
  BaseEvent,
  UserInfo,
  ARMSConfig,
} from '../types';
import { createLogger, type Logger } from '../utils';

/**
 * ARMS 适配器
 * 使用全局已初始化的实例
 */
export class ARMSAdapter implements TrackingAdapter {
  name = 'ARMS';
  private appName?: string;
  private armsInstance: any = null;
  private debug: boolean = false;
  private logger!: Logger;

  /**
   * 初始化适配器
   * @param config 配置
   */
  async init(config: ARMSConfig | { appName?: string; debug?: boolean } | any): Promise<void> {
    // 从配置中获取应用名称和调试模式
    this.appName = (config as any).appName;
    this.debug = (config as any).debug ?? false;

    // 创建日志管理器
    this.logger = createLogger('ARMSAdapter', this.debug);

    // 等待 ARMS 实例就绪
    await this.waitForARMSInstance();

    this.logger.log(`适配器初始化成功，使用应用: ${this.appName || '当前应用'}`);
  }

  /**
   * 等待 ARMS 实例初始化完成
   */
  private async waitForARMSInstance(timeout = 10000): Promise<void> {
    const startTime = Date.now();
    const checkInterval = 100;

    return new Promise((resolve, reject) => {
      const check = () => {
        // 获取 ARMS 实例
        this.armsInstance = this.getARMSInstance();

        if (this.armsInstance) {
          resolve();
          return;
        }

        if (Date.now() - startTime >= timeout) {
          reject(new Error('[ARMSAdapter] 等待 ARMS 实例超时'));
          return;
        }

        setTimeout(check, checkInterval);
      };

      check();
    });
  }

  /**
   * 获取 ARMS 实例
   */
  private getARMSInstance(): any {
    return window.__ARMS_INSTANCE__;
  }

  /**
   * 确保实例可用
   */
  private ensureInstance(): boolean {
    if (!this.armsInstance) {
      this.armsInstance = this.getARMSInstance();
    }
    return !!this.armsInstance;
  }

  /**
   * 发送事件
   */
  track(event: BaseEvent): void {
    if (!this.ensureInstance()) {
      this.logger.warn('ARMS 实例不可用，事件将被忽略');
      return;
    }

    try {
      // ARMS 自定义事件上报
      const customEvent: any = {
        event_type: 'custom',
        type: event.type || 'custom',
        name: event.name,
        group: event.group || 'custom', // 事件分组
        value: 1,
        timestamp: event.timestamp || Date.now(),
        properties: event.properties || {},
      };

      this.armsInstance.sendEvent(customEvent);

      this.logger.log('事件上报成功:', event.name, '分组:', customEvent.group);
    } catch (error) {
      this.logger.error('事件上报失败:', error);
    }
  }

  /**
   * 上报页面 PV
   */
  async reportPage(pagePath: string, extraInfo?: any): Promise<void> {
    if (!this.ensureInstance()) {
      this.logger.warn('ARMS 实例不可用，页面上报将被忽略');
      return;
    }

    try {
      // 获取 PV 收集器
      const pvCollector = this.armsInstance.getCollector('pv-collector');

      if (!pvCollector || typeof pvCollector.sendPv !== 'function') {
        this.logger.error('PV 收集器未找到或不可用');
        return;
      }

      // 构造包含自定义页面路径的 URL
      const baseUrl = window.location.origin;
      const customUrl = `${baseUrl}${pagePath}`;
      const currentReferrer = document.referrer || '';

      // 使用 sendPv 方法上报
      pvCollector.sendPv(customUrl, currentReferrer, 'navigate');

      this.logger.log('页面上报成功:', {
        pagePath,
        customUrl,
        referrer: currentReferrer,
        extraInfo,
      });
    } catch (error) {
      this.logger.error('页面上报失败:', error);
    }
  }

  /**
   * 设置用户信息
   */
  setUser(user: UserInfo): void {
    if (!this.ensureInstance()) {
      this.logger.warn('ARMS 实例不可用，用户信息设置将被忽略');
      return;
    }

    try {
      this.armsInstance.setConfig({
        uid: user.id || user.company_id
          ? `${user.company_id || 'unknown'}_${user.id || 'unknown'}`
          : undefined,
        username: user.name
          ? `${user.company_name || ''}-${user.name}`.trim()
          : undefined,
        tag: user.company_name || undefined,
      });

      this.logger.log('用户信息设置成功');
    } catch (error) {
      this.logger.error('用户信息设置失败:', error);
    }
  }

  /**
   * 设置自定义属性
   */
  setCustomProperties(properties: Record<string, any>): void {
    if (!this.ensureInstance()) {
      this.logger.warn('ARMS 实例不可用，自定义属性设置将被忽略');
      return;
    }

    try {
      this.armsInstance.setConfig({
        tag: properties,
      });

      this.logger.log('自定义属性设置成功');
    } catch (error) {
      this.logger.error('自定义属性设置失败:', error);
    }
  }

  /**
   * 获取 ARMS SDK 实例
   */
  getSDK() {
    return this.armsInstance;
  }
}
```

## 七、src/tracking/lib/factory.ts（工厂 + 双适配器注册，逐字落位）

```typescript
/**
 * SDK 工厂方法
 */
import { ARMSInitPlugin } from '../plugins';
import type {
  CreateTrackingOptions,
  InitTrackingOptions,
  TrackingConfig,
  TrackingPlugin,
} from '../types';
import { createLogger, getAppName, normalizePlugins } from '../utils';
import { ARMSAdapter } from './arms';
import { TrackingQueue } from './queue';
import { TrackingSDK } from './tracking';
import { XlbTrackerAdapter } from './xlbTrackerAdapter';

/**
 * 全局单例访问
 * 在 SDK 初始化前使用队列收集调用
 */
let globalTracking: TrackingSDK | TrackingQueue | null = null;
let trackingQueue: TrackingQueue | null = null;

/**
 * 初始化队列
 */
function initTrackingQueue(): void {
  if (!trackingQueue && typeof window !== 'undefined') {
    trackingQueue = new TrackingQueue();
    globalTracking = trackingQueue;
  }
}

// 模块加载时立即初始化队列
initTrackingQueue();

/**
 * 设置全局追踪实例
 */
export function setGlobalTracking(tracking: TrackingSDK): void {
  if (trackingQueue) {
    trackingQueue.setRealSDK(tracking);
    globalTracking = tracking;
    trackingQueue = null; // 清空队列引用
  } else {
    globalTracking = tracking;
  }
}

/**
 * 获取全局追踪实例
 * 返回类型兼容 TrackingSDK 的所有方法
 */
export function getGlobalTracking(): TrackingSDK | TrackingQueue | null {
  if (!globalTracking && typeof window !== 'undefined') {
    initTrackingQueue();
  }
  return globalTracking;
}

/**
 * 构建用户信息
 */
function buildUserInfo(userInfo?: InitTrackingOptions['userInfo']): {
  id: string;
  name: string;
  company_id?: string;
  company_name?: string;
  account?: string;
  store_id?: string | number;
  store_name?: string;
  user_type?: string;
} | null {
  if (
    !userInfo ||
    !(
      (userInfo.company_name || userInfo.name) &&
      (userInfo.account || userInfo.id)
    )
  ) {
    return null;
  }

  // account/store_id/store_name/user_type 供 XlbTrackerAdapter 映射官方协议 TrackUser
  return {
    id: userInfo.id || '',
    name: userInfo.name || userInfo.account || '',
    account: userInfo.account,
    company_id: userInfo.company_id,
    company_name: userInfo.company_name,
    store_id: userInfo.store_id,
    store_name: userInfo.store_name,
    user_type: userInfo.user_type,
  };
}

/**
 * 创建追踪 SDK 实例
 * @param options 配置
 * @returns 初始化后的 TrackingSDK 实例
 * @throws 报错信息
 */
export async function createTracking(
  options: CreateTrackingOptions,
): Promise<TrackingSDK> {
  // 创建日志管理器
  const logger = createLogger('Tracking', options.debug ?? false);

  // 参数验证
  if (!options || !options.app) {
    throw new Error('[Tracking] createTracking 需要提供 app 配置');
  }

  // 插件列表
  const normalizedPlugins = normalizePlugins(
    options.plugins || [],
    options.debug ?? false,
  );

  // 执行插件的 beforeInit
  for (const plugin of normalizedPlugins) {
    if (plugin.beforeInit && typeof plugin.beforeInit === 'function') {
      try {
        await plugin.beforeInit();
      } catch (error) {
        logger.error(`插件 ${plugin.name} 的 beforeInit 执行失败:`, error);
      }
    }
  }

  const armsAdapter = new ARMSAdapter();
  // 官方埋点 SDK 适配器：业务事件经协议映射后上报 SLS（公司统一 BI）
  const xlbTrackerAdapter = new XlbTrackerAdapter();

  const config: TrackingConfig = {
    app: options.app,
    arms: options.arms,
    adapters: [armsAdapter, xlbTrackerAdapter],
    plugins: normalizedPlugins,
    enabled: options.enabled ?? true,
    debug: options.debug ?? false,
    sampleRate: Math.max(0, Math.min(1, options.sampleRate ?? 1)), // 确保采样率在 0-1 之间
    subApps: options.subApps || [],
  };

  // 初始化 ARMS 适配器
  try {
    await armsAdapter.init({
      ...options.arms,
      debug: options.debug ?? false,
    });
  } catch (error) {
    logger.warn('ARMS 适配器初始化失败:', error);
  }

  // 实例化 TrackingSDK
  const sdk = new TrackingSDK(config);
  await sdk.init();

  return sdk;
}

/**
 * 初始化 SDK
 */
export async function initTracking(
  options: InitTrackingOptions,
): Promise<TrackingSDK | null> {
  if (!options) {
    throw new Error('[Tracking] initTracking 需要提供配置选项');
  }

  const {
    appName,
    appVersion = '1.0.0',
    env,
    appType,
    enabled = true,
    debug = false,
    sampleRate = 1,
    userInfo,
    plugins: customPlugins,
    armsInitConfig = {},
    config,
    subApps = [],
  } = options;

  const logger = createLogger('Tracking', debug);
  const finalAppName = getAppName(appName);

  if (!finalAppName || !appType) {
    throw new Error('[Tracking] initTracking 需要提供 appName 和 appType');
  }

  try {
    // 构建插件列表
    const armsInitPlugin = new ARMSInitPlugin({
      debug,
      timeout: 5000,
      autoRegister: true,
      appType,
      config,
      ...armsInitConfig,
    });

    const normalizedCustomPlugins = normalizePlugins(
      customPlugins || [],
      debug,
    );
    const plugins: TrackingPlugin[] = [
      armsInitPlugin,
      ...normalizedCustomPlugins,
    ];

    // 创建统一埋点实例
    const tracking = await createTracking({
      app: {
        name: finalAppName,
        version: appVersion,
        env,
        appType,
      },
      arms: {} as any,
      enabled,
      debug,
      sampleRate,
      plugins,
      subApps,
    });

    setGlobalTracking(tracking);

    // 配置用户信息
    const user = buildUserInfo(userInfo);
    if (user) {
      tracking.setUser(user);
    }

    logger.log('统一埋点 SDK 初始化完成');
    return tracking;
  } catch (error) {
    logger.error('统一埋点 SDK 初始化失败:', error);
    return null;
  }
}
```

## 八、src/tracking/lib/xlbTrackerAdapter.ts（官方 SDK 适配器，SLS 主通道）

落位时只改【适配点 D】两个常量，其余逐字照抄。

```typescript
/**
 * 官方埋点 SDK（@xlb/xlb-tracker）适配器
 * 职责：自研 BaseEvent → 官方协议 TrackEvent 映射，业务事件上报 SLS（公司统一 BI）
 * 手册：《WEB端埋点SDK接入手册》v1.0.9
 *
 * 1.0.9 实证要点（dist 源码核对）：
 * - sendCustom/sendPage 的 name 参数不进事件体（sendProtocolEvent 丢弃），事件标识
 *   只能走 event_id（优先级：业务自定义 > 协议默认 > 自动生成）
 *   → 本适配器统一用 send/sendCritical 显式传 event_id，不使用 sendCustom/sendPage
 * - sendAction 默认 event_type=CUSTOM，点击必须显式 'CLICK'
 * - TrackPage 仅四元组 {id,name,url,host}（协议注释明确勿塞 pageUrl），route_url 放 biz
 * - 协议顶层 trace_id/session_id 由 SDK 会话上下文自管理，自研链路字段一律放 biz，
 *   避免与官方口径冲突（链B 分析从 biz.trace_id 取）
 */
import {
  initTracker,
  type BrowserTracker,
  type TrackEvent,
} from '@xlb/xlb-tracker';
import type { BaseEvent, TrackingAdapter, UserInfo } from '../types';
import { EventType } from '../types';
import { createLogger, type Logger } from '../utils';

// 【适配点 D】应用标识：入口收集的 appId（SLS topic 登记值）与 appName。
// appId 未登记时先落占位值（xlb-<域>-web），并在 verify-report 记人工依赖待办。
const APP_ID = '<入口收集的 appId>';
const APP_NAME = '<入口收集的 appName>';
/** 业务域标识：进 biz.biz_product 归桶字段，按产线域名小写填（如 scm/fsms） */
const BIZ_PRODUCT = '<产线域名>';

/** 官方协议 env 枚举：dev | test | stage | prod */
type TrackEnv = 'dev' | 'test' | 'stage' | 'prod';

const TRACK_ENVS: readonly TrackEnv[] = ['dev', 'test', 'stage', 'prod'];

/**
 * 部署环境 → 上报 env（官方协议四态）。
 * XLB_DEPLOY_ENV 由各 .umirc.* 配置按部署目标显式 define 注入：
 * 本地 .umirc.dev.ts=test（本地连测试后端，按后端环境标定，与 App 同单据对齐）；
 * build:dev（测试环境）=test；
 * build:staging=stage；build（生产）=prod。
 * 缺省/非法值回退旧 XLB_ENV 两态判定——仅作兼容兜底（新构建配置漏注入时行为与历史一致）；
 * 各环境正确标定依赖 XLB_DEPLOY_ENV 注入，新增构建配置时勿漏。
 */
const resolveEnv = (): TrackEnv => {
  const deployEnv = process.env.XLB_DEPLOY_ENV;
  if (TRACK_ENVS.includes(deployEnv as TrackEnv)) return deployEnv as TrackEnv;
  return process.env.XLB_ENV === 'development' ? 'dev' : 'prod';
};

export class XlbTrackerAdapter implements TrackingAdapter {
  name = 'XlbTracker';
  private client: BrowserTracker | null = null;
  private logger!: Logger;

  async init(config?: any): Promise<void> {
    this.logger = createLogger('XlbTrackerAdapter', config?.debug ?? false);
    // 幂等：TrackingSDK._init 与 createTracking 会各调一次 adapter.init
    if (this.client) return;
    try {
      this.client = initTracker({
        enable: true,
        app: {
          id: APP_ID,
          name: APP_NAME,
          type: 'xlb',
          env: resolveEnv(),
        },
        // 页面未在青鸟登记，biz 自含 page_code/page_name，显式关闭页面登记拉取
        qingniao: false,
        // collectors 缺省全关：性能/异常等自动采集由 ARMS 通道负责，避免重复采集
      });
      this.logger.log('官方埋点 SDK 初始化完成, env:', resolveEnv());
    } catch (error) {
      this.client = null;
      this.logger.error('官方埋点 SDK 初始化失败:', error);
    }
  }

  /**
   * 自研事件 → 官方协议事件映射
   * biz 全量平铺自研字段（event_ver/trace_id/chain_step/order 组/source 组/api 组 等），
   * 链B 分析字段不丢；另补 BI 惯例归桶字段（biz_product/biz_module/biz_scene/biz_action）
   * 与 action_name（对齐 xlb_bi 示例口径）
   */
  private buildProtocolEvent(event: BaseEvent): TrackEvent {
    const p = event.properties || {};
    return {
      // event_id 优先级：青鸟登记标识 > 自研 event_code（对齐 xlb_bi 示例口径，
      // 使 BI 侧按青鸟事件管理筛选可直接命中；未登记事件保持原口径）
      event_id: p.qingniao_id ?? p.event_code ?? event.name,
      page: {
        name: p.page_name ?? event.name,
        url: location.href,
        host: location.host,
      },
      biz: {
        biz_product: BIZ_PRODUCT,
        biz_module: p.page_code ?? event.group,
        biz_scene: p.chain_step,
        biz_action: p.event_code,
        action_name: p.event_code,
        event_name: event.name,
        ...p,
      },
    };
  }

  track(event: BaseEvent): void {
    if (!this.client) return;
    try {
      const protocolEvent = this.buildProtocolEvent(event);
      switch (event.type) {
        case EventType.CLICK:
          this.client.send({ ...protocolEvent, event_type: 'CLICK' });
          break;
        case EventType.PAGE_VIEW:
          this.client.send({ ...protocolEvent, event_type: 'PAGE_VIEW' });
          break;
        case EventType.PAGE_LEAVE:
          this.client.send({ ...protocolEvent, event_type: 'PAGE_LEAVE' });
          break;
        default:
          // VIEW / 其余 → CUSTOM；
          // chain_summary 走 sendCritical（immediate，对应原「立即 flush + sendBeacon」兜底语义）
          if (event.properties?.event_code === 'chain_summary') {
            this.client.sendCritical({
              ...protocolEvent,
              event_type: 'CUSTOM',
            });
          } else {
            this.client.send({ ...protocolEvent, event_type: 'CUSTOM' });
          }
      }
    } catch (error) {
      this.logger.error('事件映射上报失败:', error);
    }
  }

  /** 页面 PV（TrackingSDK.reportPage 调用链保底转发；当前业务方均走 track() PAGE_VIEW） */
  reportPage(pagePath: string, extraInfo?: any): void {
    if (!this.client) return;
    try {
      this.client.send({
        event_type: 'PAGE_VIEW',
        page: { name: pagePath, url: location.href, host: location.host },
        biz: { biz_product: BIZ_PRODUCT, ...extraInfo },
      });
    } catch (error) {
      this.logger.error('页面上报失败:', error);
    }
  }

  setUser(user: UserInfo): void {
    if (!this.client) return;
    try {
      this.client.setUser({
        user_id: user.id ? String(user.id) : undefined,
        account: user.account,
        name: user.name,
        company_id: user.company_id ? String(user.company_id) : undefined,
        store_id: user.store_id ? String(user.store_id) : undefined,
        store_name: user.store_name,
        user_type: user.user_type,
        // TrackUser 协议电话槽位为 tel/mobile；登录返回字段名未文档化，兼容取值
        tel: user.mobile || user.phone || user.tel,
        mobile: user.mobile,
      });
    } catch (error) {
      this.logger.error('用户信息设置失败:', error);
    }
  }

  /** 全局属性无官方协议对应物，忽略（globalProperties 已由 track() 随事件平铺进 biz） */
  setCustomProperties(): void {}
}
```

## 九、src/tracking/plugins/ARMSInitPlugin.ts（逐字落位）

```typescript
/**
 * ARMS 初始化插件
 */
import type { TrackingPlugin, AppType, ARMSConfig } from '../types';
import { createLogger, getAppName, type Logger } from '../utils';

export interface ARMSInitPluginConfig {
  /** 是否启用调试日志 */
  debug?: boolean;
  /** 等待 ARMS 初始化的超时时间（毫秒） */
  timeout?: number;
  /** 是否自动注册 ARMS SDK */
  autoRegister?: boolean;
  /** 应用类型 */
  appType?: AppType;
  /** ARMS 配置（用于 single 类型） */
  config?: ARMSConfig;
}

/**
 * ARMS 初始化插件
 */
export class ARMSInitPlugin implements TrackingPlugin {
  name = 'ARMSInitPlugin';
  private config: ARMSInitPluginConfig;
  private armsRum: any = null;
  private logger: Logger;

  constructor(config: ARMSInitPluginConfig = {}) {
    this.config = {
      debug: false,
      timeout: 5000,
      autoRegister: true,
      ...config,
    };
    this.logger = createLogger('ARMSInitPlugin', this.config.debug ?? false);
  }

  /**
   * SDK 初始化前执行
   * 根据 appType 执行不同的初始化逻辑
   */
  async beforeInit(): Promise<void> {
    this.logger.log('开始执行初始化前准备...', { appType: this.config.appType });

    const appType = this.config.appType || 'main';

    // 根据应用类型执行不同的初始化逻辑
    switch (appType) {
      case 'main':
        await this.initMainApp();
        break;
      case 'sub':
        await this.initSubApp();
        break;
      case 'single':
        await this.initSingleApp();
        break;
      default:
        // 默认使用 main 的逻辑
        await this.initMainApp();
    }

    this.logger.log('ARMS 基础 SDK 初始化完成');
  }

  /**
   * 初始化主应用（main）
   * 保持原有逻辑不变
   */
  private async initMainApp(): Promise<void> {
    // 自动注册 ARMS SDK
    if (this.config.autoRegister) {
      await this.registerARMSSDK();
    }

    // 等待 ARMS 初始化完成
    const ready = await this.waitForARMSReady(this.config.timeout!);

    if (!ready) {
      const error = new Error('[ARMSInitPlugin] ARMS 初始化超时');
      // 保持仅 debug 才输出的语义
      this.logger.warn(error);
      throw error;
    }
  }

  /**
   * 初始化子应用（sub）
   * 从父级窗口获取配置并初始化
   */
  private async initSubApp(): Promise<void> {
    try {
      // 获取父级窗口的配置
      const parentConfig = window.$wujie?.props?.parentWindow?.__ARMS_CONFIG__;

      if (!parentConfig) {
        this.logger.warn('子应用：无法获取父级窗口配置');
        // 降级到 main 的逻辑
        await this.initMainApp();
        return;
      }

      this.logger.log('子应用：获取到父级窗口配置', parentConfig);

      // 获取当前应用名称
      const appName = getAppName();

      // 从父级配置中获取当前应用的配置
      const appConfig = parentConfig?.apps?.[appName];

      if (!appConfig || !appConfig.endpoint) {
        this.logger.warn(`子应用：未找到应用 ${appName} 的配置`);
        // 降级到 main 的逻辑
        await this.initMainApp();
        return;
      }

      const currentAppName = getAppName();
      const instance = await this.initAppInstance(appName, appConfig, {
        setAsMain: appName === currentAppName,
      });

      if (instance) {
        this.logger.log(`子应用 ${appName} 初始化成功`);
      }
    } catch (error) {
      this.logger.error('子应用初始化失败:', error);
      // 降级到 main 的逻辑
      await this.initMainApp();
    }
  }

  /**
   * 初始化单个应用（single）
   * 从传入的 config 参数获取配置并初始化
   */
  private async initSingleApp(): Promise<void> {
    try {
      const appConfig: any = this.getSingleAppConfig();
      const appName = getAppName();

      const instance = await this.initAppInstance(appName, appConfig, { setAsMain: true });
      if (instance) {
        this.logger.log(`单个应用 ${appName} 初始化成功`);
      }
    } catch (error) {
      this.logger.error('单个应用初始化失败:', error);
      throw error;
    }
  }

  /**
   * 获取 single 模式的配置（并做必要校验）
   */
  private getSingleAppConfig(): any {
    const appConfig: any = this.config.config || {};
    this.logger.log('单个应用：使用传入的配置', appConfig);

    if (!appConfig) {
      throw new Error('[ARMSInitPlugin] single 类型需要提供 config 配置');
    }
    if (!appConfig.endpoint) {
      throw new Error('[ARMSInitPlugin] config 中缺少 endpoint 配置');
    }
    return appConfig;
  }

  /**
   * 初始化一个应用实例（sub/single 共用）
   */
  private async initAppInstance(
    appName: string,
    appConfig: any,
    options: { setAsMain: boolean }
  ): Promise<any> {
    // 自动注册 ARMS SDK
    if (this.config.autoRegister) {
      await this.registerARMSSDK();
    }

    // 等待 SDK 工厂函数就绪
    const sdkAvailable = await this.waitForARMSSDK(this.config.timeout!);
    if (!sdkAvailable) {
      throw new Error('[ARMSInitPlugin] ARMS SDK 未注册');
    }

    const createInstance = window.__ARMS_SDK_FACTORY__;
    if (!createInstance || typeof createInstance !== 'function') {
      throw new Error('[ARMSInitPlugin] ARMS SDK 工厂函数不可用');
    }

    const instance = await this.initSingleARMS(appName, appConfig, createInstance);
    if (!instance) return null;

    // 存储到全局实例集合
    if (!window.__ARMS_INSTANCES__) {
      window.__ARMS_INSTANCES__ = {};
    }
    window.__ARMS_INSTANCES__[appName] = instance;

    if (options.setAsMain) {
      window.__ARMS_INSTANCE__ = instance;
    }

    return instance;
  }

  /**
   * 初始化单个 ARMS 实例
   */
  private async initSingleARMS(appName: string, appConfig: any, createInstance: () => any): Promise<any> {
    if (!appConfig || !appConfig.endpoint) {
      return null;
    }

    try {
      // 创建独立的 ARMS 实例
      const armsInstance = createInstance();
      // 初始化 ARMS SDK
      await armsInstance.init(appConfig);

      // 配置过滤器
      if (appConfig.filters) {
        const filters: any = {};

        if (appConfig.filters.exception && appConfig.filters.exception.length > 0) {
          filters.ignoreErrors = appConfig.filters.exception;
        }

        if (appConfig.filters.resource && appConfig.filters.resource.length > 0) {
          filters.ignoreUrls = appConfig.filters.resource;
        }

        if (Object.keys(filters).length > 0) {
          armsInstance.setConfig({ ignore: filters });
        }
      }

      return armsInstance;
    } catch (error) {
      this.logger.error(`${appName} 初始化失败:`, error);
      return null;
    }
  }

  /**
   * 等待 ARMS SDK 注册
   */
  private waitForARMSSDK(timeout: number): Promise<boolean> {
    return new Promise((resolve) => {
      const checkInterval = 100;
      let elapsed = 0;

      const timer = setInterval(() => {
        if (window.__ARMS_SDK_FACTORY__) {
          clearInterval(timer);
          resolve(true);
        } else if (elapsed >= timeout) {
          clearInterval(timer);
          this.logger.warn('ARMS SDK 注册超时');
          resolve(false);
        }
        elapsed += checkInterval;
      }, checkInterval);
    });
  }

  /**
   * 注册 ARMS SDK 到全局
   */
  private async registerARMSSDK(): Promise<void> {
    if (window.__ARMS_SDK_FACTORY__) {
      this.logger.log('SDK 已经注册');
      return;
    }

    try {
      // 动态导入 ARMS SDK
      const armsRumModule = await import('@arms/rum-browser');
      this.armsRum = armsRumModule.default || armsRumModule;

      // 注册 SDK 工厂函数
      window.__ARMS_SDK_FACTORY__ = () => this.armsRum;

      this.logger.log('ARMS SDK 已注册，等待自动初始化');
    } catch (error) {
      this.logger.error('导入 ARMS SDK 失败:', error);
      throw error;
    }
  }

  /**
   * 等待 ARMS 初始化完成
   * @param timeout 最多等待时间（毫秒）
   */
  private waitForARMSReady(timeout: number): Promise<boolean> {
    return new Promise((resolve) => {
      // 如果已经就绪，直接返回
      if (window.__ARMS_INSTANCE__) {
        resolve(true);
        return;
      }

      const startTime = Date.now();
      const checkInterval = 100; // 每 100ms 检查一次

      const checkReady = () => {
        if (window.__ARMS_INSTANCE__) {
          resolve(true);
          return;
        }

        if (Date.now() - startTime >= timeout) {
          this.logger.warn('等待初始化超时');
          resolve(false);
          return;
        }

        setTimeout(checkReady, checkInterval);
      };

      checkReady();
    });
  }
}
```

## 十、src/tracking/plugins/FilterPlugin.ts 与 plugins/index.ts（逐字落位）

```typescript
// ── FilterPlugin.ts ──
/**
 * 过滤插件 - 过滤敏感信息和错误
 */
import type { TrackingPlugin, BaseEvent } from '../types';

export interface FilterConfig {
  /** 敏感字段 */
  sensitiveKeys?: string[];
  /** 忽略的错误消息 */
  ignoreErrors?: (string | RegExp)[];
  /** 忽略的 URL */
  ignoreUrls?: (string | RegExp)[];
}

/**
 * 过滤插件
 */
export class FilterPlugin implements TrackingPlugin {
  name = 'FilterPlugin';
  private sensitiveKeys: string[];
  private ignoreErrors: (string | RegExp)[];
  private ignoreUrls: (string | RegExp)[];

  constructor(config: FilterConfig = {}) {
    this.sensitiveKeys = config.sensitiveKeys || [
      'password',
      'token',
      'secret',
      'authorization',
      'cookie',
    ];
    this.ignoreErrors = config.ignoreErrors || [
      /ResizeObserver/i,
      /Non-Error promise rejection/i,
      /Script error/i,
    ];
    this.ignoreUrls = config.ignoreUrls || [
      /extensions\//i,
      /^chrome:\/\//i,
      /^chrome-extension:\/\//i,
    ];
  }

  beforeTrack(event: BaseEvent): BaseEvent | null {
    // 过滤 URL
    if (event.properties?.url) {
      const url = event.properties.url;
      if (
        this.ignoreUrls.some((pattern) =>
          typeof pattern === 'string' ? url.includes(pattern) : pattern.test(url)
        )
      ) {
        return null; // 拦截事件
      }
    }

    // 过滤敏感信息
    if (event.properties) {
      event.properties = this.filterSensitiveData(event.properties);
    }

    return event;
  }

  private filterSensitiveData(data: Record<string, any>): Record<string, any> {
    const filtered: Record<string, any> = {};

    for (const [key, value] of Object.entries(data)) {
      if (this.sensitiveKeys.some((k) => key.toLowerCase().includes(k))) {
        filtered[key] = '***';
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        filtered[key] = this.filterSensitiveData(value);
      } else {
        filtered[key] = value;
      }
    }

    return filtered;
  }
}
```

```typescript
// ── plugins/index.ts ──
/**
 * 插件导出
 * - ARMSInitPlugin: ARMS 初始化插件
 * - FilterPlugin: 过滤插件
 */
export * from './ARMSInitPlugin';
export * from './FilterPlugin';

// 导入所有插件类
import { FilterPlugin } from './FilterPlugin';
import type { TrackingPlugin } from '../types';

/**
 * 插件注册表 - 字符串名称到插件类的映射
 * 新增插件时，只需在此处添加即可
 */
export const PLUGIN_REGISTRY: Record<
  string,
  new (...args: any[]) => TrackingPlugin
> = {
  FilterPlugin,
};
```

## 十一、src/tracking/utils/index.ts（逐字落位）

```typescript
/**
 * 工具
 */
import type { TrackingPlugin } from '../types';
import { PLUGIN_REGISTRY } from '../plugins';

export interface Logger {
  log: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
}

/**
 * 日志管理器
 * @param moduleName 模块名称
 * @param debug 是否启用调试模式
 * @returns 日志管理器实例
 */
export function createLogger(moduleName: string, debug: boolean = false): Logger {
  const prefix = `[${moduleName}]`;

  return {
    log: (...args: any[]) => {
      if (debug) {
        console.info(prefix, ...args);
      }
    },
    warn: (...args: any[]) => {
      if (debug) {
        console.warn(prefix, ...args);
      }
    },
    error: (...args: any[]) => {
      console.error(prefix, ...args);
    },
  };
}

/**
 * 将字符串形式的插件名称转换为插件实例
 * @param pluginName 插件名称字符串
 * @param debug 调试模式标志
 * @returns 插件实例或 null
 */
export function createPluginFromString(
  pluginName: string,
  debug: boolean = false
): TrackingPlugin | null {
  if (!pluginName || typeof pluginName !== 'string') {
    console.warn('[Tracking] 插件名称必须是字符串');
    return null;
  }

  const PluginClass = PLUGIN_REGISTRY[pluginName];
  if (!PluginClass) {
    console.warn(
      `[Tracking] 未知的插件名称: ${pluginName}，可用插件: ${Object.keys(PLUGIN_REGISTRY).join(', ')}`
    );
    return null;
  }

  try {
    // 根据插件类型创建实例，使用合适的默认配置
    switch (pluginName) {
      case 'FilterPlugin':
      default:
        // 其他插件尝试无参构造
        return new PluginClass();
    }
  } catch (error) {
    console.error(`[Tracking] 创建插件 ${pluginName} 实例失败:`, error);
    return null;
  }
}

/**
 * 规范化插件列表：支持字符串和插件实例两种形式
 * @param plugins 插件列表（可以是字符串名称或插件实例）
 * @param debug 调试模式标志（用于需要 debug 配置的插件）
 * @returns 规范化后的插件实例列表
 */
export function normalizePlugins(
  plugins: (string | TrackingPlugin)[],
  debug: boolean = false
): TrackingPlugin[] {
  if (!Array.isArray(plugins)) {
    console.warn('[Tracking] 插件列表必须是数组，已忽略');
    return [];
  }

  return plugins
    .map((plugin) => {
      // 如果是字符串，转换为插件实例
      if (typeof plugin === 'string') {
        return createPluginFromString(plugin, debug);
      }
      // 如果已经是插件实例，验证后返回
      if (plugin && typeof plugin === 'object' && 'name' in plugin) {
        return plugin;
      }
      console.warn('[Tracking] 无效的插件配置，已过滤:', plugin);
      return null;
    })
    .filter((plugin): plugin is TrackingPlugin => plugin !== null);
}

/**
 * 获取应用名称
 * @param appName 应用名称（可选）
 * @returns 应用名称
 */
export function getAppName(appName?: string): string {
  if (appName) return appName;

  if (typeof window !== 'undefined' &&
      window._arms &&
      typeof window._arms.getCurrentAppName === 'function') {
    return window._arms.getCurrentAppName();
  }

  return 'react_web';
}
```

## 十二、src/tracking/business/types.ts（逐字落位）

```typescript
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

/** 事件定义（埋点字典条目，与飞书清单一一对应） */
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
  /** 青鸟平台登记的事件标识（适配层 event_id 优先取它，未登记回退 code） */
  qingniaoId?: string;
}

/** 页面定义 */
export interface PageDef {
  pageCode: string;
  pageName: string;
  /** 清单口径页面路径，如 SCM供应链-业务-发货单 */
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
  /** 表单校验失败明细：字段名 + 失败原因（可视化页排障用） */
  validateFailDetails?: { field: string; reason: string }[];
  /** 操作成功后的单据状态（链 B 状态迁移的 after 边） */
  stateAfter?: string;
  /** 额外自定义字段 */
  extra?: Record<string, any>;
}

/**
 * 链条定义（上报侧收窄：仅保留采集归桶所需字段）
 */
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
  /** 实际经过的 step 序列 */
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

## 十三、src/tracking/business/context.ts（逐字落位）

```typescript
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

/**
 * trace 生命周期管理（页面级内存单例）
 */
class TraceManager {
  private current: TraceContext | null = null;
  private seq = 0;

  /** 页面内事件自增序号（时间戳乱序兜底） */
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

  /**
   * 打开另一张单据详情时的任务切换检测
   * 返回被替换掉的旧 trace 汇总（无替换返回 null）
   */
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

## 十四、src/tracking/business/tracker.ts（bizTracker 门面）

落位时只改【适配点 A】【适配点 B】两处 import，其余逐字照抄。

```typescript
/**
 * 业务埋点门面：页面唯一入口
 * 职责：公共字段注入、trace 生命周期、操作三段式（点击→校验→API 结果）、chain_summary
 *
 * 防污染原则：所有 public 方法整体 try/catch，埋点异常绝不影响业务
 *
 * 接口字段：trackAction 捕获 api_url/code/msg/duration，params/response 全环境附加（净化截断）。
 * 白名单自动捕获：apiCapture.ts 挂 XlbFetch 拦截器，白名单接口的 url/params/耗时
 * 自动捕获，trackAction 按时间窗认领——调用方不再需要手写 apiUrl/apiParams（仍可显式传覆盖）。
 */
// 【适配点 A】用户信息源：按前置检测 2 的实际路径/字段替换
import { getUserInfo } from '@/utils/user';
// 【适配点 B】微前端标识：非 wujie 项目改为 () => false
import { isWUJIE } from '@/wujie/utils';
import { getGlobalTracking } from '../lib/factory';
import { EventType } from '../types';
import { claimApiCapture } from './apiCapture';
import { genId, getSessionId, traceManager } from './context';
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

/** 业务侧 API 约定：code === 0 成功（与 XlbFetch 响应结构一致） */
const isApiSuccess = (res: any): boolean => res?.code === 0;

/** trackAction 入参（抽出供 trackAction / trackActionIf 共用） */
interface TrackActionOptions<T> {
  order?: OrderSnapshot | OrderSnapshot[] | null;
  action: () => Promise<T>;
  stateAfter?: string;
  /** 操作触发的接口路径：白名单已覆盖时无需声明；声明则精确匹配认领（兼容旧写法） */
  apiUrl?: string;
  /** 接口入参（缺省取拦截器捕获值；上报 api_params，8KB 截断） */
  apiParams?: any;
  /** 业务拒绝判定（可选）：code=0 但业务未达成（如批量接口返回问题列表）时返回 true，
   *  事件记 fail，fail_reason 取 failReason 参数或默认 biz_reject */
  isBizRejected?: (res: any) => boolean;
  /** isBizRejected 命中时的失败原因（默认 biz_reject） */
  failReason?: string;
  extra?: Record<string, any>;
}

/** 载荷截断上限（字符数。审核类接口入参含完整单据快照，2KB 必超，取 8KB 覆盖排障场景） */
const PAYLOAD_LIMIT = 8192;

/** 截断标记：与看板侧 utils.ts TRUNC_MARK 一致（看板识别后修复 JSON 前缀再美化展示） */
const TRUNC_MARK = '…[truncated]';

/** 载荷序列化 + 截断（防单事件体过大；超限追加标记便于分析侧识别） */
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

  /** 页面初始化时注册（useActivate 中调用，KeepAlive 下每次激活都安全） */
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

  /**
   * 页面失活/关闭：trace 关闭判定
   * KeepAlive 下由 useUnactivate 触发；tab 被 drop 关闭时由组件兜底触发
   */
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
        // 批量操作全量 fid 都计入 trace（链 B 展开依据，双主键语义）
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

  /** 条件守卫版 track：condition 为 false 时不上报。
   *  用于共享组件被未接入埋点的页面复用（如服务委托单复用发货单预约组件），
   *  防止事件以最近注册页的名义上报造成串页面归属 */
  trackIf(
    condition: boolean,
    def: TrackEventDef,
    options: TrackBizOptions = {},
  ): void {
    if (!condition) return;
    this.track(def, options);
  }

  /**
   * 操作类事件：包装 API 调用，自动捕获操作结果（成功/失败）与接口状况
   * （耗时/业务码自动捕获；url/params 由白名单拦截器自动关联，调用方也可显式声明覆盖；
   * params/response 全环境上报，8KB 截断）
   * 不改变业务行为：异常原样抛出，返回值原样返回
   */
  async trackAction<T>(
    def: TrackEventDef,
    options: TrackActionOptions<T>,
  ): Promise<T> {
    const start = Date.now();
    try {
      const res: any = await options.action();
      // 认领 action 期间的白名单接口记录（url/params/纯接口耗时）
      const captured = claimApiCapture(start, options.apiUrl);
      const apiOk = isApiSuccess(res);
      const success = apiOk && !options.isBizRejected?.(res);
      this.track(def, {
        order: options.order,
        result: success ? 'success' : 'fail',
        stateAfter: success ? options.stateAfter : undefined,
        failReason: success
          ? undefined
          : apiOk
            ? (options.failReason ?? 'biz_reject')
            : 'api_biz_fail',
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

  /** 条件守卫版 trackAction：condition 为 false 时只执行 action 不上报
   *  （返回值/异常行为与直接调用 action 一致），使用场景同 trackIf */
  async trackActionIf<T>(
    condition: boolean,
    def: TrackEventDef,
    options: TrackActionOptions<T>,
  ): Promise<T> {
    if (!condition) return options.action();
    return this.trackAction(def, options);
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

  /** 公共字段注入（字段规范：标识/用户/页面/单据/结果/环境 六组） */
  private buildProperties(
    def: TrackEventDef,
    options: TrackBizOptions,
  ): Record<string, any> {
    const userInfo: any = getUserInfo() || {};
    const trace = traceManager.get();
    const orders = this.normalizeOrders(options.order);
    const first = orders[0];

    return {
      // 事件标识组
      event_id: genId('evt'),
      event_code: def.code,
      event_name: def.name,
      event_ver: this.eventVer,
      // 青鸟平台登记的事件标识（未登记则为 undefined，适配层回退 event_code）
      qingniao_id: def.qingniaoId,
      // 页面组
      page_code: this.page!.pageCode,
      page_name: this.page!.pageName,
      page_path: this.page!.pagePath,
      route_url: `${location.pathname}${location.search}`,
      page_referrer: document.referrer || undefined,
      // 用户组（口径：组织 + 配送中心 + 用户）
      company_id: userInfo.company_id,
      company_name: userInfo.company_name,
      org_ids: userInfo.org_ids,
      store_id: userInfo.store_id,
      store_name: userInfo.store_name,
      user_id: userInfo.id,
      user_name: userInfo.name,
      user_type: userInfo.user_type,
      // 电话（登录接口字段名未文档化，按 mobile/phone/tel 常见命名兼容取值）
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
      // 单据组（链 B 载体）
      // order_type：跨类型串联后链 B 主键升级为 order_type+order_fid
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
      // 上游来源单据（双保险：事件自带来源，关系对可从任意事件重建）
      source_type: first?.source_type,
      source_fid: first?.source_fid,
      source_order_no: first?.source_order_no,
      // 结果组
      action_result: options.result,
      fail_reason: options.failReason,
      validate_fail_fields: options.validateFailFields,
      validate_fail_details: options.validateFailDetails,
      // 接口组：操作触发的接口调用状况；params/response 截断后全环境上报
      api_url: options.api?.url,
      api_code: options.api?.code,
      api_msg: options.api?.msg,
      api_duration: options.api?.duration,
      api_params: truncatePayload(options.api?.params),
      // response 统一在此净化（幂等）：剥离 axios 传输层字段（config/headers 等），仅留业务三元组
      api_response: truncatePayload(sanitizeApiResponse(options.api?.response)),
      // 环境组
      is_wujie: !!isWUJIE(),
      // 自定义
      ...options.extra,
    };
  }

  /** trace 关闭时上报汇总事件（分析侧 90% 报表直接消费它） */
  private emitSummary(summary: ChainSummary): void {
    const userInfo: any = getUserInfo() || {};
    // 名称按注册页动态拼接（多链条接入后不再只有单一页面）
    const summaryName = `${this.page?.pageName ?? '页面'}-任务链汇总`;
    this.rawSend(EventType.VIEW, summaryName, {
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
      is_wujie: !!isWUJIE(),
      ...summary,
    });
  }

  private send(def: TrackEventDef, properties: Record<string, any>): void {
    this.rawSend(
      def.type === 'click' ? EventType.CLICK : EventType.VIEW,
      def.name,
      properties,
    );
  }

  private rawSend(
    type: EventType,
    name: string,
    properties: Record<string, any>,
  ): void {
    const tracking = getGlobalTracking() as any;
    if (!tracking?.track) return;
    tracking.track({
      type,
      name,
      group: this.page?.pageCode,
      properties,
    });
  }

  /** 关闭浏览器 tab 时兜底关闭 trace（sendBeacon 由各 adapter 保证） */
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

## 十五、src/tracking/business/apiCapture.ts（XlbFetch 白名单捕获）

【适配点 C】http 客户端非 XlbFetch 时换拦截器实现（axios 版见 pc-patterns.md 附录）。
白名单初始为空数组，04-point-plan 按方案填操作类（写）接口，读接口（read/page/find 查询）不入列。

```typescript
/**
 * 操作类接口捕获：XlbFetch 响应拦截器 + 白名单
 *
 * 白名单内的接口调用自动捕获 url/params/耗时，trackAction 完成时按时间窗认领关联
 * —— 调用方不再需要手写 apiUrl/apiParams，新增操作接口只需在此登记一行
 *
 * 关联口径：trackAction 的 action 开始时间之后的缓冲区首条记录被其认领（认领即弹出，
 * 防重复关联）。UI 操作单请求为主，并发串扰风险可忽略。
 */
import { XlbFetch } from '@xlb/utils';

/**
 * 接口白名单：trackAction 覆盖的操作类（写）接口全集
 * 读操作（read/page/find/export 查询）不入列——只关心操作结果的接口状况
 */
const API_CAPTURE_WHITELIST: readonly string[] = [
  // 04-point-plan 按方案登记，格式：'/域/hxl.xxx.action', // 注释：动作名
];

/** 捕获的接口调用记录（原始数据；净化/截断由 tracker 消费时负责） */
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

let installed = false;

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
 * 安装 XlbFetch 拦截器（幂等，SDK 初始化时调用一次）
 * 响应拦截器先于业务 await 返回执行，保证 trackAction 认领时记录已入缓冲区
 */
export const installApiCapture = (): void => {
  if (installed) return;
  installed = true;
  try {
    XlbFetch.interceptors.request.use((config: any) => {
      config.__captureStart = Date.now();
      return config;
    });
    XlbFetch.interceptors.response.use(
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
 * expectedUrl 有值时优先精确匹配（调用方显式声明 apiUrl 的向后兼容场景）
 */
export const claimApiCapture = (
  sinceTs: number,
  expectedUrl?: string,
): CapturedApiCall | undefined => {
  // 先清理过期记录（sinceTs 之前的孤儿：未被任何 trackAction 认领的白名单调用）
  for (let i = buffer.length - 1; i >= 0; i--) {
    if (buffer[i].ts < sinceTs) buffer.splice(i, 1);
  }
  let idx = expectedUrl
    ? buffer.findIndex((r) => r.url === expectedUrl)
    : buffer.length > 0
      ? 0
      : -1;
  if (idx < 0) return undefined;
  const [record] = buffer.splice(idx, 1);
  return record;
};
```

## 十六、src/tracking/business/reportPlugin.ts（dev 打印插件，逐字落位）

```typescript
/**
 * 埋点打印插件（仅 dev 注册）
 * 职责：console 打印事件（dev 可见性）
 * 注：业务事件统一由 XlbTrackerAdapter 经官方 xlb-tracker 写入 SLS，
 *     本插件只做本地可视化，不参与上报
 */
import type { BaseEvent, TrackingPlugin } from '../types';

export class XlbReportPlugin implements TrackingPlugin {
  name = 'XlbReportPlugin';

  afterTrack(event: BaseEvent): void {
    try {
      // eslint-disable-next-line no-console
      console.log(
        `[track] ${event.name}`,
        event.properties?.event_code ?? '',
        event.properties,
      );
    } catch {
      // 埋点异常不影响业务
    }
  }

  onError(): void {
    // 插件自身错误静默
  }
}
```

## 十七、src/tracking/business/index.ts（统一出口 + register 模板）

events/chains 为每需求新增文件，命名与导出范例见 pc-patterns.md（事件字典文件骨架/链条文件骨架一节照用）。

```typescript
/**
 * 业务埋点层统一出口
 * 页面侧只需要：`import { bizTracker, XX_EVENTS, registerXxxTracking } from '@/tracking/business'`
 */
export { claimApiCapture, installApiCapture } from './apiCapture';
export { XlbReportPlugin } from './reportPlugin';
export { bizTracker } from './tracker';
export * from './types';

// ── 每需求新增：chains/events 导出（范例，按实际需求替换） ──
// export { XX_CHAIN, XX_CHAIN_ID } from './chains/xxx';
// export {
//   XX_EVENT_VER,
//   XX_EVENTS,
//   XX_EXTRA_EVENTS,
//   XX_PAGE,
//   XX_PAGE_LEAVE,
// } from './events/xxx';
// export type { XxEventKey } from './events/xxx';

// import { XX_CHAIN } from './chains/xxx';
// import {
//   XX_EVENT_VER,
//   XX_EVENTS,
//   XX_PAGE,
//   XX_PAGE_LEAVE,
// } from './events/xxx';
// import { bizTracker } from './tracker';

/** Xxx 页面埋点注册（useActivate 中调用一次） */
// export const registerXxxTracking = (): void => {
//   bizTracker.register({
//     page: XX_PAGE,
//     chain: XX_CHAIN,
//     eventVer: XX_EVENT_VER,
//     pageViewDef: XX_EVENTS.PAGE_VIEW,
//     pageLeaveDef: XX_PAGE_LEAVE,
//   });
// };
```

## 十八、入口接线：src/utils/trackingTools.ts

已含 ARMS 三件套标准修正（env 四态 / debug 跟随本地开发模式 / 会话采样 1），**不要照抄 SCM 旧值**。
【适配点 E】ARMS key 变量名按前置检测 5 替换；endpoint 的 workspace/service_id 按产线 ARMS 应用实际值替换。
layouts/app 入口调用一次 `initTracking()`（SCM 在 `src/layouts/index.tsx` 顶层调用）。

```typescript
import { getGlobalTracking as getGlobalTrackingInfo } from '@/tracking';
import { installApiCapture, XlbReportPlugin } from '@/tracking/business';
// 【适配点 A 同款】用户信息源
import { getUserInfo } from '@/utils/user';

/** 部署环境 → ARMS env 四态（XLB_DEPLOY_ENV 由各 .umirc.* define 注入） */
const resolveArmsEnv = (): 'dev' | 'daily' | 'pre' | 'production' => {
  const e = process.env.XLB_DEPLOY_ENV;
  if (e === 'dev') return 'dev';
  if (e === 'test') return 'daily';
  if (e === 'stage') return 'pre';
  if (e === 'prod') return 'production';
  return process.env.XLB_ENV === 'development' ? 'dev' : 'production';
};

export const initTracking = () => {
  setTimeout(() => {
    const userInfo = getUserInfo();
    import('@/tracking')
      .then(async (trackingModule) => {
        const { initTracking } = trackingModule;

        try {
          // 【适配点 E】ARMS key 变量名按产线实际替换；兜底 key 按产线 ARMS 应用填
          const keyId = process.env.TRACKING_KEY || '<产线 ARMS 兜底 key>';
          if (!keyId) {
            console.error('[Tracking] 未配置 TRACKING_KEY');
            return;
          }
          const env = resolveArmsEnv();
          // 标准修正：调试开关跟随本地开发模式，不跟 env（本地 env 按后端标 test）
          const isLocalDev = process.env.XLB_ENV === 'development';
          await initTracking({
            appType: 'single' as any,
            env,
            debug: isLocalDev,
            userInfo: userInfo,
            // 本地开发注册打印插件，事件 console 可见
            plugins: isLocalDev ? [new XlbReportPlugin()] : [],
            config: {
              // 【适配点 E 同款】workspace/service_id 按产线 ARMS 应用实际值替换
              endpoint: `https://proj-xtrace-e0d25e6b3c77bf580c51f53825e14be-cn-hangzhou.cn-hangzhou.log.aliyuncs.com/rum/web/v2?workspace=default-cms-1443729372068605-cn-hangzhou&service_id=e7rc4853wd@${keyId}`,
              env,
              spaMode: 'history',
              collectors: {
                perf: true,
                webVitals: true,
                api: false,
                staticResource: false,
                jsError: false,
                consoleError: false,
                action: false,
              },
              tracing: false,
              sessionConfig: {
                // 标准修正：ARMS 会话级采样调 1（0.2 会让 80% 会话整体不上报）
                sampleRate: 1,
              },
              filters: {
                exception: ['Test error', '/^Script error\\.?$/'],
                resource: ['https://example.com/', '/localhost/i'],
              },
            },
          });

          // 操作类接口白名单捕获（XlbFetch 拦截器，幂等；供 trackAction 自动关联 api 信息）
          installApiCapture();

          console.log('[Tracking] 统一埋点 SDK 初始化完成');
        } catch (error) {
          console.error('[Tracking] 统一埋点 SDK 初始化失败:', error);
        }
      })
      .catch((error) => {
        console.error('[Tracking] 统一埋点 SDK 加载失败:', error);
      });
  }, 100);
};

export const getGlobalTracking = () => getGlobalTrackingInfo() || ({} as any);
```

## 十九、构建配置：XLB_DEPLOY_ENV 四态注入（逐 umirc 配置补 define）

env 按前端连接的后端环境标定，与 App 端 `Config.ENV` 同口径，保证同一单据 PC/App 的 `app.env` 一致。本地 start 若连测试后端（`ERP_URL` 等指向 test），注入 test；仅连 dev 后端时才注入 dev。

| 配置文件 | 后端环境 | 注入值 |
| --- | --- | --- |
| `.umirc.dev.ts`（本地 start，连测试后端） | test | `'process.env.XLB_DEPLOY_ENV': 'test'` |
| `.umirc.prod.dev.ts`（build:dev，测试环境） | test | `'process.env.XLB_DEPLOY_ENV': 'test'` |
| `.umirc.prod.staging.ts`（build:staging） | stage | `'process.env.XLB_DEPLOY_ENV': 'stage'` |
| `.umirc.prod.ts`（build，生产） | prod | `'process.env.XLB_DEPLOY_ENV': 'prod'` |

配置文件名与后端地址以目标仓库实际为准（先 `ls .umirc*` / config 目录确认映射关系，并核对各配置的后端域名再注入）。
缺任何一档，该环境 env 标定即错（XlbTrackerAdapter 与 ARMS config 都依赖它）。

## 二十、落位后自检（必做）

1. `npx tsc --noEmit` 过滤 tracking 相关文件 0 错误（全仓既有错误需 grep 过滤后判断）；
2. `npx eslint` 全部新文件 0 错误（console 语句告警按仓库既有风格处理）；
3. `grep -rn "initTracker\|XlbTrackerAdapter" src/tracking` 确认适配器落位且 factory 注册双适配器；
4. `grep -n "XLB_DEPLOY_ENV" .umirc*.ts` 四态齐全；
5. 本地 start 后 console 可见 `[track]` 打印与 `[Tracking] 统一埋点 SDK 初始化完成`；SLS 中本地事件 `app.env` 为 test（与 App 同口径）。
