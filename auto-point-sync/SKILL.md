---
name: auto-point-sync
description: 行为埋点完成后，将目标项目代码中的节点事件字典提交到 xlb-chain-board 待办，由具备 submission.merge 权限的成员审核合入后生效。Use when 用户说「同步埋点到看板」「刷节点配置」「提交节点配置」「埋点完成后上看板」、或其他埋点开发 skill 已验证完成并要求把节点配置推到看板时。
---

# auto-point-sync

代码 → 看板的节点配置提交工作流：校验埋点产物 → 确定性提取事件字典 → 补齐人工字段 → 服务端 dry-run diff → 【门禁】确认 → 正式提交待办。提交本身不改节点配置；看板审核合入后才生效。

## 铁律（不可违反）

1. **只同步已验证埋点**：目标项目 `.ai-point/【需求名】/verify-report.md` 必须存在且验证结论为通过；未通过则停止，不得提交。
2. **只读业务代码**：本 skill 不改业务代码、不改埋点字典；发现代码问题只报告，退回原开发 skill 修复。
3. **先 dry-run 再提交**：必须调用服务端 dry-run 展示真实 diff，并通过 AskUserQuestion 获得明确确认；`scripts/submit.mjs` 也会校验 payload 指纹，预检后修改 payload 必须重新 dry-run。
4. **提交不等于生效**：正式提交后必须表述「已提交待审核，尚未生效」，不得宣称已同步完成。只有 `status=merged` 才可表述「已合入并生效」。
5. **终态语义必填**：代码只有 `terminal: true`，看板还需要 `terminalKind=fulfill|close`；无法从已确认 point-list 明确判定时，必须通过 AskUserQuestion 询问，不得猜。
6. **人工配置不静默覆盖**：看板合入默认保留库内已有描述、页面标识与分析口径；是否覆盖由审核人在待办页决定。skill 不绕过审核直接写库。
7. **地址透明**：每次 dry-run 明确回显实际看板地址及来源；显式指定地址时不回退。业务错误、固定令牌版本不一致不切换地址重试。

## 触发 / 不触发

- **触发**：埋点实施和验证已经完成，用户要求同步/刷/提交节点配置到看板；可由 auto-point、其他开发 skill 或人工开发产生埋点代码。
- **不触发**：埋点还未实施或验证未通过（先回原开发 skill）；从看板拉配置到代码（走 auto-point-cfg）；链条画布挂载、通用配置、看板排障。

## 入口信息

先从上下文与 `.ai-point` 产物自动识别，缺失时通过 AskUserQuestion 一次问完：

1. **需求名**：对应 `.ai-point/【需求名】/`；只有一个已验证需求时自动选中。
2. **端**：PC / RN；优先读 point-list 头部，无法识别时询问。
3. **nodeKey**：由代码 `orderType ?? chainId` 提取；多条链条或页面归属不明确时询问选择。
4. **看板地址（可选）**：用户说「用本地看板 / localhost」时传 `--board-url http://localhost:3001`；用户给出地址时原样传。没有指定则由脚本按配置文件/环境变量/线上→本地探测解析。

## 工作流

```
01-collect   校验 verify-report、识别端/需求/配置/中断恢复
  → 02-extract   脚本提取代码字典 → 人工字段补齐 → 生成 payload
  → 03-submit    服务端 dry-run → 【门禁：确认 diff 与地址】→ 正式提交 → 报告
```

## 阶段路由（按当前阶段 Read，禁止提前全量加载）

| 阶段 | 文件 | 进入时机 |
| --- | --- | --- |
| 1 收集与前置校验 | [subskills/01-collect.md](subskills/01-collect.md) | 入口，必做 |
| 2 提取与补齐 | [subskills/02-extract.md](subskills/02-extract.md) | verify 通过后 |
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

目标项目：`.ai-point/【需求名】/board-sync/`

```
board-sync/
├── extract.json        # extract.mjs 从代码确定性提取
├── supplement.json     # 模型/用户补齐的人工字段，唯一可手工编辑的 JSON
├── payload.json        # payload.mjs 确定性生成，不手改
├── dry-run.json        # 服务端预检结果 + 锁定地址 + payload 指纹
├── submission.json     # 正式提交 ID、待办链接、状态
└── sync-report.md      # 提交/状态报告
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

## 所有提问必须通过 AskUserQuestion

需求选择、端/nodeKey 冲突、终态语义、dry-run 门禁确认等需要用户决策的地方，必须使用 AskUserQuestion，禁止在普通文本里直接提问。
