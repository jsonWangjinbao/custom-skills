# dbg 调试协议规范

Phase 2 注入、Phase 3 分析时加载。

## label 命名规范

格式：`功能描述:阶段`，例如：

- `handleSubmit:params` — 函数入参
- `apiCall:response` — API 响应
- `render:state` — 渲染时状态
- `effect:trigger` — useEffect 触发

## 注入方式

- 每个注入文件添加 `import { dbg } from 'src/utils/claudeDebug';`（该文件尚未导入时）
- 在关键代码行前/后插入 `dbg('描述标签', 变量)`
- 第二个参数可选；非字符串数据内部自动 JSON.stringify
- dbg 内部通过 Error.stack 自动提取调用位置（`src/` 相对路径 + 行号），无需手动传文件信息

## 注入示例

原始代码：

```typescript
const handleSubmit = async (values) => {
  const res = await api.submit(values);
  if (res.code === 0) {
    message.success("提交成功");
  }
};
```

注入后：

```typescript
import { dbg } from "src/utils/claudeDebug";

const handleSubmit = async (values) => {
  dbg("handleSubmit:params", values);
  const res = await api.submit(values);
  dbg("handleSubmit:response", res);
  if (res.code === 0) {
    message.success("提交成功");
  }
};
```

## 日志格式（JSONL）

服务器将每条日志追加写入 `.claude/auto-debug/{DEBUG_ID}.log`，每行一条 JSON：

```json
{
  "id": "20260624-001",
  "ts": 1719220000000,
  "label": "handleSubmit:params",
  "data": "{\"name\":\"张三\"}",
  "file": "src/pages/xxx/Index.tsx:42"
}
```

分析时按 `ts` 时间线展开，关联 label + file 还原执行路径。

## manifest.json schema

Phase 2 注入完成后写入 `.claude/auto-debug/manifest.json`：

```json
{
  "id": "20260624-001",
  "project": "/Users/.../project",
  "createdAt": "2026-06-24T10:30:00",
  "files": {
    "src/utils/claudeDebug.ts": "created",
    "src/pages/xxx/Index.tsx": [
      {
        "before": "  const handleSubmit = async (values) => {",
        "injected": "  dbg('handleSubmit:params', values);\n  const handleSubmit = async (values) => {"
      }
    ]
  },
  "serverPid": 12345,
  "resolved": false
}
```

- `files`：每个注入文件记录所有注入点的 `before`/`injected` 原文对，最终清理时据此精确还原
- `serverPid`：日志服务器进程 PID，每次重启服务器后同步更新
- `resolved`：标记修复是否已被用户确认完成；用于会话中断恢复时判断状态，正常清理时 manifest 随目录一并删除
