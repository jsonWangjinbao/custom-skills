# auto-point-sync 设计方案（v2：提交 → 待办 → 合入）

> 状态：本地实现与验证完成；线上部署和飞书实发待处理 ｜ 涉及仓库：`custom-skills/auto-point-sync/`、`xlb-chain-board`
> v2 变更：放弃直连数据库；skill 调用看板接口提交配置，在看板生成待办，由具备 `submission.merge` 权限的成员审核合入后正式生效。

## 一、定位与范围

- 用途：auto-point 埋点验证通过后，把目标项目的事件字典作为「节点配置提交」推送到 xlb-chain-board。
- 生效方式：提交只进入待办，不改动 `doc_nodes`；owner / admin 在待办页审核合入后才生效。
- 范围：只处理节点配置（`doc_nodes`），不处理链条挂载、通用配置。
- 使用者：任意开发在自己的业务仓库执行，不需要 clone 或启动看板，也不需要数据库凭据。

## 二、整体流程

```
业务仓库（skill）                         xlb-chain-board
──────────────────                         ─────────────────────────────
01 收集 .ai-point 产物
02 提取事件字典 → payload
03 dry-run 提交 ───────────────────────▶  计算与现网节点的 diff（不落库）
   【门禁：开发确认 diff】 ◀────────────  返回 diff 摘要
   正式提交 ───────────────────────────▶  写入 doc_node_submissions（pending）
   输出待办链接 ◀──────────────────────   返回 id + reviewPath（skill 拼接实际地址）
                                           配置中心「待办」Tab 显示角标
                                           有 submission.merge 权限者查看 diff → 合入 / 驳回
                                           合入：事务内写 doc_nodes，状态 merged
```

## 三、接口约定

### 3.1 鉴权

- 提交接口使用固定 Bearer 令牌；看板与 skill v1 在代码中约定同一个值，并用 `timingSafeEqual` 比对，不需要部署环境变量或开发者本机配置。
- 固定令牌随代码公开，不属于安全秘密，只用于拒绝无意请求和识别协议版本；任何拿到代码的人都能创建待办。
- 风险边界：创建待办不直接改配置；合入始终需要飞书登录且具备 `submission.merge` 权限。
- 提交人身份由 skill 取 `git config user.name / user.email` 自报，仅作展示和追溯，不作鉴权依据。

### 3.2 提交：`POST /api/sync/node-submissions`

```jsonc
{
  "dryRun": true,                       // true = 只返回 diff，不落库
  "platform": "rn",                     // pc | rn
  "node": {
    "nodeKey": "storehouse_spot_check", // = order_type，必填
    "name": "仓库商品抽检",              // 新建节点必填；已有节点忽略
    "category": "FSMS",                 // 同上
    "desc": "…",                        // 可选，≤191 字符
    "pageId": null,                     // 可选
    "pageRoute": null                   // 可选
  },
  "profile": { "pages": [ /* PageTrackingCfg[]，结构同 lib/config/types.ts */ ] },
  "analysis": {                         // 分析口径建议值，可选
    "stepOrder": ["enter", "browse", "handle", "reply"],
    "stepNames": { "enter": "进入任务" },
    "stateNames": null,
    "intentSteps": ["handle"]
  },
  "source": {
    "repo": "remote-app-fsms",
    "branch": "feature-xxx",
    "commit": "a1b2c3d",
    "requirement": "仓库商品抽检埋点",  // .ai-point 需求名
    "submitter": { "name": "张三", "email": "zhangsan@xlb.com" },
    "skill": "auto-point-sync@1.0.0",
    "implAt": "2026-10-13T10:00:00.000Z" // verify-report 通过时间
  }
}
```

- 校验：复用 `pageTrackingCfgSchema`、`nodeCreateSchema` 中 nodeKey/name/category 规则，新增 `nodeSubmissionSchema`；请求体上限 256KB。
- 响应（200 / 201）：

```jsonc
{
  "success": true,
  "data": {
    "id": "clxxx",                  // dryRun 时为 null
    "status": "pending",            // dryRun 时为 null
    "kind": "create",               // create = 新建节点 | update = 更新已有节点
    "reviewPath": "/config/submissions?id=clxxx", // skill 拼接本次实际使用的看板地址
    "supersededIds": [],            // 被本次替代的旧待办
    "diff": { /* 见 3.4 */ }
  }
}
```

