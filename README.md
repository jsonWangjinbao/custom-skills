# custom-skills

Claude Code 自定义技能集合。

## 技能列表

### auto-debug

自动调试技能，基于知识库辅助定位和修复 Bug。

### design-to-code

设计稿转代码技能，将 Figma 设计稿截图转换为 React Native / UmiJS 前端代码。

## 安装方法

```bash
# 1. 克隆仓库
git clone <repo-url> custom-skills

# 2. 创建 symlink 到 Claude Code skills 目录
ln -s "$(pwd)/custom-skills/auto-debug" ~/.claude/skills/auto-debug
ln -s "$(pwd)/custom-skills/design-to-code" ~/.claude/skills/design-to-code

# 3. 在 Claude Code 中使用
# /auto-debug
# /design-to-code
```

## 目录结构

```
custom-skills/
├── auto-debug/
│   ├── SKILL.md        # 技能定义
│   ├── knowledge/      # Bug 知识库
│   ├── scripts/        # 辅助脚本
│   └── templates/      # 调试模板
├── design-to-code/
│   ├── SKILL.md        # 技能定义
│   └── references/     # 参考规范
└── README.md
```

## 更新技能

直接在本仓库修改文件，Claude Code 通过 symlink 自动使用最新版本。

```bash
cd custom-skills
git add .
git commit -m "feat: update xxx"
git push
```
