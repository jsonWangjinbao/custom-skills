# 接口盘点规则

Phase 0 盘点时加载。目标：对用户指定模块找全联调接口，并为每个接口推断期望出入参契约。

## 1. 确定模块范围

- 用户指定的目录/文件（如 `src/pages/order`）
- 未指定或表述模糊时，先向用户确认范围再开始

## 2. 找全 API 调用

按优先级排查：

1. **api/service 层**：模块内或全局的 `api/`、`service/`、`services/` 目录，及 `*.api.ts`、`*Service.ts` 文件
2. **请求关键字搜索**（在模块范围内 grep）：
   - `request.` / `http.` / `axios` / `fetch(` / `umi-request` / `useRequest(`
3. **页面/组件中的直接调用**：绕过 api 层在组件里直接发请求的点，同样纳入清单
4. **间接引用**：页面 import 了模块外的 api 函数（如全局 `src/api/` 下的），只要被本模块使用就纳入

注意：

- 同 url 不同 method 算不同接口；同 url 同 method 多个调用点合并为一条
- 动态 url（模板字符串）记静态可识别部分，并在 `url` 字段保持与注入 label 一致
- 明显与联调无关的调用（埋点上报、静态资源、第三方 sdk）排除，并在输出中说明排除了什么

## 3. 推断期望契约

### 期望请求参数（expectReq），优先级从高到低

1. **用户提供的接口文档**（Yapi 导出 / Markdown / 飞书文档）：文档中的必填参数
2. **TS 请求类型**：函数签名中 params 的 interface/type 字段（非可选字段优先）
3. **调用点代码组装**：调用处构造的对象字面量 keys、`new URLSearchParams` 的 append 项

### 期望响应字段（expectRes），优先级从高到低

1. **用户提供的接口文档**：文档中的响应字段
2. **页面字段消费**：grep 调用点之后对返回值的消费，如 `res.data.list`、`result?.data?.total`、解构 `const { list, total } = res.data` —— 页面用到但响应没有 = 渲染异常的根因
3. **TS 响应类型**：响应 interface 的字段

数组元素字段用 `list[].field` 路径表示。消费位置记录到 `file:line`，报告中引用。

### 触发入口（trigger）

沿调用链回溯到用户操作：

- `useEffect`/`componentDidMount` 中调用 → 「进入页面自动加载」
- `onClick`/`onSubmit` 中调用 → 「点击 xxx 按钮 / 提交表单」
- 分页/筛选/下拉刷新 → 对应交互描述

## 4. 输出

- 写入 `.claude/auto-api-debug/inventory.json`（schema 见 [api-dbg-spec.md](api-dbg-spec.md)）
- 每条 `source` 字段标注契约来源（`doc` / `ts` / `usage`），纯 `usage` 推断的接口在报告中置信度最低，需提示用户可补充文档
- 对话内输出清单摘要表：`apiName | METHOD url | 期望参数数 | 期望字段数 | 触发入口 | 来源`
