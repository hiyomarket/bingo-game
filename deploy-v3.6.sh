#!/bin/bash

# V3.6 快速部署腳本
# 使用方法：在生產伺服器上執行 bash deploy-v3.6.sh

set -e  # 遇到錯誤立即退出

echo "=========================================="
echo "  Bingo Game V3.6 部署腳本"
echo "=========================================="
echo ""

# 顏色定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 檢查是否在正確的目錄
if [ ! -f "package.json" ]; then
    echo -e "${RED}錯誤：請在專案根目錄執行此腳本${NC}"
    exit 1
fi

# 步驟 1：拉取最新代碼
echo -e "${YELLOW}[1/6] 拉取最新代碼...${NC}"
git pull origin main
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 代碼更新成功${NC}"
else
    echo -e "${RED}✗ 代碼更新失敗${NC}"
    exit 1
fi
echo ""

# 步驟 2：檢查 Node.js 版本
echo -e "${YELLOW}[2/6] 檢查 Node.js 版本...${NC}"
NODE_VERSION=$(node -v)
echo "當前 Node.js 版本：$NODE_VERSION"
echo -e "${GREEN}✓ Node.js 版本檢查完成${NC}"
echo ""

# 步驟 3：安裝依賴
echo -e "${YELLOW}[3/6] 安裝依賴...${NC}"
pnpm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 依賴安裝成功${NC}"
else
    echo -e "${RED}✗ 依賴安裝失敗${NC}"
    exit 1
fi
echo ""

# 步驟 4：編譯專案
echo -e "${YELLOW}[4/6] 編譯專案...${NC}"
pnpm build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 編譯成功${NC}"
else
    echo -e "${RED}✗ 編譯失敗${NC}"
    exit 1
fi
echo ""

# 步驟 5：重啟 PM2 服務
echo -e "${YELLOW}[5/6] 重啟 PM2 服務...${NC}"
pm2 restart bingo-game
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 服務重啟成功${NC}"
else
    echo -e "${RED}✗ 服務重啟失敗${NC}"
    exit 1
fi
echo ""

# 步驟 6：檢查服務狀態
echo -e "${YELLOW}[6/6] 檢查服務狀態...${NC}"
sleep 3  # 等待服務啟動
pm2 status bingo-game
echo ""

# 顯示最近的日誌
echo -e "${YELLOW}最近的服務日誌：${NC}"
pm2 logs bingo-game --lines 10 --nostream
echo ""

# 完成
echo "=========================================="
echo -e "${GREEN}  ✓ V3.6 部署完成！${NC}"
echo "=========================================="
echo ""
echo "測試 URL："
echo "  玩家頁面：https://market.hiyoshop.store/bingo/"
echo "  管理者頁面：https://market.hiyoshop.store/bingo/admin"
echo ""
echo "監控指令："
echo "  即時日誌：pm2 logs bingo-game"
echo "  服務狀態：pm2 status"
echo "  記憶體監控：pm2 monit"
echo ""
echo "如遇問題，請查看："
echo "  - DEPLOYMENT-GUIDE-V3.6.md（部署指南）"
echo "  - V3.6-RELEASE-NOTES.md（版本說明）"
echo ""
