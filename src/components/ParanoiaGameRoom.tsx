import { ParanoiaState } from '@/lib/partyGameTypes';
import { ParanoiaGame } from '@/components/ParanoiaGame';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import ThemedBackground from '@/components/ThemedBackground';

interface Player {
  id: string;
  name: string;
  is_host: boolean;
}

interface Room {
  id: string;
  code: string;
  game_started: boolean;
  game_state: ParanoiaState | null;
}

interface ParanoiaGameRoomProps {
  room: Room;
  players: Player[];
  currentPlayerId: string | null;
  isHost: boolean;
  onStartGame: () => void;
  onStartRound: () => void;
  onSelectVictim: (victimId: string) => void;
  onRevealQuestion: () => void;
  onSkipQuestion: () => void;
  onLeave: () => void;
}

export function ParanoiaGameRoom({
  room,
  players,
  currentPlayerId,
  isHost,
  onStartGame,
  onStartRound,
  onSelectVictim,
  onRevealQuestion,
  onSkipQuestion,
  onLeave,
}: ParanoiaGameRoomProps) {
  const gameState = room.game_state as ParanoiaState | null;

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col p-4 relative">
      <ThemedBackground />

      {/* Header */}
      <div className="flex justify-between items-center mb-4 relative z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={onLeave}
          className="text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          ออก
        </Button>
        <div className="text-white text-center">
          <p className="text-sm opacity-70">รหัสห้อง</p>
          <p className="font-mono font-bold">{room.code}</p>
        </div>
        <div className="flex items-center gap-1 text-white">
          <Users className="w-4 h-4" />
          <span>{players.length}</span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10">
        {!room.game_started ? (
          // Waiting room
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm"
          >
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">🤫</div>
              <h2 className="text-2xl font-bold text-white">Paranoia</h2>
              <p className="text-white/70">รอผู้เล่นเข้าร่วม...</p>
            </div>

            {/* Player list */}
            <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 mb-6 border border-white/10">
              <p className="text-white/70 text-sm mb-3">ผู้เล่นในห้อง:</p>
              <div className="space-y-2">
                {players.map((player, index) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-2 text-white"
                  >
                    <span className="text-lg">
                      {player.is_host ? '👑' : '👤'}
                    </span>
                    <span>{player.name}</span>
                    {player.id === currentPlayerId && (
                      <span className="text-xs text-yellow-400">(คุณ)</span>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Start button */}
            {isHost && players.length >= 3 && (
              <Button
                onClick={onStartGame}
                className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 py-6 text-lg"
              >
                <Play className="w-5 h-5 mr-2" />
                เริ่มเกม
              </Button>
            )}

            {isHost && players.length < 3 && (
              <p className="text-center text-white/60 text-sm">
                ต้องการผู้เล่นอย่างน้อย 3 คน
              </p>
            )}

            {!isHost && (
              <p className="text-center text-white/60 text-sm">
                รอ Host เริ่มเกม...
              </p>
            )}
          </motion.div>
        ) : gameState ? (
          // Game in progress
          <div className="w-full max-w-sm">
            <ParanoiaGame
              gameState={gameState}
              myId={currentPlayerId || ''}
              players={players}
              onSelectVictim={onSelectVictim}
              onRevealQuestion={onRevealQuestion}
              onSkipQuestion={onSkipQuestion}
              onNextRound={onStartRound}
            />
          </div>
        ) : (
          // Loading state
          <div className="text-white text-center">
            <div className="text-4xl mb-4 animate-pulse">🎲</div>
            <p>กำลังเริ่มเกม...</p>
          </div>
        )}
      </div>
    </div>
  );
}
