# 看板接口与客户端配置契约

## 一、固定令牌

看板与 skill v1 在代码中约定同一个固定 Bearer 令牌，不需要部署环境变量，也不需要开发者本机配置。

固定令牌随代码公开，不属于安全秘密，只用于拒绝无意请求和识别 skill/看板协议版本。任何拿到代码的人都能创建待办，但不能合入；合入仍由飞书会话和 `submission.merge` 权限保护。

如果后续要恢复真正的调用方鉴权，再升级为个人令牌或部署密钥，不在固定令牌上增加安全假设。

## 二、地址解析

优先级：

1. `submit.mjs --board-url <url>`（用户在对话中显式指定）
2. 配置文件 `XLB_CHAIN_BOARD_URL`
3. 进程环境变量 `XLB_CHAIN_BOARD_URL`
4. 自动判断

前三种为显式地址：只 ping 该地址，不回退。

自动判断：

1. `GET https://xlb-chain-board--scm.ali-dev.xlbsoft.com/api/sync/ping`
2. 200：锁定线上；404 / 网络错误 / 超时：继续本地
3. `GET http://localhost:3001/api/sync/ping`
4. 200：锁定本地；失败：停止并列出线上、本地原因

401 表示 skill 与看板的固定令牌版本不一致，为致命版本错误，不因地址切换重试。

本地与线上连接同一数据库；本地合入也会改正式节点配置。调试看板用 `zz_` 前缀测试节点，完成后清理。

## 三、接口

### `GET /api/sync/ping`

Bearer 鉴权。200：`{ api: "node-submissions", version: 1 }`。

### `POST /api/sync/node-submissions`

- `dryRun=true`：返回 diff，不落库，HTTP 200。
- `dryRun=false`：创建 pending，HTTP 201；相同 payloadHash 已有 pending 时返回原记录，HTTP 200，`idempotent=true`。
- 同 nodeKey + platform 的新 pending 会把旧 pending 置 superseded，并返回 `supersededIds`。
- 请求体上限 256KB。

### `GET /api/sync/node-submissions/{id}`

返回 status、reviewerName、reviewedAt、reviewComment、notifyStatus、notifyError、reviewPath。

## 四、状态语义

| status | 是否生效 | 后续 |
| --- | --- | --- |
| pending | 否 | 等审核，不重复提交 |
| merged | 是 | 更新报告为已合入 |
| rejected | 否 | 按原因修正，重新 dry-run + 门禁 + submit |
| superseded | 否 | 已被更新的提交替代 |

notifyStatus：

- sent：飞书通知成功。
- failed：通知失败；不影响 merged/rejected 结果，错误在 notifyError。
- skipped：无飞书配置或提交人邮箱；不影响审核结果。

## 五、主要错误码

| HTTP / code | 含义 | 处理 |
| --- | --- | --- |
| 400 | payload 校验失败 | 修改 supplement 或代码后重生成 payload |
| 401 `SYNC_TOKEN_INVALID` | skill 与看板固定令牌版本不一致 | 同步更新两个仓库，不回退 |
| 404 ping | 线上未部署同步接口 | 自动模式回退本地；显式地址则停止 |
| 404 提交状态 | ID 不存在 | 检查 submission.json 是否属于当前看板 |
| 409 `SUBMISSION_CONFLICT` | 提交/节点被并发处理或修改 | 刷新详情；重新 dry-run |
| 413 | payload 超过 256KB | 检查是否误带大载荷；不得拆分同节点绕过，先人工评估 |
| 5xx | 看板/数据库故障 | 记录 requestId，停止；不要向另一个地址重投正式提交 |

## 六、地址锁定与重试边界

- dry-run 成功后，`dry-run.json` 保存 boardUrl + payloadHash。
- 正式 submit 只使用该 boardUrl，不重新自动选址。
- payloadHash 与 dry-run 不一致时客户端拒绝 submit。
- 网络超时后正式 submit 的结果可能未知：先用 submission.json 查询；如果还没有 submission.json，重新 submit 同 payload 是安全的，服务端 payloadHash 幂等返回同一 pending。不得改 payload 后盲重试。
