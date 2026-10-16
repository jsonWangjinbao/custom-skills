---
name: auto-point
description: 自动埋点 — 当用户提供埋点范围清单/文档/截图并说「埋点」「加埋点」「推动埋点」「埋点接入」时，按「收集材料 → 梳理代码 →（预改造）→ 埋点清单 → 埋点方案 → 实施 → 验证」流程推进 PC/RN 业务埋点，上报统一走 @xlb/xlb-tracker（SCM 样板），含清单、方案两道人工门禁（既有基建偏离样板时加预改造门禁），产物落在目标项目 .ai-point/ 目录。
---

# auto-point

业务埋点工作流：收集材料 → 梳理代码 →（B/C 级时【门禁1.5】预改造）→ 【门禁1】埋点清单 → 【门禁2】埋点方案 → 实施 → 验证。支持 PC / RN 两端。

**标准形态**：PC 端以 SCM 产线（xlb_scm_web/src/tracking）为唯一样板——业务事件经统一 SDK fan-out 双适配器（ARMS RUM 兜底 + XlbTrackerAdapter 走 @xlb/xlb-tracker 上报公司统一 BI/SLS 主通道）。RN 端以 reference/rn-bootstrap.md 的 `src/tracking` 文件树为唯一标准结构（青鸟 RN SDK 通道），所有 RN 项目跑完后的结构必须与之一致。

## 铁律（不可违反）

1. **门禁不可跳过**：埋点清单（门禁1）、埋点方案（门禁2）必须经用户通过 AskUserQuestion 明确确认后才可推进；目标项目基建判定为 B/C 级时，预改造清单（门禁1.5）同样必须确认后才可动手。用户要求调整则改完重新确认。确认前不得写任何业务代码。
2. **埋点不侵入业务**：不得为埋点改变业务逻辑、增删功能、调整交互；trackAction 包装必须原样透传返回值并原样抛出异常。
3. **标准结构唯一、上报通道统一**：
   - PC：业务事件统一经 XlbTrackerAdapter 走 `@xlb/xlb-tracker` 上报 SLS，禁止自造 reporter/initTracker 通道、禁止绕过 bizTracker 直调通道 SDK；ARMS 仅作 RUM 通道保留（双发不裁剪）。
   - RN：业务事件统一经 `src/tracking` 的 bizTracker → reporter（青鸟 RN SDK）上报，文件树与导出以 rn-bootstrap.md 为准，禁止另造门面或绕过 bizTracker 直调青鸟 SDK。
   - 按基建分级执行（两端各有判定标准，见 02-survey）：A 级 → 按对应端 bootstrap 全套落位并接通；B/C 级（有基建但偏离标准结构/口径）→ 先走 03b-retrofit 预改造对齐再埋点；D 级（与标准一致）→ 复用既有封装直接加 events/chains/页面接入。任何分支都不得只落事件定义与调用点、留下无法上报的空壳。
4. **event_ver 变更必递增**：修改既有事件字典任意条目（含新增事件），必须递增对应 `XXX_EVENT_VER` 并在注释中记录变更。
5. **清单是唯一事实来源**：只埋清单内事件；必要的补充事件（查询、打开详情等链条过渡节点）归入 EXTRA_EVENTS 并在清单中标注「清单外补充」，经门禁确认后才可实施。
6. **其他埋点不算基建**：目标项目中已接入的其他埋点（友盟/神策/自写 track 工具/其他 SDK 等，不符合本 skill 标准结构的一律视为「其他埋点」）**原样保留、不迁移、不删除、不桥接、不复用其门面/字典/通道**；本次新事件一律走标准结构。「已有其他埋点」不得作为跳过 bootstrap 或沿用旧结构的理由。

## 触发条件

- **触发**：用户表述包含「埋点」「加埋点」「埋点接入」「推动埋点」等，且能提供埋点范围材料（清单文本/表格/截图/飞书文档导出）或要求 AI 自动识别埋点范围。
- **不触发**：埋点 SDK / 看板 / 分析侧本身的咨询或排障。

## 入口信息（两拍收集，提问阶段一次性问完）

**第一拍（AskUserQuestion 批次 1，3 张卡片）**：
1. 端：选项就是 `PC` / `RN`，不加多余描述；
2. 需求名：短中文名。用途 = `.ai-point/【需求名】/` 产物目录名 + 中断恢复锚点；落盘前检测目录是否已存在——存在则先问「继续该需求（按中断恢复续跑）/ 换个新需求名」；
3. 埋点范围：`提供清单材料（飞书/截图/md 文档等）` / `AI 自动识别埋点范围`（选后者则跳过材料解析，02 代码盘点产出清单草案，经门禁 1 确认后成为正式清单）。

**自动检测（不问，结论回显）**：PC——`@xlb/xlb-tracker` 依赖、`src/tracking` 形态（lib/business 分层、有无 XlbTrackerAdapter）、http 客户端（XlbFetch/axios）、用户信息源、TRACKING_KEY 类 ARMS key 变量名、XLB_DEPLOY_ENV 注入情况；RN——宿主青鸟 SDK 版本、宿主 init 是否传 `Config.ENV`、`.env.*` 四态是否齐全、`src/tracking` 是否为标准结构及上报口径、项目内其他埋点（铁律 6）。详见 01-collect。

