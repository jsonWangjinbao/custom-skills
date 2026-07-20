# 知识库格式规范

Phase 0 匹配、Phase 5 写入时加载。

## 目录结构

- 知识库根目录：`~/.claude/skills/auto-debug/knowledge/`
- 条目文件：`knowledge/<项目名>/YYYY-MM-DD-{slug}.md`（slug 从标题提取 3-5 个 kebab-case 关键词）
- 全局索引：`knowledge/_index.json`（每次写入后同步更新）

## 知识条目模板

````markdown
---
project: { package.json name }
date: YYYY-MM-DD
files:
  - { 相对文件路径 }
tags:
  - { 组件名 }
  - { API名 }
  - { 关键词 }
symptoms: { 一句话症状描述 }
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
````

## \_index.json 条目 schema

读取现有数组，追加新条目：

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

## 沉淀价值评估维度

- **重复性**：`_index.json` 中是否已有同项目 + 同文件 + 同标签的条目
- **通用价值**：是否为通用模式、组件使用陷阱、API 约定（排除纯业务配置错误、一行笔误）
- **复杂度**：是否涉及组件内部机制或跨文件协作
