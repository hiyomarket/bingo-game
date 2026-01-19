import React, { useState } from 'react';

interface NicknameModalProps {
  onSubmit: (nickname: string) => void;
}

export default function NicknameModal({ onSubmit }: NicknameModalProps) {
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const trimmedNickname = nickname.trim();
    
    if (!trimmedNickname) {
      setError('請輸入暱稱才能進入遊戲！');
      return;
    }

    if (trimmedNickname.length > 20) {
      setError('暱稱不能超過 20 個字元！');
      return;
    }

    // 儲存到 localStorage
    localStorage.setItem('bingo_player_name', trimmedNickname);
    
    // 通知父組件
    onSubmit(trimmedNickname);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
        {/* 標題 */}
        <h2 className="font-display text-3xl mb-2 uppercase text-center">
          歡迎來到
        </h2>
        <h1 className="font-display text-4xl mb-6 uppercase text-center bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
          BINGO GAME!
        </h1>

        {/* 說明文字 */}
        <p className="font-mono text-sm mb-6 text-center text-gray-700">
          請輸入您的遊戲暱稱，讓主持人知道您是誰 🎯
        </p>

        {/* 輸入框 */}
        <input
          type="text"
          value={nickname}
          onChange={(e) => {
            setNickname(e.target.value);
            setError('');
          }}
          onKeyPress={handleKeyPress}
          placeholder="請輸入您的遊戲暱稱"
          maxLength={20}
          className="w-full px-4 py-3 mb-2 font-mono border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
          autoFocus
        />

        {/* 字數提示 */}
        <p className="font-mono text-xs text-gray-500 mb-4 text-right">
          {nickname.length} / 20
        </p>

        {/* 錯誤訊息 */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border-2 border-red-500 text-red-700 font-mono text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* 提交按鈕 */}
        <button
          onClick={handleSubmit}
          className="w-full px-6 py-4 font-display text-xl uppercase border-4 border-black bg-gradient-to-r from-orange-400 to-orange-600 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] transition-all"
        >
          🎮 進入遊戲
        </button>

        {/* 提示文字 */}
        <p className="font-mono text-xs text-gray-500 mt-4 text-center">
          暱稱將儲存在您的瀏覽器中，下次無需再輸入
        </p>
      </div>
    </div>
  );
}
