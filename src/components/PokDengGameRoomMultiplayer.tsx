import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { PlayerList } from "@/components/PlayerList";
import { LivePlayerList } from "@/components/LivePlayerList";
import { WaitingForPlayersAnimation } from "@/components/WaitingForPlayersAnimation";
import { CardBackPattern } from "@/components/CardBackPattern";
import { LoginButton } from "@/components/LoginButton";
import { t } from "@/lib/i18n";
import {
  PokDengCard,
  getSuitEmoji,
  getSuitColor,
  isPok,
  getSpecialHand,
} from "@/lib/pokDengRules";
import { PokDengRoom, PokDengPlayer } from "@/hooks/usePokDengRoom";
import {
  Copy,
  LogOut,
  Play,
  RotateCcw,
  Hand,
  Square,
  Eye,
  Crown,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PokDengRuleEditor } from "@/components/PokDengRuleEditor";

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
    <div className="w-20 h-28 sm:w-28 sm:h-40 md:w-32 md:h-48 lg:w-40 lg:h-56 rounded-xl bg-white border-2 border-gray-200 shadow-xl flex flex-col items-center justify-center">
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
    </div>
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
        {player.cards && player.cards.length > 0 ? (
          player.cards.map((card, i) => (
            <DisplayCard key={i} card={card} faceDown={!showCards} />
          ))
        ) : (
          <div
            className={`${
              isLarge ? "w-28 h-40 sm:w-32 sm:h-48" : "w-16 h-24"
            } rounded-lg border-2 border-dashed border-white/30 flex items-center justify-center`}
          >
            <span className="text-white/30 text-sm">ไม่มีไพ่</span>
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
  const [showDealerDialog, setShowDealerDialog] = useState(false);

  const copyRoomCode = () => {
    const code = room.code;

    // ใช้ Clipboard API ถ้ามี
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(code)
        .then(() => {
          toast({
            title: "✅ คัดลอกรหัสห้องแล้ว!",
            description: `รหัส: ${code}`,
            duration: 3000,
          });
        })
        .catch(() => {
          fallbackCopyTextToClipboard(code);
        });
    } else {
      fallbackCopyTextToClipboard(code);
    }
  };

  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.width = "2em";
    textArea.style.height = "2em";
    textArea.style.padding = "0";
    textArea.style.border = "none";
    textArea.style.outline = "none";
    textArea.style.boxShadow = "none";
    textArea.style.background = "transparent";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand("copy");
      toast({
        title: "✅ คัดลอกรหัสห้องแล้ว!",
        description: `รหัส: ${text}`,
        duration: 3000,
      });
    } catch (err) {
      toast({
        title: "📋 รหัสห้อง",
        description: `${text} (กรุณาคัดลอกด้วยมือ)`,
        duration: 5000,
      });
    }
    document.body.removeChild(textArea);
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
          {/* ปุ่มเชิญเพื่อน */}
          <LoginButton
            currentRoomCode={room.code}
            currentGameType="pokdeng"
            currentGameName={t("pokDeng")}
          />
          {/* ปุ่มเปลี่ยนเจ้ามือ - Host เท่านั้น */}
          {(isHost || (isLiveMode && !currentPlayerId)) && onSetDealer && (
            <Dialog open={showDealerDialog} onOpenChange={setShowDealerDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 w-8 h-8 sm:w-10 sm:h-10"
                  title="เปลี่ยนเจ้ามือ"
                >
                  <Crown className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-black/95 border-amber-500/50 text-white max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-amber-400 text-xl">
                    🎰 เลือกเจ้ามือใหม่
                  </DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {players.map((player) => (
                    <Button
                      key={player.id}
                      onClick={() => {
                        onSetDealer(player.id);
                        setShowDealerDialog(false);
                        toast({
                          title: "✅ เปลี่ยนเจ้ามือแล้ว",
                          description: `${player.name} เป็นเจ้ามือคนใหม่`,
                        });
                      }}
                      variant={player.is_dealer ? "default" : "outline"}
                      className={`h-auto py-3 ${
                        player.is_dealer
                          ? "bg-amber-500 hover:bg-amber-600 text-black border-amber-400"
                          : "border-white/30 text-white hover:bg-white/10"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2 w-full">
                        {player.avatar && (
                          <img
                            src={`${import.meta.env.BASE_URL}${
                              player.avatar
                            }.jpg`}
                            alt={player.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-white/40"
                          />
                        )}
                        <span className="text-sm font-medium truncate max-w-full">
                          {player.name}
                        </span>
                        {player.is_dealer && (
                          <span className="text-xl">👑</span>
                        )}
                      </div>
                    </Button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* ปุ่มแก้ไขกติกา */}
          {(isHost || (isLiveMode && !currentPlayerId)) && (
            <PokDengRuleEditor roomCode={room.code} isHost={true} />
          )}

          {/* ปุ่มรีเซ็ตเกม - สำหรับโหมด LIVE */}
          {(isHost || (isLiveMode && !currentPlayerId)) &&
            room.game_started && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onNextRound}
                className="text-green-400 hover:text-green-300 hover:bg-green-400/10 w-8 h-8 sm:w-10 sm:h-10"
                title="รีเซ็ตเกม / เล่นรอบใหม่"
              >
                <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            )}

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

      {/* Player List - ใช้ LivePlayerList สำหรับโหมด LIVE */}
      <div className="mb-2 sm:mb-4">
        {showLiveDisplay ? (
          <LivePlayerList
            players={players.map((p) => ({
              id: p.id,
              name: p.name,
              is_host: p.is_host,
              avatar: p.avatar,
              cards: p.cards,
              points: p.points,
              is_dealer: p.is_dealer,
              has_drawn: p.has_drawn,
              result: p.result ?? undefined,
              multiplier: p.multiplier,
            }))}
            currentPlayerId={currentPlayerId ?? undefined}
            showCards={showCards || room.game_started}
            currentTurnPlayerId={currentTurnPlayer?.id}
            gamePhase={room.game_phase ?? undefined}
          />
        ) : (
          <PlayerList
            players={players.map((p) => ({
              id: p.id,
              name: p.name,
              is_host: p.is_host,
              avatar: p.avatar,
            }))}
            currentPlayerId={currentPlayerId ?? undefined}
          />
        )}
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
          <div className="flex flex-col items-center justify-start w-full h-full overflow-y-auto">
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

            {/* Debug: แสดงจำนวน players */}
            <div className="text-white text-sm mb-4 bg-black/50 p-3 rounded">
              <div>ผู้เล่นทั้งหมด: {players.length} คน</div>
              <div>เจ้ามือ: {dealer?.name || "ไม่มี"}</div>
              <div>
                พร้อม: {readyPlayersCount}/{totalPlayersCount}
              </div>
              {players.map((p) => (
                <div key={p.id} className="text-xs">
                  {p.name}: cards={p.cards?.length || 0} ไพ่
                </div>
              ))}
            </div>

            {/* แสดงไพ่และผลลัพธ์ทุกคน - แบบโดเรม่อน */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-6xl px-4">
              {players.length === 0 ? (
                <div className="col-span-full text-white text-center text-xl bg-red-500/20 p-8 rounded">
                  ⚠️ ไม่มีผู้เล่น - players.length = 0
                </div>
              ) : (
                players.map((player) => (
                  <div
                    key={player.id}
                    className={`p-6 rounded-2xl border-2 ${
                      player.is_dealer
                        ? "bg-amber-500/20 border-amber-500"
                        : "bg-white/5 border-white/20"
                    }`}
                  >
                    {/* ชื่อผู้เล่น + Avatar */}
                    <div className="flex items-center gap-3 mb-4">
                      {player.avatar && (
                        <img
                          src={`${import.meta.env.BASE_URL}${
                            player.avatar
                          }.jpg`}
                          alt={player.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-white/40"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold text-lg">
                            {player.is_dealer ? "👑 " : ""}
                            {player.name}
                          </span>
                          {player.is_dealer && (
                            <span className="text-xs bg-amber-500 text-black px-2 py-0.5 rounded-full">
                              เจ้ามือ
                            </span>
                          )}
                        </div>
                        {/* คะแนน */}
                        <div className="text-2xl font-bold text-amber-400">
                          {player.points || 0} แต้ม
                        </div>
                      </div>
                    </div>

                    {/* ไพ่ - แสดงตลอดเวลา */}
                    <div className="flex gap-2 justify-center mb-4 min-h-[100px]">
                      {player.cards && player.cards.length > 0 ? (
                        player.cards.map((card, i) => (
                          <div
                            key={i}
                            className="w-16 h-24 rounded-lg bg-white border-2 border-gray-200 shadow-lg flex flex-col items-center justify-center"
                          >
                            <span
                              className={`text-xl font-bold ${
                                card.suit === "hearts" ||
                                card.suit === "diamonds"
                                  ? "text-red-500"
                                  : "text-black"
                              }`}
                            >
                              {card.value}
                            </span>
                            <span className="text-2xl">
                              {card.suit === "hearts" && "♥"}
                              {card.suit === "diamonds" && "♦"}
                              {card.suit === "clubs" && "♣"}
                              {card.suit === "spades" && "♠"}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-white bg-red-500/30 p-4 rounded text-sm">
                          ⚠️ player.cards = {JSON.stringify(player.cards)}
                          <br />
                          length = {player.cards?.length || 0}
                        </div>
                      )}
                    </div>

                    {/* ผลลัพธ์ */}
                    <div className="text-center">
                      {player.result && room.game_phase === "ended" ? (
                        <div
                          className={`inline-block px-4 py-2 rounded-full text-lg font-bold ${
                            player.result === "player_win"
                              ? "bg-green-500 text-white"
                              : "bg-red-500 text-white"
                          }`}
                        >
                          {player.result === "player_win"
                            ? "🎉 ชนะ!"
                            : "😢 แพ้"}
                          {player.multiplier &&
                            player.multiplier > 1 &&
                            ` x${player.multiplier}`}
                        </div>
                      ) : !player.has_drawn ? (
                        <span className="text-sm text-yellow-300 animate-pulse">
                          ⏳ รอเลือก...
                        </span>
                      ) : (
                        <span className="text-sm text-green-300">
                          ✓ พร้อมแล้ว
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Host controls on LIVE display - แค่เปิดไพ่และเล่นรอบต่อไป */}
            <div className="flex flex-col items-center gap-3 py-4 sm:py-6 mt-4">
              {/* ปุ่มเปลี่ยนเจ้ามือใน LIVE */}
              {(isHost || (isLiveMode && !currentPlayerId)) &&
                onSetDealer &&
                room.game_phase !== "ended" && (
                  <Button
                    onClick={() => setShowDealerDialog(true)}
                    variant="outline"
                    size="sm"
                    className="border-amber-500/50 text-amber-400 hover:bg-amber-500/20 hover:text-amber-300"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    เปลี่ยนเจ้ามือ
                  </Button>
                )}

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
                <>
                  {/* ตารางสรุปผลการแข่งขัน */}
                  <div className="w-full max-w-4xl bg-black/60 backdrop-blur-md rounded-2xl border-2 border-amber-500/50 p-6 mb-6">
                    <h2 className="text-center text-2xl sm:text-3xl font-bold text-amber-400 mb-6">
                      🏆 สรุปผลการแข่งขัน
                    </h2>

                    <div className="overflow-x-auto">
                      <table className="w-full text-white">
                        <thead>
                          <tr className="border-b-2 border-white/20">
                            <th className="text-left py-3 px-4 font-bold text-amber-300">
                              อันดับ
                            </th>
                            <th className="text-left py-3 px-4 font-bold text-amber-300">
                              ผู้เล่น
                            </th>
                            <th className="text-center py-3 px-4 font-bold text-amber-300">
                              คะแนน
                            </th>
                            <th className="text-center py-3 px-4 font-bold text-amber-300">
                              ไพ่
                            </th>
                            <th className="text-center py-3 px-4 font-bold text-amber-300">
                              ผลลัพธ์
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {players
                            .sort((a, b) => {
                              // เรียงตามผลลัพธ์: ชนะ > แพ้
                              if (
                                a.result === "player_win" &&
                                b.result !== "player_win"
                              )
                                return -1;
                              if (
                                a.result !== "player_win" &&
                                b.result === "player_win"
                              )
                                return 1;
                              // ถ้าผลเท่ากัน เรียงตามคะแนน
                              return (b.points || 0) - (a.points || 0);
                            })
                            .map((player, index) => (
                              <tr
                                key={player.id}
                                className={`border-b border-white/10 transition-all hover:bg-white/5 ${
                                  player.result === "player_win"
                                    ? "bg-green-500/10"
                                    : "bg-red-500/5"
                                }`}
                              >
                                {/* อันดับ */}
                                <td className="py-4 px-4 text-center">
                                  <span
                                    className={`text-2xl font-bold ${
                                      index === 0 &&
                                      player.result === "player_win"
                                        ? "text-amber-400"
                                        : "text-white/60"
                                    }`}
                                  >
                                    {index === 0 &&
                                    player.result === "player_win"
                                      ? "👑"
                                      : index + 1}
                                  </span>
                                </td>

                                {/* ชื่อผู้เล่น + Avatar */}
                                <td className="py-4 px-4">
                                  <div className="flex items-center gap-3">
                                    {player.avatar && (
                                      <img
                                        src={`${import.meta.env.BASE_URL}${
                                          player.avatar
                                        }.jpg`}
                                        alt={player.name}
                                        className="w-10 h-10 rounded-full object-cover border-2 border-white/30"
                                      />
                                    )}
                                    <div>
                                      <div className="font-bold text-base sm:text-lg flex items-center gap-2">
                                        {player.name}
                                        {player.is_dealer && (
                                          <span className="text-xs bg-amber-500 text-black px-2 py-0.5 rounded-full">
                                            เจ้ามือ
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </td>

                                {/* คะแนน */}
                                <td className="py-4 px-4 text-center">
                                  <span className="text-2xl sm:text-3xl font-bold text-amber-400">
                                    {player.points || 0}
                                  </span>
                                  <span className="text-white/50 text-sm ml-1">
                                    แต้ม
                                  </span>
                                </td>

                                {/* ไพ่ */}
                                <td className="py-4 px-4">
                                  <div className="flex gap-1 justify-center">
                                    {player.cards && player.cards.length > 0 ? (
                                      player.cards.map((card, i) => (
                                        <div
                                          key={i}
                                          className="w-8 h-12 sm:w-10 sm:h-14 rounded bg-white border border-gray-200 flex flex-col items-center justify-center text-xs"
                                        >
                                          <span
                                            className={`font-bold ${
                                              card.suit === "hearts" ||
                                              card.suit === "diamonds"
                                                ? "text-red-500"
                                                : "text-black"
                                            }`}
                                          >
                                            {card.value}
                                          </span>
                                          <span className="text-sm">
                                            {card.suit === "hearts" && "♥"}
                                            {card.suit === "diamonds" && "♦"}
                                            {card.suit === "clubs" && "♣"}
                                            {card.suit === "spades" && "♠"}
                                          </span>
                                        </div>
                                      ))
                                    ) : (
                                      <span className="text-white/30 text-xs">
                                        -
                                      </span>
                                    )}
                                  </div>
                                </td>

                                {/* ผลลัพธ์ */}
                                <td className="py-4 px-4 text-center">
                                  {player.result === "player_win" ? (
                                    <div className="flex flex-col items-center gap-1">
                                      <span className="text-2xl">🎉</span>
                                      <span className="text-green-400 font-bold text-sm sm:text-base">
                                        ชนะ!
                                      </span>
                                      {player.multiplier &&
                                        player.multiplier > 1 && (
                                          <span className="text-xs text-green-300 bg-green-500/20 px-2 py-0.5 rounded">
                                            x{player.multiplier}
                                          </span>
                                        )}
                                    </div>
                                  ) : (
                                    <div className="flex flex-col items-center gap-1">
                                      <span className="text-2xl">😢</span>
                                      <span className="text-red-400 font-bold text-sm sm:text-base">
                                        แพ้
                                      </span>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>

                    {/* สถิติเพิ่มเติม */}
                    <div className="mt-6 pt-4 border-t border-white/20 grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-3xl mb-1">🎯</div>
                        <div className="text-white/50 text-xs">ผู้ชนะ</div>
                        <div className="text-green-400 font-bold text-lg">
                          {
                            players.filter((p) => p.result === "player_win")
                              .length
                          }
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl mb-1">💔</div>
                        <div className="text-white/50 text-xs">ผู้แพ้</div>
                        <div className="text-red-400 font-bold text-lg">
                          {
                            players.filter((p) => p.result !== "player_win")
                              .length
                          }
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl mb-1">⭐</div>
                        <div className="text-white/50 text-xs">คะแนนสูงสุด</div>
                        <div className="text-amber-400 font-bold text-lg">
                          {Math.max(...players.map((p) => p.points || 0))}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl mb-1">👥</div>
                        <div className="text-white/50 text-xs">
                          ผู้เล่นทั้งหมด
                        </div>
                        <div className="text-white font-bold text-lg">
                          {players.length}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={onNextRound}
                    size="lg"
                    className="bg-green-500 hover:bg-green-600 text-white font-bold text-lg px-8"
                  >
                    <RotateCcw className="w-5 h-5 mr-2" />
                    เล่นรอบต่อไป
                  </Button>
                </>
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

            {/* ตารางสรุปผลเมื่อจบรอบ - แสดงในมือถือทุกคน */}
            {room.game_phase === "ended" && (
              <div className="w-full max-w-4xl bg-black/60 backdrop-blur-md rounded-2xl border-2 border-amber-500/50 p-4 sm:p-6 mb-4 overflow-y-auto max-h-[60vh]">
                <h2 className="text-center text-xl sm:text-2xl font-bold text-amber-400 mb-4">
                  🏆 สรุปผลการแข่งขัน
                </h2>

                <div className="overflow-x-auto">
                  <table className="w-full text-white text-sm">
                    <thead>
                      <tr className="border-b-2 border-white/20">
                        <th className="text-left py-2 px-2 font-bold text-amber-300 text-xs">
                          #
                        </th>
                        <th className="text-left py-2 px-2 font-bold text-amber-300 text-xs">
                          ผู้เล่น
                        </th>
                        <th className="text-center py-2 px-2 font-bold text-amber-300 text-xs">
                          แต้ม
                        </th>
                        <th className="text-center py-2 px-2 font-bold text-amber-300 text-xs">
                          ไพ่
                        </th>
                        <th className="text-center py-2 px-2 font-bold text-amber-300 text-xs">
                          ผล
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {players
                        .sort((a, b) => {
                          if (
                            a.result === "player_win" &&
                            b.result !== "player_win"
                          )
                            return -1;
                          if (
                            a.result !== "player_win" &&
                            b.result === "player_win"
                          )
                            return 1;
                          return (b.points || 0) - (a.points || 0);
                        })
                        .map((player, index) => (
                          <tr
                            key={player.id}
                            className={`border-b border-white/10 ${
                              player.result === "player_win"
                                ? "bg-green-500/10"
                                : "bg-red-500/5"
                            } ${
                              player.id === currentPlayerId
                                ? "ring-2 ring-amber-500"
                                : ""
                            }`}
                          >
                            <td className="py-3 px-2 text-center">
                              <span
                                className={`text-lg font-bold ${
                                  index === 0 && player.result === "player_win"
                                    ? "text-amber-400"
                                    : "text-white/60"
                                }`}
                              >
                                {index === 0 && player.result === "player_win"
                                  ? "👑"
                                  : index + 1}
                              </span>
                            </td>

                            <td className="py-3 px-2">
                              <div className="flex items-center gap-2">
                                {player.avatar && (
                                  <img
                                    src={`${import.meta.env.BASE_URL}${
                                      player.avatar
                                    }.jpg`}
                                    alt={player.name}
                                    className="w-8 h-8 rounded-full object-cover border-2 border-white/30"
                                  />
                                )}
                                <div className="flex flex-col">
                                  <span className="font-bold text-sm">
                                    {player.name}
                                    {player.id === currentPlayerId && (
                                      <span className="text-amber-400 ml-1">
                                        (คุณ)
                                      </span>
                                    )}
                                  </span>
                                  {player.is_dealer && (
                                    <span className="text-[10px] bg-amber-500 text-black px-1 rounded w-fit">
                                      เจ้ามือ
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-2 text-center">
                              <span className="text-xl font-bold text-amber-400">
                                {player.points || 0}
                              </span>
                            </td>

                            <td className="py-3 px-2">
                              <div className="flex gap-1 justify-center">
                                {player.cards && player.cards.length > 0 ? (
                                  player.cards.map((card, i) => (
                                    <div
                                      key={i}
                                      className="w-6 h-9 rounded bg-white border border-gray-200 flex flex-col items-center justify-center"
                                    >
                                      <span
                                        className={`text-[10px] font-bold ${
                                          card.suit === "hearts" ||
                                          card.suit === "diamonds"
                                            ? "text-red-500"
                                            : "text-black"
                                        }`}
                                      >
                                        {card.value}
                                      </span>
                                      <span className="text-xs">
                                        {card.suit === "hearts" && "♥"}
                                        {card.suit === "diamonds" && "♦"}
                                        {card.suit === "clubs" && "♣"}
                                        {card.suit === "spades" && "♠"}
                                      </span>
                                    </div>
                                  ))
                                ) : (
                                  <span className="text-white/30 text-xs">
                                    -
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="py-3 px-2 text-center">
                              {player.result === "player_win" ? (
                                <div className="flex flex-col items-center">
                                  <span className="text-xl">🎉</span>
                                  <span className="text-green-400 font-bold text-xs">
                                    ชนะ
                                  </span>
                                  {player.multiplier &&
                                    player.multiplier > 1 && (
                                      <span className="text-[10px] text-green-300 bg-green-500/20 px-1 rounded">
                                        x{player.multiplier}
                                      </span>
                                    )}
                                </div>
                              ) : (
                                <div className="flex flex-col items-center">
                                  <span className="text-xl">😢</span>
                                  <span className="text-red-400 font-bold text-xs">
                                    แพ้
                                  </span>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* สถิติเพิ่มเติม */}
                <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-4 gap-2">
                  <div className="text-center">
                    <div className="text-2xl mb-1">🎯</div>
                    <div className="text-white/50 text-[10px]">ชนะ</div>
                    <div className="text-green-400 font-bold text-sm">
                      {players.filter((p) => p.result === "player_win").length}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-1">💔</div>
                    <div className="text-white/50 text-[10px]">แพ้</div>
                    <div className="text-red-400 font-bold text-sm">
                      {players.filter((p) => p.result !== "player_win").length}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-1">⭐</div>
                    <div className="text-white/50 text-[10px]">แต้มสูงสุด</div>
                    <div className="text-amber-400 font-bold text-sm">
                      {Math.max(...players.map((p) => p.points || 0))}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-1">👥</div>
                    <div className="text-white/50 text-[10px]">ผู้เล่น</div>
                    <div className="text-white font-bold text-sm">
                      {players.length}
                    </div>
                  </div>
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
                    size="lg"
                    className="bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-6"
                  >
                    <RotateCcw className="w-5 h-5 mr-2" />
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
