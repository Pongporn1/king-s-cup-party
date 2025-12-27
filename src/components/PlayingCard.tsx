import {
  PlayingCard as CardType,
  SUIT_SYMBOLS,
  SUIT_COLORS,
  CARD_RULES,
  Suit,
} from "@/lib/cardRules";
import { cn } from "@/lib/utils";
import { CardBackPattern } from "./CardBackPattern";

interface PlayingCardProps {
  card: CardType | null;
  isFlipped?: boolean;
  size?: "sm" | "md" | "lg" | "large";
  showRule?: boolean;
}

// Component to render the suit pattern in the middle of the card
function CardPattern({ value, suit }: { value: string; suit: Suit }) {
  const symbol = SUIT_SYMBOLS[suit];
  const colorClass = SUIT_COLORS[suit];

  // Number of symbols based on card value
  const getPattern = () => {
    switch (value) {
      case "A":
        return (
          <div className="flex items-center justify-center h-full">
            <span className={cn("text-7xl sm:text-8xl", colorClass)}>
              {symbol}
            </span>
          </div>
        );
      case "2":
        return (
          <div className="flex flex-col justify-between items-center h-full py-4">
            <span className={cn("text-3xl sm:text-4xl", colorClass)}>
              {symbol}
            </span>
            <span className={cn("text-3xl sm:text-4xl rotate-180", colorClass)}>
              {symbol}
            </span>
          </div>
        );
      case "3":
        return (
          <div className="flex flex-col justify-between items-center h-full py-4">
            <span className={cn("text-3xl sm:text-4xl", colorClass)}>
              {symbol}
            </span>
            <span className={cn("text-3xl sm:text-4xl", colorClass)}>
              {symbol}
            </span>
            <span className={cn("text-3xl sm:text-4xl rotate-180", colorClass)}>
              {symbol}
            </span>
          </div>
        );
      case "4":
        return (
          <div className="grid grid-cols-2 gap-x-8 h-full py-4">
            <div className="flex flex-col justify-between items-center">
              <span className={cn("text-3xl sm:text-4xl", colorClass)}>
                {symbol}
              </span>
              <span
                className={cn("text-3xl sm:text-4xl rotate-180", colorClass)}
              >
                {symbol}
              </span>
            </div>
            <div className="flex flex-col justify-between items-center">
              <span className={cn("text-3xl sm:text-4xl", colorClass)}>
                {symbol}
              </span>
              <span
                className={cn("text-3xl sm:text-4xl rotate-180", colorClass)}
              >
                {symbol}
              </span>
            </div>
          </div>
        );
      case "5":
        return (
          <div className="grid grid-cols-2 gap-x-8 h-full py-4 relative">
            <div className="flex flex-col justify-between items-center">
              <span className={cn("text-3xl sm:text-4xl", colorClass)}>
                {symbol}
              </span>
              <span
                className={cn("text-3xl sm:text-4xl rotate-180", colorClass)}
              >
                {symbol}
              </span>
            </div>
            <div className="flex flex-col justify-between items-center">
              <span className={cn("text-3xl sm:text-4xl", colorClass)}>
                {symbol}
              </span>
              <span
                className={cn("text-3xl sm:text-4xl rotate-180", colorClass)}
              >
                {symbol}
              </span>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={cn("text-3xl sm:text-4xl", colorClass)}>
                {symbol}
              </span>
            </div>
          </div>
        );
      case "6":
        return (
          <div className="grid grid-cols-2 gap-x-8 h-full py-4">
            <div className="flex flex-col justify-between items-center">
              <span className={cn("text-2xl sm:text-3xl", colorClass)}>
                {symbol}
              </span>
              <span className={cn("text-2xl sm:text-3xl", colorClass)}>
                {symbol}
              </span>
              <span
                className={cn("text-2xl sm:text-3xl rotate-180", colorClass)}
              >
                {symbol}
              </span>
            </div>
            <div className="flex flex-col justify-between items-center">
              <span className={cn("text-2xl sm:text-3xl", colorClass)}>
                {symbol}
              </span>
              <span className={cn("text-2xl sm:text-3xl", colorClass)}>
                {symbol}
              </span>
              <span
                className={cn("text-2xl sm:text-3xl rotate-180", colorClass)}
              >
                {symbol}
              </span>
            </div>
          </div>
        );
      case "7":
        return (
          <div className="grid grid-cols-2 gap-x-8 h-full py-4 relative">
            <div className="flex flex-col justify-between items-center">
              <span className={cn("text-2xl sm:text-3xl", colorClass)}>
                {symbol}
              </span>
              <span className={cn("text-2xl sm:text-3xl", colorClass)}>
                {symbol}
              </span>
              <span
                className={cn("text-2xl sm:text-3xl rotate-180", colorClass)}
              >
                {symbol}
              </span>
            </div>
            <div className="flex flex-col justify-between items-center">
              <span className={cn("text-2xl sm:text-3xl", colorClass)}>
                {symbol}
              </span>
              <span className={cn("text-2xl sm:text-3xl", colorClass)}>
                {symbol}
              </span>
              <span
                className={cn("text-2xl sm:text-3xl rotate-180", colorClass)}
              >
                {symbol}
              </span>
            </div>
            <div className="absolute inset-x-0 top-1/3 flex items-center justify-center">
              <span className={cn("text-2xl sm:text-3xl", colorClass)}>
                {symbol}
              </span>
            </div>
          </div>
        );
      case "8":
        return (
          <div className="grid grid-cols-2 gap-x-8 h-full py-3 relative">
            <div className="flex flex-col justify-between items-center">
              <span className={cn("text-2xl sm:text-3xl", colorClass)}>
                {symbol}
              </span>
              <span className={cn("text-2xl sm:text-3xl", colorClass)}>
                {symbol}
              </span>
              <span
                className={cn("text-2xl sm:text-3xl rotate-180", colorClass)}
              >
                {symbol}
              </span>
            </div>
            <div className="flex flex-col justify-between items-center">
              <span className={cn("text-2xl sm:text-3xl", colorClass)}>
                {symbol}
              </span>
              <span className={cn("text-2xl sm:text-3xl", colorClass)}>
                {symbol}
              </span>
              <span
                className={cn("text-2xl sm:text-3xl rotate-180", colorClass)}
              >
                {symbol}
              </span>
            </div>
            <div className="absolute inset-x-0 top-[30%] flex items-center justify-center">
              <span className={cn("text-2xl sm:text-3xl", colorClass)}>
                {symbol}
              </span>
            </div>
            <div className="absolute inset-x-0 bottom-[30%] flex items-center justify-center">
              <span
                className={cn("text-2xl sm:text-3xl rotate-180", colorClass)}
              >
                {symbol}
              </span>
            </div>
          </div>
        );
      case "9":
        return (
          <div className="grid grid-cols-2 gap-x-6 h-full py-2 relative">
            <div className="flex flex-col justify-between items-center">
              <span className={cn("text-xl sm:text-2xl", colorClass)}>
                {symbol}
              </span>
              <span className={cn("text-xl sm:text-2xl", colorClass)}>
                {symbol}
              </span>
              <span
                className={cn("text-xl sm:text-2xl rotate-180", colorClass)}
              >
                {symbol}
              </span>
              <span
                className={cn("text-xl sm:text-2xl rotate-180", colorClass)}
              >
                {symbol}
              </span>
            </div>
            <div className="flex flex-col justify-between items-center">
              <span className={cn("text-xl sm:text-2xl", colorClass)}>
                {symbol}
              </span>
              <span className={cn("text-xl sm:text-2xl", colorClass)}>
                {symbol}
              </span>
              <span
                className={cn("text-xl sm:text-2xl rotate-180", colorClass)}
              >
                {symbol}
              </span>
              <span
                className={cn("text-xl sm:text-2xl rotate-180", colorClass)}
              >
                {symbol}
              </span>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={cn("text-xl sm:text-2xl", colorClass)}>
                {symbol}
              </span>
            </div>
          </div>
        );
      case "10":
        return (
          <div className="grid grid-cols-2 gap-x-6 h-full py-2 relative">
            <div className="flex flex-col justify-between items-center">
              <span className={cn("text-xl sm:text-2xl", colorClass)}>
                {symbol}
              </span>
              <span className={cn("text-xl sm:text-2xl", colorClass)}>
                {symbol}
              </span>
              <span
                className={cn("text-xl sm:text-2xl rotate-180", colorClass)}
              >
                {symbol}
              </span>
              <span
                className={cn("text-xl sm:text-2xl rotate-180", colorClass)}
              >
                {symbol}
              </span>
            </div>
            <div className="flex flex-col justify-between items-center">
              <span className={cn("text-xl sm:text-2xl", colorClass)}>
                {symbol}
              </span>
              <span className={cn("text-xl sm:text-2xl", colorClass)}>
                {symbol}
              </span>
              <span
                className={cn("text-xl sm:text-2xl rotate-180", colorClass)}
              >
                {symbol}
              </span>
              <span
                className={cn("text-xl sm:text-2xl rotate-180", colorClass)}
              >
                {symbol}
              </span>
            </div>
            <div className="absolute inset-x-0 top-[25%] flex items-center justify-center">
              <span className={cn("text-xl sm:text-2xl", colorClass)}>
                {symbol}
              </span>
            </div>
            <div className="absolute inset-x-0 bottom-[25%] flex items-center justify-center">
              <span
                className={cn("text-xl sm:text-2xl rotate-180", colorClass)}
              >
                {symbol}
              </span>
            </div>
          </div>
        );
      case "J":
      case "Q":
      case "K":
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <span
                className={cn("text-6xl sm:text-7xl font-bold", colorClass)}
              >
                {value}
              </span>
              <div className={cn("text-4xl sm:text-5xl mt-1", colorClass)}>
                {symbol}
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <span className={cn("text-6xl sm:text-7xl", colorClass)}>
              {symbol}
            </span>
          </div>
        );
    }
  };

  return getPattern();
}

