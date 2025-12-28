import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
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

interface PokDengGameRoomMultiplayerProps {
  room: PokDengRoom;
  players: PokDengPlayer[];
  currentPlayerId: string | null;
  isHost: boolean;
  onStartGame: () => void;
  onDrawCard: () => void;
  onStandCard: () => void;
  onDealerDraw: () => void;
  onShowdown: () => void;
  onNextRound: () => void;
  onLeave: () => void;
}

// Component แสดงไพ่
function PokDengCardDisplay({
  card,
  faceDown = false,
  small = false,
}: {
  card: PokDengCard;
  faceDown?: boolean;
  small?: boolean;
}) {
  const sizeClass = small
    ? "w-10 h-14 sm:w-12 sm:h-18"
    : "w-14 h-20 sm:w-16 sm:h-24";

  if (faceDown) {
    return (
      <div
        className={`${sizeClass} rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 border-2 border-blue-400 shadow-lg flex items-center justify-center`}
      >
        <span className="text-xl">🎴</span>
      </div>
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-lg bg-white border-2 border-gray-300 shadow-lg flex flex-col items-center justify-center p-1`}
    >
      <span
        className={`${small ? "text-lg" : "text-xl"} font-bold ${getSuitColor(
          card.suit
        )}`}
      >
        {card.value}
      </span>
      <span className={`${small ? "text-xl" : "text-2xl"}`}>
        {getSuitEmoji(card.suit)}
      </span>
    </div>
  );
}

// Component แสดงผู้เล่นในรอ lobby
function WaitingPlayer({
  player,
  isCurrentUser,
}: {
  player: PokDengPlayer;
  isCurrentUser: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg ${
        isCurrentUser ? "bg-green-500/20 border border-green-500" : "bg-white/5"
      }`}
    >
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold">
        {player.name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1">
        <p className="text-white font-medium">
          {player.name}
          {isCurrentUser && (
            <span className="text-green-400 text-xs ml-2">(คุณ)</span>
          )}
        </p>
        {player.is_dealer && (
          <span className="text-xs bg-amber-500 text-black px-2 py-0.5 rounded-full">
            เจ้ามือ
          </span>
        )}
        {player.is_host && !player.is_dealer && (
          <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
            Host
          </span>
        )}
      </div>
    </div>
  );
}

// Component แสดงมือของผู้เล่น
function PlayerHand({
  player,
  isCurrentTurn,
  isCurrentUser,
  showCards,
  phase,
  onDraw,
  onStand,
}: {
  player: PokDengPlayer;
  isCurrentTurn: boolean;
  isCurrentUser: boolean;
  showCards: boolean;
  phase: string;
  onDraw?: () => void;
  onStand?: () => void;
}) {
  const pok =
    player.cards.length === 2
      ? isPok(player.cards)
      : { isPok: false, pokValue: null as 8 | 9 | null };
  const special = player.cards.length > 0 ? getSpecialHand(player.cards) : null;

  // ผู้เล่นเห็นไพ่ตัวเองเสมอ, คนอื่นเห็นเฉพาะตอน showdown
  const canSeeCards = isCurrentUser || showCards;

  return (
    <div
      className={`p-3 sm:p-4 rounded-xl border-2 transition-all ${
        player.is_dealer
          ? "bg-amber-500/20 border-amber-500"
          : isCurrentTurn
          ? "bg-green-500/20 border-green-500 animate-pulse"
          : isCurrentUser
          ? "bg-blue-500/10 border-blue-500/50"
          : "bg-white/5 border-white/20"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-white font-bold text-sm">
            {player.is_dealer ? "🎰 " : ""}
            {player.name}
            {isCurrentUser && (
              <span className="text-blue-400 text-xs ml-1">(คุณ)</span>
            )}
          </span>
          {player.is_dealer && (
            <span className="text-xs bg-amber-500 text-black px-2 py-0.5 rounded-full">
              เจ้ามือ
            </span>
          )}
        </div>
        {canSeeCards && player.cards.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-amber-400">
              {player.points}
            </span>
            {pok.isPok && pok.pokValue !== null && (
              <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full animate-bounce">
                ป๊อก {pok.pokValue}!
              </span>
            )}
            {special && special.type !== "normal" && !pok.isPok && (
              <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full">
                {special.name}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ไพ่ในมือ */}
      <div className="flex gap-1.5 justify-center mb-2">
        {player.cards.map((card, i) => (
          <PokDengCardDisplay
            key={i}
            card={card}
            faceDown={!canSeeCards}
            small
          />
        ))}
        {player.cards.length === 0 && (
          <div className="w-10 h-14 rounded-lg border-2 border-dashed border-white/30 flex items-center justify-center">
            <span className="text-white/30 text-xs">-</span>
          </div>
        )}
      </div>

      {/* ปุ่มจั่ว/หยุด - แสดงเฉพาะผู้เล่นตัวเอง */}
      {isCurrentTurn &&
        isCurrentUser &&
        !player.has_drawn &&
        player.cards.length < 3 &&
        phase === "drawing" && (
          <div className="flex gap-2 justify-center mt-2">
            <Button
              onClick={onDraw}
              className="bg-green-500 hover:bg-green-600 text-white"
              size="sm"
            >
              <Hand className="w-4 h-4 mr-1" />
              จั่ว
            </Button>
            <Button
              onClick={onStand}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
              size="sm"
            >
              <Square className="w-4 h-4 mr-1" />
              หยุด
            </Button>
          </div>
        )}

      {/* สถานะ */}
      {player.has_drawn && phase === "drawing" && (
        <div className="text-center mt-1">
          <span className="text-xs text-white/50">✓ จบตาแล้ว</span>
        </div>
      )}

      {/* ผลลัพธ์ */}
      {player.result && (phase === "showdown" || phase === "ended") && (
        <div className="mt-2 text-center">
          <span
            className={`text-sm font-bold px-3 py-1 rounded-full ${
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
  onStartGame,
  onDrawCard,
  onStandCard,
  onDealerDraw,
  onShowdown,
  onNextRound,
  onLeave,
}: PokDengGameRoomMultiplayerProps) {
  const { toast } = useToast();
  const [showRules, setShowRules] = useState(false);

  const copyRoomCode = async () => {
    const code = room.code;
    let copied = false;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(code);
        copied = true;
      }
    } catch (err) {}

    if (!copied) {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = code;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        copied = true;
      } catch (err) {}
    }

    toast({
      title: copied ? "✅ คัดลอกแล้ว!" : "📋 รหัสห้อง",
      description: code,
      duration: 3000,
    });
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

  // เช็คว่าทุกคนจั่วแล้วหรือยัง
  const allPlayersDrawn = nonDealerPlayers.every((p) => p.has_drawn);

  // เช็คว่าเป็นตาของเจ้ามือหรือยัง
  const isDealerTurn =
    room.game_phase === "showdown" && dealer && !dealer.has_drawn;

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col p-2 sm:p-4 relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('${import.meta.env.BASE_URL}bg-party.jpg')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-green-900/80 to-black/80" />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={copyRoomCode}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <span className="font-mono font-bold mr-1">{room.code}</span>
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <h1 className="text-lg font-bold text-white">🎰 ป๊อกเด้ง</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={onLeave}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>

        {/* Waiting for players */}
        {!room.game_started && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 sm:p-6 w-full max-w-md border border-green-500/30">
              <h2 className="text-xl font-bold text-white text-center mb-4">
                รอผู้เล่น ({players.length}/8)
              </h2>

              <div className="space-y-2 mb-6">
                {players.map((player) => (
                  <WaitingPlayer
                    key={player.id}
                    player={player}
                    isCurrentUser={player.id === currentPlayerId}
                  />
                ))}
              </div>

              <div className="text-center mb-4">
                <p className="text-white/60 text-sm">
                  แชร์รหัส{" "}
                  <span className="font-mono font-bold text-green-400">
                    {room.code}
                  </span>{" "}
                  ให้เพื่อน
                </p>
              </div>

              {isHost ? (
                <Button
                  className="w-full bg-green-500 hover:bg-green-600 text-white"
                  onClick={onStartGame}
                  disabled={players.length < 2}
                >
                  <Play className="w-4 h-4 mr-2" />
                  เริ่มเกม ({players.length} คน)
                </Button>
              ) : (
                <div className="text-center text-white/60">
                  <p>รอ Host เริ่มเกม...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Game in progress */}
        {room.game_started && (
          <>
            {/* Phase indicator */}
            <div className="text-center mb-3">
              <span className="bg-amber-500/20 text-amber-400 px-4 py-1 rounded-full text-sm">
                {room.game_phase === "dealing" && "🃏 กำลังแจกไพ่..."}
                {room.game_phase === "drawing" &&
                  `🎴 ตา: ${currentTurnPlayer?.name || "..."}`}
                {room.game_phase === "showdown" &&
                  (isDealerTurn ? "🎰 ตาเจ้ามือ" : "🏆 เปิดไพ่!")}
                {room.game_phase === "ended" && "🎊 จบรอบ"}
              </span>
            </div>

            {/* เจ้ามือ */}
            {dealer && (
              <div className="mb-4">
                <PlayerHand
                  player={dealer}
                  isCurrentTurn={isDealerTurn && dealer.id === currentPlayerId}
                  isCurrentUser={dealer.id === currentPlayerId}
                  showCards={
                    room.game_phase === "showdown" ||
                    room.game_phase === "ended"
                  }
                  phase={room.game_phase}
                  onDraw={onDealerDraw}
                  onStand={() => {}}
                />
              </div>
            )}

            {/* ผู้เล่น */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 overflow-y-auto mb-4">
              {nonDealerPlayers.map((player, index) => (
                <PlayerHand
                  key={player.id}
                  player={player}
                  isCurrentTurn={
                    room.current_player_index === index &&
                    room.game_phase === "drawing"
                  }
                  isCurrentUser={player.id === currentPlayerId}
                  showCards={
                    room.game_phase === "showdown" ||
                    room.game_phase === "ended"
                  }
                  phase={room.game_phase}
                  onDraw={onDrawCard}
                  onStand={onStandCard}
                />
              ))}
            </div>

            {/* ปุ่มควบคุม */}
            <div className="flex justify-center gap-3 py-3">
              {/* เจ้ามือกดจั่ว */}
              {isDealerTurn &&
                dealer?.id === currentPlayerId &&
                !dealer.has_drawn &&
                dealer.cards.length < 3 && (
                  <Button
                    onClick={onDealerDraw}
                    className="bg-amber-500 hover:bg-amber-600 text-black font-bold"
                  >
                    <Hand className="w-4 h-4 mr-2" />
                    จั่วไพ่
                  </Button>
                )}

              {/* Host กดเปิดไพ่ */}
              {room.game_phase === "showdown" && isHost && !isDealerTurn && (
                <Button
                  onClick={onShowdown}
                  className="bg-purple-500 hover:bg-purple-600 text-white font-bold"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  เปิดไพ่ตัดสิน
                </Button>
              )}

              {/* Host กดรอบต่อไป */}
              {room.game_phase === "ended" && isHost && (
                <Button
                  onClick={onNextRound}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  เล่นรอบต่อไป
                </Button>
              )}
            </div>
          </>
        )}

        {/* Rules toggle */}
        <div className="mt-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowRules(!showRules)}
            className="w-full text-white/50 hover:text-white/80"
          >
            {showRules ? "ซ่อนกติกา ▲" : "ดูกติกา ▼"}
          </Button>

          {showRules && (
            <div className="bg-black/50 rounded-xl p-3 mt-2 border border-white/10">
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
    </div>
  );
}
