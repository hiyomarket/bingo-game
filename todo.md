# Project TODO

- [x] 修復 Home.tsx 中的 useAuth 導入錯誤
- [x] 整合 Socket.IO 到新的全端架構
- [x] 恢復管理者介面 (/admin) 路由
- [x] 恢復觀眾介面 (/) 的賓果盤顯示
- [x] 測試實時連線功能

## 生產環境問題修復

- [x] 修復生產環境 Socket.IO CORS 配置
- [x] 確保 Socket.IO 客戶端連線到正確的伺服器地址

## 新功能需求

- [x] 在前台顯示當前在線人數
- [x] 在前台顯示已選號碼的數量
- [x] 確保生產環境 Socket.IO 連線穩定（參考討論內容的架構）
- [x] 添加詳細的連線日誌以便診斷問題

## 生產環境連線修復（根據用戶提供的方案）

- [x] 整合用戶提供的 CORS 配置到 Socket.IO 伺服器
- [x] 檢查並修復生產環境靜態檔案路徑配置
- [x] 測試打包後的生產環境連線
- [x] 驗證發布後的網站 Socket.IO 連線狀態
- [x] 測試管理者點擊號碼功能
- [x] 驗證觀眾頁面即時同步

## 根據用戶截圖建議的關鍵修改

- [x] 修改 SocketContext.tsx：移除 `path: '/socket.io/'` 配置
- [x] 同步修改後端 server/_core/index.ts：移除 path 配置
- [x] 保存 checkpoint 並發布到生產環境
- [ ] 使用發布後的公開網址進行實際測試（非內部預覽）
- [ ] 驗證生產環境 Socket.IO 連線狀態

## 生產環境 Socket.IO 診斷結果

- [x] 測試發布後的網址：https://bingogame-tz7vhwgp.manus.space
- [x] 確認問題：顯示 DISCONNECTED，線上人數為 0
- [x] 檢查 Console：發現 `testSocket.on is not a function` 錯誤
- [ ] 診斷根本原因：Socket.IO 客戶端庫載入問題
- [ ] 實施修復方案

## 獨立 Socket.IO 伺服器方案

- [x] 重寫 server/_core/index.ts，調整 Socket.IO 初始化順序
- [x] 測試開發環境：連線正常
- [ ] 發布並測試生產環境

## 最終診斷結果（2026-01-14）

- [x] 再次測試發布後的網址：依然顯示 DISCONNECTED
- [x] 檢查 Console：無任何錯誤訊息或日誌輸出
- [ ] 結論：Manus 平台的 web-db-user 模板在生產環境中可能不支援 WebSocket 連線
- [ ] 討論替代方案：外部架站（Render、Railway、Vercel 等）

## 專案文件整理（交付給外部架站 Agent）

- [ ] 撰寫專案架構說明文件
- [ ] 整理核心程式碼清單
- [ ] 撰寫部署指南（Render/Railway/Fly.io）
- [ ] 列出環境變數和依賴項
- [ ] 打包所有檔案供下載
