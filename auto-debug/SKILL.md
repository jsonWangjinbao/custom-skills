---
name: auto-debug
description: 自动调试 — 当用户说「调试一下」「为什么不行」「帮我看看这个bug」「定位一下」等表述时，自动在代码中注入日志、收集日志、分析定位问题、修复后清理。支持 React Native 和 Web 项目。
---

# Auto-Debug

自动化调试工作流：知识匹配 → 注入日志 → 收集分析 → 修复 → 用户验证 → 最终清理 → 沉淀。

## 工作流（总览）

```
用户说「帮我调试 xxx」
  → Phase 0: 知识匹配（优先搜索已有修复）
      ├── 高匹配 → 直接复用修复方案
      └── 无匹配 → 进入 Phase 1
  → Phase 1~3: 首次调试
  → Phase 4: 应用修复，用户验证
      ├── 修复未完成 → 回到 Phase 3（重新收集分析，服务器保持运行）
      └── 用户确认修复完成 → Phase 4b: 最终清理
  → Phase 5: 沉淀确认
```

**核心原则**：
- 日志服务器在整个调试会话期间保持运行，只有用户最终确认「修好了」才 kill 并清理
- **整个调试会话期间，只允许使用 `dbg()` 打日志**，禁止使用 `console.warn`、`console.log`、`XlbToast.show` 等任何其他方式输出调试信息
- Phase 4b 清理后，**必须**执行 Phase 5 沉淀评估并主动提醒用户

---

### Phase 0: 知识匹配

**在进入调试流程之前**，先搜索知识库判断此问题是否已有修复记录。

1. **提取项目名**：读取当前项目 `package.json` 的 `name` 字段
2. **提取搜索关键词**：从用户的问题描述 + 涉及的代码文件路径中提取
3. **读取索引**：`~/.claude/skills/auto-debug/knowledge/_index.json`
4. **匹配评分**：
   - 先按 `project` 字段过滤当前项目，同项目优先
   - 同项目无匹配时扩展到全部项目
   - 评分权重：文件路径重合 +50/个 | 标签重合 +30/个 | 症状关键词 +20/个
   - >= 80 分：高匹配 → 直接建议复用
   - 40-79 分：低匹配 → 作为参考列出
   - < 40 分：忽略
5. **输出结果**：

**高匹配时：**
```
📚 知识库匹配：找到高度相关的修复记录

  {project}/{filename}.md
  ├── 标题：{title}
  ├── 症状：{symptoms}
  ├── 根因：{root_cause}
  ├── 涉及文件：{files}
  └── 匹配度：高

  该修复方案可直接复用。是否应用？
```

**低匹配时：**
```
📚 知识库匹配：未找到高度匹配的记录（最高 {score} 分）
   → 进入正常调试流程
```

5. **用户确认高匹配** → 直接应用已有修复方案 → 跳过 Phase 1-4 → 进入 Phase 4 修复部分
6. **无匹配或低匹配** → 进入 Phase 1

---

## 触发条件

**直接进入调试流程**（无需确认）：
- 用户表述包含「调试」「bug」「为什么不行」「怎么回事」「定位」「帮我看看」「调一下」等关键字
- 且描述的是一个需要运行时才能确认的问题（非纯代码阅读能解决的）

**不触发，正常对话**：
- 纯咨询问题（「这个 API 怎么用？」）
- 代码审查请求（「这段代码有问题吗？」— 先读代码分析，不确定再提议注入）

---

## 工作流

### Phase 1: 分析 & 计划

1. 读取用户指定的相关源文件，理解代码逻辑
2. 确定项目类型：检查 `package.json` — 有 `react-native` 依赖 → RN 项目，否则 → Web 项目
3. 确定需要观察的注入点（函数入参、API 响应、状态变化、条件分支、错误路径）
4. **告知用户计划**：「我将在以下 N 个位置插入调试日志，用于追踪 xxx 问题：」
   - `file.ts:行号` — 观察 xxx
   - `file.ts:行号` — 观察 xxx
   等待用户确认

