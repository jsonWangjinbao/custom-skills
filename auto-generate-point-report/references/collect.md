# 范围与取数（进入阶段 1–2 时读取）

## 无需用户参与的连接

看板只提供配置：默认线上 `https://xlb-chain-board--scm.ali-dev.xlbsoft.com/` 的 `/api/report/ping`+`/config`，执行 discover 自动试；404/未启用/401/403/连接故障时改为在看板仓库内跑 `scripts/tracking-report-config.ts` 本地导出同一份白名单；协议版本错误不回退，显式 --url 不回退。
线上配置读取优先机器密钥：从安全运行环境或私有 `~/.config/xlb/chain-board.env` 自动读取；未配置时使用内置公开只读令牌（与 auto-point-sync 固定令牌同构，仅用于只读配置接口），使用者无需粘贴Cookie/登录/密钥；接口未部署、网络不可用或认证失败时才走本地导出。
本地导出与本地计算都在看板项目（当前工作区或已知 CHAIN_BOARD_PROJECT）内执行，凭据由该项目 dotenv 提供；不再启动常驻本地服务、不生成令牌、不起专用 Worker，也不接管其他作业、不改 .env、不关飞书登录。
配置来源与原因保存到字典 configSource（kind = online-http / local-dump），后续计算只认 RUN_DIR 里那份字典。只有两条路径都不可用才报 blocker，不让用户处理 Cookie。
域名 ali-dev 不推断数据环境，仍按业务卡的 test/stage/prod 过滤。此自动化只针对配置获取，不取消业务范围问卷。

## 1. 收集与解析

入口分三轮提问，每轮都用选项卡（工具上限单次 4 张卡、每张 2–4 个选项，「其他」输入框由工具自动附带）；后一轮的候选依赖前一轮答案，不得合并或提前：

| 轮次 | 卡片 | question（标题带提示） | 选项 | 「其他」用途 |
| --- | --- | --- | --- | --- |
| 1 | 目标子应用 | 要分析哪个子应用？（配置里共 N 个，其余可在输入框填写） | `subapps` 枚举结果按可用节点数降序取前 4 个，label 原样写分组值 | 输入其余分组值 |
| 2 | 节点模块 | 分析哪个节点？（上方清单已列全部可选节点，可填编号、节点名或附 FID） | `nodes --app` 结果按事件数降序取前 4 个，label 为 `中文节点名（子应用 · nodeKey）` | 输入编号/节点名/nodeKey，或节点名-配置环节名 |
| 3 | 时间段 / 日期范围 | 分析哪段时间？（自定义请在输入框填 YYYY-MM-DD 至 YYYY-MM-DD） | 今天 / 近三天 / 近 7 天 | 自定义日期范围 |
| 3 | 日志环境 | 查哪个日志环境？ | test / stage / prod | 不接受其他值，输入则重问 |

工具强制每张卡至少 2 个选项，无法做成只有输入框的卡；提示写在标题里，引导用户直接填输入框。
子应用清单来自配置字典的节点 `category` 分组（`subapps` 命令输出），不写死 SCM/FSMS、不翻译成中文全称、不加解释后缀；配置中心 `global.apps` 常为空，不拿它当子应用清单。
节点候选来自 `nodes --app <子应用>`，仅包含 tracked=true 且页面事件字典非空的节点；候选数常超 4 个，必须先在卡片上方把全部候选按编号列出（`中文节点名（nodeKey）· 平台 · 页面名 · 事件数`），再把前 4 个做成快捷项。名称必须取配置的 name 并放在 label 首位，不能凭 nodeKey 猜译。
节点下的全部页面与 PC、RN 聚合进同一范围：页面清单只用于让用户确认该节点含哪些页面，不做页面级过滤（这些页面 pageId 多为空，且核心分析器只支持整节点口径）。
生成选项时保留 label → 原始 nodeKey 映射；用户选中后把 nodeKey 传给 `scope --node`，中文标签只用于展示，不影响聚合条件。未能读取配置先处理连接，不编造节点兜底。
不合法或歧义的答案（日期格式错、子应用或节点多命中、所选子应用没有可用节点）只对该项再出一张选项卡，不用纯文本追问，不静默换目标。

