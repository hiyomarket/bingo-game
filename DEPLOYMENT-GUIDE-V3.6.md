# V3.6 部署指南

## 🚀 快速部署步驟

### 1. 連接到生產伺服器
```bash
ssh root@45.77.170.104
```

### 2. 進入專案目錄
```bash
cd /root/bingo-game
```

### 3. 拉取最新代碼
```bash
git pull origin main
```

預期輸出：
```
remote: Enumerating objects: 25, done.
remote: Counting objects: 100% (25/25), done.
...
Updating 3e72a3d..e9cd434
Fast-forward
 V3.6-RELEASE-NOTES.md                      | 345 ++++++++++++++++++++++++++++
 client/src/components/NicknameModal.tsx    |  89 +++++++
 client/src/contexts/SocketContext.tsx      |  25 +-
 client/src/pages/Admin.tsx                 |  15 +-
 client/src/pages/Home.tsx                  |  31 ++-
 server/index.ts                            |  55 ++++-
 6 files changed, 484 insertions(+), 31 deletions(-)
```

### 4. 安裝依賴
```bash
pnpm install
```

### 5. 編譯專案
```bash
pnpm build
```

預期輸出：
```
> bingo-game@1.0.0 build /root/bingo-game
> vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

vite v7.1.9 building for production...
✓ 1750 modules transformed.
../dist/public/index.html                 XXX.XX kB │ gzip: XXX.XX kB
../dist/public/assets/index-XXXXXXXX.css  XXX.XX kB │ gzip:  XX.XX kB
../dist/public/assets/index-XXXXXXXX.js   XXX.XX kB │ gzip: XXX.XX kB
✓ built in X.XXs

  dist/index.js  X.Xkb
⚡ Done in Xms
```

### 6. 重啟 PM2 服務
```bash
pm2 restart bingo-game
```

預期輸出：
```
[PM2] Applying action restartProcessId on app [bingo-game](ids: [ 0 ])
[PM2] [bingo-game](0) ✓
┌─────┬──────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐
│ id  │ name         │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │ mem      │ user     │ watching │
├─────┼──────────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┼──────────┼──────────┤
│ 0   │ bingo-game   │ default     │ 1.0.0   │ fork    │ XXXXX    │ 0s     │ X    │ online    │ 0%       │ XX.X mb  │ root     │ disabled │
└─────┴──────────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘
```

### 7. 檢查服務日誌
```bash
pm2 logs bingo-game --lines 50
```

預期看到：
```
[Server] Running on http://localhost:3001/
[Socket.IO] Server initialized and ready
```

### 8. 驗證服務狀態
```bash
pm2 status
```

確認 `bingo-game` 狀態為 `online`

---

## 🧪 功能測試清單

### 測試環境
- **生產 URL**：https://market.hiyoshop.store/bingo/
- **管理者 URL**：https://market.hiyoshop.store/bingo/admin

### 測試場景 1：單一玩家流程
1. ✅ 清除瀏覽器 localStorage（F12 → Application → Local Storage → Clear）
2. ✅ 訪問 https://market.hiyoshop.store/bingo/
3. ✅ 確認暱稱對話框彈出
4. ✅ 輸入暱稱「測試玩家A」並提交
5. ✅ 確認對話框關閉，遊戲頁面正常顯示
6. ✅ 點擊右下角 FAB 按鈕
7. ✅ 點擊「我聽牌了！」
8. ✅ 確認 FAB 圖示變為 📊
9. ✅ 重新整理頁面，確認不再顯示暱稱對話框
10. ✅ 檢查伺服器日誌：
    ```bash
    pm2 logs bingo-game --lines 20
    ```
    預期看到：
    ```
    [Socket.IO] Player registered: 測試玩家A (socket-id)
    [Socket.IO] Player socket-id reported state: 差1個
    ```

### 測試場景 2：多玩家協作（需 2+ 個裝置）

#### 裝置 A（手機）
1. ✅ 訪問 https://market.hiyoshop.store/bingo/
2. ✅ 輸入暱稱「Alice」
3. ✅ 點擊 FAB → 「我聽牌了！」
4. ✅ **保持頁面開啟**

#### 裝置 B（電腦）
1. ✅ 訪問 https://market.hiyoshop.store/bingo/
2. ✅ 輸入暱稱「Bob」
3. ✅ 點擊 FAB → 「我差 3 個」
4. ✅ **保持頁面開啟**

#### 裝置 C（平板/另一個瀏覽器）
1. ✅ 訪問 https://market.hiyoshop.store/bingo/admin
2. ✅ 檢查「現場戰況」區域：
   - 「聽牌 (diff1個)」卡片應顯示：**1 人**
   - 下方應顯示：**玩家：Alice**
   - 「差 3 個號碼」卡片應顯示：**1 人**
   - 下方應顯示：**玩家：Bob**
3. ✅ 點擊任意號碼（例如：1）
4. ✅ 確認所有裝置同步更新

#### 裝置 A 繼續測試
1. ✅ 點擊 FAB → 「我差 5 個」
2. ✅ 切換到裝置 C（管理者頁面）
3. ✅ 確認「聽牌」卡片變為 **0 人**
4. ✅ 確認「差 5 個號碼」卡片變為 **1 人：Alice**

