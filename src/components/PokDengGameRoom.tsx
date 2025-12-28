import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  PokDengCard,
  getSuitEmoji,
  getSuitColor,
  calculateTotalPoints,
  getSpecialHand,
  isPok,
} from "@/lib/pokDengRules";
import { usePokDengGame, PokDengPlayer } from "@/hooks/usePokDengGame";
import { ArrowLeft, Plus, Play, RotateCcw, Hand, Square } from "lucide-react";

interface PokDengGameRoomProps {
  onBack: () => void;
}

// Component แสดงไพ่ 1 ใบ
function PokDengCardDisplay({
  card,
  faceDown = false,
}: {
  card: PokDengCard;
  faceDown?: boolean;
}) {
  if (faceDown) {
    return (
      <div className="w-16 h-24 sm:w-20 sm:h-28 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 border-2 border-blue-400 shadow-lg flex items-center justify-center">
        <span className="text-2xl">🎴</span>
      </div>
    );
  }

  return (
    <div className="w-16 h-24 sm:w-20 sm:h-28 rounded-lg bg-white border-2 border-gray-300 shadow-lg flex flex-col items-center justify-center p-1">
      <span
        className={`text-xl sm:text-2xl font-bold ${getSuitColor(card.suit)}`}
      >
        {card.value}
      </span>
      <span className="text-2xl sm:text-3xl">{getSuitEmoji(card.suit)}</span>
    </div>
  );
}

