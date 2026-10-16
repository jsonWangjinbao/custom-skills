# Phase 6 - 验证与收尾

## 进入条件

- 05 实施完成

## 任务

1. **静态验证**：
   - 类型检查 / lint 通过
   - grep 核对：清单每个事件 code 在代码中有且仅有方案声明的调用点
   - 事件字典在统一出口的导出完整，无遗漏
   - 结构核对：`ls src/tracking` 与对应端 bootstrap 文件树一致（RN 上报通道文件允许 B/C/D 级沿用的等价命名）；不一致即为未完成
   - 其他埋点（铁律 6）：`git diff --stat` 确认其文件与调用点无改动
2. **真实上报验证（确保「跑完即可上报」，bootstrap 项目必做）**：
   - 本地启动目标项目，操作至少一条已埋点路径（页面进入 + 一个点击事件）
   - PC：reporter debug 模式控制台确认 `[track]` 打印，或 Network 面板确认上报请求发出
   - RN：执行 bootstrap 提供的 `getReporterDiagnostics()`——`sdkLoaded: false` 说明宿主未集成 SDK；`initCalled: false` 说明宿主未调用 init，事件只缓存不发出；`env` 与当前包环境不符说明宿主 `Config.ENV` 配置错误。任一不满足必须标注「上报未验证」。通过后操作已埋点路径，Metro 控制台确认 `[track]` 打印
   - **SLS 落库核对（两端必做）**：所有环境写同一 logstore（`tracking-point-project / prod_tracking_point_log`），检索必须带 `app.env` 过滤（取值 `dev/test/staging/prod`；两端同口径按连接的后端环境标定——PC 本地 start 连测试后端标 `test`，RN 本地默认 `.env` 为 TEST 也标 `test`；PC 本地若仍标 `dev`，说明 `.umirc.dev.ts` 未按 §19 注入），再按 `biz.page_code` + `biz.event_code` 核对字段与清单一致
   - 通道未就绪（依赖未装 / 宿主未集成 / 平台未登记）时，报告必须显式标注「上报未验证」及原因与待办人，**不得静默宣称完成**
   - RN 端固定登记一条「风险与疑问」：topic 为宿主全局单例，多业务域远程包接入时会互相覆盖，最终方案待与青鸟 SDK 方确认
3. **覆盖率核对**：point-list.md 每条目 → 状态（已埋 / 复用 / 改造）；未覆盖的必须在报告中说明原因
4. 生成 `.ai-point/【需求名】/verify-report.md`，含：
   - 改动文件清单（新增 / 修改）
   - 事件覆盖表（清单条目 ↔ 事件 code ↔ 落点文件）
   - 验证结果（类型检查、grep 核对、真实上报验证结论）
   - 人工依赖待办（平台登记 / 宿主集成等，含待办人）
   - 联调建议：本地启动（PC `XLB_ENV=development` 自动开启 debug）/ 控制台验证事件上报的操作路径清单；看板侧字段核对建议
5. 告知用户验证结论，提示其在本地联调环境实际操作一遍确认事件上报

## 出口

- 报告生成并告知用户 → 流程结束
- 用户反馈问题 → 回 05 修复后重新验证
