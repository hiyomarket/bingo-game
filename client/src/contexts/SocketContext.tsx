import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface PlayerStatusDetail {
  count: number;
  players: string[];
}

interface PlayerStats {
  '差1個': PlayerStatusDetail;
  '差3個': PlayerStatusDetail;
  '差5個': PlayerStatusDetail;
  '差8個': PlayerStatusDetail;
}

interface ImmersiveNotificationData {
  type: 'manual_reminder' | 'milestone';
  title: string;
  message: string;
  current_ball_count: number;
}

interface SocketContextType {
  socket: Socket | null;
  clickedNumbers: Set<number>;
  history: string[]; // 開獎歷史
  isConnected: boolean;
  onlineUsers: number;
  selectedCount: number;
  showReminder: boolean; // 是否顯示提醒
  playerStats: PlayerStats; // 玩家狀態統計
  immersiveNotification: ImmersiveNotificationData | null; // 沉浸式通知數據
  emitNumberClick: (number: number) => void;
  emitRemindCheck: () => void; // 提醒聽牌
  emitReportState: (status: string | null) => void; // 回報狀態
  emitUndoNumber: (number: number) => void; // 取消號碼
  emitRegisterPlayer: (nickname: string) => void; // 註冊玩家暱稱
  clearImmersiveNotification: () => void; // 清除沉浸式通知
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [clickedNumbers, setClickedNumbers] = useState<Set<number>>(new Set());
  const [history, setHistory] = useState<string[]>([]); // 開獎歷史
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [selectedCount, setSelectedCount] = useState(0);
  const [showReminder, setShowReminder] = useState(false); // 提醒狀態
  const [playerStats, setPlayerStats] = useState<PlayerStats>({
    '差1個': { count: 0, players: [] },
    '差3個': { count: 0, players: [] },
    '差5個': { count: 0, players: [] },
    '差8個': { count: 0, players: [] }
  });
  const [immersiveNotification, setImmersiveNotification] = useState<ImmersiveNotificationData | null>(null);

  useEffect(() => {
    // Socket.IO 客戶端配置
    // 連接到當前域名，並指定 /bingo/socket.io 路徑
    console.log('[Socket.IO] Attempting to connect to:', window.location.origin);
    console.log('[Socket.IO] Path: /bingo/socket.io');
    console.log('[Socket.IO] Environment:', import.meta.env.MODE);
    
    const newSocket = io(window.location.origin, {
      path: '/bingo/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      autoConnect: true,
    });

    newSocket.on('connect', () => {
      console.log('[Socket.IO] Connected to server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('[Socket.IO] Disconnected from server. Reason:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('[Socket.IO] Connection error:', error.message);
      setIsConnected(false);
    });

    newSocket.on('reconnect_attempt', (attemptNumber) => {
      console.log('[Socket.IO] Reconnection attempt:', attemptNumber);
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log('[Socket.IO] Reconnected after', attemptNumber, 'attempts');
      setIsConnected(true);
    });

    newSocket.on('initial-state', (data: { clickedNumbers: number[]; history: string[] }) => {
      console.log('[Socket.IO] Initial state received:', data);
      setClickedNumbers(new Set(data.clickedNumbers));
      setHistory(data.history || []);
    });

    newSocket.on('update-state', (data: { clickedNumbers: number[]; history: string[]; latestNumber: number }) => {
      console.log('[Socket.IO] State updated:', data);
      setClickedNumbers(new Set(data.clickedNumbers));
      setHistory(data.history || []);
    });
    
    // 監聽重置事件
    newSocket.on('reset-game', () => {
      setClickedNumbers(new Set());
      setHistory([]); // 清空歷史
    });

    // 監聽統計資訊更新
    newSocket.on('stats-update', (stats: { onlineUsers: number; selectedCount: number }) => {
      console.log('[Socket.IO] Stats updated:', stats);
      setOnlineUsers(stats.onlineUsers);
      setSelectedCount(stats.selectedCount);
    });

    // 監聽提醒聽牌事件
    newSocket.on('bingo-check-alert', () => {
      console.log('[Socket.IO] Bingo check alert received');
      setShowReminder(true);
      // 3秒後自動清除提醒
      setTimeout(() => {
        setShowReminder(false);
      }, 3000);
    });

    // 監聽玩家狀態統計更新
    newSocket.on('update-stats', (stats: PlayerStats) => {
      console.log('[Socket.IO] Player stats updated:', stats);
      setPlayerStats(stats);
    });

    // 監聽沉浸式通知事件
    newSocket.on('show-immersive-notification', (data: ImmersiveNotificationData) => {
      console.log('[Socket.IO] Immersive notification received:', data);
      setImmersiveNotification(data);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const emitNumberClick = (number: number) => {
    if (socket) {
      socket.emit('number-clicked', number);
    }
  };

  const emitRemindCheck = () => {
    if (socket) {
      socket.emit('remind-check');
    }
  };

  const emitReportState = (status: string | null) => {
    if (socket) {
      socket.emit('report-state', status);
    }
  };

  const emitUndoNumber = (number: number) => {
    if (socket) {
      socket.emit('undo-number', number);
    }
  };

  const emitRegisterPlayer = (nickname: string) => {
    if (socket) {
      console.log('[Socket.IO] Registering player with nickname:', nickname);
      socket.emit('register-player', { name: nickname });
    }
  };

  const clearImmersiveNotification = () => {
    setImmersiveNotification(null);
  };

  return (
    <SocketContext.Provider value={{ socket, clickedNumbers, history, isConnected, onlineUsers, selectedCount, showReminder, playerStats, immersiveNotification, emitNumberClick, emitRemindCheck, emitReportState, emitUndoNumber, emitRegisterPlayer, clearImmersiveNotification }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
