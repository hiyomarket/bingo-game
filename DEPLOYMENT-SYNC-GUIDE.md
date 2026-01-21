# Bingo Game V3.7 部署同步指南

## 📋 概述

本文件記錄了 Bingo Game V3.7 版本在 **Nginx 反向代理環境**下的完整部署流程與路徑配置修復方案。適用於需要將應用程式部署到 `/bingo` 子路徑的生產環境。

---

## 🎯 核心問題

### 問題根源

開發團隊在 V3.2+ 版本中設計了 `/bingo` 子路徑邏輯，但與生產環境的 Nginx 反向代理配置產生衝突：

1. **Nginx 配置**：將 `https://domain.com/bingo` 映射到 `http://localhost:3001/`
2. **應用程式設計**：期望在 `/bingo` 子路徑下運行
3. **結果**：路徑重定向循環或靜態資源 404 錯誤

### Nginx 配置範例

```nginx
location /bingo/socket.io/ {
    proxy_pass http://localhost:3001/bingo/socket.io/;
    # ... WebSocket 配置
}

location /bingo {
    rewrite ^/bingo(/.*)$ $1 break;  # 關鍵：移除 /bingo 前綴
    rewrite ^/bingo$ / break;
    proxy_pass http://localhost:3001;
    # ... 代理配置
}
```

**關鍵點**：Nginx 使用 `rewrite` 規則將 `/bingo/xxx` 改寫為 `/xxx`，然後轉發到後端。

---

## ✅ 完整解決方案

### 方案架構

| 組件 | 配置 | 說明 |
|------|------|------|
| **Vite** | `base: '/bingo'` | 生成 `/bingo/assets/...` 路徑 |
| **Express** | 根路徑靜態服務 | 接收 Nginx 改寫後的請求 |
| **Wouter** | 無 base | 路由使用根路徑 |
| **Socket.IO** | `path: '/bingo/socket.io'` | 客戶端使用完整路徑 |

---

## 🔧 修復腳本

### 自動化修復腳本

創建 `fix_bingo_paths.sh`：

```bash
#!/bin/bash
# Bingo Game 路徑修復腳本（適用於 Nginx 反向代理環境）

set -e

echo "=== Bingo Game 路徑修復腳本 ==="
echo ""

# 1. 修復 vite.config.ts
echo "[1/4] 修復 vite.config.ts..."
python3 << 'PYEOF'
import re
with open("vite.config.ts", "r") as f:
    content = f.read()
content = re.sub(r"base:\s*['\"]\/['\"]", "base: '/bingo'", content)
with open("vite.config.ts", "w") as f:
    f.write(content)
print("✓ vite.config.ts 已設定為 base: '/bingo'")
PYEOF

# 2. 修復 server/index.ts
echo "[2/4] 修復 server/index.ts..."
python3 << 'PYEOF'
import re
with open("server/index.ts", "r") as f:
    content = f.read()

# 移除 /bingo 子路徑邏輯（Nginx 已處理）
content = re.sub(
    r"app\.use\(['\"]\/bingo['\"]\s*,\s*express\.static\(staticPath\)\)",
    "app.use(express.static(staticPath))",
    content
)

content = re.sub(
    r'app\.get\(["\']\/bingo\/\*["\']\s*,',
    'app.get("*",',
    content
)

# 移除根路徑重定向
content = re.sub(
    r'app\.get\(["\']\/["\']\s*,\s*\(_req,\s*res\)\s*=>\s*\{\s*res\.redirect\(["\']\/bingo["\']\);\s*\}\);',
    '',
    content
)

with open("server/index.ts", "w") as f:
    f.write(content)
print("✓ server/index.ts 已更新為根路徑服務")
PYEOF

# 3. 修復 client/src/App.tsx
echo "[3/4] 修復 client/src/App.tsx..."
if [ -f "client/src/App.tsx" ]; then
    python3 << 'PYEOF'
import re
with open("client/src/App.tsx", "r") as f:
    content = f.read()
content = re.sub(
    r'<Router\s+base=["\']\/bingo["\']\s*>',
    '<Router>',
    content
)
with open("client/src/App.tsx", "w") as f:
    f.write(content)
print("✓ client/src/App.tsx wouter base 已移除")
PYEOF
else
    echo "⚠ client/src/App.tsx 不存在，跳過"
fi

# 4. 修復 Socket.IO 路徑
echo "[4/4] 修復 SocketContext.tsx..."
if [ -f "client/src/contexts/SocketContext.tsx" ]; then
    python3 << 'PYEOF'
import re
with open("client/src/contexts/SocketContext.tsx", "r") as f:
    content = f.read()
content = re.sub(
    r"path:\s*['\"]\/socket\.io['\"]",
    "path: '/bingo/socket.io'",
    content
)
with open("client/src/contexts/SocketContext.tsx", "w") as f:
    f.write(content)
print("✓ SocketContext.tsx 已設定為 path: '/bingo/socket.io'")
PYEOF
else
    echo "⚠ SocketContext.tsx 不存在，跳過"
fi

echo ""
echo "=== 修復完成！==="
echo ""
echo "接下來執行："
echo "  pnpm build"
echo "  pm2 restart bingo-game"
```

