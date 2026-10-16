# 阶段 02：提取与补齐

## 目标

用脚本从代码确定性提取事件字典，模型只生成受限的 `supplement.json`，再由脚本生成 `payload.json`。不得手改 extract.json 或 payload.json。

进入时 Read `../reference/field-mapping.md` 和 `../templates/supplement.json.tpl`。

## 步骤

### 1. 创建输出目录并提取

```bash
mkdir -p "$REQ_DIR/board-sync"
npx -y tsx "$SKILL_DIR/scripts/extract.mjs" \
  --root "$PROJECT_ROOT" \
  --platform rn \
  --out "$REQ_DIR/board-sync/extract.json"
```

- PC 把 `rn` 改为 `pc`。
- 非默认 tracking 目录加 `--tracking-dir <相对项目根路径>`。
- 优先用目标项目已有 `tsx`（如 `./node_modules/.bin/tsx`）；没有时用 `npx -y tsx`。
- `npx` 无法下载时停止，提示安装 `tsx`；不得改用正则读取 TS 源码生成 payload。

脚本输出后：

1. Read 完整 `extract.json`；
2. 回显链条、页面、事件总数、脚本 warnings；
3. warnings 有「页面已跳过」「未能确定归属」时不得继续，先按 field-mapping 的多链条规则解决。

### 2. 确定 nodeKey 与页面范围

- 只有一条链条 → 自动选 `orderType ?? chainId`。
- 多条链条：若需求目录 / 上下文只涉及其中一条，自动选中并回显；否则 AskUserQuestion 选择。
- 默认只选 extract 中 `page.nodeKey === nodeKey` 的页面。
- `page.nodeKey=null` 的页面不得自动带入；确认归属后在 supplement.pages 显式列出。
- 不得把代码已归属其他 nodeKey 的页面改挂当前节点；脚本会拒绝。

### 3. 补齐人工字段

按模板创建 `supplement.json`，最小字段：

- `nodeKey`
- `node.name`、`node.category`（新节点必填；已有节点也建议提供，服务端更新时不会覆盖库内标题分类）
- `requirement`
- 每个终态事件的 `terminalKinds`

字段来源与口径见 field-mapping。特别注意：

- `terminalKind` 能从已确认 point-list 明确判定时直接填写，并回显证据；例如「任务达成终态」= fulfill，「删除/作废」= close。
- 不能明确判定时，按终态事件分组通过 AskUserQuestion 询问；每题选项：`履约完成 fulfill` / `终结未履约 close`。不得把 terminal 改成 false 来绕过。
- pageId/pageRoute/stateNames 没有可靠来源就不填/null，不能猜。
- remark 可从 point-list 备注列补；代码中已有事件通常没有该字段。看板已有同页同 code remark 会在合入时自动继承，不需要重复抄回。

### 4. 生成 payload

```bash
node "$SKILL_DIR/scripts/payload.mjs" \
  --extract "$REQ_DIR/board-sync/extract.json" \
  --supplement "$REQ_DIR/board-sync/supplement.json" \
  --out "$REQ_DIR/board-sync/payload.json"
```

失败时只修改 supplement.json 后重跑；不得手改 payload.json。

### 5. 本地完整性检查

Read payload.json，核对：

- platform / nodeKey 正确；
- 页面数与本次需求一致；
- `events + extraEvents` 总数与 extract 一致；
- 每个 terminal 事件都有 terminalKind；
- source.repo / branch / commit / submitter 符合当前项目；
- commit 带 `-dirty` 时明确回显「提交基于未提交工作区代码」，这是追溯信息，不阻断；
- 提交人无 email 时提示「合入/驳回结果无法飞书通知」，不阻断。

完成后 Read `03-submit.md`。
