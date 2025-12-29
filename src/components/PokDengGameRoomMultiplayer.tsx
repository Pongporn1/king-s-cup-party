import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { PlayerList } from "@/components/PlayerList";
import { WaitingForPlayersAnimation } from "@/components/WaitingForPlayersAnimation";
import { CardBackPattern } from "@/components/CardBackPattern";
import {
  PokDengCard,
  getSuitEmoji,
  getSuitColor,
  isPok,
  getSpecialHand,
} from "@/lib/pokDengRules";
import { PokDengRoom, PokDengPlayer } from "@/hooks/usePokDengRoom";
import { Copy, LogOut, Play, RotateCcw, Hand, Square, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface PokDengGameRoomMultiplayerProps {
  room: PokDengRoom;
  players: PokDengPlayer[];
  currentPlayerId: string | null;
  isHost: boolean;
  isLiveMode?: boolean; // เปิดโหมด LIVE แยกจาก dealer
  onStartGame: () => void;
  onDrawCard: () => void;
  onStandCard: () => void;
  onDealerDraw: () => void;
  onDealerStand: () => void;
  onShowdown: () => void;
  onNextRound: () => void;
  onLeave: () => void;
  onSetDealer?: (playerId: string) => void;
}

// Component แสดงไพ่ขนาดใหญ่สำหรับ LIVE Display - ไพ่ใหญ่มากสำหรับจอ TV
function DisplayCard({
  card,
  faceDown = false,
}: {
  card: PokDengCard;
  faceDown?: boolean;
}) {
  if (faceDown) {
    return (
      <div className="w-20 h-28 sm:w-28 sm:h-40 md:w-32 md:h-48 lg:w-40 lg:h-56 rounded-xl shadow-xl overflow-hidden relative">
        <CardBackPattern />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ rotateY: 180, scale: 0.8 }}
      animate={{ rotateY: 0, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="w-20 h-28 sm:w-28 sm:h-40 md:w-32 md:h-48 lg:w-40 lg:h-56 rounded-xl bg-white border-2 border-gray-200 shadow-xl flex flex-col items-center justify-center"
    >
      <span
        className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold ${getSuitColor(
          card.suit
        )}`}
      >
        {card.value}
      </span>
      <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
        {getSuitEmoji(card.suit)}
      </span>
    </motion.div>
  );
}

// Component แสดงไพ่ขนาดใหญ่สำหรับ Player view (มือถือ)
function LargeCard({
  card,
  faceDown = false,
}: {
  card: PokDengCard;
  faceDown?: boolean;
}) {
  if (faceDown) {
    return (
      <div className="w-20 h-28 sm:w-24 sm:h-36 rounded-xl shadow-xl overflow-hidden relative">
        <CardBackPattern />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ rotateY: 180, scale: 0.8 }}
      animate={{ rotateY: 0, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="w-20 h-28 sm:w-24 sm:h-36 rounded-xl bg-white border-2 border-gray-200 shadow-xl flex flex-col items-center justify-center"
    >
      <span
        className={`text-2xl sm:text-3xl font-bold ${getSuitColor(card.suit)}`}
      >
        {card.value}
      </span>
      <span className="text-3xl sm:text-4xl">{getSuitEmoji(card.suit)}</span>
    </motion.div>
  );
}

// Component แสดงมือของผู้เล่นบน Display (LIVE view) - ไพ่ใหญ่สำหรับ TV
function DisplayPlayerHand({
  player,
  showCards,
  isCurrentTurn,
  isLarge = false,
}: {
  player: PokDengPlayer;
  showCards: boolean;
  isCurrentTurn: boolean;
  isLarge?: boolean;
}) {
  const pok =
    player.cards.length === 2
      ? isPok(player.cards)
      : { isPok: false, pokValue: null };
  const special = player.cards.length > 0 ? getSpecialHand(player.cards) : null;

  return (
    <div
      className={`${
        isLarge ? "p-5 sm:p-8" : "p-3 sm:p-4"
      } rounded-xl border-2 transition-all ${
        player.is_dealer
          ? "bg-amber-500/20 border-amber-500"
          : isCurrentTurn
          ? "bg-green-500/20 border-green-500 animate-pulse"
          : "bg-white/5 border-white/20"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {/* Avatar */}
          {player.avatar && (
            <img
              src={`${import.meta.env.BASE_URL}${player.avatar}.jpg`}
              alt={player.name}
              className={`${
                isLarge ? "w-10 h-10 sm:w-12 sm:h-12" : "w-8 h-8"
              } rounded-full object-cover border-2 border-white/40`}
            />
          )}
          <span
            className={`text-white font-bold ${
              isLarge ? "text-base sm:text-lg" : "text-sm sm:text-base"
            }`}
          >
            {player.is_dealer ? "🎰 " : ""}
            {player.name}
          </span>
          {player.is_dealer && (
            <span
              className={`${
                isLarge ? "text-sm" : "text-xs"
              } bg-amber-500 text-black px-2 py-0.5 rounded-full`}
            >
              เจ้ามือ
            </span>
          )}
        </div>
        {showCards && player.cards.length > 0 && (
          <div className="flex items-center gap-2">
            <span
              className={`${
                isLarge ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"
              } font-bold text-amber-400`}
            >
              {player.points}
            </span>
            {pok.isPok && pok.pokValue !== null && (
              <span
                className={`${
                  isLarge ? "text-sm" : "text-xs"
                } bg-green-500 text-white px-2 py-0.5 rounded-full animate-bounce`}
              >
                ป๊อก {pok.pokValue}!
              </span>
            )}
            {special && special.type !== "normal" && !pok.isPok && (
              <span
                className={`${
                  isLarge ? "text-sm" : "text-xs"
                } bg-purple-500 text-white px-2 py-0.5 rounded-full`}
              >
                {special.name}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ไพ่ในมือ - gap ใหญ่ขึ้นสำหรับ LIVE */}
      <div
        className={`flex ${
          isLarge ? "gap-4 sm:gap-6" : "gap-2"
        } justify-center`}
      >
        {player.cards.map((card, i) => (
          <DisplayCard key={i} card={card} faceDown={!showCards} />
        ))}
        {player.cards.length === 0 && (
          <div
            className={`${
              isLarge ? "w-28 h-40 sm:w-32 sm:h-48" : "w-16 h-24"
            } rounded-lg border-2 border-dashed border-white/30 flex items-center justify-center`}
          >
            <span className="text-white/30 text-xs">-</span>
          </div>
        )}
      </div>

      {/* สถานะ */}
      {player.has_drawn && !showCards && (
        <div className="text-center mt-2">
          <span className={`${isLarge ? "text-sm" : "text-xs"} text-white/50`}>
            ✓ จบตาแล้ว
          </span>
        </div>
      )}

      {/* ผลลัพธ์ */}
      {player.result && showCards && (
        <div className="mt-3 text-center">
          <span
            className={`${
              isLarge ? "text-base" : "text-sm"
            } font-bold px-4 py-1 rounded-full ${
              player.result === "player_win"
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {player.result === "player_win" ? "🎉 ชนะ!" : "😢 แพ้"}
            {player.multiplier &&
              player.multiplier > 1 &&
              ` x${player.multiplier}`}
          </span>
        </div>
      )}
    </div>
  );
}

export function PokDengGameRoomMultiplayer({
  room,
  players,
  currentPlayerId,
  isHost,
  isLiveMode = false,
  onStartGame,
  onDrawCard,
  onStandCard,
  onDealerDraw,
  onDealerStand,
  onShowdown,
  onNextRound,
  onLeave,
  onSetDealer,
}: PokDengGameRoomMultiplayerProps) {
  const { toast } = useToast();
  const [showRules, setShowRules] = useState(false);

  const copyRoomCode = async () => {
    const code = room.code;

    try {
      // ลองใช้ Clipboard API ก่อน (modern browsers)
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(code);
        toast({
          title: "✅ คัดลอกรหัสห้องแล้ว!",
          description: `รหัส: ${code}`,
          duration: 3000,
        });
        return;
      }
    } catch (err) {
      console.log("Clipboard API failed, trying fallback:", err);
    }

    // Fallback สำหรับเบราว์เซอร์เก่า
    try {
      const textArea = document.createElement("textarea");
      textArea.value = code;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);

      toast({
        title: successful ? "✅ คัดลอกรหัสห้องแล้ว!" : "⚠️ คัดลอกไม่สำเร็จ",
        description: `รหัส: ${code}`,
        duration: 3000,
      });
    } catch (err) {
      console.error("Copy failed:", err);
      toast({
        title: "📋 รหัสห้อง",
        description: `${code} (กรุณาคัดลอกด้วยมือ)`,
        duration: 5000,
      });
    }
  };

  const currentPlayer = players.find((p) => p.id === currentPlayerId);
  const dealer = players.find((p) => p.is_dealer);
  const nonDealerPlayers = players
    .filter((p) => !p.is_dealer)
    .sort((a, b) => a.player_order - b.player_order);

  // ตาของใครในการจั่ว
  const currentTurnPlayer =
    room.game_phase === "drawing"
      ? nonDealerPlayers[room.current_player_index]
      : null;

  // เป็นตาของผู้เล่นปัจจุบันหรือไม่
  const isMyTurn = currentTurnPlayer?.id === currentPlayerId;

  // เจ้ามือยังไม่ได้เลือกจั่ว/ไม่จั่ว
  const isDealerTurn =
    room.game_phase === "showdown" && dealer && !dealer.has_drawn;
  const isCurrentPlayerDealer = currentPlayer?.is_dealer;

  // ทุกคน (รวมเจ้ามือ) เลือกจั่ว/ไม่จั่วเสร็จแล้วหรือยัง
  const allPlayersReady = players.every((p) => p.has_drawn);

  // นับจำนวนผู้เล่นที่พร้อมแล้ว
  const readyPlayersCount = players.filter((p) => p.has_drawn).length;
  const totalPlayersCount = players.length;

  // ทุกคนเล่นเสร็จแล้วหรือยัง
  const showCards =
    room.game_phase === "showdown" || room.game_phase === "ended";

  // ใช้ LIVE mode หรือไม่ (isHost + isLiveMode = แสดงหน้าจอ LIVE)
  const showLiveDisplay = isHost && isLiveMode;

  // LIVE mode: Host ไม่มี player แต่ยังควบคุมจอได้
  const isLiveHost = isLiveMode && !currentPlayerId;

  // Auto-showdown: เปิดไพ่อัตโนมัติเมื่อทุกคนพร้อมแล้ว
  const hasAutoShowdown = useRef(false);

  useEffect(() => {
    // ถ้าทุกคนพร้อมแล้วใน showdown phase และยังไม่ได้เปิดไพ่อัตโนมัติ
    if (
      room.game_phase === "showdown" &&
      allPlayersReady &&
      !hasAutoShowdown.current
    ) {
      hasAutoShowdown.current = true;
      // รอ 1 วินาที แล้วเปิดไพ่อัตโนมัติ
      const timer = setTimeout(() => {
        onShowdown();
      }, 1000);
      return () => clearTimeout(timer);
    }

    // Reset flag เมื่อเริ่มเกมใหม่
    if (room.game_phase === "drawing" || room.game_phase === "waiting") {
      hasAutoShowdown.current = false;
    }
  }, [room.game_phase, allPlayersReady, onShowdown]);

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col p-2 sm:p-4 md:p-6 relative overflow-hidden">
      {/* Background Image - same as Doraemon */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-sm scale-105"
        style={{
          backgroundImage: `url('${import.meta.env.BASE_URL}bg-game.jpg')`,
        }}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Header */}
      <header className="flex items-center justify-between mb-2 sm:mb-4 relative z-10">
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onLeave}
            className="text-white/70 hover:text-red-400 hover:bg-red-400/10 w-8 h-8 sm:w-10 sm:h-10"
          >
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
          <div>
            <h1 className="font-semibold text-white text-sm sm:text-lg">
              🎰 ไพ่ป๊อกเด้ง{" "}
              {showLiveDisplay && (
                <span className="text-amber-400">📺 LIVE</span>
              )}
            </h1>
            <button
              onClick={copyRoomCode}
              className="flex items-center gap-1 text-xs sm:text-sm text-white/60 hover:text-white transition-colors"
            >
              <span className="font-mono bg-white/10 px-1.5 sm:px-2 py-0.5 rounded text-xs sm:text-sm">
                {room.code}
              </span>
              <Copy className="w-3 h-3" />
              {/* WebSocket Status */}
              <div className="flex items-center gap-1 ml-1 bg-green-500/20 border border-green-500/50 rounded-full px-1.5 py-0.5">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                <span className="text-[10px] text-green-300 font-medium">
                  LIVE
                </span>
              </div>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(isHost || (isLiveMode && !currentPlayerId)) &&
            !room.game_started && (
              <Button
                variant="default"
                onClick={onStartGame}
                disabled={players.length < 2}
                className="bg-white text-black hover:bg-white/90 text-xs sm:text-sm px-3 sm:px-4"
              >
                <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">เริ่มเกม</span>
                <span className="sm:hidden">เริ่ม</span>
              </Button>
            )}
        </div>
      </header>

      {/* Player List */}
      <div className="mb-2 sm:mb-4">
        <PlayerList
          players={players.map((p) => ({
            id: p.id,
            name: p.name,
            is_host: p.is_host,
            avatar: p.avatar,
          }))}
          currentPlayerId={currentPlayerId ?? undefined}
        />
      </div>

      {/* Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center py-2 sm:py-4 md:py-6 relative z-10 overflow-y-auto">
        {!room.game_started ? (
          /* Waiting Room */
          <div className="text-center px-2 w-full max-w-2xl">
            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-5 sm:p-8 mb-4 sm:mb-6 border border-white/10">
              <WaitingForPlayersAnimation />
              <p className="text-white/60 text-xs sm:text-sm mt-2">
                {isHost
                  ? isLiveMode
                    ? "📺 โหมด LIVE - แชร์รหัสห้องให้เพื่อนๆ เข้ามาเล่น"
                    : 'แชร์รหัสห้องให้เพื่อนๆ แล้วกด "เริ่มเกม"'
                  : "รอ Host เริ่มเกม"}
              </p>
            </div>

            {/* เลือกเจ้ามือ - สำหรับ Host (รวมโหมด LIVE) */}
            {(isHost || (isLiveMode && !currentPlayerId)) &&
              onSetDealer &&
              players.length >= 1 && (
                <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 sm:p-5 mb-4 sm:mb-6 border border-white/10">
                  <p className="text-white text-sm sm:text-base mb-3 font-medium">
                    🎰 เลือกเจ้ามือ
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {players.map((player) => (
                      <Button
                        key={player.id}
                        onClick={() => onSetDealer(player.id)}
                        variant={player.is_dealer ? "default" : "outline"}
                        className={`${
                          player.is_dealer
                            ? "bg-amber-500 hover:bg-amber-600 text-black"
                            : "border-white/30 text-white hover:bg-white/10"
                        }`}
                      >
                        {player.avatar && (
                          <img
                            src={`${import.meta.env.BASE_URL}${
                              player.avatar
                            }.jpg`}
                            alt={player.name}
                            className="w-6 h-6 rounded-full object-cover mr-2"
                          />
                        )}
                        <span className="truncate">{player.name}</span>
                        {player.is_dealer && <span className="ml-1">👑</span>}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

            <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 sm:p-5 inline-block border border-white/10">
              <p className="text-xs text-white/50 mb-1 sm:mb-2">รหัสห้อง</p>
              <button
                onClick={copyRoomCode}
                className="font-mono text-3xl sm:text-4xl font-bold text-white tracking-widest hover:opacity-80 transition-opacity"
              >
                {room.code}
              </button>
            </div>
          </div>
        ) : showLiveDisplay ? (
          /* ========== LIVE DISPLAY - จอใหญ่แสดงให้ทุกคนดู ========== */
          <div className="flex flex-col items-center justify-start w-full h-full">
            {/* Phase indicator - ใหญ่ขึ้น */}
            <div className="text-center mb-4 sm:mb-6">
              <span className="bg-amber-500/20 text-amber-400 px-6 sm:px-8 py-2 sm:py-3 rounded-full text-lg sm:text-xl md:text-2xl font-medium">
                {room.game_phase === "dealing" && "🃏 กำลังแจกไพ่..."}
                {room.game_phase === "drawing" &&
                  `🎴 ตา: ${currentTurnPlayer?.name || "..."}`}
                {room.game_phase === "showdown" &&
                  (isDealerTurn ? "🎰 ตาเจ้ามือ" : "🏆 เปิดไพ่!")}
                {room.game_phase === "ended" && "🎊 จบรอบ"}
              </span>
            </div>

            {/* เจ้ามือ - ขนาดใหญ่ */}
            {dealer && (
              <div className="w-full max-w-xl mb-4 sm:mb-6">
                <DisplayPlayerHand
                  player={dealer}
                  showCards={true}
                  isCurrentTurn={isDealerTurn}
                  isLarge={true}
                />
              </div>
            )}

            {/* ผู้เล่นทั้งหมด - Grid responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 w-full max-w-4xl px-2">
              {nonDealerPlayers.map((player, index) => (
                <DisplayPlayerHand
                  key={player.id}
                  player={player}
                  showCards={true}
                  isCurrentTurn={
                    room.current_player_index === index &&
                    room.game_phase === "drawing"
                  }
                  isLarge={true}
                />
              ))}
            </div>

            {/* Host controls on LIVE display - แค่เปิดไพ่และเล่นรอบต่อไป */}
            <div className="flex flex-col items-center gap-3 py-4 sm:py-6 mt-4">
              {/* แสดงสถานะ realtime */}
              {room.game_phase === "showdown" && (
                <div className="bg-blue-500/20 border border-blue-500/50 rounded-xl px-6 py-4 mb-2">
                  <p className="text-blue-300 text-center text-sm">
                    ⏱️ สถานะ: {readyPlayersCount}/{totalPlayersCount} คนพร้อม
                    <br />
                    <span className="text-xs text-blue-200/60">
                      {players
                        .map((p) => `${p.name}: ${p.has_drawn ? "✓" : "⏳"}`)
                        .join(" | ")}
                    </span>
                  </p>
                </div>
              )}

              {/* ตาเจ้ามือ - แสดงแค่ข้อความให้ใช้มือถือ */}
              {isDealerTurn && (
                <div className="bg-amber-500/20 border border-amber-500/50 rounded-xl px-6 py-4">
                  <p className="text-amber-400 font-medium text-center text-lg">
                    🎰 ถึงตาเจ้ามือแล้ว
                    <br />
                    <span className="text-sm text-amber-300/70">
                      เจ้ามือใช้มือถือเลือกจั่วหรือไม่จั่ว
                    </span>
                  </p>
                </div>
              )}

              {/* ปุ่มเปิดไพ่ - แสดงเสมอในโหมด showdown สำหรับ LIVE Host */}
              {room.game_phase === "showdown" && (
                <div className="flex flex-col gap-2 items-center">
                  <Button
                    onClick={onShowdown}
                    disabled={!allPlayersReady}
                    size="lg"
                    className={`font-bold text-lg px-8 py-6 ${
                      allPlayersReady
                        ? "bg-purple-500 hover:bg-purple-600 text-white animate-pulse"
                        : "bg-gray-600 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <Eye className="w-6 h-6 mr-2" />
                    {allPlayersReady
                      ? "เปิดไพ่ตัดสิน"
                      : `รอผู้เล่น (${readyPlayersCount}/${totalPlayersCount})`}
                  </Button>

                  {/* ปุ่มบังคับเปิด (กรณี sync ไม่ทัน) */}
                  {!allPlayersReady &&
                    readyPlayersCount >= totalPlayersCount - 1 && (
                      <Button
                        onClick={onShowdown}
                        variant="outline"
                        size="sm"
                        className="text-xs text-orange-400 border-orange-500/50 hover:bg-orange-500/20"
                      >
                        บังคับเปิดไพ่ทันที
                      </Button>
                    )}
                </div>
              )}

              {room.game_phase === "ended" && (
                <Button
                  onClick={onNextRound}
                  size="lg"
                  className="bg-green-500 hover:bg-green-600 text-white font-bold text-lg px-8"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  เล่นรอบต่อไป
                </Button>
              )}
            </div>

            {/* Instructions for LIVE display */}
            {room.game_phase === "drawing" && (
              <div className="mt-4 bg-black/40 backdrop-blur-md rounded-xl px-6 py-4 border border-white/10">
                <p className="text-white/50 text-sm sm:text-base text-center">
                  📺 หน้าจอ LIVE แสดงให้ทุกคนดู
                  <br />
                  ผู้เล่นใช้มือถือเลือกจั่วหรือหยุด
                </p>
              </div>
            )}
          </div>
        ) : (
          /* ========== PLAYER VIEW - มือถือทุกคน (รวมเจ้ามือ) ========== */
          <div className="flex flex-col items-center justify-center w-full h-full">
            {/* Phase indicator */}
            <div className="text-center mb-4">
              <span className="bg-amber-500/20 text-amber-400 px-4 py-1 rounded-full text-sm">
                {room.game_phase === "dealing" && "🃏 กำลังแจกไพ่..."}
                {room.game_phase === "drawing" &&
                  (isMyTurn
                    ? "🎴 ถึงตาคุณแล้ว!"
                    : isCurrentPlayerDealer
                    ? "🎰 รอผู้เล่นอื่นเล่นก่อน..."
                    : `🎴 ตา: ${currentTurnPlayer?.name || "..."}`)}
                {room.game_phase === "showdown" &&
                  (isDealerTurn && isCurrentPlayerDealer
                    ? "🎰 ถึงตาคุณแล้ว!"
                    : isDealerTurn
                    ? "🎰 รอเจ้ามือ"
                    : "🏆 รอเปิดไพ่")}
                {room.game_phase === "ended" && "🎊 จบรอบ"}
              </span>
            </div>

            {/* My cards (large display) */}
            {currentPlayer && (
              <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/10 mb-4 w-full max-w-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {currentPlayer.avatar && (
                      <img
                        src={`${import.meta.env.BASE_URL}${
                          currentPlayer.avatar
                        }.jpg`}
                        alt={currentPlayer.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-white/40"
                      />
                    )}
                    <span className="text-white font-bold text-lg">
                      {currentPlayer.is_dealer
                        ? "🎰 คุณ (เจ้ามือ)"
                        : "🎮 ไพ่ของคุณ"}
                    </span>
                  </div>
                  {currentPlayer.cards.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-amber-400">
                        {currentPlayer.points}
                      </span>
                      {currentPlayer.cards.length === 2 &&
                        isPok(currentPlayer.cards).isPok && (
                          <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full animate-bounce">
                            ป๊อก {isPok(currentPlayer.cards).pokValue}!
                          </span>
                        )}
                      {currentPlayer.cards.length > 0 &&
                        getSpecialHand(currentPlayer.cards)?.type !==
                          "normal" &&
                        !isPok(currentPlayer.cards).isPok && (
                          <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full">
                            {getSpecialHand(currentPlayer.cards)?.name}
                          </span>
                        )}
                    </div>
                  )}
                </div>

                {/* Large cards */}
                <div className="flex gap-3 justify-center mb-4">
                  {currentPlayer.cards.map((card, i) => (
                    <LargeCard key={i} card={card} />
                  ))}
                  {currentPlayer.cards.length === 0 && (
                    <div className="w-20 h-28 rounded-xl border-2 border-dashed border-white/30 flex items-center justify-center">
                      <span className="text-white/30">-</span>
                    </div>
                  )}
                </div>

                {/* Player result */}
                {currentPlayer.result &&
                  showCards &&
                  !currentPlayer.is_dealer && (
                    <div className="text-center">
                      <span
                        className={`text-lg font-bold px-4 py-2 rounded-full ${
                          currentPlayer.result === "player_win"
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {currentPlayer.result === "player_win"
                          ? "🎉 คุณชนะ!"
                          : "😢 คุณแพ้"}
                        {currentPlayer.multiplier > 1 &&
                          ` x${currentPlayer.multiplier}`}
                      </span>
                    </div>
                  )}
              </div>
            )}

            {/* Action buttons for regular players */}
            {!isCurrentPlayerDealer &&
              isMyTurn &&
              !currentPlayer?.has_drawn &&
              currentPlayer!.cards.length < 3 &&
              room.game_phase === "drawing" && (
                <div className="flex gap-4 justify-center">
                  <Button
                    onClick={onDrawCard}
                    size="lg"
                    className="bg-green-500 hover:bg-green-600 text-white text-lg px-8 py-6"
                  >
                    <Hand className="w-5 h-5 mr-2" />
                    จั่ว
                  </Button>
                  <Button
                    onClick={onStandCard}
                    variant="outline"
                    size="lg"
                    className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-6"
                  >
                    <Square className="w-5 h-5 mr-2" />
                    หยุด
                  </Button>
                </div>
              )}

            {/* Action buttons for dealer */}
            {isCurrentPlayerDealer &&
              isDealerTurn &&
              !currentPlayer?.has_drawn && (
                <div className="flex flex-col items-center gap-3">
                  <p className="text-amber-400 font-medium text-center mb-2">
                    ถึงตาคุณแล้ว เลือกจั่วหรือไม่จั่ว
                  </p>
                  <div className="flex gap-4 justify-center">
                    {currentPlayer!.cards.length < 3 && (
                      <Button
                        onClick={onDealerDraw}
                        size="lg"
                        className="bg-amber-500 hover:bg-amber-600 text-black text-lg px-8 py-6 font-bold"
                      >
                        <Hand className="w-5 h-5 mr-2" />
                        จั่วไพ่
                      </Button>
                    )}
                    <Button
                      onClick={onDealerStand}
                      variant="outline"
                      size="lg"
                      className="border-amber-500/50 text-amber-400 hover:bg-amber-500/20 text-lg px-8 py-6"
                    >
                      <Square className="w-5 h-5 mr-2" />
                      ไม่จั่ว
                    </Button>
                  </div>
                </div>
              )}

            {/* Host controls (when not in LIVE mode, host controls from phone) */}
            {(isHost || (isLiveMode && !currentPlayerId)) && !isLiveMode && (
              <div className="flex justify-center gap-3 py-4">
                {/* ปุ่มเปิดไพ่ - แสดงเมื่อทุกคนพร้อมแล้ว */}
                {room.game_phase === "showdown" && allPlayersReady && (
                  <Button
                    onClick={onShowdown}
                    size="lg"
                    className="bg-purple-500 hover:bg-purple-600 text-white font-bold px-8 py-6 animate-pulse"
                  >
                    <Eye className="w-5 h-5 mr-2" />
                    เปิดไพ่ตัดสิน
                  </Button>
                )}

                {room.game_phase === "ended" && (
                  <Button
                    onClick={onNextRound}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    เล่นรอบต่อไป
                  </Button>
                )}
              </div>
            )}

            {/* Waiting message */}
            {!isMyTurn &&
              !isDealerTurn &&
              room.game_phase === "drawing" &&
              currentPlayer?.has_drawn && (
                <div className="text-center text-white/50">
                  <p>✓ คุณจบตาแล้ว รอผู้เล่นอื่น...</p>
                </div>
              )}

            {!isMyTurn &&
              !isDealerTurn &&
              room.game_phase === "drawing" &&
              !currentPlayer?.has_drawn &&
              !isCurrentPlayerDealer && (
                <div className="text-center text-white/50">
                  <p>รอตาคุณ...</p>
                </div>
              )}
          </div>
        )}
      </div>

      {/* Rules toggle */}
      <div className="relative z-10 mt-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowRules(!showRules)}
          className="w-full text-white/50 hover:text-white/80"
        >
          {showRules ? "ซ่อนกติกา ▲" : "ดูกติกา ▼"}
        </Button>

        {showRules && (
          <div className="bg-black/60 backdrop-blur-md rounded-xl p-3 mt-2 border border-white/10">
            <ul className="text-white/60 text-xs space-y-1">
              <li>• ป๊อก 8/9 = ชนะทันที (จ่าย 2 เท่า)</li>
              <li>• ไพ่ตอง = จ่าย 5 เท่า</li>
              <li>• สามเหลือง/เรียง/สี = จ่าย 3 เท่า</li>
              <li>• เด้ง (คู่/ดอกเดียวกัน) = จ่าย 2 เท่า</li>
              <li>• แต้มเท่ากัน = เจ้ามือชนะ</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
