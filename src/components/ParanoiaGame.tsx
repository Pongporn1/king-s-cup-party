import { ParanoiaState } from '@/lib/partyGameTypes';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface Player {
  id: string;
  name: string;
}

interface ParanoiaGameProps {
  gameState: ParanoiaState;
  myId: string;
  players: Player[];
  onSelectVictim: (victimId: string) => void;
  onRevealQuestion: () => void;
  onSkipQuestion: () => void;
  onNextRound: () => void;
}

export function ParanoiaGame({
  gameState,
  myId,
  players,
  onSelectVictim,
  onRevealQuestion,
  onSkipQuestion,
  onNextRound,
}: ParanoiaGameProps) {
  const isAsker = myId === gameState.asker_id;
  const isVictim = myId === gameState.victim_id;

  const getPlayerName = (id: string | null) =>
    players.find((p) => p.id === id)?.name || 'Unknown';

  // 1. หน้าจอคนถาม (เห็นคำถาม)
  if (gameState.phase === 'ASKING' && isAsker) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-red-900 to-red-800 p-6 text-white text-center rounded-2xl shadow-2xl border border-red-700"
      >
        <div className="text-4xl mb-4">🤫</div>
        <h2 className="text-xl font-bold mb-4">ถามเพื่อน! (ห้ามอ่านออกเสียง)</h2>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-black/40 p-4 rounded-xl mb-6 border border-red-500/50"
        >
          <p className="text-lg italic">"{gameState.question}"</p>
        </motion.div>

        <p className="text-sm opacity-80 mb-4">เลือกเพื่อนที่ตรงกับคำถามนี้ที่สุด:</p>

        <div className="grid grid-cols-2 gap-3">
          {players
            .filter((p) => p.id !== myId)
            .map((p, index) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Button
                  onClick={() => onSelectVictim(p.id)}
                  className="w-full bg-red-700 hover:bg-red-600 text-white py-4"
                >
                  {p.name}
                </Button>
              </motion.div>
            ))}
        </div>
      </motion.div>
    );
  }

  // 2. หน้าจอคนรอ (ไม่เห็นคำถาม)
  if (gameState.phase === 'ASKING') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center p-10"
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-6xl mb-6"
        >
          👀
        </motion.div>
        <p className="text-xl text-white">
          <span className="font-bold text-yellow-400">
            {getPlayerName(gameState.asker_id)}
          </span>{' '}
          กำลังเลือกเหยื่อ...
        </p>
        <p className="text-sm text-white/60 mt-2">รอแป๊บนะ...</p>
      </motion.div>
    );
  }

  // 3. หน้าจอเฉลย (Revealing)
  if (gameState.phase === 'REVEALING') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center p-6 bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-2xl border border-slate-700"
      >
        <h2 className="text-lg mb-2">
          <span className="text-red-400 font-bold">
            {getPlayerName(gameState.asker_id)}
          </span>{' '}
          เลือก...
        </h2>
        
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', bounce: 0.5, delay: 0.3 }}
          className="text-4xl font-bold text-yellow-400 my-4"
        >
          🎯 {getPlayerName(gameState.victim_id)}
        </motion.div>

        <AnimatePresence mode="wait">
          {!gameState.is_revealed ? (
            <motion.div
              key="unrevealed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-6 space-y-4"
            >
              {isVictim ? (
                <>
                  <p className="text-lg">
                    อยากรู้ไหมเขาถามว่าอะไร?{' '}
                    <span className="text-2xl">🍺</span>
                  </p>
                  <Button
                    onClick={onRevealQuestion}
                    className="w-full bg-pink-600 hover:bg-pink-500 py-6 text-xl font-bold"
                  >
                    🍺 ดื่มเพื่อดูคำถาม
                  </Button>
                  <Button
                    onClick={onSkipQuestion}
                    variant="ghost"
                    className="w-full text-white/60 hover:text-white"
                  >
                    ไม่ล่ะ ปล่อยเบลอ
                  </Button>
                </>
              ) : (
                <p className="text-white/70">
                  รอ{' '}
                  <span className="text-yellow-400">
                    {getPlayerName(gameState.victim_id)}
                  </span>{' '}
                  ตัดสินใจว่าจะดื่มไหม...
                </p>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="revealed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 bg-white text-black p-6 rounded-xl"
            >
              <p className="text-sm text-gray-500 mb-2">คำถามคือ...</p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-xl font-bold"
              >
                "{gameState.question}"
              </motion.p>
              <Button
                onClick={onNextRound}
                className="mt-6 bg-blue-600 hover:bg-blue-500"
              >
                รอบต่อไป →
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  return <div className="text-white text-center">Loading...</div>;
}
