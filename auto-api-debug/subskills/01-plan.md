# Phase 1 - 操作步骤清单 & 注入计划

本阶段是**人工门禁**：两部分计划未经用户确认，不得进入注入。

## 进入条件

- Phase 0 接口清单已生成

## 任务

1. **生成操作步骤清单**：从 inventory 的 `trigger` 反推用户操作，覆盖全部接口：
   - 每一步：`打开 xxx 页面 → 点击/输入 xxx → 预期触发接口 [A, B]`
   - 标注前置条件：登录态、列表需有数据、需要特定角色权限等
   - 步骤排序：先页面加载类（自动触发），后交互类；有依赖关系的操作按依赖排序（先新增再编辑）
   - Web 项目标注入口 URL；RN 项目标注页面路径
2. **生成注入计划**：逐接口列出注入点（`file:line — apiName — label`），注入形式见 [../reference/api-dbg-spec.md](../reference/api-dbg-spec.md)
3. **收集执行前提**（Web 项目）：向用户确认
   - dev server 是否已启动、入口 URL 是什么
   - 是否需要登录、是否已登录
   - 测试数据条件（如「需要一个待审核的订单」）

## 输出要求

```
📝 联调计划

【操作步骤】（共 N 步，覆盖全部 M 个接口）
1. 打开订单列表页 → 预期触发 GET /order/list
2. 点击「新建订单」→ 填写表单 → 点击提交 → 预期触发 POST /order/submit
...
前置条件：需要登录态；列表需至少有一条数据

【注入计划】（共 N 个注入点）
- src/api/order.ts:12 — fetchList — 'GET /order/list'
- src/pages/order/Detail/index.tsx:45 — 直接调用 — 'GET /order/detail'
...

请确认或调整。确认后我开始注入并自动执行。
```

## 出口

- 用户确认 → 进入 [02-inject.md](02-inject.md)
- 用户要求调整 → 修改步骤清单/注入点后重新确认