子应用是配置侧的节点分组，不等于日志里的 `app.name`；实际应用与 topic 由 `scope` 按所选 nodeKey 从日志元数据发现，回显全部来源，不用分组名拼日志标识。
节点模块由 `scope` 命令匹配节点 name/nodeKey；只填节点名=整节点，填「节点名-环节名」或 --step 则匹配 stepNames/事件 step 并推出事件码。未知节点/环节、未接入或无事件时暂停，不自动扩大范围。

时间段换算（Asia/Shanghai，用运行时日期代码计算，不靠口算时间戳）：
- 今天：今日 00:00 至查询开始时刻。
- 近三天 / 近 7 天：含今天在内的 3 / 7 个自然日，即（今天−N+1）00:00 至查询开始时刻。
- 自定义（「其他」输入）：起日 00:00 至末日次日 00:00；末日为今天则截至查询开始时刻；末日晚于今天、起日晚于末日或跨度超过 31 天时重出时间范围卡。

日期全部转换为带时区 ISO 8601；脚本接收的 to 是**排他端点**。
包含当日时，to 固定为查询开始时刻，报告写「截至…」，续跑时不改变该端点。
回显实际起止日期与半开区间；报告标题用「今天 / 近三天 / 近 7 天 / 起止日期」，非完整自然周不称「周报」中的单周。

## 2. 字典事实来源

`discover --out <字典路径>` 自动完成配置获取（线上 `/api/report/ping`+`/config`，不可用时本地 `scripts/tracking-report-config.ts` 导出）：
- 两条路径输出同一份 `reportConfig` 白名单：common（sls/apps/bizFields/chainSteps/defaultProfile）与完整节点列表，基于看板现有 loadTrackingConfig，不复制第二份口径。
- 节点包含 nodeKey/name/category/tracked/pageId/pageRoute、stepOrder/stepNames/stateNames、regressiveCodes/fulfillCodes/closeCodes/intentSteps 以及页面字典（由 platforms.{pc,rn}.pages 展平为 pages）。stateNames 必须保留，否则本地计算的展示配置与看板漂移。
- scope 按选中 nodeKey 在已选环境/窗口的末端一小时发现实际应用与 topic 元数据（线上走 `/api/report/apps`，本地走 `tracking-report-config.ts --apps`，两者同一 readReportApps 实现），不写配置、不硬编码应用或通道；同节点的 PC/RN 与多 topic 来源全部保留，无有效标识或业务应用不匹配时如实标注。
- 线上成功响应真实形态为 `{success:true,data:...}`；非成功、401/403、登录重定向不可当空配置。本地导出直接把 `reportConfig` 结果写 stdout。
- 事件 code 聚合、name 展示、step 关联环节；nodeKey 是单据类型，pageId 用于页面访问范围；回退/终态口径优先节点配置，null 才回退全局，空数组不是未配置。
- 仅保存上述分析白名单，严禁把整个 common（可能含 llm 密文等）原样持久化。
- 线上 `/api/report/*` 两级授权：机器密钥（可选，提供 ownerId 隔离）优先，缺失时接受内置公开只读令牌；公开 sync 令牌仍不适用。接口不开放数据删除、任意SQL或跨用户查询，也不再提供查询/聚合能力。
- 离线导出的清洗字典可作 scope 输入；核心指标由本地计算产出，不依赖同事仓库路径。

回显全部应用、nodeKey/节点名、可选环节、日期边界、环境和 SLS topic；整节点不限制事件码，避免漏掉字典之外的业务事实。`appName`/`topic` 是主来源展示，`appNames`/`topics` 才是完整取数范围。
单张单据用 `scope --fid <FID>`（可重复），本地计算转为 `nodeKey:FID` 联合键；只有单号无法直接限定范围，先解析出 FID，不能用整节点 KPI 冒充单张单据 KPI。

