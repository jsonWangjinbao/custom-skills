# 阶段 03：预检、门禁与提交

## 目标

调用看板 dry-run 获取基于实时数据库的 diff，用户确认后正式生成待办，并写同步报告。提交不直接生效。

接口或地址失败时 Read `../reference/api-contract.md`；需要排障时再 Read `../reference/troubleshooting.md`；写报告时 Read `../templates/sync-report.md.tpl`。

## 1. dry-run（不落库）

```bash
node "$SKILL_DIR/scripts/submit.mjs" dry-run \
  --payload "$REQ_DIR/board-sync/payload.json"
```

用户显式指定本地或 URL 时追加：

```bash
--board-url http://localhost:3001
```

命令会：

- 解析并 ping 看板；
- 调 `POST /api/sync/node-submissions`，body 带 `dryRun=true`；
- 打印实际看板地址及来源、节点类型、页面/事件 diff、告警、分析口径与派生码集；
- 写 `dry-run.json`（包含锁定地址 + payload 指纹）。

## 2. 审查 dry-run 结果

Read `dry-run.json`，检查：

1. `result.diff.kind` 新建/更新是否符合预期；
2. 实际看板地址是否正确；
3. pagesAdded/pagesModified/eventsAdded/eventsModified/eventsRemoved 是否符合本次埋点；
4. 有无库内独有页面（合入会保留）；
5. 有无「库内 eventVer 高于代码且事件不一致」红色风险；
6. analysis 中哪些字段默认写入、哪些因库内已有值默认保留；
7. derived 的 regressiveCodes / fulfillCodes / closeCodes 是否符合业务。

任何不符合：停止，回阶段 2 修 supplement 或退回开发 skill 修代码；修后必须重新生成 payload + dry-run。

## 3. 唯一门禁（AskUserQuestion）

问题必须同时包含高信号摘要：

- 看板地址；
- 节点 nodeKey、端、新建/更新；
- 页面与事件变更计数；
- warnings（如有）；
- 明确写「提交后进入待办，尚不生效」。

选项：

1. `确认提交（Recommended）`：创建待办；
2. `调整配置`：回阶段 2；
3. `取消`：结束，不提交。

用户在普通文本里说「继续/执行」不等同于本门禁确认；必须通过 AskUserQuestion。

## 4. 正式提交

用户确认后：

```bash
node "$SKILL_DIR/scripts/submit.mjs" submit \
  --payload "$REQ_DIR/board-sync/payload.json"
```

- 脚本强制沿用 dry-run 锁定的地址；不重新自动选址。
- payload 指纹变化会拒绝提交，必须重新 dry-run + 门禁。
- 成功写 `submission.json` 并打印待办链接。
- `idempotent=true` 表示内容相同的 pending 已存在，返回原待办，不是错误。
- `supersededIds` 非空时在报告写明旧待办已被替代。

## 5. 写同步报告

按模板写 `sync-report.md`，状态必须是：

- 刚提交：`已提交待审核，尚未生效`
- status=merged：`已合入并生效`
- status=rejected：`已驳回，未生效`
- status=superseded：`已被新提交替代，未生效`

不得把 dry-run 成功或 pending 说成同步完成。

## 6. 状态查询（恢复入口）

有 submission.json 时先执行：

```bash
node "$SKILL_DIR/scripts/submit.mjs" status \
  --record "$REQ_DIR/board-sync/submission.json"
```

处理：

- pending：回显待办链接，不重复提交；
- merged：更新报告为已生效；若 notifyStatus=failed，明确说明「配置已生效，但飞书通知失败」；
- rejected：回显原因，按原因修代码或 supplement，之后重新完整走 payload → dry-run → 门禁 → submit；
- superseded：查找最新 submission.json（若当前目录仍指旧记录，重新提交前必须 dry-run）。

## 7. 最终回执

仅三项：

1. 状态（已提交待审核 / 已合入 / 已驳回）；
2. nodeKey、端、页面/事件数量；
3. 待办链接与报告文件链接。
