# design-to-code-max 部门分享

> 把设计稿（HTML/截图）转成 RN/H5 生产代码的 skill。
> 不是让你学怎么用 AI —— 是让 AI 按一套标准流程干活，别每次都得从头教它。

---

## 为什么要有这个 skill

直接跟 Claude 说「帮我写个页面」也能出代码，但实际用起来有几个问题：

| 问题 | 表现 |
|------|------|
| **每次都要重新教** | Token 映射、组件库坑位、接口格式… 每次开新对话都得说一遍 |
| **做到一半断了** | 中断后恢复，AI 不记得已经做了什么、做到哪一步 |
| **还原靠运气** | 同一个设计稿，这次 padding 对了下次可能就错了，没有固定的检查机制 |
| **踩过的坑反复踩** | 一个人踩了 XlbForm cellTheme 的坑，另一个人做新页面又踩一遍 |
| **无法验收** | AI 说「写好了」，但没人系统地检查过样式偏差和功能遗漏 |

**这个 skill 就是把这些问题固化成一套流程：** 不管谁用、不管什么时候用，AI 都走同一个 5 阶段流水线，产出标准文档，做标准检查。

---

## 怎么用

### 第一步：把 skill 装到你电脑上

skill 仓库：`git@github.com:jsonWangjinbao/custom-skills.git`

每个开发者在自己电脑上拉取、软链一次就行：

```bash
# 1. 找个地方放 skill 仓库（比如 ~/workspace/）
git clone git@github.com:jsonWangjinbao/custom-skills.git ~/workspace/custom-skills

# 2. Claude Code
mkdir -p ~/.claude/skills
ln -sf ~/workspace/custom-skills/design-to-code-max ~/.claude/skills/design-to-code-max

# 3. Qoder（VS Code 系 IDE，如果用它的话）
mkdir -p ~/.qoder/skills
ln -sf ~/workspace/custom-skills/design-to-code-max ~/.qoder/skills/design-to-code-max

# 4. 确认两边都生效
ls -la ~/.claude/skills/design-to-code-max ~/.qoder/skills/design-to-code-max
# → 两条都显示 lrwxr-xr-x ... -> /Users/xxx/workspace/custom-skills/design-to-code-max
```

**后续拉取更新：**

```bash
cd ~/workspace/custom-skills && git pull
```

拉完两边自动生效，不用重新软链。

> 软链的原理：Claude Code 从 `~/.claude/skills/`、Qoder 从 `~/.qoder/skills/` 目录发现所有 skill。软链相当于在这两个目录里各放一个快捷方式，指向你本地的 skill 代码。这样更新只要 `git pull` 就行，两边都不用手动拷贝文件。

### 第二步：日常使用

**Claude Code（终端）：**

```bash
cd your-project
claude
```

在对话中输入 `/design-to-code-max` 加载 skill，然后描述需求。

**Qoder（VS Code 插件）：**

打开你的项目，调出 Qoder 对话面板，直接输入：

```
/design-to-code-max 做一下企业认证页面的重构
```

然后跟着 AI 的引导走就行。Qoder 会从 `~/.qoder/skills/` 加载 skill，用法和 Claude 完全一样。

### 你只需要做 3 件事

1. **回答问题** — AI 会一步步问你需求名称、类型、设计稿在哪
2. **看文档** — 每阶段 AI 产出文档，你看一眼，没问题就确认
3. **提修改意见** — 不满意就让 AI 改，改到你满意再继续

### 5 个阶段

```
入口 → 分析 → UI审计 → 技术设计 → 生成代码 → 自测 → 交付
                              ↓
                         你要确认 3 次
```

每个阶段 AI 都会产出文档并停下来等你确认，不会闷头一直干。

---

## 核心架构

### 文件布局

```
design-to-code-max/
├── SKILL.md                  ← 总纲（8 条铁律 + 流程）
├── subskills/                ← 5 个阶段的执行说明书
│   ├── 01-analyze.md
│   ├── 02-audit.md
│   ├── 03-design.md
│   ├── 04-build.md
│   └── 05-verify.md
├── reference/                ← 知识库（AI 写代码时的参考依据）
│   ├── token-map.json        ← 设计 Token → 代码 Token 的映射表
│   ├── icon-map.md           ← 图标名称映射
│   ├── rn-guidelines.md      ← RN 项目规范
│   ├── gotchas/              ← 踩坑记录（组件库、API 格式、HTML 解析等）
│   └── ...
├── templates/                ← 文档模板
└── docs/                     ← 设计文档、分享文档
```

