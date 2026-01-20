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
    name: string; // 玩家暱稱
    status: string | null; // '差1個', '差3個', '差5個', '差8個', 或 null
  }
  const playerStates = new Map<string, PlayerState>(); // socketId -> PlayerState

  // 計算統計摘要（包含玩家暱稱列表）
  function calculateStats() {
    const stats = {
      '差1個': { count: 0, players: [] as string[] },
      '差3個': { count: 0, players: [] as string[] },
      '差5個': { count: 0, players: [] as string[] },
      '差8個': { count: 0, players: [] as string[] }
    };
    
    playerStates.forEach((playerState) => {
      if (playerState.status && playerState.status in stats) {
        const statusKey = playerState.status as keyof typeof stats;
        stats[statusKey].count++;
        stats[statusKey].players.push(playerState.name);
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

        // 檢查是否觸發里程碑通知
        const ballCount = clickedNumbers.size;
        let notificationData = null;

        if (ballCount === 45) {
          notificationData = { 
            type: 'milestone', 
            title: '遊戲過半', 
            message: '已開出 45 球，請把握機會！', 
            current_ball_count: ballCount 
          };
        } else if (ballCount === 55) {
          notificationData = { 
            type: 'milestone', 
            title: '緊張時刻', 
            message: '剩下最後 20 顆球！', 
            current_ball_count: ballCount 
          };
        } else if (ballCount === 65) {
          notificationData = { 
            type: 'milestone', 
            title: '最後階段', 
            message: '剩下最後 10 顆球，快檢查你的牌！', 
            current_ball_count: ballCount 
          };
        } else if (ballCount === 70) {
          notificationData = { 
            type: 'milestone', 
            title: '決勝時刻！', 
            message: '剩下最後 5 顆球！成敗在此一舉！', 
            current_ball_count: ballCount 
          };
        }

        if (notificationData) {
          console.log(`[Socket.IO] Milestone reached: ${ballCount} balls`);
          io.emit('show-immersive-notification', notificationData);
        }
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
      // 廣播沉浸式通知給所有用戶
      io.emit('show-immersive-notification', {
        type: 'manual_reminder',
        title: '主持人提醒 🔔',
        message: '請檢查您的賓果卡，看看是否已經聽牌了！',
        current_ball_count: clickedNumbers.size
      });
      // 保留舊的事件以兼容舊版本
      io.emit('bingo-check-alert');
    });

    // 監聽玩家註冊事件
    socket.on('register-player', (data: { name: string }) => {
      console.log(`[Socket.IO] Player registered: ${data.name} (${socket.id})`);
      // 如果玩家已存在，更新暱稱；否則建立新記錄
      const existingState = playerStates.get(socket.id);
      if (existingState) {
        existingState.name = data.name;
      } else {
        playerStates.set(socket.id, {
          name: data.name,
          status: null
        });
      }
      // 廣播更新後的統計
      broadcastPlayerStats();
    });

    // 監聽玩家狀態回報
    socket.on('report-state', (status: string | null) => {
      console.log(`[Socket.IO] Player ${socket.id} reported state: ${status}`);
      const playerState = playerStates.get(socket.id);
      if (playerState) {
        // 更新現有玩家的狀態
        playerState.status = status;
      } else {
        // 如果玩家還沒註冊，建立一個預設記錄
        playerStates.set(socket.id, {
          name: 'Unknown Player',
          status: status
        });
      }
      // 廣播更新後的統計給管理者
      broadcastPlayerStats();
    });

    // 監聽取消號碼事件
    socket.on('undo-number', (number: number) => {
      if (clickedNumbers.has(number)) {
        console.log(`[Socket.IO] Number ${number} undone by admin`);
        // 從 clickedNumbers 移除
        clickedNumbers.delete(number);
        // 從 history 移除（移除所有出現）
        history = history.filter(h => h !== number.toString());
        // 廣播給所有連線用戶
        io.emit('update-state', {
          clickedNumbers: Array.from(clickedNumbers),
          history: history,
          latestNumber: null // 取消不需要 latestNumber
        });
        // 更新統計資訊
        broadcastStats();
        broadcastPlayerStats();
      }
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