### 使用方法

```bash
# 1. 上傳腳本到伺服器
scp fix_bingo_paths.sh root@YOUR_SERVER:/tmp/

# 2. 執行修復
ssh root@YOUR_SERVER
cd /var/www/bingo-game/bingo-game
bash /tmp/fix_bingo_paths.sh
pnpm build
pm2 restart bingo-game
```

---

## 📦 完整部署流程

### 標準部署步驟

```bash
# 1. 登入伺服器
ssh root@YOUR_SERVER

# 2. 進入專案目錄
cd /var/www/bingo-game/bingo-game

# 3. 暫存本地修改（如果有）
git stash

# 4. 拉取最新程式碼
git pull origin main

# 5. 執行路徑修復腳本
bash /tmp/fix_bingo_paths.sh

# 6. 安裝依賴
pnpm install

# 7. 建置專案
pnpm build

# 8. 重啟應用程式
pm2 restart bingo-game

# 9. 檢查服務狀態
pm2 logs bingo-game --lines 20
```

### 一鍵部署腳本

創建 `deploy.sh`：

```bash
#!/bin/bash
set -e

echo "=== Bingo Game 一鍵部署腳本 ==="

# 暫存本地修改
git stash

# 拉取最新程式碼
git pull origin main

# 執行路徑修復
bash /tmp/fix_bingo_paths.sh

# 安裝依賴
pnpm install

# 建置專案
pnpm build

# 重啟服務
pm2 restart bingo-game

echo ""
echo "✅ 部署完成！"
echo "訪問 https://YOUR_DOMAIN/bingo 測試"
```

---

## 🧪 驗證測試

### 測試清單

#### 1. 基礎功能測試

- [ ] 訪問 `https://YOUR_DOMAIN/bingo` 頁面正常載入
- [ ] 賓果板顯示 75 個號碼
- [ ] WebSocket 連線狀態顯示 🟢 LIVE CONNECTION
- [ ] 線上人數正確顯示

#### 2. V3.6 功能測試（具名戰況系統）

- [ ] 首次訪問自動彈出暱稱輸入對話框
- [ ] 輸入暱稱後可成功進入遊戲
- [ ] 浮動按鈕可正常展開/收起
- [ ] 點擊狀態回報按鈕後，主持人頁面顯示具名戰況

#### 3. V3.7 功能測試（沉浸式通知系統）

- [ ] 主持人點擊「🔔 提醒聽牌」後，玩家頁面彈出通知 Modal
- [ ] 開出第 45 顆球時，自動彈出「遊戲過半」通知
- [ ] 通知 Modal 置中顯示，背景半透明
- [ ] 點擊「我知道了」可關閉通知

#### 4. 管理者頁面測試

- [ ] 訪問 `https://YOUR_DOMAIN/bingo/admin` 正常載入
- [ ] 點擊號碼後，號碼變紅色
- [ ] 開獎記錄正確顯示
- [ ] 現場戰況區塊正確更新

---

## 🐛 常見問題

### Q1: 頁面空白，控制台顯示 MIME 類型錯誤

**原因**：靜態資源路徑不正確。

