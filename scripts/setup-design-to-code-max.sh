#!/bin/bash
# design-to-code-max skill 安装/更新脚本
# 用法：bash scripts/setup-design-to-code-max.sh
#
# 这个脚本做三件事：
# 1. 拉取/更新 skill 仓库
# 2. 在 ~/.claude/skills/ 下创建软链接（Claude Code 用）
# 3. 在 ~/.qoder/skills/ 下创建软链接（Qoder 用）

set -e

SKILL_REPO="git@github.com:jsonWangjinbao/custom-skills.git"
SKILL_NAME="design-to-code-max"

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info()  { echo -e "${GREEN}✓${NC} $1"; }
warn()  { echo -e "${YELLOW}⚠${NC} $1"; }
error() { echo -e "${RED}✗${NC} $1"; }

echo "=========================================="
echo " design-to-code-max skill 安装/更新"
echo "=========================================="
echo ""

# 1. 确定仓库目录
if [ -z "$CUSTOM_SKILLS_DIR" ]; then
    DEFAULT_DIR="$HOME/workspace/custom-skills"
    if [ -d "$DEFAULT_DIR" ]; then
        CUSTOM_SKILLS_DIR="$DEFAULT_DIR"
    else
        CUSTOM_SKILLS_DIR="$PWD"
    fi
fi

echo "Skill 仓库目录：$CUSTOM_SKILLS_DIR"
echo ""

# 2. 克隆或拉取
if [ -d "$CUSTOM_SKILLS_DIR/.git" ]; then
    echo "→ 更新已有仓库..."
    cd "$CUSTOM_SKILLS_DIR"
    git pull
    info "仓库已更新"
else
    echo "→ 克隆仓库..."
    mkdir -p "$(dirname "$CUSTOM_SKILLS_DIR")"
    git clone "$SKILL_REPO" "$CUSTOM_SKILLS_DIR"
    info "仓库已克隆到 $CUSTOM_SKILLS_DIR"
fi

# 3. 检查 skill 目录是否存在
SKILL_DIR="$CUSTOM_SKILLS_DIR/$SKILL_NAME"
if [ ! -d "$SKILL_DIR" ]; then
    error "未找到 $SKILL_NAME 目录（期望路径：$SKILL_DIR）"
    echo "请检查仓库内容或设置 CUSTOM_SKILLS_DIR 环境变量"
    exit 1
fi
info "找到 skill 目录：$SKILL_DIR"

echo ""

# 4. 创建软链函数
link_skill() {
    local target_dir="$1"
    local tool_name="$2"
    local target_path="$target_dir/$SKILL_NAME"

    mkdir -p "$target_dir"
    ln -sfn "$SKILL_DIR" "$target_path"

    if [ -L "$target_path" ] && [ -d "$target_path" ]; then
        info "($tool_name) $target_path → $SKILL_DIR"
    else
        error "($tool_name) 软链创建失败"
        return 1
    fi
}

link_skill "$HOME/.claude/skills" "Claude Code"
link_skill "$HOME/.qoder/skills"  "Qoder"

echo ""
echo "=========================================="
echo " 安装/更新完成！"
echo ""
echo " 使用方式："
echo "   Claude Code: claude → /design-to-code-max"
echo "   Qoder:       在对话面板输入 /design-to-code-max"
echo ""
echo " 下次更新时再次运行本脚本即可"
echo "=========================================="
