# Phase 2 - 代码梳理

## 进入条件

- `.ai-point/【需求名】/source-list.md` 已落盘

## 任务

先按端加载模式参考：PC → [../reference/pc-patterns.md](../reference/pc-patterns.md)；RN → [../reference/rn-patterns.md](../reference/rn-patterns.md)。

1. **基建检查（最先做，决定后续走向）**：按端选对应的四级形态表判定（结合 01 自动检测结论复核）。两端共同前提：**只看标准结构，其他埋点（铁律 6）不参与分级**——项目里有友盟/神策/自写 track 工具等，不会把 A 级变成「已有封装、复用」。

   **PC**（对齐基准 pc-bootstrap.md）：

   | 级 | 判定标准 | 后续走向 |
   | --- | --- | --- |
   | A | 无 `src/tracking` 目录 | 全套 bootstrap：加载 [../reference/pc-bootstrap.md](../reference/pc-bootstrap.md)，按其「前置检测」表逐项确认，把「从零落位」纳入后续方案与实施 |
   | B | 有 `src/tracking` SDK 骨架（lib/plugins），但缺 `lib/xlbTrackerAdapter.ts` 或缺 `business/` 层，或无 `@xlb/xlb-tracker` 依赖 | **预改造**：进入 [03b-retrofit.md](03b-retrofit.md)（门禁 1.5） |
   | C | 骨架与适配器都有，但口径偏离：env 两态塌缩 / XLB_DEPLOY_ENV 缺注入 / sessionConfig.sampleRate < 1 / appId 占位或他域 / debug 硬编码 true / business 事件只进 ARMS 不进 SLS | **预改造**：进入 [03b-retrofit.md](03b-retrofit.md)（门禁 1.5），仅修口径项不动结构 |
   | D | 与 SCM 样板一致（双适配器注册 + business 层 + 四态注入 + 通道口径正确） | 复用既有封装，直接加 events/chains/页面接入 |

   **RN**（对齐基准 rn-bootstrap.md「文件树」；上报通道文件名 `reporter.ts` 与 SCM RN 的 `qingniao.ts` 视为等价）：

   | 级 | 判定标准 | 后续走向 |
   | --- | --- | --- |
   | A | 无 `src/tracking` 目录，或目录内不含 `tracker.ts`（导出 bizTracker）+ 上报通道文件 + `index.ts` 这套骨架。**不论项目是否已有其他埋点** | 全套 bootstrap：加载 [../reference/rn-bootstrap.md](../reference/rn-bootstrap.md)，按其文件树全量落位并完成适配点；其他埋点原样保留。`src/tracking` 已被其他埋点占用且文件名冲突时，列入「风险与疑问」并用 AskUserQuestion 决定处理方式，不得静默覆盖 |
   | B | 有骨架，但文件树/导出偏离 rn-bootstrap：缺 `types.ts`/`context.ts`/`apiCapture.ts`，或 `installApiCapture` 不接收 http 实例，或 index 无 `register<X>Tracking()`，或事件字典不按 `events/<page>.ts` 拆分 | **预改造**：进入 [03b-retrofit.md](03b-retrofit.md)（门禁 1.5） |
   | C | 文件树一致，但口径偏离：仅用 `triggerEvent` / biz_product 取 page_code / setTopic 无初始化守卫 / 远程包自行判定或覆盖 env / `[track]` 打印或 `console.warn` 未包 `__DEV__` | **预改造**：进入 [03b-retrofit.md](03b-retrofit.md)（门禁 1.5），仅修口径项不动结构 |
   | D | 文件树、导出、口径均与 rn-bootstrap 一致 | 复用既有封装，直接加 events/chains/页面接入 |

   - B/C/D 级复用前必查两项通道配置（不合格项列入「风险与疑问」，C 级判定依据，不得静默沿用）：
     - **app.id / app.name**：XlbTrackerAdapter（或等价初始化）处应用标识须为本域登记值（app.id = SLS topic，看板按 `__topic__` 拉取）；硬编码为他域或占位值 → 事件打进错误 topic，看板数据互串
     - **env 判定**：环境标定为四态 dev/test/stage/prod 且由部署侧显式注入（XLB_DEPLOY_ENV），缺省有兼容兜底；两态塌缩（仅 development/production）会把测试/staging 错标 prod，看板按 app.env 过滤串档
   - **RN 端必查项**（判定依据见 [../reference/rn-bootstrap.md](../reference/rn-bootstrap.md)「环境口径」，不合格项即 RN C 级判定依据，同时列入「风险与疑问」）：
     - **env 来源**：宿主 `initQNSDKWithDefaultConfig` 第三参为 `Config.ENV`、4 个 `.env.*` 取值正确；远程包内不得自行判定或覆盖 env（如按 `__DEV__` 写 env 字段）
     - **上报方法**：使用 `triggerEventBeforeInit`（旧版 SDK 回退 `triggerEvent`）；只用 `triggerEvent` → 登录后首屏事件可能丢失
     - **biz_product**：取业务域常量（与 web 端同值），取 `page_code` 属偏离
     - **setTopic 守卫**：宿主未 init 时不得调用（Android 原生 NPE 风险）；topic 全局单例的多域覆盖风险一律登记
     - **dev 可见性**：`__DEV__` 下有 `[track]` 打印；`console.warn` 包在 `__DEV__` 内
   - 偏离样板但用户选「仅新增不动既有」（批次 2 已收集）→ 不触发预改造，列入「风险与疑问」并在方案「明确不做」中声明边界（该选项只对 B/C 级的标准结构生效；A 级没有「沿用其他埋点」的选项）
   - **其他埋点盘点**：01 检测项 8 命中的其他埋点逐条列出（SDK/工具 + 文件位置 + 调用量级），标注「保留不动」；不得以其门面/字典/通道为本次埋点基建
   - 人工依赖（平台 app.id/topic 登记、青鸟事件登记、RN 宿主集成 SDK）无法由 skill 代劳，必须写进 survey.md「风险与疑问」，并在方案中列为「人工依赖」
