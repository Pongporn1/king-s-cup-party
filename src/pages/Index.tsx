import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameRoom } from "@/hooks/useGameRoom";
import { usePokDengRoom } from "@/hooks/usePokDengRoom";
import { useUndercoverRoom } from "@/hooks/useUndercoverRoom";
import { useParanoiaGame } from "@/hooks/useParanoiaGame";
import { useFiveSecGame } from "@/hooks/useFiveSecGame";
import { Lobby } from "@/components/Lobby";
import { GameRoom } from "@/components/GameRoom";
import { PokDengLobby } from "@/components/PokDengLobby";
import { PokDengGameRoomMultiplayer } from "@/components/PokDengGameRoomMultiplayer";
import { UndercoverLobby } from "@/components/UndercoverLobby";
import { UndercoverGameRoom } from "@/components/UndercoverGameRoom";
import { ParanoiaLobby } from "@/components/ParanoiaLobby";
import { ParanoiaGameRoom } from "@/components/ParanoiaGameRoom";
import { FiveSecLobby } from "@/components/FiveSecLobby";
import { FiveSecGameRoom } from "@/components/FiveSecGameRoom";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import ThemedBackground from "@/components/ThemedBackground";
import { FloatingNames, AdminPanel } from "@/components/AdminPanel";
import { GameRulesAssistant } from "@/components/GameRulesAssistant";
import { getFloatingNamesFromDB, getGameCovers } from "@/lib/adminStorage";
import { t } from "@/lib/i18n";
import {
  Play,
  ChevronLeft,
  ChevronRight,
  Settings,
  Grid3X3,
  ImageIcon,
  Sparkles,
} from "lucide-react";

type GameMode =
  | "select"
  | "doraemon"
  | "pokdeng"
  | "undercover"
  | "paranoia"
  | "5-sec";

