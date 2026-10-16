# Phase 6 - 验证与收尾

## 进入条件

- 05 实施完成

## 任务

1. **静态验证**：
   - 类型检查 / lint 通过
   - grep 核对：清单每个事件 code 在代码中有且仅有方案声明的调用点
   - 事件字典在统一出口的导出完整，无遗漏
   - **配置一致性核对**：事件字典逐字段对照 config-bundle.json——`code/name/type/step/regressive/terminal/qingniaoId` 全等，`XXX_EVENT_VER` == bundle `eventVer`，`XXX_EXTRA_EVENTS` 与 bundle `extraEvents` 一致；任一不符必须修复，不得以代码现状为准
2. **真实上报验证（确保「跑完即可上报」，bootstrap 项目必做）**：
   - dev 环境启动目标项目，操作至少一条已埋点路径（页面进入 + 一个点击事件）
   - PC：reporter debug 模式控制台确认 `[tracking] event:` 打印，或 Network 面板确认上报请求发出
   - RN：执行 bootstrap 提供的 `isReporterReady()` 检测——`false` 说明宿主未集成 SDK，事件静默不发，必须标注「上报未验证」
   - 通道未就绪（依赖未装 / 宿主未集成 / 平台未登记）时，报告必须显式标注「上报未验证」及原因与待办人，**不得静默宣称完成**
3. **覆盖率核对**：point-list.md 每条目 → 状态（已埋 / 复用 / 改造）；未覆盖的必须在报告中说明原因
4. **配置中心回写（静态验证与覆盖率核对通过后执行）**：
   - 逐节点调用 `PUT {boardUrl}/api/config/nodes/{id}`，body `{ "tracked": true, "lastImplAt": "<当前 ISO 8601>" }`；`id` 取 bundle `node.id`，boardUrl 解析见 [../reference/config-sync.md](../reference/config-sync.md)
   - 「上报未验证」时仍回写，但 body 改为 `{ "lastImplAt": "<ISO>" }`（不标 tracked）
   - 回写失败（board 不可达 / 404）**不阻断流程**，但 verify-report.md 必须显式标注「配置中心回写失败」及原因——不得静默宣称完成
5. 生成 `.ai-point/【需求名】/verify-report.md`，含：
   - 改动文件清单（新增 / 修改）
   - 事件覆盖表（清单条目 ↔ 事件 code ↔ 落点文件）
   - 验证结果（类型检查、grep 核对、配置一致性核对、真实上报验证结论）
   - 配置中心回写结果（每节点成功 / 失败及原因）
   - 人工依赖待办（平台登记 / 宿主集成等，含待办人）
   - 联调建议：dev 环境开启 debug / 控制台验证事件上报的操作路径清单；看板侧字段核对建议
6. 告知用户验证结论，提示其在 dev 环境实际操作一遍确认事件上报

## 出口

- 报告生成并告知用户 → 流程结束
- 用户反馈问题 → 回 05 修复后重新验证
