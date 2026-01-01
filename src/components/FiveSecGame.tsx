import { useState, useEffect } from "react";
import { FiveSecState } from "@/lib/partyGameTypes";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface Player {
  id: string;
  name: string;
}

interface FiveSecGameProps {
  gameState: FiveSecState;
  myId: string;
  players: Player[];
  onFinishAnswering: () => void;
  onVote: (passed: boolean) => void;
  onNextRound: () => void;
}

export function FiveSecGame({
  gameState,
  myId,
  players,
  onFinishAnswering,
  onVote,
  onNextRound,
}: FiveSecGameProps) {
  const timeLimit = gameState.timeLimit || 5;
  const [timeLeft, setTimeLeft] = useState<number>(timeLimit);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [hasAutoTransitioned, setHasAutoTransitioned] = useState(false);

  const currentPlayer = players.find((p) => p.id === gameState.player_id);
  const isMe = myId === gameState.player_id;
  const hasVoted = Object.keys(gameState.votes || {}).includes(myId);

  // Count votes
  const voteCount = Object.values(gameState.votes || {}).length;
  const passCount = Object.values(gameState.votes || {}).filter(Boolean).length;
  const failCount = voteCount - passCount;
  const totalVoters = players.filter(
    (p) => p.id !== gameState.player_id
  ).length;

  // Timer logic (synced with server time)
  useEffect(() => {
    if (gameState.phase !== "PLAYING") return;

    const interval = setInterval(() => {
      const now = Date.now();
      const end = new Date(gameState.end_time).getTime();
      const diff = (end - now) / 1000;

      if (diff <= 0) {
        setTimeLeft(0);
        setIsTimedOut(true);
        clearInterval(interval);
      } else {
        setTimeLeft(diff);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [gameState.end_time, gameState.phase]);

  // Reset states when new round starts
  useEffect(() => {
    if (gameState.phase === "PLAYING") {
      setIsTimedOut(false);
      setTimeLeft(gameState.timeLimit || 5);
      setHasAutoTransitioned(false);
    }
  }, [gameState.player_id, gameState.phase, gameState.timeLimit]);

  // Debug log for phase changes
  useEffect(() => {
    console.log("FiveSecGame state:", {
      phase: gameState.phase,
      player_id: gameState.player_id,
      isMe,
      hasVoted,
      voteCount,
      totalVoters,
    });
  }, [
    gameState.phase,
    gameState.player_id,
    isMe,
    hasVoted,
    voteCount,
    totalVoters,
  ]);

  const getTimerColor = () => {
    // คนที่ตอบ - ใช้โทนสี orange/yellow
    if (isMe) {
      if (timeLeft <= 1) return "from-red-600 to-red-800";
      if (timeLeft <= 2) return "from-orange-500 to-red-600";
      if (timeLeft <= 3) return "from-yellow-500 to-orange-500";
      return "from-orange-500 to-yellow-600";
    }
    // คนที่ดู - ใช้โทนสี blue/purple
    if (timeLeft <= 1) return "from-red-600 to-pink-800";
    if (timeLeft <= 2) return "from-purple-500 to-red-600";
    if (timeLeft <= 3) return "from-indigo-500 to-purple-500";
    return "from-blue-500 to-indigo-700";
  };

  // Playing phase
  if (gameState.phase === "PLAYING") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`p-6 text-center rounded-2xl text-white bg-gradient-to-br ${getTimerColor()} transition-colors duration-300 shadow-2xl`}
      >
        <div className="mb-4">
          <span className="text-sm opacity-80">ตาของ:</span>
          <h2 className="text-2xl font-bold">{currentPlayer?.name}</h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white text-black p-6 rounded-xl shadow-lg my-6"
        >
          <p className="text-gray-500 mb-2 text-sm">บอกมา 3 อย่าง...</p>
          <h1 className="text-xl md:text-2xl font-extrabold">
            {gameState.topic}
          </h1>
        </motion.div>

        {/* Timer Circle */}
        <motion.div
          animate={{ scale: timeLeft <= 2 ? [1, 1.05, 1] : 1 }}
          transition={{ repeat: timeLeft <= 2 ? Infinity : 0, duration: 0.5 }}
          className="relative w-32 h-32 mx-auto flex items-center justify-center border-4 border-white rounded-full bg-black/30"
        >
          <span className="text-5xl font-mono font-bold">
            {timeLeft > 0 ? timeLeft.toFixed(1) : "💥"}
          </span>
        </motion.div>

        {/* Finish button for current player */}
        {isMe && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              onClick={onFinishAnswering}
              className="mt-6 w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 text-xl shadow-lg"
            >
              {timeLeft > 0 ? "✋ ตอบครบแล้ว!" : "⏭️ ต่อไป"}
            </Button>
          </motion.div>
        )}

        {!isMe && (
          <p className="mt-4 text-sm opacity-80">
            รอ {currentPlayer?.name} {timeLeft > 0 ? "ตอบ" : "กดต่อไป"}...
          </p>
        )}
      </motion.div>
    );
  }

  // Judging phase
  if (gameState.phase === "JUDGING") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-6 text-center rounded-2xl bg-gradient-to-br from-purple-800 to-indigo-900 text-white shadow-2xl"
      >
        <div className="text-4xl mb-4">⚖️</div>
        <h2 className="text-xl font-bold mb-2">ตัดสิน!</h2>
        <p className="text-lg mb-4">
          <span className="text-yellow-400 font-bold">
            {currentPlayer?.name}
          </span>{" "}
          ตอบ
        </p>

        <div className="bg-white/10 p-4 rounded-xl mb-6">
          <p className="text-sm opacity-80">โจทย์:</p>
          <p className="text-lg font-bold">{gameState.topic}</p>
        </div>

        {/* Voting buttons */}
        <AnimatePresence mode="wait">
          {!isMe && !hasVoted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-2 gap-4 mb-6"
            >
              <Button
                onClick={() => onVote(true)}
                className="bg-green-600 hover:bg-green-500 py-6 text-xl font-bold"
              >
                ✅ ผ่าน
              </Button>
              <Button
                onClick={() => onVote(false)}
                className="bg-red-600 hover:bg-red-500 py-6 text-xl font-bold"
              >
                🍺 ดื่ม
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {hasVoted && !isMe && (
          <p className="text-green-400 mb-4">✓ คุณโหวตแล้ว</p>
        )}

        {isMe && <p className="text-yellow-400 mb-4">รอเพื่อนตัดสิน...</p>}

        {/* Vote count */}
        <div className="bg-black/30 rounded-xl p-4 mb-6">
          <p className="text-sm opacity-80 mb-2">
            โหวตแล้ว: {voteCount}/{totalVoters}
          </p>
          <div className="flex justify-center gap-4">
            <span className="text-green-400 text-lg">✅ {passCount}</span>
            <span className="text-red-400 text-lg">🍺 {failCount}</span>
          </div>
        </div>

        {/* Result and next button */}
        {voteCount >= totalVoters && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="text-2xl font-bold mb-4">
              {passCount > failCount ? (
                <span className="text-green-400">🎉 ผ่าน!</span>
              ) : (
                <span className="text-red-400">🍺 ดื่ม!</span>
              )}
            </div>
            <Button
              onClick={onNextRound}
              className="bg-blue-600 hover:bg-blue-500 px-8"
            >
              รอบต่อไป →
            </Button>
          </motion.div>
        )}
      </motion.div>
    );
  }

  return <div className="text-white text-center">Loading...</div>;
}