## 3. 独立运行与凭据

Python 3.9+；标准库即可跑全部阶段（配置、范围、本地计算、专项明细、分析、测试）。专项明细的 SLS SDK 依赖见 requirements.txt，在用户可写目录建隔离 venv 安装；已有环境可直接复用，不修改业务 package.json。
本地计算与配置导出跑的是看板仓库的 TypeScript（tsx），需要 Node 与该仓库依赖已安装；不引入新的 Python 依赖。
仅专项明细取数需要 SDK，离线分析无需安装；requirements 固定 SDK 并约束 urllib3 兼容系统 Python 的 LibreSSL。首次安装依赖是实现步骤；不能自动升级用户已有全局工具。

运行时环境变量：
- SLS_ACCESS_KEY_ID / SLS_ACCESS_KEY_SECRET（兼容项目既有 OSS_ACCESS_KEY_ID / OSS_ACCESS_KEY_SECRET），可选 SLS_SECURITY_TOKEN。
- SLS_ENDPOINT：如 cn-hangzhou.log.aliyuncs.com；支持 HTTPS 外网地域端点，禁止 HTTP 或任意主机。
- TRACKING_REPORT_TOKEN：可选，机器密钥，由部署/安全运行环境注入，提供 ownerId 隔离；未配置时 skill 使用内置公开只读令牌，仍可读配置。本地导出与本地计算不用令牌、不用 CHAIN_BOARD_COOKIE。
- CHAIN_BOARD_PROJECT：仅当前工作区不是看板项目时，由已知工作区上下文填入本地看板根目录；不搜索/读取项目 .env 原文。
- TRACKING_REPORT_MEMORY_MB：可选，覆盖本地计算的内存上限（缺省为物理内存的 85%）。
- --url：仅定向联调用，支持 HTTPS线上或回环HTTP本地；缺省自动线上→本地导出。配置来源写入字典，不混用旧运行目录。

不读取 .env 原文到提示词，不把密钥写进 scope/日志。本地计算子进程由看板仓库的 dotenv 自行加载凭据；专项明细缺少运行时SLS变量时，自动由 `tracking-report-client.ts` 启动桥向Python注入，过程不输出凭据、无需用户复制密钥。
本地计算绕过共享 SLS 配额租约（预加载 `scripts/quota-stub.ts`），因此不与看板服务协调并发：单进程单扫描、同目录运行锁、不并行多开。配置获取阶段自动处理部署/鉴权差异并本地兜底；全部失败才报告脱敏原因。没有 SLS 数据时不能将未知结果当成功或自动改源后冒充SLS周报。

## 4. scope 契约

使用 examples/scope.json 的结构（主 SKILL.md 直接链接）。
通过 `scope --dictionary ... --app SCM --node 发货单 --range 近7天 --env prod --out ...` 自动生成：
- nodeKeys 对应所选节点；默认 eventCodes=[] 拉取整节点；--step 指定配置环节时推出该环节事件码，不能 Agent 手填猜测。
- pageIds、events、fields、nodeConfig 从配置取得；fields 仅启用 bizFields 去掉敏感/大载荷，必要字段被禁用就报错，不偷偷追加写死字段。
- boardUrl/configFingerprint 固定配置来源与配置摘要（本地导出时 boardUrl = `local-config-dump`）；nodeConfig 保留节点有效回退码、环节顺序/名称供核心指标结果核验。多来源时 scope 增加 appNames 与 sls.topics，compute/fetch 共用同一全集并按应用+事件标识去重。
- `includeIp` 默认 false，确需账号来源分析时用 --include-ip 新建运行范围；精确 IP 只留本地。
- orderFids 限定单据；单据过滤不拉无单据关联 PV。
- raw scope.json 是输入形态，scope.snapshot.json 是规范化快照（本地计算只读快照并自行重算指纹校验）；机器协议版不复用旧Cookie版运行目录。
- 核心 KPI 不支持只算某个环节；compute 总览始终为整节点/所选 FID，SLS 事件集合可能更窄，必须分别标注。
- budget：可缩小默认上限；默认 1,000 次请求、100 万行、1 GiB 投影结果、30 分钟；单片最长 120 秒。compute 与 fetch 共用该秒数预算，各自可分多次续跑。