### Phase 2: 注入

用户确认后执行：

1. **检查是否有进行中的调试会话**：
   - 查看 `.claude/auto-debug/manifest.json`
   - **如果有进行中的会话**：提示用户「当前有进行中的调试会话 (ID)，是否继续使用？」
     - 用户选择继续 → 沿用已有 `DEBUG_ID`，只清空日志文件并重启服务器
     - 用户选择新建 → 递增 NNN 创建新会话
   - **如果无进行中会话**：正常创建新会话
2. **生成调试 ID**：格式 `YYYYMMDD-NNN`（如 `20260624-001`），递增 NNN
3. **确定 ENDPOINT**：
   - Web 项目：`http://localhost:{PORT}`
   - RN 项目：检测宿主机 IP
     ```bash
     ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1
     ```
     - Android 模拟器默认：`http://10.0.2.2:{PORT}`
     - iOS 模拟器 / 真机：`http://{宿主机IP}:{PORT}`
   - 无法判断模拟器还是真机时，向用户确认
4. **选择端口**：从 19999 开始，`lsof -i :{PORT}` 检查是否被占用，冲突则递减
5. **创建 `.claude/auto-debug/` 目录**（如不存在）
6. **确保 server.mjs 存在**：
   ```bash
   cp ~/.claude/skills/auto-debug/scripts/server.mjs .claude/auto-debug/server.mjs
   ```
7. **创建/更新 `src/utils/claudeDebug.ts`**：
   读取 `~/.claude/skills/auto-debug/templates/claudeDebug.ts`，替换 `{{DEBUG_ID}}` 和 `{{ENDPOINT}}` 占位符后写入 `src/utils/claudeDebug.ts`
8. **清空旧日志并（重新）启动日志服务器**：
   ```bash
   rm -f .claude/auto-debug/{DEBUG_ID}.log
   node .claude/auto-debug/server.mjs {DEBUG_ID} {PORT} &
   ```
   记录后台进程 PID（如已有旧 PID，先 `kill` 再启动）
9. **连通性自检** — 确保 RN 设备能连上服务器：
   a. 检测当前宿主机 IP：
      ```bash
      ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1
      ```
   b. 对比 `claudeDebug.ts` 中硬编码的 ENDPOINT IP 与当前 IP 是否一致
   c. **如果不一致**：更新 `claudeDebug.ts` 中的 ENDPOINT 为当前 IP，重启服务器
   d. **如果日志服务器启动失败**（进程不存在）：
      - 检查端口是否被占用 → 换端口
      - 检查 node 是否可用
      - 逐一排查直到成功启动，并告知用户修复了什么
   e. 验证服务器响应：`curl -s http://localhost:{PORT}/health`
11. **在目标位置注入 `dbg()` 调用**：
   - 每个注入点添加 `import { dbg } from 'src/utils/claudeDebug';`（如果该文件尚未导入）
   - 在关键代码行前/后插入 `dbg('描述标签', 变量)`
   - **label 命名规范**：`功能描述:阶段`，如 `handleSubmit:params`、`apiCall:response`、`render:state`、`effect:trigger`
12. **写入 manifest.json**：
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
    `resolved` 字段标记修复是否已被用户确认完成。
13. **告知用户**：「✅ 调试日志已就绪。请操作 app 触发相关功能，完成后告诉我『日志产生了』或『操作完了』」

### Phase 3: 收集 & 分析

用户告知操作完成后：

1. **读取日志文件**：`.claude/auto-debug/{DEBUG_ID}.log`
   - ⚠️ **不要 kill 服务器** — 修复后可能需要重新收集日志验证
