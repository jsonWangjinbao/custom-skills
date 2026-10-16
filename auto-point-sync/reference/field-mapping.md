# 字段映射与提取口径

本文件定义「目标项目代码 / `.ai-point` 产物 → supplement.json → 看板 payload」的唯一映射。事件基础字段只能来自脚本提取；模型不能重写 code/name/type/step 等代码事实。

## 一、脚本提取规则

`scripts/extract.mjs` 用 tsx 真实执行事件/链条模块，按导出值形状识别，不依赖固定变量名：

| 目标 | 识别形状 | payload |
| --- | --- | --- |
| 页面 | 对象含 pageCode/pageName/pagePath | PageTrackingCfg 基础字段 |
| 版本 | 导出名以 EVENT_VER 结尾，值为 semver | eventVer 原样 |
| 清单事件字典 | 对象所有值均为 TrackEventDef，且含 type=view + step=enter | events |
| 其他事件字典 | 对象所有值均为 TrackEventDef，但不是清单主字典 | 合并进 extraEvents |
| PAGE_LEAVE | 单个 TrackEventDef 导出，不是字典对象 | 跳过（看板派生） |
| 链条 | 对象含 chainId + idleTimeout | nodeKey = orderType ?? chainId |

### 多个事件字典

一个页面文件可以有主字典、EXTRA_EVENTS、REPORT_EVENTS 等多个事件字典：

- 只把含 PAGE_VIEW（view + enter）的字典当 `events`；
- 其余事件字典全部合并进 `extraEvents`，脚本对非 EXTRA 命名字典输出 warning；
- 同页面所有字典合并后 code 必须唯一，重复则停止。

### 多链条项目

- 一条链条：所有页面自动归属该 nodeKey。
- 多条链条：脚本解析 tracking 入口 `register({ page: XXX_PAGE, chain: XXX_CHAIN })` 配对。
- 未配对页面的 nodeKey 为 null：必须由用户/已确认方案确认后在 supplement.pages 显式列出。
- 代码已明确归属其他 nodeKey 的页面不得改挂当前节点。

## 二、supplement 字段

| 字段 | 来源 | 规则 |
| --- | --- | --- |
| nodeKey | extract.chains | 必须等于上报 order_type（orderType ?? chainId） |
| pages | extract.pages | 仅多链条/未归属场景需要；显式页面 pageCode 列表 |
| node.name | point-list 标题 / 业务名称 | 新节点必填；审核页可修改 |
| node.category | 项目域 | 如 SCM / ERP / WMS / FSMS；新节点必填 |
| node.desc | 模板生成 | `{域} {单据}（{repo} {端} 业务埋点，chain_id / order_type = {nodeKey}）`，≤191 字符 |
| node.pageId | 已确认设计 / 现有页面采集配置 / SLS 实证 | 没有可靠来源则不填，不能按 pageCode 猜 |
| node.pageRoute | 路由配置 / 已确认设计 | 没有可靠来源则不填 |
| pageMeta.*.pageId/pageRoute | 页面级覆盖 | 仅多页面需要各自 PV/UV 锚点时填写 |
| terminalKinds | point-list 终态语义 | 每个 terminal 事件必须 fulfill 或 close |
| remarks | point-list 备注 | 可选，key 用 `pageCode.eventCode`；code 跨页面唯一时可简写 eventCode |
| analysis.stateNames | survey 中已确认状态枚举 | 无可靠来源为 null |
| analysis.stepOrder/stepNames/intentSteps | 通常让脚本默认生成 | 有明确业务口径才覆盖 |
| requirement | 需求目录名 | 用于待办来源与飞书通知 |
| implAt | verify-report 通过时间 | 缺省由脚本取 verify-report.md mtime；无法定位时必须填写 |

## 三、终态语义

- `fulfill`：用户任务/履约目标达成，进入 fulfillCodes。如「确认通过」「审核通过」「预约确认」「收货完成」。
- `close`：单据生命周期终结但没有履约达成，进入 closeCodes。如「删除」「作废」「关单」「终止」。
- 驳回、回退、撤回、反审核通常是 `regressive: true`，不是终态；以代码 terminal 标记为准。
- 同名 code 出现在多个页面时，用 `pageCode.code` 作为 terminalKinds key。
- point-list 只写「终态」但没有说明 fulfill/close 时必须询问用户，不得根据 event name 猜。

## 四、脚本默认分析口径

payload.mjs 从本次全部事件使用的 step 派生：

- stepOrder：`enter → browse → handle → reply → appoint` 中实际出现的步骤；`abort/leave` 不进漏斗；自定义 step 追加在末尾。
- stepNames：默认环节全集中实际使用的步骤中文名（包括 abort / leave）。
- intentSteps：存在 handle 时为 `["handle"]`，否则 null。
- stateNames：null。

看板合入默认只填库内为空字段；库内已有值不覆盖，审核人可以勾选覆盖。

## 五、看板合并保护

- 只覆盖提交端（pc / rn），另一端保留。
- 按 pageCode 合并；本次提交页面整页覆盖，库内独有页面保留。
- eventVer 以代码为准，不由看板自动 bump。
- 缺 PAGE_VIEW 时看板补到首位。
- remark 为看板侧人工备注：提交事件没带 remark 时，自动继承库内同页同 code 事件的 remark；supplement 显式给 remark 时才覆盖。
- regressiveCodes / fulfillCodes / closeCodes 按合并后全端事件重新派生。

## 六、source 字段

payload.mjs 自动读取：

- repo：remote.origin basename；无 remote 时目录名。
- branch：当前分支。
- commit：短 hash；工作区有改动时后缀 `-dirty`。
- submitter：git user.name / user.email。
- skill：auto-point-sync@版本。
- implAt：supplement.implAt 或 verify-report.md mtime。

提交人 email 缺失不阻断提交，但合入/驳回后飞书通知会 skipped。
