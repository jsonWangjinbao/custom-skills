---
name: auto-generate-point-report
description: 按看板节点配置确定业务埋点范围，在本机复用看板同一套分析器计算当前时间窗核心指标，再用 SLS 明细深挖业务影响、动作/单据双口径、原因与改进建议。用户要求「埋点周报」「页面业务问题分析」「拉取某类单据日志生成报告」或调用 /auto-generate-point-report 时使用；先按子应用→节点→时间与环境三轮补齐范围，按需加载分析规范；暂不做跨窗对比，不用于埋点实施或线上代码修复。
---

# auto-generate-point-report

目标：从高频业务页面找到值得行动的问题，而非把事件计数表改写成周报。
核心 KPI 由**看板同一套分析器在本机计算**（`analyzeWindow`/`summarizeAnalysis` 直连 SLS），口径由代码复用与对拍门禁保证，不由服务调用保证；SLS 另提供专项明细。本地落盘；**全程不写任何数据库、不调用看板查询接口**，不修改业务数据、代码、配置中心或采集 SDK，不自动发布飞书或 Git。暂不做对比，不查询前窗或输出环比。

**连接自动化**：看板只提供配置。默认先访问 `https://xlb-chain-board--scm.ali-dev.xlbsoft.com/api/report/ping`+`/config`；线上未部署机器密钥（`TRACKING_REPORT_TOKEN`）时自动使用内置公开只读令牌（与 auto-point-sync 固定令牌同构命名），使用者无需任何配置；接口未部署、网络不可用或认证失败时，自动改为在看板仓库内运行配置导出脚本，本地导出同一份白名单；不询问 Cookie、登录、地址或让用户手工配凭据，也不再启动常驻本地服务或专用 Worker。
本地计算与配置导出都在看板项目（或已知 CHAIN_BOARD_PROJECT）内执行，SLS 凭据由该项目的 dotenv 提供，不读取 .env 原文、不回显密钥、不写进任何产物。

## 入口：三轮提问，逐轮依赖配置

先读 [collect.md](references/collect.md) 并 `discover` 取得配置字典，再按下列顺序提问；每轮都用选项卡，不用纯文本提问，不把后一轮的问题提前问：

1. **第一轮（1 张卡）目标子应用**：候选由 `subapps` 命令从配置字典枚举（节点 `category` 分组），按可用节点数降序取前 4 个作选项，label 原样写配置里的分组值，不翻译、不加后缀；其余分组写进问题正文由输入框填写。配置中心 `apps` 常为空，不拿它当子应用清单。
2. **第二轮（1 张卡）节点模块**：用第一轮答案跑 `nodes --app <子应用>`，先在卡片上方把该子应用下全部可用节点按编号列出（`中文节点名（nodeKey）· 平台 · 页面名 · 事件数`），再出卡；选项 label 为 `中文节点名（子应用 · nodeKey）`，取事件数最多的前 4 个，正文说明其余节点可在输入框填编号或节点名。**节点下全部页面与 PC、RN 一并聚合**，不按端拆分、不按页面下推。
3. **第三轮（2 张卡）时间与环境**：时间段为 今天 / 近三天 / 近 7 天，自定义日期范围在「其他」输入 `YYYY-MM-DD 至 YYYY-MM-DD`；日志环境为 test / stage / prod，必须明确选择，不静默用 prod。

选中后用该选项对应的原始 nodeKey 调用 `scope`，不把展示标签整串当查询参数；输入框仍支持节点名与 FID。四项答案收齐后再继续，不边问边跑。
地址/认证处理无需用户参与；匹配歧义或所选子应用无可用节点时，只对该项再出一张卡，不静默换目标。
SLS 通道从配置字典取得；认证故障与回退原因透明回显，但不要求用户复制Cookie或密钥。禁止读 .env 原文或把凭据写进报告。

## 按阶段加载