- 错误：401 固定令牌版本不一致；400 校验失败（`error` 汇总各字段原因）。

### 3.3 查询状态：`GET /api/sync/node-submissions/{id}`

- 同样使用令牌鉴权；返回 `status`、`reviewerName`、`reviewedAt`、`reviewComment`、`notifyStatus`、`notifyError`。skill 用它回显合入结果，不轮询。

### 3.4 diff 结构（提交响应与待办详情共用同一纯函数）

```jsonc
{
  "nodeExists": true,
  "nodeFields": [{ "field": "desc", "from": "…", "to": "…" }],
  "pages": [
    {
      "pageCode": "storehouseSpotCheckList",
      "change": "added | modified | unchanged | dbOnly",
      "eventVer": { "db": "1.0.0", "code": "1.0.0" },
      "events": [{ "code": "scan", "change": "added | modified | removed", "fields": ["step"] }]
    }
  ],
  "analysis": [{ "field": "stepOrder", "db": null, "suggested": [] }],
  "derived": { "regressiveCodes": [], "fulfillCodes": [], "closeCodes": [] },
  "warnings": ["库内 eventVer 1.2.0 高于代码 1.0.0，且事件不一致"]
}
```

## 四、看板侧改动

### 4.1 数据表 `doc_node_submissions`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | String cuid | 主键 |
| nodeKey | String | 目标节点 |
| platform | String | pc / rn |
| kind | String | create / update（提交时判定，合入时按实际重算） |
| status | String | pending / merged / rejected / superseded |
| payload | Json | node + profile + analysis 原样 |
| payloadHash | String | 幂等判定 |
| summary | Json | 页面/事件变更计数，列表免读大 payload |
| source | Json | repo / branch / commit / requirement / submitter / skill / implAt |
| reviewerId | String? | 审核人 users.id |
| reviewerName | String? | 审核人名称快照 |
| reviewComment | String? | 驳回原因 / 合入备注 |
| reviewedAt | DateTime? | 审核时间 |
| notifyStatus | String? | sent / failed / skipped，合入或驳回后的飞书通知结果 |
| notifyError | String? | 通知失败或跳过的原因（≤500 字符） |
| createdAt / updatedAt | DateTime | — |

- 索引：`(status, createdAt)`、`(nodeKey, platform, status)`。
- 同一 `nodeKey + platform` 同时只保留一条 pending：新提交到达时，旧 pending 置为 superseded。
- 幂等：payloadHash 与现存 pending 相同时直接返回原记录，不新建。

### 4.2 权限

- 新增权限点 `submission.merge`（合入/驳回节点配置提交），归入「节点配置」分组。
- 默认授予 owner；admin 本来就拥有全量权限。member 仅可查看待办（`config.view`）。
- 合入、驳回接口用 `requirePermission(req, "submission.merge")` 拦截。

### 4.3 管理接口（飞书会话鉴权）

| 接口 | 权限 | 说明 |
| --- | --- | --- |
| `GET /api/config/submissions?status=` | config.view | 列表；附 pending 总数供角标使用 |
| `GET /api/config/submissions/{id}` | config.view | 详情 + 按现网节点实时计算的 diff + 当前节点 `updatedAt` |
| `POST /api/config/submissions/{id}/merge` | submission.merge | body：`{ expectedUpdatedAt, name?, category?, overwriteAnalysis, comment? }` |
| `POST /api/config/submissions/{id}/reject` | submission.merge | body：`{ comment }`，必填 |

### 4.4 合入规则（事务内执行）

1. 重新读取节点，`updatedAt` 必须等于 `expectedUpdatedAt`（审核人看到的版本），否则返回 409「节点已被修改，请刷新后重新核对」。
2. 提交状态必须仍为 pending，否则返回 409。
3. **按端隔离**：只覆盖 `platforms[提交端]`，另一端不动。
4. **按 pageCode 合并**：提交中的页面整页覆盖；库内独有页面保留（可能来自同端其他仓库，如采购收货单同时挂在 ERP 与 SCM）。
5. **eventVer 以代码为准**：写入提交中的版本，不走自动 bump。库内版本更高且事件不一致时，详情页红色告警，合入按钮需二次确认。
6. **PAGE_VIEW 补齐**：页面缺 enter/view 事件时补到首位（复用 board 现有规则）。
7. **remark 继承**：代码通常没有看板备注；提交没带 remark 时继承库内同页同 code 事件的 remark，supplement 显式给值时才覆盖。
8. **分析口径**：stepOrder / stepNames / stateNames / intentSteps 默认只填库内为 null 的字段；审核人勾选 `overwriteExisting` 才覆盖（同一开关也覆盖已有描述/页面标识）。
9. **三码集**：按合并后全端事件用 `deriveCodeSets` 重新派生并覆盖，与现有节点保存行为一致。
10. 设置 `tracked = true`、`lastImplAt = source.implAt`；新建节点时 name / category 允许审核人在合入前修改。
11. 写入后调用 `invalidateTrackingConfigCache()`，提交置为 merged 并记录审核人。
12. 事务提交后发送飞书通知（见 4.6）；通知失败不回滚合入。