// Component แสดงผู้เล่น
function PlayerHand({
  player,
  isCurrentTurn,
  showCards,
  onDraw,
  onStand,
}: {
  player: PokDengPlayer;
  isCurrentTurn: boolean;
  showCards: boolean;
  onDraw?: () => void;
  onStand?: () => void;
}) {
  const special = player.cards.length > 0 ? getSpecialHand(player.cards) : null;
  const pok =
    player.cards.length === 2
      ? isPok(player.cards)
      : { isPok: false, pokValue: null as 8 | 9 | null };

  return (
    <div
      className={`p-3 sm:p-4 rounded-xl border-2 ${
        player.isDealer
          ? "bg-amber-500/20 border-amber-500"
          : isCurrentTurn
          ? "bg-green-500/20 border-green-500 animate-pulse"
          : "bg-white/10 border-white/20"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-white font-bold text-sm sm:text-base">
            {player.isDealer ? "🎰 " : ""}
            {player.name}
          </span>
          {player.isDealer && (
            <span className="text-xs bg-amber-500 text-black px-2 py-0.5 rounded-full">
              เจ้ามือ
            </span>
          )}
        </div>
        {showCards && player.cards.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-amber-400">
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
      <div className="flex gap-2 justify-center mb-2">
        {player.cards.map((card, i) => (
          <PokDengCardDisplay
            key={i}
            card={card}
            faceDown={!showCards && !player.isDealer}
          />
        ))}
        {player.cards.length === 0 && (
          <div className="w-16 h-24 sm:w-20 sm:h-28 rounded-lg border-2 border-dashed border-white/30 flex items-center justify-center">
            <span className="text-white/30 text-sm">ไม่มีไพ่</span>
          </div>
        )}
      </div>

      {/* ปุ่มจั่ว/หยุด */}
      {isCurrentTurn && !player.hasDrawn && player.cards.length < 3 && (
        <div className="flex gap-2 justify-center mt-2">
          <Button
            onClick={onDraw}
            className="bg-green-500 hover:bg-green-600 text-white"
            size="sm"
          >
            <Hand className="w-4 h-4 mr-1" />
            จั่วไพ่
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

      {/* ผลลัพธ์ */}
      {player.result && (
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

export function PokDengGameRoom({ onBack }: PokDengGameRoomProps) {
  const {
    gameState,
    initGame,
    dealCards,
    drawCard,
    standCard,
    showdown,
    nextRound,
    resetGame,
  } = usePokDengGame();

  const [playerNames, setPlayerNames] = useState<string[]>(["", ""]);
  const [setupMode, setSetupMode] = useState(true);

  const addPlayer = () => {
    if (playerNames.length < 6) {
      setPlayerNames([...playerNames, ""]);
    }
  };

  const removePlayer = (index: number) => {
    if (playerNames.length > 2) {
      setPlayerNames(playerNames.filter((_, i) => i !== index));
    }
  };

  const updatePlayerName = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
  };

  const startGame = () => {
    const validNames = playerNames.filter((n) => n.trim());
    if (validNames.length >= 2) {
      initGame(validNames);
      setSetupMode(false);
    }
  };

  const handleBack = () => {
    resetGame();
    setSetupMode(true);
    onBack();
  };

  // หน้าตั้งค่าผู้เล่น
  if (setupMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-black flex flex-col items-center justify-center p-4">
        <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 w-full max-w-md border border-green-500/30">
          <div className="flex items-center gap-3 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-white">🎴 ไพ่ป๊อกเด้ง</h1>
          </div>

          <p className="text-white/60 text-sm mb-4 text-center">
            ใส่ชื่อผู้เล่น (คนแรกเป็นเจ้ามือ)
          </p>

          <div className="space-y-3 mb-4">
            {playerNames.map((name, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder={
                    index === 0 ? "🎰 เจ้ามือ" : `ผู้เล่น ${index + 1}`
                  }
                  value={name}
                  onChange={(e) => updatePlayerName(index, e.target.value)}
                  className="flex-1 bg-white/10 border-green-500/30 text-white placeholder:text-white/40"
                />
                {playerNames.length > 2 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removePlayer(index)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                  >
                    ✕
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            {playerNames.length < 6 && (
              <Button
                variant="outline"
                onClick={addPlayer}
                className="flex-1 border-green-500/30 text-green-400 hover:bg-green-500/20"
              >
                <Plus className="w-4 h-4 mr-1" />
                เพิ่มผู้เล่น
              </Button>
            )}
            <Button
              onClick={startGame}
              disabled={playerNames.filter((n) => n.trim()).length < 2}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white"
            >
              <Play className="w-4 h-4 mr-1" />
              เริ่มเกม
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // หน้าเกม
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const dealer = gameState.players.find((p) => p.isDealer);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-black p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="text-white/70 hover:text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold text-white">🎴 ไพ่ป๊อกเด้ง</h1>
        <div className="text-white/60 text-sm">
          รอบที่ {gameState.roundNumber}
        </div>
      </div>

      {/* Phase indicator */}
      <div className="text-center mb-4">
        <span className="bg-amber-500/20 text-amber-400 px-4 py-1 rounded-full text-sm">
          {gameState.phase === "betting" && "🎯 รอแจกไพ่"}
          {gameState.phase === "dealing" && "🃏 กำลังแจกไพ่..."}
          {gameState.phase === "drawing" &&
            `🎴 ตา: ${currentPlayer?.name || "..."}`}
          {gameState.phase === "showdown" && "🏆 เปิดไพ่!"}
          {gameState.phase === "ended" && "🎊 จบรอบ"}
        </span>
      </div>

      {/* เจ้ามือ */}
      {dealer && (
        <div className="mb-6">
          <PlayerHand
            player={dealer}
            isCurrentTurn={
              gameState.phase === "drawing" && currentPlayer?.id === dealer.id
            }
            showCards={
              gameState.phase === "showdown" || gameState.phase === "ended"
            }
            onDraw={() => drawCard(dealer.id)}
            onStand={() => standCard(dealer.id)}
          />
        </div>
      )}

      {/* ผู้เล่น */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {gameState.players
          .filter((p) => !p.isDealer)
          .map((player) => (
            <PlayerHand
              key={player.id}
              player={player}
              isCurrentTurn={
                gameState.phase === "drawing" && currentPlayer?.id === player.id
              }
              showCards={true}
              onDraw={() => drawCard(player.id)}
              onStand={() => standCard(player.id)}
            />
          ))}
      </div>

      {/* ปุ่มควบคุม */}
      <div className="flex justify-center gap-3">
        {gameState.phase === "betting" && (
          <Button
            onClick={dealCards}
            className="bg-amber-500 hover:bg-amber-600 text-black font-bold"
            size="lg"
          >
            🃏 แจกไพ่
          </Button>
        )}

        {gameState.phase === "showdown" && (
          <Button
            onClick={showdown}
            className="bg-purple-500 hover:bg-purple-600 text-white font-bold"
            size="lg"
          >
            🏆 เปิดไพ่ตัดสิน
          </Button>
        )}

        {gameState.phase === "ended" && (
          <Button
            onClick={nextRound}
            className="bg-green-500 hover:bg-green-600 text-white font-bold"
            size="lg"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            เล่นรอบต่อไป
          </Button>
        )}
      </div>

      {/* กติกา */}
      <div className="mt-6 bg-black/30 rounded-xl p-4 border border-white/10">
        <h3 className="text-amber-400 font-bold mb-2">📜 กติกา</h3>
        <ul className="text-white/60 text-xs space-y-1">
          <li>• ป๊อก 8/9 = ชนะทันที (จ่าย 2 เท่า)</li>
          <li>• ไพ่ตอง = จ่าย 5 เท่า</li>
          <li>• สามเหลือง/เรียง/สี = จ่าย 3 เท่า</li>
          <li>• เด้ง (คู่/ดอกเดียวกัน) = จ่าย 2 เท่า</li>
          <li>• แต้มเท่ากัน = เจ้ามือชนะ</li>
        </ul>
      </div>
    </div>
  );
}