| 阶段 | 此时读取 | 行为与退出条件 |
| --- | --- | --- |
| 1 配置与范围 | 同上 | `discover` 取配置字典（线上 HTTP 优先，本地导出兜底）；`subapps`、`nodes` 为前两轮问卷枚举候选；`scope` 把问卷转成节点/环节范围，事件和字段不手填 |
| 2 本地核心指标 | 同上 | `compute` 在本机直连 SLS 扫描并复用看板分析器算当前窗，产出 `kpi.json`；核心 KPI 不在 Python 重写，不写数据库 |
| 3 定向深挖 | [analyze.md](references/analyze.md) | 据核心指标的失败/回退/卡单信号选题（以证据为准，通常 3–8 项）；`fetch` 拉齐配置范围全部结果，`analyze` 生成专项证据 |
| 4 周报 | [report.md](references/report.md)、[模板](templates/report.md) | `check` 通过后写报告：一份文档列全部问题、每题深挖到可执行粒度；写完必须过 `report-check` 机械门禁；有质量缺口写受限分析，不冒充完整周报 |

本 skill 的 scripts/point_report.py 仅作入口委托，实际流水线统一执行看板仓库 `reporting/` 中的共享实现；**执行**脚本，不把整套源码、原始日志或其他阶段文档塞入上下文。
[范围示例](examples/scope.json) 是 scope 命令输出形态，不是手填配置；历史案例只用于分析方法，不套用旧结论。

## 执行入口

Python 3.9+；网络查询唯一依赖见 [requirements.txt](requirements.txt)，标准库即可跑离线分析与测试。
`SKILL_DIR` 由当前已加载 skill 的目录确定，`RUN_DIR` 使用目标项目的 `.ai-point-report/<目标>-<日期>-<环境>/`；不得硬编码用户电脑路径。

```bash
python3 "$SKILL_DIR/scripts/point_report.py" discover --out "$RUN_DIR/dictionary.json"
python3 "$SKILL_DIR/scripts/point_report.py" subapps --dictionary "$RUN_DIR/dictionary.json"
python3 "$SKILL_DIR/scripts/point_report.py" nodes --dictionary "$RUN_DIR/dictionary.json" --app "$APP"
python3 "$SKILL_DIR/scripts/point_report.py" scope --dictionary "$RUN_DIR/dictionary.json" --app "$APP" --node "$NODE" --range "$RANGE" --env "$ENV" --out "$RUN_DIR/scope.json"
python3 "$SKILL_DIR/scripts/point_report.py" compute --scope "$RUN_DIR/scope.json" --out "$RUN_DIR"
python3 "$SKILL_DIR/scripts/point_report.py" fetch --scope "$RUN_DIR/scope.json" --out "$RUN_DIR"
python3 "$SKILL_DIR/scripts/point_report.py" analyze --out "$RUN_DIR"
python3 "$SKILL_DIR/scripts/point_report.py" check --out "$RUN_DIR"
python3 "$SKILL_DIR/scripts/point_report.py" report-check --out "$RUN_DIR"   # 写完 report.md 后执行
```

`discover` 保存配置来源（`configSource.kind` = online-http / local-dump）与回退原因；`subapps`/`nodes` 只读字典不走网络；`compute` 只认 RUN_DIR 里那份字典，字典指纹与 scope 的 configFingerprint 不一致即拒绝计算。显式 --url 只作定向联调，不回退。
线上配置接口 `/api/report/*` 无需Cookie：机器密钥（可选，提供 ownerId 隔离）从安全环境/私有连接配置自动读取，缺失时使用内置公开只读令牌；公开sync令牌仍不具备配置读取权限，原登录接口继续受保护。域名含 ali-dev 不代表日志环境，仍按所选 test/stage/prod 过滤。
`compute` 由 Python 启动看板仓库内的本地计算脚本（必须预加载配额 Stub 绕过共享 SLS 配额租约）；单进程单扫描，同目录有运行锁，**不得并行多开**。预算耗尽时子进程以退出码 3 保存断点让出，Python 自动续跑同一目录，不换窗口、不丢已扫分片。
完成后只读 kpi.json / evidence.json / quality.json。核心指标是整节点或所选 FID，环节深挖不能冒充整节点 KPI；`kpi.json` 出现分页标记（dimensions/displayPage/edgePage）即判不合格，本地产物必须完整未截断。

## 分析红线

