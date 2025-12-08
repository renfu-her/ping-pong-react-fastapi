#!/bin/bash
# 正式機 Git 問題修復腳本
# 解決 __pycache__ 衝突和分支分歧問題

echo "=== 正式機 Git 修復腳本 ==="
echo ""

# 1. 清理所有 __pycache__ 目錄
echo "步驟 1: 清理本地 __pycache__ 目錄..."
find backend/app -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true

# 2. 從 git 索引中移除 __pycache__（如果被追蹤）
echo "步驟 2: 從 git 索引中移除 __pycache__..."
git rm -r --cached backend/app/__pycache__ 2>/dev/null || true
git rm -r --cached backend/app/*/__pycache__ 2>/dev/null || true
git rm -r --cached backend/app/*/*/__pycache__ 2>/dev/null || true

# 3. 確保 .env 不被追蹤
echo "步驟 3: 確保 .env 不被追蹤..."
git restore --staged backend/.env 2>/dev/null || true
git restore backend/.env 2>/dev/null || true

# 4. 檢查分支狀態
echo "步驟 4: 檢查分支狀態..."
git fetch origin

# 5. 處理分支分歧
echo "步驟 5: 處理分支分歧..."
LOCAL_COMMITS=$(git rev-list --count HEAD ^origin/main 2>/dev/null || echo "0")
REMOTE_COMMITS=$(git rev-list --count origin/main ^HEAD 2>/dev/null || echo "0")

echo "本地有 $LOCAL_COMMITS 個未推送的提交"
echo "遠端有 $REMOTE_COMMITS 個未拉取的提交"

if [ "$LOCAL_COMMITS" -gt 0 ] && [ "$REMOTE_COMMITS" -gt 0 ]; then
    echo ""
    echo "⚠️  分支已分歧！"
    echo "選項："
    echo "  A) 放棄本地變更，使用遠端版本（推薦用於正式機）"
    echo "  B) 合併遠端變更"
    echo ""
    read -p "請選擇 (A/B，默認 A): " choice
    choice=${choice:-A}
    
    if [ "$choice" = "A" ] || [ "$choice" = "a" ]; then
        echo "執行: git reset --hard origin/main"
        git reset --hard origin/main
        echo "✅ 已重置到遠端版本"
    else
        echo "執行: git pull --no-rebase"
        git pull --no-rebase
        echo "✅ 已合併遠端變更"
    fi
else
    echo "執行: git pull"
    git pull
    echo "✅ 已拉取最新變更"
fi

echo ""
echo "=== 修復完成 ==="
echo "提示: __pycache__ 文件會在 Python 運行時自動重新生成"

