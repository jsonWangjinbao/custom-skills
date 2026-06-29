# Module Federation 路由注册（四仓库联动）

**条件**：目标项目是 React Native Module Federation 架构。

**问题**：在 remote app 中新增页面后，`navigation.navigate()` 点击无效，不会跳转。

**根因**：Host app 的 Navigator 中所有远程页面是通过 **CDN 上的 `router.json` 动态注册** 的（也支持本地 `applicationFields` fallback）。如果路由不在这些数据源中，Stack.Navigator 里就没有对应 Screen，`navigate()` 被静默忽略。

## 数据流

```
router.json (CDN) → AppRemoteRouter.getRouter() → route 加前缀 → Stack.Screen 注册
                                                          ↓
applicationFields.ts (本地 fallback) ─────────────────────┘
```

## 完整注册步骤（需改 4 个仓库）

假设新增页面路由名为 `DayReport`。

### 1. remote-app-fsms（当前项目）

**`src/config/route.ts`** — 路由 key 常量：
```ts
export const FsmsRouteKeys = {
  // ...existing...
  DayReport: 'DayReport',
};
```

**`src/routes/index.ts`** — 组件映射：
```ts
import DayReport from '../pages/xxx/chunks/DayReport';

export const FsmsRouteConfig = {
  // ...existing...
  DayReport: {
    title: '每日食品安全检查记录',
    component: DayReport,
  },
};
```

### 2. host-app-xlb（必须）

**`packages/common/src/navigation/fsmsRoute/index.tsx`** — FsmsRouteKeys：
```ts
export const FsmsRouteKeys = {
  // ...existing...
  DayReport: 'DayReport',  // 新增
};
```
> 这个常量被 `fields.ts` 引用生成 `applicationFields`（本地 fallback），也被 `Stack.Screen` 注册使用。

**`packages/common/src/config/fields.ts`** — applicationFields FSMS 节：
```ts
FSMS: [
  // ...existing...
  {
    moduleName: '业务',
    name: '日管控查看报告',
    route: FsmsRouteKeys.DayReport,
    isHasAuth: ['食品安全自查', '查询'],
    appType: 'FSMS',
  },
],
```
> 这是本地调试时的路由数据源。如果对应路由未来要从 CDN 加载，这里可以加 `hiddenStack: true` 避免双重注册。

### 3. host-app-xlb-router（必须，CDN 数据源 v1）

**`fsms/index.json`**：
```json
{
  "moduleName": "业务",
  "name": "日管控查看报告",
  "route": "DayReport",
  "isHasAuth": ["食品安全自查", "查询"],
  "appType": "FSMS",
  "hiddenMenu": true
}
```
> `hiddenMenu: true` 表示不在左侧菜单中显示，仅作为内部跳转路由。

### 4. host-app-xlb-router-v2（必须，CDN 数据源 v2）

**`fsms/index.json`**：同上。

## 导航方式

```tsx
import {FsmsRoutes} from 'src/config/route';

// ✅ 正确
navigation.navigate(FsmsRoutes.DayReport, { id, store_name, name });

// ❌ 错误：裸字符串不会被 host app 识别
navigation.navigate('DayReport', { id });
```

## 本地调试

host-app-xlb 启动后会先尝试从 CDN 拉 router.json，失败时 fallback 到 `fields.ts` 的 `applicationFields`。本地只要改了 `fields.ts` 中的 FSMS 节 + `fsmsRoute/index.tsx`，重新编译 host app 即可。

## 上线流程

1. router JSON 推到 host-app-xlb-router/v2 对应分支
2. CI/CD 构建并部署到 CDN
3. CDN 生效后，可以把 `fields.ts` 中对应条目加上 `hiddenStack: true`

## 验证清单

- [ ] `src/config/route.ts` — FsmsRouteKeys 已添加
- [ ] `src/routes/index.ts` — FsmsRouteConfig 已注册
- [ ] `host-app-xlb/packages/common/src/navigation/fsmsRoute/index.tsx` — FsmsRouteKeys 已添加
- [ ] `host-app-xlb/packages/common/src/config/fields.ts` — applicationFields FSMS 节已添加
- [ ] `host-app-xlb-router/fsms/index.json` — 已添加
- [ ] `host-app-xlb-router-v2/fsms/index.json` — 已添加
- [ ] `navigation.navigate(FsmsRoutes.Xxx, params)` 使用 FsmsRoutes 对象
- [ ] 本地 host app 重新编译后跳转正常