默认从小时窗口开始，SQL `limit 10000`，不套 offset 翻页。
Complete 且返回 10000 行或响应超字节片预算 → 二分；Incomplete 最长等待后 → 二分。
网络/限流最多重试 3 次，Incomplete 10 秒间隔；单秒仍超限 → 非零退出，缩小事件范围或由人工安排流式拉取。
日志查询窗口与事件 time 半开范围双检查；迟到/历史回补不在当前接收窗口时无法证明覆盖，报告保留查询时间与此限制。

## 5. 本地核心指标 → SLS 深挖

1. `compute`：Python 先 `bind_scope` 写规范化快照，再启动看板仓库的 `scripts/tracking-report-compute.ts`（预加载 `scripts/quota-stub.ts`），传入 dictionary.json + scope.snapshot.json + RUN_DIR；不传 compareFrom/compareTo，不查询前窗。
2. 子进程内部：字典 → `reportConfigToTracking` 重建冻结配置 → `SlsEventStore.scan()` 扫描（与 Worker 同一取数口径：归一、event_id 去重、QUERY_INCOMPLETE 二分）→ `identityOf`/`canonicalEqual` 去重 → `analyzeWindow` → `summarizeAnalysis` → `summaryFacts`，全程不访问数据库。
3. 断点：每个扫描 checkpoint 先把增量事件写成 `compute.checkpoints/part-*.json.gz`（附 sha256）再推进游标；预算剩余不足 90 秒或命中内存上限时以退出码 3 让出，Python 自动续跑同一目录，完成片不重拉。子进程失败（退出码 1）不静默重试，错误码直接上抛。
4. 产物 `kpi.json` 完整未分页：docKpis（含全部 edges/topFailReasons）、flowKpis、funnel、docTypeStats、bottlenecks.regressiveByStep/failByEvent、nodes、traceStats、facts、config；另带 quality、warnings、stats（eventsRead/eventsUnique/duplicatesAbsorbed/runs/peakRssMb）与 computeRunId/analyzerVersion/analyzerDigest/configFingerprint，同级 `kpi.sha256` 绑定落盘字节。
5. 当前窗范围、环境、应用、节点、FID 精确核对；核心口径与配置里已知节点字段核验。不包含对比维度；componentStatus 必须显式声明 compare/pageStats/jsErrors 为 unsupported，不留空冒充。
6. 据核心指标信号选 3–5 项；fetch 读取当前节点/环节范围全部动作结果（含成功）。缩小到环节或开启 IP 必须新建 scope/运行目录，不复制旧完成片；compute 与 fetch 是两次独立 SLS 拉取，事件数不必相等，引用时分开标注。
7. analyze 使用 SQLite 输出明细证据；check 复核 kpi.json+kpi.sha256+分片+quality，零数据/不完整为受限结果，不说业务正常。

## 6. 产物与证据

RUN_DIR 下：dictionary.json、scope.json、scope.snapshot.json、compute.checkpoints/（含 state.json 与 part-*.json.gz）、kpi.json、kpi.sha256、fetch.checkpoints/、evidence.sqlite、evidence.json、quality.json、report.md。
检查点中只有确认 Complete 的结果，空片也落盘；片文件附 SHA256 摘要，坏片不默默续跑。
完整性 = 固定查询范围各片完成，不等于采集端无漏报。报告必写未验证实时上报完整性。
产物可能含账号、单号和精确 IP：目录私有、加入目标项目忽略规则需用户同意，不自动上传原始片或数据库。compute.checkpoints/ 体量与事件数成正比（gzip 后约为原始 JSON 的十分之一），交付后可删，删后不可再续跑。
