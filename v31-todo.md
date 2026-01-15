# V3.1 主持人工具包 - 開發待辦清單

## 第一步：後端升級（State & Events）
- [x] 修改 server/index.ts，在 gameState 中新增 history 陣列
- [x] 更新 number_clicked 事件：將號碼加入 history
- [x] 更新 reset_game 事件：清空 history
- [x] 更新廣播狀態：在 initial_state 和 update_state 中包含 history
- [x] 新增 remind_check 事件監聽
- [x] 新增 bingo_check_alert 事件廣播

## 第二步：前端開發（管理者頁面）
- [x] 重構 Admin.tsx 頂部狀態欄為 flex 佈局
- [x] 實作「計數器」：顯示「已開出 X / 75 球」
- [x] 實作「開獎歷史列表」：渲染 history 陣列
- [x] 實作「提醒聽牌」按鈕：發送 remind_check 事件

## 第三步：前端開發（觀眾頁面）
- [x] 在 SocketContext.tsx 中監聽 bingo_check_alert 事件
- [x] 實作賓果盤黃色呼吸燈動畫效果
- [x] 實作頂部文字提示框（3秒後消失）

## 第四步：測試與驗證
- [x] 啟動開發伺服器
- [x] 驗證管理者頁面功能
- [x] 驗證觀眾頁面功能
- [x] 本地 Git 提交完成
- [x] 提供完整的功能說明和測試報告