### 測試場景 3：斷線重連
1. ✅ 裝置 A 關閉瀏覽器
2. ✅ 裝置 C（管理者）確認線上人數減少
3. ✅ 裝置 A 重新開啟瀏覽器訪問遊戲
4. ✅ 確認不需要重新輸入暱稱（localStorage 持久化）
5. ✅ 確認線上人數恢復
6. ✅ 點擊 FAB 重新回報狀態
7. ✅ 裝置 C 確認玩家重新出現在戰況列表

### 測試場景 4：長名單處理（需 5+ 個裝置）
1. ✅ 5 個裝置分別輸入暱稱：「玩家1」~「玩家5」
2. ✅ 所有裝置都回報「我聽牌了！」
3. ✅ 管理者頁面確認顯示：**5 人：玩家1, 玩家2, 玩家3, 玩家4, 玩家5**
4. ✅ 檢查 UI 是否溢出或換行

---

## 🐛 故障排除

### 問題 1：暱稱對話框不顯示
**症狀**：首次訪問沒有彈出暱稱輸入框

**解決方案**：
```bash
# 1. 檢查瀏覽器 Console（F12）
# 預期看到：
[Socket.IO] Attempting to connect to: https://market.hiyoshop.store
[Socket.IO] Path: /bingo/socket.io
[Socket.IO] Connected to server

# 2. 檢查 localStorage
# F12 → Application → Local Storage → https://market.hiyoshop.store
# 如果有 bingo_player_name，清除後重新整理
```

### 問題 2：管理者頁面顯示「0 人」
**症狀**：玩家已回報狀態，但管理者頁面顯示 0 人

**可能原因**：
1. 玩家頁面已關閉（Socket 斷線）
2. 玩家尚未回報狀態
3. WebSocket 連線問題

**解決方案**：
```bash
# 1. 檢查伺服器日誌
pm2 logs bingo-game --lines 50

# 預期看到：
[Socket.IO] Player registered: XXX (socket-id)
[Socket.IO] Player socket-id reported state: 差1個

# 2. 檢查玩家頁面 Console
# 預期看到：
[Socket.IO] Registering player with nickname: XXX
[Socket.IO] Connected to server

# 3. 確認玩家頁面保持開啟狀態
```

### 問題 3：WebSocket 連線失敗
**症狀**：Console 顯示 `Connection error`

**解決方案**：
```bash
# 1. 檢查 Nginx 配置
cat /etc/nginx/sites-available/market.hiyoshop.store

# 確認有以下配置：
location /bingo/socket.io/ {
    proxy_pass http://127.0.0.1:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 86400;
}

# 2. 重新載入 Nginx
nginx -t
systemctl reload nginx

# 3. 檢查防火牆
ufw status
# 確認 80 和 443 端口開放
```

### 問題 4：編譯失敗
**症狀**：`pnpm build` 報錯

**解決方案**：
```bash
# 1. 清除快取
rm -rf node_modules dist
pnpm install

# 2. 檢查 Node.js 版本
node -v
# 需要 v18 或更高版本

# 3. 檢查 TypeScript 錯誤
pnpm run type-check
```

---

## 📊 監控指令

### 即時日誌
```bash
pm2 logs bingo-game
```

### 服務狀態
```bash
pm2 status
pm2 monit
```

### 記憶體使用
```bash
pm2 show bingo-game
```

### 重啟服務
```bash
pm2 restart bingo-game
```

### 停止服務
```bash
pm2 stop bingo-game
```

### 查看錯誤日誌
```bash
pm2 logs bingo-game --err --lines 100
```

---

## 🔄 回滾步驟

如果 V3.6 出現嚴重問題，可以回滾到上一個版本：

```bash
cd /root/bingo-game

# 查看提交歷史
git log --oneline -10

# 回滾到上一個版本（V3.5）
git reset --hard 3e72a3d

# 重新編譯
pnpm build

# 重啟服務
pm2 restart bingo-game
```

---

## ✅ 部署檢查清單

- [ ] 已連接到生產伺服器
- [ ] 已拉取最新代碼（commit: e9cd434）
- [ ] 已執行 `pnpm install`
- [ ] 已執行 `pnpm build` 且無錯誤
- [ ] 已執行 `pm2 restart bingo-game`
- [ ] PM2 狀態顯示 `online`
- [ ] 伺服器日誌顯示正常啟動
- [ ] 測試場景 1 通過（單一玩家）
- [ ] 測試場景 2 通過（多玩家協作）
- [ ] 測試場景 3 通過（斷線重連）
- [ ] 管理者頁面正確顯示玩家名單
- [ ] 所有裝置 WebSocket 連線正常

---

## 📞 緊急聯絡

如遇到無法解決的問題：
1. 保存錯誤日誌：`pm2 logs bingo-game --err --lines 200 > error.log`
2. 回滾到穩定版本（見上方回滾步驟）
3. 提交 GitHub Issue 並附上錯誤日誌

---

## 🎉 部署完成

部署成功後，V3.6 的所有功能應該正常運作：
- ✅ 玩家首次訪問輸入暱稱
- ✅ 暱稱持久化儲存
- ✅ 管理者頁面顯示具名戰況
- ✅ 即時同步更新
- ✅ 斷線重連保護

享受遊戲！🎮
