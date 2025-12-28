import { useState } from "react";
import { useGameRoom } from "@/hooks/useGameRoom";
import { usePokDengRoom } from "@/hooks/usePokDengRoom";
import { Lobby } from "@/components/Lobby";
import { GameRoom } from "@/components/GameRoom";
import { PokDengLobby } from "@/components/PokDengLobby";
import { PokDengGameRoomMultiplayer } from "@/components/PokDengGameRoomMultiplayer";
import { Button } from "@/components/ui/button";
import { FloatingNames } from "@/components/AdminPanel";
import { getFloatingNamesFromDB } from "@/lib/adminStorage";
import { useEffect } from "react";

type GameMode = "select" | "doraemon" | "pokdeng";

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
      <div className="min-h-screen min-h-[100dvh] flex flex-col items-center justify-center p-4 sm:p-6 relative">
        {/* Floating Names */}
        <FloatingNames names={floatingNames} />

        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('${import.meta.env.BASE_URL}bg-party.jpg')`,
          }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/60" />

        {/* Logo */}
        <div className="text-center mb-6 sm:mb-8 relative z-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
            Party Games
          </h1>
          <p className="text-white/80 text-base sm:text-lg">
            เลือกเกมที่ต้องการเล่น
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-black/40 backdrop-blur-md rounded-2xl w-full max-w-xs sm:max-w-sm p-4 sm:p-6 relative z-10 border border-white/10">
          <div className="space-y-3">
            {/* ไพ่โดเรม่อน */}
            <Button
              variant="default"
              size="lg"
              onClick={() => setGameMode("doraemon")}
              className="w-full bg-white text-black hover:bg-white/90 h-auto py-4"
            >
              <div className="flex items-center gap-3 w-full">
                <span className="text-3xl"></span>
                <div className="text-left flex-1">
                  <div className="font-bold text-lg">ไพ่โดเรม่อน</div>
                  <div className="text-xs text-black/60">
                    King's Cup - สายดื่ม
                  </div>
                </div>
              </div>
            </Button>

            {/* ไพ่ป๊อกเด้ง */}
            <Button
              variant="default"
              size="lg"
              onClick={() => setGameMode("pokdeng")}
              className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700 h-auto py-4"
            >
              <div className="flex items-center gap-3 w-full">
                <span className="text-3xl"></span>
                <div className="text-left flex-1">
                  <div className="font-bold text-lg">ไพ่ป๊อกเด้ง</div>
                  <div className="text-xs text-white/70">
                    Pok Deng - สายพนัน
                  </div>
                </div>
              </div>
            </Button>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 sm:mt-8 text-white/40 text-xs sm:text-sm relative z-10">
          ดื่มให้สนุก เมาให้กระจาย 🍺
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
