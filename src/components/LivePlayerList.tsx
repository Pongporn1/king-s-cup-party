import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { CardBackPattern } from "@/components/CardBackPattern";
import {
  PokDengCard,
  getSuitEmoji,
  getSuitColor,
  isPok,
  getSpecialHand,
} from "@/lib/pokDengRules";
import { motion } from "framer-motion";

interface LivePlayer {
  id: string;
  name: string;
  is_host: boolean;
  avatar?: number;
  cards?: PokDengCard[];
  points?: number;
  is_dealer?: boolean;
  has_drawn?: boolean;
  result?: string;
  multiplier?: number;
}

interface LivePlayerListProps {
  players: LivePlayer[];
  currentPlayerId?: string;
  showCards?: boolean;
  currentTurnPlayerId?: string;
  gamePhase?: string;
}

// Mini card for display in player list
function MiniCard({
  card,
  faceDown = false,
}: {
  card: PokDengCard;
  faceDown?: boolean;
}) {
  if (faceDown) {
    return (
      <div className="w-8 h-12 sm:w-10 sm:h-14 rounded-md shadow-md overflow-hidden relative">
        <CardBackPattern />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ rotateY: 180, scale: 0.8 }}
      animate={{ rotateY: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="w-8 h-12 sm:w-10 sm:h-14 rounded-md bg-white border border-gray-200 shadow-md flex flex-col items-center justify-center"
    >
      <span
        className={`text-xs sm:text-sm font-bold ${getSuitColor(card.suit)}`}
      >
        {card.value}
      </span>
      <span className="text-sm sm:text-base">{getSuitEmoji(card.suit)}</span>
    </motion.div>
  );
}

export function LivePlayerList({
  players,
  currentPlayerId,
  showCards = false,
  currentTurnPlayerId,
  gamePhase,
}: LivePlayerListProps) {
  return (
    <div className="bg-black/40 backdrop-blur-md rounded-xl p-3 sm:p-4 relative z-10 border border-white/10">
      <h3 className="text-xs sm:text-sm font-medium text-white/60 mb-2 sm:mb-3 flex items-center gap-2">
        <span className="text-white">📺 ผู้เล่น ({players.length})</span>
      </h3>
      {/* Horizontal scroll on all screens */}
      <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        {players.map((player) => {
          const isCurrentTurn = player.id === currentTurnPlayerId;
          const pok =
            player.cards && player.cards.length === 2
              ? isPok(player.cards)
              : { isPok: false, pokValue: null };
          const special =
            player.cards && player.cards.length > 0
              ? getSpecialHand(player.cards)
              : null;

          return (
            <div
              key={player.id}
              className={cn(
                "flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-3 rounded-xl text-xs sm:text-sm font-medium transition-all flex-shrink-0",
                player.is_dealer
                  ? "bg-amber-500/20 border-2 border-amber-500"
                  : isCurrentTurn
                  ? "bg-green-500/20 border-2 border-green-500 animate-pulse"
                  : player.id === currentPlayerId
                  ? "bg-white/20 ring-2 ring-white/50"
                  : "bg-white/10 text-white"
              )}
            >
              {/* Avatar + Name */}
              <div className="relative">
                <img
                  src={`${import.meta.env.BASE_URL}${player.avatar || 1}.jpg`}
                  alt={player.name}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-white/40 shadow-lg"
                />
                {player.is_host && (
                  <Crown className="w-4 h-4 text-amber-400 absolute -top-1 -right-1 drop-shadow-md" />
                )}
                {player.is_dealer && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] bg-amber-500 text-black px-1.5 rounded-full font-bold">
                    เจ้ามือ
                  </span>
                )}
              </div>

              <div className="text-center">
                <span className="text-white truncate max-w-[70px] sm:max-w-[80px] block">
                  {player.name}
                </span>
                {/* Status indicators */}
                {gamePhase === "drawing" && player.has_drawn && (
                  <span className="text-[10px] text-green-400">✓ พร้อม</span>
                )}
                {isCurrentTurn && (
                  <span className="text-[10px] text-green-300">🎴 ตาเล่น</span>
                )}
              </div>

              {/* Cards display */}
              {player.cards && player.cards.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {player.cards.map((card, i) => (
                    <MiniCard key={i} card={card} faceDown={!showCards} />
                  ))}
                </div>
              )}

              {/* Points and special hands */}
              {showCards && player.cards && player.cards.length > 0 && (
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-lg sm:text-xl font-bold text-amber-400">
                    {player.points}
                  </span>
                  {pok.isPok && pok.pokValue !== null && (
                    <span className="text-[9px] sm:text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded-full animate-bounce">
                      ป๊อก {pok.pokValue}!
                    </span>
                  )}
                  {special &&
                    special.type !== "normal" &&
                    !pok.isPok && (
                      <span className="text-[9px] sm:text-[10px] bg-purple-500 text-white px-1.5 py-0.5 rounded-full">
                        {special.name}
                      </span>
                    )}
                </div>
              )}

              {/* Result */}
              {player.result && showCards && (
                <span
                  className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full ${
                    player.result === "player_win"
                      ? "bg-green-500 text-white"
                      : player.is_dealer
                      ? "bg-amber-500 text-black"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {player.is_dealer
                    ? "เจ้ามือ"
                    : player.result === "player_win"
                    ? `🎉 ชนะ${player.multiplier && player.multiplier > 1 ? ` x${player.multiplier}` : ""}`
                    : "แพ้"}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