2. **页面定位**：按清单「高频页面」逐一找到页面目录、路由入口、列表页与详情页文件
   - **AI 自动识别分支**（source-list.md 标记「AI 自动识别埋点范围」）：无外部清单，改为盘点候选范围——按用户需求涉及的业务模块定位页面，遍历其列表/详情/弹窗，找出全部值得埋的操作点（页面浏览、查询、导出、新增/编辑/删除提交、详情/记录查看等），形成清单草案
3. **操作点定位**：按清单「事件名称」找到对应按钮/菜单/表单的渲染位置与处理函数
   - 点击类：定位 onClick / 确认弹窗 / 批量操作入口
   - 浏览类：定位页面打开、详情打开、查询触发位置
4. **API 关联**：每个操作点对应的接口函数与 url（判断目标项目是否有接口捕获白名单机制，是否需要显式 apiUrl）
5. **单据快照字段**：确认单据对象上 `fid / order_no / state / appoint_state / supplier_id / recv_store_id / source_*` 等字段的可得性（列表行数据、详情数据）
6. **现有埋点盘点**：grep `bizTracker|trackAction|_EVENTS`，标记清单条目现状：已有 / 新增 / 需改造

## 输出要求

生成 `.ai-point/【需求名】/survey.md`，含：

- 基建结论：**形态判定级别（A/B/C/D）+ 判定证据**（逐项检测结论）；B/C 级附偏离项清单（文件:行号 + 现状 + 样板口径）；A 级附 bootstrap 前置检测结果与人工依赖清单；其他埋点盘点（无则写「无」）
- 页面映射表：清单页面 → 文件路径（列表/详情/关键子组件）
- 操作点映射表：清单事件 → 处理函数（文件:行号）→ API
- 风险与疑问：找不到的操作点、字段缺失、多入口共用函数等——**逐条列出，不得静默跳过**
- AI 自动识别分支追加：清单草案（按页面分组：建议事件 + track/trackAction 建议 + 埋点理由），并标注「草案，门禁 1 确认后才成为正式清单」

## 出口

- B/C 级且已获预改造授权 → 进入 [03b-retrofit.md](03b-retrofit.md)（门禁 1.5）
- A/D 级（或 B/C 级用户选「仅新增不动既有」）且无阻断疑问 → 进入 [03-point-list.md](03-point-list.md)
- 有阻断疑问（操作点找不到、基建缺失未决策等） → AskUserQuestion 澄清后再推进