### 4.5 待办页面

- **入口**：配置中心 Segmented 新增「待办」Tab（`/config/submissions`），标签带 pending 数角标；具备 `submission.merge` 且 pending > 0 时，配置中心顶部显示一条提示「有 N 条节点配置待处理」。
- **列表**：状态切换（待处理 / 已合入 / 已驳回 / 已替代）；列为节点（名称 + nodeKey）、端、类型（新建/更新）、来源（仓库@分支·commit）、需求名、提交人、提交时间、变更摘要（如「页面 +1，事件 +12 / ~2」）、操作。
- **详情抽屉**（沿用 NodeEditDrawer 的抽屉形态）：
  - 头部：来源信息、告警（eventVer 落后、节点在提交后被修改、库内独有页面）。
  - 节点基础信息：新建时 name / category 可编辑。
  - 页面事件 diff：按页面分组，新增绿色、修改黄色并标出变化字段、代码中已删除的事件红色。
  - 分析口径：建议值与现值对照，「覆盖已有分析口径」勾选框。
  - 派生三码集预览。
  - 操作：「合入」「驳回（需填原因）」；无权限时按钮隐藏，只读查看。

### 4.6 飞书通知

- **触发**：合入或驳回成功后，通知提交人。新提交到达时不通知审核人，审核人通过待办角标和顶部提示获知。
- **接收人解析**：
  1. 用 `source.submitter.email` 匹配 `users` 表的 `email` 或 `enterpriseEmail`，命中则按 `open_id` 发送；
  2. 未命中则按 `receive_id_type=email` 直接用该邮箱发送；
  3. 没有邮箱则跳过，`notifyStatus=skipped`。
- **发送方式**：`lib/feishu.ts` 新增 `getTenantAccessToken()` 与 `sendBotCard()`，调用 `POST /open-apis/im/v1/messages`，消息为卡片。
- **内容**：结果（已合入 / 已驳回）、节点名称与 nodeKey、端、需求名、审核人、合入备注或驳回原因、待办详情链接。
- **失败可见**：失败只记录到 `notifyStatus=failed` 与 `notifyError`，不回滚合入；待办列表和详情显示通知状态，合入成功的提示文案同时说明通知失败。
- **前置依赖**：飞书应用需开启机器人能力并开通 `im:message:send_as_bot` 权限，提交人需在应用可用范围内。目前代码中没有发消息的先例，需要在开放平台核实。

### 4.7 文件清单

| 文件 | 改动 |
| --- | --- |
| `prisma/schema.prisma` + `prisma/migrations/2026101x_add_node_submissions/` | 新增表 |
| `src/lib/auth/permissions.ts` | 新增 `submission.merge` 及标签、分组、owner 默认 |
| `src/lib/auth/syncToken.ts` | 固定令牌校验（不依赖环境变量） |
| `src/lib/feishu.ts` | 新增 tenant_access_token 获取与机器人发消息 |
| `src/lib/config/submissionStore.ts` | DTO、幂等哈希、接收人解析、卡片内容、通知结果回写 |
| `src/lib/config/submission.ts` | 提交 schema、diff 纯函数、合入数据构造纯函数 |
| `src/lib/config/submission.test.ts` | diff 与合入规则单测（`tsx --test`） |
| `src/app/api/sync/node-submissions/route.ts`、`[id]/route.ts` | 令牌接口 |
| `src/app/api/config/submissions/route.ts`、`[id]/route.ts`、`[id]/merge/route.ts`、`[id]/reject/route.ts` | 管理接口 |
| `src/app/config/layout.tsx` | 新增 Tab、角标、顶部提示 |
| `src/app/config/submissions/page.tsx`、`SubmissionDrawer.tsx` | 待办列表与详情 |

