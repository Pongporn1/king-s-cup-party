import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlayingCard } from '@/components/PlayingCard';
import { PlayerList } from '@/components/PlayerList';
import { CardDeck } from '@/components/CardDeck';
import { PlayingCard as CardType } from '@/lib/cardRules';
import { Copy, LogOut, Play, RefreshCw, Spade } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Room {
  id: string;
  code: string;
  host_name: string;
  is_active: boolean;
  deck: CardType[];
  current_card: CardType | null;
  cards_remaining: number;
  game_started: boolean;
}

interface Player {
  id: string;
  room_id: string;
  name: string;
  is_host: boolean;
  is_active: boolean;
}

interface GameRoomProps {
  room: Room;
  players: Player[];
  currentPlayerId: string | null;
  isHost: boolean;
  onStartGame: () => void;
  onDrawCard: () => void;
  onReshuffle: () => void;
  onLeave: () => void;
}

export function GameRoom({
  room,
  players,
  currentPlayerId,
  isHost,
  onStartGame,
  onDrawCard,
  onReshuffle,
  onLeave
}: GameRoomProps) {
  const { toast } = useToast();
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(room.code);
    toast({
      title: 'คัดลอกแล้ว!',
      description: 'รหัสห้องถูกคัดลอกแล้ว'
    });
  };

  const handleDrawCard = () => {
    if (room.cards_remaining === 0) return;
    setIsCardFlipped(false);
    setTimeout(() => {
      onDrawCard();
      setTimeout(() => setIsCardFlipped(true), 100);
    }, 100);
  };

  const gameOver = room.cards_remaining === 0 && room.current_card !== null;

  return (
    <div className="min-h-screen flex flex-col p-4 sm:p-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onLeave}
            className="text-muted-foreground hover:text-destructive"
          >
            <LogOut className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Spade className="w-4 h-4 text-primary" />
              <h1 className="font-semibold text-foreground">ไผ่โดเรม่อน</h1>
            </div>
            <button
              onClick={copyRoomCode}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <span className="font-mono">{room.code}</span>
              <Copy className="w-3 h-3" />
            </button>
          </div>
        </div>

        {isHost && !room.game_started && (
          <Button variant="default" onClick={onStartGame} disabled={players.length < 2}>
            <Play className="w-4 h-4" />
            เริ่มเกม
          </Button>
        )}
      </header>

      {/* Player List */}
      <PlayerList players={players} currentPlayerId={currentPlayerId ?? undefined} />

      {/* Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center py-8">
        {!room.game_started ? (
          <div className="text-center">
            <div className="bg-card border border-border rounded-2xl p-8 mb-6 shadow-lg">
              <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <Spade className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-xl font-semibold mb-2">รอผู้เล่น...</h2>
              <p className="text-muted-foreground text-sm">
                {isHost 
                  ? 'แชร์รหัสห้องให้เพื่อนๆ แล้วกด "เริ่มเกม"'
                  : 'รอ Host เริ่มเกม'
                }
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-4 inline-block shadow-lg">
              <p className="text-xs text-muted-foreground mb-1">รหัสห้อง</p>
              <button
                onClick={copyRoomCode}
                className="font-mono text-3xl font-bold text-primary tracking-widest hover:opacity-80 transition-opacity"
              >
                {room.code}
              </button>
            </div>
          </div>
        ) : gameOver ? (
          <div className="text-center">
            <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-foreground mb-2">จบเกม!</h2>
              <p className="text-muted-foreground mb-6">ไพ่หมดแล้ว</p>
              {isHost && (
                <Button variant="default" size="lg" onClick={onReshuffle}>
                  <RefreshCw className="w-5 h-5" />
                  เล่นรอบใหม่
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-8">
            {/* Current Card */}
            {room.current_card ? (
              <div>
                <PlayingCard 
                  card={room.current_card} 
                  isFlipped={isCardFlipped}
                  showRule
                />
              </div>
            ) : (
              <div className="text-center mb-4">
                <p className="text-muted-foreground">กดที่กองไพ่เพื่อจั่ว</p>
              </div>
            )}

            {/* Draw Area */}
            <div className="flex flex-col items-center gap-6">
              <CardDeck 
                cardsRemaining={room.cards_remaining}
                onDraw={handleDrawCard}
                disabled={room.cards_remaining === 0}
              />

              <Button
                variant="default"
                size="xl"
                onClick={handleDrawCard}
                disabled={room.cards_remaining === 0}
                className="mt-2"
              >
                <Spade className="w-5 h-5" />
                จั่วไพ่
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
