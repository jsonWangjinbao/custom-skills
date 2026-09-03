# Phase 2 - 注入

## 进入条件

- 用户已确认 Phase 1 的操作步骤清单和注入计划

## 任务

1. **检查进行中的会话**：查看 `.claude/auto-api-debug/manifest.json`，若已存在按 [../reference/troubleshooting.md](../reference/troubleshooting.md)「并发联调会话」处理
2. **生成联调 ID**：格式 `YYYYMMDD-NNN`（如 `20260624-001`），递增 NNN
3. **确定 ENDPOINT**：
   - Web 项目：`http://localhost:{PORT}`
   - RN 项目：Android 模拟器 `http://10.0.2.2:{PORT}`；iOS 模拟器 / 真机 `http://{宿主机IP}:{PORT}`（IP 检测命令见 troubleshooting「IP 变更」）
   - 无法判断模拟器还是真机时，向用户确认
4. **选择端口**：从 19999 开始检查，冲突处理见 troubleshooting「端口冲突」
5. **创建 `.claude/auto-api-debug/` 目录**（如不存在），并创建 `shots/` 子目录（存放操作截图）
6. **拷贝日志服务器**：

   ```bash
   cp ~/.claude/skills/auto-api-debug/scripts/server.mjs .claude/auto-api-debug/server.mjs
   ```

7. **创建/更新 `src/utils/claudeApiDebug.ts`**：读取 `~/.claude/skills/auto-api-debug/templates/claudeApiDebug.ts`，替换 `{{DEBUG_ID}}` 和 `{{ENDPOINT}}` 占位符后写入
8. **清空旧日志并（重新）启动服务器**：

   ```bash
   rm -f .claude/auto-api-debug/{DEBUG_ID}.log
   node .claude/auto-api-debug/server.mjs {DEBUG_ID} {PORT} &
   ```

   记录后台进程 PID（如已有旧 PID，先 kill 再启动）；启动失败按 troubleshooting「服务器启动失败」排查

9. **连通性自检**：
   a. RN 项目：对比 claudeApiDebug.ts 中的 ENDPOINT IP 与当前宿主机 IP，不一致按 troubleshooting「IP 变更」修复
   b. 验证服务器响应：`curl -s http://localhost:{PORT}/health`
10. **注入 `apiDbg` 调用**：按确认的注入计划逐点包装（import + apiDbg），规范与示例见 [../reference/api-dbg-spec.md](../reference/api-dbg-spec.md)；label 必须与 inventory.json 中的 label 完全一致
11. **写入 manifest.json**：schema 见 [../reference/api-dbg-spec.md](../reference/api-dbg-spec.md)；每个注入点必须记录 `before`/`injected` 原文，`serverPid` 记录服务器 PID，`module` 记录联调模块，`inventoryPath` 指向清单，`resolved` 置 false

## 输出要求

- **Web 项目**：「✅ 联调日志已就绪。确认 dev server 已启动、登录态已就绪后，告诉我『开始执行』，我将自动操作浏览器走完全部步骤」
- **RN 项目**：「✅ 联调日志已就绪。请按步骤清单操作 app，完成后告诉我『操作完了』」

## 出口

- Web：用户告知「开始执行」→ 进入 [03-execute.md](03-execute.md)
- RN：用户告知「操作完了」→ 进入 [04-report.md](04-report.md)