## 五、skill 侧设计

### 5.1 目录结构（渐进式加载）

```
auto-point-sync/
├── SKILL.md                 # 触发条件、铁律、流程骨架、阶段路由（常驻，约 70 行）
├── subskills/               # 按阶段 Read
│   ├── 01-collect.md        # 定位 .ai-point 产物、校验 verify 通过、识别端与 nodeKey
│   ├── 02-extract.md        # 跑提取脚本，补齐人工字段，生成 payload
│   └── 03-submit.md         # dry-run → 【门禁】→ 正式提交 → 报告
├── reference/               # 按需 Read
│   ├── field-mapping.md     # 代码/产物 → payload 字段映射
│   ├── api-contract.md      # 接口、令牌配置、错误码
│   └── troubleshooting.md   # 401/400/503、网络不通、提交被替代等处置
├── templates/
│   ├── supplement.json.tpl
│   └── sync-report.md.tpl
└── scripts/
    ├── extract.mjs          # tsx 加载 events/*.ts、chains*.ts → extract.json
    ├── payload.mjs          # extract + supplement → 确定性生成 payload.json
    └── submit.mjs           # Node 18 fetch；dry-run / submit / status
```

- 不再依赖 mysql2；校验以服务端为准，skill 不复制 zod schema，避免两份规则漂移。
- 确定性工作（提取、提交、状态查询）全部在脚本中完成；模型只补齐代码中没有的字段并组织门禁。

### 5.2 阶段说明

**01-collect**
1. 定位 `.ai-point/【需求名】/`；`verify-report.md` 不存在或未通过则停止。
2. 识别端与事件字典目录：PC 为 `src/tracking/business/events/`，RN 为 `src/tracking/events/`。
3. 从 `chains.ts` 取 `orderType ?? chainId` 作为 nodeKey。

**02-extract**
1. `extract.mjs` 按导出值形状提取 PageDef、EVENT_VER、含 PAGE_VIEW 的主字典，以及 EXTRA/REPORT 等其他事件字典；其他字典统一并入 extraEvents，PAGE_LEAVE 不提交。
2. 模型只写 `supplement.json` 补齐人工字段（见下表）；`payload.mjs` 确定性生成 payload.json，二者之外的生成文件不得手改。

| 字段 | 来源 | 规则 |
| --- | --- | --- |
| node.name / category | point-list 标题、项目域 | 新节点时在门禁中确认 |
| node.desc | 模板 | `{域} {单据}（{仓库} {端} 业务埋点，chain_id / order_type = {nodeKey}）` |
| node.pageId / pageRoute | survey.md、路由配置 | 无可靠来源置 null，报告列为人工依赖 |
| events[].terminalKind | point-list 备注 | 代码无此字段；每个 `terminal: true` 事件必须定为 fulfill / close，无法判定时在门禁中询问 |
| events[].remark | point-list 备注列 | 可选 |
| analysis.stepOrder / stepNames | 事件 step + 默认环节全集 | 按环节全集顺序排列，abort / leave 不进漏斗 |
| analysis.stateNames | survey.md 状态枚举 | 无来源置 null |
| analysis.intentSteps | 事件 step | 含 handle 时为 `["handle"]` |
| source.* | git 与 .ai-point | branch / commit / submitter 取自 git；implAt 取 verify-report 时间 |

**03-submit【门禁】**
1. `submit.mjs dry-run --payload ...`，展示服务端返回的 diff 摘要与告警。
2. AskUserQuestion 确认；需要调整时改 supplement、重生成 payload 后重新 dry-run。
3. `submit.mjs submit --payload ...`，输出待办链接；结果写入 `board-sync/submission.json` 与 `board-sync/sync-report.md`。
4. 报告明确写「已提交待审核，尚未生效」，不得表述为已同步完成。
5. 再次执行 skill 且已有 submission.json 时，先执行 `submit.mjs status --record ...` 回显审核结果，再决定是否重新提交。

### 5.3 看板地址

- 优先级：对话中指定（AI 传 `--board-url`）> 配置文件 `~/.config/xlb/chain-board.env` 中的 `XLB_CHAIN_BOARD_URL` > 进程环境变量 `XLB_CHAIN_BOARD_URL` > 自动判断。
- 显式指定（前三种任一）时只用该地址，不探测、不回退。
- 自动判断：请求线上 `https://xlb-chain-board--scm.ali-dev.xlbsoft.com` 的 `GET /api/sync/ping`（带令牌，超时 5s）：
  - 200 → 用线上；
  - 404（同步接口未部署）或网络错误、超时 → 回退 `http://localhost:3001`，同样先 ping；
  - 401 → 直接报令牌错误，不回退。
