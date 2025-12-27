import { cn } from '@/lib/utils';

interface CardDeckProps {
  cardsRemaining: number;
  onDraw: () => void;
  disabled?: boolean;
}

export function CardDeck({ cardsRemaining, onDraw, disabled }: CardDeckProps) {
  const stackCards = Math.min(cardsRemaining, 4);
  
  return (
    <div className="relative">
      {/* Card stack effect */}
      <div className="relative w-28 h-40 sm:w-36 sm:h-52">
        {Array.from({ length: stackCards }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "absolute w-full h-full rounded-xl bg-primary border-2 border-primary/80 transition-all duration-200",
              i === stackCards - 1 && !disabled && "hover:scale-[1.02] hover:-translate-y-1 cursor-pointer shadow-md"
            )}
            style={{
              top: `${i * -2}px`,
              left: `${i * 1}px`,
              zIndex: i,
            }}
            onClick={i === stackCards - 1 ? onDraw : undefined}
          >
            <div className="absolute inset-1.5 rounded-lg bg-card flex items-center justify-center">
              <div className="text-center">
                <span className="text-lg sm:text-xl font-bold text-primary">ไผ่</span>
                <br />
                <span className="text-xs text-muted-foreground">โดเรม่อน</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cards remaining badge */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-card border border-border text-sm font-medium shadow-sm">
        <span className="text-primary">{cardsRemaining}</span>
        <span className="text-muted-foreground"> ใบ</span>
      </div>
    </div>
  );
}
