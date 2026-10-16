# Phase 3 - 埋点清单（门禁 1）

## 进入条件

- `survey.md` 已生成（含配置 diff 结果），无阻断疑问

## 任务

1. 加载 [../reference/event-spec.md](../reference/event-spec.md)、[../reference/config-sync.md](../reference/config-sync.md) 与对应端 patterns
2. 按 [../templates/point-list.md.tpl](../templates/point-list.md.tpl) 生成 `.ai-point/【需求名】/point-list.md`：
   - 清单条目**直接取自 config-bundle.json**（字段已就绪，无需推导）：
     - `code` / `name` / `type` / `step` / `regressive` / `terminal` / `qingniaoId`：原样引用
     - `terminalKind`：配置中心扩展字段，写入清单供人工阅读，**不进代码**
     - `pagePath`：取页面 `pagePath`
   - 每条现状列取 diff 分类：新增 / 需改造（逐项列出差异：字段 旧值 → 新值）/ 复用（bundle 与代码完全一致）
   - 「清单外补充事件」组取 bundle `extraEvents`，标注「配置中心维护的过渡节点」
   - 「待清理」组列代码有而 bundle 无的事件（不自动删除，门禁时由用户决策）
3. 判定存疑条目（操作点找不到、代码事件与配置对不上、待清理事件）在清单中标「⚠ 待确认」并在文末集中列出
4. 清单头部记录每页面 `eventVer`（05 实施时原样写入 `XXX_EVENT_VER`）

## 门禁 1（必须执行）

用 AskUserQuestion 请用户审阅：

「埋点清单已生成：`.ai-point/【需求名】/point-list.md`，以配置中心为准：共 N 条（新增 X / 复用 Y / 改造 Z / 清单外补充 W / 待清理 K / 待确认 V）。请确认：」

- 选项：确认无误 / 需要调整（说明调整点） / 配置有误会去配置中心改

> 用户若发现清单内容不对，正确路径是**回配置中心修改事件清单后重新拉 bundle**，而不是在清单文档里手改——保证事实来源唯一。

## 出口

- 用户确认 → 进入 [04-point-plan.md](04-point-plan.md)
- 用户要求调整 → 调整配置中心后重新拉 bundle 走 01~03，或修改 diff 判断后重新走门禁 1