**第二拍（AskUserQuestion 批次 2，≤3 张卡片）**：应用标识确认（默认占位 appId=`xlb-<域>-web`、appName=项目名，未登记也可先用，正式登记后替换并记人工依赖；选 Other 填正式值）、青鸟 event_id 登记情况（清单是否含 event_id 列）、基建形态确认 + 预改造授权（B/C 级时）。**上报通道不问用户**：PC 一律按 SCM 样板双发（SLS 主通道 + ARMS 兜底）；RN 一律走青鸟 RN SDK（rn-bootstrap reporter）。此后除门禁外不再提问。

## 工作流

```
01-collect      材料收集与端识别（两拍收集 + 自动检测）
  → 02-survey   代码梳理（基建四级判定[A 全套落位 / B·C 预改造 / D 复用] → 页面/操作点/API/现有埋点盘点）
  → 03b-retrofit 预改造（仅 B/C 级）── 【门禁1.5：用户确认预改造清单】
  → 03-point-list   埋点清单 ── 【门禁1：用户确认】
  → 04-point-plan   埋点方案 ── 【门禁2：用户确认】
  → 05-implement    按方案实施
  → 06-verify       验证 + 收尾报告
```

## 阶段路由

| 阶段 | 文件 | 进入时机 |
| --- | --- | --- |
| 1 材料收集 | [subskills/01-collect.md](subskills/01-collect.md) | 入口，必做 |
| 2 代码梳理 | [subskills/02-survey.md](subskills/02-survey.md) | 材料齐全后 |
| 2.5 预改造 | [subskills/03b-retrofit.md](subskills/03b-retrofit.md) | 仅基建判定 B/C 级时；【门禁1.5】 |
| 3 埋点清单 | [subskills/03-point-list.md](subskills/03-point-list.md) | 梳理完成后；【门禁1】 |
| 4 埋点方案 | [subskills/04-point-plan.md](subskills/04-point-plan.md) | 门禁1 通过后；【门禁2】 |
| 5 实施 | [subskills/05-implement.md](subskills/05-implement.md) | 门禁2 通过后 |
| 6 验证 | [subskills/06-verify.md](subskills/06-verify.md) | 实施完成后，必做 |

## 参考文件索引

| 文件 | 用途 | 加载时机 |
| --- | --- | --- |
| [reference/event-spec.md](reference/event-spec.md) | 事件/页面/链条定义口径、track vs trackAction 判定（两端通用，类型定义已内联） | 阶段 3/4/5 |
| [reference/pc-patterns.md](reference/pc-patterns.md) | PC 端目录结构、接入与调用模式（完整示例已内联） | 端=PC 时，阶段 2~6 |
| [reference/rn-patterns.md](reference/rn-patterns.md) | RN 端目录结构、接入与调用模式（完整示例已内联） | 端=RN 时，阶段 2~6 |
| [reference/pc-bootstrap.md](reference/pc-bootstrap.md) | PC 端 SCM 样板全套内联（SDK 骨架 + XlbTrackerAdapter + business 层 + 入口接线 + umirc 四态注入） | 端=PC 且基建 A 级时，阶段 2~6 |
| [reference/rn-bootstrap.md](reference/rn-bootstrap.md) | RN 端标准结构完整模板（同上 + 青鸟通道降级与验证钩子）；RN 唯一对齐基准 | 端=RN 且基建 A/B/C 级时，阶段 2~6 |
| [templates/point-list.md.tpl](templates/point-list.md.tpl) | 埋点清单模板 | 阶段 3 |
| [templates/point-plan.md.tpl](templates/point-plan.md.tpl) | 埋点方案模板 | 阶段 4 |

> 渐进式披露：SKILL.md 只含工作流骨架；按当前阶段 Read 对应 subskill，按用户选择的端 Read 对应 patterns，禁止提前全量加载。

## 文档输出

- 路径：**目标项目**根目录 `.ai-point/【需求名】/{source-list.md, survey.md, retrofit.md（仅 B/C 级）, point-list.md, point-plan.md, verify-report.md}`
- `.ai-point` 目录不存在时自动创建
- 文档格式使用 templates/ 下模板

## 中断恢复

再次进入时先检查目标项目 `.ai-point/【需求名】/` 已有产物：

| 已有产物 | 恢复点 |
| --- | --- |
| 无 / 只有 source-list.md | 从 01/02 继续 |
| survey.md（B/C 级，无 retrofit.md 或门禁1.5未过） | 回到 03b 预改造 |
| point-list.md（未经门禁1确认） | 回到门禁 1 |
| point-plan.md（未经门禁2确认） | 回到门禁 2 |
| point-plan.md 已确认、无 verify-report.md | 从 05 继续（先核对已改文件与方案一致性） |
| verify-report.md | 已完成，询问是否追加变更 |

## 所有提问必须通过 AskUserQuestion

所有需要用户做选择或确认的提问（入口两拍提问、各门禁、疑问澄清），必须通过 AskUserQuestion 工具生成结构化问题卡片，禁止以普通文本方式直接询问。
