# Phase 02 — 材料收集

## 进入条件

- 已 `Read .ai-wiki/.dtc-state.json`。
- `currentPhase` 为 `collect-materials`。

---

## 材料收集

根据需求类型走不同路径：

### 路径 A: 重构模式

必须收集以下材料（使用 AskUserQuestion 逐一询问）：

1. **需求文档** — 飞书链接 / 本地文件 / 口述 / 暂无
2. **被重构模块源码路径** — 必填，必须提供精确的目录路径
3. **UI 材料（设计稿 HTML / 截图）** — 有 HTML+截图 / 仅 HTML / 仅截图 / 无

**铁律：重构模式下，功能点唯一权威来源是被重构的源码。UI 材料仅做参考校验。**

### 路径 B: 增量模式

必须收集以下材料（使用 AskUserQuestion 逐一询问）：

1. **需求文档** — 飞书链接 / 本地文件 / 口述 / 暂无
2. **增量模块所在目录路径** — 用户提供路径；若用户不确定，根据需求文档扫描代码库定位
3. **UI 材料（设计稿 HTML / 截图）** — 有 HTML+截图 / 仅 HTML / 仅截图 / 无

**增量模式下，必须先扫描目标目录及其相邻模块，理解已有逻辑和数据流，再做功能扩展。**

---

## 材料写入状态

所有收集到的材料写入 `.ai-wiki/.dtc-state.json` 的 `inputs`：

| 状态字段               | 来源                           |
| ---------------------- | ------------------------------ |
| `inputs.platform`      | 来自 Phase 01 的技术选型       |
| `inputs.requirementDocPath` | 需求文档路径               |
| `inputs.description`   | 需求描述文本                   |
| `inputs.originalCodePath` | 重构：被重构模块路径 / 增量：增量模块路径 |
| `inputs.htmlPath`      | HTML 文件路径                  |
| `inputs.screenshotPath` | 截图路径                       |

---

## 文档输出

使用 `templates/common/features.md.tpl` 格式生成 `features.md`（框架），内容由下一阶段填充。

---

## 用户确认门禁

材料收集完成后，输出材料清单摘要，使用 `AskUserQuestion` 询问：

```
问题：材料收集完成。是否确认进入功能点规格生成？
选项：
- 确认，进入功能点规格生成
- 需要调整（我会输入修改意见）
```

用户确认后，将 `currentPhase` 推进到 `feature-spec`，fallthrough 到 `subskills/common/03-feature-spec.md`。

---

## 禁止

- 重构模式不能跳过源码路径收集
- 增量模式不能以「无路径」为由跳过现有代码扫描
- 不能在材料未收集完整时推进到下一阶段