### 运行时产出

```
你的项目/.ai-wiki/
├── .dtc-state.json                     ← 状态机（多个需求可以共存）
├── design-deviation-db.json            ← 偏差库（跨需求积累）
└── 【需求名】/
    ├── features.md                     ← 功能点清单
    ├── ui-audit.md                     ← UI 审计报告
    ├── tech-design.md                  ← 技术设计
    ├── execution.md                    ← 执行记录 + 偏差记录
    └── parsed-styles/                  ← HTML 解析结果（后续直接消费）
```

---

## 和直接用 AI 写代码比，优势在哪

### 1. 流程固定，产出稳定

直接跟 AI 说「写个页面」，AI 的自由度太高 —— 可能这次出 3 个文件，下次出 5 个，命名风格也可能不一样。

用 skill 后，每次都是：
- 先分析需求 → 出功能点清单
- 再审计 UI → 出样式规格
- 再技术设计 → 出组件架构
- 再分组生成 → 每组合完做偏差检查
- 最后全面自测 → 过门禁才交付

**不是 AI 自由发挥，是 AI 在流水线上干活。**

### 2. 中断了能续上，不用从头聊

直接跟 AI 写代码，聊到一半关了，下次打开：

> 「刚才我们聊到哪了？上下文发我一下」

用 skill：

> 「检测到未完成的需求【企业认证】，当前在 build 阶段（分组 3/8）。是否继续？」

它记得。因为每一步的进度都写进了 `.dtc-state.json`，不是靠对话记忆。

### 3. 踩过的坑自动沉淀

直接跟 AI 写代码，今天发现 `XlbForm` 的 `cell_padding_horizontal` 设了无效，只能在这个对话里修。下次新项目还得重新发现。

用 skill，发现一次就写进 `gotchas/` 或 `design-deviation-db.json`，下次 audit 阶段自动预标注：

> 「⚠️ 这个组件有已知偏差：`cell_group_title_padding_horizontal` 才是有效属性」

**团队的踩坑经验不会丢失。**

### 4. 设计规格 → 代码取值有据可查

直接跟 AI 写代码，AI 凭训练数据的记忆来猜 padding 值 —— 这次猜 12px，下次可能猜 8px。

用 skill，audit 阶段会把 HTML 解析成结构化 JSON，每个属性的值 + token 映射都记下来。build 阶段直接从解析结果读，不靠 AI 记忆。

### 5. 交付前有门禁检查

直接跟 AI 写代码，AI 说「写好了」，你肉眼 review。

用 skill，出口门禁会检查：
- 所有分组是否都完成了 ✅
- 样式是否有硬编码 ✅
- 表单是否有数组 name 风险 ✅
- 是否有 `.data?.data` 多解一层 ✅
- 偏差库是否已同步 ✅

**不是 AI 说好了就好了，门禁过了才算好。**

---

## 在团队里怎么用

- **skill 仓库统一管理**：所有 skill 代码在 `git@github.com:jsonWangjinbao/custom-skills.git`，每个人 `git pull` 就能拿到最新版。有更新时，只需通知大家拉取，不必逐个文件拷贝
- **偏差库可以共用**：`.ai-wiki/design-deviation-db.json` 记录了所有已知组件差异，一个人发现、所有人受益。建议定期同步到仓库或共享目录
- **gotchas 持续补充**：`reference/gotchas/` 下遇到新坑就加一篇 markdown，提交到仓库，后续所有需求都会自动引用
- **AI 生成 + 人工 CR**：AI 写代码，人做 Code Review，重点看校验逻辑和边界情况

---

## 入门建议

- 第一次用：完整跟一个需求的 5 个阶段，感受下流程
- 中断了别慌：`.dtc-state.json` 记录了进度，直接续接就行
- 遇到样式不还原：大概率是 audit 阶段三要素表没填全，或者偏差库还没收录这个问题
- 遇到 AI 写错 API 取值：加到 `gotchas/api-patterns/` 下，下次就不会再错
- Claude Code 和 Qoder 的用法完全一样（都支持 `/` 命令加载 skill），哪边顺手用哪边
