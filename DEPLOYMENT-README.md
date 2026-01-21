# Bingo Game 部署文件索引

## 📚 文件結構

本專案提供完整的部署文件和自動化腳本，確保順暢的部署流程。

---

## 📁 部署文件清單

### 1. 核心部署指南
- **DEPLOYMENT-SYNC-GUIDE.md**：V3.7 部署同步指南
  - 問題根源深度分析
  - 完整解決方案架構
  - 自動化修復腳本
  - 詳細部署流程
  - 常見問題排查

### 2. 自動化腳本
- **deploy_bingo.sh**：一鍵部署腳本
  - 自動拉取最新程式碼
  - 自動執行路徑修復
  - 自動安裝依賴和建置
  - 自動重啟服務
  - 顯示部署狀態

- **fix_bingo_paths.sh**：路徑修復腳本
  - 修復 Vite 配置
  - 修復 Express 靜態服務
  - 修復 Wouter 路由
  - 修復 Socket.IO 路徑

### 3. 版本發布說明
- **V3.6-RELEASE-NOTES.md**：V3.6 版本說明（暱稱系統）
- **V3.7-RELEASE-NOTES.md**：V3.7 版本說明（沉浸式通知）

### 4. 測試指南
- **V3.7-TESTING-GUIDE.md**：V3.7 完整測試指南
  - 手動通知測試
  - 自動里程碑通知測試
  - 多玩家場景測試

---

## 🚀 快速部署（推薦）

### 方式 1：使用一鍵部署腳本（最簡單）

```bash
ssh root@45.77.170.104
cd /root/bingo-game
./deploy_bingo.sh
```

**腳本會自動完成：**
1. ✅ 拉取最新程式碼
2. ✅ 執行路徑修復
3. ✅ 安裝依賴
4. ✅ 建置專案
5. ✅ 重啟服務
6. ✅ 顯示狀態和日誌

---

### 方式 2：手動部署（完整控制）

```bash
ssh root@45.77.170.104
cd /root/bingo-game

# 1. 拉取最新程式碼
git pull origin main

# 2. 執行路徑修復
./fix_bingo_paths.sh

# 3. 安裝依賴
pnpm install

# 4. 建置專案
pnpm build

# 5. 重啟服務
pm2 restart bingo-game

# 6. 查看日誌
pm2 logs bingo-game --lines 20
```

---

## 🔧 路徑修復說明

### 為什麼需要路徑修復？

開發團隊設計的 `/bingo` 子路徑與 Nginx 反向代理產生衝突，需要在部署時修復以下配置：

1. **vite.config.ts**：`base: '/bingo'` → 生成正確的資源路徑
2. **server/index.ts**：根路徑靜態服務 → 接收 Nginx 改寫後的請求
3. **client/src/App.tsx**：移除 base → 路由使用根路徑
4. **client/src/contexts/SocketContext.tsx**：`path: '/bingo/socket.io'` → 完整路徑

### 自動化修復

使用 `fix_bingo_paths.sh` 腳本自動完成所有修復：

```bash
./fix_bingo_paths.sh
```

---

## 📊 部署驗證

### 1. 檢查服務狀態

```bash
pm2 status bingo-game
```

**預期輸出：**
```
┌─────┬──────────────┬─────────┬─────────┬─────────┬──────────┐
│ id  │ name         │ status  │ restart │ uptime  │ cpu      │
├─────┼──────────────┼─────────┼─────────┼─────────┼──────────┤
│ 0   │ bingo-game   │ online  │ 0       │ 10m     │ 0%       │
└─────┴──────────────┴─────────┴─────────┴─────────┴──────────┘
```

### 2. 檢查日誌

```bash
pm2 logs bingo-game --lines 20
```

**預期輸出：**
```
[Server] Running on http://localhost:3001/
[Socket.IO] Server initialized and ready
```

### 3. 瀏覽器測試

訪問以下 URL 確認功能正常：

- **玩家頁面**：https://market.hiyoshop.store/bingo/
- **管理者頁面**：https://market.hiyoshop.store/bingo/admin

**檢查項目：**
- ✅ 頁面正常載入（無 404 錯誤）
- ✅ WebSocket 連線正常（顯示「LIVE CONNECTION」）
- ✅ V3.6 暱稱系統正常（首次訪問彈出暱稱輸入框）
- ✅ V3.7 通知按鈕顯示正常（管理者頁面顯示「🔔 提醒聽牌」）

---

## 🐛 常見問題排查

### 問題 1：頁面顯示 404

**可能原因：**
- 路徑修復未執行
- Nginx 配置錯誤

**解決方案：**
```bash
./fix_bingo_paths.sh
pnpm build
pm2 restart bingo-game
```

### 問題 2：WebSocket 連線失敗

**可能原因：**
- Socket.IO 路徑配置錯誤
- Nginx WebSocket 代理未啟用

**解決方案：**
```bash
# 檢查 Socket.IO 路徑配置
grep "path:" client/src/contexts/SocketContext.tsx

# 應該顯示：path: '/bingo/socket.io'
```

### 問題 3：靜態資源 404

**可能原因：**
- Vite base 配置錯誤
- 建置未完成

**解決方案：**
```bash
# 檢查 Vite 配置
grep "base:" vite.config.ts

# 應該顯示：base: '/bingo'

# 重新建置
pnpm build
pm2 restart bingo-game
```

---

## 📈 性能監控

### 查看即時日誌

```bash
pm2 logs bingo-game
```

### 查看資源使用

```bash
pm2 monit
```

### 查看詳細資訊

```bash
pm2 info bingo-game
```

---

## 🔄 回滾流程

如果部署出現問題，可以快速回滾到上一個版本：

```bash
cd /root/bingo-game

# 查看 Git 歷史
git log --oneline -5

# 回滾到指定 Commit
git reset --hard <commit-hash>

# 重新部署
./deploy_bingo.sh
```

---

## 📞 技術支援

### 問題回報
- **GitHub Issues**：https://github.com/hiyomarket/bingo-game/issues

### 日誌收集

如果遇到問題，請提供以下資訊：

```bash
# 1. 服務狀態
pm2 status bingo-game

# 2. 最近日誌
pm2 logs bingo-game --lines 50 > bingo-logs.txt

# 3. 配置檢查
grep -A 5 "base:" vite.config.ts
grep -A 5 "path:" client/src/contexts/SocketContext.tsx
```

---

## 🎯 未來改進建議

### 給開發團隊的建議

1. **統一路徑設計**
   - 避免與 Nginx 反向代理衝突
   - 使用環境變數配置路徑（如 `BASE_PATH`）

2. **提供環境變數配置**
   ```typescript
   // vite.config.ts
   base: process.env.BASE_PATH || '/'
   ```

3. **在 README 中說明部署要求**
   - 明確說明 Nginx 配置需求
   - 提供標準部署腳本

---

## 📚 相關文件

- **DEPLOYMENT-SYNC-GUIDE.md**：完整的部署同步指南
- **V3.7-RELEASE-NOTES.md**：V3.7 版本發布說明
- **V3.7-TESTING-GUIDE.md**：V3.7 測試指南
- **deploy_bingo.sh**：一鍵部署腳本
- **fix_bingo_paths.sh**：路徑修復腳本

---

## 🎉 致謝

感謝所有參與開發、測試和部署的團隊成員！

---

**最後更新**：2026-01-20
**當前版本**：V3.7（Commit: 0d0c010）
**部署狀態**：🟢 Online
