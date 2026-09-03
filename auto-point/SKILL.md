---
name: auto-point
description: 自动埋点 — 当用户提供埋点范围清单/文档/截图并说「埋点」「加埋点」「推动埋点」「埋点接入」时，按「收集材料 → 梳理代码 → 埋点清单 → 埋点方案 → 实施 → 验证」流程推进 PC/RN 业务埋点，含清单、方案两道人工门禁，产物落在目标项目 .ai-point/ 目录。
---

# auto-point

业务埋点工作流：收集材料 → 梳理代码 → 【门禁1】埋点清单 → 【门禁2】埋点方案 → 实施 → 验证。支持 PC / RN 两端。

## 铁律（不可违反）

1. **两道门禁不可跳过**：埋点清单、埋点方案必须经用户通过 AskUserQuestion 明确确认后才可推进；用户要求调整则改完重新确认。确认前不得写任何业务代码。
2. **埋点不侵入业务**：不得为埋点改变业务逻辑、增删功能、调整交互；trackAction 包装必须原样透传返回值并原样抛出异常。
3. **封装复用优先、bootstrap 兜底**：目标项目已有埋点封装（bizTracker 等）→ 复用既有封装与口径，禁止另起一套；无基建 → 按 reference/{pc,rn}-bootstrap.md 从零封装（types/context/reporter/apiCapture/tracker 全套代码已内联）并接通应用入口，确保事件能真实上报——不得只落事件定义与调用点、留下无法上报的空壳。
4. **event_ver 变更必递增**：修改既有事件字典任意条目（含新增事件），必须递增对应 `XXX_EVENT_VER` 并在注释中记录变更。
5. **清单是唯一事实来源**：只埋清单内事件；必要的补充事件（查询、打开详情等链条过渡节点）归入 EXTRA_EVENTS 并在清单中标注「清单外补充」，经门禁确认后才可实施。

## 触发条件

- **触发**：用户表述包含「埋点」「加埋点」「埋点接入」「推动埋点」等，且能提供埋点范围材料（清单文本/表格/截图/飞书文档导出）。
- **不触发**：埋点 SDK / 看板 / 分析侧本身的咨询或排障。

## 入口信息（AskUserQuestion）

1. **端**：PC / RN —— 决定加载哪套 reference 与接入模式
2. **埋点范围材料**：清单文本粘贴 / 截图 / 文件路径（飞书表格导出）
3. **需求名**：短中文名（如「发货单埋点」），用于创建 `.ai-point/【需求名】/`

## 工作流

```
01-collect      材料收集与端识别
  → 02-survey   代码梳理（基建检查[有→复用 / 无→bootstrap] → 页面/操作点/API/现有埋点盘点）
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
| [reference/pc-bootstrap.md](reference/pc-bootstrap.md) | PC 端从零封装完整模板（types/context/reporter/apiCapture/tracker/index + 入口接线） | 端=PC 且目标项目无基建时，阶段 2~6 |
| [reference/rn-bootstrap.md](reference/rn-bootstrap.md) | RN 端从零封装完整模板（同上 + 青鸟通道降级与验证钩子） | 端=RN 且目标项目无基建时，阶段 2~6 |
| [templates/point-list.md.tpl](templates/point-list.md.tpl) | 埋点清单模板 | 阶段 3 |
| [templates/point-plan.md.tpl](templates/point-plan.md.tpl) | 埋点方案模板 | 阶段 4 |

> 渐进式披露：SKILL.md 只含工作流骨架；按当前阶段 Read 对应 subskill，按用户选择的端 Read 对应 patterns，禁止提前全量加载。

## 文档输出

- 路径：**目标项目**根目录 `.ai-point/【需求名】/{source-list.md, survey.md, point-list.md, point-plan.md, verify-report.md}`
- `.ai-point` 目录不存在时自动创建
- 文档格式使用 templates/ 下模板

## 中断恢复

再次进入时先检查目标项目 `.ai-point/【需求名】/` 已有产物：

| 已有产物 | 恢复点 |
| --- | --- |
| 无 / 只有 source-list.md | 从 01/02 继续 |
| point-list.md（未经门禁1确认） | 回到门禁 1 |
| point-plan.md（未经门禁2确认） | 回到门禁 2 |
| point-plan.md 已确认、无 verify-report.md | 从 05 继续（先核对已改文件与方案一致性） |
| verify-report.md | 已完成，询问是否追加变更 |

## 所有提问必须通过 AskUserQuestion

所有需要用户做选择或确认的提问（入口三问、两道门禁、疑问澄清），必须通过 AskUserQuestion 工具生成结构化问题卡片，禁止以普通文本方式直接询问。