2. **日志为空时的自诊断**（如果 `.log` 文件不存在或无内容）：
   a. 检查服务器是否存活：`curl -s http://localhost:{PORT}/health`
   b. 检查 `claudeDebug.ts` 中的 ENDPOINT IP 是否与当前宿主机 IP 一致：
      ```bash
      ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1
      ```
   c. **如果 IP 变了**：更新 `claudeDebug.ts`，重启服务器，告知用户「IP 已变更为 X，已自动修复，请重新操作」
   d. **如果服务器挂了**：重新启动，告知用户
   e. **如果一切正常但日志仍为空**：检查 `dbg()` 所在文件是否被热更新加载（确认 import 正确），在 `useEffect` 中加一条 `dbg('mount')` 验证传输通道
   f. **直到日志产生**，才能进入分析步骤
3. **分析日志**：按时间线展开，关联 label + file:line 还原执行路径
4. **输出分析报告**：

```
📋 调试分析：<问题简述>

Timeline:
HH:MM:SS.mmm | <label> → <数据摘要>

🔴 根因：<简明描述>
🔧 修复方案：<具体修复，包含代码 diff>
```

5. **征求用户确认**修复方案，用户同意后进入 Phase 4

### Phase 4: 应用修复 & 用户验证

1. **执行修复**：应用确认的代码修改
2. **保留注入日志**（dbg 调用不删除）— 用于用户重新验证
3. **重启日志服务器**：
   - kill 旧进程，清空旧日志
   - 重新启动 server.mjs
   - 更新 manifest.json 中 serverPid
4. **告知用户**：「✅ 修复已应用，请重新操作验证，完成后告诉我『操作完了』或『修好了』」
5. **用户反馈后**：
   - 用户说「操作完了」/「还是不行」→ 回到 Phase 3（重新收集分析，修复未完成）
   - 用户说「修好了」/「可以了」/「没问题」→ 进入 Phase 4b

**此阶段可能循环多次**：Phase 3 → Phase 4 → Phase 3 → Phase 4 → ... 直到用户确认修复完成。

### Phase 4b: 最终清理

**仅在用户确认修复完成后执行**（用户说「修好了」「没问题了」「清理吧」等）：

1. **杀掉日志服务器**：`kill <PID>`
2. **清理注入代码**：
   - 根据 `manifest.json` 的 `before` 字段精确还原每个注入点（用 Edit 工具反向替换）
   - 删除 `src/utils/claudeDebug.ts`
   - 删除整个 `.claude/auto-debug/` 目录
3. **验证清理**：`grep -r "dbg"` 确认无调试代码残留；确认临时文件已删除
4. **更新 manifest**：设置 `manifest.json` 的 `resolved: true`（如果保留用于 Phase 5 沉淀参考，否则直接删除）
5. **告知用户**：「✅ 调试代码已清理，仅保留业务修复改动」

### Phase 5: 沉淀确认

**Phase 4b 清理完成后，必须执行此阶段，不可跳过。即使评估结果是不建议沉淀，也必须明确告知用户并说明理由。**

1. **评估沉淀价值**，基于以下维度：
   - **重复性**：`_index.json` 中是否已有同项目 + 同文件 + 同标签的条目
   - **通用价值**：是否为通用模式、组件使用陷阱、API 约定（排除纯业务配置错误、一行笔误）
   - **复杂度**：是否涉及组件内部机制或跨文件协作

2. **主动给出建议并征求确认**（必须输出，不可省略）：
```
💡 沉淀建议：建议沉淀 / 不建议沉淀
   理由：{简要说明}

   是否将此修复沉淀到知识库？
```

3. **用户确认「是」后，写入知识条目**：
   a. 确定项目名（`package.json` 的 `name`）
   b. 生成文件名：`YYYY-MM-DD-{kebab-slug}.md`（slug 从标题提取 3-5 个关键词）
   c. 创建项目目录（如不存在）：`mkdir -p ~/.claude/skills/auto-debug/knowledge/<project>/`
   d. 写入知识文件到 `~/.claude/skills/auto-debug/knowledge/<project>/<filename>.md`
   e. 追加条目到 `~/.claude/skills/auto-debug/knowledge/_index.json`

