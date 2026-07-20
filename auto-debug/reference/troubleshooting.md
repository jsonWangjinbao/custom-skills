# 异常处理手册

注入、收集阶段遇到异常时按需加载对应条目。

## IP 变更（RN 项目）

检测当前宿主机 IP：

```bash
ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1
```

对比 `src/utils/claudeDebug.ts` 中硬编码的 ENDPOINT IP：

- 不一致 → 更新 claudeDebug.ts 的 ENDPOINT 为当前 IP，重启日志服务器，告知用户「IP 已变更为 X，已自动修复，请重新操作」
- Android 模拟器固定 `http://10.0.2.2:{PORT}`，不受宿主机 IP 影响

## 端口冲突

从 19999 开始，`lsof -i :{PORT}` 检查是否被占用，冲突则递减（19999 → 19998 → ...），不阻塞。

## 服务器启动失败

进程不存在时逐一排查：

1. 检查端口是否被占用 → 换端口（见「端口冲突」）
2. 检查 node 是否可用
3. 修复后验证：`curl -s http://localhost:{PORT}/health`
4. 告知用户修复了什么

## 日志为空分级诊断

`.log` 文件不存在或无内容时，按顺序排查：

1. 服务器是否存活：`curl -s http://localhost:{PORT}/health` → 挂了则重启并告知用户
2. ENDPOINT IP 是否与当前宿主机一致 → 见「IP 变更」
3. 端口是否被防火墙拦截（真机场景）
4. `dbg()` 所在文件是否被热更新加载（确认 import 正确）；在 `useEffect` 中加一条 `dbg('mount')` 验证传输通道
5. 直到日志产生，才能进入分析步骤

## 并发调试会话

`.claude/auto-debug/manifest.json` 已存在时，提示用户「当前有进行中的调试会话 (ID)，是否继续使用？」

- 继续 → 沿用已有 DEBUG_ID，只清空日志文件并重启服务器
- 新建 → 递增 NNN 创建新会话

## 超时

超过 30 分钟用户未响应：不做任何操作，调试代码和日志保留供手动查看。

## 用户中途放弃调试

kill 服务器 + 根据 manifest.json 还原注入点 + 删除 `.claude/auto-debug/` 临时文件。
