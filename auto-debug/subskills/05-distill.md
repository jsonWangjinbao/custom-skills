# Phase 5 - 沉淀确认

## 进入条件

- Phase 4 最终清理已完成
- 本阶段必须执行，不可跳过：即使评估结果是不建议沉淀，也必须明确告知用户并说明理由

## 任务

1. **评估沉淀价值**：按 [../reference/knowledge-format.md](../reference/knowledge-format.md) 的评估维度（重复性 / 通用价值 / 复杂度）判断
2. **主动给出建议并征求确认**（必须输出，不可省略）：

   ```
   💡 沉淀建议：建议沉淀 / 不建议沉淀
      理由：{简要说明}

      是否将此修复沉淀到知识库？
   ```

3. **用户确认「是」后写入**：
   a. 确定项目名（`package.json` 的 `name`）
   b. 生成文件名：`YYYY-MM-DD-{kebab-slug}.md`（slug 从标题提取 3-5 个关键词）
   c. 创建项目目录（如不存在）：`mkdir -p ~/.claude/skills/auto-debug/knowledge/<project>/`
   d. 按 [../reference/knowledge-format.md](../reference/knowledge-format.md) 的条目模板写入知识文件
   e. 按同一文件的 schema 追加条目到 `~/.claude/skills/auto-debug/knowledge/_index.json`

## 输出要求

- 写入完成：「✅ 已沉淀到 knowledge/{project}/{filename}.md」
- 用户确认「否」或评估为不建议沉淀 → 跳过写入，说明理由

## 出口

- 调试会话结束
