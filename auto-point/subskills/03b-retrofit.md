# Phase 2.5 - 预改造（既有基建对齐标准结构：PC → SCM 样板，RN → rn-bootstrap）

## 进入条件

- 02-survey 基建判定为 **B 级**（缺 XlbTrackerAdapter / business 层 / `@xlb/xlb-tracker` 依赖）或 **C 级**（口径偏离）
- 入口批次 2 已获「允许预改造」授权

## 任务

1. **加载样板**：PC → Read [../reference/pc-bootstrap.md](../reference/pc-bootstrap.md)；RN → Read [../reference/rn-bootstrap.md](../reference/rn-bootstrap.md)。以对应端文件为唯一对齐基准。
2. **生成预改造清单**：对 survey.md 偏离项逐条给出改造项，落盘 `.ai-point/【需求名】/retrofit.md`，模板：

   ```markdown
   # 【需求名】预改造清单（基建 B/C 级 → SCM 样板）

   > 基于 survey.md 基建判定：X 级 ｜ 状态：待用户确认（门禁 1.5）

   ## 偏离项与改造清单

   | # | 文件 | 现状 | 改造内容 | 样板来源（pc-bootstrap §） | 风险 |
   | --- | --- | --- | --- | --- | --- |
   | 1 | src/tracking/lib/xlbTrackerAdapter.ts | 不存在 | 新增（适配点 D 填 appId/appName/biz_product） | §8 | 低 |
   | 2 | src/tracking/lib/factory.ts | 单适配器 | adapters 注册加 XlbTrackerAdapter；buildUserInfo 补 account/store 字段 | §7 | 低 |
   | 3 | package.json | 无依赖 | npm i @xlb/xlb-tracker（私有源） | §前置检测 1 | 中：依赖装不上即阻断 |
   | 4 | src/tracking/business/ | 不存在或为 reporter 桥接版 | 按 §12-§17 落位/替换（reporter.ts 删除，发送改走 getGlobalTracking） | §12-§17 | 中：既有事件上报路径切换 |
   | 5 | src/utils/trackingTools.ts | env 硬编码/sampleRate 0.2 | 按 §18 修正（env 四态/debug 跟随本地开发模式/采样 1/installApiCapture） | §18 | 低 |
   | 6 | .umirc.*.ts | 缺 XLB_DEPLOY_ENV | 按 §19 逐配置注入四态 | §19 | 低 |

   ## 明确不做（红线）

   - 不改 SDK 公共语义（TrackingSDK/queue/plugins 行为保持不变）
   - 不动既有业务事件的既有上报路径与事件字典条目（event_ver 不因此次预改造递增）
   - 不动清单外任何业务代码
   - 不动其他埋点（铁律 6）
   ```

   RN 端同一模板，「样板来源」列改填 rn-bootstrap 对应节，典型行：

   | # | 文件 | 现状 | 改造内容 | 样板来源（rn-bootstrap §） | 风险 |
   | --- | --- | --- | --- | --- | --- |
   | 1 | src/tracking/types.ts / context.ts | 不存在 | 新增（原样落位） | 文件树 / context.ts | 低 |
   | 2 | src/tracking/reporter.ts（或既有 qingniao.ts） | 仅 triggerEvent / setTopic 无守卫 | 改 triggerEventBeforeInit（旧版回退）+ 初始化守卫 + getReporterDiagnostics | reporter.ts | 中：既有事件上报路径切换 |
   | 3 | src/tracking/apiCapture.ts | 无或不接收 http | 按样板替换为 installApiCapture(http) | apiCapture.ts | 低 |
   | 4 | src/tracking/tracker.ts | biz_product 取 page_code / 无 dev 打印 | BIZ_PRODUCT 常量 + `__DEV__` 打印 | tracker.ts、适配点 F | 低 |
   | 5 | src/tracking/index.ts | 无 register 函数 | 按样板补 register<X>Tracking()（installApiCapture(http) + setReporterTopic） | index.ts | 低 |

   > RN 既有通道文件名为 `qingniao.ts` 等等价命名时保留文件名，只对齐内部口径与导出。

3. **【门禁 1.5】AskUserQuestion 确认**：展示清单摘要（N 项改造 + 依赖安装 + 风险项），用户确认后才动手；要求调整则改完重新确认。
4. **实施预改造**：按清单执行。**与后续埋点实施分两批改动**（预改造先行完成并验证，再进入埋点阶段），便于 review 与回滚。
5. **预改造验证**（写进 retrofit.md 验证节）：
   - `npx tsc --noEmit` 过滤 tracking 相关文件 0 错误；eslint 改动文件 0 错误
   - PC：
     - `grep -rn "XlbTrackerAdapter" src/tracking/lib/factory.ts` 确认双适配器注册
     - `grep -n "XLB_DEPLOY_ENV" .umirc*.ts` 四态齐全
     - 本地启动冒烟：启动后 console 可见 `[Tracking] 统一埋点 SDK 初始化完成`；触发任一既有事件确认 SLS 通道（Network 里官方 SDK 上报请求）与 ARMS 通道双发
     - 已存在的业务事件（若有）回归：事件字段口径不变（event_code/六组字段），仅通道增加
   - RN：
     - `ls src/tracking` 与 rn-bootstrap 文件树逐项一致；`grep -n "triggerEventBeforeInit" src/tracking/reporter.ts`（或等价文件）命中
     - debug 包执行 `getReporterDiagnostics()`，结论写入验证节（判读见 rn-bootstrap「验证钩子」）
     - 已存在的业务事件（若有）回归：Metro 控制台 `[track]` 打印的 event_code 与字段口径不变

## 输出要求

告知用户：预改造 N 项全部完成（逐项 ✅/❌）、验证结果、遗留人工依赖（appId 正式登记等）、两批改动的文件边界（预改造批 vs 埋点批）。

## 出口

- 预改造完成且验证通过 → 进入 [03-point-list.md](03-point-list.md)
- 依赖装不上 / 验证不通过 → 停止并报告用户，不得带着坏通道进入埋点阶段
