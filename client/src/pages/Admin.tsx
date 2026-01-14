import { BingoBoard } from "@/components/BingoBoard";
import { useSocket } from "@/contexts/SocketContext";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

export default function Admin() {
  const { clickedNumbers, history, emitNumberClick, emitRemindCheck, isConnected, onlineUsers, selectedCount, socket } = useSocket();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleNumberClick = (number: number) => {
    if (clickedNumbers.has(number)) {
      toast.error(`Number ${number} already clicked!`);
      return;
    }
    emitNumberClick(number);
    toast.success(`Number ${number} broadcasted!`);
  };

  const handleReset = () => {
    if (socket) {
      socket.emit('reset-game');
      toast.success('Game reset successfully!');
      setShowResetConfirm(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center py-8 px-4">
      {/* 頂部狀態欄：計數器、歷史列表、提醒按鈕 */}
      <div className="w-full max-w-6xl mb-6 bg-black text-white p-4 flex flex-col md:flex-row justify-between items-center gap-4 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)]">
        {/* 左側：計數器 */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-lg font-bold">🎯</span>
          <span className="font-mono text-lg font-bold">
            已開出 <span className="text-yellow-400">{clickedNumbers.size}</span> / 75 球
          </span>
        </div>

        {/* 中間：歷史列表 */}
        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-2 items-center min-w-max">
            <span className="font-mono text-sm font-bold text-gray-400">📜</span>
            {history.length === 0 ? (
              <span className="font-mono text-sm text-gray-500">尚無開獎記錄</span>
            ) : (
              history.map((num, index) => (
                <span 
                  key={`${num}-${index}`}
                  className="bg-gray-700 text-white px-3 py-1 rounded-full font-mono text-sm font-bold border-2 border-gray-600"
                >
                  {num}
                </span>
              ))
            )}
          </div>
        </div>

        {/* 右側：提醒按鈕 */}
        <Button 
          className="font-mono font-bold bg-yellow-500 hover:bg-yellow-600 text-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all rounded-none whitespace-nowrap"
          onClick={() => {
            emitRemindCheck();
            toast.success('已發送提醒通知！');
          }}
        >
          🔔 提醒聽牌
        </Button>
      </div>

      <header className="w-full max-w-4xl mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col items-start">
          <div className="inline-block border-4 border-black bg-primary px-4 py-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h1 className="text-2xl md:text-3xl font-display uppercase tracking-tighter text-primary-foreground">
              ADMIN CONSOLE
            </h1>
          </div>
          <div className="flex flex-col gap-2 mt-2">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} border border-black`}></div>
              <span className="font-mono text-xs font-bold uppercase">
                {isConnected ? 'SYSTEM ONLINE' : 'SYSTEM OFFLINE'}
              </span>
            </div>
            
            {/* 統計資訊 */}
            <div className="flex gap-4 font-mono text-xs">
              <div className="flex items-center gap-1">
                <span className="font-bold">👥</span>
                <span className="bg-blue-500 text-white px-2 py-0.5 rounded-full font-bold">{onlineUsers}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-bold">✅</span>
                <span className="bg-purple-500 text-white px-2 py-0.5 rounded-full font-bold">{selectedCount}/75</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          {!showResetConfirm ? (
            <Button 
              variant="destructive" 
              className="font-mono font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all rounded-none"
              onClick={() => setShowResetConfirm(true)}
            >
              RESET GAME
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="font-mono font-bold border-2 border-black rounded-none"
                onClick={() => setShowResetConfirm(false)}
              >
                CANCEL
              </Button>
              <Button 
                variant="destructive" 
                className="font-mono font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none"
                onClick={handleReset}
              >
                CONFIRM RESET
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="w-full flex-1 flex flex-col items-center gap-8">
        <div className="w-full bg-white border-4 border-black p-4 md:p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative">
          <div className="absolute -top-4 -left-4 bg-accent border-2 border-black px-3 py-1 font-mono font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform -rotate-2">
            CONTROL PANEL
          </div>
          <p className="mb-6 font-mono text-sm text-gray-500 text-center">
            CLICK A NUMBER TO BROADCAST IT TO ALL PLAYERS
          </p>
          <BingoBoard 
            clickedNumbers={clickedNumbers} 
            isAdmin={true} 
            onNumberClick={handleNumberClick} 
          />
        </div>
      </main>
    </div>
  );
}
