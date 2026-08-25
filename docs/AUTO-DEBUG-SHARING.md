# auto-debug 部门分享

> 让 AI 帮你调 bug 的 skill：自动注入日志 → 收集运行时数据 → 定位根因 → 修复验证 → 清理 → 沉淀。支持 RN 和 Web 项目。
> 不是让 AI 猜 bug 在哪 —— 是让 AI 拿到运行时数据再下结论，调完还不留一行垃圾代码。

---

## 为什么要有这个 skill

直接跟 AI 说「帮我看看这个 bug」也能修，但实际用起来有几个问题：

| 问题                 | 表现                                                                     |
| -------------------- | ------------------------------------------------------------------------ |
| **靠猜不靠数据**     | AI 静态读代码猜根因，猜错改一版，还错再改一版，来回拉扯                  |
| **日志靠自己加**     | 手动加 `console.log`，在 Metro / 浏览器控制台的海量日志里翻，再复制给 AI |
| **调完留一屁股垃圾** | `console.log`、临时变量忘了删，混进 commit 被 CR 打回                    |
| **修没修好没人验**   | AI 说「修好了」，你一操作还是错的，又回到起点                            |
| **踩过的坑反复踩**   | 上个月同事调过的 XlbUpload 坑，这周你换了个页面又从头调一遍              |

**这个 skill 就是把调试固化成一条流水线：** 知识匹配 → 注入 → 收集 → 分析 → 修复 → 验证 → 清理 → 沉淀，每一步都有标准动作和检查，不管谁用都走同一条路。

---

## 怎么用

### 第一步：把 skill 装到你电脑上

skill 仓库：`git@github.com:jsonWangjinbao/custom-skills.git`（和 design-to-code-max 同一个仓库）

每个开发者在自己电脑上拉取、软链一次就行：

```bash
# 1. 找个地方放 skill 仓库（比如 ~/workspace/）
git clone git@github.com:jsonWangjinbao/custom-skills.git ~/workspace/custom-skills

# 2. Claude Code
mkdir -p ~/.claude/skills
ln -sf ~/workspace/custom-skills/auto-debug ~/.claude/skills/auto-debug

# 3. Qoder（VS Code 系 IDE，如果用它的话）
mkdir -p ~/.qoder/skills
ln -sf ~/workspace/custom-skills/auto-debug ~/.qoder/skills/auto-debug

# 4. 确认两边都生效
ls -la ~/.claude/skills/auto-debug ~/.qoder/skills/auto-debug
```

**后续拉取更新：**

```bash
cd ~/workspace/custom-skills && git pull
```

拉完两边自动生效，不用重新软链。**Bug 知识库也在仓库里，git pull 同时就把团队新沉淀的调试经验拉到本地了。**

> 注意：知识库的读写路径硬编码为 `~/.claude/skills/auto-debug/knowledge/`，所以 `~/.claude/skills/` 这条软链是必须的，即使平时只用 Qoder。

### 第二步：日常使用

不用记命令，直接说人话：

```
帮我调试一下员工健康证页面点更新没反应的问题
```

「调试」「bug」「为什么不行」「定位」「帮我看看」这类表述都会触发 skill，AI 会自动进入调试流水线。

### 你只需要做 4 件事

1. **描述问题 + 确认注入计划** — AI 读完代码后告诉你「准备在这 N 个位置插日志」，你确认
2. **操作 app 触发一遍问题** — 操作完说一声「操作完了」
3. **修复后重新操作验证** — 好了说「修好了」，没好说「还是不行」（AI 会继续分析，注入不动）
4. **确认是否沉淀** — 调完 AI 会评估这次修复值不值得进知识库，你说了算

### 流程总览

```
「帮我调试 xxx」
  → Phase 0 知识匹配 ── 命中历史坑(≥80分) → 直接复用修复方案，跳到验证
  → Phase 1 分析代码，出注入计划 ──✅你确认
  → Phase 2 注入 dbg + 启动本地日志服务器
  → Phase 3 你操作 app，AI 读日志出根因 + 修复方案 ──✅你确认
  → Phase 4 修复 → 你重新操作验证（还不行 → 回 Phase 3 循环，注入保留）
  → 你说「修好了」→ 按注入清单精确清理，grep 验证零残留
  → Phase 5 沉淀评估 ──✅你确认后写入知识库
```

每个关键决策点 AI 都会停下来等你确认，不会闷头改代码。

---

## 核心架构

### 文件布局

```
auto-debug/
├── SKILL.md                    ← 总纲（5 条铁律 + 触发条件 + 阶段路由）
├── subskills/                  ← 分阶段执行说明书
│   ├── 00-knowledge-match.md      ← 知识匹配（调试入口，必做）
│   ├── 01-analyze.md              ← 分析代码 + 出注入计划
│   ├── 02-inject.md               ← 注入 dbg + 启动日志服务器
│   ├── 03-collect.md              ← 收集日志 + 时间线分析
│   ├── 04-fix-verify.md           ← 修复验证循环 + 最终清理
│   └── 05-distill.md              ← 沉淀评估 + 写入知识库
├── reference/                  ← 规范文档（按需加载）
│   ├── dbg-spec.md                ← dbg 协议、日志格式、manifest 格式
│   ├── troubleshooting.md         ← 异常手册：IP 变更、端口冲突、日志为空、并发会话
│   └── knowledge-format.md        ← 知识条目模板、匹配评分规则
├── knowledge/                  ← Bug 知识库（按项目分目录，随仓库共享）
│   ├── _index.json                ← 全局索引（标签/文件/症状，供匹配评分）
│   └── <项目名>/YYYY-MM-DD-xxx.md ← 一条条历史修复记录
├── scripts/server.mjs          ← 本地日志服务器（Node 单文件，零三方依赖）
└── templates/claudeDebug.ts    ← dbg 函数模板（注入时拷入项目）
```

