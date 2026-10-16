# 配置中心同步契约（auto-point-cfg ↔ xlb-chain-board）

配置中心（xlb-chain-board）是「埋什么」的事实来源。本文件定义 skill 与配置中心的全部交互契约。

## board 地址解析

- 解析顺序：环境变量 `XLB_CHAIN_BOARD_URL` → 默认 `http://localhost:3001`
- 探测：`GET {boardUrl}/api/health` 返回 200 即可达
- 不可达 → **停止**，提示用户启动 board 或配置环境变量；不得跳过拉取直接实施

## 拉取：GET /api/config/bundle

```
GET {boardUrl}/api/config/bundle?platform=pc&nodeKeys=delivery_note,purchase_order
```

- `platform`：`pc` / `rn`，必填（决定返回哪一端的事件清单）
- `nodeKeys`：逗号分隔节点 ID（= order_type），必填
- 失败：节点不存在 → 404 且 error 列出缺失 nodeKey；platform 非法 → 400

响应：

```jsonc
{
  "success": true,
  "data": {
    "common": {
      "idleTimeoutMs": 1800000,
      "sls": { "topic": "...", "project": "...", "logstore": "..." },
      "qingniao": { "appId": "...", "topic": "..." },
      "apps": [{ "name": "xlb_scm_web", "platform": "pc", "label": "..." }],
      "snapshotFields": ["fid", "order_no", "state", "..."],
      "chainSteps": [{ "code": "enter", "name": "进入任务" }],
      "defaultProfile": { "regressiveCodes": [], "fulfillCodes": [], "closeCodes": [], "intentSteps": [] }
    },
    "nodes": [
      {
        "id": "clxxx",                  // 节点 DB id，回写时用
        "nodeKey": "delivery_note",     // = order_type
        "name": "发货单",
        "category": "SCM",
        "tracked": true,                // 已接入标记（回写维护）
        "lastImplAt": "2026-09-05T...", // 上次实施回写时间
        "pageId": "xlb_scm_DeliveryNote",   // 节点级 PV/UV 锚点
        "pageRoute": "/xlb_scm/deliveryNote/index",
        "platforms": {
          "pc": {                        // 请求 platform 对应的端
            "pages": [
              {
                "pageCode": "deliveryNote",
                "pageName": "发货单",
                "pagePath": "SCM供应链-业务-发货单",
                "pageId": null,          // 页面级覆盖；null 用节点级
                "pageRoute": null,
                "eventVer": "1.1.0",     // 字典版本，生成 XXX_EVENT_VER 用
                "events": [              // 清单事件（PAGE_VIEW 已在首位由配置中心补齐）
                  {
                    "code": "view",
                    "name": "发货单",
                    "type": "view",      // view | click | chain
                    "step": "enter",     // 环节码，全集见 common.chainSteps
                    "regressive": false, // 回退类（可选）
                    "terminal": false,   // 终态（可选）
                    "terminalKind": "fulfill", // fulfill=履约完成 | close=终结未履约（terminal=true 时必有）
                    "qingniaoId": "xlb_scm_xxx", // 青鸟登记标识（可选）
                    "remark": "..."            // 备注（可选）
                  }
                ],
                "extraEvents": []        // 清单外补充（QUERY/DETAIL_VIEW/DOC_RELATION 等）
              }
            ]
          }
        }
      }
    ]
  }
}
```

落盘：原样保存为 `.ai-point/【需求名】/config-bundle.json`。

### 与上报侧 TrackEventDef 的差异（重要）

- `terminalKind` 是**配置中心扩展字段**（分析口径派生 fulfillCodes/closeCodes 用），上报侧 TrackEventDef **没有该字段**——生成事件字典代码时不得写入。
- `remark` 仅为人读备注，可转为字典条目注释，不是上报字段。
- PAGE_VIEW：配置中心已确保每页面 `events` 含 enter 环节 view 事件（通常首位），直接作为字典 `PAGE_VIEW` 条目。
- PAGE_LEAVE 不入配置：按 `pageName` 派生（`{ code:'leave', name: pageName+'-离开', type:'view', step:'leave' }`）。

## diff 规则（02-survey 执行）

1. **页面匹配**：bundle `pages[].pageCode` ↔ 目标项目事件字典 `PageDef.pageCode`（如 `src/tracking/business/events/deliveryNote.ts` 的 `DN_PAGE.pageCode`）。
2. **事件匹配**：同页面内按 `code` 对齐（events 对 `XXX_EVENTS`，extraEvents 对 `XXX_EXTRA_EVENTS`）。
3. **分类**：
   - **新增**：bundle 有、代码无
   - **需改造**：两边都有但 `name/type/step/regressive/terminal/qingniaoId` 任一不同——逐项列出差异（旧值 → 新值）
   - **待清理**：代码有、bundle 无——标「⚠ 待确认」，列入清单待确认项，**不自动删除**（可能是历史遗留或其他链条在用）
4. **版本差提示**：bundle `eventVer` ≠ 代码 `XXX_EVENT_VER` 时，说明配置与代码存在漂移，diff 结果必须全部以 bundle 为准修正。

## 代码生成口径（05-implement）

- `XXX_EVENT_VER` = bundle `page.eventVer`（原样写入，不递增、不改写）
- 事件条目：`code/name/type/step/regressive/terminal/qingniaoId` 逐字段原样映射；`terminalKind`、`remark` 不写入代码
- 三件套：`PAGE_VIEW` 取 bundle events 中 enter/view 条目；`XXX_PAGE_LEAVE` 按 pageName 派生；`XXX_EXTRA_EVENTS` 取 bundle `extraEvents`
- `ChainDef.idleTimeout` 取 `common.idleTimeoutMs`
- `toOrderSnapshot` 取数字段对齐 `common.snapshotFields`
- reporter 通道取值（SLS topic / 青鸟 appId）取 `common.sls` / `common.qingniao`；空值项列入「人工依赖」

## 回写（06-verify 通过后）

```
PUT {boardUrl}/api/config/nodes/{id}
Content-Type: application/json

{ "tracked": true, "lastImplAt": "<ISO 8601>" }
```

- `id` 取 bundle `node.id`
- 回写失败（网络异常 / 404）**不阻断流程**，但 verify-report.md 必须显式标注「配置中心回写失败」及原因——不得静默宣称完成
