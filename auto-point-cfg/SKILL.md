---
name: auto-point-cfg
description: 自动埋点（配置中心驱动）— 当用户说「埋点」「加埋点」「埋点接入」「同步埋点配置」且目标节点已在链条看板配置中心维护事件清单时，按「拉取配置 → 梳理代码+配置diff → 埋点清单 → 埋点方案 → 实施 → 验证回写」流程推进 PC/RN 业务埋点。与 auto-point 的区别：埋点范围以配置中心（xlb-chain-board）为事实来源，不需要飞书清单材料；已有埋点则对比更新。
---

# auto-point-cfg

业务埋点工作流（配置中心驱动）：拉取配置 → 梳理代码 + 配置 diff → 【门禁1】埋点清单 → 【门禁2】埋点方案 → 实施 → 验证 + 配置中心回写。支持 PC / RN 两端。

## 铁律（不可违反）

1. **两道门禁不可跳过**：埋点清单、埋点方案必须经用户通过 AskUserQuestion 明确确认后才可推进；用户要求调整则改完重新确认。确认前不得写任何业务代码。
2. **埋点不侵入业务**：不得为埋点改变业务逻辑、增删功能、调整交互；trackAction 包装必须原样透传返回值并原样抛出异常。
3. **封装复用优先、bootstrap 兜底**：目标项目已有埋点封装（bizTracker 等）→ 复用既有封装与口径，禁止另起一套；无基建 → 按 reference/{pc,rn}-bootstrap.md 从零封装（types/context/reporter/apiCapture/tracker 全套代码已内联）并接通应用入口，确保事件能真实上报——不得只落事件定义与调用点、留下无法上报的空壳。
4. **event_ver 以配置中心为准**：字典版本取 bundle 中的 `eventVer` 原样写入 `XXX_EVENT_VER`；配置中心在事件集变化时已自动 bump minor，skill 不自行递增、不改写。
5. **配置中心是「埋什么」的唯一事实来源**：只实施 bundle 内事件；配置有代码无 → 新增；同 code 字段不一致 → 需改造；代码有配置无 → 标「待清理」列入待确认，**不得静默删除**。

## 触发条件

- **触发**：用户表述包含「埋点」「加埋点」「埋点接入」「推动埋点」「同步埋点配置」等，且目标单据节点已在配置中心维护事件清单。
- **不触发**：埋点 SDK / 看板 / 分析侧本身的咨询或排障；无配置中心可用、需从飞书清单起步的埋点（走 auto-point）。

## 入口信息（AskUserQuestion）

1. **端**：PC / RN —— 决定加载哪套 reference、拉取 bundle 的 platform 参数
2. **nodeKey 列表**：逗号分隔的节点 ID（= order_type，如 `delivery_note`、`purchase_order`）—— 与配置中心节点库一致
3. **需求名**：短中文名（如「发货单埋点」），用于创建 `.ai-point/【需求名】/`

> board 地址解析与 bundle/diff/回写契约见 [reference/config-sync.md](reference/config-sync.md)。

## 工作流

```
01-collect      拉取配置中心 bundle（board 探测 → bundle 落盘）
  → 02-survey   代码梳理（基建检查[有→复用 / 无→bootstrap] → 页面/操作点/API 盘点 → 配置 vs 代码 diff）
  → 03-point-list   埋点清单（diff 视图）── 【门禁1：用户确认】
  → 04-point-plan   埋点方案 ── 【门禁2：用户确认】
  → 05-implement    按方案实施（字典字段与 bundle 逐字段一致）
  → 06-verify       验证 + 回写配置中心 + 收尾报告
```

## 阶段路由

| 阶段 | 文件 | 进入时机 |
| --- | --- | --- |
| 1 拉取配置 | [subskills/01-collect.md](subskills/01-collect.md) | 入口，必做 |
| 2 代码梳理 | [subskills/02-survey.md](subskills/02-survey.md) | bundle 落盘后 |
| 3 埋点清单 | [subskills/03-point-list.md](subskills/03-point-list.md) | 梳理完成后；【门禁1】 |
| 4 埋点方案 | [subskills/04-point-plan.md](subskills/04-point-plan.md) | 门禁1 通过后；【门禁2】 |
| 5 实施 | [subskills/05-implement.md](subskills/05-implement.md) | 门禁2 通过后 |
| 6 验证 | [subskills/06-verify.md](subskills/06-verify.md) | 实施完成后，必做 |

## 参考文件索引

| 文件 | 用途 | 加载时机 |
| --- | --- | --- |
| [reference/config-sync.md](reference/config-sync.md) | board 地址解析、bundle API 契约、diff 规则、代码生成口径、回写契约 | 阶段 1/2/5/6 |
| [reference/event-spec.md](reference/event-spec.md) | 事件/页面/链条定义口径、track vs trackAction 判定（两端通用，类型定义已内联） | 阶段 3/4/5 |
| [reference/pc-patterns.md](reference/pc-patterns.md) | PC 端目录结构、接入与调用模式（完整示例已内联） | 端=PC 时，阶段 2~6 |
| [reference/rn-patterns.md](reference/rn-patterns.md) | RN 端目录结构、接入与调用模式（完整示例已内联） | 端=RN 时，阶段 2~6 |
| [reference/pc-bootstrap.md](reference/pc-bootstrap.md) | PC 端从零封装完整模板（types/context/reporter/apiCapture/tracker/index + 入口接线） | 端=PC 且目标项目无基建时，阶段 2~6 |
| [reference/rn-bootstrap.md](reference/rn-bootstrap.md) | RN 端从零封装完整模板（同上 + 青鸟通道降级与验证钩子） | 端=RN 且目标项目无基建时，阶段 2~6 |
| [templates/point-list.md.tpl](templates/point-list.md.tpl) | 埋点清单模板（diff 视图） | 阶段 3 |
| [templates/point-plan.md.tpl](templates/point-plan.md.tpl) | 埋点方案模板 | 阶段 4 |

> 渐进式披露：SKILL.md 只含工作流骨架；按当前阶段 Read 对应 subskill，按用户选择的端 Read 对应 patterns，禁止提前全量加载。

## 文档输出

- 路径：**目标项目**根目录 `.ai-point/【需求名】/{config-bundle.json, survey.md, point-list.md, point-plan.md, verify-report.md}`
- `.ai-point` 目录不存在时自动创建
- 文档格式使用 templates/ 下模板

## 中断恢复

再次进入时先检查目标项目 `.ai-point/【需求名】/` 已有产物：

| 已有产物 | 恢复点 |
| --- | --- |
| 无 / 只有 config-bundle.json | 重新拉取 bundle（配置可能已更新）后从 02 继续 |
| point-list.md（未经门禁1确认） | 回到门禁 1 |
| point-plan.md（未经门禁2确认） | 回到门禁 2 |
| point-plan.md 已确认、无 verify-report.md | 从 05 继续（先核对已改文件与方案一致性） |
| verify-report.md | 已完成，询问是否追加变更（追加需重新拉 bundle 走 diff） |

## 所有提问必须通过 AskUserQuestion

所有需要用户做选择或确认的提问（入口三问、两道门禁、疑问澄清），必须通过 AskUserQuestion 工具生成结构化问题卡片，禁止以普通文本方式直接询问。