**解決方案**：
1. 檢查 `vite.config.ts` 的 `base` 設定是否為 `/bingo`
2. 檢查 HTML 中的資源路徑：
   ```bash
   grep -o 'src="[^"]*\.js"' dist/public/index.html
   # 應該顯示：src="/bingo/assets/index-xxx.js"
   ```
3. 如果路徑錯誤，重新執行修復腳本並建置

### Q2: WebSocket 連線失敗

**原因**：Socket.IO 路徑配置不正確。

**解決方案**：
1. 檢查 `SocketContext.tsx` 中的 `path` 設定：
   ```typescript
   path: '/bingo/socket.io'  // 正確
   ```
2. 檢查 Nginx 配置中的 Socket.IO 代理：
   ```nginx
   location /bingo/socket.io/ {
       proxy_pass http://localhost:3001/bingo/socket.io/;
   }
   ```

### Q3: 出現重定向循環錯誤

**原因**：`server/index.ts` 中存在根路徑重定向。

**解決方案**：
1. 檢查 `server/index.ts` 是否有以下程式碼：
   ```typescript
   app.get("/", (_req, res) => {
     res.redirect('/bingo');
   });
   ```
2. 如果有，移除此段程式碼並重新建置

### Q4: 靜態資源 404 錯誤

**原因**：Express 靜態檔案服務路徑不正確。

**解決方案**：
1. 確認 `server/index.ts` 中的靜態服務配置：
   ```typescript
   app.use(express.static(staticPath));  // 正確（根路徑）
   ```
2. 確認 `staticPath` 指向正確的目錄：
   ```typescript
   const staticPath = path.resolve(__dirname, "..", "dist", "public");
   ```

---

## 📝 配置檔案範例

### vite.config.ts

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/bingo',  // 關鍵：生成 /bingo/assets/... 路徑
  build: {
    outDir: 'dist/public',
    emptyOutDir: true,
  },
});
```

### server/index.ts（關鍵部分）

```typescript
// 靜態檔案路徑
const staticPath = path.resolve(__dirname, "..", "dist", "public");

// 提供靜態檔案服務（根路徑，Nginx 已移除 /bingo 前綴）
app.use(express.static(staticPath));

// 處理客戶端路由（SPA）
app.get("*", (_req, res) => {
  res.sendFile(path.join(staticPath, "index.html"));
});
```

### client/src/App.tsx（關鍵部分）

```typescript
import { Router, Route } from "wouter";

function App() {
  return (
    <Router>  {/* 無 base prop */}
      <Route path="/" component={Home} />
      <Route path="/admin" component={Admin} />
    </Router>
  );
}
```

### client/src/contexts/SocketContext.tsx（關鍵部分）

```typescript
const socket = io({
  path: '/bingo/socket.io',  // 關鍵：使用完整路徑
  transports: ['websocket', 'polling'],
});
```

---

## 🚀 版本歷史

### V3.7（當前版本）
- ✅ 沉浸式通知系統
- ✅ 手動通知功能（提醒聽牌）
- ✅ 自動里程碑通知（遊戲過半等）

### V3.6
- ✅ 臨時暱稱系統
- ✅ 具名戰況顯示
- ✅ 浮動操作按鈕

### V3.4
- ✅ 狀態回報按鈕優化（差 3/5/8 個）
- ✅ 手機模式捲動優化

### V3.3
- ✅ 雙擊取消號碼功能
- ✅ 確認對話框

### V3.2
- ✅ 互動升級
- ✅ 5 個狀態回報按鈕
- ✅ 現場戰況區塊

---

## 📞 技術支援

如遇到部署問題，請檢查：

1. **Nginx 配置**：確認 rewrite 規則正確
2. **Node.js 版本**：建議使用 v18+ 或 v20+
3. **PM2 狀態**：`pm2 list` 確認應用程式 online
4. **日誌檢查**：`pm2 logs bingo-game --lines 50`
5. **瀏覽器控制台**：檢查是否有 JavaScript 錯誤

---

## 📄 授權

本文件由 Manus AI 自動生成，供 Bingo Game 專案部署使用。

---

**最後更新**：2026年1月21日  
**適用版本**：V3.7+  
**環境**：Nginx 反向代理 + PM2 + Node.js
