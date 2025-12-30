import { useState, useEffect } from "react";
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
import { FloatingNames } from "@/components/AdminPanel";
import { getFloatingNamesFromDB } from "@/lib/adminStorage";
import { t } from "@/lib/i18n";

type GameMode =
  | "select"
  | "doraemon"
  | "pokdeng"
  | "undercover"
  | "paranoia"
  | "fivesec";

const Index = () => {
  const [gameMode, setGameMode] = useState<GameMode>("select");
  const [floatingNames, setFloatingNames] = useState<string[]>([]);
  const [isPokDengLiveMode, setIsPokDengLiveMode] = useState(false);

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

  // Load floating names
  useEffect(() => {
    const loadNames = async () => {
      const names = await getFloatingNamesFromDB();
      setFloatingNames(names);
    };
    loadNames();
  }, [gameMode]);

  // หน้าเลือกเกม
  if (gameMode === "select") {
    return (
      <div className="min-h-screen min-h-[100dvh] flex flex-col items-center justify-center p-4 sm:p-6 relative animate-fade-in">
        {/* Floating Names */}
        <FloatingNames names={floatingNames} />

        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Theme Switcher */}
        <ThemeSwitcher />

        {/* Themed Background */}
        <ThemedBackground />

        {/* Logo */}
        <div className="text-center mb-6 sm:mb-8 relative z-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
            Party Games
          </h1>
          <p className="text-white/80 text-base sm:text-lg">
            {t("selectGamePrompt")}
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-black/40 backdrop-blur-md rounded-2xl w-full max-w-xs sm:max-w-sm p-4 sm:p-6 relative z-10 border border-white/10 animate-scale-in">
          <div className="space-y-3">
            {/* ไพ่โดเรม่อน */}
            <Button
              variant="default"
              size="lg"
              onClick={() => setGameMode("doraemon")}
              className="w-full bg-white text-black hover:bg-white/90 hover:scale-105 h-auto py-4 transition-all duration-300"
            >
              <div className="flex items-center gap-3 w-full">
                <span className="text-3xl"></span>
                <div className="text-left flex-1">
                  <div className="font-bold text-lg">{t("kingsCup")}</div>
                  <div className="text-xs text-black/60">
                    {t("kingsCupDesc")}
                  </div>
                </div>
              </div>
            </Button>

            {/* ไพ่ป๊อกเด้ง */}
            <Button
              variant="default"
              size="lg"
              onClick={() => setGameMode("pokdeng")}
              className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700 hover:scale-105 h-auto py-4 transition-all duration-300"
            >
              <div className="flex items-center gap-3 w-full">
                <span className="text-3xl"></span>
                <div className="text-left flex-1">
                  <div className="font-bold text-lg">{t("pokDeng")}</div>
                  <div className="text-xs text-white/70">
                    {t("pokDengDesc")}
                  </div>
                </div>
              </div>
            </Button>

            {/* Undercover */}
            <Button
              variant="default"
              size="lg"
              onClick={() => setGameMode("undercover")}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700 hover:scale-105 h-auto py-4 transition-all duration-300"
            >
              <div className="flex items-center gap-3 w-full">
                <span className="text-3xl"></span>
                <div className="text-left flex-1">
                  <div className="font-bold text-lg">
                    {t("undercoverTitle")}
                  </div>
                  <div className="text-xs text-white/70">
                    {t("undercoverDesc")}
                  </div>
                </div>
              </div>
            </Button>

            {/* Paranoia */}
            <Button
              variant="default"
              size="lg"
              onClick={() => setGameMode("paranoia")}
              className="w-full bg-gradient-to-r from-red-500 to-orange-600 text-white hover:from-red-600 hover:to-orange-700 hover:scale-105 h-auto py-4 transition-all duration-300"
            >
              <div className="flex items-center gap-3 w-full">
                <span className="text-3xl"></span>
                <div className="text-left flex-1">
                  <div className="font-bold text-lg">Paranoia</div>
                  <div className="text-xs text-white/70">
                    ถามคำถามลับๆ - สายมึน
                  </div>
                </div>
              </div>
            </Button>

            {/* 5 Second Rule */}
            <Button
              variant="default"
              size="lg"
              onClick={() => setGameMode("fivesec")}
              className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 text-white hover:from-yellow-600 hover:to-amber-700 hover:scale-105 h-auto py-4 transition-all duration-300"
            >
              <div className="flex items-center gap-3 w-full">
                <span className="text-3xl"></span>
                <div className="text-left flex-1">
                  <div className="font-bold text-lg">5 Second Rule</div>
                  <div className="text-xs text-white/70">
                    ตอบคำถาม 5 วินาที - สายเร็ว
                  </div>
                </div>
              </div>
            </Button>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 sm:mt-8 text-white/40 text-xs sm:text-sm relative z-10">
          {t("partyMotto")} 🍺
        </p>
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
  if (gameMode === "fivesec") {
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
