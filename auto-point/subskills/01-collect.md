# Phase 1 - 材料收集与端识别（两拍收集）

## 进入条件

- 用户触发 auto-point

## 任务

原则：**提问阶段一次性问完**——自动检测先行，检测不到的才提问；两批 AskUserQuestion 之后，除门禁外不再向用户提问。

1. **批次 1（AskUserQuestion，3 张卡片）**：
   - **端**：选项就是 `PC` / `RN`，不加多余描述
   - **需求名**：短中文名（如「发货单埋点」）。用途 = `.ai-point/【需求名】/` 产物目录名 + 中断恢复锚点
   - **埋点范围**：`提供清单材料（飞书/截图/md 文档等）` / `AI 自动识别埋点范围`
2. **需求名重名检测**：落盘前检查 `.ai-point/【需求名】/` 是否已存在——存在则用 AskUserQuestion 问「继续该需求（按中断恢复续跑）/ 换个新需求名」，确认前不得覆盖已有产物
3. **范围解析（按批次 1 选择分支）**：
   - 提供清单材料 → 解析并提取清单条目。清单标准字段（飞书表格口径）：

     | 端 | 子应用 | 高频页面 | 事件（浏览/点击） | 事件名称 | event_id | 页面路径 | 是否埋点 | 截图 |
     | --- | --- | --- | --- | --- | --- | --- | --- | --- |

     - 截图材料：逐行识别图中表格；无法辨认的单元格标记「待确认」，**不得臆造**
     - 只保留「是否埋点 = 是」（或用户明确要埋）的条目进入后续流程；其余列入「不埋」备查
   - AI 自动识别 → 跳过材料解析，`source-list.md` 标记「AI 自动识别埋点范围」；02-survey 代码盘点产出的清单草案即范围材料，**经门禁 1 确认后才成为正式清单**（铁律 5 对草案同样生效）
4. 确认目标项目根目录（默认当前工作区；工作区有多个候选项目时，用 AskUserQuestion 确认）
5. **自动检测**（不问用户，检测结论落盘并在批次 2 回显）：

   **PC：**

   | # | 检测项 | 检测方式 |
   | --- | --- | --- |
   | 1 | `@xlb/xlb-tracker`、`@xlb/utils`、`@arms/rum-browser` 依赖 | `cat package.json` |
   | 2 | `src/tracking` 形态：是否存在；lib/business 分层；有无 `lib/xlbTrackerAdapter.ts`、`business/` | `ls src/tracking` + Glob |
   | 3 | http 客户端（XlbFetch / axios 实例 / 其他） | `grep -rn "XlbFetch" src/ package.json` |
   | 4 | 用户信息源（getUserInfo 类工具及返回字段） | `grep -rn "getUserInfo" src/utils src/services` |
   | 5 | ARMS key 变量名与各 umirc define 注入 | `grep -rn "TRACKING_KEY" .umirc*.ts config/` |
   | 6 | XLB_DEPLOY_ENV 四态注入情况 | `grep -n "XLB_DEPLOY_ENV" .umirc*.ts` |
   | 7 | 既有业务埋点调用（bizTracker/trackAction/trackBoard 等） | `grep -rn "bizTracker\|trackAction" src/pages` 抽样 |

   **RN**（远程包项目本身 + 宿主 App 仓库；宿主仓库不在工作区时，宿主相关项标「未检测」并列为人工确认项）：

   | # | 检测项 | 检测方式 |
   | --- | --- | --- |
   | 1 | 宿主青鸟 SDK 版本（`triggerEventBeforeInit` 从 1.1.x 起提供） | 宿主 `package.json` 中 `@xlb/react-native-qingniao-lib` |
   | 2 | 宿主 env 传参：`initQNSDKWithDefaultConfig` 第三参是否为 `Config.ENV` | 宿主 `grep -rn "initQNSDKWithDefaultConfig" src` |
   | 3 | 宿主 `.env.dev/.env.test/.env.staging/.env.prod` 是否齐全，`ENV` 取值是否为 `DEV/TEST/STAGING/PROD` | 宿主 `grep -n "^ENV=" .env*` |
   | 4 | `src/tracking` 形态：是否存在；文件树是否与 rn-bootstrap「文件树」一致（types/context/reporter（或 qingniao）/apiCapture/tracker/chains/events/index）；是否导出 `bizTracker`；是否已用 `triggerEventBeforeInit` / `BIZ_PRODUCT` | `ls src/tracking` + `grep -rn "bizTracker\|triggerEvent\|biz_product" src/tracking` |
   | 5 | http 客户端（axios 实例 / 封装请求库） | `grep -rn "axios.create\|interceptors" src` |
   | 6 | 用户信息源、navigationRef 位置 | `grep -rn "authModel\|navigationRef" src` |
   | 7 | 既有业务埋点调用 | `grep -rn "bizTracker\|trackAction" src/pages` 抽样 |
   | 8 | 其他埋点（铁律 6）：非标准结构的埋点 SDK / 自写埋点工具及其所在目录 | `grep -rln "umeng\|sensors\|growingio\|firebase/analytics\|qingniao\|\btrack(\|trackEvent\|logEvent\|reportEvent" src package.json`（排除标准结构内文件） |

6. **批次 2（AskUserQuestion，≤3 张卡片）**：
   - **应用标识确认**：默认占位 appId=`xlb-<域>-web`（按项目目录名推导，如 fsms_web → xlb-fsms-web）、appName=项目名——未登记也可先用，正式登记后替换并在 verify-report 记人工依赖；选 Other 填正式登记值
   - **青鸟登记**：清单是否已含 event_id 列（含→逐事件填 qingniaoId；不含→留空回退 event_code）
   - **检测结论确认**：回显第 5 步检测结论（形态预判 A/B/C/D + 关键项），用户确认或 Other 纠正；B/C 级一并授权「允许预改造既有埋点代码 / 仅新增不动既有」。检测到其他埋点时必须在该卡片显式写明：「检测到其他埋点 X（位置），将原样保留不动；本次新事件按标准结构落位 `src/tracking`」
   - 上报通道不问用户：PC 一律按 SCM 样板双发（SLS 主通道 + ARMS 兜底）；RN 一律走青鸟 RN SDK（rn-bootstrap reporter）
7. 在目标项目创建 `.ai-point/【需求名】/`（不存在则新建），把解析出的原始清单**照抄原文**落盘为 `source-list.md`（AI 自动识别分支落范围来源标记，不加解读、不改字段名）；检测结论与两拍答案追加到 `source-list.md` 末尾「入口收集与检测结论」一节

## 输出要求

告知用户：

- 解析出 N 条埋点条目（按页面分组列出：页面名 + 条数）；AI 自动识别分支则说明「范围将在代码盘点后产出草案」
- M 个单元格无法辨认（逐条列出，要求补充）
- 需求名重名检测结果（新需求 / 续跑既有需求）
- 目标项目路径与产物目录路径
- 自动检测结论摘要（依赖/形态/http 客户端/用户源/key 注入）与两拍收集结果

## 出口

- 材料完整（或选 AI 自动识别）、两拍信息齐全 → 进入 [02-survey.md](02-survey.md)
- 存在无法辨认条目 → 等用户补充后重新解析
