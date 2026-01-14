import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);
  const io = new Server(server, {
    path: "/bingo/socket.io"
  });

  // 遊戲狀態
  let clickedNumbers = new Set<number>();
  let history: string[] = []; // 開獎歷史，最新的在最前面

  // Socket.IO 邏輯
  io.on('connection', (socket) => {
    console.log('A user connected');
    
    // 發送當前狀態給新連線的用戶
    socket.emit('initial-state', {
      clickedNumbers: Array.from(clickedNumbers),
      history: history
    });

    // 監聽號碼點擊事件
    socket.on('number-clicked', (number: number) => {
      if (!clickedNumbers.has(number)) {
        console.log(`Number ${number} clicked`);
        clickedNumbers.add(number);
        // 將號碼加入歷史記錄（最新的在最前面）
        history.unshift(number.toString());
        // 廣播給所有連線用戶
        io.emit('update-state', {
          clickedNumbers: Array.from(clickedNumbers),
          history: history,
          latestNumber: number
        });
      }
    });

    // 監聽重置遊戲事件
    socket.on('reset-game', () => {
      console.log('Game reset');
      clickedNumbers.clear();
      history = []; // 清空歷史記錄
      io.emit('reset-game');
    });

    // 監聽提醒聽牌事件
    socket.on('remind-check', () => {
      console.log('Remind check triggered by admin');
      // 廣播給所有用戶
      io.emit('bingo-check-alert');
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });

  // 靜態檔案路徑
  const staticPath = path.resolve(__dirname, "..", "dist", "public");

  // 提供靜態檔案服務
  app.use(express.static(staticPath));
  
  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  // 端口設定
  const port = process.env.PORT || 3001;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
