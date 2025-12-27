import { cn } from '@/lib/utils';
import { useMemo } from 'react';

interface CardDeckProps {
  cardsRemaining: number;
  onDraw: () => void;
  disabled?: boolean;
}

export function CardDeck({ cardsRemaining, onDraw, disabled }: CardDeckProps) {
  // Generate random rotations for realistic deck look
  const cardRotations = useMemo(() => {
    return Array.from({ length: 8 }).map(() => ({
      rotation: (Math.random() - 0.5) * 6, // -3 to 3 degrees
      offsetX: (Math.random() - 0.5) * 4,  // -2 to 2 px
      offsetY: (Math.random() - 0.5) * 2,  // -1 to 1 px
    }));
  }, []);

  const stackCards = Math.min(Math.ceil(cardsRemaining / 7), 8);
  
  if (cardsRemaining === 0) {
    return (
      <div className="relative w-36 h-52 sm:w-44 sm:h-64 rounded-xl border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
        <span className="text-muted-foreground text-lg">หมดแล้ว</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Card stack effect */}
      <div className="relative w-36 h-52 sm:w-44 sm:h-64">
        {Array.from({ length: stackCards }).map((_, i) => {
          const isTop = i === stackCards - 1;
          const rotation = cardRotations[i];
          
          return (
            <div
              key={i}
              className={cn(
                "absolute w-full h-full rounded-xl transition-all duration-200",
                "bg-primary border-4 border-primary shadow-md",
                isTop && !disabled && "hover:scale-[1.02] hover:-translate-y-2 cursor-pointer hover:shadow-xl"
              )}
              style={{
                bottom: `${i * 2}px`,
                transform: `rotate(${rotation.rotation}deg) translateX(${rotation.offsetX}px)`,
                zIndex: i,
              }}
              onClick={isTop && !disabled ? onDraw : undefined}
            >
              {/* Inner white card with pattern */}
              <div className="absolute inset-1 rounded-lg bg-white flex items-center justify-center overflow-hidden">
                {/* Decorative border */}
                <div className="absolute inset-2 rounded border-2 border-primary/20" />
                
                {/* Center design */}
                <div className="text-center z-10">
                  <span className="text-xl sm:text-2xl font-bold text-primary">ไผ่</span>
                  <br />
                  <span className="text-xs sm:text-sm text-primary/60">โดเรม่อน</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cards remaining badge */}
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-card border border-border text-sm font-medium shadow-lg">
        <span className="text-primary font-semibold">{cardsRemaining}</span>
        <span className="text-muted-foreground"> ใบ</span>
      </div>
    </div>
  );
}
