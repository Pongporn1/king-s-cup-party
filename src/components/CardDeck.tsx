import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { CardBackPattern } from "./CardBackPattern";
interface CardDeckProps {
  cardsRemaining: number;
  onDraw: () => void;
  disabled?: boolean;
  showCount?: boolean;
}
export function CardDeck({
  cardsRemaining,
  onDraw,
  disabled,
  showCount = true,
}: CardDeckProps) {
  // Generate random rotations for realistic deck look
  const cardRotations = useMemo(() => {
    return Array.from({
      length: 8,
    }).map(() => ({
      rotation: (Math.random() - 0.5) * 6,
      // -3 to 3 degrees
      offsetX: (Math.random() - 0.5) * 4,
      // -2 to 2 px
      offsetY: (Math.random() - 0.5) * 2, // -1 to 1 px
    }));
  }, []);
  const stackCards = Math.min(Math.ceil(cardsRemaining / 7), 8);
  if (cardsRemaining === 0) {
    return (
      <div className="relative w-28 h-40 sm:w-36 sm:h-52 md:w-44 md:h-64 rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center bg-black/20 backdrop-blur-sm">
        <span className="text-white/50 text-sm sm:text-lg">หมดแล้ว</span>
      </div>
    );
  }
  return (
    <div className="relative">
      {/* Card stack effect */}
      <div className="relative w-28 h-40 sm:w-36 sm:h-52 md:w-44 md:h-64">
        {Array.from({
          length: stackCards,
        }).map((_, i) => {
          const isTop = i === stackCards - 1;
          const rotation = cardRotations[i];
          return (
            <div
              key={i}
              className={cn(
                "absolute w-full h-full rounded-xl transition-all duration-200 overflow-hidden",
                "shadow-lg",
                isTop &&
                  !disabled &&
                  "hover:scale-[1.03] hover:-translate-y-2 cursor-pointer hover:shadow-xl"
              )}
              style={{
                bottom: `${i * 2}px`,
                transform: `rotate(${rotation.rotation}deg) translateX(${rotation.offsetX}px)`,
                zIndex: i,
              }}
              onClick={isTop && !disabled ? onDraw : undefined}
            >
              <CardBackPattern />
            </div>
          );
        })}
      </div>

      {/* Cards remaining badge - only show if showCount is true */}
      {showCount && (
        <div className="absolute -top-8 sm:-top-10 left-1/2 -translate-x-1/2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-black/60 backdrop-blur-sm text-xs sm:text-sm font-medium border border-white/10 z-20">
          <span className="text-lg sm:text-xl font-bold text-white">
            {cardsRemaining}
          </span>
          <span className="text-white/60 ml-1">ใบ</span>
        </div>
      )}
    </div>
  );
}
