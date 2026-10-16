# 排障

仅在发生对应错误时读取本文件。任何失败都要显式报告，不得绕过后宣称成功。

## 提取阶段

### 找不到 events / chains

1. 搜索项目内 `tracking/**/events/*.ts` 与 `chainId`；
2. 确认业务埋点代码是否真的已实施；
3. 非默认目录用 `extract.mjs --tracking-dir <相对路径>`；
4. 没有事件字典/链条定义 → 退回开发 skill，不在本 skill 中造一套。

### tsx 加载失败

- type-only import 通常可执行；若模块导入浏览器/原生运行时导致顶层报错，先看是否可从 tracking 的纯字典目录隔离提取。
- 不要修改业务代码来配合本 skill。
- 不要用正则解析 TS 对象替代执行（会误判 spread/computed 值）。报告阻断，交由人工决定是否给字典模块去运行时依赖。

### 多个字典含 PAGE_VIEW

说明同文件结构不符合一个页面一个主字典。停止，让用户/开发者明确哪个字典是清单主字典；不得按变量名猜。

### 页面未归属链条

优先检查 tracking 入口的 `register({ page, chain })`。仍无法判断时 AskUserQuestion 选择，并在 supplement.pages 显式列入；不得把已归属其他链条的页面强挂当前节点。

### terminalKind 缺失 / 过期

- 缺失：从 point-list 终态备注判定；不明确则询问。
- 过期：supplement 有 key，但代码该事件已非 terminal 或不存在。删除/修正 supplement 后重跑，不得忽略。

## 地址与固定令牌

### 线上 /api/health 200，但 /api/sync/ping 404

同步接口尚未部署。自动模式会回退 localhost；本地调试应在对话说「用本地看板」或在配置文件写 `XLB_CHAIN_BOARD_URL=http://localhost:3001`。

### localhost 连接失败

看板没启动。到 xlb-chain-board 执行项目既有 dev 命令；skill 不自行停止/重启用户已运行的服务。

### 401 SYNC_TOKEN_INVALID

skill 与看板代码中的固定令牌版本不一致。两个仓库需同步更新/部署；不回退、不重试其他地址。固定令牌不是安全秘密，不能用它承担真正鉴权。

## dry-run / 提交

### 400 schema 错误

按 error 字段路径修 supplement 或退回开发 skill 修代码。常见原因：

- terminal=true 缺 terminalKind；
- 页面内 code 重复；
- pageCode / event code 格式非法；
- name/category 新节点字段缺失；
- source email 非法。

不得直接编辑 payload.json；改 supplement 后重跑 payload.mjs。

### eventVer 未递增告警

事件集合/字段变化但代码 eventVer 与库内相同。停止提交，退回开发 skill 递增 EVENT_VER，再重新提取。不要在 supplement/payload 中改版本号。

### 库内 eventVer 高于代码且事件不一致

高风险：代码可能落后。停止并请用户选择：先用 auto-point-cfg 对齐代码，或由审核人在待办页明确二次确认覆盖。skill 不静默提交。

### payload 在预检后被修改

这是客户端保护。重新 dry-run、重新门禁，不得改 dry-run.json 的 hash。

### 正式提交网络超时

服务端可能已经写入 pending。保持 payload 不变，重新执行 submit：服务端按 payloadHash 幂等返回原记录。不要先改 payload；不要切换看板地址。

### 409 并发冲突

- 提交接口：同节点并发创建待办，重新执行同 payload submit；
- 合入接口：节点或提交在审核期间被改动，待办页刷新后重新核对；skill 重新 dry-run 获取最新 diff。

## 审核与通知

### 合入后通知 failed

配置已经生效，不回滚。报告中同时写：`已合入并生效；飞书通知失败：<notifyError>`。管理员检查机器人能力、`im:message:send_as_bot` 权限、应用可用范围与提交邮箱。

### 通知 skipped

- `提交未携带提交人邮箱`：配置 git user.email 后，后续提交可通知；当前审核结果不受影响。
- `看板未配置飞书应用凭证`：本地调试常见；线上需配置 FEISHU_APP_ID/SECRET。

### pending 长时间无人处理

回显待办链接，提醒具备 `submission.merge` 权限的成员处理；skill 不代替审核人调用合入接口。
