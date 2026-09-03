# Phase 0 - 接口盘点

联调请求的入口阶段，先于一切注入操作执行。

## 进入条件

- 用户提出联调请求并指定模块（如「联调一下 src/pages/order 这个模块」）
- 模块范围模糊时，先向用户确认再开始

## 任务

1. **提取项目名**：读取当前项目 `package.json` 的 `name` 字段
2. **确认项目类型**：检查 `package.json` — 有 `react-native` 依赖 → RN 项目，否则 → Web 项目
3. **询问接口文档**：用户是否有接口文档（Yapi 导出 / Markdown / 飞书链接）；有则先解析文档作为契约基准
4. **扫描模块找全接口**：按 [../reference/inventory-rules.md](../reference/inventory-rules.md) 的规则盘点，推断每个接口的 expectReq / expectRes / trigger
5. **写入清单**：创建 `.claude/auto-api-debug/` 目录（如不存在），写入 `inventory.json`（schema 见 [../reference/api-dbg-spec.md](../reference/api-dbg-spec.md)）

## 输出要求

```
📋 接口盘点完成：{模块} 共 {N} 个联调接口

| apiName | 接口 | 期望参数 | 期望字段 | 触发入口 | 来源 |
| ------- | ---- | -------- | -------- | -------- | ---- |
| fetchList | GET /order/list | 3 | 4 | 订单列表页 — 进入加载 | doc |
| submit | POST /order/submit | 5 | 1 | 订单表单 — 点击提交 | ts |

已排除：{埋点上报等无关调用及原因}
契约来源说明：doc=接口文档，ts=TS 类型，usage=代码推断（置信度最低，可补充文档提高准确度）
```

## 出口

- 清单写入完成 → 进入 [01-plan.md](01-plan.md)
