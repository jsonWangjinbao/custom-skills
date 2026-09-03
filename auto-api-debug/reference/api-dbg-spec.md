# apiDbg 调试协议规范

Phase 2 注入、Phase 4 分析时加载。

## label 命名规范

格式：`{METHOD} {url}`，例如：

- `GET /order/list`
- `POST /order/submit`

- METHOD 全大写；url 以 `/` 开头，与代码中实际请求路径一致
- 动态 url（模板字符串）记录静态前缀部分，如 `/order/${id}` 记为 `GET /order/detail`
- **label 必须与 inventory.json 中的 `label` 字段完全一致**，否则比对时无法关联

## 注入方式

- 每个注入文件添加 `import { apiDbg } from 'src/utils/claudeApiDebug';`（该文件尚未导入时）
- 用 `apiDbg(label, params, () => 原请求)` 一行式包装原请求调用
- `params` 传业务入参（组装前的原始参数对象），response 自动记录接口原始返回
- 包装后返回 Promise 与原调用一致；错误记录后原样 rethrow，不改变业务行为
- 调用位置（`src/` 相对路径 + 行号）由 apiDbg 内部通过 Error.stack 自动提取

## 注入示例

示例一：箭头函数单行导出（最常见）

```typescript
// 注入前
export const fetchList = (params: ListParams) => request.get('/order/list', { params });

// 注入后
import { apiDbg } from 'src/utils/claudeApiDebug';
export const fetchList = (params: ListParams) =>
  apiDbg('GET /order/list', params, () => request.get('/order/list', { params }));
```

示例二：函数体内 await

```typescript
// 注入前
export async function submit(data: FormValues) {
  const res = await request.post('/order/submit', data);
  return res;
}

// 注入后
export async function submit(data: FormValues) {
  const res = await apiDbg('POST /order/submit', data, () => request.post('/order/submit', data));
  return res;
}
```

示例三：页面/组件中绕过 api 层的直接调用

```typescript
// 注入前
const res = await request.get('/order/detail', { params: { id } });

// 注入后
const res = await apiDbg('GET /order/detail', { id }, () => request.get('/order/detail', { params: { id } }));
```

## 日志格式（JSONL）

服务器将每条日志追加写入 `.claude/auto-api-debug/{DEBUG_ID}.log`，每行一条 JSON：

```json
{
  "id": "20260624-001",
  "ts": 1719220000000,
  "label": "POST /order/submit",
  "data": "{\"type\":\"request\",\"params\":{\"name\":\"张三\"}}",
  "file": "src/api/order.ts:12"
}
```

`data` 为 JSON 字符串，解析后结构按 `type` 区分：

```json
{ "type": "request",  "params": { } }
{ "type": "response", "response": { }, "durationMs": 123 }
{ "type": "error",    "error": { "message": "...", "status": 500, "code": 10001, "body": { } }, "durationMs": 45 }
```

分析时按 `ts` 时间线展开，同一 label 的 request/response/error 配对还原一次完整调用。

## inventory.json schema

Phase 0 产出，写入 `.claude/auto-api-debug/inventory.json`：

```json
[
  {
    "apiName": "fetchList",
    "label": "GET /order/list",
    "method": "GET",
    "url": "/order/list",
    "expectReq": ["page", "pageSize", "status"],
    "expectRes": ["list", "total", "list[].id", "list[].title"],
    "trigger": "订单列表页 — 进入页面自动加载",
    "callSite": "src/api/order.ts:12",
    "source": { "req": "doc|ts|usage", "res": "doc|ts|usage" }
  }
]
```

- `expectReq`：期望请求参数名列表（推断规则见 [inventory-rules.md](inventory-rules.md)）
- `expectRes`：期望响应字段路径列表，数组元素字段用 `list[].field` 表示
- `trigger`：触发入口（页面 + 用户操作），Phase 1 生成操作步骤的依据
- `source`：契约来源标记，报告中用于标注置信度（doc > ts > usage）

## manifest.json schema

Phase 2 注入完成后写入 `.claude/auto-api-debug/manifest.json`：

```json
{
  "id": "20260624-001",
  "project": "/Users/.../project",
  "module": "src/pages/order",
  "createdAt": "2026-06-24T10:30:00",
  "files": {
    "src/utils/claudeApiDebug.ts": "created",
    "src/api/order.ts": [
      {
        "before": "export const fetchList = (params: ListParams) => request.get('/order/list', { params });",
        "injected": "import { apiDbg } from 'src/utils/claudeApiDebug';\nexport const fetchList = (params: ListParams) => apiDbg('GET /order/list', params, () => request.get('/order/list', { params }));"
      }
    ]
  },
  "inventoryPath": ".claude/auto-api-debug/inventory.json",
  "serverPid": 12345,
  "resolved": false
}
```

- `files`：每个注入文件记录所有注入点的 `before`/`injected` 原文对，最终清理时据此精确还原
- `module`：本次联调的模块目录，便于会话中断恢复时识别范围
- `inventoryPath`：接口清单路径
- `serverPid`：日志服务器进程 PID，每次重启服务器后同步更新
- `resolved`：标记联调是否已被用户确认完成；用于会话中断恢复时判断状态，正常清理时 manifest 随目录一并删除