const Index = () => {
  const [gameMode, setGameMode] = useState<GameMode>("select");
  const [floatingNames, setFloatingNames] = useState<string[]>([]);
  const [isPokDengLiveMode, setIsPokDengLiveMode] = useState(false);

  // Admin Panel State
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [gameCovers, setGameCovers] = useState<Record<string, string>>({});

  // AI Assistant State
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  // King's Cup game hook
  const {
    room,
    players,
    currentPlayerId,
    isLoading,
    createRoom,
    joinRoom,
    startGame,
    drawCard,
    reshuffleDeck,
    leaveRoom,
    quickStart,
  } = useGameRoom();

  // Pok Deng game hook
  const {
    room: pokDengRoom,
    players: pokDengPlayers,
    currentPlayerId: pokDengCurrentPlayerId,
    isLoading: pokDengIsLoading,
    createRoom: pokDengCreateRoom,
    joinRoom: pokDengJoinRoom,
    startGame: pokDengStartGame,
    drawCard: pokDengDrawCard,
    standCard: pokDengStandCard,
    dealerDraw: pokDengDealerDraw,
    dealerStand: pokDengDealerStand,
    showdown: pokDengShowdown,
    nextRound: pokDengNextRound,
    leaveRoom: pokDengLeaveRoom,
    quickStart: pokDengQuickStart,
    setDealer: pokDengSetDealer,
  } = usePokDengRoom();

  // Undercover game hook
  const {
    room: undercoverRoom,
    players: undercoverPlayers,
    currentPlayerId: undercoverCurrentPlayerId,
    isLoading: undercoverIsLoading,
    categories: undercoverCategories,
    createRoom: undercoverCreateRoom,
    joinRoom: undercoverJoinRoom,
    startGame: undercoverStartGame,
    startDescribePhase: undercoverStartDescribePhase,
    nextTurn: undercoverNextTurn,
    startVoting: undercoverStartVoting,
    votePlayer: undercoverVotePlayer,
    checkResultAndContinue: undercoverCheckResultAndContinue,
    restartGame: undercoverRestartGame,
    leaveRoom: undercoverLeaveRoom,
  } = useUndercoverRoom();

  // Paranoia game hook
  const {
    room: paranoiaRoom,
    players: paranoiaPlayers,
    currentPlayerId: paranoiaCurrentPlayerId,
    isLoading: paranoiaIsLoading,
    createRoom: paranoiaCreateRoom,
    joinRoom: paranoiaJoinRoom,
    startGame: paranoiaStartGame,
    startRound: paranoiaStartRound,
    selectVictim: paranoiaSelectVictim,
    revealQuestion: paranoiaRevealQuestion,
    skipQuestion: paranoiaSkipQuestion,
    leaveRoom: paranoiaLeaveRoom,
  } = useParanoiaGame();

  // 5 Second Rule game hook
  const {
    room: fiveSecRoom,
    players: fiveSecPlayers,
    currentPlayerId: fiveSecCurrentPlayerId,
    isLoading: fiveSecIsLoading,
    createRoom: fiveSecCreateRoom,
    joinRoom: fiveSecJoinRoom,
    startGame: fiveSecStartGame,
    startRound: fiveSecStartRound,
    finishAnswering: fiveSecFinishAnswering,
    vote: fiveSecVote,
    leaveRoom: fiveSecLeaveRoom,
  } = useFiveSecGame();

  const currentPlayer = players.find((p) => p.id === currentPlayerId);
  const isHost = currentPlayer?.is_host ?? false;

  const pokDengCurrentPlayer = pokDengPlayers.find(
    (p) => p.id === pokDengCurrentPlayerId
  );
  const isPokDengHost = pokDengCurrentPlayer?.is_host ?? false;

  // หน้าเลือกเกม - Nintendo Switch Style with Framer Motion
  const [selectedGameIndex, setSelectedGameIndex] = useState(0);

  // Games array - Define at component level so it's accessible everywhere
  const games = useMemo(
    () => [
      {
        id: "doraemon",
        emoji: "🎴",
        name: t("kingsCup"),
        desc: t("kingsCupDesc"),
        gradient: "from-red-500 to-orange-500",
        bgColor: "#ef4444",
      },
      {
        id: "pokdeng",
        emoji: "🃏",
        name: t("pokDeng"),
        desc: t("pokDengDesc"),
        gradient: "from-emerald-500 to-green-600",
        bgColor: "#10b981",
      },
      {
        id: "undercover",
        emoji: "🕵️",
        name: t("undercoverTitle"),
        desc: t("undercoverDesc"),
        gradient: "from-purple-600 to-indigo-600",
        bgColor: "#9333ea",
      },
      {
        id: "paranoia",
        emoji: "🤫",
        name: "Paranoia",
        desc: "ถามคำถามลับๆ - สายมึน",
        gradient: "from-pink-500 to-rose-600",
        bgColor: "#ec4899",
      },
      {
        id: "5-sec",
        emoji: "⏱️",
        name: "5 Second Rule",
        desc: "ตอบคำถาม 5 วินาที - สายเร็ว",
        gradient: "from-yellow-400 to-orange-500",
        bgColor: "#f59e0b",
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Navigation functions
  const nextGame = useCallback(() => {
    setSelectedGameIndex((prev) => (prev + 1) % games.length);
  }, [games.length]);

  const prevGame = useCallback(() => {
    setSelectedGameIndex((prev) => (prev - 1 + games.length) % games.length);
  }, [games.length]);

  // Load floating names and game covers
  useEffect(() => {
    const loadNames = async () => {
      const names = await getFloatingNamesFromDB();
      setFloatingNames(names);
    };

    const loadCovers = async () => {
      const covers = await getGameCovers();
      setGameCovers(covers);
    };

    loadNames();
    loadCovers();
  }, [gameMode, showAdminPanel]);

  // Keyboard Navigation (Arrow keys like Nintendo Switch)
  useEffect(() => {
    if (gameMode !== "select") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextGame();
      if (e.key === "ArrowLeft") prevGame();
      if (e.key === "Enter") {
        const selectedGame = games[selectedGameIndex];
        setGameMode(selectedGame.id as GameMode);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameMode, selectedGameIndex, nextGame, prevGame, games]);

  if (gameMode === "select") {
    const selectedGame = games[selectedGameIndex];

    return (
      <div className="min-h-screen min-h-[100dvh] relative overflow-hidden bg-zinc-900 text-white flex flex-col">
        {/* Themed Background - Changes based on selected theme */}
        <ThemedBackground />

        {/* Dynamic Background - Changes color based on selected game */}
        <motion.div
          key={selectedGameIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 0.8 }}
          className={`absolute inset-0 bg-gradient-to-br ${selectedGame.gradient} mix-blend-overlay`}
        />

        {/* Floating Names */}
        <FloatingNames names={floatingNames} />

        {/* Header Bar */}
        <div className="relative z-[60] flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center font-bold text-lg shadow-lg">
              🎮
            </div>
            <span className="text-xl font-bold">Party Games</span>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <ThemeSwitcher />
            <span className="text-zinc-400 text-sm">
              {new Date().toLocaleTimeString("th-TH", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 relative z-10">
          {/* Game Title - Animated */}
          <motion.div
            key={selectedGame.name}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="text-center mb-8"
          >
            <h1 className="text-5xl md:text-6xl font-black mb-2 tracking-tight drop-shadow-2xl">
              {selectedGame.name}
            </h1>
            <p className="text-zinc-400 text-lg">{selectedGame.desc}</p>
          </motion.div>

          {/* Carousel */}
          <div className="relative w-full max-w-5xl h-[380px] flex items-center justify-center perspective-[1000px]">
            {/* Left Arrow */}
            <button
              onClick={prevGame}
              className="absolute left-0 z-30 p-3 rounded-full bg-black/50 hover:bg-black/80 transition-all hover:scale-110"
            >
              <ChevronLeft size={32} />
            </button>

            {/* Game Cards */}
            <div className="relative h-full w-full flex items-center justify-center">
              {games.map((game, index) => {
                const offset = index - selectedGameIndex;
                // Handle wrapping for infinite feel
                let adjustedOffset = offset;
                if (offset > games.length / 2)
                  adjustedOffset = offset - games.length;
                if (offset < -games.length / 2)
                  adjustedOffset = offset + games.length;

                const isActive = index === selectedGameIndex;
                const isVisible = Math.abs(adjustedOffset) <= 2;
                const customCover = gameCovers[game.id];

                if (!isVisible) return null;

                return (
                  <motion.div
                    key={game.id}
                    className="absolute cursor-pointer"
                    initial={false}
                    animate={{
                      x: adjustedOffset * 280,
                      scale: isActive ? 1.15 : 0.75,
                      rotateY: adjustedOffset * 8,
                      opacity: isActive ? 1 : 0.4,
                      filter: isActive ? "grayscale(0%)" : "grayscale(40%)",
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                    }}
                    onClick={() => setSelectedGameIndex(index)}
                    style={{
                      zIndex: isActive ? 20 : 10 - Math.abs(adjustedOffset),
                    }}
                  >
                    <div
                      className={`
                        w-[240px] h-[320px] rounded-2xl shadow-2xl overflow-hidden
                        flex flex-col items-center justify-center relative
                        ${
                          !customCover
                            ? `bg-gradient-to-br ${game.gradient}`
                            : ""
                        }
                        ${
                          isActive
                            ? "border-4 border-cyan-400 shadow-cyan-400/30"
                            : "border-2 border-white/20"
                        }
                      `}
                      style={{
                        backgroundImage: customCover
                          ? `url(${customCover})`
                          : undefined,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      {!customCover ? (
                        <>
                          <span className="text-8xl mb-4 drop-shadow-lg">
                            {game.emoji}
                          </span>
                          <h3 className="text-2xl font-bold text-white drop-shadow-lg">
                            {game.name}
                          </h3>
                        </>
                      ) : (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4">
                          <h3 className="text-xl font-bold text-white drop-shadow-lg text-center">
                            {game.name}
                          </h3>
                        </div>
                      )}
                    </div>

                    {/* Glow effect for active card */}
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute -inset-4 bg-cyan-400/20 rounded-3xl blur-2xl -z-10"
                      />
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Right Arrow */}
            <button
              onClick={nextGame}
              className="absolute right-0 z-30 p-3 rounded-full bg-black/50 hover:bg-black/80 transition-all hover:scale-110"
            >
              <ChevronRight size={32} />
            </button>
          </div>

          {/* Start Button + Admin Controls */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-10 flex items-center gap-4"
          >
            <Button
              size="lg"
              onClick={() => setGameMode(selectedGame.id as GameMode)}
              className="bg-white text-black hover:bg-white/90 px-10 py-6 rounded-full font-bold text-xl shadow-2xl hover:scale-105 transition-transform flex items-center gap-3"
            >
              <Play fill="black" size={24} />
              Start Game
            </Button>

            <Button
              size="lg"
              onClick={() => setShowAIAssistant(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-6 rounded-full font-bold text-xl shadow-2xl hover:scale-105 transition-transform flex items-center gap-3"
            >
              <Sparkles size={24} />
              ถามกติกา AI
            </Button>
          </motion.div>
        </div>

        {/* Bottom Navigation Hints */}
        <div className="relative z-10 flex items-center justify-center gap-8 pb-6 text-zinc-500 text-sm font-medium">
          <span className="flex items-center gap-2">
            <span className="border border-zinc-600 px-2 py-1 rounded text-xs">
              ←
            </span>
            <span className="border border-zinc-600 px-2 py-1 rounded text-xs">
              →
            </span>
            Select
          </span>
          <span className="flex items-center gap-2">
            <span className="border border-zinc-600 px-3 py-1 rounded text-xs">
              A
            </span>
            OK
          </span>
        </div>

        {/* Dots Indicator */}
        <div className="relative z-10 flex items-center justify-center gap-2 pb-8">
          {games.map((_, index) => (
            <button
              key={index}
              onClick={() => setSelectedGameIndex(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                index === selectedGameIndex
                  ? "bg-cyan-400 w-8"
                  : "bg-zinc-600 hover:bg-zinc-500"
              }`}
            />
          ))}
        </div>

        {/* Admin Panel Modal */}
        {/* AI Assistant */}
        <AnimatePresence>
          {showAIAssistant && (
            <GameRulesAssistant
              onClose={() => setShowAIAssistant(false)}
              currentGame={{
                id: selectedGame.id,
                name: selectedGame.name,
                emoji: selectedGame.emoji,
              }}
            />
          )}
        </AnimatePresence>

        {showAdminPanel && (
          <AdminPanel
            onClose={() => setShowAdminPanel(false)}
            games={games}
            onCoversUpdate={async () => {
              const covers = await getGameCovers();
              setGameCovers(covers);
            }}
          />
        )}
      </div>
    );
  }

  // ไพ่ป๊อกเด้ง Multiplayer
  if (gameMode === "pokdeng") {
    // ยังไม่ได้เข้าห้อง - แสดง Lobby
    if (!pokDengRoom) {
      return (
        <PokDengLobby
          onCreateRoom={pokDengCreateRoom}
          onJoinRoom={pokDengJoinRoom}
          onQuickStart={async (name) => {
            setIsPokDengLiveMode(true);
            return pokDengQuickStart(name, true); // true = LIVE mode
          }}
          isLoading={pokDengIsLoading}
          onBack={() => setGameMode("select")}
        />
      );
    }

    // เข้าห้องแล้ว - แสดง Game Room
    return (
      <PokDengGameRoomMultiplayer
        room={pokDengRoom}
        players={pokDengPlayers}
        currentPlayerId={pokDengCurrentPlayerId}
        isHost={isPokDengHost}
        isLiveMode={isPokDengLiveMode}
        onStartGame={pokDengStartGame}
        onDrawCard={pokDengDrawCard}
        onStandCard={pokDengStandCard}
        onDealerDraw={pokDengDealerDraw}
        onDealerStand={pokDengDealerStand}
        onShowdown={pokDengShowdown}
        onNextRound={pokDengNextRound}
        onLeave={() => {
          pokDengLeaveRoom();
          setIsPokDengLiveMode(false);
          setGameMode("select");
        }}
        onSetDealer={pokDengSetDealer}
      />
    );
  }

  // Undercover
  if (gameMode === "undercover") {
    // ยังไม่ได้เข้าห้อง - แสดง Lobby
    if (!undercoverRoom) {
      return (
        <UndercoverLobby
          onCreateRoom={undercoverCreateRoom}
          onJoinRoom={undercoverJoinRoom}
          onBack={() => setGameMode("select")}
          isLoading={undercoverIsLoading}
        />
      );
    }

    // เข้าห้องแล้ว - แสดง Game Room
    const isHost =
      undercoverPlayers.find((p) => p.id === undercoverCurrentPlayerId)
        ?.is_host || false;

    return (
      <UndercoverGameRoom
        room={undercoverRoom}
        players={undercoverPlayers}
        currentPlayerId={undercoverCurrentPlayerId}
        isHost={isHost}
        categories={undercoverCategories}
        onStartGame={undercoverStartGame}
        onStartDescribePhase={undercoverStartDescribePhase}
        onNextTurn={undercoverNextTurn}
        onStartVoting={undercoverStartVoting}
        onVotePlayer={undercoverVotePlayer}
        onCheckResultAndContinue={undercoverCheckResultAndContinue}
        onRestartGame={undercoverRestartGame}
        onLeave={() => {
          undercoverLeaveRoom();
          setGameMode("select");
        }}
      />
    );
  }

  // Paranoia
  if (gameMode === "paranoia") {
    if (!paranoiaRoom) {
      return (
        <ParanoiaLobby
          onCreateRoom={paranoiaCreateRoom}
          onJoinRoom={paranoiaJoinRoom}
          onBack={() => setGameMode("select")}
          isLoading={paranoiaIsLoading}
        />
      );
    }
    const isHost =
      paranoiaPlayers.find((p) => p.id === paranoiaCurrentPlayerId)?.is_host ||
      false;
    return (
      <ParanoiaGameRoom
        room={paranoiaRoom}
        players={paranoiaPlayers}
        currentPlayerId={paranoiaCurrentPlayerId}
        isHost={isHost}
        onStartGame={paranoiaStartGame}
        onStartRound={paranoiaStartRound}
        onSelectVictim={paranoiaSelectVictim}
        onRevealQuestion={paranoiaRevealQuestion}
        onSkipQuestion={paranoiaSkipQuestion}
        onLeave={() => {
          paranoiaLeaveRoom();
          setGameMode("select");
        }}
      />
    );
  }

  // 5 Second Rule
  if (gameMode === "5-sec") {
    if (!fiveSecRoom) {
      return (
        <FiveSecLobby
          onCreateRoom={fiveSecCreateRoom}
          onJoinRoom={fiveSecJoinRoom}
          onBack={() => setGameMode("select")}
          isLoading={fiveSecIsLoading}
        />
      );
    }
    const isHost =
      fiveSecPlayers.find((p) => p.id === fiveSecCurrentPlayerId)?.is_host ||
      false;
    return (
      <FiveSecGameRoom
        room={fiveSecRoom}
        players={fiveSecPlayers}
        currentPlayerId={fiveSecCurrentPlayerId}
        isHost={isHost}
        onStartGame={fiveSecStartGame}
        onStartRound={fiveSecStartRound}
        onFinishAnswering={fiveSecFinishAnswering}
        onVote={fiveSecVote}
        onLeave={() => {
          fiveSecLeaveRoom();
          setGameMode("select");
        }}
      />
    );
  }

  // ไพ่โดเรม่อน (เกมเดิม)
  if (!room) {
    return (
      <Lobby
        onCreateRoom={createRoom}
        onJoinRoom={joinRoom}
        onQuickStart={quickStart}
        isLoading={isLoading}
        onBack={() => setGameMode("select")}
      />
    );
  }

  return (
    <GameRoom
      room={room}
      players={players}
      currentPlayerId={currentPlayerId}
      isHost={isHost}
      onStartGame={startGame}
      onDrawCard={drawCard}
      onReshuffle={reshuffleDeck}
      onLeave={leaveRoom}
    />
  );
};

export default Index;