### 运行机制

```
代码里注入 dbg('handleSubmit:params', values)
  → app 运行时 fetch 上报到本地日志服务器（POST /log，失败静默，绝不影响业务）
  → 服务器追加写入 .claude/auto-debug/{调试ID}.log（JSONL，一行一条）
  → AI 按时间线展开，关联 label + file:line 还原真实执行路径
```

几个关键设计：

- **dbg 自动带调用位置**：通过 `Error.stack` 提取 `src/xxx.tsx:42`，不用手传文件信息
- **网络自适应**：Web 项目用 `localhost`；RN Android 模拟器用 `10.0.2.2`；iOS 模拟器/真机用宿主机 IP，注入前自动检测、换网络后自动修复
- **端口自动避让**：从 19999 开始，被占了就递减换端口，不阻塞

### 运行时产出

```
你的项目/.claude/auto-debug/      ← 调试期间存在，确认修好后整个删除
├── manifest.json                 ← 注入清单：每个注入点的「改前/改后」原文 + 服务器 PID
├── {调试ID}.log                  ← 运行时日志（JSONL 时间线）
├── {调试ID}.pid                  ← 服务器进程号文件
└── server.mjs                    ← 日志服务器副本

你的项目/src/utils/claudeDebug.ts ← dbg 函数本体（清理时删除）
```

---

## 和直接让 AI 调 bug 比，优势在哪

### 1. 用运行时数据说话，不靠猜

直接让 AI 调 bug，它只能静态读代码推理：「这里可能是 undefined」「那里可能没 await」。猜错了就再猜一次。

用 skill，AI 会在函数入参、API 响应、状态变化、条件分支这些关键位置注入 `dbg()`，然后拿到一份带时间戳的真实执行流水：

```
14:32:01.205 | handleSubmit:params → {"certType":"EMPLOYEE_HEALTH",...}
14:32:01.890 | handleSubmit:response → undefined
14:32:01.891 | render:state → {submitting: false}
```

哪一步数据断了、哪个分支没走到，一目了然。**根因是看到的，不是猜到的。**

### 2. 调试代码零残留

手动加 `console.log` 调试，调完总有漏删的，混进 commit 被 CR 打回。

用 skill，每个注入点的「改前原文」都记在 `manifest.json` 里。你说「修好了」之后，AI 按清单逐点精确还原，删 dbg 文件、删临时目录、kill 服务器，最后 `grep` 验证无残留才收工。**调试期间随便注，结束时一干二净，commit 里只有业务修复。**

### 3. 修复有验证闭环，不是 AI 说好了就好了

直接让 AI 调 bug，它改完代码就说「修好了」，没人验证。

用 skill，修复后**注入的 dbg 不删、服务器不 kill**，你重新操作一遍，AI 再收一轮日志确认数据流真的通了。还不行就带着新日志回分析阶段继续循环，直到你说「修好了」才进入清理。**修复的判定标准是你的确认 + 日志证据，不是 AI 的自信。**

### 4. 踩过的坑只踩一次

同事上个月调过「XlbUpload 缺 customUpload 导致 OCR 不回填」，没有沉淀的话，你这周换个页面还得从头调一遍。

用 skill，每次调试结束都会评估是否沉淀进 `knowledge/` 知识库。下次再有人遇到类似问题，Phase 0 知识匹配会先查一遍历史记录（文件路径重合 +50 分、标签重合 +30 分、症状关键词 +20 分，≥80 分直接建议复用修复方案）：

> 📚 知识库匹配：找到高度相关的修复记录 — XlbUpload OCR 上传缺少 customUpload 导致 onChange 无 URL。该修复方案可直接复用。是否应用？

确认后跳过注入环节直接修复。**目前已沉淀 12 条 remote-app-fsms 项目的实战记录，一个人踩坑，全团队免疫。**

### 5. 不侵入业务，绝对安全

- dbg 内部 `fetch` 上报失败**静默吞掉**，服务器挂了 app 照常跑
- **不劫持 console**，不影响你原本的日志体系
- dbg 文件头部明确标注「临时文件，调完自动删」，不会被人误当成业务代码

---

## 在团队里怎么用

- **skill 仓库统一管理**：所有代码在 `git@github.com:jsonWangjinbao/custom-skills.git`，`git pull` 拿最新版
- **知识库随仓库共享**：`knowledge/` 目录就在仓库里，沉淀即提交，pull 即同步。一个人调通的坑，全团队下次直接复用
- **知识匹配同项目优先**：先按当前项目过滤，同项目无匹配再扩展到全部项目——别的项目的组件库坑也有参考价值
- **AI 定位 + 人工确认**：注入计划、修复方案、沉淀写入三个环节都要人点头，AI 不自作主张

---

## 入门建议

- 第一次用：挑一个真实的小 bug 完整走一遍流程（注入 → 收集 → 修复 → 清理），感受下闭环
- 描述问题时带上**页面 + 操作路径**（如「门店信息 → 员工健康证 → 点更新没反应」），AI 定注入点会更准
- 日志为空别慌：skill 有分级诊断（服务器存活 → IP 匹配 → 防火墙 → 热更新），会自动逐项排查
- RN 真机调试换了网络（IP 变了）也不用管，注入前的连通性自检会发现并自动修复
- 调试中断了没关系：`manifest.json` 还在，下次进来 AI 会识别「有进行中的调试会话」，问你要不要继续
- Claude Code 和 Qoder 用法完全一样，哪边顺手用哪边
