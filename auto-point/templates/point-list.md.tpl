# 【需求名】埋点清单

> 生成时间：YYYY-MM-DD ｜ 端：PC/RN ｜ 子应用：XXX
> 来源材料：（清单来源说明，如「飞书表格截图 3 张」）
> 状态：待用户确认（门禁 1）

## 一、清单总览

共 N 条：新增 X ｜ 复用已有 Y ｜ 需改造 Z ｜ 清单外补充 W ｜ ⚠ 待确认 V

## 二、事件清单（按页面分组）

### 页面：【高频页面】（页面路径：XXX供应链-业务-XXX）

| # | 事件名称（清单） | 类型 | 拟定义 code | step | regressive | terminal | qingniaoId | 代码落点 | 现状 | 备注 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 发货单-审核 | 点击 | check_click | handle | - | - | xlb_scm_check_click | pages/xxx/index.tsx:handleAudit | 新增 | |
| 2 | 发货单-反审核 | 点击 | uncheck_click | handle | ✓ | - | | pages/xxx/index.tsx:handleUncheck | 新增 | 回退信号 |

## 三、清单外补充事件（链条必需过渡节点）

| # | 拟定义 code | name | type | step | 理由 |
| --- | --- | --- | --- | --- | --- |
| 1 | query | 【页面】-查询 | click | browse | 漏斗 browse 环节必需 |
| 2 | detail_view | 【页面】-打开详情 | view | browse | 列表→详情串联必需 |

## 四、不埋条目（备查）

| # | 事件名称 | 原因 |
| --- | --- | --- |
| 1 | | |

## 五、待确认项

| # | 条目 | 疑问 | 需要谁确认 |
| --- | --- | --- | --- |
| 1 | | | |
