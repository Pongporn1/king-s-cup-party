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
    lg: 'w-40 h-56 sm:w-48 sm:h-68'
  };

  const fontSizes = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-5xl sm:text-6xl'
  };

  const symbolSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl sm:text-4xl'
  };

  const centerSymbolSizes = {
    sm: 'text-3xl',
    md: 'text-5xl',
    lg: 'text-7xl sm:text-8xl'
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
          "card-face rounded-2xl flex items-center justify-center overflow-hidden",
          sizeClasses[size],
          "bg-primary shadow-xl"
        )}>
          <div className="absolute inset-2 rounded-xl bg-white flex items-center justify-center">
            <div className="text-center">
              <span className="text-2xl sm:text-3xl font-bold text-primary">ไผ่</span>
              <br />
              <span className="text-sm text-primary/70">โดเรม่อน</span>
            </div>
          </div>
        </div>

        {/* Card Front */}
        <div className={cn(
          "card-face card-back rounded-2xl bg-white shadow-xl overflow-hidden",
          sizeClasses[size]
        )}>
          <div className="absolute inset-0 p-4 flex flex-col justify-between">
            {/* Top Left - Value and Symbol */}
            <div className={cn("flex flex-col items-start leading-tight", SUIT_COLORS[card.suit])}>
              <span className={cn("font-bold leading-none", fontSizes[size])}>{card.value}</span>
              <span className={cn("leading-none mt-0.5", symbolSizes[size])}>{SUIT_SYMBOLS[card.suit]}</span>
            </div>

            {/* Center Symbol */}
            <div className="flex items-center justify-center flex-1">
              <span className={cn(centerSymbolSizes[size], SUIT_COLORS[card.suit])}>
                {SUIT_SYMBOLS[card.suit]}
              </span>
            </div>

            {/* Bottom Right - Rotated Value and Symbol */}
            <div className={cn("flex flex-col items-end leading-tight rotate-180", SUIT_COLORS[card.suit])}>
              <span className={cn("font-bold leading-none", fontSizes[size])}>{card.value}</span>
              <span className={cn("leading-none mt-0.5", symbolSizes[size])}>{SUIT_SYMBOLS[card.suit]}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rule Display */}
      {showRule && isFlipped && rule && (
        <div className="mt-6 text-center max-w-xs mx-auto">
          <div className="bg-card border border-border rounded-xl p-4 shadow-lg">
            <div className="text-3xl mb-2">{rule.emoji}</div>
            <h3 className="text-lg font-semibold text-foreground mb-1">{rule.title}</h3>
            <p className="text-muted-foreground text-sm">{rule.description}</p>
          </div>
        </div>
      )}
    </div>
  );
}
