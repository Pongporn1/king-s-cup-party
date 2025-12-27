import { User, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Player {
  id: string;
  name: string;
  is_host: boolean;
}

interface PlayerListProps {
  players: Player[];
  currentPlayerId?: string;
}

export function PlayerList({ players, currentPlayerId }: PlayerListProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
      <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
        <User className="w-4 h-4" />
        ผู้เล่น ({players.length})
      </h3>
      <div className="flex flex-wrap gap-2">
        {players.map((player) => (
          <div
            key={player.id}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
              player.id === currentPlayerId
                ? "bg-primary/10 text-primary border border-primary/30"
                : "bg-muted text-foreground"
            )}
          >
            {player.is_host && (
              <Crown className="w-3.5 h-3.5 text-amber-500" />
            )}
            <span>{player.name}</span>
            {player.id === currentPlayerId && (
              <span className="text-xs text-muted-foreground">(คุณ)</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
