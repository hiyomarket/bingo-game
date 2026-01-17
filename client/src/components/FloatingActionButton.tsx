import React, { useState } from 'react';

interface FloatingActionButtonProps {
  onReportState: (status: string | null) => void;
}

export default function FloatingActionButton({ onReportState }: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const statusOptions = [
    { status: '差1個', label: '🎯 我聽牌了！', color: 'bg-yellow-100 hover:bg-yellow-200 border-yellow-400' },
    { status: '差3個', label: '📊 我差 3 個', color: 'bg-blue-100 hover:bg-blue-200 border-blue-400' },
    { status: '差5個', label: '📈 我差 5 個', color: 'bg-green-100 hover:bg-green-200 border-green-400' },
    { status: '差8個', label: '📉 我差 8 個', color: 'bg-purple-100 hover:bg-purple-200 border-purple-400' },
    { status: null, label: '❌ 取消回報', color: 'bg-red-100 hover:bg-red-200 border-red-400' },
  ];

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (status: string | null) => {
    setSelectedStatus(status);
    onReportState(status);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col-reverse items-end gap-3">
      {/* 選項按鈕 */}
      {isOpen && statusOptions.map((option, index) => (
        <button
          key={option.status || 'cancel'}
          onClick={() => handleOptionClick(option.status)}
          className={`
            w-44 h-12 rounded-lg border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
            ${option.color}
            font-bold text-sm
            transform transition-all duration-300 ease-out
            hover:translate-x-[-2px] hover:translate-y-[-2px]
            hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
            active:translate-x-[2px] active:translate-y-[2px]
            active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
            ${selectedStatus === option.status ? 'ring-4 ring-offset-2 ring-black' : ''}
          `}
          style={{
            animation: `slideUp 0.3s ease-out ${index * 0.05}s both`
          }}
        >
          {option.label}
        </button>
      ))}

      {/* 主按鈕 */}
      <button
        onClick={handleToggle}
        className={`
          w-16 h-16 rounded-full border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
          bg-gradient-to-br from-orange-400 to-orange-600
          font-bold text-2xl text-white
          transform transition-all duration-300
          hover:scale-110 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
          active:scale-95 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
          ${isOpen ? 'rotate-45' : 'rotate-0'}
        `}
      >
        {isOpen ? '✕' : '📊'}
      </button>

      {/* 動畫樣式 */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