export function PlayingCard({
  card,
  isFlipped = true,
  size = "lg",
  showRule = false,
}: PlayingCardProps) {
  const sizeClasses = {
    sm: "w-16 h-24",
    md: "w-24 h-36",
    lg: "w-32 h-48 sm:w-44 sm:h-64 md:w-52 md:h-72",
    large: "w-56 h-80 sm:w-72 sm:h-[26rem] md:w-80 md:h-[30rem]",
  };

  const fontSizes = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-xl sm:text-2xl md:text-3xl",
    large: "text-3xl sm:text-4xl md:text-5xl",
  };

  const symbolSizes = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-lg sm:text-xl md:text-2xl",
    large: "text-2xl sm:text-3xl md:text-4xl",
  };

  if (!card) {
    return (
      <div
        className={cn(
          sizeClasses[size],
          "rounded-xl bg-muted border-2 border-dashed border-border flex items-center justify-center"
        )}
      >
        <span className="text-muted-foreground text-3xl">?</span>
      </div>
    );
  }

  const rule = CARD_RULES[card.value];

  return (
    <div className="card-flip">
      <div
        className={cn(
          "card-inner relative",
          sizeClasses[size],
          isFlipped && "flipped"
        )}
      >
        {/* Card Back */}
        <div
          className={cn(
            "card-face rounded-xl overflow-hidden shadow-xl",
            sizeClasses[size]
          )}
        >
          <CardBackPattern />
        </div>

        {/* Card Front */}
        <div
          className={cn(
            "card-face card-back rounded-xl bg-paper border border-paper-border shadow-xl overflow-hidden",
            sizeClasses[size]
          )}
        >
          {/* Top Left Corner */}
          <div
            className={cn(
              "absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col items-center",
              SUIT_COLORS[card.suit]
            )}
          >
            <span className={cn("font-bold leading-none", fontSizes[size])}>
              {card.value}
            </span>
            <span className={cn("leading-none", symbolSizes[size])}>
              {SUIT_SYMBOLS[card.suit]}
            </span>
          </div>

          {/* Center Pattern */}
          <div className="absolute inset-0 px-8 py-10 sm:px-10 sm:py-12">
            <CardPattern value={card.value} suit={card.suit} />
          </div>

          {/* Bottom Right Corner (rotated) */}
          <div
            className={cn(
              "absolute bottom-2 right-2 sm:bottom-3 sm:right-3 flex flex-col items-center rotate-180",
              SUIT_COLORS[card.suit]
            )}
          >
            <span className={cn("font-bold leading-none", fontSizes[size])}>
              {card.value}
            </span>
            <span className={cn("leading-none", symbolSizes[size])}>
              {SUIT_SYMBOLS[card.suit]}
            </span>
          </div>
        </div>
      </div>

      {/* Rule Display */}
      {showRule && isFlipped && rule && (
        <div className="mt-6 text-center max-w-xs mx-auto">
          <div className="bg-black/40 backdrop-blur-md rounded-xl p-5 border border-white/10">
            <div className="text-4xl mb-3">{rule.emoji}</div>
            <h3 className="text-xl font-bold text-white mb-2">{rule.title}</h3>
            <p className="text-white/70">{rule.description}</p>
          </div>
        </div>
      )}
    </div>
  );
}
