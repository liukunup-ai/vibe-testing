#!/bin/bash

# 项目重命名脚本
# 用法: ./rename-project.sh "新项目名称"
# 示例: ./rename-project.sh "my awesome project"

set -e

if [ -z "$1" ]; then
    echo "错误: 请提供新项目名称"
    echo "用法: $0 \"新项目名称\""
    echo "示例: $0 \"my awesome project\""
    exit 1
fi

NEW_NAME="$1"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# 生成各种命名格式
# kebab-case: my-awesome-project
NEW_KEBAB=$(echo "$NEW_NAME" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd 'a-z0-9-')
# snake_case: my_awesome_project
NEW_SNAKE=$(echo "$NEW_NAME" | tr '[:upper:]' '[:lower:]' | tr ' ' '_' | tr -cd 'a-z0-9_')
# camelCase: myAwesomeProject
NEW_CAMEL=$(echo "$NEW_NAME" | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) tolower(substr($i,2))}1' | tr -d ' ' | awk '{$1=tolower(substr($1,1,1))substr($1,2)}1')
# PascalCase: MyAwesomeProject
NEW_PASCAL=$(echo "$NEW_NAME" | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) tolower(substr($i,2))}1' | tr -d ' ')
# 环境变量前缀 (大写首字母): MA
NEW_ENV_PREFIX=$(echo "$NEW_NAME" | awk '{for(i=1;i<=NF;i++) printf toupper(substr($i,1,1))}' | cut -c1-4)
# 小写全称: my awesome project
NEW_LOWER=$(echo "$NEW_NAME" | tr '[:upper:]' '[:lower:]')
# 标题格式: My Awesome Project
NEW_TITLE=$(echo "$NEW_NAME" | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) tolower(substr($i,2))}1')

# 当前项目的各种格式
OLD_KEBAB="vibe-testing"
OLD_SNAKE="vibetesting"
OLD_CAMEL="vibeTesting"
OLD_PASCAL="VibeTesting"
OLD_ENV_PREFIX="VT"
OLD_LOWER="vibe testing"
OLD_TITLE="Vibe Testing"

echo "=========================================="
echo "项目重命名脚本"
echo "=========================================="
echo ""
echo "当前项目名称:"
echo "  kebab-case:  $OLD_KEBAB"
echo "  snake_case:  $OLD_SNAKE"
echo "  camelCase:   $OLD_CAMEL"
echo "  PascalCase:  $OLD_PASCAL"
echo "  ENV Prefix:  $OLD_ENV_PREFIX"
echo "  Title:       $OLD_TITLE"
echo ""
echo "新项目名称:"
echo "  kebab-case:  $NEW_KEBAB"
echo "  snake_case:  $NEW_SNAKE"
echo "  camelCase:   $NEW_CAMEL"
echo "  PascalCase:  $NEW_PASCAL"
echo "  ENV Prefix:  $NEW_ENV_PREFIX"
echo "  Title:       $NEW_TITLE"
echo ""
echo "项目根目录: $PROJECT_ROOT"
echo ""
read -p "确认执行重命名? (y/n): " CONFIRM

if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo "操作已取消"
    exit 0
fi

echo ""
echo "开始重命名..."
echo ""

cd "$PROJECT_ROOT"

# 排除的目录和文件
EXCLUDE_DIRS="-type d \( -name node_modules -o -name .git -o -name dist -o -name build -o -name .next -o -name coverage -o -name bin -o -name .cache \) -prune -o"
EXCLUDE_FILES="-type f \( -name \"*.log\" -o -name \"*.lock\" -o -name \"*.sum\" -o -name \"rename-project.*\" \) -prune -o"

# 函数: 替换文件内容
replace_in_files() {
    local old_pattern="$1"
    local new_pattern="$2"
    local desc="$3"
    
    echo "  [$desc] '$old_pattern' -> '$new_pattern'"
    
    find . $EXCLUDE_DIRS $EXCLUDE_FILES -type f -print0 2>/dev/null | \
        xargs -0 grep -l "$old_pattern" 2>/dev/null | \
        while read -r file; do
            if [ -f "$file" ] && [ -w "$file" ]; then
                # 检测操作系统
                if [[ "$OSTYPE" == "darwin"* ]]; then
                    sed -i '' "s/$old_pattern/$new_pattern/g" "$file"
                else
                    sed -i "s/$old_pattern/$new_pattern/g" "$file"
                fi
            fi
        done
}

# 替换内容 (按长度降序排列，避免短串覆盖长串)
echo "1. 替换文件内容..."
replace_in_files "$OLD_TITLE" "$NEW_TITLE" "Title"
replace_in_files "$OLD_PASCAL" "$NEW_PASCAL" "PascalCase"
replace_in_files "$OLD_CAMEL" "$NEW_CAMEL" "camelCase"
replace_in_files "$OLD_KEBAB" "$NEW_KEBAB" "kebab-case"
replace_in_files "$OLD_SNAKE" "$NEW_SNAKE" "snake_case"
replace_in_files "$OLD_ENV_PREFIX" "$NEW_ENV_PREFIX" "ENV Prefix"
replace_in_files "$OLD_LOWER" "$NEW_LOWER" "lowercase"

# 替换目录名
echo ""
echo "2. 替换目录名..."
find . -depth -type d -name "*$OLD_KEBAB*" 2>/dev/null | while read -r dir; do
    if [ -d "$dir" ]; then
        new_dir=$(echo "$dir" | sed "s/$OLD_KEBAB/$NEW_KEBAB/g")
        if [ "$dir" != "$new_dir" ]; then
            echo "  目录: $dir -> $new_dir"
            mv "$dir" "$new_dir" 2>/dev/null || true
        fi
    fi
done

# 替换文件名
echo ""
echo "3. 替换文件名..."
find . -depth -type f -name "*$OLD_KEBAB*" 2>/dev/null | while read -r file; do
    if [ -f "$file" ]; then
        new_file=$(echo "$file" | sed "s/$OLD_KEBAB/$NEW_KEBAB/g")
        if [ "$file" != "$new_file" ]; then
            echo "  文件: $file -> $new_file"
            mv "$file" "$new_file" 2>/dev/null || true
        fi
    fi
done

echo ""
echo "=========================================="
echo "重命名完成!"
echo "=========================================="
echo ""
echo "建议执行以下操作:"
echo "  1. 检查 git status 确认更改"
echo "  2. 运行 go build ./... 验证后端编译"
echo "  3. 运行 npm install 和 npm run build 验证前端"
echo "  4. 检查并更新任何遗漏的配置"
echo ""
