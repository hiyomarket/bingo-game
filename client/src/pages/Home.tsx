import { BingoBoard } from "@/components/BingoBoard";
import { useSocket } from "@/contexts/SocketContext";
import { useEffect, useState } from "react";

export default function Home() {
  const { clickedNumbers, isConnected, onlineUsers, selectedCount, showReminder, emitReportState } = useSocket();
  const [lastNumber, setLastNumber] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  useEffect(() => {
    if (clickedNumbers.size > 0) {
      const numbers = Array.from(clickedNumbers);
      setLastNumber(numbers[numbers.length - 1]);
    } else {
      setLastNumber(null);
    }
  }, [clickedNumbers]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center py-8 px-4 relative">
      {/* 提醒文字 */}
      {showReminder && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2 duration-500">
          <div className="bg-yellow-500 text-black px-6 py-3 rounded-lg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] font-mono font-bold text-lg">
            🔔 主持人提醒：快檢查你的賓果卡！
          </div>
        </div>
      )}
      <header className="w-full max-w-4xl mb-8 flex flex-col items-center text-center space-y-4">
        <div className="inline-block border-4 border-black bg-white px-6 py-2 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform -rotate-1">
          <h1 className="text-4xl md:text-6xl font-display uppercase tracking-tighter">
            BINGO GAME
          </h1>
        </div>
        
        <div className="flex flex-col items-center gap-3 mt-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} border border-black`}></div>
            <span className="font-mono text-sm font-bold uppercase">
              {isConnected ? 'LIVE CONNECTION' : 'DISCONNECTED'}
            </span>
          </div>
          
          {/* 統計資訊 */}
          <div className="flex gap-6 font-mono text-sm">
            <div className="flex items-center gap-2">
              <span className="font-bold">👥 線上人數:</span>
              <span className="bg-blue-500 text-white px-3 py-1 rounded-full font-bold">{onlineUsers}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">✅ 已選號碼:</span>
              <span className="bg-purple-500 text-white px-3 py-1 rounded-full font-bold">{selectedCount} / 75</span>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full flex-1 flex flex-col items-center gap-8">
        {/* 最新號碼顯示區 */}
        <div className="w-full max-w-md">
          <div className="bg-secondary border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 bg-black text-white px-2 py-1 font-mono text-xs font-bold">LATEST</div>
            <div className="text-8xl font-display text-secondary-foreground">
              {lastNumber || "--"}
            </div>
            <div className="font-mono font-bold mt-2 uppercase tracking-widest">Current Number</div>
          </div>
        </div>

        {/* 賓果盤 */}
        <div 
          className={`w-full bg-white border-4 border-black p-4 md:p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 ${
            showReminder ? 'animate-pulse-yellow' : ''
          }`}
          style={{
            animation: showReminder ? 'pulse-yellow 2s ease-in-out' : 'none'
          }}
        >
          <BingoBoard clickedNumbers={clickedNumbers} isAdmin={false} />
        </div>

        {/* 狀態回報按鈕 */}
        <div className="w-full max-w-4xl mt-8">
          <div className="bg-secondary border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="font-display text-2xl mb-4 uppercase text-center">狀態回報</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <button
                onClick={() => {
                  setSelectedStatus('差1個');
                  emitReportState('差1個');
                }}
                className={`px-4 py-3 font-mono font-bold border-2 border-black transition-all ${
                  selectedStatus === '差1個'
                    ? 'bg-yellow-400 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] scale-95'
                    : 'bg-white text-black hover:bg-yellow-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                }`}
              >
                🎯 我聽牌了！<br />(只差 1 個)
              </button>
              <button
                onClick={() => {
                  setSelectedStatus('差5個');
                  emitReportState('差5個');
                }}
                className={`px-4 py-3 font-mono font-bold border-2 border-black transition-all ${
                  selectedStatus === '差5個'
                    ? 'bg-blue-400 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] scale-95'
                    : 'bg-white text-black hover:bg-blue-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                }`}
              >
                📊 我差 5 個
              </button>
              <button
                onClick={() => {
                  setSelectedStatus('差10個');
                  emitReportState('差10個');
                }}
                className={`px-4 py-3 font-mono font-bold border-2 border-black transition-all ${
                  selectedStatus === '差10個'
                    ? 'bg-green-400 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] scale-95'
                    : 'bg-white text-black hover:bg-green-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                }`}
              >
                📈 我差 10 個
              </button>
              <button
                onClick={() => {
                  setSelectedStatus('差15個');
                  emitReportState('差15個');
                }}
                className={`px-4 py-3 font-mono font-bold border-2 border-black transition-all ${
                  selectedStatus === '差15個'
                    ? 'bg-purple-400 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] scale-95'
                    : 'bg-white text-black hover:bg-purple-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                }`}
              >
                📉 我差 15 個
              </button>
              <button
                onClick={() => {
                  setSelectedStatus(null);
                  emitReportState(null);
                }}
                className="px-4 py-3 font-mono font-bold border-2 border-black bg-red-500 text-white hover:bg-red-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                ❌ 取消回報
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-12 text-center font-mono text-sm opacity-60">
        <p>BINGO GAME SYSTEM // MANUS AI</p>
      </footer>
    </div>
  );
}
