import { User, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Player {
  id: string;
  name: string;
  is_host: boolean;
  avatar?: number;
}

interface PlayerListProps {
  players: Player[];
  currentPlayerId?: string;
}

export function PlayerList({ players, currentPlayerId }: PlayerListProps) {
  return (
    <div className="bg-black/40 backdrop-blur-md rounded-xl p-3 sm:p-4 relative z-10 border border-white/10">
      <h3 className="text-xs sm:text-sm font-medium text-white/60 mb-2 sm:mb-3 flex items-center gap-2">
        <User className="w-3 h-3 sm:w-4 sm:h-4 text-white/60" />
        <span className="text-white">ผู้เล่น ({players.length})</span>
      </h3>
      {/* Mobile: horizontal scroll, Tablet/Desktop: wrap */}
      <div className="flex gap-2 sm:gap-3 overflow-x-auto sm:flex-wrap sm:overflow-visible pb-2 sm:pb-0 -mx-1 px-1 scrollbar-hide">
        {players.map((player) => (
          <div
            key={player.id}
            className={cn(
              "flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-3 rounded-xl text-xs sm:text-sm font-medium transition-all flex-shrink-0 min-w-[70px] sm:min-w-[90px]",
              player.id === currentPlayerId
                ? "bg-white text-black ring-2 ring-amber-400"
                : "bg-white/10 text-white hover:bg-white/20"
            )}
          >
            {/* Avatar - bigger */}
            <div className="relative">
              <img
                src={`${import.meta.env.BASE_URL}${player.avatar || 1}.jpg`}
                alt={player.name}
                className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full object-cover border-2 sm:border-3 border-white/40 shadow-lg"
              />
              {player.is_host && (
                <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 absolute -top-1 -right-1 drop-shadow-md" />
              )}
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="truncate max-w-[60px] sm:max-w-[80px]">
                {player.name}
              </span>
              {player.id === currentPlayerId && (
                <span className="text-[10px] sm:text-xs opacity-60">(คุณ)</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
