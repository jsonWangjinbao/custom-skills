# Phase 4 - 收集 & 比对 & 联调报告

## 进入条件

- Web：Phase 3 浏览器执行完成；RN：用户告知「操作完了」
- 或 Phase 5 修复后回归重新收集

## 任务

1. **读取日志**：`.claude/auto-api-debug/{DEBUG_ID}.log`（JSONL 格式见 [../reference/api-dbg-spec.md](../reference/api-dbg-spec.md)）
   - 不要 kill 服务器 — 修复后需要重新收集验证
2. **日志为空时**：按 [../reference/troubleshooting.md](../reference/troubleshooting.md)「日志为空分级诊断」逐项排查，直到日志产生
3. **逐接口比对**：日志 × `inventory.json`，同一 label 的 request/response/error 配对还原完整调用

| 检查项 | 判定逻辑 | 分类 |
| ------ | -------- | ---- |
| 请求缺参数 | `expectReq` 有、实际请求 params 没有 | 前端待修 |
| 请求多参数 | 实际请求有、`expectReq` 没有 | ⚠️ 提示（可能是文档过期） |
| 响应缺字段 | `expectRes` 有、实际响应没有 | 后端待改 |
| 接口报错 | error 日志 / HTTP 非 2xx / 业务 code 非 0 | 按错误内容判断前后端归属 |
| 未触发接口 | inventory 中该 label 无任何日志 | 步骤未覆盖 |

   - `source` 为 `usage` 的比对结论置信度低，报告中标注「推断来源」，避免误报
4. **渲染问题关联**：结合 Phase 3 的 console 报错和截图（白屏/布局错乱/报错文案），关联到对应接口（如列表接口报错 → 列表页空白截图）
5. **知识库检查**：读 `~/.claude/skills/auto-api-debug/knowledge/_index.json`（文件不存在或为空则跳过），同项目 + 同 url 标签的历史坑命中时在报告中标注
6. **生成报告**：按 `~/.claude/skills/auto-api-debug/templates/api-report.md.tpl` 写入 `.claude/auto-api-debug/report.md`，并在对话内输出摘要

## 输出要求

```
📊 联调报告摘要：{模块}

✅ 通过 {X} 个 | ❌ 存在问题 {Y} 个 | ⚪ 未触发 {Z} 个

🔧 前端待修（N 项）
1. POST /order/submit — 请求缺少参数 store_id（src/pages/order/Form.tsx:88）

📡 后端待改（N 项）
1. GET /order/list — 响应缺少字段 list[].statusText（页面在 Detail.tsx:32 消费）

🖼 渲染问题（N 项）
1. 订单列表页白屏 — 关联 GET /order/list 500 报错（shots/step-1.png）

⚪ 未触发接口（N 项）：GET /order/export — 建议操作：点击「导出」按钮

完整报告：.claude/auto-api-debug/report.md
```

## 出口

- 有前端待修项 → 征求用户确认修复方案 → 进入 [05-fix-verify.md](05-fix-verify.md)
- 有未触发接口 → 补充操作步骤，回 [03-execute.md](03-execute.md) 再跑一轮
- 全部通过或用户认可当前结果 → 用户确认「联调完成」→ 进入 [05-fix-verify.md](05-fix-verify.md) 的最终清理
