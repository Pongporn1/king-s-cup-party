import { cn } from '@/lib/utils';

interface CardDeckProps {
  cardsRemaining: number;
  onDraw: () => void;
  disabled?: boolean;
}

export function CardDeck({ cardsRemaining, onDraw, disabled }: CardDeckProps) {
  const stackCards = Math.min(cardsRemaining, 5);
  
  if (cardsRemaining === 0) {
    return (
      <div className="relative w-32 h-44 sm:w-40 sm:h-56 rounded-2xl border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
        <span className="text-muted-foreground text-lg">หมดแล้ว</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Card stack effect */}
      <div className="relative w-32 h-44 sm:w-40 sm:h-56">
        {Array.from({ length: stackCards }).map((_, i) => {
          const isTop = i === stackCards - 1;
          return (
            <div
              key={i}
              className={cn(
                "absolute w-full h-full rounded-2xl transition-all duration-200",
                "bg-primary shadow-lg",
                isTop && !disabled && "hover:scale-[1.02] hover:-translate-y-2 cursor-pointer"
              )}
              style={{
                top: `${(stackCards - 1 - i) * 3}px`,
                left: `${(stackCards - 1 - i) * -1}px`,
                zIndex: i,
                opacity: isTop ? 1 : 0.9 - (stackCards - 1 - i) * 0.15
              }}
              onClick={isTop && !disabled ? onDraw : undefined}
            >
              {/* Inner white card */}
              <div className="absolute inset-2 rounded-xl bg-white flex items-center justify-center">
                <div className="text-center">
                  <span className="text-xl sm:text-2xl font-bold text-primary">ไผ่</span>
                  <br />
                  <span className="text-xs sm:text-sm text-primary/70">โดเรม่อน</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cards remaining badge */}
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-card border border-border text-sm font-medium shadow-md">
        <span className="text-primary font-semibold">{cardsRemaining}</span>
        <span className="text-muted-foreground"> ใบ</span>
      </div>
    </div>
  );
}
