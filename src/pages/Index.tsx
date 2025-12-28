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
    showdown: pokDengShowdown,
    nextRound: pokDengNextRound,
    leaveRoom: pokDengLeaveRoom,
    quickStart: pokDengQuickStart,
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
      <div className="min-h-screen min-h-[100dvh] flex flex-col items-center justify-center p-4 relative">
        {/* Floating Names */}
        <FloatingNames names={floatingNames} />

        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('${import.meta.env.BASE_URL}bg-party.jpg')`,
          }}
        />
        <div className="absolute inset-0 bg-black/60" />

        {/* Logo */}
        <div className="text-center mb-8 relative z-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2 drop-shadow-lg">
            🎴 เลือกเกม
          </h1>
          <p className="text-white/80 text-lg">เลือกเกมที่ต้องการเล่น</p>
        </div>

        {/* Game Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg relative z-10">
          {/* ไพ่โดเรม่อน */}
          <Button
            onClick={() => setGameMode("doraemon")}
            className="h-auto py-6 px-4 bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-2xl shadow-xl border-2 border-purple-400/30"
          >
            <div className="flex flex-col items-center gap-2">
              <span className="text-4xl">🍻</span>
              <span className="text-xl font-bold">ไพ่โดเรม่อน</span>
              <span className="text-sm text-white/70">King's Cup</span>
            </div>
          </Button>

          {/* ไพ่ป๊อกเด้ง */}
          <Button
            onClick={() => setGameMode("pokdeng")}
            className="h-auto py-6 px-4 bg-gradient-to-br from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-2xl shadow-xl border-2 border-green-400/30"
          >
            <div className="flex flex-col items-center gap-2">
              <span className="text-4xl">🎴</span>
              <span className="text-xl font-bold">ไพ่ป๊อกเด้ง</span>
              <span className="text-sm text-white/70">Pok Deng</span>
            </div>
          </Button>
        </div>

        {/* Footer */}
        <p className="mt-8 text-white/40 text-sm relative z-10">
          ดื่มให้สนุก เมาให้กระจาย
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
          onQuickStart={pokDengQuickStart}
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
        onStartGame={pokDengStartGame}
        onDrawCard={pokDengDrawCard}
        onStandCard={pokDengStandCard}
        onDealerDraw={pokDengDealerDraw}
        onShowdown={pokDengShowdown}
        onNextRound={pokDengNextRound}
        onLeave={() => {
          pokDengLeaveRoom();
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