- 不探测 `/api/health`：线上已有该接口，新接口未部署时它也返回 200，无法判断。
- 每次运行输出实际地址与来源（如「localhost:3001，来自配置文件」），门禁中再展示一次。
- 锁定：本次 dry-run、正式提交使用同一地址，写入 `submission.json`；之后 `--status` 使用记录的地址。
- 业务错误（400 / 409 等）直接报错，不切换地址重试。
- 本地调试注意：本地与线上是同一个库，本地提交、合入都是真实数据。调试使用测试节点（如 `zz_sync_test`），完成后驳回并删除该节点。

## 六、验证计划

**看板侧**
1. `submission.test.ts` 覆盖：新建节点、按端隔离、页面合并保留库内独有页、eventVer 以代码为准、分析口径只填空值与勾选覆盖、三码集派生。
2. 接口：无令牌 401、固定令牌版本错误 401、schema 错误 400、相同 payload 幂等、新提交替代旧 pending。
3. 合入：`expectedUpdatedAt` 不一致 409；member 调用合入接口 403；owner 合入成功后节点卡片显示「已接入」。

**skill 侧（以 remote-app-fsms「仓库商品抽检埋点」为样例）**
1. dry-run 返回 kind=create，4 个页面，`confirm_pass` 的 terminalKind 在门禁中被询问。
2. 正式提交后待办 Tab 出现角标；owner 合入后节点配置页出现 `storehouse_spot_check`。
3. 重复提交同一 payload 返回原记录；修改 payload 后提交，旧记录变为 superseded。
4. `--status` 正确回显 merged / rejected 及驳回原因。
5. 线上地址不可达时自动回退 localhost；显式设置 `XLB_CHAIN_BOARD_URL` 时不回退；固定令牌版本不一致时不回退、直接报 401。

**通知**
1. 合入、驳回后提交人收到飞书卡片；`notifyStatus=sent`。
2. 提交人邮箱不在可用范围时 `notifyStatus=failed`，合入结果不受影响，界面显示失败原因。

## 七、已确认决策

1. 线上与本地看板连接同一个库。
2. 默认地址 `https://xlb-chain-board--scm.ali-dev.xlbsoft.com`，请求失败回退 `http://localhost:3001`。
3. 合入权限使用权限点 `submission.merge`，默认 owner + admin，admin 可在角色管理中单独授予 member。
4. v1 在 skill 与看板代码中写死同一个固定令牌，不要求环境变量或开发者本机配置；它不承担真正鉴权。
5. 合入或驳回后飞书通知提交人。
6. 只处理节点配置写入，不做链条挂载；不改 auto-point。

## 八、实施与验证状态

1. 已执行 `prisma migrate deploy`，`20261014000000_add_node_submissions` 已在共享库成功应用；仅新增表。
2. submission 纯函数 13 项测试通过；覆盖新建/更新、端隔离、页面保留、版本、remark 继承、分析口径、三码集和 schema。
3. 真实数据库路由 handler 集成验证全部通过：令牌 401、dry-run、幂等、替代、列表/详情、409 回滚、合入、重复合入、更新 diff、驳回、状态查询；测试节点与 3 条提交记录已清理。
4. TypeScript 全量检查 0 错误；定向 ESLint 0 错误。
5. extract.mjs 已用 remote-app-fsms（RN 4 页面）和 xlb_scm_web（PC 多链条、REPORT_EVENTS）验证；payload.mjs 已验证终态缺失/过期拦截与服务端 schema/diff。
6. submit.mjs 已用 mock 服务验证：显式地址、配置文件、401 不回退、线上 404 回退本地、dry-run 指纹锁、正式提交、状态查询；固定令牌改造后重新验证通过。
7. 浏览器 UI 已验收：待办四状态列表、空态、详情抽屉、节点字段、页面事件、派生码集、权限按钮全部正常；相关请求均为 200，控制台无本次代码警告。
8. 未完成：线上部署；飞书机器人实发；尚未提交真实 FSMS 待办。
9. `next build` 被仓库既有失效符号链接 `.tracking/archive-venv/bin/python` 触发 Turbopack panic 阻断，与本次文件无关。
