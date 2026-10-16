# Phase 3 - 埋点清单（门禁 1）

## 进入条件

- `survey.md` 已生成，无阻断疑问
- 基建判定 B/C 级时：`retrofit.md` 已通过门禁 1.5 且预改造验证通过

## 任务

1. 加载 [../reference/event-spec.md](../reference/event-spec.md) 与对应端 patterns
2. 按 [../templates/point-list.md.tpl](../templates/point-list.md.tpl) 生成 `.ai-point/【需求名】/point-list.md`：
   - 清单条目逐一映射为事件定义草案：
     - `code`：snake_case 机器编码（如 `batch_audit`、`appoint_confirm`）
     - `name`：与清单「事件名称」**严格一致**（给人看，不改写）
     - `type`：清单「浏览」→ `view`；「点击」→ `click`
     - `step`：链条环节归桶（判定规则见 event-spec.md）
     - `regressive` / `terminal`：按 event-spec.md 口径判定
     - `qingniaoId`：取清单「event_id」列；无则留空
     - `pagePath`：取清单「页面路径」列
   - 每条标注现状：新增 / 已有（复用） / 需改造（说明与既有定义的差异）
   - 补充事件（查询、打开详情、页面离开等链条必需过渡节点）单独成组，标注「清单外补充」并写明理由
3. 判定存疑条目（step 归桶拿不准、清单描述与代码对不上、code 与既有事件冲突）在清单中标「⚠ 待确认」并在文末集中列出

## 门禁 1（必须执行）

用 AskUserQuestion 请用户审阅：

「埋点清单已生成：`.ai-point/【需求名】/point-list.md`，共 N 条（新增 X / 复用 Y / 改造 Z / 清单外补充 W / 待确认 V）。请确认：」

- 选项：确认无误 / 需要调整（说明调整点） / 有材料要补充

## 出口

- 用户确认 → 进入 [04-point-plan.md](04-point-plan.md)
- 用户要求调整 → 修改清单后重新走门禁 1
