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
    lg: 'w-40 h-60 sm:w-48 sm:h-72'
  };

  const fontSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-5xl sm:text-6xl'
  };

  const symbolSizes = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl sm:text-7xl'
  };

  if (!card) {
    return (
      <div className={cn(
        sizeClasses[size],
        "rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-dashed border-muted-foreground/30 flex items-center justify-center"
      )}>
        <span className="text-muted-foreground text-4xl">?</span>
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
          "bg-gradient-to-br from-primary via-neon-purple to-secondary"
        )}>
          <div className="absolute inset-2 rounded-xl bg-card/90 flex items-center justify-center">
            <div className="text-center">
              <span className="font-orbitron text-2xl sm:text-3xl font-bold neon-text-pink">ไผ่</span>
              <br />
              <span className="font-orbitron text-xs sm:text-sm text-muted-foreground">โดเรม่อน</span>
            </div>
          </div>
        </div>

        {/* Card Front */}
        <div className={cn(
          "card-face card-back rounded-2xl bg-gradient-to-br from-white to-gray-100 shadow-2xl overflow-hidden",
          sizeClasses[size]
        )}>
          <div className="absolute inset-0 p-3 sm:p-4 flex flex-col">
            {/* Top Left */}
            <div className={cn("flex flex-col items-start leading-none", SUIT_COLORS[card.suit])}>
              <span className={cn("font-bold", fontSizes[size])}>{card.value}</span>
              <span className={symbolSizes[size]}>{SUIT_SYMBOLS[card.suit]}</span>
            </div>

            {/* Center Symbol */}
            <div className="flex-1 flex items-center justify-center">
              <span className={cn("text-7xl sm:text-8xl", SUIT_COLORS[card.suit])}>
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
        <div className="mt-6 sm:mt-8 animate-fade-in text-center max-w-sm mx-auto">
          <div className="glass-card p-4 sm:p-6">
            <div className="text-4xl sm:text-5xl mb-3">{rule.emoji}</div>
            <h3 className="text-xl sm:text-2xl font-bold neon-text-pink mb-2">{rule.title}</h3>
            <p className="text-muted-foreground text-sm sm:text-base">{rule.description}</p>
          </div>
        </div>
      )}
    </div>
  );
}
