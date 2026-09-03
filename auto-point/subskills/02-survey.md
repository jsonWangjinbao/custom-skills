# Phase 2 - 代码梳理

## 进入条件

- `.ai-point/【需求名】/source-list.md` 已落盘

## 任务

先按端加载模式参考：PC → [../reference/pc-patterns.md](../reference/pc-patterns.md)；RN → [../reference/rn-patterns.md](../reference/rn-patterns.md)。

1. **基建检查（最先做，决定后续走向）**：
   - 检查目标项目是否已有埋点封装（`src/tracking` 类目录、`bizTracker` / 等价门面、事件字典文件）
   - **有** → 精读既有封装与字典，后续全程复用并对齐既有口径，禁止另起一套
   - **无** → 进入 bootstrap 分支：加载对应端 bootstrap 参考（PC → [../reference/pc-bootstrap.md](../reference/pc-bootstrap.md)；RN → [../reference/rn-bootstrap.md](../reference/rn-bootstrap.md)），按其「前置检测」表逐项确认（上报 SDK 依赖 / http 客户端形态 / 用户信息源 / 环境变量 / 应用标识），把「从零封装」纳入后续方案与实施，确保跑完后事件可真实上报
   - **无基建但目标项目有自己的埋点 SDK** → bootstrap 的 reporter 适配点 E 桥接既有 SDK，不重复造通道
   - 人工依赖（平台 app.id/topic 登记、青鸟事件登记、RN 宿主集成 SDK）无法由 skill 代劳，必须写进 survey.md「风险与疑问」，并在方案中列为「人工依赖」
2. **页面定位**：按清单「高频页面」逐一找到页面目录、路由入口、列表页与详情页文件
3. **操作点定位**：按清单「事件名称」找到对应按钮/菜单/表单的渲染位置与处理函数
   - 点击类：定位 onClick / 确认弹窗 / 批量操作入口
   - 浏览类：定位页面打开、详情打开、查询触发位置
4. **API 关联**：每个操作点对应的接口函数与 url（判断目标项目是否有接口捕获白名单机制，是否需要显式 apiUrl）
5. **单据快照字段**：确认单据对象上 `fid / order_no / state / appoint_state / supplier_id / recv_store_id / source_*` 等字段的可得性（列表行数据、详情数据）
6. **现有埋点盘点**：grep `bizTracker|trackAction|_EVENTS`，标记清单条目现状：已有 / 新增 / 需改造

## 输出要求

生成 `.ai-point/【需求名】/survey.md`，含：

- 基建结论（复用既有 / bootstrap 从零封装 / bootstrap+桥接既有 SDK；bootstrap 分支附前置检测结果与人工依赖清单）
- 页面映射表：清单页面 → 文件路径（列表/详情/关键子组件）
- 操作点映射表：清单事件 → 处理函数（文件:行号）→ API
- 风险与疑问：找不到的操作点、字段缺失、多入口共用函数等——**逐条列出，不得静默跳过**

## 出口

- 无阻断疑问 → 进入 [03-point-list.md](03-point-list.md)
- 有阻断疑问（操作点找不到、基建缺失未决策等） → AskUserQuestion 澄清后再推进
