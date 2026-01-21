#!/bin/bash
# Bingo Game 一鍵部署腳本

set -e

echo "=== Bingo Game 一鍵部署腳本 ==="
echo ""

# 顯示當前版本
echo "當前版本："
git log -1 --pretty=format:"%h - %s" || echo "無法獲取 Git 資訊"
echo ""
echo ""

# 暫存本地修改
echo "[1/6] 暫存本地修改..."
git stash || echo "無本地修改需要暫存"

# 拉取最新程式碼
echo "[2/6] 拉取最新程式碼..."
git pull origin main

# 顯示新版本
echo ""
echo "更新後版本："
git log -1 --pretty=format:"%h - %s"
echo ""
echo ""

# 執行路徑修復
echo "[3/6] 執行路徑修復..."
bash /tmp/fix_bingo_paths.sh

# 安裝依賴
echo ""
echo "[4/6] 安裝/更新依賴..."
pnpm install

# 建置專案
echo ""
echo "[5/6] 建置專案..."
pnpm build

# 重啟服務
echo ""
echo "[6/6] 重啟服務..."
pm2 restart bingo-game

echo ""
echo "=== 部署完成！==="
echo ""
echo "服務狀態："
pm2 list | grep bingo-game

echo ""
echo "最新日誌："
pm2 logs bingo-game --lines 10 --nostream

echo ""
echo "✅ 訪問 https://YOUR_DOMAIN/bingo 測試"