- success + fail + validate_fail 才是完成提交数；cancel/无结果独列，点击和 PV 不作失败率分母。
- 分开报告接口/业务失败、表单打回；涉及单据集包含只成功的单据，异常单据集只包含失败/打回单据。
- 批量动作一次计动作、多张计单据；同 FID 不同单据类型不得合并。
- 聚合原始行数不等于去重事件数；顶层 event_id 可能是平台登记常量，不能当业务去重键。
- 「窗口内未见成功」不等于永久卡死；闭环率/一次通过率/返工/卡单/漏斗直接引用 kpi.json（看板分析器本地产出），不用 SLS 单动作成功重算。
- 比率类指标最多保留到小数点后 4 位：本地一次遍历与看板流式累加存在 1 ULP 浮点末位差，不得把该差异写成数据不一致；并列计数项按 count 降序 + 名称二次排序后再引用。
- IP 仅代表网络来源：一个 IP 不证明单人，多个 IP 不证明多人，同网段不证明同办公室。
- 事实、业务解释、待验证假设分开写。当前版本不做对比或环比；无字段值不能推断三字段一定留空。
- 数据采集缺口单独列出，不包装成业务缺陷；不同日期边界、环境或事件版本不得宣称数字已对齐。

## 报告深度红线

- 一份文档内列全部问题，每题固定六点：现象（双口径）→ 数据证据（根因/时间/组织与账号/单据时间线/仓库/账号共用核验）→ 业务影响 → 根因归纳（直接/行为/系统三层）→ 建议（按消减量排序）→ 为什么只有埋点能看见。
- 根因必须下钻到 `api_code` + 报文原文关键句 + 占比，保留报文里的阈值/配额/日期数值；只写 `fail_reason` 或 `api_biz_fail` 一层视为未完成。
- 单据级必须给重试强度分布（单均/p50/p90/max）与提交密度（中位间隔）；人员表固定 11 列；均值远大于中位时两者都给。
- 建议附可消减量级或占比，未经对照实验不承诺降幅；配图位由人工补，不得用文字描述冒充截图或自行生成示意图。
- 账号以 ID 为准，姓名/组织名仅作展示；IP 一律脱敏，不写完整地址；不公开手机号与大载荷原文。

## 恢复与失败

- scope 指纹固定应用/节点/事件/环境/时间/通道/配置；条件变更用新 RUN_DIR。`kpi.json` 保存 computeRunId/analyzerVersion/analyzerDigest/configFingerprint，并由同级 `kpi.sha256` 绑定落盘字节；断点续跑复用同一 computeRunId，产物被改过即判陈旧，不拿旧结果冒充新窗口。
- 完成片（包括空片）原子保存；失败重跑相同 fetch 会复用它们。存在坏片/预算耗尽即退出非零，保留结果。
- `kpi.json` 必须 complete、业务质量 ready、时间覆盖无缝铺满固定窗口，且 componentStatus 显式声明 compare/pageStats/jsErrors 为 unsupported；SQL Complete 也不证明字段齐全。check 同时复核 kpi 摘要与 SLS 分片，来源差异、未知结果、字段缺失必须声明。
- 超过 5 轮仍不能解决同一问题，报告「无法自行解决，需要人工介入」；不静默跳过片段。
- 生成完成前复核：范围正确、分母与样本范围相同、问题证据可定位、受限项可见、文风简练。
- `report-check` 不过不许交付：自行汇总的数字必须写出算式（如 162+80+47+30），百分数必须在同句给出分子/分母，单据号不得缩写成尾号，报文引用必须与底稿原文一致；不得为了过门禁删数字或改小位数。

## 简短示例

用户：「给 SCM 的发货单做近 7 天生产埋点周报。」
- 匹配配置里的应用及发货单节点，回显实际日期和 prod；从配置生成完整节点范围。
- 先读本机算出的核心 KPI，再下钻高价值动作；只有明确选择配置环节才限定 SLS 事件码。不查询对比窗口。
- 周报说明受影响单据数、失败/恢复情况、重复操作强度与可行动建议；不预设抢约一定是问题。

验证 skill：`python3 -m unittest discover -s "$SKILL_DIR/tests" -v`；不接触生产数据。
验证口径：看板仓库内 `npx tsx --test src/lib/tracking/reportCompute.test.ts` 跑内核单测；看板仓库内的对拍脚本在小窗做「字典重建 vs 数据库配置」0 容差对拍。历史对拍证据见看板仓库 `docs/tracking-performance/local-compute-reconcile.md`。
