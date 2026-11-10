---
name: auto-point-sync
description: 目标项目已有行为埋点代码即可将节点事件字典提交到 xlb-chain-board 待办，由具备 submission.merge 权限的成员审核合入后生效；不要求 .ai-point 产物或验证报告。Use when 用户说「同步埋点到看板」「刷节点配置」「提交节点配置」「埋点完成后上看板」、或其他埋点开发 skill 或人工开发完成后要求把节点配置推到看板时。
---

# auto-point-sync

代码 → 看板的节点配置提交工作流：定位埋点代码 → 确定性提取事件字典 → 补齐人工字段 → 服务端 dry-run diff → 【门禁】确认 → 正式提交待办。提交本身不改节点配置；看板审核合入后才生效。

## 铁律（不可违反）

1. **只读业务代码**：本 skill 不改业务代码、不改埋点字典；发现代码问题只报告，退回原开发 skill 修复。
2. **先 dry-run 再提交**：必须调用服务端 dry-run 展示真实 diff，并通过 AskUserQuestion 获得明确确认；`scripts/submit.mjs` 也会校验 payload 指纹，预检后修改 payload 必须重新 dry-run。
3. **提交不等于生效**：正式提交后必须表述「已提交待审核，尚未生效」，不得宣称已同步完成。只有 `status=merged` 才可表述「已合入并生效」。
4. **终态语义必填**：代码只有 `terminal: true`，看板还需要 `terminalKind=fulfill|close`；无法从已确认 point-list 明确判定时，必须通过 AskUserQuestion 询问，不得猜。
5. **人工配置不静默覆盖**：看板合入默认保留库内已有描述、页面标识与分析口径；是否覆盖由审核人在待办页决定。skill 不绕过审核直接写库。
6. **地址透明**：每次 dry-run 明确回显实际看板地址及来源；显式指定地址时不回退。业务错误、固定令牌版本不一致不切换地址重试。

## 触发 / 不触发

- **触发**：目标项目已有埋点代码（events + chains），用户要求同步/刷/提交节点配置到看板；代码可由 auto-point、其他开发 skill 或人工开发产生，不要求 `.ai-point` 目录或验证报告。
- **不触发**：埋点代码尚未实施；从看板拉配置到代码（走 auto-point-cfg）；链条画布挂载、通用配置、看板排障。

## 入口信息

先从代码与上下文自动识别，缺失时通过 AskUserQuestion 一次问完：

1. **需求目录（可选）**：用户指定或存在多个 `.ai-point/*/` 时用于选择产物输出位置；只有一个目录时自动选中，没有 `.ai-point` 也能继续。
2. **端**：PC / RN；优先按 tracking 目录结构判定，无法识别时询问。
3. **nodeKey**：由代码 `orderType ?? chainId` 提取；多条链条或页面归属不明确时询问选择。
4. **看板地址（可选）**：用户说「用本地看板 / localhost」时传 `--board-url http://localhost:3001`；用户给出地址时原样传。没有指定则由脚本按配置文件/环境变量/线上→本地探测解析。

## 工作流

```
01-collect   定位埋点代码、识别端/输出目录/看板地址意图/中断恢复
  → 02-extract   脚本提取代码字典 → 人工字段补齐 → 生成 payload
  → 03-submit    服务端 dry-run → 【门禁：确认 diff 与地址】→ 正式提交 → 报告
```

## 阶段路由（按当前阶段 Read，禁止提前全量加载）

| 阶段 | 文件 | 进入时机 |
| --- | --- | --- |
| 1 收集与前置校验 | [subskills/01-collect.md](subskills/01-collect.md) | 入口，必做 |
| 2 提取与补齐 | [subskills/02-extract.md](subskills/02-extract.md) | 阶段 1 完成后 |
| 3 预检与提交 | [subskills/03-submit.md](subskills/03-submit.md) | payload 生成并校验后；含唯一门禁 |

## 参考文件索引（按需 Read）

| 文件 | 用途 | 加载时机 |
| --- | --- | --- |
| [reference/field-mapping.md](reference/field-mapping.md) | 代码 / `.ai-point` → supplement / payload 字段映射；终态语义口径 | 阶段 2 |
| [reference/api-contract.md](reference/api-contract.md) | 地址、固定令牌、接口、错误码、状态语义 | 阶段 1/3 或接口失败时 |
| [reference/troubleshooting.md](reference/troubleshooting.md) | 提取失败、401/404、冲突、通知失败处理 | 发生对应错误时 |
| [templates/supplement.json.tpl](templates/supplement.json.tpl) | 人工补齐文件模板 | 阶段 2 |
| [templates/sync-report.md.tpl](templates/sync-report.md.tpl) | 同步报告模板 | 阶段 3 |

> 渐进式披露：SKILL.md 只保留流程骨架；每次只 Read 当前 subskill，reference 仅在该阶段明确要求时 Read。脚本帮助看文件头注释，不要提前把所有实现读入上下文。

## 输出目录

输出目录记为 `SYNC_DIR`，按以下优先级确定：

1. 用户指定的需求目录 → `.ai-point/【需求名】/board-sync/`；
2. 项目存在唯一 `.ai-point/*/` → 沿用该目录下 `board-sync/`；
3. 没有 `.ai-point` → 项目根 `.board-sync/`，直接存放以下产物。

```
board-sync/
├── extract.json        # extract.mjs 从代码确定性提取
├── supplement.json     # 模型/用户补齐的人工字段，唯一可手工编辑的 JSON
├── payload.json        # payload.mjs 确定性生成，不手改
├── dry-run.json        # 服务端预检结果 + 锁定地址 + payload 指纹
├── submission.json     # 正式提交 ID、待办链接、状态
└── sync-report.md      # 提交/状态报告
```

上面是单 nodeKey 布局。一次同步多个 nodeKey 时，`extract.json` 与 `sync-report.md` 仍在 `board-sync/` 顶层共享，每个节点改用 `board-sync/<nodeKey>/` 子目录各放一套 supplement/payload/dry-run/submission（payload.mjs 会从 out 目录向上逐级探测 verify-report.md 取 implAt，子目录布局同样命中需求目录；也可在 supplement 显式写 implAt）：

```
board-sync/
├── extract.json            # 全部链条共享一份
├── sync-report.md          # 合并版报告
└── <nodeKey>/
    ├── supplement.json
    ├── payload.json
    ├── dry-run.json
    └── submission.json
```

## 中断恢复

| 已有产物 | 恢复点 |
| --- | --- |
| 无 `board-sync/` | 从 01 开始 |
| 只有 extract.json | 检查代码是否变化；未变化从 02 补齐，变化则重新提取 |
| supplement.json，无 payload.json | 从 payload 生成继续 |
| payload.json，无 dry-run.json | 执行 dry-run |
| dry-run.json，无 submission.json | 回显旧 diff；用户尚未确认则重新门禁，已确认且 payload 指纹一致才正式提交 |
| submission.json | 先执行 `status` 回显审核结果；pending 不重复提交；rejected 按原因修正后重新完整走 dry-run；merged 报告已生效 |

> 多 nodeKey 子目录布局时，按每个 `board-sync/<nodeKey>/` 分别套用本表；顶层 `extract.json` 变化才需全部节点重新提取。

## 所有提问必须通过 AskUserQuestion

需求选择、端/nodeKey 冲突、终态语义、dry-run 门禁确认等需要用户决策的地方，必须使用 AskUserQuestion，禁止在普通文本里直接提问。
