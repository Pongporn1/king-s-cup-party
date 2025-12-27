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
    <div className="glass-card p-4">
      <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
        <User className="w-4 h-4" />
        ผู้เล่น ({players.length})
      </h3>
      <div className="flex flex-wrap gap-2">
        {players.map((player) => (
          <div
            key={player.id}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300",
              player.id === currentPlayerId
                ? "bg-primary/20 border border-primary/50 text-primary"
                : "bg-muted/50 text-foreground"
            )}
          >
            {player.is_host && (
              <Crown className="w-4 h-4 text-neon-yellow" />
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
