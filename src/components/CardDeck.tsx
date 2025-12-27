import { cn } from '@/lib/utils';

interface CardDeckProps {
  cardsRemaining: number;
  onDraw: () => void;
  disabled?: boolean;
}

export function CardDeck({ cardsRemaining, onDraw, disabled }: CardDeckProps) {
  const stackCards = Math.min(cardsRemaining, 5);
  
  return (
    <div className="relative">
      {/* Card stack effect */}
      <div className="relative w-32 h-48 sm:w-40 sm:h-60">
        {Array.from({ length: stackCards }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "absolute w-full h-full rounded-2xl bg-gradient-to-br from-primary via-neon-purple to-secondary transition-transform duration-300",
              i === stackCards - 1 && !disabled && "hover:scale-105 cursor-pointer pulse-glow"
            )}
            style={{
              top: `${i * -3}px`,
              left: `${i * 2}px`,
              zIndex: i,
            }}
            onClick={i === stackCards - 1 ? onDraw : undefined}
          >
            <div className="absolute inset-2 rounded-xl bg-card/90 flex items-center justify-center">
              <div className="text-center">
                <span className="font-orbitron text-xl sm:text-2xl font-bold neon-text-pink">ไผ่</span>
                <br />
                <span className="font-orbitron text-xs text-muted-foreground">โดเรม่อน</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cards remaining badge */}
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-card border border-border text-sm font-semibold">
        <span className="neon-text-cyan">{cardsRemaining}</span>
        <span className="text-muted-foreground"> ใบ</span>
      </div>
    </div>
  );
}