4. **知识条目格式**：
```markdown
---
project: {package.json name}
date: YYYY-MM-DD
files:
  - {相对文件路径}
tags:
  - {组件名}
  - {API名}
  - {关键词}
symptoms: {一句话症状描述}
---

# {标题}

## 症状

{用户遇到的问题描述}

## 触发条件

- 页面：{页面名称}
- 组件：{组件名称}
- 操作：{触发操作}

## 根因

{简明描述根因}

## 修复

```diff
{代码 diff，包含 import 变更}
```
```

5. **更新 _index.json**：读取现有数组，追加新条目：
```json
{
  "file": "{filename}.md",
  "project": "{project}",
  "date": "YYYY-MM-DD",
  "tags": ["tag1", "tag2"],
  "files": ["path/to/file.tsx"],
  "symptoms": "{一句话症状}",
  "title": "{标题}"
}
```

6. **确认完成**：「✅ 已沉淀到 knowledge/{project}/{filename}.md」

7. **用户确认「否」或建议不沉淀** → 跳过写入

---

## 日志格式

每行一条 JSON（JSONL）：
```json
{"id":"20260624-001","ts":1719220000000,"label":"handleSubmit:params","data":"{\"name\":\"张三\"}","file":"src/pages/xxx/Index.tsx:42"}
```

## 注入示例

**原始代码：**
```typescript
const handleSubmit = async (values) => {
  const res = await api.submit(values);
  if (res.code === 0) {
    message.success('提交成功');
  }
};
```

**注入后：**
```typescript
import { dbg } from 'src/utils/claudeDebug';

const handleSubmit = async (values) => {
  dbg('handleSubmit:params', values);
  const res = await api.submit(values);
  dbg('handleSubmit:response', res);
  if (res.code === 0) {
    message.success('提交成功');
  }
};
```

## 关键规范

- 函数名 `dbg`（极短，减少侵入感）
- label 格式：`功能描述:阶段`
- 临时文件目录：`.claude/auto-debug/`
- 注入工具文件：`src/utils/claudeDebug.ts`
- 知识库目录：`~/.claude/skills/auto-debug/knowledge/`
- 知识条目：`knowledge/<项目名>/YYYY-MM-DD-{slug}.md`
- 全局索引：`knowledge/_index.json`（每次写入后同步更新）
- **绝不劫持 console.log**，dbg 是独立函数通过 HTTP 传输
- `dbg()` 内的网络请求静默失败，绝不影响业务
- **整个调试会话只允许 `dbg()` 打日志**：禁止使用 `console.warn`、`console.log`、`XlbToast.show` 等任何其他方式输出调试信息
- **日志服务器在用户最终确认修复完成前不 kill**，贯穿整个调试会话
- **Phase 4b 清理后必须执行 Phase 5 沉淀评估**，即使不建议沉淀也要明确告知理由
- 每次修复完成后必须询问用户确认才可沉淀到知识库
- 沉淀前 Claude 必须给出建议（建议沉淀 / 不建议沉淀 + 理由）

## 边界场景

- **端口冲突**：自动递减（19999 → 19998 → ...），不阻塞
- **并发调试会话**：提示用户「当前有进行中的调试会话 (ID)，是否继续使用？」
- **日志为空**：检查 ENDPOINT 是否正确、模拟器/真机连通性、端口是否被防火墙拦截
- **超时**：超过 30 分钟用户未响应，不做任何操作，调试代码和日志保留供手动查看
- **修复未完成需重新验证**：回到 Phase 3，只 kill 旧服务器进程 + 清空日志 + 重启（不删除 dbg 注入）
- **用户中途要求放弃调试**：kill 服务器 + 根据 manifest.json 还原注入点 + 删除临时文件
