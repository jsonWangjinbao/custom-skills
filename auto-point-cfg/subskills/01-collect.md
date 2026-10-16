# Phase 1 - 拉取配置

## 进入条件

- 用户触发 auto-point-cfg

## 任务

1. 通过 AskUserQuestion 收集入口三问：
   - **端**：`PC` / `RN`
   - **nodeKey 列表**：逗号分隔的节点 ID（= order_type，如 `delivery_note`）
   - **需求名**：短中文名（如「发货单埋点」），用于 `.ai-point/【需求名】/`
2. 加载 [../reference/config-sync.md](../reference/config-sync.md)，解析 board 地址并探测可达性（`/api/health`）：
   - 不可达 → **停止**，提示用户启动 board 或配置 `XLB_CHAIN_BOARD_URL`，不得跳过
3. 拉取 bundle：`GET {boardUrl}/api/config/bundle?platform={端}&nodeKeys={nodeKey列表}`
   - 404（节点不存在）→ 列出缺失 nodeKey，AskUserQuestion 请用户确认 nodeKey 或先去配置中心建节点
   - 其他非 200 → 报出错误信息并停止
4. **配置完备性检查**：任一节点 `platforms` 为空或 `pages` 为空 → 该节点未维护事件清单，**停止**并提示：「节点 X 在配置中心无 {端} 事件清单，请先到配置中心（/config/nodes）维护后再执行」
5. 确认目标项目根目录（默认当前工作区；工作区有多个候选项目时，用 AskUserQuestion 确认）
6. 在目标项目创建 `.ai-point/【需求名】/`，把 bundle 响应**原样落盘**为 `config-bundle.json`（不改字段、不做裁剪）

## 输出要求

告知用户：

- 拉取到的节点清单：nodeKey + 名称 + 各页面 pageCode/pageName + 事件数（events + extraEvents）+ eventVer
- 通用配置摘要：idleTimeoutMs、chainSteps 环节全集、SLS/青鸟通道是否已配置（空值项预告为人工依赖）
- 目标项目路径与产物目录路径

## 出口

- bundle 落盘且配置完备 → 进入 [02-survey.md](02-survey.md)
- board 不可达 / 节点未配置事件清单 → 停止，等用户处理
