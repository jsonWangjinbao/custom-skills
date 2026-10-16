# 【需求名】埋点清单

> 生成时间：YYYY-MM-DD ｜ 端：PC/RN ｜ 子应用：XXX
> 事实来源：配置中心 bundle（config-bundle.json，拉取于 YYYY-MM-DD HH:mm，board：http://localhost:3001）
> 状态：待用户确认（门禁 1）

## 一、清单总览

共 N 条：新增 X ｜ 复用已有 Y ｜ 需改造 Z ｜ 清单外补充 W ｜ 待清理 K ｜ ⚠ 待确认 V

## 二、事件清单（按页面分组）

### 页面：【pageName】（pageCode：xxx ｜ 页面路径：XXX供应链-业务-XXX ｜ eventVer：1.1.0）

| # | 事件名称 | 类型 | code | step | regressive | terminal | qingniaoId | 代码落点 | 现状 | 备注 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 发货单-审核 | click | check_click | handle | - | - | xlb_scm_check_click | pages/xxx/index.tsx:handleAudit | 新增 | |
| 2 | 发货单-反审核 | click | uncheck_click | handle | ✓ | - | | pages/xxx/index.tsx:handleUncheck | 新增 | 回退信号 |
| 3 | 发货单-提交 | click | submit_click | handle | - | fulfill | | pages/xxx/index.tsx:handleSubmit | 需改造 | step：reply → handle |

> 条目字段直接取自 bundle，原样引用。terminal 列填 fulfill / close / -（对应 bundle terminal + terminalKind）。
> 现状 = 配置 vs 代码 diff 分类：新增 / 复用 / 需改造；需改造时在备注列逐项写「字段：旧值 → 新值」。
> eventVer 记录于此，05 实施时原样写入 `XXX_EVENT_VER`（不递增、不改写）。

## 三、清单外补充事件（bundle extraEvents，配置中心维护的链条过渡节点）

| # | code | name | type | step | 代码落点 | 现状 |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | query | 【页面】-查询 | click | browse | | 新增 |
| 2 | detail_view | 【页面】-打开详情 | view | browse | pages/xxx/index.tsx:goDetail | 复用 |

## 四、待清理事件（代码有而 bundle 无，⚠ 不自动删除）

| # | code | name | 代码位置 | 处理建议 |
| --- | --- | --- | --- | --- |
| 1 | | | | 待用户确认：删除 / 保留（说明理由，如其他链条在用） |

## 五、待确认项

| # | 条目 | 疑问 | 需要谁确认 |
| --- | --- | --- | --- |
| 1 | | | |
