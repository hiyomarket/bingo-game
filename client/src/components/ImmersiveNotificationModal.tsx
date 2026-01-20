import { useEffect, useState } from "react";

interface NotificationData {
  type: "manual_reminder" | "milestone";
  title: string;
  message: string;
  current_ball_count: number;
}

interface ImmersiveNotificationModalProps {
  data: NotificationData | null;
  onClose: () => void;
}

export default function ImmersiveNotificationModal({
  data,
  onClose,
}: ImmersiveNotificationModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (data) {
      setIsVisible(true);

      // 10 秒後自動關閉
      const timer = setTimeout(() => {
        handleClose();
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [data]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); // 等待動畫完成
  };

  if (!data) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-300 ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
      onClick={handleClose}
    >
      <div
        className={`bg-yellow-300 border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 max-w-md w-full mx-4 transform transition-all duration-300 ${
          isVisible ? "scale-100" : "scale-90"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 標題 */}
        <h2 className="text-3xl font-black font-mono text-center mb-4 text-black">
          {data.title}
        </h2>

        {/* 訊息 */}
        <p className="text-lg font-bold font-mono text-center mb-6 text-black">
          {data.message}
        </p>

        {/* 關鍵數據 */}
        <div className="bg-white border-4 border-black p-4 mb-6 text-center">
          <p className="text-xl font-black font-mono text-black">
            目前已開出{" "}
            <span className="text-3xl text-red-600">
              {data.current_ball_count}
            </span>{" "}
            球
          </p>
        </div>

        {/* 關閉按鈕 */}
        <button
          onClick={handleClose}
          className="w-full bg-green-400 hover:bg-green-500 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none hover:translate-y-1 active:translate-y-2 transition-all font-black font-mono text-xl py-3 text-black"
        >
          好的
        </button>
      </div>
    </div>
  );
}
