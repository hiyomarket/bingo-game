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
  let onlineUsers = 0; // 在線人數

  // 玩家狀態追蹤（用於聽牌回饋系統）
  interface PlayerState {
    socketId: string;
    status: string; // '差1個', '差5個', '差10個', '差15個', 或 null
  }
  const playerStates = new Map<string, string>(); // socketId -> status

  // 計算統計摘要
  function calculateStats() {
    const stats = {
      '差1個': 0,
      '差5個': 0,
      '差10個': 0,
      '差15個': 0
    };
    
    playerStates.forEach((status) => {
      if (status in stats) {
        stats[status as keyof typeof stats]++;
      }
    });
    
    return stats;
  }

  // 廣播統計資訊給所有用戶
  function broadcastStats() {
    io.emit('stats-update', {
      onlineUsers: onlineUsers,
      selectedCount: clickedNumbers.size
    });
  }

  // 廣播玩家狀態統計給管理者
  function broadcastPlayerStats() {
    const stats = calculateStats();
    io.emit('update-stats', stats);
  }

  // Socket.IO 邏輯
  io.on('connection', (socket) => {
    onlineUsers++;
    console.log(`[Socket.IO] A user connected. Total online: ${onlineUsers}`);
    
    // 發送當前狀態給新連線的用戶
    socket.emit('initial-state', {
      clickedNumbers: Array.from(clickedNumbers),
      history: history
    });

    // 廣播更新後的統計資訊
    broadcastStats();

    // 監聽號碼點擊事件
    socket.on('number-clicked', (number: number) => {
      if (!clickedNumbers.has(number)) {
        console.log(`[Socket.IO] Number ${number} clicked`);
        clickedNumbers.add(number);
        // 將號碼加入歷史記錄（最新的在最前面）
        history.unshift(number.toString());
        // 廣播給所有連線用戶
        io.emit('update-state', {
          clickedNumbers: Array.from(clickedNumbers),
          history: history,
          latestNumber: number
        });
        // 更新統計資訊
        broadcastStats();
      }
    });

    // 監聽重置遊戲事件
    socket.on('reset-game', () => {
      console.log('[Socket.IO] Game reset');
      clickedNumbers.clear();
      history = []; // 清空歷史記錄
      playerStates.clear(); // 清空玩家狀態
      io.emit('reset-game');
      broadcastStats();
      broadcastPlayerStats();
    });

    // 監聽提醒聽牌事件
    socket.on('remind-check', () => {
      console.log('[Socket.IO] Remind check triggered by admin');
      // 廣播給所有用戶
      io.emit('bingo-check-alert');
    });

    // 監聽玩家狀態回報
    socket.on('report-state', (status: string | null) => {
      console.log(`[Socket.IO] Player ${socket.id} reported state: ${status}`);
      if (status === null) {
        // 取消回報
        playerStates.delete(socket.id);
      } else {
        // 更新狀態
        playerStates.set(socket.id, status);
      }
      // 廣播更新後的統計給管理者
      broadcastPlayerStats();
    });

    socket.on('disconnect', () => {
      onlineUsers--;
      console.log(`[Socket.IO] User disconnected. Total online: ${onlineUsers}`);
      // 移除該用戶的狀態
      playerStates.delete(socket.id);
      // 廣播更新後的統計資訊
      broadcastStats();
      broadcastPlayerStats();
    });
  });

  // 静態檔案路徑
  const staticPath = path.resolve(__dirname, "..", "dist", "public");

  // 提供静態檔案服務（在 /bingo 路徑下）
  app.use('/bingo', express.static(staticPath));
  
  // Handle client-side routing - serve index.html for all routes under /bingo
  app.get("/bingo/*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  // Redirect root to /bingo
  app.get("/", (_req, res) => {
    res.redirect('/bingo');
  });

  // 端口設定
  const port = process.env.PORT || 3001;

  server.listen(port, () => {
    console.log(`[Server] Running on http://localhost:${port}/`);
    console.log(`[Socket.IO] Server initialized and ready`);
  });
}

startServer().catch(console.error);
