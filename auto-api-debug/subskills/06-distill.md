# Phase 6 - 沉淀确认

## 进入条件

- Phase 5 最终清理已完成
- 本阶段必须执行，不可跳过：即使评估结果是不建议沉淀，也必须明确告知用户并说明理由

## 任务

1. **评估沉淀价值**，联调场景的典型高价值条目：
   - 接口字段约定坑（如「某接口分页参数是 pageNo 不是 page」）
   - 后端响应结构陷阱（如「列表字段在 data.list 而非 data.records」）
   - 特定接口的鉴权/参数前置条件
   - 评估维度：重复性 / 通用价值 / 复杂度（纯一次性的后端 bug 不修代码的不沉淀）
2. **主动给出建议并征求确认**（必须输出，不可省略）：

   ```
   💡 沉淀建议：建议沉淀 / 不建议沉淀
      理由：{简要说明}

      是否将本次联调发现沉淀到知识库？
   ```

3. **用户确认「是」后写入**：
   a. 确定项目名（`package.json` 的 `name`）
   b. 生成文件名：`YYYY-MM-DD-{kebab-slug}.md`（slug 从标题提取 3-5 个关键词）
   c. 创建项目目录（如不存在）：`mkdir -p ~/.claude/skills/auto-api-debug/knowledge/<project>/`
   d. 按条目模板写入知识文件（frontmatter 含 project/date/files/tags/symptoms，tags 建议包含接口 url 和关键字段名，正文含 症状/触发条件/根因/修复）
   e. 追加条目到 `~/.claude/skills/auto-api-debug/knowledge/_index.json`

## 输出要求

- 写入完成：「✅ 已沉淀到 knowledge/{project}/{filename}.md」
- 用户确认「否」或评估为不建议沉淀 → 跳过写入，说明理由

## 出口

- 联调会话结束
