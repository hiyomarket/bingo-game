import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { Server } from "socket.io";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // 關鍵修正：在所有 Express 中間件註冊完成後，才初始化 Socket.IO
  // 這確保 Socket.IO 不會被其他中間件攔截
  const io = new Server(server, {
    cors: {
      origin: "*", // 允許所有來源
      methods: ["GET", "POST"],
    },
    transports: ['websocket', 'polling'],
  });

  // Socket.IO 遊戲狀態
  let clickedNumbers = new Set<number>();
  let onlineUsers = 0;

  // 廣播統計資訊給所有客戶端
  const broadcastStats = () => {
    io.emit('stats-update', {
      onlineUsers,
      selectedCount: clickedNumbers.size,
    });
  };

  // Socket.IO 邏輯
  io.on('connection', (socket) => {
    onlineUsers++;
    console.log(`[Socket.IO] A user connected. Total online: ${onlineUsers}`);
    
    // 發送當前狀態給新連線的用戶
    socket.emit('initial-state', Array.from(clickedNumbers));
    
    // 發送當前統計資訊
    broadcastStats();

    // 監聽號碼點擊事件
    socket.on('number-clicked', (number: number) => {
      if (!clickedNumbers.has(number)) {
        console.log(`[Socket.IO] Number ${number} clicked`);
        clickedNumbers.add(number);
        // 廣播給所有連線用戶
        io.emit('update-number', number);
        // 更新統計資訊
        broadcastStats();
      }
    });

    // 監聽重置遊戲事件
    socket.on('reset-game', () => {
      console.log('[Socket.IO] Game reset');
      clickedNumbers.clear();
      io.emit('reset-game');
      // 更新統計資訊
      broadcastStats();
    });

    socket.on('disconnect', () => {
      onlineUsers--;
      console.log(`[Socket.IO] User disconnected. Total online: ${onlineUsers}`);
      broadcastStats();
    });
  });

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`[Server] Running on http://localhost:${port}/`);
    console.log(`[Socket.IO] Server initialized and ready`);
  });
}

startServer().catch(console.error);
