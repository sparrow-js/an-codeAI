#!/bin/bash

# 批量更新 UnoCSS 到 Tailwind CSS 类名的脚本

echo "开始更新 UnoCSS 到 Tailwind CSS 类名..."

# 更新图标类名
find . -name "*.tsx" -o -name "*.jsx" | xargs sed -i '' 's/i-ph:/i-ph-/g'

# 更新小数点间距类名
find . -name "*.tsx" -o -name "*.jsx" | xargs sed -i '' 's/gap-1\.5/gap-1-5/g'
find . -name "*.tsx" -o -name "*.jsx" | xargs sed -i '' 's/py-0\.5/py-0-5/g'
find . -name "*.tsx" -o -name "*.jsx" | xargs sed -i '' 's/px-1\.5/px-1-5/g'
find . -name "*.tsx" -o -name "*.jsx" | xargs sed -i '' 's/py-1\.5/py-1-5/g'
find . -name "*.tsx" -o -name "*.jsx" | xargs sed -i '' 's/mr-1\.5/mr-1-5/g'
find . -name "*.tsx" -o -name "*.jsx" | xargs sed -i '' 's/-mr-1\.5/-mr-1-5/g'
find . -name "*.tsx" -o -name "*.jsx" | xargs sed -i '' 's/px-2\.5/px-2-5/g'
find . -name "*.tsx" -o -name "*.jsx" | xargs sed -i '' 's/py-2\.5/py-2-5/g'

# 更新自定义工具类
find . -name "*.tsx" -o -name "*.jsx" | xargs sed -i '' 's/bolt-ease-cubic-bezier/ease-bolt-cubic-bezier/g'

echo "类名更新完成！"

# 显示更新的文件列表
echo "更新的文件："
find . -name "*.tsx" -o -name "*.jsx" | xargs grep -l "i-ph-\|gap-1-5\|py-0-5\|px-1-5\|py-1-5\|mr-1-5\|ease-bolt-cubic-bezier" | head -10

echo "请检查更新的文件并测试功能是否正常。" 