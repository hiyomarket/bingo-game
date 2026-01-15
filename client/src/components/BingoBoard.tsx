import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface BingoBoardProps {
  isAdmin?: boolean;
  clickedNumbers: Set<number>;
  onNumberClick?: (number: number) => void;
  onNumberDoubleClick?: (number: number) => void;
}

export function BingoBoard({ isAdmin = false, clickedNumbers, onNumberClick, onNumberDoubleClick }: BingoBoardProps) {
  const [lastClicked, setLastClicked] = useState<number | null>(null);

  // 監聽 clickedNumbers 的變化，找出最新被點擊的號碼
  useEffect(() => {
    if (clickedNumbers.size > 0) {
      // 將 Set 轉換為 Array 並取最後一個元素作為最新點擊的號碼
      // 注意：Set 不保證順序，但在這個簡單的應用中，我們假設最新添加的在最後
      // 更嚴謹的做法是後端傳送最新點擊的號碼
      const numbers = Array.from(clickedNumbers);
      setLastClicked(numbers[numbers.length - 1]);
    }
  }, [clickedNumbers]);

  const handleNumberClick = (number: number) => {
    if (isAdmin && onNumberClick && !clickedNumbers.has(number)) {
      onNumberClick(number);
    }
  };

  const handleNumberDoubleClick = (number: number) => {
    if (isAdmin && onNumberDoubleClick && clickedNumbers.has(number)) {
      onNumberDoubleClick(number);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 sm:gap-3 md:gap-4">
        {Array.from({ length: 75 }, (_, i) => i + 1).map((number) => {
          const isClicked = clickedNumbers.has(number);
          const isLastClicked = number === lastClicked;

          return (
            <div
              key={number}
              onClick={() => handleNumberClick(number)}
              onDoubleClick={() => handleNumberDoubleClick(number)}
              className={cn(
                "aspect-square flex items-center justify-center text-lg sm:text-xl md:text-2xl font-mono font-bold border-2 border-border transition-all duration-200 select-none",
                isAdmin ? "cursor-pointer hover:bg-gray-100 active:translate-y-1 active:shadow-none" : "cursor-default",
                isClicked 
                  ? "bg-primary text-primary-foreground shadow-[2px_2px_0px_0px_var(--color-border)] translate-x-[2px] translate-y-[2px]" 
                  : "bg-white shadow-[4px_4px_0px_0px_var(--color-border)]",
                isLastClicked && "animate-pulse ring-4 ring-accent ring-offset-2",
                isAdmin && !isClicked && "hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_var(--color-border)]"
              )}
            >
              {number}
            </div>
          );
        })}
      </div>
    </div>
  );
}
