import { PlayingCard as CardType, SUIT_SYMBOLS, SUIT_COLORS, CARD_RULES } from '@/lib/cardRules';
import { cn } from '@/lib/utils';

interface PlayingCardProps {
  card: CardType | null;
  isFlipped?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showRule?: boolean;
}

export function PlayingCard({ card, isFlipped = true, size = 'lg', showRule = false }: PlayingCardProps) {
  const sizeClasses = {
    sm: 'w-16 h-24',
    md: 'w-24 h-36',
    lg: 'w-36 h-52 sm:w-44 sm:h-64'
  };

  const fontSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl sm:text-5xl'
  };

  const symbolSizes = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-5xl sm:text-6xl'
  };

  if (!card) {
    return (
      <div className={cn(
        sizeClasses[size],
        "rounded-xl bg-muted border-2 border-dashed border-border flex items-center justify-center"
      )}>
        <span className="text-muted-foreground text-3xl">?</span>
      </div>
    );
  }

  const rule = CARD_RULES[card.value];

  return (
    <div className="card-flip">
      <div className={cn(
        "card-inner relative",
        sizeClasses[size],
        isFlipped && "flipped"
      )}>
        {/* Card Back */}
        <div className={cn(
          "card-face rounded-xl flex items-center justify-center overflow-hidden border-2 border-border",
          sizeClasses[size],
          "bg-primary"
        )}>
          <div className="absolute inset-2 rounded-lg bg-card flex items-center justify-center">
            <div className="text-center">
              <span className="text-xl sm:text-2xl font-bold text-primary">ไผ่</span>
              <br />
              <span className="text-xs text-muted-foreground">โดเรม่อน</span>
            </div>
          </div>
        </div>

        {/* Card Front */}
        <div className={cn(
          "card-face card-back rounded-xl bg-white border-2 border-border shadow-lg overflow-hidden",
          sizeClasses[size]
        )}>
          <div className="absolute inset-0 p-3 flex flex-col">
            {/* Top Left */}
            <div className={cn("flex flex-col items-start leading-none", SUIT_COLORS[card.suit])}>
              <span className={cn("font-bold", fontSizes[size])}>{card.value}</span>
              <span className={symbolSizes[size]}>{SUIT_SYMBOLS[card.suit]}</span>
            </div>

            {/* Center Symbol */}
            <div className="flex-1 flex items-center justify-center">
              <span className={cn("text-6xl sm:text-7xl", SUIT_COLORS[card.suit])}>
                {SUIT_SYMBOLS[card.suit]}
              </span>
            </div>

            {/* Bottom Right (rotated) */}
            <div className={cn("flex flex-col items-end leading-none rotate-180", SUIT_COLORS[card.suit])}>
              <span className={cn("font-bold", fontSizes[size])}>{card.value}</span>
              <span className={symbolSizes[size]}>{SUIT_SYMBOLS[card.suit]}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rule Display */}
      {showRule && isFlipped && rule && (
        <div className="mt-6 text-center max-w-xs mx-auto">
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <div className="text-3xl mb-2">{rule.emoji}</div>
            <h3 className="text-lg font-semibold text-foreground mb-1">{rule.title}</h3>
            <p className="text-muted-foreground text-sm">{rule.description}</p>
          </div>
        </div>
      )}
    </div>
  );
}
